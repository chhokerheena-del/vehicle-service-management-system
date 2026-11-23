const prisma = require('../config/db');

// Get Service Record by Appointment ID
async function getRecordByAppointment(req, res, next) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);

    const record = await prisma.serviceRecord.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
            vehicle: true,
            service: true,
            serviceCenter: true
          }
        },
        mechanic: true,
        serviceParts: {
          include: {
            part: true
          }
        }
      }
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Service record not found.' });
    }

    return res.json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
}

// Update Service Record details (inspection notes, work performed, etc.)
async function updateRecord(req, res, next) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const { mechanicId, inspectionNotes, workPerformed, currentMileage, status } = req.body;

    const existing = await prisma.serviceRecord.findUnique({ where: { appointmentId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service record not found.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (mechanicId && mechanicId !== existing.mechanicId) {
        // Free old mechanic if assigned
        if (existing.mechanicId) {
          await tx.mechanic.update({
            where: { id: existing.mechanicId },
            data: { status: 'AVAILABLE' }
          });
        }
        // Set new mechanic to BUSY
        await tx.mechanic.update({
          where: { id: parseInt(mechanicId) },
          data: { status: 'BUSY' }
        });
      }

      return await tx.serviceRecord.update({
        where: { appointmentId },
        data: {
          mechanicId: mechanicId ? parseInt(mechanicId) : undefined,
          inspectionNotes: inspectionNotes !== undefined ? inspectionNotes : undefined,
          workPerformed: workPerformed !== undefined ? workPerformed : undefined,
          currentMileage: currentMileage !== undefined ? parseInt(currentMileage) : undefined,
          status: status || undefined
        },
        include: {
          mechanic: true,
          serviceParts: { include: { part: true } }
        }
      });
    });

    return res.json({
      success: true,
      message: 'Service record updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Add Part to Service Record (Automatic stock decrement & transactional invoice recalculation)
async function addPartToRecord(req, res, next) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const { partId, quantity = 1 } = req.body;

    const qty = parseInt(quantity);
    if (!partId || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid part ID and positive quantity are required.'
      });
    }

    const serviceRecord = await prisma.serviceRecord.findUnique({
      where: { appointmentId },
      include: { appointment: { include: { service: true, invoice: true } } }
    });

    if (!serviceRecord) {
      return res.status(404).json({ success: false, message: 'Service record not found.' });
    }

    const part = await prisma.part.findUnique({ where: { id: parseInt(partId) } });
    if (!part) {
      return res.status(404).json({ success: false, message: 'Part not found in inventory.' });
    }

    // STRICT INVENTORY CHECK: Never allow negative stock
    if (part.stockQuantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory stock for '${part.name}'. Available: ${part.stockQuantity}, Requested: ${qty}.`
      });
    }

    // Atomic transaction: Add ServicePart, decrement Part stock, update Part status, recalculate Invoice if exists
    const result = await prisma.$transaction(async (tx) => {
      const unitPrice = Number(part.unitPrice);
      const totalCost = unitPrice * qty;

      // 1. Check if this part is already in this service record
      const existingSP = await tx.servicePart.findFirst({
        where: {
          serviceRecordId: serviceRecord.id,
          partId: part.id
        }
      });

      let servicePart;
      if (existingSP) {
        const newQty = existingSP.quantity + qty;
        const newTotal = unitPrice * newQty;
        servicePart = await tx.servicePart.update({
          where: { id: existingSP.id },
          data: {
            quantity: newQty,
            totalCost: newTotal
          }
        });
      } else {
        servicePart = await tx.servicePart.create({
          data: {
            serviceRecordId: serviceRecord.id,
            partId: part.id,
            quantity: qty,
            unitPrice,
            totalCost
          }
        });
      }

      // 2. Decrement stock
      const remainingStock = part.stockQuantity - qty;
      let newPartStatus = 'IN_STOCK';
      if (remainingStock === 0) {
        newPartStatus = 'OUT_OF_STOCK';
      } else if (remainingStock <= part.minStockLevel) {
        newPartStatus = 'LOW_STOCK';
      }

      await tx.part.update({
        where: { id: part.id },
        data: {
          stockQuantity: remainingStock,
          status: newPartStatus
        }
      });

      // 3. Recalculate Invoice if it already exists
      const allPartsForRecord = await tx.servicePart.findMany({
        where: { serviceRecordId: serviceRecord.id }
      });
      const partsTotal = allPartsForRecord.reduce((sum, item) => sum + Number(item.totalCost), 0.00);

      const existingInvoice = serviceRecord.appointment.invoice;
      if (existingInvoice) {
        const serviceCharges = Number(existingInvoice.serviceCharges);
        const subtotal = serviceCharges + partsTotal;
        const taxRate = Number(existingInvoice.taxRate);
        const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
        const discountAmount = Number(existingInvoice.discountAmount);
        const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2));

        await tx.invoice.update({
          where: { id: existingInvoice.id },
          data: {
            partsCharges: partsTotal,
            subtotal,
            taxAmount,
            totalAmount
          }
        });
      }

      return servicePart;
    });

    const fullRecord = await prisma.serviceRecord.findUnique({
      where: { appointmentId },
      include: {
        mechanic: true,
        serviceParts: { include: { part: true } }
      }
    });

    return res.json({
      success: true,
      message: `Part '${part.name}' added to service record and stock updated.`,
      data: fullRecord
    });
  } catch (error) {
    next(error);
  }
}

// Remove Part from Service Record (Restores stock)
async function removePartFromRecord(req, res, next) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const servicePartId = parseInt(req.params.servicePartId);

    const servicePart = await prisma.servicePart.findUnique({
      where: { id: servicePartId },
      include: { part: true, serviceRecord: { include: { appointment: { include: { invoice: true } } } } }
    });

    if (!servicePart) {
      return res.status(404).json({ success: false, message: 'Service part record not found.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Restore stock
      const restoredStock = servicePart.part.stockQuantity + servicePart.quantity;
      let newStatus = 'IN_STOCK';
      if (restoredStock <= servicePart.part.minStockLevel && restoredStock > 0) {
        newStatus = 'LOW_STOCK';
      }

      await tx.part.update({
        where: { id: servicePart.partId },
        data: {
          stockQuantity: restoredStock,
          status: newStatus
        }
      });

      // 2. Delete service part
      await tx.servicePart.delete({ where: { id: servicePartId } });

      // 3. Recalculate invoice if exists
      const remainingParts = await tx.servicePart.findMany({
        where: { serviceRecordId: servicePart.serviceRecordId }
      });
      const partsTotal = remainingParts.reduce((sum, item) => sum + Number(item.totalCost), 0.00);

      const invoice = servicePart.serviceRecord.appointment.invoice;
      if (invoice) {
        const serviceCharges = Number(invoice.serviceCharges);
        const subtotal = serviceCharges + partsTotal;
        const taxRate = Number(invoice.taxRate);
        const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
        const discountAmount = Number(invoice.discountAmount);
        const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2));

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            partsCharges: partsTotal,
            subtotal,
            taxAmount,
            totalAmount
          }
        });
      }
    });

    const fullRecord = await prisma.serviceRecord.findUnique({
      where: { appointmentId },
      include: {
        mechanic: true,
        serviceParts: { include: { part: true } }
      }
    });

    return res.json({
      success: true,
      message: 'Part removed and inventory stock restored.',
      data: fullRecord
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecordByAppointment,
  updateRecord,
  addPartToRecord,
  removePartFromRecord
};

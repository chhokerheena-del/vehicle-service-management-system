const prisma = require('../config/db');

// Helper to generate appointment number
function generateAppointmentNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `APT-${timestamp}-${random}`;
}

// Get Appointments
async function getAppointments(req, res, next) {
  try {
    const { status, serviceCenterId, date, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === 'CUSTOMER') {
      filter.userId = req.user.id;
    } else {
      if (serviceCenterId) {
        filter.serviceCenterId = parseInt(serviceCenterId);
      }
    }

    if (status) {
      filter.status = status;
    }

    if (date) {
      filter.preferredDate = new Date(date);
    }

    if (search) {
      filter.OR = [
        { appointmentNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { phone: { contains: search } } },
        { vehicle: { regNumber: { contains: search } } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where: filter }),
      prisma.appointment.findMany({
        where: filter,
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          },
          vehicle: true,
          service: true,
          serviceCenter: true,
          serviceRecord: {
            include: {
              mechanic: true,
              serviceParts: {
                include: { part: true }
              }
            }
          },
          invoice: {
            include: { payments: true }
          },
          feedback: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get Appointment by ID
async function getAppointmentById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true, city: true } },
        vehicle: true,
        service: true,
        serviceCenter: true,
        serviceRecord: {
          include: {
            mechanic: true,
            serviceParts: {
              include: { part: true }
            }
          }
        },
        invoice: {
          include: { payments: true }
        },
        feedback: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Customer can only view their own appointment
    if (req.user.role === 'CUSTOMER' && appointment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
}

// Create Appointment (Customer or Staff)
async function createAppointment(req, res, next) {
  try {
    const { vehicleId, serviceId, serviceCenterId, preferredDate, preferredTimeSlot, notes, targetUserId } = req.body;

    if (!vehicleId || !serviceId || !serviceCenterId || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle, service, service center, date, and time slot are required.'
      });
    }

    let customerId = req.user.id;
    if ((req.user.role === 'ADMIN' || req.user.role === 'STAFF') && targetUserId) {
      customerId = parseInt(targetUserId);
    }

    // Verify vehicle belongs to user if CUSTOMER
    const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicleId) } });
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Selected vehicle not found.' });
    }

    if (req.user.role === 'CUSTOMER' && vehicle.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only book services for your own vehicle.' });
    }

    const appointmentNumber = generateAppointmentNumber();

    // Create appointment and initial service record shell in a transaction
    const newAppointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          appointmentNumber,
          userId: customerId,
          vehicleId: parseInt(vehicleId),
          serviceCenterId: parseInt(serviceCenterId),
          serviceId: parseInt(serviceId),
          preferredDate: new Date(preferredDate),
          preferredTimeSlot: preferredTimeSlot.trim(),
          status: 'PENDING',
          notes: notes ? notes.trim() : null
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          vehicle: true,
          service: true,
          serviceCenter: true
        }
      });

      // Initialize service record shell
      await tx.serviceRecord.create({
        data: {
          appointmentId: apt.id,
          status: 'PENDING_INSPECTION',
          currentMileage: vehicle.mileage
        }
      });

      return apt;
    });

    return res.status(201).json({
      success: true,
      message: 'Service appointment booked successfully!',
      data: newAppointment
    });
  } catch (error) {
    next(error);
  }
}

// Update Appointment Status (Staff/Admin)
async function updateStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { status, mechanicId, inspectionNotes, workPerformed, currentMileage } = req.body;

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'VEHICLE_RECEIVED',
      'INSPECTION',
      'IN_PROGRESS',
      'READY_FOR_PICKUP',
      'COMPLETED',
      'CANCELLED'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const currentApt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        service: true,
        vehicle: true,
        serviceRecord: {
          include: {
            serviceParts: true
          }
        },
        invoice: true
      }
    });

    if (!currentApt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Atomic transaction for updating status, service record, mechanic status, and generating invoice
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update appointment status
      const updatedApt = await tx.appointment.update({
        where: { id },
        data: { status }
      });

      // 2. Update service record if present
      let record = currentApt.serviceRecord;
      if (record) {
        const recordUpdateData = { status };
        if (mechanicId !== undefined) {
          recordUpdateData.mechanicId = mechanicId ? parseInt(mechanicId) : null;
        }
        if (inspectionNotes !== undefined) {
          recordUpdateData.inspectionNotes = inspectionNotes ? inspectionNotes.trim() : null;
        }
        if (workPerformed !== undefined) {
          recordUpdateData.workPerformed = workPerformed ? workPerformed.trim() : null;
        }
        if (currentMileage !== undefined) {
          recordUpdateData.currentMileage = parseInt(currentMileage);
          // Also update vehicle mileage
          await tx.vehicle.update({
            where: { id: currentApt.vehicleId },
            data: { mileage: parseInt(currentMileage) }
          });
        }
        if (status === 'COMPLETED') {
          recordUpdateData.completionDate = new Date();
        }

        record = await tx.serviceRecord.update({
          where: { appointmentId: id },
          data: recordUpdateData
        });
      }

      // 3. Update mechanic availability if assigned
      if (mechanicId) {
        await tx.mechanic.update({
          where: { id: parseInt(mechanicId) },
          data: { status: status === 'COMPLETED' ? 'AVAILABLE' : 'BUSY' }
        });
      }

      // 4. Auto-generate or update invoice if reaching READY_FOR_PICKUP or COMPLETED and no invoice exists
      if ((status === 'READY_FOR_PICKUP' || status === 'COMPLETED') && !currentApt.invoice) {
        // Calculate parts total
        let partsTotal = 0.00;
        if (record && record.serviceParts) {
          partsTotal = record.serviceParts.reduce((sum, sp) => sum + Number(sp.totalCost), 0.00);
        }

        const servicePrice = Number(currentApt.service.price);
        const subtotal = servicePrice + partsTotal;
        const taxRate = 18.00;
        const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
        const discountAmount = 0.00;
        const totalAmount = Number((subtotal + taxAmount - discountAmount).toFixed(2));

        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.invoice.create({
          data: {
            invoiceNumber,
            appointmentId: id,
            serviceCharges: servicePrice,
            partsCharges: partsTotal,
            subtotal,
            taxRate,
            taxAmount,
            discountAmount,
            totalAmount,
            paymentStatus: 'PENDING',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          }
        });
      }

      return updatedApt;
    });

    const fullUpdated = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: true,
        vehicle: true,
        service: true,
        serviceCenter: true,
        serviceRecord: {
          include: { mechanic: true, serviceParts: { include: { part: true } } }
        },
        invoice: { include: { payments: true } }
      }
    });

    return res.json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      data: fullUpdated
    });
  } catch (error) {
    next(error);
  }
}

// Cancel Appointment
async function cancelAppointment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { reason } = req.body;

    const apt = await prisma.appointment.findUnique({ where: { id } });
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role === 'CUSTOMER' && apt.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (['IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED'].includes(apt.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already ${apt.status}.`
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationReason: reason ? reason.trim() : 'Cancelled by user.'
      }
    });

    return res.json({
      success: true,
      message: 'Appointment cancelled.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

// Reschedule Appointment
async function rescheduleAppointment(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { preferredDate, preferredTimeSlot } = req.body;

    if (!preferredDate || !preferredTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'New date and time slot are required.'
      });
    }

    const apt = await prisma.appointment.findUnique({ where: { id } });
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role === 'CUSTOMER' && apt.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (['IN_PROGRESS', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'].includes(apt.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment with status ${apt.status}.`
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        preferredDate: new Date(preferredDate),
        preferredTimeSlot: preferredTimeSlot.trim()
      }
    });

    return res.json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateStatus,
  cancelAppointment,
  rescheduleAppointment
};

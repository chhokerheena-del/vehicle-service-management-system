const prisma = require('../config/db');

// Helper to generate invoice number
function generateInvoiceNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${random}`;
}

// Get Invoices
async function getInvoices(req, res, next) {
  try {
    const { paymentStatus, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'CUSTOMER') {
      filter.appointment = { userId: req.user.id };
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.OR = [
        { invoiceNumber: { contains: search } },
        { appointment: { appointmentNumber: { contains: search } } },
        { appointment: { user: { name: { contains: search } } } },
        { appointment: { vehicle: { regNumber: { contains: search } } } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where: filter }),
      prisma.invoice.findMany({
        where: filter,
        skip,
        take,
        include: {
          appointment: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
              vehicle: true,
              service: true,
              serviceCenter: true,
              serviceRecord: {
                include: {
                  serviceParts: { include: { part: true } }
                }
              }
            }
          },
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: invoices,
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

// Get Invoice by ID
async function getInvoiceById(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, address: true, city: true } },
            vehicle: true,
            service: true,
            serviceCenter: true,
            serviceRecord: {
              include: {
                mechanic: true,
                serviceParts: { include: { part: true } }
              }
            }
          }
        },
        payments: {
          orderBy: { paidAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    if (req.user.role === 'CUSTOMER' && invoice.appointment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
}

// Generate or Recalculate Invoice (Staff/Admin)
async function generateInvoice(req, res, next) {
  try {
    const { appointmentId, customServiceCharges, discountAmount = 0.00 } = req.body;

    const aptId = parseInt(appointmentId);
    if (!aptId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: aptId },
      include: {
        service: true,
        serviceRecord: {
          include: { serviceParts: true }
        },
        invoice: true
      }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Calculate parts charges
    let partsCharges = 0.00;
    if (appointment.serviceRecord && appointment.serviceRecord.serviceParts) {
      partsCharges = appointment.serviceRecord.serviceParts.reduce(
        (sum, item) => sum + Number(item.totalCost),
        0.00
      );
    }

    const serviceCharges = customServiceCharges !== undefined
      ? parseFloat(customServiceCharges)
      : Number(appointment.service.price);

    const subtotal = serviceCharges + partsCharges;
    const taxRate = 18.00; // 18% GST standard
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const discount = parseFloat(discountAmount) || 0.00;
    const totalAmount = Number((subtotal + taxAmount - discount).toFixed(2));

    let invoice;
    if (appointment.invoice) {
      // Update existing
      invoice = await prisma.invoice.update({
        where: { id: appointment.invoice.id },
        data: {
          serviceCharges,
          partsCharges,
          subtotal,
          taxRate,
          taxAmount,
          discountAmount: discount,
          totalAmount
        },
        include: {
          appointment: {
            include: { user: true, vehicle: true, service: true, serviceCenter: true }
          },
          payments: true
        }
      });
    } else {
      // Create new
      const invoiceNumber = generateInvoiceNumber();
      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          appointmentId: aptId,
          serviceCharges,
          partsCharges,
          subtotal,
          taxRate,
          taxAmount,
          discountAmount: discount,
          totalAmount,
          paymentStatus: 'PENDING',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        include: {
          appointment: {
            include: { user: true, vehicle: true, service: true, serviceCenter: true }
          },
          payments: true
        }
      });
    }

    return res.json({
      success: true,
      message: 'Invoice generated successfully.',
      data: invoice
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  generateInvoice
};

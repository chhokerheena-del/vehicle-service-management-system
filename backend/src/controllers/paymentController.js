const prisma = require('../config/db');

// Helper to generate transaction reference
function generateTransactionRef(method) {
  const prefix = method.toUpperCase().replace(/\s+/g, '_');
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}/${timestamp}/${random}`;
}

// Record Payment (Simulation for UPI, Card, Cash, Net Banking)
async function recordPayment(req, res, next) {
  try {
    const { invoiceId, amount, paymentMethod, notes } = req.body;

    const invId = parseInt(invoiceId);
    const payAmount = parseFloat(amount);

    if (!invId || !payAmount || payAmount <= 0 || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Valid invoice ID, positive amount, and payment method are required.'
      });
    }

    const validMethods = ['UPI', 'CARD', 'CASH', 'NET_BANKING'];
    if (!validMethods.includes(paymentMethod.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`
      });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invId },
      include: {
        appointment: true,
        payments: { where: { status: 'SUCCESS' } }
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    // Customer can only pay for their own invoice
    if (req.user.role === 'CUSTOMER' && invoice.appointment.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (invoice.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'This invoice has already been fully paid.'
      });
    }

    // Atomic Transaction: Insert Payment + Update Invoice Status
    const result = await prisma.$transaction(async (tx) => {
      const paymentNumber = `PAY-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const transactionRef = generateTransactionRef(paymentMethod);

      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          invoiceId: invId,
          amount: payAmount,
          paymentMethod: paymentMethod.toUpperCase(),
          transactionRef,
          status: 'SUCCESS',
          paidAt: new Date(),
          notes: notes ? notes.trim() : `Payment simulated via ${paymentMethod.toUpperCase()}`
        }
      });

      // Calculate total paid so far
      const totalPaidPrevious = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0.00);
      const newTotalPaid = totalPaidPrevious + payAmount;
      const invoiceTotal = Number(invoice.totalAmount);

      let newStatus = 'PARTIALLY_PAID';
      if (newTotalPaid >= invoiceTotal - 0.01) {
        newStatus = 'PAID';
      }

      const updatedInvoice = await tx.invoice.update({
        where: { id: invId },
        data: { paymentStatus: newStatus }
      });

      return { payment, updatedInvoice };
    });

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${payAmount.toFixed(2)} recorded successfully via ${paymentMethod.toUpperCase()}.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

// Get All Payments
async function getAllPayments(req, res, next) {
  try {
    const { paymentMethod, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (req.user.role === 'CUSTOMER') {
      filter.invoice = {
        appointment: { userId: req.user.id }
      };
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where: filter }),
      prisma.payment.findMany({
        where: filter,
        skip,
        take,
        include: {
          invoice: {
            include: {
              appointment: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                  vehicle: { select: { regNumber: true, make: true, model: true } },
                  service: { select: { name: true } }
                }
              }
            }
          }
        },
        orderBy: { paidAt: 'desc' }
      })
    ]);

    return res.json({
      success: true,
      data: payments,
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

// Get Payments for specific invoice
async function getPaymentsByInvoice(req, res, next) {
  try {
    const invoiceId = parseInt(req.params.invoiceId);

    const payments = await prisma.payment.findMany({
      where: { invoiceId },
      orderBy: { paidAt: 'desc' }
    });

    return res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  recordPayment,
  getAllPayments,
  getPaymentsByInvoice
};

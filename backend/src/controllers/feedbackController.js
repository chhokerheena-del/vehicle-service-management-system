const prisma = require('../config/db');

// Submit Feedback (Customer)
async function submitFeedback(req, res, next) {
  try {
    const { appointmentId, rating, serviceQuality, staffCourtesy, timelyDelivery, comments } = req.body;

    const aptId = parseInt(appointmentId);
    if (!aptId) {
      return res.status(400).json({ success: false, message: 'Appointment ID is required.' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: aptId },
      include: { feedback: true }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (appointment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (appointment.status !== 'COMPLETED' && appointment.status !== 'READY_FOR_PICKUP') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted after service is ready or completed.'
      });
    }

    const overallRating = parseInt(rating) || 5;
    const quality = parseInt(serviceQuality) || overallRating;
    const courtesy = parseInt(staffCourtesy) || overallRating;
    const timeliness = parseInt(timelyDelivery) || overallRating;

    let feedback;
    if (appointment.feedback) {
      feedback = await prisma.feedback.update({
        where: { id: appointment.feedback.id },
        data: {
          rating: overallRating,
          serviceQuality: quality,
          staffCourtesy: courtesy,
          timelyDelivery: timeliness,
          comments: comments ? comments.trim() : null
        }
      });
    } else {
      feedback = await prisma.feedback.create({
        data: {
          appointmentId: aptId,
          userId: appointment.userId,
          rating: overallRating,
          serviceQuality: quality,
          staffCourtesy: courtesy,
          timelyDelivery: timeliness,
          comments: comments ? comments.trim() : null
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
}

// Get All Feedback
async function getAllFeedback(req, res, next) {
  try {
    const { rating, limit = 50 } = req.query;
    const filter = {};

    if (rating) {
      filter.rating = parseInt(rating);
    }

    const feedbacks = await prisma.feedback.findMany({
      where: filter,
      take: parseInt(limit),
      include: {
        user: { select: { id: true, name: true, city: true } },
        appointment: {
          include: {
            service: { select: { name: true, category: true } },
            vehicle: { select: { make: true, model: true } },
            serviceCenter: { select: { name: true, city: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
}

// Get Feedback by Appointment
async function getFeedbackByAppointment(req, res, next) {
  try {
    const appointmentId = parseInt(req.params.appointmentId);
    const feedback = await prisma.feedback.findUnique({
      where: { appointmentId },
      include: { user: { select: { id: true, name: true } } }
    });

    return res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackByAppointment
};

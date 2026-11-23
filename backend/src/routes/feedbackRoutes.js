const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', feedbackController.getAllFeedback);
router.get('/appointment/:appointmentId', authenticateToken, feedbackController.getFeedbackByAppointment);
router.post('/', authenticateToken, feedbackController.submitFeedback);

module.exports = router;

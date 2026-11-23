const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/', paymentController.recordPayment);
router.get('/', paymentController.getAllPayments);
router.get('/invoice/:invoiceId', paymentController.getPaymentsByInvoice);

module.exports = router;

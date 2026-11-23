const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('ADMIN', 'STAFF'));

router.get('/revenue', reportController.getRevenueReport);
router.get('/mechanics', reportController.getMechanicsReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/customer-history', reportController.getCustomerHistoryReport);
router.get('/services', reportController.getServicesReport);

module.exports = router;

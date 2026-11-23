const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken, authorizeRoles('ADMIN', 'STAFF'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/analytics-charts', adminController.getAnalyticsCharts);
router.get('/users', authorizeRoles('ADMIN'), adminController.getAllUsers);

module.exports = router;

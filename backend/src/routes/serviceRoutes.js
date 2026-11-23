const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public endpoints
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin-protected endpoints
router.post('/', authenticateToken, authorizeRoles('ADMIN'), serviceController.createService);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), serviceController.updateService);
router.patch('/:id/toggle', authenticateToken, authorizeRoles('ADMIN'), serviceController.toggleServiceStatus);

module.exports = router;

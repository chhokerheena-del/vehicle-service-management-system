const express = require('express');
const router = express.Router();
const serviceCenterController = require('../controllers/serviceCenterController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public endpoints
router.get('/', serviceCenterController.getCenters);
router.get('/:id', serviceCenterController.getCenterById);

// Admin-protected endpoints
router.post('/', authenticateToken, authorizeRoles('ADMIN'), serviceCenterController.createCenter);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), serviceCenterController.updateCenter);

module.exports = router;

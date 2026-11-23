const express = require('express');
const router = express.Router();
const mechanicController = require('../controllers/mechanicController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', mechanicController.getMechanics);
router.get('/:id', mechanicController.getMechanicById);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), mechanicController.createMechanic);
router.put('/:id', authorizeRoles('ADMIN', 'STAFF'), mechanicController.updateMechanic);

module.exports = router;

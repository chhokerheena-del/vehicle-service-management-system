const express = require('express');
const router = express.Router();
const partController = require('../controllers/partController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', partController.getAllParts);
router.get('/:id', partController.getPartById);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), partController.createPart);
router.put('/:id', authorizeRoles('ADMIN', 'STAFF'), partController.updatePart);
router.post('/:id/adjust-stock', authorizeRoles('ADMIN', 'STAFF'), partController.adjustStock);

module.exports = router;

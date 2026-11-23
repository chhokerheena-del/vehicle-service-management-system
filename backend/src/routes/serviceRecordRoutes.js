const express = require('express');
const router = express.Router();
const serviceRecordController = require('../controllers/serviceRecordController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/:appointmentId', serviceRecordController.getRecordByAppointment);
router.put('/:appointmentId', authorizeRoles('ADMIN', 'STAFF'), serviceRecordController.updateRecord);
router.post('/:appointmentId/parts', authorizeRoles('ADMIN', 'STAFF'), serviceRecordController.addPartToRecord);
router.delete('/:appointmentId/parts/:servicePartId', authorizeRoles('ADMIN', 'STAFF'), serviceRecordController.removePartFromRecord);

module.exports = router;

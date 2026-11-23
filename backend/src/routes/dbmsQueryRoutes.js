const express = require('express');
const router = express.Router();
const dbmsQueryController = require('../controllers/dbmsQueryController');

// Open or accessible to facilitate easy evaluation during viva demonstration
router.get('/list', dbmsQueryController.getAvailableQueries);
router.post('/execute', dbmsQueryController.executeQuery);

module.exports = router;

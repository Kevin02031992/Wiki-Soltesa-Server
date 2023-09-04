const express = require('express');

const reportController = require('../controllers/report');

const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/pdf', reportController.generateReport);

module.exports = router;
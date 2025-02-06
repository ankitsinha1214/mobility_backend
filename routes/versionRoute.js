const express = require('express');
const router = express.Router();
const versionController = require('../controllers/versionController');

// Get version checks
router.get('/',  versionController.checkVersion);

module.exports = router;
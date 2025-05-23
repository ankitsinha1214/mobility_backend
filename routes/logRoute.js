const express = require('express');
const router = express.Router();
const chargerLogController = require('../controllers/logController');

router.get('/:chargerId', chargerLogController.getChargerLogs);

module.exports = router;

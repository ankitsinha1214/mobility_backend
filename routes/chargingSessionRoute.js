const express = require('express');
const router = express.Router();
const { startStopChargingSession } = require('../controllers/chargingSessionController');

router.post('/transaction', startStopChargingSession);
// router.post('/stop', stopChargingSession);

module.exports = router;

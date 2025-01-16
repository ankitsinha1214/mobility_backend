const express = require('express');
const router = express.Router();
const { startStopChargingSession, resetChargingSession } = require('../controllers/chargingSessionController');

router.post('/transaction', startStopChargingSession);
router.post('/reset', resetChargingSession);
// router.post('/stop', stopChargingSession);

module.exports = router;

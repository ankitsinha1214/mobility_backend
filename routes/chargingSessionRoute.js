const express = require('express');
const router = express.Router();
const { startStopChargingSession, resetChargingSession, getSessionData } = require('../controllers/chargingSessionController');

router.post('/transaction', startStopChargingSession);
router.post('/reset', resetChargingSession);
router.post('/get-session-info', getSessionData);
// router.post('/stop', stopChargingSession);

module.exports = router;

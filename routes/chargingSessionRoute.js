const express = require('express');
const router = express.Router();
const { startChargingSession, stopChargingSession } = require('../controllers/chargingSessionController');

router.post('/start', startChargingSession);
router.post('/stop', stopChargingSession);

module.exports = router;

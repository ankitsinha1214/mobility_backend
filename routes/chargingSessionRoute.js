const express = require('express');
const router = express.Router();
const { startStopChargingSession, resetChargingSession, getSessionData } = require('../controllers/chargingSessionController');
const fetchUser = require('../middleware/fetchuser');

router.post('/transaction',
    fetchUser,
     startStopChargingSession);
router.post('/reset', 
    fetchUser,
    resetChargingSession);
router.post('/get-session-info',
    fetchUser,
     getSessionData);
// router.post('/stop', stopChargingSession);

module.exports = router;

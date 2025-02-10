const express = require('express');
const router = express.Router();
const { startStopChargingSession, resetChargingSession, getSessionData, getSessionReceipt, getAllSessions, changeConfigurationSession, getSessionById } = require('../controllers/chargingSessionController');
const fetchUser = require('../middleware/fetchuser');

router.post('/transaction',
    fetchUser,
     startStopChargingSession);

router.get('/',
    fetchUser,
    getAllSessions);

router.get('/:sessionId',
    fetchUser,
    getSessionById);

router.post('/reset', 
    fetchUser,
    resetChargingSession);

router.post('/change-configuration', 
    fetchUser,
    changeConfigurationSession);
router.post('/get-session-info',
    fetchUser,
     getSessionData);

router.post('/get-session-receipt',
    fetchUser,
     getSessionReceipt);
// router.post('/stop', stopChargingSession);

module.exports = router;

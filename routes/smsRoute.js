// routes/smsRoutes.js
const express = require("express");
const { sendSMSToUser, sendSMSToAll, scheduleSMS, getSentOrFailedNotifications, getScheduledNotifications, editScheduledSms, deleteScheduledSms } = require("../controllers/smsController");

const fetchUser = require('../middleware/fetchuser');
const router = express.Router();

// Register FCM Token in AWS SNS
// router.post("/register-token",fetchUser, registerToken);

// Send Push Notification
router.post("/",fetchUser, sendSMSToUser);

// Send Push Notification to All
router.post("/send-sms-to-all", fetchUser, sendSMSToAll);

// Send Push Notification to All
router.post("/schedule-sms-to-all", fetchUser, scheduleSMS);

// Get all Notification of scheduled
router.get("/", fetchUser, getSentOrFailedNotifications);

// Get all Notification of scheduled
router.get("/scheduled", fetchUser, getScheduledNotifications);

router.put("/:id", editScheduledSms);

router.delete("/:id", fetchUser, deleteScheduledSms);

module.exports = router;

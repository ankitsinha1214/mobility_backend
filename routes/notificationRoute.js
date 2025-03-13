// routes/notificationRoutes.js
const express = require("express");
const { registerToken, sendPushNotification, sendNotificationToAll, scheduleNotification, getSentOrFailedNotifications, getScheduledNotifications, editScheduledNotification, deleteScheduledNotification } = require("../controllers/notificationController");

const fetchUser = require('../middleware/fetchuser');
const router = express.Router();

// Register FCM Token in AWS SNS
router.post("/register-token",fetchUser, registerToken);

// Send Push Notification
router.post("/send-notification",fetchUser, sendPushNotification);

// Send Push Notification to All
router.post("/send-notification-to-all", fetchUser, sendNotificationToAll);

// Send Push Notification to All
router.post("/schedule-notification-to-all", fetchUser, scheduleNotification);

// Get all Notification of scheduled
router.get("/sent-or-failed", fetchUser, getSentOrFailedNotifications);

// Get all Notification of scheduled
router.get("/scheduled", fetchUser, getScheduledNotifications);

router.put("/notification/:id", editScheduledNotification);

router.delete("/notification/:id", deleteScheduledNotification);

module.exports = router;

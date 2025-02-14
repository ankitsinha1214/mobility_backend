// routes/notificationRoutes.js
const express = require("express");
const { registerToken, sendPushNotification, sendNotificationToAll } = require("../controllers/notificationController");

const router = express.Router();

// Register FCM Token in AWS SNS
router.post("/register-token", registerToken);

// Send Push Notification
router.post("/send-notification", sendPushNotification);

// Send Push Notification to All
router.post("/send-notification-to-all", sendNotificationToAll);

module.exports = router;

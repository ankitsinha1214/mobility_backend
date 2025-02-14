// routes/notificationRoutes.js
const express = require("express");
const { registerToken, sendPushNotification } = require("../controllers/notificationController");

const router = express.Router();

// Register FCM Token in AWS SNS
router.post("/register-token", registerToken);

// Send Push Notification
router.post("/send-notification", sendPushNotification);

module.exports = router;

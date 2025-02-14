const { registerDeviceToken, sendNotification } = require("../services/notificationService");
const User = require('../models/userModel');

/**
 * API to register device token
 */
const registerToken = async (req, res) => {
    try {
        const { phoneNumber, fcmToken } = req.body;

        if (!phoneNumber || !fcmToken) {
            return res.json({ status: false, message: "phoneNumber and fcmToken are required" });
        }

        // Check if user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) return res.json({ status: false, message: "User not found" });

        // Register the device token with AWS SNS
        const endpointArn = await registerDeviceToken(fcmToken);

        // Store the EndpointArn instead of the FCM token
        user.endpointArn = endpointArn;
        await user.save();

        return res.json({ status: true, message: "FCM token registered successfully" });
    } catch (error) {
        console.error("❌ Error registering token:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to send push notification to a single user
 */
const sendPushNotification = async (req, res) => {
    try {
        const { phoneNumber, title, message } = req.body;

        if (!phoneNumber || !title || !message) {
            return res.json({ status: false, message: "All fields are required." });
        }

        // Get user's EndpointArn
        const user = await User.findOne({ phoneNumber }, "endpointArn");
        if (!user || !user.endpointArn) {
            return res.json({ status: false, message: "User not found or no registered device" });
        }

        await sendNotification(user.endpointArn, title, message);
        return res.json({ status: true, message: "Notification sent successfully." });
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to send push notification to all users
 */
const sendNotificationToAll = async (req, res) => {
    try {
        const { title, message } = req.body;

        // Fetch all registered users with an endpointArn
        const users = await User.find({ endpointArn: { $exists: true, $ne: null } }, "endpointArn");

        if (users.length === 0) {
            return res.json({ status: false, message: "No users found with registered devices" });
        }

        // Send notifications to all users
        const endpointArns = users.map(user => user.endpointArn);
        await sendNotification(endpointArns, title, message);

        return res.json({ status: true, message: "Notification sent to all users" });
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        return res.status(500).json({ status: false, message: "Error sending notification" });
    }
};

module.exports = {
    registerToken,
    sendPushNotification,
    sendNotificationToAll
};

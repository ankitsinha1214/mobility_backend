const { registerDeviceToken, sendNotification } = require("../services/notificationService");
const User = require('../models/userModel');

/**
 * API to register device token
 */
const registerToken = async (req, res) => {
    try {
        const { phoneNumber, fcmToken } = req.body;

        if (!phoneNumber || !fcmToken) {
            return res.status(400).json({ status: false, message: "phoneNumber and fcmToken are required" });
        }

        // Find user by phoneNumber and update their FCM token
        const user = await User.findOneAndUpdate(
            { "phoneNumber": phoneNumber },  // Assuming phoneNumber is stored in User schema as phone.number
            { fcmToken },
            { new: true }
        );

        if (!user) return res.json({ status: false, message: "User not found" });

        return res.json({ status: true, message: "FCM token updated successfully" });
        // return res.json({ status: true, message: "FCM token updated successfully", user });

        // const endpointArn = await registerDeviceToken(fcmToken);
        // return res.json({ status: true, endpointArn });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to send push notification
 */
const sendPushNotification = async (req, res) => {
    try {
        const { endpointArn, title, message } = req.body;

        if (!endpointArn || !title || !message) {
            return res.json({ status: false, message: "All fields are required." });
        }

        await sendNotification(endpointArn, title, message);
        return res.json({ status: true, message: "Notification sent successfully." });
    } catch (error) {
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

module.exports = {
    registerToken,
    sendPushNotification,
};

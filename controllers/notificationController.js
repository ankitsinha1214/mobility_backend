const { registerDeviceToken, sendNotification } = require("../services/notificationService");
const User = require('../models/userModel');
const Notification = require('../models/notificationConsumerModel');
const cron = require("node-cron");
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
        // Store the notification in the database
        const newNotification = new Notification({
            title,
            description: message,
            endpointArns: [user.endpointArn],
            type: "Single",
            status: "Sent",
            scheduleTime: null,
        });

        await newNotification.save();
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
        // Store the notification in the database
        const newNotification = new Notification({
            title,
            description: message,
            endpointArns,
            type: "All",
            status: "Sent",
            scheduleTime: null,
        });

        await newNotification.save();

        return res.json({ status: true, message: "Notification sent to all users" });
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        return res.status(500).json({ status: false, message: "Error sending notification" });
    }
};

/**
 * API to schedule a push notification
 */
const scheduleNotification = async (req, res) => {
    try {
        const { title, message, scheduleTime } = req.body;

        if (!title || !message || !scheduleTime) {
            return res.json({ status: false, message: "Title, message, and scheduleTime are required." });
        }

        // Validate scheduleTime (Expected format: "MM HH DD MM *" for cron)
        const [minute, hour, day, month] = scheduleTime.split(" ");
        if (isNaN(minute) || isNaN(hour) || isNaN(day) || isNaN(month)) {
            return res.json({ status: false, message: "Invalid schedule format. Use 'MM HH DD MM *' (e.g., '30 14 10 8 *' for Aug 10, 14:30)." });
        }
        // Save the scheduled notification in the database
        const scheduledNotification = new Notification({
            title,
            description: message,
            endpointArns: null, // Initially null, will be updated when sent
            type: "All",
            status: "Scheduled",
            scheduleTime
        });

        await scheduledNotification.save();

        cron.schedule(scheduleTime, async () => {
            console.log("📢 Sending scheduled notification...");
            const users = await User.find({ endpointArn: { $exists: true, $ne: null } }, "endpointArn");

            if (users.length === 0) {
                console.log("❌ No users found with registered devices.");
                return;
            }

            const endpointArns = users.map(user => user.endpointArn);
            await sendNotification(endpointArns, title, message);
            // Update the notification status in DB
            await Notification.findByIdAndUpdate(scheduledNotification._id, {
                endpointArns,
                status: "Sent"
            });
            console.log("✅ Scheduled notification sent successfully.");
        });

        return res.json({ status: true, message: "Notification scheduled successfully." });
    } catch (error) {
        console.error("❌ Error scheduling notification:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to get all notifications that are Sent or Failed
 */
const getSentOrFailedNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ status: { $in: ["Sent", "Failed"] } }).sort({ createdAt: -1 });

        return res.json({ status: true, data: notifications });
    } catch (error) {
        console.error("❌ Error fetching sent/failed notifications:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to get all scheduled notifications
 */
const getScheduledNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ status: "Scheduled" }).sort({ scheduleTime: 1 });

        return res.json({ status: true, data: notifications });
    } catch (error) {
        console.error("❌ Error fetching scheduled notifications:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

module.exports = {
    registerToken,
    sendPushNotification,
    sendNotificationToAll,
    scheduleNotification,
    getSentOrFailedNotifications,
    getScheduledNotifications
};

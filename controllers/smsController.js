// const { registerDeviceToken, sendNotification } = require("../services/notificationService");
const User = require('../models/userModel');
const Sms = require('../models/smsConsumerModel');
const twilioClient = require('../configs/twilioClient');
const cron = require('node-cron');
const scheduledJobs = {};

const sendSMS = async (phoneNumber, message) => {
    try {
        const response = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
        return response;
    } catch (error) {
        console.error('❌ Twilio SMS Error:', error);
        throw error;
    }
};

// ✅ Send SMS to a single user
const sendSMSToUser = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { phoneNumber, message } = req.body;

        if (!phoneNumber || !message) {
            return res.json({ status: false, message: "Phone number and message are required" });
        }

        const user = await User.findOne({ phoneNumber });
        if (!user) return res.json({ status: false, message: "User not found" });

        await sendSMS(phoneNumber, message);

        const smsRecord = new Sms({
            message,
            type: phoneNumber,
            status: "Sent",
            userId: req?.userid,
            scheduleTime: null
        });

        await smsRecord.save();
        return res.json({ status: true, message: "SMS sent successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, message: "SMS sending failed" });
    }
};

// ✅ Send SMS to all users (skip on failure)
const sendSMSToAll = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { message } = req.body;
        if (!message) return res.json({ status: false, message: "Message is required" });

        // const users = await User.find({ phoneNumber: { $exists: true }, status: "active" });
        const users = await User.find({ phoneNumber: { $exists: true }, status: "active" });


        const results = await Promise.allSettled(
            users.map(async (user) => {
                try {
                    await sendSMS(user.phoneNumber, message);
                    return { user: user.phoneNumber, success: true };
                } catch (err) {
                    console.error(`Failed to send SMS to ${user.phoneNumber}:`, err.message);
                    return { user: user.phoneNumber, success: false };
                }
            })
        );

        const failedUsers = results.filter(r => r.value && !r.value.success).map(r => r.value.user);

        const smsRecord = new Sms({
            message,
            type: "All",
            status: failedUsers.length ? "Partially Sent" : "Sent",
            scheduleTime: null,
            userId: req?.userid
        });

        await smsRecord.save();

        return res.json({
            status: true,
            message: failedUsers.length
                ? `SMS sent to all users except: ${failedUsers.join(', ')}`
                : "SMS sent to all users"
        });

    } catch (error) {
        console.error("Bulk SMS error:", error);
        return res.status(500).json({ status: false, message: "Failed to send SMS to all" });
    }
};

// // ✅ Send SMS to all users
// const sendSMSToAll = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ status: false, message: "Unauthorized" });
//         }

//         const { message } = req.body;
//         if (!message) return res.json({ status: false, message: "Message is required" });

//         const users = await User.find({ phoneNumber: { $exists: true } });

//         const promises = users.map(user => sendSMS(user.phoneNumber, message));
//         await Promise.all(promises);

//         const smsRecord = new Sms({
//             // title: "Bulk SMS",
//             message,
//             type: "All",
//             status: "Sent",
//             scheduleTime: null,
//             userId: req?.userid
//         });

//         await smsRecord.save();
//         return res.json({ status: true, message: "SMS sent to all users" });

//     } catch (error) {
//         return res.status(500).json({ status: false, message: "Failed to send SMS to all" });
//     }
// };

// ✅ Schedule SMS
const scheduleSMS = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { message, scheduleTime, phoneNumber } = req.body;
        const [minute, hour, day, month] = scheduleTime.split(" ");
        const now = new Date();
        const scheduledDate = new Date(now.getFullYear(), month - 1, day, hour, minute);

        if (!message || !scheduleTime || scheduledDate <= now) {
            return res.json({ status: false, message: "Invalid scheduling data" });
        }

        let type = "All";

        const smsRecord = new Sms({
            title: "Scheduled SMS",
            description: message,
            type: phoneNumber || "All",
            status: "Scheduled",
            scheduleTime,
            userId: req?.userid
        });

        await smsRecord.save();

        const job = cron.schedule(scheduleTime, async () => {
            if (phoneNumber) {
                await sendSMS(phoneNumber, message);
            } else {
                const users = await User.find({ phoneNumber: { $exists: true } });
                const promises = users.map(user => sendSMS(user.phoneNumber, message));
                await Promise.all(promises);
            }

            await Sms.findByIdAndUpdate(smsRecord._id, { status: "Sent" });
            console.log("✅ Scheduled SMS sent.");
        });

        scheduledJobs[smsRecord._id] = job;

        return res.json({ status: true, message: "SMS scheduled successfully." });

    } catch (error) {
        console.error("❌ Error scheduling SMS:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// const scheduleNotification = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//         }
//         const { title, message, scheduleTime } = req.body;

//         if (!title || !message || !scheduleTime) {
//             return res.json({ status: false, message: "Title, message, and scheduleTime are required." });
//         }

//         // Validate scheduleTime (Expected format: "MM HH DD MM *" for cron)
//         const [minute, hour, day, month] = scheduleTime.split(" ");
//         if (isNaN(minute) || isNaN(hour) || isNaN(day) || isNaN(month)) {
//             return res.json({ status: false, message: "Invalid schedule format. Use 'MM HH DD MM *' (e.g., '30 14 10 8 *' for Aug 10, 14:30)." });
//         }
//         // Save the scheduled notification in the database
//         const scheduledNotification = new Notification({
//             title,
//             description: message,
//             endpointArns: null, // Initially null, will be updated when sent
//             type: "All",
//             status: "Scheduled",
//             scheduleTime,
//             userId: req?.userid,
//         });

//         await scheduledNotification.save();

//         cron.schedule(scheduleTime, async () => {
//             console.log("📢 Sending scheduled notification...");
//             const users = await User.find({ endpointArn: { $exists: true, $ne: null } }, "endpointArn");

//             if (users.length === 0) {
//                 console.log("❌ No users found with registered devices.");
//                 return;
//             }

//             const endpointArns = users.map(user => user.endpointArn);
//             await sendNotification(endpointArns, title, message,req?.userid);
//             // Update the notification status in DB
//             await Notification.findByIdAndUpdate(scheduledNotification._id, {
//                 endpointArns,
//                 status: "Sent"
//             });
//             console.log("✅ Scheduled notification sent successfully.");
//         });

//         return res.json({ status: true, message: "Notification scheduled successfully." });
//     } catch (error) {
//         console.error("❌ Error scheduling notification:", error);
//         return res.status(500).json({ status: false, message: "Internal Server Error" });
//     }
// };

/**
 * API to get all notifications that are Sent or Failed
 */
const getSentOrFailedNotifications = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const sms = await Sms.find({ status: { $in: ["Sent", "Failed"] } })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        return res.json({ status: true, data: sms });
    } catch (error) {
        console.error("❌ Error fetching sent/failed sms:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

/**
 * API to get all scheduled notifications
 */
const getScheduledNotifications = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const sms = await Sms.find({ status: "Scheduled" })
            .populate('userId', 'username')
            .sort({ scheduleTime: 1 });

        return res.json({ status: true, data: sms });
    } catch (error) {
        console.error("❌ Error fetching scheduled sms:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const editScheduledNotification = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { id } = req.params;
        const { title, message, scheduleTime } = req.body;

        if (!id || !title || !message || !scheduleTime) {
            return res.json({ status: false, message: "ID, title, message, and scheduleTime are required." });
        }

        // Validate scheduleTime format
        const [minute, hour, day, month] = scheduleTime.split(" ");
        if (isNaN(minute) || isNaN(hour) || isNaN(day) || isNaN(month)) {
            return res.json({ status: false, message: "Invalid schedule format. Use 'MM HH DD MM *' (e.g., '30 14 10 8 *' for Aug 10, 14:30)." });
        }

        // Update the notification
        const updatedNotification = await Notification.findByIdAndUpdate(id, {
            title,
            description: message,
            scheduleTime,
            status: "Scheduled"
        }, { new: true });

        if (!updatedNotification) {
            return res.json({ status: false, message: "Notification not found or update failed." });
        }

        return res.json({ status: true, message: "Notification updated successfully.", data: updatedNotification });

    } catch (error) {
        console.error("❌ Error updating notification:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const deleteScheduledNotification = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { id } = req.params;

        if (!id) {
            return res.json({ status: false, message: "Notification ID is required." });
        }

        // Stop the scheduled job if it exists
        if (scheduledJobs[id]) {
            scheduledJobs[id].stop();
            delete scheduledJobs[id];
        }

        const deletedNotification = await Notification.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.json({ status: false, message: "Notification not found or already deleted." });
        }

        return res.json({ status: true, message: "Notification deleted successfully." });

    } catch (error) {
        console.error("❌ Error deleting notification:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


module.exports = {
    sendSMSToUser,
    sendSMSToAll,
    scheduleSMS,
    getSentOrFailedNotifications,
    getScheduledNotifications,
    editScheduledNotification,
    deleteScheduledNotification
};

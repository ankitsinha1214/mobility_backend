const User = require('../models/userModel');
const Email = require('../models/emailConsumerModel');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const scheduledJobs = {};

const { MESSAGE } = require("../message.json");

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

const sendEmail = async (email, subject, description) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: description
          };
        const response = await transporter.sendMail(mailOptions);
        console.log("📬 Email Sent Response:", JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('❌ Sending Email Error:', error);
        throw error;
    }
};

// ✅ Send Email to a single user
const sendEmailToUser = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { email, subject, description } = req.body;

        if (!email || !subject || !description) {
            return res.json({ status: false, message: "Email, subject and description are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.json({ status: false, message: "User not found" });
        await sendEmail(email, subject, description);
        // console.log('res',response);

        const emailRecord = new Email({
            subject,
            description,
            type: email,
            status: "Sent",
            userId: req?.userid,
            scheduleTime: null
        });

        await emailRecord.save();
        return res.json({ status: true, message: "Email sent successfully" });

    } catch (error) {
        return res.status(500).json({ status: false, message: "Email sending failed" });
    }
};

// ✅ Send Email to all users (skip on failure)
const sendEmailToAll = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const { subject, description  } = req.body;
        if (!subject || !description ) return res.json({ status: false, message: "Subject and Description are required" });

        // const users = await User.find({ phoneNumber: { $exists: true }, status: "active" });
        const users = await User.find({ email: { $exists: true }, status: "active" });

        const results = await Promise.allSettled(
            users.map(async (user) => {
                try {
                    await sendEmail(user?.email, subject, description);
                    return { user: user?.email, success: true };
                } catch (err) {
                    console.error(`Failed to send Email to ${user?.email}:`, err?.message);
                    return { user: user?.email, success: false };
                }
            })
        );

        const failedUsers = results.filter(r => r.value && !r.value.success).map(r => r.value.user);

        const emailRecord = new Email({
            subject,
            description,
            type: "All",
            status: failedUsers.length ? "Partially Sent" : "Sent",
            scheduleTime: null,
            userId: req?.userid
        });

        await emailRecord.save();

        return res.json({
            status: true,
            message: failedUsers.length
                ? `Email sent to all users except: ${failedUsers.join(', ')}`
                : "Email sent to all users"
        });

    } catch (error) {
        console.error("Bulk Email error:", error);
        return res.status(500).json({ status: false, message: "Failed to send Email to all" });
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
            message: message,
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
 * API to get all Email that are Sent or Failed
 */
const getSentOrFailedEmail = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const email = await Email.find({ status: { $in: ["Sent", "Failed", "Partially Sent"] } })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });
        if(email.length === 0){
        return res.json({ status: false, data: MESSAGE?.USER_NOT_FOUND || "No Email Found" });
        }
        return res.json({ status: true, data: email });
    } catch (error) {
        console.error("❌ Error fetching sent/failed email:", error);
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

const editScheduledSms = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { id } = req.params;
        const { message, scheduleTime } = req.body;

        if (!id || !message || !scheduleTime) {
            return res.json({ status: false, message: "ID, message, and scheduleTime are required." });
        }

        // Validate scheduleTime format
        const [minute, hour, day, month] = scheduleTime.split(" ");
        if (isNaN(minute) || isNaN(hour) || isNaN(day) || isNaN(month)) {
            return res.json({ status: false, message: "Invalid schedule format. Use 'MM HH DD MM *' (e.g., '30 14 10 8 *' for Aug 10, 14:30)." });
        }

        // Update the notification
        const updatedSms= await Sms.findByIdAndUpdate(id, {
            message,
            scheduleTime,
            status: "Scheduled"
        }, { new: true });

        if (!updatedSms) {
            return res.json({ status: false, message: "Sms not found or update failed." });
        }

        return res.json({ status: true, message: "Sms updated successfully.", data: updatedSms });

    } catch (error) {
        console.error("❌ Error updating sms:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

const deleteScheduledSms = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { id } = req.params;

        if (!id) {
            return res.json({ status: false, message: "Sms ID is required." });
        }

        // Stop the scheduled job if it exists
        if (scheduledJobs[id]) {
            scheduledJobs[id].stop();
            delete scheduledJobs[id];
        }

        const deletedNotification = await Sms.findByIdAndDelete(id);

        if (!deletedNotification) {
            return res.json({ status: false, message: "Sms not found or already deleted." });
        }

        return res.json({ status: true, message: "Sms deleted successfully." });

    } catch (error) {
        console.error("❌ Error deleting sms:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


module.exports = {
    sendEmailToUser,
    sendEmailToAll,
    scheduleSMS,
    getSentOrFailedEmail,
    getScheduledNotifications,
    editScheduledSms,
    deleteScheduledSms
};

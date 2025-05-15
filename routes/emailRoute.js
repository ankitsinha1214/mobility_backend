// routes/emailRoutes.js
const express = require("express");
const { sendEmailToUser, sendEmailToAll, scheduleEmail, getSentOrFailedEmail, getScheduledEmails, editScheduledSms, deleteScheduledEmail } = require("../controllers/emailController");

const fetchUser = require('../middleware/fetchuser');
const router = express.Router();

// Register FCM Token in AWS SNS
// router.post("/register-token",fetchUser, registerToken);

// Send Push Email
router.post("/", fetchUser, sendEmailToUser);

// Send Push Email to All
router.post("/send-email-to-all", fetchUser, sendEmailToAll);

// Send Push Email to All
router.post("/schedule-email", fetchUser, scheduleEmail);

// Get all Email of scheduled
router.get("/", fetchUser, getSentOrFailedEmail);

// Get all Email of scheduled
router.get("/scheduled", fetchUser, getScheduledEmails);

router.put("/:id", editScheduledSms);

router.delete("/:id", fetchUser, deleteScheduledEmail);

module.exports = router;

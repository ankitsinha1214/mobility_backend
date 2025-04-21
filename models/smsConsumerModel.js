// models/notificationServiceMaintenanceModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const smsSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Service-and-maintenance-user',
        required: true,
    },
    type: {
        type: String,
        // enum: ["Single", "All"], // Single: One user, All: Multiple users
        required: true
    },
    scheduleTime: {
        type: String,
        // enum: ["Single", "All"], // Single: One user, All: Multiple users
        required: false
    },
    status: {
        type: String,
        enum: ["Pending", "Scheduled", "Sent", "Failed", "Partially Sent"], // Tracking sms status
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('Sms-Consumer', smsSchema);

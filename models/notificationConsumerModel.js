// models/notificationServiceMaintenanceModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Service-and-maintenance-user',
        required: true,
    },
    endpointArns: {
        type: [String], // Array to store multiple Endpoint ARNs
        required: false
    },
    type: {
        type: String,
        // enum: ["Single", "All"], // Single: One user, All: Multiple users
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Scheduled", "Sent", "Failed"], // Tracking notification status
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification-Consumer', notificationSchema);

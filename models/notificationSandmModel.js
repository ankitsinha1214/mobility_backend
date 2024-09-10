// models/notificationServiceMaintenanceModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sandmNotificationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    userServiceAndMaintenance: {
        type: Schema.Types.ObjectId,
        ref: 'Service-and-maintenance-user', 
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification-Service-Maintenance', sandmNotificationSchema);

const NotificationServiceMaintenance = require('../models/notificationSandmModel');
const UserSandmModel = require('../models/userSandmModel'); // Ensure you have the correct path

// Create a new notification
const createNotification = async (req, res) => {
    const { title, description, userServiceAndMaintenance } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        // Validate the userServiceAndMaintenance ID
        const userExists = await UserSandmModel.findById(userServiceAndMaintenance);
        if (!userExists) {
            return res.json({ success: false, message: 'Invalid userServiceAndMaintenance ID' });
        }

        const notification = new NotificationServiceMaintenance({ title, description, userServiceAndMaintenance });
        await notification.save();
        return res.json({ success: true, data: notification, message: 'Notification created successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all notifications
const getNotifications = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const notifications = await NotificationServiceMaintenance.find().populate('userServiceAndMaintenance', 'username email phone');
        return res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get a single notification by ID
const getNotificationById = async (req, res) => {
    const { id } = req.params;
    try {
        const notification = await NotificationServiceMaintenance.findById(id);
        if (!notification) {
            return res.json({ success: false, message: 'Notification not found' });
        }
        return res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// // Update a notification by ID
// const updateNotification = async (req, res) => {
//     const { id } = req.params;
//     const { title, description, isRead, userServiceAndMaintenance } = req.body;

//     try {
//         // Validate the userServiceAndMaintenance ID
//         if (userServiceAndMaintenance) {
//             const userExists = await UserSandmModel.findById(userServiceAndMaintenance);
//             if (!userExists) {
//                 return res.json({ success: false, message: 'Invalid userServiceAndMaintenance ID' });
//             }
//         }

//         const notification = await NotificationServiceMaintenance.findByIdAndUpdate(
//             id,
//             { title, description, isRead, userServiceAndMaintenance },
//             { new: true, runValidators: true }
//         );
//         if (!notification) {
//             return res.json({ success: false, message: 'Notification not found' });
//         }
//         return res.json({ success: true, data: notification, message: 'Notification updated successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };
const updateNotification = async (req, res) => {
    const { id } = req.params;
    const { isRead } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        // Validate the isRead field
        if (typeof isRead !== 'boolean') {
            return res.json({ success: false, message: 'Invalid isRead value' });
        }

        const notification = await NotificationServiceMaintenance.findByIdAndUpdate(
            id,
            { isRead },
            { new: true, runValidators: true }
        );
        if (!notification) {
            return res.json({ success: false, message: 'Notification not found' });
        }
        return res.json({ success: true, data: notification, message: 'Notification isRead status updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Delete a notification by ID
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const notification = await NotificationServiceMaintenance.findByIdAndDelete(id);
        if (!notification) {
            return res.json({ success: false, message: 'Notification not found' });
        }
        return res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all notifications by userServiceAndMaintenance ID
const getNotificationsByUserId = async (req, res) => {
    const { userId } = req.body;

    try {
        const notifications = await NotificationServiceMaintenance.find({ userServiceAndMaintenance: userId });
        if (notifications.length === 0) {
            return res.json({ success: false, message: 'No notifications found for the given user ID' });
        }
        return res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all notifications by userServiceAndMaintenance ID which are unread
const getNotificationsUnreadByUserId = async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch unread notifications for the specified user
        const notifications = await NotificationServiceMaintenance.find({ 
            userServiceAndMaintenance: userId,
            isRead: false // Filter for unread notifications
        });

        if (notifications.length === 0) {
            return res.json({ success: false, message: 'No unread notifications found for the given user ID' });
        }

        return res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getNotificationsByUserId,
    getNotificationsUnreadByUserId
};

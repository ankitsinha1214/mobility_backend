// routes/notificationServiceMaintenanceRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationSandmController');
const fetchUser = require('../middleware/fetchuser');

router.post('/', fetchUser, notificationController.createNotification);
router.get('/', fetchUser, notificationController.getNotifications);
router.get('/:id', fetchUser, notificationController.getNotificationById);
router.put('/:id', fetchUser, notificationController.updateNotification);
router.delete('/:id', fetchUser, notificationController.deleteNotification);
router.post('/user', fetchUser, notificationController.getNotificationsByUserId);
router.post('/user/unread', fetchUser, notificationController.getNotificationsUnreadByUserId);

module.exports = router;

// routes/notificationServiceMaintenanceRoutes.js

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationSandmController');

router.post('/', notificationController.createNotification);
router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);
router.post('/user', notificationController.getNotificationsByUserId);

module.exports = router;

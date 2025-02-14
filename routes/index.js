const express = require('express');

const router = express.Router();

// Welcome message route
router.get('/', (_req, res) => {
    res.send({ message: 'Welcome to Backend of Esyasoft Mobility!!' });
  });

router.use('/reports', require('../controllers/reportController'));
router.use('/users', require('./userRoute'));
router.use('/version', require('./versionRoute'));
router.use('/user-service-and-maintenance', require('./userSandmRoute'));
router.use('/notification-service-and-maintenance', require('./notificationSandmRoute'));
router.use('/location', require('./locationRoute'));
router.use('/vehicle', require('./vehicleRoute'));
router.use('/charger-locations', require('./chargerLocationRoute'));
router.use('/faq', require('./faqRoute'));
router.use('/reviews', require('./ratingUserLocationRoute'));
router.use('/session', require('./chargingSessionRoute'));
router.use('/payment', require('./paymentRoute'));
router.use('/pre-delivery-question', require('./preDeliveryQuestionRoute'));
router.use('/site-surveys', require('./siteSurveyRoutes'));
router.use('/pre-delivery-chargebox-response', require('./preDeliveryChargeboxRoute'));
router.use('/pre-installations', require('./preInstallationRoute'));
router.use('/charger-dc-box', require('./chargerAndDcBoxRoute'));
router.use('/notification', require('./notificationRoute'));


module.exports = router;
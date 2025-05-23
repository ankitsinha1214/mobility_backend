const express = require('express');

const router = express.Router();

// Welcome message route
router.get('/', (_req, res) => {
    // res.send({ message: 'Welcome to Backend of Esyasoft Mobility!!' });
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Backend Server</title>
        <style>
          body {
            background: linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: 'Poppins', sans-serif;
            color: #333;
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 10px;
          }
          p {
            font-size: 1.2rem;
            margin-bottom: 20px;
          }
          .button {
            padding: 10px 20px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            font-size: 1rem;
            transition: background 0.3s;
          }
          .button:hover {
            background-color: #555;
          }
        </style>
      </head>
      <body>
        <h1>🚀 Esyasoft Mobility Server Running!</h1>
        <p>Welcome to the API server landing page.</p>
        <a href="/" class="button">Go to Home</a>
      </body>
      </html>
    `);
  });

router.use('/reports', require('../controllers/reportController'));
router.use('/graph', require('./graphRoute'));
router.use('/ticket', require('./ticketRoute'));
router.use('/ticket-message', require('./ticketMessageRoute'));
router.use('/encrypt-param', require('./encrypt'));
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
router.use('/sms', require('./smsRoute'));
router.use('/email', require('./emailRoute'));
router.use('/download', require('./downloadRoute'));
router.use("/reservations", require('./reservationRoute'));
router.use('/logs', require('./logRoute'));

module.exports = router;
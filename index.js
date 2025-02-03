require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DATABASE } = require('./message.json'); // Adjust path as needed
const logger = require('./logger');
const logRequest = require('./middleware/loggerMiddleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const startChargerStatusUpdater = require('./services/updateChargerStatus');
// const { WebSocketServer } = require('ws');
// const WebSocket = require('ws');
// const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 8080;

// Rate Limiter (Prevents brute-force attacks)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  // windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 100 requests per windowMs
  message: { status: false, msg: 'Too many requests, please try again later.' },
});

// const allClients = new Map();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(apiLimiter);
app.use(bodyParser.json());
app.use(logRequest);

// MongoDB Connection
const dbConfig = require('./db'); // Assuming your MongoDB configuration is in db.js
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => console.log(DATABASE.CONNECTED))
  .catch(err => console.error({ msg: DATABASE.ERROR_CONNECTING, err }));

// function handleAuthorize(ws, messageId, payload) {
//   console.log("Authorize payload:", payload);

//   // const messageId = generateUniqueId(); // Generate a unique ID for the message
//   const ocppMessage = [
//     2, // MessageTypeId for Call
//     messageId,
//     "Authorize",
//     { "idTag": "deadbeef" }
//   ];

//   wsConnection.send(JSON.stringify(ocppMessage));

//   // const response = [3, messageId, { transactionId: 123 }];
//   // ws.send(JSON.stringify(response));
//   // console.log("Sent StartTransaction response:", response);
// }

// function sendError(ws, messageId, errorCode, errorDescription) {
//   const response = [4, messageId, errorCode, errorDescription];
//   ws.send(JSON.stringify(response));
//   console.log("Sent error response:", response);
// }

// Routes
// app.post('/api/charger/reboot', (req, res) => {
//   const { chargerId } = req.body;

//   if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
//     return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
//   }

//   const messageId = generateUniqueId(); // Generate a unique ID for the message
//   const ocppMessage = [
//     2, // MessageTypeId for Call
//     messageId,
//     "Reboot",
//     { chargerId }
//   ];

//   try {
//     wsConnection.send(JSON.stringify(ocppMessage));
//     return res.status(200).json({ status: true, message: "Reboot command sent", messageId });
//   } catch (error) {
//     console.error('Error sending WebSocket message:', error);
//     return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
//   }
// });

// app.post('/api/charger/authorize', (req, res) => {
//   const { chargerId } = req.body;

//   // if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
//   //   return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
//   // }

//   const messageId = generateUniqueId(); // Generate a unique ID for the message
//   const ocppMessage = [
//     2, // MessageTypeId for Call
//     messageId,
//     "Authorize",
//     { "idTag": "6299459950" }
//   ];

//   try {
//     wsConnection.send(JSON.stringify(ocppMessage));
//     return res.status(200).json({ status: true, message: "Authorize command sent", messageId });
//   } catch (error) {
//     console.error('Error sending WebSocket message:', error);
//     return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
//   }
// });


logger.info('Application has started');

// app.use('/', require('./routes')); // Centralized route handling for test
app.use('/api', require('./routes')); // Centralized route handling

// Cron Jobs updater
startChargerStatusUpdater();

// app.get('/', (_req, res) => {
//   res.send({ message: 'Welcome to Backend of Esyasoft Mobility!!' });
// });
// app.use('/reports', require('./controllers/reportController')); // Adjust route paths as per your file structure
// app.use('/users', require('./routes/userRoute')); // Adjust route paths as per your file structure
// app.use('/user-service-and-maintenance', require('./routes/userSandmRoute')); // Adjust route paths as per your file structure
// app.use('/notification-service-and-maintenance', require('./routes/notificationSandmRoute')); // Adjust route paths as per your file structure
// app.use('/location', require('./routes/locationRoute'));
// app.use('/vehicle', require('./routes/vehicleRoute'));
// app.use('/charger-locations', require('./routes/chargerLocationRoute'));
// app.use('/faq', require('./routes/faqRoute'));
// app.use('/reviews', require('./routes/ratingUserLocationRoute'));
// app.use('/session', require('./routes/chargingSessionRoute'));
// app.use('/payment', require('./routes/paymentRoute'));
// app.use('/pre-delivery-question', require('./routes/preDeliveryQuestionRoute'));
// app.use('/site-surveys', require('./routes/siteSurveyRoutes'));
// app.use('/pre-delivery-chargebox-response', require('./routes/preDeliveryChargeboxRoute'));
// app.use('/pre-installations', require('./routes/preInstallationRoute'));
// app.use('/charger-dc-box', require('./routes/chargerAndDcBoxRoute'));

// Start the server
app.listen(port, () => {
  console.log(`My app listening at http://localhost:${port}`);
});

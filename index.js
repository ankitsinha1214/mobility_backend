require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DATABASE } = require('./message.json'); // Adjust path as needed
const logger = require('./logger');
const logRequest = require('./middleware/loggerMiddleware'); 
const { WebSocketServer } = require('ws');
// const WebSocket = require('ws');
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 8080;

let wsConnection;
const wss = new WebSocketServer({ port: 8006 });
wss.on("connection",function connection(ws){
  console.log("Client Connected");
  wsConnection = ws; 
  ws.on('message', (message) => {
    console.log('Received from server: %s', message);
    try {
      const parsedMessage = JSON.parse(message);
      console.log("Message in Array",parsedMessage);
      handleOcppMessage(ws, parsedMessage);
    } catch (error) {
      console.error("Invalid message format:", error);
    }
  });
  ws.on('open', () => {
    console.log('Connected to OCPP server');
    ws.send('Hello Server!');
  });
  ws.on('close', () => {
    console.log('Disconnected from the server');
  });
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  // ws.on('message', (message) => {
  //   console.log('Received from server:', message);
  // });
})

function handleOcppMessage(ws, message) {
  const [messageType, messageId, action, payload] = message;

  if (messageType === 2) { // Call message
    switch (action) {
      case "StartTransaction":
        handleStartTransaction(ws, messageId, payload);
        break;
      case "StopTransaction":
        handleStopTransaction(ws, messageId, payload);
        break;
      case "BootNotification":
        console.log('Boot Notification:', payload);
        handleBootNotification(ws, messageId, payload);
        // handleStartTransaction(ws, messageId, payload);
        break;
      default:
        console.log("Unknown action:", action);
        sendError(ws, messageId, "NotImplemented", "Unknown action");
    }
  } else {
    console.log("Unsupported message type:", messageType);
  }
}

function handleBootNotification(ws, messageId, payload) {
  const response = [
    3, // MessageTypeId for CallResult
    messageId,
    {
      status: 'Accepted',
      currentTime: new Date().toISOString(),
      interval: 300 // Heartbeat interval in seconds
    }
  ];

  ws.send(JSON.stringify(response));
  console.log('Sent BootNotification Response');
}

function handleStartTransaction(ws, messageId, payload) {
  console.log("StartTransaction payload:", payload);

  const response = [3, messageId, { transactionId: 123 }];
  ws.send(JSON.stringify(response));
  console.log("Sent StartTransaction response:", response);
}

function handleStopTransaction(ws, messageId, payload) {
  console.log("StopTransaction payload:", payload);

  const response = [3, messageId, {}];
  ws.send(JSON.stringify(response));
  console.log("Sent StopTransaction response:", response);
}

function sendError(ws, messageId, errorCode, errorDescription) {
  const response = [4, messageId, errorCode, errorDescription];
  ws.send(JSON.stringify(response));
  console.log("Sent error response:", response);
}
// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(logRequest);

// MongoDB Connection
const dbConfig = require('./db'); // Assuming your MongoDB configuration is in db.js
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => console.log(DATABASE.CONNECTED))
  .catch(err => console.error({ msg: DATABASE.ERROR_CONNECTING, err }));

// Routes
// Handle API for Start/Stop Transactions
app.post('/api/transaction', (req, res) => {
  const { action, chargerId, payload } = req.body;

  if (!action || !['start', 'stop'].includes(action)) {
    return res.status(400).json({ status: false, message: 'Invalid action specified' });
  }

  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
  }

  const messageId = generateUniqueId(); // Generate a unique ID for the message
  const ocppMessage = [
    2, // MessageTypeId for Call
    messageId,
    action === 'start' ? 'StartTransaction' : 'StopTransaction',
    payload || { idTag: chargerId }
  ];

  try {
    wsConnection.send(JSON.stringify(ocppMessage));
    return res.json({ status: true, message: `${action} transaction initiated`, messageId });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
  }
});
// Generate a unique ID
function generateUniqueId() {
  return uuidv4();
}


app.get('/', (_req, res) => {
  res.send({ message: 'Welcome to Backend of Esyasoft Mobility!!' });
});

logger.info('Application has started');

app.use('/reports', require('./controllers/reportController')); // Adjust route paths as per your file structure
app.use('/users', require('./routes/userRoute')); // Adjust route paths as per your file structure
app.use('/user-service-and-maintenance', require('./routes/userSandmRoute')); // Adjust route paths as per your file structure
app.use('/notification-service-and-maintenance', require('./routes/notificationSandmRoute')); // Adjust route paths as per your file structure
app.use('/location', require('./routes/locationRoute'));
app.use('/vehicle', require('./routes/vehicleRoute'));
app.use('/charger-locations', require('./routes/chargerLocationRoute'));
app.use('/faq', require('./routes/faqRoute'));
app.use('/reviews', require('./routes/ratingUserLocationRoute'));
app.use('/session', require('./routes/chargingSessionRoute'));
app.use('/pre-delivery-question', require('./routes/preDeliveryQuestionRoute'));
app.use('/site-surveys', require('./routes/siteSurveyRoutes'));
app.use('/pre-delivery-chargebox-response', require('./routes/preDeliveryChargeboxRoute'));
app.use('/pre-installations', require('./routes/preInstallationRoute'));
app.use('/charger-dc-box', require('./routes/chargerAndDcBoxRoute'));

// app.use('/subservice', require('./routes/subServiceRoute'));

// Start the server
app.listen(port, () => {
  console.log(`My app listening at http://localhost:${port}`);
});

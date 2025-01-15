require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DATABASE } = require('./message.json'); // Adjust path as needed
const logger = require('./logger');
const logRequest = require('./middleware/loggerMiddleware');
const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 8080;

const allClients = new Map();

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

  
const ws = require('./ocppConnect.js');
// let wsConnection;
// const wss = new WebSocketServer({ port: 8006 });
// wss.on("connection", function connection(ws) {
//   console.log("Client Connected");
//   wsConnection = ws;

//   // setInterval(() => {
//   //   sendHeartbeat();
//   // }, 10000);

//   ws.on('message', (message) => {
//     console.log('Received from server: %s', message);
//     try {
//       const parsedMessage = JSON.parse(message);
//       console.log("Message in Array", parsedMessage);
//       handleOcppMessage(ws, parsedMessage);
//     } catch (error) {
//       console.error("Invalid message format:", error);
//     }
//   });
//   ws.on('open', () => {
//     console.log('Connected to OCPP server');
//     ws.send('Hello Server!');
//   });
//   ws.on('close', () => {
//     console.log('Disconnected from the server');
//   });
//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
//   // ws.on('message', (message) => {
//   //   console.log('Received from server:', message);
//   // });
// })

// function handleOcppMessage(ws, message) {
//   const [messageType, messageId, action, payload] = message;

//   if (messageType === 2) { // Call message
//     switch (action) {
//       case "Reboot":
//         handleReboot(ws, messageId, payload);
//         break;
//       case "StartTransaction":
//         handleStartTransaction(ws, messageId, payload);
//         break;
//       case "Authorize":
//         handleAuthorize(ws, messageId, payload);
//         break;
//       case "StatusNotification":
//         handleStatus(ws, messageId, payload);
//         break;
//       case "Reset":
//         handleReset(ws, messageId, payload);
//         break;
//       case "StopTransaction":
//         handleStopTransaction(ws, messageId, payload);
//         break;
//       case "BootNotification":
//         console.log('Boot Notification:', payload);
//         handleBootNotification(ws, messageId, payload);
//         // handleStartTransaction(ws, messageId, payload);
//         break;
//         case "Heartbeat": // Handle Heartbeat action
//         console.log('Heartbeat received:', payload);
//         sendHeartbeatAcknowledgment(ws, messageId);
//         break;
//         case "MeterValues":
//           console.log("Meter Values:", payload);
//           handleMeterValues(ws, messageId, payload);
//           break;
//       default:
//         console.log("Unknown action:", action);
//         sendError(ws, messageId, "NotImplemented", "Unknown action");
//     }
//   } else {
//     console.log("Unsupported message type:", messageType);
//   }
// }

// function sendHeartbeat() {
//   if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
//     const messageId = generateUniqueId();
//     const heartbeatMessage = [
//       2, // MessageTypeId for Call
//       messageId,
//       "Heartbeat", // OCPP action for heartbeat
//       {}
//     ];

//     wsConnection.send(JSON.stringify(heartbeatMessage));
//     console.log("Sent Heartbeat message:", heartbeatMessage);
//   } else {
//     console.log("WebSocket connection not open. Unable to send heartbeat.");
//   }
// }


// function handleReboot(ws, messageId, payload) {
//   console.log("Reboot payload:", payload);

//   // Response indicating the reboot command is accepted
//   const response = [3, messageId, { status: "Accepted" }];
//   ws.send(JSON.stringify(response));
//   console.log("Sent Reboot response:", response);

//   // Simulate a reboot action (you can add actual reboot logic if needed)
//   setTimeout(() => {
//     console.log("Simulating charger reboot...");
//   }, 3000);
// }

// function handleReset(ws, messageId, payload) {
//   console.log("Reset payload:", payload);

//   // Response indicating the reboot command is accepted
//   const response = [3, messageId, { status: "Accepted" }];
//   ws.send(JSON.stringify(response));
//   console.log("Sent Reset response:", response);

//   // Simulate a reboot action (you can add actual reboot logic if needed)
//   setTimeout(() => {
//     console.log("Simulating charger reseting...");
//   }, 3000);
// }

// function handleBootNotification(ws, messageId, payload) {
//   const response = [
//     3, // MessageTypeId for CallResult
//     messageId,
//     {
//       status: 'Accepted',
//       currentTime: new Date().toISOString(),
//       interval: 300 // Heartbeat interval in seconds
//     }
//   ];

//   ws.send(JSON.stringify(response));
//   console.log('Sent BootNotification Response');
// }

// function handleStartTransaction(ws, messageId, payload) {
//   console.log("StartTransaction payload:", payload);

//   const transactionId = uuidv4(); // Generate a unique transaction ID
//   const response = [
//     3, // CallResult message type
//     messageId, // Echo the message ID
//     {
//       transactionId,
//       idTagInfo: {
//         status: "Accepted", // Indicating the transaction has started
//         expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Example expiry
//       },
//     },
//   ];
//   ws.send(JSON.stringify(response));
//   console.log("StartTransaction response sent:", response);
// }

// function sendHeartbeatAcknowledgment(ws, messageId) {
//   const response = [
//     3, // CallResult message type
//     messageId, // Corresponding message ID
//     { currentTime: new Date().toISOString() } // Payload
//   ];
//   ws.send(JSON.stringify(response));
//   console.log("Heartbeat acknowledgment sent:", response);
// }

// // Function to handle MeterValues action
// function handleMeterValues(ws, messageId, payload) {
//   console.log("Received MeterValues:", payload);

//   // Process the meter values
//   // Example: Save to the database or log the meter readings
//   // Here, assume payload contains information like connectorId, meterValue, and timestamp
//   const { connectorId, meterValue, timestamp } = payload;

//   console.log(`MeterValues Details:
//     Connector ID: ${connectorId}
//     Meter Value: ${meterValue}
//     Timestamp: ${timestamp}`);

//   // Respond to the client to acknowledge MeterValues
//   const response = [
//     3, // CallResult
//     messageId,
//     {} // Empty object for CallResult response payload
//   ];
//   ws.send(JSON.stringify(response));
// }

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

// function handleStatus(ws, messageId, payload) {
//   console.log("Received StatusNotification:", payload);

//   // Example payload structure for StatusNotification
//   // {
//   //   connectorId: 1,
//   //   errorCode: "NoError",
//   //   status: "Available",
//   //   timestamp: "2025-01-13T12:34:56Z",
//   // }

//   const { connectorId, errorCode, status, timestamp } = payload;
//   // if (status !== 'Preparing') {
//   //   return;
//   // }

//   // Log status notification details
//   logger.info(`StatusNotification - Connector: ${connectorId}, Status: ${status}, ErrorCode: ${errorCode}, Timestamp: ${timestamp}`);

//   // Respond back to acknowledge receipt
//   // const response = [{}]; // Response messageType: 3 (CallResult)
//   const response = [3, messageId, {}]; // Response messageType: 3 (CallResult)
//   ws.send(JSON.stringify(response), (err) => {
//     if (err) {
//       console.error("Error sending StatusNotification response:", err);
//     } else {
//       console.log("StatusNotification response sent successfully.");
//     }
//   });

//   // You can perform additional operations, such as updating a database or triggering further actions based on status
// }

// function handleStopTransaction(ws, messageId, payload) {
//   console.log("StopTransaction payload:", payload);

//   const response = [3, messageId, {}];
//   ws.send(JSON.stringify(response));
//   console.log("Sent StopTransaction response:", response);
// }

// function sendError(ws, messageId, errorCode, errorDescription) {
//   const response = [4, messageId, errorCode, errorDescription];
//   ws.send(JSON.stringify(response));
//   console.log("Sent error response:", response);
// }

// Routes
app.post('/api/charger/reboot', (req, res) => {
  const { chargerId } = req.body;

  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
  }

  const messageId = generateUniqueId(); // Generate a unique ID for the message
  const ocppMessage = [
    2, // MessageTypeId for Call
    messageId,
    "Reboot",
    { chargerId }
  ];

  try {
    wsConnection.send(JSON.stringify(ocppMessage));
    return res.status(200).json({ status: true, message: "Reboot command sent", messageId });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
  }
});
app.post('/api/charger/reset', (req, res) => {
  const { chargerId } = req.body;

  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
  }

  const messageId = generateUniqueId(); // Generate a unique ID for the message
  const ocppMessage = [
    2, // MessageTypeId for Call
    messageId,
    "Reset",
    { "type": "Soft" }
  ];

  try {
    wsConnection.send(JSON.stringify(ocppMessage));
    return res.status(200).json({ status: true, message: "Reboot command sent", messageId });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
  }
});

app.post('/api/charger/authorize', (req, res) => {
  const { chargerId } = req.body;

  // if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
  //   return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
  // }

  const messageId = generateUniqueId(); // Generate a unique ID for the message
  const ocppMessage = [
    2, // MessageTypeId for Call
    messageId,
    "Authorize",
    { "idTag": "6299459950" }
  ];

  try {
    wsConnection.send(JSON.stringify(ocppMessage));
    return res.status(200).json({ status: true, message: "Authorize command sent", messageId });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return res.status(500).json({ status: false, message: 'Error sending WebSocket message' });
  }
});

app.post('/charging-station/:identity/start-transaction', async (req, res, next) => {
  try {

    const client = allClients.get(req.params.identity);

    if (!client) {
      throw Error("Client not found");
    }

    const response = await client.call('RemoteStartTransaction', {
      connectorId: 1, // start on connector 1
      idTag: 'XXXXXXXX', // using an idTag with identity 'XXXXXXXX'
    });

    if (response.status === 'Accepted') {
      console.log('Remote start worked!');
    } else {
      console.log('Remote start rejected.');
    }

  } catch (err) {
    next(err);
  }
});

// Handle API for Start/Stop Transactions
app.post('/charger/transaction', async(req, res) => {
  const { action, chargerId, payload } = req.body;

  if (!action || !['start', 'stop'].includes(action)) {
    return res.status(400).json({ status: false, message: 'Invalid action specified' });
  }

  // if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
  }

  const messageId = generateUniqueId(); // Generate a unique ID for the message
  const ocppMessage = [
    2, // MessageTypeId for Call
    messageId,
    action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
    // action === 'start' ? 'StartTransaction' : 'StopTransaction',
    payload || { idTag: chargerId }
  ];

  try {
    const response = await wsConnection.send(JSON.stringify(ocppMessage));
    // console.log("response",response);
    // if (response.status === 'Accepted') {
    //   console.log('Remote start worked!');
    //   return res.json({ status: true, message: `${action} transaction initiated`, messageId });
    // } else {
    //   console.log('Remote start rejected.');
    //   return res.json({ status: false, message: `${action} transaction failed`, messageId });
    // }
    return res.json({ status: true, message: `${action} transaction initiated`, messageId });
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return res.status(500).json({ status: false, message: 'Error sending start transaction!!!' });
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

// Start the server
app.listen(port, () => {
  console.log(`My app listening at http://localhost:${port}`);
});

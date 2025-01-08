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
const app = express();
const port = process.env.PORT || 8080;

// const ws = new WebSocket('ws://localhost:8000');
// const ws = new WebSocket.Server({ port: 8000, host: '0.0.0.0' });
const wss = new WebSocketServer({ port: 8006 });
wss.on("connection",function connection(ws){
  console.log("Client Connected");
  ws.on('message', (message) => {
    console.log('Received from server: %s', message);
  });
  ws.on('open', () => {
    console.log('Connected to the WebSocket server');
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



// const wss = new WebSocket.Server({ port: 8000, host: '0.0.0.0' });

// wss.on('connection', (socket) => {
//   console.log('New WebSocket client connected');

//   // Listen for messages from clients
//   socket.on('message', (message) => {
//     console.log('Received:', message);

//     // Send a response back to the client
//     socket.send(`Server Echo: ${message}`);
//   });

//   // Handle client disconnection
//   socket.on('close', () => {
//     console.log('WebSocket client disconnected');
//   });

//   // Handle errors
//   socket.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// });
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

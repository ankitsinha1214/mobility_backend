require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { DATABASE } = require('./message.json'); // Adjust path as needed

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
const dbConfig = require('./db'); // Assuming your MongoDB configuration is in db.js
mongoose.connect(dbConfig.mongoURI, dbConfig.options)
  .then(() => console.log(DATABASE.CONNECTED))
  .catch(err => console.error({ msg: DATABASE.ERROR_CONNECTING, err }));

// Routes
app.get('/', (_req, res) => {
  res.send({ message: 'Welcome to Backend of Esyasoft Mobility!!' });
});

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

// app.use('/subservice', require('./routes/subServiceRoute'));

// Start the server
app.listen(port, () => {
  console.log(`My app listening at http://localhost:${port}`);
});

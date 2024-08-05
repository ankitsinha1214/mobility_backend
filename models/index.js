const mongoose = require('mongoose');
const dbConfig = require('../db'); // Assuming you have a db configuration file

// Import Mongoose models
const User = require('./userModel'); // Update the path as necessary for other models
const SandmUser = require('./userSandmModel'); // Update the path as necessary for other models
const Location = require('./locationModel'); // Update the path as necessary for other models
const Vehicle = require('./vehicleModel'); // Update the path as necessary for other models
const ChargerLocation = require('./chargerLocationModel'); // Update the path as necessary for other models
const faq = require('./faqModel'); // Update the path as necessary for other models
const predeliveryQuestion = require('./preDeliveryQuestionModel'); // Update the path as necessary for other models
const preDeliveryChargebox = require('./preDeliveryChargeboxResponseModel'); // Update the path as necessary for other models
const sandmNotification = require('./notificationSandmModel'); // Update the path as necessary for other models
const chargingSession = require('./chargerSessionModel'); // Update the path as necessary for other models

const { DATABASE } = require('../message.json');

// Connect to MongoDB
mongoose.connect(dbConfig.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log(DATABASE.CONNECTED))
.catch(err => console.error({ msg: DATABASE.ERROR_CONNECTING, err }));

// Export models
module.exports = {
  User,
  SandmUser,
  Location,
  Vehicle,
  ChargerLocation,
  sandmNotification,
  faq,
  predeliveryQuestion,
  preDeliveryChargebox,
  chargingSession
};

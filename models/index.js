const mongoose = require('mongoose');
const dbConfig = require('../db'); // Assuming you have a db configuration file

// Import Mongoose models
const User = require('./userModel'); // Update the path as necessary for other models

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
  User, // Add other models similarly if needed
};

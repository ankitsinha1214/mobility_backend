const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleModelSchema = new Schema({
  make: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Make cannot be empty'
    }
  },
  model: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Model cannot be empty'
    }
  },
  variant: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Variant cannot be empty'
    }
  },
  // type: {
  //   type: String,
  //   required: true,
  //   validate: {
  //     validator: function(v) {
  //       return /\S+/.test(v); // Ensures it's not just whitespace
  //     },
  //     message: 'Vehicle type cannot be empty'
  //   }
  // },
  ARAI_range: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'ARAI Range cannot be empty'
    }
  },
  claimed_range: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Claimed Range cannot be empty'
    }
  },
  image: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /\S+/.test(v); // Ensures it's not just whitespace
      },
      message: 'Image URL cannot be empty'
    }
  }
}, { timestamps: true });

const VehicleModel = mongoose.model('VehicleModel', vehicleModelSchema);

module.exports = VehicleModel;

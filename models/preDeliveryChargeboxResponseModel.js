// models/preDeliveryChargeboxReponseModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eachResponseSchema = new Schema({
    question_id: {
        type: Schema.Types.ObjectId,
        ref: 'PreDeliveryQuestion', 
        required: true
    },
    response: {
      type: Number,
      required: true,
      validate: {
        validator: function(v) {
            return !isNaN(v); // Ensures it's a number
          },
        message: 'Response must be a number'
      }
    },
    response_img: {
      type: String,
      required: false,
    }
  });

const preDeliveryChargeboxSchema = new Schema({
    chargebox_id: {
        type: String,
        required: true
    },
    responses: {
        type: [eachResponseSchema],
        required: true
      },
    userServiceAndMaintenance: {
        type: Schema.Types.ObjectId,
        ref: 'Service-and-maintenance-user', 
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Pre-Delivery-Chargebox-Response', preDeliveryChargeboxSchema);

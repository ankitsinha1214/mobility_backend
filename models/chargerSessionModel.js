const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chargingSessionSchema = new Schema({
    charger: {
        type: Schema.Types.ObjectId,
        ref: 'chargerInfoSchema',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Started', 'Stopped', 'Aborted', 'Completed'],
        default: 'Started'
    },
    powerConsumed: {
        type: Number, // in kWh 
    },
    cost: {
        amount: {
            type: Number, // Amount of the cost
            required: true
        },
        currency: {
            type: String, // Currency code (e.g., USD, EUR)
            required: true
        }
    }
}, { timestamps: true });

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);

module.exports = ChargingSession;
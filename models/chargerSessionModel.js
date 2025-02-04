const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chargingSessionSchema = new Schema({
    chargerId: {
        type: String,
        // ref: 'chargerInfoSchema',
        required: true
    },
    userPhone: {
        type: String,
        required: true
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    transactionId: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Started', 'Stopped', 'Aborted', 'Completed'],
        default: 'Started'
    },
    metadata: {
        type: [Object], // Store additional payload information if needed
    },
    startMeterValue: {
        type: Number, // in kWh 
    },
    endMeterValue: {
        type: Number, // in kWh 
    },
    startReason: {
        type: String, // in kWh 
    },
    startCreatedBy: {
        type: String, // in kWh 
    },
    stopCreatedBy: {
        type: String, // in kWh 
    },
    stopReason: {
        type: String, // stop reason  
    },
    // cost: {
    //     amount: {
    //         type: Number, // Amount of the cost
    //         // required: true
    //     },
    //     currency: {
    //         type: String, // Currency code (e.g., USD, EUR)
    //         // required: true
    //     }
    // },
    reason: {
        type: String, // reason for stoppage 
    },
    // powerConsumed: {
    //     type: Number, // in kWh 
    // },
}, { timestamps: true });

// Middleware to remove transactionId when status is updated to 'Completed'
chargingSessionSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'Completed') {
        this.transactionId = undefined; // Remove transactionId
    }
    next();
});

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);

module.exports = ChargingSession;
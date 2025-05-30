const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChargerLocation = require('./chargerLocationModel');
const User = require('./userModel');

const chargingSessionSchema = new Schema({
    chargerId: {
        type: String,
        // ref: 'chargerInfoSchema',
        required: true
    },
    connectorId: {
        type: Number,
        // ref: 'chargerInfoSchema',
        // required: true
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
chargingSessionSchema.pre('save', async function (next) {
    if (this.isModified('status') && this.status === 'Completed') {
        this.transactionId = undefined; // Remove transactionId
    }
    if (this.isModified('status') && this.status === 'Stopped' && this.userPhone) {
        const user = await User.findOne({ 'phoneNumber': this.userPhone });

        if (user && user.role === 'Driver') {
            this.transactionId = undefined;
            this.status = 'Completed';
        }
    }
    // if (this.isModified('status') && this.endMeterValue !== undefined && this.startMeterValue !== undefined) {
    if (this.metadata && this.metadata?.length > 1) {
        try {
            const startEnergy = this.metadata[0]?.values?.["Energy.Active.Import.Register"];
            const endEnergy = this.metadata[this.metadata.length - 1]?.values?.["Energy.Active.Import.Register"];

            if (!startEnergy || !endEnergy) {
                console.warn("Invalid energy values in metadata.");
                return next();
            }

            const startEnergyValue = parseFloat(startEnergy.replace(' Wh', '')) || 0;
            const endEnergyValue = parseFloat(endEnergy.replace(' Wh', '')) || 0;
            // const energyConsumed = (this.endMeterValue - this.startMeterValue) / 1000;
            const energyConsumed = (endEnergyValue - startEnergyValue) / 1000;
            console.log('Energy consumed:', energyConsumed, 'kWh');

            // const chargerLocation = await ChargerLocation.findOne({ 'chargerInfo.name': this.chargerId });
            const chargerLocation = await ChargerLocation.findOne({
                chargerInfo: { $elemMatch: { name: this.chargerId } }
            });

            if (chargerLocation) {
                const charger = chargerLocation.chargerInfo.find(charger => charger.name === this.chargerId);

                if (charger) {
                    const currentEnergy = parseFloat(charger.energyConsumptions.replace(' kWh', '')) || 0;
                    charger.energyConsumptions = `${(currentEnergy + energyConsumed).toFixed(3)} kWh`;

                    await chargerLocation.save();
                }
            }
        } catch (error) {
            console.error('Error updating charger energy consumption:', error);
        }
    }
    next();
});

const ChargingSession = mongoose.model('ChargingSession', chargingSessionSchema);

module.exports = ChargingSession;
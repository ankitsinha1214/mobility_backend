// models/chargerLocationModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    }
});
const freepaidSchema = new Schema({
    parking: {
        type: Boolean,
        required: true,
    },
    charging: {
        type: Boolean,
        required: true,
    }
});

const contactSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    }
});

const facilitySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        required: true,
        trim: true,
    }
});

const chargerInfoSchema = new Schema({
    status: {
        type: String,
        // required: true,
        // trim: true,
        default: 'Inactive'
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
        trim: true,
    },
    subtype: {
        type: String,
        required: true,
        trim: true,
    },
    powerOutput: {
        type: String,
        required: true,
        trim: true,
    },
    qrcodeurl: {
        type: String,
        // required: true,
        trim: true,
        default: null
    },
    energyConsumptions: {
        type: String,
        default: '0 kWh'
        // required: true,
        // trim: true,
    },
    costPerUnit: {
        amount: {
            type: Number, // Amount of the cost
            required: true
        },
        currency: {
            type: String, // Currency code (e.g., USD, EUR)
            required: true
        }
    },
    maxCurrent: {
        type: String, // Max current in amps
    },
    maxVoltage: {
        type: String, // Max voltage in volts
    },
    lastPing: {
        type: Date, 
        default: null // Not required, defaults to null if not provided
    }
}, { timestamps: true });

const validateFacilities = function (value) {
    return Array.isArray(value) && value.length > 0;
};

const chargerLocationSchema = new Schema({
    locationName: {
        type: String,
        required: true,
        trim: true,
    },
    locationType: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    direction: {
        type: locationSchema,
        required: true,
    },
    freepaid: {
        type: freepaidSchema,
        required: true,
    },
    parkingCost: {
        amount: {
            type: Number, // Amount of the cost
            // required: true
        },
        currency: {
            type: String, // Currency code (e.g., USD, EUR)
            // required: true
        }
    },
    salesManager: {
        type: contactSchema,
        required: true,
    },
    dealer: {
        type: contactSchema,
        required: true,
    },
    facilities: {
        type: [facilitySchema],
        validate: [validateFacilities, 'At least one facility is required'],
        required: true,
    },
    status: {
        type: String,
        required: true,
        trim: true,
    },
    chargerInfo: {
        type: [chargerInfoSchema],
        validate: [validateFacilities, 'At least one Charger Information is required'],
        required: true,
    },
    workingHours: {
        type: String,
        required: true,
        trim: true,
        default: 'Everyday'
    },
    workingDays: {
        type: String,
        required: true,
        trim: true,
    },
    locationImage: {
        type: [String],
        required: true,
        validate: [validateFacilities, 'At least one image URL is required']
    },
}, { timestamps: true });

const ChargerLocation = mongoose.model('ChargerLocation', chargerLocationSchema);

module.exports = ChargerLocation;
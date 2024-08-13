const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the civil components as sub-documents
const chargersSchema = new Schema({
    charger: {
        type: [String],
        required: true,
    },
    dcBox: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const wiringSchema = new Schema({
    charger: {
        type: [String],
        required: true,
    },
    dcBox: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const paintSchema = new Schema({
    floor: {
        type: [String],
        required: true,
    },
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

// Define the main site survey schema
const chargerAndDcBoxSchema = new Schema({
    locationId: {
        type: Schema.Types.ObjectId,
        ref: 'ChargerLocation',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Service-and-maintenance-user',
        required: true,
    },
    status: {
        type: String,
        default: 'Waiting for approval'
    },
    Reason: {
        type: String,
        default: ''
    },
    chargers: {
        type: chargersSchema,
        required: true,
    },
    wiring: {
        type: wiringSchema,
        required: true,
    },
    paint: {
        type: paintSchema,
        required: true,
    }
}, { timestamps: true });

const ChargerAndDcBox = mongoose.model('ChargerAndDcBox', chargerAndDcBoxSchema);

module.exports = ChargerAndDcBox;

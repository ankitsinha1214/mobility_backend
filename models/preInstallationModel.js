const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the civil components as sub-documents
const civilSchema = new Schema({
    flooring: {
        type: String,
        required: true,
    },
    charger: {
        type: [String],
        required: true,
    },
    dcBox: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const meterRoomSchema = new Schema({
    electricSubMeter: {
        type: [String],
        required: true,
    },
    MCB: {
        type: [String],
        required: true,
    },
    RCCD: {
        type: [String],
        required: true,
    },
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const conduitSchema = new Schema({
    conduitRequirement: {
        type: String,
        required: true,
    },
    RoomToDcBox: {
        type: [String],
        required: true,
    },
    DcBoxToCharger: {
        type: [String],
        required: true,
    },
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

// Define the main site survey schema
const preInstallationSchema = new Schema({
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
    meterRoom: {
        type: meterRoomSchema,
        required: true,
    },
    conduit: {
        type: conduitSchema,
        required: true,
    },
    civil: {
        type: civilSchema,
        required: true,
    }
}, { timestamps: true });

const PreInstallation = mongoose.model('PreInstallation', preInstallationSchema);

module.exports = PreInstallation;

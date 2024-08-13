const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the visibility and civil components as sub-documents
const visibilitySchema = new Schema({
    pics: {
        type: [String],
        required: true,
    },
    videos: {
        type: String,
        required: true,
    },
    obstruction: {
        type: String,
        required: true,
    },
    obstructionPics: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const civilSchema = new Schema({
    flooring: {
        type: String,
        required: true,
    },
    pics: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const meterRoomSchema = new Schema({
    electricMeter: {
        type: [String],
        required: true,
    },
    electricBill: {
        type: [String],
        required: true,
    },
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const transformerSchema = new Schema({
    powerAvailability: {
        type: String,
        required: true,
    },
    loadEnhancement: {
        type: String,
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const cableLengthSchema = new Schema({
    distanceMeterRoomToDcBox: {
        type: String,
        required: true,
    },
    distanceDcBoxToDispenser: {
        type: String,
        required: true,
    },
    cdMeterSpAvail: {
        type: String,
        required: true,
    },
    wiringAndCablingImages: {
        type: [String],
        required: true,
    }
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

const conduitSchema = new Schema({
    conduitRequirement: {
        type: String,
        required: true,
    },
    conduitMaterial: {
        type: String,
        required: true,
    },
    distanceMeterRoomToDcBox: {
        type: String,
        required: true,
    },
    distanceDcBoxToCharger: {
        type: String,
        required: true,
    },
}, { _id: false }); // Set _id to false to avoid creating an _id field for this sub-document

// Define the main site survey schema
const siteSurveySchema = new Schema({
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
    transformer: {
        type: transformerSchema,
        required: true,
    },
    cableLength: {
        type: cableLengthSchema,
        required: true,
    },
    conduit: {
        type: conduitSchema,
        required: true,
    },
    earthingRequirement: {
        type: String,
        required: true,
    },
    visibility: {
        type: visibilitySchema,
        required: true,
    },
    civil: {
        type: civilSchema,
        required: true,
    }
}, { timestamps: true });

const SiteSurvey = mongoose.model('SiteSurvey', siteSurveySchema);

module.exports = SiteSurvey;

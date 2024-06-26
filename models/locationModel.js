// models/locationModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
    country: {
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
    }
}, { timestamps: true });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;

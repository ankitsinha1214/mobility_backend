const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'ChargerLocation',
        required: true
    },
    charging_exp: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    charging_location: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

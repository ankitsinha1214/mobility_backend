const mongoose = require('mongoose');

const predeliveryQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    // category: {
    //     type: String,
    //     required: true,
    //     trim: true
    // },
}, { timestamps: true });

module.exports = mongoose.model('predeliveryQuestion', predeliveryQuestionSchema);
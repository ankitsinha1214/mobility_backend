const mongoose = require('mongoose');

const chargerLogSchema = new mongoose.Schema({
    type: { type: String, enum: ["Charger", "User", "Others"], default: "Charger" },
    chargerId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    message: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Logs', chargerLogSchema);

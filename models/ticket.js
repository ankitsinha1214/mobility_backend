const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: "TicketCategory",
        required: true
    }, // Reference to Category
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChargingSession"
    },
    status: {
        type: String,
        enum: ["Open", "In Progress", "Resolved"],
        default: "Open"
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SandmUser"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    screenshots: {
        type: [String], // Array of image URLs
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);

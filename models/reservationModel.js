// const reservationSchema = new mongoose.Schema({
//   chargerId: { type: String, required: true },
//   connectorId: { type: Number, required: true },
//   idTag: { type: String, required: true }, // user idTag
//   reservationId: { type: Number, required: true, unique: true },
//   expiryDate: { type: Date, required: true },
//   status: { type: String, enum: ['Reserved', 'Cancelled', 'Expired', 'Completed'], default: 'Reserved' },
// }, { timestamps: true });

// module.exports = mongoose.model('Reservation', reservationSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reservationSchema = new mongoose.Schema({
    reservationId: { type: Number, required: true, unique: true },
    idTag: { type: String, required: true }, // user idTag
    //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chargerId: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ["Pending", "Reserved", "Cancelled", "Completed", "Rejected"], default: "Pending" },
    createdBy: {
        type: String, // in kWh 
    },
    // vehicleId: {
    //     type: Schema.Types.ObjectId,
    //     required: true
    // },
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);

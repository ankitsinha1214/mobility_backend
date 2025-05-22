const Reservation = require("../models/reservationModel");
const moment = require("moment-timezone");
const { getClient } = require('../ocppConnect.js');
const logger = require('../logger.js');
const User = require('../models/userModel');
const ChargingSession = require('../models/chargerSessionModel.js');

// Utility function to generate next reservationId (you can improve this logic as needed)
const generateReservationId = async () => {
    const last = await Reservation.findOne().sort({ reservationId: -1 });
    return last ? last.reservationId + 1 : 1;
};

const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

// Create a new reservation
exports.createReservation = async (req, res) => {
    try {
        const { idTag, chargerId,
            // vehicleId, 
            // startTime,
            endTime, timezone, connectorId } = req.body;

        if (!idTag || !chargerId || !endTime || !timezone || !connectorId) {
            return res.status(400).json({ status: false, message: "All fields including timezone are required." });
        }
        const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
        if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
            logger.error(`WebSocket not established for charger ID ${chargerId}`)
            return res.json({ status: false, message: `Charger ID ${chargerId} is not connected to the Server.` });
        }

        let createdBy = '';

        if (req.phn) {
            if (req.phn !== idTag) {
                return res.status(401).json({ success: false, message: "You are using some other user Idtag." });
            }
            createdBy = 'Consumer User';
        }
        if (req.user) {
            if (req.user !== 'Admin' && req.user !== 'Manager') {
                return res.status(401).json({ success: false, message: "You are Not a Valid User." });
            }
            console.log('req -> ', req)
            console.log(req.username)
            createdBy = req.user + ' - ' + req.username;
        }

        // Convert start and end time from provided timezone to UTC
        const startUTC = new Date(); // Now
        //   const startUTC = moment.tz(startTime, timezone).utc().toDate();
        const endUTC = moment.tz(endTime, timezone).utc().toDate();

        if (startUTC >= endUTC) {
            return res.status(400).json({ status: false, message: "End time must be after start time." });
        }

        const conflict = await Reservation.findOne({
            chargerId,
            status: "Reserved",
            $or: [
                { startTime: { $lt: endUTC }, endTime: { $gt: startUTC } }
            ]
        });

        if (conflict) {
            return res.status(409).json({ status: false, message: "Charger already reserved during this time." });
        }

        const reservationId = await generateReservationId();



        // **User Validation**
        const user = await User.findOne({ phoneNumber: idTag, status: 'active' });
        if (!user) {
            return res.json({
                status: false,
                message: 'User not found or not active'
            });
        }
        // Validate Vehicle
        // const userVehicle = user.user_vehicle?.find(vehicle => vehicle._id.toString() === vehicleId);
        // if (!userVehicle) {
        //     return res.json({ status: false, message: 'Vehicle not associated with the user' });
        // }

        const activeUserSession = await ChargingSession.findOne({
            userPhone: idTag,
            status: { $in: ['Started', 'Stopped'] }
        });
        if (activeUserSession) {
            return res.json({
                status: false,
                message: 'Previous transaction still in progress for this User.'
            });
        }
        const messageId = generateUniqueId(); // Generate a unique ID for the message
        const reserveNowPayload = {
            connectorId: connectorId,
            expiryDate: endUTC,
            // expiryDate: new Date(endUTC).toISOString(),
            idTag: idTag,
            reservationId: reservationId
        };
        const ocppMessage = [
            2, // MessageTypeId for Call
            messageId,
            "ReserveNow",
            reserveNowPayload,
        ];

        client.send(JSON.stringify(ocppMessage));

        client.once('message', async (response) => {
            try {
                const parsedResponse = JSON.parse(response);
                const messageType = parsedResponse[0]; // 3 means CALLRESULT
                const incomingMessageId = parsedResponse[1];

                // Ensure response matches the request message ID
                if (messageType !== 3 || incomingMessageId !== messageId) {
                    console.log('Skipping unrelated WebSocket message.');
                    return;
                }

                const data = parsedResponse[2];
                const status = data?.status;

                if (status === 'Rejected') {
                    return res.json({
                        status: false,
                        message: 'Reservation was rejected by the charger.',
                    });
                } else if (status === 'Faulted' || status === "Occupied" || status === "Unavailable") {
                    const reservation = await Reservation.create({
                        status: "Rejected",
                        reservationId,
                        idTag,
                        chargerId,
                        connectorId,
                        createdBy,
                        // vehicleId,
                        startTime: startUTC,
                        endTime: endUTC
                    });
                    await reservation.save();

                    return res.json({
                        status: false,
                        message: `Some Issue while Reservation getting ${status} status for ${chargerId}`,
                        // messageId: messageId,
                        reservationId: reservationId,
                    });
                } else if (status === 'Accepted') {
                    const reservation = await Reservation.create({
                        status: "Reserved",
                        reservationId,
                        idTag,
                        chargerId,
                        connectorId,
                        createdBy,
                        // vehicleId,
                        startTime: startUTC,
                        endTime: endUTC
                    });
                    await reservation.save();

                    return res.json({
                        status: true,
                        message: `Reservation was Created for charger ID ${chargerId}`,
                        messageId: messageId,
                        reservationId: reservationId,
                    });
                } else {
                    return res.json({
                        status: false,
                        message: 'Unknown status by charger. Please try again.',
                        reservationId: reservationId,
                    });
                }
            } catch (err) {
                console.error('WebSocket handling error:', err);
            }
        });

        //   return res.json({
        //     status: true,
        //     message: "Reservation created successfully.",
        //     // data: reservation
        //   });
    } catch (error) {
        console.error("Reservation creation error:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Get all reservations
exports.getAllReservations = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        if (reservations.length === 0) {
            return res.json({ success: false, message: 'No Reservations Found.' });
        }
        return res.json({ status: true, data: reservations });
    } catch (error) {
        console.error("Get reservations error:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

// Cancel a reservation
exports.cancelReservation = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
        if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
            logger.error(`WebSocket not established for charger ID ${chargerId}`)
            return res.json({ status: false, message: `Charger ID ${chargerId} is not connected to the Server.` });
        }

        let cancelledBy = '';

        if (req.phn) {
            if (req.phn !== idTag) {
                return res.status(401).json({ success: false, message: "You are using some other user Idtag." });
            }
            cancelledBy = 'Consumer User';
        }
        if (req.user) {
            if (req.user !== 'Admin' && req.user !== 'Manager') {
                return res.status(401).json({ success: false, message: "You are Not a Valid User." });
            }
            console.log('req -> ', req)
            console.log(req.username)
            cancelledBy = req.user + ' - ' + req.username;
        }
         // **Reservation Validation**
         const reservation = await Reservation.findOne({ reservationId: reservationId, status: 'Reserved' });
         if (!reservation) {
             return res.json({
                 status: false,
                 message: 'reservation not found'
             });
         }

        const messageId = generateUniqueId(); // Generate a unique ID for the message
        const reserveCancelPayload = {
            reservationId: reservationId,
        };
        const ocppMessage = [
            2, // MessageTypeId for Call
            messageId,
            "ReserveNow",
            reserveCancelPayload,
        ];

        client.send(JSON.stringify(ocppMessage));

        client.once('message', async (response) => {
            try {
                const parsedResponse = JSON.parse(response);
                const messageType = parsedResponse[0]; // 3 means CALLRESULT
                const incomingMessageId = parsedResponse[1];

                // Ensure response matches the request message ID
                if (messageType !== 3 || incomingMessageId !== messageId) {
                    console.log('Skipping unrelated WebSocket message.');
                    return;
                }

                const data = parsedResponse[2];
                const status = data?.status;

                if (status === 'Rejected') {
                    return res.json({
                        status: false,
                        message: 'Cancellation of Reservation was rejected by the charger.',
                    });
                } else if (status === 'Accepted') {
                     reservation.status = "Cancelled";
                     reservation.cancelledBy = cancelledBy;

                    await reservation.save();

                    return res.json({
                        status: true,
                        message: `Reservation was cancelled for charger ID ${chargerId}`,
                        messageId: messageId,
                        reservationId: reservationId,
                    });
                } else {
                    return res.json({
                        status: false,
                        message: 'Unknown status by charger. Please try again.',
                        reservationId: reservationId,
                    });
                }
            } catch (err) {
                console.error('WebSocket handling error:', err);
            }
        });
    } catch (error) {
        console.error("Cancel reservation error:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};

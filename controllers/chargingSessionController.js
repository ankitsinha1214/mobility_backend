// module.exports = { startChargingSession, stopChargingSession, startStopChargingSession };
const { getClient } = require('../ocppConnect.js');
const ChargingSession = require('../models/chargerSessionModel.js');
const ChargerLocation = require('../models/chargerLocationModel');
const moment = require('moment-timezone');
const User = require('../models/userModel');

// Helper function to calculate energy consumed
const calculateEnergyConsumed = (startMeterValue, endMeterValue) => {
    return (endMeterValue - startMeterValue); // energy consumed in kWh
};
// const startStopChargingSession = async (req, res) => {
//     const { action, chargerId, payload } = req.body;

//     if (!action || !['start', 'stop'].includes(action)) {
//         return res.status(400).json({ status: false, message: 'Invalid action specified' });
//     }

//     const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
//     if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
//         return res.status(500).json({ status: false, message: `WebSocket connection not established for charger ID ${chargerId}` });
//     }

//     const messageId = generateUniqueId(); // Generate a unique ID for the message

//     try {
//         const activeSession = await ChargingSession.findOne({ chargerId, status: 'Started' });
//         if (action === 'start' && activeSession) {
//             return res.json({
//                 status: false,
//                 message: 'A previous transaction is still in progress. Please wait for it to complete before starting a new one.',
//             });
//         }
//         if (action === 'stop' && !activeSession) {
//             return res.json({
//                 status: false,
//                 message: 'No Active Session Found to stop the Charger.',
//             });
//         }
//         // return res.json({ status: true, message: `${action} transaction initiated for charger ID ${chargerId}`, messageId });
//         if (action === 'start') {
//             const ocppMessage = [
//                 2, // MessageTypeId for Call
//                 messageId,
//                 action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
//                 payload || { idTag: chargerId },
//                 // { chargingProfile : chargerId }
//             ];
//             client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
//             client.on('message', async (response) => {
//                 const parsedResponse = JSON.parse(response);
//                 console.log(parsedResponse);
//                 const status = parsedResponse[2]?.status;
//                 console.log(status);

//                 if (status === 'Rejected') {
//                     return res.json({
//                         status: false,
//                         message: 'Transaction start was rejected by the charger.',
//                     });
//                 }
//                 else if (status === 'Accepted') {
//                     // Save the new charging session to the database
//                     const sessionData = {
//                         chargerId,
//                         userPhone: payload?.idTag,
//                         transactionId: Math.floor(100000 + Math.random() * 900000), // Use the generated unique ID as the transaction ID
//                         // metadata: payload || {}, // Store additional data from the payload
//                         startMeterValue: payload?.startMeterValue || 0, // Optional meter value
//                     };

//                     const newSession = new ChargingSession(sessionData);
//                     await newSession.save(); // Save to the database

//                     return res.json({
//                         status: true,
//                         message: `Charging session started for charger ID ${chargerId}`,
//                         messageId: messageId,
//                         sessionId: newSession._id, // Return the saved session
//                     });
//                 }
//                 else{
//                     return res.json({
//                         status: false,
//                         message: 'Unknown status by charger. Please try again.',
//                     });
//                 }
//             });
//             // Save the new charging session to the database
//             // const sessionData = {
//             //     chargerId,
//             //     userPhone: payload?.idTag,
//             //     transactionId: Math.floor(100000 + Math.random() * 900000), // Use the generated unique ID as the transaction ID
//             //     // metadata: payload || {}, // Store additional data from the payload
//             //     startMeterValue: payload?.startMeterValue || 0, // Optional meter value
//             // };

//             // const newSession = new ChargingSession(sessionData);
//             // await newSession.save(); // Save to the database

//             // return res.json({
//             //     status: true,
//             //     message: `Charging session started for charger ID ${chargerId}`,
//             //     messageId: messageId,
//             //     sessionId: newSession._id, // Return the saved session
//             // });
//         } else if (action === 'stop') {
//             // Find and update the charging session
//             const sessionId = payload?.sessionId;
//             if (!sessionId) {
//                 return res.json({
//                     status: false,
//                     message: 'SessionId is needed!!',
//                 });
//             }
//             // Find the session using sessionId and retrieve its transactionId
//             const sessionDetails = await ChargingSession.findOne({ _id: sessionId });
//             if (!sessionDetails) {
//                 return res.json({
//                     status: false,
//                     message: 'No active charging session found for the given transaction.',
//                 });
//             }
//             if (!sessionDetails?.transactionId) {
//                 return res.json({
//                     status: false,
//                     message: 'TransactionId is not properly assigned. Please Contact your Provider.',
//                 });
//             }
//             const ocppMessage1 = [
//                 2, // MessageTypeId for Call
//                 messageId,
//                 action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
//                 { transactionId: sessionDetails?.transactionId },
//             ];

//             client.send(JSON.stringify(ocppMessage1)); // Send the message to the specific charger
//             // const session = await ChargingSession.findOneAndUpdate(
//             //     { chargerId, transactionId: payload.transactionId, status: 'Started' },
//             //     {
//             //         status: 'Stopped',
//             //         endTime: new Date(),
//             //         // endMeterValue: payload?.endMeterValue || 0,
//             //     },
//             //     { new: true }
//             // );

//             // if (!session) {
//             //     return res.status(404).json({
//             //         status: false,
//             //         message: 'No active charging session found for the given transaction.',
//             //     });
//             // }

//             return res.json({
//                 status: true,
//                 message: `Charging session stopped for charger ID ${chargerId}`,
//                 sessionDetails,
//             });
//         }
//     } catch (error) {
//         console.error('Error sending WebSocket message:', error);
//         return res.status(500).json({ status: false, message: 'Error sending start transaction!' });
//     }
// };

const startStopChargingSession = async (req, res) => {
    const { action, chargerId, payload, vehicleId } = req.body;
    // console.log(req.phoneNumber === payload.idTag);
    // console.log((req.phoneNumber && req.phoneNumber !== payload.idTag));
    // if ((req.phoneNumber && req.phoneNumber !== payload.idTag) || (req.user && req.user !== 'Admin' && req.user !== 'Manager')) {
    //     return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    // }
    // console.log('entered');
    // return;
    if (!action || !['start', 'stop'].includes(action)) {
        return res.status(400).json({ status: false, message: 'Invalid action specified' });
    }

    const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
    if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
        return res.json({ status: false, message: `WebSocket not established for charger ID ${chargerId}` });
    }

    const messageId = generateUniqueId(); // Generate a unique ID for the message

    try {
        // Fetch the current charger status
        const chargerLocation = await ChargerLocation.findOne({ 'chargerInfo.name': chargerId }).select('chargerInfo');
        const chargerInfo = chargerLocation?.chargerInfo.find(charger => charger.name === chargerId);

        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger not found.' });
        }
        // Check if the status is valid for the action
        if (action === 'start' && chargerInfo.status !== 'Preparing') {
            return res.json({
                status: false,
                message: `Cannot start, charger not in Preparing`,
                // message: `Cannot start charging. Charger status is ${chargerInfo.status}, but it must be 'Preparing'.`,
            });
        }

        if (action === 'stop' && chargerInfo.status !== 'Charging') {
            return res.json({
                status: false,
                message: 'Cannot stop, charger not Charging',
                // message: `Cannot stop charging. Charger status is ${chargerInfo.status}, but it must be 'Charging'.`,
            });
        }

        const activeSession = await ChargingSession.findOne({ chargerId, status: 'Started' });

        // Validate start/stop actions
        if (action === 'start' && activeSession) {
            return res.json({
                status: false,
                message: 'Previous transaction still in progress',
                // message: 'A previous transaction is still in progress. Please wait for it to complete before starting a new one.',
            });
        }
        if (action === 'stop' && !activeSession) {
            return res.json({
                status: false,
                message: 'No Active Session to stop.',
            });
        }
        if (action === 'start') {
            // **User Validation**
            const user = await User.findOne({ phoneNumber: payload?.idTag, status: 'active' });
            if (!user) {
                return res.json({
                    status: false,
                    message: 'User not found or not active'
                });
            }
             // Validate Vehicle
             const userVehicle = user.user_vehicle?.find(vehicle => vehicle._id.toString() === vehicleId);
             if (!userVehicle) {
                 return res.json({ status: false, message: 'Vehicle not associated with the user' });
             }

            // **Check for Active Session for User**
            const activeUserSession = await ChargingSession.findOne({
                userPhone: payload?.idTag,
                status: 'Started'
            });
            if (activeUserSession) {
                return res.json({
                    status: false,
                    message: 'Previous transaction still in progress for this User.'
                });
            }
            // Send WebSocket message
            const ocppMessage = [
                2, // MessageTypeId for Call
                messageId,
                action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
                action === 'start' ? payload || { idTag: chargerId } : { transactionId: sessionDetails?.transactionId },
            ];
            client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
        }
        else if (action === 'stop') {
            const sessionId = payload?.sessionId;
            if (!sessionId) {
                return res.json({
                    status: false,
                    message: 'SessionId is needed!!',
                });
            }
            // Find the session using sessionId and retrieve its transactionId
            const sessionDetails = await ChargingSession.findOne({ _id: sessionId });
            if (!sessionDetails) {
                return res.json({
                    status: false,
                    message: 'No active session found',
                });
            }
            if (!sessionDetails?.transactionId) {
                return res.json({
                    status: false,
                    message: 'Invalid TransactionId',
                });
            }
            const ocppMessage1 = [
                2, // MessageTypeId for Call
                messageId,
                action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
                { transactionId: sessionDetails?.transactionId },
            ];
            client.send(JSON.stringify(ocppMessage1)); // Send the message to the specific charger
        }

        // Handle WebSocket response
        client.once('message', async (response) => {
            const parsedResponse = JSON.parse(response);
            const status = parsedResponse[2]?.status;

            if (status === 'Rejected') {
                return res.json({
                    status: false,
                    message: 'Transaction was rejected by the charger.',
                });
            } else if (status === 'Accepted' && action === 'start') {
                // Save the new charging session to the database
                const sessionData = {
                    chargerId,
                    vehicleId,
                    userPhone: payload?.idTag,
                    transactionId: Math.floor(10000000 + Math.random() * 90000000), // Random transaction ID
                    startMeterValue: payload?.startMeterValue || 0,
                };

                const newSession = new ChargingSession(sessionData);
                await newSession.save();

                return res.json({
                    status: true,
                    message: `Charging session started for charger ID ${chargerId}`,
                    messageId: messageId,
                    sessionId: newSession._id,
                });
            } else if (status === 'Accepted' && action === 'stop') {
                // Update the existing session
                const sessionId = payload?.sessionId;
                const sessionDetails = await ChargingSession.findOneAndUpdate(
                    { _id: sessionId },
                    { status: 'Stopped', endTime: new Date() },
                    { new: true }
                );

                return res.json({
                    status: true,
                    message: `Charging session stopped for charger ID ${chargerId}`,
                    sessionDetails,
                });
            } else {
                return res.json({
                    status: false,
                    message: 'Unknown status by charger. Please try again.',
                });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ status: false, message: 'Error processing the transaction' });
    }
};


const resetChargingSession = async (req, res) => {
    if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }

    const { chargerId, type } = req.body;
    // Validate inputs
    if (!chargerId || !type || !['Soft', 'Hard'].includes(type)) {
        return res.status(400).json({
            status: false,
            message: 'Invalid request. Ensure "chargerId" and "type" (Soft/Hard) are provided.',
        });
    }

    const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
    if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
        return res.status(500).json({
            status: false,
            message: `WebSocket connection not established for charger ID ${chargerId}`,
        });
    }

    const messageId = generateUniqueId(); // Generate a unique ID for the message
    const ocppMessage = [
        2, // MessageTypeId for Call
        messageId,
        'Reset',
        {
            type, // Reset type (Soft/Hard)
        },
    ];

    try {
        client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
        return res.json({
            status: true,
            message: `Reset command (${type}) initiated for charger ID ${chargerId}`,
            messageId,
        });
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return res.status(500).json({
            status: false,
            message: 'Error sending reset command!',
        });
    }
};

const getSessionData = async (req, res) => {
    const { sessionId, timezone } = req.body;

    // Validate input
    if (!sessionId) {
        return res.json({
            status: false,
            message: 'Session ID is required',
        });
    }
    if (!timezone) {
        return res.json({
            status: false,
            message: 'TimeZone is required',
        });
    }

    try {
        // Find the session by sessionId
        const session = await ChargingSession.findById(sessionId);
        if (!session) {
            return res.json({
                status: false,
                message: 'Session not found',
            });
        }
        const chargerName = session?.chargerId;
        if (!chargerName) {
            return res.json({ status: false, message: 'chargerId is not found in the session.' });
        }
        const chargerLocation = await ChargerLocation.findOne({
            'chargerInfo.name': chargerName
        }).select('locationName locationType freepaid chargerInfo');
        // }).select('locationName locationType state city address direction chargerInfo');

        if (!chargerLocation) {
            return res.json({ status: false, message: 'Charger not found in the location.' });
        }

        // Find the specific chargerInfo within the location
        const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerName);

        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger details not found in the location' });
        }

        if (!chargerInfo.costPerUnit) {
            return res.json({ status: false, message: 'Cost Per Unit is not assigned to this Charger' });
        }
        const costPerUnit = chargerInfo.costPerUnit;
        // Check if metadata exists and has values
        const metadata = session.metadata || [];
        if (metadata.length < 1) {
            return res.json({
                status: false,
                message: 'Insufficient metadata to calculate meter value changes',
            });
        }
        // Get the 0th index and the highest index
        const firstEntry = metadata[0]?.values;
        const lastEntry = metadata[metadata.length - 1]?.values;
        // Extract meter values and units
        const firstMeterValueParts = firstEntry['Energy.Active.Import.Register']?.split(' ') || [];

        // Extract meter values
        const firstMeterValue = parseFloat(firstEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);
        const lastMeterValue = parseFloat(lastEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);

        // Extract the unit (assuming both entries have the same unit)
        const unit = firstMeterValueParts[1] || 'Wh';

        // Calculate the difference
        const meterValueDifference = `${(lastMeterValue - firstMeterValue).toFixed(4)} ${unit}`;
        // const meterValueDifference = lastMeterValue - firstMeterValue;
        // Response
        const status = session?.status;
        const reason = session?.reason;
        // const startTime = session?.startTime;
        // Format startTime as per timezone
        const startTimeIST = moment(session?.startTime).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
        return res.json({
            status: true,
            message: 'Meter value retrieved successfully',
            data: {
                firstMeterValue,
                lastMeterValue,
                meterValueDifference,
                costPerUnit,
                status,
                reason,
                startTimeIST
            },
        });
    } catch (error) {
        console.error('Error fetching session data:', error);
        res.status(500).json({
            status: false,
            message: 'Internal Server Error',
            error: error?.message,
        });
    }
};

// View Session Receipt API
const getSessionReceipt = async (req, res) => {
    try {
        const { sessionId } = req.body;

        // Fetch the charging session data by sessionId
        const session = await ChargingSession.findById(sessionId);
        if (!session) {
            return res.json({ status: false, message: 'Session not found' });
        }

        // Fetch charger location details based on chargerId
        const chargerLocation = await ChargerLocation.findOne({ "chargerInfo.name": session.chargerId });
        if (!chargerLocation) {
            return res.json({ status: false, message: 'Charger location not found' });
        }

        // Find the charger info corresponding to the chargerId in the session
        const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === session.chargerId);
        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger info not found' });
        }
        const metadata = session.metadata || [];

        // Get the 0th index and the highest index
        const firstEntry = metadata[0].values;
        const lastEntry = metadata[metadata.length - 1]?.values;

        // Extract meter values
        const firstMeterValue = parseFloat(firstEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);
        const lastMeterValue = parseFloat(lastEntry['Energy.Active.Import.Register']?.split(' ')[0] || 0);
        // Get the last metadata object from the array

        // Calculate energy consumed
        const energyConsumed = lastMeterValue && firstMeterValue
            ? (lastMeterValue - firstMeterValue).toFixed(4)
            : 0;
        // const energyConsumed = calculateEnergyConsumed(session.metadata[0]?.values.Energy.Active.Import.Register, session.metadata[0]?.values.Energy.Active.Import.Register);

        // Calculate the session cost
        const costPerUnit = chargerInfo.costPerUnit.amount;
        const totalEnergyCost = energyConsumed * costPerUnit;

        // Dummy values for now
        const parkingTariff = chargerLocation.freepaid.parking ? 'FREE' : chargerLocation.parkingCost.currency + ' ' + chargerLocation.parkingCost.amount;
        const platformFee = "FREE";
        // var convenienceFee = "FREE";
        let convenienceFee = "FREE";
        let convenienceFeeValue = 0;
        if (totalEnergyCost < 1) {
            convenienceFee = "₹ 1";
            convenienceFeeValue = parseInt(convenienceFee.replace(/[^\d]/g, '')) || 0;
        }
        // else{
        //     platformFee = "FREE";
        // }
        const idleFee = "FREE"; // Example; can be based on idle time

        // Calculate tax (GST 10%)
        const gst = 0.10;
        const gstAmount = totalEnergyCost * gst;

        // Calculate grand total
        let grandTotal = totalEnergyCost + gstAmount + convenienceFeeValue;
        // var grandTotal = totalEnergyCost + gstAmount;
        // if (totalEnergyCost < 1) {
        //     grandTotal += 1;
        // }

        // Format the charger duration in HH:MM:SS
        const durationInMs = session.endTime - session.startTime;
        const durationInSeconds = Math.floor(durationInMs / 1000);
        const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
        const formattedDuration = `${hours}:${minutes}:${seconds}`;

        // Format the response
        const receipt = [
            {
                "charger-details": [
                    { "Charger location": chargerLocation.locationName },
                    { "Charger ID": session.chargerId },
                    { "Charger duration": formattedDuration },  // Convert to minutes
                    { "Energy consumed": `${energyConsumed} Wh` },
                    { "Cost per Unit": `${costPerUnit} ${chargerInfo.costPerUnit.currency}` },
                    // { "Idle rate": "FREE" }  // Dummy value
                ]
            },
            {
                "session details": [
                    { "Total energy cost": `₹ ${totalEnergyCost.toFixed(2)}` },
                    { "Parking tariff": parkingTariff },
                    { "Platform fee": platformFee },
                    { "Convenience fee": convenienceFee },
                    { "Idle fee": idleFee }
                ]
            },
            {
                "tax details": [
                    { "GST 10%": `₹ ${gstAmount.toFixed(2)}` }
                ]
            },
            {
                "Grand Total": `₹ ${grandTotal.toFixed(2)}`
            }
        ];

        res.json({ status: true, data: receipt, message: 'Receipt Details Generated Successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal Server error' });
    }
}

const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

module.exports = { startStopChargingSession, resetChargingSession, getSessionData, getSessionReceipt };
// const { getWebSocketConnection } = require('../ocppConnect.js'); // Import WebSocket connection
// const { v4: uuidv4 } = require("uuid");

// const startChargingSession = async (req, res) => {
//     try {
//         const { chargerId, userPhoneNumber } = req.body;

//         // Generate a unique transaction ID
//         const transactionId = generateTransactionId();
//         const wsConnection = getWebSocketConnection();
//         // Send StartTransaction message to OCPP server
//         wsConnection.send(JSON.stringify({
//             action: 'StartTransaction',
//             payload: {
//                 transactionId,
//                 chargerId,
//                 userPhoneNumber,
//                 timestamp: new Date().toISOString()
//             }
//         }));

//         res.status(200).json({ message: 'Transaction started', transactionId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const startStopChargingSession = async (req, res) => {
//     const { action, chargerId, payload } = req.body;

//     if (!action || !['start', 'stop'].includes(action)) {
//         return res.status(400).json({ status: false, message: 'Invalid action specified' });
//     }
//     const wsConnection = getWebSocketConnection();
//     // if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
//     if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
//         return res.status(500).json({ status: false, message: 'WebSocket connection not established' });
//     }

//     const messageId = uuidv4(); // Generate a unique ID for the message
//     const ocppMessage = [
//         2, // MessageTypeId for Call
//         messageId,
//         action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
//         // action === 'start' ? 'StartTransaction' : 'StopTransaction',
//         payload || { idTag: chargerId }
//     ];

//     try {
//         const response = await wsConnection.send(JSON.stringify(ocppMessage));
//         // console.log("response",response);
//         // if (response.status === 'Accepted') {
//         //   console.log('Remote start worked!');
//         //   return res.json({ status: true, message: `${action} transaction initiated`, messageId });
//         // } else {
//         //   console.log('Remote start rejected.');
//         //   return res.json({ status: false, message: `${action} transaction failed`, messageId });
//         // }
//         return res.json({ status: true, message: `${action} transaction initiated`, messageId });
//     } catch (error) {
//         console.error('Error sending WebSocket message:', error);
//         return res.status(500).json({ status: false, message: 'Error sending start transaction!!!' });
//     }
// };

// const stopChargingSession = async (req, res) => {
//     try {
//         const { transactionId, reason } = req.body;

//         // Send StopTransaction message to OCPP server
//         wsConnection.send(JSON.stringify({
//             action: 'StopTransaction',
//             payload: {
//                 transactionId,
//                 timestamp: new Date().toISOString(),
//                 reason
//             }
//         }));

//         res.status(200).json({ message: 'Transaction stopped', transactionId });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const generateTransactionId = () => {
//     return 'tx-' + Math.random().toString(36).substring(2, 15); // Example transaction ID generator
// };

// module.exports = { startChargingSession, stopChargingSession, startStopChargingSession };
const { getClient } = require('../ocppConnect.js');
const ChargingSession = require('../models/chargerSessionModel.js');

const startStopChargingSession = async (req, res) => {
    const { action, chargerId, payload } = req.body;

    if (!action || !['start', 'stop'].includes(action)) {
        return res.status(400).json({ status: false, message: 'Invalid action specified' });
    }

    const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
    if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
        return res.status(500).json({ status: false, message: `WebSocket connection not established for charger ID ${chargerId}` });
    }

    const messageId = generateUniqueId(); // Generate a unique ID for the message
    
    try {
        // return res.json({ status: true, message: `${action} transaction initiated for charger ID ${chargerId}`, messageId });
        if (action === 'start') {
            const ocppMessage = [
                2, // MessageTypeId for Call
                messageId,
                action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
                payload || { idTag: chargerId },
                // { chargingProfile : chargerId }
            ];
            client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
            // Save the new charging session to the database
            const sessionData = {
                chargerId,
                userPhone: payload?.idTag,
                transactionId: Math.floor(100000 + Math.random() * 900000), // Use the generated unique ID as the transaction ID
                // metadata: payload || {}, // Store additional data from the payload
                startMeterValue: payload?.startMeterValue || 0, // Optional meter value
            };

            const newSession = new ChargingSession(sessionData);
            await newSession.save(); // Save to the database

            return res.json({
                status: true,
                message: `Charging session started for charger ID ${chargerId}`,
                messageId: messageId,
                sessionId: newSession._id, // Return the saved session
            });
        } else if (action === 'stop') {
            // Find and update the charging session
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
                    message: 'No active charging session found for the given transaction.',
                });
            }
            if (!sessionDetails?.transactionId) {
                return res.json({
                    status: false,
                    message: 'TransactionId is not properly assigned. Please Contact your Provider.',
                });
            }
            const ocppMessage1 = [
                2, // MessageTypeId for Call
                messageId,
                action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
                { transactionId: sessionDetails?.transactionId },
            ];
            
            client.send(JSON.stringify(ocppMessage1)); // Send the message to the specific charger
            // const session = await ChargingSession.findOneAndUpdate(
            //     { chargerId, transactionId: payload.transactionId, status: 'Started' },
            //     {
            //         status: 'Stopped',
            //         endTime: new Date(),
            //         // endMeterValue: payload?.endMeterValue || 0,
            //     },
            //     { new: true }
            // );

            // if (!session) {
            //     return res.status(404).json({
            //         status: false,
            //         message: 'No active charging session found for the given transaction.',
            //     });
            // }

            return res.json({
                status: true,
                message: `Charging session stopped for charger ID ${chargerId}`,
                sessionDetails,
            });
        }
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return res.status(500).json({ status: false, message: 'Error sending start transaction!' });
    }
};

const resetChargingSession = async (req, res) => {
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

const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

module.exports = { startStopChargingSession, resetChargingSession };
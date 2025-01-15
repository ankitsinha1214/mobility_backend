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
    const ocppMessage = [
        2, // MessageTypeId for Call
        messageId,
        action === 'start' ? 'RemoteStartTransaction' : 'RemoteStopTransaction',
        payload || { idTag: chargerId }
    ];

    try {
        client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
        return res.json({ status: true, message: `${action} transaction initiated for charger ID ${chargerId}`, messageId });
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return res.status(500).json({ status: false, message: 'Error sending start transaction!' });
    }
};

const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

module.exports = { startStopChargingSession };

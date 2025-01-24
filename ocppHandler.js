// const ChargingSession = require('./models/chargerSessionModel');
// const ChargerLocation = require('./models/chargerLocationModel');
// const User = require('./models/userModel'); // Import User model

// const handleOcppMessage = async (message) => {
//     try {
//         const { action, payload } = message;

//         switch (action) {
//             case 'BootNotification':
//                 console.log('Boot Notification:', payload);
//                 // Handle boot notification from the charger
//                 break;

//             case 'StartTransaction':
//                 await handleStartTransaction(payload);
//                 break;

//             case 'StopTransaction':
//                 await handleStopTransaction(payload);
//                 break;

//             default:
//                 console.log('Unhandled action:', action);
//                 break;
//         }
//     } catch (error) {
//         console.error('Error handling OCPP message:', error);
//     }
// };

// const handleStartTransaction = async (payload) => {
//     const { transactionId, chargerId, userPhoneNumber, timestamp } = payload;

//     // Find charger location by chargerId
//     const location = await ChargerLocation.findOne({ 'chargerInfo._id': chargerId });
//     if (!location) {
//         console.error('Charger not found:', chargerId);
//         return;
//     }

//     // Find charger info by chargerId
//     const chargerInfo = location.chargerInfo.id(chargerId); 
//     if (!chargerInfo) {
//         console.error('Charger info not found for chargerId:', chargerId);
//         return;
//     }

//     // Find user by phoneNumber
//     const user = await User.findOne({ phoneNumber: userPhoneNumber });
//     if (!user) {
//         console.error('User not found with phone number:', userPhoneNumber);
//         return;
//     }

//     const session = new ChargingSession({
//         charger: chargerId,
//         user: user._id, // Use the user ID
//         transactionId,
//         startTime: new Date(timestamp),
//         // Include chargerInfo details if needed for session details
//         // Example: session.chargerName = chargerInfo.name;
//     });

//     await session.save();
//     console.log('Charging session started:', session);
// };

// const handleStopTransaction = async (payload) => {
//     const { transactionId, timestamp, reason } = payload;

//     const session = await ChargingSession.findOne({ transactionId });
//     if (!session) {
//         console.error('Session not found:', transactionId);
//         return;
//     }

//     session.endTime = new Date(timestamp);
//     session.status = 'Stopped';
//     session.reason = reason;

//     // You might want to calculate additional data using chargerInfo
//     // Example: session.powerConsumed = calculatePower(session);
//     // session.cost = calculateCost(session);

//     await session.save();
//     console.log('Charging session stopped:', session);
// };

// module.exports = { handleOcppMessage };

const logger = require('./logger');
const { v4: uuidv4 } = require("uuid");
const ChargingSession = require('./models/chargerSessionModel.js');

function handleOcppMessage(ws, message, chargerId) {
    const [messageType, messageId, action, payload] = message;

    if (messageType === 2) { // Call message
        switch (action) {
            case "Reboot":
                handleReboot(ws, messageId, payload);
                break;
            case "StartTransaction":
                handleStartTransaction(ws, messageId, payload, chargerId);
                break;
            case "Authorize":
                handleAuthorize(ws, messageId, payload);
                break;
            case "StatusNotification":
                handleStatus(ws, messageId, payload);
                break;
            case "Reset":
                handleReset(ws, messageId, payload);
                break;
            case "StopTransaction":
                handleStopTransaction(ws, messageId, payload, chargerId);
                break;
            case "BootNotification":
                console.log('Boot Notification:', payload);
                handleBootNotification(ws, messageId, payload);
                // handleStartTransaction(ws, messageId, payload);
                break;
            case "Heartbeat": // Handle Heartbeat action
                console.log('Heartbeat received:', payload);
                sendHeartbeatAcknowledgment(ws, messageId);
                break;
            case "MeterValues":
                console.log("Meter Values:", payload);
                handleMeterValues(ws, messageId, payload, chargerId);
                break;
            default:
                console.log("Unknown action:", action);
                sendError(ws, messageId, "NotImplemented", "Unknown action");
        }
    } else {
        console.log("Unsupported message type:", messageType);
    }
}

function sendHeartbeat() {
    if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        const messageId = generateUniqueId();
        const heartbeatMessage = [
            2, // MessageTypeId for Call
            messageId,
            "Heartbeat", // OCPP action for heartbeat
            {}
        ];

        wsConnection.send(JSON.stringify(heartbeatMessage));
        console.log("Sent Heartbeat message:", heartbeatMessage);
    } else {
        console.log("WebSocket connection not open. Unable to send heartbeat.");
    }
}


function handleReboot(ws, messageId, payload) {
    console.log("Reboot payload:", payload);

    // Response indicating the reboot command is accepted
    const response = [3, messageId, { status: "Accepted" }];
    ws.send(JSON.stringify(response));
    console.log("Sent Reboot response:", response);

    // Simulate a reboot action (you can add actual reboot logic if needed)
    setTimeout(() => {
        console.log("Simulating charger reboot...");
    }, 3000);
}

function handleReset(ws, messageId, payload) {
    console.log("Reset payload:", payload);

    // Response indicating the reboot command is accepted
    const response = [3, messageId, { status: "Accepted" }];
    ws.send(JSON.stringify(response));
    console.log("Sent Reset response:", response);

    // Simulate a reboot action (you can add actual reboot logic if needed)
    setTimeout(() => {
        console.log("Simulating charger reseting...");
    }, 3000);
}

function handleBootNotification(ws, messageId, payload) {
    const response = [
        3, // MessageTypeId for CallResult
        messageId,
        {
            status: 'Accepted',
            currentTime: new Date().toISOString(),
            interval: 300 // Heartbeat interval in seconds
        }
    ];

    ws.send(JSON.stringify(response));
    console.log('Sent BootNotification Response');
}

async function handleStartTransaction(ws, messageId, payload, chargerId) {
    console.log("StartTransaction payload:", payload);
    // Save transaction to the database
    const session = await ChargingSession.findOneAndUpdate(
        { chargerId, status: 'Started' },
        { $set: { startMeterValue: payload.meterStart } }, // Update the latest meter value
        { new: true }
    );
    const transactionId = session?.transactionId; // Generate a unique transaction ID
    const response = [
        3, // CallResult message type
        messageId, // Echo the message ID
        {
            transactionId,
            idTagInfo: {
                status: "Accepted", // Indicating the transaction has started
                expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // Example expiry
            },
        },
    ];

    try {
        // await Transaction.create(transactionData);
        console.log("Session updated:", session._id);
    } catch (error) {
        console.error("Error saving transaction:", error);
    }
    ws.send(JSON.stringify(response));
    console.log("StartTransaction response sent:", response);
}

function sendHeartbeatAcknowledgment(ws, messageId) {
    const response = [
        3, // CallResult message type
        messageId, // Corresponding message ID
        { currentTime: new Date().toISOString() } // Payload
    ];
    ws.send(JSON.stringify(response));
    console.log("Heartbeat acknowledgment sent:", response);
}

// Function to handle MeterValues action
async function handleMeterValues(ws, messageId, payload, chargerId) {
    console.log("Received MeterValues:", payload);

    // Process the meter values
    // Example: Save to the database or log the meter readings
    // Here, assume payload contains information like connectorId, meterValue, and timestamp
    const { connectorId, transactionId, meterValue } = payload;
    const { timestamp, sampledValue } = meterValue[0];

    console.log(`MeterValues Details:
      Connector ID: ${connectorId}
      Transaction ID: ${transactionId}
      Meter Value: ${sampledValue}
      Timestamp: ${timestamp}`);

    // Respond to the client to acknowledge MeterValues
    const response = [
        3, // CallResult
        messageId,
        {} // Empty object for CallResult response payload
    ];
    ws.send(JSON.stringify(response));

    const session = await ChargingSession.findOne({ "transactionId": String(transactionId) });
    console.log('meter value session',session);
    // const session = await ChargingSession.findOne({ chargerId, status: 'Started' });
    // const session = await ChargingSession.findOneAndUpdate(
    //     { chargerId, status: 'Started' },
    //     { $set: { metadata: sampledValue } }, // Update the latest meter value
    //     { new: true }
    // );
    if (!session) {
        console.log(`No active session found for charger ID ${chargerId}`);
        return;
    }
    const metadata = session?.metadata || [];
    // var m_data = {};
    const m_data = {};
    sampledValue.forEach((element) => {
        const key = element?.measurand || "Unknown"; // Use measurand as the key
        const valueWithUnit = `${element?.value} ${element?.unit || ''}`.trim(); // Combine value and unit
        m_data[key] = valueWithUnit; // Store in m_data
    });
    // Add the object (with all key-value pairs) to metadata
    metadata.push({
        timestamp, // Add the timestamp for this batch of sampled values
        values: m_data // Add the processed key-value pairs
    });

    // Update the session with the new metadata
    session.metadata = metadata;
    try {
        await session.save();
        console.log(`Meter value updated for session ${session._id}: ${meterValue}`);
    } catch (error) {
        // console.error('Error updating metadata:', error.message);
        console.error('Failed to update metadata:', error);
    }
}

function handleAuthorize(ws, messageId, payload) {
    console.log("Authorize payload:", payload);

    // const messageId = generateUniqueId(); // Generate a unique ID for the message
    const ocppMessage = [
        2, // MessageTypeId for Call
        messageId,
        "Authorize",
        { "idTag": "deadbeef" }
    ];

    wsConnection.send(JSON.stringify(ocppMessage));

    // const response = [3, messageId, { transactionId: 123 }];
    // ws.send(JSON.stringify(response));
    // console.log("Sent StartTransaction response:", response);
}

function handleStatus(ws, messageId, payload) {
    console.log("Received StatusNotification:", payload);

    // Example payload structure for StatusNotification
    // {
    //   connectorId: 1,
    //   errorCode: "NoError",
    //   status: "Available",
    //   timestamp: "2025-01-13T12:34:56Z",
    // }

    const { connectorId, errorCode, status, timestamp } = payload;
    // if (status !== 'Preparing') {
    //   return;
    // }

    // Log status notification details
    logger.info(`StatusNotification - Connector: ${connectorId}, Status: ${status}, ErrorCode: ${errorCode}, Timestamp: ${timestamp}`);

    // Respond back to acknowledge receipt
    // const response = [{}]; // Response messageType: 3 (CallResult)
    const response = [3, messageId, {}]; // Response messageType: 3 (CallResult)
    ws.send(JSON.stringify(response), (err) => {
        if (err) {
            console.error("Error sending StatusNotification response:", err);
        } else {
            console.log("StatusNotification response sent successfully.");
        }
    });

    // You can perform additional operations, such as updating a database or triggering further actions based on status
}

async function handleStopTransaction(ws, messageId, payload, chargerId) {
    console.log("StopTransaction payload:", payload);
    // Save transaction to the database
    // Retrieve the session dynamically based on transactionId

    const transactionId = payload?.transactionId;
    // const session = await ChargingSession.findOne({ transactionId, status: 'Started' });

    const session = await ChargingSession.findOne({ "transactionId": String(transactionId) });
    // const session = await ChargingSession.findOne({ chargerId, status: 'Started' });

    //  const session = await ChargingSession.findOneAndUpdate(
    //     { chargerId, status: 'Started' },
    //     { $set: { endMeterValue: payload.meterStop } }, // Update the latest meter value
    //     { new: true }
    // );
    // Update session details

    if(session){
        session.endTime = (payload?.timestamp);
        session.status = "Stopped";
        session.reason = payload?.reason;
        session.endMeterValue = payload?.meterStop;
    }
    else{
        console.log(`Session stop value not updated for charger ID ${chargerId}`);
    }

    // const response = [3, messageId, {}];
    // ws.send(JSON.stringify(response));
    // console.log("Sent StopTransaction response:", response);
    try {
        const response = [3, messageId, {}];
        ws.send(JSON.stringify(response));
        // Save updated session to the database
        // await session.save();
        // Save the session after 5 seconds
        // setTimeout(async () => {
            try {
                if(session){
                await session.save();
                console.log(`Session saved successfully for session ID: ${session._id}`);
                }
            } catch (error) {
                console.error('Failed to save session after 5 seconds:', error);
            }
        // }, 5000); // 5 seconds delay

        console.log("Sent StopTransaction response:", response);
    } catch (error) {
        console.error('Failed to update session:', error);
        const errorResponse = [3, messageId, { error: 'Failed to update session' }];
        ws.send(JSON.stringify(errorResponse));
    }
}

function sendError(ws, messageId, errorCode, errorDescription) {
    const response = [4, messageId, errorCode, errorDescription];
    ws.send(JSON.stringify(response));
    console.log("Sent error response:", response);
}

module.exports = { handleOcppMessage };
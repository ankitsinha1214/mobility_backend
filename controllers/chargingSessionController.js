// module.exports = { startChargingSession, stopChargingSession, startStopChargingSession };
const { getClient } = require('../ocppConnect.js');
const ChargingSession = require('../models/chargerSessionModel.js');
const ChargerLocation = require('../models/chargerLocationModel');
const moment = require('moment-timezone');
const User = require('../models/userModel');
const logger = require('../logger.js');
const { sendChangeConfiguration, sendChangeChargingProfile } = require('../utils/ocppUtil.js')

// Helper function to calculate energy consumed
const calculateEnergyConsumed = (startMeterValue, endMeterValue) => {
    return (endMeterValue - startMeterValue); // energy consumed in kWh
};
const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
        case "INR":
            return "₹";  // Indian Rupee symbol
        case "USD":
            return "$";  // Dollar symbol
        case "AED":
            return "د.إ ";  // AED symbol
        default:
            return "";  // Return an empty string if the currency is not INR or USD
    }
};
function convertTimestampToDate(timestamp) {
    const options = { timeZone: 'Asia/Kolkata' };
    const date = new Date(timestamp).toLocaleDateString('en-IN', options);

    return date;
}

function convertTimestampToTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}
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
    const { action, chargerId, payload, vehicleId, sessionReason } = req.body;
    // console.log(req.phoneNumber === payload.idTag);
    // console.log((req.phoneNumber && req.phoneNumber !== payload.idTag));
    // if ((req.phoneNumber && req.phoneNumber !== payload.idTag) || (req.user && req.user !== 'Admin' && req.user !== 'Manager')) {
    //     return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    // }
    // console.log('entered');
    // return;
    try {
        console.log('role -- ', req?.consumerUserRole);
        // return;
        if (!action || !['start', 'stop'].includes(action)) {
            return res.status(400).json({ status: false, message: 'Invalid action specified' });
        }

        const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
        if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
            logger.error(`WebSocket not established for charger ID ${chargerId}`)
            return res.json({ status: false, message: `Charger ID ${chargerId} is not connected to the Server.` });
            // return res.json({ status: false, message: `WebSocket not established for charger ID ${chargerId}` });
        }
        let createdBy = '';

        if (req.phn) {
            // Remove special characters from both values
            // const cleanPhn = req.phn.replace(/\D/g, "");
            // const cleanIdTag = payload.idTag.replace(/\D/g, "");
            // console.log(cleanPhn)
            // console.log(cleanIdTag)
            // console.log(cleanPhn === cleanIdTag)
            // if (cleanPhn !== cleanIdTag) {
            if (action === 'start') {
                if (req.phn !== payload?.idTag) {
                    return res.status(401).json({ success: false, message: "You are using some other user Idtag." });
                }
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

        const messageId = generateUniqueId(); // Generate a unique ID for the message

        // Fetch the current charger status
        const chargerLocation = await ChargerLocation.findOne({ 'chargerInfo.name': chargerId }).select('chargerInfo');
        const chargerInfo = chargerLocation?.chargerInfo.find(charger => charger.name === chargerId);

        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger not found.' });
        }
        // Check if the status is valid for the action
        if (action === 'start' && (chargerInfo.status !== 'Preparing' && chargerInfo.status !== 'Reserved')) {
            return res.json({
                status: false,
                message: `Oops! The charger isn’t connected to your Vehicle. Try again!`,
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
            // let activeUserSession;
            // if(req?.consumerUserRole === 'Driver'){
            //     activeUserSession = await ChargingSession.findOne({
            //         userPhone: payload?.idTag,
            //         // status: 'Started'
            //         status: { $in: ['Started'] }
            //     });
            // }
            // else{
            const activeUserSession = await ChargingSession.findOne({
                userPhone: payload?.idTag,
                // status: 'Started'
                status: { $in: ['Started', 'Stopped'] }
            });
            // }
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
            if (req.phn) {
                if (req.phn !== sessionDetails?.userPhone) {
                    return res.status(401).json({ success: false, message: "You are using some other user Idtag." });
                }
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
        // client.once('message', async (response) => {
        //     console.log('response - ', response);
        //     const parsedResponse = JSON.parse(response);
        //     console.log('parsedResponse - ', parsedResponse);
        //     const status = parsedResponse[2]?.status;

        //     console.log('status - ',status);
        //     console.log('action - ',action);
        //     if (status === 'Rejected') {
        //         return res.json({
        //             status: false,
        //             message: 'Transaction was rejected by the charger.',
        //         });
        //     } else if (status === 'Accepted' && action === 'start') {
        //         // Save the new charging session to the database
        //         const sessionData = {
        //             chargerId,
        //             vehicleId,
        //             userPhone: payload?.idTag,
        //             startCreatedBy: createdBy,
        //             startReason: sessionReason,
        //             transactionId: Math.floor(10000000 + Math.random() * 90000000), // Random transaction ID
        //             startMeterValue: payload?.startMeterValue || 0,
        //         };

        //         const newSession = new ChargingSession(sessionData);
        //         await newSession.save();

        //         return res.json({
        //             status: true,
        //             message: `Charging session started for charger ID ${chargerId}`,
        //             messageId: messageId,
        //             sessionId: newSession._id,
        //         });
        //     } else if (status === 'Accepted' && action === 'stop') {
        //         // Update the existing session
        //         const sessionId = payload?.sessionId;
        //         const sessionDetails = await ChargingSession.findOneAndUpdate(
        //             { _id: sessionId },
        //             { status: 'Stopped', endTime: new Date(), stopCreatedBy: createdBy, stopReason: sessionReason || 'User Terminated', },
        //             { new: true }
        //         );

        //         return res.json({
        //             status: true,
        //             message: `Charging session stopped for charger ID ${chargerId}`,
        //             sessionDetails,
        //         });
        //     } else {
        //         return res.json({
        //             status: false,
        //             message: 'Unknown status by charger. Please try again.',
        //         });
        //     }
        // });
        // Handle WebSocket response
        client.on('message', async (response) => {
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
                        message: 'Transaction was rejected by the charger.',
                    });
                } else if (status === 'Accepted' && action === 'start') {
                    const sessionData = {
                        chargerId,
                        vehicleId,
                        userPhone: payload?.idTag,
                        startCreatedBy: createdBy,
                        startReason: sessionReason,
                        transactionId: Math.floor(10000000 + Math.random() * 90000000),
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
                    const sessionId = payload?.sessionId;
                    // const sessionDetails = await ChargingSession.findOneAndUpdate(
                    //     { _id: sessionId },
                    //     {
                    //         // status: 'Stopped',
                    //         status: req?.consumerUserRole != 'Driver' ? 'Stopped' : 'Completed',
                    //         endTime: new Date(),
                    //         stopCreatedBy: createdBy,
                    //         stopReason: sessionReason || 'User Terminated',
                    //     },
                    //     { new: true }
                    // );
                    const sessionDetails = await ChargingSession.findById(sessionId);
                    if (!sessionDetails) {
                        return res.json({ status: false, message: 'Session not found' });
                    }

                    // Apply the updates manually
                    sessionDetails.status = req?.consumerUserRole != 'Driver' ? 'Stopped' : 'Completed';
                    sessionDetails.endTime = new Date();
                    sessionDetails.stopCreatedBy = createdBy;
                    sessionDetails.stopReason = sessionReason || 'User Terminated';

                    // Save to trigger pre('save') hook
                    await sessionDetails.save();

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
            } catch (err) {
                console.error('WebSocket handling error:', err);
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


const changeConfigurationSession = async (req, res) => {
    if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }

    const { chargerId, key, value } = req.body;
    // Validate inputs
    if (!chargerId || !key || !value || !['MeterValueSampleInterval'].includes(key)) {
        return res.json({
            status: false,
            message: 'Invalid request. Ensure "chargerId", "key" and "value" (MeterValueSampleInterval) are provided.',
        });
    }

    try {
        const result = await sendChangeConfiguration(chargerId, key, value);

        if (result.status === 'Accepted') {
            return res.json({
                status: true,
                message: `ChangeConfiguration accepted for charger ${chargerId}`,
                messageId: result.messageId
            });
        } else if (result.status === 'Rejected') {
            return res.json({
                status: false,
                message: 'ChangeConfiguration was rejected by charger.',
            });
        } else if (result.status === 'RebootRequired') {
            return res.json({
                status: false,
                message: `Reboot required to apply ChangeConfiguration.`,
            });
        } else {
            return res.json({
                status: false,
                message: 'Unknown response from charger.',
            });
        }
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return res.status(500).json({
            status: false,
            message: 'Error sending meter value configuration command!',
        });
    }
};

const changeChargingProfile = async (req, res) => {
    if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }

    const { chargerId, connectorId } = req.body;
    // Validate inputs
    if (!chargerId || !connectorId ) {
        return res.json({
            status: false,
            message: 'Invalid request. Ensure "chargerId", "connectorId" and "csChargingProfile" are provided.',
        });
    }

    try {
        const csChargingProfile = {
            chargingProfileId: 1,
            stackLevel: 0,
            chargingProfilePurpose: "TxProfile", // constraint addition
            chargingProfileKind: "Absolute",
            recurrencyKind: "Daily",
            validFrom: new Date().toISOString(),
            chargingSchedule: {
                duration: 3600, // in seconds
                startSchedule: new Date().toISOString(),
                chargingRateUnit: "W", // or "A"
                chargingSchedulePeriod: [
                    {
                        startPeriod: 0,
                        limit: 9900, // e.g. 9000W (i.e., 90% of 11kW max charger)
                        // limit: 9000, // e.g. 9000W (i.e., 90% of 10kW max charger)
                        // limit: 9000, // e.g. 9000W (i.e., 90% of 10kW max charger)
                        // limit: 144000, // e.g. 144000W (i.e., 90% of 160kW max charger)
                        numberPhases: 3
                    }
                ],
                // minChargingRate: 500 // Optional
            }
        };
        
        const result = await sendChangeChargingProfile(chargerId, connectorId, csChargingProfile);

        if (result.status === 'Accepted') {
            return res.json({
                status: true,
                message: `Change Charging Profile accepted for charger ${chargerId}`,
                messageId: result.messageId
            });
        } else if (result.status === 'Rejected') {
            return res.json({
                status: false,
                message: 'Change Charging Profile was rejected by charger.',
            });
        } else if (result.status === 'NotSupported') {
            return res.json({
                status: false,
                message: `Change Charging Profile Not Supported by charger.`,
            });
        } else {
            return res.json({
                status: false,
                message: 'Unknown response from charger.',
            });
        }
    } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return res.status(500).json({
            status: false,
            message: 'Error sending meter value configuration command!',
        });
    }
};
// const changeConfigurationSession = async (req, res) => {
//     if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//         return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//     }

//     const { chargerId, key, value } = req.body;
//     // Validate inputs
//     if (!chargerId || !key || !value || !['MeterValueSampleInterval'].includes(key)) {
//         return res.json({
//             status: false,
//             message: 'Invalid request. Ensure "chargerId", "key" and "value" (MeterValueSampleInterval) are provided.',
//         });
//     }

//     const client = getClient(chargerId); // Get the WebSocket connection for the specific charger
//     if (!client || client.readyState !== 1) { // 1 means WebSocket.OPEN
//         return res.status(500).json({
//             status: false,
//             message: `WebSocket connection not established for charger ID ${chargerId}`,
//         });
//     }

//     const messageId = generateUniqueId(); // Generate a unique ID for the message
//     const ocppMessage = [
//         2, // MessageTypeId for Call
//         messageId,
//         'ChangeConfiguration',
//         {
//             key, // Reset type (Soft/Hard)
//             value, // Reset type (Soft/Hard)
//         },
//     ];

//     try {
//         client.send(JSON.stringify(ocppMessage)); // Send the message to the specific charger
//         // Handle WebSocket response
//         client.once('message', async (response) => {
//             const parsedResponse = JSON.parse(response);
//             const status = parsedResponse[2]?.status;

//             if (status === 'Rejected') {
//                 return res.json({
//                     status: false,
//                     message: 'Meter Value configuration command was rejected by the charger.',
//                 });
//             } else if (status === 'Accepted') {
//                 return res.json({
//                     status: true,
//                     message: `Meter Value configuration command (ChangeConfiguration) initiated for charger ID ${chargerId}`,
//                     messageId: messageId,
//                 });
//             } else if (status === 'RebootRequired') {
//                 // Reboot logic here we have to write

//                 return res.json({
//                     status: false,
//                     message: `Reboot Required for changing configuration for charger ID ${chargerId}`
//                 });
//             } else {
//                 return res.json({
//                     status: false,
//                     message: 'Unknown status by charger. Please try again.',
//                 });
//             }
//         });
//     } catch (error) {
//         console.error('Error sending WebSocket message:', error);
//         return res.status(500).json({
//             status: false,
//             message: 'Error sending meter value configuration command!',
//         });
//     }
// };

const getSessionData = async (req, res) => {
    const { userPhone, timezone } = req.body;
    // const { sessionId, timezone } = req.body;

    // Validate input
    // if (!sessionId) {
    //     return res.json({
    //         status: false,
    //         message: 'Session ID is required',
    //     });
    // }
    if (!userPhone) {
        return res.json({
            status: false,
            message: 'Phone Number is required',
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
        let session;
        if (req?.consumerUserRole !== "Driver") {
            session = await ChargingSession.findOne({ userPhone, status: { $in: ["Started", "Stopped"] } });
        }
        else {
            session = await ChargingSession.findOne({
                userPhone,
                status: { $in: ["Started", "Stopped"] },
            }).sort({ createdAt: -1 }); // or .sort({ startTime: -1 });
        }

        // const session = await ChargingSession.findById(sessionId);
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
        // if(status !== "Stopped"){
        if (status !== "Started") {
            // if(req?.consumerUserRole !== "Driver"){
            return res.json({
                status: false,
                message: session?.stopReason || reason || 'Unable to find charger information.',
            });
            // }
        }
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

        // Format the charger duration in HH:MM:SS
        const durationInMs = session.endTime - session.startTime;
        const durationInHours = durationInMs / (1000 * 60 * 60);
        const durationInSeconds = Math.floor(durationInMs / 1000);
        const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
        const formattedDuration = `${hours}:${minutes}:${seconds}`;

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

        // Calculate dynamic parking cost
        let parkingCostAmount = 0;
        if (!chargerLocation.freepaid.parking) {
            parkingCostAmount = chargerLocation.parkingCost.amount * durationInHours;
        }

        // Dummy values for now
        const parkingTariff = chargerLocation.freepaid.parking ? 'FREE' : getCurrencySymbol(chargerLocation.parkingCost.currency) + ' ' + parkingCostAmount.toFixed(2);
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

        // Calculate tax (GST 05%)
        const subgst = 0.05;
        const subgstAmount = totalEnergyCost * subgst;

        const subtotal = totalEnergyCost + subgstAmount;

        // Calculate tax (GST 18%)
        const gst = 0.18;
        const gstAmount = totalEnergyCost * gst;
        // // Calculate tax (GST 10%)
        // const gst = 0.10;
        // const gstAmount = totalEnergyCost * gst;

        // Calculate grand total
        let grandTotal = subtotal + gstAmount + convenienceFeeValue;
        if (!chargerLocation.freepaid.parking) {
            grandTotal += parkingCostAmount;
            // grandTotal += chargerLocation.parkingCost.amount;
        }
        // var grandTotal = totalEnergyCost + gstAmount;
        // if (totalEnergyCost < 1) {
        //     grandTotal += 1;
        // }


        // Format the response
        const receipt = [
            {
                "header": [
                    { "type": chargerInfo.type },
                    { "powerOutput": chargerInfo.powerOutput },
                    { "Charger location": chargerLocation.locationName + ', ' + chargerLocation.city },
                    { "createdAt": convertTimestampToDate(session.createdAt) },
                    { "Charger ID": session.chargerId },
                    // { "Charger duration": formattedDuration },  // Convert to minutes
                    // { "Energy consumed": `${energyConsumed} Wh` },
                    // { "Cost per Unit": `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}` },
                    // { "Idle rate": "FREE" }  // Dummy value
                ]
            },
            {
                "session-details": [
                    { "Start time": convertTimestampToTime(session.startTime) },
                    { "End time": convertTimestampToTime(session.endTime) },
                    { "Charging duration": formattedDuration },  // Convert to minutes
                    // { "Energy consumed": `${energyConsumed} Wh` },
                    // { "Cost per Unit": `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}` },
                    // { "Idle rate": "FREE" }  // Dummy value
                ]
            },
            {
                "energy-details": [
                    ["Energy", "Units", "Rate", "Amount"],
                    ["Energy Charge", `${(energyConsumed / 1000).toFixed(3)} kWh`, `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}`, `₹ ${totalEnergyCost.toFixed(2)}`],
                    // ["Energy Charge", `${energyConsumed} Wh`, `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}`, `₹ ${totalEnergyCost.toFixed(2)}`],
                    // { "Energy": "Energy Charge" },
                    // { "Units": convertTimestampToTime(session.endTime) },
                    // { "Rate": formattedDuration },  // Convert to minutes
                    // { "Amount": formattedDuration },  // Convert to minutes
                    // { "Energy consumed": `${energyConsumed} Wh` },
                    // { "Cost per Unit": `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}` },
                    // { "Idle rate": "FREE" }  // Dummy value
                ]
            },
            // {
            //     "charger-details": [
            //         { "Charger location": chargerLocation.locationName },
            //         { "Charger ID": session.chargerId },
            //         { "Charger duration": formattedDuration },  // Convert to minutes
            //         { "Energy consumed": `${energyConsumed} Wh` },
            //         { "Cost per Unit": `${getCurrencySymbol(chargerInfo.costPerUnit.currency)} ${costPerUnit}` },
            //         // { "Idle rate": "FREE" }  // Dummy value
            //     ]
            // },
            {
                "subtotal details": [
                    { "GST @ 5% ": `₹ ${subgstAmount.toFixed(2)}` },
                    { "Subtotal": `₹ ${subtotal.toFixed(2)}` }
                ]
            },
            {
                "session details": [
                    // { "Total energy cost": `₹ ${totalEnergyCost.toFixed(2)}` },
                    { "Platform Fee": platformFee },
                    { "Parking Fee": parkingTariff },
                    { "Convenience Fee": convenienceFee },
                    { "Idle Fee": idleFee }
                ]
            },
            {
                "tax details": [
                    { "GST @ 18% ": `₹ ${gstAmount.toFixed(2)}` }
                ]
            },
            // {
            //     "tax details": [
            //         { "GST 10%": `₹ ${gstAmount.toFixed(2)}` }
            //     ]
            // },
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

const getAllSessions = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const sessions = await ChargingSession.find();
        if (sessions.length === 0) {
            return res.json({ success: false, message: 'No Session Found.' });
        }
        // Map through sessions and fetch location info based on chargerId
        const enrichedSessions = await Promise.all(sessions.map(async (session) => {
            const chargerLocation = await ChargerLocation.findOne({
                'chargerInfo.name': session.chargerId  // Match chargerId within chargerInfo array
            }).select('locationName address city state status');
            // direction 
            // Calculate Charging Duration using metadata timestamps
            const metadata = session.metadata || [];
            const startTime = metadata[0]?.timestamp || session.startTime;
            const endTime = metadata[metadata.length - 1]?.timestamp || session.endTime;
            const durationInMs = new Date(endTime) - new Date(startTime);
            const durationInSeconds = Math.floor(durationInMs / 1000);
            const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
            const chargingDuration = `${hours}:${minutes}:${seconds}`;
            return {
                ...session.toObject(),
                chargerLocation: chargerLocation || null,  // Attach location info, or null if not found
                duration: chargingDuration || null,  // Attach location info, or null if not found
            };
        }));
        return res.json({ success: true, data: enrichedSessions, message: 'All Sessions Retrieved Successfully!!!' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve locations', error: error.message });
    }
};

const getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const session = await ChargingSession.findById(sessionId);
        if (!session) {
            return res.json({ success: false, message: 'Session Not Found.' });
        }

        // Fetch location info based on chargerId
        const chargerLocation = await ChargerLocation.findOne({
            'chargerInfo.name': session.chargerId
        }).select('locationName address city state status');

        // Calculate Charging Duration using metadata timestamps
        const metadata = session.metadata || [];
        const startTime = metadata[0]?.timestamp || session.startTime;
        const endTime = metadata[metadata.length - 1]?.timestamp || session.endTime;

        const durationInMs = new Date(endTime) - new Date(startTime);
        const durationInSeconds = Math.floor(durationInMs / 1000);
        const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
        const chargingDuration = `${hours}:${minutes}:${seconds}`;

        // Construct response
        const enrichedSession = {
            ...session.toObject(),
            chargerLocation: chargerLocation || null,
            duration: chargingDuration || null,
        };

        return res.json({ success: true, data: enrichedSession, message: 'Session Retrieved Successfully!!!' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve session', error: error.message });
    }
};

const getSessionByChargerId = async (req, res) => {
    try {
        const { chargerId } = req.body;

        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const sessions = await ChargingSession.find({ chargerId });

        if (!sessions || sessions.length === 0) {
            return res.json({ success: false, message: 'No Sessions Found for this Charger.' });
        }

        // Fetch location info based on chargerId
        const chargerLocation = await ChargerLocation.findOne({
            'chargerInfo.name': chargerId
        }).select('locationName address city state status');

        let totalEnergyDelivered = 0; // kWh
        let totalActiveTime = 0; // milliseconds
        const uptimeTracking = new Set(); // To track charger availability timestamps

        const enrichedSessions = sessions.map(session => {
            const metadata = session.metadata || [];
            if (metadata.length < 2) return null; // Skip incomplete metadata

            // Extract start and end times
            const startTime = new Date(metadata[0].timestamp);
            const endTime = new Date(metadata[metadata.length - 1].timestamp);
            totalActiveTime += endTime - startTime;

            // Calculate duration
            const durationInSeconds = Math.floor((endTime - startTime) / 1000);
            const hours = Math.floor(durationInSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((durationInSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (durationInSeconds % 60).toString().padStart(2, '0');
            const chargingDuration = `${hours}:${minutes}:${seconds}`;

            // Calculate total energy delivered (Convert Wh to kWh)
            const startEnergy = parseFloat(metadata[0].values["Energy.Active.Import.Register"]) / 1000;
            const endEnergy = parseFloat(metadata[metadata.length - 1].values["Energy.Active.Import.Register"]) / 1000;
            const sessionEnergyDelivered = Math.max(0, endEnergy - startEnergy); // kWh
            totalEnergyDelivered += sessionEnergyDelivered;

            // Track uptime using timestamps (unique hour-wise tracking)
            metadata.forEach(m => {
                const hourKey = new Date(m.timestamp).toISOString().slice(0, 13); // Format: YYYY-MM-DDTHH
                uptimeTracking.add(hourKey);
            });

            return {
                ...session.toObject(),
                chargerLocation: chargerLocation || null,
                duration: chargingDuration || null,
                energyDelivered: sessionEnergyDelivered.toFixed(2) + " kWh"
            };
        }).filter(Boolean);

        // KMS Powered Calculation (Assuming 6 km/kWh efficiency)
        const averageEfficiency = 6; // km per kWh
        const kmsPowered = totalEnergyDelivered * averageEfficiency;

        // CO2 Saved Calculation (Assuming 0.82 kg/kWh for India)
        const CO2EmissionFactor = 0.82; // kg per kWh
        const CO2Saved = totalEnergyDelivered * CO2EmissionFactor;

        // Uptime Rate Calculation
        const totalPossibleHours = 24 * 30; // Assuming 30 days in a month
        const uptimeRate = (uptimeTracking.size / totalPossibleHours) * 100;

        return res.json({
            success: true,
            data: {
                sessions: enrichedSessions,
                chargerLocation,
                kmsPowered: kmsPowered.toFixed(2) + " km",
                CO2Saved: CO2Saved.toFixed(2) + " kg",
                uptimeRate: uptimeRate.toFixed(2) + " %"
            },
            message: 'Sessions Retrieved Successfully!!!'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve sessions',
            error: error.message
        });
    }
};


const generateUniqueId = () => {
    return 'uuid-' + Math.random().toString(36).substring(2, 15); // Example UUID generator
};

module.exports = { startStopChargingSession, resetChargingSession, changeConfigurationSession, getSessionData, getSessionReceipt, getAllSessions, getSessionById, getSessionByChargerId, sendChangeConfiguration,
    changeChargingProfile
};
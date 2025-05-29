// const { WebSocketServer } = require('ws');
// const { handleOcppMessage } = require('./ocppHandler');

// // Store all active WebSocket connections in a Map
// const clients = new Map(); // Key: unique client ID, Value: WebSocket instance
// let wsConnection;

// const wss = new WebSocketServer({ port: 8006 });
// wss.on("connection", function connection(ws) {
//     const clientId = generateClientId(); // Generate a unique ID for the client
//     clients.set(clientId, ws); // Add the client to the Map
//     console.log(`Client Connected: ${clientId}`);
//     // console.log("Client Connected");
//     wsConnection = ws;

//     ws.on('message', (message) => {
//         console.log('Received from server: %s', message);
//         try {
//             const parsedMessage = JSON.parse(message);
//             console.log("Message in Array", parsedMessage);
//             handleOcppMessage(ws, parsedMessage);
//         } catch (error) {
//             console.error("Invalid message format:", error);
//         }
//     });
//     ws.on('open', () => {
//         console.log('Connected to OCPP server');
//         ws.send('Hello Server!');
//     });
//     ws.on('close', () => {
//         console.log('Disconnected from the server');
//     });
//     ws.on('error', (error) => {
//         console.error('WebSocket error:', error);
//     });
//     // ws.on('message', (message) => {
//     //   console.log('Received from server:', message);
//     // });
// })

// // Helper function to generate unique client IDs
// const generateClientId = () => {
//     return 'client-' + Math.random().toString(36).substring(2, 15);
// };

// // Expose functions to access and manage WebSocket clients
// const getClient = (clientId) => clients.get(clientId); // Retrieve a specific client by ID
// const getAllClients = () => Array.from(clients.entries()); // Get all clients as [clientId, ws] pairs
// const broadcastMessage = (message) => {
//     clients.forEach((ws, clientId) => {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(message);
//         }
//     });
// };
// // Expose a getter function to access the current WebSocket connection
// const getWebSocketConnection = () => wsConnection;

// module.exports = { getWebSocketConnection };

const fs = require('fs');
const https = require('https');
const http = require('http');
const { WebSocketServer } = require('ws');
const { handleOcppMessage } = require('./ocppHandler');
const ChargerLocation = require('./models/chargerLocationModel');
const { createChargerLog } = require('./controllers/logController');
const isProduction = process.env.NODE_ENV === 'production';


let server;
if (isProduction) {
    // Load SSL certificates
    const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${process.env.FILE_URL}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`/etc/letsencrypt/live/${process.env.FILE_URL}/fullchain.pem`, 'utf8');
    const credentials = {
        key: privateKey,
        cert: certificate
    };
    // Create an HTTPS server
    server = https.createServer(credentials);
    console.log('Running WebSocket server in HTTPS mode (Production)');
} else {
    server = http.createServer();
    console.log('Running WebSocket server in HTTP mode (Local)');
}

// const wss = new WebSocketServer({ server });

// Store all active WebSocket connections in a Map
const clients = new Map(); // Key: chargerId, Value: WebSocket instance

const wss = new WebSocketServer({ noServer: true }); // Use noServer to manually handle connections

// HTTP server to listen for WebSocket upgrade requests
// const server = require('http').createServer();
// const server = https.createServer(options);


server.on('upgrade', async (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    const urlParts = pathname.split('/'); // Split the path
    
    console.log('url->',urlParts);
    console.log('url->',urlParts[2]);
    // Expecting /socket/<chargerId>
    // if (urlParts.length !== 3 || urlParts[1] !== 'socket') {
    if (urlParts.length < 3 || urlParts[1] !== 'socket') {
        // if (urlParts.length !== 3 || urlParts[1] !== 'socket') {
        console.error('Invalid WebSocket URL path. Expected format: /socket/<chargerId>');
        socket.destroy(); // Invalid path -> destroy connection
        return;
    }

    const chargerId = urlParts[2]; // Extract the chargerId
    console.log(`Received WebSocket upgrade request for chargerId: ${chargerId}`);
    // const urlParts = request.url.split('/'); // Split the URL path
    // const chargerId = urlParts[urlParts.length - 1]; // Extract the charger ID (last part of the URL)

    if (!chargerId) {
        console.error('Invalid WebSocket URL. Charger ID is missing.');
        socket.destroy(); // Reject the connection if the charger ID is missing
        return;
    }
    try {
        // Fetch charger location details based on chargerId
        const chargerLocation = await ChargerLocation.findOne({ "chargerInfo.name": chargerId });
        if (!chargerLocation) {
            console.warn(`Location is not registered for Charger ID ${chargerId}. Informing client.`);

            // Create a WebSocket connection to send the message
            wss.handleUpgrade(request, socket, head, (ws) => {
                const errorMessage = [
                    4, // MessageTypeId for CallError
                    "1221", // Message ID
                    "NotImplemented", // OCPP error code (e.g., NotImplemented, InternalError, ProtocolError, etc.)
                    `Charger ID ${chargerId} is not registered.`, // Human-readable description
                    "Please register your charger in CMS before connecting." // Additional error details (optional)
                ];
                ws.send(JSON.stringify(errorMessage));
                // ws.send(JSON.stringify({
                //     error: true,
                //     message: "Charger location not found.",
                //     details: `Charger ID ${chargerId} is not registered.`,
                //     solution: "Please register your charger in CMS before connecting."
                // }));
                ws.close(); // Close the connection after sending the message
            });
            return;
        }

        // Find the charger info corresponding to the chargerId in the session
        const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerId);
        if (!chargerInfo) {
            console.warn(`Charger ID ${chargerId} is not registered. Informing client.`);

            // Create a WebSocket connection to send the message
            wss.handleUpgrade(request, socket, head, (ws) => {
                const errorMessage = [
                    4, // MessageTypeId for CallError
                    "1331", // Message ID
                    "NotImplemented", // OCPP error code (e.g., NotImplemented, InternalError, ProtocolError, etc.)
                    `Charger ID ${chargerId} is not available in the registered location.`, // Human-readable description
                    "Please verify the charger ID or register it in CMS." // Additional error details (optional)
                ];
                ws.send(JSON.stringify(errorMessage));
                ws.close(); // Close the connection after sending the message
            });
            return;
        }
        // Check if charger exists in the database
        // const chargerExists = await ChargerLocation.exists({ chargerId });

        wss.handleUpgrade(request, socket, head, (ws) => {
            ws.chargerId = chargerId; // Attach the charger ID to the WebSocket object
            wss.emit('connection', ws, request);
        });
    } catch (error) {
        console.error('Database error while checking charger existence:', error);
        socket.destroy();
    }
});

wss.on("connection", (ws) => {
    const chargerId = ws.chargerId; // Retrieve the charger ID from the WebSocket object
    clients.set(chargerId, ws); // Add the WebSocket instance to the Map

    console.log(`Client connected with charger ID: ${chargerId}`);

    // Log connection
    createChargerLog(chargerId, "connected", { note: "WebSocket connection established" });

    ws.on('message', (message) => {
        console.log(`Received from charger ${chargerId}: %s`, message);
        // Handle Binary.createFromBase64()
        let actualMessage = message;

        const match = message.toString().match(/Binary\.createFromBase64\('(.+?)'/);
        if (match && match[1]) {
            const base64 = match[1];
            const buffer = Buffer.from(base64, 'base64');
            actualMessage = buffer.toString('utf8');
        }

        // Try to parse the actual message
        const parsedMessage = JSON.parse(actualMessage);
        console.log("Parsed OCPP message:", parsedMessage);
        // Log message
        createChargerLog(chargerId, "message_received", parsedMessage);
        try {
            // Update lastPing in the database asynchronously without awaiting
            ChargerLocation.findOneAndUpdate(
                { "chargerInfo.name": chargerId },
                { $set: { "chargerInfo.$.lastPing": new Date() } }, // Update lastPing
                { new: true }
            ).then((chargerLocation) => {
                if (chargerLocation) {
                    console.log(`Updated lastPing for charger ${chargerId}`);
                }
            }).catch((error) => {
                console.error(`Failed to update lastPing for charger ${chargerId}:`, error);
            });

            const parsedMessage = JSON.parse(message);
            console.log("Message in Array", parsedMessage);
            handleOcppMessage(ws, parsedMessage, chargerId);
        } catch (error) {
            console.error("Invalid message format:", error);
            createChargerLog(chargerId, "error", { error: error.message });
        }
    });

    ws.on('close', () => {
        // Update status in the database asynchronously without awaiting
        ChargerLocation.findOneAndUpdate(
            { "chargerInfo.name": chargerId },
            { $set: { "chargerInfo.$.status": "Inactive" } }, // Update status
            { new: true }
        ).then((chargerLocation) => {
            if (chargerLocation) {
                console.log(`Updated status to Inactive for charger ${chargerId}`);
            }
        }).catch((error) => {
            console.error(`Failed to update status to Inactive for charger ${chargerId}:`, error);
        });

        createChargerLog(chargerId, "disconnected", { note: "WebSocket connection closed" });
        console.log(`Charger ${chargerId} disconnected`);
        clients.delete(chargerId); // Remove the client from the Map when disconnected
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for charger ${chargerId}:`, error);
        createChargerLog(chargerId, "error", { error: error.message });
    });
});

// Expose functions to access and manage WebSocket clients
const getClient = (chargerId) => clients.get(chargerId); // Retrieve a specific client by charger ID
const getAllClients = () => Array.from(clients.entries()); // Get all clients as [chargerId, ws] pairs
const broadcastMessage = (message) => {
    clients.forEach((ws, chargerId) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
        }
    });
};

server.listen(8006, () => {
    console.log('WebSocket server is listening on port 8006');
});

module.exports = {
    getClient,
    getAllClients,
    broadcastMessage,
};


// const { WebSocketServer } = require('ws');
// const { handleOcppMessage } = require('./ocppHandler');
// const ChargerLocation = require('./models/chargerLocationModel');

// // Store all active WebSocket connections in a Map
// const clients = new Map(); // Key: chargerId, Value: WebSocket instance

// const wss = new WebSocketServer({ noServer: true }); // Use noServer to manually handle connections

// // HTTP server to listen for WebSocket upgrade requests
// const server = require('http').createServer();

// server.on('upgrade', async (request, socket, head) => {
//     const urlParts = request.url.split('/'); // Split the URL path
//     const chargerId = urlParts[urlParts.length - 1]; // Extract the charger ID (last part of the URL)

//     if (!chargerId) {
//         console.error('Invalid WebSocket URL. Charger ID is missing.');
//         socket.destroy(); // Reject the connection if the charger ID is missing
//         return;
//     }
//     try {
//         // Fetch charger location details based on chargerId
//         const chargerLocation = await ChargerLocation.findOne({ "chargerInfo.name": chargerId });
//         if (!chargerLocation) {
//             console.warn(`Location is not registered for Charger ID ${chargerId}. Informing client.`);

//             // Create a WebSocket connection to send the message
//             wss.handleUpgrade(request, socket, head, (ws) => {
//                 const errorMessage = [
//                     4, // MessageTypeId for CallError
//                     "1221", // Message ID
//                     "NotImplemented", // OCPP error code (e.g., NotImplemented, InternalError, ProtocolError, etc.)
//                     `Charger ID ${chargerId} is not registered.`, // Human-readable description
//                     "Please register your charger in CMS before connecting." // Additional error details (optional)
//                 ];
//                 ws.send(JSON.stringify(errorMessage));
//                 // ws.send(JSON.stringify({
//                 //     error: true,
//                 //     message: "Charger location not found.",
//                 //     details: `Charger ID ${chargerId} is not registered.`,
//                 //     solution: "Please register your charger in CMS before connecting."
//                 // }));
//                 ws.close(); // Close the connection after sending the message
//             });
//             return;
//         }

//         // Find the charger info corresponding to the chargerId in the session
//         const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerId);
//         if (!chargerInfo) {
//             console.warn(`Charger ID ${chargerId} is not registered. Informing client.`);

//             // Create a WebSocket connection to send the message
//             wss.handleUpgrade(request, socket, head, (ws) => {
//                 const errorMessage = [
//                     4, // MessageTypeId for CallError
//                     "1331", // Message ID
//                     "NotImplemented", // OCPP error code (e.g., NotImplemented, InternalError, ProtocolError, etc.)
//                     `Charger ID ${chargerId} is not available in the registered location.`, // Human-readable description
//                     "Please verify the charger ID or register it in CMS." // Additional error details (optional)
//                 ];
//                 ws.send(JSON.stringify(errorMessage));
//                 ws.close(); // Close the connection after sending the message
//             });
//             return;
//         }
//         // Check if charger exists in the database
//         // const chargerExists = await ChargerLocation.exists({ chargerId });

//         wss.handleUpgrade(request, socket, head, (ws) => {
//             ws.chargerId = chargerId; // Attach the charger ID to the WebSocket object
//             wss.emit('connection', ws, request);
//         });
//     } catch (error) {
//         console.error('Database error while checking charger existence:', error);
//         socket.destroy();
//     }
// });

// wss.on("connection", (ws) => {
//     const chargerId = ws.chargerId; // Retrieve the charger ID from the WebSocket object
//     clients.set(chargerId, ws); // Add the WebSocket instance to the Map

//     console.log(`Client connected with charger ID: ${chargerId}`);

//     ws.on('message', (message) => {
//         console.log(`Received from charger ${chargerId}: %s`, message);
//         try {
//             // Update lastPing in the database asynchronously without awaiting
//             ChargerLocation.findOneAndUpdate(
//                 { "chargerInfo.name": chargerId },
//                 { $set: { "chargerInfo.$.lastPing": new Date() } }, // Update lastPing
//                 { new: true }
//             ).then((chargerLocation) => {
//                 if (chargerLocation) {
//                     console.log(`Updated lastPing for charger ${chargerId}`);
//                 }
//             }).catch((error) => {
//                 console.error(`Failed to update lastPing for charger ${chargerId}:`, error);
//             });

//             const parsedMessage = JSON.parse(message);
//             console.log("Message in Array", parsedMessage);
//             handleOcppMessage(ws, parsedMessage, chargerId);
//         } catch (error) {
//             console.error("Invalid message format:", error);
//         }
//     });

//     ws.on('close', () => {
//         // Update status in the database asynchronously without awaiting
//         ChargerLocation.findOneAndUpdate(
//             { "chargerInfo.name": chargerId },
//             { $set: { "chargerInfo.$.status": "Inactive" } }, // Update status
//             { new: true }
//         ).then((chargerLocation) => {
//             if (chargerLocation) {
//                 console.log(`Updated status to Inactive for charger ${chargerId}`);
//             }
//         }).catch((error) => {
//             console.error(`Failed to update status to Inactive for charger ${chargerId}:`, error);
//         });

//         console.log(`Charger ${chargerId} disconnected`);
//         clients.delete(chargerId); // Remove the client from the Map when disconnected
//     });

//     ws.on('error', (error) => {
//         console.error(`WebSocket error for charger ${chargerId}:`, error);
//     });
// });

// // Expose functions to access and manage WebSocket clients
// const getClient = (chargerId) => clients.get(chargerId); // Retrieve a specific client by charger ID
// const getAllClients = () => Array.from(clients.entries()); // Get all clients as [chargerId, ws] pairs
// const broadcastMessage = (message) => {
//     clients.forEach((ws, chargerId) => {
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(message);
//         }
//     });
// };

// server.listen(8006, () => {
//     console.log('WebSocket server is listening on port 8006');
// });

// module.exports = {
//     getClient,
//     getAllClients,
//     broadcastMessage,
// };

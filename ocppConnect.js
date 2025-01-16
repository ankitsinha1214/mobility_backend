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

const { WebSocketServer } = require('ws');
const { handleOcppMessage } = require('./ocppHandler');

// Store all active WebSocket connections in a Map
const clients = new Map(); // Key: chargerId, Value: WebSocket instance

const wss = new WebSocketServer({ noServer: true }); // Use noServer to manually handle connections

// HTTP server to listen for WebSocket upgrade requests
const server = require('http').createServer();

server.on('upgrade', (request, socket, head) => {
    const urlParts = request.url.split('/'); // Split the URL path
    const chargerId = urlParts[urlParts.length - 1]; // Extract the charger ID (last part of the URL)

    if (!chargerId) {
        console.error('Invalid WebSocket URL. Charger ID is missing.');
        socket.destroy(); // Reject the connection if the charger ID is missing
        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
        ws.chargerId = chargerId; // Attach the charger ID to the WebSocket object
        wss.emit('connection', ws, request);
    });
});

wss.on("connection", (ws) => {
    const chargerId = ws.chargerId; // Retrieve the charger ID from the WebSocket object
    clients.set(chargerId, ws); // Add the WebSocket instance to the Map

    console.log(`Client connected with charger ID: ${chargerId}`);

    ws.on('message', (message) => {
        console.log(`Received from charger ${chargerId}: %s`, message);
        try {
            const parsedMessage = JSON.parse(message);
            console.log("Message in Array", parsedMessage);
            handleOcppMessage(ws, parsedMessage, chargerId);
        } catch (error) {
            console.error("Invalid message format:", error);
        }
    });

    ws.on('close', () => {
        console.log(`Charger ${chargerId} disconnected`);
        clients.delete(chargerId); // Remove the client from the Map when disconnected
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error for charger ${chargerId}:`, error);
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

const WebSocket = require('ws');
const { handleOcppMessage } = require('./ocppHandler'); // You'll define this function

// const ws = new WebSocket('wss://ocpp-server-url'); // Replace with your OCPP server URL
// const wss = new WebSocket.Server({ port: 8080 }); // Local WebSocket server running on port 8080

const ws = new WebSocket.Server({ port: 8000 }); // Local WebSocket server running on port 8080
ws.on('open', () => {
    console.log('Connected to OCPP server');
});

ws.on('message', (data) => {
    handleOcppMessage(JSON.parse(data)); // Handle incoming OCPP messages
});

ws.on('close', () => {
    console.log('Disconnected from OCPP server');
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

module.exports = ws;
// const WebSocket = require('ws');
// const { handleOcppMessage } = require('./ocppHandler');

// const wsClient = new WebSocket('wss://echo.websocket.org'); 

// wsClient.on('open', () => {
//     console.log('Connected to WebSocket echo server');
// });

// wsClient.on('message', (data) => {
//     console.log('Message from server:', data);
//     handleOcppMessage(JSON.parse(data)); // Handle incoming OCPP messages
// });

// wsClient.on('close', () => {
//     console.log('Disconnected from WebSocket echo server');
// });

// wsClient.on('error', (error) => {
//     console.error('WebSocket error:', error);
// });

// module.exports = wsClient;

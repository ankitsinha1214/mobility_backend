const { WebSocketServer } = require('ws');
const { handleOcppMessage } = require('./ocppHandler');


let wsConnection;

const wss = new WebSocketServer({ port: 8006 });
wss.on("connection", function connection(ws) {
    console.log("Client Connected");
    wsConnection = ws;

    ws.on('message', (message) => {
        console.log('Received from server: %s', message);
        try {
            const parsedMessage = JSON.parse(message);
            console.log("Message in Array", parsedMessage);
            handleOcppMessage(ws, parsedMessage);
        } catch (error) {
            console.error("Invalid message format:", error);
        }
    });
    ws.on('open', () => {
        console.log('Connected to OCPP server');
        ws.send('Hello Server!');
    });
    ws.on('close', () => {
        console.log('Disconnected from the server');
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
    // ws.on('message', (message) => {
    //   console.log('Received from server:', message);
    // });
})

module.exports = wsConnection;
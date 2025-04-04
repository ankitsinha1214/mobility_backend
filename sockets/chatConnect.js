// chatConnect.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const Ticket = require("../models/ticket");
const TicketMessage = require("../models/TicketMessage");

const app = express();
app.use(cors());

const CHAT_PORT = process.env.CHAT_SOCKET_PORT || 8007;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    allowEIO3: true // 👈 this allows Postman (v2) to connect
});

const startChatSocket = () => {
    io.on("connection", (socket) => {
        console.log(`[ChatSocket] New connection: ${socket.id}`);

        // 🔗 Join Room
        socket.on("joinTicket", (ticketId, userId,callback) => {
            console.log("👉 joinTicket event triggered");
            socket.join(ticketId);
            console.log(`[ChatSocket] User ${userId} joined ticket room: ${ticketId}`);
            // ✅ Emit response back to this client to confirm
            // socket.emit("joinedTicket", {
            //     success: true,
            //     message: `Joined room for ticket ${ticketId}`,
            //     ticketId,
            //     userId
            // });
            callback({
                status: "ok"
              });
        });

        // ✉️ Send Message
        socket.on("sendMessage", async (ticketId, senderId, senderModel, message, callback) => {
            if (!ticketId || !senderId || !message || !senderModel) {
                console.log("no")
                callback({
                    status: "no"
                });
                // return;
            }

            try {
                const ticket = await Ticket.findById(ticketId);
                if (!ticket) {
                    return socket.emit("error", { message: "Ticket not found" });
                }

                const newMessage = await TicketMessage.create({
                    ticketId,
                    senderId,
                    senderModel,
                    message
                });

                const messageToEmit = {
                    _id: newMessage._id,
                    ticketId,
                    senderId,
                    senderModel,
                    message,
                    createdAt: newMessage.createdAt
                };

                // 🟢 Emit message to all clients in ticket room
                io.to(ticketId).emit("receiveMessage", messageToEmit);
            } catch (err) {
                console.error(`[ChatSocket] Error:`, err);
                socket.emit("error", { message: "Internal Server Error" });
            }
        });

        // 🚪 Handle Disconnect
        socket.on("disconnect", () => {
            console.log(`[ChatSocket] Disconnected: ${socket.id}`);
        });
    });

    server.listen(CHAT_PORT, () => {
        console.log(`[ChatSocket] Listening on port ${CHAT_PORT}`);
    });
};

module.exports = startChatSocket;

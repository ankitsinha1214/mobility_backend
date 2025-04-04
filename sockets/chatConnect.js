// chatConnect.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Ticket = require("../models/ticket"); // adjust path as needed
const cors = require("cors");

// Optional: Setup Express App for this socket server
const app = express();
app.use(cors());

// Use a different port for chat socket
const CHAT_PORT = process.env.CHAT_SOCKET_PORT || 8007;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const startChatSocket = () => {
    io.on("connection", (socket) => {
        console.log(`[ChatSocket] New connection: ${socket.id}`);

        // Join a room using ticket ID
        socket.on("joinTicket", ({ ticketId, userId }) => {
            socket.join(ticketId);
            console.log(`[ChatSocket] User ${userId} joined room: ${ticketId}`);
        });

        // Handle new message sent
        socket.on("sendMessage", async ({ ticketId, senderId, message }) => {
            if (!ticketId || !senderId || !message) return;

            try {
                const ticket = await Ticket.findById(ticketId);
                if (!ticket) {
                    socket.emit("error", { message: "Ticket not found" });
                    return;
                }

                const newMessage = {
                    sender: senderId,
                    message,
                    timestamp: new Date()
                };

                ticket.messages.push(newMessage);
                await ticket.save();

                // Broadcast message to everyone in room
                io.to(ticketId).emit("receiveMessage", newMessage);
            } catch (err) {
                console.error(`[ChatSocket] Error sending message:`, err);
                socket.emit("error", { message: "Internal Server Error" });
            }
        });

        socket.on("disconnect", () => {
            console.log(`[ChatSocket] Disconnected: ${socket.id}`);
        });
    });

    server.listen(CHAT_PORT, () => {
        console.log(`[ChatSocket] Listening on port ${CHAT_PORT}`);
    });
};

module.exports = startChatSocket;

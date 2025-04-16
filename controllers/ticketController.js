const ticketCategory = require('../models/ticketCategory');
const Ticket = require("../models/ticket");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const TicketMessage = require('../models/TicketMessage');
const SandmUser = require("../models/userSandmModel");
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION
})
// Create an FAQ
// const createFAQ = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//         }
//         const faq = new FAQ(req.body);
//         await faq.save();
//         return res.json({ success: true, data: faq, message: 'FAQ created successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };

// Get all FAQs with a given category
// const faqByCategory = async (req, res) => {
//     const { category } = req.body;
//     if (!category) {
//         return res.json({ success: false, message: 'Category is required' });
//     }
//     try {
//         const faqs = await FAQ.find({ category });
//         if (faqs.length === 0) {
//             return res.json({ success: false, message: 'No FAQs of given category found' });
//         }
//         return res.json({ success: true, data: faqs });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
const getLeastLoadedUser = async (role, extraFilter = {}) => {
    const users = await SandmUser.find({
      role: { $regex: new RegExp(`^${role}$`, 'i') }, // Case-insensitive match
      status: "Active",
      ...extraFilter,
    });
  
    if (!users.length) return null;
  
    const userTicketCounts = await Promise.all(
      users.map(async (user) => {
        const count = await Ticket.countDocuments({ assignedTo: user._id });
        return { user, count };
      })
    );
  
    userTicketCounts.sort((a, b) => a.count - b.count);
    return userTicketCounts[0].user;
  };

// Get all unique categories
const getCategory = async (req, res) => {
    try {
        const categories = await ticketCategory.distinct('name');
        if (categories.length === 0) {
            return res.json({ success: false, message: 'No Category found' });
        }
        return res.json({ success: true, data: categories, message: 'Category retrieved Successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Resolve a ticket
const resolveTicket = async (req, res) => {
    try {
        const { ticketId } = req.body;
        const createdBy = req.userid;

        if (!ticketId) {
            return res.json({ status: false, message: "Ticket ID is required." });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.json({ status: false, message: "Ticket not found." });
        }

        // Update the ticket status to 'Closed'
        // ticket.status = "Resolved";
        // await ticket.save();
        if (ticket.status === "Resolved") {
            ticket.status = "In Progress";
            let messageText = `Ticket has been reopened.`;
            
            // 💬 Add one TicketMessage entry from user
            const ticketMessage = new TicketMessage({
                ticketId: ticketId,
                senderId: createdBy,
                senderModel: "SandmUser", // must be either "User" or "SandmUser"
                // message: title
                message: messageText
            });
            await ticket.save();
            await ticketMessage.save();
            return res.json({ status: true, message: "Ticket status changed to Open.", data: ticket });
        } else {
            ticket.status = "Resolved";
            let messageText = `Ticket has been resolved.`;
            
            // 💬 Add one TicketMessage entry from user
            const ticketMessage = new TicketMessage({
                ticketId: ticketId,
                senderId: createdBy,
                senderModel: "SandmUser", // must be either "User" or "SandmUser"
                // message: title
                message: messageText
            });
            await ticket.save();
            await ticketMessage.save();
            return res.json({ status: true, message: "Ticket has been resolved.", data: ticket });
        }

        // return res.json({ status: true, message: "Ticket has been resolved and marked as closed.", data: ticket });
    } catch (error) {
        console.error("Error resolving ticket:", error);
        return res.status(500).json({ status: false, message: "Internal server error", error });
    }
};

const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority,
            assignedTo,
            sessionId } = req.body;
        // console.log(req.userid)
        // if (!req.files || !req.files.screenshots || req.files.screenshots.length === 0) {
        //     return res.json({ success: false, message: 'No image file uploaded' });
        // }
        let createdBy = req.userid;
        // Validate required fields
        if (!title) {
            return res.status(400).json({ status: false, message: "Title is required" });
        }
        if (!description) {
            return res.status(400).json({ status: false, message: "Description is required" });
        }
        if (!category) {
            return res.status(400).json({ status: false, message: "Category is required" });
        }
        if (!createdBy) {
            return res.status(400).json({ status: false, message: "CreatedBy is required" });
        }

        let finalAssignedTo = assignedTo;
        if (!finalAssignedTo) {
            // const manager = await getLeastLoadedUser("manager");
            // Try to get a Manager with serviceID "4"
            const managerWithService4 = await getLeastLoadedUser("Manager", { serviceID: "6" });
            if (managerWithService4) {
                finalAssignedTo = managerWithService4._id;
            } else {
                // Fallback to any Admin
                const fallbackAdmin = await getLeastLoadedUser("Admin");
                if (fallbackAdmin) {
                    finalAssignedTo = fallbackAdmin._id;
                }
            }
        }

        const imageKeys = [];
        // console.log(req.files)
        if (req.files && Array.isArray(req.files?.screenshots)) {
            for (const file of req.files.screenshots) {
                // const arr1 = file.mimetype.split("/");
                // const awsImgKey = `ticketImg/ticketImg-${Date.now()}.${arr1[1]}`;
                const extension = file.originalname.split(".").pop();
                const awsImgKey = `ticketImg/ticketImg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${extension}`;
                const params4 = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: awsImgKey,
                    Body: file.buffer,
                    ContentType: file.mimetype
                };
                const command4 = new PutObjectCommand(params4);
                await s3.send(command4);
                imageKeys.push(awsImgKey);
            }
        } else {
            console.log("No valid files found in request.");
        }

        // Create new ticket
        const newTicket = new Ticket({
            title,
            description,
            category,
            sessionId,
            status: finalAssignedTo ? "In Progress" : "Open",  
            priority: priority || "Medium", // Default priority if not provided
            assignedTo: finalAssignedTo,
            // assignedTo,
            createdBy,
            screenshots: imageKeys, // Ensure screenshots is an array
        });

        await newTicket.save();
        let messageText = `Title: ${title}\nDescription: ${description}`;
        if (imageKeys.length > 0) {
            messageText += `\nScreenshot: https://chrgup.s3.ap-south-1.amazonaws.com/${imageKeys[0]}`;
        }
        // 💬 Add one TicketMessage entry from user
        const ticketMessage = new TicketMessage({
            ticketId: newTicket._id,
            senderId: createdBy,
            senderModel: "User", // must be either "User" or "SandmUser"
            // message: title
            message: messageText
        });

        await ticketMessage.save();

        res.json({ status: true, message: "Ticket created successfully", ticket: newTicket });
    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ status: false, message: "Server error", error });
    }
};

// Get all tickets (for Admin & Manager only)
const getAllTickets = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Only Admin and Manager can view all tickets." });
        }

        const tickets = await Ticket.find().populate('createdBy', 'firstName lastName phoneNumber'); // Populating user details

        if (!tickets.length) {
            return res.json({ success: false, message: 'No tickets found in the system.' });
        }

        return res.json({ success: true, message: "All tickets retrieved successfully.", data: tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ success: false, message: "Server error while fetching tickets.", error });
    }
};

// Get tickets for a specific user
const getUserTickets = async (req, res) => {
    try {
        if (!req.userid) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Please log in to view your tickets." });
        }

        const tickets = await Ticket.find({ createdBy: req.userid });

        if (!tickets.length) {
            return res.json({ success: false, message: 'No tickets found for your account.' });
        }

        return res.json({ success: true, message: "Your tickets retrieved successfully.", data: tickets });
    } catch (error) {
        console.error("Error fetching user tickets:", error);
        res.status(500).json({ success: false, message: "Server error while fetching user tickets.", error });
    }
};

// Get all tickets assigned to a specific user
const getTicketsAssignedToUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required in params." });
        }

        const tickets = await Ticket.find({ assignedTo: userId })
            .populate('createdBy', 'firstName lastName phoneNumber')
            .populate('assignedTo', 'username email');

        if (!tickets.length) {
            return res.json({ success: false, message: 'No tickets assigned to this user.' });
        }

        return res.json({ success: true, message: "Tickets assigned to user retrieved successfully.", data: tickets });
    } catch (error) {
        console.error("Error fetching assigned tickets:", error);
        res.status(500).json({ success: false, message: "Server error while fetching assigned tickets.", error });
    }
};


module.exports = {
    // createFAQ,
    getCategory,
    createTicket,
    resolveTicket,
    getAllTickets,
    getUserTickets,
    getTicketsAssignedToUser
    // faqByCategory
};

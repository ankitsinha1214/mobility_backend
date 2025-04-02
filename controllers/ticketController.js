const ticketCategory = require('../models/ticketCategory');
const Ticket = require("../models/ticket");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
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

const createTicket = async (req, res) => {
    try {
        const { title, description, category, priority, assignedTo, sessionId } = req.body;
        // console.log(req.userid)
        // if (!req.files || !req.files.screenshots || req.files.screenshots.length === 0) {
        //     return res.json({ success: false, message: 'No image file uploaded' });
        // }
        createdBy = req.userid;
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

        const imageKeys = [];
        // console.log(req.files.locationImage)
        for (const file of req.files.screenshots) {
            const arr1 = file.mimetype.split("/");
            const awsImgKey = `ticketImg/ticketImg-${Date.now()}.${arr1[1]}`;
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

        // Create new ticket
        const newTicket = new Ticket({
            title,
            description,
            category,
            sessionId,
            priority: priority || "Medium", // Default priority if not provided
            assignedTo,
            createdBy,
            screenshots: imageKeys, // Ensure screenshots is an array
        });

        await newTicket.save();

        res.status(201).json({ status: true, message: "Ticket created successfully", ticket: newTicket });
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

module.exports = {
    // createFAQ,
    getCategory,
    createTicket,
    getAllTickets,
    getUserTickets
    // faqByCategory
};

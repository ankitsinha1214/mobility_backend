const PredeliveryQuestion = require('../models/preDeliveryQuestionModel'); // Adjust the path as necessary

// Create a new predelivery question
const createQuestion = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { question } = req.body;
        const newQuestion = new PredeliveryQuestion({ question });
        await newQuestion.save();
        res.json({ success: true, data: newQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create predelivery question", error: error.message });
    }
};

// Get all predelivery questions
const getAllQuestions = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const questions = await PredeliveryQuestion.find();
        if (questions.length === 0) {
            return res.json({ success: false, message: "No predelivery questions found" });
        }
        res.json({ success: true, data: questions });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve predelivery questions", error: error.message });
    }
};


// Get a single predelivery question by ID
const getQuestionById = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const question = await PredeliveryQuestion.findById(id);
        if (!question) {
            return res.json({ success: false, message: "Predelivery question not found" });
        }
        res.json({ success: true, data: question });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to retrieve predelivery question", error: error.message });
    }
};

// Update a predelivery question by ID
const updateQuestionById = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const { question } = req.body;
        const updatedQuestion = await PredeliveryQuestion.findByIdAndUpdate(id, { question }, { new: true, runValidators: true });
        if (!updatedQuestion) {
            return res.json({ success: false, message: "Predelivery question not found" });
        }
        res.json({ success: true, data: updatedQuestion });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update predelivery question", error: error.message });
    }
};

// Delete a predelivery question by ID
const deleteQuestionById = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const deletedQuestion = await PredeliveryQuestion.findByIdAndDelete(id);
        if (!deletedQuestion) {
            return res.json({ success: false, message: "Predelivery question not found" });
        }
        res.json({ success: true, message: "Predelivery question deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete predelivery question", error: error.message });
    }
};

module.exports = {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestionById,
    deleteQuestionById
};

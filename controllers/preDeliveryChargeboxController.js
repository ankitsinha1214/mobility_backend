const PreDeliveryChargeboxResponse = require('../models/preDeliveryChargeboxResponseModel');
const User = require('../models/userSandmModel');
const PreDeliveryQuestion = require('../models/preDeliveryQuestionModel');

// Create a new PreDeliveryChargeboxResponse
exports.createPreDeliveryChargeboxResponse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { chargebox_id, responses, userServiceAndMaintenance } = req.body;

        // Validate user
        const user = await User.findById(userServiceAndMaintenance);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        if (user.status !== 'Active') {
            return res.json({ success: false, message: 'Your account is inactive. Please contact support to resolve this issue.' });
        }

        // Validate that responses array is not empty
        if (!responses || responses.length === 0) {
            return res.json({ success: false, message: 'Responses array cannot be empty' });
        }
        // Validate questions and responses
        for (const response of responses) {
            const question = await PreDeliveryQuestion.findById(response.question_id);
            if (!question) {
                return res.json({ success: false, message: `Question with ID ${response.question_id} not found` });
            }
        }

        const newResponse = new PreDeliveryChargeboxResponse({
            chargebox_id,
            responses,
            userServiceAndMaintenance
        });

        await newResponse.save();
        res.json({ success: true, message: 'PreDeliveryChargeboxResponse created successfully', data: newResponse });
    } catch (error) {
        console.error('Error creating PreDeliveryChargeboxResponse:', error);
        if (error.keyValue?.chargebox_id) {
            return res.status(500).json({ success: false, message: `${error.keyValue?.chargebox_id} ChargeBox already exist. Please check!`, error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all PreDeliveryChargeboxResponses
exports.getAllPreDeliveryChargeboxResponses = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const responses = await PreDeliveryChargeboxResponse.find()
        .populate('userServiceAndMaintenance', 'username email phone');  // Adjust fields as needed
        if (responses.length === 0) {
            return res.json({ success: false, message: 'No PreDeliveryChargeboxResponses found' });
        }
        res.json({ success: true, data: responses });
    } catch (error) {
        console.error('Error getting PreDeliveryChargeboxResponses:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get PreDeliveryChargeboxResponse by ID
exports.getPreDeliveryChargeboxResponseById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const response = await PreDeliveryChargeboxResponse.findById(id);
        // const dataTosend = response;
        if (!response) {
            return res.json({ success: false, message: 'PreDeliveryChargeboxResponse not found' });
        }
        // Fetch question details for each response
        const responsesWithQuestions = await Promise.all(response.responses.map(async (res) => {
            const question = await PreDeliveryQuestion.findById(res.question_id);
            if (!question) {
                return res.json({ success: false, message: `Question with ID ${res.question_id} not found` });
            }
            return {
                ...res.toObject(), // Convert to plain JavaScript object
                question_name: question.question // Add question name
            };
        }));

        // Send the response with populated question names
        res.json({ success: true, data: { ...response.toObject(), responses: responsesWithQuestions } });

    } catch (error) {
        console.error('Error getting PreDeliveryChargeboxResponse by ID:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update PreDeliveryChargeboxResponse by ID
exports.updatePreDeliveryChargeboxResponse = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const { chargebox_id, responses, userServiceAndMaintenance } = req.body;

        // Validate user
        const user = await User.findById(userServiceAndMaintenance);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Validate questions and responses
        for (const response of responses) {
            const question = await PreDeliveryQuestion.findById(response.question_id);
            if (!question) {
                return res.json({ success: false, message: `Question with ID ${response.question_id} not found` });
            }
        }

        const updatedResponse = await PreDeliveryChargeboxResponse.findByIdAndUpdate(id, {
            chargebox_id,
            responses,
            userServiceAndMaintenance
        }, { new: true });

        if (!updatedResponse) {
            return res.json({ success: false, message: 'PreDeliveryChargeboxResponse not found' });
        }

        res.json({ success: true, message: 'PreDeliveryChargeboxResponse updated successfully', data: updatedResponse });
    } catch (error) {
        console.error('Error updating PreDeliveryChargeboxResponse:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete PreDeliveryChargeboxResponse by ID
exports.deletePreDeliveryChargeboxResponse = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { id } = req.params;
        const deletedResponse = await PreDeliveryChargeboxResponse.findByIdAndDelete(id);
        if (!deletedResponse) {
            return res.json({ success: false, message: 'PreDeliveryChargeboxResponse not found' });
        }
        res.json({ success: true, message: 'PreDeliveryChargeboxResponse deleted successfully' });
    } catch (error) {
        console.error('Error deleting PreDeliveryChargeboxResponse:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get PreDeliveryChargeboxResponses by User ID
exports.getPreDeliveryChargeboxResponsesByUserId = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { userId } = req.params;
        const responses = await PreDeliveryChargeboxResponse.find({ userServiceAndMaintenance: userId });

        if (responses.length === 0) {
            return res.json({ success: false, message: 'No PreDeliveryChargeboxResponses found for the given user' });
        }

        res.json({ success: true, data: responses });
    } catch (error) {
        console.error('Error retrieving PreDeliveryChargeboxResponses by user ID:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Check if chargebox_id already exists
exports.checkChargeboxIdExists = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { chargebox_id } = req.params;

        // Validate that chargebox_id is provided
        if (!chargebox_id) {
            return res.json({ success: false, message: 'Chargebox ID is required' });
        }

        // Check if the chargebox_id exists
        const existingResponse = await PreDeliveryChargeboxResponse.findOne({ chargebox_id });

        if (existingResponse) {
            return res.json({ success: true, message: 'Chargebox ID already exists' });
        } else {
            return res.json({ success: false, message: 'Chargebox ID does not exist' });
        }
    } catch (error) {
        console.error('Error checking chargebox_id:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
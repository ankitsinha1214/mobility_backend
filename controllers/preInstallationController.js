const PreInstallation = require('../models/preInstallationModel');
const SandmUser = require('../models/userSandmModel'); // Import the SandmUser model
const ChargerLocation = require('../models/chargerLocationModel'); 

// Create a new PreInstallation
const createPreInstallation = async (req, res) => {
    try {
        const { userId, locationId } = req.body;

        // Check if the user exists
        const user = await SandmUser.findById(userId);
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Check if the location exists
        const location = await ChargerLocation.findById(locationId);
        if (!location) {
            return res.json({ status: false, message: 'Location not found' });
        }

        // Create the pre-installation
        const preInstallation = new PreInstallation(req.body);
        await preInstallation.save();

        res.json({ status: true, message: 'Pre-installation created successfully', data: preInstallation });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get all PreInstallations
const getAllPreInstallations = async (req, res) => {
    try {
        const preInstallations = await PreInstallation.find();
        if (preInstallations.length === 0) {
            return res.json({ status: false, message: 'No pre-installations found' });
        }
        res.json({ status: true, data: preInstallations });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get PreInstallation by ID
const getPreInstallationById = async (req, res) => {
    try {
        const { id } = req.params;
        const preInstallation = await PreInstallation.findById(id);
        if (!preInstallation) {
            return res.json({ status: false, message: 'Pre-installation not found' });
        }
        res.json({ status: true, data: preInstallation });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get all PreInstallations by userId
const getPreInstallationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const preInstallations = await PreInstallation.find({ userId });
        if (preInstallations.length === 0) {
            return res.json({ status: false, message: 'No pre-installations found for this user' });
        }
        res.json({ status: true, data: preInstallations });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Delete PreInstallation by ID
const deletePreInstallationById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await PreInstallation.findByIdAndDelete(id);
        if (!result) {
            return res.json({ status: false, message: 'Pre-installation not found' });
        }
        res.json({ status: true, message: 'Pre-installation deleted successfully', data: result });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = { 
    createPreInstallation, 
    getAllPreInstallations, 
    getPreInstallationById, 
    getPreInstallationsByUserId, 
    deletePreInstallationById 
};

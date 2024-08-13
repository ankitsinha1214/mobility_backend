const ChargerAndDcBox = require('../models/chargerAndDcboxModel');
const SandmUser = require('../models/userSandmModel'); // Import the SandmUser model
const ChargerLocation = require('../models/chargerLocationModel'); // Import the ChargerLocation model

// Create a new ChargerAndDcBox
const createChargerAndDcBox = async (req, res) => {
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

        // Create the ChargerAndDcBox entry
        const chargerAndDcBox = new ChargerAndDcBox(req.body);
        await chargerAndDcBox.save();

        res.json({ status: true, message: 'Charger and DC Box created successfully', data: chargerAndDcBox });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get all ChargerAndDcBox entries
const getAllChargerAndDcBox = async (req, res) => {
    try {
        const chargerAndDcBoxes = await ChargerAndDcBox.find();
        if (chargerAndDcBoxes.length === 0) {
            return res.json({ status: false, message: 'No Charger and DC Box entries found' });
        }
        res.json({ status: true, data: chargerAndDcBoxes });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get ChargerAndDcBox by ID
const getChargerAndDcBoxById = async (req, res) => {
    try {
        const { id } = req.params;
        const chargerAndDcBox = await ChargerAndDcBox.findById(id);
        if (!chargerAndDcBox) {
            return res.json({ status: false, message: 'Charger and DC Box not found' });
        }
        res.json({ status: true, data: chargerAndDcBox });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Delete ChargerAndDcBox by ID
const deleteChargerAndDcBoxById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await ChargerAndDcBox.findByIdAndDelete(id);
        if (!result) {
            return res.json({ status: false, message: 'Charger and DC Box not found' });
        }
        res.json({ status: true, message: 'Charger and DC Box deleted successfully', data: result });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = {
    createChargerAndDcBox,
    getAllChargerAndDcBox,
    getChargerAndDcBoxById,
    deleteChargerAndDcBoxById
};

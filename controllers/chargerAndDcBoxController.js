const ChargerAndDcBox = require('../models/chargerAndDcboxModel');
const SandmUser = require('../models/userSandmModel'); // Import the SandmUser model
const ChargerLocation = require('../models/chargerLocationModel'); // Import the ChargerLocation model
const PreInstallation = require('../models/preInstallationModel'); // Import the PreInstallation model

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

const getFilteredLocationsWithApprovedPreInstallation = async (req, res) => {
    const { state, city, status } = req.body;

    try {
        // Filter locations based on state, city, and status
        const filter = {};
        if (state) filter.state = state;
        if (city) filter.city = city;
        if (status) filter.status = status;

        // Find locations based on the filter
        let locations = await ChargerLocation.find(filter);
        if (locations.length === 0) {
            return res.json({ success: false, message: 'No locations found' });
        }

        // Find pre-installations with 'Approved' status for these locations
        const approvedPreInstallations = await PreInstallation.find({
            locationId: { $in: locations.map(loc => loc._id) },
            status: 'Approved'
        });

        // Get location IDs that have at least one approved pre-installation
        const approvedLocationIds = new Set(approvedPreInstallations.map(preInstall => preInstall.locationId.toString()));

        // Find locations with 'Approved' charger and DC box status
        const approvedChargerAndDcBox = await ChargerAndDcBox.find({
            locationId: { $in: locations.map(loc => loc._id) },
            status: 'Approved'
        });

        // Get location IDs that have approved charger and DC box
        const approvedChargerAndDcBoxLocationIds = new Set(approvedChargerAndDcBox.map(cb => cb.locationId.toString()));

        // Filter locations to include only those with approved pre-installations and exclude those with approved charger and DC box
        locations = locations.filter(loc => 
            approvedLocationIds.has(loc._id.toString()) &&
            !approvedChargerAndDcBoxLocationIds.has(loc._id.toString())
        );

        if (locations.length === 0) {
            return res.json({ success: false, message: 'No locations with approved pre-installations found' });
        }

        return res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createChargerAndDcBox,
    getAllChargerAndDcBox,
    getChargerAndDcBoxById,
    deleteChargerAndDcBoxById,
    getFilteredLocationsWithApprovedPreInstallation
};

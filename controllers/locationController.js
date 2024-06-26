// controllers/locationController.js

const Location = require('../models/locationModel');

// Create a location
const createLocation = async (req, res) => {
    const { country, state, city } = req.body;

    try {
        const newLocation = await Location.create({ country, state, city });
        res.json({ success: true, data: newLocation });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create location', error: error.message });
    }
};

// Get all locations
const getLocations = async (req, res) => {
    try {
        const locations = await Location.find();
        res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve locations', error: error.message });
    }
};

// Get location by ID
const getLocationById = async (req, res) => {
    const { id } = req.params;

    try {
        const location = await Location.findById(id);

        if (!location) {
            return res.status(404).json({ success: false, message: 'Location not found' });
        }

        res.json({ success: true, data: location });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve location', error: error.message });
    }
};

// Update location by ID
const updateLocation = async (req, res) => {
    const { id } = req.params;
    const { country, state, city } = req.body;

    try {
        const updatedLocation = await Location.findByIdAndUpdate(id, { country, state, city }, { new: true });

        if (!updatedLocation) {
            return res.status(404).json({ success: false, message: 'Location not found' });
        }

        res.json({ success: true, data: updatedLocation });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update location', error: error.message });
    }
};

// Delete location by ID
const deleteLocation = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedLocation = await Location.findByIdAndDelete(id);

        if (!deletedLocation) {
            return res.status(404).json({ success: false, message: 'Location not found' });
        }

        res.json({ success: true, message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete location', error: error.message });
    }
};

module.exports = {
    createLocation,
    getLocations,
    getLocationById,
    updateLocation,
    deleteLocation
};

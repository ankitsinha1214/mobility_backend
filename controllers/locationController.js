// controllers/locationController.js

const Location = require('../models/locationModel');

// Create a location
const createLocation = async (req, res) => {
    const { country, state, city } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
      // Check if the combination of country, state, and city already exists
      const existingLocation = await Location.findOne({ country, state, city });
  
      if (existingLocation) {
        return res.status(400).json({ success: false, message: 'Location already exists' });
      }
  
      const newLocation = new Location({ country, state, city });
      await newLocation.save();
  
      return res.status(201).json({ success: true, data: newLocation, message: 'Location created successfully' });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create location', error: error.message });
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
// get all location with state and city as nested objects
const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find({});

        const structuredLocations = locations.reduce((acc, loc) => {
            let countryEntry = acc.find(entry => entry[loc.country]);
            if (!countryEntry) {
                countryEntry = { [loc.country]: [] };
                acc.push(countryEntry);
            }

            let stateEntry = countryEntry[loc.country].find(entry => entry[loc.state]);
            if (!stateEntry) {
                stateEntry = { [loc.state]: [] };
                countryEntry[loc.country].push(stateEntry);
            }

            if (!stateEntry[loc.state].includes(loc.city)) {
                stateEntry[loc.state].push(loc.city);
            }

            return acc;
        }, []);

        res.json({ success: true, data: structuredLocations });
        // res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve locations', error: error.message });
    }
};

// Update location by ID
const updateLocation = async (req, res) => {
    const { id } = req.params;
    const { country, state, city } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
    deleteLocation,
    getAllLocations
};

const ChargerLocation = require('../models/chargerLocationModel');

// Create a charger location
const createChargerLocation = async (req, res) => {
    try {
        const chargerLocation = new ChargerLocation(req.body);
        await chargerLocation.save();
        return res.json({ success: true, data: chargerLocation, message: 'Charger location created successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all charger locations
const getChargerLocations = async (req, res) => {
    try {
        const chargerLocations = await ChargerLocation.find();
        if (chargerLocations.length === 0) {
            return res.json({ success: false, message: 'No charger locations found' });
        }
        return res.json({ success: true, data: chargerLocations });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all unique location types
const getLocationTypes = async (req, res) => {
    try {
        const locationTypes = await ChargerLocation.distinct('locationType');
        if (locationTypes.length === 0) {
            return res.json({ success: false, message: 'No location types found' });
        }
        return res.json({ success: true, data: locationTypes });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get a single charger location by ID
const getChargerLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        const chargerLocation = await ChargerLocation.findById(id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Charger location not found' });
        }
        return res.json({ success: true, data: chargerLocation });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update a charger location by ID
const updateChargerLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const chargerLocation = await ChargerLocation.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Charger location not found' });
        }
        return res.json({ success: true, data: chargerLocation });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a charger location by ID
const deleteChargerLocation = async (req, res) => {
    const { id } = req.params;
    try {
        const chargerLocation = await ChargerLocation.findByIdAndDelete(id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Charger location not found' });
        }
        return res.json({ success: true, message: 'Charger location deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
// Change Charger Status by ID
const changeChargerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const chargerLocation = await ChargerLocation.findById(id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Charger location not found' });
        }

        chargerLocation.status = status;
        await chargerLocation.save();

        return res.json({ success: true, message: `Charger location status changed to ${status} successfully` });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


// Get all charger locations with nested state, city, and detailed locations
const getAllLocations = async (req, res) => {
    try {
        const locations = await ChargerLocation.find();

        const structuredLocations = locations.reduce((acc, loc) => {
            let stateEntry = acc.find(entry => entry.state === loc.state);
            if (!stateEntry) {
                stateEntry = { state: loc.state, cities: [] };
                acc.push(stateEntry);
            }

            let cityEntry = stateEntry.cities.find(entry => entry.city === loc.city);
            if (!cityEntry) {
                cityEntry = { city: loc.city, locations: [] };
                stateEntry.cities.push(cityEntry);
            }

            // cityEntry.locations.push({
            //     locationName: loc.locationName,
            //     locationType: loc.locationType,
            //     address: loc.address,
            //     direction: loc.direction,
            //     salesManager: loc.salesManager,
            //     dealer: loc.dealer,
            //     facilities: loc.facilities,
            //     status: loc.status,
            //     chargerInfo: loc.chargerInfo,
            //     workingHours: loc.workingHours,
            //     locationImage: loc.locationImage,
            //     createdAt: loc.createdAt,
            //     updatedAt: loc.updatedAt
            // });

            return acc;
        }, []);

        if (structuredLocations.length === 0) {
            return res.json({ success: false, message: 'No locations found' });
        }

        return res.json({ success: true, data: structuredLocations });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve locations', error: error.message });
    }
};

const getLocationsByStateCityStatus = async (req, res) => {
    const { state, city, status } = req.body;

    try {
        const filter = {};
        if (state) filter.state = state;
        if (city) filter.city = city;
        if (status) filter.status = status;

        const locations = await ChargerLocation.find(filter);
        if (locations.length === 0) {
            return res.json({ success: false, message: 'No locations found' });
        }
        return res.json({ success: true, data: locations });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createChargerLocation,
    getChargerLocations,
    getLocationTypes,
    getChargerLocationById,
    updateChargerLocation,
    deleteChargerLocation,
    getAllLocations,
    changeChargerStatus,
    getLocationsByStateCityStatus
};

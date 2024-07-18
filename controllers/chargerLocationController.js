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
// Get charger locations within a specific range
// const getChargerLocationsInRange = async (req, res) => {
//     const { latitude, longitude, status, range } = req.body;

//     if (!latitude || !longitude || !status || !range) {
//         return res.json({ success: false, message: 'All fields (latitude, longitude, status, range) are required' });
//     }

//     try {
//         const locations = await ChargerLocation.find({
//             status,
//             location: {
//                 $geoWithin: {
//                     $centerSphere: [
//                         [longitude, latitude],
//                         range / 6378.1 // Range in radians (Earth radius in km)
//                     ]
//                 }
//             }
//         });

//         if (locations.length === 0) {
//             return res.json({ success: false, message: 'No charger locations found within the specified range' });
//         }

//         return res.json({ success: true, data: locations });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };
const getChargerLocationsInRange = async (req, res) => {
    const { latitude, longitude, status, range } = req.body;

    if(range === 0){
        return res.json({ success: true, data: null, message: 'No charger found!' });
    }
    if (!latitude || !longitude || !range) {
        return res.json({ success: false, message: 'Latitude, longitude, and range are required' });
    }

    try {
        // Convert range from kilometers to meters
        const rangeInMeters = range * 1000;

        // Get all charger locations
        const locations = await ChargerLocation.find(status ? { status } : {});

        // Filter locations within the specified range using Haversine formula
        const locationsInRange = locations.filter(location => {
            const distance = calculateDistance(latitude, longitude, location.direction.latitude, location.direction.longitude);
            return distance <= rangeInMeters;
        });

        if (locationsInRange.length === 0) {
            return res.json({ success: false, message: 'No charger locations found within the specified range' });
        }

        return res.json({ success: true, data: locationsInRange });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Haversine formula to calculate the distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRadians = (degree) => degree * Math.PI / 180;

    const R = 6371000; // Radius of the Earth in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
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
    getLocationsByStateCityStatus,
    getChargerLocationsInRange
};

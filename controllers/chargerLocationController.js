const ChargerLocation = require('../models/chargerLocationModel');
const SiteSurvey = require('../models/siteSurveyModel');
const PreInstallation = require('../models/preInstallationModel');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION
})


// Create a charger location
const createChargerLocation = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { direction, freepaid, salesManager, dealer, facilities, chargerInfo } = req.body;
        const parsedDirection = JSON.parse(direction);
        const parsedFreepaid = JSON.parse(freepaid);
        const parsedSalesManager = JSON.parse(salesManager);
        const parsedDealer = JSON.parse(dealer);
        const parsedFacilities = JSON.parse(facilities);
        const parsedChargerInfo = JSON.parse(chargerInfo);
        if (!req.files || !req.files.locationImage || req.files.locationImage.length === 0) {
            return res.json({ success: false, message: 'No image file uploaded' });
        }
        // if (!req.files || req.files.length === 0) {
        //     return res.json({ success: false, message: 'No image file uploaded' });
        // }
        const imageKeys = [];
        // console.log(req.files.locationImage)
        for (const file of req.files.locationImage) {
            const arr1 = file.mimetype.split("/");
            const awsImgKey = `locationImg/locationImg-${Date.now()}.${arr1[1]}`;
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
        // const arr1 = req.files.locationImage[0].mimetype.split("/")

        // var awsImgKey = `locationImg/locationImg-${Date.now()}` + "." + arr1[1];

        // const params4 = {
        //     Bucket: process.env.AWS_BUCKET_NAME,
        //     Key: awsImgKey,
        //     Body: req.files.locationImage[0].buffer,
        //     ContentType: req.files.locationImage[0].mimetype
        // }
        // const command4 = new PutObjectCommand(params4);
        // await s3.send(command4);
        // const chargerLocation = new ChargerLocation({...req.body, locationImage : awsImgKey});
        const chargerLocation = new ChargerLocation({
            ...req.body, locationImage: imageKeys, direction: parsedDirection,
            freepaid: parsedFreepaid, salesManager: parsedSalesManager, dealer: parsedDealer, facilities: parsedFacilities, chargerInfo: parsedChargerInfo
        });
        // const chargerLocation = new ChargerLocation(req.body);
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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

const getLocationsByStateCityStatusSitesurvey = async (req, res) => {
    const { state, city, status } = req.body;
    const { checkType } = req.params;

    try {
        const filter = {};
        if (state) filter.state = state;
        if (city) filter.city = city;
        if (status) filter.status = status;

        // Find locations based on the filter
        let locations = await ChargerLocation.find(filter);
        if (locations.length === 0) {
            return res.json({ success: false, message: 'No locations found' });
        }

        // Depending on checkType, filter out locations that have existing site surveys or pre-installations
        if (checkType === 'site-survey') {
            // const surveyedLocations = await SiteSurvey.find({ locationId: { $in: locations.map(loc => loc._id) } });
            // const surveyedLocationIds = surveyedLocations.map(survey => survey.locationId.toString());

            const excludedSurveys = await SiteSurvey.find({
                locationId: { $in: locations.map(loc => loc._id) },
                status: { $in: ["Approved", "Waiting for approval"] }
            });
            const excludedLocationIds = excludedSurveys.map(survey => survey.locationId.toString());
            locations = locations.filter(loc => !excludedLocationIds.includes(loc._id.toString()));
            // console.log(surveyedLocationIds);
            // locations = locations.filter(loc => !surveyedLocationIds.includes(loc._id.toString()));
        } else if (checkType === 'pre-installation') {
            // const preInstalledLocations = await PreInstallation.find({ locationId: { $in: locations.map(loc => loc._id) } });
            // const preInstalledLocationIds = preInstalledLocations.map(preInstall => preInstall.locationId.toString());
            // locations = locations.filter(loc => !preInstalledLocationIds.includes(loc._id.toString()));
            // console.log(preInstalledLocationIds);

            const excludedPre = await PreInstallation.find({
                locationId: { $in: locations.map(loc => loc._id) },
                status: { $in: ["Approved", "Waiting for approval"] }
            });
            const excludedLocationIds = excludedPre.map(pre => pre.locationId.toString());
            locations = locations.filter(loc => !excludedLocationIds.includes(loc._id.toString()));
        }

        if (locations.length === 0) {
            return res.json({ success: false, message: 'No available locations found' });
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

    if (range === 0) {
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

const searchChargerLocations = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.json({ success: false, message: 'Query parameter is required' });
    }
    // console.log(query)
    try {
        const regex = new RegExp(query, 'i');
        const chargerLocations = await ChargerLocation.find({
            $or: [
                { locationName: { $regex: regex } },
                { address: { $regex: regex } }
            ]
        });

        if (chargerLocations.length === 0) {
            return res.json({ success: false, message: 'No charger locations found' });
        }

        return res.json({ success: true, data: chargerLocations });
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
    getLocationsByStateCityStatus,
    getLocationsByStateCityStatusSitesurvey,
    getChargerLocationsInRange,
    searchChargerLocations
};

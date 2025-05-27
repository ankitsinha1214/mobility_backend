const ChargerLocation = require('../models/chargerLocationModel');
const User = require('../models/userModel');
const SiteSurvey = require('../models/siteSurveyModel');
const PreInstallation = require('../models/preInstallationModel');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const ChargingSession = require('../models/chargerSessionModel');
const Payment = require('../models/paymentModel');
const { getCurrencySymbol }  = require('../utils/otherUtil')
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
        const { direction, freepaid, parkingCost, salesManager, dealer, facilities, chargerInfo } = req.body;
        const parsedDirection = JSON.parse(direction);
        const parsedFreepaid = JSON.parse(freepaid);
        const parsedparkingCost = JSON.parse(parkingCost);
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
            freepaid: parsedFreepaid, parkingCost: parsedparkingCost, salesManager: parsedSalesManager, dealer: parsedDealer, facilities: parsedFacilities, chargerInfo: parsedChargerInfo
        });
        // const chargerLocation = new ChargerLocation(req.body);
        await chargerLocation.save();
        return res.json({ success: true, data: chargerLocation, message: 'Charger location created successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// update new location images
// const updateChargerLocationImage = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are not a valid user." });
//         }

//         const { locationId } = req.body; // Assume the location ID is passed in the URL
//         console.log(locationId)
//         const chargerLocation = await ChargerLocation.findById(locationId);

//         if (!chargerLocation) {
//             return res.json({ success: false, message: 'Charger location not found' });
//         }

//         // Ensure new images are uploaded
//         if (!req.files || !req.files.locationImage || req.files.locationImage.length === 0) {
//             return res.json({ success: false, message: 'No image file uploaded' });
//         }

//         const imageKeys = [];
//         for (const file of req.files.locationImage) {
//             const arr1 = file.mimetype.split("/");
//             const awsImgKey = `locationImg/locationImg-${Date.now()}.${arr1[1]}`;
//             const params4 = {
//                 Bucket: process.env.AWS_BUCKET_NAME,
//                 Key: awsImgKey,
//                 Body: file.buffer,
//                 ContentType: file.mimetype
//             };

//             // Upload new image to S3
//             const command4 = new PutObjectCommand(params4);
//             await s3.send(command4);
//             imageKeys.push(awsImgKey);
//         }

//         // If there are existing images, delete the previous ones from S3
//         if (chargerLocation.locationImage && chargerLocation.locationImage.length > 0) {
//             for (const oldImageKey of chargerLocation.locationImage) {
//                 const deleteParams = {
//                     Bucket: process.env.AWS_BUCKET_NAME,
//                     Key: oldImageKey
//                 };
//                 const deleteCommand = new DeleteObjectCommand(deleteParams);
//                 await s3.send(deleteCommand);
//             }
//         }

//         // Update the charger location with the new image(s)
//         chargerLocation.locationImage = imageKeys;
//         await chargerLocation.save();

//         return res.json({ success: true, data: chargerLocation, message: 'Charger location image updated successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
//     }
// };
const updateChargerLocationImage = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are not a valid user." });
        }

        const { locationId } = req.body; // `locationImageUrl` from the request body
        let locationImageUrl = req.body.locationImageUrl;
        if (!Array.isArray(locationImageUrl)) {
            locationImageUrl = [];
        }
        const chargerLocation = await ChargerLocation.findById(locationId);

        if (!chargerLocation) {
            return res.json({ success: false, message: 'Charger location not found' });
        }

        if ((!req.files || !req.files.locationImage || req.files.locationImage.length === 0) && (!locationImageUrl || locationImageUrl?.length === 0)) {
            return res.json({ success: false, message: 'No image file uploaded' });
        }

        // Upload new images to S3
        const newImageKeys = [];
        if (!(!req.files || !req.files.locationImage || req.files.locationImage.length === 0)) {
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
                newImageKeys.push(awsImgKey);
            }
        }

        // Filter out existing images not present in the new request body
        const imagesToKeep = chargerLocation.locationImage.filter(imageKey =>
            locationImageUrl.some(url => url.includes(imageKey))
        );

        // Identify images to delete
        const imagesToDelete = chargerLocation.locationImage.filter(imageKey =>
            !locationImageUrl.some(url => url.includes(imageKey))
        );
        // Delete unwanted images from S3
        for (const oldImageKey of imagesToDelete) {
            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: oldImageKey
            };
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3.send(deleteCommand);
        }

        // Update charger location with the combined array of kept and new images
        chargerLocation.locationImage = [...imagesToKeep, ...newImageKeys];
        await chargerLocation.save();

        return res.json({ success: true, data: chargerLocation, message: 'Charger location image updated successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};

// Add a new charger to an existing charger location
const addChargerToLocation = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { location_id, newChargerInfo } = req.body; // Expecting the charger info to add in request body
        console.log(newChargerInfo);
        // const parsedChargerInfo = JSON.parse(newChargerInfo);
        const parsedChargerInfo = (newChargerInfo);

        // Find the location by location_id
        const chargerLocation = await ChargerLocation.findById(location_id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Location not found' });
        }

        // Check if ChargerId already exists across all locations
        const existingCharger = await ChargerLocation.findOne({
            "chargerInfo.name": parsedChargerInfo.name,
        });
        // console.log(existingCharger)

        if (existingCharger) {
            return res.json({ success: false, message: 'ChargerId already exists in another location' });
        }

        // Append the new charger info to the existing chargerInfo array
        chargerLocation.chargerInfo.push(parsedChargerInfo);

        // Save the updated document
        await chargerLocation.save();

        return res.json({ success: true, message: 'New charger added successfully', data: chargerLocation });
    } catch (error) {
        console.error('Error adding charger:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update an existing charger in a charger location
const updateChargerInLocation = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { location_id, charger_id, updatedChargerInfo } = req.body; // Expecting the charger info to update in request body

        // Find the location by location_id
        const chargerLocation = await ChargerLocation.findById(location_id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Location not found' });
        }

        // Find the index of the charger to be updated
        const chargerIndex = chargerLocation.chargerInfo.findIndex(
            (charger) => charger._id.toString() === charger_id
        );

        if (chargerIndex === -1) {
            return res.json({ success: false, message: 'Charger not found' });
        }

        // Ensure updated ChargerId is not already in use across all locations (except current charger)
        // console.log(updatedChargerInfo.name)

        // if (
        //     updatedChargerInfo.name &&
        //     (await ChargerLocation.findOne({
        //         "chargerInfo.name": updatedChargerInfo.name,
        //         // _id: { $ne: location_id }, // Exclude the current location
        //     }))
        // ) {
        //     return res.json({ success: false, message: 'ChargerId already exists in another location' });
        // }

        // Update the charger info at the specific index
        chargerLocation.chargerInfo[chargerIndex] = {
            ...chargerLocation.chargerInfo[chargerIndex],
            ...updatedChargerInfo,
        };

        // Save the updated document
        await chargerLocation.save();

        return res.json({ success: true, message: 'Charger updated successfully', data: chargerLocation });
    } catch (error) {
        console.error('Error updating charger:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a charger from a charger location
const deleteChargerFromLocation = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { location_id, charger_id } = req.body; // Expecting the charger ID to delete in request body

        // Find the location by location_id
        const chargerLocation = await ChargerLocation.findById(location_id);
        if (!chargerLocation) {
            return res.json({ success: false, message: 'Location not found' });
        }

        // Filter out the charger with the given ID
        const updatedChargerInfo = chargerLocation.chargerInfo.filter(
            (charger) => charger._id.toString() !== charger_id
        );

        if (updatedChargerInfo.length === chargerLocation.chargerInfo.length) {
            return res.json({ success: false, message: 'Charger not found' });
        }

        // Update the chargerInfo array and save the document
        chargerLocation.chargerInfo = updatedChargerInfo;
        await chargerLocation.save();

        return res.json({ success: true, message: 'Charger deleted successfully', data: chargerLocation });
    } catch (error) {
        console.error('Error deleting charger:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};



// Get all charger info only
const getAllChargers = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        // Find all ChargerLocation documents but only return the chargerInfo field
        const chargers = await ChargerLocation.find({}, 'chargerInfo locationType locationName city state address');

        if (chargers.length === 0) {
            return res.json({
                success: false,
                message: 'No chargers found'
            });
        }

        res.json({
            success: true,
            data: chargers
        });
    } catch (error) {
        console.error('Error fetching charger info:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getFilteredChargers = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }

        const { status = "all", search = "", sortField = "chargerInfo.name", sortOrder = "asc" } = req.query;

        let query = {};

        // Apply status filter using $elemMatch to only return documents where at least one charger has the specified status
        if (status === "inactive") {
            query["chargerInfo"] = { $elemMatch: { status: "Inactive" } };
        } else if (status === "active") {
            query["chargerInfo"] = { $elemMatch: { status: { $ne: "Inactive" } } }; // All chargers except inactive
        } else if (status === "live") {
            query["chargerInfo"] = { $elemMatch: { status: "Charging" } };
        }

        // Apply text search (charger name or location name)
        if (search) {
            query["$or"] = [
                { "chargerInfo.name": { $regex: search, $options: "i" } },
                { "locationName": { $regex: search, $options: "i" } }
            ];
        }

        // Sorting logic
        const sortQuery = {};
        if (sortField) {
            sortQuery[sortField] = sortOrder === "desc" ? -1 : 1;
        }

        // Fetch chargers with required fields
        const chargers = await ChargerLocation.find(query, "locationName chargerInfo")
            .sort(sortQuery)
            .lean(); // Better performance

        // Filter out only chargers with the correct status inside `chargerInfo`
        const formattedData = chargers.flatMap(location =>
            (location.chargerInfo || [])
                .filter(charger => {
                    if (status === "inactive") return charger.status === "Inactive";
                    if (status === "active") return charger.status !== "Inactive";
                    if (status === "live") return charger.status === "Charging";
                    return true; // Default case, return all
                })
                .map(charger => ({
                    locationName: location.locationName,
                    "chargerId": charger.name || "N/A",
                    "status": charger.status || "Unknown",
                    "energyCons": charger.energyConsumptions || "0 kWh",
                    "lastPing": charger.lastPing || null
                }))
        );

        if (formattedData.length === 0) {
            return res.json({
                success: false,
                message: "No chargers found",
                data: [],
            });
        }

        res.json({
            success: true,
            message: "Chargers Retrieved Successfully!!",
            data: formattedData
        });

    } catch (error) {
        console.error("Error fetching chargers:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};




// const getFilteredChargers = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//         }

//         const {
//             status = "all",
//             page = 1,
//             limit = 10,
//             search = "",
//             sortField = "chargerInfo.name",
//             sortOrder = "asc"
//         } = req.query;

//         let query = {};

//         // Filter by charger status
//         if (status === "active") query["chargerInfo.status"] = "Active";
//         if (status === "inactive") query["chargerInfo.status"] = "Inactive";
//         if (status === "live") query["chargerInfo.status"] = "Charging";

//         // Apply text search (charger name or location name)
//         if (search) {
//             query["$or"] = [
//                 { "chargerInfo.name": { $regex: search, $options: "i" } },
//                 { "locationName": { $regex: search, $options: "i" } }
//             ];
//         }

//         // Convert pagination values
//         const pageNumber = parseInt(page, 10) || 1;
//         const limitNumber = parseInt(limit, 10) || 10;
//         const skip = (pageNumber - 1) * limitNumber;

//         // Sorting logic
//         const sortQuery = {};
//         if (sortField) {
//             sortQuery[sortField] = sortOrder === "desc" ? -1 : 1;
//         }

//         // Fetch chargers with required fields
//         const chargers = await ChargerLocation.find(query,
//             "locationName chargerInfo.name chargerInfo.lastPing chargerInfo.energyConsumed"
//         )
//             .sort(sortQuery) // Sorting
//             .skip(skip) // Pagination
//             .limit(limitNumber)
//             .lean(); // Better performance

//         // Flatten `chargerInfo` and rename fields
//         const formattedData = chargers.flatMap(location =>
//             (location.chargerInfo || []).map(charger => ({
//                 locationName: location.locationName,
//                 "chargerInfo.name": charger.name || "N/A",
//                 "chargerInfo.energyCons": charger.energyConsumed || 0,
//                 "chargerInfo.lastPing": charger.lastPing || null
//             }))
//         );

//         if (formattedData.length === 0) {
//             return res.json({
//                 success: false,
//                 message: "No chargers found",
//                 data: [],
//             });
//         }

//         // Get total count for pagination
//         // const totalCount = await ChargerLocation.countDocuments(query);
//         // Get total count for pagination
//         const totalCount = await ChargerLocation.aggregate([
//             { $match: query },
//             { $unwind: "$chargerInfo" },
//             { $count: "total" }
//         ]);

//         const totalRecords = totalCount.length > 0 ? totalCount[0].total : 0;
//         res.json({
//             success: true,
//             data: formattedData,
//             pagination: {
//                 totalRecords: totalRecords,  // <-- Updated this line
//                 currentPage: pageNumber,
//                 totalPages: Math.ceil(totalRecords / limitNumber), // <-- Updated this line
//                 perPage: limitNumber,
//             },
//         });

//         // res.json({
//         //     success: true,
//         //     data: formattedData,
//         //     pagination: {
//         //         totalRecords: totalCount,
//         //         currentPage: pageNumber,
//         //         totalPages: Math.ceil(totalCount / limitNumber),
//         //         perPage: limitNumber,
//         //     },
//         // });

//     } catch (error) {
//         console.error("Error fetching chargers:", error);
//         res.status(500).json({
//             success: false,
//             message: "Internal server error",
//         });
//     }
// };


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

// get location type with count and percentage 
const getLocationTypesCountPercentage = async (req, res) => {
    try {
        const totalLocations = await ChargerLocation.countDocuments(); // Total count of all locations

        const locationTypes = await ChargerLocation.aggregate([
            {
                $group: {
                    _id: '$locationType', // Group by locationType
                    count: { $sum: 1 }, // Count occurrences
                },
            },
            {
                $project: {
                    _id: 0,
                    locationType: '$_id',
                    count: 1,
                    percentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$count', totalLocations] }, 100] },
                            2, // Round to 2 decimal places
                        ],
                    },
                },
            },
        ]);

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
    const { latitude, longitude, status, range, userPhone } = req.body;

    if (range === 0) {
        return res.json({ success: true, data: null, message: 'No charger found!' });
    }
    if (!latitude || !longitude || !range) {
        return res.json({ success: false, message: 'Latitude, longitude, and range are required' });
    }

    try {
        // Find the session by sessionId
        let sessionId = null;
        let status1 = null;
        const session = await ChargingSession.findOne({ userPhone, status: { $in: ["Started", "Stopped"] } });
        if (session) {
            sessionId = session._id;
            status1 = session.status;
        }
        // Convert range from kilometers to meters
        const rangeInMeters = range * 1000;

        // Get all charger locations
        const locations = await ChargerLocation.find(status ? { status } : {}).select('direction chargerInfo');
        // const locations = await ChargerLocation.find(status ? { status } : {});

        // Filter locations within the specified range using Haversine formula
        const locationsInRange = locations.filter(location => {
            const distance = calculateDistance(latitude, longitude, location.direction.latitude, location.direction.longitude);
            return distance <= rangeInMeters;
        });

        if (locationsInRange.length === 0) {
            return res.json({ success: false, message: 'No charger locations found within the specified range', sessionInfo: { sessionId, status: status1 } });
        }

        // Extract only `_id` and `chargerInfo.status`
        const sanitizedLocations = locationsInRange.map(({ _id, direction, chargerInfo }) => ({
            _id,
            direction,
            chargerInfo: chargerInfo.map(({ status }) => ({ status })) // Extract only `status` from each chargerInfo object
        }));

        return res.json({ success: true, data: sanitizedLocations, sessionInfo: { sessionId, status: status1 } });
        // return res.json({ success: true, data: locationsInRange, sessionInfo: { sessionId, status: status1 } });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getChargerLocationsNearInRange = async (req, res) => {
    const { latitude, longitude, status, range, userPhone } = req.body;

    if (range === 0) {
        return res.json({ success: true, data: null, message: 'No charger found!' });
    }
    if (!latitude || !longitude || !range) {
        return res.json({ success: false, message: 'Latitude, longitude, and range are required' });
    }

    try {
        // Find the session by sessionId
        let sessionId = null;
        let status1 = null;
        const session = await ChargingSession.findOne({ userPhone, status: { $in: ["Started", "Stopped"] } });
        if (session) {
            sessionId = session._id;
            status1 = session.status;
        }
        // Convert range from kilometers to meters
        const rangeInMeters = range * 1000;

        // Get all charger locations
        // const locations = await ChargerLocation.find(status ? { status } : {}).select('direction chargerInfo');
        const locations = await ChargerLocation.find(status ? { status } : {});

        // Filter locations within the specified range using Haversine formula
        const locationsInRange = locations.filter(location => {
            const distance = calculateDistance(latitude, longitude, location.direction.latitude, location.direction.longitude);
            return distance <= rangeInMeters;
        });

        if (locationsInRange.length === 0) {
            return res.json({ success: false, message: 'No charger locations found within the specified range', sessionInfo: { sessionId, status: status1 } });
        }

        // return res.json({ success: true, data: sanitizedLocations, sessionInfo: { sessionId, status: status1 } });
        return res.json({ success: true, data: locationsInRange, sessionInfo: { sessionId, status: status1 } });
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
    // const { status } = req.body;

    if (!query) {
        return res.json({ success: false, message: 'Query parameter is required' });
    }
    // console.log(query)
    try {
        const regex = new RegExp(query, 'i');
        const chargerLocations = await ChargerLocation.find({
            status: 'Active',
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

const getChargerLocationsInfoByName = async (req, res) => {
    const { chargerName } = req.body;

    if (!chargerName) {
        return res.json({ status: false, message: 'chargerId is required' });
    }

    try {
        const chargerLocation = await ChargerLocation.findOne({
            'chargerInfo.name': chargerName
        }).select('locationName locationType freepaid chargerInfo');
        // }).select('locationName locationType state city address direction chargerInfo');

        if (!chargerLocation) {
            return res.json({ status: false, message: 'Charger not found' });
        }

        // Find the specific chargerInfo within the location
        const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerName);

        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger details not found in the location' });
        }

        return res.json({
            status: true,
            message: 'Charger info retrieved successfully',
            data: {
                location: {
                    locationId: chargerLocation._id,
                    locationName: chargerLocation.locationName,
                    locationType: chargerLocation.locationType,
                    // state: chargerLocation.state,
                    // city: chargerLocation.city,
                    // address: chargerLocation.address,
                    freepaid: chargerLocation.freepaid,
                },
                chargerInfo
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

// SESSION DETAILS 
const getChargerSessionsDetails = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.json({ status: false, message: 'sessionId is required' });
    }

    try {
        const chargerLocation = await ChargerLocation.findOne({
            'chargerInfo.name': chargerName
        }).select('locationName locationType freepaid chargerInfo');
        // }).select('locationName locationType state city address direction chargerInfo');

        if (!chargerLocation) {
            return res.json({ status: false, message: 'Charger not found' });
        }

        // Find the specific chargerInfo within the location
        const chargerInfo = chargerLocation.chargerInfo.find(charger => charger.name === chargerName);

        if (!chargerInfo) {
            return res.json({ status: false, message: 'Charger details not found in the location' });
        }

        return res.json({
            status: true,
            message: 'Charger info retrieved successfully',
            data: {
                location: {
                    locationName: chargerLocation.locationName,
                    locationType: chargerLocation.locationType,
                    // state: chargerLocation.state,
                    // city: chargerLocation.city,
                    // address: chargerLocation.address,
                    freepaid: chargerLocation.freepaid,
                },
                chargerInfo
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

// const getDashboardData = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//         }

//         // Fetch only chargerInfo field from all documents
//         const chargerLocations = await ChargerLocation.find({}, 'chargerInfo');

//         // Fetch users data for vehicle type count
//         const users = await User.find({}, 'user_vehicle');
//         if (chargerLocations.length === 0) {
//             return res.json({
//                 success: false,
//                 message: 'No chargers found',
//                 data: {
//                     totalChargers: 0,
//                     availableChargers: 0,
//                     inUseChargers: 0,
//                     inactiveChargers: 0,
//                     twoWheelerUsers: 0,
//                     threeWheelerUsers: 0,
//                     fourWheelerUsers: 0
//                 }
//             });
//         }

//         // Initialize counters
//         let totalChargers = 0;
//         let availableChargers = 0;
//         let inUseChargers = 0;
//         let inactiveChargers = 0;

//         // Initialize counters for vehicle types
//         let twoWheelerUsers = 0;
//         let threeWheelerUsers = 0;
//         let fourWheelerUsers = 0;

//         // Loop through all locations and count chargers based on status
//         chargerLocations.forEach(location => {
//             location.chargerInfo.forEach(charger => {
//                 totalChargers++;
//                 if (charger.status === 'Available') {
//                     availableChargers++;
//                 } else if (charger.status === 'Inactive') {
//                     inactiveChargers++;
//                 }
//                 // else if (charger.status === 'Charging' || charger.status === 'Preparing') {
//                 else {
//                     inUseChargers++;
//                 }
//             });
//         });

//         // Count users based on vehicle type
//         users.forEach(user => {
//             user.user_vehicle.forEach(vehicle => {
//                 if (vehicle.type === '2-Wheeler') {
//                     twoWheelerUsers++;
//                 } else if (vehicle.type === '3-Wheeler') {
//                     threeWheelerUsers++;
//                 } else if (vehicle.type === '4-Wheeler') {
//                     fourWheelerUsers++;
//                 }
//             });
//         });

//         res.json({
//             success: true,
//             data: {
//                 totalChargers,
//                 availableChargers,
//                 inUseChargers,
//                 inactiveChargers,
//                 twoWheelerUsers,
//                 threeWheelerUsers,
//                 fourWheelerUsers
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Internal server error'
//         });
//     }
// };
const getDashboardData = async (req, res) => {
    try {
        const { currency } = req.body;
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        // if (!currency) {
        //     return res.json({ success: false, message: "Currency is required." });
        // }
        const currencySymbol = getCurrencySymbol(currency);

        // Fetch charger locations
        const chargerLocations = await ChargerLocation.find({}, 'chargerInfo locationName');

        // Fetch user vehicle data
        const users = await User.find({}, 'user_vehicle');

        // Fetch charging sessions
        const chargingSessions = await ChargingSession.find({}, 'status vehicleId chargerId startMeterValue endMeterValue');

        if (chargerLocations.length === 0) {
            return res.json({
                success: false,
                message: 'No chargers found',
                data: {
                    totalChargers: 0,
                    availableChargers: 0,
                    inUseChargers: 0,
                    inactiveChargers: 0,
                    twoWheelerUsers: 0,
                    threeWheelerUsers: 0,
                    fourWheelerUsers: 0,
                    activeSessions: 0,
                    topVehicles: [],
                    topLocations: []
                }
            });
        }

        // Charger count variables
        let totalChargers = 0;
        let availableChargers = 0;
        let inUseChargers = 0;
        let inactiveChargers = 0;

        // Vehicle type counters
        let twoWheelerUsers = 0;
        let threeWheelerUsers = 0;
        let fourWheelerUsers = 0;

        // Active sessions count
        let activeSessions = chargingSessions.filter(session => session.status === 'Started').length;

        // Track vehicle session count
        let vehicleStats = new Map();
        let locationStats = new Map();

        // Loop through all charger locations
        chargerLocations.forEach(location => {
            location.chargerInfo.forEach(charger => {
                totalChargers++;
                if (charger.status === 'Available') {
                    availableChargers++;
                } else if (charger.status === 'Inactive') {
                    inactiveChargers++;
                } else {
                    inUseChargers++;
                }
            });

            // Initialize location stats
            locationStats.set(location._id.toString(), {
                locationName: location.locationName,
                sessions: 0,
                energyConsumed: 0,
                revenue: 0
            });
        });

        // Count user vehicles by type
        users.forEach(user => {
            if (user.user_vehicle) {
                user.user_vehicle.forEach(vehicle => {
                    if (vehicle.type === '2-Wheeler') {
                        twoWheelerUsers++;
                    } else if (vehicle.type === '3-Wheeler') {
                        threeWheelerUsers++;
                    } else if (vehicle.type === '4-Wheeler') {
                        fourWheelerUsers++;
                    }
                });
            }
        });

        // Count vehicle sessions and energy consumption
        for (const session of chargingSessions) {
            const vehicleId = session.vehicleId.toString();
            const chargerId = session.chargerId.toString();
            // console.log(vehicleId);
            // console.log(chargerId);

            // Count vehicle usage
            if (!vehicleStats.has(vehicleId)) {
                const vehicleOwner = await User.findOne({ "user_vehicle._id": vehicleId }, { "user_vehicle.$": 1 });
                // console.log(vehicleOwner);
                if (vehicleOwner && vehicleOwner.user_vehicle.length > 0) {
                    const { type, make, model, variant } = vehicleOwner.user_vehicle[0];
                    vehicleStats.set(vehicleId, { type, make, model, variant, sessions: 0 });
                }
                else {
                    // Skip if no valid vehicle found
                    continue;
                }
                // console.log(vehicleStats);
            }
            // console.log(vehicleStats);
            vehicleStats.get(vehicleId).sessions++;

            // Count location-based stats
            const location = chargerLocations.find(loc => loc.chargerInfo.some(ch => ch.name.toString() === chargerId));
            if (location) {
                const locationId = location._id.toString();
                let energyConsumed = session.endMeterValue - session.startMeterValue || 0;
                // let revenue = energyConsumed * 10; // Assuming ₹10 per kWh (modify as needed)
                // Fetch the actual payment details using sessionId
                const payment = await Payment.findOne({ sessionId: session._id, status: 'captured' }); // Only captured payments

                let revenue = payment ? payment.amount / 100 : 0;

                let locData = locationStats.get(locationId) || {
                    locationName: location.locationName,
                    sessions: 0,
                    energyConsumed: 0,
                    revenue: 0
                };
                locData.sessions++;
                locData.energyConsumed += energyConsumed;
                locData.revenue += revenue;
                locationStats.set(locationId, locData);
            }
        }

        // Sort and get top 10 vehicles
        // let topVehicles = Array.from(vehicleStats.values())
        //     .sort((a, b) => b.sessions - a.sessions)
        //     .slice(0, 10);
        // Define color mapping based on type
        const vehicleColorMap = {
            "2w": "blue",
            "3w": "orange",
            "4w": "green"
        };

        // Sort and transform vehicle stats to required format
        let topVehicles = Array.from(vehicleStats.values())
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 10)
            .map(vehicle => ({
                name: `${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim(),
                type: vehicle.type === "2-Wheeler" ? "2w"
                    : vehicle.type === "3-Wheeler" ? "3w"
                        : vehicle.type === "4-Wheeler" ? "4w"
                            : "unknown",
                visits: vehicle.sessions,
                color: vehicleColorMap[
                    vehicle.type === "2-Wheeler" ? "2w"
                        : vehicle.type === "3-Wheeler" ? "3w"
                            : "4w"
                ] || "gray" // Default color if type is unknown
            }));

        // Sort and get top 10 locations
        // let topLocations = Array.from(locationStats.values())
        //     .sort((a, b) => b.sessions - a.sessions)
        //     .slice(0, 10);
        // Sort and transform location stats to required format
        // console.log(locationStats)
        let topLocations = Array.from(locationStats.values())
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 10)
            .map(location => ({
                name: location.locationName,
                visits: location.sessions,
                energy: `${location.energyConsumed} Wh`,
                revenue: `${currencySymbol} ${location.revenue.toLocaleString("en-IN")}`, // Format with commas
                color: "purple"
            }));

        res.json({
            success: true,
            data: {
                totalChargers,
                availableChargers,
                inUseChargers,
                inactiveChargers,
                twoWheelerUsers,
                threeWheelerUsers,
                fourWheelerUsers,
                activeSessions,
                topVehicles,
                topLocations
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};




module.exports = {
    createChargerLocation,
    updateChargerLocationImage,
    addChargerToLocation,
    updateChargerInLocation,
    deleteChargerFromLocation,
    getAllChargers,
    getFilteredChargers,
    getChargerLocations,
    getLocationTypes,
    getLocationTypesCountPercentage,
    getChargerLocationById,
    updateChargerLocation,
    deleteChargerLocation,
    getAllLocations,
    changeChargerStatus,
    getLocationsByStateCityStatus,
    getLocationsByStateCityStatusSitesurvey,
    getChargerLocationsInRange,
    getChargerLocationsNearInRange,
    searchChargerLocations,
    getChargerLocationsInfoByName,
    getChargerSessionsDetails,
    getDashboardData
};

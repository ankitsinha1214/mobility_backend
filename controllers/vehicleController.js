const VehicleModel = require('../models/vehicleModel');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION
})

// Get vehicle make, model, and variant hierarchy
// const getVehicleHierarchy = async (req, res) => {
//     try {
//         const vehicleModels = await VehicleModel.find({});

//         const hierarchy = {};

//         vehicleModels.forEach(vehicle => {
//             const { make, model, variant, ARAI_range, claimed_range, image } = vehicle;

//             if (!hierarchy[make]) {
//                 hierarchy[make] = {};
//             }

//             if (!hierarchy[make][model]) {
//                 hierarchy[make][model] = [];
//             }

//             // Check if variant already exists in the hierarchy
//             const existingVariant = hierarchy[make][model].find(v => v.variant === variant);
//             if (existingVariant) {
//                 // Update existing variant with additional data
//                 existingVariant.ARAI_range = ARAI_range;
//                 existingVariant.claimed_range = claimed_range;
//                 existingVariant.image = image;
//             } else {
//                 // Add new variant with additional data
//                 hierarchy[make][model].push({
//                     variant,
//                     ARAI_range,
//                     claimed_range,
//                     image
//                 });
//             }
//         });

//         return res.json({ success: true, data: [hierarchy] });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
//     }
// };

const getVehicleHierarchy = async (req, res) => {
    try {
        const vehicleModels = await VehicleModel.find({});

        const hierarchy = {};

        vehicleModels.forEach(vehicle => {
            const { make, model, variant, type, ARAI_range, claimed_range, image } = vehicle;

            // Ensure `type` exists in the hierarchy
            if (!hierarchy[type]) {
                hierarchy[type] = {};
            }

            // Ensure `make` exists under `type`
            if (!hierarchy[type][make]) {
                hierarchy[type][make] = {};
            }

            // Ensure `model` exists under `make`
            if (!hierarchy[type][make][model]) {
                hierarchy[type][make][model] = [];
            }

            // Check if the variant already exists under model
            const existingVariant = hierarchy[type][make][model].find(v => v.variant === variant);
            if (existingVariant) {
                // Update existing variant with additional data
                existingVariant.ARAI_range = ARAI_range;
                existingVariant.claimed_range = claimed_range;
                existingVariant.image = image;
            } else {
                // Add new variant with additional data
                hierarchy[type][make][model].push({
                    variant,
                    ARAI_range,
                    claimed_range,
                    image
                });
            }
        });

        return res.json({ success: true, data: [hierarchy] });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Create a new vehicle model
const createVehicleModel = async (req, res) => {
    const { make, model, variant, type, ARAI_range, claimed_range, image } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        // Check if the vehicle model already exists
        const existingModel = await VehicleModel.findOne({ make, model, variant }); // type need to be check if required
        if (existingModel) {
            return res.json({ success: false, message: 'Vehicle model already exists' });
        }
        const arr1 = req.files.image[0].mimetype.split("/")

        var awsImgKey = `vechileImg/vehicleImg-${Date.now()}` + "." + arr1[1];

        const params4 = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: awsImgKey,
            Body: req.files.image[0].buffer,
            ContentType: req.files.image[0].mimetype
        }
        const command4 = new PutObjectCommand(params4);
        await s3.send(command4);
        const newVehicleModel = new VehicleModel({  ...req.body, make, model, variant, type, ARAI_range, claimed_range, image: awsImgKey });
        await newVehicleModel.save();

        return res.json({ success: true, data: newVehicleModel, message: "Vehicle model created successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Get all vehicle models
const getAllVehicleModels = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const vehicleModels = await VehicleModel.find({});
        if (vehicleModels.length > 0) {
            return res.json({ success: true, data: vehicleModels });
        } else {
            return res.json({ success: false, message: "No vehicle models found" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Get a vehicle model by ID
const getVehicleModelById = async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const vehicleModel = await VehicleModel.findById(id);

        if (!vehicleModel) {
            return res.status(404).json({ success: false, message: "Vehicle model not found" });
        }

        return res.json({ success: true, data: vehicleModel });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

const searchVehicle = async (req, res) => {
    if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    const { query } = req.query;
    // const { status } = req.body;

    // if (!query) {
    //     return res.json({ success: false, message: 'Query parameter is required' });
    // }
    // console.log(query)
    try {
        const regex = new RegExp(query, 'i');
        const chargerLocations = await VehicleModel.find({
            // status: 'Active',
            $or: [
                { make: { $regex: regex } },
                { model: { $regex: regex } },
                { variant: { $regex: regex } },
                { vehicle_reg: { $regex: regex } },
            ]
        });

        if (chargerLocations.length === 0) {
            return res.json({ success: false, message: 'No vehicle found' });
        }

        return res.json({ success: true, data: chargerLocations, message: "Vehicle fetched successfully." });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update a vehicle model
const updateVehicleModel = async (req, res) => {
    const { id } = req.params;
    const { make, model, variant, type, ARAI_range, claimed_range, image } = req.body;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const vehicleModel = await VehicleModel.findById(id);

        if (!vehicleModel) {
            return res.status(404).json({ success: false, message: "Vehicle model not found" });
        }

        vehicleModel.make = make;
        vehicleModel.model = model;
        vehicleModel.variant = variant;
        vehicleModel.type = type;
        vehicleModel.ARAI_range = ARAI_range;
        vehicleModel.claimed_range = claimed_range;
        vehicleModel.image = image;

        await vehicleModel.save();

        return res.json({ success: true, data: vehicleModel, message: "Vehicle model updated successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

// Delete a vehicle model
const deleteVehicleModel = async (req, res) => {
    const { id } = req.params;

    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const vehicleModel = await VehicleModel.findByIdAndDelete(id);

        if (!vehicleModel) {
            return res.status(404).json({ success: false, message: "Vehicle model not found" });
        }

        return res.json({ success: true, message: "Vehicle model deleted successfully" });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
};

module.exports = {
    getVehicleHierarchy,
    createVehicleModel,
    getAllVehicleModels,
    getVehicleModelById,
    updateVehicleModel,
    deleteVehicleModel,
    searchVehicle
};

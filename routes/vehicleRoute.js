const express = require('express');
const router = express.Router();
const vehicleModelController = require('../controllers/vehicleController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new vehicle model
router.post('/',
    upload.fields([{
        name: 'image', maxCount: 6
    }
    ]),
    vehicleModelController.createVehicleModel);

// Get all vehicle models
router.get('/', vehicleModelController.getAllVehicleModels);

router.get('/all', vehicleModelController.getVehicleHierarchy);

// Get a vehicle model by ID
router.get('/:id', vehicleModelController.getVehicleModelById);

// Update a vehicle model
router.put('/:id', vehicleModelController.updateVehicleModel);

// Delete a vehicle model
router.delete('/:id', vehicleModelController.deleteVehicleModel);

module.exports = router;

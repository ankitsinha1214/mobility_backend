const express = require('express');
const router = express.Router();
const vehicleModelController = require('../controllers/vehicleController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fetchUser = require('../middleware/fetchuser');

// Create a new vehicle model
router.post('/',fetchUser, 
    upload.fields([{
        name: 'image', maxCount: 6
    }
    ]),
    vehicleModelController.createVehicleModel);

// Get all vehicle models
router.get('/',fetchUser,  vehicleModelController.getAllVehicleModels);

router.get('/all', fetchUser, vehicleModelController.getVehicleHierarchy);

// Get a vehicle model by ID
router.get('/:id', fetchUser, vehicleModelController.getVehicleModelById);

// Update a vehicle model
router.put('/:id', fetchUser, vehicleModelController.updateVehicleModel);

// Delete a vehicle model
router.delete('/:id', fetchUser, vehicleModelController.deleteVehicleModel);

module.exports = router;

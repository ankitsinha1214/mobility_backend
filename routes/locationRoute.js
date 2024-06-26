// routes/locationRoutes.js
const locationController = require("../controllers/locationController");
const router = require("express").Router();

// Routes
router.post('/', locationController.createLocation);
router.get('/', locationController.getLocations);
router.get('/:id', locationController.getLocationById);
router.put('/:id', locationController.updateLocation);
router.delete('/:id', locationController.deleteLocation);
router.get('/structured/all', locationController.getAllLocations);

module.exports = router;

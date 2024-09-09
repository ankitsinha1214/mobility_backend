// routes/locationRoutes.js
const locationController = require("../controllers/locationController");
const router = require("express").Router();
const fetchUser = require('../middleware/fetchuser');

// Routes
router.post('/', fetchUser,  locationController.createLocation);
router.get('/', fetchUser,  locationController.getLocations);
router.get('/:id', fetchUser,  locationController.getLocationById);
router.put('/:id',  fetchUser, locationController.updateLocation);
router.delete('/:id', fetchUser,  locationController.deleteLocation);
router.get('/structured/all',  locationController.getAllLocations);

module.exports = router;

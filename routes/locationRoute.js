// routes/locationRoutes.js

const express = require('express');
const router = express.Router();
const {
    createLocation,
    getLocations,
    getLocationById,
    updateLocation,
    deleteLocation
} = require('../controllers/locationController');

// Routes
router.post('/', createLocation);
router.get('/', getLocations);
router.get('/:id', getLocationById);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);

module.exports = router;

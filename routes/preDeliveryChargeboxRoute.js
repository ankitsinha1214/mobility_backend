const express = require('express');
const router = express.Router();
const {
    createPreDeliveryChargeboxResponse,
    getAllPreDeliveryChargeboxResponses,
    getPreDeliveryChargeboxResponseById,
    updatePreDeliveryChargeboxResponse,
    deletePreDeliveryChargeboxResponse,
    getPreDeliveryChargeboxResponsesByUserId,
    checkChargeboxIdExists
} = require('../controllers/preDeliveryChargeboxController'); // Adjust the path as needed
const checkUserStatus = require('../middleware/checkuserstatus');

// Route to create a new PreDeliveryChargeboxResponse
router.post('/', checkUserStatus, createPreDeliveryChargeboxResponse);

// Route to get all PreDeliveryChargeboxResponses
router.get('/', getAllPreDeliveryChargeboxResponses);

// Route to get a PreDeliveryChargeboxResponse by ID
router.get('/:id', getPreDeliveryChargeboxResponseById);

// Route to update a PreDeliveryChargeboxResponse by ID
router.put('/:id', updatePreDeliveryChargeboxResponse);

// Route to delete a PreDeliveryChargeboxResponse by ID
router.delete('/:id', deletePreDeliveryChargeboxResponse);

// Get PreDeliveryChargeboxResponses by User ID
router.get('/user/:userId', getPreDeliveryChargeboxResponsesByUserId);

// Check if chargebox_id already exists
router.get('/check/:chargebox_id', checkChargeboxIdExists);

module.exports = router;

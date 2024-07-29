const express = require('express');
const router = express.Router();
const {
    createPreDeliveryChargeboxResponse,
    getAllPreDeliveryChargeboxResponses,
    getPreDeliveryChargeboxResponseById,
    updatePreDeliveryChargeboxResponse,
    deletePreDeliveryChargeboxResponse,
    getPreDeliveryChargeboxResponsesByUserId
} = require('../controllers/preDeliveryChargeboxController'); // Adjust the path as needed

// Route to create a new PreDeliveryChargeboxResponse
router.post('/', createPreDeliveryChargeboxResponse);

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

module.exports = router;

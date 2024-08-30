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
// const checkUserStatus = require('../middleware/checkuserstatus');
const fetchUser = require('../middleware/fetchuser');


// Route to create a new PreDeliveryChargeboxResponse
router.post('/',fetchUser, createPreDeliveryChargeboxResponse);

// Route to get all PreDeliveryChargeboxResponses
router.get('/',fetchUser, getAllPreDeliveryChargeboxResponses);

// Route to get a PreDeliveryChargeboxResponse by ID
router.get('/:id',fetchUser, getPreDeliveryChargeboxResponseById);

// Route to update a PreDeliveryChargeboxResponse by ID
router.put('/:id',fetchUser, updatePreDeliveryChargeboxResponse);

// Route to delete a PreDeliveryChargeboxResponse by ID
router.delete('/:id',fetchUser, deletePreDeliveryChargeboxResponse);

// Get PreDeliveryChargeboxResponses by User ID
router.get('/user/:userId',fetchUser, getPreDeliveryChargeboxResponsesByUserId);

// Check if chargebox_id already exists
router.get('/check/:chargebox_id',fetchUser, checkChargeboxIdExists);

module.exports = router;

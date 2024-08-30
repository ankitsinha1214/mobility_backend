const express = require('express');
const router = express.Router();
const {
    createChargerAndDcBox,
    getAllChargerAndDcBox,
    getChargerAndDcBoxById,
    deleteChargerAndDcBoxById,
    getFilteredLocationsWithApprovedPreInstallation,
    updateStatusByType,
    checkChargerAndDcBoxWaitingForApproval
} = require('../controllers/chargerAndDcBoxController');
const checkUserStatus = require('../middleware/checkuserstatus');
const fetchUser = require('../middleware/fetchuser');

// Create a new ChargerAndDcBox
router.post('/', fetchUser, checkUserStatus, createChargerAndDcBox);

// Get all ChargerAndDcBox entries
router.get('/', fetchUser, getAllChargerAndDcBox);

// Get ChargerAndDcBox by ID
router.get('/:id', fetchUser, getChargerAndDcBoxById);

// Delete ChargerAndDcBox by ID
router.delete('/:id', fetchUser, deleteChargerAndDcBoxById);

// filtering location who have approved preInstallation
router.post('/filtered-locations-approved', fetchUser, getFilteredLocationsWithApprovedPreInstallation);

// change the status
router.post('/change-status', fetchUser, updateStatusByType);

// check charger and dc box already exist or not
router.post('/check-already-exist', fetchUser, checkChargerAndDcBoxWaitingForApproval);

module.exports = router;
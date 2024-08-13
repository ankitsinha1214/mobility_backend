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

// Create a new ChargerAndDcBox
router.post('/', createChargerAndDcBox);

// Get all ChargerAndDcBox entries
router.get('/', getAllChargerAndDcBox);

// Get ChargerAndDcBox by ID
router.get('/:id', getChargerAndDcBoxById);

// Delete ChargerAndDcBox by ID
router.delete('/:id', deleteChargerAndDcBoxById);

// filtering location who have approved preInstallation
router.post('/filtered-locations-approved', getFilteredLocationsWithApprovedPreInstallation);

// change the status
router.post('/change-status', updateStatusByType);

// check charger and dc box already exist or not
router.post('/check-already-exist', checkChargerAndDcBoxWaitingForApproval);

module.exports = router;
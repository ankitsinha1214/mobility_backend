const express = require('express');
const router = express.Router();
const {
    createPreInstallation,
    getAllPreInstallations,
    getPreInstallationById,
    getPreInstallationsByUserId,
    deletePreInstallationById
} = require('../controllers/preInstallationController');
const checkUserStatus = require('../middleware/checkuserstatus');
const fetchUser = require('../middleware/fetchuser');

// Create a new PreInstallation
router.post('/', fetchUser, checkUserStatus, createPreInstallation);

// Get all PreInstallations
router.get('/', getAllPreInstallations);

// Get PreInstallation by ID
router.get('/:id', getPreInstallationById);

// Get all PreInstallations by userId
router.get('/user/:userId', getPreInstallationsByUserId);

// Delete PreInstallation by ID
router.delete('/:id', deletePreInstallationById);

module.exports = router;

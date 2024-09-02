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
router.get('/', fetchUser, getAllPreInstallations);

// Get PreInstallation by ID
router.get('/:id', fetchUser, getPreInstallationById);

// Get all PreInstallations by userId
router.get('/user/:userId', fetchUser, getPreInstallationsByUserId);

// Delete PreInstallation by ID
router.delete('/:id', fetchUser, deletePreInstallationById);

module.exports = router;

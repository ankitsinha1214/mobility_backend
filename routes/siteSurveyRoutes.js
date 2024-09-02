const express = require('express');
const router = express.Router();
const {
    createSiteSurvey,
    getAllSiteSurveys,
    getSiteSurveyById,
    getSiteSurveysByUserId,
    deleteSiteSurveyById,
    getSiteSurveyByLocationId
} = require('../controllers/siteSurveyController');

const checkUserStatus = require('../middleware/checkuserstatus');
const fetchUser = require('../middleware/fetchuser');

// Route to create a new site survey
router.post('/', fetchUser , checkUserStatus, createSiteSurvey);

// Route to get all site surveys
router.get('/', fetchUser, getAllSiteSurveys);

// Route to get a site survey by ID
router.get('/:id', fetchUser, getSiteSurveyById);

// Route to get all site surveys by user ID
router.get('/user/:userId', fetchUser, getSiteSurveysByUserId);

// Route to get all approved site surveys by Location ID
router.post('/location', fetchUser, getSiteSurveyByLocationId);

// Route to delete a site survey by ID
router.delete('/:id', fetchUser, deleteSiteSurveyById);

module.exports = router;

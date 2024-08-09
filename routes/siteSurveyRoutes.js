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

// Route to create a new site survey
router.post('/', createSiteSurvey);

// Route to get all site surveys
router.get('/', getAllSiteSurveys);

// Route to get a site survey by ID
router.get('/:id', getSiteSurveyById);

// Route to get all site surveys by user ID
router.get('/user/:userId', getSiteSurveysByUserId);

// Route to get all approved site surveys by Location ID
router.post('/location', getSiteSurveyByLocationId);

// Route to delete a site survey by ID
router.delete('/:id', deleteSiteSurveyById);

module.exports = router;

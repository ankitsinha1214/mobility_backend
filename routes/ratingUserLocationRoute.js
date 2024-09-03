const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ratingUserLocationController');
const fetchUser = require('../middleware/fetchuser');

// Create Review
router.post('/', fetchUser, reviewController.createReview);

// Check if a user has reviewed a location
router.get('/hasReviewed/:phoneNumber/:locationId', fetchUser, reviewController.hasUserReviewedLocation);

// Get Reviews by User
router.get('/user/:phoneNumber', fetchUser, reviewController.getReviewsByUser);

// Get Reviews by Location
router.get('/location/:locationId', fetchUser, reviewController.getReviewsByLocation);

module.exports = router;

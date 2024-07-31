const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/ratingUserLocationController');

// Create Review
router.post('/', reviewController.createReview);

// Get Reviews by User
router.get('/user/:phoneNumber', reviewController.getReviewsByUser);

// Get Reviews by Location
router.get('/location/:locationId', reviewController.getReviewsByLocation);

module.exports = router;

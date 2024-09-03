const Review = require('../models/ratingUserLocationModel');
const User = require('../models/userModel');
const ChargerLocation = require('../models/chargerLocationModel');

// Create a review
exports.createReview = async (req, res) => {
    try {
        const { phoneNumber, location, charging_exp, charging_location, review } = req.body;

        // Validate user
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Validate location
        const locationExists = await ChargerLocation.findById(location);
        if (!locationExists) {
            return res.json({ success: false, message: 'Location not found' });
        }
        // console.log(user)
        // Check if the user has already reviewed this location
        const existingReview = await Review.findOne({ user: user._id, location });
        if (existingReview) {
            return res.json({ success: false, message: 'User has already reviewed this location' });
        }

        // Create review
        const newReview = new Review({
            user: user._id,
            location,
            charging_exp,
            charging_location,
            review
        });

        await newReview.save();
        res.json({ success: true, message: 'Review created successfully', data: newReview });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Check if a user has reviewed a location
exports.hasUserReviewedLocation = async (req, res) => {
    try {
        const { phoneNumber, locationId } = req.params;

        // Check if the user exists
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if the location exists
        const location = await ChargerLocation.findById(locationId);
        if (!location) {
            return res.json({ success: false, message: 'Location not found' });
        }

        // Check if the user has reviewed this location
        const review = await Review.findOne({ user: user._id, location: locationId });
        const hasReviewed = !!review; // Convert to boolean

        res.json({ success: true, hasReviewed });

    } catch (error) {
        console.error('Error checking if user reviewed location:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all reviews by user
exports.getReviewsByUser = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Validate user
        const user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Get reviews
        const reviews = await Review.find({ user: user._id });
        if (reviews.length === 0) {
            return res.json({ success: false, message: 'No reviews found for this user' });
        }

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error getting reviews by user:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get all reviews by location
exports.getReviewsByLocation = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const { locationId } = req.params;

        // Validate location
        const locationExists = await ChargerLocation.findById(locationId);
        if (!locationExists) {
            return res.json({ success: false, message: 'Location not found' });
        }

        // Get reviews
        const reviews = await Review.find({ location: locationId });
        if (reviews.length === 0) {
            return res.json({ success: false, message: 'No reviews found for this location' });
        }

        res.json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error getting reviews by location:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

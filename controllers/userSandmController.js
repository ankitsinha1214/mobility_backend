// userSandmController.js
const SiteSurvey = require('../models/siteSurveyModel');
const PreInstallation = require('../models/preInstallationModel');
const ChargerAndDcBox = require('../models/chargerAndDcboxModel');
const PreDelivery = require('../models/preDeliveryChargeboxResponseModel');
const User = require('../models/userSandmModel');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwtUtil');

// Controller function to register a new user
const registerUser = async (req, res) => {
    //   const { username, password, company, department } = req.body;
    const { username, password, company, department, name, email, phone } = req.body;
    // const { prefix, number } = phone;
    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        // const existingUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
        if (existingUser) {
            return res.json({ success: false, message: 'Username, email, or phone number already exists' });
        }

        // Encrypt the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user object
        const newUser = new User({
            username,
            password,
            //   password: hashedPassword,
            company,
            department,
            //   name,
            //   email,
            //   phone
        });

        // Save the new user to the database
        await newUser.save();

        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Controller function to login a user
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user data from the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' });
        }

        // Compare the provided password with the stored encrypted password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Convert user document to a plain JavaScript object
            const userData = user.toObject();
            const userId = user._id;
            // Remove the password field
            delete userData.password;
            const { token } = generateToken(userId);
            res.json({ success: true, data: userData, message: 'Authentication successful', token: token });
        } else {
            res.json({ success: false, message: 'Authentication failed' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

// Controller function to update user details
const updateUserDetails = async (req, res) => {
    const { username, name, email, phone } = req.body;
    const { prefix, number } = phone;

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required to update' });
    }

    try {
        // Fetch the current user details from the database
        const user = await User.findOne({ username });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Check if the provided values are the same as the current values
        if (user.name === name && user.email === email && user.phone.prefix === prefix && user.phone.number === number) {
            return res.json({ success: false, message: 'No changes detected. Please update at least one field.' });
        }

        // Update user details in the database
        const updatedUser = await User.findOneAndUpdate(
            { username },
            { name, email, phone: { prefix, number } },
            { new: true }
        );
        // Remove the password field from the updatedUser object
        const updatedUserData = updatedUser.toObject();
        delete updatedUserData.password;
        res.json({ success: true, data: updatedUserData, message: 'User data updated successfully' });
    } catch (error) {
        // console.error('Error:', error);
        if(error.keyValue){
            console.log(error.keyValue)
            if (error.keyValue?.['phone.number']) {
                res.json({ success: false, message: `${error.keyValue['phone.number']} this phone number is already in use` });
            }
            else if(error.keyValue?.email){
                res.json({ success: false, message: `${error.keyValue?.email} this email is already in use` });
            }
        }
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};


// Controller function to delete a user
const deleteUser = async (req, res) => {
    const { username } = req.params;

    try {
        // Delete user from the database
        const deletedUser = await User.findOneAndDelete({ username });

        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, data: deletedUser, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

const getAllUserRecords = async (req, res) => {
    const { userId } = req.body;

    try {
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ status: false, message: 'User not found' });
        }

        // Retrieve all records for site surveys, preinstallations, and charger & DC box
        const siteSurveys = await SiteSurvey.find({ userId }).populate('locationId', 'locationName address');
        const preInstallations = await PreInstallation.find({ userId }).populate('locationId', 'locationName address');
        const chargerAndDcBoxes = await ChargerAndDcBox.find({ userId }).populate('locationId', 'locationName address');

        // Retrieve all pre-delivery records associated with the user
        const preDeliveries = await PreDelivery.find({ userServiceAndMaintenance: userId });

        return res.json({
            status: true,
            data: {
                siteSurveys,
                preInstallations,
                chargerAndDcBoxes,
                preDeliveries
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        // Retrieve all users, excluding the password field
        const users = await User.find({}, '-password');
        res.json({ success: true, data: users, message: 'Users retrieved successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};

const updateUserStatus = async (req, res) => {
    const { userId, status } = req.body;

    try {
        // Validate input
        if (!userId || !status) {
            return res.json({ success: false, message: 'User ID and status are required' });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Update the user's status
        user.status = status;
        await user.save();

        return res.json({
            success: true,
            message: 'User status updated successfully',
            data: { userId: user._id, status: user.status }
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    updateUserDetails,
    deleteUser,
    getAllUserRecords,
    getAllUsers,
    updateUserStatus
};

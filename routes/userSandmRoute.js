// userSandmRoute.js
const router = require("express").Router();
const UserController = require('../controllers/userSandmController');

// Register a new user
router.post('/register', UserController.registerUser);

// Login user
router.post('/login', UserController.loginUser);

// Get all history of the user
router.post('/get-history', UserController.getAllUserRecords);

// Get all the user
router.get('/', UserController.getAllUsers);

// Update status of user
router.post('/update-status', UserController.updateUserStatus);

// Update user details
router.post('/updateuserdetails', UserController.updateUserDetails);

module.exports = router;

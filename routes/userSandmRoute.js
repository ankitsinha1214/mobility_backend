// userSandmRoute.js
const router = require("express").Router();
const UserController = require('../controllers/userSandmController');

// Register a new user
router.post('/register', UserController.registerUser);

// Login user
router.post('/login', UserController.loginUser);

// Update user details
router.post('/updateuserdetails', UserController.updateUserDetails);

module.exports = router;

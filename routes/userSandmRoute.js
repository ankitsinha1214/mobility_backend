// userSandmRoute.js
const router = require("express").Router();
const UserController = require('../controllers/userSandmController');
const fetchUser = require('../middleware/fetchuser');

// Register a new user
router.post('/register', fetchUser, UserController.registerUser);

// Login user
router.post('/login', UserController.loginUser);

// Get all history of the user
router.post('/get-history', fetchUser, UserController.getAllUserRecords);

// Get all the user
router.get('/', fetchUser, UserController.getAllUsers);

// Get a user by id
router.get('/user/:userId', fetchUser, UserController.getUserById);

// Create a manager
router.post('/create-manager', fetchUser, UserController.createManager);

// get admin and manager
router.get('/admins-managers', fetchUser, UserController.getAdminsAndManagers);

// Update status of user
router.post('/update-status', fetchUser, UserController.updateUserStatus);

// Update user details
router.post('/updateuserdetails', fetchUser, UserController.updateUserDetails);

module.exports = router;

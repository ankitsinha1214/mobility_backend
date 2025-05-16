const userController = require("../controllers/userController");
const fetchUser = require("../middleware/fetchuser");
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router
const router = require("express").Router();

// user router
router.post(
  "/", 
//   upload.fields([{
//   name: 'avatar', maxCount: 1
// }
// ]),
  userController.addUser
);

router.get(
  "/",
  fetchUser,
  userController.getUser
);
router.get(
  "/get/pagination",
  fetchUser,
  userController.getPaginatedUser
);

router.get(
  "/:id",
  fetchUser,
  userController.getUserById
);

router.get('/check-registration/:phoneNumber', userController.checkUserRegistration);

router.patch(
  "/:phoneNumber",
//    upload.fields([{
//   name: 'avatar', maxCount: 1
// }
// ]),
  fetchUser,
  userController.updateUser
);

router.delete(
  "/:phoneNumber",
  fetchUser,
  userController.deleteUser
);

router.post(
  "/login",
  userController.loginDriver
);

// router.post(
//   "/login",
//   userController.loginUser
// );

// router.post(
//   "/updatepassword",
//   userController.updatepassword
// );
// router.post(
//   "/resetpassword",
//   userController.resetpassword
// );
// router.post(
//   "/checkuserforresetpassword",
//   userController.checkUserForResetPassword
// );
// POST - Add a new user vehicle
router.post('/:phoneNumber/vehicles',
  fetchUser, userController.addUserVehicle);

// POST - Add History details for user
router.get('/:phoneNumber/history',
  fetchUser, userController.getHistory);

// GET - Get all user vehicles
router.get('/:phoneNumber/vehicles',
  fetchUser, userController.getUserVehicles);

// GET - Get user vehicle by ID
router.get('/:phoneNumber/vehicles/:vehicleId',
  fetchUser, userController.getUserVehicleById);

// PUT - Update user vehicle by ID
router.put('/:phoneNumber/vehicles/:vehicleId', 
  fetchUser, userController.updateUserVehicle);

// DELETE - Delete user vehicle by ID
router.delete('/:phoneNumber/vehicles/:vehicleId',fetchUser, userController.deleteUserVehicle);

// Add a location to favourite
router.post('/:phoneNumber/add-favourite',fetchUser, userController.addFavouriteLocation);

// Get all user favourite list
router.get('/:phoneNumber/get-favourite',fetchUser, userController.getUserFavouriteLocations);

// remove a location to favourite
router.delete('/:phoneNumber/favourite',fetchUser, userController.removeFavouriteLocation);

module.exports = router;

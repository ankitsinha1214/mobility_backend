const userController = require("../controllers/userController");
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
  userController.getUser
);

router.get(
  "/:id",
  userController.getUserById
);

router.get('/check-registration/:phoneNumber', userController.checkUserRegistration);

router.patch(
  "/:id",
//    upload.fields([{
//   name: 'avatar', maxCount: 1
// }
// ]),
  userController.updateUser
);

router.delete(
  "/:id",
  userController.deleteUser
);

router.post(
  "/login",
  userController.loginUser
);

router.post(
  "/updatepassword",
  userController.updatepassword
);
router.post(
  "/resetpassword",
  userController.resetpassword
);
router.post(
  "/checkuserforresetpassword",
  userController.checkUserForResetPassword
);
// POST - Add a new user vehicle
router.post('/:phoneNumber/vehicles', userController.addUserVehicle);

// GET - Get all user vehicles
router.get('/:phoneNumber/vehicles', userController.getUserVehicles);

// GET - Get user vehicle by ID
router.get('/:phoneNumber/vehicles/:vehicleId', userController.getUserVehicleById);

// PUT - Update user vehicle by ID
router.put('/:phoneNumber/vehicles/:vehicleId', userController.updateUserVehicle);

// DELETE - Delete user vehicle by ID
router.delete('/:phoneNumber/vehicles/:vehicleId', userController.deleteUserVehicle);


module.exports = router;

const ticketController = require("../controllers/ticketController");
const fetchUser = require("../middleware/fetchuser");
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router
const router = require("express").Router();

// user router
// router.post(
//   "/", 
// //   upload.fields([{
// //   name: 'avatar', maxCount: 1
// // }
// // ]),
// ticketController.addUser
// );

router.get(
  "/category",
  fetchUser,
  ticketController.getCategory
);

module.exports = router;

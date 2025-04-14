const ticketController = require("../controllers/ticketController");
const fetchUser = require("../middleware/fetchuser");
// const multer = require('multer');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// router
const router = require("express").Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    // limits: { fileSize: 100 * 1024 * 1024 }, 
 });


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

router.post(
  "/",
  fetchUser,
  upload.fields([{
      name: 'screenshots', maxCount: 4
  }
  ]),
  ticketController.createTicket
);

router.get(
  "/",
  fetchUser,
  ticketController.getAllTickets
);

router.get(
  "/user",
  fetchUser,
  ticketController.getUserTickets
);

router.patch(
  "/",
  fetchUser,
  ticketController.resolveTicket
);

router.get(
  '/assigned-to/:userId',
  fetchUser,
  ticketController.getTicketsAssignedToUser
);

module.exports = router;

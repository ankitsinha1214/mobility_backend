const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const fetchUser = require('../middleware/fetchuser');

// POST /api/reservations
router.post("/", fetchUser, reservationController.createReservation);

// GET /api/reservations
router.get("/", fetchUser, reservationController.getAllReservations);

// PATCH /api/reservations/:reservationId/cancel
router.patch("/:reservationId/cancel", fetchUser, reservationController.cancelReservation);

module.exports = router;

const express = require("express");
const router = express.Router();
const TicketMessage = require("../models/TicketMessage");

router.get("/:ticketId", async (req, res) => {
  try {
    const messages = await TicketMessage.find({ ticketId: req.params.ticketId })
      .sort({ createdAt: 1 });
    res.json({ status: true, messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: "Server error" });
  }
});

module.exports = router;
// routes/encryptRoute.js
const express = require("express");
const router = express.Router();
const { encryptPayload } = require("../utils/encrypt");

const SECRET_KEY = process.env.ENCRYPTION_KEY || "Ankit@Sinha";

router.post("/", (req, res) => {
  try {
    const { payload } = req.body;

    // Validate the structure
    if (
      !payload ||
      typeof payload !== "object" ||
      typeof payload.connectorId !== "number" ||
      typeof payload.chargerId !== "string"
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid payload format. Expected: { payload: { connectorId: Number, chargerId: String } }",
      });
    }

    const encrypted = encryptPayload({ payload }, SECRET_KEY);

    res.status(200).json({
      status: true,
      encryptedParam: encrypted,
    });
  } catch (error) {
    console.error("Encryption Error:", error);
    res.status(500).json({ status: false, message: "Encryption failed" });
  }
});

module.exports = router;

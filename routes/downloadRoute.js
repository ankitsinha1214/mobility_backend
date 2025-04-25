// routes/downloadRoute.js
const express = require("express");
const router = express.Router();
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../configs/awsS3Config"); // your s3 client instance
const fetchUser = require('../middleware/fetchuser');
// const stream = require("stream");

router.get("/", fetchUser, async (req, res) => {
  try {
    if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
        return res.status(401).json({ success: false, message: "You are Not a Valid User." });
    }
    const { key } = req.query;
    if (!key) return res.status(400).json({ status: false, message: "Key is required" });

    const s3Stream = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      })
    );

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${key.split("/").pop()}"`);
    res.setHeader("Content-Type", s3Stream.ContentType || "application/octet-stream");

    // Pipe the S3 stream to response
    s3Stream.Body.pipe(res);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ status: false, message: "Failed to download file" });
  }
});

module.exports = router;

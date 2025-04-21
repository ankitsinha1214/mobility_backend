// routes/encryptRoute.js
const express = require("express");
const router = express.Router();
const { encryptPayload } = require("../utils/encrypt");
const QRCode = require("qrcode");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const SECRET_KEY = process.env.ENCRYPTION_KEY;

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION
})

router.post("/", async (req, res) => {
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
        // console.log(encrypted)
        const REDIRECTION_URL = process.env.REDIRECTION_URL;

        // Generate QR Code as Data URL (base64)
        const qrDataUrl = await QRCode.toDataURL(REDIRECTION_URL+encrypted);
        // console.log(qrDataUrl)

        // Convert base64 to buffer
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");

        // Create unique filename
        const fileName = `qr-codes/charger/${uuidv4()}.png`;

        // Upload to S3
        const params4 = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: imageBuffer,
            ContentType: "image/png",
            // ACL: "public-read", // To make it publicly accessible
        };
        const command4 = new PutObjectCommand(params4);
        await s3.send(command4);
        // console.log(BUCKET_NAME)
        const s3Link = `https://${BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${fileName}`;

        res.status(200).json({
            status: true,
            encryptedParam: s3Link,
        });
    } catch (error) {
        console.error("Encryption Error:", error);
        res.status(500).json({ status: false, message: "Encryption failed" });
    }
});

module.exports = router;

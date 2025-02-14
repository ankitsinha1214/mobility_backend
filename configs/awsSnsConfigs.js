const AWS = require("aws-sdk");
require("dotenv").config(); // Load environment variables

AWS.config.update({
    accessKeyId: process.env.SNS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SNS_SECRET_ACCESS_KEY,
    region: process.env.AWS_BUCKET_REGION,
});

module.exports = AWS;

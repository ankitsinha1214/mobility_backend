const AWS = require("../configs/awsSnsConfigs"); // Import AWS SDK
const sns = new AWS.SNS(); // Initialize SNS

/**
 * Registers a new device token in AWS SNS
 * @param {string} fcmToken - Firebase Cloud Messaging (FCM) token from mobile
 * @returns {Promise<string>} - Endpoint ARN of the registered device
 */
async function registerDeviceToken(fcmToken) {
    const params = {
        PlatformApplicationArn: process.env.SNS_PLATFORM_ARN, // Your AWS SNS Platform ARN
        Token: fcmToken,
    };

    try {
        const response = await sns.createPlatformEndpoint(params).promise();
        console.log("✅ Device registered with ARN:", response.EndpointArn);
        return response.EndpointArn;
    } catch (error) {
        console.error("❌ Error registering device:", error);
        throw error;
    }
}

/**
 * Sends a push notification to a device via AWS SNS
 * @param {string} endpointArn - The registered device ARN
 * @param {string} title - Notification title
 * @param {string} message - Notification message body
 * @returns {Promise<void>}
 */
async function sendNotification(endpointArn, title, message) {
    const params = {
        TargetArn: endpointArn,
        Message: JSON.stringify({
            default: message,
            GCM: JSON.stringify({
                notification: {
                    title: title,
                    body: message,
                    sound: "default",
                },
            }),
        }),
        MessageStructure: "json",
    };

    try {
        const response = await sns.publish(params).promise();
        console.log("✅ Notification sent successfully:", response.MessageId);
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        throw error;
    }
}

module.exports = {
    registerDeviceToken,
    sendNotification,
};

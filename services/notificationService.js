// const AWS = require("../configs/awsSnsConfigs");
// const sns = new AWS.SNS();

// /**
//  * Registers a new device token in AWS SNS and returns Endpoint ARN.
//  * @param {string} fcmToken - Firebase Cloud Messaging (FCM) token from mobile
//  * @returns {Promise<string>} - Endpoint ARN
//  */
// async function registerDeviceToken(fcmToken) {
//     const params = {
//         PlatformApplicationArn: process.env.SNS_PLATFORM_ARN, // AWS SNS Platform ARN
//         Token: fcmToken,
//     };

//     try {
//         const response = await sns.createPlatformEndpoint(params).promise();
//         console.log("✅ Device registered with ARN:", response.EndpointArn);
//         return response.EndpointArn;
//     } catch (error) {
//         console.error("❌ Error registering device:", error);
//         throw error;
//     }
// }

// /**
//  * Sends a push notification via AWS SNS.
//  * Handles both **single user** (string ARN) and **multiple users** (array of ARNs).
//  * @param {string | string[]} endpointArns - One or multiple Endpoint ARNs
//  * @param {string} title - Notification title
//  * @param {string} message - Notification message
//  * @returns {Promise<void>}
//  */
// async function sendNotification(endpointArns, title, message) {
//     const payload = {
//         default: message,
//         GCM: JSON.stringify({
//             notification: {
//                 title,
//                 body: message,
//                 sound: "default",
//             },
//         }),
//     };

//     try {
//         if (Array.isArray(endpointArns)) {
//             // Send notification to multiple users
//             await Promise.all(endpointArns.map(endpointArn => {
//                 const params = {
//                     TargetArn: endpointArn,
//                     Message: JSON.stringify(payload),
//                     MessageStructure: "json",
//                 };
//                 return sns.publish(params).promise();
//             }));
//             console.log("✅ Notifications sent to multiple users");
//         } else {
//             // Send notification to a single user
//             const params = {
//                 TargetArn: endpointArns,
//                 Message: JSON.stringify(payload),
//                 MessageStructure: "json",
//             };
//             await sns.publish(params).promise();
//             console.log("✅ Notification sent to a single user");
//         }
//     } catch (error) {
//         console.error("❌ Error sending notification:", error);
//         throw error;
//     }
// }

// module.exports = {
//     registerDeviceToken,
//     sendNotification,
// };

// const { SNSClient, CreatePlatformEndpointCommand, PublishCommand } = require("@aws-sdk/client-sns");
const { SNSClient, CreatePlatformEndpointCommand, PublishCommand, GetEndpointAttributesCommand, SetEndpointAttributesCommand } = require("@aws-sdk/client-sns");
const snsClient = require("../configs/awsSnsConfigs"); // Ensure this exports SNSClient correctly
const Notification = require('../models/notificationConsumerModel');

/**
 * Registers a new device token in AWS SNS and returns Endpoint ARN.
 * @param {string} fcmToken - Firebase Cloud Messaging (FCM) token from mobile
 * @returns {Promise<string>} - Endpoint ARN
 */
async function registerDeviceToken(fcmToken) {
    const params = {
        PlatformApplicationArn: process.env.SNS_PLATFORM_ARN, // AWS SNS Platform ARN
        Token: fcmToken,
    };

    try {
        const command = new CreatePlatformEndpointCommand(params);
        const response = await snsClient.send(command);
        console.log("✅ Device registered with ARN:", response.EndpointArn);
        return response.EndpointArn;
    } catch (error) {
        console.error("❌ Error registering device:", error);
        throw error;
    }
}
/**
 * Checks if an endpoint ARN is enabled.
 * @param {string} endpointArn - AWS SNS Endpoint ARN
 * @returns {Promise<boolean>} - Returns true if enabled, false if disabled
 */
async function isEndpointEnabled(endpointArn) {
    try {
        const command = new GetEndpointAttributesCommand({ EndpointArn: endpointArn });
        const response = await snsClient.send(command);
        return response.Attributes.Enabled === "true";  // AWS returns "true" as a string
    } catch (error) {
        console.error(`❌ Error checking endpoint status (${endpointArn}):`, error);
        return false;
    }
}

/**
 * Saves the notification to the database.
 * @param {string} title - Notification title.
 * @param {string} message - Notification message.
 * @param {string[]} endpointArns - Array of AWS SNS Endpoint ARNs.
 * @param {string} type - "Single" or "All".
 * @param {string} status - Notification status.
 */
async function saveNotificationToDB(title, message, endpointArns, type, status = "Pending", userId) {
    try {
        const newNotification = new Notification({
            title,
            description: message,
            endpointArns,
            type,
            userId,
            status
        });

        await newNotification.save();
        console.log("✅ Notification saved to DB");
    } catch (error) {
        console.error("❌ Error saving notification:", error);
    }
}

/**
 * Sends a push notification via AWS SNS.
 * Handles both **single user** (string ARN) and **multiple users** (array of ARNs).
 * @param {string | string[]} endpointArns - One or multiple Endpoint ARNs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<void>}
 */
async function sendNotification(endpointArns, title, message, userId) {
    const payload = {
        default: message,
        GCM: JSON.stringify({
            notification: {
                title,
                body: message,
                sound: "default",
            },
        }),
    };

    try {
        if (Array.isArray(endpointArns)) {
            const validEndpoints = [];

            // Check endpoint status before sending
            for (const endpointArn of endpointArns) {
                const isEnabled = await isEndpointEnabled(endpointArn);
                if (isEnabled) {
                    validEndpoints.push(endpointArn);
                } else {
                    console.warn(`⚠️ Skipping disabled endpoint: ${endpointArn}`);
                    // You can also re-enable the endpoint if needed
                    // await enableEndpoint(endpointArn);
                }
            }
    
            if (validEndpoints.length === 0) {
                console.warn("⚠️ No valid endpoints found. Aborting notification.");
                return;
            }

            // Send notification to multiple users
            await Promise.all(validEndpoints.map(async (endpointArn) => {
            // await Promise.all(endpointArns.map(async (endpointArn) => {
                const params = {
                    TargetArn: endpointArn,
                    Message: JSON.stringify(payload),
                    MessageStructure: "json",
                };
                const command = new PublishCommand(params);
                return snsClient.send(command);
            }));
            // Update notification status to Sent
            // await saveNotificationToDB(title, message, endpointArns, "All", "Sent");
            console.log("✅ Notifications sent to multiple users");
        } else {
            const isEnabled = await isEndpointEnabled(endpointArns);
                if (!isEnabled) {
                    console.warn(`⚠️ Endpoint is disabled: ${endpointArns}`);
                    return;
                } 
            // Send notification to a single user
            const params = {
                TargetArn: endpointArns,
                Message: JSON.stringify(payload),
                MessageStructure: "json",
            };
            const command = new PublishCommand(params);
            await snsClient.send(command);
            // Update notification status to Sent
            // await saveNotificationToDB(title, message, [endpointArns], "Single", "Sent");
            console.log("✅ Notification sent to a single user");
        }
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        // Save failed notification in DB
        const type = Array.isArray(endpointArns) ? "All" : "Single";
        await saveNotificationToDB(title, message, Array.isArray(endpointArns) ? endpointArns : [endpointArns], type, "Failed", userId);
        throw error;
    }
}

module.exports = {
    registerDeviceToken,
    sendNotification,
};

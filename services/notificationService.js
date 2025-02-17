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

const { SNSClient, CreatePlatformEndpointCommand, PublishCommand } = require("@aws-sdk/client-sns");
const snsClient = require("../configs/awsSnsConfigs"); // Ensure this exports SNSClient correctly

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
 * Sends a push notification via AWS SNS.
 * Handles both **single user** (string ARN) and **multiple users** (array of ARNs).
 * @param {string | string[]} endpointArns - One or multiple Endpoint ARNs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Promise<void>}
 */
async function sendNotification(endpointArns, title, message) {
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
            // Send notification to multiple users
            await Promise.all(endpointArns.map(async (endpointArn) => {
                const params = {
                    TargetArn: endpointArn,
                    Message: JSON.stringify(payload),
                    MessageStructure: "json",
                };
                const command = new PublishCommand(params);
                return snsClient.send(command);
            }));
            console.log("✅ Notifications sent to multiple users");
        } else {
            // Send notification to a single user
            const params = {
                TargetArn: endpointArns,
                Message: JSON.stringify(payload),
                MessageStructure: "json",
            };
            const command = new PublishCommand(params);
            await snsClient.send(command);
            console.log("✅ Notification sent to a single user");
        }
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        throw error;
    }
}

module.exports = {
    registerDeviceToken,
    sendNotification,
};

const { generateUniqueId } = require('../helper/generateUnique');
const { getClient } = require('../ocppConnect.js');

const sendChangeConfiguration = (chargerId, key, value) => {
    return new Promise((resolve, reject) => {
        const client = getClient(chargerId);

        if (!client || client.readyState !== 1) {
            return reject(`WebSocket connection not established for charger ID ${chargerId}`);
        }

        const messageId = generateUniqueId();
        const ocppMessage = [
            2,
            messageId,
            'ChangeConfiguration',
            { key, value },
        ];

        try {
            client.send(JSON.stringify(ocppMessage));

            client.once('message', (response) => {
                try {
                    const parsedResponse = JSON.parse(response);
                    const status = parsedResponse[2]?.status;

                    resolve({ status, messageId });
                } catch (err) {
                    reject('Failed to parse charger response.');
                }
            });
        } catch (error) {
            reject('Error sending ChangeConfiguration message.');
        }
    });
};

const sendChangeChargingProfile = (chargerId, connectorId, chargingProfile) => {
    return new Promise((resolve, reject) => {
        const client = getClient(chargerId);

        if (!client || client.readyState !== 1) {
            return reject(`WebSocket connection not established for charger ID ${chargerId}`);
        }

        const messageId = generateUniqueId();
        const ocppMessage = [
            2,
            messageId,
            'SetChargingProfile',
            { 
                connectorId,
                csChargingProfiles: chargingProfile 
            },
        ];

        try {
            client.send(JSON.stringify(ocppMessage));

            client.once('message', (response) => {
                try {
                    const parsedResponse = JSON.parse(response);
                    const status = parsedResponse[2]?.status;

                    resolve({ status, messageId });
                } catch (err) {
                    reject('Failed to parse charger response.');
                }
            });
        } catch (error) {
            reject('Error sending ChangeConfiguration message.');
        }
    });
};

module.exports = {
    sendChangeConfiguration,
    sendChangeChargingProfile
};
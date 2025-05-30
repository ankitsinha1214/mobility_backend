const { generateUniqueId } = require('../helper/generateUnique');
// const { getClient } = require('../ocppConnect.js');

const sendChangeConfiguration = (ws, key, value) => {
    return new Promise((resolve, reject) => {
        // const client = getClient(chargerId);

        // if (!client || client.readyState !== 1) {
        //     return reject(`WebSocket connection not established for charger ID ${chargerId}`);
        // }

        const messageId = generateUniqueId();
        const ocppMessage = [
            2,
            messageId,
            'ChangeConfiguration',
            { key, value },
        ];
        console.log(key);
        console.log(value);
        console.log(JSON.stringify(ocppMessage));

        try {
            ws.send(JSON.stringify(ocppMessage));

            ws.once('message', (response) => {
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
};
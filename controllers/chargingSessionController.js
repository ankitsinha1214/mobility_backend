const ws = require('../ocppConnection'); // Import WebSocket connection

const startChargingSession = async (req, res) => {
    try {
        const { chargerId, userPhoneNumber } = req.body;

        // Generate a unique transaction ID
        const transactionId = generateTransactionId();

        // Send StartTransaction message to OCPP server
        ws.send(JSON.stringify({
            action: 'StartTransaction',
            payload: {
                transactionId,
                chargerId,
                userPhoneNumber,
                timestamp: new Date().toISOString()
            }
        }));

        res.status(200).json({ message: 'Transaction started', transactionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const stopChargingSession = async (req, res) => {
    try {
        const { transactionId, reason } = req.body;

        // Send StopTransaction message to OCPP server
        ws.send(JSON.stringify({
            action: 'StopTransaction',
            payload: {
                transactionId,
                timestamp: new Date().toISOString(),
                reason
            }
        }));

        res.status(200).json({ message: 'Transaction stopped', transactionId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const generateTransactionId = () => {
    return 'tx-' + Math.random().toString(36).substring(2, 15); // Example transaction ID generator
};

module.exports = { startChargingSession, stopChargingSession };

const ChargingSession = require('./models/chargerSessionModel');
const ChargerLocation = require('./models/chargerLocationModel');
const User = require('./models/userModel'); // Import User model

const handleOcppMessage = async (message) => {
    try {
        const { action, payload } = message;

        switch (action) {
            case 'BootNotification':
                console.log('Boot Notification:', payload);
                // Handle boot notification from the charger
                break;

            case 'StartTransaction':
                await handleStartTransaction(payload);
                break;

            case 'StopTransaction':
                await handleStopTransaction(payload);
                break;

            default:
                console.log('Unhandled action:', action);
                break;
        }
    } catch (error) {
        console.error('Error handling OCPP message:', error);
    }
};

const handleStartTransaction = async (payload) => {
    const { transactionId, chargerId, userPhoneNumber, timestamp } = payload;

    // Find charger location by chargerId
    const location = await ChargerLocation.findOne({ 'chargerInfo._id': chargerId });
    if (!location) {
        console.error('Charger not found:', chargerId);
        return;
    }

    // Find charger info by chargerId
    const chargerInfo = location.chargerInfo.id(chargerId); 
    if (!chargerInfo) {
        console.error('Charger info not found for chargerId:', chargerId);
        return;
    }

    // Find user by phoneNumber
    const user = await User.findOne({ phoneNumber: userPhoneNumber });
    if (!user) {
        console.error('User not found with phone number:', userPhoneNumber);
        return;
    }

    const session = new ChargingSession({
        charger: chargerId,
        user: user._id, // Use the user ID
        transactionId,
        startTime: new Date(timestamp),
        // Include chargerInfo details if needed for session details
        // Example: session.chargerName = chargerInfo.name;
    });

    await session.save();
    console.log('Charging session started:', session);
};

const handleStopTransaction = async (payload) => {
    const { transactionId, timestamp, reason } = payload;

    const session = await ChargingSession.findOne({ transactionId });
    if (!session) {
        console.error('Session not found:', transactionId);
        return;
    }

    session.endTime = new Date(timestamp);
    session.status = 'Stopped';
    session.reason = reason;

    // You might want to calculate additional data using chargerInfo
    // Example: session.powerConsumed = calculatePower(session);
    // session.cost = calculateCost(session);

    await session.save();
    console.log('Charging session stopped:', session);
};

module.exports = { handleOcppMessage };

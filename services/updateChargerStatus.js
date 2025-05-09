const ChargerLocation = require('../models/chargerLocationModel');
const chargerSessionModel = require('../models/chargerSessionModel');
const cron = require('node-cron');

const updateChargerStatus = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // check last ping for 15 mins

        // const chargersToUpdate = await ChargerLocation.find({
        //     'chargerInfo.lastPing': { $lte: thirtyMinutesAgo },
        //     'chargerInfo.status': { $ne: 'Inactive' },
        // });
        const chargersToUpdate = await ChargerLocation.find({
            chargerInfo: {
                $elemMatch: {
                    // lastPing: { $lte: thirtyMinutesAgo },
                    $or: [
                        { lastPing: { $lte: thirtyMinutesAgo } }, // Last ping older than 30 mins
                        { lastPing: null } // Last ping is null
                    ],
                    status: { $ne: 'Inactive' },
                },
            },
        });
        // console.log(chargersToUpdate);

        if (chargersToUpdate.length > 0) {
            for (let location of chargersToUpdate) {
                location.chargerInfo.forEach(async charger => {
                    // if (charger.lastPing && charger.lastPing <= thirtyMinutesAgo) {
                    //     charger.status = 'Inactive';
                    // }
                    if (charger.lastPing === null || charger.lastPing <= thirtyMinutesAgo) {
                        charger.status = 'Inactive';
                         // Automatically stop the active session
                         const activeSession = await chargerSessionModel.findOne({
                            chargerId: charger.name, // Assuming charger.name is stored in chargerId field
                            status: 'Started'
                        });
                        // console.log(activeSession);
                        if (activeSession) {
                            activeSession.status = 'Stopped';
                            activeSession.endTime = new Date();
                            activeSession.stopReason = 'Charger not responding for over 3 minutes';
                            activeSession.stopCreatedBy = 'System (Auto Cron Job)';
                            // session.endMeterValue = payload?.meterStop;
                            await activeSession.save();
                            console.log(`Session for charger ${charger.name} has been stopped.`);
                        }
                    }
                });
                await location.save();
            }
            console.log(`Updated ${chargersToUpdate.length} chargers to Inactive.`);
        } else {
            console.log('No chargers need updating.');
        }
    } catch (error) {
        console.error('Error updating charger status:', error);
    }
};

// Schedule the task to run every 5 minutes
const startChargerStatusUpdater = () => {
    // cron.schedule('*/5 * * * *', async () => {
    cron.schedule('*/1 * * * *', async () => {
        console.log('Running charger status update...');
        await updateChargerStatus();
    });
};

module.exports = startChargerStatusUpdater;
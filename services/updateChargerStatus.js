const ChargerLocation = require('../models/chargerLocationModel');
const cron = require('node-cron');

const updateChargerStatus = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000); // check last ping for 15 mins

        // const chargersToUpdate = await ChargerLocation.find({
        //     'chargerInfo.lastPing': { $lte: thirtyMinutesAgo },
        //     'chargerInfo.status': { $ne: 'Inactive' },
        // });
        const chargersToUpdate = await ChargerLocation.find({
            chargerInfo: {
                $elemMatch: {
                    lastPing: { $lte: thirtyMinutesAgo },
                    status: { $ne: 'Inactive' },
                },
            },
        });
        console.log(chargersToUpdate);

        if (chargersToUpdate.length > 0) {
            for (let location of chargersToUpdate) {
                location.chargerInfo.forEach(charger => {
                    if (charger.lastPing && charger.lastPing <= thirtyMinutesAgo) {
                        charger.status = 'Inactive';
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
    cron.schedule('*/5 * * * *', async () => {
        console.log('Running charger status update...');
        await updateChargerStatus();
    });
};

module.exports = startChargerStatusUpdater;
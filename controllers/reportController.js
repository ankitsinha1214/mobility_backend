const express = require('express');
const mongoose = require('mongoose');
const Charger = require('../models/chargerLocationModel'); // Charger model
const Location = require('../models/chargerLocationModel'); // Location model
const User = require('../models/userModel'); // User model
const ChargingSession = require('../models/chargerSessionModel');
const Review = require('../models/ratingUserLocationModel');
const Payment = require('../models/paymentModel');
const ExcelJS = require('exceljs'); // ExcelJS library

const router = express.Router();

// Utility function to validate dates
const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
};

const getCurrencySymbol = (currencyCode) => {
    switch (currencyCode) {
        case "INR":
            return "₹";  // Indian Rupee symbol
        case "USD":
            return "$";  // Dollar symbol
        default:
            return "";  // Return an empty string if the currency is not INR or USD
    }
};

// Report Generation API
router.post('/generate-report', async (req, res) => {
    const { fromDate, toDate, filter } = req.body;

    // Validate input
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
        return res.status(400).json({ status: false, message: 'Invalid date range' });
    }

    // Parse the dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
        return res.status(400).json({ status: false, message: 'Invalid date range' });
    }
    // Ensure `toDate` includes the entire day
    to.setHours(23, 59, 59, 999);

    try {
        let data = [];

        // Switch case for filtering data
        switch (filter) {
            case 'chargers':
                // data = await Charger.find({
                //     createdAt: { $gte: from, $lte: to }
                // });
                let data1 = [];
                data1 = await Charger.find({
                    createdAt: { $gte: from, $lte: to }
                }, 'chargerInfo');
                data1.forEach(element => {
                    data = data.concat(element.chargerInfo);
                });
                break;

            case 'locations':
                data = await Location.find({
                    createdAt: { $gte: from, $lte: to }
                });
                break;

            case 'users':
                data = await User.find({
                    createdAt: { $gte: from, $lte: to }
                });
                break;

            default:
                return res.status(400).json({ status: false, message: 'Invalid filter option' });
        }

        // Create a new Excel Workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Add column headers based on the filter
        switch (filter) {
            case 'chargers':
                worksheet.columns = [
                    { header: 'Charger ID', key: '_id', width: 30 },
                    { header: 'Charger Name', key: 'name', width: 30 },
                    { header: 'Charger Status', key: 'status', width: 30 },
                    { header: 'Charger Type', key: 'type', width: 30 },
                    { header: 'Charger SubType', key: 'subtype', width: 30 },
                    { header: 'Charger Power Output', key: 'powerOutput', width: 30 },
                    { header: 'Charger Energy Consumptions', key: 'energyConsumptions', width: 30 },
                    { header: 'Created Date', key: 'createdAt', width: 30 },
                ];
                break;

            case 'locations':
                worksheet.columns = [
                    { header: 'Location ID', key: '_id', width: 30 },
                    { header: 'Location Name', key: 'locationName', width: 30 },
                    { header: 'Location Status', key: 'status', width: 30 },
                    { header: 'Location Type', key: 'locationType', width: 30 },
                    { header: 'Address', key: 'address', width: 30 },
                    { header: 'State', key: 'state', width: 30 },
                    { header: 'City', key: 'city', width: 30 },
                    { header: 'Working Hours', key: 'workingHours', width: 30 },
                    { header: 'Working Days', key: 'workingDays', width: 30 },
                    { header: 'Direction Latitude', key: 'direction.latitude', width: 30 },
                    { header: 'Direction Longitude', key: 'direction.longitude', width: 30 },
                    { header: 'Created Date', key: 'createdAt', width: 30 },
                ];
                break;

            case 'users':
                worksheet.columns = [
                    { header: 'User ID', key: '_id', width: 30 },
                    { header: 'First Name', key: 'firstName', width: 30 },
                    { header: 'Last Name', key: 'lastName', width: 30 },
                    { header: 'Status', key: 'status', width: 30 },
                    { header: 'Phone Number', key: 'phoneNumber', width: 30 },
                    { header: 'State', key: 'state', width: 30 },
                    { header: 'City', key: 'city', width: 30 },
                    { header: 'Created Date', key: 'createdAt', width: 30 },
                ];
                break;
        }
        // console.log(data);
        // Add rows with data
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Set the response headers for downloading the Excel file
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=${filter}-report-${fromDate}-to-${toDate}.xlsx`
        );

        // Write the Excel file to the response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

// Report Generation API
router.post('/generate-report-new', async (req, res) => {
    const { fromDate, toDate, filter } = req.body;

    // Validate input
    if (!isValidDate(fromDate) || !isValidDate(toDate)) {
        return res.status(400).json({ status: false, message: 'Invalid date range' });
    }

    // Parse the dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
        return res.status(400).json({ status: false, message: 'Invalid date range' });
    }

    // Ensure `toDate` includes the entire day
    // to.setHours(23, 59, 59, 999);

    try {
        let data = [];
        let columns = [];

        // Switch case for filtering data
        switch (filter) {
            case 'Chargers':
                // Fetch all charger locations
                // let chargerLocations4 = await Location.find({
                //     createdAt: { $gte: from, $lte: to }
                // }).lean();

                // // Extract chargers
                // let allChargers = [];
                // let chargerLocationMap = {}; // Map charger ID to location ID
                // chargerLocations4.forEach(location => {
                //     location.chargerInfo.forEach(charger => {
                //         chargerLocationMap[charger.name] = location._id;
                //         allChargers.push({
                //             ...charger,
                //             locationId: location._id,
                //             state: location.state,
                //             city: location.city,
                //         });
                //     });
                // });
                // Fetch all charger locations
                let chargerLocations4 = await Location.find().lean();

                // Extract chargers with createdAt filter
                let allChargers = [];
                let chargerLocationMap = {}; // Map charger ID to location ID

                chargerLocations4.forEach(location => {
                    location.chargerInfo.forEach(charger => {
                        // Ensure charger follows createdAt date range
                        if (charger.createdAt >= from && charger.createdAt <= to) {
                            chargerLocationMap[charger.name] = location._id;
                            allChargers.push({
                                ...charger,
                                locationId: location._id,
                                state: location.state,
                                city: location.city,
                                createdAt: charger.createdAt, // Ensure createdAt is carried forward
                            });
                        }
                    });
                });

                let chargerIds4 = allChargers.map(charger => charger.name);

                // Fetch all charging sessions related to these chargers
                let sessions4 = await ChargingSession.find({ chargerId: { $in: chargerIds4 } }).lean();

                // Map sessions to chargers
                let chargerSessionMap = {};
                sessions4.forEach(session => {
                    if (!chargerSessionMap[session.chargerId]) chargerSessionMap[session.chargerId] = [];
                    chargerSessionMap[session.chargerId].push(session);
                });

                // Get all payments related to these sessions
                let sessionIds4 = sessions4.map(session => session._id);
                let payments4 = await Payment.find({ sessionId: { $in: sessionIds4 } }).lean();

                // Map payments to their sessions
                let sessionPaymentMap4 = {};
                payments4.forEach(payment => {
                    sessionPaymentMap4[payment.sessionId] = payment;
                });

                // Process data
                data = allChargers.map(charger => {
                    let chargerSessions = chargerSessionMap[charger.name] || [];
                    let totalSessions = chargerSessions.length;
                    let totalChargingDuration = 0;
                    let totalEnergyConsumed = 0;
                    let totalRevenue = 0;
                    // let totalPower = 0;
                    let currency = "INR";
                    let upTime = 0;
                    let downTime = 0;

                    chargerSessions.forEach(session => {
                        // Energy Calculation
                        if (session.startMeterValue && session.endMeterValue) {
                            totalEnergyConsumed += (session.endMeterValue - session.startMeterValue);
                        }

                        // Charging Duration Calculation
                        if (session.startTime && session.endTime) {
                            let duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
                            totalChargingDuration += duration;
                        }

                        // Power Calculation (Assuming power is calculated based on session data)
                        // if (session.power) {
                        //     totalPower += session.power;
                        // }

                        // Check if session was paid
                        let payment = sessionPaymentMap4[session._id];
                        if (payment) {
                            totalRevenue += payment.amount / 100;
                            currency = payment.currency || "INR";
                        }

                        // Uptime & Downtime Calculation (Assuming session status contains uptime/downtime information)
                        // if (session.status === "UP") {
                        //     upTime += 1;
                        // } else {
                        //     downTime += 1;
                        // }
                    });

                    let avgChargingDuration = totalSessions ? (totalChargingDuration / totalSessions / 60).toFixed(2) : "N/A";
                    // let avgPower = totalSessions ? (totalPower / totalSessions).toFixed(2) : "N/A";
                    // let costPerKwh = totalEnergyConsumed ? (totalRevenue / totalEnergyConsumed).toFixed(2) : "N/A";

                    return {
                        chargerId: charger.name,
                        locationId: charger.locationId,
                        powerOutput: charger.powerOutput
                        // + " kW"
                        ,
                        chargerType: charger.type || "N/A",
                        connectorType: charger.subtype || "N/A",
                        // numberOfConnectors: charger.numberOfConnectors || "N/A",
                        totalSessions,
                        chargingDuration: (totalChargingDuration / 60).toFixed(2) + " min",
                        avgChargingDuration: avgChargingDuration + " min",
                        revenue: `${getCurrencySymbol(currency)} ${(totalRevenue).toFixed(2)}`,
                        // avgPower: avgPower + " kW",
                        // costPerKwh: `${getCurrencySymbol(currency)} ${(costPerKwh).toFixed(2)}`,
                        costPerKwh: `${getCurrencySymbol(charger?.costPerUnit?.currency)} ${(charger?.costPerUnit?.amount).toFixed(3)}`,
                        // upTime,
                        // downTime,
                    };
                });

                columns = [
                    { header: 'Charger ID', key: 'chargerId' },
                    { header: 'Location ID', key: 'locationId' },
                    { header: 'Power Output', key: 'powerOutput' },
                    { header: 'Charger Type', key: 'chargerType' },
                    { header: 'Connector Type', key: 'connectorType' },
                    // { header: 'Number of Connectors', key: 'numberOfConnectors' },
                    { header: 'Total Sessions', key: 'totalSessions' },
                    { header: 'Charging Duration', key: 'chargingDuration' },
                    { header: 'Avg Charging Duration', key: 'avgChargingDuration' },
                    { header: 'Revenue', key: 'revenue' },
                    // { header: 'Average Power', key: 'avgPower' },
                    { header: 'Cost per kWh', key: 'costPerKwh' },
                    // { header: 'Up Time', key: 'upTime' },
                    // { header: 'Down Time', key: 'downTime' },
                ];
                break;


            // case 'locations':
            //     let locations = await Location.find({
            //         createdAt: { $gte: from, $lte: to }
            //     }).lean();

            //     let locationIds = locations.map(location => location._id);

            //     // Fetch all charging sessions related to these locations
            //     let sessions3 = await ChargingSession.find({ locationId: { $in: locationIds } }).lean();

            //     // Map sessions to their locations
            //     let locationSessionMap = {};
            //     sessions3.forEach(session => {
            //         if (!locationSessionMap[session.locationId]) locationSessionMap[session.locationId] = [];
            //         locationSessionMap[session.locationId].push(session);
            //     });

            //     // Get all payments related to these sessions
            //     let sessionIds3 = sessions3.map(session => session._id);
            //     let payments3 = await Payment.find({ sessionId: { $in: sessionIds3 } }).lean();

            //     // Map payments to their sessions
            //     let sessionPaymentMap = {};
            //     payments3.forEach(payment => {
            //         sessionPaymentMap[payment.sessionId] = payment;
            //     });

            //     // Process data
            //     data = locations.map(location => {
            //         let locationSessions = locationSessionMap[location._id] || [];
            //         let totalSessions = locationSessions.length;
            //         let totalPaidSessions = 0;
            //         let totalUnpaidSessions = 0;
            //         let totalEnergyConsumed = 0;
            //         let peakHoursCount = {};
            //         let peakDayCount = {};
            //         let peakChargingDuration = 0;
            //         let totalChargingDuration = 0;
            //         let ratings = [];

            //         locationSessions.forEach(session => {
            //             // Energy Calculation
            //             if (session.startMeterValue && session.endMeterValue) {
            //                 totalEnergyConsumed += (session.endMeterValue - session.startMeterValue);
            //             }

            //             // Charging Duration Calculation
            //             if (session.startTime && session.endTime) {
            //                 let duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
            //                 totalChargingDuration += duration;

            //                 let hour = new Date(session.startTime).getHours();
            //                 peakHoursCount[hour] = (peakHoursCount[hour] || 0) + 1;

            //                 let day = new Date(session.startTime).getDay();
            //                 peakDayCount[day] = (peakDayCount[day] || 0) + 1;

            //                 if (duration > peakChargingDuration) {
            //                     peakChargingDuration = duration;
            //                 }
            //             }

            //             // Check if session was paid or unpaid
            //             let payment = sessionPaymentMap[session._id];
            //             if (payment) {
            //                 totalPaidSessions++;
            //             } else {
            //                 totalUnpaidSessions++;
            //             }

            //             // Collect Ratings
            //             if (session.rating) {
            //                 ratings.push(session.rating);
            //             }
            //         });

            //         // Peak Revenue Hour Calculation
            //         let peakRevenueHours = Object.entries(peakHoursCount)
            //             .sort((a, b) => b[1] - a[1])
            //             .slice(0, 2)
            //             .map(([hour]) => `${hour}:00 - ${hour}:59`);

            //         // Peak Revenue Day Calculation
            //         let peakRevenueDay = Object.entries(peakDayCount)
            //             .sort((a, b) => b[1] - a[1])
            //             .map(([day]) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day])[0];

            //         // Avg Rating Calculation
            //         let avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : "N/A";

            //         return {
            //             locationId: location._id,
            //             locationName: location.locationName,
            //             totalChargers: location?.chargerInfo?.length || 0,
            //             energyDispersed: totalEnergyConsumed.toFixed(3) + " kWh",
            //             totalPaidSessions,
            //             totalUnpaidSessions,
            //             peakRevenueHours: peakRevenueHours.length ? peakRevenueHours.join(", ") : "N/A",
            //             peakRevenueDay: peakRevenueDay || "N/A",
            //             peakChargingTime: peakChargingDuration > 0 ? `${(peakChargingDuration / 60).toFixed(2)} min` : "N/A",
            //             state: location.state,
            //             city: location.city,
            //             avgRating,
            //         };
            //     });

            //     columns = [
            //         { header: 'Location ID', key: 'locationId' },
            //         { header: 'Location Name', key: 'locationName' },
            //         { header: 'Total Chargers', key: 'totalChargers' },
            //         { header: 'Energy Dispersed', key: 'energyDispersed' },
            //         { header: 'Total Paid Sessions', key: 'totalPaidSessions' },
            //         { header: 'Total UnPaid Sessions', key: 'totalUnpaidSessions' },
            //         { header: 'Peak Revenue Hours', key: 'peakRevenueHours' },
            //         { header: 'Peak Revenue Day', key: 'peakRevenueDay' },
            //         { header: 'Peak Charging Time', key: 'peakChargingTime' },
            //         { header: 'State', key: 'state' },
            //         { header: 'City', key: 'city' },
            //         { header: 'Avg Rating', key: 'avgRating' },
            //     ];
            case 'Locations':
                // Fetch all charger locations
                let chargerLocations = await Location.find({
                    createdAt: { $gte: from, $lte: to }
                }).lean();
                // Fetch ratings from the Review model once for all locations
                let locationRatings = await Review.aggregate([
                    { $match: { location: { $in: chargerLocations.map(loc => loc._id) } } },
                    {
                        $group: {
                            _id: "$location",
                            avgRating: { $avg: { $avg: ["$charging_exp", "$charging_location"] } }
                        }
                    }
                ]).exec();  // ✅ Move aggregation outside the map function

                // Map ratings to locations
                let ratingMap = {};
                locationRatings.forEach(rating => {
                    ratingMap[rating._id.toString()] = rating.avgRating.toFixed(2);  // Store in map
                });

                let chargerMap3 = {};
                chargerLocations.forEach(location => {
                    location.chargerInfo.forEach(charger => {
                        chargerMap3[charger.name] = location._id; // Map chargerId to locationId
                    });
                });

                let chargerIds = Object.keys(chargerMap3);

                // Fetch all charging sessions related to these chargers
                let sessions3 = await ChargingSession.find({ chargerId: { $in: chargerIds } }).lean();

                // Map sessions to their locations
                let locationSessionMap = {};
                sessions3.forEach(session => {
                    let locationId = chargerMap3[session.chargerId];
                    if (!locationSessionMap[locationId]) locationSessionMap[locationId] = [];
                    locationSessionMap[locationId].push(session);
                });

                // Get all payments related to these sessions
                let sessionIds3 = sessions3.map(session => session._id);
                let payments3 = await Payment.find({ sessionId: { $in: sessionIds3 } }).lean();

                // Map payments to their sessions
                let sessionPaymentMap = {};
                payments3.forEach(payment => {
                    sessionPaymentMap[payment.sessionId] = payment;
                });

                // Process data
                data = chargerLocations.map(location => {
                    let locationSessions = locationSessionMap[location._id] || [];
                    // let totalSessions = locationSessions.length;
                    let totalPaidSessions = 0;
                    let totalUnpaidSessions = 0;
                    let totalEnergyConsumed = 0;
                    let peakHoursCount = {};
                    let peakDayCount = {};
                    let peakChargingDuration = 0;
                    let totalChargingDuration = 0;
                    let ratings = [];
                    let totalRevenue = 0;
                    let currency = "INR";

                    locationSessions.forEach(session => {
                        // Energy Calculation
                        if (session.startMeterValue && session.endMeterValue) {
                            totalEnergyConsumed += (session.endMeterValue - session.startMeterValue);
                        }

                        // Charging Duration Calculation
                        if (session.startTime && session.endTime) {
                            let duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
                            totalChargingDuration += duration;

                            let hour = new Date(session.startTime).getHours();
                            peakHoursCount[hour] = (peakHoursCount[hour] || 0) + 1;

                            let day = new Date(session.startTime).getDay();
                            peakDayCount[day] = (peakDayCount[day] || 0) + 1;

                            if (duration > peakChargingDuration) {
                                peakChargingDuration = duration;
                            }
                        }

                        // Check if session was paid or unpaid
                        let payment = sessionPaymentMap[session._id];
                        currency = payment.currency || "INR";
                        if (payment) {
                            totalPaidSessions++;
                            totalRevenue += payment.amount / 100;
                        } else {
                            totalUnpaidSessions++;
                        }

                        // Collect Ratings
                        // if (location.rating) {
                        //     ratings.push(session.rating);
                        // }
                    });

                    // Peak Revenue Hour Calculation
                    let peakRevenueHours = Object.entries(peakHoursCount)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([hour]) => `${hour}:00 - ${hour}:59`);

                    // Peak Revenue Day Calculation
                    let peakRevenueDay = Object.entries(peakDayCount)
                        .sort((a, b) => b[1] - a[1])
                        .map(([day]) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day])[0];

                    // Avg Rating Calculation
                    // let avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : "N/A";

                    return {
                        locationId: location._id,
                        locationName: location.locationName,
                        totalChargers: location?.chargerInfo?.length || 0,
                        energyDispersed: totalEnergyConsumed.toFixed(3) + " Wh",
                        totalRevenue: `${getCurrencySymbol(currency)} ${(totalRevenue).toFixed(2)}` || "N/A",
                        totalPaidSessions,
                        totalUnpaidSessions,
                        peakRevenueHours: peakRevenueHours.length ? peakRevenueHours.join(", ") : "N/A",
                        peakRevenueDay: peakRevenueDay || "N/A",
                        peakChargingTime: peakChargingDuration > 0 ? `${(peakChargingDuration / 60).toFixed(2)} min` : "N/A",
                        state: location.state,
                        city: location.city,
                        // avgRating: ratingMap[location._id] || "N/A",
                        avgRating: ratingMap[location._id.toString()] || "N/A",
                    };
                });

                columns = [
                    { header: 'Location ID', key: 'locationId' },
                    { header: 'Location Name', key: 'locationName' },
                    { header: 'Total Chargers', key: 'totalChargers' },
                    { header: 'Energy Dispersed', key: 'energyDispersed' },
                    { header: 'Total Revenue', key: 'totalRevenue' },
                    { header: 'Total Paid Sessions', key: 'totalPaidSessions' },
                    { header: 'Total UnPaid Sessions', key: 'totalUnpaidSessions' },
                    { header: 'Peak Revenue Hours', key: 'peakRevenueHours' },
                    { header: 'Peak Revenue Day', key: 'peakRevenueDay' },
                    { header: 'Peak Charging Time', key: 'peakChargingTime' },
                    { header: 'State', key: 'state' },
                    { header: 'City', key: 'city' },
                    { header: 'Avg Rating', key: 'avgRating' },
                ];
                break;

            case 'Users':
                // Fetch all users within the date range
                let users = await User.find({ createdAt: { $gte: from, $lte: to } }).lean();

                // Extract all user phone numbers
                let userPhones2 = users.map(user => user.phoneNumber);

                // Fetch all charging sessions for these users in one go
                let sessions2 = await ChargingSession.find({ userPhone: { $in: userPhones2 } }).lean();

                // Create a session map grouped by userPhone
                let sessionMap1 = {};
                for (let session of sessions2) {
                    if (!sessionMap1[session.userPhone]) sessionMap1[session.userPhone] = [];
                    sessionMap1[session.userPhone].push(session);
                }

                // Extract all session IDs for fetching payments
                let sessionIds1 = sessions2.map(session => session._id);

                // Fetch all payments in one go
                let payments2 = await Payment.find({ sessionId: { $in: sessionIds1 } }).lean();

                // Create a payment map grouped by sessionId
                let paymentMap = {};
                for (let payment of payments2) {
                    paymentMap[payment.sessionId] = payment;
                }

                // Process data efficiently
                data = users.map(user => {
                    let userSessions = sessionMap1[user.phoneNumber] || [];
                    let totalSessions = userSessions.length;

                    let totalEnergyConsumed = 0;
                    let totalDuration = 0;
                    let totalChargingDuration = 0;
                    // let stationUsage = {};
                    // let paymentMethods = {};
                    let totalFeePaid = 0;
                    let totalFeeUnpaid = 0;
                    let currency = "INR";

                    for (let session of userSessions) {
                        if (session.startMeterValue && session.endMeterValue) {
                            totalEnergyConsumed += (session.endMeterValue - session.startMeterValue);
                        }

                        if (session.startTime && session.endTime) {
                            let duration = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
                            totalDuration += duration;
                            if (session.status === 'Completed') {
                                totalChargingDuration += duration;
                            }
                        }

                        // if (session.locationId) {
                        //     stationUsage[session.locationId] = (stationUsage[session.locationId] || 0) + 1;
                        // }

                        let payment = paymentMap[session._id];
                        if (payment) {
                            totalFeePaid += payment.amount / 100;
                            currency = payment.currency || "INR";
                            // paymentMethods[payment.method] = (paymentMethods[payment.method] || 0) + 1;
                        } else {
                            totalFeeUnpaid += (session.estimatedCost || 0);
                        }
                    }

                    // let preferredStation = Object.keys(stationUsage).reduce((a, b) => stationUsage[a] > stationUsage[b] ? a : b, "N/A");
                    // let preferredPaymentMethod = Object.keys(paymentMethods).reduce((a, b) => paymentMethods[a] > paymentMethods[b] ? a : b, "N/A");

                    let avgDuration = totalSessions ? (totalDuration / totalSessions).toFixed(2) + " sec" : "N/A";
                    let totalVehicleCount = user.user_vehicle ? user.user_vehicle.length : 0;

                    return {
                        // userId: user._id,
                        phoneNumber: user.phoneNumber,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        gender: user.gender,
                        email: user.email,
                        dob: user.dob,
                        // state: user.state,
                        // city: user.city,
                        // createdDate: user.createdAt,
                        totalSessions,
                        energyConsumed: totalEnergyConsumed.toFixed(3) + " Wh",
                        avgDuration,
                        chargingDuration: totalChargingDuration + " sec",
                        // preferredStation,
                        // paymentMethod: preferredPaymentMethod,
                        feePaid: `${getCurrencySymbol(currency)} ${(totalFeePaid).toFixed(2)}` || "N/A",
                        feeUnpaid: `${getCurrencySymbol(currency)} ${(totalFeeUnpaid).toFixed(2)}` || "N/A",
                        // feePaid: `$${totalFeePaid.toFixed(2)}`,
                        // feeUnpaid: `$${totalFeeUnpaid.toFixed(2)}`,
                        totalVehicle: totalVehicleCount
                    };
                });

                columns = [
                    // { header: 'User ID', key: 'userId' },
                    { header: 'Phone Number', key: 'phoneNumber' },
                    { header: 'First Name', key: 'firstName' },
                    { header: 'Last Name', key: 'lastName' },
                    // { header: 'Status', key: 'status' },
                    // { header: 'State', key: 'state' },
                    // { header: 'City', key: 'city' },
                    { header: 'Gender', key: 'gender' },
                    { header: 'Email', key: 'email' },
                    { header: 'Date of Birth', key: 'dob' },
                    // { header: 'Created Date', key: 'createdDate' },
                    { header: 'Total Sessions', key: 'totalSessions' },
                    { header: 'Energy Consumed', key: 'energyConsumed' },
                    { header: 'Avg Duration', key: 'avgDuration' },
                    { header: 'Charging Duration', key: 'chargingDuration' },
                    // { header: 'Preferred Station', key: 'preferredStation' },
                    // { header: 'Payment Method', key: 'paymentMethod' },
                    { header: 'Fee Paid', key: 'feePaid' },
                    { header: 'Fee Unpaid', key: 'feeUnpaid' },
                    { header: 'Total Vehicles', key: 'totalVehicle' },
                ];
                break;


            case 'Sessions':
                let sessions = await ChargingSession.find({ createdAt: { $gte: from, $lte: to } });

                data = await Promise.all(sessions.map(async (session) => {
                    let chargerLocation = await Charger.findOne({ "chargerInfo.name": session.chargerId });
                    let locationDetails = chargerLocation ? { locationName: chargerLocation.locationName } : {};

                    let chargerDetails = {};
                    if (chargerLocation) {
                        let charger = chargerLocation.chargerInfo.find(charger => charger.name === session.chargerId);
                        if (charger) {
                            chargerDetails = {
                                chargerType: charger.type || "N/A",
                                chargerSubtype: charger.subtype || "N/A",
                                costPerUnit: charger.costPerUnit || "N/A",
                            };
                        }
                    }

                    // Fetch payment details
                    let payment = await Payment.findOne({ sessionId: session._id });

                    // Duration Calculation in HH:mm:ss format
                    let duration = "Ongoing";
                    if (session.startTime && session.endTime) {
                        let diffInSeconds = Math.floor((new Date(session.endTime) - new Date(session.startTime)) / 1000);
                        let hours = String(Math.floor(diffInSeconds / 3600)).padStart(2, '0');
                        let minutes = String(Math.floor((diffInSeconds % 3600) / 60)).padStart(2, '0');
                        let seconds = String(diffInSeconds % 60).padStart(2, '0');
                        duration = `${hours}:${minutes}:${seconds}`;
                    }
                    // Fetch user details to get vehicleType
                    let vehicleType = "N/A";
                    if (session.vehicleId && session.userPhone) {
                        let user = await User.findOne({ phoneNumber: session.userPhone });
                        if (user && user.user_vehicle.length > 0) {
                            let vehicle = user.user_vehicle.find(v => new mongoose.Types.ObjectId(v._id).equals(session.vehicleId));
                            // let vehicle = user.user_vehicle.find(v => String(v._id) === String(session.vehicleId));
                            if (vehicle) {
                                vehicleType = vehicle.type || "N/A";
                            }
                        }
                    }

                    return {
                        sessionId: session._id,
                        userPhone: session.userPhone,
                        locationName: locationDetails.locationName,
                        chargerId: session.chargerId,
                        paymentId: payment ? payment.id : "N/A",
                        chargerType: chargerDetails.chargerType || "N/A",
                        chargerSubtype: chargerDetails.chargerSubtype || "N/A",
                        vehicleType: vehicleType,
                        energyConsumed: (session.endMeterValue && session.startMeterValue) ?
                            ((session.endMeterValue - session.startMeterValue)).toFixed(3) + " Wh" : "N/A",
                        // energyConsumed: (session.endMeterValue && session.startMeterValue) ?
                        //     ((session.endMeterValue - session.startMeterValue) / 1000).toFixed(3) + " kWh" : "N/A",
                        duration,
                        // costPerUnit: chargerDetails.costPerUnit,
                        costPerUnit: `${getCurrencySymbol(chargerDetails.costPerUnit.currency)} ${chargerDetails.costPerUnit.amount}`,
                        paymentAmount: payment ? `${getCurrencySymbol(chargerDetails.costPerUnit.currency)} ${(payment.amount / 100).toFixed(2)}` : "N/A",
                        status: session.status,
                        startTime: session.startTime,
                        endTime: session.endTime || "Ongoing",
                        // reason: session.reason || "N/A"
                    };
                }));

                columns = [
                    { header: 'Session ID', key: 'sessionId' },
                    { header: 'User Phone', key: 'userPhone' },
                    { header: 'Location Name', key: 'locationName' },
                    { header: 'Charger ID', key: 'chargerId' },
                    { header: 'Payment ID', key: 'paymentId' },
                    { header: 'Charger Type', key: 'chargerType' },
                    { header: 'Connector Type', key: 'chargerSubtype' },
                    { header: 'Vehicle Type', key: 'vehicleType' },
                    { header: 'Energy Delivered', key: 'energyConsumed' },
                    { header: 'Duration', key: 'duration' },
                    { header: 'Cost per kWh', key: 'costPerUnit' },
                    { header: 'Total Payment', key: 'paymentAmount' },
                    { header: 'Payment Status', key: 'status' },
                    { header: 'Start Time', key: 'startTime' },
                    { header: 'End Time', key: 'endTime' },
                ];
                break;

            // case 'Payments':
            //     let payments = await Payment.find({ createdAt: { $gte: from, $lte: to } });

            //     data = await Promise.all(payments.map(async (payment) => {
            //         let session = await ChargingSession.findOne({ _id: payment.sessionId });
            //         let user = await User.findOne({ phoneNumber: session?.userPhone });

            //         let chargerLocation = await Charger.findOne({ "chargerInfo.name": session?.chargerId });
            //         let locationDetails = chargerLocation ? { locationId: chargerLocation._id } : {};

            //         return {
            //             status: payment.status || "N/A",
            //             paymentId: payment.id,
            //             chargerId: session.chargerId || "N/A",
            //             locationId: locationDetails.locationId || "N/A",
            //             sessionId: payment.sessionId,
            //             amount: `${getCurrencySymbol(payment.currency)} ${(payment.amount / 100).toFixed(2)}`,
            //             currency: payment.currency || "N/A",
            //             orderId: payment.orderId || "N/A",
            //             invoiceId: payment.invoiceId || "N/A",
            //             method: payment.method || "N/A",
            //             captured: payment.captured ? "Yes" : "No",
            //             description: payment.description || "N/A",
            //             email: user?.email || "N/A",
            //             userPhone: user?.phoneNumber || "N/A",
            //             fee: `${getCurrencySymbol(payment.currency)} ${(payment.fee / 100).toFixed(2)}` || "N/A",
            //             tax: `${getCurrencySymbol(payment.currency)} ${(payment.tax / 100).toFixed(2)}` || "N/A",
            //             // tax: payment.tax || "N/A",
            //         };
            //     }));

            //     columns = [
            //         { header: 'Status', key: 'status' },
            //         { header: 'Payment ID', key: 'paymentId' },
            //         { header: 'Charger ID', key: 'chargerId' },
            //         { header: 'Location ID', key: 'locationId' },
            //         { header: 'Session ID', key: 'sessionId' },
            //         { header: 'Amount', key: 'amount' },
            //         { header: 'Currency', key: 'currency' },
            //         { header: 'Order ID', key: 'orderId' },
            //         { header: 'Invoice ID', key: 'invoiceId' },
            //         { header: 'Method', key: 'method' },
            //         { header: 'Captured', key: 'captured' },
            //         { header: 'Description', key: 'description' },
            //         { header: 'Email', key: 'email' },
            //         { header: 'User ID', key: 'userId' },
            //         { header: 'Fee', key: 'fee' },
            //         { header: 'Tax', key: 'tax' },
            //     ];
            //     break;
            case 'Payments':
                // Fetch all payments within the date range
                let payments = await Payment.find({ createdAt: { $gte: from, $lte: to } }).lean();

                // Extract all session IDs
                let sessionIds = payments.map(payment => payment.sessionId);

                // Fetch all charging sessions in one go
                let sessions1 = await ChargingSession.find({ _id: { $in: sessionIds } }).lean();
                let sessionMap = Object.fromEntries(sessions1.map(session => [session._id.toString(), session]));

                // Extract all user phone numbers from sessions
                let userPhones = sessions1.map(session => session.userPhone);
                let users1 = await User.find({ phoneNumber: { $in: userPhones } }).lean();
                let userMap = Object.fromEntries(users1.map(user => [user.phoneNumber, user]));

                // Extract all charger IDs from sessions
                let chargerIds3 = sessions1.map(session => session.chargerId);
                let chargers1 = await Location.find({ "chargerInfo.name": { $in: chargerIds3 } }).lean();
                // let chargerMap = Object.fromEntries(chargers1.map(charger => [charger.chargerInfo.name, charger]));
                let chargerMap = {};
                chargers1.forEach(location => {
                    location.chargerInfo.forEach(info => {
                        chargerMap[info.name] = location._id; // Store location ID instead of full object
                    });
                });
                // console.log(chargerMap)
                // Map data efficiently
                data = payments.map(payment => {
                    let session = sessionMap[payment.sessionId] || {};
                    let user = userMap[session?.userPhone] || {};
                    let charger = chargerMap[session?.chargerId] || {};

                    return {
                        // status: payment.status || "N/A",
                        paymentId: payment.id,
                        chargerId: session.chargerId || "N/A",
                        locationId: charger?._id || "N/A",
                        sessionId: payment.sessionId,
                        amount: `${getCurrencySymbol(payment.currency)} ${(payment.amount / 100).toFixed(2)}`,
                        currency: payment.currency || "N/A",
                        orderId: payment.orderId || "N/A",
                        invoiceId: payment.invoiceId || "N/A",
                        method: payment.method || "N/A",
                        captured: payment.captured ? "Yes" : "No",
                        // description: payment.description || "N/A",
                        email: payment.email || "N/A",
                        userPhone: user?.phoneNumber || "N/A",
                        fee: `${getCurrencySymbol(payment.currency)} ${(payment.fee / 100).toFixed(2)}` || "N/A",
                        tax: `${getCurrencySymbol(payment.currency)} ${(payment.tax / 100).toFixed(2)}` || "N/A",
                    };
                });

                columns = [
                    // { header: 'Status', key: 'status' },
                    { header: 'Payment ID', key: 'paymentId' },
                    { header: 'Charger ID', key: 'chargerId' },
                    { header: 'Location ID', key: 'locationId' },
                    { header: 'Session ID', key: 'sessionId' },
                    { header: 'Amount', key: 'amount' },
                    { header: 'Currency', key: 'currency' },
                    { header: 'Order ID', key: 'orderId' },
                    { header: 'Invoice ID', key: 'invoiceId' },
                    { header: 'Method', key: 'method' },
                    { header: 'Captured', key: 'captured' },
                    // { header: 'Description', key: 'description' },
                    { header: 'Email', key: 'email' },
                    { header: 'Phone Number', key: 'userPhone' },
                    { header: 'Fee', key: 'fee' },
                    { header: 'Tax', key: 'tax' },
                ];
                break;

            // case 'sessions':
            //     // Find charging sessions within the date range
            //     let sessions = await ChargingSession.find({ createdAt: { $gte: from, $lte: to } });

            //     // Fetch charger location info for each session
            //     data = await Promise.all(sessions.map(async (session) => {
            //         let chargerLocation = await Charger.findOne({ "chargerInfo.name": session.chargerId });

            //         let locationDetails = chargerLocation ? {
            //             locationName: chargerLocation.locationName,
            //         } : {};

            //         // Extract charger details if chargerLocation exists
            //         let chargerDetails = {};
            //         if (chargerLocation) {
            //             let charger = chargerLocation.chargerInfo.find(charger => charger.name === session.chargerId);
            //             if (charger) {
            //                 chargerDetails = {
            //                     chargerType: charger.type || "N/A",
            //                     chargerSubtype: charger.subtype || "N/A",
            //                     costPerUnit: charger.costPerUnit || "N/A",
            //                     // powerRating: charger.powerRating || "N/A"
            //                 };
            //             }
            //         }

            //         return {
            //             sessionId: session._id,
            //             userPhone: session.userPhone,
            //             locationName: locationDetails.locationName,
            //             chargerId: session.chargerId,
            //             // locationDetails, // Embedded location details
            //             ...chargerDetails, // Include charger details
            //             startTime: session.startTime,
            //             endTime: session.endTime || "Ongoing",
            //             status: session.status,
            //             energyConsumed: (session.endMeterValue && session.startMeterValue) ?
            //                 ((session.endMeterValue - session.startMeterValue)).toFixed(3) + " Wh" : "N/A",
            //                 // ((session.endMeterValue - session.startMeterValue) / 1000).toFixed(3) + " kWh" : "N/A",
            //             reason: session.reason || "N/A"
            //         };
            //     }));

            //     columns = [
            //         { header: 'Session ID', key: 'sessionId' },
            //         { header: 'User Phone', key: 'userPhone' },
            //         { header: 'Location Name', key: 'locationName' },
            //         { header: 'Charger ID', key: 'chargerId' },
            //         { header: 'Payment id', key: 'paymentId' },
            //         { header: 'Charger Type', key: 'chargerType' },
            //         { header: 'Connector Type', key: 'chargerSubtype' },
            //         { header: 'Vehicle Type', key: 'vehicleType ' },
            //         { header: 'Energy Delivered ', key: 'energyConsumed' },
            //         { header: 'Duration', key: 'duration' },
            //         // { header: 'Average Power', key: 'avgPower' },
            //         // { header: 'Average Temperture', key: 'avgTemp' },
            //         { header: 'Cost per kWh', key: 'costPerUnit' },
            //         { header: 'Total Payment', key: 'paymentAmount' },
            //         { header: 'Payment status', key: 'status' },
            //         // { header: 'Location ID', key: 'locationDetails.locationId' },
            //         // { header: 'City', key: 'locationDetails.city' },
            //         // { header: 'State', key: 'locationDetails.state' },
            //         // { header: 'Address', key: 'locationDetails.address' },
            //         { header: 'Start Time', key: 'startTime' },
            //         { header: 'End Time', key: 'endTime' },
            //         // { header: 'Status', key: 'status' },
            //         // { header: 'Reason', key: 'reason' },
            //     ];
            //     break;
            // data = await Session.find({
            //     createdAt: { $gte: from, $lte: to }
            // });

            // columns = [
            //     { header: 'Session ID', key: '_id' },
            //     // { header: 'User ID', key: 'userId' },
            //     { header: 'Location', key: 'locationName' },
            //     { header: 'Charger ID', key: 'chargerId' },
            //     { header: 'Session Duration', key: 'duration' },
            //     { header: 'Energy Used', key: 'energyUsed' },
            //     { header: 'Cost', key: 'cost' },
            //     { header: 'Payment Status', key: 'paymentStatus' },
            //     { header: 'Created Date', key: 'createdAt' },
            // ];
            // break;

            default:
                return res.status(400).json({ status: false, message: 'Invalid filter option' });
        }

        return res.json({
            status: true,
            message: data.length ? 'Data fetched successfully' : 'No data found',
            columns,
            data
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

module.exports = router;
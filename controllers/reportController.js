const express = require('express');
const mongoose = require('mongoose');
const Charger = require('../models/chargerLocationModel'); // Charger model
const Location = require('../models/chargerLocationModel'); // Location model
const User = require('../models/userModel'); // User model
const ExcelJS = require('exceljs'); // ExcelJS library

const router = express.Router();

// Utility function to validate dates
const isValidDate = (date) => {
    return !isNaN(Date.parse(date));
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

module.exports = router;
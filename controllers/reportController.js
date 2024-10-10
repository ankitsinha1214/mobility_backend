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
                data = await Charger.find({
                    createdAt: { $gte: from, $lte: to }
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
                    { header: 'Created Date', key: 'createdAt', width: 30 },
                ];
                break;

            case 'locations':
                worksheet.columns = [
                    { header: 'Location ID', key: '_id', width: 30 },
                    { header: 'Location Name', key: 'locationName', width: 30 },
                    { header: 'Created Date', key: 'createdAt', width: 30 },
                ];
                break;

            case 'users':
                worksheet.columns = [
                    { header: 'User ID', key: '_id', width: 30 },
                    { header: 'Username', key: 'username', width: 30 },
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
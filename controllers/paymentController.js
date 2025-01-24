const Payment = require('../models/paymentModel'); // Adjust path as necessary
const ChargingSession = require('../models/chargerSessionModel');

// CREATE Operation
exports.createPayment = async (req, res) => {
    try {
        const paymentData = req.body;
        // Check if sessionId exists in ChargingSession
        const sessionExists = await ChargingSession.findById(paymentData.sessionId);
        if (!sessionExists) {
            return res.json({
                status: false,
                message: 'Invalid sessionId. Charging session does not exist.',
            });
        }
        const payment = new Payment(paymentData);
        await payment.save();
        return res.json({
            status: true,
            message: 'Payment created successfully.',
            data: payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to create payment.',
            error: error.message
        });
    }
};

// READ Operation (Get All Payments)
exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('sessionId'); // Populating ChargingSession details
        return res.json({
            status: true,
            message: 'Payments fetched successfully.',
            data: payments
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch payments.',
            error: error.message
        });
    }
};

// GET BY ID Operation
exports.getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findById(id).populate('sessionId'); // Populating ChargingSession details
        if (!payment) {
            return res.json({
                status: false,
                message: 'Payment not found.'
            });
        }
        return res.json({
            status: true,
            message: 'Payment fetched successfully.',
            data: payment
        });
    } catch (error) {
        console.error('Error fetching payment by ID:', error);
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch payment.',
            error: error.message
        });
    }
};

// CHECK PAYMENT BY SESSION ID 
exports.checkPaymentBySessionId = async (req, res) => {
    try {
        const { sessionId } = req.body;
        // Find the payment by sessionId
        const payment = await Payment.findOne({ sessionId });

        if (!payment) {
            return res.json({
                status: false,
                message: 'Payment not found for the given session ID'
            });
        }

        // Check if the status is 'captured'
        if (payment.status === 'captured') {
            return res.json({
                status: true,
                message: 'Payment status is captured',
                // data: payment
            });
        } else {
            return res.json({
                status: false,
                message: 'Payment status is not captured',
                currentStatus: payment.status
            });
        }
    } catch (error) {
        console.error('Error checking payment status by session ID:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while checking the payment status'
        });
    }
};

const express = require('express');
const router = express.Router();
const { createPayment, getAllPayments, getPaymentById, checkPaymentBySessionId } = require('../controllers/paymentController');
const fetchUser = require('../middleware/fetchuser');

router.post('/',
    fetchUser,
    createPayment);
    
router.get('/',
    fetchUser,
    getAllPayments);

router.get('/:id',
    fetchUser,
    getPaymentById);

router.post('/check-payment-status',
    fetchUser,
    checkPaymentBySessionId);

module.exports = router;

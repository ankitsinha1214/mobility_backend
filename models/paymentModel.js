const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    entity: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
        required: true
    },
    method: {
        type: String,
        enum: ['card', 'netbanking', 'wallet', 'emi', 'upi'],
        required: true
    },
    order_id: {
        type: String
    },
    description: {
        type: String
    },
    international: {
        type: Boolean
    },
    refund_status: {
        type: String,
        enum: [null, 'partial', 'full']
    },
    amount_refunded: {
        type: Number,
        default: 0
    },
    captured: {
        type: Boolean
    },
    email: {
        type: String
    },
    contact: {
        type: String
    },
    fee: {
        type: Number
    },
    tax: {
        type: Number
    },
    error_code: {
        type: String
    },
    error_description: {
        type: String
    },
    error_source: {
        type: String
    },
    error_step: {
        type: String
    },
    error_reason: {
        type: String
    },
    notes: {
        type: Schema.Types.Mixed // Allows flexible JSON object
    },
    created_at: {
        type: Number
    },
    card_id: {
        type: String
    },
    card: {
        id: String,
        entity: String,
        name: String,
        last4: Number,
        network: String,
        type: {
            type: String,
            enum: ['credit', 'debit', 'prepaid', 'unknown']
        },
        issuer: String,
        emi: Boolean,
        sub_type: String
    },
    upi: {
        payer_account_type: String,
        vpa: String,
        flow: String,
    },
    bank: {
        type: String
    },
    wallet: {
        type: String
    },
    acquirer_data: {
        type: Object
    },
    sessionId: {
        type: Schema.Types.ObjectId,
        ref: 'ChargingSession',
        required: true
    }
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

const FAQ = require('../models/faqModel');

// Create an FAQ
const createFAQ = async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        await faq.save();
        return res.json({ success: true, data: faq, message: 'FAQ created successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all FAQs
const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find();
        if (faqs.length === 0) {
            return res.json({ success: false, message: 'No FAQs found' });
        }
        return res.json({ success: true, data: faqs });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get a single FAQ by ID
const getFAQById = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await FAQ.findById(id);
        if (!faq) {
            return res.json({ success: false, message: 'FAQ not found' });
        }
        return res.json({ success: true, data: faq });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update an FAQ by ID
const updateFAQ = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await FAQ.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!faq) {
            return res.json({ success: false, message: 'FAQ not found' });
        }
        return res.json({ success: true, data: faq });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete an FAQ by ID
const deleteFAQ = async (req, res) => {
    const { id } = req.params;
    try {
        const faq = await FAQ.findByIdAndDelete(id);
        if (!faq) {
            return res.json({ success: false, message: 'FAQ not found' });
        }
        return res.json({ success: true, message: 'FAQ deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    createFAQ,
    getFAQs,
    getFAQById,
    updateFAQ,
    deleteFAQ
};

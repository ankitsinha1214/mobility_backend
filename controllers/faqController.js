const FAQ = require('../models/faqModel');

// Create an FAQ
const createFAQ = async (req, res) => {
    try {
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
        const faq = new FAQ(req.body);
        await faq.save();
        return res.json({ success: true, data: faq, message: 'FAQ created successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get all FAQs with a given category
const faqByCategory = async (req, res) => {
    const { category } = req.body;
    if (!category) {
        return res.json({ success: false, message: 'Category is required' });
    }
    try {
        const faqs = await FAQ.find({ category });
        if (faqs.length === 0) {
            return res.json({ success: false, message: 'No FAQs of given category found' });
        }
        return res.json({ success: true, data: faqs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all unique categories
const getCategoryFaq = async (req, res) => {
    try {
        const categories = await FAQ.distinct('category');
        if (categories.length === 0) {
            return res.json({ success: false, message: 'No FAQs Category found' });
        }
        return res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
        if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
            return res.status(401).json({ success: false, message: "You are Not a Valid User." });
        }
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
    getCategoryFaq,
    faqByCategory,
    getFAQById,
    updateFAQ,
    deleteFAQ
};

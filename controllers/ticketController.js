const ticketCategory = require('../models/ticketCategory');

// Create an FAQ
// const createFAQ = async (req, res) => {
//     try {
//         if (!req.user || (req.user !== 'Admin' && req.user !== 'Manager')) {
//             return res.status(401).json({ success: false, message: "You are Not a Valid User." });
//         }
//         const faq = new FAQ(req.body);
//         await faq.save();
//         return res.json({ success: true, data: faq, message: 'FAQ created successfully' });
//     } catch (error) {
//         console.error('Error:', error);
//         return res.status(500).json({ success: false, message: 'Internal server error' });
//     }
// };

// Get all FAQs with a given category
// const faqByCategory = async (req, res) => {
//     const { category } = req.body;
//     if (!category) {
//         return res.json({ success: false, message: 'Category is required' });
//     }
//     try {
//         const faqs = await FAQ.find({ category });
//         if (faqs.length === 0) {
//             return res.json({ success: false, message: 'No FAQs of given category found' });
//         }
//         return res.json({ success: true, data: faqs });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Get all unique categories
const getCategory = async (req, res) => {
    try {
        const categories = await ticketCategory.distinct('name');
        if (categories.length === 0) {
            return res.json({ success: false, message: 'No Category found' });
        }
        return res.json({ success: true, data: categories, message: 'Category retrieved Successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    // createFAQ,
    getCategory,
    // faqByCategory
};

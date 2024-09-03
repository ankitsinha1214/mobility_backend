const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');
const fetchUser = require('../middleware/fetchuser');

// Create an FAQ
router.post('/',fetchUser, faqController.createFAQ);

// Get all FAQs
router.get('/',fetchUser, faqController.getFAQs);

// Get all category of faq
router.get('/all-faq-category', fetchUser, faqController.getCategoryFaq);

// Get all FAQs by category
router.post('/faq-category', fetchUser, faqController.faqByCategory);

// Get a single FAQ by ID
router.get('/:id', fetchUser, faqController.getFAQById);

// Update an FAQ by ID
router.put('/:id', fetchUser, faqController.updateFAQ);

// Delete an FAQ by ID
router.delete('/:id', fetchUser, faqController.deleteFAQ);

module.exports = router;

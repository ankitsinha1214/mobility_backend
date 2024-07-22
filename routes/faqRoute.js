const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

// Create an FAQ
router.post('/', faqController.createFAQ);

// Get all FAQs
router.get('/', faqController.getFAQs);

// Get all category of faq
router.get('/all-faq-category', faqController.getCategoryFaq);

// Get all FAQs by category
router.get('/faq-category', faqController.faqByCategory);

// Get a single FAQ by ID
router.get('/:id', faqController.getFAQById);

// Update an FAQ by ID
router.put('/:id', faqController.updateFAQ);

// Delete an FAQ by ID
router.delete('/:id', faqController.deleteFAQ);

module.exports = router;

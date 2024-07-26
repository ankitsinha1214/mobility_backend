const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestionById,
    deleteQuestionById
} = require('../controllers/preDeliveryQuestionController'); // Adjust the path as necessary

// Define routes
router.post('/', createQuestion);
router.get('/', getAllQuestions);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestionById);
router.delete('/:id', deleteQuestionById);

module.exports = router;

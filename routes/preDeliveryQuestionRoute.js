const express = require('express');
const router = express.Router();
const {
    createQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestionById,
    deleteQuestionById
} = require('../controllers/preDeliveryQuestionController'); // Adjust the path as necessary
const fetchUser = require('../middleware/fetchuser');

// Define routes
router.post('/',fetchUser, createQuestion);
router.get('/',fetchUser, getAllQuestions);
router.get('/:id',fetchUser, getQuestionById);
router.put('/:id',fetchUser, updateQuestionById);
router.delete('/:id',fetchUser, deleteQuestionById);

module.exports = router;

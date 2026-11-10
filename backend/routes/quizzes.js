const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { generateQuiz, startAttempt, submitQuiz, getQuizHistory } = require('../controllers/quizController');

router.use(authenticate);
router.post('/generate', generateQuiz);
router.post('/attempt', startAttempt);
router.post('/submit', submitQuiz);
router.get('/history', getQuizHistory);

module.exports = router;


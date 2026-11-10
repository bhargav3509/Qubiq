const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getRecommendations, markRead } = require('../controllers/revisionController');

router.use(authenticate);
router.get('/', getRecommendations);
router.patch('/:id/read', markRead);

module.exports = router;


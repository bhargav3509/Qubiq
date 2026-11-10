const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getLeaderboard } = require('../controllers/leaderboardController');

router.use(authenticate);
router.get('/', getLeaderboard);

module.exports = router;


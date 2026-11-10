const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getStats, getMissions } = require('../controllers/gamificationController');

router.use(authenticate);
router.get('/stats', getStats);
router.get('/missions', getMissions);

module.exports = router;


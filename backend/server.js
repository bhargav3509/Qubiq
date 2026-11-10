require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const quizRoutes = require('./routes/quizzes');
const gamificationRoutes = require('./routes/gamification');
const leaderboardRoutes = require('./routes/leaderboard');
const revisionRoutes = require('./routes/revision');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/revision', revisionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🎮 QUBIQ Backend is running!', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎮 QUBIQ Backend running on http://localhost:${PORT}`);
});

module.exports = app;


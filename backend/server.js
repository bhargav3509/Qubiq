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
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/documents', documentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/quizzes', quizRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/revision', revisionRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: '🎮 QUBIQ Backend is running!', health: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🎮 QUBIQ Backend is running!', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎮 QUBIQ Backend running on http://localhost:${PORT}`);
});

module.exports = app;


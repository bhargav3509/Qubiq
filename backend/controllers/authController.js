const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const achievementService = require('../services/achievementService');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return res.status(409).json({ error: 'Email or username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        level: { create: {} },
        streak: { create: {} },
      },
      include: { level: true, streak: true },
    });

    await achievementService.seedAchievements();

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { level: true, streak: true },
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    await updateStreak(user.id);

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        level: true,
        streak: true,
        achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } },
        quizAttempts: {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
          take: 10,
          include: { quiz: { include: { document: { select: { title: true } } } } },
        },
        _count: { select: { quizAttempts: true, documents: true } },
      },
    });

    const totalXP = await prisma.xPTransaction.aggregate({
      where: { userId: req.user.id },
      _sum: { amount: true },
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      level: user.level,
      streak: user.streak,
      achievements: user.achievements,
      quizAttempts: user.quizAttempts,
      totalXP: totalXP._sum.amount || 0,
      _count: user._count,
    });
  } catch (error) {
    next(error);
  }
};

async function updateStreak(userId) {
  try {
    const streak = await prisma.learningStreak.findUnique({ where: { userId } });
    const now = new Date();

    if (!streak) {
      await prisma.learningStreak.create({
        data: { userId, currentStreak: 1, longestStreak: 1, lastActivityAt: now, streakStartAt: now },
      });
      return;
    }

    if (!streak.lastActivityAt) {
      await prisma.learningStreak.update({
        where: { userId },
        data: { currentStreak: 1, longestStreak: Math.max(1, streak.longestStreak), lastActivityAt: now },
      });
      return;
    }

    const daysDiff = Math.floor((now - streak.lastActivityAt) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return; // Already logged today

    if (daysDiff === 1) {
      const newStreak = streak.currentStreak + 1;
      await prisma.learningStreak.update({
        where: { userId },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, streak.longestStreak),
          lastActivityAt: now,
        },
      });
    } else {
      await prisma.learningStreak.update({
        where: { userId },
        data: { currentStreak: 1, lastActivityAt: now, streakStartAt: now },
      });
    }
  } catch (error) {
    console.error('Streak update error:', error.message);
  }
}

module.exports = { register, login, getProfile };


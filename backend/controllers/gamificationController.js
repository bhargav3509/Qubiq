const prisma = require('../config/database');
const xpService = require('../services/xpService');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [level, streak, achievements, recentAttempts] = await Promise.all([
      prisma.userLevel.findUnique({ where: { userId } }),
      prisma.learningStreak.findUnique({ where: { userId } }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: { quiz: { include: { document: { select: { title: true } } } } },
      }),
    ]);

    const levelInfo = level ? xpService.getLevelInfo(level.level) : xpService.getLevelInfo(1);
    const nextLevelXP = level ? xpService.getNextLevelXP(level.level) : 200;

    res.json({
      level: level || { level: 1, xp: 0, totalXp: 0 },
      levelInfo,
      nextLevelXP,
      streak: streak || { currentStreak: 0, longestStreak: 0 },
      achievements,
      recentAttempts,
    });
  } catch (error) {
    next(error);
  }
};

const getMissions = async (req, res, next) => {
  try {
    const missions = await prisma.mission.findMany({
      where: { document: { userId: req.user.id } },
      include: {
        document: { select: { title: true } },
        topic: true,
      },
      orderBy: [{ worldIndex: 'asc' }, { orderIndex: 'asc' }],
    });
    res.json(missions);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getMissions };


const prisma = require('../config/database');

const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'global' } = req.query;

    const topUsers = await prisma.user.findMany({
      include: {
        level: true,
      },
      take: 50,
    });

    let leaderboard;

    if (type === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyXP = await prisma.xPTransaction.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: weekAgo } },
        _sum: { amount: true },
      });

      const weeklyMap = new Map(weeklyXP.map((r) => [r.userId, r._sum.amount || 0]));

      leaderboard = topUsers
        .map((user) => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          level: user.level?.level || 1,
          totalXP: user.level?.totalXp || 0,
          weeklyXP: weeklyMap.get(user.id) || 0,
        }))
        .sort((a, b) => b.weeklyXP - a.weeklyXP)
        .map((user, index) => ({ ...user, rank: index + 1 }));
    } else {
      leaderboard = topUsers
        .map((user) => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          level: user.level?.level || 1,
          totalXP: user.level?.totalXp || 0,
        }))
        .sort((a, b) => b.totalXP - a.totalXP)
        .map((user, index) => ({ ...user, rank: index + 1 }));
    }

    const userRank = leaderboard.find((u) => u.id === req.user.id);

    res.json({ leaderboard, userRank });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };


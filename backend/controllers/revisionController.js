const prisma = require('../config/database');
const recommendationService = require('../services/recommendationService');

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await prisma.recommendation.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const rec = await prisma.recommendation.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' });

    await prisma.recommendation.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecommendations, markRead };


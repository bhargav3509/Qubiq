const prisma = require('../config/database');

const XP_REWARDS = {
  CORRECT_ANSWER: 10,
  QUIZ_COMPLETION: 20,
  PERFECT_SCORE: 50,
  DAILY_CHALLENGE: 30,
  IMPROVEMENT_BONUS: 25,
  BOSS_BATTLE: 40,
};

const LEVELS = [
  { level: 1, name: 'Beginner', xpRequired: 0 },
  { level: 2, name: 'Explorer', xpRequired: 200 },
  { level: 3, name: 'Challenger', xpRequired: 500 },
  { level: 4, name: 'Scholar', xpRequired: 1000 },
  { level: 5, name: 'Master', xpRequired: 2000 },
];

class XPService {
  async awardXP(userId, amount, reason, referenceId = null, referenceType = null) {
    // Prevent duplicate XP for the same reference
    if (referenceId && referenceType) {
      const existing = await prisma.xPTransaction
        .findUnique({
          where: {
            userId_referenceId_referenceType: { userId, referenceId, referenceType },
          },
        })
        .catch(() => null);
      if (existing) return null;
    }

    const transaction = await prisma.xPTransaction.create({
      data: { userId, amount, reason, referenceId, referenceType },
    });

    await this.updateLevel(userId, amount);
    return transaction;
  }

  async updateLevel(userId, xpGained) {
    let userLevel = await prisma.userLevel.findUnique({ where: { userId } });

    if (!userLevel) {
      userLevel = await prisma.userLevel.create({ data: { userId } });
    }

    const newXP = userLevel.xp + xpGained;
    const newTotalXP = userLevel.totalXp + xpGained;
    const newLevelData = this.calculateLevel(newTotalXP);

    await prisma.userLevel.update({
      where: { userId },
      data: { xp: newXP, totalXp: newTotalXP, level: newLevelData.level },
    });

    return { leveled: newLevelData.level > userLevel.level, newLevel: newLevelData.level };
  }

  calculateLevel(totalXP) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (totalXP >= LEVELS[i].xpRequired) return LEVELS[i];
    }
    return LEVELS[0];
  }

  getLevelInfo(level) {
    return LEVELS.find((l) => l.level === level) || LEVELS[0];
  }

  getNextLevelXP(currentLevel) {
    const next = LEVELS.find((l) => l.level === currentLevel + 1);
    return next ? next.xpRequired : null;
  }

  async calculateQuizXP(userId, attemptId, accuracy, correctCount, quizMode) {
    const xpItems = [];
    let total = 0;

    const correctXP = correctCount * XP_REWARDS.CORRECT_ANSWER;
    xpItems.push({ amount: correctXP, reason: `${correctCount} correct answers` });
    total += correctXP;

    xpItems.push({ amount: XP_REWARDS.QUIZ_COMPLETION, reason: 'Quiz completion bonus' });
    total += XP_REWARDS.QUIZ_COMPLETION;

    if (accuracy === 100) {
      xpItems.push({ amount: XP_REWARDS.PERFECT_SCORE, reason: '🌟 Perfect score bonus!' });
      total += XP_REWARDS.PERFECT_SCORE;
    }

    if (quizMode === 'daily_challenge') {
      xpItems.push({ amount: XP_REWARDS.DAILY_CHALLENGE, reason: '📅 Daily challenge bonus' });
      total += XP_REWARDS.DAILY_CHALLENGE;
    }

    if (quizMode === 'boss_battle') {
      xpItems.push({ amount: XP_REWARDS.BOSS_BATTLE, reason: '🐉 Boss Battle bonus!' });
      total += XP_REWARDS.BOSS_BATTLE;
    }

    await this.awardXP(userId, total, 'Quiz completion', attemptId, 'quiz_attempt');

    return { total, items: xpItems };
  }
}

module.exports = new XPService();


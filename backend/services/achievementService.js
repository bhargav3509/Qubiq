const prisma = require('../config/database');

const ACHIEVEMENTS = [
  {
    key: 'first_victory',
    name: 'First Victory!',
    description: 'Complete your first quiz',
    icon: '🏆',
    xpReward: 50,
    condition: JSON.stringify({ type: 'quiz_count', value: 1 }),
  },
  {
    key: 'perfect_score',
    name: 'Perfect Score!',
    description: 'Get 100% accuracy on a quiz',
    icon: '⭐',
    xpReward: 100,
    condition: JSON.stringify({ type: 'accuracy', value: 100 }),
  },
  {
    key: 'seven_day_streak',
    name: '7-Day Streak!',
    description: 'Learn for 7 consecutive days',
    icon: '🔥',
    xpReward: 75,
    condition: JSON.stringify({ type: 'streak', value: 7 }),
  },
  {
    key: 'knowledge_master',
    name: 'Knowledge Master',
    description: 'Reach Level 5',
    icon: '🎓',
    xpReward: 200,
    condition: JSON.stringify({ type: 'level', value: 5 }),
  },
  {
    key: 'speedster',
    name: 'Speedster!',
    description: 'Complete a quiz in under 2 minutes',
    icon: '⚡',
    xpReward: 60,
    condition: JSON.stringify({ type: 'time', value: 120 }),
  },
  {
    key: 'mission_champion',
    name: 'Mission Champion',
    description: 'Complete 10 quizzes',
    icon: '🗡️',
    xpReward: 150,
    condition: JSON.stringify({ type: 'quiz_count', value: 10 }),
  },
];

class AchievementService {
  async seedAchievements() {
    for (const ach of ACHIEVEMENTS) {
      await prisma.achievement.upsert({
        where: { key: ach.key },
        update: {},
        create: ach,
      });
    }
  }

  async checkAndUnlock(userId, trigger) {
    const unlocked = [];

    try {
      const userAchievements = await prisma.userAchievement.findMany({ where: { userId } });
      const unlockedAchievementIds = userAchievements.map((ua) => ua.achievementId);
      const achievements = await prisma.achievement.findMany();

      for (const achievement of achievements) {
        if (unlockedAchievementIds.includes(achievement.id)) continue;

        const condition = JSON.parse(achievement.condition);
        const shouldUnlock = await this.evaluateCondition(userId, condition, trigger);

        if (shouldUnlock) {
          await prisma.userAchievement.create({
            data: { userId, achievementId: achievement.id },
          });
          unlocked.push(achievement);
        }
      }
    } catch (error) {
      console.error('Achievement check error:', error.message);
    }

    return unlocked;
  }

  async evaluateCondition(userId, condition, trigger) {
    try {
      switch (condition.type) {
        case 'quiz_count': {
          const count = await prisma.quizAttempt.count({
            where: { userId, status: 'completed' },
          });
          return count >= condition.value;
        }
        case 'accuracy':
          return trigger.accuracy !== undefined && trigger.accuracy >= condition.value;
        case 'streak': {
          const streak = await prisma.learningStreak.findUnique({ where: { userId } });
          return (streak?.currentStreak || 0) >= condition.value;
        }
        case 'level': {
          const level = await prisma.userLevel.findUnique({ where: { userId } });
          return (level?.level || 1) >= condition.value;
        }
        case 'time':
          return trigger.timeTaken !== undefined && trigger.timeTaken > 0 && trigger.timeTaken <= condition.value;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

module.exports = new AchievementService();


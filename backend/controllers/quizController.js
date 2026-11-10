const prisma = require('../config/database');
const quizGenerationService = require('../services/quizGenerationService');
const quizScoringService = require('../services/quizScoringService');
const xpService = require('../services/xpService');
const achievementService = require('../services/achievementService');
const recommendationService = require('../services/recommendationService');

const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, topicIds, difficulty, questionCount, duration, mode, questionType } = req.body;

    if (!documentId) return res.status(400).json({ error: 'Document ID is required' });

    const document = await prisma.document.findFirst({
      where: { id: documentId, userId: req.user.id },
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });
    if (document.status !== 'ready') {
      return res.status(400).json({ error: 'Document is still being processed. Please wait.' });
    }

    let topics;
    if (topicIds && topicIds.length > 0) {
      topics = await prisma.topic.findMany({ where: { id: { in: topicIds }, documentId } });
    } else {
      topics = await prisma.topic.findMany({ where: { documentId } });
    }

    if (!topics.length) return res.status(400).json({ error: 'No topics found for this document' });

    const count = Math.min(parseInt(questionCount) || 10, 20);

    const generatedQuestions = await quizGenerationService.generateQuestions(
      document.extractedText || '',
      topics,
      { difficulty: difficulty || 'medium', count, type: questionType || 'mcq' }
    );

    if (!generatedQuestions.length) {
      return res.status(500).json({ error: 'Failed to generate questions. Please try again.' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        documentId,
        title: `${document.title} — ${difficulty || 'Medium'} Quiz`,
        difficulty: difficulty || 'medium',
        mode: mode || 'standard',
        duration: parseInt(duration) || 600,
        questionCount: generatedQuestions.length,
        questions: {
          create: generatedQuestions.map((q, i) => {
            const topic = topics.find((t) => t.name === q.topic);
            return {
              topicId: topic?.id || null,
              type: q.type || 'mcq',
              questionText: q.questionText,
              explanation: q.explanation || '',
              difficulty: q.difficulty || difficulty || 'medium',
              orderIndex: i,
              options: {
                create: q.options.map((o, j) => ({
                  text: o.text,
                  isCorrect: o.isCorrect,
                  orderIndex: j,
                })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: { options: { orderBy: { orderIndex: 'asc' } }, topic: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Sanitize: remove isCorrect before sending to frontend
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ id: o.id, text: o.text, orderIndex: o.orderIndex })),
      })),
    };

    res.status(201).json(sanitizedQuiz);
  } catch (error) {
    next(error);
  }
};

const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    if (!quizId) return res.status(400).json({ error: 'Quiz ID is required' });

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    const attempt = await prisma.quizAttempt.create({
      data: { userId: req.user.id, quizId, status: 'in_progress' },
    });

    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
};

const submitQuiz = async (req, res, next) => {
  try {
    const { attemptId, answers, timeTaken } = req.body;

    if (!attemptId || !answers) {
      return res.status(400).json({ error: 'Attempt ID and answers are required' });
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: { id: attemptId, userId: req.user.id },
    });

    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.status === 'completed') return res.status(400).json({ error: 'Quiz already submitted' });

    const quiz = await prisma.quiz.findUnique({
      where: { id: attempt.quizId },
      include: {
        questions: {
          include: { options: true, topic: true },
          orderBy: { orderIndex: 'asc' },
        },
        document: { select: { extractedText: true } },
      },
    });

    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    // Save user answers
    for (const answer of answers) {
      await prisma.userAnswer.upsert({
        where: { id: answer.id || uuidv4() },
        create: {
          attemptId,
          questionId: answer.questionId,
          optionId: answer.optionId || null,
          isCorrect: false,
          timeTaken: answer.timeTaken || 0,
        },
        update: { optionId: answer.optionId || null },
      }).catch(async () => {
        await prisma.userAnswer.create({
          data: {
            attemptId,
            questionId: answer.questionId,
            optionId: answer.optionId || null,
            isCorrect: false,
            timeTaken: answer.timeTaken || 0,
          },
        }).catch(() => {});
      });
    }

    // Calculate score
    const scoring = quizScoringService.calculateScore(quiz.questions, answers);
    const stars = quizScoringService.calculateStars(scoring.accuracy);

    // Update answers with isCorrect
    for (const result of scoring.results) {
      await prisma.userAnswer.updateMany({
        where: { attemptId, questionId: result.questionId },
        data: { isCorrect: result.isCorrect },
      }).catch(() => {});
    }

    // Award XP
    const xpResult = await xpService.calculateQuizXP(
      req.user.id,
      attemptId,
      scoring.accuracy,
      scoring.correct,
      quiz.mode
    );

    // Update attempt
    await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'completed',
        score: scoring.score,
        accuracy: scoring.accuracy,
        timeTaken: parseInt(timeTaken) || 0,
        xpEarned: xpResult.total,
        starsEarned: stars,
        completedAt: new Date(),
      },
    });

    // Check achievements
    const unlockedAchievements = await achievementService.checkAndUnlock(req.user.id, {
      accuracy: scoring.accuracy,
      timeTaken: parseInt(timeTaken) || 0,
    });

    // Generate recommendations for weak topics
    const weakTopics = quizScoringService.identifyWeakTopics(scoring.topicPerformance);
    let recommendation = null;
    if (weakTopics.length > 0 && quiz.document?.extractedText) {
      recommendation = await recommendationService
        .generateRecommendations(req.user.id, weakTopics, quiz.document.extractedText)
        .catch((err) => { console.error('Recommendation error:', err.message); return null; });
    }

    res.json({
      scoring,
      stars,
      xpEarned: xpResult.total,
      xpBreakdown: xpResult.items,
      unlockedAchievements,
      weakTopics,
      recommendation,
      questions: quiz.questions, // Full questions with answers for review
    });
  } catch (error) {
    next(error);
  }
};

const getQuizHistory = async (req, res, next) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.id, status: 'completed' },
      include: {
        quiz: { include: { document: { select: { title: true } } } },
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });
    res.json(attempts);
  } catch (error) {
    next(error);
  }
};

// helper for submit
function uuidv4() {
  return require('uuid').v4();
}

module.exports = { generateQuiz, startAttempt, submitQuiz, getQuizHistory };


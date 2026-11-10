class QuizScoringService {
  calculateScore(questions, userAnswers) {
    const results = [];
    let correct = 0;
    const topicScores = {};

    for (const question of questions) {
      const userAnswer = userAnswers.find((a) => a.questionId === question.id);
      const isCorrect = this.checkAnswer(question, userAnswer);

      if (isCorrect) correct++;

      const topic = question.topic?.name || 'General';
      if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
      topicScores[topic].total++;
      if (isCorrect) topicScores[topic].correct++;

      results.push({
        questionId: question.id,
        isCorrect,
        correctOptionId: question.options.find((o) => o.isCorrect)?.id,
        userOptionId: userAnswer?.optionId || null,
      });
    }

    const total = questions.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    const topicPerformance = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      correct: data.correct,
      total: data.total,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    return { correct, total, accuracy, score: accuracy, topicPerformance, results };
  }

  checkAnswer(question, userAnswer) {
    if (!userAnswer || !userAnswer.optionId) return false;
    const selectedOption = question.options.find((o) => o.id === userAnswer.optionId);
    return selectedOption?.isCorrect || false;
  }

  calculateStars(accuracy) {
    if (accuracy >= 90) return 3;
    if (accuracy >= 70) return 2;
    if (accuracy >= 50) return 1;
    return 0;
  }

  identifyWeakTopics(topicPerformance, threshold = 60) {
    return topicPerformance
      .filter((t) => t.percentage < threshold)
      .map((t) => t.topic);
  }
}

module.exports = new QuizScoringService();


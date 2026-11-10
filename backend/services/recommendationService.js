const aiService = require('./aiService');
const prisma = require('../config/database');

class RecommendationService {
  async generateRecommendations(userId, weakTopics, documentText) {
    if (!weakTopics || weakTopics.length === 0) return null;

    const truncated =
      documentText.length > 8000 ? documentText.substring(0, 8000) + '\n...' : documentText;

    const response = await aiService.chatJSON(
      [
        {
          role: 'system',
          content:
            'You are an expert educational advisor. Create personalized revision plans based on student performance. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: `A student is struggling with these topics: ${weakTopics.join(', ')}.

Based on this study material:
${truncated}

Create a personalized revision plan. Return JSON with this exact structure:
{
  "revisionNotes": "Comprehensive 200-300 word revision summary covering the weak topics clearly",
  "keyConceptsToReview": ["Key concept 1", "Key concept 2", "Key concept 3"],
  "suggestedSequence": ["Step 1: Review ...", "Step 2: Practice ...", "Step 3: Test ..."],
  "practiceQuestions": [
    {
      "question": "Practice question about a weak topic?",
      "answer": "Clear answer",
      "hint": "A helpful hint to guide thinking"
    }
  ],
  "encouragement": "Short motivational message for the student (1-2 sentences)"
}

Generate 3-5 practice questions focused on the weak topics.`,
        },
      ],
      { jsonMode: true, temperature: 0.4, maxTokens: 3000 }
    );

    const recommendation = await prisma.recommendation.create({
      data: {
        userId,
        weakTopics,
        revisionNotes: response.revisionNotes || 'Review the identified weak topics carefully.',
        practiceQuestions: response.practiceQuestions || [],
        suggestedSequence: response.suggestedSequence || [],
      },
    });

    return { ...recommendation, ...response };
  }
}

module.exports = new RecommendationService();


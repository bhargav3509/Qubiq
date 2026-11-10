const aiService = require('./aiService');

class QuizGenerationService {
  async generateQuestions(text, topics, config) {
    const { difficulty, count, type = 'mcq' } = config;

    const truncatedText =
      text.length > 10000 ? text.substring(0, 10000) + '\n...[truncated]' : text;
    const topicNames = topics.map((t) => t.name).join(', ');

    const typeInstructions = {
      mcq: 'Generate single-answer multiple choice questions with exactly 4 distinct options. Exactly ONE option must be correct.',
      true_false:
        'Generate true/false questions. Each must have exactly 2 options: "True" and "False". Exactly one must be correct.',
      multi_select:
        'Generate questions where 2 options are correct out of 4. Mark exactly 2 options as correct.',
    };

    const prompt = `You are an expert quiz creator for an educational platform. Generate exactly ${count} ${difficulty}-difficulty quiz questions.

Topics to cover: ${topicNames}

Study material:
${truncatedText}

Question type: ${type}
Instructions: ${typeInstructions[type] || typeInstructions.mcq}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "questionText": "Clear, specific question based on the material?",
      "type": "${type}",
      "difficulty": "${difficulty}",
      "topic": "Topic Name (must match one of: ${topicNames})",
      "explanation": "Detailed explanation of why the correct answer is right, referencing the material",
      "options": [
        { "text": "Option text", "isCorrect": true },
        { "text": "Option text", "isCorrect": false },
        { "text": "Option text", "isCorrect": false },
        { "text": "Option text", "isCorrect": false }
      ]
    }
  ]
}

CRITICAL RULES:
1. Base ALL questions ONLY on the provided study material — do NOT invent facts
2. Every question must have clear, unambiguous wording
3. Wrong options must be plausible but clearly incorrect based on the material
4. Explanations must be educational and reference the source content
5. Vary question types: factual recall, conceptual understanding, application
6. Generate exactly ${count} questions`;

    const response = await aiService.chatJSON(
      [
        {
          role: 'system',
          content:
            'You are an expert quiz creator. Always respond with valid JSON only. Never include markdown or extra text.',
        },
        { role: 'user', content: prompt },
      ],
      { jsonMode: true, temperature: 0.5, maxTokens: 6000 }
    );

    const questions = response.questions || [];
    return this.validateAndClean(questions, type);
  }

  validateAndClean(questions, type) {
    return questions.filter((q) => {
      if (!q.questionText || typeof q.questionText !== 'string') return false;
      if (!Array.isArray(q.options) || q.options.length < 2) return false;
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (type === 'multi_select') return correctCount >= 2;
      return correctCount === 1;
    });
  }
}

module.exports = new QuizGenerationService();


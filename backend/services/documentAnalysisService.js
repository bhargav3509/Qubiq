const aiService = require('./aiService');

class DocumentAnalysisService {
  async analyzeDocument(text, documentTitle) {
    const truncatedText =
      text.length > 12000 ? text.substring(0, 12000) + '\n...[content truncated]' : text;

    const response = await aiService.chatJSON(
      [
        {
          role: 'system',
          content:
            'You are an expert educator and content analyst. Analyze study materials and extract structured topic hierarchies. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: `Analyze this study material titled "${documentTitle}" and extract a structured topic hierarchy.

Text content:
${truncatedText}

Return a JSON object with this exact structure:
{
  "mainTopics": [
    {
      "name": "Topic Name",
      "description": "Brief description of this topic (1-2 sentences)",
      "subtopics": [
        {
          "name": "Subtopic Name",
          "description": "Brief description"
        }
      ]
    }
  ],
  "summary": "Overall 2-3 sentence summary of the document",
  "keyConceptsCount": 10
}

Extract 3-8 main topics with 2-5 subtopics each. Base everything strictly on the provided content.`,
        },
      ],
      { jsonMode: true, temperature: 0.3 }
    );

    return response;
  }
}

module.exports = new DocumentAnalysisService();


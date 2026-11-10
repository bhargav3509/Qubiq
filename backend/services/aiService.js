const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
    this.baseUrl = 'https://openrouter.ai/api/v1';
  }

  async chat(messages, options = {}) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/chat/completions`,
          {
            model: this.model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 4000,
            ...(options.jsonMode && { response_format: { type: 'json_object' } }),
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
              'X-Title': 'QUBIQ Learning Platform',
              'Content-Type': 'application/json',
            },
            timeout: 90000,
          }
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        lastError = error;
        if (error.response?.status === 429) {
          const delay = attempt * 3000;
          console.warn(`Rate limited. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  async chatJSON(messages, options = {}) {
    const content = await this.chat(messages, { ...options, jsonMode: true });
    try {
      return JSON.parse(content);
    } catch {
      // Extract JSON from markdown code blocks
      const match = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {}
      }
      // Try to find raw JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {}
      }
      throw new Error('AI returned invalid JSON: ' + content.substring(0, 200));
    }
  }

  chunkText(text, maxChunkSize = 8000) {
    if (text.length <= maxChunkSize) return [text];
    const chunks = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + '\n\n' + paragraph).length > maxChunkSize) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + paragraph : paragraph;
      }
    }

    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  }
}

module.exports = new AIService();


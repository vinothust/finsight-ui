const AI_API_URL = 'http://localhost:11434/api/generate';

export const aiService = {
  sendMessageStream: async (message: string, onChunk: (chunk: string) => void) => {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral-nemo',
          prompt: `You are an expert financial analyst for FinSight. Provide a clear and detailed analysis for the following inquiry: ${message}`,
          stream: true
        }),
      });

      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          try {
            const json = JSON.parse(line);
            if (json.response) {
              onChunk(json.response);
            }
          } catch (e) {
            console.warn('Error parsing JSON chunk', e);
          }
        }
      }
    } catch (error) {
      console.error('Error calling AI service:', error);
      onChunk(" [Error: Could not connect to AI service]");
    }
  }
};

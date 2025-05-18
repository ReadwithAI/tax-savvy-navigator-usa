const express = require('express');
const cors = require('cors');
const { fetch } = require('undici'); // npm install undici
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/api/strategy-chat', async (req, res) => {
  const { strategy, userProfile, chatHistory } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'OpenAI API key not set' });
    return;
  }

  const systemPrompt = `You are a tax advisor. The user is interested in the following strategy: ${strategy.name}.\n\nStrategy details: ${strategy.description}\nEligibility: ${strategy.eligibilityCriteria.join(', ')}\nImplementation Steps: ${strategy.implementationSteps.join(', ')}\nUser profile: ${JSON.stringify(userProfile)}\n\nAnswer the user's questions in detail and personalize your advice.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(chatHistory || []).map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.body) {
    res.status(500).json({ error: 'No response from OpenAI' });
    return;
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  async function stream() {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') break;
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              res.write(encoder.encode(content));
            }
          } catch {}
        }
      }
    }
    res.end();
  }
  stream();
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'edge',
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { strategy, userProfile, chatHistory } = req.body;
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'OpenAI API key not set' });
    return;
  }

  const systemPrompt = `You are a tax advisor. The user is interested in the following strategy: ${strategy.name}.\n\nStrategy details: ${strategy.description}\nEligibility: ${strategy.eligibilityCriteria.join(', ')}\nImplementation Steps: ${strategy.implementationSteps.join(', ')}\nUser profile: ${JSON.stringify(userProfile)}\n\nAnswer the user's questions in detail and personalize your advice.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...((chatHistory || []).map((m: any) => ({ role: m.role, content: m.content })))
  ];

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

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
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    // OpenAI streams with 'data: ...' lines, so parse and send only the content
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
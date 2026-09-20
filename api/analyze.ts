export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Server GEMINI_API_KEY not configured' });
  }

  const { systemPrompt, userInput, model = 'gemini-2.5-flash' } = req.body || {};

  if (!userInput) {
    return res.status(400).json({ error: 'Missing userInput' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: userInput }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `Gemini API returned status ${response.status}: ${errText}`
      });
    }

    const json = await response.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Empty or blocked Gemini response' });
    }

    const data = JSON.parse(text);
    return res.status(200).json({ data, source: 'ai' });
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError';
    return res.status(500).json({
      error: isTimeout ? 'Request to Gemini timed out after 8s' : (err?.message || 'Server proxy failed')
    });
  }
}

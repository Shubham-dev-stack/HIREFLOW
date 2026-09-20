const KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-3.8-flash";

export async function callGemini<T>(
  systemPrompt: string,
  userInput: string,
  fallback: T
): Promise<{ data: T; source: "ai" | "heuristic" }> {
  if (!KEY) return { data: fallback, source: "heuristic" };
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userInput }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const text = json.candidates[0].content.parts[0].text;
    return { data: JSON.parse(text) as T, source: "ai" };
  } catch {
    return { data: fallback, source: "heuristic" };
  }
}

export function isGeminiKeyConfigured(): boolean {
  return Boolean(KEY && KEY.trim().length > 0);
}

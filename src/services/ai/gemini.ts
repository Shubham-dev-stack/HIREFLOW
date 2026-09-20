const KEY = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : undefined;
export const DEFAULT_MODEL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_MODEL) || "gemini-2.5-flash";

export interface GeminiCallResult<T> {
  data: T;
  source: "ai" | "heuristic";
  errorReason?: string;
  durationMs?: number;
}

let lastCallStatus: {
  timestamp: string;
  source: "ai" | "heuristic";
  model: string;
  errorReason?: string;
} = {
  timestamp: "Not invoked yet",
  source: "heuristic",
  model: DEFAULT_MODEL,
};

export async function callGemini<T>(
  systemPrompt: string,
  userInput: string,
  fallback: T
): Promise<GeminiCallResult<T>> {
  const startTime = performance.now();
  const model = DEFAULT_MODEL;

  // 1. If server proxy (/api/analyze) is available, try it first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const proxyRes = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemPrompt,
        userInput,
        model,
      }),
    });

    clearTimeout(timeoutId);

    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json && json.data) {
        lastCallStatus = {
          timestamp: new Date().toLocaleTimeString(),
          source: "ai",
          model,
        };
        return {
          data: json.data as T,
          source: "ai",
          durationMs: Math.round(performance.now() - startTime),
        };
      }
    }
  } catch (proxyErr: any) {
    // If proxy failed (e.g. running vite dev server without api backend), continue to direct client key fallback
  }

  // 2. Direct client key mode (for local dev with VITE_GEMINI_API_KEY)
  if (KEY && KEY.trim().length > 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
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

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        const reason = `API ${res.status}: ${res.statusText || errText || "Request failed"}`;
        lastCallStatus = {
          timestamp: new Date().toLocaleTimeString(),
          source: "heuristic",
          model,
          errorReason: reason,
        };
        return {
          data: fallback,
          source: "heuristic",
          errorReason: reason,
          durationMs: Math.round(performance.now() - startTime),
        };
      }

      const json = await res.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        const reason = "Empty response or content flagged by safety filters";
        lastCallStatus = {
          timestamp: new Date().toLocaleTimeString(),
          source: "heuristic",
          model,
          errorReason: reason,
        };
        return {
          data: fallback,
          source: "heuristic",
          errorReason: reason,
          durationMs: Math.round(performance.now() - startTime),
        };
      }

      const parsedData = JSON.parse(text) as T;
      lastCallStatus = {
        timestamp: new Date().toLocaleTimeString(),
        source: "ai",
        model,
      };
      return {
        data: parsedData,
        source: "ai",
        durationMs: Math.round(performance.now() - startTime),
      };
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      const reason = isTimeout ? "Request timed out after 8s" : (err?.message || "Network error");
      lastCallStatus = {
        timestamp: new Date().toLocaleTimeString(),
        source: "heuristic",
        model,
        errorReason: reason,
      };
      return {
        data: fallback,
        source: "heuristic",
        errorReason: reason,
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  }

  // 3. No key or proxy available -> deterministic fallback
  lastCallStatus = {
    timestamp: new Date().toLocaleTimeString(),
    source: "heuristic",
    model,
    errorReason: "No API key configured (running deterministic heuristic engine)",
  };

  return {
    data: fallback,
    source: "heuristic",
    errorReason: "No API key configured",
    durationMs: Math.round(performance.now() - startTime),
  };
}

export function isGeminiKeyConfigured(): boolean {
  return Boolean(KEY && KEY.trim().length > 0);
}

export function getResolvedModelName(): string {
  return DEFAULT_MODEL;
}

export function getLastCallStatus() {
  return lastCallStatus;
}

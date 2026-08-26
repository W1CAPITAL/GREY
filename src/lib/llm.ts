/**
 * Córtex = SOMENTE Ollama no servidor que VOCÊ controla.
 * Sem Gemini, OpenAI, Anthropic, Hugging Face.
 */
import { config } from "./config.js";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function chat(
  messages: ChatMessage[],
  opts?: { temperature?: number; json?: boolean }
): Promise<{ ok: boolean; text: string; model: string; provider: string; error?: string }> {
  try {
    const res = await fetch(`${config.ollamaBase}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages,
        stream: false,
        format: opts?.json ? "json" : undefined,
        options: { temperature: opts?.temperature ?? 0.2 },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return {
        ok: false,
        text: "",
        model: config.ollamaModel,
        provider: "ollama-selfhost",
        error: `ollama ${res.status}: ${t.slice(0, 240)}. Rode: ollama pull ${config.ollamaModel}`,
      };
    }
    const data = (await res.json()) as any;
    return {
      ok: true,
      text: data?.message?.content || "",
      model: config.ollamaModel,
      provider: "ollama-selfhost",
    };
  } catch (e: any) {
    return {
      ok: false,
      text: "",
      model: config.ollamaModel,
      provider: "ollama-selfhost",
      error: (e?.message || String(e)) + ` — Ollama em ${config.ollamaBase} inacessível`,
    };
  }
}

export async function pingLlm(): Promise<{ ok: boolean; detail: string }> {
  try {
    const r = await fetch(`${config.ollamaBase}/api/tags`);
    if (!r.ok) return { ok: false, detail: `ollama HTTP ${r.status}` };
    const j = (await r.json()) as any;
    const names = (j.models || []).map((m: any) => m.name).join(", ") || "(puxe um modelo: ollama pull qwen2.5:3b)";
    return { ok: true, detail: `self-host ollama · ${names}` };
  } catch (e: any) {
    return { ok: false, detail: e?.message || String(e) };
  }
}

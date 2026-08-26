/** Aponta só para O SEU brain (VPS). Sem provedor externo. */
const BASE = (process.env.LEXIS_BRAIN_URL || "").replace(/\/$/, "");
const KEY = process.env.LEXIS_BRAIN_KEY || "";

async function brainFetch(path: string, body?: unknown) {
  if (!BASE) return { ok: false as const, error: "LEXIS_BRAIN_URL (seu VPS) não configurada" };
  try {
    const res = await fetch(`${BASE}${path.startsWith("/") ? path : `/${path}`}`, {
      method: body ? "POST" : "GET",
      headers: {
        "Content-Type": "application/json",
        ...(KEY ? { "x-brain-key": KEY } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false as const, error: data?.error || res.statusText, data };
    return { ok: true as const, data };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "brain VPS offline" };
  }
}

export const brainHealth = () => brainFetch("/health");
export const brainChat = (messages: { role: string; content: string }[], skill?: string) =>
  brainFetch("/v1/chat", { messages, skill });
export const brainExtract = (text: string) => brainFetch("/v1/extract", { text });
export const brainClassifyStatus = (proximoRetorno?: string, status?: string) =>
  brainFetch("/v1/classify-status", { proximoRetorno, status });

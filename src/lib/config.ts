export const config = {
  port: Number(process.env.PORT || 8787),
  apiKey: process.env.BRAIN_API_KEY || "",
  ollamaBase: (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, ""),
  ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5:3b",
  skillsDir: process.env.SKILLS_DIR || new URL("../../skills", import.meta.url).pathname,
};

import express from "express";
import { authorizeBrainKey } from "./lib/auth.js";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { config } from "./lib/config.js";
import { chat, pingLlm, type ChatMessage } from "./lib/llm.js";
import { getSkill, listSkills } from "./lib/skills.js";
import { classifyStatusPrazo, extractFieldsRegex } from "./lib/rules.js";

const app = express();
// Only explicitly trusted browser origins may read the API. Server-to-server
// requests do not require CORS and must still present their key.
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, false);
    return callback(null, config.allowedOrigins.includes(origin) ? origin : false);
  },
}));
app.use(express.json({ limit: "4mb" }));

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const key = req.header("x-brain-key") ?? /^Bearer[ \t]+(\S+)$/i.exec(req.header("authorization") ?? "")?.[1];
  const decision = authorizeBrainKey(config.apiKey, key);
  if (decision === "misconfigured") return res.status(503).json({ ok: false, error: "auth_not_configured" });
  if (decision !== "authorized") return res.status(401).json({ ok: false, error: "unauthorized" });
  next();
}

app.get("/health", async (_req, res) => {
  const configured = Boolean(config.apiKey);
  const llm = configured ? await pingLlm() : { ok: false, error: "auth_not_configured" };
  res.status(configured ? 200 : 503).json({
    ok: configured,
    service: "lexis-brain",
    version: "0.3.0",
    body: "self-hosted-vps",
    brain: "ollama-open-weights",
    externalAiApis: false,
    dependsOnOfficePc: false,
    llm,
    skills: listSkills().map((s) => s.id),
  });
});

app.get("/v1/skills", auth, (_req, res) => {
  res.json({ ok: true, skills: listSkills().map((s) => ({ id: s.id, name: s.name, description: s.description })) });
});

app.post("/v1/chat", auth, async (req, res) => {
  const messages = (req.body?.messages || []) as ChatMessage[];
  const skillId = req.body?.skill as string | undefined;
  const msgs: ChatMessage[] = [];
  const skill = skillId ? getSkill(skillId) : null;
  if (skill) msgs.push({ role: "system", content: skill.systemPrompt });
  else {
    const core = path.join(config.skillsDir, "..", "prompts", "system-core.md");
    if (fs.existsSync(core)) msgs.push({ role: "system", content: fs.readFileSync(core, "utf8") });
  }
  if (req.body?.system) msgs.push({ role: "system", content: String(req.body.system) });
  for (const m of messages) if (m?.role && m?.content) msgs.push({ role: m.role, content: String(m.content) });
  if (!msgs.some((m) => m.role === "user")) return res.status(400).json({ ok: false, error: "messages user vazias" });
  res.json({ ...(await chat(msgs)), skill: skill?.id || null });
});

app.post("/v1/extract", auth, async (req, res) => {
  const text = String(req.body?.text || "");
  if (!text.trim()) return res.status(400).json({ ok: false, error: "text obrigatório" });
  const regex = extractFieldsRegex(text);
  const skill = getSkill("extrair-contrato");
  const llm = await chat(
    [
      { role: "system", content: skill?.systemPrompt || "Extraia JSON de contrato jurídico BR." },
      { role: "user", content: text.slice(0, 12000) },
    ],
    { temperature: 0, json: true }
  );
  let llmJson: any = null;
  if (llm.ok) {
    try {
      llmJson = JSON.parse(llm.text.trim().replace(/^```json\s*/i, "").replace(/```$/g, ""));
    } catch {
      llmJson = { raw: llm.text };
    }
  }
  res.json({ ok: true, regex, llm: llm.ok ? llmJson : null, llmError: llm.error, model: llm.model, provider: llm.provider });
});

app.post("/v1/classify-status", auth, async (req, res) => {
  res.json({ ok: true, ...classifyStatusPrazo(req.body || {}), engine: "rules", provider: "self" });
});

app.post("/v1/skill/:id", auth, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string") return res.status(400).json({ ok: false, error: "skill inválida" });
  const skill = getSkill(id);
  if (!skill) return res.status(404).json({ ok: false, error: "skill não encontrada" });
  const user = String(req.body?.input || req.body?.text || "");
  if (!user.trim()) return res.status(400).json({ ok: false, error: "input obrigatório" });
  res.json({ ...(await chat([{ role: "system", content: skill.systemPrompt }, { role: "user", content: user.slice(0, 14000) }], { json: !!req.body?.json })), skill: skill.id });
});

app.listen(config.port, () => {
  console.log(`[lexis-brain 0.3 self-host] :${config.port} → ${config.ollamaBase} model=${config.ollamaModel}`);
});

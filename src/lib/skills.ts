import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

export type SkillMeta = {
  id: string;
  name: string;
  description: string;
  dir: string;
  systemPrompt: string;
};

function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  if (!md.startsWith("---")) return { meta: {}, body: md };
  const end = md.indexOf("---", 3);
  if (end < 0) return { meta: {}, body: md };
  const raw = md.slice(3, end).trim();
  const body = md.slice(end + 3).trim();
  const meta: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body };
}

export function listSkills(): SkillMeta[] {
  const root = config.skillsDir;
  if (!fs.existsSync(root)) return [];
  const out: SkillMeta[] = [];
  for (const name of fs.readdirSync(root)) {
    const dir = path.join(root, name);
    if (!fs.statSync(dir).isDirectory()) continue;
    const skillPath = path.join(dir, "SKILL.md");
    if (!fs.existsSync(skillPath)) continue;
    const md = fs.readFileSync(skillPath, "utf8");
    const { meta, body } = parseFrontmatter(md);
    out.push({
      id: meta.id || name,
      name: meta.name || name,
      description: meta.description || "",
      dir,
      systemPrompt: body,
    });
  }
  return out;
}

export function getSkill(id: string): SkillMeta | null {
  return listSkills().find((s) => s.id === id || path.basename(s.dir) === id) || null;
}

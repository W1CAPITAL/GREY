export function classifyStatusPrazo(input: {
  proximoRetorno?: string | null;
  status?: string | null;
  hoje?: Date;
}): { status: string; motivo: string } {
  const hoje = input.hoje || new Date();
  const st = String(input.status || "").toLowerCase();
  if (/arquiv|encerr|baixa/.test(st)) return { status: "Arquivado", motivo: "status textual" };
  const pr = String(input.proximoRetorno || "").trim();
  if (!pr) return { status: "Sem Prazo", motivo: "sem próximo retorno" };
  const m = pr.match(/(\d{4})-(\d{2})-(\d{2})/) || pr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return { status: "Sem Prazo", motivo: "data inválida" };
  let d: Date;
  if (m[0].includes("-")) d = new Date(+m[1], +m[2] - 1, +m[3]);
  else d = new Date(+m[3], +m[2] - 1, +m[1]);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = (day(d) - day(hoje)) / 86400000;
  if (diff < 0) return { status: "Vencido", motivo: `${Math.abs(diff)}d atraso` };
  if (diff === 0) return { status: "É Hoje", motivo: "vence hoje" };
  if (diff <= 3) return { status: "Atenção", motivo: `em ${diff}d` };
  return { status: "No Prazo", motivo: `em ${diff}d` };
}

export function extractFieldsRegex(text: string): Record<string, string> {
  const t = String(text || "");
  const out: Record<string, string> = {};
  const cpf = t.match(/\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/);
  if (cpf) out.cpf = cpf[1];
  const cnj = t.match(/\b(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})\b/);
  if (cnj) out.protocolo = cnj[1];
  const oab = t.match(/\bOAB[\/\s]*([A-Z]{2})[\/\s]*(\d{2,6})\b/i);
  if (oab) out.oab = `OAB/${oab[1].toUpperCase()} ${oab[2]}`;
  const email = t.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (email) out.email = email[0];
  const tel = t.match(/\(?\d{2}\)?\s?\d{4,5}-?\d{4}/);
  if (tel) out.telefone = tel[0];
  return out;
}

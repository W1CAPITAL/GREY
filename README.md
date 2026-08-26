# Lexis Brain v0.3 — corpo e cérebro **seus** (self-host)

## O que você pediu
- ❌ Não depender do PC do escritório  
- ❌ Não depender de API de IA externa (Gemini, OpenAI, HF, etc.)  
- ✅ Corpo e cérebro próprios  

## Resposta honesta
Isso **não cabe só na Vercel**. LLM precisa de processo + RAM contínuos.

| Componente | Onde |
|------------|------|
| **Corpo** | Seu **VPS** 24/7 (Oracle Free / Hetzner / similar) |
| **Cérebro** | **Ollama** + modelo open-weight (`qwen2.5:3b` ou `7b`) **no mesmo VPS** |
| **Gabinete** | Lexis na Vercel chama `https://brain.seudominio.com` |

Pesos open-source + inferência na **sua** máquina = o mais próximo de “IA nossa” sem treinar um modelo do zero (isso custa milhões).

## Subir

```bash
docker compose up -d --build
docker compose exec ollama ollama pull qwen2.5:3b
curl http://127.0.0.1:8787/health
# externalAiApis: false, dependsOnOfficePc: false
```

Detalhes: `deploy/VPS.md`

## Lexis
```
LEXIS_BRAIN_URL=https://seu-brain
LEXIS_BRAIN_KEY=...
```
Client: `lexis-integration/lexis-brain-client.ts`

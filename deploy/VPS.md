# Corpo próprio — VPS (não PC, não API externa)

## Física inegável
- Vercel/Cloudflare **serverless** não rodam LLM 3B–7B de forma estável como “seu cérebro”.
- Sem chamar Gemini/OpenAI, **alguém** tem de executar os pesos: isso é o **seu VPS**.

## Opções baratas / free
1. **Oracle Cloud Free** — VM ARM 4 OCPU / 24 GB RAM (bom para qwen2.5:7b quantizado)
2. **Hetzner CX** — ~€4–6/mês, x86
3. **Fly.io / Railway** — possível, mas volume do modelo é grande; VPS clássico é mais simples

## Setup (Ubuntu no VPS)

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
git clone <seu-repo-lexis-brain> && cd lexis-brain
cp .env.example .env
# edite BRAIN_API_KEY

docker compose up -d --build
# puxar modelo (uma vez)
docker compose exec ollama ollama pull qwen2.5:3b
# se RAM >= 16GB:
# docker compose exec ollama ollama pull qwen2.5:7b

curl http://127.0.0.1:8787/health
```

## Expor com HTTPS (Cloudflare Tunnel — sem abrir porta)

```bash
# no VPS, cloudflared tunnel → https://brain.seudominio.com → localhost:8787
```

Lexis (Vercel) só precisa:
```
LEXIS_BRAIN_URL=https://brain.seudominio.com
LEXIS_BRAIN_KEY=mesma-do-.env
```

## AirLLM?
Só se o VPS tiver **GPU**. Em CPU, use **Ollama GGUF**. AirLLM não substitui o VPS nem roda na Vercel.

## O que é “nosso”
| Peça | Dono |
|------|------|
| API brain + skills | Seu código no VPS |
| Pesos Qwen/Llama (Ollama) | Open-weight, **inferência sua** |
| Dados Lexis / planilha | Seus |
| Gemini/OpenAI | **Não usados** |

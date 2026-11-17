# Lexis Brain v0.3 — corpo e cérebro **seus** (self-host)

- ❌ Não depender do PC do escritório  
- ❌ Não depender de API de IA externa (Gemini, OpenAI, HF, etc.)  
- ✅ Corpo e cérebro próprios  

Defina `BRAIN_API_KEY` no servidor antes de iniciar. Sem chave, a saúde e as
rotas protegidas retornam 503. Envie a chave por `Authorization: Bearer ...`
ou `x-brain-key`; credenciais ausentes ou inválidas retornam 401.
Para acesso pelo navegador, configure `BRAIN_ALLOWED_ORIGINS` com as origens
HTTPS autorizadas, separadas por vírgula (HTTP somente em localhost).

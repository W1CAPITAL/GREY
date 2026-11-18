# Lexis Brain v0.3 — corpo e cérebro **seus** (self-host)

- ❌ Não depender do PC do escritório  
- ❌ Não depender de API de IA externa (Gemini, OpenAI, HF, etc.)  
- ✅ Corpo e cérebro próprios  

<!-- W1_DISTRIBUICAO_INICIO -->
## Distribuição e acesso

O GREY é um experimento de serviço de IA autogerenciado. Não possui instalador Windows publicado nem faz parte do catálogo instalável da [Central de Apps W1](https://github.com/W1CAPITAL/Central-de-Apps). Consulte o repositório para executar e proteger o serviço com credenciais próprias.

[Consultar versões e downloads](https://github.com/W1CAPITAL/Central-de-Apps/releases) · [Catálogo completo W1](https://github.com/W1CAPITAL/Central-de-Apps/blob/main/docs/ECOSSISTEMA-W1.md)

Os arquivos da série `preview-v0.1.48` são versões de teste, não instaladores oficiais assinados para atualização automática.
<!-- W1_DISTRIBUICAO_FIM -->

Defina `BRAIN_API_KEY` no servidor antes de iniciar. Sem chave, a saúde e as
rotas protegidas retornam 503. Envie a chave por `Authorization: Bearer ...`
ou `x-brain-key`; credenciais ausentes ou inválidas retornam 401.
Para acesso pelo navegador, configure `BRAIN_ALLOWED_ORIGINS` com as origens
HTTPS autorizadas, separadas por vírgula (HTTP somente em localhost).

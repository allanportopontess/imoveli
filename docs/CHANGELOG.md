# CHANGELOG.md — IMOVELI

> Registro cronológico de mudanças significativas.
> Mantenedor: Tech Lead (Claude principal)

## [Unreleased]

---

## [0.4.0] — 2026-09-01

### Adicionado
- **Cadastro completo do profissional**: formulário de indicação agora coleta e-mail, cidade e estado (UF dropdown)
- **PUT /api/prestadores/:id/perfil**: endpoint para atualizações futuras de perfil
- **escapeHtml()**: função utilitária adicionada ao frontend; aplicada em todos os campos renderizados via `innerHTML`

### Corrigido (security)
- **IDOR em PUT /prestadores/:id/perfil**: ownership check via `indicacoes` — só o fiador responsável pode editar o perfil
- **Falta de ownership em POST /fiadores/:id/indicar**: `req.user.id !== req.params.id` agora bloqueia indicação em nome de outro fiador
- **Endpoints sem auth**: `GET /indicados`, `POST aceitar`, `POST recusar` agora exigem JWT válido
- **XSS em loadIndicados()**: nome, especialidade, escopo e IDs escapados com `escapeHtml()`

---

## [0.3.0] — 2026-09-01

### Adicionado
- **Squad de 8 agentes** em `.claude/agents/` com responsabilidades claras
- **Documentação estratégica** em `docs/` (PRODUCT, MVP, ARCHITECTURE, DATABASE, AI, DESIGN_SYSTEM, DECISIONS, CHANGELOG)
- **CLAUDE.md** como guia do Tech Lead
- **Bloco 6 — Chatbot IA especializado em construção civil**: system prompt completo com normas ABNT, patologias, REURB, usucapião, CREA/CAU
- **Contexto do usuário no chatbot**: `buildChatContexto()` injeta dados do RT logado
- `max_tokens` do chatbot aumentado de 1.000 para 2.048

### Modificado
- `CHAT_SYSTEM_PROMPT` substituído por versão especializada com 6 domínios de conhecimento

---

## [0.2.0] — 2026-09-01

### Adicionado
- **Bloco 2 — Taxonomia profissional**: formulário "Indicar Profissional" com 50+ categorias em 8 grupos (dropdown multi-seleção com `toggleTaxonomia()`)
- **Bloco 3 — Foto de perfil circular**: upload no card roxo do RT com preview imediato
- **Bloco 4 — Painel "Meus Profissionais"**: collapsible buddy panel com toggle público/privado por profissional
- **Bloco 5 — Mini Dashboard**: 3 gráficos Canvas 2D (pizza de especialidades, linha de crescimento, barras percentuais)
- `toggleMeusProfissionais()`, `renderMeusProfissionais()`, `toggleVisibilidadeProfissional()`
- `handleFotoPerfilUpload()`, `renderMiniDashboard()`
- `toggleTaxonomia()`, `getTaxonomiaSelected()`, `updateTaxonomiaLabel()`

### Modificado
- `handleIndicarPrestador()` lê checkboxes da taxonomia em vez de input de texto livre

---

## [0.1.0] — 2026-01

### Adicionado
- **Bloco 1 — Terminologia**: substituições globais (Fiador Técnico → Responsável Técnico, Carteirinha → Perfil Profissional IMOVELI, Prestador → Profissional)
- **Backend PostgreSQL** (`server-pg.js`, `db-pg.js`, `schema.sql`, `setup-pg.js`)
- **JWT Authentication**: login retorna token, `auth` middleware, `apiFetch()` no frontend
- **Seed de demonstração**: Eng. Carlos Silva, Arq. Beatriz Costa, João Pedro (eletricista), Encanador Marcos
- **CORS configurado** para `127.0.0.1:8000`
- **Chatbot IA** (versão inicial genérica)
- **Match Inteligente** (filtro básico por especialidade)
- **Leilão Reverso** (estrutura de demandas + candidaturas)
- **Dashboard do RT** com estatísticas, card roxo, painel de indicados

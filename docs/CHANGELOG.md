# CHANGELOG.md — IMOVELI

> Registro cronológico de mudanças significativas.
> Mantenedor: Tech Lead (Claude principal)

## [Unreleased]

### Em construção
- Cadastro completo do perfil do profissional (nome, e-mail, telefone, profissão, especialidades, cidade, estado)

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

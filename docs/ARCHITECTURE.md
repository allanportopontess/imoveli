# ARCHITECTURE.md — IMOVELI

> Documento vivo. Toda mudança arquitetural vai em docs/DECISIONS.md.
> Mantenedor: software-architect

## Stack atual

| Camada | Tecnologia | Versão | Onde |
|--------|-----------|--------|------|
| Backend | Node.js + Express | 18+ | backend/server-pg.js |
| Banco | PostgreSQL | 17 | C:\imoveli_pgdata\ |
| Frontend | HTML + CSS + JS (vanilla) | — | frontend/index.html |
| Auth | JWT HS256 | 7d expiry | jsonwebtoken |
| IA | Claude (Anthropic SDK) | claude-3-5-sonnet | @anthropic-ai/sdk |
| E-mail | Resend | — | backend/email.js |

## Estrutura de arquivos

```
imoveli-completo/
├── CLAUDE.md                 ← Instruções para o Claude Code (Tech Lead)
├── docs/                     ← Documentação estratégica
│   ├── PRODUCT.md
│   ├── MVP.md
│   ├── ARCHITECTURE.md       ← este arquivo
│   ├── DATABASE.md
│   ├── AI.md
│   ├── DESIGN_SYSTEM.md
│   ├── DECISIONS.md
│   └── CHANGELOG.md
├── backend/
│   ├── server-pg.js          ← Monolito Express (~850+ linhas)
│   ├── db-pg.js              ← Pool PostgreSQL
│   ├── schema.sql            ← DDL completo
│   ├── setup-pg.js           ← Init + seed
│   ├── email.js              ← Resend
│   └── .env                  ← Secrets (nunca commitar)
├── frontend/
│   └── index.html            ← SPA vanilla (~3200+ linhas)
└── .claude/
    ├── agents/               ← Squad de 8 agentes especializados
    └── commands/             ← Slash commands
```

## Fluxo de request

```
Browser (127.0.0.1:8000)
  → index.html carrega
  → JS chama apiFetch('/api/rota')
  → Bearer JWT no header Authorization
  → Express (127.0.0.1:3001)
    → middleware auth() verifica JWT
    → query() acessa PostgreSQL (127.0.0.1:5432)
    → retorna { success, ...dados }
  → JS atualiza DOM inline
```

## Autenticação

```javascript
// Login → server retorna JWT
POST /api/login → { success, token, conta }

// Frontend armazena
localStorage.setItem('imoveli_token', token)

// Frontend injeta em toda chamada
headers: { Authorization: `Bearer ${token}` }

// Backend verifica
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const payload = jwt.verify(token, JWT_SECRET);
  req.user = payload; // { id, email, tipo }
  next();
}
```

## Decisões arquiteturais tomadas

| # | Decisão | Motivo |
|---|---------|--------|
| 1 | Monolito Express (não microserviços) | MVP rápido, time pequeno |
| 2 | PostgreSQL local → Railway em prod | Custo zero no dev, escala fácil |
| 3 | JWT sem refresh token | Simples para MVP; revisar em v2 |
| 4 | Vanilla JS (não React/Vue) | Sem build step, iteração rápida |
| 5 | JSONB para arrays dinâmicos | skills, acervo — flexibilidade |
| 6 | Porta 3001 backend, 8000 frontend | Evitar conflito com PostgreSQL 5432 |
| 7 | 127.0.0.1 (não localhost) | IPv6 causa problema no Windows |

## Limites conhecidos e plano de evolução

| Limite atual | Quando escalar | Como escalar |
|-------------|---------------|-------------|
| Monolito sem separação de camadas | >5 devs ou >10k req/dia | Extrair routes/ separado |
| Vanilla JS sem componentização | Quando tiver designer dedicado | Migrar para React/Next.js |
| Sem cache | Quando queries ficarem lentas | Redis ou cache in-memory simples |
| Sem CI/CD | Antes do deploy em prod | GitHub Actions → Railway |
| PostgreSQL local | Deploy | Railway PostgreSQL ou Supabase |

## Regras arquiteturais

1. Novas tabelas: PK, índices em FK, `criado_em TIMESTAMPTZ DEFAULT NOW()`
2. Queries: sempre `$1, $2` paramétrico — nunca interpolação
3. Migrations: toda mudança de schema tem script reverso em DATABASE.md
4. Secrets: apenas em `.env`, nunca hardcoded, nunca no frontend
5. Novas dependências: avaliar tamanho/manutenção/licença com software-architect

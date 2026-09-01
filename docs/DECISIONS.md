# DECISIONS.md — IMOVELI

> Registro de decisões arquiteturais e de produto.
> Todo ADR (Architectural Decision Record) vai aqui.
> Mantenedor: software-architect

## Template

```
## ADR-NNN — [Título curto]
**Data**: YYYY-MM-DD
**Status**: Proposto | Aceito | Depreciado | Substituído por ADR-NNN
**Autores**: [agente(s) que decidiram]

### Contexto
[Por que essa decisão foi necessária?]

### Decisão
[O que foi decidido?]

### Alternativas consideradas
- [alternativa 1]: [por que não escolhida]
- [alternativa 2]: [por que não escolhida]

### Consequências
- Positivas: [...]
- Negativas: [...]
- Riscos: [...]
```

---

## ADR-001 — Monolito Express em vez de microserviços
**Data**: 2026-01
**Status**: Aceito

### Contexto
Time pequeno (1 desenvolvedor), MVP em construção, requisitos ainda evoluindo.

### Decisão
Manter tudo em um único `server-pg.js`. Separar em seções com comentários de bloco.

### Alternativas consideradas
- Microserviços: overhead operacional excessivo para o estágio atual
- NestJS: learning curve desnecessária no MVP

### Consequências
- Positivas: iteração rápida, zero overhead de comunicação entre serviços
- Negativas: escala horizontal limitada, arquivo grande
- Riscos: se crescer muito, refatorar para routes/ separados

---

## ADR-002 — Vanilla JS (sem React/Vue)
**Data**: 2026-01
**Status**: Aceito

### Contexto
Frontend é um único arquivo HTML com CSS e JS inline. Precisa ser simples de iterar.

### Decisão
HTML/CSS/JS puro. SPA via manipulação de DOM com funções globais. Sem build step.

### Alternativas consideradas
- React: build step, JSX, maior curva de aprendizado para colaboradores novos
- Vue: similar ao React nesse contexto

### Consequências
- Positivas: zero configuração, sem dependências de build
- Negativas: arquivo grande (~3200 linhas), sem tree-shaking, sem componentização
- Riscos: migrar para React quando tiver designer dedicado e time maior

---

## ADR-003 — JWT sem refresh token
**Data**: 2026-01
**Status**: Aceito

### Contexto
MVP precisa de auth simples. Refresh token adiciona complexidade.

### Decisão
JWT HS256, expiração 7 dias. Sem refresh. Usuário faz login novamente quando expirar.

### Alternativas consideradas
- Refresh token: mais seguro, mais complexo de implementar e debugar
- Session + cookie: stateful, precisa de Redis

### Consequências
- Positivas: implementação simples, sem estado no servidor
- Negativas: token não revogável (logout apenas limpa localStorage)
- Riscos: revisar para v2 se houver necessidade de logout forçado (ex: conta comprometida)

---

## ADR-004 — PostgreSQL 17 local (dev) → Railway (prod)
**Data**: 2026-01
**Status**: Aceito

### Contexto
PostgreSQL local para desenvolvimento sem custo. Railway para produção com backup automático.

### Decisão
Dev: PostgreSQL 17 em C:\imoveli_pgdata\. Prod: Railway PostgreSQL.
Migração via pg_dump/restore.

### Consequências
- Positivas: custo zero no desenvolvimento
- Negativas: precisa de script de migração para prod
- Riscos: divergência de schema se migrations não forem documentadas

---

## ADR-005 — Squad de 8 agentes especializados no Claude Code
**Data**: 2026-09-01
**Status**: Aceito

### Contexto
Precisamos de desenvolvimento estruturado como uma empresa de software.

### Decisão
8 agentes em .claude/agents/: product-strategist, ux-architect, software-architect, ai-architect, backend-engineer, frontend-engineer, security-reviewer, qa-reviewer.
Claude principal atua como Tech Lead/orquestrador.

### Alternativas consideradas
- 20+ agentes: burocracia, overhead de coordenação
- Sem agentes: perde especialização e contexto específico

### Consequências
- Positivas: responsabilidades claras, contexto especializado por agente
- Negativas: requer disciplina para acionar o agente certo
- Riscos: se Tech Lead não coordenar bem, agentes podem entrar em conflito

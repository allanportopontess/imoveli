# INTEGRATIONS.md — IMOVELI

> Inventário de todas as integrações externas do projeto.
> Toda nova integração deve ser registrada aqui antes de ser implementada.
> Mantenedor: Tech Lead (Claude principal)

---

## Integrações Ativas

### 1. Anthropic (Claude AI)
| Campo | Valor |
|-------|-------|
| **Serviço** | Anthropic |
| **Finalidade** | Chatbot especializado em construção civil (POST /api/chat) |
| **Método** | SDK oficial (`@anthropic-ai/sdk`) |
| **Modelo** | claude-3-5-sonnet-20241022 |
| **Ambiente** | Dev + Prod |
| **Variável de ambiente** | `ANTHROPIC_API_KEY` |
| **Status** | ✅ Ativo |
| **Risco** | Custo por tokens consumidos. Sem chave: chatbot retorna 503 (graceful). |
| **Responsável** | ai-architect |
| **Configurado em** | 2026-01 |

---

### 2. PostgreSQL 17
| Campo | Valor |
|-------|-------|
| **Serviço** | PostgreSQL (local dev) |
| **Finalidade** | Banco de dados principal |
| **Método** | Driver `pg` (node-postgres) via Pool |
| **Ambiente** | Dev: local (`C:\imoveli_pgdata\`) |
| **Variáveis** | `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` |
| **Status** | ✅ Ativo (dev) |
| **Risco** | Dados locais — sem backup automático em dev |
| **Responsável** | backend-engineer |
| **Configurado em** | 2026-01 |

---

### 3. Resend (E-mail)
| Campo | Valor |
|-------|-------|
| **Serviço** | Resend |
| **Finalidade** | E-mail transacional (boas-vindas, convites, notificações) |
| **Método** | REST API via fetch (`email.js`) |
| **Ambiente** | Prod (dev funciona em modo simulado sem chave) |
| **Variável de ambiente** | `RESEND_API_KEY`, `EMAIL_FROM` |
| **Status** | ⚠️ Simulado (sem chave configurada) |
| **Risco** | Baixo. Fallback: console.log do código/mensagem |
| **Responsável** | backend-engineer |
| **Configurado em** | 2026-01 |

---

## Integrações Planejadas para o MVP

### 4. Railway (Deploy — Backend + Banco)
| Campo | Valor |
|-------|-------|
| **Serviço** | Railway |
| **Finalidade** | Hospedagem do backend Node.js e PostgreSQL em produção |
| **Método** | CLI (`railway`) ou GitHub Actions |
| **Quando** | Antes do primeiro usuário real |
| **Variáveis necessárias** | Todas do `.env` replicadas no painel Railway |
| **Status** | ⏳ Não configurado |
| **Custo estimado** | ~$5–15/mês |
| **Exige autorização** | ✅ Sim (custo + exposição pública) |
| **Risco** | Médio — dados em produção |

---

### 5. Vercel (Deploy — Frontend)
| Campo | Valor |
|-------|-------|
| **Serviço** | Vercel |
| **Finalidade** | Hospedagem do frontend (`index.html`) como site estático |
| **Método** | CLI (`vercel`) ou drag-and-drop no dashboard |
| **Quando** | Junto com Railway |
| **Variáveis** | `API_BASE_URL` apontando para o backend Railway |
| **Status** | ⏳ Não configurado |
| **Custo estimado** | Gratuito (plano Hobby) |
| **Exige autorização** | ✅ Sim (publicação pública) |

---

### 6. Cloudflare R2 (Storage de fotos)
| Campo | Valor |
|-------|-------|
| **Serviço** | Cloudflare R2 |
| **Finalidade** | Armazenamento de fotos de perfil de RT e profissionais |
| **Método** | S3-compatible API via `@aws-sdk/client-s3` |
| **Quando** | Ao implementar upload real de fotos |
| **Variáveis** | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY`, `R2_SECRET_KEY`, `R2_BUCKET` |
| **Status** | ⏳ Não configurado (fotos em base64 no banco por ora) |
| **Custo estimado** | ~$0 até 10 GB/mês |
| **Exige autorização** | ✅ Sim |
| **Alternativa** | Supabase Storage (se já usar Supabase) |

---

### 7. Google Maps Platform
| Campo | Valor |
|-------|-------|
| **Serviço** | Google Maps |
| **Finalidade** | Mapa visual nos perfis, cálculo de distância no Match |
| **Método** | Endpoint `/api/config/maps` já preparado no backend |
| **Quando** | Ao implementar Match com geolocalização visual |
| **Variável** | `GOOGLE_MAPS_API_KEY` |
| **Status** | ⏳ Não configurado (endpoint pronto, sem chave) |
| **Custo estimado** | $0 até 28k requests/mês; depois ~$7/1k |
| **Exige autorização** | ✅ Sim (custo variável + chave de API) |
| **Alternativa** | Leaflet.js + OpenStreetMap (gratuito, sem chave) |

---

### 8. Supabase (Alternativa ao Railway PG)
| Campo | Valor |
|-------|-------|
| **Serviço** | Supabase |
| **Finalidade** | PostgreSQL gerenciado + backups + dashboard visual |
| **Método** | Connection string PostgreSQL (drop-in com `pg`) |
| **Quando** | Alternativa ao Railway para banco de produção |
| **Variáveis** | Mesmas `PG_*`, só muda `PG_HOST` e `PG_PASSWORD` |
| **Status** | ⏳ Avaliação pendente |
| **Custo estimado** | Gratuito (500 MB), depois $25/mês |
| **Exige autorização** | ✅ Sim |

---

### 9. GitHub (Repositório + CI/CD)
| Campo | Valor |
|-------|-------|
| **Serviço** | GitHub |
| **Finalidade** | Versionamento remoto + GitHub Actions para deploy automático |
| **Método** | Git CLI + `.github/workflows/` |
| **Quando** | Antes do deploy em produção |
| **Variáveis** | `GITHUB_TOKEN` (automático em Actions) |
| **Status** | ⏳ Repositório ainda não criado remotamente |
| **Custo** | Gratuito |
| **Exige autorização** | ✅ Sim (repositório público vs privado) |

---

## Avaliadas e descartadas para o MVP

| Serviço | Motivo da descartagem |
|---------|----------------------|
| Firebase | Custo e lock-in desnecessários para o MVP |
| AWS S3 | Complexidade de IAM — R2 é mais simples e gratuito |
| Twilio (SMS) | Fora do escopo do MVP |
| Stripe | Pagamentos fora do escopo do MVP |
| Redis | Sem necessidade de cache neste volume |
| SendGrid | Resend é mais simples e suficiente para o volume MVP |

---

## Tabela Resumo — Prioridade de Implementação

| # | Integração | Quando | Método | Exige minha autorização |
|---|-----------|--------|--------|------------------------|
| 1 | Anthropic AI | ✅ Ativo | SDK | Não (já ativo) |
| 2 | PostgreSQL local | ✅ Ativo | pg driver | Não (já ativo) |
| 3 | Resend (e-mail) | Pré-MVP | REST API | Só a chave RESEND_API_KEY |
| 4 | GitHub (remoto) | Pré-deploy | Git CLI | ✅ Sim (criar repositório) |
| 5 | Railway (backend+bd) | Pré-produção | CLI/GitHub Actions | ✅ Sim (custo + publicação) |
| 6 | Vercel (frontend) | Pré-produção | CLI | ✅ Sim (publicação pública) |
| 7 | Cloudflare R2 (fotos) | Ao implementar upload | S3 SDK | ✅ Sim (conta + credenciais) |
| 8 | Google Maps | Match visual | API key | ✅ Sim (custo variável) |
| 9 | Supabase (alternativa) | Avaliação | pg driver | ✅ Sim |

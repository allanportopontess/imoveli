# DATABASE.md — IMOVELI

> Toda mudança de schema deve ser documentada aqui com script de rollback.
> Mantenedor: software-architect + backend-engineer

## Conexão local

```
Host: 127.0.0.1 (não localhost — IPv6 issue no Windows)
Port: 5432
Database: imoveli
User: postgres
Password: imoveli123 (dev only — .env)
Data dir: C:\imoveli_pgdata\
```

## Schema atual

### contas
```sql
CREATE TABLE contas (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'fiador', 'prestador', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### fiadores (Responsáveis Técnicos)
```sql
CREATE TABLE fiadores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  conselho TEXT NOT NULL,       -- CREA ou CAU
  uf TEXT NOT NULL,
  registro TEXT NOT NULL,       -- número de registro
  carteirinha TEXT,             -- identificador na plataforma
  status TEXT DEFAULT 'pendente', -- pendente | verificado | suspenso
  fonte TEXT,
  bio TEXT,
  foto_url TEXT,
  skills JSONB DEFAULT '[]',
  areas_interesse JSONB DEFAULT '[]',
  servicos_oferecidos JSONB DEFAULT '[]',
  localizacao JSONB,            -- { lat, lng, cidade, uf }
  faixa_preco JSONB,            -- { min, max }
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### prestadores (Profissionais Indicados)
```sql
CREATE TABLE prestadores (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT,
  especialidade TEXT,           -- categorias separadas por vírgula
  carteirinha TEXT,             -- IMV-YYYY-XXXXXX
  status TEXT DEFAULT 'pendente', -- pendente | ativo | inativo
  bio TEXT,
  foto_url TEXT,
  skills JSONB DEFAULT '[]',
  servicos_oferecidos JSONB DEFAULT '[]',
  localizacao JSONB,
  faixa_preco JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### indicacoes
```sql
CREATE TABLE indicacoes (
  id TEXT PRIMARY KEY,
  fiador_id TEXT REFERENCES fiadores(id),
  prestador_id TEXT REFERENCES prestadores(id),
  escopo TEXT,
  status TEXT DEFAULT 'pendente', -- pendente | aceita | recusada
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### servicos
```sql
CREATE TABLE servicos (
  id TEXT PRIMARY KEY,
  prestador_id TEXT REFERENCES prestadores(id),
  fiador_id TEXT REFERENCES fiadores(id),
  cliente_nome TEXT,
  descricao TEXT,
  valor NUMERIC,
  status TEXT DEFAULT 'em_andamento',
  foto_antes TEXT,
  foto_depois TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  concluido_at TIMESTAMPTZ
);
```

### demandas
```sql
CREATE TABLE demandas (
  id TEXT PRIMARY KEY,
  cliente_id TEXT REFERENCES contas(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  especialidade TEXT,
  orcamento_max NUMERIC,
  localizacao JSONB,
  status TEXT DEFAULT 'aberta',  -- aberta | em_negociacao | fechada
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### candidaturas
```sql
CREATE TABLE candidaturas (
  id TEXT PRIMARY KEY,
  demanda_id TEXT REFERENCES demandas(id),
  prestador_id TEXT REFERENCES prestadores(id),
  valor_proposta NUMERIC,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Índices existentes

```sql
CREATE INDEX idx_indicacoes_fiador ON indicacoes(fiador_id);
CREATE INDEX idx_indicacoes_prestador ON indicacoes(prestador_id);
CREATE INDEX idx_servicos_prestador ON servicos(prestador_id);
CREATE INDEX idx_demandas_status ON demandas(status);
CREATE INDEX idx_candidaturas_demanda ON candidaturas(demanda_id);
CREATE INDEX idx_prestadores_especialidade ON prestadores(especialidade);
CREATE INDEX idx_fiadores_status ON fiadores(status);
```

## Migrations (histórico)

### Migration 001 — Schema inicial
**Data**: 2026-01
**Descrição**: Criação de todas as tabelas base
**Rollback**: `DROP TABLE IF EXISTS candidaturas, demandas, servicos, indicacoes, prestadores, fiadores, contas CASCADE;`

### Migration 002 — foto_url em fiadores e prestadores
**Data**: 2026-09
**Script**:
```sql
ALTER TABLE fiadores ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS foto_url TEXT;
```
**Rollback**:
```sql
ALTER TABLE fiadores DROP COLUMN IF EXISTS foto_url;
ALTER TABLE prestadores DROP COLUMN IF EXISTS foto_url;
```

## Template de nova migration

```sql
-- Migration NNN — [descrição]
-- Data: YYYY-MM-DD
-- Autor: backend-engineer

-- APLICAR:
ALTER TABLE tabela ADD COLUMN IF NOT EXISTS nova_coluna TIPO DEFAULT valor;
CREATE INDEX IF NOT EXISTS idx_tabela_coluna ON tabela(nova_coluna);

-- ROLLBACK:
ALTER TABLE tabela DROP COLUMN IF EXISTS nova_coluna;
DROP INDEX IF EXISTS idx_tabela_coluna;
```

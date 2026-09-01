-- IMOVELI — Schema PostgreSQL
-- Execução: psql -U postgres -d imoveli -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ CONTAS (login) ============
CREATE TABLE IF NOT EXISTS contas (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  telefone      TEXT,
  nome_profissional TEXT,
  senha_hash    TEXT NOT NULL,
  senha_salt    TEXT NOT NULL,
  confirmado    BOOLEAN DEFAULT FALSE,
  codigo_confirmacao TEXT,
  fiador_id     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ FIADORES TÉCNICOS (1º grau) ============
CREATE TABLE IF NOT EXISTS fiadores (
  id            TEXT PRIMARY KEY,
  nome          TEXT NOT NULL,
  email         TEXT,
  conselho      TEXT NOT NULL,  -- CAU | CREA
  uf            TEXT NOT NULL,
  registro      TEXT NOT NULL,
  cpf           TEXT,
  carteirinha   TEXT,
  status        TEXT DEFAULT 'pendente_manual', -- verificado | pendente_manual
  motivo        TEXT,
  fonte         TEXT,
  bio           TEXT DEFAULT '',
  skills        JSONB DEFAULT '[]',
  areas_interesse JSONB DEFAULT '[]',
  servicos_oferecidos JSONB DEFAULT '[]',
  acervo        JSONB DEFAULT '[]',
  mural         JSONB DEFAULT '[]',
  avaliacoes_externas JSONB DEFAULT '[]',
  localizacao   JSONB DEFAULT '{"lat":null,"lng":null,"cidade":"","uf":""}',
  faixa_preco   JSONB DEFAULT '{"min":null,"max":null}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ PRESTADORES (2º grau) ============
CREATE TABLE IF NOT EXISTS prestadores (
  id            TEXT PRIMARY KEY,
  nome          TEXT NOT NULL,
  telefone      TEXT,
  especialidade TEXT,
  carteirinha   TEXT,
  status        TEXT DEFAULT 'pendente', -- pendente | ativo | recusado
  bio           TEXT DEFAULT '',
  skills        JSONB DEFAULT '[]',
  areas_interesse JSONB DEFAULT '[]',
  servicos_oferecidos JSONB DEFAULT '[]',
  acervo        JSONB DEFAULT '[]',
  mural         JSONB DEFAULT '[]',
  avaliacoes_externas JSONB DEFAULT '[]',
  localizacao   JSONB DEFAULT '{"lat":null,"lng":null,"cidade":"","uf":""}',
  faixa_preco   JSONB DEFAULT '{"min":null,"max":null}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ INDICAÇÕES ============
CREATE TABLE IF NOT EXISTS indicacoes (
  id            TEXT PRIMARY KEY,
  fiador_id     TEXT REFERENCES fiadores(id),
  prestador_id  TEXT REFERENCES prestadores(id),
  escopo        TEXT DEFAULT 'Geral',
  status        TEXT DEFAULT 'pendente', -- pendente | aceita | recusada
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ SERVIÇOS (CRT) ============
CREATE TABLE IF NOT EXISTS servicos (
  id            TEXT PRIMARY KEY,
  hire_type     TEXT NOT NULL, -- fiador | indicacao
  hire_id       TEXT NOT NULL,
  grau          INTEGER NOT NULL, -- 1 | 2
  prestador_id  TEXT,
  fiador_id     TEXT,
  cliente_email TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  categoria     TEXT DEFAULT 'Geral',
  status        TEXT DEFAULT 'aberto', -- aberto | concluido
  fotos_antes   JSONB DEFAULT '[]',
  fotos_depois  JSONB DEFAULT '[]',
  avaliacao     JSONB,  -- {nota, comentario, assinado_em}
  data_inicio   TIMESTAMPTZ DEFAULT NOW(),
  data_conclusao TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ DIAGNÓSTICOS (Claude Vision) ============
CREATE TABLE IF NOT EXISTS diagnosticos (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  problema_detectado BOOLEAN,
  categoria     TEXT,
  tipo_problema TEXT,
  nivel_risco   TEXT,
  urgencia      TEXT,
  custo_min     NUMERIC,
  custo_max     NUMERIC,
  especialistas JSONB DEFAULT '[]',
  confidence_score INTEGER,
  dados_completos JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ DEMANDAS (leilão reverso) ============
CREATE TABLE IF NOT EXISTS demandas (
  id            TEXT PRIMARY KEY,
  cliente_email TEXT NOT NULL,
  descricao     TEXT NOT NULL,
  categoria_especialidade TEXT DEFAULT '',
  preco_min     NUMERIC,
  preco_max     NUMERIC,
  user_lat      NUMERIC,
  user_lng      NUMERIC,
  diagnosis_id  TEXT,
  status        TEXT DEFAULT 'aberta', -- aberta | fechada
  candidatura_vencedora_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============ CANDIDATURAS ============
CREATE TABLE IF NOT EXISTS candidaturas (
  id            TEXT PRIMARY KEY,
  demanda_id    TEXT REFERENCES demandas(id),
  hire_type     TEXT NOT NULL,
  hire_id       TEXT NOT NULL,
  nome          TEXT NOT NULL,
  preco_proposto NUMERIC NOT NULL,
  mensagem      TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para queries comuns
CREATE INDEX IF NOT EXISTS idx_contas_email ON contas(email);
CREATE INDEX IF NOT EXISTS idx_indicacoes_fiador ON indicacoes(fiador_id);
CREATE INDEX IF NOT EXISTS idx_indicacoes_prestador ON indicacoes(prestador_id);
CREATE INDEX IF NOT EXISTS idx_servicos_cliente ON servicos(cliente_email);
CREATE INDEX IF NOT EXISTS idx_servicos_fiador ON servicos(fiador_id);
CREATE INDEX IF NOT EXISTS idx_demandas_cliente ON demandas(cliente_email);
CREATE INDEX IF NOT EXISTS idx_candidaturas_demanda ON candidaturas(demanda_id);

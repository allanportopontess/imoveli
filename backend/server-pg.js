require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query, testConnection } = require('./db-pg');
const { enviarEmail } = require('./email');

let anthropicClient = null;
if (process.env.ANTHROPIC_API_KEY) {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropicClient = new Anthropic();
}

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET não configurado no .env'); })();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Middleware de autenticação — adiciona req.user se token válido
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de autenticação não fornecido' });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ success: false, error: 'Token inválido ou expirado' });
  }
}

// Auth opcional — preenche req.user se token presente, mas não bloqueia
function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try { req.user = jwt.verify(header.slice(7), JWT_SECRET); } catch (_) {}
  }
  next();
}

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8000,http://127.0.0.1:8000')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Não permitido por CORS'));
  }
}));
app.use(express.json({ limit: '10mb' }));

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// HELPERS
// ============================================

function hashSenha(senha, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return { hash, salt };
}

function gerarCodigoConfirmacao() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function validateSignupInput({ nomeProfissional, email, telefone, senha }) {
  if (!nomeProfissional || nomeProfissional.trim().length < 3) return 'Informe seu nome profissional completo';
  if (!email || !EMAIL_REGEX.test(email)) return 'Email inválido';
  if (!telefone || telefone.replace(/\D/g, '').length < 10) return 'Telefone inválido';
  if (!senha || senha.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
  return null;
}

function validateFiadorInput({ nome, email, conselho, uf, registro, cpf }) {
  if (!nome || nome.trim().length < 3) return 'Informe o nome completo';
  if (!email || !EMAIL_REGEX.test(email)) return 'Email inválido';
  if (!['CAU', 'CREA'].includes(conselho)) return 'Conselho deve ser CAU ou CREA';
  if (!uf || uf.length !== 2) return 'Informe a UF (ex: PE)';
  if (!registro || registro.trim().length < 3) return 'Informe o número de registro';
  if (!cpf || cpf.replace(/\D/g, '').length !== 11) return 'CPF inválido';
  return null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some(v => v == null)) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ============================================
// VERIFICAÇÃO CAU / CREA
// ============================================

const CONSELHO_CONNECTORS = {
  CAU: {
    async verify({ registro }) {
      const url = `https://siccau.caubr.gov.br/app/view/sight/externo.php?form=PesquisarProfissionalEmpresa&registro=${encodeURIComponent(registro)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`Portal CAU status ${response.status}`);
        const html = await response.text();
        const ativo = /ativo/i.test(html) && !/registro n(ã|a)o encontrado/i.test(html);
        return ativo
          ? { status: 'verificado', fonte: 'CAU nacional (automático)' }
          : { status: 'pendente_manual', motivo: 'Registro não confirmado como ativo no portal' };
      } catch (err) {
        clearTimeout(timeout);
        return { status: 'pendente_manual', motivo: `Falha ao consultar CAU: ${err.message}` };
      }
    }
  },
  'CREA-PE': {
    async verify({ registro, cpf }) {
      const url = `https://crea-pe.org.br/consulta-publica?cpf=${encodeURIComponent(cpf || '')}&registro=${encodeURIComponent(registro)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error(`Portal CREA-PE status ${response.status}`);
        const html = await response.text();
        const ativo = /ativo/i.test(html) && !/n(ã|a)o encontrado/i.test(html);
        return ativo
          ? { status: 'verificado', fonte: 'CREA-PE (automático)' }
          : { status: 'pendente_manual', motivo: 'Registro não confirmado como ativo no portal' };
      } catch (err) {
        clearTimeout(timeout);
        return { status: 'pendente_manual', motivo: `Falha ao consultar CREA-PE: ${err.message}` };
      }
    }
  }
};

function getConnector(conselho, uf) {
  if (conselho === 'CAU') return CONSELHO_CONNECTORS.CAU;
  if (conselho === 'CREA' && uf === 'PE') return CONSELHO_CONNECTORS['CREA-PE'];
  return null;
}

// ============================================
// AUTH
// ============================================

app.post('/api/auth/register', async (req, res) => {
  const err = validateSignupInput(req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  const { email, telefone, nomeProfissional, senha } = req.body;
  const emailNorm = email.trim().toLowerCase();

  const existing = await query('SELECT * FROM contas WHERE email = $1', [emailNorm]);
  if (existing.rows.length && existing.rows[0].confirmado) {
    return res.status(409).json({ success: false, error: 'Já existe uma conta confirmada com esse email. Faça login.' });
  }

  const { hash, salt } = hashSenha(senha);
  const codigo = gerarCodigoConfirmacao();

  if (existing.rows.length) {
    await query(
      `UPDATE contas SET telefone=$1, nome_profissional=$2, senha_hash=$3, senha_salt=$4, confirmado=false, codigo_confirmacao=$5 WHERE email=$6`,
      [telefone, nomeProfissional.trim(), hash, salt, codigo, emailNorm]
    );
  } else {
    await query(
      `INSERT INTO contas (email, telefone, nome_profissional, senha_hash, senha_salt, confirmado, codigo_confirmacao) VALUES ($1,$2,$3,$4,$5,false,$6)`,
      [emailNorm, telefone, nomeProfissional.trim(), hash, salt, codigo]
    );
  }

  let envio;
  try {
    envio = await enviarEmail({
      to: emailNorm,
      subject: 'Confirme sua conta IMOVELI',
      html: `<p>Seu código de confirmação é: <strong>${codigo}</strong></p>`,
      textoSimulado: `Código de confirmação: ${codigo}`
    });
  } catch (e) {
    return res.status(502).json({ success: false, error: 'Não foi possível enviar o email de confirmação.' });
  }

  res.json({
    success: true,
    codigoDebug: envio.modo !== 'producao_real' && process.env.NODE_ENV !== 'production' ? codigo : undefined,
    modoEmail: envio.modo
  });
});

app.post('/api/auth/confirmar', async (req, res) => {
  const { email, codigo } = req.body;
  const { rows } = await query('SELECT * FROM contas WHERE email=$1', [(email || '').trim().toLowerCase()]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  if (rows[0].confirmado) return res.json({ success: true, jaConfirmado: true });
  if (rows[0].codigo_confirmacao !== codigo) return res.status(400).json({ success: false, error: 'Código incorreto' });

  await query('UPDATE contas SET confirmado=true, codigo_confirmacao=NULL WHERE email=$1', [rows[0].email]);
  res.json({ success: true });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, senha } = req.body;
  const { rows } = await query('SELECT * FROM contas WHERE email=$1', [(email || '').trim().toLowerCase()]);
  if (!rows.length) return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
  if (!rows[0].confirmado) return res.status(403).json({ success: false, error: 'Confirme seu email antes de entrar' });

  const { hash } = hashSenha(senha, rows[0].senha_salt);
  if (hash !== rows[0].senha_hash) return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });

  const conta = {
    email: rows[0].email,
    telefone: rows[0].telefone,
    nomeProfissional: rows[0].nome_profissional,
    fiadorId: rows[0].fiador_id
  };
  const token = signToken({ email: conta.email, nomeProfissional: conta.nomeProfissional, fiadorId: conta.fiadorId });

  res.json({ success: true, token, conta });
});

// Verifica token e retorna dados do usuário logado
app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await query('SELECT email, telefone, nome_profissional, fiador_id FROM contas WHERE email=$1', [req.user.email]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  res.json({ success: true, conta: { email: rows[0].email, telefone: rows[0].telefone, nomeProfissional: rows[0].nome_profissional, fiadorId: rows[0].fiador_id } });
});

// Renova o token (se ainda válido, emite um novo com expiração estendida)
app.post('/api/auth/refresh', auth, (req, res) => {
  const token = signToken({ email: req.user.email, nomeProfissional: req.user.nomeProfissional, fiadorId: req.user.fiadorId });
  res.json({ success: true, token });
});

app.post('/api/auth/vincular-fiador', auth, async (req, res) => {
  const { email, fiadorId } = req.body;
  const { rows } = await query('UPDATE contas SET fiador_id=$1 WHERE email=$2 RETURNING *', [fiadorId, (email || '').trim().toLowerCase()]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  res.json({ success: true });
});

// ============================================
// DIAGNÓSTICOS
// ============================================

app.post('/api/diagnoses', async (req, res) => {
  const id = 'diag_' + Date.now();
  const { userId, diagnosis } = req.body;
  await query(
    `INSERT INTO diagnosticos (id, user_id, dados_completos) VALUES ($1,$2,$3)`,
    [id, userId, JSON.stringify(diagnosis)]
  );
  res.json({ success: true, diagnosis: { id, userId, ...diagnosis, createdAt: new Date().toISOString() } });
});

app.get('/api/diagnoses/:userId', async (req, res) => {
  const { rows } = await query('SELECT * FROM diagnosticos WHERE user_id=$1 ORDER BY created_at DESC', [req.params.userId]);
  res.json({ success: true, diagnoses: rows.map(r => ({ id: r.id, userId: r.user_id, createdAt: r.created_at, ...r.dados_completos })) });
});

// ============================================
// FIADORES TÉCNICOS
// ============================================

app.post('/api/fiadores/register', async (req, res) => {
  const err = validateFiadorInput(req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  const { nome, email, conselho, uf, registro, cpf } = req.body;
  const connector = getConnector(conselho, uf.toUpperCase());
  const verification = connector
    ? await connector.verify({ registro, cpf })
    : { status: 'pendente_manual', motivo: `Sem verificação automática para ${conselho}/${uf.toUpperCase()}` };

  const { rows: total } = await query('SELECT COUNT(*) FROM fiadores');
  const carteirinha = verification.status === 'verificado'
    ? `${conselho} ${registro}`
    : `IMV-PROV-${String(parseInt(total.rows[0]?.count || 0) + 1).padStart(6, '0')}`;

  const id = 'fiador_' + Date.now();
  const { rows } = await query(
    `INSERT INTO fiadores (id,nome,email,conselho,uf,registro,cpf,carteirinha,status,motivo,fonte) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [id, nome, email, conselho, uf.toUpperCase(), registro, cpf, carteirinha, verification.status, verification.motivo || null, verification.fonte || null]
  );
  res.json({ success: true, fiador: rowToFiador(rows[0]) });
});

app.get('/api/fiadores/:id', async (req, res) => {
  const { rows } = await query('SELECT * FROM fiadores WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Fiador não encontrado' });
  res.json({ success: true, fiador: rowToFiador(rows[0]) });
});

// ============================================
// INDICAÇÃO DE PRESTADORES
// ============================================

app.post('/api/fiadores/:id/indicar', auth, async (req, res) => {
  try {
    // Ownership: um fiador só pode indicar em seu próprio cadastro
    if (req.user.fiadorId !== req.params.id) return res.status(403).json({ success: false, error: 'Acesso negado' });

    const { rows: f } = await query('SELECT * FROM fiadores WHERE id=$1', [req.params.id]);
    if (!f.length) return res.status(404).json({ success: false, error: 'Fiador não encontrado' });
    if (!['verificado', 'pendente_manual'].includes(f[0].status)) return res.status(403).json({ success: false, error: 'Cadastro de RT ainda não liberado' });

    const { nome, email, telefone, especialidade, cidade, estado, escopo } = req.body;

    // Validações
    if (!nome?.trim()) return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    if (!telefone?.trim()) return res.status(400).json({ success: false, error: 'Telefone é obrigatório' });
    if (!especialidade?.trim()) return res.status(400).json({ success: false, error: 'Selecione ao menos uma categoria profissional' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'E-mail inválido' });
    }

    const { rows: countR } = await query('SELECT COUNT(*) FROM prestadores');
    const seq = parseInt(countR[0].count) + 1;
    const carteirinha = `IMV-${new Date().getFullYear()}-${String(seq).padStart(6, '0')}`;
    const prestId = 'prestador_' + Date.now();
    const indId = 'indicacao_' + Date.now();

    const { rows: pRows } = await query(
      `INSERT INTO prestadores
         (id, nome, email, telefone, especialidade, cidade, estado, carteirinha, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendente') RETURNING *`,
      [prestId, nome.trim(), (email || '').trim().toLowerCase() || null,
       telefone.trim(), especialidade.trim(),
       (cidade || '').trim() || null, (estado || '').trim().toUpperCase() || null,
       carteirinha]
    );
    const { rows: iRows } = await query(
      `INSERT INTO indicacoes (id,fiador_id,prestador_id,escopo,status) VALUES ($1,$2,$3,$4,'pendente') RETURNING *`,
      [indId, req.params.id, prestId, (escopo || 'Geral').trim()]
    );

    res.json({ success: true, prestador: rowToPrestador(pRows[0]), indicacao: iRows[0] });
  } catch (err) {
    console.error('[POST /indicar]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao indicar profissional' });
  }
});

// Atualizar perfil de profissional indicado
app.put('/api/prestadores/:id/perfil', auth, async (req, res) => {
  try {
    // Ownership: só o fiador que indicou este prestador pode editar o perfil
    const { rows: own } = await query(
      'SELECT 1 FROM indicacoes WHERE prestador_id=$1 AND fiador_id=$2',
      [req.params.id, req.user.fiadorId]
    );
    if (!own.length) return res.status(403).json({ success: false, error: 'Acesso negado' });

    const { nome, email, telefone, especialidade, cidade, estado } = req.body;

    if (!nome?.trim()) return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    if (!telefone?.trim()) return res.status(400).json({ success: false, error: 'Telefone é obrigatório' });
    if (!especialidade?.trim()) return res.status(400).json({ success: false, error: 'Profissão é obrigatória' });
    if (!cidade?.trim()) return res.status(400).json({ success: false, error: 'Cidade é obrigatória' });
    if (!estado?.trim()) return res.status(400).json({ success: false, error: 'Estado é obrigatório' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'E-mail inválido' });
    }

    const { rows } = await query(
      `UPDATE prestadores
       SET nome=$1, email=$2, telefone=$3, especialidade=$4, cidade=$5, estado=$6
       WHERE id=$7 RETURNING *`,
      [nome.trim(), (email || '').trim().toLowerCase() || null,
       telefone.trim(), especialidade.trim(),
       cidade.trim(), estado.trim().toUpperCase(),
       req.params.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
    res.json({ success: true, prestador: rowToPrestador(rows[0]) });
  } catch (err) {
    console.error('[PUT /prestadores/:id/perfil]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao atualizar perfil' });
  }
});

app.get('/api/fiadores/:id/indicados', auth, async (req, res) => {
  // Ownership: só o próprio fiador pode ver seus indicados
  if (req.user.fiadorId !== req.params.id) return res.status(403).json({ success: false, error: 'Acesso negado' });
  const { rows } = await query(
    `SELECT i.*, row_to_json(p) as prestador FROM indicacoes i JOIN prestadores p ON p.id=i.prestador_id WHERE i.fiador_id=$1`,
    [req.params.id]
  );
  res.json({ success: true, indicados: rows });
});

app.post('/api/indicacoes/:id/aceitar', auth, async (req, res) => {
  try {
    // Só o fiador responsável pela indicação pode aceitá-la
    const { rows: check } = await query(
      'SELECT i.id FROM indicacoes i WHERE i.id=$1 AND i.fiador_id=$2',
      [req.params.id, req.user.fiadorId]
    );
    if (!check.length) return res.status(403).json({ success: false, error: 'Acesso negado ou indicação não encontrada' });

    const { rows: i } = await query("UPDATE indicacoes SET status='aceita' WHERE id=$1 RETURNING *", [req.params.id]);
    const { rows: p } = await query("UPDATE prestadores SET status='ativo' WHERE id=$1 RETURNING *", [i[0].prestador_id]);
    res.json({ success: true, indicacao: i[0], prestador: p[0] ? rowToPrestador(p[0]) : null });
  } catch (err) {
    console.error('[POST /indicacoes/:id/aceitar]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

app.post('/api/indicacoes/:id/recusar', auth, async (req, res) => {
  try {
    const { rows: check } = await query(
      'SELECT i.id FROM indicacoes i WHERE i.id=$1 AND i.fiador_id=$2',
      [req.params.id, req.user.fiadorId]
    );
    if (!check.length) return res.status(403).json({ success: false, error: 'Acesso negado ou indicação não encontrada' });

    const { rows: i } = await query("UPDATE indicacoes SET status='recusada' WHERE id=$1 RETURNING *", [req.params.id]);
    await query("UPDATE prestadores SET status='recusado' WHERE id=$1", [i[0].prestador_id]);
    res.json({ success: true, indicacao: i[0] });
  } catch (err) {
    console.error('[POST /indicacoes/:id/recusar]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ============================================
// DIRETÓRIO PÚBLICO
// ============================================

app.get('/api/prestadores', async (req, res) => {
  const { rows: grau1rows } = await query(
    `SELECT * FROM fiadores WHERE status='verificado'`
  );
  const { rows: grau2rows } = await query(
    `SELECT i.id as hire_id, i.escopo, p.*, f.id as fiador_id_ref, f.nome as fiador_nome, f.conselho, f.registro, f.fonte
     FROM indicacoes i
     JOIN prestadores p ON p.id=i.prestador_id
     JOIN fiadores f ON f.id=i.fiador_id
     WHERE i.status='aceita'`
  );

  const grau1 = grau1rows.map(f => ({
    hireType: 'fiador', hireId: f.id, profileTipo: 'fiador', profileId: f.id, grau: 1,
    nome: f.nome, especialidade: f.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia',
    escopo: 'Responsável técnico — atendimento direto',
    fiador: { id: f.id, nome: f.nome, conselho: f.conselho, registro: f.registro, fonte: f.fonte }
  }));

  const grau2 = grau2rows.map(r => ({
    hireType: 'indicacao', hireId: r.hire_id, profileTipo: 'prestador', profileId: r.id, grau: 2,
    nome: r.nome, especialidade: r.especialidade, escopo: r.escopo,
    fiador: { id: r.fiador_id_ref, nome: r.fiador_nome, conselho: r.conselho, registro: r.registro, fonte: r.fonte }
  }));

  res.json({ success: true, prestadores: [...grau1, ...grau2] });
});

// ============================================
// SERVIÇOS (CRT)
// ============================================

async function criarServicoInterno({ hireType, hireId, clienteEmail, descricao, categoria }) {
  if (!hireType || !hireId || !clienteEmail || !descricao) {
    return { error: 'hireType, hireId, clienteEmail e descricao são obrigatórios' };
  }

  let prestadorId = null, fiadorId = null, grau;

  if (hireType === 'indicacao') {
    const { rows } = await query(`SELECT * FROM indicacoes WHERE id=$1 AND status='aceita'`, [hireId]);
    if (!rows.length) return { error: 'Prestador não encontrado na lista de vínculos ativos' };
    prestadorId = rows[0].prestador_id;
    fiadorId = rows[0].fiador_id;
    grau = 2;
  } else if (hireType === 'fiador') {
    const { rows } = await query(`SELECT * FROM fiadores WHERE id=$1 AND status='verificado'`, [hireId]);
    if (!rows.length) return { error: 'Profissional não encontrado ou não verificado' };
    fiadorId = rows[0].id;
    grau = 1;
  } else {
    return { error: 'hireType deve ser "indicacao" ou "fiador"' };
  }

  const id = 'servico_' + Date.now();
  const { rows } = await query(
    `INSERT INTO servicos (id,hire_type,hire_id,grau,prestador_id,fiador_id,cliente_email,descricao,categoria,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'aberto') RETURNING *`,
    [id, hireType, hireId, grau, prestadorId, fiadorId, clienteEmail, descricao, categoria || 'Geral']
  );
  return { servico: rows[0] };
}

async function attachServicoRelations(servico) {
  const { rows: f } = await query('SELECT * FROM fiadores WHERE id=$1', [servico.fiador_id]);
  const { rows: p } = servico.prestador_id
    ? await query('SELECT * FROM prestadores WHERE id=$1', [servico.prestador_id])
    : { rows: [] };
  const fiador = f[0] || null;
  const prestador = p[0] || null;
  const executor = servico.grau === 1
    ? (fiador ? { nome: fiador.nome, especialidade: fiador.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia' } : null)
    : (prestador ? { nome: prestador.nome, especialidade: prestador.especialidade } : null);
  return { ...servico, fiador, prestador, executor };
}

app.post('/api/servicos', auth, async (req, res) => {
  const resultado = await criarServicoInterno(req.body);
  if (resultado.error) return res.status(400).json({ success: false, error: resultado.error });
  res.json({ success: true, servico: await attachServicoRelations(resultado.servico) });
});

app.get('/api/clientes/:email/servicos', async (req, res) => {
  const { rows } = await query('SELECT * FROM servicos WHERE cliente_email=$1 ORDER BY created_at DESC', [req.params.email]);
  const enriched = await Promise.all(rows.map(attachServicoRelations));
  res.json({ success: true, servicos: enriched });
});

app.post('/api/servicos/:id/foto', auth, async (req, res) => {
  const { rows } = await query('SELECT * FROM servicos WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
  const { tipo, fotoBase64 } = req.body;
  if (!['antes', 'depois'].includes(tipo) || !fotoBase64) return res.status(400).json({ success: false, error: 'tipo e fotoBase64 são obrigatórios' });

  const col = tipo === 'antes' ? 'fotos_antes' : 'fotos_depois';
  const entry = { url: fotoBase64, enviadoEm: new Date().toISOString() };
  await query(`UPDATE servicos SET ${col} = ${col} || $1::jsonb WHERE id=$2`, [JSON.stringify([entry]), req.params.id]);
  res.json({ success: true });
});

app.post('/api/servicos/:id/concluir', auth, async (req, res) => {
  const { rows } = await query(`UPDATE servicos SET status='concluido', data_conclusao=NOW() WHERE id=$1 AND status='aberto' RETURNING *`, [req.params.id]);
  if (!rows.length) return res.status(400).json({ success: false, error: 'Serviço não encontrado ou já concluído' });
  res.json({ success: true, servico: rows[0] });
});

app.post('/api/servicos/:id/avaliar', auth, async (req, res) => {
  const { rows: s } = await query('SELECT * FROM servicos WHERE id=$1', [req.params.id]);
  if (!s.length) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
  if (s[0].status !== 'concluido') return res.status(400).json({ success: false, error: 'Só é possível avaliar um serviço concluído' });
  if (s[0].avaliacao) return res.status(400).json({ success: false, error: 'Serviço já avaliado' });

  const { nota, comentario } = req.body;
  const notaNum = Number(nota);
  if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) return res.status(400).json({ success: false, error: 'Nota deve ser 1 a 5' });

  const avaliacao = { nota: notaNum, comentario: comentario || '', assinadoEm: new Date().toISOString() };
  const { rows } = await query('UPDATE servicos SET avaliacao=$1 WHERE id=$2 RETURNING *', [JSON.stringify(avaliacao), req.params.id]);
  res.json({ success: true, servico: rows[0] });
});

app.get('/api/servicos/:id', async (req, res) => {
  const { rows } = await query('SELECT * FROM servicos WHERE id=$1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Serviço não encontrado' });
  res.json({ success: true, servico: await attachServicoRelations(rows[0]) });
});

// ============================================
// REPUTAÇÃO
// ============================================

app.get('/api/fiadores/:id/reputacao', async (req, res) => {
  const { rows } = await query(
    `SELECT COUNT(*) as total, AVG((avaliacao->>'nota')::numeric) as media FROM servicos WHERE fiador_id=$1 AND grau=1 AND avaliacao IS NOT NULL`,
    [req.params.id]
  );
  const total = parseInt(rows[0].total);
  res.json({ success: true, reputacao: { totalServicos: total, mediaNota: total > 0 ? Math.round(parseFloat(rows[0].media) * 10) / 10 : null } });
});

// ============================================
// PERFIL PROFISSIONAL
// ============================================

app.put('/api/perfil', auth, async (req, res) => {
  const { tipo, id, bio, skills, areasInteresse, servicosOferecidos } = req.body;
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const updates = [];
  const vals = [];
  if (typeof bio === 'string') { updates.push(`bio=$${updates.length + 1}`); vals.push(bio.slice(0, 500)); }
  if (Array.isArray(skills)) { updates.push(`skills=$${updates.length + 1}`); vals.push(JSON.stringify(skills.slice(0, 15).map(s => String(s).slice(0, 40)))); }
  if (Array.isArray(areasInteresse)) { updates.push(`areas_interesse=$${updates.length + 1}`); vals.push(JSON.stringify(areasInteresse.slice(0, 10))); }
  if (Array.isArray(servicosOferecidos)) { updates.push(`servicos_oferecidos=$${updates.length + 1}`); vals.push(JSON.stringify(servicosOferecidos.slice(0, 15))); }
  if (!updates.length) return res.status(400).json({ success: false, error: 'Nada para atualizar' });
  vals.push(id);
  const { rows } = await query(`UPDATE ${table} SET ${updates.join(',')} WHERE id=$${vals.length} RETURNING *`, vals);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
  res.json({ success: true, perfil: rows[0] });
});

app.post('/api/perfil/acervo', auth, async (req, res) => {
  const { tipo, id, titulo, descricao, fotoBase64 } = req.body;
  if (!titulo) return res.status(400).json({ success: false, error: 'Título é obrigatório' });
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const item = { id: 'acervo_' + Date.now(), titulo, descricao: descricao || '', fotoBase64: fotoBase64 || null, criadoEm: new Date().toISOString() };
  await query(`UPDATE ${table} SET acervo = acervo || $1::jsonb WHERE id=$2`, [JSON.stringify([item]), id]);
  res.json({ success: true, item });
});

app.delete('/api/perfil/acervo/:itemId', auth, async (req, res) => {
  const { tipo, id } = req.query;
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const { rows } = await query(`SELECT acervo FROM ${table} WHERE id=$1`, [id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
  const novoAcervo = (rows[0].acervo || []).filter(i => i.id !== req.params.itemId);
  await query(`UPDATE ${table} SET acervo=$1 WHERE id=$2`, [JSON.stringify(novoAcervo), id]);
  res.json({ success: true });
});

app.post('/api/perfil/mural', auth, async (req, res) => {
  const { tipo, id, fotoBase64 } = req.body;
  if (!fotoBase64) return res.status(400).json({ success: false, error: 'fotoBase64 é obrigatório' });
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const foto = { id: 'mural_' + Date.now(), fotoBase64, enviadoEm: new Date().toISOString() };
  await query(`UPDATE ${table} SET mural = mural || $1::jsonb WHERE id=$2`, [JSON.stringify([foto]), id]);
  res.json({ success: true, foto });
});

app.post('/api/perfil/avaliacao-externa', async (req, res) => {
  const { tipo, id, nome, comentario, nota } = req.body;
  const notaNum = Number(nota);
  if (!nome || !comentario) return res.status(400).json({ success: false, error: 'Nome e comentário são obrigatórios' });
  if (!Number.isInteger(notaNum) || notaNum < 1 || notaNum > 5) return res.status(400).json({ success: false, error: 'Nota deve ser 1 a 5' });
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const av = { id: 'ext_' + Date.now(), nome: String(nome).slice(0, 60), comentario: String(comentario).slice(0, 300), nota: notaNum, verificada: false, criadoEm: new Date().toISOString() };
  await query(`UPDATE ${table} SET avaliacoes_externas = avaliacoes_externas || $1::jsonb WHERE id=$2`, [JSON.stringify([av]), id]);
  res.json({ success: true, avaliacao: av });
});

app.get('/api/perfil/:tipo/:id', async (req, res) => {
  const { tipo, id } = req.params;
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const { rows } = await query(`SELECT * FROM ${table} WHERE id=$1`, [id]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
  const alvo = rows[0];

  const filtro = tipo === 'fiador' ? `fiador_id=$1 AND grau=1` : `prestador_id=$1`;
  const { rows: avRows } = await query(`SELECT * FROM servicos WHERE ${filtro} AND avaliacao IS NOT NULL`, [id]);
  const totalServicos = avRows.length;
  const mediaNota = totalServicos > 0
    ? Math.round((avRows.reduce((a, s) => a + s.avaliacao.nota, 0) / totalServicos) * 10) / 10
    : null;

  let fiadorResponsavel = null;
  if (tipo === 'prestador') {
    const { rows: ind } = await query(`SELECT i.*, f.nome as fiador_nome, f.conselho, f.registro FROM indicacoes i JOIN fiadores f ON f.id=i.fiador_id WHERE i.prestador_id=$1 AND i.status='aceita' LIMIT 1`, [id]);
    if (ind.length) fiadorResponsavel = { id: ind[0].fiador_id, nome: ind[0].fiador_nome, conselho: ind[0].conselho, registro: ind[0].registro };
  }

  // Campos seguros para exposição pública — sem email, telefone, CPF
  res.json({
    success: true,
    perfil: {
      tipo, id: alvo.id, nome: alvo.nome,
      especialidade: tipo === 'fiador' ? (alvo.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia') : alvo.especialidade,
      registro: tipo === 'fiador' ? `${alvo.conselho} ${alvo.registro}` : null,
      carteirinha: alvo.carteirinha,
      cidade: alvo.cidade || (alvo.localizacao?.cidade) || null,
      estado: alvo.estado || alvo.uf || (alvo.localizacao?.uf) || null,
      grau: tipo === 'fiador' ? 1 : 2,
      bio: alvo.bio, skills: alvo.skills, areasInteresse: alvo.areas_interesse,
      servicosOferecidos: alvo.servicos_oferecidos, acervo: alvo.acervo,
      mural: alvo.mural, avaliacoesExternas: alvo.avaliacoes_externas,
      reputacaoVerificada: { totalServicos, mediaNota },
      avaliacoesVerificadas: avRows.map(s => ({ descricaoServico: s.descricao, nota: s.avaliacao.nota, comentario: s.avaliacao.comentario, data: s.avaliacao.assinadoEm })),
      fiadorResponsavel
    }
  });
});

// ============================================
// LOCALIZAÇÃO E FAIXA DE PREÇO
// ============================================

app.get('/api/config/maps', (req, res) => {
  res.json({ success: true, mapsHabilitado: Boolean(process.env.GOOGLE_MAPS_API_KEY) });
});

app.put('/api/perfil/localizacao', async (req, res) => {
  const { tipo, id, lat, lng, cidade, uf } = req.body;
  const latNum = Number(lat), lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return res.status(400).json({ success: false, error: 'Latitude e longitude inválidas' });
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  const loc = { lat: latNum, lng: lngNum, cidade: cidade || '', uf: uf || '' };
  await query(`UPDATE ${table} SET localizacao=$1 WHERE id=$2`, [JSON.stringify(loc), id]);
  res.json({ success: true, localizacao: loc });
});

app.put('/api/perfil/faixa-preco', async (req, res) => {
  const { tipo, id, min, max } = req.body;
  const minNum = Number(min), maxNum = Number(max);
  if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum < 0 || maxNum < minNum) return res.status(400).json({ success: false, error: 'Faixa inválida' });
  const table = tipo === 'fiador' ? 'fiadores' : 'prestadores';
  await query(`UPDATE ${table} SET faixa_preco=$1 WHERE id=$2`, [JSON.stringify({ min: minNum, max: maxNum }), id]);
  res.json({ success: true, faixaPreco: { min: minNum, max: maxNum } });
});

// ============================================
// MATCH INTELIGENTE
// ============================================

function calcularScore(candidato, { categoriaOuEspecialidade, precoMin, precoMax, userLat, userLng }) {
  const termo = (categoriaOuEspecialidade || '').toLowerCase();
  const texto = [candidato.especialidade, ...(candidato.skills || []), ...(candidato.servicosOferecidos || [])].join(' ').toLowerCase();
  const aderencia = termo && texto.includes(termo) ? 1 : (termo ? 0.3 : 0.5);

  let scorePreco = 0.5;
  if (candidato.faixaPreco?.min != null && (precoMin != null || precoMax != null)) {
    const pMin = precoMin ?? 0, pMax = precoMax ?? Infinity;
    scorePreco = (candidato.faixaPreco.min <= pMax && candidato.faixaPreco.max >= pMin) ? 1 : 0.2;
  }

  let scoreLoc = 0.5, distKm = null;
  if (candidato.localizacao?.lat != null && userLat != null) {
    distKm = haversineKm(userLat, userLng, candidato.localizacao.lat, candidato.localizacao.lng);
    scoreLoc = distKm === null ? 0.5 : Math.max(0, 1 - distKm / 30);
  }

  const scoreAv = candidato.reputacao.totalServicos > 0 ? candidato.reputacao.mediaNota / 5 : 0.5;
  const scoreExp = Math.min(candidato.reputacao.totalServicos / 10, 1);

  const p = { tecnica: 0.35, avaliacao: 0.25, localizacao: 0.20, preco: 0.15, experiencia: 0.05 };
  return {
    scoreFinal: Math.round((aderencia * p.tecnica + scoreAv * p.avaliacao + scoreLoc * p.localizacao + scorePreco * p.preco + scoreExp * p.experiencia) * 100),
    distanciaKm: distKm !== null ? Math.round(distKm * 10) / 10 : null,
    detalhes: { aderenciaTecnica: Math.round(aderencia * 100), preco: Math.round(scorePreco * 100), localizacao: Math.round(scoreLoc * 100), avaliacao: Math.round(scoreAv * 100), experiencia: Math.round(scoreExp * 100) }
  };
}

app.post('/api/match', async (req, res) => {
  const { categoriaOuEspecialidade, precoMin, precoMax, userLat, userLng } = req.body;

  const { rows: fiadorRows } = await query(`SELECT * FROM fiadores WHERE status='verificado'`);
  const { rows: indicRows } = await query(`SELECT i.*, p.nome as pnome, p.especialidade as pespecialidade, p.skills as pskills, p.servicos_oferecidos as pservicos, p.faixa_preco as pfaixa, p.localizacao as ploc FROM indicacoes i JOIN prestadores p ON p.id=i.prestador_id WHERE i.status='aceita'`);

  const getReputacao = async (tipo, id) => {
    const filtro = tipo === 'fiador' ? `fiador_id=$1 AND grau=1` : `prestador_id=$1`;
    const { rows } = await query(`SELECT COUNT(*) as t, AVG((avaliacao->>'nota')::numeric) as m FROM servicos WHERE ${filtro} AND avaliacao IS NOT NULL`, [id]);
    const t = parseInt(rows[0].t);
    return { totalServicos: t, mediaNota: t > 0 ? Math.round(parseFloat(rows[0].m) * 10) / 10 : null };
  };

  const candidatos = await Promise.all([
    ...fiadorRows.map(async f => {
      const reputacao = await getReputacao('fiador', f.id);
      const score = calcularScore({ especialidade: f.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia', skills: f.skills, servicosOferecidos: f.servicos_oferecidos, faixaPreco: f.faixa_preco, localizacao: f.localizacao, reputacao }, req.body);
      return { hireType: 'fiador', hireId: f.id, profileTipo: 'fiador', profileId: f.id, grau: 1, nome: f.nome, especialidade: f.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia', reputacao, ...score };
    }),
    ...indicRows.map(async r => {
      const reputacao = await getReputacao('prestador', r.prestador_id);
      const score = calcularScore({ especialidade: r.pespecialidade, skills: r.pskills, servicosOferecidos: r.pservicos, faixaPreco: r.pfaixa, localizacao: r.ploc, reputacao }, req.body);
      return { hireType: 'indicacao', hireId: r.id, profileTipo: 'prestador', profileId: r.prestador_id, grau: 2, nome: r.pnome, especialidade: r.pespecialidade, reputacao, ...score };
    })
  ]);

  res.json({ success: true, candidatos: candidatos.sort((a, b) => b.scoreFinal - a.scoreFinal) });
});

// ============================================
// LEILÃO REVERSO
// ============================================

// POST /api/demandas — sem auth obrigatório (MVP: cliente pode postar sem conta)
app.post('/api/demandas', async (req, res) => {
  try {
    const { clienteEmail, clienteNome, descricao, categoriaOuEspecialidade, cidade, precoMin, precoMax, userLat, userLng, diagnosisId } = req.body;
    if (!clienteEmail?.trim() || !descricao?.trim()) {
      return res.status(400).json({ success: false, error: 'E-mail e descrição são obrigatórios' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clienteEmail)) {
      return res.status(400).json({ success: false, error: 'E-mail inválido' });
    }
    const id = 'demanda_' + Date.now();
    const { rows } = await query(
      `INSERT INTO demandas
         (id, cliente_email, descricao, categoria_especialidade, preco_min, preco_max, user_lat, user_lng, diagnosis_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'aberta') RETURNING *`,
      [id, clienteEmail.trim().toLowerCase(), descricao.trim(),
       (categoriaOuEspecialidade || cidade || '').trim(),
       precoMin ?? null, precoMax ?? null,
       userLat ?? null, userLng ?? null, diagnosisId || null]
    );
    res.json({ success: true, demanda: rows[0] });
  } catch (err) {
    console.error('[POST /demandas]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao publicar demanda' });
  }
});

app.get('/api/demandas/disponiveis', async (req, res) => {
  const { especialidade } = req.query;
  let q = `SELECT * FROM demandas WHERE status='aberta'`;
  const params = [];
  if (especialidade) { params.push(`%${especialidade.toLowerCase()}%`); q += ` AND LOWER(categoria_especialidade) LIKE $1`; }
  const { rows } = await query(q, params);
  res.json({ success: true, demandas: rows });
});

app.post('/api/demandas/:id/candidatar', async (req, res) => {
  const { rows: d } = await query(`SELECT * FROM demandas WHERE id=$1`, [req.params.id]);
  if (!d.length) return res.status(404).json({ success: false, error: 'Demanda não encontrada' });
  if (d[0].status !== 'aberta') return res.status(400).json({ success: false, error: 'Demanda já fechada' });

  const { hireType, hireId, nome, precoProposto, mensagem } = req.body;
  if (!hireType || !hireId || !nome || precoProposto == null) return res.status(400).json({ success: false, error: 'hireType, hireId, nome e precoProposto são obrigatórios' });

  const id = 'candidatura_' + Date.now();
  const { rows } = await query(
    `INSERT INTO candidaturas (id,demanda_id,hire_type,hire_id,nome,preco_proposto,mensagem) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [id, d[0].id, hireType, hireId, nome, Number(precoProposto), mensagem || '']
  );
  res.json({ success: true, candidatura: rows[0] });
});

app.get('/api/demandas/:id/candidaturas', async (req, res) => {
  const { rows } = await query('SELECT * FROM candidaturas WHERE demanda_id=$1', [req.params.id]);
  res.json({ success: true, candidaturas: rows });
});

app.get('/api/clientes/:email/demandas', async (req, res) => {
  const { rows: demandaRows } = await query('SELECT * FROM demandas WHERE cliente_email=$1 ORDER BY created_at DESC', [req.params.email]);
  const result = await Promise.all(demandaRows.map(async d => {
    const { rows: cands } = await query('SELECT * FROM candidaturas WHERE demanda_id=$1', [d.id]);
    return { ...d, candidaturas: cands };
  }));
  res.json({ success: true, demandas: result });
});

app.post('/api/demandas/:id/escolher', auth, async (req, res) => {
  const { rows: d } = await query(`SELECT * FROM demandas WHERE id=$1 AND status='aberta'`, [req.params.id]);
  if (!d.length) return res.status(404).json({ success: false, error: 'Demanda não encontrada ou já fechada' });

  const { candidaturaId } = req.body;
  const { rows: c } = await query('SELECT * FROM candidaturas WHERE id=$1 AND demanda_id=$2', [candidaturaId, d[0].id]);
  if (!c.length) return res.status(404).json({ success: false, error: 'Candidatura não encontrada' });

  const resultado = await criarServicoInterno({ hireType: c[0].hire_type, hireId: c[0].hire_id, clienteEmail: d[0].cliente_email, descricao: d[0].descricao, categoria: d[0].categoria_especialidade });
  if (resultado.error) return res.status(400).json({ success: false, error: resultado.error });

  await query(`UPDATE demandas SET status='fechada', candidatura_vencedora_id=$1 WHERE id=$2`, [candidaturaId, d[0].id]);
  res.json({ success: true, servico: await attachServicoRelations(resultado.servico) });
});

// ============================================
// CHATBOT IA
// ============================================

const CHAT_SYSTEM_PROMPT = `Você é o Assistente Técnico da IMOVELI — plataforma brasileira de rede de profissionais da construção civil baseada em confiança e responsabilidade técnica.

## Sua identidade
- Nome: Assistente IMOVELI
- Tom: técnico, direto, acessível. Nunca pedante. Sempre em português brasileiro.
- Você conhece profundamente o setor de construção civil, regularização imobiliária e gestão de obras no Brasil.

## Domínios de especialidade

### Construção e Obra
- Patologias construtivas: rachaduras, trincas, fissuras, recalque de fundação, infiltrações, eflorescência, carbonatação do concreto
- Materiais: concreto, argamassa, blocos, tijolos, aço CA-50/CA-60, impermeabilizantes, revestimentos
- Fundações: sapata corrida, radier, estaca hélice contínua, cortina de estacas
- Estrutura: vigas, pilares, lajes (maciça, nervurada, pré-moldada), shear wall
- Instalações: elétrica (NR-10, ABNT NBR 5410), hidráulica/sanitária (NBR 7198, NBR 8160), HVAC, SPDA
- Normas: ABNT NBR 6118 (concreto), NBR 6120 (cargas), NBR 9050 (acessibilidade), NBR 15575 (desempenho), NBR 14037 (manual do proprietário)
- Orçamento: curva ABC, BDI, composições SINAPI, cronograma físico-financeiro

### Regularização e Documentação
- Usucapião: extrajudicial (art. 1.071 CPC), judicial, especial urbano (art. 183 CF), especial rural, por abandono conjugal
- REURB-S e REURB-E (Lei 13.465/2017), CUEM, CDRU, legitimação fundiária
- Regularização de construção: habite-se, CVCO, averbação, retificação de área
- AVCB / Laudo de Vistoria do Corpo de Bombeiros, PPCI
- Aprovação de projetos em prefeitura: uso e ocupação do solo, recuos, gabaritos, taxa de permeabilidade, coeficiente de aproveitamento
- Registro de Imóveis: matrícula, certidões, ônus reais, alienação fiduciária

### Conselhos Profissionais
- CREA: ART (Anotação de Responsabilidade Técnica), tipos, valores, rescisão
- CAU: RRT (Registro de Responsabilidade Técnica), acervo técnico

### Plataforma IMOVELI
- Responsável Técnico (RT): arquiteto ou engenheiro registrado no CREA/CAU que assina a Cadeia de Responsabilidade Técnica (CRT)
- Profissional Indicado: prestador chancelado pelo RT, visível na rede após aceite
- Match Inteligente: cruza especialidade, preço, localização, avaliação e experiência
- Leilão Reverso: cliente posta demanda, profissionais enviam propostas
- Perfil Profissional IMOVELI: vincula o profissional ao RT indicante com número de identificação único

## Regras de resposta
1. Pergunta técnica de construção → responda com precisão, cite normas quando relevante, use bullet points.
2. Regularização → oriente o caminho e sugira contratar um RT via IMOVELI.
3. Plataforma → explique o fluxo de forma clara e prática.
4. Incerteza → diga: "Recomendo confirmar com o Responsável Técnico vinculado a você na plataforma."
5. Nunca invente números de normas ou prazos legais.
6. Respostas entre 3 e 15 linhas, salvo pedido de elaboração.`;

// Busca contexto técnico relevante no banco de conhecimento
async function buscarContextoConhecimento(pergunta) {
  try {
    const termos = pergunta.toLowerCase()
      .replace(/[^a-záéíóúãõâêîôûàèìòùç\s0-9\-\/]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3)
      .slice(0, 8);
    if (!termos.length) return '';

    const condicoes = termos.map((t, i) => `(
      titulo ILIKE $${i + 1} OR
      numero ILIKE $${i + 1} OR
      descricao ILIKE $${i + 1} OR
      conteudo ILIKE $${i + 1} OR
      $${i + 1} ILIKE ANY(tags)
    )`).join(' OR ');
    const params = termos.map(t => `%${t}%`);

    const { rows } = await query(
      `SELECT titulo, numero, categoria, descricao, conteudo FROM base_conhecimento
       WHERE vigente = TRUE AND (${condicoes})
       LIMIT 4`,
      params
    );
    if (!rows.length) return '';

    return '\n\n## Base de Conhecimento Técnico Relevante\nUse estas referências ao responder:\n\n' +
      rows.map(r => `### ${r.titulo}\n${r.conteudo}`).join('\n\n---\n\n');
  } catch (err) {
    console.error('Erro ao buscar base_conhecimento:', err.message);
    return '';
  }
}

app.post('/api/chat', async (req, res) => {
  if (!anthropicClient) return res.status(503).json({ success: false, error: 'Chatbot indisponível — configure ANTHROPIC_API_KEY no .env' });
  const { mensagens, contexto } = req.body;
  if (!Array.isArray(mensagens) || !mensagens.length) return res.status(400).json({ success: false, error: 'mensagens é obrigatório' });

  // Injeta contexto do usuário logado se disponível
  let systemFinal = CHAT_SYSTEM_PROMPT;
  if (contexto && typeof contexto === 'string') {
    systemFinal += `\n\n## Contexto do usuário atual\n${contexto}`;
  }

  // Busca contexto técnico no banco de conhecimento com base na última mensagem do usuário
  const ultimaMensagem = [...mensagens].reverse().find(m => m.role === 'user');
  if (ultimaMensagem) {
    const ctxConhecimento = await buscarContextoConhecimento(ultimaMensagem.content);
    if (ctxConhecimento) systemFinal += ctxConhecimento;
  }

  try {
    const response = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemFinal,
      messages: mensagens.map(m => ({ role: m.role, content: m.content }))
    });
    res.json({ success: true, resposta: response.content.find(b => b.type === 'text')?.text || '' });
  } catch (err) {
    console.error('Chat IA error:', err.message);
    res.status(502).json({ success: false, error: 'Erro ao conectar com a IA.' });
  }
});

// ============================================
// CONVITES VIP
// ============================================

// Gerar link de convite (usuário autenticado)
app.post('/api/convites', auth, async (req, res) => {
  const { usos_max = 1, dias_validade = 30 } = req.body;
  const token = crypto.randomUUID();
  const criadorId = req.user.fiadorId || req.user.email;

  // Busca nome do criador
  let criadorNome = req.user.nomeProfissional || req.user.email;
  if (req.user.fiadorId) {
    const { rows } = await query('SELECT nome FROM fiadores WHERE id=$1', [req.user.fiadorId]);
    if (rows.length) criadorNome = rows[0].nome;
  }

  await query(
    `INSERT INTO convites (token, criador_id, criador_nome, usos_max, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + ($5 || ' days')::INTERVAL)`,
    [token, criadorId, criadorNome, Math.min(parseInt(usos_max) || 1, 100), parseInt(dias_validade) || 30]
  );

  const link = `${process.env.FRONTEND_URL || 'https://imoveli-completo.vercel.app'}/convite.html?token=${token}`;
  res.json({ success: true, token, link, expiresEm: `${dias_validade} dias`, usosMax: usos_max });
});

// Validar token de convite (público)
app.get('/api/convites/:token', async (req, res) => {
  const { rows } = await query(
    `SELECT token, criador_nome, usos_max, usos_atual, expires_at FROM convites WHERE token=$1`,
    [req.params.token]
  );
  if (!rows.length) return res.status(404).json({ success: false, error: 'Convite não encontrado.' });
  const c = rows[0];
  if (new Date(c.expires_at) < new Date()) return res.status(410).json({ success: false, error: 'Este convite expirou.' });
  if (c.usos_atual >= c.usos_max) return res.status(410).json({ success: false, error: 'Este convite já atingiu o limite de usos.' });
  res.json({ success: true, criadorNome: c.criador_nome, usosRestantes: c.usos_max - c.usos_atual, expiresAt: c.expires_at });
});

// Usar convite — cadastro + entrada na rede
app.post('/api/convites/:token/usar', async (req, res) => {
  const { nome, email, telefone, profissao, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ success: false, error: 'Nome, email e senha são obrigatórios.' });
  if (!EMAIL_REGEX.test(email)) return res.status(400).json({ success: false, error: 'Email inválido.' });
  if (senha.length < 6) return res.status(400).json({ success: false, error: 'Senha mínima de 6 caracteres.' });

  // Valida token
  const { rows: conv } = await query(
    `SELECT * FROM convites WHERE token=$1 AND expires_at > NOW() AND usos_atual < usos_max`,
    [req.params.token]
  );
  if (!conv.length) return res.status(410).json({ success: false, error: 'Convite inválido ou expirado.' });

  // Verifica se email já existe
  const { rows: existe } = await query('SELECT id FROM contas WHERE email=$1', [email]);
  if (existe.length) return res.status(409).json({ success: false, error: 'Este email já está cadastrado. Faça login.' });

  // Cria conta confirmada (sem precisar de verificação por email — o convite é o fator de confiança)
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(senha).digest('hex');

  await query(
    `INSERT INTO contas (email, nome_profissional, senha_hash, senha_salt, confirmado)
     VALUES ($1, $2, $3, $4, TRUE)`,
    [email.toLowerCase(), nome, hash, salt]
  );

  // Registra uso do convite
  await query(`UPDATE convites SET usos_atual = usos_atual + 1 WHERE token=$1`, [req.params.token]);

  // Gera token JWT
  const token = signToken({ email: email.toLowerCase(), nomeProfissional: nome, fiadorId: null });

  console.log(`🎟️  Convite usado: ${email} via token ${req.params.token} (criado por ${conv[0].criador_nome})`);
  res.json({
    success: true,
    token,
    mensagem: `Bem-vindo(a) à IMOVELI, ${nome}! Você já faz parte da rede. Complete seu perfil para aparecer nas buscas.`,
    usuario: { email: email.toLowerCase(), nome, profissao: profissao || '', telefone: telefone || '' }
  });
});

// Listar convites do usuário logado
app.get('/api/meus-convites', auth, async (req, res) => {
  const criadorId = req.user.fiadorId || req.user.email;
  const { rows } = await query(
    `SELECT token, usos_max, usos_atual, expires_at, created_at FROM convites WHERE criador_id=$1 ORDER BY created_at DESC`,
    [criadorId]
  );
  const baseUrl = process.env.FRONTEND_URL || 'https://imoveli-completo.vercel.app';
  res.json({
    success: true,
    convites: rows.map(c => ({
      token: c.token,
      link: `${baseUrl}/convite.html?token=${c.token}`,
      usosMax: c.usos_max,
      usosAtual: c.usos_atual,
      expiresAt: c.expires_at,
      createdAt: c.created_at,
      status: new Date(c.expires_at) < new Date() ? 'expirado' : c.usos_atual >= c.usos_max ? 'esgotado' : 'ativo'
    }))
  });
});

// Listar / buscar base de conhecimento
app.get('/api/base-conhecimento', async (req, res) => {
  const { q, categoria } = req.query;
  let sql = `SELECT id, categoria, titulo, numero, descricao, tags, vigente, fonte_url FROM base_conhecimento WHERE vigente = TRUE`;
  const params = [];
  if (categoria) { params.push(categoria); sql += ` AND categoria ILIKE $${params.length}`; }
  if (q) {
    params.push(`%${q}%`);
    sql += ` AND (titulo ILIKE $${params.length} OR numero ILIKE $${params.length} OR descricao ILIKE $${params.length})`;
  }
  sql += ` ORDER BY categoria, titulo LIMIT 100`;
  const { rows } = await query(sql, params);
  res.json({ success: true, total: rows.length, itens: rows });
});

// ============================================
// HEALTH
// ============================================

app.get('/api/health', async (req, res) => {
  const { rows } = await query('SELECT COUNT(*) FROM fiadores');
  res.json({ status: 'OK', version: '2.0.0', db: 'postgresql', fiadores: parseInt(rows[0].count) });
});

// ============================================
// HELPERS DE SERIALIZAÇÃO
// ============================================

function rowToFiador(r) {
  return { id: r.id, nome: r.nome, email: r.email, conselho: r.conselho, uf: r.uf, registro: r.registro, carteirinha: r.carteirinha, status: r.status, motivo: r.motivo, fonte: r.fonte, bio: r.bio, skills: r.skills, areasInteresse: r.areas_interesse, servicosOferecidos: r.servicos_oferecidos, acervo: r.acervo, mural: r.mural, avaliacoesExternas: r.avaliacoes_externas, localizacao: r.localizacao, faixaPreco: r.faixa_preco, createdAt: r.created_at };
}

function rowToPrestador(r) {
  return { id: r.id, nome: r.nome, telefone: r.telefone, especialidade: r.especialidade, carteirinha: r.carteirinha, status: r.status, bio: r.bio, skills: r.skills, areasInteresse: r.areas_interesse, servicosOferecidos: r.servicos_oferecidos, acervo: r.acervo, mural: r.mural, avaliacoesExternas: r.avaliacoes_externas, localizacao: r.localizacao, faixaPreco: r.faixa_preco, createdAt: r.created_at };
}

// ============================================
// ERROR HANDLER + START
// ============================================

app.use((err, req, res, next) => {
  console.error('Request error:', err.message);
  res.status(400).json({ success: false, error: err.message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint não encontrado' });
});

const PORT = process.env.PORT || 3001;

async function runMigrations() {
  const fs = require('fs');
  const path = require('path');
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) return;
  try {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await query(sql);
    console.log('🗄️  Schema aplicado com sucesso.');
  } catch (err) {
    console.error('⚠️  Erro ao aplicar schema (pode já existir):', err.message);
  }
  // Migrações incrementais — ADD COLUMN IF NOT EXISTS é idempotente
  const alterations = [
    `ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS email TEXT`,
    `ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS cidade TEXT`,
    `ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS estado TEXT`,
    // Base de conhecimento para o chatbot
    `CREATE TABLE IF NOT EXISTS base_conhecimento (
      id SERIAL PRIMARY KEY,
      categoria TEXT NOT NULL,
      titulo TEXT NOT NULL,
      numero TEXT,
      descricao TEXT NOT NULL,
      conteudo TEXT NOT NULL,
      tags TEXT[],
      vigente BOOLEAN DEFAULT TRUE,
      fonte_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_bk_categoria ON base_conhecimento(categoria)`,
    `CREATE INDEX IF NOT EXISTS idx_bk_vigente ON base_conhecimento(vigente)`,
    // Convites VIP
    `CREATE TABLE IF NOT EXISTS convites (
      token       TEXT PRIMARY KEY,
      criador_id  TEXT,
      criador_nome TEXT,
      usos_max    INTEGER DEFAULT 1,
      usos_atual  INTEGER DEFAULT 0,
      expires_at  TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_convites_criador ON convites(criador_id)`,
  ];
  for (const sql of alterations) {
    try { await query(sql); } catch (err) { console.error('⚠️  Migration:', err.message); }
  }
}

async function seedConhecimentoSeVazio() {
  try {
    const { rows } = await query('SELECT COUNT(*) FROM base_conhecimento');
    if (parseInt(rows[0].count) > 0) return; // já populado

    const dados = require('./seed-conhecimento-data.js');
    let n = 0;
    for (const k of dados) {
      const tags = k.tags ? `{${k.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}';
      await query(
        `INSERT INTO base_conhecimento (categoria, titulo, numero, descricao, conteudo, tags, vigente, fonte_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [k.categoria, k.titulo, k.numero || null, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null]
      );
      n++;
    }
    console.log(`📚 Base de conhecimento: ${n} registros inseridos.`);
  } catch (err) {
    console.error('⚠️  Seed conhecimento:', err.message);
  }
}

testConnection().then(async ok => {
  if (!ok) { console.error('❌ Abortando: sem conexão com PostgreSQL'); process.exit(1); }
  await runMigrations();
  await seedConhecimentoSeVazio();
  app.listen(PORT, () => {
    console.log(`✅ IMOVELI Backend (PostgreSQL) rodando em http://localhost:${PORT}`);
    console.log(`🗄️  Banco: ${process.env.DATABASE_URL ? 'Railway' : (process.env.PG_DATABASE || 'imoveli')}`);
    console.log(`🏗️  Endpoints prontos para uso`);
  });
});

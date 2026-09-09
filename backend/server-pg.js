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

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || null;

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET não configurado no .env'); })();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function gerarSlug(nome) {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-') || 'profissional';
}

async function resolverSlugUnico(base) {
  let slug = base;
  let n = 1;
  while (true) {
    const { rows } = await query(
      `SELECT 1 FROM fiadores WHERE slug=$1 UNION ALL SELECT 1 FROM prestadores WHERE slug=$1 LIMIT 1`,
      [slug]
    );
    if (!rows.length) return slug;
    slug = `${base}-${n++}`;
  }
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

  const { lgpdConsent } = req.body;
  if (!lgpdConsent) return res.status(400).json({ success: false, error: 'É necessário aceitar a Política de Privacidade para criar uma conta.' });
  const lgpdAt = new Date();

  if (existing.rows.length) {
    await query(
      `UPDATE contas SET telefone=$1, nome_profissional=$2, senha_hash=$3, senha_salt=$4, confirmado=false, codigo_confirmacao=$5, lgpd_consent_at=$6 WHERE email=$7`,
      [telefone, nomeProfissional.trim(), hash, salt, codigo, lgpdAt, emailNorm]
    );
  } else {
    await query(
      `INSERT INTO contas (email, telefone, nome_profissional, senha_hash, senha_salt, confirmado, codigo_confirmacao, lgpd_consent_at) VALUES ($1,$2,$3,$4,$5,false,$6,$7)`,
      [emailNorm, telefone, nomeProfissional.trim(), hash, salt, codigo, lgpdAt]
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

// ---- ESQUECI MINHA SENHA ----

app.post('/api/auth/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, error: 'Email inválido' });
  }
  const emailNorm = email.trim().toLowerCase();
  const { rows } = await query('SELECT id, nome_profissional FROM contas WHERE email=$1 AND confirmado=true', [emailNorm]);

  if (rows.length) {
    const token = crypto.randomUUID();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await query(
      'UPDATE contas SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3',
      [token, expiry.toISOString(), emailNorm]
    );
    const frontendUrl = process.env.FRONTEND_URL || 'https://imoveli.vercel.app';
    const link = `${frontendUrl}/redefinir-senha.html?token=${token}`;
    await enviarEmail({
      to: emailNorm,
      subject: 'Redefinição de senha — IMOVELI',
      html: `<p>Olá, ${rows[0].nome_profissional}!</p>
<p>Clique no link abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
<p><a href="${link}" style="background:#6d4fc2;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Redefinir minha senha</a></p>
<p>Se não foi você, ignore este email.</p>
<p>— Equipe IMOVELI</p>`,
      textoSimulado: `Link de redefinição: ${link}`
    });
  }
  // Sempre retorna sucesso para não vazar se o email existe
  res.json({ success: true, mensagem: 'Se o email estiver cadastrado, você receberá um link em breve.' });
});

app.post('/api/auth/redefinir-senha', async (req, res) => {
  const { token, nova_senha } = req.body;
  if (!token || !nova_senha || nova_senha.length < 6) {
    return res.status(400).json({ success: false, error: 'Token e nova senha (mín. 6 caracteres) são obrigatórios' });
  }
  const { rows } = await query(
    'SELECT email FROM contas WHERE reset_token=$1 AND reset_token_expiry > NOW()',
    [token]
  );
  if (!rows.length) {
    return res.status(400).json({ success: false, error: 'Link inválido ou expirado. Solicite um novo.' });
  }
  const { hash, salt } = hashSenha(nova_senha);
  await query(
    'UPDATE contas SET senha_hash=$1, senha_salt=$2, reset_token=NULL, reset_token_expiry=NULL WHERE email=$3',
    [hash, salt, rows[0].email]
  );
  res.json({ success: true, mensagem: 'Senha redefinida com sucesso! Faça login com sua nova senha.' });
});

// Verifica token e retorna dados do usuário logado
app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await query(
    'SELECT email, telefone, nome_profissional, fiador_id, platform_id, api_consent FROM contas WHERE email=$1',
    [req.user.email]
  );
  if (!rows.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  const c = rows[0];
  res.json({ success: true, conta: {
    email: c.email, telefone: c.telefone, nomeProfissional: c.nome_profissional,
    fiadorId: c.fiador_id, platformId: c.platform_id, apiConsent: c.api_consent
  }});
});

// Toggle de consentimento de compartilhamento via API (LGPD)
app.patch('/api/auth/api-consent', auth, async (req, res) => {
  const { consent } = req.body;
  if (typeof consent !== 'boolean') return res.status(400).json({ success: false, error: 'consent deve ser boolean' });
  await query(
    'UPDATE contas SET api_consent=$1, api_consent_at=$2 WHERE email=$3',
    [consent, consent ? new Date() : null, req.user.email]
  );
  res.json({ success: true, apiConsent: consent });
});

// LGPD — exportação de dados do usuário
app.get('/api/auth/meus-dados', auth, async (req, res) => {
  const { rows: conta } = await query(
    `SELECT email, telefone, nome_profissional, platform_id, api_consent, api_consent_at,
            lgpd_consent_at, exclusao_solicitada_at, exclusao_motivo, created_at
     FROM contas WHERE email=$1`,
    [req.user.email]
  );
  if (!conta.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  const c = conta[0];

  const { rows: fiador } = await query(
    `SELECT nome, conselho, uf, registro, bio, skills, areas, servicos, status, slug FROM fiadores WHERE id=$1`,
    [c.fiador_id || 0]
  ).catch(() => ({ rows: [] }));

  const { rows: servicos } = await query(
    `SELECT titulo, descricao, preco, status, created_at FROM servicos WHERE conta_id=(SELECT id FROM contas WHERE email=$1)`,
    [req.user.email]
  ).catch(() => ({ rows: [] }));

  res.json({
    success: true,
    exportadoEm: new Date().toISOString(),
    conta: {
      email: c.email,
      telefone: c.telefone,
      nomeProfissional: c.nome_profissional,
      platformId: c.platform_id,
      consentimentoLGPD: c.lgpd_consent_at,
      consentimentoAPI: c.api_consent_at,
      criadoEm: c.created_at,
      exclusaoSolicitadaEm: c.exclusao_solicitada_at,
      exclusaoMotivo: c.exclusao_motivo,
    },
    perfilProfissional: fiador[0] || null,
    servicos,
  });
});

// LGPD — solicitação de exclusão de conta
app.post('/api/auth/solicitar-exclusao', auth, async (req, res) => {
  const { motivo } = req.body;
  const { rows } = await query('SELECT exclusao_solicitada_at FROM contas WHERE email=$1', [req.user.email]);
  if (!rows.length) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
  if (rows[0].exclusao_solicitada_at) {
    return res.status(409).json({ success: false, error: 'Solicitação de exclusão já registrada.' });
  }
  await query(
    'UPDATE contas SET exclusao_solicitada_at=$1, exclusao_motivo=$2 WHERE email=$3',
    [new Date(), motivo || null, req.user.email]
  );
  res.json({ success: true, mensagem: 'Solicitação registrada. Sua conta será excluída em até 30 dias.' });
});

// Endpoint público — consulta usuário por platform_id (somente dados autorizados)
app.get('/api/usuario/:platformId', async (req, res) => {
  const { platformId } = req.params;
  const { rows } = await query(
    `SELECT c.platform_id, c.nome_profissional, c.api_consent,
            f.id as fiador_id, f.nome as fiador_nome, f.conselho, f.uf, f.registro,
            f.status as fiador_status, f.slug as fiador_slug, f.platform_id as fiador_platform_id,
            f.bio, f.skills, f.areas, f.servicos
     FROM contas c
     LEFT JOIN fiadores f ON f.id = c.fiador_id
     WHERE c.platform_id = $1`,
    [platformId]
  );
  if (!rows.length) return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
  const u = rows[0];
  if (!u.api_consent) {
    return res.status(403).json({
      success: false,
      error: 'Este usuário não autorizou o compartilhamento de dados via API',
      platform_id: platformId
    });
  }
  res.json({
    success: true,
    usuario: {
      platform_id: u.platform_id,
      nome: u.nome_profissional,
      perfil_tipo: u.fiador_id ? 'responsavel_tecnico' : 'usuario',
      responsavel_tecnico: u.fiador_id ? {
        platform_id: u.fiador_platform_id,
        nome: u.fiador_nome,
        conselho: u.conselho,
        uf: u.uf,
        registro: u.registro,
        status: u.fiador_status,
        perfil_publico: `https://imoveli.vercel.app/p/${u.fiador_slug}`,
        bio: u.bio,
        skills: u.skills,
        areas: u.areas,
      } : null,
      fonte: 'IMOVELI Platform',
      consultado_em: new Date().toISOString(),
    }
  });
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
  const slugBase = gerarSlug(nome);
  const slugFinal = await resolverSlugUnico(slugBase);
  const { rows } = await query(
    `INSERT INTO fiadores (id,nome,email,conselho,uf,registro,cpf,carteirinha,status,motivo,fonte,slug) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [id, nome, email, conselho, uf.toUpperCase(), registro, cpf, carteirinha, verification.status, verification.motivo || null, verification.fonte || null, slugFinal]
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

    const slugBasePrest = gerarSlug(nome.trim());
    const slugPrest = await resolverSlugUnico(slugBasePrest);
    const { rows: pRows } = await query(
      `INSERT INTO prestadores
         (id, nome, email, telefone, especialidade, cidade, estado, carteirinha, status, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pendente',$9) RETURNING *`,
      [prestId, nome.trim(), (email || '').trim().toLowerCase() || null,
       telefone.trim(), especialidade.trim(),
       (cidade || '').trim() || null, (estado || '').trim().toUpperCase() || null,
       carteirinha, slugPrest]
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

  const { qualidade, prazo, comunicacao, organizacao, pontualidade, custoBeneficio, comentario } = req.body;
  const criterios = { qualidade, prazo, comunicacao, organizacao, pontualidade, custoBeneficio };
  for (const [k, v] of Object.entries(criterios)) {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5)
      return res.status(400).json({ success: false, error: `Critério "${k}" deve ser 1 a 5` });
    criterios[k] = n;
  }
  const nota = Math.round((Object.values(criterios).reduce((a, b) => a + b, 0) / 6) * 10) / 10;
  const avaliacao = { ...criterios, nota, comentario: comentario || '', assinadoEm: new Date().toISOString() };
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
  const CRITERIOS = ['qualidade','prazo','comunicacao','organizacao','pontualidade','custoBeneficio'];
  const mediasCriterios = {};
  for (const c of CRITERIOS) {
    const vals = avRows.map(s => s.avaliacao[c]).filter(v => typeof v === 'number');
    mediasCriterios[c] = vals.length ? Math.round((vals.reduce((a,b) => a+b, 0) / vals.length) * 10) / 10 : null;
  }

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
      reputacaoVerificada: { totalServicos, mediaNota, ...mediasCriterios },
      avaliacoesVerificadas: avRows.map(s => ({
        descricaoServico: s.descricao,
        nota: s.avaliacao.nota,
        qualidade: s.avaliacao.qualidade || null,
        prazo: s.avaliacao.prazo || null,
        comunicacao: s.avaliacao.comunicacao || null,
        organizacao: s.avaliacao.organizacao || null,
        pontualidade: s.avaliacao.pontualidade || null,
        custoBeneficio: s.avaliacao.custoBeneficio || null,
        comentario: s.avaliacao.comentario,
        data: s.avaliacao.assinadoEm
      })),
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
// MAPA PÚBLICO DE PROFISSIONAIS
// ============================================

app.get('/api/profissionais/mapa', async (req, res) => {
  try {
    const CRIT_SQL = (col) => `
      (SELECT COUNT(*) FROM servicos WHERE ${col} AND avaliacao IS NOT NULL) as total_servicos,
      (SELECT AVG((avaliacao->>'nota')::numeric) FROM servicos WHERE ${col} AND avaliacao IS NOT NULL) as media_nota,
      (SELECT AVG((avaliacao->>'qualidade')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'qualidade' IS NOT NULL) as media_qualidade,
      (SELECT AVG((avaliacao->>'prazo')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'prazo' IS NOT NULL) as media_prazo,
      (SELECT AVG((avaliacao->>'comunicacao')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'comunicacao' IS NOT NULL) as media_comunicacao,
      (SELECT AVG((avaliacao->>'organizacao')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'organizacao' IS NOT NULL) as media_organizacao,
      (SELECT AVG((avaliacao->>'pontualidade')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'pontualidade' IS NOT NULL) as media_pontualidade,
      (SELECT AVG((avaliacao->>'custoBeneficio')::numeric) FROM servicos WHERE ${col} AND avaliacao->>'custoBeneficio' IS NOT NULL) as media_custo_beneficio
    `;
    const { rows: fiadors } = await query(
      `SELECT id, nome, conselho, uf, registro, localizacao, status,
              bio, skills, servicos_oferecidos, faixa_preco,
              ${CRIT_SQL("fiador_id=f.id AND grau=1")}
       FROM fiadores f WHERE status='verificado' AND localizacao IS NOT NULL`
    );
    const { rows: prests } = await query(
      `SELECT p.id, p.nome, p.especialidade, p.localizacao, p.status, p.bio, p.skills, p.faixa_preco,
              f.nome as fiador_nome, f.conselho as fiador_conselho, f.uf as fiador_uf, f.registro as fiador_registro,
              ${CRIT_SQL("prestador_id=p.id")}
       FROM prestadores p
       JOIN indicacoes i ON i.prestador_id=p.id AND i.status='aceita'
       JOIN fiadores f ON f.id=i.fiador_id
       WHERE p.status='ativo' AND p.localizacao IS NOT NULL`
    );

    const arred = v => v ? Math.round(parseFloat(v) * 10) / 10 : null;
    const mapear = (r, grau) => {
      const loc = typeof r.localizacao === 'string' ? JSON.parse(r.localizacao) : r.localizacao;
      if (!loc?.lat || !loc?.lng) return null;
      return {
        id: r.id,
        nome: r.nome,
        especialidade: grau === 1
          ? (r.conselho === 'CAU' ? 'Arquitetura e Urbanismo' : 'Engenharia')
          : r.especialidade,
        grau,
        lat: loc.lat,
        lng: loc.lng,
        cidade: loc.cidade || '',
        uf: loc.uf || r.uf || '',
        bio: r.bio || null,
        skills: r.skills || [],
        faixaPreco: r.faixa_preco || null,
        reputacao: {
          totalServicos: parseInt(r.total_servicos) || 0,
          mediaNota: arred(r.media_nota),
          qualidade: arred(r.media_qualidade),
          prazo: arred(r.media_prazo),
          comunicacao: arred(r.media_comunicacao),
          organizacao: arred(r.media_organizacao),
          pontualidade: arred(r.media_pontualidade),
          custoBeneficio: arred(r.media_custo_beneficio)
        },
        fiador: grau === 2 ? {
          nome: r.fiador_nome,
          conselho: r.fiador_conselho,
          uf: r.fiador_uf,
          registro: r.fiador_registro
        } : null,
        conselho: r.conselho || null,
        registro: r.registro || null
      };
    };

    const profissionais = [
      ...fiadors.map(r => mapear(r, 1)),
      ...prests.map(r => mapear(r, 2))
    ].filter(Boolean);

    res.json({ success: true, total: profissionais.length, profissionais });
  } catch (err) {
    console.error('[GET /profissionais/mapa]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ============================================
// AGENTE DE PRECIFICAÇÃO IA
// ============================================

// Tabela base de referência de preços por tipo de serviço
const TABELA_PRECOS = {
  'pedreiro': { unidade: 'dia', min: 120, max: 220, base: 160, label: 'Pedreiro / Servente' },
  'servente': { unidade: 'dia', min: 80, max: 140, base: 100, label: 'Servente de obras' },
  'eletricista': { unidade: 'dia', min: 150, max: 280, base: 200, label: 'Eletricista' },
  'encanador': { unidade: 'dia', min: 130, max: 250, base: 180, label: 'Encanador / Hidráulico' },
  'pintor': { unidade: 'm²', min: 12, max: 30, base: 18, label: 'Pintor (paredes internas)' },
  'pintura externa': { unidade: 'm²', min: 18, max: 45, base: 28, label: 'Pintura externa / fachada' },
  'gesseiro': { unidade: 'm²', min: 25, max: 60, base: 38, label: 'Gesseiro (forro/revestimento)' },
  'azulejista': { unidade: 'm²', min: 30, max: 70, base: 45, label: 'Assentador cerâmica/azulejo' },
  'carpinteiro': { unidade: 'dia', min: 150, max: 280, base: 200, label: 'Carpinteiro' },
  'serralheiro': { unidade: 'dia', min: 140, max: 260, base: 190, label: 'Serralheiro' },
  'impermeabilização': { unidade: 'm²', min: 40, max: 120, base: 65, label: 'Impermeabilização' },
  'demolição': { unidade: 'm²', min: 30, max: 80, base: 50, label: 'Demolição / retirada entulho' },
  'jardinagem': { unidade: 'dia', min: 90, max: 180, base: 120, label: 'Jardineiro' },
  'projeto arquitetônico': { unidade: 'm²', min: 35, max: 120, base: 65, label: 'Projeto arquitetônico (CAU)' },
  'projeto estrutural': { unidade: 'm²', min: 20, max: 60, base: 35, label: 'Projeto estrutural (CREA)' },
  'projeto hidráulico': { unidade: 'm²', min: 15, max: 40, base: 25, label: 'Projeto hidrossanitário (CREA)' },
  'projeto elétrico': { unidade: 'm²', min: 15, max: 40, base: 25, label: 'Projeto elétrico (CREA)' },
  'laudo técnico': { unidade: 'unidade', min: 800, max: 3500, base: 1500, label: 'Laudo técnico / vistoria (ART)' },
  'reforma completa': { unidade: 'm²', min: 800, max: 2200, base: 1300, label: 'Reforma completa (mão de obra + material)' },
  'reforma mão de obra': { unidade: 'm²', min: 350, max: 900, base: 550, label: 'Reforma (só mão de obra)' },
  'cobertura telhado': { unidade: 'm²', min: 60, max: 180, base: 100, label: 'Cobertura / telhado (mão de obra)' },
  'fundação': { unidade: 'm²', min: 150, max: 400, base: 250, label: 'Fundação / radier (mão de obra)' },
  'alvenaria': { unidade: 'm²', min: 60, max: 140, base: 90, label: 'Alvenaria (mão de obra, sem material)' },
  'forro': { unidade: 'm²', min: 30, max: 80, base: 50, label: 'Forro PVC/drywall (mão de obra)' },
  'piso': { unidade: 'm²', min: 35, max: 90, base: 55, label: 'Assentamento de piso (mão de obra)' },
};

// Multiplicadores regionais por estado
const MULT_REGIONAL = {
  'SP': 1.45, 'RJ': 1.40, 'DF': 1.35, 'SC': 1.20, 'RS': 1.20, 'PR': 1.15,
  'MG': 1.15, 'ES': 1.10, 'GO': 1.05, 'MT': 1.05, 'MS': 1.00,
  'AM': 1.10, 'PA': 0.95, 'AC': 0.90, 'RO': 0.90, 'RR': 0.90, 'AP': 0.90, 'TO': 0.90,
  'BA': 1.00, 'PE': 1.00, 'CE': 0.95, 'MA': 0.88, 'PI': 0.88, 'RN': 0.90, 'PB': 0.90, 'SE': 0.90, 'AL': 0.88,
};

// Multiplicadores de complexidade
const MULT_COMPLEXIDADE = { 'simples': 0.80, 'medio': 1.00, 'complexo': 1.35, 'luxo': 1.80 };

function normalizar(s) {
  // Remove acentos usando mapa explícito — evita problemas de encoding do regex range
  return s.toLowerCase()
    .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i').replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n').replace(/[^a-z0-9\s]/g, ' ').trim();
}

function calcularPrecificacaoBase({ tipoServico, estado, complexidade, areaMq }) {
  const estadoUpper = (estado || 'PE').toUpperCase();
  const multRegional = MULT_REGIONAL[estadoUpper] || 1.0;
  const multComp = MULT_COMPLEXIDADE[complexidade] || 1.0;

  // Busca fuzzy com normalização de acentos
  const tsNorm = normalizar(tipoServico);
  const chave = Object.keys(TABELA_PRECOS).find(k => {
    const kNorm = normalizar(k);
    return tsNorm.includes(kNorm) || kNorm.includes(tsNorm) ||
      kNorm.split(' ').some(w => w.length > 3 && tsNorm.includes(w));
  }) || 'pedreiro';
  const ref = TABELA_PRECOS[chave];

  const fatorTotal = multRegional * multComp;
  const precoMin = Math.round(ref.min * fatorTotal);
  const precoMax = Math.round(ref.max * fatorTotal);
  const precoSugerido = Math.round(ref.base * fatorTotal);

  // Total só faz sentido para serviços por m²
  const temTotal = areaMq && areaMq > 0 && ref.unidade === 'm²';
  return {
    referencia: ref.label,
    unidade: ref.unidade,
    precoMin, precoMax, precoSugerido,
    totalMin: temTotal ? precoMin * areaMq : null,
    totalMax: temTotal ? precoMax * areaMq : null,
    totalSugerido: temTotal ? precoSugerido * areaMq : null,
    multRegional, multComplexidade: multComp,
    estado: estadoUpper
  };
}

app.post('/api/precificacao', async (req, res) => {
  const { tipoServico, estado, cidade, complexidade, areaMq, descricao } = req.body;
  if (!tipoServico) return res.status(400).json({ success: false, error: 'tipoServico é obrigatório' });

  // 1. Cálculo base com tabela de referência (sempre funciona)
  const base = calcularPrecificacaoBase({ tipoServico, estado, complexidade, areaMq: Number(areaMq) || 0 });

  // 2. Busca web para enriquecer com dados de mercado atuais (se Tavily disponível)
  let fonteWeb = null;
  if (TAVILY_API_KEY) {
    const q = `preço ${tipoServico} ${cidade || estado || 'Brasil'} 2025 tabela mercado`;
    const webData = await buscarNaInternet(q);
    if (webData) fonteWeb = webData.ctx.slice(0, 800);
  }

  // 3. IA sintetiza e justifica (se Anthropic disponível)
  let justificativaIA = null;
  if (anthropicClient) {
    try {
      const prompt = `Você é um especialista em precificação de serviços de construção civil no Brasil.

Serviço solicitado: ${tipoServico}
Estado: ${estado || 'não informado'}, Cidade: ${cidade || 'não informada'}
Complexidade: ${complexidade || 'médio'}
Área: ${areaMq ? areaMq + ' m²' : 'não informada'}

Tabela de referência IMOVELI calculou:
- Faixa: R$${base.precoMin} a R$${base.precoMax} por ${base.unidade}
- Sugerido: R$${base.precoSugerido} por ${base.unidade}
- Multiplicador regional: ${base.multRegional}x
${fonteWeb ? '\nDados de mercado encontrados na internet:\n' + fonteWeb : ''}

Gere uma justificativa profissional em 4 a 6 linhas explicando:
1. Por que esse valor é justo para a região
2. O que pode fazer o preço variar para cima ou para baixo
3. Uma referência técnica (tabela de conselho, SINAPI ou prática de mercado)
Responda em português, de forma objetiva e profissional.`;

      const r = await anthropicClient.messages.create({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      });
      justificativaIA = r.content.find(b => b.type === 'text')?.text || null;
    } catch (_) {}
  }

  // Justificativa padrão se IA indisponível
  const justificativa = justificativaIA || `
Valor calculado com base na tabela de referência IMOVELI para ${base.referencia} no estado ${base.estado}.
Multiplicador regional aplicado: ${(base.multRegional * 100).toFixed(0)}% (${base.estado}).
Multiplicador de complexidade: ${(base.multComplexidade * 100).toFixed(0)}% (${complexidade || 'médio'}).
Referências: tabelas CAU-BR, CONFEA/CREA, SINAPI e pesquisa de mercado regional.
Valores podem variar conforme experiência do profissional, materiais inclusos e condições do local.
`.trim();

  res.json({
    success: true,
    tipoServico,
    referencia: base.referencia,
    estado: base.estado,
    cidade: cidade || null,
    complexidade: complexidade || 'medio',
    areaMq: Number(areaMq) || null,
    precos: {
      porUnidade: {
        min: base.precoMin,
        sugerido: base.precoSugerido,
        max: base.precoMax,
        unidade: base.unidade
      },
      total: base.totalSugerido != null ? {
        min: base.totalMin,
        sugerido: base.totalSugerido,
        max: base.totalMax
      } : null
    },
    justificativa,
    fonteWeb: !!fonteWeb,
    justificativaIA: !!justificativaIA
  });
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
6. Respostas entre 3 e 15 linhas, salvo pedido de elaboração.
7. Quando fontes da internet forem fornecidas no contexto, cite-as (ex: "Fonte: [título](url)").`;

// ── BUSCA NA INTERNET (Tavily) ──────────────────────────────────────────────
// Retorna { ctx: string, results: array } ou null
async function buscarNaInternet(pergunta) {
  if (!TAVILY_API_KEY) return null;
  try {
    const resp = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: pergunta,
        search_depth: 'advanced',
        max_results: 6,
        include_answer: true,
        include_domains: [
          'gov.br', 'cau.org.br', 'confea.org.br', 'crea.org.br',
          'ibge.gov.br', 'abnt.org.br', 'cef.gov.br', 'noticias.cef.gov.br',
          'sinduscon.org.br', 'cbic.org.br', 'jusbrasil.com.br', 'planalto.gov.br',
          'caixa.gov.br', 'receita.fazenda.gov.br', 'registrodeimoveis.org.br'
        ]
      }),
      signal: AbortSignal.timeout(9000)
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const results = (data.results || []).filter(r => r.content && r.title);
    if (!results.length && !data.answer) return null;

    let ctx = '\n\n## Pesquisa na Internet (tempo real)\n';
    if (data.answer) ctx += `**Resumo:** ${data.answer}\n\n`;
    ctx += results.slice(0, 4).map(r =>
      `### ${r.title}\n${r.content.slice(0, 700)}\nFonte: ${r.url}`
    ).join('\n\n---\n\n');
    return { ctx, results };
  } catch (err) {
    console.error('Tavily error:', err.message);
    return null;
  }
}

// Auto-aprendizado: salva resultado de busca internet como conhecimento novo
async function aprenderComInternet(pergunta, results) {
  if (!results || !results.length) return;
  try {
    const top = results[0];
    if (!top || !top.content || top.content.length < 120) return;
    // Verifica se já existe artigo similar
    const palavra = pergunta.split(' ').find(w => w.length > 4) || pergunta.slice(0, 20);
    const { rows } = await query(
      `SELECT id FROM base_conhecimento WHERE titulo ILIKE $1 LIMIT 1`,
      [`%${palavra}%`]
    );
    if (rows.length) return;
    await query(
      `INSERT INTO base_conhecimento (categoria, titulo, descricao, conteudo, fonte_url, tags, tsv)
       VALUES ($1,$2,$3,$4,$5,$6, to_tsvector('portuguese', $2 || ' ' || $3 || ' ' || $4))`,
      [
        'Pesquisa Web',
        top.title.slice(0, 200),
        `Pesquisa automática: ${pergunta.slice(0, 200)}`,
        top.content.slice(0, 2000),
        top.url,
        '{web,auto}'
      ]
    );
  } catch (_) {}
}

// Busca contexto técnico relevante — full-text search (português) + fallback ILIKE
async function buscarContextoConhecimento(pergunta) {
  try {
    let rows = [];

    // 1. Full-text search com ranking
    const palavras = pergunta
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2)
      .slice(0, 10);

    if (palavras.length) {
      const tsq = palavras.join(' | ');
      try {
        const r = await query(
          `SELECT titulo, numero, categoria, conteudo,
                  ts_rank(tsv, to_tsquery('portuguese', $1)) AS rank
           FROM base_conhecimento
           WHERE vigente = TRUE AND tsv @@ to_tsquery('portuguese', $1)
           ORDER BY rank DESC LIMIT 5`,
          [tsq]
        );
        rows = r.rows;
      } catch (_) {} // fallback se tsq inválido
    }

    // 2. Fallback ILIKE se FTS não retornou nada
    if (!rows.length) {
      const termos = pergunta.toLowerCase()
        .replace(/[^a-záéíóúãõâêîôûàèìòùç\s0-9\-\/]/gi, ' ')
        .split(/\s+/).filter(t => t.length > 3).slice(0, 6);
      if (termos.length) {
        const cond = termos.map((_, i) =>
          `(titulo ILIKE $${i+1} OR descricao ILIKE $${i+1} OR conteudo ILIKE $${i+1} OR numero ILIKE $${i+1})`
        ).join(' OR ');
        const r = await query(
          `SELECT titulo, numero, categoria, conteudo FROM base_conhecimento
           WHERE vigente=TRUE AND (${cond}) LIMIT 5`,
          termos.map(t => `%${t}%`)
        );
        rows = r.rows;
      }
    }

    if (!rows.length) return '';
    return '\n\n## Base de Conhecimento Técnico\n\n' +
      rows.map(r => `### ${r.titulo}${r.numero ? ` — ${r.numero}` : ''}\n${r.conteudo}`).join('\n\n---\n\n');
  } catch (err) {
    console.error('Erro buscar conhecimento:', err.message);
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

  const ultimaMensagem = [...mensagens].reverse().find(m => m.role === 'user');
  if (ultimaMensagem) {
    const [ctxLocal, webData] = await Promise.all([
      buscarContextoConhecimento(ultimaMensagem.content),
      buscarNaInternet(ultimaMensagem.content)
    ]);
    if (ctxLocal) systemFinal += ctxLocal;
    if (webData) systemFinal += webData.ctx;
  }

  try {
    const response = await anthropicClient.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      system: systemFinal,
      messages: mensagens.map(m => ({ role: m.role, content: m.content }))
    });
    res.json({ success: true, resposta: response.content.find(b => b.type === 'text')?.text || '' });
  } catch (err) {
    console.error('Chat IA error:', err.message);
    res.status(502).json({ success: false, error: 'Erro ao conectar com a IA.' });
  }
});

// Streaming via SSE
app.post('/api/chat/stream', authOptional, async (req, res) => {
  if (!anthropicClient) {
    res.status(503).json({ success: false, error: 'Chatbot indisponível' });
    return;
  }
  const { mensagens, contexto, sessao_id } = req.body;
  if (!Array.isArray(mensagens) || !mensagens.length) {
    res.status(400).json({ error: 'mensagens obrigatório' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let systemFinal = CHAT_SYSTEM_PROMPT;
  if (contexto) systemFinal += `\n\n## Contexto do usuário\n${contexto}`;
  const ultimaMensagem = [...mensagens].reverse().find(m => m.role === 'user');
  let webResults = null;
  if (ultimaMensagem) {
    const [ctxLocal, webData] = await Promise.all([
      buscarContextoConhecimento(ultimaMensagem.content),
      buscarNaInternet(ultimaMensagem.content)
    ]);
    if (ctxLocal) systemFinal += ctxLocal;
    if (webData) { systemFinal += webData.ctx; webResults = webData.results; }
  }

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  try {
    let fullText = '';
    const stream = anthropicClient.messages.stream({
      model: 'claude-sonnet-5',
      max_tokens: 4096,
      system: systemFinal,
      messages: mensagens.map(m => ({ role: m.role, content: m.content }))
    });

    stream.on('text', (text) => { fullText += text; send({ type: 'text', text }); });
    stream.on('finalMessage', async () => {
      send({ type: 'done', sources: (webResults || []).map(r => ({ title: r.title, url: r.url })) });
      res.end();
      // Persistir mensagens na sessão
      if (sessao_id && fullText && ultimaMensagem) {
        try {
          await query('INSERT INTO chat_mensagens (sessao_id, role, content) VALUES ($1,$2,$3)', [sessao_id, 'user', ultimaMensagem.content]);
          await query('INSERT INTO chat_mensagens (sessao_id, role, content) VALUES ($1,$2,$3)', [sessao_id, 'assistant', fullText]);
          await query('UPDATE chat_sessoes SET atualizada_em=NOW(), titulo=COALESCE(NULLIF(titulo,\'\'), $2) WHERE id=$1', [sessao_id, ultimaMensagem.content.slice(0, 80)]);
        } catch (e) { console.error('Persist chat:', e.message); }
      }
      // Auto-aprendizado: se buscou na internet, tenta salvar novo conhecimento
      if (webResults && ultimaMensagem) {
        setImmediate(() => aprenderComInternet(ultimaMensagem.content, webResults));
      }
    });
    stream.on('error', (err) => { send({ type: 'error', error: err.message }); res.end(); });
  } catch (err) {
    send({ type: 'error', error: 'Erro na IA' });
    res.end();
  }
});

// Sessões de chat
app.post('/api/chat/sessoes', authOptional, async (req, res) => {
  const email = req.user?.email || null;
  const { rows } = await query(
    'INSERT INTO chat_sessoes (email) VALUES ($1) RETURNING id', [email]
  );
  res.json({ success: true, sessao_id: rows[0].id });
});

app.get('/api/chat/sessoes', auth, async (req, res) => {
  const { rows } = await query(
    'SELECT id, titulo, criada_em, atualizada_em FROM chat_sessoes WHERE email=$1 ORDER BY atualizada_em DESC LIMIT 30',
    [req.user.email]
  );
  res.json({ success: true, sessoes: rows });
});

app.get('/api/chat/sessoes/:id', auth, async (req, res) => {
  const { rows } = await query(
    'SELECT role, content, criada_em FROM chat_mensagens WHERE sessao_id=$1 ORDER BY criada_em ASC',
    [req.params.id]
  );
  res.json({ success: true, mensagens: rows });
});

// Gestão da base de conhecimento (admin: só RT autenticado por ora)
app.get('/api/conhecimento', async (req, res) => {
  const { rows } = await query(
    'SELECT id, categoria, titulo, numero, descricao, tags, vigente, fonte_url FROM base_conhecimento ORDER BY categoria, titulo'
  );
  res.json({ success: true, total: rows.length, itens: rows });
});

app.post('/api/conhecimento', auth, async (req, res) => {
  const { categoria, titulo, numero, descricao, conteudo, tags, fonte_url } = req.body;
  if (!categoria || !titulo || !descricao || !conteudo) {
    return res.status(400).json({ success: false, error: 'categoria, titulo, descricao e conteudo são obrigatórios' });
  }
  const tagsArr = Array.isArray(tags) ? `{${tags.map(t => `"${t.replace(/"/g,'')}"`)}}` : '{}';
  const tsv = `to_tsvector('portuguese', $1 || ' ' || $2 || ' ' || $3 || ' ' || COALESCE($4,''))`;
  const { rows } = await query(
    `INSERT INTO base_conhecimento (categoria, titulo, numero, descricao, conteudo, tags, fonte_url, tsv)
     VALUES ($1,$2,$3,$4,$5,$6,$7, to_tsvector('portuguese', $2 || ' ' || $4 || ' ' || $5 || ' ' || COALESCE($3,'')))
     RETURNING id`,
    [categoria, titulo, numero || null, descricao, conteudo, tagsArr, fonte_url || null]
  );
  res.json({ success: true, id: rows[0].id });
});

app.put('/api/conhecimento/:id', auth, async (req, res) => {
  const { categoria, titulo, numero, descricao, conteudo, tags, vigente, fonte_url } = req.body;
  const tagsArr = Array.isArray(tags) ? `{${tags.map(t => `"${t.replace(/"/g,'')}"`)}}` : '{}';
  await query(
    `UPDATE base_conhecimento SET categoria=$1, titulo=$2, numero=$3, descricao=$4, conteudo=$5, tags=$6,
     vigente=$7, fonte_url=$8, tsv=to_tsvector('portuguese', $2 || ' ' || $4 || ' ' || $5 || ' ' || COALESCE($3,''))
     WHERE id=$9`,
    [categoria, titulo, numero || null, descricao, conteudo, tagsArr, vigente !== false, fonte_url || null, req.params.id]
  );
  res.json({ success: true });
});

app.delete('/api/conhecimento/:id', auth, async (req, res) => {
  await query('DELETE FROM base_conhecimento WHERE id=$1', [req.params.id]);
  res.json({ success: true });
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

  const link = `${process.env.FRONTEND_URL || 'https://imoveli.vercel.app'}/convite.html?token=${token}`;
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
  const baseUrl = process.env.FRONTEND_URL || 'https://imoveli.vercel.app';
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
// PERFIL PÚBLICO (sem autenticação)
// ============================================

app.get('/api/profissional-publico/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    if (!['fiador', 'prestador'].includes(tipo)) {
      return res.status(400).json({ success: false, error: 'Tipo inválido' });
    }

    const CRIT_COL = tipo === 'fiador' ? 'fiador_id' : 'prestador_id';
    const tabela = tipo === 'fiador' ? 'fiadores' : 'prestadores';

    const { rows } = await query(
      `SELECT * FROM ${tabela} WHERE id=$1`, [id]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
    const r = rows[0];

    // Calcula médias por critério
    const { rows: av } = await query(
      `SELECT
        COUNT(*) as total,
        AVG((avaliacao->>'nota')::numeric) as media_nota,
        AVG((avaliacao->>'qualidade')::numeric) as media_qualidade,
        AVG((avaliacao->>'prazo')::numeric) as media_prazo,
        AVG((avaliacao->>'comunicacao')::numeric) as media_comunicacao,
        AVG((avaliacao->>'organizacao')::numeric) as media_organizacao,
        AVG((avaliacao->>'pontualidade')::numeric) as media_pontualidade,
        AVG((avaliacao->>'custoBeneficio')::numeric) as media_custo_beneficio
       FROM servicos WHERE ${CRIT_COL}=$1 AND avaliacao IS NOT NULL`,
      [id]
    );
    const arred = v => v ? Math.round(parseFloat(v) * 10) / 10 : null;
    const av0 = av[0] || {};
    const reputacao = {
      totalServicos: parseInt(av0.total) || 0,
      mediaNota: arred(av0.media_nota),
      qualidade: arred(av0.media_qualidade),
      prazo: arred(av0.media_prazo),
      comunicacao: arred(av0.media_comunicacao),
      organizacao: arred(av0.media_organizacao),
      pontualidade: arred(av0.media_pontualidade),
      custoBeneficio: arred(av0.media_custo_beneficio)
    };

    // Serviços concluídos públicos (portfolio)
    const { rows: servicos } = await query(
      `SELECT id, descricao, categoria, status, fotos_antes, fotos_depois, avaliacao, data_conclusao
       FROM servicos WHERE ${CRIT_COL}=$1 AND status='concluido'
       ORDER BY data_conclusao DESC LIMIT 12`,
      [id]
    );

    // Se prestador, busca fiador responsável
    let fiador = null;
    if (tipo === 'prestador') {
      const { rows: ind } = await query(
        `SELECT f.id, f.nome, f.conselho, f.uf, f.registro FROM indicacoes i
         JOIN fiadores f ON f.id=i.fiador_id
         WHERE i.prestador_id=$1 AND i.status='aceita' LIMIT 1`,
        [id]
      );
      if (ind.length) fiador = ind[0];
    }

    const serializado = tipo === 'fiador' ? rowToFiador(r) : rowToPrestador(r);
    res.json({ success: true, profissional: { ...serializado, reputacao, servicos, fiador } });
  } catch (err) {
    console.error('[GET /profissional-publico]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

app.get('/api/p/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let tipo = null;
    let row = null;

    const { rows: fRows } = await query(`SELECT * FROM fiadores WHERE slug=$1`, [slug]);
    if (fRows.length) { tipo = 'fiador'; row = fRows[0]; }

    if (!row) {
      const { rows: pRows } = await query(`SELECT * FROM prestadores WHERE slug=$1`, [slug]);
      if (pRows.length) { tipo = 'prestador'; row = pRows[0]; }
    }

    if (!row) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });

    const id = row.id;
    const CRIT_COL = tipo === 'fiador' ? 'fiador_id' : 'prestador_id';

    const { rows: av } = await query(
      `SELECT COUNT(*) as total,
        AVG((avaliacao->>'nota')::numeric) as media_nota,
        AVG((avaliacao->>'qualidade')::numeric) as media_qualidade,
        AVG((avaliacao->>'prazo')::numeric) as media_prazo,
        AVG((avaliacao->>'comunicacao')::numeric) as media_comunicacao,
        AVG((avaliacao->>'organizacao')::numeric) as media_organizacao,
        AVG((avaliacao->>'pontualidade')::numeric) as media_pontualidade,
        AVG((avaliacao->>'custoBeneficio')::numeric) as media_custo_beneficio
       FROM servicos WHERE ${CRIT_COL}=$1 AND avaliacao IS NOT NULL`, [id]
    );
    const arred = v => v ? Math.round(parseFloat(v) * 10) / 10 : null;
    const av0 = av[0] || {};
    const reputacao = {
      totalServicos: parseInt(av0.total) || 0,
      mediaNota: arred(av0.media_nota),
      qualidade: arred(av0.media_qualidade),
      prazo: arred(av0.media_prazo),
      comunicacao: arred(av0.media_comunicacao),
      organizacao: arred(av0.media_organizacao),
      pontualidade: arred(av0.media_pontualidade),
      custoBeneficio: arred(av0.media_custo_beneficio)
    };

    const { rows: servicos } = await query(
      `SELECT id, descricao, categoria, status, fotos_antes, fotos_depois, avaliacao, data_conclusao
       FROM servicos WHERE ${CRIT_COL}=$1 AND status='concluido'
       ORDER BY data_conclusao DESC LIMIT 12`, [id]
    );

    let fiador = null;
    if (tipo === 'prestador') {
      const { rows: ind } = await query(
        `SELECT f.id, f.nome, f.conselho, f.uf, f.registro FROM indicacoes i
         JOIN fiadores f ON f.id=i.fiador_id
         WHERE i.prestador_id=$1 AND i.status='aceita' LIMIT 1`, [id]
      );
      if (ind.length) fiador = ind[0];
    }

    const serializado = tipo === 'fiador' ? rowToFiador(row) : rowToPrestador(row);
    res.json({ success: true, profissional: { ...serializado, tipo, reputacao, servicos, fiador } });
  } catch (err) {
    console.error('[GET /api/p/:slug]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ============================================
// CONTRATOS (CONTRATAÇÃO DIRETA)
// ============================================

app.post('/api/contratos', auth, async (req, res) => {
  try {
    const { profissionalTipo, profissionalId, escopo, quantidade, metrosQuadrados, prazo, valorServico } = req.body;

    if (!profissionalTipo || !profissionalId || !escopo?.trim() || !valorServico) {
      return res.status(400).json({ success: false, error: 'profissionalTipo, profissionalId, escopo e valorServico são obrigatórios' });
    }
    if (!['fiador', 'prestador'].includes(profissionalTipo)) {
      return res.status(400).json({ success: false, error: 'Tipo inválido' });
    }
    const vServico = Number(valorServico);
    if (isNaN(vServico) || vServico <= 0) {
      return res.status(400).json({ success: false, error: 'Valor do serviço inválido' });
    }

    // Busca nome do profissional
    const tabela = profissionalTipo === 'fiador' ? 'fiadores' : 'prestadores';
    const { rows: prof } = await query(`SELECT nome, status FROM ${tabela} WHERE id=$1`, [profissionalId]);
    if (!prof.length) return res.status(404).json({ success: false, error: 'Profissional não encontrado' });
    if (prof[0].status !== 'verificado' && prof[0].status !== 'ativo') {
      return res.status(400).json({ success: false, error: 'Profissional não está disponível' });
    }

    const taxaPlataforma = Math.round(vServico * 0.10 * 100) / 100;
    const valorTotal     = Math.round((vServico + taxaPlataforma) * 100) / 100;
    const id = 'contrato_' + Date.now();

    const { rows } = await query(
      `INSERT INTO contratos
         (id, cliente_email, profissional_tipo, profissional_id, profissional_nome,
          escopo, quantidade, metros_quadrados, prazo, valor_servico, taxa_plataforma, valor_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, req.user.email, profissionalTipo, profissionalId, prof[0].nome,
       escopo.trim(), quantidade || null, metrosQuadrados || null,
       prazo || 'medio', vServico, taxaPlataforma, valorTotal]
    );

    res.json({ success: true, contrato: rows[0] });
  } catch (err) {
    console.error('[POST /contratos]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao criar contrato' });
  }
});

app.get('/api/meus-contratos', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM contratos WHERE cliente_email=$1 ORDER BY created_at DESC`,
      [req.user.email]
    );
    res.json({ success: true, contratos: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

app.get('/api/contratos/:id', auth, async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM contratos WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Contrato não encontrado' });
    const c = rows[0];
    if (c.cliente_email !== req.user.email && req.user.fiadorId !== c.profissional_id) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    res.json({ success: true, contrato: c });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Criar preferência de pagamento real no Mercado Pago (Checkout Pro)
app.post('/api/contratos/:id/criar-pagamento', auth, async (req, res) => {
  try {
    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) return res.status(503).json({ success: false, error: 'Pagamento não configurado. Contate o suporte.' });

    const { rows } = await query(`SELECT * FROM contratos WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Contrato não encontrado' });
    const c = rows[0];
    if (c.cliente_email !== req.user.email) return res.status(403).json({ success: false, error: 'Acesso negado' });
    if (c.status !== 'aguardando_pagamento') {
      return res.status(400).json({ success: false, error: 'Contrato já processado' });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://imoveli.vercel.app';
    const BACKEND_URL  = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : 'https://imoveli-backend-production.up.railway.app';

    const body = {
      items: [{
        id: c.id,
        title: `Serviço IMOVELI — ${c.profissional_nome}`,
        description: c.escopo.slice(0, 255),
        quantity: 1,
        unit_price: parseFloat(c.valor_total),
        currency_id: 'BRL'
      }],
      payer: { email: c.cliente_email },
      external_reference: c.id,
      notification_url: `${BACKEND_URL}/api/pagamento/webhook`,
      back_urls: {
        success: `${FRONTEND_URL}/perfil-profissional.html?tipo=${c.profissional_tipo}&id=${c.profissional_id}&pago=1`,
        failure: `${FRONTEND_URL}/perfil-profissional.html?tipo=${c.profissional_tipo}&id=${c.profissional_id}&erro=pagamento`,
        pending: `${FRONTEND_URL}/perfil-profissional.html?tipo=${c.profissional_tipo}&id=${c.profissional_id}&pendente=1`
      },
      auto_return: 'approved',
      statement_descriptor: 'IMOVELI',
      metadata: { contrato_id: c.id, profissional_nome: c.profissional_nome }
    };

    const mpResp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(body)
    });
    const pref = await mpResp.json();

    if (!pref.id) {
      console.error('[MP criar preferência]', JSON.stringify(pref));
      return res.status(502).json({ success: false, error: 'Erro ao criar preferência de pagamento' });
    }

    // Salva preference_id no contrato
    await query(`UPDATE contratos SET pagamento_id=$1 WHERE id=$2`, [pref.id, c.id]);

    res.json({
      success: true,
      preferenceId: pref.id,
      initPoint: pref.init_point,       // produção
      sandboxInitPoint: pref.sandbox_init_point  // testes
    });
  } catch (err) {
    console.error('[POST /contratos/:id/criar-pagamento]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno ao criar pagamento' });
  }
});

// Pagamento simulado (dev/MVP)
app.post('/api/contratos/:id/pagamento-simulado', auth, async (req, res) => {
  try {
    const { rows } = await query(`SELECT * FROM contratos WHERE id=$1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Contrato não encontrado' });
    const c = rows[0];
    if (c.cliente_email !== req.user.email) return res.status(403).json({ success: false, error: 'Acesso negado' });
    if (c.status !== 'aguardando_pagamento') {
      return res.status(400).json({ success: false, error: `Contrato já está como: ${c.status}` });
    }

    const fakePagamentoId = 'pag_sim_' + Date.now();
    const { rows: updated } = await query(
      `UPDATE contratos SET status='pago', pagamento_id=$1, pagamento_metodo='simulado', chat_liberado=TRUE
       WHERE id=$2 RETURNING *`,
      [fakePagamentoId, req.params.id]
    );
    res.json({ success: true, contrato: updated[0], mensagem: 'Pagamento confirmado! Chat com o profissional liberado.' });
  } catch (err) {
    console.error('[POST /contratos/:id/pagamento-simulado]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Webhook real do Mercado Pago (produção)
app.post('/api/pagamento/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Valida assinatura do MP (x-signature header)
    const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET;
    if (MP_WEBHOOK_SECRET) {
      const xSignature = req.headers['x-signature'] || '';
      const xRequestId  = req.headers['x-request-id'] || '';
      const dataId = req.query?.['data.id'] || '';
      // Monta o manifest conforme documentação do MP
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${(xSignature.match(/ts=(\d+)/) || [])[1] || ''}`;
      const v1Part   = (xSignature.match(/v1=([a-f0-9]+)/) || [])[1] || '';
      const hmac = crypto.createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex');
      if (v1Part && hmac !== v1Part) {
        console.warn('[webhook] Assinatura inválida — ignorando');
        return res.status(200).json({ ok: true }); // Retorna 200 para o MP não reenviar
      }
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, action, data } = body;

    // Aceita tanto type='payment' quanto action='payment.updated'
    const isPaymentEvent = type === 'payment' || action?.startsWith('payment');
    if (!isPaymentEvent) return res.json({ ok: true });

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
    if (!MP_ACCESS_TOKEN) return res.status(503).json({ error: 'MP não configurado' });

    const pagId = data?.id;
    if (!pagId) return res.json({ ok: true });

    // Busca dados reais do pagamento na API do MP
    const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${pagId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    });
    const pag = await mpResp.json();

    console.log(`[webhook MP] pag ${pagId} status=${pag.status} ref=${pag.external_reference}`);

    if (pag.status !== 'approved') return res.json({ ok: true, status: pag.status });

    const contratoId = pag.external_reference;
    if (!contratoId) return res.json({ ok: true });

    const { rows } = await query(
      `UPDATE contratos SET status='pago', pagamento_id=$1, pagamento_metodo=$2, chat_liberado=TRUE
       WHERE id=$3 AND status='aguardando_pagamento' RETURNING id`,
      [String(pag.id), pag.payment_type_id || 'mp', contratoId]
    );

    if (rows.length) {
      console.log(`✅ Contrato ${contratoId} pago — chat liberado`);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[POST /pagamento/webhook]', err.message);
    res.status(200).json({ ok: true }); // Sempre 200 para o MP não reenviar infinitamente
  }
});

// ============================================
// CHAT DIRETO POR CONTRATO
// ============================================

// Mapa em memória: contratoId → Set<res> para SSE
const chatSSE = new Map();

// Throttle de email: "email:contratoId" → timestamp do último envio
const emailThrottle = new Map();
const EMAIL_THROTTLE_MS = 15 * 60 * 1000; // 15 minutos

async function notificarNovaMensagem({ contrato, remetente, conteudo }) {
  try {
    // Determina o destinatário (quem NÃO enviou)
    let destinatarioEmail = null;
    let destinatarioNome  = null;

    if (remetente.email === contrato.cliente_email) {
      // Remetente é o cliente → notifica o profissional
      const tabela = contrato.profissional_tipo === 'fiador' ? 'fiadores' : 'prestadores';
      const { rows } = await query(`SELECT email, nome FROM ${tabela} WHERE id=$1`, [contrato.profissional_id]);
      if (rows.length && rows[0].email) {
        destinatarioEmail = rows[0].email;
        destinatarioNome  = rows[0].nome;
      }
    } else {
      // Remetente é o profissional → notifica o cliente
      const { rows } = await query(`SELECT nome_profissional FROM contas WHERE email=$1`, [contrato.cliente_email]);
      destinatarioEmail = contrato.cliente_email;
      destinatarioNome  = rows[0]?.nome_profissional || contrato.cliente_email.split('@')[0];
    }

    if (!destinatarioEmail) return;

    // Throttle: não envia mais de um email por contrato a cada 15 min
    const throttleKey = `${destinatarioEmail}:${contrato.id}`;
    const agora = Date.now();
    if (emailThrottle.has(throttleKey) && agora - emailThrottle.get(throttleKey) < EMAIL_THROTTLE_MS) return;
    emailThrottle.set(throttleKey, agora);

    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://imoveli.vercel.app';
    const chatLink = `${FRONTEND_URL}/chat-contrato.html?id=${contrato.id}`;
    const preview  = conteudo.length > 120 ? conteudo.slice(0, 117) + '…' : conteudo;

    await enviarEmail({
      to: destinatarioEmail,
      subject: `💬 Nova mensagem de ${remetente.nome} — IMOVELI`,
      textoSimulado: `${remetente.nome}: ${preview} → ${chatLink}`,
      html: `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
          body{font-family:Inter,-apple-system,sans-serif;background:#f5f5f5;margin:0;padding:24px;}
          .card{background:#fff;border-radius:16px;max-width:520px;margin:0 auto;padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.07);}
          .logo{font-size:20px;font-weight:900;color:#6E30D9;margin-bottom:24px;}
          .titulo{font-size:18px;font-weight:700;color:#161616;margin-bottom:8px;}
          .sub{font-size:13px;color:#6B6B70;margin-bottom:20px;}
          .balao{background:#F2ECFC;border-radius:12px;padding:16px;font-size:14px;color:#161616;line-height:1.6;margin-bottom:24px;border-left:4px solid #6E30D9;}
          .remetente{font-weight:700;color:#6E30D9;margin-bottom:6px;font-size:13px;}
          .btn{display:block;text-align:center;padding:14px 24px;background:#6E30D9;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:16px;}
          .rodape{font-size:11px;color:#9b9ba0;text-align:center;margin-top:20px;line-height:1.6;}
        </style>
      </head><body>
        <div class="card">
          <div class="logo">IMOVELI</div>
          <div class="titulo">Você tem uma nova mensagem</div>
          <div class="sub">Na contratação: <strong>${contrato.escopo.slice(0, 80)}${contrato.escopo.length > 80 ? '…' : ''}</strong></div>
          <div class="balao">
            <div class="remetente">${remetente.nome}</div>
            ${preview}
          </div>
          <a href="${chatLink}" class="btn">💬 Responder agora</a>
          <div class="rodape">
            IMOVELI — Rede de profissionais baseada em confiança<br>
            Você está recebendo porque é parte desta contratação.
          </div>
        </div>
      </body></html>`
    });
  } catch (err) {
    console.error('[notificarNovaMensagem]', err.message);
  }
}

function broadcastChat(contratoId, payload) {
  const conns = chatSSE.get(contratoId);
  if (!conns || !conns.size) return;
  const msg = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of [...conns]) {
    try { res.write(msg); } catch (_) { conns.delete(res); }
  }
}

// Helper: verifica se usuário é parte do contrato (cliente ou profissional)
async function verificarAcessoContrato(contratoId, user) {
  const { rows } = await query(`SELECT * FROM contratos WHERE id=$1`, [contratoId]);
  if (!rows.length) return null;
  const c = rows[0];
  if (c.cliente_email === user.email) return { contrato: c, papel: 'cliente' };
  if (c.profissional_tipo === 'fiador' && user.fiadorId === c.profissional_id) return { contrato: c, papel: 'profissional' };
  // Prestador: verifica email na tabela prestadores
  if (c.profissional_tipo === 'prestador') {
    const { rows: pr } = await query(`SELECT email FROM prestadores WHERE id=$1`, [c.profissional_id]);
    if (pr.length && pr[0].email === user.email) return { contrato: c, papel: 'profissional' };
  }
  return null; // sem acesso
}

// GET /api/chat/:contratoId/mensagens — histórico
app.get('/api/chat/:contratoId/mensagens', auth, async (req, res) => {
  try {
    const acesso = await verificarAcessoContrato(req.params.contratoId, req.user);
    if (!acesso) return res.status(403).json({ success: false, error: 'Acesso negado' });
    if (!acesso.contrato.chat_liberado) {
      return res.status(403).json({ success: false, error: 'Pagamento pendente — chat não liberado' });
    }

    const { rows } = await query(
      `SELECT id, remetente_email, remetente_nome, conteudo, lida, created_at
       FROM mensagens_chat WHERE contrato_id=$1 ORDER BY created_at ASC`,
      [req.params.contratoId]
    );

    // Marca como lidas as mensagens do outro lado
    await query(
      `UPDATE mensagens_chat SET lida=TRUE
       WHERE contrato_id=$1 AND remetente_email != $2 AND lida=FALSE`,
      [req.params.contratoId, req.user.email]
    );

    res.json({ success: true, mensagens: rows, contrato: acesso.contrato, papel: acesso.papel });
  } catch (err) {
    console.error('[GET /chat/:id/mensagens]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// POST /api/chat/:contratoId/mensagens — enviar mensagem
app.post('/api/chat/:contratoId/mensagens', auth, async (req, res) => {
  try {
    const acesso = await verificarAcessoContrato(req.params.contratoId, req.user);
    if (!acesso) return res.status(403).json({ success: false, error: 'Acesso negado' });
    if (!acesso.contrato.chat_liberado) {
      return res.status(403).json({ success: false, error: 'Chat não liberado' });
    }

    const { conteudo } = req.body;
    if (!conteudo?.trim()) return res.status(400).json({ success: false, error: 'Mensagem vazia' });
    if (conteudo.length > 4000) return res.status(400).json({ success: false, error: 'Mensagem muito longa' });

    const remetenteNome = req.user.nomeProfissional || req.user.email.split('@')[0];
    const { rows } = await query(
      `INSERT INTO mensagens_chat (contrato_id, remetente_email, remetente_nome, conteudo)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.contratoId, req.user.email, remetenteNome, conteudo.trim()]
    );
    const mensagem = rows[0];

    // Broadcast via SSE para todos que estão ouvindo este chat
    broadcastChat(req.params.contratoId, { tipo: 'mensagem', mensagem });

    // Notificação por e-mail (assíncrona — não bloqueia a resposta)
    notificarNovaMensagem({
      contrato: acesso.contrato,
      remetente: { email: req.user.email, nome: remetenteNome },
      conteudo: conteudo.trim()
    });

    res.json({ success: true, mensagem });
  } catch (err) {
    console.error('[POST /chat/:id/mensagens]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// GET /api/chat/:contratoId/stream — SSE para mensagens em tempo real
app.get('/api/chat/:contratoId/stream', auth, async (req, res) => {
  try {
    const acesso = await verificarAcessoContrato(req.params.contratoId, req.user);
    if (!acesso || !acesso.contrato.chat_liberado) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const contratoId = req.params.contratoId;
    if (!chatSSE.has(contratoId)) chatSSE.set(contratoId, new Set());
    chatSSE.get(contratoId).add(res);

    // Heartbeat a cada 25s para manter conexão viva
    const hb = setInterval(() => { try { res.write(': ping\n\n'); } catch (_) {} }, 25000);

    req.on('close', () => {
      clearInterval(hb);
      const conns = chatSSE.get(contratoId);
      if (conns) { conns.delete(res); if (!conns.size) chatSSE.delete(contratoId); }
    });
  } catch (err) {
    console.error('[GET /chat/:id/stream]', err.message);
    res.status(500).end();
  }
});

// GET /api/meus-contratos/nao-lidos — badge de notificação
app.get('/api/meus-contratos/nao-lidos', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT COUNT(*) as total FROM mensagens_chat mc
       JOIN contratos c ON c.id = mc.contrato_id
       WHERE (c.cliente_email=$1 OR
              (c.profissional_tipo='fiador' AND c.profissional_id=$2) OR
              (c.profissional_tipo='prestador' AND c.profissional_id IN
                (SELECT id FROM prestadores WHERE email=$1)))
         AND mc.remetente_email != $1
         AND mc.lida = FALSE`,
      [req.user.email, req.user.fiadorId || '']
    );
    res.json({ success: true, naoLidas: parseInt(rows[0].total) || 0 });
  } catch (err) {
    res.json({ success: true, naoLidas: 0 });
  }
});

// GET /api/meus-contratos — lista contratos do usuário (como cliente ou profissional)
app.get('/api/meus-contratos', auth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM mensagens_chat mc WHERE mc.contrato_id=c.id AND mc.remetente_email != $1 AND mc.lida=FALSE) as nao_lidas
       FROM contratos c
       WHERE c.cliente_email=$1
          OR (c.profissional_tipo='fiador' AND c.profissional_id=$2)
          OR (c.profissional_tipo='prestador' AND c.profissional_id IN
                (SELECT id FROM prestadores WHERE email=$1))
       ORDER BY c.created_at DESC`,
      [req.user.email, req.user.fiadorId || '']
    );
    res.json({ success: true, contratos: rows });
  } catch (err) {
    console.error('[GET /meus-contratos]', err.message);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// ============================================
// HEALTH
// ============================================

app.get('/api/health', async (req, res) => {
  const { rows } = await query('SELECT COUNT(*) FROM fiadores');
  res.json({
    status: 'OK', version: '2.0.0', db: 'postgresql',
    fiadores: parseInt(rows[0].count),
    ai: !!anthropicClient,
    tavily: !!TAVILY_API_KEY,
    node: process.version
  });
});

// Diagnóstico rápido da IA (só dev — remove em prod)
app.get('/api/ai-diag', async (req, res) => {
  if (!anthropicClient) return res.json({ ok: false, error: 'anthropicClient nulo — ANTHROPIC_API_KEY ausente' });
  try {
    const r = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 10,
      messages: [{ role: 'user', content: 'ok' }]
    });
    res.json({ ok: true, model: r.model, id: r.id });
  } catch (e) {
    res.json({ ok: false, error: e.message, type: e.constructor?.name, status: e.status });
  }
});

// ============================================
// HELPERS DE SERIALIZAÇÃO
// ============================================

function rowToFiador(r) {
  return { id: r.id, nome: r.nome, email: r.email, conselho: r.conselho, uf: r.uf, registro: r.registro, carteirinha: r.carteirinha, status: r.status, motivo: r.motivo, fonte: r.fonte, bio: r.bio, skills: r.skills, areasInteresse: r.areas_interesse, servicosOferecidos: r.servicos_oferecidos, acervo: r.acervo, mural: r.mural, avaliacoesExternas: r.avaliacoes_externas, localizacao: r.localizacao, faixaPreco: r.faixa_preco, slug: r.slug, createdAt: r.created_at };
}

function rowToPrestador(r) {
  return { id: r.id, nome: r.nome, telefone: r.telefone, especialidade: r.especialidade, carteirinha: r.carteirinha, status: r.status, bio: r.bio, skills: r.skills, areasInteresse: r.areas_interesse, servicosOferecidos: r.servicos_oferecidos, acervo: r.acervo, mural: r.mural, avaliacoesExternas: r.avaliacoes_externas, localizacao: r.localizacao, faixaPreco: r.faixa_preco, slug: r.slug, createdAt: r.created_at };
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
    // Reset de senha
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS reset_token TEXT`,
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ`,
    // Full-text search na base de conhecimento (português)
    `ALTER TABLE base_conhecimento ADD COLUMN IF NOT EXISTS tsv tsvector`,
    `CREATE INDEX IF NOT EXISTS idx_bk_tsv ON base_conhecimento USING GIN(tsv)`,
    // Sessões e mensagens de chat
    `CREATE TABLE IF NOT EXISTS chat_sessoes (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT,
      titulo TEXT,
      criada_em TIMESTAMPTZ DEFAULT NOW(),
      atualizada_em TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS chat_mensagens (
      id SERIAL PRIMARY KEY,
      sessao_id TEXT REFERENCES chat_sessoes(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      criada_em TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_cm_sessao ON chat_mensagens(sessao_id)`,
    // Contratos de serviço (contratação direta com pagamento)
    `CREATE TABLE IF NOT EXISTS contratos (
      id              TEXT PRIMARY KEY,
      cliente_email   TEXT NOT NULL,
      profissional_tipo TEXT NOT NULL,
      profissional_id TEXT NOT NULL,
      profissional_nome TEXT NOT NULL,
      escopo          TEXT NOT NULL,
      quantidade      NUMERIC,
      metros_quadrados NUMERIC,
      prazo           TEXT DEFAULT 'medio',
      valor_servico   NUMERIC NOT NULL,
      taxa_plataforma NUMERIC NOT NULL,
      valor_total     NUMERIC NOT NULL,
      status          TEXT DEFAULT 'aguardando_pagamento',
      pagamento_id    TEXT,
      pagamento_metodo TEXT,
      chat_liberado   BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON contratos(cliente_email)`,
    `CREATE INDEX IF NOT EXISTS idx_contratos_prof ON contratos(profissional_tipo, profissional_id)`,
    // Chat direto por contrato
    `CREATE TABLE IF NOT EXISTS mensagens_chat (
      id            SERIAL PRIMARY KEY,
      contrato_id   TEXT REFERENCES contratos(id) ON DELETE CASCADE,
      remetente_email TEXT NOT NULL,
      remetente_nome  TEXT NOT NULL,
      conteudo        TEXT NOT NULL,
      lida            BOOLEAN DEFAULT FALSE,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE INDEX IF NOT EXISTS idx_chat_contrato ON mensagens_chat(contrato_id)`,
    `CREATE INDEX IF NOT EXISTS idx_chat_nao_lida ON mensagens_chat(contrato_id, lida)`,
    // Slugs para URLs amigáveis
    `ALTER TABLE fiadores ADD COLUMN IF NOT EXISTS slug TEXT`,
    `ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS slug TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_fiadores_slug ON fiadores(slug) WHERE slug IS NOT NULL`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_prestadores_slug ON prestadores(slug) WHERE slug IS NOT NULL`,
    // IDs únicos de plataforma e consentimento LGPD/API
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS platform_id TEXT DEFAULT gen_random_uuid()::text`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_contas_platform_id ON contas(platform_id) WHERE platform_id IS NOT NULL`,
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS api_consent BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS api_consent_at TIMESTAMPTZ`,
    // LGPD — consentimento de uso dos dados e direito ao esquecimento
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS lgpd_consent_at TIMESTAMPTZ`,
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS exclusao_solicitada_at TIMESTAMPTZ`,
    `ALTER TABLE contas ADD COLUMN IF NOT EXISTS exclusao_motivo TEXT`,
    `ALTER TABLE fiadores ADD COLUMN IF NOT EXISTS platform_id TEXT DEFAULT gen_random_uuid()::text`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_fiadores_platform_id ON fiadores(platform_id) WHERE platform_id IS NOT NULL`,
    `ALTER TABLE prestadores ADD COLUMN IF NOT EXISTS platform_id TEXT DEFAULT gen_random_uuid()::text`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_prestadores_platform_id ON prestadores(platform_id) WHERE platform_id IS NOT NULL`,
  ];
  for (const sql of alterations) {
    try { await query(sql); } catch (err) { console.error('⚠️  Migration:', err.message); }
  }

  // Gerar platform_id para registros existentes sem um
  await query(`UPDATE contas SET platform_id = gen_random_uuid()::text WHERE platform_id IS NULL`);
  await query(`UPDATE fiadores SET platform_id = gen_random_uuid()::text WHERE platform_id IS NULL`);
  await query(`UPDATE prestadores SET platform_id = gen_random_uuid()::text WHERE platform_id IS NULL`);

  // Gerar slugs para registros existentes sem slug
  const { rows: semSlug } = await query(
    `SELECT id, nome, 'fiador' as tipo FROM fiadores WHERE slug IS NULL
     UNION ALL SELECT id, nome, 'prestador' as tipo FROM prestadores WHERE slug IS NULL`
  );
  for (const r of semSlug) {
    try {
      const base = gerarSlug(r.nome);
      const slug = await resolverSlugUnico(base);
      const table = r.tipo === 'fiador' ? 'fiadores' : 'prestadores';
      await query(`UPDATE ${table} SET slug=$1 WHERE id=$2`, [slug, r.id]);
    } catch (err) { console.error('⚠️  Slug gen:', err.message); }
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
        `INSERT INTO base_conhecimento (categoria, titulo, numero, descricao, conteudo, tags, vigente, fonte_url, tsv)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8, to_tsvector('portuguese', $2 || ' ' || $4 || ' ' || $5 || ' ' || COALESCE($3,'')))
         ON CONFLICT DO NOTHING`,
        [k.categoria, k.titulo, k.numero || null, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null]
      );
      n++;
    }
    // Popula tsv nos registros já existentes que não têm
    await query(`UPDATE base_conhecimento SET tsv = to_tsvector('portuguese', titulo || ' ' || descricao || ' ' || conteudo || ' ' || COALESCE(numero,'')) WHERE tsv IS NULL`);
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

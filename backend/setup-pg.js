// Script para criar o banco e rodar o schema
// Execução: node setup-pg.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
  // 1) Conecta no postgres padrão para criar o banco imoveli
  const adminClient = new Client({
    host:     process.env.PG_HOST     || 'localhost',
    port:     parseInt(process.env.PG_PORT || '5432'),
    database: 'postgres',
    user:     process.env.PG_USER     || 'postgres',
    password: process.env.PG_PASSWORD || ''
  });

  await adminClient.connect();
  console.log('✅ Conectado ao PostgreSQL');

  const dbName = process.env.PG_DATABASE || 'imoveli';
  const exists = await adminClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
  );

  if (exists.rows.length === 0) {
    await adminClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Banco "${dbName}" criado`);
  } else {
    console.log(`ℹ️  Banco "${dbName}" já existe`);
  }
  await adminClient.end();

  // 2) Conecta no banco imoveli e roda o schema
  const dbClient = new Client({
    host:     process.env.PG_HOST     || 'localhost',
    port:     parseInt(process.env.PG_PORT || '5432'),
    database: dbName,
    user:     process.env.PG_USER     || 'postgres',
    password: process.env.PG_PASSWORD || ''
  });

  await dbClient.connect();
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await dbClient.query(schema);
  console.log('✅ Tabelas criadas/verificadas');

  // 3) Seed de demonstração (só se fiadores estiver vazio)
  const { rows } = await dbClient.query('SELECT COUNT(*) FROM fiadores');
  if (parseInt(rows[0].count) === 0) {
    const now = new Date().toISOString();
    await dbClient.query(`
      INSERT INTO fiadores (id, nome, email, conselho, uf, registro, carteirinha, status, fonte, bio, skills, areas_interesse, servicos_oferecidos, localizacao, faixa_preco, created_at)
      VALUES
        ('fiador_seed_carlos', 'Eng. Carlos Silva', 'carlos@eng.com.br', 'CREA', 'PE', 'SEED-CREA-0001', 'CREA SEED-CREA-0001', 'verificado', 'Cadastro seed de demonstração',
         'Engenheiro civil com foco em avaliação estrutural.', '["Avaliação estrutural","Laudo técnico","Gestão de obra"]',
         '["Reforma residencial","Regularização de imóveis"]', '["Vistoria estrutural","Laudo técnico de rachaduras"]',
         '{"lat":-8.2828,"lng":-35.9720,"cidade":"Caruaru","uf":"PE"}', '{"min":300,"max":2500}', $1),
        ('fiador_seed_beatriz', 'Arq. Beatriz Costa', 'beatriz@arquitetura.com.br', 'CAU', 'PE', 'SEED-CAU-0001', 'CAU SEED-CAU-0001', 'verificado', 'Cadastro seed de demonstração',
         'Arquiteta especializada em reforma de interiores.', '["Projeto de interiores","Compatibilização de projetos"]',
         '["Reforma","Design de interiores"]', '["Projeto arquitetônico","Consultoria de reforma"]',
         '{"lat":-8.2750,"lng":-35.9600,"cidade":"Caruaru","uf":"PE"}', '{"min":800,"max":4000}', $1)
    `, [now]);

    await dbClient.query(`
      INSERT INTO prestadores (id, nome, telefone, especialidade, carteirinha, status, bio, skills, servicos_oferecidos, localizacao, faixa_preco, created_at)
      VALUES
        ('prestador_seed_joao', 'João Pedro', '(81) 98654-3210', 'Eletricista', 'IMV-2026-000001', 'ativo',
         'Eletricista residencial, atuação em instalações e reparos elétricos.',
         '["Instalação elétrica","Quadro de disjuntores"]', '["Reparo elétrico","Instalação de tomadas"]',
         '{"lat":-8.2900,"lng":-35.9800,"cidade":"Caruaru","uf":"PE"}', '{"min":80,"max":600}', $1),
        ('prestador_seed_marcos', 'Encanador Marcos', '(81) 98765-4321', 'Hidráulica', 'IMV-2026-000002', 'ativo',
         'Encanador com experiência em reparos hidráulicos residenciais.',
         '["Reparo de vazamento","Desentupimento"]', '["Reparo hidráulico","Troca de registros"]',
         '{"lat":-8.2650,"lng":-35.9650,"cidade":"Caruaru","uf":"PE"}', '{"min":60,"max":500}', $1)
    `, [now]);

    await dbClient.query(`
      INSERT INTO indicacoes (id, fiador_id, prestador_id, escopo, status, created_at)
      VALUES
        ('indicacao_seed_joao',   'fiador_seed_carlos', 'prestador_seed_joao',   'Reparos elétricos residenciais',  'aceita', $1),
        ('indicacao_seed_marcos', 'fiador_seed_carlos', 'prestador_seed_marcos', 'Reparos hidráulicos residenciais', 'aceita', $1)
    `, [now]);

    console.log('✅ Seed de demonstração inserido');
  } else {
    console.log(`ℹ️  Seed ignorado — banco já tem dados`);
  }

  await dbClient.end();
  console.log('\n🚀 Setup concluído! Agora adicione PG_PASSWORD no .env e inicie o servidor.');
}

setup().catch(err => {
  console.error('❌ Erro no setup:', err.message);
  process.exit(1);
});

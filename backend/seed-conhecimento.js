// Script de seed para executar manualmente: node backend/seed-conhecimento.js
require('dotenv').config();
const { query, testConnection } = require('./db-pg');
const conhecimentos = require('./seed-conhecimento-data.js');

async function seed() {
  const ok = await testConnection();
  if (!ok) { console.error('❌ Sem conexão com PostgreSQL'); process.exit(1); }

  console.log(`📚 Inserindo ${conhecimentos.length} registros de conhecimento...`);
  let inseridos = 0, atualizados = 0;

  for (const k of conhecimentos) {
    const tags = k.tags ? `{${k.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}';
    const { rows } = await query(
      `SELECT id FROM base_conhecimento WHERE (numero IS NOT NULL AND numero = $1) OR (numero IS NULL AND titulo = $2)`,
      [k.numero || null, k.titulo]
    );
    if (rows.length > 0) {
      await query(
        `UPDATE base_conhecimento SET categoria=$1, titulo=$2, descricao=$3, conteudo=$4, tags=$5, vigente=$6, fonte_url=$7 WHERE id=$8`,
        [k.categoria, k.titulo, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null, rows[0].id]
      );
      atualizados++;
    } else {
      await query(
        `INSERT INTO base_conhecimento (categoria, titulo, numero, descricao, conteudo, tags, vigente, fonte_url)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [k.categoria, k.titulo, k.numero || null, k.descricao, k.conteudo, tags, k.vigente !== false, k.fonte_url || null]
      );
      inseridos++;
    }
  }

  console.log(`✅ Concluído: ${inseridos} inseridos, ${atualizados} atualizados.`);
  process.exit(0);
}

seed().catch(err => { console.error('❌ Erro:', err.message); process.exit(1); });

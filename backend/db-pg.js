// ============================================
// BANCO DE DADOS — PostgreSQL (substitui db.js)
// ============================================
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     parseInt(process.env.PG_PORT || '5432'),
  database: process.env.PG_DATABASE || 'imoveli',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || '',
  ssl:      process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

async function testConnection() {
  try {
    const res = await query('SELECT NOW() as now');
    console.log('🗄️  PostgreSQL conectado:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar PostgreSQL:', err.message);
    return false;
  }
}

module.exports = { query, pool, testConnection };

// Envia SOMENTE propostas com "aprovado": true em dados/propostas.json.
// Padrão = simulação (preenche o formulário e tira print, sem enviar).
// Envio real: node enviar.js --confirmar
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const { abrir, garantirLogin } = require('./navegador');
const DADOS = path.join(__dirname, 'dados');
const ARQ = path.join(DADOS, 'propostas.json');
const confirmar = process.argv.includes('--confirmar');

(async () => {
  const propostas = JSON.parse(fs.readFileSync(ARQ, 'utf8'));
  const fila = propostas.filter((p) => p.aprovado === true && !p.enviadaEm);
  if (!fila.length) return console.log('Nenhuma proposta aprovada pendente.');
  const nav = await abrir();
  const { page } = nav;
  const s = cfg.seletores;
  try {
    await garantirLogin(nav);
    for (const [i, p] of fila.entries()) {
      await page.goto(p.link, { waitUntil: 'domcontentloaded' });
      await page.click(s.propostaBotao);
      await page.waitForSelector(s.propostaTexto);
      await page.fill(s.propostaValor, String(p.valor));
      await page.fill(s.propostaPrazo, String(p.prazoDias));
      await page.fill(s.propostaTexto, p.texto);
      await page.screenshot({ path: path.join(DADOS, `proposta-${i + 1}.png`), fullPage: true });
      if (!confirmar) { console.log(`[simulação] ${p.titulo} — preenchida, não enviada`); continue; }
      await page.click(s.propostaEnviar);
      await page.waitForLoadState('networkidle');
      p.enviadaEm = new Date().toISOString();
      fs.writeFileSync(ARQ, JSON.stringify(propostas, null, 2)); // grava a cada envio
      console.log(`[enviada] ${p.titulo}`);
      await page.waitForTimeout(30000 + Math.random() * 30000); // ritmo humano entre envios
    }
  } finally {
    await nav.browser.close();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });

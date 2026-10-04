// Lista projetos, aplica filtros e salva dados/projetos.json. NÃO envia nada.
// Uso: node buscar.js [--diagnostico]
const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const { avaliar } = require('./filtros');
const { abrir, garantirLogin } = require('./navegador');
const DADOS = path.join(__dirname, 'dados');
const diagnostico = process.argv.includes('--diagnostico');

(async () => {
  const nav = await abrir();
  const { page } = nav;
  const s = cfg.seletores;
  try {
    await garantirLogin(nav);
    const cards = [];
    for (let p = 1; p <= cfg.paginasMax; p++) {
      await page.goto(`${cfg.baseUrl}${cfg.listagemPath}&page=${p}`, { waitUntil: 'domcontentloaded' });
      if (diagnostico) {
        fs.writeFileSync(path.join(DADOS, `listagem-${p}.html`), await page.content());
        await page.screenshot({ path: path.join(DADOS, `listagem-${p}.png`), fullPage: true });
      }
      const daPagina = await page.$$eval(s.cardProjeto, (els, s) => els.map((el) => {
        const a = el.querySelector(s.cardTitulo);
        const txt = (sel) => el.querySelector(sel)?.innerText.trim() || '';
        return { titulo: a?.innerText.trim() || '', link: a?.href || '', descricao: txt(s.cardDescricao), orcamento: txt(s.cardOrcamento) };
      }), s);
      console.log(`Página ${p}: ${daPagina.length} projetos`);
      if (!daPagina.length) break;
      cards.push(...daPagina);
    }

    const aceitos = [];
    for (const c of cards) {
      if (!c.link) continue;
      const previa = avaliar(c, cfg.filtros);
      if (!previa.aceito && previa.motivo !== 'fora do perfil') continue; // descarte barato
      await page.goto(c.link, { waitUntil: 'domcontentloaded' });
      const det = {
        ...c,
        descricao: (await page.locator(s.detalheDescricao).first().innerText().catch(() => '')) || c.descricao,
        orcamento: (await page.locator(s.detalheOrcamento).first().innerText().catch(() => '')) || c.orcamento,
      };
      const r = avaliar(det, cfg.filtros);
      console.log(`${r.aceito ? '✔' : '✘'} ${det.titulo} — ${r.motivo}`);
      if (r.aceito) aceitos.push({ ...det, orcamentoStatus: r.orcamento, motivo: r.motivo });
    }
    fs.writeFileSync(path.join(DADOS, 'projetos.json'), JSON.stringify(aceitos, null, 2));
    console.log(`\n${aceitos.length} projetos no perfil → dados/projetos.json`);
  } finally {
    await nav.browser.close();
  }
})().catch((e) => { console.error('ERRO:', e.message); process.exit(1); });

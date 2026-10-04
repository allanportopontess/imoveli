// Renderiza um post (carrossel) do Instagram a partir de posts/<data>/post.json
// Uso: node render.mjs 2026-10-05
// Saída: posts/<data>/slide-01.jpg ... (1080x1350, JPEG — formato aceito pela API do Instagram)
import { chromium } from 'playwright';
import { readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const date = process.argv[2];
if (!date) { console.error('Uso: node render.mjs AAAA-MM-DD'); process.exit(1); }

const dir = join(ROOT, 'posts', date);
const post = JSON.parse(readFileSync(join(dir, 'post.json'), 'utf8'));

// Paleta por pilar de conteúdo
const THEMES = {
  varejo:       { bg: '#16181d', fg: '#f4efe8', accent: '#e0a35a' },
  arquitetura:  { bg: '#f4efe8', fg: '#1d1f24', accent: '#b5653b' },
  usucapiao:    { bg: '#0f2a2e', fg: '#eef3f1', accent: '#5fc2a8' },
  projeto:      { bg: '#1d1f24', fg: '#f4efe8', accent: '#c9b18a' },
  venda:        { bg: '#b5653b', fg: '#fffaf3', accent: '#16181d' },
};
const t = THEMES[post.pilar] || THEMES.arquitetura;

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/\n/g, '<br>');

function slideHtml(s, i, total) {
  const kind = s.tipo || (i === 0 ? 'capa' : i === total - 1 ? 'cta' : 'dica');
  let inner = '';
  if (kind === 'capa') {
    inner = `
      <div class="kicker">${esc(s.kicker || post.kicker || '')}</div>
      <h1 class="cover">${esc(s.titulo)}</h1>
      ${s.texto ? `<p class="lead">${esc(s.texto)}</p>` : ''}
      <div class="swipe">arraste para o lado →</div>`;
  } else if (kind === 'cta') {
    inner = `
      <div class="kicker">${esc(s.kicker || 'Gostou?')}</div>
      <h2>${esc(s.titulo)}</h2>
      ${s.texto ? `<p>${esc(s.texto)}</p>` : ''}
      <div class="ctabox">${esc(s.botao || 'Salve e compartilhe com quem precisa')}</div>`;
  } else {
    inner = `
      ${s.numero ? `<div class="num">${esc(s.numero)}</div>` : ''}
      <h2>${esc(s.titulo)}</h2>
      ${s.texto ? `<p>${esc(s.texto)}</p>` : ''}`;
  }
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="fonts.css" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{width:1080px;height:1350px;background:${t.bg};color:${t.fg};font-family:Montserrat,sans-serif;
       display:flex;flex-direction:column;padding:96px 88px 72px;position:relative;overflow:hidden}
  body:before{content:"";position:absolute;right:-180px;top:-180px;width:520px;height:520px;border-radius:50%;
       border:2px solid ${t.accent};opacity:.35}
  main{flex:1;display:flex;flex-direction:column;justify-content:center;gap:40px;position:relative}
  .kicker{font-weight:600;font-size:30px;letter-spacing:.18em;text-transform:uppercase;color:${t.accent}}
  h1.cover{font-family:'Playfair Display',serif;font-size:104px;line-height:1.05}
  h2{font-family:'Playfair Display',serif;font-size:72px;line-height:1.1}
  p{font-size:38px;line-height:1.45;font-weight:500;opacity:.92}
  p.lead{font-size:42px}
  b{color:${t.accent};font-weight:800}
  .num{font-weight:800;font-size:150px;line-height:1;color:${t.accent}}
  .swipe{font-size:28px;opacity:.7;letter-spacing:.05em}
  .ctabox{align-self:flex-start;background:${t.accent};color:${t.bg};font-weight:800;font-size:34px;padding:26px 40px;border-radius:14px}
  footer{display:flex;justify-content:space-between;align-items:center;font-size:26px;font-weight:600;opacity:.85;position:relative}
  footer .bar{flex:1;height:2px;background:${t.accent};margin:0 28px;opacity:.6}
</style></head><body>
<main>${inner}</main>
<footer><span>ALLAN PORTO ®</span><span class="bar"></span><span>${i + 1}/${total}</span></footer>
</body></html>`;
}

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
const slides = post.slides;
for (let i = 0; i < slides.length; i++) {
  // Arquivo temporário dentro de fonts/ para carregar as fontes locais (sem depender de rede)
  const tmp = join(ROOT, 'fonts', '_slide.html');
  writeFileSync(tmp, slideHtml(slides[i], i, slides.length));
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(dir, `slide-${String(i + 1).padStart(2, '0')}.jpg`);
  await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
  console.log(out);
}
await browser.close();
unlinkSync(join(ROOT, 'fonts', '_slide.html'));

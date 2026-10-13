// Carrossel "post de TikTok/Instagram" claro (pedido do Allan em 13/10): fundo creme, títulos em Impact
// (Anton como substituta, mesma família visual) com palavras coloridas, textos de apoio em serifa,
// caixas brancas de legenda estilo TikTok. Uso: node tiktok.mjs <pasta-do-post>
// Lê posts/<pasta>/criador.json (mesmos tipos: capa, chat, close) e gera slide-01.jpg … (1080x1350)
// Marcação: *x* = palavra colorida (cores em rodízio) · **x** = marca-texto amarelo
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'criador.json'), 'utf8'));
const FOTO = '../' + c.foto;
const ROSTO = c.rosto || { x: 50, y: 52 };
const CORES = c.cores || ['#FF3D7F', '#2F6BFF', '#FF8A00', '#12B886'];

let k = 0;
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>')
  .replace(/\*(.+?)\*/g, (_, t) => `<span class="cor" style="color:${CORES[k++ % CORES.length]}">${t}</span>`)
  .replace(/\n/g, '<br>');
const foto = (s) => (s.foto ? '../' + s.foto : FOTO);

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;color:#141414;font-family:'Instrument Serif',serif;
  background:#FBF6EE;background-image:radial-gradient(#e9dfd0 1.5px,transparent 1.7px);background-size:32px 32px}
.imp{font-family:Impact,Anton,sans-serif;text-transform:uppercase;line-height:.95;letter-spacing:.5px}
.ser{font-family:'Instrument Serif',serif;font-style:italic}
mark{background:#FFD60A;color:#141414;padding:0 8px;border-radius:6px}
.tt{display:inline-block;background:#fff;color:#141414;font-family:Inter,sans-serif;font-weight:800;padding:12px 22px;border-radius:12px;line-height:1.25;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.tt mark{padding:0 6px}
.av{width:72px;height:72px;border-radius:50%;overflow:hidden;position:relative;flex:none;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,.15)}
.av img{position:absolute;width:150px;left:${36 - 150 * ROSTO.x / 100}px;top:${36 - 200 * ROSTO.y / 100}px}
.ft{position:absolute;left:56px;right:56px;bottom:40px;display:flex;justify-content:space-between;font:700 22px Inter;color:#6b6257;letter-spacing:.06em}`;

const R = {
  capa: (s) => `<div style="position:absolute;left:40px;right:40px;top:470px;bottom:96px;border-radius:36px;overflow:hidden;box-shadow:0 20px 50px -20px rgba(0,0,0,.35)">
  <div style="position:absolute;inset:0;background:url(${foto(s)}) ${ROSTO.x}% ${s.foco_y ?? 60}%/cover"></div></div>
<div style="position:absolute;top:64px;left:56px;right:56px;text-align:center">
 <div class="ser" style="font-size:40px;color:#6b6257">${esc(s.kicker || '')}</div>
 <div class="imp" style="font-size:${s.tam_imp || 96}px;margin-top:14px">${esc(s.titulo_imp || s.titulo)}</div></div>
${s.legenda ? `<div style="position:absolute;left:0;right:0;bottom:${s.legenda_y ?? 150}px;text-align:center"><div class="tt" style="font-size:42px;transform:rotate(-2deg)">${esc(s.legenda)}</div></div>` : ''}`,

  chat: (s) => `<div style="position:absolute;top:70px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center">
 <div class="ser" style="font-size:38px;color:#6b6257">perguntei pra IA…</div>
 <div style="font:800 24px Inter;background:#141414;color:#fff;border-radius:99px;padding:10px 20px">${esc(s.contador || '')}</div></div>
<div style="position:absolute;top:170px;left:56px;right:56px;background:#fff;border-radius:28px;padding:30px 34px;box-shadow:0 10px 30px -12px rgba(0,0,0,.25)">
 <div style="font:700 22px Inter;color:#9a8f82;letter-spacing:.08em;text-transform:uppercase">responda em uma palavra</div>
 <div style="font:700 40px/1.3 Inter;margin-top:10px">${esc(s.pergunta)}</div></div>
<div style="position:absolute;top:${s.resposta_y || 470}px;left:30px;right:30px;text-align:center">
 <div class="imp" style="font-size:${s.tam_imp || 200}px;color:${s.cor || CORES[(k++) % CORES.length]};-webkit-text-stroke:5px #141414;paint-order:stroke fill;text-shadow:10px 10px 0 #141414;transform:rotate(-3deg)">${esc(s.resposta)}</div></div>
<div style="position:absolute;left:56px;right:56px;top:${s.nota_y || 830}px;background:#fff;border:3px solid #141414;border-radius:24px;padding:28px 32px;box-shadow:8px 8px 0 #141414">
 <div style="display:flex;align-items:center;gap:16px"><div class="av"><img src="${FOTO}"></div>
 <div class="ser" style="font-size:36px">tradução do arquiteto:</div></div>
 <div style="font-family:'Instrument Serif',serif;font-size:42px;line-height:1.25;margin-top:14px">${esc(s.nota)}</div></div>`,

  close: (s) => `<div style="position:absolute;inset:0;background:url(${foto(s)}) ${ROSTO.x}% ${s.foco_y ?? 55}%/cover"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(251,246,238,.96) 0%,rgba(251,246,238,.85) 26%,rgba(251,246,238,0) 42%)"></div>
<div style="position:absolute;top:70px;left:56px;right:56px;text-align:center">
 <div class="ser" style="font-size:40px;color:#6b6257">${esc(s.kicker || 'agora é sua vez')}</div>
 <div class="imp" style="font-size:${s.tam_imp || 92}px;margin-top:10px">${esc(s.titulo_imp || s.titulo)}</div></div>
<div style="position:absolute;left:56px;right:56px;bottom:${s.caixas_y ?? 110}px;display:flex;flex-direction:column;gap:14px;align-items:center">
 ${s.caixas.map((t, i) => `<div class="tt" style="font-size:36px;transform:rotate(${i % 2 ? 1.5 : -1.5}deg)">${esc(t)}</div>`).join('')}</div>`,

  // Foto em tela cheia com selo ERRO/SOLUÇÃO, título Impact numa faixa creme e caixas brancas estilo TikTok
  antes: (s) => R._foto(s, '#FF3B30', s.selo || '❌ O ERRO', 'grayscale(.25) contrast(1.05) brightness(.95)'),
  depois: (s) => R._foto(s, '#12B886', s.selo || '✅ A SOLUÇÃO', 'saturate(1.08)'),
  _foto: (s, cor, selo, filtro) => `<div style="position:absolute;inset:0;background:url(../${s.img}) ${s.pos || 'center'}/cover;filter:${filtro}"></div>
<div style="position:absolute;inset:0 0 auto 0;height:360px;background:linear-gradient(180deg,rgba(251,246,238,.97) 0%,rgba(251,246,238,.92) 62%,rgba(251,246,238,0) 100%)"></div>
<div style="position:absolute;top:56px;left:56px;right:56px">
 <div style="display:inline-block;background:${cor};color:#fff;font:800 28px Inter;letter-spacing:.06em;padding:10px 18px;border-radius:10px;transform:rotate(-2deg)">${esc(selo)}</div>
 <div class="imp" style="font-size:${s.tam_imp || 84}px;margin-top:18px;color:#141414">${esc(s.titulo_imp)}</div></div>
<div style="position:absolute;left:56px;right:56px;bottom:${s.caixas_y ?? 110}px;display:flex;flex-direction:column;gap:14px;align-items:flex-start">
 ${s.caixas.map((t, i) => `<div class="tt" style="font-size:34px;transform:rotate(${i % 2 ? 1 : -1}deg)">${esc(t)}</div>`).join('')}</div>
${s.credito ? `<div class="ser" style="position:absolute;right:56px;bottom:${(s.caixas_y ?? 110) + 10 + s.caixas.length * 74}px;font-size:30px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.7)">${esc(s.credito)}</div>` : ''}`,

  // Final: foto real do Allan + lista numerada das soluções + CTA
  solucoes: (s) => `<div style="position:absolute;left:40px;right:40px;top:40px;height:${s.foto_h || 560}px;border-radius:36px;overflow:hidden;box-shadow:0 20px 50px -20px rgba(0,0,0,.35)">
  <div style="position:absolute;inset:0;background:url(${foto(s)}) ${ROSTO.x}% ${s.foco_y ?? 40}%/cover"></div>
  <div style="position:absolute;left:28px;bottom:24px" class="tt"><span style="font-size:30px">${esc(s.legenda || '')}</span></div></div>
<div style="position:absolute;top:${(s.foto_h || 560) + 76}px;left:56px;right:56px">
 <div class="imp" style="font-size:${s.tam_imp || 64}px">${esc(s.titulo_imp)}</div>
 <div style="display:flex;flex-direction:column;gap:12px;margin-top:22px">
 ${s.itens.map((t, i) => `<div style="display:flex;align-items:center;gap:18px;background:#fff;border:3px solid #141414;border-radius:16px;padding:16px 22px;box-shadow:5px 5px 0 #141414">
  <span class="imp" style="font-size:44px;color:${CORES[i % CORES.length]};min-width:34px">${i + 1}</span><span style="font-family:'Instrument Serif',serif;font-size:36px;line-height:1.15">${esc(t)}</span></div>`).join('')}
 </div>
 ${s.cta ? `<div style="margin-top:22px;text-align:center"><div class="tt" style="font-size:32px;background:#141414;color:#fff">${esc(s.cta)}</div></div>` : ''}</div>`,

  // Capa dividida ANTES | DEPOIS com título Impact no topo
  split: (s) => `<div style="position:absolute;top:400px;left:40px;right:40px;bottom:96px;display:flex;gap:12px">
 ${[[s.img_a, '#FF3B30', 'ANTES', 'grayscale(.25) brightness(.95)'], [s.img_b, '#12B886', 'DEPOIS', 'saturate(1.08)']].map(([im, cor, t, f]) => `<div style="flex:1;position:relative;border-radius:28px;overflow:hidden;box-shadow:0 18px 40px -18px rgba(0,0,0,.4)">
  <div style="position:absolute;inset:0;background:url(../${im}) center/cover;filter:${f}"></div>
  <div class="imp" style="position:absolute;top:18px;left:18px;background:${cor};color:#fff;font-size:44px;padding:8px 18px;border-radius:12px">${t}</div></div>`).join('')}</div>
<div style="position:absolute;top:56px;left:56px;right:56px;text-align:center">
 <div class="ser" style="font-size:38px;color:#6b6257">${esc(s.kicker || '')}</div>
 <div class="imp" style="font-size:${s.tam_imp || 84}px;margin-top:10px">${esc(s.titulo_imp)}</div></div>
${s.legenda ? `<div style="position:absolute;left:0;right:0;bottom:${s.legenda_y ?? 140}px;text-align:center"><div class="tt" style="font-size:38px;transform:rotate(-2deg)">${esc(s.legenda)}</div></div>` : ''}`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_tiktok.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i]; k = i;
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>
${R[s.tipo](s)}<div class="ft"><span>ALLAN PORTO ®</span><span>${i + 1}/${n}</span></div></body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

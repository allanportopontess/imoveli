// Carrossel "influencer" claro (pedido do Allan em 11/10): fundo cinza-claro pontilhado, cabeçalho de perfil,
// título bold com marca-texto, palavra em serifa itálica, foto recortada do Allan, cards brancos.
// Uso: node viral.mjs <pasta-do-post>  → lê posts/<pasta>/viral.json e gera slide-01.jpg … (1080x1350)
// Marcação nos textos: **x** = marca-texto · *x* = serifa itálica na cor de destaque
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'viral.json'), 'utf8'));
const AC = c.acento || '#C2834F';
const HL = c.marca_texto || '#F6D2B0';
const RECORTE = '../' + (c.recorte || 'img/allan-retrato.png');
const ROSTO = c.rosto || { x: 50, y: 38 }; // rosto no recorte, em %
const TAG = c.tag || '';

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>')
  .replace(/\*(.+?)\*/g, '<i>$1</i>')
  .replace(/\n/g, '<br>');

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;color:#121212;font-family:Inter,sans-serif;
  background:#F3F3F1;background-image:radial-gradient(#d6d6d2 1.6px,transparent 1.8px);background-size:30px 30px}
mark{background:linear-gradient(180deg,transparent 52%,${HL} 52%,${HL} 92%,transparent 92%);color:inherit;padding:0 4px}
i{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;color:${AC};letter-spacing:0}
.hd{position:absolute;top:56px;left:64px;right:64px;display:flex;align-items:center;justify-content:space-between}
.me{display:flex;align-items:center;gap:16px}
.av{width:72px;height:72px;border-radius:50%;overflow:hidden;position:relative;background:#ddd;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.12)}
.av img{position:absolute;width:240px;left:${36 - 240 * ROSTO.x / 100}px;top:${36 - 300 * ROSTO.y / 100}px}
.nm{font:800 28px Inter}.nm span{display:inline-block;width:24px;height:24px;border-radius:50%;background:#1d9bf0;color:#fff;font-size:15px;text-align:center;line-height:24px;margin-left:6px;vertical-align:3px}
.us{font:400 22px Inter;color:#777;margin-top:2px}
.tag{font:700 20px Inter;letter-spacing:.08em;text-transform:uppercase;border:2px solid #121212;border-radius:99px;padding:10px 20px}
.h{font-family:Inter;font-weight:800;letter-spacing:-2.5px;line-height:1.04}
.h i{font-size:1.12em;letter-spacing:-1px}
.card{background:#fff;border-radius:26px;box-shadow:0 12px 34px -10px rgba(0,0,0,.18)}
.ft{position:absolute;left:64px;right:64px;bottom:44px;display:flex;align-items:center;justify-content:space-between;font:600 22px Inter;color:#555}
.dots{display:flex;gap:8px}.dots b{width:10px;height:10px;border-radius:50%;background:#c9c9c4}.dots b.on{width:34px;border-radius:6px;background:${AC}}
.stk{position:absolute;background:#121212;color:#fff;font:800 28px Inter;padding:14px 22px;border-radius:14px;box-shadow:0 10px 24px rgba(0,0,0,.25)}
.foto{position:absolute;-webkit-mask-image:linear-gradient(180deg,#000 78%,transparent 100%),linear-gradient(90deg,transparent 0%,#000 22%,#000 78%,transparent 100%);-webkit-mask-composite:source-in;mask-image:linear-gradient(180deg,#000 78%,transparent 100%),linear-gradient(90deg,transparent 0%,#000 22%,#000 78%,transparent 100%);mask-composite:intersect}`;

const header = () => `<div class="hd"><div class="me"><div class="av"><img src="${RECORTE}"></div>
<div><div class="nm">Allan Porto</div><div class="us">@allanporto_arquitetura</div></div></div>
${TAG ? `<div class="tag">${esc(TAG)}</div>` : ''}</div>`;
const footer = (i, n) => `<div class="ft"><div class="dots">${Array.from({ length: n }, (_, k) => `<b class="${k === i - 1 ? 'on' : ''}"></b>`).join('')}</div>
<div>${i < n ? 'arrasta →' : 'salva ↓'}</div></div>`;

const R = {
  capa: (s) => `<div style="position:absolute;left:50%;bottom:-120px;width:900px;height:900px;margin-left:-450px;border-radius:50%;background:${HL};opacity:.75"></div>
<img class="foto" src="${RECORTE}" style="left:50%;bottom:0;height:${s.foto_h || 780}px;transform:translateX(-50%)">
<div style="position:absolute;top:186px;left:64px;right:64px">
 <div class="h" style="font-size:${s.tam || 92}px">${esc(s.titulo)}</div>
 ${s.sub ? `<div style="font:500 34px/1.35 Inter;color:#444;margin-top:22px;max-width:900px">${esc(s.sub)}</div>` : ''}</div>
${s.selo ? `<div class="stk" style="right:56px;bottom:${s.selo_y || 300}px;transform:rotate(4deg)">${esc(s.selo)}</div>` : ''}`,

  lista: (s) => `<img class="foto" src="${RECORTE}" style="right:-110px;bottom:0;height:700px">
<div style="position:absolute;top:186px;left:64px;right:64px"><div class="h" style="font-size:${s.tam || 78}px">${esc(s.titulo)}</div></div>
<div style="position:absolute;top:${s.lista_y || 470}px;left:64px;width:${s.lista_w || 700}px;display:flex;flex-direction:column;gap:20px">
 ${s.itens.map(t => { const em = t.split(' ')[0]; return `<div class="card" style="display:flex;align-items:center;gap:22px;padding:22px 26px">
  <span style="flex:none;width:68px;height:68px;border-radius:18px;background:#F3F3F1;font-size:36px;display:flex;align-items:center;justify-content:center">${em}</span>
  <span style="font:700 34px/1.2 Inter">${esc(t.slice(em.length + 1))}</span></div>`; }).join('')}</div>`,

  tweet: (s) => `<div class="card" style="position:absolute;left:64px;right:64px;top:50%;transform:translateY(-50%);padding:52px 54px 40px">
 <div class="me"><div class="av" style="width:96px;height:96px"><img src="${RECORTE}" style="width:320px;left:${48 - 320 * ROSTO.x / 100}px;top:${48 - 400 * ROSTO.y / 100}px"></div>
 <div><div class="nm" style="font-size:34px">Allan Porto</div><div class="us" style="font-size:26px">@allanporto_arquitetura</div></div></div>
 <div style="font:500 44px/1.36 Inter;margin-top:36px;letter-spacing:-.5px">${esc(s.texto)}</div>
 ${s.rodape ? `<div style="font:400 26px/1.4 Inter;color:#777;margin-top:30px">${esc(s.rodape)}</div>` : ''}
 <div style="display:flex;gap:56px;border-top:1px solid #eee;margin-top:34px;padding-top:26px;font:500 28px Inter;color:#777"><span>💬</span><span>🔁</span><span>❤️</span><span>🔖</span></div></div>`,

  fala: (s) => `<div style="position:absolute;left:-160px;bottom:-200px;width:820px;height:820px;border-radius:50%;background:${HL};opacity:.75"></div>
<img class="foto" src="${RECORTE}" style="left:-170px;bottom:0;height:${s.foto_h || 760}px">
<div style="position:absolute;top:186px;left:64px;right:64px"><div class="h" style="font-size:${s.tam || 84}px">${esc(s.titulo)}</div></div>
<div class="card" style="position:absolute;right:64px;top:${s.balao_y || 560}px;width:560px;padding:36px 38px;border-bottom-left-radius:6px">
 <div style="font:600 36px/1.35 Inter">${esc(s.balao)}</div></div>
${s.selo ? `<div class="stk" style="right:64px;bottom:${s.selo_y || 170}px;transform:rotate(-3deg)">${esc(s.selo)}</div>` : ''}`,

  checklist: (s) => `<div style="position:absolute;top:186px;left:64px;right:64px">
 <div class="h" style="font-size:${s.tam || 84}px">${esc(s.titulo)}</div>
 <div style="display:flex;flex-direction:column;gap:24px;margin-top:60px">
 ${s.itens.map(t => `<div class="card" style="display:flex;align-items:center;gap:24px;padding:32px 30px;font:700 38px Inter">
  <span style="flex:none;width:50px;height:50px;border-radius:14px;background:${AC};color:#fff;font:800 30px Inter;display:flex;align-items:center;justify-content:center">✓</span>${esc(t)}</div>`).join('')}
 </div>${s.nota ? `<div style="font:500 26px/1.4 Inter;color:#777;margin-top:34px">${esc(s.nota)}</div>` : ''}</div>`,

  cta: (s) => `<div style="position:absolute;left:50%;bottom:-160px;width:860px;height:860px;margin-left:-430px;border-radius:50%;background:${HL};opacity:.75"></div>
<img class="foto" src="${RECORTE}" style="left:50%;bottom:0;height:${s.foto_h || 780}px;transform:translateX(-50%)">
<div style="position:absolute;top:186px;left:64px;right:64px;text-align:center">
 <div class="h" style="font-size:${s.tam || 88}px">${esc(s.titulo)}</div>
 <div style="display:flex;gap:16px;justify-content:center;margin-top:36px">
 ${s.botoes.map((t, k) => `<div style="font:800 30px Inter;padding:18px 28px;border-radius:99px;${k === 0 ? `background:#121212;color:#fff` : `background:#fff;box-shadow:0 8px 22px -8px rgba(0,0,0,.2)`}">${esc(t)}</div>`).join('')}
 </div></div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_viral.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>
${R[s.tipo](s)}${header()}${footer(i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

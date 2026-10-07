// Gera peças no estilo "anúncio de autoridade" (título condensado em 2 cores, texto à esquerda,
// foto recortada à direita, botão de ação). Uso: node anuncio.mjs <pasta-do-post>
// Lê posts/<pasta>/anuncio.json e gera:
//   feed.jpg (1080x1350, feed e anúncio 4:5) · story.jpg (1080x1920, story e anúncio 9:16)
//   slide-01.jpg … (carrossel: slide 1 = feed.jpg, depois os slides de "carrossel")
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const a = JSON.parse(readFileSync(join(dir, 'anuncio.json'), 'utf8'));
const AC = a.acento || '#C2834F';

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/__(.+?)__/g, '<u>$1</u>')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/\n/g, '<br>');

const base = (w, h, extra) => `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;position:relative;overflow:hidden;font-family:Inter,sans-serif;color:#1b1b1b;
     background:radial-gradient(120% 80% at 80% 55%,#ffffff 0%,#f1eeea 60%,#e7e2dc 100%)}
.h{font-family:Anton,sans-serif;text-transform:uppercase;line-height:.98;letter-spacing:-.5px}
.h .l2{color:${AC}}
b{font-weight:800}
u{text-decoration-thickness:3px;text-underline-offset:5px}
.foto{position:absolute;right:-30px;object-fit:contain;object-position:center bottom;-webkit-mask-image:linear-gradient(180deg,#000 66%,transparent 97%),linear-gradient(90deg,transparent 0%,#000 16%);-webkit-mask-composite:source-in;mask-image:linear-gradient(180deg,#000 66%,transparent 97%),linear-gradient(90deg,transparent 0%,#000 16%);mask-composite:intersect}
.btn{position:absolute;left:56px;right:56px;background:${AC};color:#fff;font-family:Anton,sans-serif;text-transform:uppercase;
     text-align:center;border-radius:6px;box-shadow:0 14px 30px -14px ${AC}}
.sb{position:absolute;left:0;right:0;text-align:center;color:#333}
.sig{position:absolute;left:56px;font-size:24px;font-weight:600;color:#555}
${extra}
</style></head><body>`;

function feed() {
  return base(1080, 1350, `
.h{position:absolute;left:56px;right:40px;top:58px;font-size:112px}
.col{position:absolute;left:56px;width:540px;top:330px;z-index:2}
.big{font-size:33px;line-height:1.2;font-weight:800}
.small{font-size:19px;color:#444;margin-top:10px}
.body p{font-size:26px;line-height:1.32;margin-top:22px}
.foto{top:380px;height:770px;width:620px}
.btn{bottom:150px;font-size:48px;padding:22px 0;z-index:3}
.sb{bottom:96px;font-size:24px}
.sig{bottom:34px}`) + `
<div class="h"><div>${esc(a.linha1)}</div><div class="l2">${esc(a.linha2)}</div></div>
<img class="foto" src="../${a.foto}">
<div class="col"><div class="big">${esc(a.destaque)}</div><div class="small">${esc(a.apoio)}</div>
<div class="body">${a.texto.map(t => `<p>${esc(t)}</p>`).join('')}</div></div>
<div class="btn">${esc(a.botao)}</div><div class="sb">${esc(a.sub_botao)}</div>
<div class="sig">ALLAN PORTO ® · ${esc(a.assinatura || 'Arquiteto · CAU-PE A166156-6')}</div></body></html>`;
}

function story() {
  return base(1080, 1920, `
.h{position:absolute;left:56px;right:40px;top:240px;font-size:140px}
.col{position:absolute;left:56px;width:530px;top:590px;z-index:2}
.big{font-size:38px;line-height:1.22;font-weight:800}
.small{font-size:21px;color:#444;margin-top:12px}
.body p{font-size:30px;line-height:1.34;margin-top:30px}
.foto{top:720px;height:800px;width:580px}
.btn{bottom:470px;font-size:54px;padding:26px 0;z-index:3}
.sb{bottom:410px;font-size:27px}
.sig{bottom:350px;left:0;right:0;text-align:center}
.fade{display:none}`) + `
<div class="h"><div>${esc(a.linha1)}</div><div class="l2">${esc(a.linha2)}</div></div>
<img class="foto" src="../${a.foto}">
<div class="fade"></div>
<div class="col"><div class="big">${esc(a.destaque)}</div><div class="small">${esc(a.apoio)}</div>
<div class="body">${a.texto.map(t => `<p>${esc(t)}</p>`).join('')}</div></div>
<div class="btn">${esc(a.botao)}</div><div class="sb">${esc(a.sub_botao)}</div>
<div class="sig">ALLAN PORTO ® · ${esc(a.assinatura || 'Arquiteto · CAU-PE A166156-6')}</div></body></html>`;
}

function slide(s, i, total) {
  const cta = s.tipo === 'cta';
  return base(1080, 1350, `
.n{position:absolute;left:56px;top:70px;font-family:Anton,sans-serif;font-size:120px;color:${AC};line-height:1}
.h{position:absolute;left:56px;right:56px;top:${cta ? 110 : 230}px;font-size:${cta ? 118 : 96}px}
.t{position:absolute;left:56px;right:${cta ? 470 : 56}px;top:${cta ? 470 : 520}px;font-size:${cta ? 34 : 44}px;line-height:1.42}
.t p+p{margin-top:24px}
.foto{top:440px;height:720px;width:560px;opacity:${cta ? 1 : 0}}
.btn{bottom:150px;font-size:44px;padding:22px 0;z-index:3}
.sb{bottom:96px;font-size:24px}
.pg{position:absolute;right:56px;bottom:34px;font-size:24px;font-weight:600;color:#555}
.sig{bottom:34px}`) + `
${s.numero ? `<div class="n">${esc(s.numero)}</div>` : ''}
<div class="h"><div>${esc(s.linha1)}</div><div class="l2">${esc(s.linha2 || '')}</div></div>
<img class="foto" src="../${a.foto}">
<div class="t">${[].concat(s.texto).map(t => `<p>${esc(t)}</p>`).join('')}</div>
${cta ? `<div class="btn">${esc(s.botao || a.botao)}</div><div class="sb">${esc(s.sub_botao || a.sub_botao)}</div>` : ''}
<div class="sig">ALLAN PORTO ®</div><div class="pg">${i}/${total}</div></body></html>`;
}

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch();
async function shot(html, w, h, out) {
  const tmp = join(ROOT, 'fonts', '_anuncio.html'); writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  // Título: reduz a fonte até cada linha caber numa linha só
  await p.evaluate(() => document.querySelectorAll('.h').forEach(h => {
    let fs = parseFloat(getComputedStyle(h).fontSize);
    const wraps = () => [...h.children].some(d => d.getClientRects().length && d.offsetHeight > fs * 1.25);
    while (wraps() && fs > 40) { fs -= 2; h.style.fontSize = fs + 'px'; }
  }));
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); await p.close(); unlinkSync(tmp);
  console.log(out);
}
await shot(feed(), 1080, 1350, 'feed.jpg');
await shot(story(), 1080, 1920, 'story.jpg');
const slides = a.carrossel || [];
copyFileSync(join(dir, 'feed.jpg'), join(dir, 'slide-01.jpg'));
for (let i = 0; i < slides.length; i++)
  await shot(slide(slides[i], i + 2, slides.length + 1), 1080, 1350, `slide-${String(i + 2).padStart(2, '0')}.jpg`);
await b.close();

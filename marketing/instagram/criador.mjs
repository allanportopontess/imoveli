// Carrossel "estilo criador" (referência: @copfybr): foto do Allan em tela cheia, título serifado com
// palavra em itálico, legendas em caixa preta, cards estilo tweet. Uso: node criador.mjs <pasta-do-post>
// Lê posts/<pasta>/criador.json e gera slide-01.jpg … (1080x1350)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'criador.json'), 'utf8'));
const AC = c.acento || '#C2834F';
const FOTO = '../' + c.foto;           // foto principal (rosto)
const ROSTO = c.rosto || { x: 50, y: 52 }; // posição do rosto na foto, em %

const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  .replace(/\*(.+?)\*/g, '<i>$1</i>')
  .replace(/\n/g, '<br>');

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:#111;color:#fff;font-family:Inter,sans-serif}
.bg{position:absolute;inset:0;background-size:cover;background-repeat:no-repeat}
.sh{position:absolute;inset:0}
.kick{font-family:Inter;font-weight:600;font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:#d9cfc4}
.ser{font-family:'Instrument Serif',serif;font-weight:400;line-height:1.02;letter-spacing:-.5px}
.ser i{font-style:italic;color:#fff}
.bar{height:6px;width:300px;background:${AC};border-radius:3px;margin:26px auto 0}
.box{display:inline-block;background:#0b0b0b;color:#fff;font-family:Inter;font-weight:600;padding:14px 24px;border-radius:8px;line-height:1.25}
.box b{color:${AC};font-weight:800}
.sub{font-family:Inter;font-weight:800;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.85),0 0 3px rgba(0,0,0,.9)}
.pg{position:absolute;right:48px;bottom:40px;font:600 22px Inter;color:rgba(255,255,255,.75)}
.sig{position:absolute;left:48px;bottom:40px;font:600 22px Inter;color:rgba(255,255,255,.75);letter-spacing:.06em}
.av{width:110px;height:110px;border-radius:50%;overflow:hidden;position:relative;border:3px solid ${AC};flex:none}
.av img{position:absolute;width:330px;left:${55 - 330 * ROSTO.x / 100}px;top:${55 - 440 * ROSTO.y / 100}px}
.who{display:flex;align-items:center;gap:22px}
.who .n{font:800 34px Inter}.who .n span{display:inline-block;width:30px;height:30px;border-radius:50%;background:${AC};color:#fff;font-size:20px;text-align:center;line-height:30px;margin-left:8px;vertical-align:4px}
.who .u{font:400 26px Inter;color:#9a9a9a;margin-top:4px}`;

const page = (inner, i, n, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet">
<style>${css}${extra}</style></head><body>${inner}<div class="sig">ALLAN PORTO ®</div><div class="pg">${i}/${n}</div></body></html>`;

const R = {
  // Foto em tela cheia + título no topo + legenda no meio-baixo
  capa: (s) => `<div class="bg" style="background-image:url(${FOTO});background-position:${ROSTO.x}% ${s.foco_y ?? 70}%"></div>
<div class="sh" style="background:linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.55) 30%,rgba(0,0,0,0) 52%,rgba(0,0,0,0) 72%,rgba(0,0,0,.55) 100%)"></div>
<div style="position:absolute;top:84px;left:60px;right:60px;text-align:center">
 <div class="kick">${esc(s.kicker)}</div>
 <div class="ser" style="font-size:${s.tam || 104}px;margin-top:22px">${esc(s.titulo)}</div><div class="bar"></div></div>
${s.legenda ? `<div class="sub" style="position:absolute;left:60px;right:60px;bottom:${s.legenda_y ?? 150}px;text-align:center;font-size:44px">${esc(s.legenda)}</div>` : ''}`,

  // Fundo desfocado + recorte do Allan à direita + caixas pretas empilhadas à esquerda
  lista: (s) => `<div class="bg" style="background-image:url(${FOTO});background-position:center;filter:blur(18px) brightness(.45);transform:scale(1.1)"></div>
<img src="../${s.recorte}" style="position:absolute;right:-90px;bottom:0;height:860px;-webkit-mask-image:linear-gradient(180deg,#000 75%,transparent 100%)">
<div style="position:absolute;top:96px;left:60px;right:60px">
 <div class="ser" style="font-size:88px">${esc(s.titulo)}</div><div class="bar" style="margin:22px 0 0"></div></div>
<div style="position:absolute;top:${s.lista_y || 430}px;left:60px;display:flex;flex-direction:column;gap:22px;align-items:flex-start">
 ${s.itens.map(t => `<div class="box" style="font-size:38px;box-shadow:0 10px 30px rgba(0,0,0,.4)">${esc(t)}</div>`).join('')}</div>`,

  // Card estilo tweet com avatar do Allan
  tweet: (s) => `<div class="bg" style="background-image:url(${FOTO});background-position:center;filter:blur(26px) brightness(.3);transform:scale(1.15)"></div>
<div style="position:absolute;left:60px;right:60px;top:50%;transform:translateY(-55%);background:#0d0d0d;border:1px solid #2a2a2a;border-radius:28px;padding:56px 56px 48px;box-shadow:0 30px 80px rgba(0,0,0,.6)">
 <div class="who"><div class="av"><img src="${FOTO}"></div><div><div class="n">Allan Porto<span>✓</span></div><div class="u">@allanporto_arquitetura</div></div></div>
 <div style="font:500 44px/1.38 Inter;margin-top:40px">${esc(s.texto)}</div>
 ${s.rodape ? `<div style="font:400 26px Inter;color:#8a8a8a;margin-top:36px">${esc(s.rodape)}</div>` : ''}</div>`,

  // Rosto em close + título serifado + legendas em caixa preta
  close: (s) => `<div class="bg" style="background-image:url(${FOTO});background-size:${s.zoom || 150}%;background-position:${ROSTO.x}% ${s.foco_y ?? 58}%"></div>
<div class="sh" style="background:linear-gradient(180deg,rgba(0,0,0,.85) 0%,rgba(0,0,0,.4) 34%,rgba(0,0,0,0) 50%,rgba(0,0,0,0) 62%,rgba(0,0,0,.75) 100%)"></div>
<div style="position:absolute;top:90px;left:60px;right:60px;text-align:center">
 <div class="ser" style="font-size:${s.tam || 96}px">${esc(s.titulo)}</div><div class="bar"></div></div>
<div style="position:absolute;left:60px;right:60px;bottom:${s.caixas_y ?? 130}px;display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center">
 ${s.caixas.map(t => `<div class="box" style="font-size:36px">${esc(t)}</div>`).join('')}</div>`,

  // Checklist em cards
  checklist: (s) => `<div style="position:absolute;inset:0;background:radial-gradient(90% 60% at 50% 0%,#2a1d14 0%,#111 70%)"></div>
<div style="position:absolute;top:90px;left:60px;right:60px">
 <div class="who"><div class="av"><img src="${FOTO}"></div><div><div class="n">Allan Porto<span>✓</span></div><div class="u">${esc(s.sub || 'arquiteto · regularização de imóveis')}</div></div></div>
 <div class="ser" style="font-size:92px;margin-top:48px">${esc(s.titulo)}</div><div class="bar" style="margin:22px 0 0"></div>
 <div style="display:flex;flex-direction:column;gap:18px;margin-top:48px">
 ${s.itens.map((t, k) => `<div style="display:flex;align-items:center;gap:24px;background:#1b1b1b;border:1px solid #2c2c2c;border-radius:18px;padding:24px 28px;font:600 36px Inter">
  <span style="flex:none;width:52px;height:52px;border-radius:12px;background:${AC};color:#111;font:800 28px Inter;display:flex;align-items:center;justify-content:center">${k + 1}</span>${esc(t)}</div>`).join('')}
 </div>${s.nota ? `<div style="font:400 26px/1.4 Inter;color:#8a8a8a;margin-top:40px">${esc(s.nota)}</div>` : ''}</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_criador.html');
for (let i = 0; i < c.slides.length; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, page(R[s.tipo](s), i + 1, c.slides.length));
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

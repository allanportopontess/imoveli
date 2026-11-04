// Carrossel "vibe" (Allan, 04/11): claro, jovem e instagramável. Fotos luminosas com pessoas reais sorrindo,
// tipografia robusta de estúdio de arquitetura (Syne ExtraBold) + itálico serifado (Instrument Serif) no destaque,
// cores vivas, cards arredondados, adesivos girados. Mantém a narrativa gancho → cenas → virada → fecho.
// Uso: node vibe.mjs <pasta> → lê posts/<pasta>/vibe.json. Em textos, *x* = itálico colorido, **x** = marca-texto.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'vibe.json'), 'utf8'));
const PALETAS = {
  coral: { fundo: '#FFF4EC', cor: '#FF5A3C', cor2: '#FFC93C', tinta: '#141414' },
  cobalto: { fundo: '#EEF3FF', cor: '#2B5BFF', cor2: '#FF8FB8', tinta: '#101320' },
  lima: { fundo: '#F6F8EA', cor: '#3FA34D', cor2: '#C6F24E', tinta: '#121512' },
  rosa: { fundo: '#FFF0F5', cor: '#E8447A', cor2: '#FFD23F', tinta: '#1A1015' },
};
const P = PALETAS[c.paleta || 'coral'];
const LUZ = 'brightness(1.06) saturate(1.12) contrast(1.02)';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*([\s\S]+?)\*\*/g, '<mark>$1</mark>').replace(/\*([\s\S]+?)\*/g, '<i>$1</i>').replace(/\n/g, ' ');
const bg = (s) => `background:url(../${s.img}) ${s.pos || 'center'}/cover;filter:${s.filtro || LUZ};`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${P.fundo};color:${P.tinta};font-family:'Bricolage Grotesque',Inter,sans-serif}
.h{font-family:Syne,'Archivo Black',sans-serif;font-weight:800;letter-spacing:-.045em;line-height:.98;text-wrap:balance}
.h i{font-family:'Instrument Serif',serif;font-weight:400;font-style:italic;letter-spacing:-.01em;color:${P.cor}}
mark{background:${P.cor2};color:${P.tinta};padding:0 .12em;border-radius:.12em;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.st{position:absolute;font:800 30px 'Bricolage Grotesque';padding:14px 24px;border-radius:99px;box-shadow:0 10px 24px -8px rgba(0,0,0,.35);z-index:4}
.tp{position:absolute;top:44px;left:56px;right:56px;display:flex;justify-content:space-between;align-items:center;font:700 24px 'Bricolage Grotesque';z-index:5}
.dots{display:flex;gap:8px}.dots b{width:12px;height:12px;border-radius:50%;background:currentColor;opacity:.3}.dots b.on{opacity:1;width:30px;border-radius:6px}
.card{border-radius:44px;overflow:hidden;box-shadow:0 30px 60px -28px rgba(0,0,0,.45)}`;

const topo = (i, n, cor) => `<div class="tp" style="color:${cor}"><span>@allanporto_arquitetura</span><span class="dots">${Array.from({ length: n }, (_, k) => `<b class="${k === i - 1 ? 'on' : ''}"></b>`).join('')}</span></div>`;
const adesivo = (s, def) => s.adesivo ? `<div class="st" style="${s.adesivo_pos || def};background:${s.adesivo_cor || P.cor2};color:${P.tinta};transform:rotate(${s.adesivo_rot ?? -6}deg)">${esc(s.adesivo)}</div>` : '';

const R = {
  // Capa: foto clara em tela cheia + título robusto em cima de um bloco de cor
  gancho: (s, i, n) => `<div style="position:absolute;inset:0;${bg(s)}"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.25) 0%,rgba(0,0,0,0) 20%,rgba(0,0,0,0) 55%,rgba(0,0,0,.35) 100%)"></div>
${topo(i, n, '#fff')}
${adesivo(s, 'top:130px;right:56px')}
<div style="position:absolute;left:40px;right:40px;bottom:56px;background:${P.fundo};border-radius:44px;padding:44px 48px 46px">
 ${s.sobre ? `<div style="font:800 24px 'Bricolage Grotesque';letter-spacing:.14em;text-transform:uppercase;color:${P.cor};margin-bottom:18px">${esc(s.sobre)}</div>` : ''}
 <div class="h" style="font-size:${s.tam || 84}px">${esc(s.texto)}</div>
 <div style="font:600 26px 'Bricolage Grotesque';margin-top:24px;opacity:.6">arrasta pro lado →</div></div>`,

  // Cena: card de foto arredondado + frase forte abaixo
  cena: (s, i, n) => `${topo(i, n, P.tinta)}
<div class="card" style="position:absolute;left:40px;right:40px;top:110px;height:${s.foto_h || 800}px"><div style="position:absolute;inset:0;${bg(s)}"></div></div>
${adesivo(s, `top:${(s.foto_h || 800) + 60}px;right:64px`)}
<div style="position:absolute;left:64px;right:64px;top:${(s.foto_h || 800) + 150}px">
 ${s.cap ? `<div style="font:800 24px 'Bricolage Grotesque';letter-spacing:.14em;text-transform:uppercase;color:${P.cor};margin-bottom:14px">${esc(s.cap)}</div>` : ''}
 <div class="h" style="font-size:${s.tam || 66}px">${esc(s.texto)}</div>
 ${s.apoio ? `<div style="font:500 30px/1.35 'Bricolage Grotesque';margin-top:16px;opacity:.75">${esc(s.apoio)}</div>` : ''}</div>`,

  // Virada: fundo de cor cheia, frase gigante, foto recortada redonda
  virada: (s, i, n) => `<div style="position:absolute;inset:0;background:${P.cor}"></div>${topo(i, n, '#fff')}
${s.img ? `<div style="position:absolute;right:-60px;top:120px;width:470px;height:470px;border-radius:50%;overflow:hidden;border:12px solid ${P.cor2}"><div style="position:absolute;inset:0;${bg(s)}"></div></div>` : ''}
<div style="position:absolute;left:64px;right:64px;bottom:120px;color:#fff">
 ${s.cap ? `<div style="font:800 24px 'Bricolage Grotesque';letter-spacing:.14em;text-transform:uppercase;color:${P.cor2};margin-bottom:22px">${esc(s.cap)}</div>` : ''}
 <div class="h" style="font-size:${s.tam || 86}px">${esc(s.texto).replace(/<i>/g, `<i style="color:${P.cor2}">`)}</div></div>`,

  // Lista: foto em cima, itens em pílulas
  lista: (s, i, n) => `${topo(i, n, P.tinta)}
<div class="card" style="position:absolute;left:40px;right:40px;top:110px;height:640px"><div style="position:absolute;inset:0;${bg(s)}"></div></div>
<div style="position:absolute;left:64px;right:64px;top:800px">
 <div class="h" style="font-size:${s.tam || 64}px">${esc(s.texto)}</div>
 <div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:30px">${s.itens.map((t, k) => `<span style="font:700 30px 'Bricolage Grotesque';padding:12px 22px;border-radius:99px;${k % 2 ? `background:${P.cor2};color:${P.tinta}` : `background:${P.tinta};color:#fff`}">${esc(t)}</span>`).join('')}</div></div>`,

  // Fecho: foto clara + pergunta + botão
  fecho: (s, i, n) => `${topo(i, n, P.tinta)}
<div class="card" style="position:absolute;left:40px;right:40px;top:110px;height:700px"><div style="position:absolute;inset:0;${bg(s)}"></div></div>
${adesivo(s, 'top:150px;left:76px')}
<div style="position:absolute;left:64px;right:64px;top:860px">
 <div class="h" style="font-size:${s.tam || 70}px">${esc(s.texto)}</div>
 ${s.cta ? `<div style="display:inline-block;margin-top:30px;background:${P.cor};color:#fff;font:800 32px 'Bricolage Grotesque';padding:18px 34px;border-radius:99px">${esc(s.cta)}</div>` : ''}
 ${s.nota ? `<div style="font:500 22px/1.4 'Bricolage Grotesque';margin-top:16px;opacity:.6">${esc(s.nota)}</div>` : ''}</div>
<div style="position:absolute;left:64px;bottom:40px;font:600 20px 'Bricolage Grotesque';opacity:.55">Allan Porto · Arquiteto · CAU-PE A166156-6</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_vibe.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

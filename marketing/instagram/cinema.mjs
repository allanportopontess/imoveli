// Carrossel "cinema" (Allan, 04/11): evolução dos posts editoriais que ele aprovou (Sombra/Kit).
// Fotografia de arquitetura em tela cheia em TODO slide, tratamento de cor de cinema, tipografia serifada grande
// e narrativa de criador de conteúdo: gancho → cena → virada → detalhe → fecho. Barra de progresso estilo stories.
// Uso: node cinema.mjs <pasta> → lê posts/<pasta>/cinema.json. Em textos, *x* = itálico de destaque.
// Grades: "pb" (preto e branco contrastado), "quente" (dourado de fim de tarde), "frio" (petróleo dessaturado).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'cinema.json'), 'utf8'));
const GRADES = {
  pb: { f: 'grayscale(1) contrast(1.18) brightness(.92)', ac: '#E8E2D6' },
  quente: { f: 'sepia(.22) saturate(.85) contrast(1.08) brightness(.9)', ac: '#E9B872' },
  frio: { f: 'saturate(.55) contrast(1.1) brightness(.88) hue-rotate(-8deg)', ac: '#9FC3C0' },
};
const G = GRADES[c.grade || 'pb'];

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const foto = (s, extra = '') => `<div style="position:absolute;inset:0;background:url(../${s.img}) ${s.pos || 'center'}/cover;filter:${s.filtro || G.f};${extra}"></div>`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:#0d0d0c;color:#fff;font-family:'Inter Tight',Inter,sans-serif}
.sf{font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:-.015em;line-height:.98}
.sf i{font-style:italic;color:${G.ac}}
.cap{font:500 19px 'Inter Tight';letter-spacing:.34em;text-transform:uppercase}
.bar{position:absolute;top:34px;left:56px;right:56px;display:flex;gap:8px;z-index:5}
.bar b{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.28)}.bar b.on{background:#fff}
.who{position:absolute;top:58px;left:56px;right:56px;display:flex;justify-content:space-between;z-index:5;color:rgba(255,255,255,.85)}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.12;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}`;

const topo = (i, n) => `<div class="bar">${Array.from({ length: n }, (_, k) => `<b class="${k < i ? 'on' : ''}"></b>`).join('')}</div>
<div class="who cap"><span>Allan Porto · Arquiteto</span><span>${c.serie || ''}</span></div>`;
const sombra = (a = .55, b = .9) => `<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,${a * .7}) 0%,rgba(0,0,0,0) 24%,rgba(0,0,0,0) 42%,rgba(0,0,0,${b}) 100%)"></div>`;

const R = {
  // Capa: gancho enorme, curiosidade, convite discreto a deslizar
  gancho: (s, i, n) => `${foto(s)}${sombra(.6, .92)}<div class="grain"></div>${topo(i, n)}
<div style="position:absolute;left:64px;right:64px;bottom:118px">
 ${s.sobre ? `<div class="cap" style="color:${G.ac};margin-bottom:28px">${esc(s.sobre)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 132}px">${esc(s.texto)}</div></div>
<div class="cap" style="position:absolute;right:64px;bottom:56px;font-size:16px;color:rgba(255,255,255,.75)">desliza ⟶</div>`,

  // Cena: capítulo + frase grande sobre a foto
  cena: (s, i, n) => `${foto(s)}${sombra(.5, .88)}<div class="grain"></div>${topo(i, n)}
<div style="position:absolute;left:64px;right:64px;bottom:${s.b || 110}px">
 ${s.cap ? `<div class="cap" style="color:${G.ac};margin-bottom:22px">${esc(s.cap)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 92}px">${esc(s.texto)}</div>
 ${s.apoio ? `<div style="font:300 30px/1.4 'Inter Tight';color:rgba(255,255,255,.85);margin-top:22px;max-width:880px">${esc(s.apoio)}</div>` : ''}</div>
${s.credito ? `<div class="cap" style="position:absolute;right:64px;bottom:44px;font-size:13px;color:rgba(255,255,255,.6)">${esc(s.credito)}</div>` : ''}`,

  // Virada: foto escurecida, frase central (o "plot twist")
  virada: (s, i, n) => `${foto(s, 'transform:scale(1.06)')}<div style="position:absolute;inset:0;background:rgba(10,10,9,.72)"></div><div class="grain"></div>${topo(i, n)}
<div style="position:absolute;left:72px;right:72px;top:50%;transform:translateY(-50%);text-align:center">
 ${s.cap ? `<div class="cap" style="color:${G.ac};margin-bottom:34px">${esc(s.cap)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 104}px">${esc(s.texto)}</div></div>`,

  // Detalhe: foto no alto, faixa preta com lista curta (tipo "o que tem dentro")
  detalhe: (s, i, n) => `${foto(s, `bottom:${s.faixa || 520}px`)}<div style="position:absolute;left:0;right:0;bottom:${s.faixa || 520}px;height:200px;background:linear-gradient(180deg,rgba(13,13,12,0),#0d0d0c)"></div><div class="grain"></div>${topo(i, n)}
<div style="position:absolute;left:64px;right:64px;bottom:86px;height:${(s.faixa || 520) - 40}px;display:flex;flex-direction:column;justify-content:flex-end">
 ${s.cap ? `<div class="cap" style="color:${G.ac};margin-bottom:22px">${esc(s.cap)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 78}px">${esc(s.texto)}</div>
 ${s.itens ? `<div style="display:flex;flex-wrap:wrap;gap:12px 28px;margin-top:30px">${s.itens.map(t => `<span style="font:400 28px 'Inter Tight';color:rgba(255,255,255,.88);border-bottom:1.5px solid ${G.ac};padding-bottom:4px">${esc(t)}</span>`).join('')}</div>` : ''}</div>`,

  // Fecho: frase + chamada em linha fina, assinatura
  fecho: (s, i, n) => `${foto(s)}${sombra(.5, .95)}<div class="grain"></div>${topo(i, n)}
<div style="position:absolute;left:64px;right:64px;bottom:150px">
 <div class="sf" style="font-size:${s.tam || 96}px">${esc(s.texto)}</div>
 ${s.cta ? `<div style="display:inline-block;margin-top:40px;border:1.5px solid ${G.ac};border-radius:99px;padding:16px 30px;font:500 28px 'Inter Tight';color:#fff">${esc(s.cta)}</div>` : ''}
 ${s.nota ? `<div style="font:300 22px/1.45 'Inter Tight';color:rgba(255,255,255,.7);margin-top:18px">${esc(s.nota)}</div>` : ''}</div>
<div class="cap" style="position:absolute;left:64px;bottom:60px;font-size:15px;color:rgba(255,255,255,.65)">@allanporto_arquitetura · CAU-PE A166156-6</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_cinema.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

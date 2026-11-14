// Carrossel "minimal" (Allan, 12/11): minimalista, tipografia leve, identidade equilibrada. É o padrão a partir de agora.
// Princípios (UX + Gestalt): uma ideia e um ponto focal por slide; muito espaço negativo; grade e margens idênticas em
// todos os slides (similaridade/continuidade); texto sempre no mesmo lugar (proximidade: rótulo + frase juntos);
// figura/fundo claros (foto limpa sobre papel); hierarquia só por tamanho; sem adesivos, sombras, botões, ícones ou bolinhas.
// Uso: node minimal.mjs <pasta> → lê posts/<pasta>/minimal.json. Em textos, *x* = itálico (único destaque permitido).
// Tipos: capa (foto cheia + 1 frase) | foto (foto emoldurada + rótulo + frase) | frase (frase + foto pequena) | fecho (foto + pergunta + chamada em linha).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'minimal.json'), 'utf8'));
const PAPEL = c.papel || '#F4F2EE', TINTA = '#1E1D1B', CINZA = '#8C877F';
const LUZ = 'brightness(1.03) saturate(.8) contrast(1.02)';
const M = 72; // margem única em todos os slides

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*([\s\S]+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const foto = (s, extra = '') => `background:url(../${s.img}) ${s.pos || 'center'}/cover;filter:${s.filtro || LUZ};${extra}`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${PAPEL};color:${TINTA};font-family:'Inter Tight',sans-serif;font-weight:300}
.t{font-family:'Instrument Serif',serif;font-weight:400;letter-spacing:-.01em;line-height:1.08}
.t i{font-style:italic}
.r{font:300 22px 'Inter Tight';letter-spacing:.22em;text-transform:uppercase;color:${CINZA}}
.n{position:absolute;right:${M}px;bottom:56px;font:300 20px 'Inter Tight';letter-spacing:.2em;color:${CINZA}}`;

const num = (i, n, cor) => `<div class="n"${cor ? ` style="color:${cor}"` : ''}>${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}</div>`;
const R = {
  capa: (s, i, n) => `<div style="position:absolute;inset:0;${foto(s)}"></div>
<div style="position:absolute;inset:auto 0 0 0;height:${s.grad_h || 520}px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,${s.grad || .42}))"></div>
<div class="t" style="position:absolute;left:${M}px;right:${M + 120}px;bottom:150px;color:#fff;font-size:${s.tam || 96}px">${esc(s.texto)}</div>
<div class="r" style="position:absolute;left:${M}px;bottom:72px;color:rgba(255,255,255,.8)">@allanporto_arquitetura</div>${num(i, n, 'rgba(255,255,255,.8)')}`,

  foto: (s, i, n) => `<div style="position:absolute;left:${M}px;right:${M}px;top:${M}px;height:800px;${foto(s)}"></div>
<div style="position:absolute;left:${M}px;right:${M}px;top:${M + 800 + 64}px">
 ${s.rotulo ? `<div class="r" style="margin-bottom:22px">${esc(s.rotulo)}</div>` : ''}
 <div class="t" style="font-size:${s.tam || 72}px">${esc(s.texto)}</div></div>${num(i, n)}`,

  frase: (s, i, n) => `<div class="t" style="position:absolute;left:${M}px;right:${M}px;top:${M + 60}px;font-size:${s.tam || 100}px">${esc(s.texto)}</div>
${s.img ? `<div style="position:absolute;left:${M}px;bottom:${M + 40}px;width:420px;height:520px;${foto(s)}"></div>` : ''}${num(i, n)}`,

  fecho: (s, i, n) => `<div style="position:absolute;left:${M}px;right:${M}px;top:${M}px;height:700px;${foto(s)}"></div>
<div style="position:absolute;left:${M}px;right:${M}px;top:${M + 700 + 64}px">
 <div class="t" style="font-size:${s.tam || 72}px">${esc(s.texto)}</div>
 ${s.cta ? `<div style="margin-top:44px;padding-top:26px;border-top:1px solid ${CINZA};font:300 30px 'Inter Tight';display:flex;justify-content:space-between"><span>${esc(s.cta)}</span><span>→</span></div>` : ''}</div>
<div class="r" style="position:absolute;left:${M}px;bottom:56px;font-size:16px">Allan Porto · Arquiteto · CAU-PE A166156-6</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_minimal.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

// Carrossel "clean" (Allan, 18/11, flat Refúgio Urbano): fundo branco, fotos mais claras em cards arredondados,
// sans-serif moderna (Inter Tight) e detalhes de interface (chips, barra de progresso, botão em pílula), com influência
// do visual de anúncios do Airbnb. Mesmo esquema de minimal.json (tipos capa, foto, frase, lista, fecho).
// Uso: node clean.mjs <pasta> → lê posts/<pasta>/minimal.json. Em textos, *x* = destaque na cor de acento.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'minimal.json'), 'utf8'));
const MK = c.marca || {};
const FUNDO = '#FFFFFF', TINTA = '#222222', CINZA = '#717171', LINHA = '#EBEBEB', ACENTO = MK.acento || '#8B6B4C';
const HANDLE = MK.handle || '', LOCAL = MK.local || '';
const LUZ = 'brightness(1.09) saturate(.86) contrast(.97)';
const M = 64, RAIO = 32;

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*([\s\S]+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const foto = (s, extra = '') => `background:url(../${s.img}) ${s.pos || 'center'}/cover;filter:${s.filtro || LUZ};border-radius:${RAIO}px;${extra}`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${FUNDO};color:${TINTA};font-family:'Inter Tight',Inter,sans-serif}
.t{font:500 72px/1.06 'Inter Tight',sans-serif;letter-spacing:-.035em}
.t i{font-style:normal;color:${ACENTO}}
.chip{display:inline-flex;align-items:center;gap:12px;font:500 22px 'Inter Tight';color:${TINTA};padding:12px 22px;border:1.5px solid ${LINHA};border-radius:99px;background:#fff}
.dot{width:10px;height:10px;border-radius:50%;background:${ACENTO}}
.bar{position:absolute;top:40px;left:${M}px;right:${M}px;display:flex;gap:8px}
.bar b{flex:1;height:4px;border-radius:2px;background:${LINHA}}.bar b.on{background:${TINTA}}
.hd{position:absolute;top:66px;left:${M}px;right:${M}px;display:flex;justify-content:space-between;align-items:center;font:500 22px 'Inter Tight';color:${CINZA}}
.nx{position:absolute;right:${M}px;bottom:${M}px;width:76px;height:76px;border-radius:50%;border:1.5px solid ${LINHA};display:flex;align-items:center;justify-content:center;font:400 34px 'Inter Tight';color:${TINTA};background:#fff}`;

const topo = (i, n) => `<div class="bar">${Array.from({ length: n }, (_, k) => `<b class="${k < i ? 'on' : ''}"></b>`).join('')}</div>
<div class="hd"><span>${HANDLE}</span><span>${String(i).padStart(2, '0')}/${String(n).padStart(2, '0')}</span></div>`;
const prox = (i, n) => (i < n ? '<div class="nx">→</div>' : '');
const T0 = 116; // topo do conteúdo, abaixo da barra

const R = {
  // Capa: card de foto grande + chip de local + título
  capa: (s, i, n) => `${topo(i, n)}
<div style="position:absolute;left:${M}px;right:${M}px;top:${T0}px;height:${s.foto_h || 820}px;${foto(s)}"></div>
<div style="position:absolute;left:${M}px;right:${M}px;top:${T0 + (s.foto_h || 820) + 44}px">
 ${LOCAL ? `<div class="chip" style="margin-bottom:26px"><span class="dot"></span>${esc(s.chip || LOCAL)}</div>` : ''}
 <div class="t" style="font-size:${s.tam_clean || 84}px">${esc(s.texto)}</div></div>${prox(i, n)}`,

  foto: (s, i, n) => `${topo(i, n)}
<div style="position:absolute;left:${M}px;right:${M}px;top:${T0}px;height:780px;${foto(s)}"></div>
<div style="position:absolute;left:${M}px;right:${M + 100}px;top:${T0 + 780 + 44}px">
 ${s.rotulo ? `<div class="chip" style="margin-bottom:24px">${esc(s.rotulo)}</div>` : ''}
 <div class="t" style="font-size:${s.tam_clean || 68}px">${esc(s.texto)}</div></div>${prox(i, n)}`,

  frase: (s, i, n) => `${topo(i, n)}
<div class="t" style="position:absolute;left:${M}px;right:${M}px;top:${T0 + 60}px;font-size:${s.tam_clean || 92}px">${esc(s.texto)}</div>
${s.img ? `<div style="position:absolute;left:${M}px;right:${M}px;bottom:${M + 110}px;height:560px;${foto(s)}"></div>` : ''}${prox(i, n)}`,

  lista: (s, i, n) => `${topo(i, n)}
${s.rotulo ? `<div class="chip" style="position:absolute;left:${M}px;top:${T0 + 40}px">${esc(s.rotulo)}</div>` : ''}
<div class="t" style="position:absolute;left:${M}px;right:${M}px;top:${T0 + 130}px;font-size:${s.tam_clean || 80}px">${esc(s.texto)}</div>
<div style="position:absolute;left:${M}px;right:${M}px;bottom:${M + 130}px;display:flex;flex-direction:column;gap:16px">${s.itens.map((x, k) => `<div style="display:flex;gap:26px;align-items:center;padding:26px 30px;border:1.5px solid ${LINHA};border-radius:24px;font:400 34px 'Inter Tight'"><span style="flex:none;width:52px;height:52px;border-radius:50%;background:#F7F7F7;display:flex;align-items:center;justify-content:center;font:600 22px 'Inter Tight';color:${ACENTO}">${s.letras === false ? '✓' : 'ABCDEFG'[k]}</span><span>${esc(x)}</span></div>`).join('')}</div>${prox(i, n)}`,

  fecho: (s, i, n) => `${topo(i, n)}
<div style="position:absolute;left:${M}px;right:${M}px;top:${T0}px;height:680px;${foto(s)}"></div>
<div style="position:absolute;left:${M}px;right:${M}px;top:${T0 + 680 + 48}px">
 <div class="t" style="font-size:${s.tam_clean || 72}px">${esc(s.texto)}</div>
 ${s.cta ? `<div style="display:inline-flex;align-items:center;gap:18px;margin-top:40px;background:${TINTA};color:#fff;font:500 30px 'Inter Tight';padding:22px 36px;border-radius:99px">${esc(s.cta)} <span style="font-size:30px">→</span></div>` : ''}</div>
${MK.logo ? `<img src="../${MK.logo}" style="position:absolute;right:${M - 40}px;bottom:-20px;height:220px;mix-blend-mode:multiply;filter:brightness(1.07) contrast(1.25);-webkit-mask-image:radial-gradient(closest-side,#000 60%,transparent 100%);mask-image:radial-gradient(closest-side,#000 60%,transparent 100%)">` : ''}
<div style="position:absolute;left:${M}px;bottom:${M}px;font:500 22px 'Inter Tight';color:${CINZA}">${esc(MK.rodape || '')}</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_clean.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

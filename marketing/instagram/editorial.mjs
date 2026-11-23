// Identidade editorial (pedido do Allan em 04/11): fotografia de arquitetura em primeiro plano, textos curtos,
// papel off-white, serifa clássica (Cormorant Garamond) + sans fina (Inter Tight), um único tom de acento.
// Sem cara de "post pronto": nada de etiquetas coloridas, caixas ou ícones.
// Uso: node editorial.mjs <pasta>  → lê posts/<pasta>/editorial.json e gera slide-01.jpg … (1080x1350)
// Tipos: capa | foto | moldura | frase | final. Em textos, *x* = itálico.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'editorial.json'), 'utf8'));
const PAPEL = '#F4F1EC', TINTA = '#1C1B19', CINZA = '#8A847A', ACENTO = c.acento || '#B5652F';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const img = (s) => `background:url(../${s.img}) ${s.pos || 'center'}/cover;${s.filtro ? `filter:${s.filtro};` : ''}`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;background:${PAPEL};color:${TINTA};font-family:'Inter Tight',Inter,sans-serif}
.sf{font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:-.01em;line-height:1.02}
.sf i{font-style:italic;color:inherit}
.cap{font:500 20px 'Inter Tight';letter-spacing:.32em;text-transform:uppercase}
.hd{position:absolute;top:52px;left:72px;right:72px;display:flex;justify-content:space-between;z-index:3}
.lin{display:inline-block;width:56px;height:1.5px;background:${ACENTO};vertical-align:middle;margin-right:18px}`;

const hd = (i, n, cor) => `<div class="hd cap" style="color:${cor}"><span>Allan Porto · Arquitetura</span><span>${String(i).padStart(2, '0')} / ${String(n).padStart(2, '0')}</span></div>`;

const R = {
  // Foto em tela cheia, título em serifa no rodapé
  capa: (s, i, n) => `<div style="position:absolute;inset:0;${img(s)}"></div>
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 50%,rgba(0,0,0,.62) 100%)"></div>
${hd(i, n, '#fff')}
<div style="position:absolute;left:72px;right:72px;bottom:96px;color:#fff">
 ${s.sobre ? `<div class="cap" style="margin-bottom:26px"><span class="lin"></span>${esc(s.sobre)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 104}px">${esc(s.titulo)}</div></div>`,

  // Foto em tela cheia com legenda curta numa faixa de papel
  foto: (s, i, n) => `<div style="position:absolute;inset:0;${img(s)}"></div>
<div style="position:absolute;inset:0 0 auto 0;height:220px;background:linear-gradient(180deg,rgba(0,0,0,.3),rgba(0,0,0,0))"></div>
${hd(i, n, '#fff')}
${s.texto ? `<div style="position:absolute;left:72px;bottom:72px;max-width:760px;background:${PAPEL};padding:26px 32px 28px">
 ${s.num ? `<div class="cap" style="color:${ACENTO};margin-bottom:12px">${esc(s.num)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 50}px">${esc(s.texto)}</div></div>` : ''}
${s.credito ? `<div class="cap" style="position:absolute;right:72px;bottom:40px;font-size:14px;color:rgba(255,255,255,.8);letter-spacing:.2em">${esc(s.credito)}</div>` : ''}`,

  // Papel com foto emoldurada e texto abaixo
  moldura: (s, i, n) => `${hd(i, n, CINZA)}
<div style="position:absolute;left:72px;right:72px;top:120px;height:${s.foto_h || 820}px;${img(s)}"></div>
<div style="position:absolute;left:72px;right:72px;top:${(s.foto_h || 820) + 168}px">
 ${s.num ? `<div class="cap" style="color:${ACENTO};margin-bottom:16px"><span class="lin"></span>${esc(s.num)}</div>` : ''}
 <div class="sf" style="font-size:${s.tam || 60}px">${esc(s.texto)}</div>
 ${s.nota ? `<div style="font:300 26px/1.45 'Inter Tight';color:${CINZA};margin-top:18px;max-width:860px">${esc(s.nota)}</div>` : ''}</div>
${s.credito ? `<div class="cap" style="position:absolute;right:72px;top:${(s.foto_h || 820) + 132}px;font-size:13px;color:${CINZA};letter-spacing:.2em">${esc(s.credito)}</div>` : ''}`,

  // Uma frase no papel, com foto pequena opcional
  frase: (s, i, n) => `${hd(i, n, CINZA)}
${s.img ? `<div style="position:absolute;left:72px;top:150px;width:300px;height:380px;${img(s)}"></div>` : ''}
<div style="position:absolute;left:72px;right:72px;${s.img ? 'top:620px' : 'top:50%;transform:translateY(-50%)'}">
 <div class="sf" style="font-size:${s.tam || 86}px">${esc(s.texto)}</div>
 ${s.assinatura ? `<div class="cap" style="color:${CINZA};margin-top:40px"><span class="lin"></span>${esc(s.assinatura)}</div>` : ''}</div>`,

  // Fechamento: frase curta + chamada discreta + assinatura
  final: (s, i, n) => `${hd(i, n, s.img ? '#fff' : CINZA)}
${s.img ? `<div style="position:absolute;left:0;right:0;top:0;height:560px;${img(s)}"></div><div style="position:absolute;left:0;right:0;top:0;height:200px;background:linear-gradient(180deg,rgba(0,0,0,.35),rgba(0,0,0,0))"></div>` : ''}
<div style="position:absolute;left:72px;right:72px;top:${s.img ? 650 : 360}px">
 <div class="sf" style="font-size:${s.tam || 76}px">${esc(s.texto)}</div>
 ${s.cta ? `<div style="font:500 30px/1.4 'Inter Tight';margin-top:48px;padding-top:28px;border-top:1.5px solid ${ACENTO};max-width:820px">${esc(s.cta)}</div>` : ''}
 ${s.nota ? `<div style="font:300 22px/1.45 'Inter Tight';color:${CINZA};margin-top:14px">${esc(s.nota)}</div>` : ''}</div>
<div class="cap" style="position:absolute;left:72px;bottom:64px;color:${CINZA};font-size:16px">@allanporto_arquitetura · CAU-PE A166156-6</div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || ((await import('node:fs')).existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_editorial.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

// Post de imagem única (Allan, 22/11): foto em tela cheia, sem moldura, cartão ou mock-up. Uma frase e uma linha de apoio.
// Uso: node unica.mjs <pasta> [saida.jpg] → lê posts/<pasta>/unica.json {img,pos,texto,sub,grad,topo}. Em textos, *x* = itálico.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const out = process.argv[3] || join(dir, 'slide-01.jpg');
const c = JSON.parse(readFileSync(join(dir, 'unica.json'), 'utf8'));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*([\s\S]+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>');
const g = c.grad ?? .6;
const html = `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:'Inter Tight',sans-serif;color:#fff;background:#111}
.f{position:absolute;inset:0;background:url(../${c.img}) ${c.pos || 'center'}/cover;filter:brightness(1.04) saturate(.9)}
.g{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,${c.topo ?? .28}) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 48%,rgba(0,0,0,${g}) 100%)}
.t{position:absolute;left:72px;right:72px;bottom:176px;font:500 104px/1.02 'Inter Tight';letter-spacing:-.04em}
.t i{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;letter-spacing:-.01em;font-size:1.08em}
.s{position:absolute;left:72px;right:72px;bottom:96px;font:400 32px 'Inter Tight';opacity:.92;letter-spacing:.01em}
.h{position:absolute;left:72px;top:64px;font:500 26px 'Inter Tight';letter-spacing:.02em;opacity:.95}
</style></head><body><div class="f"></div><div class="g"></div>
<div class="h">@flat_refugiourbano</div>
<div class="t">${esc(c.texto)}</div><div class="s">${esc(c.sub || '')}</div></body></html>`;
const tmp = join(ROOT, 'fonts', '_unica.html'); writeFileSync(tmp, html);
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out, type: 'jpeg', quality: 93 }); await b.close(); unlinkSync(tmp); console.log(out);

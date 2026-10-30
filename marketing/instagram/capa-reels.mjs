// Gera a capa (cover_url) de um Reels: node capa-reels.mjs <pasta-do-post>
// Lê "capa" do post.json { kicker, titulo, sub, selo, foto?, foto_pos? } e salva capa.jpg 1080x1920.
// foto: caminho relativo a marketing/instagram (ex.: img/loja.jpg); foto_pos: background-position (ex.: "47% 50%").
// Texto fica entre y=420 e y=1500: área visível no grid do perfil (3:4) e fora da UI do Reels.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'post.json'), 'utf8')).capa;
const esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
const foto = c.foto ? '../' + c.foto : '';
const html = foto ? fotoHtml() : `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:#16181d;color:#f4efe8;font-family:Montserrat,sans-serif;position:relative;overflow:hidden}
.plan{position:absolute;inset:0;opacity:.13;background-image:linear-gradient(#e0a35a 2px,transparent 2px),linear-gradient(90deg,#e0a35a 2px,transparent 2px);background-size:120px 120px}
.wrap{position:absolute;left:84px;right:84px;top:420px;height:1080px;display:flex;flex-direction:column;justify-content:center;gap:44px}
.k{font-weight:800;font-size:34px;letter-spacing:.22em;color:#e0a35a}
h1{font-family:'Playfair Display',serif;font-size:118px;line-height:1.02}
h1 b{color:#e0a35a}
p{font-size:44px;line-height:1.35;font-weight:600;opacity:.95}
.selo{align-self:flex-start;background:#e0a35a;color:#16181d;font-weight:800;font-size:40px;padding:24px 38px;border-radius:16px}
.sig{position:absolute;left:84px;right:84px;top:1560px;font-size:30px;font-weight:600;opacity:.8}
</style></head><body><div class="plan"></div><div class="wrap">
<div class="k">${esc(c.kicker)}</div><h1>${esc(c.titulo)}</h1><p>${esc(c.sub)}</p><div class="selo">${esc(c.selo)}</div>
</div><div class="sig">ALLAN PORTO ® · Arquiteto de varejo</div></body></html>`;
function fotoHtml() { return `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;background:#16181d;color:#fff;font-family:Montserrat,sans-serif;position:relative;overflow:hidden}
.bg{position:absolute;inset:0;background:url('${foto}') ${c.foto_pos || '50% 50%'}/cover no-repeat}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,15,18,.92) 0%,rgba(14,15,18,.75) 22%,rgba(14,15,18,0) 40%,rgba(14,15,18,0) 62%,rgba(14,15,18,.85) 78%,rgba(14,15,18,.95) 100%)}
.top{position:absolute;left:72px;right:72px;top:270px;display:flex;flex-direction:column;gap:22px}
.k{font-weight:800;font-size:32px;letter-spacing:.22em;color:#e0a35a}
h1{font-family:'Playfair Display',serif;font-size:104px;line-height:1.02;text-shadow:0 4px 24px rgba(0,0,0,.5)}
h1 b{color:#e0a35a}
.bot{position:absolute;left:72px;right:72px;top:1300px;display:flex;flex-direction:column;gap:30px}
p{font-size:40px;line-height:1.3;font-weight:600}
.selo{align-self:flex-start;background:#e0a35a;color:#16181d;font-weight:800;font-size:40px;padding:22px 36px;border-radius:16px}
.tag{position:absolute;left:72px;top:1210px;background:rgba(14,15,18,.7);border:1px solid #e0a35a;color:#f4efe8;font-size:24px;font-weight:600;padding:10px 18px;border-radius:999px}
.sig{position:absolute;left:72px;right:72px;top:1700px;font-size:28px;font-weight:600;opacity:.85}
</style></head><body><div class="bg"></div><div class="sh"></div>
<div class="top"><div class="k">${esc(c.kicker)}</div><h1>${esc(c.titulo)}</h1></div>
${c.tag ? `<div class="tag">${esc(c.tag)}</div>` : ''}
<div class="bot"><p>${esc(c.sub)}</p><div class="selo">${esc(c.selo)}</div></div>
<div class="sig">ALLAN PORTO ® · Arquiteto de varejo</div></body></html>`; }
const tmp = join(ROOT, 'fonts', '_capa.html'); writeFileSync(tmp, html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: join(dir, 'capa.jpg'), type: 'jpeg', quality: 90 }); await b.close(); unlinkSync(tmp);
console.log(join(dir, 'capa.jpg'));

// Fotomontagem: Allan recortado (PNG com transparência) sobre um fundo de loja.
// Uso: node compor.mjs <fundo.jpg> <recorte.png> <saida.jpg> [blur_px=6] [escala=1]
// Aplica profundidade de campo no fundo, ajuste de cor do recorte, sombra de contato e "light wrap".
import { chromium } from 'playwright';
import { writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';
const [bg, fg, out, blur = '6', esc = '1'] = process.argv.slice(2);
const W = 1500, H = 2000;
const html = `<!doctype html><html><body style="margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;background:#000">
<div style="position:absolute;inset:-30px;background:url('file://${resolve(bg)}') center/cover;filter:blur(${blur}px) saturate(.9) brightness(.92)"></div>
<div style="position:absolute;inset:0;background:radial-gradient(70% 55% at 50% 60%,rgba(255,214,170,.10),rgba(0,0,0,.28))"></div>
<div style="position:absolute;left:50%;bottom:-10px;width:${1100 * esc}px;height:160px;margin-left:-${550 * esc}px;background:radial-gradient(closest-side,rgba(0,0,0,.45),transparent);filter:blur(20px)"></div>
<img src="file://${resolve(fg)}" style="position:absolute;left:50%;bottom:0;height:${H * esc}px;transform:translateX(-50%);filter:brightness(.97) contrast(1.03) saturate(.95) drop-shadow(0 0 6px rgba(255,225,190,.35))">
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,200,150,.05),rgba(0,0,0,.06));mix-blend-mode:soft-light"></div>
</body></html>`;
const tmp = resolve('fonts/_compor.html'); writeFileSync(tmp, html);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.screenshot({ path: out, type: 'jpeg', quality: 92 });
await b.close(); unlinkSync(tmp); console.log(out);

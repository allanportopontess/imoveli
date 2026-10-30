// Carrossel "pro/viral" (pedido do Allan em 30/10, referências @spotdesignn, @lobaoresolve e @michamenezes):
// capa clara com tipografia gigante (spot), slides escuros numerados com imagem emoldurada (spot),
// "EVITE ISSO / PREFIRA ISSO" e tabela em fundo amarelo (lobão), frase gigante sobre foto (micha).
// Sempre com imagem em todo slide. Uso: node pro.mjs <pasta>  → lê posts/<pasta>/pro.json
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ILU } from './ilustra.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const dir = join(ROOT, 'posts', process.argv[2]);
const c = JSON.parse(readFileSync(join(dir, 'pro.json'), 'utf8'));
const TEMAS = {
  lima: ['#2BA52A', '#C8F04E', '#F3FFD6'],
  ambar: ['#E86A00', '#FFB547', '#FFE9C2'],
  azul: ['#1F5BFF', '#7FB2FF', '#E2EEFF'],
};
const [A1, A2, A3] = TEMAS[c.tema || 'lima'];
const HANDLE = '@allanporto_arquitetura';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<b class="hl">$1</b>').replace(/\*(.+?)\*/g, '<em class="ac">$1</em>').replace(/\n/g, '<br>');

// Mídia que preenche a caixa: foto (img), ilustração vetorial (ilu: "nome" ou "nome:ok") ou imagem de esquema
const midia = (s, extra = '') => {
  if (s.ilu) { const [n, v] = s.ilu.split(':'); return `<div style="position:absolute;inset:0;${extra}">${ILU[n](v === 'ok')}</div>`; }
  return `<div style="position:absolute;inset:0;background:url(../${s.img}) ${s.pos || 'center'}/cover;${s.filtro ? `filter:${s.filtro};` : ''}${extra}"></div>`;
};
const ruido = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const css = `*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter,sans-serif}
.tt{font-family:'Inter Tight',Inter,sans-serif;font-weight:900;letter-spacing:-.04em;word-spacing:.08em;line-height:.9}
.nz{position:absolute;inset:0;background-image:${ruido};pointer-events:none}
.an{font-family:Anton,Impact,sans-serif;text-transform:uppercase;line-height:.95;letter-spacing:.2px}
.sc{font-family:'Caveat Brush',cursive}
.grad{background:linear-gradient(90deg,${A1},${A2} 55%,${A3});-webkit-background-clip:text;background-clip:text;color:transparent}
em.ac{font-style:normal;color:${A2}}
b.hl{background:${A2};color:#111;padding:0 8px;border-radius:6px}
.hdr{position:absolute;top:34px;left:44px;right:44px;display:flex;align-items:center;gap:20px;font:600 24px Inter;z-index:5}
.hdr i{flex:1;height:2px;background:currentColor;opacity:.8}
.dots{position:absolute;bottom:44px;left:0;right:0;display:flex;justify-content:center;gap:10px;z-index:5}
.dots b{width:20px;height:20px;border-radius:50%;border:2.5px solid currentColor}.dots b.on{background:currentColor}
.cred{font:italic 400 24px Inter;opacity:.75}`;

const header = (i, n, cor) => `<div class="hdr" style="color:${cor}"><span>${HANDLE}</span><i></i><span>${i}/${n}</span></div>`;
const dots = (i, n, cor) => `<div class="dots" style="color:${cor}">${Array.from({ length: n }, (_, k) => `<b class="${k === i - 1 ? 'on' : ''}"></b>`).join('')}</div>`;

const R = {
  // Capa clara estilo @spotdesignn: sobretítulo cinza, linhas gigantes, uma linha preenchida com imagem, frase manuscrita, imagem com barras coloridas
  capa_spot: (s, i, n) => `<div style="position:absolute;inset:0;background:#EDEDEA"></div><div class="nz"></div>
<div style="position:absolute;top:34px;left:44px;right:44px;display:flex;justify-content:space-between;align-items:center;font:600 24px Inter;color:#222">
 <span>${HANDLE}</span><span style="font-family:'Archivo Black';font-size:28px;letter-spacing:.12em">ALLAN PORTO</span><span>Arquiteto</span></div>
<div style="position:absolute;top:118px;left:30px;right:30px;text-align:center">
 <div class="tt" style="font-size:36px;color:#8C8C8C;letter-spacing:-.04em;text-transform:uppercase">${esc(s.sobre)}</div>
 ${s.linhas.map(l => `<div class="tt" style="font-size:${l.tam || s.tam || 150}px;text-transform:uppercase;margin-top:6px;${l.img ? `background:url(../${l.img}) center/cover;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:2px #111` : 'color:#111'}">${esc(l.t)}</div>`).join('')}
 ${s.script ? `<div class="sc" style="font-size:${s.script_tam || 96}px;color:#111;margin-top:4px;line-height:1">${esc(s.script)}</div>` : ''}</div>
<div style="position:absolute;left:70px;right:70px;bottom:0;height:${s.barras_h || 560}px;display:flex;gap:26px">
 ${['#FF3D3D', '#7BE04A', '#B57CFF', '#FF9A3D', '#2FD3C4'].map(cc => `<div style="flex:1;border-radius:26px 26px 0 0;background:linear-gradient(180deg,${cc},${cc}aa);opacity:.95"></div>`).join('')}</div>
<div style="position:absolute;left:110px;right:110px;bottom:70px;height:${s.foto_h || 470}px;border-radius:30px;overflow:hidden;border:8px solid #fff;box-shadow:0 30px 60px -20px rgba(0,0,0,.55);transform:rotate(-2deg)">${midia(s)}</div>
${s.recorte ? `<img src="../${s.recorte}" style="position:absolute;${s.recorte_x != null ? `left:${s.recorte_x}px` : 'left:50%;transform:translateX(-50%)'};bottom:0;height:${s.recorte_h || 640}px;filter:drop-shadow(0 20px 40px rgba(0,0,0,.45))">` : ''}
${s.etiqueta ? `<div style="position:absolute;right:70px;bottom:${(s.foto_h || 470) + 30}px;background:#fff;border:3px solid #111;border-radius:10px;padding:10px 18px;font:800 26px Inter;transform:rotate(6deg);box-shadow:0 8px 20px rgba(0,0,0,.25)">${esc(s.etiqueta)}</div>` : ''}
${s.credito ? `<div class="cred" style="position:absolute;left:120px;bottom:30px;color:#222">${esc(s.credito)}</div>` : ''}`,

  // Slide escuro numerado estilo @spotdesignn: #n apagado, título em degradê, card de etiquetas, imagem emoldurada
  numero: (s, i, n) => `<div style="position:absolute;inset:0;background:radial-gradient(70% 45% at 50% 0%,${A1}40 0%,transparent 70%),#111"></div><div class="nz"></div>
${header(i, n, '#fff')}
<div style="position:absolute;top:110px;left:50px;right:50px;text-align:center">
 ${s.num ? `<div class="tt" style="font-size:150px;color:rgba(255,255,255,.13)">${esc(s.num)}</div>` : `<div style="height:40px"></div>`}
 <div class="tt grad" style="font-size:${s.tam || 104}px;margin-top:${s.num ? 0 : 20}px;padding-bottom:8px">${esc(s.titulo)}</div></div>
<div style="position:absolute;left:80px;right:80px;top:${s.chips_y || 520}px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:26px 30px;display:flex;flex-wrap:wrap;gap:14px;justify-content:center">
 ${s.chips.map((t, k) => `<span style="font:700 30px Inter;padding:10px 18px;border-radius:8px;${[`background:#0F1A0B;color:#fff`, `background:${A1}55;color:#fff`, `background:${A1};color:#fff`, `background:${A2};color:#111`, `background:${A3};color:#111`][k % 5]}">${esc(t)}</span>`).join('')}</div>
<div style="position:absolute;left:80px;right:80px;bottom:${s.foto_b || 140}px;height:${s.foto_h || 430}px;border-radius:20px;overflow:hidden;border:3px solid ${A2};box-shadow:0 0 50px -10px ${A1}88">${midia(s)}</div>
${s.credito ? `<div class="cred" style="position:absolute;right:90px;bottom:${(s.foto_b || 140) - 40}px;color:#ddd">${esc(s.credito)}</div>` : ''}
${dots(i, n, '#fff')}`,

  // Foto real em tela cheia com tratamento (grade), etiqueta, título curto, 1 linha de apoio e marcação da ação
  // (círculo com brilho em s.marca {x,y,r} e/ou cota em s.cota {x1,y1,x2,y2,txt,cor}, coordenadas do slide)
  foco: (s, i, n) => `${midia(s, s.grade ? `filter:${s.grade}` : 'filter:contrast(1.08) saturate(1.05)')}
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 48%,rgba(0,0,0,.88) 100%)"></div>
${s.marca ? `<div style="position:absolute;left:${s.marca.x - s.marca.r}px;top:${s.marca.y - s.marca.r}px;width:${s.marca.r * 2}px;height:${s.marca.r * 2}px;border-radius:50%;border:7px solid ${s.marca.cor || A2};box-shadow:0 0 0 6px rgba(0,0,0,.25),0 0 40px ${s.marca.cor || A2}"></div>` : ''}
${s.cota ? (() => { const q = s.cota, cor = q.cor || A2, ang = Math.atan2(q.y2 - q.y1, q.x2 - q.x1) * 180 / Math.PI, len = Math.hypot(q.x2 - q.x1, q.y2 - q.y1);
    return `<div style="position:absolute;left:${q.x1}px;top:${q.y1 - 4}px;width:${len}px;height:8px;background:${cor};transform-origin:0 50%;transform:rotate(${ang}deg);box-shadow:0 0 18px ${cor};border-radius:4px"></div>
<div style="position:absolute;left:${(q.x1 + q.x2) / 2}px;top:${(q.y1 + q.y2) / 2}px;transform:translate(-50%,-50%);background:${cor};color:#111;font:900 44px 'Inter Tight';letter-spacing:-.02em;padding:8px 20px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.45)">${esc(q.txt)}</div>`; })() : ''}
${header(i, n, '#fff')}
<div style="position:absolute;left:64px;right:64px;bottom:${s.texto_b || 120}px;color:#fff">
 ${s.tag ? `<div style="display:inline-block;background:${s.tag_cor || A2};color:${s.tag_cor ? '#fff' : '#111'};font:800 26px Inter;letter-spacing:.06em;text-transform:uppercase;padding:8px 16px;border-radius:8px;margin-bottom:18px">${esc(s.tag)}</div>` : ''}
 <div class="tt" style="font-size:${s.tam || 104}px;text-shadow:0 6px 30px rgba(0,0,0,.4)">${esc(s.titulo)}</div>
 ${s.sub ? `<div style="font:500 36px/1.3 Inter;margin-top:18px;color:#eee;max-width:900px">${esc(s.sub)}</div>` : ''}
 ${s.credito ? `<div class="cred" style="margin-top:14px;color:#bbb">${esc(s.credito)}</div>` : ''}</div>
${dots(i, n, '#fff')}`,

  // Frase gigante sobre foto em tela cheia (estilo @michamenezes) + CTA
  frase: (s, i, n) => `${midia(s)}
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.15) 40%,rgba(0,0,0,.55) 100%)"></div>
${header(i, n, '#fff')}
${s.sobre ? `<div style="position:absolute;top:110px;left:0;right:0;text-align:center"><span style="display:inline-block;background:#fff;color:#111;font:800 28px Inter;padding:10px 22px;border-radius:99px">${esc(s.sobre)}</span></div>` : ''}
<div style="position:absolute;left:30px;right:30px;top:${s.y || 190}px;text-align:center;color:#fff;text-shadow:0 6px 30px rgba(0,0,0,.35)">
 ${s.linhas.map(l => `<div class="tt" style="font-size:${s.tam || 150}px;line-height:.86">${esc(l)}</div>`).join('')}</div>
${s.cta ? `<div style="position:absolute;left:70px;right:70px;bottom:${s.cta_b || 120}px;text-align:center"><div style="display:inline-block;background:${A2};color:#111;font:800 36px/1.25 Inter;padding:20px 30px;border-radius:20px;box-shadow:0 14px 40px rgba(0,0,0,.4)">${esc(s.cta)}</div>
 ${s.cta2 ? `<div style="margin-top:16px;font:700 28px Inter;color:#fff">${esc(s.cta2)}</div>` : ''}</div>` : ''}
${dots(i, n, '#fff')}`,

  // EVITE ISSO / PREFIRA ISSO (estilo @lobaoresolve): fundo amarelo, título condensado, pílula branca, ilustração
  duplo: (s, i, n) => `<div style="position:absolute;inset:0;background:#F7C51E"></div><div class="nz"></div>
${s.blocos.map((b, k) => `<div style="position:absolute;left:0;right:0;top:${k ? 672 : 26}px;height:640px;text-align:center">
 <div class="an" style="font-size:${b.tam || 112}px;color:#2A1205">${esc(b.titulo)}</div>
 <div style="display:inline-block;margin-top:2px;background:#FFF7E3;color:#2A1205;font:800 38px Inter;padding:10px 26px;border-radius:18px;position:relative;z-index:2;box-shadow:0 6px 0 rgba(0,0,0,.08)">${esc(b.pilula)}</div>
 <div style="position:absolute;left:24px;right:24px;top:${b.tam ? b.tam + 92 : 196}px;bottom:${k ? 30 : 0}px;border-radius:44px;overflow:hidden;margin-top:-26px">${midia(b)}</div></div>`).join('')}
<div style="position:absolute;right:40px;top:30px;background:rgba(42,18,5,.75);color:#fff;font:700 22px Inter;padding:6px 14px;border-radius:99px;z-index:5">${i}/${n}</div>`,

  // Tabela (estilo @lobaoresolve): título em caixa preta, ilustração, coluna escura com lista e selos amarelos
  tabela: (s, i, n) => `<div style="position:absolute;inset:0;background:#F7C51E"></div><div class="nz"></div>
<div style="position:absolute;left:30px;top:40px;width:640px;background:#151515;border:4px solid #F7C51E;outline:4px solid #151515;border-radius:24px;padding:24px 26px;text-align:center;z-index:3">
 <div class="an" style="font-size:${s.tam || 78}px;color:#fff">${esc(s.titulo)}</div>
 ${s.sub ? `<div class="an" style="font-size:${s.sub_tam || 44}px;color:#F7C51E;margin-top:6px">${esc(s.sub)}</div>` : ''}</div>
<div style="position:absolute;left:30px;top:${s.foto_y || 360}px;width:640px;height:${s.foto_h || 640}px;border-radius:30px;overflow:hidden;border:5px solid #151515">${midia(s)}</div>
${s.selo ? `<div style="position:absolute;left:30px;bottom:40px;width:640px;background:#F7C51E;border:4px solid #151515;border-radius:18px;padding:16px 22px;display:flex;align-items:center;gap:18px;box-shadow:0 8px 0 #151515">
 <div style="flex:none;width:64px;height:64px;border-radius:14px;border:4px solid #151515;display:flex;align-items:center;justify-content:center;font:900 36px Inter">✓</div>
 <div class="an" style="font-size:34px;color:#151515;text-align:left">${esc(s.selo)}</div></div>` : ''}
<div style="position:absolute;right:0;top:0;bottom:0;width:380px;background:#1A1A1A;display:flex;flex-direction:column">
 <div style="background:#F3EBD8;padding:30px 18px 22px;text-align:center"><div class="an" style="font-size:${s.col_tam || 50}px;color:#151515">${esc(s.col)}</div></div>
 <div style="flex:1;display:flex;flex-direction:column;justify-content:space-evenly;padding:0 18px">
 ${s.itens.map((t, k) => `<div style="display:flex;align-items:center;gap:16px;border-bottom:3px solid #F7C51E55;padding:12px 0">
  <span class="an" style="flex:none;min-width:60px;height:60px;padding:0 8px;background:#F7C51E;border-radius:8px;color:#151515;font-size:40px;display:flex;align-items:center;justify-content:center">${esc(Array.isArray(t) ? t[0] : String(k + 1))}</span>
  <span class="an" style="font-size:${s.item_tam || 36}px;color:#fff;line-height:1.05;text-align:left">${esc(Array.isArray(t) ? t[1] : t)}</span></div>`).join('')}</div>
 <div style="padding:16px;text-align:center;font:600 20px Inter;color:#aaa">${HANDLE} · ${i}/${n}</div></div>`,
};

for (const f of readdirSync(dir)) if (/^slide-\d+\.jpg$/.test(f)) unlinkSync(join(dir, f));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = join(ROOT, 'fonts', '_pro.html');
const n = c.slides.length;
for (let i = 0; i < n; i++) {
  const s = c.slides[i];
  writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><link href="fonts.css" rel="stylesheet"><style>${css}</style></head><body>${R[s.tipo](s, i + 1, n)}</body></html>`);
  await p.goto('file://' + tmp, { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready);
  const out = `slide-${String(i + 1).padStart(2, '0')}.jpg`;
  await p.screenshot({ path: join(dir, out), type: 'jpeg', quality: 92 }); console.log(out);
}
await b.close(); unlinkSync(tmp);

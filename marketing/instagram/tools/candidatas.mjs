// Folha de contato das fotos candidatas de uma busca: node tools/candidatas.mjs <saida_da_busca.txt> <pasta_saida>
// Lê a saída de tools/busca_unsplash.py, baixa miniaturas e gera cand-N.jpg (3 buscas por folha, 12 fotos cada).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const [arq, out] = process.argv.slice(2); mkdirSync(out + '/th', { recursive: true });
const bl = []; for (const l of readFileSync(arq, 'utf8').split('\n')) {
  if (l.startsWith('##')) bl.push([l.slice(3), []]);
  else if (l.includes('|') && bl.length) { const id = l.split(' ')[0], u = l.split('| ').pop().trim(); bl.at(-1)[1].push([id, u]); }
}
for (const [, it] of bl) for (const [id, u] of it.slice(0, 12)) { const p = `${out}/th/${id}.jpg`; if (!existsSync(p)) try { execFileSync('curl', ['-s', '-o', p, u + '?w=320&q=60&fm=jpg']); } catch {} }
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || ((await import('node:fs')).existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) }); const p = await b.newPage({ viewport: { width: 1300, height: 800 } }); let k = 0;
for (let s = 0; s < bl.length; s += 3) {
  writeFileSync(out + '/c.html', `<body style="margin:0;background:#111;color:#fff;font:14px sans-serif;width:1300px">${bl.slice(s, s + 3).map(([q, it]) => `<div style="padding:4px 8px;font-weight:bold;color:#ff0">${q}</div><div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px">${it.slice(0, 12).map(([i]) => `<div style="width:210px"><img src="file://${out}/th/${i}.jpg" style="width:210px;height:150px;object-fit:cover"><div>${i}</div></div>`).join('')}</div>`).join('')}</body>`);
  await p.goto('file://' + out + '/c.html'); await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/cand-${k++}.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
}
await b.close(); console.log(k);

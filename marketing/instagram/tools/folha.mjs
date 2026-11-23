// Folha de contato de posts renderizados: node tools/folha.mjs <pasta_saida> <data1> <data2> ...
import { chromium } from 'playwright';
import { writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..', 'posts') + '/';
const [out, ...datas] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || ((await import('node:fs')).existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) }); const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
for (const d of datas) {
  const n = readdirSync(R + d).filter(f => /^slide-\d+\.jpg$/.test(f)).sort();
  writeFileSync(out + '/f.html', `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(${Math.min(n.length, 3)},480px);gap:10px;padding:10px;width:max-content">${n.map(f => `<img src="file://${R}${d}/${f}" width="480" height="600">`).join('')}</body>`);
  await p.goto('file://' + out + '/f.html'); await p.waitForTimeout(500);
  await p.screenshot({ path: `${out}/folha-${d}.jpg`, type: 'jpeg', quality: 85, fullPage: true });
}
await b.close();

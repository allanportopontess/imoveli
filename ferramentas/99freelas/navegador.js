// Abre o Chromium e faz login com FREELAS_EMAIL / FREELAS_PASSWORD (variáveis de ambiente).
const path = require('path');
const fs = require('fs');
let playwright;
try { playwright = require('playwright'); } catch {
  playwright = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'));
}
const cfg = require('./config');
fs.mkdirSync(path.join(__dirname, 'dados'), { recursive: true });
const SESSAO = path.join(__dirname, 'dados', 'sessao.json'); // cookies; nunca versionar

async function abrir() {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext(fs.existsSync(SESSAO) ? { storageState: SESSAO } : {});
  const page = await context.newPage();
  return { browser, context, page };
}

async function garantirLogin({ context, page }) {
  const s = cfg.seletores;
  await page.goto(cfg.baseUrl, { waitUntil: 'domcontentloaded' });
  if (await page.locator(s.logadoIndicador).count()) return;
  const { FREELAS_EMAIL, FREELAS_PASSWORD } = process.env;
  if (!FREELAS_EMAIL || !FREELAS_PASSWORD) throw new Error('Defina FREELAS_EMAIL e FREELAS_PASSWORD como segredos do ambiente.');
  await page.goto(cfg.baseUrl + cfg.loginPath, { waitUntil: 'domcontentloaded' });
  await page.fill(s.loginEmail, FREELAS_EMAIL);
  await page.fill(s.loginSenha, FREELAS_PASSWORD);
  await Promise.all([page.waitForLoadState('networkidle'), page.click(s.loginBotao)]);
  if (!(await page.locator(s.logadoIndicador).count())) {
    await page.screenshot({ path: path.join(__dirname, 'dados', 'falha-login.png'), fullPage: true });
    throw new Error('Login não confirmado (captcha/2FA/seletor?). Veja dados/falha-login.png');
  }
  await context.storageState({ path: SESSAO });
}

module.exports = { abrir, garantirLogin };

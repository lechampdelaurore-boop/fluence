// Teste le site EN LIGNE au format téléphone : une séance complète (3 lectures, question, mots ratés, bilan),
// sans erreur dans la console, sans défilement horizontal, et l'écran de lecture tient dans la hauteur.
// Usage : node tests/telephone.cjs [url]   (captures dans captures/)
const { chromium } = require('playwright');
const fs = require('fs');

const URL = process.argv[2] || 'https://lechampdelaurore-boop.github.io/fluence/';
const SIZES = [[320, 568], [360, 640], [375, 667], [390, 844], [412, 780], [430, 932], [768, 1024]];
const expectedCache = (fs.readFileSync('sw.js', 'utf8').match(/fluence-v\d+/) || [])[0];

(async () => {
  fs.mkdirSync('captures', { recursive: true });
  // Attendre que GitHub Pages serve bien la version du dépôt (même CACHE que sw.js).
  for (let i = 0; ; i++) {
    const live = await fetch(URL + 'sw.js?nocache=' + Date.now()).then(r => r.text()).catch(() => '');
    if (live.includes(expectedCache)) { console.log('Version en ligne : ' + expectedCache); break; }
    if (i >= 18) { console.log('Version en ligne différente de ' + expectedCache + ' après 3 min'); process.exit(1); }
    await new Promise(r => setTimeout(r, 10000));
  }

  const browser = await chromium.launch();
  const lines = ['| Écran | Accueil | Lecture | Séance complète | Console |', '|---|---|---|---|---|'];
  let failed = false;
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(URL + '?nocache=' + Date.now());
    const wide = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const tall = () => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const cell = (ok, why) => (ok ? '✅' : '❌ ' + why);
    let home = '✅', read = '✅', flow = '✅';
    try {
      if (await wide() > 0) home = '❌ défile en largeur';
      await page.screenshot({ path: `captures/${w}x${h}-accueil.png`, fullPage: true });

      // Texte nouveau : préparation, puis lecture 1
      await page.click('#startBtn');
      await page.waitForSelector('#prep:not([hidden])');
      await page.click('#prepGo');
      await page.waitForSelector('#read:not([hidden])');
      await page.waitForTimeout(200);
      const t = await tall(), ww = await wide();
      const btnOk = await page.evaluate(() => { const r = document.querySelector('#goBtn').getBoundingClientRect(); return r.bottom <= window.innerHeight && r.top >= 0; });
      if (t > 0 || ww > 0 || !btnOk) read = cell(false, (t > 0 ? `dépasse de ${t} px ` : '') + (ww > 0 ? 'défile en largeur ' : '') + (!btnOk ? 'bouton caché' : ''));
      await page.click('#goBtn');
      await page.click('#readText .w[data-i="3"]');
      await page.click('#readText .w[data-i="8"]');
      await page.screenshot({ path: `captures/${w}x${h}-lecture.png` });
      await page.waitForTimeout(500);
      await page.click('#stopBtn');
      await page.click('#okBtn');
      await page.waitForSelector('#result:not([hidden])');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `captures/${w}x${h}-resultat.png`, fullPage: true });
      // Question de compréhension
      await page.click('#resNext');
      await page.waitForSelector('#quiz:not([hidden])');
      await page.click('#quizChoices [data-c="0"]');
      await page.waitForSelector('#read:not([hidden])', { timeout: 4000 });
      // Lectures 2 et 3
      for (let n = 2; n <= 3; n++) {
        await page.click('#goBtn');
        if (n === 2) await page.click('#readText .w[data-i="3"]');
        await page.waitForTimeout(300);
        await page.click('#stopBtn');
        await page.click('#okBtn');
        await page.waitForSelector('#result:not([hidden])');
        await page.click('#resNext');
      }
      await page.waitForSelector('#missed:not([hidden])');
      await page.screenshot({ path: `captures/${w}x${h}-mots-rates.png`, fullPage: true });
      await page.click('#missedDone');
      await page.waitForSelector('#done:not([hidden])');
      await page.waitForTimeout(600);
      await page.screenshot({ path: `captures/${w}x${h}-bilan.png`, fullPage: true });
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('marc.fluence.data')));
      if (!saved || saved.hist.length !== 3 || saved.texts.t01.sessions !== 1) flow = '❌ progrès mal enregistrés';
      if (await wide() > 0) flow = '❌ bilan défile en largeur';
    } catch (e) {
      flow = '❌ ' + e.message.split('\n')[0];
    }
    const con = errors.length ? '❌ ' + errors[0] : '✅';
    if ([home, read, flow, con].some(c => c !== '✅')) failed = true;
    lines.push(`| ${w}×${h} | ${home} | ${read} | ${flow} | ${con} |`);
    await page.close();
  }
  await browser.close();
  const report = lines.join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '## Test téléphone (site en ligne)\n\n' + report + '\n');
  process.exit(failed ? 1 : 0);
})();

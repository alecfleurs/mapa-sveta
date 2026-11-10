// Playwright provera: tri veličine ekrana, početna, istraživač, kartice, zum, odsečen tekst.
// Pokretanje: node tools/test.js [folder za slike]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OUT = process.argv[2] || path.join(__dirname, '..', 'build', 'shots');
fs.mkdirSync(OUT, { recursive: true });
const FILE = 'file://' + path.join(__dirname, '..', 'build', 'mapa-sveta.html');
const SIZES = [[1280, 800], [1280, 720], [1024, 600]];
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  let fail = 0;
  const bad = (m) => { fail++; console.log('  GREŠKA:', m); };
  for (const [w, h] of SIZES) {
    console.log(`== ${w}x${h}`);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && !/fonts|ERR_TUNNEL|ERR_INTERNET/.test(m.text()) && errs.push(m.text()));
    await pg.goto(FILE); await pg.waitForTimeout(500);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-1-home.png` });
    // dugmad i tekst na početnoj moraju da stanu
    const over = await pg.evaluate(() => [...document.querySelectorAll('#home .hm-box, #home .bigbtn, .hm-reset, .hm-src')].filter((e) => { const r = e.getBoundingClientRect(); return r.left < 0 || r.top < 0 || r.right > innerWidth || r.bottom > innerHeight || e.scrollWidth > e.clientWidth + 1; }).map((e) => e.className));
    if (over.length) bad('početna izlazi iz ekrana: ' + over.join(', '));
    await pg.click('.b-explore'); await pg.waitForTimeout(700);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-2-world.png` });
    // dodir na Srbiju
    const pos = await pg.evaluate(() => { const r = document.querySelector('.cty[data-id="SRB"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await pg.touchscreen.tap(pos[0], pos[1]); await pg.waitForTimeout(900);
    const t1 = await pg.evaluate(() => document.querySelector('.card.on h2')?.textContent);
    if (!t1 || !t1.startsWith('Србија')) bad('kartica Srbije se nije otvorila: ' + t1);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-3-serbia.png` });
    // komšija preko čipa
    await pg.click('.card.on [data-go="HUN"]'); await pg.waitForTimeout(900);
    const t2 = await pg.evaluate(() => document.querySelector('.card.on h2')?.textContent);
    if (!t2 || !t2.startsWith('Мађарска')) bad('čip suseda ne radi: ' + t2);
    // kontinent
    await pg.click('.cbtn >> nth=1'); await pg.waitForTimeout(900);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-4-asia.png` });
    // okean
    await pg.evaluate(() => document.querySelector('.card .cx').click());
    await pg.click('.mbtn >> nth=2'); await pg.waitForTimeout(800);
    const oc = await pg.evaluate(() => { const t = [...document.querySelectorAll('[data-ocean="ATL"]')].find((e) => e.style.display !== 'none'); const r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await pg.touchscreen.tap(oc[0], oc[1]); await pg.waitForTimeout(900);
    const t3 = await pg.evaluate(() => document.querySelector('.card.on h2')?.textContent);
    if (t3 !== 'Атлантски океан') bad('okean: ' + t3);
    // reka sa kartice Srbije
    await pg.evaluate(() => SCREENS.explore.openCountry('SRB')); await pg.waitForTimeout(900);
    const rv = await pg.evaluate(() => [...document.querySelectorAll('.card.on [data-riv]')].map((b) => b.textContent));
    if (!rv.includes('Дунав') || !rv.includes('Сава')) bad('reke Srbije: ' + rv.join(','));
    const nt = await pg.evaluate(() => [...document.querySelectorAll('.card.on .nt')].map((t) => t.querySelector('svg') ? t.textContent : 'BEZ SLIKE ' + t.textContent));
    if (nt.length < 4 || nt.some((t) => t.startsWith('BEZ'))) bad('priroda Srbije: ' + nt.join(' | '));
    await pg.evaluate(() => document.querySelector('.card.on .ntg').scrollIntoView());
    await pg.screenshot({ path: `${OUT}/${w}x${h}-5b-nature.png` });
    await pg.click('.card.on [data-riv="dunav"]'); await pg.waitForTimeout(600);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-5-danube.png` });
    // mala država: Vatikan
    await pg.evaluate(() => SCREENS.explore.openCountry('VAT')); await pg.waitForTimeout(900);
    await pg.screenshot({ path: `${OUT}/${w}x${h}-6-vatican.png` });
    // sve kartice država: tekst ne sme da izlazi iz kartice
    const clipped = await pg.evaluate(async () => {
      const out = [];
      for (const c of WORLD.countries) {
        SCREENS.explore.openCountry(c.id);
        const card = document.querySelector('.card.on');
        for (const e of card.querySelectorAll('h2,.vl,.sm,.ch,.lb,.full')) if (e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().right > card.getBoundingClientRect().right + 1) { out.push(c.id + ':' + e.className + ':' + e.textContent.slice(0, 30)); break; }
      }
      return out;
    });
    if (clipped.length) bad('odsečen tekst u karticama: ' + clipped.slice(0, 12).join(' | ') + (clipped.length > 12 ? ' …' + clipped.length : ''));
    const stars = await pg.evaluate(() => P.stars);
    console.log('  zvezdice posle provere:', stars);
    if (errs.length) bad('JS greške: ' + errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
  console.log(fail ? `NEUSPEŠNO: ${fail}` : 'SVE PROŠLO');
  process.exit(fail ? 1 : 0);
})();

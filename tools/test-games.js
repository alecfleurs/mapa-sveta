// Playwright: odigra svaku igru na svakom nivou (tri veličine ekrana), proverava da se ne zaglavi i da tekst nije odsečen.
// Pokretanje: node tools/test-games.js [folder za slike] [samo jedna veličina: 1]
const path = require('path');
const fs = require('fs');
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OUT = process.argv[2] || path.join(__dirname, '..', 'build', 'shots');
const ONE = process.argv[3] === '1';
const QUICK = process.argv[3] === 'quick'; // samo raspored: nekoliko koraka po igri, na manjim ekranima
fs.mkdirSync(OUT, { recursive: true });
const FILE = 'file://' + path.join(__dirname, '..', 'build', 'mapa-sveta.html');
const SIZES = ONE ? [[1280, 800]] : QUICK ? [[1280, 720], [1024, 600]] : [[1280, 800], [1280, 720], [1024, 600]];
const exe = ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/usr/bin/google-chrome'].find((p) => fs.existsSync(p));

(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  let fail = 0;
  const bad = (m) => { fail++; console.log('  GREŠKA:', m); };
  for (const [w, h] of SIZES) {
    console.log(`== ${w}x${h}`);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto(FILE); await pg.waitForTimeout(300);
    await pg.click('.b-games'); await pg.waitForTimeout(300);
    if (w === 1280 && h === 800) await pg.screenshot({ path: `${OUT}/g-menu.png` });
    const nGames = await pg.evaluate(() => GAMES.length);
    for (let gi = 0; gi < nGames; gi++) {
      for (let lv = 0; lv < 3; lv++) {
        const id = await pg.evaluate((gi) => GAMES[gi].id, gi);
        await pg.evaluate(() => show('games'));
        await pg.click(`.gm-card >> nth=${gi}`); await pg.waitForTimeout(150);
        if (gi === 0 && lv === 0 && w === 1280 && h === 800) await pg.screenshot({ path: `${OUT}/g-levels.png` });
        await pg.click(`.gm-lvbtn >> nth=${lv}`); await pg.waitForTimeout(500);
        let steps = 0, shot = false, clipped = new Set();
        while (steps++ < (QUICK ? 5 : 160)) {
          const st = await pg.evaluate(() => {
            if (document.querySelector('#game .g-end')) return 'end';
            if (document.querySelector('#game .g-pause')) return 'pause';
            if (document.querySelector('#game .q-opt')) return 'quiz';
            if (document.querySelector('#game .g-piece')) return 'puzzle';
            if (document.querySelector('#game .g-chip:not(.placed)')) return 'sort';
            if (document.querySelector('#game .g-card')) return 'mem';
            if (window.__gt && document.querySelector('#game .g-clue')) return 'map';
            return 'wait';
          });
          if (st === 'end') break;
          if (!shot && st !== 'wait' && st !== 'pause' && w >= 1024) {
            await pg.waitForTimeout(700);
            await pg.screenshot({ path: `${OUT}/g-${w}x${h}-${id}-${lv}.png` }); shot = true;
          }
          // odsečen tekst
          const cl = await pg.evaluate(() => [...document.querySelectorAll('#game .q-name, #game .q-big, #game .g-clue, #game .g-chip span, #game .g-front span, #game .q-t')]
            .filter((e) => e.offsetParent && (e.scrollWidth > e.clientWidth + 2 || e.getBoundingClientRect().bottom > innerHeight + 1)).map((e) => e.textContent.slice(0, 25)));
          cl.forEach((t) => clipped.add(t));
          if (st === 'pause') { await pg.click('#game .g-pause .bigbtn'); await pg.waitForTimeout(200); continue; }
          if (st === 'quiz') {
            // ponekad prvo pogrešan odgovor
            if (steps % 3 === 0) await pg.evaluate(() => { const b = document.querySelector('#game .q-opt:not([data-ok]):not(.no)'); b && b.click(); });
            await pg.evaluate(() => { const b = document.querySelector('#game .q-opt[data-ok]'); b && b.click(); });
            await pg.waitForTimeout(1350); continue;
          }
          if (st === 'map') {
            await pg.evaluate(() => window.__gtap(window.__gt));
            await pg.evaluate(() => (window.__gt = null));
            await pg.waitForTimeout(1500); continue;
          }
          if (st === 'puzzle') {
            const pid = await pg.evaluate(() => document.querySelector('#game .g-piece').dataset.pid);
            await pg.click('#game .g-piece >> nth=0'); await pg.waitForTimeout(100);
            await pg.evaluate((pid) => window.__gtap(pid), pid); await pg.waitForTimeout(350); continue;
          }
          if (st === 'sort') {
            // pravo prevlačenje mišem do tačne kutije
            const r = await pg.evaluate(() => {
              const ch = document.querySelector('#game .g-chip:not(.placed)'); const k = C[ch.dataset.cid].cont;
              const a = ch.getBoundingClientRect(), b = document.querySelector(`#game .g-box[data-k="${k}"]`).getBoundingClientRect();
              return [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
            });
            await pg.mouse.move(r[0], r[1]); await pg.mouse.down(); await pg.mouse.move(r[0] + 20, r[1] + 20, { steps: 3 });
            await pg.mouse.move(r[2], r[3], { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(300); continue;
          }
          if (st === 'mem') {
            const ok = await pg.evaluate(() => {
              const cs = [...document.querySelectorAll('#game .g-card:not(.done)')]; if (!cs.length) return false;
              const a = cs[0], b = cs.find((x) => x !== a && x.dataset.cid === a.dataset.cid);
              a.click(); b.click(); return true;
            });
            await pg.waitForTimeout(ok ? 250 : 600); continue;
          }
          await pg.waitForTimeout(400);
        }
        const ended = await pg.evaluate(() => !!document.querySelector('#game .g-end'));
        if (!ended && !QUICK) bad(`${id} nivo ${lv}: nije stigla do kraja`);
        if (clipped.size) bad(`${id} nivo ${lv}: odsečen tekst: ${[...clipped].slice(0, 5).join(' | ')}`);
        const got = await pg.evaluate(() => document.querySelector('#game .g-endst b')?.textContent);
        console.log(`  ${id} ${lv}: ${ended ? 'kraj' : 'ZAGLAVLJENO'} ${got || ''}`);
        if (ended && gi === 0 && lv === 0 && w === 1280 && h === 800) await pg.screenshot({ path: `${OUT}/g-end.png` });
      }
    }
    if (errs.length) bad('JS greške: ' + [...new Set(errs)].join(' | '));
    await ctx.close();
  }
  await browser.close();
  console.log(fail ? `NEUSPEŠNO: ${fail}` : 'SVE PROŠLO');
  process.exit(fail ? 1 : 0);
})();

// ===== Igre: meni, izbor nivoa, zajednički motor, zvezdice, rotacija sadržaja =====
const LEVELS = [
  { n: 'Лакше', c: '#3BAA5C' },
  { n: 'Теже', c: '#F29A2E' },
  { n: 'Најтеже', c: '#E2574C' },
];
const GAMES = []; // popunjava games-list.js: { id, n, ic, d, how: [3 opisa po nivou], start(level, api) }

// ---------- pomoćne funkcije ----------
const rnd = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Ono što je dete najmanje videlo dolazi prvo; među jednako viđenim bira se nasumično.
function fresh(gameKey, pool, n, keyOf = (x) => x.id || x) {
  P.recent = P.recent || {};
  const hist = P.recent[gameKey] || [];
  const cnt = {}; hist.forEach((k, i) => (cnt[k] = (cnt[k] || 0) + 1 + i / 1000));
  return shuffle(pool).sort((a, b) => (cnt[keyOf(a)] || 0) - (cnt[keyOf(b)] || 0)).slice(0, n);
}
function remember(gameKey, key) {
  P.recent = P.recent || {};
  const h = (P.recent[gameKey] = P.recent[gameKey] || []);
  h.push(key); if (h.length > 150) h.splice(0, h.length - 150);
}
// Nivoi država: 1 = poznate (Srbija, susedi i velike poznate), 2 = srednje, 3 = sve
const TIER1 = new Set(['SRB', 'HUN', 'ROU', 'BGR', 'MKD', 'MNE', 'BIH', 'HRV', 'ALB', 'GRC', 'ITA', 'FRA', 'DEU', 'ESP', 'GBR', 'RUS', 'TUR', 'AUT', 'CHE',
  'NLD', 'POL', 'UKR', 'SWE', 'NOR', 'PRT', 'IRL', 'ISL', 'FIN', 'DNK', 'USA', 'CAN', 'MEX', 'BRA', 'ARG', 'PER', 'CHL', 'CHN', 'JPN', 'IND', 'KOR',
  'SAU', 'AUS', 'NZL', 'EGY', 'ZAF', 'KEN', 'MAR', 'NGA', 'IDN', 'MNG', 'KAZ', 'IRN']);
const tierOf = (c) => TIER1.has(c.id) ? 1 : (c.lr <= 4 || c.area > 250000) ? 2 : 3;
const countryPool = (level) => W.countries.filter((c) => tierOf(c) <= level + 1);
// Ometači: na lakšem nivou iz drugih krajeva sveta, na težem iz istog kontinenta, na najtežem najbliži susedi
function distractors(c, level, n, pool = W.countries) {
  let cand = pool.filter((x) => x.id !== c.id);
  if (level === 0) cand = cand.filter((x) => x.cont !== c.cont && tierOf(x) === 1);
  else if (level === 1) { const same = cand.filter((x) => x.cont === c.cont && tierOf(x) <= 2); if (same.length >= n) cand = same; }
  else { cand = cand.filter((x) => x.cont === c.cont).sort((a, b) => Math.hypot(a.lx - c.lx, a.ly - c.ly) - Math.hypot(b.lx - c.lx, b.ly - c.ly)).slice(0, n + 3); }
  if (cand.length < n) cand = pool.filter((x) => x.id !== c.id);
  return shuffle(cand).slice(0, n);
}
const flagImg = (id, cls = '') => `<img class="gflag ${cls}" src="${flagSrc(id)}" alt="">`;
const icon = (code) => (window.ICONS || {})[code] || '';
function silhouette(c, color = '#2E3B4E') {
  const b = c.mb || c.bb, pad = Math.max(b[2] - b[0], b[3] - b[1]) * 0.06;
  return `<svg class="gsil" viewBox="${b[0] - pad} ${b[1] - pad} ${b[2] - b[0] + pad * 2} ${b[3] - b[1] + pad * 2}" preserveAspectRatio="xMidYMid meet"><path d="${c.d}" fill="${color}" fill-rule="evenodd"/></svg>`;
}

// ---------- ekrani: meni igara i igra ----------
SCREENS.games = (() => {
  let built = false, grid;
  function build() {
    built = true;
    const root = $('#games');
    const st = el('div', 'chip-stat'); st.id = 'gmStat';
    root.append(header('Игре', st));
    grid = el('div', 'gm-grid'); root.append(grid);
  }
  function render() {
    $('#gmStat').innerHTML = `⭐ ${P.stars} · ${rank()[2]} ${rank()[1]}`;
    grid.innerHTML = '';
    for (const g of GAMES) {
      const best = (P.best || {})[g.id] || [];
      const ps = (P.stat || {})[g.id], played = ps ? ps.c : 0, rec = Math.max(0, ...best.filter(Boolean));
      const b = el('button', 'gm-card', `<div class="gm-ic">${g.ic}</div><div class="gm-n">${g.n}</div><div class="gm-d">${g.d}</div>
        <div class="gm-pl">${played ? `Играно: ${played}${rec ? ' · рекорд ⭐ ' + rec : ''}` : '<span class="gm-new">Нова</span>'}</div>
        <div class="gm-lv">${LEVELS.map((L, i) => `<i style="background:${best[i] ? L.c : '#E3DCCB'}" title="${L.n}"></i>`).join('')}</div>`);
      b.onclick = () => chooseLevel(g);
      grid.append(b);
    }
  }
  function chooseLevel(g) {
    const ov = el('div', 'gm-ov');
    const box = el('div', 'gm-box');
    box.innerHTML = `<div class="gm-bic">${g.ic}</div><h2>${g.n}</h2><p class="gm-how">${g.d}</p>`;
    const row = el('div', 'gm-lvls');
    LEVELS.forEach((L, i) => {
      const b = el('button', 'gm-lvbtn', `<b>${L.n}</b><span>${g.how[i]}</span>`);
      b.style.background = L.c;
      b.onclick = () => { ov.remove(); GAME.start(g, i); };
      row.append(b);
    });
    const x = el('button', 'gm-x', '×'); x.onclick = () => ov.remove();
    box.append(row, x); ov.append(box);
    ov.onclick = (e) => { if (e.target === ov) ov.remove(); };
    $('#games').append(ov);
  }
  return { enter() { if (!built) build(); render(); } };
})();

// Zajednički motor jedne partije
const GAME = (() => {
  let root, area, stEl, titleEl, cur = null;
  let helpBtn;
  function ensure() {
    if (root) return;
    root = $('#game');
    stEl = el('div', 'chip-stat');
    const h = header('', stEl); titleEl = $('h1', h);
    const homeBtn = h.querySelector('.hbtn'); homeBtn.onclick = () => leave('home');
    const back = el('button', 'hbtn', '🎮 Игре'); back.onclick = () => leave('games');
    h.insertBefore(back, h.children[1]);
    helpBtn = el('button', 'hbtn', '❓ Упутство'); helpBtn.onclick = () => cur && showIntro(cur.g, null);
    h.insertBefore(helpBtn, h.lastChild);
    root.append(h);
    area = el('div', 'g-area'); root.append(area);
  }
  // излазак из игре која још траје тражи потврду
  function leave(to) {
    if (!cur || cur.over) { stop(); show(to); return; }
    const ov = el('div', 'gm-ov');
    ov.innerHTML = `<div class="gm-box"><div class="gm-bic">🚪</div><h2>Излазиш из игре?</h2><p class="gm-how">Звездице које си до сада освојио остају. Игра неће бити записана у дневник.</p><div class="hm-btns"></div></div>`;
    const stay = el('button', 'bigbtn b-explore', 'Остани'); stay.onclick = () => ov.remove();
    const go = el('button', 'bigbtn b-games', 'Изађи'); go.onclick = () => { ov.remove(); stop(); show(to); };
    $('.hm-btns', ov).append(stay, go); root.append(ov);
  }
  function stop() { if (cur && cur.cleanup) cur.cleanup(); cur = null; }
  function upd() { stEl.innerHTML = `⭐ ${cur ? cur.got : 0} · укупно ${P.stars}`; }
  // api koji igra dobija
  function api(g, level) {
    const st = { got: 0, done: 0, total: 14, cleanup: null, g, level, errors: 0, t0: Date.now(), over: false };
    P.stat = P.stat || {}; const ps = (P.stat[g.id] = P.stat[g.id] || { s: 0, c: 0, t: 0 }); ps.s++; save();
    cur = st;
    return {
      area, level,
      setTotal: (n) => { st.total = n; },
      // tačno: prvi pokušaj i brzo = 2 zvezdice, prvi pokušaj = 1; netačno: −1 (nikad ispod 0)
      good: (firstTry, fast) => { const n = firstTry ? (fast ? 2 : 1) : 0; st.got += n; P.stars += n; save(); upd(); return n; },
      bad: () => { st.errors++; if (P.stars > 0) P.stars--; if (st.got > 0) st.got--; save(); upd(); },
      remember: (k) => remember(g.id, k),
      fresh: (pool, n, keyOf) => fresh(g.id, pool, n, keyOf),
      onCleanup: (fn) => { st.cleanup = fn; },
      toast: (m) => toast(m, root),
      // napredak i pauza na svakih 7 pitanja; vraća Promise
      next: () => new Promise((res) => {
        st.done++;
        if (st.done >= st.total) { finish(); return; }
        if (st.done % 7 === 0) pause(res); else res();
      }),
      progress: () => `<div class="g-prog"><i style="width:${(st.done / st.total) * 100}%"></i></div><div class="g-cnt">${st.done + 1} / ${st.total}</div>`,
      finish,
    };
  }
  function pause(res) {
    const ov = el('div', 'gm-ov');
    ov.innerHTML = `<div class="gm-box g-pause"><div class="gm-bic">🧃</div><h2>Браво! Мала пауза.</h2><p class="gm-how">Одмори очи, попиј мало воде. Имаш већ ⭐ ${cur.got}.</p></div>`;
    const b = el('button', 'bigbtn b-explore', 'Настави ▶'); b.onclick = () => { ov.remove(); res(); };
    $('.gm-box', ov).append(b); area.append(ov);
  }
  function finish() {
    const st = cur; if (!st || st.over) return;
    st.over = true;
    const max = st.total * 2, before = rank()[1];
    P.best = P.best || {}; const b = (P.best[st.g.id] = P.best[st.g.id] || []);
    const prev = b[st.level] || 0, newBest = st.got > prev; if (newBest) b[st.level] = st.got;
    const ps = P.stat[st.g.id]; ps.c++; ps.t += Math.min(3600000, Date.now() - st.t0);
    P.hist = P.hist || []; P.hist.unshift({ id: st.g.id, lv: st.level, stars: st.got, max, t: Date.now() }); P.hist = P.hist.slice(0, 40);
    save();
    const nb = checkBadges({ id: st.g.id, level: st.level, errors: st.errors });
    upd();
    const k = rankInfo(), up = before !== k.r[1], pct = st.got / max, n = pct >= 0.75 ? 3 : pct >= 0.45 ? 2 : 1;
    confetti(up || nb.length ? 60 : 36);
    area.innerHTML = '';
    const box = el('div', 'g-end', `<div class="g-bigst">${'★'.repeat(n)}<span>${'★'.repeat(3 - n)}</span></div><h2>Браво, Андрија!</h2>
      <p class="g-endst">Освојио си <b>⭐ ${st.got}</b> од ${max} звездица${newBest ? ' <span class="newbadge">Нови рекорд!</span>' : ''}</p>
      <p class="gm-how">${newBest ? 'Ово је твој најбољи резултат у овој игри.' : 'Твој рекорд у овој игри: ⭐ ' + prev + '.'}${st.errors === 0 ? ' Ниједне грешке!' : ''}</p>
      <div class="rk-box"><div class="rk-ic">${k.r[2]}</div><div><b>${up ? 'Нови чин: ' : 'Твој чин: '}${k.r[1]}</b><span> · укупно ⭐ ${P.stars}</span>${rankMeter()}</div></div>
      ${nb.length ? `<div class="g-nb"><b>Ново признање!</b> ${nb.map((x) => `<span>${x.ic} ${x.n}</span>`).join('')}</div>` : ''}`);
    const row = el('div', 'hm-btns');
    const again = el('button', 'bigbtn b-explore', '🔁 Опет'); again.onclick = () => start(st.g, st.level);
    const other = el('button', 'bigbtn b-games', '🎮 Друга игра'); other.onclick = () => { stop(); show('games'); };
    row.append(again, other); box.append(row); area.append(box);
    if (st.cleanup) st.cleanup(); st.cleanup = null;
  }
  // упутство корак по корак; први пут се приказује пре игре
  function showIntro(g, done) {
    const steps = g.intro || [];
    if (!steps.length) { if (done) done(); return; }
    let i = 0;
    const ov = el('div', 'gm-ov');
    const draw = () => {
      const [vis, txt] = steps[i], last = i === steps.length - 1;
      ov.innerHTML = `<div class="gm-box in-box"><div class="in-vis">${vis}</div><div class="in-txt"><div class="in-guide"><div class="in-pen">${icon('1F427')}</div><div class="in-bubble">${txt}</div></div>
        <div class="in-dots">${steps.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div class="in-row"></div></div></div>`;
      const row = $('.in-row', ov);
      if (i > 0) { const bk = el('button', 'bigbtn b-games in-btn', 'Назад'); bk.onclick = () => { i--; draw(); }; row.append(bk); } else row.append(el('span'));
      const nx = el('button', 'bigbtn b-explore in-btn', last ? (done ? 'Крени!' : 'Разумем') : 'Даље ▶');
      nx.onclick = () => { if (last) { P.intro = P.intro || {}; P.intro[g.id] = 1; save(); ov.remove(); if (done) done(); } else { i++; draw(); } };
      row.append(nx);
    };
    draw(); (root || $('#games')).append(ov);
  }
  function start(g, level) {
    ensure(); stop();
    show('game');
    titleEl.textContent = g.n + ' · ' + LEVELS[level].n;
    area.innerHTML = ''; upd();
    const go = () => { const a = api(g, level); upd(); g.start(level, a); };
    if (!(P.intro || {})[g.id]) showIntro(g, go); else go();
  }
  return { start, showIntro };
})();
SCREENS.game = { enter() {} };

// ---------- kviz motor: pitanje + 3/4 velika odgovora ----------
// q: { key, prompt (html), options: [{ html, ok }], wide (opcije u jednom redu), after (tekst posle tačnog odgovora) }
function quizRun(api, makeQ) {
  const ask = () => {
    const q = makeQ(); if (!q) return api.finish();
    api.remember(q.key);
    api.area.innerHTML = '';
    const wrap = el('div', 'q-wrap');
    const left = el('div', 'q-prompt', api.progress() + q.prompt);
    const opts = el('div', 'q-opts' + (q.options.length === 3 ? ' three' : ''));
    let tries = 0, locked = false; const t0 = performance.now();
    q.options.forEach((o) => {
      const b = el('button', 'q-opt', o.html); if (o.ok) b.dataset.ok = '1';
      b.onclick = () => {
        if (locked || b.classList.contains('no')) return;
        if (o.ok) {
          locked = true; b.classList.add('yes');
          const n = api.good(tries === 0, performance.now() - t0 < 6000);
          api.toast(n === 2 ? '⭐⭐ Супер брзо!' : n === 1 ? '⭐ Тачно!' : '👍 Тачно!');
          if (q.after) left.insertAdjacentHTML('beforeend', `<div class="q-after">${q.after}</div>`);
          setTimeout(() => api.next().then(ask), q.after ? 2200 : 1200);
        } else {
          tries++; b.classList.add('no'); api.bad();
          if (tries >= 2) {
            locked = true;
            [...opts.children].forEach((x, i) => { if (q.options[i].ok) x.classList.add('show'); });
            if (q.after) left.insertAdjacentHTML('beforeend', `<div class="q-after">${q.after}</div>`);
            setTimeout(() => api.next().then(ask), 2400);
          }
        }
      };
      opts.append(b);
    });
    wrap.append(left, opts); api.area.append(wrap);
  };
  ask();
}

// ---------- prevlačenje prstom, uz rezervni način dodir pa dodir ----------
// dnd(el, { onDrop(x, y) → true ako je prihvaćeno, onSelect(el) za dodir })
function dnd(elm, o) {
  elm.style.touchAction = 'none';
  elm.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    const r = elm.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
    let ghost = null, moved = false;
    const mv = (ev) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (!moved && Math.hypot(dx, dy) > 8) {
        moved = true;
        ghost = elm.cloneNode(true); ghost.classList.add('dnd-ghost');
        Object.assign(ghost.style, { width: r.width + 'px', height: r.height + 'px', left: r.left + 'px', top: r.top + 'px' });
        document.body.append(ghost); elm.classList.add('dnd-src');
      }
      if (ghost) ghost.style.transform = `translate(${dx}px,${dy}px) scale(1.05)`;
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      elm.classList.remove('dnd-src');
      if (!moved) { o.onSelect && o.onSelect(elm); return; }
      ghost.style.display = 'none';
      const ok = o.onDrop(ev.clientX, ev.clientY);
      ghost.remove();
      if (!ok) { elm.classList.add('shake'); setTimeout(() => elm.classList.remove('shake'), 500); }
    };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
}

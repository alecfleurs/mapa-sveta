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
      const b = el('button', 'gm-card', `<div class="gm-ic">${g.ic}</div><div class="gm-n">${g.n}</div><div class="gm-d">${g.d}</div>
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
  function ensure() {
    if (root) return;
    root = $('#game');
    stEl = el('div', 'chip-stat');
    const h = header('', stEl); titleEl = $('h1', h);
    const back = el('button', 'hbtn', '🎮 Игре'); back.onclick = () => { stop(); show('games'); };
    h.insertBefore(back, h.children[1]);
    root.append(h);
    area = el('div', 'g-area'); root.append(area);
  }
  function stop() { if (cur && cur.cleanup) cur.cleanup(); cur = null; }
  function upd() { stEl.innerHTML = `⭐ ${cur ? cur.got : 0} у овој игри · укупно ${P.stars}`; }
  // api koji igra dobija
  function api(g, level) {
    const st = { got: 0, done: 0, total: 14, cleanup: null, g, level };
    cur = st;
    return {
      area, level,
      setTotal: (n) => { st.total = n; },
      // tačno: prvi pokušaj i brzo = 2 zvezdice, prvi pokušaj = 1; netačno: −1 (nikad ispod 0)
      good: (firstTry, fast) => { const n = firstTry ? (fast ? 2 : 1) : 0; st.got += n; P.stars += n; save(); upd(); return n; },
      bad: () => { if (P.stars > 0) P.stars--; if (st.got > 0) st.got--; save(); upd(); },
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
    const st = cur; if (!st) return;
    P.best = P.best || {}; const b = (P.best[st.g.id] = P.best[st.g.id] || []);
    const newBest = st.got > (b[st.level] || 0); if (newBest) b[st.level] = st.got;
    save(); upd();
    const r = rank();
    area.innerHTML = '';
    const box = el('div', 'g-end', `<div class="gm-bic">${st.got >= st.total ? '🏆' : '🎉'}</div><h2>Крај игре!</h2>
      <p class="g-endst">Освојио си <b>⭐ ${st.got}</b>${newBest ? ' <span class="newbadge">Нови рекорд!</span>' : ''}</p>
      <p class="gm-how">Твој чин: ${r[2]} ${r[1]} · укупно ⭐ ${P.stars}</p>`);
    const row = el('div', 'hm-btns');
    const again = el('button', 'bigbtn b-explore', '🔁 Опет'); again.onclick = () => start(st.g, st.level);
    const other = el('button', 'bigbtn b-games', '🎮 Друга игра'); other.onclick = () => { stop(); show('games'); };
    row.append(again, other); box.append(row); area.append(box);
    if (st.cleanup) st.cleanup(); st.cleanup = null;
  }
  function start(g, level) {
    ensure(); stop();
    show('game');
    titleEl.textContent = g.n + ' · ' + LEVELS[level].n;
    area.innerHTML = '';
    const a = api(g, level); upd();
    g.start(level, a);
  }
  return { start };
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

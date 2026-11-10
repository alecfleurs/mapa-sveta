// ===== Deset igara =====
const optName = (c, flag) => `${flag ? flagImg(c.id, 'sm') : ''}<span class="q-name">${c.n}</span>`;
const contName = (k) => CONT[k].n;
const gameMap = (host, onTap) => {
  const m = makeMap(host, { onTap });
  ['noNames', 'noCap', 'noLm', 'noAn', 'noSrb'].forEach((cls) => m.layers(cls, false));
  return m;
};

// 1. Где је ово?
GAMES.push({
  id: 'gde', n: 'Где је ово?', ic: '📍', d: 'Пронађи државу на мапи и додирни је.',
  how: ['Видиш заставу и име. Мапа ти показује прави континент.', 'Видиш само име државе.', 'Добијаш траг, на пример главни град. Тражиш на целој мапи.'],
  start(level, api) {
    api.setTotal(14);
    api.area.innerHTML = '';
    const host = el('div', 'g-maphost'); const bar = el('div', 'g-bar'); host.append(bar); api.area.append(host);
    const pool = countryPool(level).filter((c) => level > 0 || !c.small);
    const list = api.fresh(pool, 14);
    let i = 0, tries = 0, t0 = 0, busy = false, target = null;
    const onTapRef = (r) => {
      if (busy || !target || r.type !== 'country') return;
      if (r.id === target.id) {
        busy = true; map.mark(target.id, 'ok');
        const n = api.good(tries === 0, performance.now() - t0 < 8000);
        api.toast(n === 2 ? '⭐⭐ Браво, брзо си нашао!' : '⭐ Тачно! То је ' + target.n);
        setTimeout(() => api.next().then(nextQ), 1300);
      } else {
        tries++; api.bad();
        const w = map.mark(r.id, 'bad'); setTimeout(() => w && w.remove(), 900);
        api.toast('То је ' + C[r.id].n + '. Покушај поново!');
        if (tries >= 3) {
          busy = true; map.mark(target.id, 'show');
          map.flyTo(target.mb, 0, 80, 10);
          setTimeout(() => api.next().then(nextQ), 2600);
        }
      }
    };
    const map = gameMap(host, onTapRef);
    function nextQ() {
      target = list[i++]; if (!target) return api.finish();
      api.remember(target.id); tries = 0; busy = false; map.clearMarks();
      let clue;
      if (level === 0) clue = `${flagImg(target.id, 'sm')}<span>Пронађи: <b>${target.n}</b></span>`;
      else if (level === 1) clue = `<span>Пронађи: <b>${target.n}</b></span>`;
      else clue = `<span>Пронађи државу чији је главни град <b>${target.cap}</b> (${contName(target.cont)})</span>`;
      bar.innerHTML = api.progress() + `<div class="g-clue">${clue}</div>`;
      if (level < 2) map.flyTo(CONT[target.cont].bb, 0, 20, 12); else map.fitWorld();
      t0 = performance.now();
      window.__gt = target.id; window.__gtap = (id) => map.svg && onTapRef({ type: 'country', id });
    }
    setTimeout(nextQ, 100);
  },
});

// 2. Слагалица света
GAMES.push({
  id: 'slagalica', n: 'Слагалица света', ic: '🧩', d: 'Превуци делове мапе на право место.',
  how: ['Слажеш Балкан. Делови имају име и заставу.', 'Слажеш делове једног континента, без имена.', 'Више делова, било који континент, без имена.'],
  start(level, api) {
    const per = [5, 6, 7][level];
    api.setTotal(per * 2);
    const balkan = ['SRB', 'HUN', 'ROU', 'BGR', 'MKD', 'MNE', 'BIH', 'HRV', 'ALB', 'GRC'];
    const conts = level === 1 ? ['EU', 'AF', 'SA', 'AS'] : ['EU', 'AF', 'SA', 'AS', 'NA', 'OC'];
    const rounds = [];
    const usedC = shuffle(conts);
    for (let r = 0; r < 2; r++) {
      if (level === 0) rounds.push({ ids: api.fresh(balkan, 10).map((x) => x).filter((id) => !rounds.some((o) => o.ids.includes(id))).slice(0, per), bb: null });
      else {
        const k = usedC[r];
        const pool = W.countries.filter((c) => c.cont === k && !c.small && (level === 2 || tierOf(c) <= 2)).map((c) => c.id);
        rounds.push({ ids: api.fresh(pool, per), bb: CONT[k].bb, k });
      }
    }
    api.area.innerHTML = '';
    const lay = el('div', 'g-puz'); const side = el('div', 'g-pieces'); const host = el('div', 'g-maphost');
    const bar = el('div', 'g-bar'); host.append(bar); lay.append(side, host); api.area.append(lay);
    let selected = null, round = 0, left = 0, tries = {};
    const map = gameMap(host, (r) => { if (selected && r.type === 'country') place(selected, r.id); });
    window.__gtap = (id) => { if (selected) place(selected, id); };
    function place(piece, id) {
      const pid = piece.dataset.pid;
      if (id === pid) {
        map.setFill(pid, null); piece.remove(); selected = null;
        api.good(!tries[pid], false); api.toast('⭐ ' + C[pid].n + ' је на месту!');
        left--;
        api.next().then(() => { if (left === 0) setTimeout(startRound, 600); });
        return true;
      }
      tries[pid] = (tries[pid] || 0) + 1; api.bad();
      if (tries[pid] >= 2) { const h = map.mark(pid, 'hint'); setTimeout(() => h && h.remove(), 1600); api.toast('Погледај где трепери!'); }
      else api.toast('Није ту. Покушај поново!');
      return false;
    }
    function startRound() {
      const R = rounds[round++]; if (!R) return api.finish();
      side.innerHTML = ''; left = R.ids.length; tries = {};
      W.countries.forEach((c) => map.setFill(c.id, null));
      R.ids.forEach((id) => map.setFill(id, '#FFFFFF'));
      const bb = R.bb || R.ids.reduce((m, id) => { const b = C[id].mb; return [Math.min(m[0], b[0]), Math.min(m[1], b[1]), Math.max(m[2], b[2]), Math.max(m[3], b[3])]; }, [1e9, 1e9, -1e9, -1e9]);
      map.flyTo(bb, 0, 20, 30);
      bar.innerHTML = `<div class="g-clue"><span>${R.k ? 'Сложи: <b>' + contName(R.k) + '</b>' : 'Сложи <b>Балкан</b>'}. Превуци део на бело место на мапи.</span></div>`;
      shuffle(R.ids).forEach((id) => {
        const p = el('div', 'g-piece', silhouette(C[id], CONT[C[id].cont].c === '#E6EEF5' ? '#8FA6BC' : shade(CONT[C[id].cont].c, -25)) + (level === 0 ? `<div class="g-pn">${flagImg(id, 'xs')}${C[id].n}</div>` : ''));
        p.dataset.pid = id;
        dnd(p, {
          onDrop: (x, y) => {
            const hit = document.elementsFromPoint(x, y).find((e) => e.dataset && e.dataset.id);
            if (!hit) return false;
            return place(p, hit.dataset.id);
          },
          onSelect: () => { side.querySelectorAll('.g-piece').forEach((q) => q.classList.toggle('sel', q === p)); selected = p; api.toast('Сада додирни место на мапи'); },
        });
        side.append(p);
      });
    }
    setTimeout(startRound, 100);
  },
});

// 3. Заставе
GAMES.push({
  id: 'zastave', n: 'Заставе', ic: '🚩', d: 'Погоди чија је застава.',
  how: ['Застава и три имена.', 'Застава или име, четири понуде из истог краја.', 'Све државе света, тешке и сличне заставе.'],
  start(level, api) {
    const list = api.fresh(countryPool(level), 14); let i = 0;
    quizRun(api, () => {
      const c = list[i++]; if (!c) return null;
      const opts = shuffle([c, ...distractors(c, level, level === 0 ? 2 : 3)]);
      const rev = level > 0 && i % 2 === 0;
      if (!rev) return { key: c.id, prompt: `<div class="q-t">Чија је ово застава?</div>${flagImg(c.id, 'big')}`, options: opts.map((o) => ({ html: optName(o), ok: o === c })) };
      return { key: c.id, prompt: `<div class="q-t">Која је застава државе</div><div class="q-big">${c.n}?</div>`, options: opts.map((o) => ({ html: flagImg(o.id, 'opt'), ok: o === c })), after: `Ово је застава државе ${c.n}.` };
    });
  },
});

// 4. Главни градови
GAMES.push({
  id: 'gradovi', n: 'Главни градови', ic: '🏙️', d: 'Повежи државу и њен главни град.',
  how: ['Држава и три града.', 'Држава или град, четири понуде.', 'Све државе света, понуде из суседства.'],
  start(level, api) {
    const list = api.fresh(countryPool(level), 14); let i = 0;
    quizRun(api, () => {
      const c = list[i++]; if (!c) return null;
      const opts = shuffle([c, ...distractors(c, level, level === 0 ? 2 : 3)]);
      if (level === 0 || i % 2 === 1) return { key: c.id, prompt: `<div class="q-t">Који је главни град државе</div>${flagImg(c.id, 'mid')}<div class="q-big">${c.n}?</div>`, options: opts.map((o) => ({ html: `<span class="q-name">⭐ ${o.cap}</span>`, ok: o === c })) };
      return { key: c.id, prompt: `<div class="q-t">Град</div><div class="q-big">⭐ ${c.cap}</div><div class="q-t">је главни град које државе?</div>`, options: opts.map((o) => ({ html: optName(o, true), ok: o === c })) };
    });
  },
});

// 5. Сенке
GAMES.push({
  id: 'senke', n: 'Сенке', ic: '🌑', d: 'Погоди државу по облику.',
  how: ['Велике државе, три понуде са заставама.', 'Више држава, четири понуде.', 'Све државе, понуде из суседства.'],
  start(level, api) {
    const pool = countryPool(level).filter((c) => !c.small && c.area > [60000, 15000, 3000][level]);
    const list = api.fresh(pool, 14); let i = 0;
    quizRun(api, () => {
      const c = list[i++]; if (!c) return null;
      const opts = shuffle([c, ...distractors(c, level, level === 0 ? 2 : 3, pool)]);
      return { key: c.id, prompt: `<div class="q-t">Чија је ово сенка?</div><div class="q-sil">${silhouette(c)}</div>`, options: opts.map((o) => ({ html: optName(o, level === 0), ok: o === c })), after: `Ово је ${c.n}.` };
    });
  },
});

// 6. Животиње света
const ANIMAL_CONT = { 'Кенгур': 'OC', 'Коала': 'OC', 'Лав': 'AF', 'Жирафа': 'AF', 'Зебра': 'AF', 'Горила': 'AF', 'Крокодил': 'AF', 'Панда': 'AS', 'Тигар': 'AS', 'Лама': 'SA', 'Папагај': 'SA', 'Бизон': 'NA', 'Пингвин': 'AN' };
GAMES.push({
  id: 'zivotinje', n: 'Животиње света', ic: '🦁', d: 'Где живе животиње и које су симболи држава.',
  how: ['На ком континенту живи животиња?', 'Која држава има ову животињу или птицу за симбол?', 'Животиње, птице, цвеће и дрвеће, симболи држава.'],
  start(level, api) {
    let i = 0;
    if (level === 0) {
      const pool = W.animals.filter((a) => ANIMAL_CONT[a.n]);
      const list = api.fresh(pool, 14, (a) => a.n);
      const qs = []; while (qs.length < 14) qs.push(...shuffle(list));
      quizRun(api, () => {
        const a = qs[i++]; if (!a || i > 14) return null;
        const k = ANIMAL_CONT[a.n];
        const others = shuffle(CONT_ORDER.filter((x) => x !== k)).slice(0, 2);
        return { key: a.n, prompt: `<div class="q-t">На ком континенту живи</div><div class="q-ico">${icon(a.ic)}</div><div class="q-big">${a.n}?</div>`,
          options: shuffle([k, ...others]).map((x) => ({ html: `<i class="q-dot" style="background:${CONT[x].c}"></i><span class="q-name">${CONT[x].n}</span>`, ok: x === k })), after: a.fact };
      });
      return;
    }
    const kinds = level === 1 ? [['a', 'Животиња симбол'], ['b', 'Птица симбол']] : [['a', 'Животиња симбол'], ['b', 'Птица симбол'], ['f', 'Цвет симбол'], ['t', 'Дрво симбол']];
    const items = [];
    const GENERIC = ['1F43E', '1F426', '1F33C', '1F333', '1F332'];
    for (const c of W.countries) for (const [k, lb] of kinds) if (c.nat && c.nat[k] && (level === 2 || (tierOf(c) <= 2 && !GENERIC.includes(c.nat[k][1])))) items.push({ id: c.id + k, c, k, lb, v: c.nat[k] });
    const list = api.fresh(items, 14);
    quizRun(api, () => {
      const it = list[i++]; if (!it) return null;
      const same = (x) => Object.values(x.nat || {}).some((v) => Array.isArray(v) && v[0] === it.v[0]);
      const ds = distractors(it.c, level, 8).filter((x) => !same(x)).slice(0, 3);
      return { key: it.id, prompt: `<div class="q-t">${it.lb} ове државе је</div><div class="q-ico">${icon(it.v[1])}</div><div class="q-big">${it.v[0]}</div><div class="q-t">Која је то држава?</div>`,
        options: shuffle([it.c, ...ds]).map((o) => ({ html: optName(o, true), ok: o === it.c })) };
    });
  },
});

// 7. Знаменитости
GAMES.push({
  id: 'znamenitosti', n: 'Знаменитости', ic: '🗽', d: 'Где се налазе чуда света?',
  how: ['Светска чуда и три државе.', 'Све знаменитости, четири државе.', 'Знаменитости света и Србије.'],
  start(level, api) {
    const lms = W.landmarks.slice();
    const items = level === 2 ? [...lms, ...W.srb.sights.map((s) => ({ ...s, srb: 1 }))] : lms;
    const list = api.fresh(items, 14); let i = 0;
    quizRun(api, () => {
      const l = list[i++]; if (!l) return null;
      if (l.srb) {
        const others = shuffle(lms).slice(0, 3);
        return { key: l.id, prompt: `<div class="q-t">Која од ових знаменитости је у Србији?</div><div class="q-hint">${l.fact}</div>`,
          options: shuffle([l, ...others]).map((o) => ({ html: `<span class="q-oi">${icon(o.ic)}</span><span class="q-name">${o.n}</span>`, ok: o === l })), after: l.n + '. ' + l.fact };
      }
      const c = C[l.cc];
      const opts = shuffle([c, ...distractors(c, level === 0 ? 0 : level, level === 0 ? 2 : 3)]);
      return { key: l.id, prompt: `<div class="q-t">У којој држави је</div><div class="q-ico">${icon(l.ic)}</div><div class="q-big">${l.n}?</div>`,
        options: opts.map((o) => ({ html: optName(o, true), ok: o === c })), after: l.fact };
    });
  },
});

// 8. Разврстај!
GAMES.push({
  id: 'razvrstaj', n: 'Разврстај!', ic: '📦', d: 'Стави сваку државу у кутију њеног континента.',
  how: ['Две кутије, познате државе са заставом и именом.', 'Три кутије, више држава.', 'Четири кутије, само заставе.'],
  start(level, api) {
    api.setTotal(14);
    let round = 0;
    const nBox = [2, 3, 4][level];
    function startRound() {
      if (round++ >= 2) return api.finish();
      const ks = shuffle(['EU', 'AS', 'AF', 'NA', 'SA', 'OC']).slice(0, nBox);
      const pool = countryPool(level).filter((c) => ks.includes(c.cont));
      const chips = api.fresh(pool, 7);
      api.area.innerHTML = '';
      const wrap = el('div', 'g-sort');
      const top = el('div', 'g-chips'); const boxes = el('div', 'g-boxes');
      wrap.append(el('div', 'g-bar g-bar-static', api.progress() + '<div class="g-clue"><span>Превуци сваку државу у кутију њеног континента.</span></div>'), top, boxes);
      api.area.append(wrap);
      let selected = null, left = chips.length; const tries = {};
      const drop = (chip, k) => {
        const c = C[chip.dataset.cid];
        if (c.cont === k) {
          api.remember(c.id); api.good(!tries[c.id], false); api.toast('⭐ ' + c.n + ' је у кутији ' + CONT[k].n);
          const box = boxes.querySelector(`[data-k="${k}"] .g-inbox`); chip.classList.remove('sel'); box.append(chip); chip.classList.add('placed'); selected = null;
          left--;
          api.next().then(() => { if (!left) setTimeout(startRound, 700); });
          return true;
        }
        tries[c.id] = 1; api.bad(); api.toast(c.n + ' није ту. Покушај поново!');
        return false;
      };
      ks.forEach((k) => {
        const b = el('div', 'g-box', `<div class="g-boxt" style="background:${CONT[k].c}">${CONT[k].n}</div><div class="g-inbox"></div>`);
        b.dataset.k = k; b.onclick = () => { if (selected) drop(selected, k); };
        boxes.append(b);
      });
      chips.forEach((c) => {
        const ch = el('div', 'g-chip', flagImg(c.id, 'chip') + (level < 2 ? `<span>${c.n}</span>` : ''));
        ch.dataset.cid = c.id;
        dnd(ch, {
          onDrop: (x, y) => { const b = document.elementsFromPoint(x, y).find((e) => e.dataset && e.dataset.k); return b ? drop(ch, b.dataset.k) : false; },
          onSelect: () => { if (ch.classList.contains('placed')) return; top.querySelectorAll('.g-chip').forEach((q) => q.classList.toggle('sel', q === ch)); selected = ch; },
        });
        top.append(ch);
      });
    }
    startRound();
  },
});

// 9. Уљез
GAMES.push({
  id: 'uljez', n: 'Уљез', ic: '🕵️', d: 'Пронађи државу која не припада осталима.',
  how: ['Три државе са једног континента и једна са другог.', 'Исто, са више држава.', 'Три суседа једне државе и један уљез.'],
  start(level, api) {
    let i = 0;
    quizRun(api, () => {
      if (i++ >= 14) return null;
      if (level < 2) {
        const pool = countryPool(level);
        const ks = shuffle([...new Set(pool.map((c) => c.cont))]);
        const k = ks.find((x) => pool.filter((c) => c.cont === x).length >= 3);
        const three = api.fresh(pool.filter((c) => c.cont === k), 3);
        const odd = shuffle(pool.filter((c) => c.cont !== k))[0];
        return { key: odd.id, prompt: `<div class="q-t">Три државе су у истом делу света.</div><div class="q-big">Која није у ${{ EU: 'Европи', AS: 'Азији', AF: 'Африци', NA: 'Северној Америци', SA: 'Јужној Америци', OC: 'Аустралији и Океанији' }[k]}?</div>`,
          options: shuffle([...three, odd]).map((o) => ({ html: optName(o, true), ok: o === odd })), after: `${odd.n} је у делу света: ${CONT[odd.cont].n}.` };
      }
      const hosts = W.countries.filter((c) => c.nb.length >= 3);
      const h = api.fresh(hosts, 1)[0];
      const three = shuffle(h.nb).slice(0, 3).map((id) => C[id]);
      const odd = W.countries.filter((c) => c.cont === h.cont && c.id !== h.id && !h.nb.includes(c.id)).sort((a, b) => Math.hypot(a.lx - h.lx, a.ly - h.ly) - Math.hypot(b.lx - h.lx, b.ly - h.ly))[rnd(3)];
      return { key: h.id, prompt: `<div class="q-t">Три државе су суседи државе</div>${flagImg(h.id, 'mid')}<div class="q-big">${h.n}.</div><div class="q-t">Која није?</div>`,
        options: shuffle([...three, odd]).map((o) => ({ html: optName(o, true), ok: o === odd })), after: `${odd.n} није сусед државе ${h.n}.` };
    });
  },
});

// 10. Меморија
GAMES.push({
  id: 'memorija', n: 'Меморија', ic: '🃏', d: 'Пронађи парове: застава и име државе.',
  how: ['Шест парова, застава и име.', 'Осам парова, застава и име.', 'Осам парова, застава и главни град.'],
  start(level, api) {
    const pairs = [6, 8, 8][level];
    api.setTotal(pairs * 2);
    let board = 0;
    function startBoard() {
      if (board++ >= 2) return api.finish();
      const cs = api.fresh(countryPool(level), pairs);
      const cards = shuffle(cs.flatMap((c) => [{ c, t: 'f' }, { c, t: 'n' }]));
      api.area.innerHTML = '';
      const wrap = el('div', 'g-mem');
      wrap.append(el('div', 'g-bar g-bar-static', api.progress() + `<div class="g-clue"><span>Окрени две карте. Пронађи заставу и ${level === 2 ? 'главни град' : 'име'} исте државе.</span></div>`));
      const grid = el('div', 'g-memgrid c' + (pairs === 6 ? 4 : 4)); wrap.append(grid); api.area.append(wrap);
      let open = [], lock = false, found = 0;
      cards.forEach((cd) => {
        const b = el('button', 'g-card', `<div class="g-back">❓</div><div class="g-front">${cd.t === 'f' ? flagImg(cd.c.id, 'mem') : `<span>${level === 2 ? '⭐ ' + cd.c.cap : cd.c.n}</span>`}</div>`);
        b.dataset.cid = cd.c.id;
        b.onclick = () => {
          if (lock || b.classList.contains('up')) return;
          b.classList.add('up'); open.push([b, cd]);
          if (open.length < 2) return;
          const [[b1, c1], [b2, c2]] = open; open = [];
          if (c1.c === c2.c && c1.t !== c2.t) {
            b1.classList.add('done'); b2.classList.add('done'); found++;
            api.remember(c1.c.id); api.good(true, false); api.toast('⭐ ' + c1.c.n + (level === 2 ? ', главни град ' + c1.c.cap : ''));
            api.next().then(() => { if (found === pairs) setTimeout(startBoard, 900); });
          } else { lock = true; setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); lock = false; }, 1100); }
        };
        grid.append(b);
      });
    }
    startBoard();
  },
});

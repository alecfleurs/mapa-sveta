// ===== Početni ekran i Izvori =====
SCREENS.home = (() => {
  let built = false, rankEl, statEl;
  function build() {
    built = true;
    const root = $('#home');
    // pozadina: obris sveta, oblaci, avion
    const bg = sv('svg', { class: 'hm-map', viewBox: `0 0 ${W.W} ${W.H}`, preserveAspectRatio: 'xMidYMax meet' });
    W.countries.forEach((c) => bg.append(sv('path', { d: c.d, fill: countryFill(c) })));
    root.append(bg);
    [[8, 70, 34, 22], [22, 120, 48, 34], [60, 90, 40, 28], [36, 150, 56, 41]].forEach(([top, w, dur, delay]) => {
      const cl = el('div', 'hm-cloud'); Object.assign(cl.style, { top: top + '%', width: w + 'px', height: w * 0.36 + 'px', animationDuration: dur + 's', animationDelay: -delay + 's' });
      root.append(cl);
    });
    root.append(el('div', 'hm-plane', '✈️'));
    const fs = el('button', 'hbtn fsbtn', ICON.fs); fs.onclick = toggleFs; fs.setAttribute('aria-label', 'Цео екран'); root.append(fs);

    const ext = el('button', 'hbtn exbtn', '🚪 Изађи'); ext.onclick = exitApp; root.append(ext);
    const box = el('div', 'hm-box');
    box.append(el('p', 'hm-hi', 'Андријина научна библиотека'), el('div', 'hm-title', 'Мапа света'));
    rankEl = el('button', 'hm-rank'); rankEl.onclick = () => show('diary'); box.append(rankEl);
    const btns = el('div', 'hm-btns');
    const ex = el('button', 'bigbtn b-explore', '🗺️ Истражи<small>Мапа, државе, заставе</small>'); ex.onclick = () => show('explore');
    const gm = el('button', 'bigbtn b-games', '🎮 Игре<small>10 игара, 3 нивоа</small>'); gm.onclick = () => show('games');
    const di = el('button', 'bigbtn b-diary', '📔 Дневник<small>Звездице и признања</small>'); di.onclick = () => show('diary');
    btns.append(ex, gm, di); box.append(btns);
    root.append(box);

    const rs = el('button', 'hm-reset', '↺ Почни испочетка');
    // potvrda u samoj stranici: drugi dodir u roku od 4 sekunde briše napredak
    let armed = null;
    rs.onclick = () => {
      if (armed) { clearTimeout(armed); armed = null; resetProgress(); upd(); rs.textContent = '✔ Обрисано'; setTimeout(() => (rs.textContent = '↺ Почни испочетка'), 1800); return; }
      rs.textContent = 'Додирни поново да обришеш звездице';
      armed = setTimeout(() => { armed = null; rs.textContent = '↺ Почни испочетка'; }, 4000);
    };
    const src = el('button', 'hm-src', 'Извори'); src.onclick = () => show('sources');
    root.append(rs, src);
  }
  function upd() {
    const k = rankInfo();
    rankEl.innerHTML = `<span class="rk-ic">${k.r[2]}</span><span class="rk-t"><b>${k.r[1]} · ⭐ ${P.stars}</b>${rankMeter()}</span>`;
  }
  return { enter() { if (!built) build(); upd(); } };
})();

// Излазак из апликације: прозор инсталиране апликације понекад може да се затвори из странице,
// а кад систем то не дозволи, показујемо како се излази дугметом таблета.
function exitApp() {
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  try { window.close(); } catch (e) {}
  setTimeout(() => {
    const ov = el('div', 'gm-ov');
    ov.innerHTML = `<div class="gm-box"><div class="gm-bic">👋</div><h2>Довиђења, Андрија!</h2><p class="gm-how">Твоје звездице су сачуване. Да затвориш игрицу, притисни дугме за почетни екран на таблету (доле, у средини).</p><div class="hm-btns"></div></div>`;
    const b = el('button', 'bigbtn b-explore', 'Остајем'); b.onclick = () => ov.remove();
    $('.hm-btns', ov).append(b); $('#home').append(ov);
  }, 350);
}

// ===== Екран добродошлице (при сваком покретању) =====
function welcome() {
  const k = rankInfo();
  const d = el('div', 'welcome');
  const bg = sv('svg', { class: 'wl-map', viewBox: `0 0 ${W.W} ${W.H}`, preserveAspectRatio: 'xMidYMid slice' });
  W.countries.forEach((c) => bg.append(sv('path', { d: c.d, fill: countryFill(c) })));
  d.append(bg);
  [[10, 90, 38, 5], [28, 140, 52, 20], [62, 110, 44, 12]].forEach(([top, w, dur, delay]) => {
    const cl = el('div', 'hm-cloud'); Object.assign(cl.style, { top: top + '%', width: w + 'px', height: w * 0.36 + 'px', animationDuration: dur + 's', animationDelay: -delay + 's' });
    d.append(cl);
  });
  d.append(el('div', 'hm-plane', '✈️'));
  const pan = el('div', 'wl-pan', `<p class="wl-k">Андријина научна библиотека</p><h1>Добро дошао, Андрија!</h1><p class="wl-sub">Ово је игрица <b>Мапа света</b></p>`);
  const go = el('button', 'wl-go', 'Крени ▶'); pan.append(go);
  pan.append(el('div', 'wl-rank', `<span class="rk-ic">${k.r[2]}</span><span class="rk-t"><small>Твој чин</small><b>${k.r[1]}</b>${rankMeter()}<small>Истражено ${visitedCount()} од ${W.countries.length} држава · признања ${(P.badges || []).length} од ${BADGES.length}</small></span>`));
  d.append(pan);
  const fs = el('button', 'hbtn fsbtn', ICON.fs); fs.onclick = toggleFs; fs.setAttribute('aria-label', 'Цео екран'); d.append(fs);
  go.onclick = () => { d.classList.add('out'); setTimeout(() => d.remove(), 600); };
  document.body.append(d);
}

// ===== Мој дневник: чин, признања, истражено, игре =====
SCREENS.diary = (() => {
  let built = false, body;
  const LVN = ['Лакше', 'Теже', 'Најтеже'];
  function render() {
    const k = rankInfo();
    const gname = (id) => (GAMES.find((g) => g.id === id) || { n: id }).n;
    const gic = (id) => (GAMES.find((g) => g.id === id) || { ic: '' }).ic;
    let h = `<div class="di-top"><div class="di-rank"><span class="rk-ic big">${k.r[2]}</span><div><small>Мој чин</small><h2>${k.r[1]}</h2><div>Укупно звездица: <b>⭐ ${P.stars}</b></div>${rankMeter()}</div>
      ${RANKS.indexOf(k.r) >= 2 ? '<button class="bigbtn b-explore di-dip" id="diDip">🎓 Диплома</button>' : ''}</div>
      <div class="di-ex"><h3>Истражено на мапи</h3>
        <div class="di-nums"><div><b>${visitedCount()}</b><span>од ${W.countries.length} држава</span></div><div><b>${seenCount('c_')}</b><span>од 7 континената</span></div><div><b>${seenCount('o_')}</b><span>од 5 океана</span></div>
        <div><b>${seenCount('lm_')}</b><span>од ${W.landmarks.length} чуда света</span></div><div><b>${seenCount('ss_') + seenCount('mt_')}</b><span>места у Србији</span></div><div><b>${seenCount('an_')}</b><span>од ${W.animals.length} животиња</span></div></div></div></div>`;
    h += `<h3>Признања (${(P.badges || []).length} од ${BADGES.length})</h3><div class="di-badges">${BADGES.map((b) => { const has = (P.badges || []).includes(b.id); return `<div class="di-bd${has ? '' : ' lk'}"><span>${has ? b.ic : '🔒'}</span><b>${b.n}</b><small>${b.d}</small></div>`; }).join('')}</div>`;
    const st = P.stat || {};
    const mx = Math.max(1, ...GAMES.map((g) => (st[g.id] || {}).c || 0));
    h += `<h3>Моје игре</h3><div class="di-games">${GAMES.slice().sort((a, b) => ((st[b.id] || {}).c || 0) - ((st[a.id] || {}).c || 0)).map((g) => {
      const s = st[g.id] || { c: 0, t: 0 }, avg = s.c ? Math.max(1, Math.round(s.t / s.c / 60000)) : 0, best = (P.best || {})[g.id] || [];
      return `<div class="di-g"><span class="di-gn">${g.ic} ${g.n}</span><div class="rk-meter"><i style="width:${Math.round((s.c / mx) * 100)}%"></i></div><span class="di-gs">${s.c ? `${s.c} ${plural(s.c, 'пут', 'пута', 'пута')}${avg ? ' · око ' + avg + ' мин' : ''}` : 'још није играно'}</span><span class="di-gb">${LVN.map((n, i) => best[i] ? `${n[0]} ⭐${best[i]}` : '').filter(Boolean).join(' · ')}</span></div>`;
    }).join('')}</div>`;
    const hist = (P.hist || []).slice(0, 10);
    h += `<h3>Последње игре</h3><div class="di-hist">${hist.length ? hist.map((x) => { const d = new Date(x.t); return `<div class="di-hr"><span>${gic(x.id)} ${gname(x.id)} · ${LVN[x.lv]}</span><b>⭐ ${x.stars} од ${x.max}</b><span class="di-dt">${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.</span></div>`; }).join('') : '<div class="di-hr"><span>Још нема одиграних игара. Врати се кад завршиш прву!</span></div>'}</div>`;
    body.innerHTML = h;
    const dip = $('#diDip', body);
    if (dip) dip.onclick = () => {
      const ov = el('div', 'gm-ov'), d = new Date();
      ov.innerHTML = `<div class="gm-box diploma"><p class="wl-k">Андријина научна библиотека</p><h2>ДИПЛОМА</h2><div class="rk-ic big">${k.r[2]}</div><p>Диплому добија</p><div class="dp-nm">Андрија</div><p>који је на Мапи света стекао чин</p><div class="dp-r">${k.r[1]}</div>
        <p class="gm-how">Звездица: ${P.stars} · истражено држава: ${visitedCount()} · признања: ${(P.badges || []).length} · ${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}.</p><div class="hm-btns"></div></div>`;
      const c = el('button', 'bigbtn b-explore', 'Затвори'); c.onclick = () => ov.remove();
      $('.hm-btns', ov).append(c); $('#diary').append(ov); confetti(40);
    };
  }
  return { enter() {
    if (!built) { built = true; const root = $('#diary'); root.append(header('Мој дневник')); body = el('div', 'di-body'); root.append(body); }
    render();
  } };
})();

SCREENS.sources = (() => {
  let built = false;
  return { enter() {
    if (built) return; built = true;
    const root = $('#sources');
    root.append(header('Извори'));
    root.append(el('div', 'srcbox', `
      <h2>Одакле су подаци</h2>
      <ul>
        <li><b>Облици држава, реке, језера и главни градови на мапи:</b> Natural Earth (naturalearthdata.com), јавно добро.</li>
        <li><b>Називи држава, главни градови, површина, суседи:</b> mledoze/countries (github.com/mledoze/countries), лиценца ODbL.</li>
        <li><b>Број становника:</b> Natural Earth, процена из 2019. године.</li>
        <li><b>Заставе:</b> flag-icons (github.com/lipis/flag-icons), лиценца MIT.</li>
        <li><b>Животиње, птице, цвеће и дрвеће симболи држава:</b> Wikipedia, листе List of national animals, List of national birds, List of national flowers, List of national trees.</li>
        <li><b>Највиши врхови:</b> Wikipedia, List of highest points of European countries и List of elevation extremes by country.</li>
        <li><b>Градови Србије:</b> GeoNames (cities.json), лиценца CC BY 4.0. <b>Планине Србије:</b> висине из Wikipedia (List of mountains in Serbia), положаји из GeoNames и Natural Earth; положаји Златибора, Таре, Фрушке горе, Ртња, Суве планине, Голије и Проклетија су приближни.</li>
        <li><b>Знаменитости и животиње на мапи:</b> опште познате локације, положај сличице је илустративан. Слике: OpenMoji, а Кинески зид, Чичен Ица, Христос Искупитељ, Биг Бен, Криви торањ, Стоунхенџ, водопади и Ђавоља варош нацртани су за ову мапу.</li>
        <li><b>По чему је држава позната и познати људи:</b> избор из Wikipedia чланака о местима и људима.</li>
        <li><b>Слике животиња и биљака:</b> OpenMoji (openmoji.org), лиценца CC BY-SA 4.0. Када нема слике баш те врсте, приказана је општа слика (птица, цвет, дрво, шапе), а назив испод је тачан.</li>
        <li><b>Чињенице о континентима, океанима и рекама:</b> Енциклопедија Британика и Wikipedia, наведено на свакој картици.</li>
      </ul>
      <h2>Границе</h2>
      <p>Границе држава приказане су према међународно признатом стању како га води Република Србија. Територије које нису државе приказане су светлијом бојом, са називом државе којој припадају.</p>
      <p>Пројекција мапе: Робинсон.</p>`));
  } };
})();

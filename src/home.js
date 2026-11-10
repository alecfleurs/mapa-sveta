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

    const box = el('div', 'hm-box');
    box.append(el('p', 'hm-hi', 'Добро дошао, Андрија!'), el('div', 'hm-title', 'Мапа света'));
    rankEl = el('div', 'hm-rank'); box.append(rankEl);
    const btns = el('div', 'hm-btns');
    const ex = el('button', 'bigbtn b-explore', '🗺️ Истражи<small>Мапа, државе, заставе</small>'); ex.onclick = () => show('explore');
    const gm = el('button', 'bigbtn b-games', '🎮 Игре<small>Ускоро</small>'); gm.disabled = true;
    btns.append(ex, gm); box.append(btns);
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
    const r = rank();
    rankEl.innerHTML = `${r[2]} Чин: ${r[1]} · ⭐ ${P.stars} · истражено ${visitedCount()} од ${W.countries.length} држава`;
  }
  return { enter() { if (!built) build(); upd(); } };
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
        <li><b>Највиши врхови:</b> Wikipedia, List of highest points of European countries.</li>
        <li><b>Слике животиња и биљака:</b> OpenMoji (openmoji.org), лиценца CC BY-SA 4.0. Када нема слике баш те врсте, приказана је општа слика (птица, цвет, дрво, шапе), а назив испод је тачан.</li>
        <li><b>Чињенице о континентима, океанима и рекама:</b> Енциклопедија Британика и Wikipedia, наведено на свакој картици.</li>
      </ul>
      <h2>Границе</h2>
      <p>Границе држава приказане су према међународно признатом стању како га води Република Србија. Територије које нису државе приказане су светлијом бојом, са називом државе којој припадају.</p>
      <p>Пројекција мапе: Робинсон.</p>`));
  } };
})();

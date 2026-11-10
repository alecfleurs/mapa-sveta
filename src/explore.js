// ===== Istraživač: mapa sa karticama =====
SCREENS.explore = (() => {
  let built = false, map, root, card, wrap, statEl, hintEl;
  const CARD_W = () => Math.min(420, wrap.clientWidth * 0.46) + 20;

  function build() {
    built = true;
    root = $('#explore');
    statEl = el('div', 'chip-stat');
    root.append(header('Истражи свет', statEl));
    wrap = el('div', 'mapwrap'); root.append(wrap);
    map = makeMap(wrap, { onTap });

    hintEl = el('div', 'hint', 'Додирни државу, океан или реку. Рашири два прста да увећаш мапу.');
    wrap.append(hintEl);

    const ctl = el('div', 'mctl');
    const mb = (html, fn, title) => { const b = el('button', 'mbtn', html); b.onclick = fn; b.setAttribute('aria-label', title); ctl.append(b); return b; };
    mb('+', () => map.zoomBy(1.8), 'Увећај');
    mb('−', () => map.zoomBy(1 / 1.8), 'Умањи');
    mb('🌍<small>Свет</small>', () => { closeCard(); map.fitWorld(); }, 'Цео свет');
    const tog = (icon, label, cls) => { let on = true; const b = mb(icon + '<small>' + label + '</small>', () => { on = !on; b.classList.toggle('off', !on); map.layers(cls, on); }, label); };
    tog('🔤', 'Имена', 'noNames');
    tog('〰️', 'Реке', 'noRiv');
    tog('⭐', 'Градови', 'noCap');
    wrap.append(ctl);

    const conts = el('div', 'conts');
    for (const k of CONT_ORDER) {
      const b = el('button', 'cbtn', `<i style="background:${CONT[k].c}"></i>${CONT[k].n}`);
      b.onclick = () => openCont(k);
      conts.append(b);
    }
    wrap.append(conts);

    card = el('div', 'card'); wrap.append(card);
  }

  function updStat() { statEl.innerHTML = `⭐ ${P.stars} · ${rank()[2]} ${rank()[1]}`; }
  function award(key, isCountry) {
    if (isCountry) { if (P.visited[key]) return false; P.visited[key] = 1; }
    else { if (P.seen[key]) return false; P.seen[key] = 1; }
    const before = rank()[1];
    P.stars++; save(); updStat();
    const after = rank();
    toast(before !== after[1] ? `${after[2]} Нови чин: ${after[1]}!` : '⭐ Ново откриће! +1', wrap);
    return true;
  }

  function onTap(r) {
    if (hintEl) { hintEl.remove(); hintEl = null; }
    if (r.type === 'country') openCountry(r.id);
    else if (r.type === 'ocean') openOcean(r.id);
    else if (r.type === 'river') openRiver(r.id);
    else if (r.type === 'territory') openTerritory(r.id);
    else closeCard();
  }

  function closeCard() { card.classList.remove('on'); map.select(null); }
  function showCard(headColor, headHtml, bodyHtml, after) {
    card.innerHTML = '';
    const x = el('button', 'cx', '×'); x.onclick = closeCard; x.setAttribute('aria-label', 'Затвори');
    const head = el('div', 'chead', headHtml); head.style.background = headColor;
    const body = el('div', 'cbody', bodyHtml);
    card.append(x, head, body);
    card.classList.add('on');
    body.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => openCountry(b.dataset.go));
    body.querySelectorAll('[data-riv]').forEach((b) => b.onclick = () => openRiver(b.dataset.riv));
    head.querySelectorAll('[data-cont]').forEach((b) => b.onclick = () => openCont(b.dataset.cont));
    body.querySelectorAll('[data-cont]').forEach((b) => b.onclick = () => openCont(b.dataset.cont));
    if (after) after(body);
  }
  const chip = (id) => `<button class="ch" data-go="${id}"><img src="${flagSrc(id)}" alt="">${C[id].n}</button>`;
  const row = (ic, lb, vl, sm, extra = '') => `<div class="row"><div class="ic">${ic}</div><div><div class="lb">${lb}</div>${vl ? `<div class="vl">${vl}</div>` : ''}${sm ? `<div class="sm">${sm}</div>` : ''}${extra}</div></div>`;

  function openCountry(id) {
    const c = C[id]; if (!c) return;
    const isNew = award(id, true);
    map.select(id);
    const bb = c.small ? [c.lx - 25, c.ly - 18, c.lx + 25, c.ly + 18] : c.mb;
    map.flyTo(bb, CARD_W(), 70, 12);
    const cont = CONT[c.cont];
    const rivers = W.rivers.filter((r) => r.thru.includes(id));
    let head = `<h2>${c.n}${isNew ? '<span class="newbadge">+1 ⭐</span>' : ''}</h2>` + (c.full ? `<div class="full">${c.full}</div>` : '') +
      `<button class="contchip" data-cont="${c.cont}">${cont.n}</button>`;
    let body = `<img class="flag" src="${flagSrc(id)}" alt="Застава">`;
    if (id === 'SRB') body += `<div class="home-flag">🏠 Ово је Србија, наша земља!</div>`;
    body += row('⭐', 'Главни град', c.cap);
    body += row('📏', 'Површина', (c.area < 10 ? String(c.area).replace('.', ',') : fmt(c.area)) + ' km²', areaCompare(c));
    body += row('👨‍👩‍👧', 'Становника', popText(c.pop), 'процена из ' + c.popY + '. године');
    if (c.nb.length) body += row('🤝', 'Суседи', `${c.nb.length} ${plural(c.nb.length, 'сусед', 'суседа', 'суседа')}`, '', `<div class="chips">${c.nb.map(chip).join('')}</div>`);
    else body += row('🏝️', 'Суседи', 'Нема суседа на копну', 'Свуда око ње је вода.');
    if (c.land) body += row('⛰️', 'Море', 'Нема излаз на море', 'Са свих страна је окружена другим државама.');
    if (rivers.length) body += row('〰️', 'Велике реке', '', '', `<div class="chips">${rivers.map((r) => `<button class="ch nofl" data-riv="${r.id}">${r.n}</button>`).join('')}</div>`);
    body += natureHtml(c);
    showCard(cont.c === '#E6EEF5' ? '#8FA6BC' : shade(cont.c, -28), head, body);
  }

  // Животиње, биљке и занимљивости (само проверени подаци из tools/facts)
  function natureHtml(c) {
    const x = c.nat; if (!x) return '';
    const tile = (k, lb) => x[k] ? `<div class="nt"><div class="nt-ic">${(window.ICONS || {})[x[k][1]] || ''}</div><div class="nt-lb">${lb}</div><div class="nt-n">${x[k][0]}</div></div>` : '';
    const tiles = tile('a', 'Животиња симбол') + tile('b', 'Птица симбол') + tile('g', 'На грбу') + tile('f', 'Цвет симбол') + tile('t', 'Дрво симбол');
    let h = '';
    if (tiles) h += `<div class="sec-t">🐾 Природа</div><div class="ntg">${tiles}</div>`;
    const facts = [];
    if (x.peak) facts.push(`Највиши врх је ${x.peak[0]}, висок ${fmt(x.peak[1])} m${x.peak[2] ? ' (' + x.peak[2] + ')' : ''}.`);
    if (x.lang) facts.push(x.lang.includes(' и ') ? `Овде се говоре ${x.lang} језик.` : `Овде се говори ${x.lang} језик.`);
    if (x.cur) facts.push(`Новац се зове ${x.cur}.`);
    if (facts.length) h += `<div class="sec-t">💡 Занимљивости</div><ul class="facts">${facts.map((f) => `<li>${f}</li>`).join('')}</ul>`;
    h += `<div class="src">Извор: Wikipedia (листе националних симбола, највиши врхови), mledoze/countries. Слике: OpenMoji.</div>`;
    return h;
  }

  function openCont(k) {
    const ct = CONT[k];
    award('c_' + k);
    map.select(null);
    map.flyTo(ct.bb, CARD_W(), 30, 12);
    const list = W.countries.filter((c) => c.cont === k).sort((a, b) => a.n.localeCompare(b.n, 'sr'));
    let body = '';
    if (ct.count) {
      body += row('🗺️', 'Државе', `${ct.count} ${plural(ct.count, 'држава', 'државе', 'држава')}`);
      body += row('🐘', 'Највећа држава', `<button class="ch" data-go="${ct.largest}"><img src="${flagSrc(ct.largest)}" alt="">${C[ct.largest].n}</button>`);
      body += row('🐭', 'Најмања држава', `<button class="ch" data-go="${ct.smallest}"><img src="${flagSrc(ct.smallest)}" alt="">${C[ct.smallest].n}</button>`);
      body += row('👨‍👩‍👧', 'Највише становника', `<button class="ch" data-go="${ct.mostPop}"><img src="${flagSrc(ct.mostPop)}" alt="">${C[ct.mostPop].n}</button>`);
    } else body += row('🐧', 'Државе', 'Овде нема држава');
    body += `<ul class="facts">${ct.facts.map((f) => `<li>${f}</li>`).join('')}</ul>`;
    if (list.length) body += `<div class="row"><div class="ic">🚩</div><div><div class="lb">Све државе</div><div class="chips">${list.map((c) => chip(c.id)).join('')}</div></div></div>`;
    body += `<div class="src">Извор: ${ct.src}</div>`;
    showCard(k === 'AN' ? '#8FA6BC' : shade(ct.c, -28), `<h2>${ct.n}</h2><div class="full">Континент</div>`, body);
  }

  function openOcean(id) {
    const o = W.oceans.find((x) => x.id === id); if (!o) return;
    award('o_' + id);
    map.select(null);
    const xs = o.at.map((a) => a[0]), ys = o.at.map((a) => a[1]);
    map.flyTo([Math.min(...xs) - 160, Math.min(...ys) - 110, Math.max(...xs) + 160, Math.max(...ys) + 110], CARD_W(), 30, 3);
    const body = `<ul class="facts">${o.facts.map((f) => `<li>${f}</li>`).join('')}</ul><div class="src">Извор: ${o.src}</div>`;
    showCard('#2D7FB8', `<h2>${o.n}</h2><div class="full">Океан</div>`, body);
  }

  function openRiver(id) {
    const r = W.rivers.find((x) => x.id === id); if (!r) return;
    award('r_' + id);
    map.selectRiver(id);
    let body = r.fact ? `<ul class="facts"><li>${r.fact}</li></ul>` : '';
    if (r.thru.length) body += `<div class="row"><div class="ic">🚩</div><div><div class="lb">Тече кроз ${r.thru.length === 1 ? 'државу' : 'државе'}</div><div class="chips">${r.thru.map(chip).join('')}</div></div></div>`;
    body += `<div class="src">Извор: Natural Earth (ток реке)${r.fact ? ', Енциклопедија Британика' : ''}</div>`;
    showCard('#1F6FC5', `<h2>${r.n}</h2><div class="full">Река</div>`, body);
  }

  function openTerritory(id) {
    const t = W.territories.find((x) => x.id === id); if (!t) return;
    if (t.ant) return openCont('AN');
    map.select(null);
    const nm = t.n || 'Острво';
    let body = row('ℹ️', 'Шта је ово?', 'Ово није посебна држава.', t.sov ? 'Ова земља припада држави:' : 'Земља без своје државе.');
    if (t.sov) body = row('ℹ️', 'Шта је ово?', 'Ово није посебна држава.', 'Ова земља припада држави:', `<div class="chips">${chip(t.sov)}</div>`);
    showCard('#8A7F6A', `<h2>${nm}</h2><div class="full">Територија</div>`, body);
  }

  return {
    enter() {
      if (!built) build();
      updStat();
      requestAnimationFrame(() => map.resize());
    },
    openCountry: (id) => openCountry(id),
  };
})();

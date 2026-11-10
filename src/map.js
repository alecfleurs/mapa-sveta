// ===== Mapa sveta: crtanje, zumiranje prstima, dodir =====
// makeMap(host, {onTap}) vraća objekat sa flyTo, fitWorld, select, ... Koriste ga i Istraživač i igre.
function makeMap(host, opt = {}) {
  const svg = sv('svg', { class: 'mapsvg' });
  const vp = sv('g');
  svg.append(vp);
  host.append(svg);
  const G = (cls) => { const g = sv('g', cls ? { class: cls } : {}); vp.append(g); return g; };

  vp.append(sv('path', { d: W.sphere, class: 'sph' }));
  const gGrat = G();
  W.grat.forEach((d) => gGrat.append(sv('path', { d, class: 'grat' })));
  gGrat.append(sv('path', { d: W.equator, class: 'eq' }));
  const gTer = G(), gCty = G(), gLake = G(), gRiv = G('rv'), gSel = G(), gCap = G('cp'), gDot = G(), gSrb = G(), gLbl = G(), gIco = G();

  const paths = {};
  W.territories.forEach((t) => {
    const ref = t.sov && C[t.sov];
    gTer.append(sv('path', { d: t.d, class: 'ter', 'data-ter': t.id, fill: t.ant ? '#EEF3F8' : ref ? shade(countryFill(ref), 25) : '#E8E2D4' }));
  });
  W.countries.forEach((c) => {
    const p = sv('path', { d: c.d, class: 'cty', 'data-id': c.id, fill: countryFill(c) });
    paths[c.id] = p; gCty.append(p);
  });
  W.lakes.forEach((l) => gLake.append(sv('path', { d: l.d, class: 'lake' })));
  const rivEl = {};
  W.rivers.forEach((r) => {
    const v = sv('path', { d: r.d, class: 'riv' }); rivEl[r.id] = v;
    gRiv.append(v, sv('path', { d: r.d, class: 'rivhit', 'data-river': r.id }));
  });
  W.countries.forEach((c) => {
    if (c.capXY) gCap.append(sv('circle', { cx: c.capXY[0], cy: c.capXY[1], class: 'cap' }));
    if (c.small) gDot.append(sv('circle', { cx: c.lx, cy: c.ly, class: 'dot', 'data-id': c.id, fill: shade(countryFill(c), -25) }));
  });

  // natpisi: [element, minimalni zum (log2 u odnosu na ceo svet), maksimalni]
  const labels = [];
  // pri: manji broj = važniji natpis; px: veličina slova na ekranu; anchor: 'm' sredina, 's' početak
  const addL = (x, y, txt, cls, zmin, zmax = 99, attrs = {}, col = null) => {
    const t = sv('text', Object.assign({ x, y, class: 'lbl ' + cls }, attrs)); t.textContent = txt;
    gLbl.append(t); labels.push({ t, zmin, zmax, x, y, len: txt.length, col }); return t;
  };
  for (const k of CONT_ORDER) {
    const b = CONT[k].bb; let x = (b[0] + b[2]) / 2, y = (b[1] + b[3]) / 2;
    if (k === 'AN') y = b[1] + 40; if (k === 'OC') { x = 1770; y = 700; } if (k === 'AS') { x = 1530; y = 300; } if (k === 'EU') { x = 1080; y = 215; }
    if (k === 'NA') { x = 420; y = 260; } if (k === 'AF') { x = 1090; y = 470; }
    addL(x, y, CONT[k].n, 'contl', -9, 0.55);
  }
  W.oceans.forEach((o) => o.at.forEach(([x, y]) => addL(x, y, o.n, 'ocl', -9, 2.6, { 'data-ocean': o.id })));
  W.countries.forEach((c) => {
    const zmin = c.small ? Math.max(1.6, (c.ml - 2.6) / 1.35) : Math.max(0.55, (c.ml - 2.6) / 1.35);
    const big = c.lr <= 2;
    const t = addL(c.lx, c.ly, c.n, 'nm' + (big ? ' big' : ''), zmin, 99, {}, { pri: c.lr, px: big ? 15 : 13, a: 'm', dy: c.small ? 1.3 : 0 });
    if (c.small) t.setAttribute('dy', '1.3em');
  });
  W.countries.forEach((c) => { if (c.capXY) addL(c.capXY[0], c.capXY[1], ' ' + c.cap, 'capl cp', 2.3, 99, {}, { pri: 10 + c.lr, px: 11, a: 's', dy: 0 }); });
  W.rivers.forEach((r) => addL(r.lx, r.ly, r.n, 'rivl rv', r.minor ? 2.8 : r.len > 120 ? 1.3 : 2.2, 99, { 'data-river': r.id }));
  W.lakes.forEach((l) => l.n && addL(l.lx, l.ly, l.n, 'lakel', 2));
  W.territories.forEach((t) => t.n && !t.ant && addL(t.lx, t.ly, t.n, 'nm', t.id === 'GRL' ? 0.55 : 2.4));
  addL(W.W / 2 - 300, W.H / 2 - 6, 'Екватор', 'rivl', 1.2);

  // ---------- sličice: znamenitosti, životinje, Srbija ----------
  const URL_ = {};
  const iconUrl = (c) => URL_[c] || (URL_[c] = URL.createObjectURL(new Blob([(window.ICONS || {})[c] || ''], { type: 'image/svg+xml' })));
  const addPin = ([x, y], code, size, cls, zmin, zmax, data) => {
    const im = sv('image', Object.assign({ href: iconUrl(code), class: 'pin ' + cls, style: `--x:${x};--y:${y};--s:${size}` }, data));
    gIco.append(im); labels.push({ t: im, zmin, zmax }); return im;
  };
  W.landmarks.forEach((l) => {
    addPin(l.xy, l.ic, l.w ? 36 : 28, 'lmk', -9, 99, { 'data-lm': l.id });
    addL(l.xy[0], l.xy[1], l.n, 'lml lmk', 1.9).setAttribute('dy', '1.9em');
  });
  W.animals.forEach((a, i) => a.pts.forEach((pt) => addPin(pt, a.ic, 30, 'anm', -9, 2.4, { 'data-an': i })));
  // Srbija detaljno
  W.srb.cities.forEach((c) => {
    gSrb.append(sv('circle', { cx: c.xy[0], cy: c.xy[1], class: 'scity t' + c.t }));
    labels.push({ t: gSrb.lastChild, zmin: [0, 2.3, 2.7, 3.1][c.t], zmax: 99 });
    addL(c.xy[0], c.xy[1], '\u2002' + c.n, 'capl sct', [0, 2.3, 2.7, 3.1][c.t], 99, {}, { pri: 20 + c.t, px: 11, a: 's', dy: 0 });
  });
  W.srb.mountains.forEach((m, i) => {
    addPin(m.xy, '1F3D4', 24, 'mtn', 2.6, 99, { 'data-mt': i });
    addL(m.xy[0], m.xy[1], m.n, 'mtl', 2.6, 99, { dy: '1.6em' }, { pri: 30, px: 11, a: 'm', dy: 1.6 });
  });
  W.srb.sights.forEach((g) => {
    addPin(g.xy, g.ic, 28, 'lmk', 2.9, 99, { 'data-ss': g.id });
    addL(g.xy[0], g.xy[1], g.n, 'lml lmk', 3.5).setAttribute('dy', '1.9em');
  });

  const byPri = [...labels].sort((a, b) => (a.col ? a.col.pri : -1) - (b.col ? b.col.pri : -1));
  // ---------- stanje prikaza ----------
  let cw = 1, ch = 1, k0 = 1, k = 1, tx = 0, ty = 0, zb = null, anim = null;
  const KMAX = () => k0 * 60;
  function resize() {
    const r = svg.getBoundingClientRect(); if (!r.width) return;
    const first = cw === 1; cw = r.width; ch = r.height;
    const nk0 = Math.min(cw / W.W, ch / W.H);
    if (first) { k0 = nk0; fitWorld(false); } else { k0 = nk0; clamp(); apply(); }
  }
  function clamp() {
    k = Math.max(k0 * 0.9, Math.min(KMAX(), k));
    // pola ekrana uvek pokazuje mapu
    const mw = W.W * k, mh = W.H * k;
    tx = Math.min(cw * 0.5, Math.max(cw * 0.5 - mw, tx));
    ty = Math.min(ch * 0.5, Math.max(ch * 0.5 - mh, ty));
  }
  function apply() {
    vp.setAttribute('transform', `translate(${tx.toFixed(1)},${ty.toFixed(1)}) scale(${k.toFixed(5)})`);
    svg.style.setProperty('--k', k);
    const z = Math.log2(k / k0), nb = Math.round(z * 10);
    if (nb !== zb) {
      zb = nb;
      // vidljivost po zumu, pa preklapanja: natpisi se proveravaju po važnosti
      const fsK = 1 / k, boxes = [];
      for (const L of byPri) {
        let on = z >= L.zmin && z < L.zmax;
        if (on && L.col) {
          const h = L.col.px * 1.15 * fsK, w = (L.len * 0.58 + 0.4) * L.col.px * fsK;
          const x0 = L.col.a === 'm' ? L.x - w / 2 : L.x, y0 = L.y + L.col.dy * L.col.px * fsK - h / 2;
          const b = [x0, y0, x0 + w, y0 + h];
          if (boxes.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])) on = false; else boxes.push(b);
        }
        L.t.style.display = on ? '' : 'none';
      }
      gCap.style.display = z >= 1.2 ? '' : 'none';
    }
  }
  function zoomAt(f, sx, sy) {
    const nk = Math.max(k0 * 0.9, Math.min(KMAX(), k * f)); f = nk / k;
    tx = sx - (sx - tx) * f; ty = sy - (sy - ty) * f; k = nk; clamp(); apply();
  }
  function animateTo(nk, ntx, nty, ms = 650) {
    cancelAnimationFrame(anim);
    const sk = k, stx = tx, sty = ty, t0 = performance.now();
    // centar ekrana u koordinatama sveta, da putanja bude glatka
    const sc = [(cw / 2 - stx) / sk, (ch / 2 - sty) / sk], ec = [(cw / 2 - ntx) / nk, (ch / 2 - nty) / nk];
    const step = (now) => {
      let t = Math.min(1, (now - t0) / ms); t = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      k = Math.exp(Math.log(sk) + (Math.log(nk) - Math.log(sk)) * t);
      const cx = sc[0] + (ec[0] - sc[0]) * t, cy = sc[1] + (ec[1] - sc[1]) * t;
      tx = cw / 2 - cx * k; ty = ch / 2 - cy * k; apply();
      if (t < 1) anim = requestAnimationFrame(step); else { clamp(); apply(); }
    };
    anim = requestAnimationFrame(step);
  }
  // Prikaži pravougaonik sveta [x0,y0,x1,y1]; right = širina koju zauzima kartica sa desne strane
  function flyTo(bb, right = 0, pad = 40, maxZ = 40) {
    const aw = cw - right - pad * 2, ah = ch - pad * 2 - 50;
    const bw = Math.max(bb[2] - bb[0], 4), bh = Math.max(bb[3] - bb[1], 4);
    const nk = Math.max(k0, Math.min(k0 * maxZ, aw / bw, ah / bh));
    const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
    animateTo(nk, (cw - right) / 2 - cx * nk, (ch - 50) / 2 - cy * nk);
  }
  function fitWorld(animated = true) {
    const nk = k0, ntx = (cw - W.W * nk) / 2, nty = (ch - W.H * nk) / 2;
    if (animated) animateTo(nk, ntx, nty); else { k = nk; tx = ntx; ty = nty; apply(); }
  }

  // ---------- prsti i miš ----------
  const ptr = new Map(); let down = null, pinch = null;
  svg.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(anim);
    svg.setPointerCapture(e.pointerId);
    ptr.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptr.size === 1) down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: false, tx, ty };
    if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k, cx: (a[0] + b[0]) / 2, cy: (a[1] + b[1]) / 2 }; if (down) down.moved = true; }
  });
  svg.addEventListener('pointermove', (e) => {
    if (!ptr.has(e.pointerId)) return;
    const prev = ptr.get(e.pointerId); ptr.set(e.pointerId, [e.clientX, e.clientY]);
    const r = svg.getBoundingClientRect();
    if (ptr.size >= 2 && pinch) {
      const [a, b] = [...ptr.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
      tx += cx - pinch.cx; ty += cy - pinch.cy; pinch.cx = cx; pinch.cy = cy;
      zoomAt((pinch.k * d / pinch.d) / k, cx - r.left, cy - r.top);
    } else if (down) {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 9) down.moved = true;
      if (down.moved) { tx += e.clientX - prev[0]; ty += e.clientY - prev[1]; clamp(); apply(); }
    }
  });
  const up = (e) => {
    if (!ptr.has(e.pointerId)) return;
    ptr.delete(e.pointerId);
    if (ptr.size < 2) pinch = null;
    if (ptr.size === 0 && down) {
      const tap = !down.moved && performance.now() - down.t < 700;
      down = null;
      if (tap && e.type === 'pointerup') hit(e.clientX, e.clientY);
    }
  };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('wheel', (e) => { e.preventDefault(); const r = svg.getBoundingClientRect(); zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });

  function hit(x, y) {
    const els = document.elementsFromPoint(x, y);
    let res = { type: 'sea' };
    // sličice imaju prednost nad državom ispod njih
    const pin = els.find((t) => svg.contains(t) && t.tagName === 'image');
    for (const t of pin ? [pin, ...els] : els) {
      if (!svg.contains(t)) continue;
      const d = t.dataset || {};
      if (d.id) { res = { type: 'country', id: d.id }; break; }
      if (d.ocean) { res = { type: 'ocean', id: d.ocean }; break; }
      if (d.river && (t.tagName === 'text' || Math.log2(k / k0) >= 2)) { res = { type: 'river', id: d.river }; break; }
      if (d.ter) { res = { type: 'territory', id: d.ter }; break; }
      if (d.lm) { res = { type: 'landmark', id: d.lm }; break; }
      if (d.an) { res = { type: 'animal', id: +d.an }; break; }
      if (d.ss) { res = { type: 'sight', id: d.ss }; break; }
      if (d.mt) { res = { type: 'mountain', id: +d.mt }; break; }
    }
    // mala država blizu prsta: lakše pogađanje
    if (res.type === 'sea' || res.type === 'territory') {
      const r = svg.getBoundingClientRect(), wx = (x - r.left - tx) / k, wy = (y - r.top - ty) / k, lim = 22 / k;
      let best = null, bd = lim;
      for (const c of W.countries) if (c.small) { const d = Math.hypot(c.lx - wx, c.ly - wy); if (d < bd) { bd = d; best = c; } }
      if (best) res = { type: 'country', id: best.id };
    }
    if (opt.onTap) opt.onTap(res);
  }

  // ---------- isticanje ----------
  function select(id) {
    gSel.innerHTML = '';
    Object.values(rivEl).forEach((r) => r.classList.remove('hl'));
    if (!id) return;
    const c = C[id]; if (!c) return;
    gSel.append(sv('path', { d: c.d, class: 'self' }), sv('path', { d: c.d, class: 'selp' }));
    if (c.small) gSel.append(sv('circle', { cx: c.lx, cy: c.ly, class: 'dot', fill: '#FFD23F' }));
  }
  function selectRiver(id) { gSel.innerHTML = ''; Object.entries(rivEl).forEach(([k, r]) => r.classList.toggle('hl', k === id)); }
  function selectMany(ids, color) {
    gSel.innerHTML = '';
    for (const id of ids) { const c = C[id]; if (c) gSel.append(sv('path', { d: c.d, class: 'selp' })); }
  }
  const layers = (cls, on) => svg.classList.toggle(cls, !on);

  new ResizeObserver(resize).observe(svg);
  // za igre: boja jedne države (null vraća prvobitnu) i oznaka tačno/netačno
  function setFill(id, f) { const p = paths[id]; if (p) p.setAttribute('fill', f || countryFill(C[id])); }
  function mark(id, cls) {
    const c = C[id]; if (!c) return;
    const e = sv('path', { d: c.d, class: 'gmark ' + cls });
    gSel.append(e);
    if (c.small) gSel.append(sv('circle', { cx: c.lx, cy: c.ly, class: 'dot gmark ' + cls }));
    return e;
  }
  return { svg, flyTo, fitWorld, select, selectRiver, selectMany, layers, resize, setFill, mark, clearMarks: () => { gSel.innerHTML = ''; }, zoomBy: (f) => zoomAt(f, cw / 2, ch / 2), get z() { return Math.log2(k / k0); } };
}

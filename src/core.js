// ===== Zajednički deo: podaci, napredak, ekrani, pomoćne funkcije =====
const W = window.WORLD, FLAGS = window.FLAGS || {};
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const SVGNS = 'http://www.w3.org/2000/svg';
const sv = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); return e; };
const C = {}; W.countries.forEach((c) => (C[c.id] = c));
const CONT = W.continents;
const CONT_ORDER = ['EU', 'AS', 'AF', 'NA', 'SA', 'OC', 'AN'];
const flagSrc = (id) => FLAGS[id] ? 'data:image/webp;base64,' + FLAGS[id] : '';

// ---------- napredak (localStorage, jedan ključ) ----------
const KEY = 'ms1';
let P = { visited: {}, seen: {}, stars: 0 };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === 'object') P = Object.assign(P, s); } catch (e) {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} }
function resetProgress() { P = { visited: {}, seen: {}, stars: 0 }; save(); }
const RANKS = [[0, 'Путник', '🎒'], [15, 'Истраживач', '🧭'], [40, 'Морепловац', '⛵'], [80, 'Капетан', '🚢'], [130, 'Пилот', '✈️'], [195, 'Глобтротер', '🌍']];
function rank() { let r = RANKS[0]; for (const x of RANKS) if (P.stars >= x[0]) r = x; return r; }
const visitedCount = () => Object.keys(P.visited).filter((k) => C[k]).length;

// ---------- srpski brojevi i padeži ----------
const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dec = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
function plural(n, one, few, many) { const a = n % 10, b = n % 100; if (a === 1 && b !== 11) return one; if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few; return many; }
function popText(p) {
  if (p >= 1e9) return 'око ' + dec(p / 1e9) + ' ' + (p < 2e9 ? 'милијарда' : 'милијарде');
  if (p >= 1e6) { const m = p / 1e6; if (m >= 10) { const r = Math.round(m); return 'око ' + r + ' ' + plural(r, 'милион', 'милиона', 'милиона'); } return 'око ' + dec(m) + ' ' + (Math.round(m * 10) === 10 ? 'милион' : 'милиона'); }
  if (p >= 1000) { const t = Math.round(p / 1000); return 'око ' + t + ' ' + plural(t, 'хиљаду', 'хиљаде', 'хиљада'); }
  return 'око ' + fmt(Math.round(p / 10) * 10);
}
function areaCompare(c) {
  if (c.id === 'SRB') return 'Ово је наша земља!';
  const r = c.area / C.SRB.area;
  const times = (q) => q < 10 ? dec(q) : q < 1000 ? fmt(q) : popText(q);
  if (r >= 1.5) return times(r) + ' пута већа од Србије';
  if (r <= 0.67) return 'Србија је ' + times(1 / r) + ' пута већа';
  return 'Отприлике велика као Србија';
}

// ---------- ekrani ----------
function show(id) {
  document.querySelectorAll('.scr').forEach((s) => s.classList.toggle('on', s.id === id));
  if (SCREENS[id] && SCREENS[id].enter) SCREENS[id].enter();
}
const SCREENS = {};
const ICON = {
  home: '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" fill="currentColor"/></svg>',
  fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
};
function toggleFs() {
  try {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {});
    } else document.exitFullscreen();
  } catch (e) {}
}
function header(title, extra) {
  const h = el('div', 'hdr');
  const hb = el('button', 'hbtn', ICON.home + 'Почетна'); hb.onclick = () => show('home');
  h.append(hb, el('h1', null, title), el('div', 'sp'));
  if (extra) h.append(extra);
  const fs = el('button', 'hbtn', ICON.fs); fs.setAttribute('aria-label', 'Цео екран'); fs.onclick = toggleFs; h.append(fs);
  return h;
}
let toastT;
function toast(msg, host) {
  let t = $('.toast', host); if (!t) { t = el('div', 'toast'); host.append(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800);
}
function hashHue(id) { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
// Boja države: boja kontinenta, uz blagu razliku između suseda.
function countryFill(c) {
  const base = CONT[c.cont].c, v = [0, -14, 10, -6][hashHue(c.id) % 4];
  return shade(base, v);
}
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (x) => Math.max(0, Math.min(255, Math.round(pct < 0 ? x * (1 + pct / 100) : x + (255 - x) * pct / 100)));
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}

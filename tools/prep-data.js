// Priprema podataka za Mapu sveta.
// Ulaz: Natural Earth (javno dobro), mledoze/countries (ODbL), flag-icons (MIT), tools/sr-data.js.
// Izlaz: data/world.json (projektovane SVG putanje i podaci), data/flags.json (zastave, base64 WebP).
// Pokretanje: node tools/prep-data.js <folder sa izvornim podacima>
const fs = require('fs');
const path = require('path');
const NM = '/opt/npm-tools/node_modules/';
const d3 = require(NM + 'd3-geo');
const SR = require('./sr-data.js');

const RAW = process.argv[2];
const OUT = path.join(__dirname, '..', 'data');
fs.mkdirSync(OUT, { recursive: true });
const J = (f) => JSON.parse(fs.readFileSync(path.join(RAW, f)));

const ne = J('nev/geojson/ne_50m_admin_0_countries.geojson');
const mc = J('mc/countries.json');
const places = J('nev/geojson/ne_50m_populated_places_simple.geojson');
const riv50 = J('nev/geojson/ne_50m_rivers_lake_centerlines_scale_rank.geojson');
const riv10 = J('nev/geojson/ne_10m_rivers_lake_centerlines.geojson');
const lakes = J('nev/geojson/ne_50m_lakes.geojson');

// ---------- Robinson projekcija ----------
const RX = [1, .9986, .9954, .99, .9822, .973, .96, .9427, .9216, .8962, .8679, .835, .7986, .7597, .7186, .6732, .6213, .5722, .5322];
const RY = [0, .062, .124, .186, .248, .31, .372, .434, .4958, .5571, .6176, .6769, .7346, .7903, .8435, .8936, .9394, .9761, 1];
const W = 2000, R = W / (2 * 0.8487 * Math.PI), H = 2 * 1.3523 * R;
function proj(lon, lat) {
  const a = Math.min(Math.abs(lat), 90) / 5, i = Math.min(Math.floor(a), 17), t = a - i;
  const X = RX[i] + (RX[i + 1] - RX[i]) * t, Y = RY[i] + (RY[i + 1] - RY[i]) * t;
  return [W / 2 + 0.8487 * R * X * lon * Math.PI / 180, H / 2 - Math.sign(lat) * 1.3523 * R * Y];
}

// ---------- Pomoćne funkcije ----------
const LAT2CYR = [['dž','џ'],['Dž','Џ'],['DŽ','Џ'],['lj','љ'],['Lj','Љ'],['nj','њ'],['Nj','Њ']];
const MAP1 = { a:'а',b:'б',v:'в',g:'г',d:'д',đ:'ђ',e:'е',ž:'ж',z:'з',i:'и',j:'ј',k:'к',l:'л',m:'м',n:'н',o:'о',p:'п',r:'р',s:'с',t:'т',ć:'ћ',u:'у',f:'ф',h:'х',c:'ц',č:'ч',š:'ш' };
function cyr(s) {
  for (const [a, b] of LAT2CYR) s = s.split(a).join(b);
  return [...s].map((ch) => {
    const lo = ch.toLowerCase();
    if (!MAP1[lo]) return ch;
    return ch === lo ? MAP1[lo] : MAP1[lo].toUpperCase();
  }).join('');
}
function simplify(pts, tol) { // Douglas-Peucker
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const st = [[0, pts.length - 1]];
  while (st.length) {
    const [s, e] = st.pop(); let md = 0, mi = -1;
    const [x1, y1] = pts[s], [x2, y2] = pts[e], dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy;
    for (let i = s + 1; i < e; i++) {
      const [x, y] = pts[i];
      let d;
      if (L === 0) d = (x - x1) ** 2 + (y - y1) ** 2;
      else { const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / L)); d = (x - x1 - t * dx) ** 2 + (y - y1 - t * dy) ** 2; }
      if (d > md) { md = d; mi = i; }
    }
    if (md > tol * tol) { keep[mi] = 1; st.push([s, mi], [mi, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const r1 = (v) => Math.round(v * 10) / 10;
const area2 = (p) => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return Math.abs(a / 2); };
function ringsToPath(rings, tol, minArea) {
  let out = '', bb = [1e9, 1e9, -1e9, -1e9], big = null, bigA = 0;
  const all = rings.map((r) => simplify(r.map(([lo, la]) => proj(lo, la)), tol));
  for (const p of all) {
    const a = area2(p);
    if (a > bigA) { bigA = a; big = p; }
  }
  let mb = [1e9, 1e9, -1e9, -1e9];
  for (const p of all) {
    if (p.length < 3) continue;
    const a = area2(p);
    if (a >= bigA * 0.12) for (const [x, y] of p) mb = [Math.min(mb[0], x), Math.min(mb[1], y), Math.max(mb[2], x), Math.max(mb[3], y)];
    if (a < minArea && p !== big) continue;
    let s = '', lx = null, ly = null;
    for (const [x, y] of p) {
      const X = r1(x), Y = r1(y);
      if (X === lx && Y === ly) continue;
      s += (s ? ' ' : 'M') + X + ',' + Y; lx = X; ly = Y;
      bb = [Math.min(bb[0], X), Math.min(bb[1], Y), Math.max(bb[2], X), Math.max(bb[3], Y)];
    }
    out += s + 'Z';
  }
  return { d: out, bb, mb: mb.map(r1) };
}
function lineToPath(lines, tol) {
  let out = '', best = null, bl = 0;
  for (const l of lines) {
    const p = simplify(l.map(([lo, la]) => proj(lo, la)), tol);
    if (p.length < 2) continue;
    let len = 0; for (let i = 1; i < p.length; i++) len += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]);
    if (len > bl) { bl = len; best = p; }
    out += 'M' + p.map(([x, y]) => r1(x) + ',' + r1(y)).join(' ');
  }
  const mid = best ? best[Math.floor(best.length / 2)] : [0, 0];
  return { d: out, lx: r1(mid[0]), ly: r1(mid[1]), len: bl };
}
const polysOf = (g) => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
const linesOf = (g) => g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];

// Spajanje susednih poligona: uklanjaju se zajedničke ivice, ostatak se ulančava u nove prstenove.
function dissolve(rings) {
  const k = (a, b) => a[0] + ',' + a[1] + '|' + b[0] + ',' + b[1];
  const edges = new Map();
  for (const r of rings) for (let i = 0; i < r.length - 1; i++) {
    const a = r[i], b = r[i + 1];
    if (a[0] === b[0] && a[1] === b[1]) continue;
    const rev = k(b, a);
    if (edges.has(rev)) edges.delete(rev); else edges.set(k(a, b), [a, b]);
  }
  const from = new Map();
  for (const [key, [a, b]] of edges) { const s = a[0] + ',' + a[1]; (from.get(s) || from.set(s, []).get(s)).push(key); }
  const used = new Set(), out = [];
  for (const [key, [a]] of edges) {
    if (used.has(key)) continue;
    const ring = [a]; let cur = key;
    while (cur && !used.has(cur)) {
      used.add(cur); const b = edges.get(cur)[1]; ring.push(b);
      const nx = (from.get(b[0] + ',' + b[1]) || []).find((e) => !used.has(e)); cur = nx;
    }
    if (ring.length > 3) out.push(ring);
  }
  return out;
}

// ---------- Države ----------
const states = mc.filter((x) => x.unMember || ['VAT', 'PSE'].includes(x.cca3));
const IDS = new Set(states.map((s) => s.cca3));
const contOf = (s) => s.region === 'Americas' ? (s.subregion === 'South America' ? 'SA' : 'NA') : ({ Europe: 'EU', Asia: 'AS', Africa: 'AF', Oceania: 'OC' })[s.region];

const groups = new Map(); // id -> {rings:[], props:[], merged:bool}
const crimeaPt = [34.1, 45.0];
for (const f of ne.features) {
  const p = f.properties;
  let id = SR.merge[p.ADM0_A3] || (IDS.has(p.ISO_A3_EH) ? p.ISO_A3_EH : null);
  const terr = !id;
  if (terr) id = 'T_' + (p.ISO_A3_EH !== '-99' ? p.ISO_A3_EH : p.ADM0_A3);
  const g = groups.get(id) || groups.set(id, { rings: [], props: [], merged: false, terr }).get(id);
  if (SR.merge[p.ADM0_A3]) g.merged = true;
  g.props.push(p);
  for (const poly of polysOf(f.geometry)) {
    if (p.ADM0_A3 === 'RUS' && d3.geoContains({ type: 'Polygon', coordinates: poly }, crimeaPt)) {
      const u = groups.get('UKR') || groups.set('UKR', { rings: [], props: [], merged: false }).get('UKR');
      u.rings.push(...poly); u.merged = true; continue;
    }
    g.rings.push(...poly);
  }
}

// Glavni gradovi iz Natural Earth naseljenih mesta
const capPts = {};
for (const f of places.features) {
  const p = f.properties; if (p.adm0cap !== 1) continue;
  (capPts[p.adm0_a3] = capPts[p.adm0_a3] || []).push(p);
}
const sovA3 = {};
for (const f of ne.features) sovA3[f.properties.ISO_A3_EH] = f.properties.ADM0_A3;

const countries = [], territories = [], warn = [];
// Koordinate glavnih gradova kojih nema u NE 50m skupu (lat, lon)
const CAPFIX = { NRU:[-0.547,166.921], PSE:[31.903,35.204], SSD:[4.859,31.571], TZA:[-6.163,35.752], BDI:[-3.427,29.925],
  BEN:[6.497,2.605], GNQ:[1.582,10.817], SWZ:[-26.443,31.205], PLW:[7.500,134.624], KIR:[1.329,172.979] };
for (const s of states) {
  const g = groups.get(s.cca3);
  if (!g) { warn.push('nema geometrije: ' + s.cca3); continue; }
  const rings = g.merged ? dissolve(g.rings) : g.rings;
  const P = g.props.find((p) => p.ISO_A3_EH === s.cca3) || g.props[0];
  const geo = ringsToPath(rings, 0.08, 0.15);
  const ov = SR.nameOverride[s.cca3] || {};
  const nm = ov.n || cyr(s.translations.srp.common);
  // glavni grad
  const cands = capPts[sovA3[s.cca3]] || capPts[s.cca3] || [];
  const capEn = s.capital[0];
  const nameEq = (c) => [c.name, c.nameascii, c.namealt].some((n) => n && n.toLowerCase().replace(/[-.]/g, ' ').replace('saint', 'st') === capEn.toLowerCase().replace(/[-.]/g, ' ').replace('saint', 'st'));
  let cp = cands.find(nameEq) || places.features.map((f) => f.properties).find((c) => nameEq(c) && c.adm0name && (c.sov_a3 === s.cca3 || c.adm0_a3 === sovA3[s.cca3] || c.iso_a2 === s.cca2));
  if (!cp && CAPFIX[s.cca3]) cp = { name: capEn, latitude: CAPFIX[s.cca3][0], longitude: CAPFIX[s.cca3][1] };
  if (!cp) cp = cands[0];
  if (!cp) warn.push('nema koordinata glavnog grada: ' + s.cca3 + ' ' + capEn);
  const capXY = cp ? proj(cp.longitude, cp.latitude).map(r1) : null;
  if (cp && !nameEq(cp) && cp.name !== capEn)
    warn.push('grad iz NE se razlikuje: ' + s.cca3 + ' ' + capEn + ' / ' + cp.name);
  const lab = proj(P.LABEL_X, P.LABEL_Y).map(r1);
  const bw = geo.bb[2] - geo.bb[0], bh = geo.bb[3] - geo.bb[1];
  countries.push({
    id: s.cca3, a2: s.cca2.toLowerCase(), n: nm, full: ov.full || null,
    cap: SR.capital[s.cca3], capXY, cont: contOf(s), area: s.area, pop: P.POP_EST, popY: P.POP_YEAR,
    nb: s.borders.filter((b) => IDS.has(b)), land: s.landlocked,
    lx: lab[0], ly: lab[1], ml: P.MIN_LABEL, lr: P.LABELRANK,
    small: Math.max(bw, bh) < 7, cx: r1((geo.bb[0] + geo.bb[2]) / 2), cy: r1((geo.bb[1] + geo.bb[3]) / 2),
    bb: geo.bb, mb: geo.mb, d: geo.d,
  });
}
for (const [id, g] of groups) {
  if (!g.terr) continue;
  const p = g.props[0], key = id.slice(2);
  const geo = ringsToPath(g.rings, 0.08, 0.15);
  if (!geo.d) continue;
  const lab = proj(p.LABEL_X, p.LABEL_Y).map(r1);
  territories.push({ id: key, n: SR.territory[key] || null, sov: SR.territorySov[p.SOV_A3] || null,
    ant: key === 'ATA', lx: lab[0], ly: lab[1], ml: p.MIN_LABEL, d: geo.d, bb: geo.bb });
}

// ---------- Reke ----------
const rivers = [];
for (const rv of SR.rivers) {
  const lines = [];
  if (rv.seg) for (const f of riv50.features) if (rv.seg.includes(f.properties.name)) lines.push(...linesOf(f.geometry));
  if (rv.seg10) for (const f of riv10.features) {
    if (!rv.seg10.includes(f.properties.name)) continue;
    for (const l of linesOf(f.geometry)) {
      if (rv.box && !l.every(([lo, la]) => lo > rv.box[0] && la > rv.box[1] && lo < rv.box[2] && la < rv.box[3])) continue;
      lines.push(l);
    }
  }
  if (!lines.length) { warn.push('nema reke: ' + rv.id); continue; }
  const pth = lineToPath(lines, 0.1);
  // kroz koje države protiče
  const thru = new Set();
  for (const l of lines) for (let i = 0; i < l.length; i += 3) {
    for (const s of states) {
      const f = ne.features.find((x) => x.properties.ISO_A3_EH === s.cca3);
      if (f && d3.geoContains(f, l[i])) { thru.add(s.cca3); break; }
    }
  }
  (rv.thruAdd || []).forEach((x) => thru.add(x));
  rivers.push({ id: rv.id, n: rv.n, fact: rv.fact || null, d: pth.d, lx: pth.lx, ly: pth.ly, len: r1(pth.len), thru: [...thru] });
}
// Srbija u spajanju: tačke na Kosovu takođe pripadaju Srbiji
for (const r of rivers) r.thru = [...new Set(r.thru)];

// ---------- Jezera ----------
const lakeOut = [];
for (const f of lakes.features) {
  const p = f.properties; if (p.scalerank > 0) continue;
  const rings = polysOf(f.geometry).map((poly) => poly[0]);
  const geo = ringsToPath(rings, 0.08, 0.3);
  if (!geo.d) continue;
  const big = (geo.bb[2] - geo.bb[0]) * (geo.bb[3] - geo.bb[1]);
  if (big < 0.6) continue;
  const n = SR.lakes[p.name] || null;
  lakeOut.push({ n, d: geo.d, lx: r1((geo.bb[0] + geo.bb[2]) / 2), ly: r1((geo.bb[1] + geo.bb[3]) / 2) });
}

// ---------- Okeani, obris sveta ----------
const oceans = SR.oceans.map((o) => ({ ...o, at: o.at.map(([lo, la]) => proj(lo, la).map(r1)) }));
let sphere = '';
{ const L = [], Rr = [];
  for (let la = -90; la <= 90; la += 2.5) { L.push(proj(-180, la)); Rr.unshift(proj(180, la)); }
  sphere = 'M' + [...L, ...Rr].map(([x, y]) => r1(x) + ',' + r1(y)).join(' ') + 'Z'; }
const grat = [];
for (let la = -60; la <= 60; la += 30) { const p = []; for (let lo = -180; lo <= 180; lo += 5) p.push(proj(lo, la)); grat.push('M' + p.map(([x, y]) => r1(x) + ',' + r1(y)).join(' ')); }
for (let lo = -150; lo <= 180; lo += 30) { const p = []; for (let la = -90; la <= 90; la += 5) p.push(proj(lo, la)); grat.push('M' + p.map(([x, y]) => r1(x) + ',' + r1(y)).join(' ')); }
const equator = (() => { const p = []; for (let lo = -180; lo <= 180; lo += 5) p.push(proj(lo, 0)); return 'M' + p.map(([x, y]) => r1(x) + ',' + r1(y)).join(' '); })();

// ---------- Kontinenti: izračunate činjenice ----------
const continents = {};
for (const [k, c] of Object.entries(SR.continents)) {
  const cs = countries.filter((x) => x.cont === k);
  const byA = [...cs].sort((a, b) => b.area - a.area), byP = [...cs].sort((a, b) => b.pop - a.pop);
  const bb = cs.length ? cs.reduce((m, x) => [Math.min(m[0], x.bb[0]), Math.min(m[1], x.bb[1]), Math.max(m[2], x.bb[2]), Math.max(m[3], x.bb[3])], [1e9, 1e9, -1e9, -1e9]) : null;
  continents[k] = { ...c, count: cs.length, largest: byA[0]?.id || null, smallest: byA.at(-1)?.id || null, mostPop: byP[0]?.id || null, bb };
}
// Kontinentalne granice za zum (ručno, jer neke države imaju udaljena ostrva)
const BOX = { EU: [-25, 34, 45, 71], AS: [26, -11, 150, 56], AF: [-19, -36, 52, 38], NA: [-170, 7, -52, 75], SA: [-82, -56, -34, 13], OC: [110, -48, 180, -8], AN: [-180, -90, 180, -62] };
for (const [k, b] of Object.entries(BOX)) {
  const a = proj(b[0], b[3]), z = proj(b[2], b[1]);
  continents[k].bb = [r1(Math.min(a[0], proj(b[0], b[1])[0])), r1(a[1]), r1(Math.max(z[0], proj(b[2], b[3])[0])), r1(z[1])];
}

// ---------- Životinje, biljke, činjenice (po kontinentima) ----------
const FACTS = {};
for (const f of fs.readdirSync(path.join(__dirname, 'facts'))) Object.assign(FACTS, require('./facts/' + f));
const iconCodes = new Set();
for (const c of countries) {
  const x = FACTS[c.id]; if (!x) continue;
  c.nat = x;
  for (const k of ['a', 'b', 'g', 'f', 't']) if (x[k]) iconCodes.add(x[k][1]);
}
const icons = {};
for (const code of iconCodes) {
  const f = path.join(RAW, 'om/color/svg', code + '.svg');
  if (!fs.existsSync(f)) { warn.push('nema ikonice ' + code); continue; }
  icons[code] = fs.readFileSync(f, 'utf8').replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '').replace(/\s*\n\s*/g, ' ').replace(/\s*id="[^"]*"/g, '').trim();
}
fs.writeFileSync(path.join(OUT, 'icons.json'), JSON.stringify(icons));

const world = { W: r1(W), H: r1(H), sphere, grat, equator, countries, territories, rivers, lakes: lakeOut, oceans, continents,
  src: 'Natural Earth (javno dobro); mledoze/countries (ODbL); flag-icons (MIT)' };
fs.writeFileSync(path.join(OUT, 'world.json'), JSON.stringify(world));

// ---------- Zastave ----------
(async () => {
  const sharp = require(NM + 'sharp');
  const flags = {};
  let total = 0;
  for (const c of countries) {
    const f = path.join(RAW, 'fi/flags/4x3', c.a2 + '.svg');
    try {
      const buf = await sharp(fs.readFileSync(f), { density: 200 }).resize(240, 180, { fit: 'fill' }).webp({ quality: 80 }).toBuffer();
      flags[c.id] = buf.toString('base64'); total += buf.length;
    } catch (e) { warn.push('zastava: ' + c.id + ' ' + e.message); }
  }
  fs.writeFileSync(path.join(OUT, 'flags.json'), JSON.stringify(flags));
  const sz = (o) => (JSON.stringify(o).length / 1024).toFixed(0) + ' KB';
  console.log('ikonice', Object.keys(icons).length, (JSON.stringify(icons).length / 1024).toFixed(0) + ' KB', '| države sa prirodom', countries.filter((c) => c.nat).length);
  console.log('države', countries.length, 'teritorije', territories.length, 'reke', rivers.length, 'jezera', lakeOut.length);
  console.log('world.json', sz(world), '| putanje država', sz(countries.map((c) => c.d)), '| zastave', (total / 1024).toFixed(0) + ' KB');
  console.log(warn.join('\n'));
})();

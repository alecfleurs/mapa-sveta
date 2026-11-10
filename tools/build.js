// Spaja izvorne delove u jedan HTML i pravi PWA paket.
// Izlaz: dist/ (GitHub Pages: index.html, manifest, sw.js, ikonice) i build/mapa-sveta.html (pun fajl za pregled i rezervnu kopiju).
const fs = require('fs');
const path = require('path');
const sharp = require('/opt/npm-tools/node_modules/sharp');
const ROOT = path.join(__dirname, '..');
const VERSION = 'ms-v4';
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

const css = rd('src/style.css');
const js = ['core', 'map', 'explore', 'home', 'main'].map((f) => `// ---- ${f}.js ----\n` + rd(`src/${f}.js`)).join('\n');
const world = rd('data/world.json'), flags = rd('data/flags.json'), icons = rd('data/icons.json');
const tpl = rd('src/index.html');
const page = (pwa, noSw) => tpl
  .replace('<!--PWA-->', () => pwa ? '<link rel="manifest" href="manifest.webmanifest">\n<link rel="icon" href="icon-192.png">\n<link rel="apple-touch-icon" href="icon-192.png">' : '')
  .replace('/*CSS*/', () => css)
  .replace('/*DATA*/', () => `window.WORLD=${world};window.FLAGS=${flags};window.ICONS=${icons};window.MS_VERSION='${VERSION}';${noSw ? 'window.NO_SW=true;' : ''}`)
  .replace('/*JS*/', () => js);

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), page(true, false));
fs.writeFileSync(path.join(ROOT, 'build/mapa-sveta.html'), page(false, true));
// verzija za pregled na claude.ai: bez doctype/html/head/body (okvir ih dodaje sam)
fs.writeFileSync(path.join(ROOT, 'build/pregled.html'), page(false, true)
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '').replace(/<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*/, '')
  .replace(/<\/head>\s*<body>/, '').replace(/<\/body>\s*<\/html>\s*$/, '')
  .replace('<title>Мапа света</title>', '<title>Мапа света</title>\n<style>html,body{height:100%}</style>'));

fs.writeFileSync(path.join(ROOT, 'dist/manifest.webmanifest'), JSON.stringify({
  name: 'Мапа света', short_name: 'Мапа света', lang: 'sr', start_url: './', scope: './',
  display: 'fullscreen', orientation: 'landscape', background_color: '#BEE3F4', theme_color: '#FF8A3D',
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));

fs.writeFileSync(path.join(ROOT, 'dist/sw.js'), `// Offline keš. Pri svakoj novoj verziji podići CACHE (npr. ms-v1 u ms-v2).
const CACHE = '${VERSION}';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const font = /fonts\\.(googleapis|gstatic)\\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  // stranica: prvo mreža (da stigne nova verzija), pa keš; fontovi i ostalo: prvo keš
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('index.html', cp)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((m) => m || fetch(e.request).then((r) => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); }
    return r;
  })));
});
`);

// Ikonica: mapa sveta na nebu, crvena oznaka na Srbiji
(async () => {
  const W = JSON.parse(world);
  const SRB = W.countries.find((c) => c.id === 'SRB');
  const colors = { EU: '#7FB3E0', AS: '#F2C46B', AF: '#E89B6A', NA: '#9FD08A', SA: '#C9A0DC', OC: '#F0A3B5' };
  const icon = (pad) => {
    const s = 512, inner = s - pad * 2, sc = inner / W.W, h = W.H * sc * 0.82;
    const oy = (s - h) / 2 - 10;
    const paths = W.countries.map((c) => `<path d="${c.d}" fill="${c.id === 'SRB' ? '#E2574C' : colors[c.cont]}"/>`).join('');
    const pin = `<g transform="translate(${pad + SRB.lx * sc},${oy + SRB.ly * sc * 0.82})"><path d="M0 0 C-30 -40 -30 -78 0 -78 C30 -78 30 -40 0 0Z" fill="#E2574C" stroke="#fff" stroke-width="6"/><circle cy="-52" r="11" fill="#fff"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC6EE"/><stop offset="1" stop-color="#D9F1FB"/></linearGradient></defs>
      <rect width="${s}" height="${s}" rx="${pad ? 0 : 96}" fill="url(#g)"/>
      <g transform="translate(${pad},${oy}) scale(${sc},${sc * 0.82})">${paths}</g>${pin}</svg>`;
  };
  await sharp(Buffer.from(icon(24))).resize(512).png().toFile(path.join(ROOT, 'dist/icon-512.png'));
  await sharp(Buffer.from(icon(24))).resize(192).png().toFile(path.join(ROOT, 'dist/icon-192.png'));
  await sharp(Buffer.from(icon(70))).flatten({ background: '#7CC6EE' }).resize(512).png().toFile(path.join(ROOT, 'dist/icon-maskable-512.png'));
  const kb = (f) => (fs.statSync(path.join(ROOT, f)).size / 1024).toFixed(0) + ' KB';
  console.log('dist/index.html', kb('dist/index.html'), '| build/mapa-sveta.html', kb('build/mapa-sveta.html'));
})();

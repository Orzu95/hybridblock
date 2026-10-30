/* Hybridblock Service Worker: App offline, Schriften gecacht, Open Food Facts immer live */
const VERSION = 'hb-v35';
const SHELL = ['./', './index.html', './app.css', './app.js', './cloud.js', './i18n.js', './lang-en.js', './lang-ru.js', './cues-ru.js', './data.js', './connect.js', './track.js', './privacy.js', './cycle.js', './review.js', './spowi.js', './food.js', './account.js', './ops.js', './superset.js', './equipment.js', './evidence.js', './evidence.json', './evidence-en.json', './evidence-ru.json', './learn.js', './tour.js', './days.js', './plandays.js', './glossary.js', './confirm.js', './results.js', './week.js', './levels.js', './search.js', './privacypolicy.html', './vendor/leaflet/leaflet.js', './vendor/leaflet/leaflet.css', './plans7.js', './library.js', './planner.js', './planend.js', './bodymap.js', './vendor/fflate.min.js', './vendor/zxing.min.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('openfoodfacts.org')) return;
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || (url.hostname === 'exercise-dataset.com' && url.pathname.startsWith('/images/'))) {
    e.respondWith(caches.open(VERSION).then(async c => { const hit = await c.match(e.request); const net = fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }).catch(() => hit); return hit || net; }));
    return;
  }
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
  }
});

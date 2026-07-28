/* Service worker — Calculatrice BACK / LAY
   Stratégie : cache-first sur l'app shell (100 % offline une fois installée). */
const CACHE = 'calc-backlay-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './app-logo.png',
  './app-logo-maskable.png',
  './google-sans-flex.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req)
      .then(res => {
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match('./index.html'))
    )
  );
});

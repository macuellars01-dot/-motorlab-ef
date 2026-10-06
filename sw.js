const CACHE = 'motorlab-ef-v94.6-ludomundo';
const ASSETS = [
  './', './index.html', './styles.css', './app.js?v=16.4-v94.5',
  './manifest.webmanifest', './apple-touch-icon.png',
  './icon-192.png', './icon-512.png',
  './data/games.json', './data/catalog_patch_v60.json', './data/sources.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const u = new URL(event.request.url);

  // Do NOT intercept external requests such as the MotorLab API
  // served through Tailscale. Let Safari send them directly to the network.
  if (u.origin !== self.location.origin) return;

  if (
    u.pathname.endsWith('/data/games.json') ||
    u.pathname.endsWith('/data/catalog_patch_v60.json') ||
    u.pathname.endsWith('/data/sources.json') ||
    u.pathname.endsWith('/app.js') ||
    u.pathname.endsWith('/index.html') ||
    u.pathname.endsWith('/styles.css')
  ) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
          return r;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
          return response;
        })
        .catch(() => cached)
      )
  );
});

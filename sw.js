const CACHE_VERSION = 'v3';
const CACHE_NAME = `gi-space-${CACHE_VERSION}`;

// ONLY put files here that ACTUALLY exist right now
const STATIC_ASSETS = [
  './',
  './index.html',
  './home.html',
  './manifest.json',
  './css/main.css',
  './css/writings.css',
  './css/devotional.css',
  './js/main.js',
  './js/godarodu.js'
  // Removed missing pages/icons for now so caching doesn't fail
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Loop through each file individually so one 404 doesn't break everything
      for (const asset of STATIC_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`Skipping missing file: ${asset}`);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete ALL old caches
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);
  const isHTML = request.headers.get('accept')?.includes('text/html');
  const isCodeFile = /\.(css|js|json)$/i.test(url.pathname);

  if (isHTML || isCodeFile) {
    // NETWORK FIRST (Always get the newest version, bypass old cache)
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // CACHE FIRST for assets (images, fonts)
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
      )
    );
  }
});

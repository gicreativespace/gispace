const CACHE_VERSION = 'v3';
const CACHE_NAME = `gi-space-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  './',
  './index.html',
  './home.html',
  './manifest.json',
  './css/main.css',
  './css/writings.css',
  './css/devotional.css',
  './js/main.js',
  './js/godarodu.js',
  './pages/gi_writings.html',
  './pages/gi_devotional.html',
  './pages/godarodu.html',
  './pages/about.html',
  './pages/contact.html',
  './pages/gi_digital.html',
  './pages/gi_education.html',
  './pages/gi_space.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(e => console.warn('Cache partial fail:', e)))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete ALL caches (nuclear option)
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      
      // Claim all clients
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
    // NETWORK FIRST
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
    // CACHE FIRST for assets
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

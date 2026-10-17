const CACHE_VERSION = 'v5'; // Bumped to v5 to force clear
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
  './js/godarodu.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
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
    // NETWORK FIRST for code (Always gets the new main.js)
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
    // CACHE FIRST for images, BUT ONLY CACHE IF IT'S A SUCCESSFUL 200 OK
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        
        return fetch(request).then(res => {
          // If the image is missing (404), do NOT cache it!
          if (!res || res.status !== 200) return res; 
          
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        });
      })
    );
  }
});

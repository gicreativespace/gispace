const CACHE_VERSION = 'v9'; // Bumped to v9
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
    // 🚨 THE FIX: Append a unique timestamp to force the browser to bypass its own cache
    const fetchUrl = new URL(request.url);
    fetchUrl.searchParams.set('_cb', Date.now().toString());

    event.respondWith(
      fetch(fetchUrl.toString(), { cache: 'no-store' }) 
        .then(res => {
          const clone = res.clone();
          // Save to Service Worker cache under the original URL for offline fallback
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request)) // Fallback to cache if truly offline
    );
  } else {
    // Cache first for images and fonts (loads instantly)
    event.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(request, clone));
          return res;
        });
      })
    );
  }
});

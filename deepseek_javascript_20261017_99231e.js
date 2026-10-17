// BUMP THIS VERSION EVERY TIME YOU UPDATE FILES
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

// ---------- INSTALL ----------
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Take over immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some assets failed to cache:', err);
      });
    })
  );
});

// ---------- ACTIVATE ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open pages
  );
});

// ---------- FETCH ----------
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET and non-http requests
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http')) return;

  const url = new URL(request.url);
  const isHTML = request.headers.get('accept')?.includes('text/html');
  const isCodeFile = /\.(css|js|json)$/i.test(url.pathname);

  if (isHTML || isCodeFile) {
    // NETWORK-FIRST for HTML, CSS, JS (always get fresh)
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request)) // Fallback to cache if offline
    );
  } else {
    // CACHE-FIRST for images, fonts, icons (rarely change)
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
  }
});
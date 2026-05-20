const CACHE_NAME = 'genai-lab-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/start.html',
  '/manifest.json',
  '/og-image.png',
  '/robots.txt',
];

// Install: cache static shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for JS/CSS bundles, cache-first for images
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and external requests
  if (request.method !== 'GET') return;
  if (!url.origin.includes(self.location.origin)) return;

  // Network-first for HTML navigation (always fresh app shell)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(request, clone)); return res; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets (images, fonts)
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|woff2?|ttf)$/)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Network-first for JS/CSS (stale-while-revalidate)
  if (url.pathname.match(/\.(js|css)$/)) {
    event.respondWith(
      fetch(request)
        .then(res => { const clone = res.clone(); caches.open(CACHE_NAME).then(c => c.put(request, clone)); return res; })
        .catch(() => caches.match(request))
    );
    return;
  }
});

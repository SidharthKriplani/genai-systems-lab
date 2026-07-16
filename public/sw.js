// GenAI Systems Lab — Service Worker (v2, 2026-07-17)
//
// v1 ('genai-lab-v1') pre-cached '/' and '/index.html' and used them as the
// navigation fallback, and cached every fetched JS/CSS body under CACHE_NAME —
// a recipe for users running STALE bundles that survive hard refresh
// (Ctrl+Shift+R bypasses the HTTP cache, NOT a controlling service worker's
// Cache Storage). Same class of bug MSL fixed in its sw v2.
//
// v2 strategy (mirrors MSL):
//   - Cache name bumped → activate purges every v1 cache (heals poisoned users).
//   - Navigations are NOT intercepted at all — index.html always loads with
//     normal browser semantics, so new deploys' chunk hashes always arrive.
//   - /assets/* hashed files: cache-first (immutable by construction), with a
//     content-type guard so an HTML body is never cached under a .js/.css URL.
//   - Everything else: network-first with same-guard opportunistic caching.
//   - SELF-HEAL: on activate, every controlled window is re-navigated once so
//     tabs running a poisoned bundle reload into the fresh one automatically.

const CACHE = 'gsl-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => Promise.all(clients.map(c => c.navigate(c.url).catch(() => {}))))
  )
})

function cacheable(url, res) {
  if (!res.ok || res.status !== 200 || res.type !== 'basic') return false
  const type = (res.headers.get('content-type') || '').toLowerCase()
  if (/\.(js|mjs|css|json|svg|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname) && type.includes('text/html')) return false
  return true
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return
  if (e.request.mode === 'navigate') return // never intercept navigations

  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (cacheable(url, res)) {
            const clone = res.clone()
            caches.open(CACHE).then(c => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  e.respondWith(
    fetch(e.request).then(res => {
      if (cacheable(url, res)) {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }).catch(() => caches.match(e.request))
  )
})

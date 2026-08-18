const CACHE_NAME = 'bhpro-v2';
const urlsToCache = ['/', '/manifest.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Never intercept API calls or non-GET requests — those must always hit the live
  // server and return real JSON, never a cached/offline fallback. Only cache-fallback
  // for simple static page loads (helps the app open when there's no signal at all).
  if (url.pathname.startsWith('/api/') || e.request.method !== 'GET') {
    return; // let the browser handle it normally, untouched
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

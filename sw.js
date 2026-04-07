const CACHE_NAME = 'kgh-v2.0';
const PRE_CACHE_ASSETS = [
  '/',
  '/post.html', // File ដែលអ្នកទើបបង្កើត
  '/manifest.json',
  '/sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE_ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});

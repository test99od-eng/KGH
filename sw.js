const CACHE_NAME = 'kgh-plus-v2';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        new Request(OFFLINE_URL, { cache: 'reload' })
      ]);
    })
  );
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ដើរភ្លាម
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // កាន់កាប់ Page ភ្លាមៗ
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

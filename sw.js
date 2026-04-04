const CACHE_NAME = 'kgh-plus-v1';
const urlsToCache = [
  '/',
  '/index.html',
  'https://kghplus.blogspot.com/'
];

// ជំហានតម្លើង និងរក្សាទុកទិន្នន័យ (Caching)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// ជំហានទាញយកទិន្នន័យមកបង្ហាញពេល Offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // បើមានក្នុង Cache ឱ្យបង្ហាញចេញមក បើអត់ទេឱ្យទាញពី Network
        return response || fetch(event.request);
      }).catch(() => {
        // បើអត់ទាំងពីរ (Offline ហើយអត់មាន Cache) អាចដាក់ទំព័រ Error មួយបាន
        return caches.match('/');
      })
  );
});

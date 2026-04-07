const CACHE_NAME = 'kgh-v1.3.0';
const PRE_CACHE_ASSETS = [
  '/',
  '/2026/04/blog-post.html',
  'https://cdn.jsdelivr.net/gh/test99od-eng/KGH@main/manifest.json'
];

// ជំហានដំឡើង និងរក្សាទុក File ក្នុង Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('កំពុង Cache ឯកសារសំខាន់ៗ...');
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ជំហានធ្វើឱ្យ Service Worker ថ្មីដើរភ្លាមៗ
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

// ជំហានទាញយក File ពី Cache មកបង្ហាញពេល Offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // បើមានក្នុង Cache ឱ្យប្រើ Cache បើអត់ទេឱ្យទៅទាញពី Internet (Network)
      return cachedResponse || fetch(event.request);
    })
  );
});

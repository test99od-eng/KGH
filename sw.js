const CACHE_NAME = 'kgh-plus-v1.1.9' + new Date().getTime(); // បង្កើត Version ថ្មីតាមពេលវេលា
const assets = [
  './',
  './index.html',
  './manifest.json',
  './sw.js'
];

// ១. ដំឡើង និងបង្ខំឱ្យដើរភ្លាម (Skip Waiting)
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assets);
    })
  );
});

// ២. សម្អាត Cache ចាស់ៗចោលឱ្យអស់
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // គ្រប់គ្រង Browser ភ្លាមៗ
});

// ៣. យុទ្ធសាស្ត្រទាញយកទិន្នន័យ (Network First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // បើមាន Internet ទាញយករបស់ថ្មី ហើយ Save ទុកក្នុង Cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => {
        // បើអត់ Internet ទើបទៅយករបស់ក្នុង Cache មកបង្ហាញ
        return caches.match(event.request);
      })
  );
});

// ទទួលបញ្ជា SKIP_WAITING ពី index.html
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const CACHE_NAME = 'kgh-v1.1.1'; // ប្តូរលេខនេះរាល់ពេលមានអ្វីថ្មី
const ASSETS = [
  './',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json'
];

// ១. ដំឡើង និង Save កូដថ្មី
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // បង្ខំឱ្យ Update ភ្លាមៗ មិនបាច់រង់ចាំ
});

// ២. លុប Cache ចាស់ៗចោល (Clean up)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('កំពុងលុប Cache ចាស់៖', key);
            return caches.delete(key); // លុប Cache ណាដែលឈ្មោះមិនដូច v2
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ៣. បង្ហាញកូដថ្មីជូនអ្នកប្រើប្រាស់
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

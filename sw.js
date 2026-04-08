const CACHE_NAME = 'kgh-dynamic-cache-v1.1.1';
const STATIC_ASSETS = [
  './',
  'https://test99od-eng.github.io/KGH/',
  'https://raw.githubusercontent.com/test99od-eng/KGH/refs/heads/main/manifest.json',
  './install-pwa.html'
];

// ១. ជំហានដំឡើង៖ រក្សាទុកគ្រោងឆ្អឹងវេបសាយ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('បានរក្សាទុកគ្រោងឆ្អឹងវេបសាយ');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // ឱ្យ Service Worker ថ្មីដើរភ្លាមៗ
});

// ២. ជំហានសម្អាត Cache ចាស់ (ពេលអ្នកប្តូរ Version ថ្មី)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ៣. យុទ្ធសាស្ត្រសំខាន់៖ បង្ហាញរបស់ចាស់ រួច Update របស់ថ្មី (Stale-While-Revalidate)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // បើមាន Internet វានឹងយករបស់ថ្មីទៅដាក់ក្នុង Cache (ជំនួសអា舊)
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // បើមានរបស់ក្នុង Cache គឺបង្ហាញភ្លាម បើអត់ទេទើបចាំ Internet
        return cachedResponse || fetchPromise;
      });
    })
  );
});

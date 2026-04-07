const CACHE_NAME = 'kgh-permanent-cache-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(response => {
      // បើមាន Net: បង្ហាញទិន្នន័យថ្មី និងលួច Save ទុកក្នុង Cache
      const resClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, resClone);
      });
      return response;
    }).catch(() => {
      // បើអត់ Net: ទៅរកមើលក្នុង Cache
      return caches.match(event.request).then(res => res || caches.match('/?m=1'));
    })
  );
});

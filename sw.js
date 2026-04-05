const CACHE_NAME = 'kgh-dynamic-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  return self.clients.claim();
});

// មុខងារទាញយក និងចងចាំទំព័រដែលបានមើល
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // បើមាន Net ឱ្យវា Save ទំព័រនេះទុកក្នុងម៉ាស៊ីនភ្លាម
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // បើអត់ Net ឱ្យវាយកទំព័រដែលធ្លាប់ Save មកបង្ហាញ
        return caches.match(event.request);
      })
  );
});

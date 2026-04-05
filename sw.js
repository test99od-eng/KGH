const CACHE_NAME = 'kgh-plus-refresh-v10';
const OFFLINE_URL = 'https://kghplus.blogspot.com/2026/04/blog-post_2.html';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ថ្មីដំណើរការភ្លាម
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // ១. បង្កើតការទាញយកពី Network ទុកជាមុន
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone()); // Save របស់ថ្មីទុកក្នុងម៉ាស៊ីន
          }
          return networkResponse;
        }).catch(() => {
          // បើគ្មាន Net ឱ្យវាបង្ហាញទំព័រ Offline
          return caches.match(OFFLINE_URL);
        });

        // ២. បង្ហាញរបស់ក្នុង Cache បើមាន បើអត់មានចាំរង់ចាំ Net
        return cachedResponse || fetchPromise;
      });
    })
  );
});

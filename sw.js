const CACHE_NAME = 'kgh-plus-v' + Date.now(); // បង្កើត Version ថ្មីតាមពេលវេលា

self.addEventListener('install', (event) => {
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ថ្មីដំណើរការភ្លាម មិនបាច់រង់ចាំ
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        return caches.delete(key); // លុប Cache ចាស់ៗចោលឱ្យអស់ដើម្បីកុំឱ្យជាប់របស់ចាស់
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); // Save ទុកសម្រាប់មើល Offline លើកក្រោយ
            return networkResponse;
          });
        })
        .catch(() => {
          return caches.match(event.request); // បើអត់ Net ទើបប្រើរបស់ក្នុងម៉ាស៊ីន
        })
    );
  }
});

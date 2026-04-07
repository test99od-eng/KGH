const CACHE_NAME = 'kgh-app-v5';
const OFFLINE_PAGE = '/?m=1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_PAGE]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // បើមាន Net: បង្ហាញទំព័រថ្មី និង Save ទុកក្នុង Cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // បើអត់ Net: ទៅរកមើលទំព័រដែលធ្លាប់ Save ក្នុង Cache
          return caches.match(event.request).then((res) => {
            return res || caches.match(OFFLINE_PAGE);
          });
        })
    );
  } else {
    // សម្រាប់រូបភាព ឬ CSS
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

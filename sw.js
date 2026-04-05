const CACHE_NAME = 'kgh-store-v1';

// ១. ដំឡើង Service Worker ថ្មីភ្លាមៗ
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ២. លុប Cache ចាស់ចោលភ្លាមនៅពេលមានការ Update
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          return caches.delete(cache); // លុប Cache ទាំងអស់ចោលដើម្បីទទួលយករបស់ថ្មី
        })
      );
    })
  );
  return self.clients.claim();
});

// ៣. យុទ្ធសាស្ត្រ៖ ទៅយកពី Net មុន (Network First)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // បើមាន Net ឱ្យវា Save របស់ថ្មីចូល Cache ហើយបង្ហាញរបស់ថ្មីនោះភ្លាម
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // បើអត់ Net ទើបឱ្យវាទៅរកមើលរបស់ដែលធ្លាប់ Save ទុកក្នុង Cache
          return caches.match(event.request);
        })
    );
  }
});

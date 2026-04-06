const CACHE_NAME = 'kgh-dynamic-v2'; // ប្តូរ version រាល់ពេលកែដំរូវ

// ដាក់ URL ទំព័រដើមរបស់អ្នកចូល ដើម្បីឱ្យវា Save ទុកតាំងពីដំបូង
const PRE_CACHE = [
  './',
  'index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
    ))
  );
  return self.clients.claim();
});

// យុទ្ធសាស្ត្រ៖ រកក្នុង Cache មុន បើអត់ទើបទៅរកតាម Net (Cache-First)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // បើមានក្នុងម៉ាស៊ីន ឱ្យវាបង្ហាញភ្លាម (លឿនបំផុត)
      }
      
      return fetch(event.request).then((networkResponse) => {
        // បើមាន Net ឱ្យវា Save ទុកសម្រាប់លើកក្រោយ
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // កន្លែងនេះសម្រាប់ការពារ បើអត់ Net ហើយរកក្នុង Cache ក៏អត់ឃើញ
        return caches.match('/'); 
      });
    })
  );
});

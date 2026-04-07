const CACHE_NAME = 'kgh-shop-v1';
const OFFLINE_URL = '/?m=1';

// ដាក់ URL ណាដែលអ្នកចង់ឱ្យវាដើរតួជាទំព័រ Offline ដំបូង
const urlsToCache = [
  '/',
  OFFLINE_URL,
  'https://fonts.googleapis.com/css2?family=Hanuman&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // បើមានក្នុង Cache ឱ្យបង្ហាញពី Cache បើអត់ទេឱ្យទៅទាញពី Net ហើយរក្សាទុកចូល Cache តែម្តង
      return response || fetch(event.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // បើអត់ Net ហើយអត់មានក្នុង Cache ទៀត ឱ្យបង្ហាញទំព័រដើម
      return caches.match(OFFLINE_URL);
    })
  );
});

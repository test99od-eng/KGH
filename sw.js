const CACHE_NAME = 'kgh-shop-permanent-v1';
const OFFLINE_URL = '/?m=1';

// ឯកសារដែលត្រូវមានជាដាច់ខាត (Static)
const INITIAL_CACHING = [
  OFFLINE_URL,
  'https://kghplus.blogspot.com/2026/04/blog-post.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(INITIAL_CACHING))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim()); // គ្រប់គ្រង App ភ្លាមៗ
});

self.addEventListener('fetch', event => {
  // ឆែកមើលតែការទាញយកទិន្នន័យធម្មតា (GET)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // បើមាន Internet: ឱ្យវាបង្ហាញទិន្នន័យថ្មី ព្រមទាំងលួច Save ទុកក្នុង Cache ផង
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // បើអត់ Internet (Kill App ហើយបើកវិញ): ឱ្យវាទៅរកក្នុង Cache
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // បើក្នុង Cache ក៏អត់មានទៀត ឱ្យបង្ហាញទំព័រដើមដែលយើង Cache ទុកមុនគេ
          return caches.match(OFFLINE_URL);
        });
      })
  );
});

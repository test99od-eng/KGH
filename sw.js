// កំណត់ឈ្មោះ Cache (ប្តូរលេខ v1 ទៅ v2... រាល់ពេលអ្នកកែប្រែកូដ ដើម្បីឱ្យវា Update ថ្មី)
const CACHE_NAME = 'kgh-shop-v1';

// បញ្ជីឯកសារដែលត្រូវ Cache ទុកជាមុន (Static Assets)
const PRECACHE_ASSETS = [
  '/?m=1',
  'https://kghplus.blogspot.com/2026/04/blog-post.html?m=1',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiKXj0Z_pYdUMCspHKm5970BXt1IMDunRtSba6DFk-er4IgjMjr7cXvBox9lNvwXen_F3JncQhDBtRkspG_UJxmKeiTBdBA4zm0YfNHy2fnyXEe1rvNDlq3tiLhvIVu1YcKcYEJ4RB8w3kVfhpxJb5aRMiE72u6fyYKCD3uuzoJ9liB4hVsYv8iuTt5PIPz/s1600/512_512.png'
];

// ១. ដំណាក់កាល Install: រក្សាទុកឯកសារសំខាន់ៗ
self.addEventListener('install', event => {
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ថ្មីដំណើរការភ្លាម
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

// ២. ដំណាក់កាល Activate: លុប Cache ចាស់ៗចោល
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('លុប Cache ចាស់ចោល:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // គ្រប់គ្រង Browser ភ្លាមៗ
  );
});

// ៣. ដំណាក់កាល Fetch: ទាញយកទិន្នន័យ (Offline Strategy)
self.addEventListener('fetch', event => {
  // មិន Cache រាល់ Request ដែលមិនមែនជា GET (ដូចជាការ Post data)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // បើមានក្នុង Cache ឱ្យបង្ហាញពី Cache តែម្តង (លឿនបំផុត)
      if (cachedResponse) {
        return cachedResponse;
      }

      // បើអត់មានក្នុង Cache ទេ ឱ្យទៅទាញពី Internet
      return fetch(event.request).then(networkResponse => {
        // បើទាញបានជោគជ័យ យកទៅដាក់ក្នុង Cache សម្រាប់ប្រើលើកក្រោយ
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        // បើអត់ Net ហើយ Request នោះគឺជាទំព័រ Web ឱ្យបង្ហាញទំព័រដើម (/?m=1)
        if (event.request.mode === 'navigate') {
          return caches.match('/?m=1');
        }
      });
    })
  );
});

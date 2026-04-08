const CACHE_NAME = 'kgh-plus-pro-v1.1.4';
const PRE_CACHE_ASSETS = [
  '/', 
  '/2026/04/blog-post.html','https://kghplus.blogspot.com/2026/04/blog-post.html?m=1', // ទំព័រ Post ដែលអ្នកចង់ឱ្យមើលបាន Offline
  'https://cdn.jsdelivr.net/gh/test99od-eng/KGH/manifest.json?v=1.1.1',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhASowYCoWL8fSFfN7zkkCKUhjFou1BVt49VT9NGjxW4XjHz34vtIRrU0z8VKdkM99xsc97NlK7zmZUU1WQ3icMxWAKvnWHfUaDA3KJzl4BVXcgXZVGTnI56IKKEU5fRkBjOwI9knhweWmNybnJXhl-inoMRd2XvUl-Rmmqy7XM_0Yv44rT9bR3s37mga-P/s192/512_512.png'
];

// ១. ការដំឡើង និងការ Cache ឯកសារសំខាន់ៗ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching essential assets...');
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});



// ៣. យុទ្ធសាស្ត្រ Cache-First: បង្ហាញពី Cache មុន បើអត់មានទើបទៅរកតាម Internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // បើមានក្នុង Cache ឱ្យយកមកបង្ហាញភ្លាម
      if (cachedResponse) {
        return cachedResponse;
      }

      // បើគ្មានក្នុង Cache ទេ ទើបទៅទាញយកពី Network
      return fetch(event.request).then(networkResponse => {
        // បើការទាញយកជោគជ័យ ឱ្យលួចយកវាទៅរក្សាទុកក្នុង Cache
        if (networkResponse && networkResponse.status === 200) {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      });
    })
    // លុបផ្នែក .catch() ដែលធ្លាប់បង្ហាញទំព័រដើមចេញហើយ
  );
});


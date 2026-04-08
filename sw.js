const CACHE_NAME = 'kgh-plus-v1.1.1'; // អ្នកអាចប្ដូរលេខ version កន្លែងនេះ
const PRE_CACHE_ASSETS = [
  '/', // ទំព័រដើម
  '/2026/04/blog-post.html', // ទំព័រ Post ដែលអ្នកចង់ឱ្យមើលបាន Offline
  'https://cdn.jsdelivr.net/gh/test99od-eng/KGH/manifest.json?v=1.1.1',
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhASowYCoWL8fSFfN7zkkCKUhjFou1BVt49VT9NGjxW4XjHz34vtIRrU0z8VKdkM99xsc97NlK7zmZUU1WQ3icMxWAKvnWHfUaDA3KJzl4BVXcgXZVGTnI56IKKEU5fRkBjOwI9knhweWmNybnJXhl-inoMRd2XvUl-Rmmqy7XM_0Yv44rT9bR3s37mga-P/s192/512_512.png' // Link icon របស់អ្នក
];

// ១. ជំហានដំឡើង (Install)៖ ទាញយក File ទុកក្នុងម៉ាស៊ីន
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('កំពុងរក្សាទុកឯកសារក្នុង Cache...');
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting(); // បង្ខំឱ្យ Service Worker ថ្មីដើរភ្លាម
});

// ២. ជំហានដំណើរការ (Activate)៖ លុប Cache ចាស់ៗចោល
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('កំពុងសម្អាត Cache ចាស់...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ៣. ជំហានទាញយក (Fetch)៖ បង្ហាញទិន្នន័យទោះបីអត់ Internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // បើមានក្នុងម៉ាស៊ីន (Cache) ឱ្យយកមកបង្ហាញ បើអត់ទេឱ្យទៅរកក្នុង Internet
      return cachedResponse || fetch(event.request).catch(() => {
        // បើដាច់ Internet ហើយរកក្នុង Cache ក៏អត់ឃើញ ឱ្យបង្ហាញទំព័រដើមជំនួស
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

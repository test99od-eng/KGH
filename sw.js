const CACHE_NAME = 'kgh-plus-v' + Date.now(); // បង្កើតឈ្មោះ Cache ថ្មីរាល់ពេលដំឡើង
const OFFLINE_URL = 'https://kghplus.blogspot.com/2026/04/blog-post.html';

// ១. ពេលដំឡើង៖ បង្ខំឱ្យវាដណ្តើមការគ្រប់គ្រងភ្លាម (Skip Waiting)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ២. ពេលដំណើរការ៖ លុប Cache ចាស់ៗចោលឱ្យអស់ ដើម្បីកុំឱ្យជាន់គ្នា
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        return caches.delete(key);
      }));
    })
  );
  return self.clients.claim();
});

// ៣. មុខងារទាញយក៖ ប្រើយុទ្ធសាស្ត្រ "ទៅយកពី Net មុន បើអត់ Net ចាំប្រើ Cache"
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone()); // រក្សាទុកសម្រាប់មើល Offline លើកក្រោយ
            return networkResponse;
          });
        })
        .catch(() => {
          // បើគ្មានអ៊ីនធឺណិត ឱ្យវាបង្ហាញទំព័រដែលធ្លាប់ Save ឬទំព័រ Offline កំណត់ស្រាប់
          return caches.match(event.request) || caches.match(OFFLINE_URL);
        })
    );
  } else {
    // សម្រាប់រូបភាព ឬឯកសារផ្សេងៗ បើមានក្នុង Cache ឱ្យបង្ហាញភ្លាម បើអត់ចាំទាញពី Net
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

const CACHE_NAME = 'kgh-plus-v4'; // ប្តូរ Version ដើម្បីឱ្យ Browser Update កូដថ្មី
const OFFLINE_URL = 'https://kghplus.blogspot.com/2026/04/blog-post_2.html';

// ១. ដំឡើង និងរក្សាទុកឯកសារសំខាន់ៗ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrv9tC_9vYFl9izGlGD-sT4I1igGGKtAsE5ktWl2hvLO5ikEv7viLjeT1L5VSIjVoEmhF7Z2SPZ5dXW6wT7umFCtpggHIVAvsYXpyYiwpQ9cnZFNHhHKBwo1Tm9doi_6U4p1Gunav7QY8yLGFj8ZmSmM2_4WWVq954rwzyCwhB3-3U_G9gWAgubRNgjN8b/s192/192_192.png'
      ]);
    })
  );
  self.skipWaiting();
});

// ២. លុប Cache ចាស់ៗចោលនៅពេល Update Version ថ្មី
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ៣. យុទ្ធសាស្ត្រ Network First (ឆែកអ៊ីនធឺណិតមុន បើគ្មានចាំប្រើ Cache)
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // បើមានអ៊ីនធឺណិត វានឹងយកទំព័រថ្មីទៅរក្សាទុកក្នុង Cache ជានិច្ច
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // បើគ្មានអ៊ីនធឺណិត វានឹងទៅរកមើលក្នុង Cache
          return caches.match(event.request).then((response) => {
            // បើក្នុង Cache ក៏អត់មានទំព័រហ្នឹងទៀត វានឹងបង្ហាញទំព័រ Offline ដែលអ្នកបានកំណត់
            return response || caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // សម្រាប់ឯកសារផ្សេងៗ (រូបភាព, CSS, JS) ប្រើវិធីបង្ហាញពី Cache បើមាន
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

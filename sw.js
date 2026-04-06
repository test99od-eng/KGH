// ១. កំណត់ឈ្មោះ Cache
const CACHE_NAME = 'kgh-v1.1.1.2';

const PRE_CACHE_ASSETS = [
  './',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json', // 
  'https://kghplus.blogspot.com/2026/04/blog-post_2.html?m=1',
  'https://kghplus.blogspot.com/2026/04/blog-post.html?m=1',
  'https://kghplus.blogspot.com/?m=1' // 
];

// ព្រឹត្តិការណ៍ Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // ប្រើ Promise.allSettled បើចង់ឱ្យវាបន្តទៅមុខ ទោះមាន Link មួយចំនួន Fetch មិនជាប់
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// ព្រឹត្តិការណ៍ Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ព្រឹត្តិការណ៍ Fetch (Cache First Strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // បើទាញបានជោគជ័យ និងជាប្រភេទ GET request
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // បើអត់ Net ហើយជាការបើកទំព័រថ្មី (Navigate)
        if (event.request.mode === 'navigate') {
          return caches.match('./') || caches.match('index.html');
        }
      });
    })
  );
});

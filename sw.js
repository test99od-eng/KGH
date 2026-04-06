// =============================================
// Service Worker for KG H Plus PWA
// កែប្រែថ្មីថ្ងៃ 06-04-2026
// =============================================

// 1. កំណត់ឈ្មោះ Cache (ត្រូវប្តូរលេខរាល់ពេលកែ code)
const CACHE_NAME = 'kgh-v1.1.4';

// 2. ឯកសារដែលត្រូវ Pre-cache (Static Assets)
const PRE_CACHE_ASSETS = [
  './',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json',
  'https://kghplus.blogspot.com/2026/04/blog-post_2.html',
  'https://kghplus.blogspot.com/2026/04/blog-post.html',
  'https://kghplus.blogspot.com/',
  // បើមាន offline.html អាចបន្ថែមទៀត
  // 'offline.html'
];

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pre-caching assets...');
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => cache.add(url).catch(err => {
          console.warn(`Failed to cache: ${url}`, err);
        }))
      );
    })
  );
  self.skipWaiting();   // ធ្វើឱ្យ SW ថ្មីដំណើរការភ្លាម
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();   // គ្រប់គ្រង client ភ្លាម
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
  // ដោះស្រាយបញ្ហា ?m=1 របស់ Blogger
  let requestUrl = new URL(event.request.url);
  if (requestUrl.searchParams.has('m')) {
    requestUrl.searchParams.delete('m');
  }
  const cleanedUrl = requestUrl.toString();

  event.respondWith(
    caches.match(cleanedUrl).then((cachedResponse) => {

      // 1. បើមានក្នុង Cache → ប្រើ Cache First
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. បើគ្មានក្នុង Cache → ទាញពី Network
      return fetch(event.request).then((networkResponse) => {
        // រក្សាទុក response ដែលជោគជ័យទៅក្នុង Cache (Dynamic Caching)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(cleanedUrl, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 3. Network fail → បង្ហាញទំព័រ Offline
        if (event.request.mode === 'navigate') {
          // សាកល្បងរកទំព័រដើមតាមលំដាប់
          return caches.match('./')
            .then(response => response || caches.match('index.html'))
            .then(response => response || caches.match('/'))
            .then(response => {
              if (response) {
                return response;
              }
              // បើនៅតែមិនឃើញ → បង្ហាញ HTML សាមញ្ញ
              return new Response(
                `
                <!DOCTYPE html>
                <html lang="km">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - KG H Plus</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px 20px; background: #111; color: #fff; }
                    h1 { color: #ff4d4d; }
                    p { font-size: 18px; }
                  </style>
                </head>
                <body>
                  <h1>អ្នកកំពុង Offline</h1>
                  <p>សូមភ្ជាប់អ៊ីនធឺណិតឡើងវិញដើម្បីបន្តប្រើប្រាស់។</p>
                  <p>ទំព័រដែលបានរក្សាទុកនឹងនៅតែអាចមើលបាន។</p>
                </body>
                </html>
                `,
                { 
                  headers: { 'Content-Type': 'text/html; charset=utf-8' } 
                }
              );
            });
        }

        // សម្រាប់ request ផ្សេងៗ (css, js, image...) ដែលគ្មាន cache
        return new Response(null, { status: 408 });
      });
    })
  );
});

// =============================================
// KG H Plus PWA - Service Worker (Version 1.1.7)
// កែប្រែថ្មីដើម្បីដោះស្រាយ Install + Kill App + Offline
// =============================================

const CACHE_NAME = 'kgh-v1.1.7';

const PRE_CACHE_ASSETS = [
  './',
  '/',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json',
  'https://kghplus.blogspot.com/2026/04/blog-post_2.html',
  'https://kghplus.blogspot.com/2026/04/blog-post.html',
  'https://kghplus.blogspot.com/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Pre-caching assets...');
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => 
          cache.add(url).catch(err => console.warn('Cache failed:', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

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
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  let requestUrl = new URL(event.request.url);
  
  // លុប parameter របស់ Blogger និង PWA
  if (requestUrl.searchParams.has('m')) requestUrl.searchParams.delete('m');
  if (requestUrl.searchParams.has('homescreen')) requestUrl.searchParams.delete('homescreen');
  
  const cleanedUrl = requestUrl.toString();

  event.respondWith(
    // សាកល្បង match ជាមួយ ignoreSearch ដើម្បីដោះស្រាយ parameter
    caches.match(cleanedUrl, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Network request
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(cleanedUrl, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ==== OFFLINE FALLBACK ====
        if (event.request.mode === 'navigate') {
          return caches.match('/', { ignoreSearch: true })
            .then(res => res || caches.match('./', { ignoreSearch: true }))
            .then(res => res || caches.match('index.html', { ignoreSearch: true }))
            .then(res => res || caches.match(cleanedUrl, { ignoreSearch: true }))
            .then((finalResponse) => {
              if (finalResponse) {
                return finalResponse;
              }

              // Fallback HTML សាមញ្ញបើមិនឃើញ cache អ្វីទាំងអស់
              return new Response(
                `<!DOCTYPE html>
                <html lang="km">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - KG H Plus</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 80px 20px; background: #0a0a0a; color: #ffffff; }
                    h1 { color: #ff4444; }
                    p { font-size: 18px; line-height: 1.6; }
                  </style>
                </head>
                <body>
                  <h1>អ្នកកំពុង Offline</h1>
                  <p>សូមភ្ជាប់អ៊ីនធឺណិតឡើងវិញដើម្បីបន្ត។</p>
                  <p>ទំព័រដែលអ្នកបានបើកពីមុននឹងនៅតែមើលបាន។</p>
                </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              );
            });
        }
        return new Response(null, { status: 408 });
      });
    })
  );
});

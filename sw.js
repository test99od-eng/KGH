// =============================================
// KG H Plus - Service Worker (Version 1.1.5)
// កែប្រែថ្មីដើម្បីដោះស្រាយបញ្ហា Kill App + Offline
// =============================================

const CACHE_NAME = 'kgh-v1.1.5';

const PRE_CACHE_ASSETS = [
  './',
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
          cache.add(url).catch(err => console.warn('Cache failed for:', url, err))
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
        keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null)
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.searchParams.has('m')) {
    requestUrl.searchParams.delete('m');
  }
  const cleanedUrl = requestUrl.toString();

  event.respondWith(
    caches.match(cleanedUrl).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // Network first if not in cache
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
          // សាកល្បង match របៀបផ្សេងៗ ដើម្បីបង្កើនឱកាស
          return caches.match('./')
            .then(res => res || caches.match('index.html'))
            .then(res => res || caches.match('/'))
            .then(res => res || caches.match(cleanedUrl))  // សាកល្បង cleaned URL ម្ដងទៀត
            .then((finalResponse) => {
              if (finalResponse) return finalResponse;

              // បើនៅតែមិនឃើញ → បង្ហាញ HTML សាមញ្ញ
              return new Response(
                `<!DOCTYPE html>
                <html lang="km">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Offline - KG H Plus</title>
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 60px 20px; background:#0f0f0f; color:#fff; }
                    h1 { color: #ff5555; }
                  </style>
                </head>
                <body>
                  <h1>អ្នកកំពុង Offline</h1>
                  <p>សូមភ្ជាប់អ៊ីនធឺណិតឡើងវិញ។</p>
                  <p>ទំព័រដែលបានរក្សាទុកនឹងនៅតែអាចមើលបាន។</p>
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

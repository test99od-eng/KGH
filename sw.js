// ១. កំណត់ឈ្មោះ Cache (ប្តូរលេខ v1.1.2 រាល់ពេលកែ Post ដើម្បីឱ្យ Browser Update)
const CACHE_NAME = 'kgh-v1.1.3';

// ២. បញ្ជីឯកសារដែលត្រូវ Save ទុកជាដាច់ខាត (Static Assets)
const PRE_CACHE_ASSETS = [
  './',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json',
  'https://kghplus.blogspot.com/2026/04/blog-post_2.html',
  'https://kghplus.blogspot.com/2026/04/blog-post.html',
  'https://kghplus.blogspot.com/'
];

// ព្រឹត្តិការណ៍ Install: រក្សាទុកឯកសារគោល
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // ប្រើ map ដើម្បីទាញយកម្ដងមួយ បើមាន Link ណា Error ក៏វាមិនប៉ះពាល់ដល់ Link ផ្សេងដែរ
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting(); 
});

// ព្រឹត្តិការណ៍ Activate: លុប Cache ចាស់ៗ
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('លុបទិន្នន័យចាស់៖', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ព្រឹត្តិការណ៍ Fetch: យុទ្ធសាស្ត្រឆ្លាតវៃ (Cache First, then Network)
self.addEventListener('fetch', (event) => {
  // បង្កើត URL object ដើម្បីដោះស្រាយបញ្ហា ?m=1 លើ Mobile
  let requestUrl = new URL(event.request.url);

  // ប្រសិនបើជា Link របស់ Blogger យើងលុប ?m=1 ចេញដើម្បីឱ្យវាស្គាល់ក្នុង Cache តែមួយ
  if (requestUrl.searchParams.has('m')) {
    requestUrl.searchParams.delete('m');
  }

  event.respondWith(
    caches.match(requestUrl.toString()).then((cachedResponse) => {
      // ក. បើមានក្នុង Cache ឱ្យវាបង្ហាញភ្លាម (ទោះ Kill App ក៏នៅតែដើរ)
      if (cachedResponse) {
        return cachedResponse;
      }

      // ខ. បើអត់មានក្នុង Cache ទេ ឱ្យវាទៅអូសទាញពី Internet
      return fetch(event.request).then((networkResponse) => {
        // បើទាញបានជោគជ័យ (Status 200) ឱ្យវា Save ទុកក្នុង Cache (Dynamic Caching)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(requestUrl.toString(), responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // គ. បើអត់ Net ហើយរកក្នុង Cache ក៏អត់ឃើញ ឱ្យវាបង្ហាញទំព័រដើម
        if (event.request.mode === 'navigate') {
          return caches.match('./') || caches.match('index.html');
        }
      });
    })
  );
});

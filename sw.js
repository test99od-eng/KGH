// ១. កំណត់ឈ្មោះ Cache (ប្តូរលេខ v1.1.2 រាល់ពេលកែ Post )
const CACHE_NAME = 'kgh-v1.1.2';

// ២. បញ្ជីឯកសារដែលត្រូវ Save ទុកជាដាច់ខាត (Static Assets)
const PRE_CACHE_ASSETS = [
  './',
  'index.html',
  'html5-qrcode.min.js',
  'manifest.json'
// បន្ថែម Link Post នៅទីនេះ ដើម្បីឱ្យវាទាញយកទុកជាមុន (Pre-cache)
  'https://kghplus.blogspot.com/2026/04/blog-post_2.html',
  'https://kghplus.blogspot.com/2026/04/blog-post.html',
  'https://https://kghplus.blogspot.com/'
];

// ព្រឹត្តិការណ៍ Install: រក្សាទុកឯកសារគោលចូលក្នុងម៉ាស៊ីន
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
  self.skipWaiting(); // បង្ខំឱ្យ Update ភ្លាមៗ
});

// ព្រឹត្តិការណ៍ Activate: លុប Cache ចាស់ៗចោលទាំងអស់
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('លុបទិន្នន័យចាស់ចោល៖', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ព្រឹត្តិការណ៍ Fetch: យុទ្ធសាស្ត្រឆ្លាតវៃសម្រាប់ស្កេន និងមើល Post ផ្សេងៗ
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // ក. បើមានក្នុង Cache (ធ្លាប់ចូលមើល) ឱ្យវាបង្ហាញភ្លាម
      if (cachedResponse) {
        return cachedResponse;
      }

      // ខ. បើអត់មានក្នុង Cache ទេ ឱ្យវាទៅអូសទាញពី Internet
      return fetch(event.request).then((networkResponse) => {
        // បើទាញបានជោគជ័យ ឱ្យវា "លួច Save" ទុកក្នុង Cache សម្រាប់លើកក្រោយ (Dynamic Caching)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // គ. បើអត់ Net ផង ហើយរកក្នុង Cache ក៏អត់ឃើញ ឱ្យវាបង្ហាញទំព័រដើមជំនួស
        if (event.request.mode === 'navigate') {
          return caches.match('./');
        }
      });
    })
  );
});

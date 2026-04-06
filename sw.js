// ១. កំណត់ឈ្មោះ Cache (ប្តូរលេខ v1.1.4 រាល់ពេលកែប្រែដើម្បីឱ្យ Browser Update)
const CACHE_NAME = 'kgh-v1.1.4';

// ២. បញ្ជីឯកសារដែលត្រូវរក្សាទុកជាចាំបាច់ (Static Assets)
const PRE_CACHE_ASSETS = [
  '/',
  '/index.html',
  'manifest.json',
  // បន្ថែម Link រូបភាព Logo ឬ CSS/JS សំខាន់ៗនៅទីនេះ
];

// ព្រឹត្តិការណ៍ Install: រក្សាទុកឯកសារគោល
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // ប្រើ map ដើម្បីទាញយក បើ Link ណាស្លាប់ ក៏មិនប៉ះពាល់ Link ផ្សេងដែរ
      return Promise.allSettled(
        PRE_CACHE_ASSETS.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting(); // បង្ខំឱ្យវាដំឡើងភ្លាមៗ
});

// ព្រឹត្តិការណ៍ Activate: លុប Cache ចាស់ៗចោល
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
  return self.clients.claim(); // គ្រប់គ្រង Page ទាំងអស់ភ្លាមៗ
});

// ព្រឹត្តិការណ៍ Fetch: យុទ្ធសាស្ត្រ "Stale-While-Revalidate" (ល្អបំផុតសម្រាប់ Blogger)
self.addEventListener('fetch', (event) => {
  let request = event.request;
  let url = new URL(request.url);

  // លុប ?m=1 ចេញដើម្បីឱ្យវា Match ជាមួយ Cache តែមួយ
  if (url.searchParams.has('m')) {
    url.searchParams.delete('m');
    let newUrl = url.toString();
    request = new Request(newUrl, {
      method: request.method,
      headers: request.headers,
      mode: request.mode === 'navigate' ? 'navigate' : 'cors',
      credentials: request.credentials,
      redirect: request.redirect
    });
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // ១. បើមានក្នុង Cache គឺបង្ហាញភ្លាម (ល្បឿនលឿន)
      const fetchPromise = fetch(request).then((networkResponse) => {
        // ២. បើទាញពី Net បាន យកទៅ Update ក្នុង Cache ស្ងាត់ៗសម្រាប់លើកក្រោយ
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ៣. បើ Offline ហើយក្នុង Cache ក៏អត់មាន ឱ្យវាបង្ហាញទំព័រដើម (Fallback)
        if (event.request.mode === 'navigate') {
          return caches.match('/') || caches.match('/index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

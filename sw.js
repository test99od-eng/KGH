const CACHE_NAME = 'kgh-v1.1.6';

// ដាក់តែឯកសារ Static ដែល App ត្រូវការជាចាំបាច់
const PRE_CACHE_ASSETS = [
  'https://cdn.jsdelivr.net/gh/test99od-eng/KGH/manifest.json',
  'html5-qrcode.min.js' // បើអ្នកមានប្រើ Script ស្កេន
];

// ផ្នែក Install និង Activate រក្សាទុកដដែល...

self.addEventListener('fetch', (event) => {
  let requestUrl = new URL(event.request.url);
  if (requestUrl.searchParams.has('m')) {
    requestUrl.searchParams.delete('m');
  }

  event.respondWith(
    caches.match(requestUrl.toString()).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        // បើគេចូលមើលទំព័រណា វានឹង "លួច Save" ទុកក្នុង Cache ភ្លាម (Dynamic Cache)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(requestUrl.toString(), responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // បើ Offline ហើយរកក្នុង Cache មិនឃើញ ឱ្យវាបង្ហាញទំព័រចុងក្រោយដែលគេបានមើល
        return caches.match(event.request);
      });
    })
  );
});

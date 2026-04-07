const CACHE_NAME = 'kgh-v1.1.3-permanent'; // ប្តូរលេខ version រាល់ពេលកែ
const OFFLINE_URL = '/?m=1';

// បញ្ជីដែលត្រូវ Cache ជាដាច់ខាតពេល Install
const PRE_CACHE = [
  OFFLINE_URL,
  'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiKXj0Z_pYdUMCspHKm5970BXt1IMDunRtSba6DFk-er4IgjMjr7cXvBox9lNvwXen_F3JncQhDBtRkspG_UJxmKeiTBdBA4zm0YfNHy2fnyXEe1rvNDlq3tiLhvIVu1YcKcYEJ4RB8w3kVfhpxJb5aRMiE72u6fyYKCD3uuzoJ9liB4hVsYv8iuTt5PIPz/s1600/512_512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // ឱ្យវាគ្រប់គ្រង App ភ្លាមៗមិនបាច់រង់ចាំ
      caches.keys().then(keys => Promise.all(
        keys.map(key => { if (key !== CACHE_NAME) return caches.delete(key); })
      ))
    ])
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // ១. បើមានក្នុង Cache ឱ្យទាញពី Cache ភ្លាម (ទោះ Kill App ក៏នៅមាន)
      if (cachedResponse) return cachedResponse;

      // ២. បើអត់មានក្នុង Cache ឱ្យទៅទាញពី Net
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // រក្សាទុកទំព័រថ្មីៗដែលទើបចូលមើល ចូលក្នុង Cache ស្វ័យប្រវត្តិ
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // បើអត់ Net ទាំងស្រុង ឱ្យបង្ហាញទំព័រដើម
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

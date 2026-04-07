const CACHE_NAME = 'kgh-v1.2.0';
const PRE_CACHE_ASSETS = [
  '/', 
  '/2026/04/blog-post.html', // នេះគឺជា Link ដែលអ្នកចង់ឱ្យមើលបាន Offline
  'https://cdn.jsdelivr.net/gh/test99od-eng/KGH@main/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRE_CACHE_ASSETS);
    })
  );
});
// បន្ថែម Code នេះបន្តពីជួរទី ១៤ ក្នុង sw.js របស់អ្នក
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // បើមានក្នុង Cache ឱ្យប្រើ Cache បើអត់ទេឱ្យទៅទាញពី Network
      return response || fetch(event.request);
    })
  );
});

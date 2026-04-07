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

const CACHE_NAME = 'kgh-plus-v3';
const OFFLINE_URL = 'https://kghplus.blogspot.com/';

// ១. ពេលដំឡើង App ឱ្យវាទាញយកទំព័រដើមទុកភ្លាម
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhrv9tC_9vYFl9izGlGD-sT4I1igGGKtAsE5ktWl2hvLO5ikEv7viLjeT1L5VSIjVoEmhF7Z2SPZ5dXW6wT7umFCtpggHIVAvsYXpyYiwpQ9cnZFNHhHKBwo1Tm9doi_6U4p1Gunav7QY8yLGFj8ZmSmM2_4WWVq954rwzyCwhB3-3U_G9gWAgubRNgjN8b/s192/192_192.png'
      ]);
    })
  );
  self.skipWaiting();
});

// ២. បើកដំណើរការភ្លាមៗ
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ៣. មុខងារទាញយកមកបង្ហាញពេល Offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});

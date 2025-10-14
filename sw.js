const CACHE_NAME = 'damodarashtakam-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/verses.html',
  '/verses-ru.html',
  '/verses-it.html',
  '/translations/en.json',
  '/translations/ru.json',
  '/translations/it.json',
  '/manifest.json',
  '/img/1 Large.jpeg',
  '/img/2 Large.jpeg',
  '/img/3 Large.jpeg'
];

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Skip caching for external analytics scripts to ensure they update
  if (event.request.url.includes('cdn.counter.dev')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone the response
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});
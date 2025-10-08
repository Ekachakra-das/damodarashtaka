const CACHE_NAME = 'damodarashtakam-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/verses.html',
  '/verses-ru.html',
  '/manifest.json',
  '/img/1 Large.jpeg',
  '/img/2 Large.jpeg',
  '/img/3 Large.jpeg',
  '/screenshots/1.jpeg',
  '/screenshots/2.jpeg',
  '/screenshots/3.jpeg',
  '/screenshots/4.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
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
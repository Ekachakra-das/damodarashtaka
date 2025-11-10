const CACHE_NAME = "damodarashtakam-v6.3";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/verses.html",
  "/verses-ru.html",
  "/verses-it.html",
  "/translations/en.json",
  "/translations/ru.json",
  "/translations/it.json",
  "/manifest.json",
  "/img/1 Large.jpeg",
  "/img/2 Large.jpeg",
  "/img/3 Large.jpeg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);
      } catch (err) {
        console.error("SW install caching failed:", err);
      } finally {
        await self.skipWaiting();
      }
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.url.includes("cdn.counter.dev")) {
    return fetch(request);
  }

  const isHTMLRequest =
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html");

  if (isHTMLRequest) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          const responseClone = networkResponse.clone();
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, responseClone);
          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          throw error;
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});

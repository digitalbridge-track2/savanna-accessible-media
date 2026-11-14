const CACHE_NAME = "abugida-offline-v1";

const ESSENTIAL_SHELL = [
  "/",
  "/index.html",
  "/lesson.html",
  "/studio.html",
  "/verify.html",
  "/src/styles/tokens.css",
  "/src/lesson.ts",
  "/lessons/digital-workplace/lesson.json",
  "/lessons/digital-workplace/captions.en.vtt",
  "/lessons/digital-workplace/captions.am.vtt",
  "/lessons/digital-workplace/transcript.en.json",
  "/lessons/digital-workplace/documents/lesson.en.html",
  "/jobs/jobs.json",
  "/certificates/certificates.demo.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.mode === "navigate") {
            return caches.match("/lesson.html");
          }
        });
    })
  );
});

const CACHE_NAME = "abugida-offline-v1";
const OFFLINE_URLS = [
  "/",
  "/index.html",
  "/lesson.html",
  "/verify.html",
  "/src/styles/tokens.css",
  "/lessons/digital-workplace/lesson.json",
  "/lessons/digital-workplace/documents/lesson.en.html",
  "/jobs/jobs.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
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
      return (
        cached ||
        fetch(event.request).catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/lesson.html");
          }
        })
      );
    })
  );
});

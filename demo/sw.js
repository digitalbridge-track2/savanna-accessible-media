const CACHE_NAME = "abugida-offline-v4";

const ESSENTIAL_SHELL = [
  "/",
  "/index.html",
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
      return cache.addAll(ESSENTIAL_SHELL).catch((err) => {
        console.warn("Service worker cache.addAll non-critical warning:", err);
      });
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

  // Network-first for navigation requests to ensure fresh HTML and no stuck state
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || caches.match("/index.html");
          });
        })
    );
    return;
  }

  // Cache-first for static media and data assets
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return new Response("", { status: 408, statusText: "Offline" });
        });
    })
  );
});

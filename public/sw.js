const CACHE = "sl-suivie-v2-network-first";
const STATIC = [
  "/images/hero-yacht.jpg",
  "/icons/spl-app-192.png",
  "/icons/spl-app-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages et API : toujours le réseau, jamais de vieux cache.
  if (req.mode === "navigate" || url.pathname.startsWith("/api/")) return;

  // Images et icônes uniquement : cache de secours.
  if (req.destination === "image") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) || Response.error())
    );
  }
});

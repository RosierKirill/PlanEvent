// Service Worker pour Plan'Event PWA
const CACHE_NAME = "planevent-v1";
const urlsToCache = ["/", "/manifest.json", "/192.png", "/512.png"];

// Installation du service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  // Force le service worker à s'activer immédiatement
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prend le contrôle de toutes les pages immédiatement
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  event.respondWith(
    // Stratégie Network First : essayer le réseau d'abord, puis le cache
    fetch(event.request)
      .then((response) => {
        // Cloner la réponse car elle ne peut être utilisée qu'une seule fois
        const responseToCache = response.clone();

        // Mettre en cache la nouvelle réponse
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si le réseau échoue, essayer le cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }

          // Si pas dans le cache, retourner une page d'erreur simple
          return new Response("Contenu non disponible hors ligne", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
      })
  );
});

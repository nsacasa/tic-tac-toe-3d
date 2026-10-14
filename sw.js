// ============================================================
// SERVICE WORKER — permite que la app funcione SIN INTERNET
//
// Es un pequeño programa que el navegador ejecuta "por detrás".
// Cada vez que la app pide un archivo (la página, Three.js, el
// icono…), este programa:
//   1. Intenta descargarlo de internet (así siempre tienes la
//      versión más nueva) y guarda una copia.
//   2. Si no hay internet, entrega la copia guardada.
// ============================================================

const CACHE_NAME = "tic-tac-toe-3d-v1";

// Archivos que se guardan nada más instalar la app
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js"
];

// Al instalar: guarda todos los archivos de la lista
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

// Al activarse: borra copias de versiones anteriores
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Cada vez que la app pide un archivo: primero internet, si no, la copia
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

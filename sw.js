// PagoYo PWA — cache estático simple para demo
const CACHE = 'pagoyo-v1';

// Ajusta aquí lo que quieras precachear
const PRECACHE = [
  '/pagoyo-demo/',
  '/pagoyo-demo/index.html',
  '/pagoyo-demo/cliente/',
  '/pagoyo-demo/cliente/index.html',
  '/pagoyo-demo/camarero/',
  '/pagoyo-demo/camarero/index.html',
  '/pagoyo-demo/tpv/',
  '/pagoyo-demo/tpv/index.html',
  '/pagoyo-demo/manifest.webmanifest',
  '/pagoyo-demo/icons/pagoyo-192.png',
  '/pagoyo-demo/icons/pagoyo-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: HTML -> network-first, estático -> cache-first
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Solo manejamos peticiones dentro del repo
  if (!url.pathname.startsWith('/pagoyo-demo/')) return;

  // HTML: intenta red online primero
  if (req.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Resto: cache-first
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return resp;
    }))
  );
});

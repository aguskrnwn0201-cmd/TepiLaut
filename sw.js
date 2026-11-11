// Tepi Laut — Service Worker (offline-first, cache-then-network)
const CACHE_NAME = 'tepilaut-v1';

// File statis yang di-precache saat install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/js/lib/dexie.mjs',
  '/manifest.json',
];

// ── Install: precache semua aset statis ──────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // Langsung aktif tanpa menunggu tab lama ditutup
  self.skipWaiting();
});

// ── Activate: hapus cache lama ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first untuk aset statis, network-first untuk navigasi ───────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Hanya tangani GET
  if (request.method !== 'GET') return;

  // Navigasi (HTML) — network-first, fallback ke cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Aset statis — cache-first
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
    )
  );
});

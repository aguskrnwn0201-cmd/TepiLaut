# Frontend Implementation Guide (Frontend.md)

Dokumen ini memuat panduan implementasi kode frontend untuk aplikasi PWA Simple Book Tracker (Tepi Laut), disesuaikan dengan implementasi yang sudah berjalan.

---

## 1. Project Directory Structure
```
TepiLaut/
├── index.html          # Main HTML entry point
├── manifest.json       # PWA Manifest configuration
├── sw.js               # Service Worker script
├── package.json        # Dependensi (tailwindcss, @tailwindcss/cli, dexie)
├── .gitignore          # node_modules
├── src/
│   └── input.css       # Sumber Tailwind (@import "tailwindcss";)
├── css/
│   └── styles.css      # HASIL build Tailwind (jangan diedit manual)
└── js/
    ├── app.js          # Main UI logic & Event handlers
    ├── db.js           # Dexie.js IndexedDB initialization
    ├── pwa.js          # Service worker registration logic
    └── lib/
        └── dexie.mjs   # Salinan lokal Dexie (agar tersedia offline)
```

---

## 2. Development Workflow

```bat
:: Terminal 1: build Tailwind otomatis setiap file disimpan
npx @tailwindcss/cli -i ./src/input.css -o ./css/styles.css --watch

:: Terminal 2: server lokal (ES Modules tidak jalan lewat file://)
npx serve .
```

Setup awal: `npm install tailwindcss @tailwindcss/cli dexie`, lalu
`copy node_modules\dexie\dist\dexie.mjs js\lib\dexie.mjs`.

---

## 3. Code Snippets & Implementation

### 3.1. IndexedDB Setup (`js/db.js`)
Hanya kolom yang dipakai untuk filter/pencarian yang diindeks. Kolom lain (`author`, `price`, `currentPage`, `totalPages`) tetap tersimpan.

```javascript
import Dexie from './lib/dexie.mjs';

export const db = new Dexie('SimpleBookTrackerDB');

db.version(1).stores({
  books: '++id, title, status, createdAt',
  notes: '++id, bookId, type, createdAt'
});
```

### 3.2. UI Logic (`js/app.js`) - ringkasan
* `render()` membaca buku dari Dexie sesuai tab aktif:
  * Tab **Buku Saya**: `where('status').anyOf('reading', 'read')`
  * Tab **Wishlist**: `where('status').equals('wishlist')`
* Teks dari pengguna dimasukkan dengan `textContent` (bukan `innerHTML`) untuk mencegah injeksi HTML.
* Form tambah buku memakai elemen `<dialog>` + `showModal()`; status dipilih lewat dropdown (`reading` / `read` / `wishlist`).
* Indikator offline memakai event `online` / `offline` dan `navigator.onLine`.

### 3.3. Service Worker (`sw.js`) - rencana Phase 3
Semua aset yang dibutuhkan UI harus masuk cache, termasuk CSS hasil build, `pwa.js`, dan Dexie lokal.

```javascript
const CACHE_NAME = 'tepilaut-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/js/db.js',
  '/js/pwa.js',
  '/js/lib/dexie.mjs',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
```

Catatan: setiap kali file aset berubah, naikkan `CACHE_NAME` (mis. `tepilaut-v2`) agar cache lama diganti.

### 3.4. PWA Manifest (`manifest.json`) - rencana Phase 3
Warna disamakan dengan tema Ocean di `Design.md`.

```json
{
  "short_name": "Tepi Laut",
  "name": "Tepi Laut - Book Tracker & Wishlist",
  "icons": [
    { "src": "icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "icon-512.png", "type": "image/png", "sizes": "512x512" }
  ],
  "start_url": "/",
  "background_color": "#F0F9FF",
  "theme_color": "#0284C7",
  "display": "standalone"
}
```
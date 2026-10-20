# Frontend Implementation Guide (Frontend.md)

Dokumen ini memuat panduan implementasi kode frontend untuk aplikasi PWA Simple Book Tracker (Tepi Laut), disesuaikan dengan implementasi yang sudah berjalan dan rencana fitur berikutnya.

---

## 1. Project Directory Structure
```
TepiLaut/
├── index.html          # Main HTML entry point
├── manifest.json       # PWA Manifest configuration
├── sw.js               # Service Worker script
├── package.json        # Dependensi (tailwindcss, @tailwindcss/cli, dexie)
├── .gitignore          # node_modules
├── icons/              # Ikon dari logo aplikasi (192, 512, maskable)
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
Hanya kolom yang dipakai untuk filter/pencarian yang diindeks. Kolom lain (termasuk kolom baru dan foto `cover`) tetap tersimpan, jadi tidak perlu migrasi versi.

```javascript
import Dexie from './lib/dexie.mjs';

export const db = new Dexie('SimpleBookTrackerDB');

db.version(1).stores({
  books: '++id, title, status, createdAt',
  notes: '++id, bookId, type, createdAt'
});
```

### 3.2. Form Buku (rencana)
Satu `<dialog>` dipakai untuk tambah dan edit. Urutan kolom sesuai keinginan pengguna; kolom "narator" tidak dipakai. Modal dibuat dapat di-*scroll* (`max-h-[90vh] overflow-y-auto`).

| No | Label | `name` | Tipe input | Wajib |
|----|-------|--------|-----------|-------|
| 0 | Foto sampul | `cover` | file (`accept="image/*"`) | Tidak |
| 1 | Judul | `title` | text | **Ya** |
| 2 | Jumlah halaman | `totalPages` | number | Tidak |
| 3 | Bahasa | `language` | text | Tidak |
| 4 | Penulis | `author` | text | **Ya** |
| 5 | Penerjemah | `translator` | text | Tidak |
| 6 | Ilustrator | `illustrator` | text | Tidak |
| 7 | Penerbit | `publisher` | text | Tidak |
| 8 | Cetakan | `edition` | text | Tidak |
| 9 | Blurb | `blurb` | textarea | Tidak |
| 10 | Harga | `price` | number | Tidak |
| 11 | Status | `status` | select: `unread` / `reading` / `read` / `wishlist` | **Ya** |
| 12 | Kepemilikan | `ownership` | text (bebas) | Tidak |

Kolom kosong dikonversi ke `undefined` (helper `num()` untuk angka, `text()` untuk string) agar tidak tersimpan sebagai string kosong.

### 3.3. Foto Sampul (rencana)
Foto dikecilkan dengan Canvas sebelum disimpan sebagai Blob di `books.cover`.

```javascript
async function resizeImage(file, maxWidth = 600) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}
```

Menampilkan: `URL.createObjectURL(book.cover)` untuk `<img>`, dan panggil `URL.revokeObjectURL(url)` setelah tidak dipakai. Jika `cover` kosong, tampilkan placeholder.

### 3.4. UI Logic (`js/app.js`) - ringkasan
* `render()` membaca data dari Dexie sesuai tab aktif:
  * Tab **Buku Saya**: `where('status').anyOf('unread', 'reading', 'read')`
  * Tab **Wishlist**: `where('status').equals('wishlist')`
  * Tab **Catatan**: `orderBy('createdAt').reverse()`, judul buku dicari lewat `Map` berdasarkan `bookId`.
* Teks dari pengguna dimasukkan dengan `textContent` (bukan `innerHTML`) untuk mencegah injeksi HTML.
* **Kartu buku** (`bookCard`): judul, penulis, info halaman/harga (jika ada), dropdown ubah status, tombol Edit, "+ Catatan", dan Hapus. Rencana: thumbnail sampul dan ketuk kartu untuk membuka halaman detail.
* **Halaman detail buku** (rencana): data lengkap, foto, blurb, dan semua catatan/kutipan buku tersebut dengan tombol "+ Catatan".
* **Form buku** memakai satu `<dialog>` untuk tambah dan edit. `openBookDialog(book)` mengisi form jika `book` diberikan; variabel `editingId` menandai mode edit dan di-reset pada event `close` dialog.
* **Hapus buku** memakai transaksi Dexie (`db.transaction('rw', db.books, db.notes, ...)`) sehingga catatan milik buku ikut terhapus, tanpa data yatim.
* **Form catatan**: dropdown buku diisi dari database saat dibuka; `openNoteDialog(bookId)` memilih buku otomatis (dipanggil setelah `reset()`). Nilai dropdown berupa string, jadi `bookId` diubah dengan `Number(...)` sebelum disimpan. Satu buku boleh memiliki banyak catatan.
* **Toast** (`showToast`) memberi umpan balik singkat setelah tambah/ubah/hapus.
* Indikator offline memakai event `online` / `offline` dan `navigator.onLine`.

### 3.5. Service Worker (`sw.js`) - rencana Phase 3
Semua aset yang dibutuhkan UI harus masuk cache, termasuk CSS hasil build, `pwa.js`, Dexie lokal, dan ikon.

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
  '/icons/icon-192.png',
  '/icons/icon-512.png'
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

Catatan: setiap kali file aset berubah, naikkan `CACHE_NAME` (mis. `tepilaut-v2`) agar cache lama diganti, terutama setiap deploy ke Vercel.

### 3.6. PWA Manifest (`manifest.json`) - rencana Phase 3
Warna disamakan dengan tema Ocean di `Design.md`; ikon berasal dari logo aplikasi.

```json
{
  "short_name": "Tepi Laut",
  "name": "Tepi Laut - Book Tracker & Wishlist",
  "icons": [
    { "src": "icons/icon-192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "icons/icon-512.png", "type": "image/png", "sizes": "512x512" },
    { "src": "icons/icon-maskable-512.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable" }
  ],
  "start_url": "/",
  "background_color": "#F0F9FF",
  "theme_color": "#0284C7",
  "display": "standalone"
}
```

Splash screen pada Android dibentuk otomatis dari `name`, ikon 512, dan `background_color` di manifest, sehingga logo aplikasi tampil saat aplikasi dibuka.

### 3.7. Deploy ke Vercel
* Pastikan `css/styles.css` hasil build dan `js/lib/dexie.mjs` ikut ter-commit (tidak ada di `.gitignore`).
* Hubungkan repositori GitHub di Vercel; setiap `git push` otomatis ter-deploy.
* Untuk APK, `/.well-known/assetlinks.json` harus bisa dibuka lewat domain final.
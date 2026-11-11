# Frontend Implementation Guide (Frontend.md)

Dokumen ini memuat panduan implementasi kode frontend untuk aplikasi PWA Simple Book Tracker (Tepi Laut), berdasarkan implementasi yang sudah berjalan.

---

## 1. Project Directory Structure

```
TepiLaut/
├── index.html          # HTML utama + semua dialog & detail view
├── manifest.json       # PWA Manifest (tema laut, icons)
├── sw.js               # Service Worker — offline-first, precache
├── package.json        # Dependensi: tailwindcss, @tailwindcss/cli, dexie
├── .gitignore          # node_modules
├── icons/              # Ikon PWA (icon-192.png, icon-512.png, icon-maskable-512.png)
├── src/
│   └── input.css       # Sumber Tailwind + variant dark + komponen .field
├── css/
│   └── styles.css      # HASIL build Tailwind (jangan diedit manual)
└── js/
    ├── app.js          # Main UI logic, event handlers, detail view, dark mode
    ├── db.js           # Dexie.js IndexedDB initialization
    ├── pwa.js          # Service worker registration
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

> **Windows — jika `.ps1` diblokir execution policy**, gunakan `.cmd` langsung:
> `node_modules\.bin\tailwindcss.cmd -i src/input.css -o css/styles.css --watch`

Setup awal: `npm install tailwindcss @tailwindcss/cli dexie`, lalu
`copy node_modules\dexie\dist\dexie.mjs js\lib\dexie.mjs`.

---

## 3. Code Snippets & Implementation

### 3.1. IndexedDB Setup (`js/db.js`)

Hanya kolom yang dipakai untuk filter/pencarian yang diindeks. Kolom lain (termasuk `cover` Blob) tersimpan otomatis — tidak perlu migrasi versi saat menambah kolom biasa.

```javascript
import Dexie from './lib/dexie.mjs';

export const db = new Dexie('SimpleBookTrackerDB');

db.version(1).stores({
  books: '++id, title, status, createdAt',
  notes: '++id, bookId, type, createdAt'
});
```

### 3.2. Form Buku

Satu `<dialog id="book-dialog">` dipakai untuk tambah dan edit. Modal dapat di-scroll (`max-h-[90vh] overflow-y-auto`). `openBookDialog(book)` mengisi form jika `book` diberikan; `editingId` menandai mode edit dan direset pada event `close`.

| No | Label | `name` | Tipe | Wajib |
|----|-------|--------|------|-------|
| 0 | Foto sampul | `cover` | `file` (`accept="image/*"`) | Tidak |
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
| 11 | Status | `status` | select: `unread`/`reading`/`read`/`wishlist` | **Ya** |
| 12 | Kepemilikan | `ownership` | text bebas | Tidak |

Kolom kosong dikonversi ke `undefined` (helper `num()` untuk angka, `text()` untuk string) agar tidak tersimpan sebagai string kosong.

### 3.3. Foto Sampul

Foto dikecilkan dengan Canvas sebelum disimpan sebagai `Blob` di `books.cover`.

```javascript
async function resizeImage(file, maxWidth = 600) {
  const bitmap = await createImageBitmap(file);
  const scale  = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width  = Math.round(bitmap.width  * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}
```

Menampilkan: `URL.createObjectURL(book.cover)` untuk `<img>`, panggil `URL.revokeObjectURL(url)` di `onload` agar tidak bocor memori. Jika `cover` kosong, tampilkan placeholder emoji `📖`.

### 3.4. UI Logic (`js/app.js`) — ringkasan

**Dark mode:**
* Class `.dark` pada `<html>` mengaktifkan varian `dark:` Tailwind.
* Preferensi disimpan di `localStorage('theme')`. Jika belum diset, ikut `prefers-color-scheme`.
* Toggle 🌙/☀️ ada di header.

**Render per tab:**
* `render()` membaca data Dexie sesuai tab aktif.
* Tab **Buku Saya**: `where('status').anyOf('unread', 'reading', 'read')`
* Tab **Wishlist**: `where('status').equals('wishlist')`
* Tab **Catatan**: `orderBy('createdAt').reverse()`, judul dicari via `Map` dari `bookId`.
* Teks pengguna dimasukkan dengan `textContent` (bukan `innerHTML`) untuk mencegah injeksi.

**Kartu buku (`bookCard`):**
Thumbnail sampul / placeholder, judul, penulis, badge status berwarna, info halaman/penerbit/harga, dropdown ubah status, tombol Edit / + Catatan / Hapus. Tap kartu membuka halaman detail.

**Halaman detail buku (`openDetailView`):**
Slide-in dari kanan (`translate-x-full` → `translate-x-0`). Menampilkan foto sampul besar, data lengkap dalam tabel dua kolom, blurb, dan semua catatan/kutipan buku tersebut (terbaru di atas). Tombol Edit dan + Catatan tersedia. `refreshDetailNotes()` dipanggil ulang setelah catatan ditambah/dihapus.

**Hapus buku:**
Memakai transaksi Dexie `db.transaction('rw', db.books, db.notes, ...)` agar catatan milik buku ikut terhapus (tidak ada data yatim).

**Form catatan:**
Dropdown buku diisi dari database saat dialog dibuka. `bookId` disimpan sebagai angka (`Number(...)`). Satu buku bisa memiliki banyak catatan.

**Toast:** `showToast(msg)` memberi umpan balik singkat setelah setiap operasi tambah/ubah/hapus.

### 3.5. Service Worker (`sw.js`)

Strategi: **cache-first** untuk aset statis, **network-first** untuk navigasi HTML.

```javascript
const CACHE_NAME = 'tepilaut-v1';

const PRECACHE_URLS = [
  '/', '/index.html', '/css/styles.css',
  '/js/app.js', '/js/db.js', '/js/lib/dexie.mjs',
  '/manifest.json',
];

// Install: precache semua aset statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: hapus cache versi lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
```

> Setiap kali aset berubah (terutama setelah deploy), naikkan `CACHE_NAME` (mis. `tepilaut-v2`) agar cache lama diganti.

### 3.6. PWA Manifest (`manifest.json`)

```json
{
  "name": "Tepi Laut",
  "short_name": "Tepi Laut",
  "description": "Pencatat buku bacaan & wishlist yang simpel dan estetik.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#F0F9FF",
  "theme_color": "#0284C7",
  "lang": "id",
  "icons": [
    { "src": "icons/icon-192.png",         "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-512.png",         "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "icons/icon-maskable-512.png","sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

Splash screen pada Android dibentuk otomatis dari `name`, ikon 512, dan `background_color`. Taruh logo asli di folder `icons/` untuk menyelesaikan installability PWA.

### 3.7. Dark Mode (`src/input.css`)

Tailwind v4 memerlukan deklarasi eksplisit untuk variant `dark` berbasis class:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

@layer components {
  .field {
    @apply w-full rounded-lg border border-slate-300 p-2 text-sm;
  }
  .field:is(.dark *) {
    background-color: var(--color-slate-700);
    border-color: var(--color-slate-600);
    color: var(--color-slate-100);
  }
}
```

Setelah mengubah `input.css` atau menambah class `dark:` baru di HTML, jalankan ulang build Tailwind.

### 3.8. Deploy ke Vercel

* Pastikan `css/styles.css` hasil build dan `js/lib/dexie.mjs` ikut ter-commit (tidak di `.gitignore`).
* Hubungkan repositori GitHub di Vercel; setiap `git push` ke `main` otomatis ter-deploy.
* Untuk APK Android, `/.well-known/assetlinks.json` harus bisa dibuka via domain final.
* Setiap deploy yang mengubah aset: naikkan versi `CACHE_NAME` di `sw.js`.

# Software Architecture Document (Architecture.md)

## 1. System Overview
Aplikasi Simple Book Tracker (Tepi Laut) dirancang menggunakan pola **Offline-First Progressive Web App (PWA)** tanpa ketergantungan pada server backend untuk operasi dasar.

```
+-------------------------------------------------------+
|                   Client Browser / PWA                |
|                                                       |
|   +-------------------+       +-------------------+   |
|   |   UI Components   |       |   State/Logic     |   |
|   | (Tailwind CSS/JS) | <---> |   (Dexie.js API)  |   |
|   +-------------------+       +-------------------+   |
|             ^                           ^             |
|             |                           |             |
|   +-----------------------------------------------+   |
|   |         Service Worker (Cache & Offline)      |   |
|   +-----------------------------------------------+   |
|             ^                                         |
|             v                                         |
|   +-----------------------------------------------+   |
|   |         IndexedDB Local Storage               |   |
|   +-----------------------------------------------+   |
+-------------------------------------------------------+
```

---

## 2. Architectural Principles
* **Client-Side Heavy:** Seluruh logika pengolahan data, penyaringan, dan penyimpanan dilakukan di browser pengguna.
* **Zero Latency UI:** Antarmuka merespons secara instan karena tidak menunggu permintaan jaringan HTTP.
* **Progressive Enhancement:** Berjalan sebagai situs web biasa di browser modern, tetapi dapat dipasang (*install*) seperti aplikasi native di Android/iOS/Desktop.

---

## 3. Data Flow & Layering

1. **Presentation Layer:**
   * HTML/JS Views + Tailwind CSS (CSS hasil build Tailwind CLI).
   * Render data dari IndexedDB dan menangani input pengguna (form buku, form catatan) lewat elemen `<dialog>`.

2. **Data Access Layer:**
   * `Dexie.js` (salinan lokal di `js/lib/`) sebagai *wrapper* IndexedDB untuk kueri asinkron (CRUD) dan transaksi.

3. **Storage Layer:**
   * Browser `IndexedDB` untuk menyimpan objek buku, wishlist, dan catatan.
   * `CacheStorage` via Service Worker untuk menyimpan aset statis (HTML, CSS, JS, Dexie, ikon). *(Phase 3)*

---

## 4. Data Models & Schema (IndexedDB)

Database: `SimpleBookTrackerDB` (versi 1). Pada Dexie hanya kolom yang dipakai untuk filter/pengurutan yang diindeks; kolom lain tetap tersimpan sebagai bagian objek.

### Store: `books`
Skema Dexie: `++id, title, status, createdAt`

* `id` (Auto-Increment Integer, Primary Key)
* `title` (String, Indexed)
* `author` (String)
* `status` (Enum: `'reading'`, `'read'`, `'wishlist'`, Indexed, dipakai untuk filter tab)
* `currentPage` (Integer, Optional)
* `totalPages` (Integer, Optional)
* `price` (Number, Optional)
* `createdAt` (Timestamp `Date.now()`, Indexed)

### Store: `notes`
Skema Dexie: `++id, bookId, type, createdAt`

* `id` (Auto-Increment Integer, Primary Key)
* `bookId` (Integer, relasi ke `books.id`, Indexed; harus bertipe **angka**, bukan string)
* `type` (Enum: `'quote'`, `'note'`, Indexed)
* `content` (Text)
* `page` (Integer, Optional)
* `createdAt` (Timestamp `Date.now()`, Indexed, dipakai mengurutkan catatan terbaru)

### Aturan Integritas Data
* **Hapus buku = hapus catatannya.** Penghapusan dilakukan dalam satu transaksi (`db.transaction('rw', db.books, db.notes, ...)`) agar tidak ada catatan yatim.
* Kolom opsional yang dikosongkan disimpan sebagai `undefined` (properti dihapus), bukan string kosong.
* Status hanya boleh salah satu dari tiga nilai di atas; input status memakai dropdown, bukan teks bebas.
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
|   |   IndexedDB Local Storage (data + foto Blob)  |   |
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
   * Tampilan: daftar per tab, halaman detail buku, form buku dan form catatan (elemen `<dialog>`).

2. **Data Access Layer:**
   * `Dexie.js` (salinan lokal di `js/lib/`) sebagai *wrapper* IndexedDB untuk kueri asinkron (CRUD) dan transaksi.

3. **Storage Layer:**
   * Browser `IndexedDB` untuk menyimpan objek buku, wishlist, catatan, dan foto sampul (Blob).
   * `CacheStorage` via Service Worker untuk menyimpan aset statis (HTML, CSS, JS, Dexie, ikon). *(Phase 3)*

---

## 4. Data Models & Schema (IndexedDB)

Database: `SimpleBookTrackerDB`. Pada Dexie hanya kolom yang dipakai untuk filter/pengurutan yang diindeks; kolom lain tetap tersimpan sebagai bagian objek, sehingga menambah kolom biasa tidak memerlukan migrasi versi.

### Store: `books`
Skema Dexie: `++id, title, status, createdAt`

* `id` (Auto-Increment Integer, Primary Key)
* `title` (String, Indexed, wajib)
* `totalPages` (Integer, Optional) - "Jumlah halaman"
* `language` (String, Optional)
* `author` (String, wajib)
* `translator` (String, Optional)
* `illustrator` (String, Optional)
* `publisher` (String, Optional)
* `edition` (String, Optional) - "Cetakan"
* `blurb` (Text, Optional)
* `price` (Number, Optional)
* `status` (Enum: `'unread'`, `'reading'`, `'read'`, `'wishlist'`, Indexed, wajib; dipakai untuk filter tab)
* `ownership` (String teks bebas, Optional) - "Kepemilikan"
* `cover` (Blob, Optional) - foto sampul, sudah dikecilkan
* `currentPage` (Integer, Optional) - posisi halaman terakhir (sudah ada di data; belum masuk daftar form)
* `createdAt` (Timestamp `Date.now()`, Indexed)

> Kolom "narator" tidak dipakai (dihapus dari rencana).

### Store: `notes`
Skema Dexie: `++id, bookId, type, createdAt`

* `id` (Auto-Increment Integer, Primary Key)
* `bookId` (Integer, relasi ke `books.id`, Indexed; harus bertipe **angka**, bukan string)
* `type` (Enum: `'quote'`, `'note'`, Indexed)
* `content` (Text)
* `page` (Integer, Optional)
* `createdAt` (Timestamp `Date.now()`, Indexed, dipakai mengurutkan catatan terbaru)

Satu buku dapat memiliki banyak catatan (relasi one-to-many lewat `bookId`).

### Aturan Integritas Data
* **Hapus buku = hapus catatannya.** Penghapusan dilakukan dalam satu transaksi (`db.transaction('rw', db.books, db.notes, ...)`) agar tidak ada catatan yatim.
* Kolom opsional yang dikosongkan disimpan sebagai `undefined` (properti dihapus), bukan string kosong.
* Status hanya boleh salah satu dari empat nilai di atas; input status memakai dropdown, bukan teks bebas.
* Foto sampul dikecilkan (lebar maksimal sekitar 600 px) sebelum disimpan agar penyimpanan browser tidak cepat penuh.
* `db.version(2)` hanya diperlukan bila nanti menambah indeks baru (misalnya untuk mencari berdasarkan kolom lain).

---

## 5. Deployment & Distribusi
* **Hosting:** Vercel, dengan deploy otomatis dari repositori GitHub dan HTTPS bawaan. Domain dipilih sejak awal dan tidak diganti, karena IndexedDB dan APK terikat pada domain.
* **Android:** PWA dibungkus menjadi APK dengan Bubblewrap (TWA). Membutuhkan HTTPS, manifest + service worker + ikon, serta berkas `/.well-known/assetlinks.json` di domain.
* Data tersimpan per perangkat/lingkungan (browser vs APK tidak berbagi IndexedDB).
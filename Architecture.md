# Software Architecture Document (Architecture.md)

## 1. System Overview
Aplikasi Simple Book Tracker dirancang menggunakan pola **Offline-First Progressive Web App (PWA)** tanpa ketergantungan pada server backend untuk operasi dasar.

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
   * HTML/JS Views + Tailwind CSS.
   * Render data dari lokal state dan menangani input pengguna (Form Tambah Buku, Form Catatan).

2. **Data Access Layer:**
   * `Dexie.js` sebagai *wrapper* IndexedDB untuk menyederhanakan kueri asinkron (CRUD).

3. **Storage Layer:**
   * Browser `IndexedDB` untuk menyimpan objek buku, wishlist, dan catatan.
   * `CacheStorage` via Service Worker untuk menyimpan aset statis (HTML, CSS, JS, Ikon).

---

## 4. Data Models & Schema (IndexedDB)

### Store: `books`
* `id` (Auto-Increment Integer / UUID Primary Key)
* `title` (String, Indexed)
* `author` (String)
* `status` (Enum: `'reading'`, `'read'`, `'wishlist'`)
* `currentPage` (Integer, Optional)
* `totalPages` (Integer, Optional)
* `price` (Number, Optional)
* `createdAt` (Timestamp)

### Store: `notes`
* `id` (Auto-Increment Integer / UUID Primary Key)
* `bookId` (Foreign Key -> `books.id`, Indexed)
* `type` (Enum: `'quote'`, `'note'`)
* `content` (Text)
* `page` (Integer, Optional)
* `createdAt` (Timestamp)

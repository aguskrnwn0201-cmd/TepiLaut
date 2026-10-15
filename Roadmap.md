# Project Roadmap & Implementation Schedule (Roadmap.md)

Dokumen ini memuat tahapan pengembangan aplikasi Simple Book Tracker (Tepi Laut) dari awal hingga siap digunakan dan dipublikasikan.

---

## Phase 1: Prototype & Core Setup (Minggu 1)
* [x] Finalisasi spesifikasi produk (PRD) dan arsitektur data.
* [x] Penyusunan struktur folder proyek (`TepiLaut/`) dan file statis dasar.
* [x] Integrasi Tailwind CSS (via Tailwind CLI) & skema IndexedDB dengan Dexie.js (disimpan lokal di `js/lib/`).
* [x] Inisialisasi repositori Git.

## Phase 2: MVP Features Development (Minggu 2)
* [x] Kerangka UI: header, indikator Offline, bottom nav 3 tab (Buku Saya, Wishlist, Catatan).
* [x] Daftar buku dibaca dari IndexedDB, difilter per tab (Reading/Read vs Wishlist).
* [x] Form tambah buku (modal `<dialog>`) dengan pilihan status lewat dropdown.
* [ ] Hapus buku dan ubah status langsung dari kartu (maks. 2 klik).
* [ ] Edit data buku (judul, penulis, halaman, harga).
* [ ] Implementasi modul Catatan & Kutipan (*Quotes & Notes*).
* [ ] Pengujian fungsionalitas UI & interaksi modal/form di HP.
* [ ] Mode gelap (Deep Sea Dark).

## Phase 3: PWA Integration & Testing (Minggu 3)
* [ ] Penambahan `manifest.json` dan ikon aplikasi (192x192 dan 512x512).
* [ ] Pembuatan `sw.js` (Service Worker) untuk kapabilitas offline-first.
* [ ] Pengujian offline mode dan audit Lighthouse PWA score.

## Phase 4: Android Build & Polish (Minggu 4 - Opsional)
* [ ] Pembungkusan PWA menjadi APK menggunakan Google Bubblewrap.
* [ ] Pengujian instalasi manual di perangkat Android (*sideloading* APK).
* [ ] Dokumentasi penggunaan personal.
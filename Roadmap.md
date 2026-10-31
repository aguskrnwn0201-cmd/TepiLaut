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
* [x] Ubah status (dropdown di kartu) dan hapus buku (beserta catatannya, via transaksi).
* [x] Edit buku memakai ulang form tambah buku.
* [x] Modul Catatan & Kutipan: tambah, tampil terbaru dulu, hapus.
* [x] Tombol cepat "+ Catatan" di kartu buku (buku terpilih otomatis).
* [x] Toast notifikasi untuk tambah/ubah/hapus.

## Phase 2b: Perluasan Fitur & Tampilan (sebelum PWA)
* [x] Form buku lengkap sesuai urutan: Judul, Jumlah halaman, Bahasa, Penulis, Penerjemah, Ilustrator, Penerbit, Cetakan, Blurb, Harga, Status (dropdown), Kepemilikan (teks bebas). Wajib: Judul, Penulis, Status.
* [x] Status keempat "Belum dibaca" (`unread`) di form, dropdown kartu, dan filter tab Buku Saya.
* [ ] Upload foto sampul: pilih file, kecilkan dengan Canvas, simpan sebagai Blob di IndexedDB.
* [ ] Halaman detail buku: data lengkap, blurb, foto sampul, dan semua catatan/kutipan buku tersebut.
* [ ] Perbaikan tampilan kartu (thumbnail sampul + placeholder) dan UI yang lebih menarik.
* [ ] Mode gelap (Deep Sea Dark).
* [ ] Pengujian fungsionalitas UI & interaksi modal/form di HP.

## Phase 3: PWA Integration & Hosting (Minggu 3)
* [ ] Ikon aplikasi dari logo milik sendiri (192x192, 512x512, versi maskable).
* [ ] Splash screen memakai logo aplikasi.
* [ ] Penambahan `manifest.json` (warna tema laut) dan pembuatan `sw.js` (Service Worker) untuk offline-first.
* [ ] Pengujian offline mode dan audit Lighthouse PWA score.
* [ ] Push ke GitHub dan deploy ke Vercel (HTTPS); tentukan domain final.

## Phase 4: Android Build & Polish (Minggu 4 - Opsional)
* [ ] Siapkan `/.well-known/assetlinks.json` di domain.
* [ ] Pembungkusan PWA menjadi APK menggunakan Google Bubblewrap (cadangan: PWABuilder).
* [ ] Pengujian instalasi manual di perangkat Android (*sideloading* APK).
* [ ] Dokumentasi penggunaan personal.
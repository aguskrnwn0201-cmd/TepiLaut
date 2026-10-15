# Product Requirements Document (PRD)

## 1. Executive Summary
**Project Name:** Simple Book Tracker & Wishlist (PWA)  
**Target User:** Personal Use (Minimalist Reader)  
**Primary Objective:** Menyediakan aplikasi pencatat bacaan dan daftar keinginan (*wishlist*) yang simpel, cepat, tanpa fitur rumit (*low-friction*), serta dapat diakses secara offline via PWA.

---

## 2. User Needs & Goals
* **Problem:** Waktu membaca yang terbatas membuat aplikasi membaca yang terlalu kompleks (banyak statistik, timer, grafik) menjadi menyita waktu dan tidak terpakai.
* **Goal:** Aplikasi ringan yang memudahkan pengelolaan koleksi buku, pencatatan *wishlist* buku yang ingin dibeli/dibaca, serta penyimpanan catatan dan kutipan (*quotes*) pribadi secara rapi.

---

## 3. Core Features Scope (MVP)

### 3.1. Manajemen Buku & Wishlist
* **Kategori Buku:**
  * **Reading (Sedang Dibaca):** Mencatat judul, penulis, dan posisi halaman terakhir (opsional).
  * **Read (Selesai):** Arsip buku yang telah tamat dibaca.
  * **Wishlist (Ingin Dibaca / Dibeli):** Daftar buku incaran lengkap dengan perkiraan harga atau tempat pembelian (opsional).
* **Operasi Data:** Tambah, Edit Status, Hapus, dan Filter berdasarkan Kategori.

### 3.2. Catatan & Kutipan Pribadi (*Quotes & Notes*)
* **Input Kutipan:** Menyimpan petikan kalimat (*quote*) favorit dari buku tertentu.
* **Refleksi / Catatan Bebas:** Tempat menulis pemikiran pribadi, ringkasan per bab, atau opini singkat.
* **Relasi Data:** Setiap catatan/kutipan terhubung langsung ke ID buku yang bersangkutan.

### 3.3. Aksesibilitas & Offline Support (PWA)
* **Installable:** Dapat ditambahkan ke *Home Screen* Android/Desktop.
* **Offline-First:** Semua data tersimpan di penyimpanan lokal browser (IndexedDB).

---

## 4. Tech Stack Recommendation
* **Frontend:** HTML5, Tailwind CSS, JavaScript (React / Vue / Vanilla JS + Dexie.js for IndexedDB).
* **PWA:** Web App Manifest (`manifest.json`) + Service Worker.
* **Storage:** IndexedDB via `Dexie.js`.

---

## 5. Non-Functional Requirements
* **Kinerja:** Waktu muat halaman kurang dari 1 detik.
* **Responsif:** Tampilan optimal untuk layar smartphone (*Mobile-First Design*).
* **Simplicity:** Maksimal 2 klik untuk memperbarui status atau menambah catatan.

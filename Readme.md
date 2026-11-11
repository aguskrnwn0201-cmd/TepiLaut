# Tepi Laut — Simple Book Tracker & Wishlist (PWA)

Aplikasi pencatat aktivitas membaca dan daftar keinginan (*wishlist*) buku yang simpel, estetik, dan ringan. Dirancang khusus untuk pembaca dengan waktu terbatas yang menginginkan pencatatan serba cepat tanpa fitur rumit.

---

## 🚀 Fitur Utama

* 📚 **Manajemen Buku** — Catat buku *Belum Dibaca*, *Sedang Dibaca*, dan *Selesai*, lengkap dengan 12 kolom data dan foto sampul.
* 🛒 **Wishlist** — Simpan daftar buku incaran beserta harga dan keterangan kepemilikan.
* 📝 **Catatan & Kutipan** — Simpan banyak catatan/kutipan per buku; tampil di halaman detail dan tab Catatan.
* 🔍 **Halaman Detail Buku** — Foto sampul besar, seluruh data buku, blurb, dan semua catatan/kutipan buku tersebut.
* 🌙 **Mode Gelap (Deep Sea Dark)** — Toggle di header, persisten via `localStorage`, otomatis ikut preferensi sistem.
* 📱 **PWA & Offline-First** — Dapat di-install di HP/Desktop; Service Worker men-cache semua aset sehingga bekerja tanpa koneksi internet.

---

## 📍 Status Pengembangan

| Fase | Item | Status |
|------|------|--------|
| Phase 1 | Setup proyek, Tailwind CLI, Dexie.js, Git | ✅ |
| Phase 2 | CRUD buku & catatan, form lengkap, toast, status *Belum Dibaca* | ✅ |
| Phase 2b | Upload foto sampul, halaman detail buku, perbaikan UI kartu | ✅ |
| Phase 2b | Mode gelap Deep Sea Dark | ✅ |
| Phase 3 | `manifest.json` & `sw.js` (offline-first, precache) | ✅ |
| Phase 3 | Ikon aplikasi (logo sendiri 192/512/maskable) | 🔜 |
| Phase 3 | Pengujian offline & audit Lighthouse PWA | 🔜 |
| Phase 3 | Deploy ke Vercel + domain final | 🔜 |
| Phase 4 | Build APK Android (Bubblewrap) | 🔜 |

Rincian lengkap ada di [Roadmap.md](./Roadmap.md).

---

## 🛠️ Dokumentasi Proyek

| File | Isi |
|------|-----|
| [PRD.md](./PRD.md) | Product Requirements Document |
| [Architecture.md](./Architecture.md) | Arsitektur sistem, skema IndexedDB, deployment |
| [Design.md](./Design.md) | Panduan UI/UX dan sistem desain |
| [Skill.md](./Skill.md) | Spesifikasi keterampilan teknis |
| [Frontend.md](./Frontend.md) | Panduan implementasi kode frontend & PWA |
| [Roadmap.md](./Roadmap.md) | Tahapan dan jadwal pengembangan |

---

## 💻 Cara Menjalankan Lokal

Prasyarat: **Node.js** terpasang.

```bash
# 1. Clone dan masuk folder
git clone https://github.com/aguskrnwn0201-cmd/TepiLaut.git
cd TepiLaut

# 2. Pasang dependensi
npm install

# 3. Salin Dexie ke folder lokal (sekali saja)
# Windows:
copy node_modules\dexie\dist\dexie.mjs js\lib\dexie.mjs
# Linux/Mac:
cp node_modules/dexie/dist/dexie.mjs js/lib/dexie.mjs

# 4. Terminal 1 — build CSS otomatis saat file disimpan
npx @tailwindcss/cli -i ./src/input.css -o ./css/styles.css --watch

# 5. Terminal 2 — server lokal
npx serve .
```

Buka alamat yang ditampilkan (mis. `http://localhost:3000`).

> **Catatan:** `index.html` tidak bisa dibuka langsung via `file://` karena aplikasi menggunakan ES Modules.

---

## 🗂️ Struktur Proyek

```
TepiLaut/
├── index.html            # HTML utama + semua dialog
├── manifest.json         # PWA manifest (tema laut)
├── sw.js                 # Service Worker offline-first
├── package.json
├── icons/                # Ikon PWA (192, 512, maskable) ← taruh logo di sini
├── src/
│   └── input.css         # Sumber Tailwind
├── css/
│   └── styles.css        # CSS hasil build (jangan edit manual)
└── js/
    ├── app.js            # UI logic, event handlers, detail view, dark mode
    ├── db.js             # Inisialisasi Dexie/IndexedDB
    ├── pwa.js            # Registrasi Service Worker
    └── lib/
        └── dexie.mjs     # Salinan lokal Dexie (offline-safe)
```

# Tepi Laut - Simple Book Tracker & Wishlist (PWA)

Aplikasi pencatat aktivitas membaca dan daftar keinginan (*wishlist*) buku yang simpel, estetik, dan ringan. Dirancang khusus untuk pembaca dengan waktu terbatas yang menginginkan pencatatan serba cepat tanpa fitur rumit.

---

## 🚀 Fitur Utama
* 📚 **Manajemen Buku:** Catat buku yang *Sedang Dibaca* dan *Selesai Dibaca*.
* 🛒 **Wishlist:** Simpan daftar buku yang ingin dibeli atau dibaca beserta perkiraan harga/catatan toko.
* 📝 **Catatan & Quotes:** Simpan kutipan favorit dan ringkasan pribadi yang terhubung dengan buku.
* 📱 **PWA & Offline First:** Dapat di-install di HP/Desktop dan bekerja 100% tanpa jaringan internet.

---

## 📍 Status Pengembangan
* ✅ Setup proyek, Tailwind CLI, dan database lokal (Dexie.js)
* ✅ Kerangka UI, daftar buku per tab, dan form tambah buku
* 🔜 Hapus/ubah status buku, catatan & quotes, mode gelap
* 🔜 PWA (manifest, service worker, ikon) dan build APK

Rincian lengkap ada di [Roadmap.md](./Roadmap.md).

---

## 🛠️ Ringkasan Dokumentasi Proyek
* [PRD.md](./PRD.md) - Product Requirements Document.
* [Architecture.md](./Architecture.md) - Arsitektur sistem PWA & IndexedDB.
* [Design.md](./Design.md) - Panduan UI/UX dan sistem desain.
* [Skill.md](./Skill.md) - Spesifikasi keterampilan teknis untuk pengembangan.
* [Frontend.md](./Frontend.md) - Panduan implementasi kode frontend & PWA.
* [Roadmap.md](./Roadmap.md) - Tahapan dan jadwal pengembangan.

---

## 💻 Cara Menjalankan Lokal
Prasyarat: Node.js terpasang.

1. *Clone* repositori ini, lalu masuk ke foldernya.
2. Pasang dependensi: `npm install`
3. Salin Dexie ke folder lokal (sekali saja):
   `copy node_modules\dexie\dist\dexie.mjs js\lib\dexie.mjs` (Windows)
4. Terminal 1, build CSS otomatis:
   `npx @tailwindcss/cli -i ./src/input.css -o ./css/styles.css --watch`
5. Terminal 2, jalankan server lokal:
   `npx serve .`
6. Buka alamat yang ditampilkan (mis. `http://localhost:3000`).

> Membuka `index.html` langsung dari folder (`file://`) tidak akan berfungsi karena aplikasi memakai ES Modules.
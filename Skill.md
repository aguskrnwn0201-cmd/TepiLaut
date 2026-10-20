# Developer Skill Requirements (Skill.md)

Dokumen ini mendefinisikan keterampilan teknis (*skill set*) yang dibutuhkan bagi developer atau AI agent untuk membangun, memelihara, dan mengembangkan aplikasi ini.

---

## 1. Core Technical Skills

### Frontend Web Development
* **HTML5 & Modern CSS:** Paham konsep *semantic tags*, CSS Flexbox, Grid, elemen `<dialog>`, dan *mobile-first responsive design*.
* **Tailwind CSS:** Mahir menggunakan *utility classes* Tailwind (termasuk varian `dark:`) untuk pembuatan antarmuka cepat tanpa CSS kustom yang berat.
* **Vanilla JavaScript (ES6+) / Framework:** Kuat dalam konsep Async/Await, ES Modules, Event Handling, dan DOM Manipulation.
* **Penanganan Gambar:** Memilih file gambar (`<input type="file">`), mengecilkannya dengan Canvas API, dan menyimpannya sebagai `Blob`; menampilkannya dengan `URL.createObjectURL` dan melepasnya dengan `URL.revokeObjectURL`.

### PWA & Offline Technologies
* **Web App Manifest:** Konfigurasi `manifest.json` (icons termasuk *maskable*, theme_color, start_url, display mode).
* **Service Worker:** Pemahaman tentang siklus hidup Service Worker (Install, Activate, Fetch) serta strategi *stale-while-revalidate* atau *cache-first*.
* **IndexedDB & Dexie.js:** Penguasaan kueri basis data lokal browser, transaksi data, penyimpanan Blob, dan pemetaan relasi data sederhana.

---

## 2. Tools & Build Stack
* **Tailwind CLI / No-Build:** Kemampuan mengatur proyek ringan tanpa konfigurasi *bundler* berlebihan.
* **Git & GitHub:** Version control standar untuk repositori proyek.
* **Vercel:** Deploy situs statis dari GitHub dengan HTTPS otomatis.
* **Bubblewrap / Capacitor:** Membungkus PWA menjadi APK (termasuk `assetlinks.json` untuk TWA) pada fase rilis Android.
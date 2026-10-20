# UI/UX & System Design Specification (Design.md)

## 1. Visual Aesthetics & Philosophy
* **Philosophy:** Minimalis, bersih, menenangkan, fokus pada keterbacaan (*readability*), dan bebas dari elemen grafik yang membingungkan. Mengambil inspirasi dari ketenangan suasana pantai dan lautan.
* **Theme Mode:** Ocean Light & Deep Sea Dark mode (nyaman untuk mata saat membaca dan mencatat).
* **Color Palette (Tema Tepi Laut):**
  * Primary Accent: Ocean Blue (`#0284C7` / `#0369A1`)
  * Neutral Background: Soft Sky Blue / Ice Blue (`#F0F9FF`) atau Deep Navy (`#0F172A`)
  * Surface Card: Pure White (`#FFFFFF`) / Dark Slate (`#1E293B`)
  * Secondary / Highlight: Wave Teal / Coastal Aqua (`#0D9488` / `#14B8A6`)
  * Text Primary: Deep Ocean Slate (`#0F172A`) / Soft Off-White (`#F8FAFC`)

---

## 2. User Interface Layouts

### 2.1. Splash Screen & Identitas
* Splash screen menampilkan **logo aplikasi milik pengguna** di tengah dengan latar sesuai tema (Ice Blue / Deep Navy).
* Logo yang sama dipakai sebagai ikon PWA/APK (192x192, 512x512, dan versi *maskable*).

### 2.2. Navigation & Header
* Header ringkas berjudul **"Tepi Laut"** beserta indikator status *Offline*.
* Tab Navigasi Utama (Bottom Bar di HP):
  1. 📚 **Buku Saya** (Belum Dibaca, Sedang Dibaca & Selesai)
  2. 🛒 **Wishlist**
  3. 📝 **Catatan & Quotes**

### 2.3. Card Design (Buku & Wishlist)
* **Buku Card:** Foto sampul (thumbnail, dengan placeholder bila belum ada foto), Judul (Bold), Penulis, Status, dan aksi cepat: ubah status, Edit, + Catatan, Hapus.
* **Wishlist Card:** Sama seperti Buku Card, ditambah harga dan kepemilikan bila terisi.
* Mengetuk kartu membuka **Halaman Detail Buku**.

### 2.4. Halaman Detail Buku
* Foto sampul besar, judul, penulis, dan seluruh data buku (jumlah halaman, bahasa, penerjemah, ilustrator, penerbit, cetakan, harga, kepemilikan).
* **Blurb** ditampilkan sebagai teks yang rapi.
* Daftar **semua catatan dan kutipan** buku tersebut (terbaru di atas), dengan tombol + Catatan.

### 2.4.1. Form Design
* Modal / Sheet pop-up bertema biru laut untuk input buku atau catatan baru; modal dapat di-*scroll* karena kolomnya banyak.
* **Urutan kolom form buku:** Foto sampul (opsional), Judul, Jumlah halaman, Bahasa, Penulis, Penerjemah, Ilustrator, Penerbit, Cetakan, Blurb, Harga, Status (dropdown: Belum dibaca, Sedang dibaca, Selesai, Wishlist), Kepemilikan (teks bebas).
* Kolom **wajib** hanya tiga: Judul, Penulis, dan Status. Sisanya opsional.

---

## 3. UI Interaction Rules
* **Modals:** Animasi transisi halus seperti ombak tenang saat membuka form tambah data.
* **Instant Feedback:** Notifikasi toast sederhana bernuansa teal/biru saat sukses menambah, mengubah, atau menghapus data.
* **Konfirmasi:** Penghapusan data meminta konfirmasi singkat.
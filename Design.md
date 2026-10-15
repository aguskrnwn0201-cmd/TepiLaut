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

### 2.1. Navigation & Header
* Header ringkas berlogo/berjudul **"Tepi Laut"** beserta indikator status *Offline*.
* Tab Navigasi Utama (Bottom Bar di HP):
  1. 📚 **Buku Saya** (Sedang Dibaca & Selesai)
  2. 🛒 **Wishlist**
  3. 📝 **Catatan & Quotes**

### 2.2. Card Design (Buku & Wishlist)
* **Buku Card:** Judul (Bold), Penulis, Status Tag (Badge Warna Biru/Teal), dan tombol cepat + Catatan / Update Halaman.
* **Wishlist Card:** Judul, Penulis, Catatan Toko/Harga, tombol "Pindahkan ke Reading" jika sudah dibeli.

### 2.3. Form Design
* Modal / Sheet pop-up sederhana bertema biru laut untuk input buku atau catatan baru.
* Maksimal 3 kolom wajib: Judul, Penulis, dan Status.

---

## 3. UI Interaction Rules
* **Modals:** Animasi transisi halus seperti ombak tenang saat membuka form tambah data.
* **Instant Feedback:** Notifikasi toast sederhana bernuansa teal/biru saat sukses menambah atau menghapus data.
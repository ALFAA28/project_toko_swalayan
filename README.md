# Web Toko Swalayan Online

Website toko online modern dengan panel admin, menggunakan Firebase untuk database dan ImgBB untuk penyimpanan gambar.

## Fitur
*   **Halaman Depan**: Katalog produk responsif untuk pembeli.
*   **Admin Panel**: Dashboard untuk Tambah/Edit/Hapus produk.
*   **Database Realtime**: Menggunakan **Google Firebase Firestore**.
*   **Upload Gambar**: Menggunakan **ImgBB API** (Gratis & Mudah).

---

## 🚀 Panduan Instalasi Lengkap (Langkah demi Langkah)

Ikuti panduan ini dari awal untuk membuat website berjalan 100%.

### BAGIAN 1: Setup Google Firebase (Untuk Login & Database)

1.  Buka [console.firebase.google.com](https://console.firebase.google.com/).
2.  Klik **Add Project**.
3.  Beri nama project (bebas, misal: `toko-online`).
4.  **PENTING:** Saat ditanya tentang Google Analytics, **MATIKAN (Disable)** tombolnya.
    *   *Alasan: Agar settingan lokasi server tidak otomatis dan lebih simpel.*
5.  Klik **Create Project**.

#### A. Aktifkan Database (Firestore)
1.  Di menu kiri, masuk ke **Build** -> **Firestore Database**.
2.  Klik **Create Database**.
3.  Pilih **Lokasi Server**: Pilih **`us-central1`** (Rekomendasi) atau `nam5`.
4.  Pilih **Start in test mode** (Mode percobaan).
5.  Klik **Create**.

#### B. Aktifkan Login (Authentication)
1.  Di menu kiri, masuk ke **Build** -> **Authentication**.
2.  Klik **Get Started**.
3.  Pilih **Email/Password**.
4.  Aktifkan tombol **Enable** (yang atas saja).
5.  Klik **Save**.
6.  Masuk ke tab **Users** -> Klik **Add User**.
7.  Buat akun admin (Email & Password ini nanti dipakai untuk login di `admin.html`).

#### C. Sambungkan Kode ke Firebase
1.  Klik ikon **Gerigi (Settings)** di samping "Project Overview".
2.  Pilih **Project settings**.
3.  Scroll ke bawah ke bagian "Your apps".
4.  Klik ikon **Web (</>)**.
5.  Beri nama aplikasi (bebas) -> Klik **Register app**.
6.  Anda akan melihat kode: `const firebaseConfig = { ... };`.
7.  **Salin kode tersebut**.
8.  Buka file `js/firebase-config.js` di folder proyek ini.
9.  Tempel (Paste) kode tadi menggantikan kode lama yang ada di sana.

---

### BAGIAN 2: Setup ImgBB (Untuk Upload Gambar)

Karena Firebase Storage agak rumit settingannya, kita pakai ImgBB yang lebih mudah dan gratis.

1.  Buka [api.imgbb.com](https://api.imgbb.com/).
2.  Klik **Get API Key** (Login/Daftar jika belum).
3.  Klik tombol **Create a key** (jika belum ada).
4.  **Salin kode panjang (API Key)** yang muncul.
5.  Buka file `js/admin.js` di folder proyek ini.
6.  Cari baris ini (biasanya di bagian atas):
    ```javascript
    const IMGBB_API_KEY = 'YOUR_IMGBB_API_KEY';
    ```
7.  Ganti `YOUR_IMGBB_API_KEY` dengan kode yang Anda salin dari ImgBB.

---

### BAGIAN 3: Menjalankan Website

#### Cara Lokal (Di Laptop Sendiri)
1.  Buka file `admin.html` (Klik kanan -> Open with Chrome) untuk login dan isi produk.
2.  Buka file `index.html` untuk melihat hasil toko.

#### Cara Online (Agar bisa dibuka di HP)
1.  Upload semua folder proyek ini ke **GitHub**.
2.  Masuk ke Settings Repository -> **Pages**.
3.  Aktifkan GitHub Pages pada branch `main`.
4.  Tunggu beberapa menit, website Anda akan live!

---

### 💡 Tips Tambahan
*   Jika gambar tidak muncul setelah diupload, pastikan API Key ImgBB benar.
*   Jika tidak bisa login, cek koneksi internet dan pastikan email admin sudah dibuat di Firebase Authentication.

# Web Toko Swalayan

Web toko online dengan halaman admin untuk mengelola produk.

## Fitur
- **Halaman Depan**: Menampilkan produk untuk pembeli.
- **Admin Panel**: Login admin, tambah/edit/hapus produk.
- **Online Database**: Menggunakan Firebase Firestore.
- **Penyimpanan Gambar**: Menggunakan Firebase Storage.

## Cara Menggunakan

### 1. Setup Firebase (Wajib agar bisa online)
Aplikasi ini membutuhkan Firebase agar bisa berjalan online dan diakses dari HP/Laptop berbeda.

1. Buka [Firebase Console](https://console.firebase.google.com/) dan buat project baru.
2. Masuk ke menu **Authentication** -> **Sign-in method** -> Aktifkan **Email/Password**.
3. Masuk ke menu **Firestore Database** -> **Create Database** -> Pilih **Start in test mode**.
4. Masuk ke menu **Storage** -> **Get Started** -> Pilih **Start in test mode**.
5. Masuk ke **Project Settings** (ikon gear) -> Scroll ke bawah ke "Your apps" -> Klik ikon web (</>).
6. Beri nama app, lalu copy bagian `const firebaseConfig = { ... }`.
7. Paste konfigurasi tersebut ke dalam file `js/firebase-config.js` di folder proyek ini.

### 2. Menjalankan Website
- Buka `index.html` di browser untuk melihat toko.
- Buka `admin.html` untuk login sebagai admin.

### 3. Upload ke GitHub (Agar bisa diakses orang lain)
1. Push kode ini ke repository GitHub.
2. Buka Settings repository -> Pages.
3. Pilih branch `main` (atau `master`) dan folder `/` (root).
4. Save. Tunggu beberapa menit, website akan online!

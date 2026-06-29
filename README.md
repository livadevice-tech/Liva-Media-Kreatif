# Panduan Instalasi & Penggunaan Aplikasi

Aplikasi ini dibangun menggunakan React, TypeScript, Vite, dan Express (opsional sebagai backend server), dan terintegrasi dengan berbagai layanan seperti Firebase dan Google Sheets.

## Persyaratan (Requirements)

### 1. Firebase (Database & Authentication)
Aplikasi ini dapat memanfaatkan Firebase (Firestore dan Auth) untuk penyimpanan data secara real-time dan manajemen pengguna.
- Pastikan Anda telah membuat project di [Firebase Console](https://console.firebase.google.com/).
- Daftarkan aplikasi web Anda di dalam project Firebase tersebut.
- Salin konfigurasi Firebase (API Key, Auth Domain, Project ID, dll) dan masukkan ke file konfigurasi atau `.env.example` yang tersedia (atau `src/firebase.ts` jika menggunakan in-app settings).
- **Security Rules**: Jika Anda mengatur database Firestore, pastikan Anda juga mengatur *Security Rules* di Firebase console (lihat file `firestore.rules` sebagai referensi pengaturan batas keamanan).

### 2. Google Sheets API (Opsional)
Untuk fitur sinkronisasi dengan Google Sheets, pastikan Anda memfasilitasi OAuth Credentials melalui Google Cloud Console dan mengaktifkan **Google Sheets API**.

## Menjalankan Aplikasi di Development & Production

Anda dapat menjalankan sistem melalui npm script yang telah disediakan pada `package.json`.

### Mode Development
Gunakan perintah berikut untuk mode pengembangan:
```bash
npm run dev
```

### Mode Production
Untuk mem-build dan menjalankan secara statik di sisi produksi:
```bash
npm run build
npm start
```

## Panduan Desain

Untuk konsistensi visual saat mengubah UI, ikuti dokumentasi desain di [DESIGN.md](./DESIGN.md).

- Gunakan palet warna, tipografi, spacing, dan komponen yang sudah ditetapkan.
- Saat membuat layar baru, anggap `DESIGN.md` sebagai sumber kebenaran utama.
- Jika ada konflik antara preferensi visual baru dan sistem yang sudah ada, pertahankan konsistensi dengan `DESIGN.md` kecuali diminta lain.

## Catatan Penting Mengenai PORT (Mengapa hanya Port 3000?)

Jika Anda mencoba menggunakan argumen `-p 3003` atau melakukan perubahan port ke port lain selain `3000`, hal tersebut **tidak akan bekerja**.

**Alasannya:**
Aplikasi ini berjalan dalam *sandbox environment container* (atau Cloud Run) yang menggunakan **nginx reverse proxy** routing traffic dari internet luar dan mengarahkannya **secara eksklusif kepada Port 3000**. 

Port `3000` sebenarnya sudah didesain **hardcoded** oleh pihak infrastruktur framework ini agar sesuai dengan akses eksternal, sehingga port tambahan lain (seperti `3001` atau `5173`) akan otomatis terblokir.

Oleh karena itu, selalu pastikan script `dev` maupun `start` Anda beroperasi menyala di network lokal `0.0.0.0` pada `PORT 3000`.

---
Selamat bekerja!

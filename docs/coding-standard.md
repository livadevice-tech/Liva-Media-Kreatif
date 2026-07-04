# Coding Standard

Dokumen ini adalah sumber aturan utama untuk pengembangan, refactor, dan penambahan fitur di project ini.
Setiap perubahan kode harus mengikuti panduan ini supaya perilaku tetap stabil, mudah dipahami, dan aman dipublish.
Jika ada konflik dengan plan lain, dokumen ini yang diikuti.

## Tujuan Utama

- Menjaga perilaku aplikasi tetap konsisten.
- Mengurangi risiko bug saat refactor atau menambah fitur.
- Membuat struktur kode mudah dibaca, dites, dan dirawat.
- Menjaga production tetap aman saat auto-deploy berjalan.

## Scope Penggunaan

Gunakan dokumen ini untuk:

- menambah fitur baru
- memperbaiki bug
- refactor struktur kode
- menambah helper atau service baru
- mengubah API contract
- mengubah konfigurasi production

Jangan membuat kode baru tanpa mengacu ke dokumen ini terlebih dulu.

## Workflow Wajib

Sebelum mulai perubahan:

- pahami tujuan perubahan
- cari file yang paling kecil tanggung jawabnya
- tentukan apakah ini bugfix, refactor, atau fitur baru
- cek apakah ada file atau helper yang sudah cocok dipakai ulang

Saat mengerjakan:

- ubah satu hal penting dalam satu slice
- jaga perubahan tetap kecil dan bisa dibalik
- bila logic mulai panjang, pindahkan ke helper atau komponen kecil
- bila perubahan menyentuh data, tambah atau sesuaikan test

Sebelum publish:

- jalankan test
- jalankan build
- jalankan preflight produksi bila menyentuh env, auth, atau deploy
- cek ulang apakah ada secret, placeholder, atau branch deploy yang salah

## Prinsip Dasar

1. Utamakan perilaku yang sudah ada.
2. Pecah logic besar menjadi bagian kecil yang jelas.
3. Pisahkan UI, state, dan business logic.
4. Gunakan helper pure untuk perhitungan dan transformasi data.
5. Jangan menambah abstraksi kalau belum ada kebutuhan nyata.
6. Lebih baik menulis kode yang jelas daripada kode yang terlalu ringkas.
7. Jangan menggabungkan refactor besar dengan perubahan perilaku baru dalam satu langkah.
8. Jangan memindahkan logic ke file baru kalau file lama masih menjadi sumber kebenaran yang jelas.

## Aturan Penulisan Kode

- Gunakan nama variabel, fungsi, dan file yang deskriptif.
- Hindari `any` kecuali benar-benar tidak ada alternatif.
- Hindari `unknown` tanpa narrowing yang jelas.
- Hindari duplikasi logic.
- Hindari nested conditional yang panjang.
- Gunakan early return jika membuat alur lebih mudah dibaca.
- Tulis komentar hanya untuk menjelaskan alasan, bukan hal yang sudah jelas dari kode.
- Hindari helper yang hanya membungkus satu baris tanpa menambah makna.
- Hindari file yang menangani banyak domain sekaligus.
- Jika logic butuh test, pindahkan ke function murni lebih dulu.

## Aturan Struktur Folder

### `src/app/`
- Untuk orchestration tertinggi, routing, dan layout aplikasi.
- Jangan taruh domain logic yang spesifik fitur di sini.

### `src/features/`
- Untuk logic per domain atau per fitur.
- Setiap fitur idealnya punya komponen, hook, type, dan service sendiri.
- Kalau sebuah fitur mulai punya state, filter, sorting, parser, atau API sendiri, pindahkan ke sini.

### `src/components/`
- Untuk UI reusable dan komponen presentasional.
- Komponen besar yang mulai punya business logic harus dipindah ke `features/`.
- Komponen di sini sebaiknya kecil, fokus, dan mudah dipakai ulang.

### `src/shared/`
- Untuk utilitas pure, config, auth helper, type contract, dan API client.
- Jangan taruh state React atau side effect yang kompleks di sini.
- Jika sebuah helper bergantung pada React state, itu bukan shared util.

### `server/`
- Untuk bootstrap server, auth, validasi produksi, middleware, dan route/service backend.
- Jangan menaruh query builder besar atau logic bisnis front-end ke server bootstrap.

## Aturan Pemisahan Logic

- Logic perhitungan dipindah ke helper pure di `src/shared/utils/`.
- Logic auth/session dipisah dari UI.
- Logic load data dipisah dari render.
- Logic table/sort/filter dipisah dari komponen visual.
- Route handler backend jangan bercampur dengan helper umum.
- Parser upload dan normalisasi data harus diuji terpisah.
- Konfigurasi produksi harus divalidasi sebelum app start.
- Boundary API harus eksplisit, bukan tersembunyi di banyak tempat.

## Aturan Best Practice untuk Refactor

1. Pecah satu hal dalam satu langkah.
2. Setelah tiap langkah, jalankan test.
3. Setelah tiap langkah, jalankan build.
4. Jangan memindahkan semua fitur sekaligus.
5. Jangan ubah behavior saat tujuan utamanya hanya refactor.
6. Jika perubahan terlalu besar, pecah lagi menjadi slice yang lebih kecil.
7. Jika ada file besar yang berubah, periksa apakah ada helper yang seharusnya dipindah dulu.
8. Jika refactor membuat alur lebih sulit dipahami, batalkan dan sederhanakan lagi.

## Aturan Saat Menambah Fitur Baru

- Mulai dari contract dan alur data, bukan dari UI penuh.
- Tentukan dulu file pemilik fitur.
- Jika fitur punya data transformasi sendiri, buat helper pure lebih dulu.
- Jika fitur punya API sendiri, buat boundary API yang jelas.
- Jika fitur punya state yang banyak, pecah menjadi hook atau subkomponen.
- Jangan menaruh semua logic fitur baru di `App.tsx`.

## Aturan Saat Memperbaiki Bug

- Cari root cause, bukan hanya gejalanya.
- Buat reproduksi yang bisa dites kalau memungkinkan.
- Perbaiki di lapisan yang paling dekat dengan sumber masalah.
- Tambahkan test yang gagal sebelum perbaikan dan lulus setelah perbaikan.
- Jangan menambal bug dengan conditional baru yang tidak jelas alasannya.

## Quality Gate Wajib

Gunakan urutan ini sebelum merge atau publish:

```bash
npm run check
```

Untuk perubahan yang menyentuh production config atau backend deploy:

```bash
npm run check:prod
```

Jika `check:prod` gagal, jangan publish sebelum root cause dibereskan.

Jika perbaikan menyentuh auth, env, deploy, atau database:

1. jalankan test
2. jalankan build
3. jalankan preflight production
4. cek kembali config di environment target

## Aturan Production dan Deploy

- Jangan push ke branch deploy kalau env production belum lengkap.
- Pastikan `SESSION_SECRET`, admin credential, dan `ALLOWED_ORIGINS` valid.
- Jangan gunakan placeholder untuk secret production.
- Pastikan database host, user, password, dan name benar.
- Kalau deploy auto-run, verifikasi dulu di branch aman atau staging.
- Jangan anggap lulus build berarti production aman.
- Jika auto-deploy aktif, setiap push harus diperlakukan sebagai release candidate.
- Kalau ada error 503 atau boot failure, prioritaskan rollback atau env fix sebelum refactor lanjut.

## Definition of Done

Sebuah perubahan dianggap selesai kalau:

- Kode sudah sesuai tujuan.
- Test yang relevan sudah ada atau diperbarui.
- `npm run check` lulus.
- Jika menyentuh production, `npm run check:prod` lulus.
- Tidak ada regresi perilaku yang diketahui.
- Dokumentasi atau plan terkait ikut diperbarui bila perlu.
- Perubahan bisa dijelaskan dalam satu kalimat tujuan dan satu kalimat hasil.
- Jika fitur baru, ada jalur test minimal yang relevan.
- Jika refactor, file yang dipecah tetap mudah dipahami tanpa penjelasan tambahan.

## Larangan Penting

- Jangan menghapus kode lama tanpa memastikan penggantinya sudah aman.
- Jangan menambah file besar baru tanpa alasan yang jelas.
- Jangan memaksa satu file menanggung terlalu banyak tanggung jawab.
- Jangan mempublish kalau server belum lolos validasi production.
- Jangan mengandalkan ingatan untuk env atau permission penting, tulis di dokumen.
- Jangan menyimpan secret mentah di repo.
- Jangan mem-bypass type safety untuk cepat selesai.
- Jangan membuat dokumen baru yang isinya sama tanpa peran yang jelas.

# Agent Rules for Liva Media Kreatif

## Project DNA
- Stack utama: React 19, TypeScript, Vite 6, Tailwind 4, Express, MySQL, Firebase, Google Sheets, Gemini, Nodemailer, Recharts, Motion, dan Lucide.
- Entry frontend ada di `src/main.tsx`, dan UI utama berada di `src/App.tsx`.
- Backend runtime ada di `server.ts`.
- Client API wrapper ada di `src/api.ts`.
- Seed / data contoh ada di `src/data.ts`.
- Komponen reusable ada di `src/components/`.
- Ada banyak script utilitas dan migrasi di root repo, `scripts/`, dan `src/` dengan ekstensi `.cjs` / `.js`; perlakukan itu sebagai tooling, bukan core app, kecuali memang sedang dipakai.

## Arsitektur Yang Harus Dijaga
- Alur data utama: UI React -> `src/api.ts` -> `server.ts` -> MySQL / Firebase / layanan eksternal.
- Jangan ubah shape data antar layer tanpa menyesuaikan semua sisi yang terkait.
- Mapping `snake_case` di database ke `camelCase` di UI sudah dipakai di beberapa tempat; jaga konsistensinya.
- `server.ts` menangani migration ringan saat boot. Kalau schema berubah, update migration di sana juga.
- `src/App.tsx` adalah monolith besar; lakukan perubahan surgikal, bukan rewrite besar-besaran tanpa alasan kuat.

## Aturan Kerja
- Prioritaskan perubahan kecil yang bisa diuji cepat.
- Kalau field UI menyentuh API dan database, ubah frontend, client API, dan backend secara bersamaan.
- Kalau menambah endpoint baru, daftarkan di `src/api.ts` dan pastikan handler backend ikut ada.
- Kalau menambah data persisted, cek juga model seed, validasi, dan migration.
- Kalau menghapus data, pastikan ada konfirmasi yang jelas di UI dan backend tidak menghapus diam-diam tanpa kontrol.
- Jangan log secret, password, token, atau isi konfigurasi sensitif.
- Jangan mengandalkan data sample di `src/data.ts` sebagai sumber kebenaran produksi.
- Jangan memodifikasi script utilitas satu-per-satu tanpa alasan; banyak file ini hanya hasil refactor atau patch historis.

## Area Risiko Tinggi
- `src/App.tsx` sangat besar dan kompleks.
- `server.ts` memegang pool MySQL, route API, migration, dan bootstrap server.
- `src/api.ts` adalah lapisan kontrak antara UI dan backend.
- `src/data.ts` berisi generator data yang bisa memengaruhi tampilan demo dan statistik.
- Fitur credential / host / payroll / reporting kemungkinan menyimpan atau menampilkan data sensitif, jadi perubahan di area ini harus ekstra hati-hati.

## Preferensi Implementasi
- Gunakan helper yang sudah ada daripada menulis ulang pola baru.
- Pertahankan gaya kode yang sudah dipakai file target.
- Kalau ada fungsi yang sudah memetakan data, extend fungsi itu lebih aman daripada bikin jalur baru.
- Kalau butuh inspeksi struktur kode, pakai code graph / snippet dulu sebelum edit.
- Untuk perubahan besar, pecah jadi langkah yang bisa diverifikasi.

## Verifikasi Minimal
- Jalankan `npm run lint` setelah ubahan TypeScript penting.
- Jalankan `npm run build` kalau menyentuh alur utama atau bootstrap server.
- Cek aplikasi di port `3000` karena repo ini didesain untuk environment yang mengarah ke port itu.
- Kalau perubahan menyentuh UI, pastikan state kosong, loading, error, dan delete flow tetap masuk akal.

## Branch And Deploy Safety
- Anggap branch aktif sebagai target kerja utama, bukan `main`, kecuali user secara eksplisit minta sebaliknya.
- Sebelum `push`, selalu cek `git status --short --branch` dan pastikan branch target benar.
- Jangan pernah asumsikan `main` adalah branch produksi di repo ini.
- Karena hosting auto-deploy aktif, perlakukan setiap `push` sebagai deploy production.
- Untuk perubahan berisiko, minta konfirmasi eksplisit sebelum push.
- Kalau ada file yang belum dipahami atau belum diverifikasi, jangan ikut terdorong ke commit / push.
- Jika perlu deploy, verifikasi ringkas: branch aktif, diff yang relevan, dan tidak ada file asing yang ikut masuk.

## Peta Cepat File Penting
- `src/main.tsx` bootstrap React.
- `src/App.tsx` seluruh aplikasi utama.
- `src/api.ts` client-side HTTP helpers.
- `server.ts` Express + MySQL + bootstrap.
- `src/sheets.ts` integrasi Google Sheets.
- `src/firestoreSync.ts` sinkronisasi Firebase / Firestore.
- `src/firebase.ts` konfigurasi Firebase.
- `src/components/` komponen UI reusable.
- `scripts/` migrasi dan export/import data.

## Catatan Untuk Agen Berikutnya
- Repo ini sudah di-index ke code graph; gunakan itu dulu sebelum browsing file besar.
- File besar dan script lama banyak tersebar; selalu cek apakah perubahanmu menyentuh runtime atau hanya tooling.
- Jika menemukan perilaku aneh, cari dulu kontrak data antar layer sebelum menyalahkan UI.

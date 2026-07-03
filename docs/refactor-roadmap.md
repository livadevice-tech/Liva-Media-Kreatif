# Refactor Roadmap

Dokumen ini merangkum peta modul saat ini dan urutan refactor yang paling aman
tanpa mengubah perilaku aplikasi.

## Peta Modul Ideal

### `src/app/`
- `src/app/App.tsx` untuk orchestration level tertinggi saja.
- `src/app/auth/` untuk login, session restore, logout, dan guard state.
- `src/app/permissions/` untuk mapping `accessTabs` ke modul UI.

### `src/features/`
- `src/features/hosts/`
- `src/features/logs/`
- `src/features/schedules/`
- `src/features/brands/`
- `src/features/leads/`
- `src/features/reporting/`
- `src/features/invoice/`
- `src/features/settings/`
- `src/features/copilot/`
- `src/features/admin-privacy/`

Setiap feature idealnya berisi:
- `index.tsx` atau `FeaturePage.tsx`
- `components/`
- `hooks/`
- `types.ts`
- `constants.ts`

### `src/shared/`
- `src/shared/api/` untuk client REST.
- `src/shared/auth/` untuk session/permission helper.
- `src/shared/config/` untuk config global.
- `src/shared/utils/` untuk helper tanggal dan formatting.

### `server/`
- `server/auth.ts` untuk token, password hashing, dan authorization.
- `server/productionConfig.ts` untuk validasi env production.
- File server utama tetap sebagai bootstrap/router orchestration.

## Urutan Refactor Paling Aman

1. Pecah helper yang sudah murni dan stateless.
2. Pindahkan konstanta dan mapping permission ke `src/shared/`.
3. Pisahkan login/session/auth dari `src/App.tsx`.
4. Pisahkan data loading per role ke hook kecil.
5. Pindahkan feature besar satu per satu, mulai dari yang paling terisolasi.
6. Terakhir, pecah `App.tsx` menjadi shell + route container.

## Prioritas File Untuk Dipisah Dulu

1. `src/App.tsx`
2. `src/components/InvoiceDashboard.tsx`
3. `server.ts`
4. `src/api.ts`
5. `src/components/DoubleDatePicker.tsx`

## Catatan Aman

- Jangan memindahkan semua fitur sekaligus.
- Setelah setiap pemecahan file, jalankan test dan build.
- Untuk gate lokal gunakan `npm run check`.
- Untuk gate production sebelum deploy gunakan `npm run check:prod`.
- Jangan ubah aturan permission saat refactor struktur.
- Backup file lama seperti `src/App.tsx.backup` sudah dihapus agar tidak
  mengaburkan sumber kebenaran kode aktif.

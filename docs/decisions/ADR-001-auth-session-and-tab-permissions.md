# ADR-001: Server-Side Session Auth dan Permission Berbasis Tab

## Status
Accepted

## Date
2026-07-02

## Context
Sebelumnya aplikasi mengandalkan state login yang terlalu percaya pada sisi client
dan beberapa data sensitif masih bisa terakses terlalu luas. Untuk production,
dibutuhkan model yang:
- tidak menyimpan session auth di storage client
- memvalidasi login di server
- membatasi akses data berdasarkan role dan tab fitur
- aman untuk deploy langsung dari GitHub ke production

## Decision
Kami memakai:
- session token bertanda tangan HMAC di cookie `HttpOnly`
- session role `master`, `admin`, `host`, dan `brand`
- `admin` sub-akun dibatasi server-side berdasarkan `accessTabs`
- preflight production config sebelum deploy
- validasi env production saat bootstrap server
- gate lokal `npm run check`
- gate production `npm run check:prod`

## Consequences
- Client tidak lagi dianggap sebagai sumber kebenaran auth
- Akses modul lebih mudah dipetakan dan diuji per tab
- Deploy gagal lebih awal jika secret atau config production belum lengkap
- Perlu menjaga mapping tab di server dan client tetap sinkron
- Proses sebelum push dan sebelum deploy menjadi lebih eksplisit dan repeatable

## Alternatives Considered

### Client-side login state only
- Pros: lebih cepat diimplementasi
- Cons: terlalu mudah dipalsukan dan tidak cukup aman untuk production

### Session storage / localStorage
- Pros: sederhana
- Cons: token dapat dibaca JavaScript dan lebih rentan terhadap pencurian

### RBAC penuh berbasis tabel permission terpisah
- Pros: fleksibel
- Cons: lebih berat dari kebutuhan saat ini dan belum perlu untuk scope sekarang

## Notes
- Mapping tab dan permission disatukan di `src/shared/auth/access.ts`.
- Semua perubahan permission harus ditambah test sebelum merge.

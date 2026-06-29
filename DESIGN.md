# Design System: Data Stream Performance

Dokumen ini adalah sumber kebenaran untuk semua UI baru dan perbaikan visual di project ini.
Jika ada keraguan desain, ikuti file ini terlebih dahulu.

## Tujuan

- Membangun interface yang terasa profesional, padat data, dan jelas.
- Menonjolkan informasi penting tanpa membuat tampilan terasa ramai.
- Mempertahankan konsistensi visual di seluruh halaman reporting, dashboard, dan panel admin.

## Karakter Visual

- Gaya utama: corporate modern, data-driven, rapi, dan efisien.
- Kesan yang dicari: tenang, tegas, terpercaya, dan presisi.
- Fokus utama selalu ada pada data, bukan dekorasi.
- Warna aksen ungu dipakai untuk brand identity, aksi utama, dan status aktif.
- Warna hijau hanya untuk indikator positif, growth, atau success.

## Prinsip Inti

1. Hierarki harus langsung terbaca dalam 3 detik.
2. Satu layar hanya boleh punya satu fokus utama.
3. Gunakan ruang kosong untuk memandu perhatian, bukan sekadar menambah jarak.
4. Borders halus lebih diprioritaskan daripada shadow berat.
5. Jangan menumpuk terlalu banyak warna aksen dalam satu view.
6. Data penting harus terlihat paling kuat melalui ukuran, weight, dan kontras.
7. Setiap komponen harus punya state default, hover, active, focus, loading, empty, dan error bila relevan.

## Warna

### Palet Utama

- Surface utama: `#fcf9f8`
- Surface dim: `#dcd9d9`
- Surface container low: `#f6f3f2`
- Surface container: `#f0eded`
- Surface container high: `#eae7e7`
- Surface container highest: `#e5e2e1`
- On surface: `#1b1c1c`
- On surface variant: `#494456`
- Outline: `#7a7488`
- Outline variant: `#cbc3d9`
- Primary: `#5600e0`
- Primary container: `#6f32ff`
- Secondary: `#006d41`
- Error: `#ba1a1a`

### Aturan Pemakaian Warna

- Gunakan latar terang netral sebagai dasar.
- Gunakan ungu untuk aksi utama, active state, dan identitas brand.
- Gunakan hijau hanya untuk positif, bukan untuk dekorasi.
- Hindari memakai banyak warna saturasi tinggi dalam satu area.
- Teks utama harus memakai charcoal gelap, bukan abu-abu pucat.
- Teks sekunder harus cukup kontras untuk tetap terbaca di background terang.

### Mapping Praktis

- Background halaman: `surface` atau `surface-bright`
- Card utama: `surface-container-lowest` atau putih
- Card sekunder: `surface-container-low`
- Border normal: `outline-variant`
- Border emphasis: `primary`
- Tombol aktif: `primary`
- State sukses: `secondary`
- State error: `error`

## Tipografi

### Font

- Headline dan angka besar: `Hanken Grotesk`
- Body, label, data tabel: `Inter`
- Kalau implementasi project memakai font stack lain, gunakan padanan terdekat yang sudah ada di repo dan jangan menambah font baru tanpa alasan jelas.

### Skala

- `headline-lg`: 24px / 600 / 32px
- `headline-md`: 20px / 600 / 28px
- `metric-display`: 22px / 700 / 28px / tracking `-0.02em`
- `body-lg`: 16px / 400 / 24px
- `body-md`: 14px / 400 / 20px
- `label-sm`: 12px / 500 / 16px
- `label-xs`: 11px / 400 / 14px

### Aturan Tipografi

- Judul harus tegas dan singkat.
- Angka besar harus paling dominan di blok metrik.
- Label jangan lebih menonjol dari nilai.
- Gunakan tabular numbers untuk angka dinamis, harga, dan metrik.
- Tracking sedikit rapat untuk headline besar agar terasa crafted.
- Body text harus mudah dipindai, jangan terlalu padat.

## Layout Dan Spacing

- Grid dasar: 4px.
- Padding container utama: 24px.
- Gap antar card: 16px.
- Gap antar elemen kecil: 8px.
- Jarak antar section besar: 32px.

### Aturan Layout

- Desktop harus terasa fluid dan rapi, bukan sekadar full width tanpa struktur.
- Gunakan 12-column thinking untuk area data padat.
- Section harus dipisahkan dengan ruang yang jelas.
- Kontrol di atas area data harus dibaca sebagai toolbar, bukan dekorasi.
- Gunakan komposisi yang lebih rapat untuk dashboard, lebih lega hanya bila konteksnya memang butuh breathing room.

## Elevation Dan Depth

- Gunakan low-contrast outlines sebagai dasar.
- Card dan panel cukup dengan border tipis dan shadow sangat halus.
- Jangan memakai shadow berat kecuali untuk popover, dropdown, atau modal.
- Layer harus terasa bertingkat, tetapi tidak mencolok.
- Active selection lebih baik ditunjukkan dengan warna atau border, bukan dengan efek depth yang berlebihan.

### Skala Permukaan

- Base page: background utama
- Level 1: card utama / panel
- Level 2: dropdown / popover / modal
- Level 3: overlay dan dialog

## Bentuk

- Card utama: radius 8px sampai 12px.
- Input dan button: radius 8px.
- Chip dan tag kecil: radius 4px sampai full pill.
- Icon backdrop: rounded square halus, bukan bentuk ekstrem.
- Jangan mencampur terlalu banyak radius dalam satu layar tanpa alasan.

## Komponen

### Metric Card

- Icon kecil di kiri atas atau kiri judul.
- Label kecil, value besar, lalu informasi trend atau status di bawah.
- Value harus menjadi fokus visual utama.
- Gunakan background tonal ringan untuk membedakan kartu metrik.

### Tabs

- Tab aktif ditandai dengan garis bawah 2px atau stroke yang tegas.
- Tab nonaktif tetap netral.
- Jangan memakai tab dengan banyak ornament.

### Button

- Primary button: filled purple.
- Secondary button: outline netral.
- Ghost button: tanpa border, untuk aksi utilitas.
- Button harus jelas state hover dan focus-nya.

### Input Dan Select

- Pakai border halus dan background tonal ringan.
- Radius konsisten dengan card dan button.
- Chevron atau icon kecil boleh dipakai untuk select.
- Focus state harus terlihat jelas tetapi tidak agresif.

### Table

- Minimalis, tanpa garis vertikal.
- Header memakai label kecil dan tegas.
- Baris dipisahkan dengan garis tipis atau tonal divider.
- Data numerik harus konsisten alignment-nya.

### Trend Indicator

- Positif: hijau, ringan, langsung terbaca.
- Netral: abu-abu atau outline variant.
- Hindari badge trend yang terlalu ramai.

## Do

- Pakai hierarchy yang jelas antara judul, label, value, dan meta.
- Gunakan warna hanya ketika ada makna.
- Pertahankan breathing room di antara blok besar.
- Gunakan komponen yang sudah ada bila cocok.
- Jaga konsistensi radius, border, dan spacing.
- Prefer data density yang tetap enak dibaca.

## Don't

- Jangan memakai random hex color tanpa alasan.
- Jangan membiarkan semua teks punya bobot yang sama.
- Jangan menaruh terlalu banyak aksen ungu dalam satu view.
- Jangan menggunakan shadow berat untuk semua card.
- Jangan mencampur banyak gaya tombol dalam satu area tanpa sistem.
- Jangan membuat layout terasa seperti template generik.

## Checklist Sebelum Mendesain

- Siapa human yang memakai layar ini?
- Apa tugas utama yang harus selesai?
- Apa elemen fokus utama di layar ini?
- Apakah warna yang dipakai punya alasan?
- Apakah spacing-nya konsisten?
- Apakah hierarchy langsung terbaca?
- Apakah komponen ini sudah cocok dengan pola yang ada di project?

## Aturan Untuk Codex

- Saat mendesain UI baru, ikuti file ini sebagai default.
- Jika ada konflik dengan kode existing, pertahankan sistem visual ini kecuali user meminta sebaliknya.
- Jika perlu improvisasi, tetap jaga fondasi: netral terang, ungu sebagai aksen utama, hijau untuk success, border halus, radius lembut, hierarchy tegas.
- Saat merubah tampilan, jangan ubah estetika hanya demi terlihat berbeda.
- Prioritas utama adalah konsistensi, kejelasan, dan kepercayaan visual.

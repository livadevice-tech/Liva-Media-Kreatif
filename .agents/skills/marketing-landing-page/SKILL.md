---
name: marketing-landing-page
description: Panduan komprehensif, praktik terbaik (best practices), dan standar SEO untuk membangun halaman pendaratan (Landing Page) marketing yang memiliki konversi tinggi.
---

# Marketing Landing Page Guidelines

Gunakan *skill* ini saat Anda diminta untuk merancang, membangun, atau meninjau sebuah Landing Page yang bertujuan untuk marketing, promosi, atau akuisisi pelanggan (SaaS/Agensi).

## 1. Struktur Semantik (SEO Friendly)
Selalu gunakan tag HTML5 semantik. Ini krusial agar mesin pencari (*crawler*) memahami konteks konten.
- `<header>`: Untuk navigasi dan logo.
- `<main>`: Untuk membungkus seluruh konten utama halaman.
- `<section>`: Gunakan untuk setiap area khusus (Hero, Features, Pricing, About). Selalu berikan atribut `id` atau `aria-label` yang deskriptif.
- `<footer>`: Untuk informasi hak cipta, tautan sekunder, dan navigasi tambahan.

## 2. Hierarki Tipografi & Heading (SEO)
Struktur *Heading* sangat penting untuk SEO dan aksesibilitas.
- **Hanya boleh ada SATU `<h1>` per halaman.** Tempatkan ini di *Hero Section* dengan mengandung kata kunci (*keyword*) utama.
- Gunakan `<h2>` untuk judul *section* (misalnya: "Layanan Kami", "Testimoni", "Harga").
- Gunakan `<h3>` untuk sub-judul dalam sebuah section (misalnya: judul paket harga, nama fitur).
- **Hindari melompati urutan heading** (misalnya, dari `<h2>` langsung ke `<h4>`).

## 3. Optimasi Media & Kinerja (LCP)
- **Teks Alternatif (Alt Text):** Selalu berikan atribut `alt=""` pada setiap tag `<img>`. Jika gambar hanya dekorasi, gunakan `alt=""` (kosong). Jika penting, deskripsikan dengan jelas.
- **Lazy Loading:** Tambahkan atribut `loading="lazy"` pada gambar yang tidak berada di area *above-the-fold* (di luar pandangan pertama saat dimuat).
- **Video & Animasi:** Hindari memuat video berat di awal pemuatan. Gunakan poster (*thumbnail*) pada video.

## 4. Konversi & UX (CRO - Conversion Rate Optimization)
- **Call-to-Action (CTA):** Pastikan tombol CTA terlihat sangat jelas (*high contrast*). Harus ada minimal satu CTA di area *above-the-fold* (di Hero Section). Teks CTA harus bersifat aksi (contoh: "Mulai Sekarang", bukan sekadar "Klik Di Sini").
- **Social Proof:** Landing page yang baik selalu memiliki elemen bukti sosial (Logo Klien, Testimoni, Angka/Statistik keberhasilan).
- **Clear Value Proposition:** Teks di *Hero Section* harus dalam 3-5 detik pertama bisa menjelaskan: *Apa ini? Untuk siapa? Mengapa mereka harus peduli?*

## 5. Implementasi UI Modern (Tailwind CSS)
- **Whitespace & Spacing:** Gunakan *padding* (p-12, p-24) dan jarak (*gap*) antar *section* yang luas agar desain bernapas dan elegan.
- **Warna Aksen:** Gunakan satu atau dua warna utama (seperti *violet/indigo*) untuk tombol CTA dan aksen, sisanya gunakan palet netral (slate/gray).
- **Micro-interactions:** Tambahkan transisi halus (`transition-all duration-300`) pada tombol saat di-*hover*, atau interaksi kecil saat komponen muncul (seperti *fade in*).

## 6. Checklist Cepat Sebelum Rilis
1. [ ] Apakah hanya ada satu `<h1>`?
2. [ ] Apakah semua gambar memiliki atribut `alt`?
3. [ ] Apakah ada CTA yang terlihat tanpa harus *scroll*?
4. [ ] Apakah navigasi berfungsi dengan mulus (smooth scroll ke section)?
5. [ ] Apakah halaman responsif di layar ponsel (`sm:`, `md:` classes)?

---
name: interactive-design-guidelines
description: Aturan ketat desain web interaktif, UX copy marketing, tipografi (Roboto & Plus Jakarta Sans), dan hierarki komponen, serta larangan penggunaan emotikon (emojis) di UI.
---

# Panduan Desain Web Interaktif & UX Copy (Strict Guidelines)

Skill ini diaktifkan setiap kali ada permintaan pembuatan antarmuka (UI), komponen web, penulisan salinan (*UX copywriting*), dan perancangan *layout*. Panduan ini merupakan standar emas (*gold standard*) yang tidak boleh dilanggar.

## 1. Aturan Emotikon (LARANGAN KERAS)
- **DILARANG MENGGUNAKAN EMOTIKON/EMOJI** dalam teks komponen UI mana pun (contoh: 🚀, ✨, 🔥).
- Antarmuka harus terlihat **profesional, *clean*, dan premium**. Sebagai gantinya, gunakan *iconography* modern dan konsisten (misalnya dari library seperti `lucide-react` atau `phosphor-icons`).

## 2. Tipografi Resmi
- **Font Utama (Primary - Teks Paragraf & Deskripsi):** Wajib menggunakan **Roboto**.
  - Font ini digunakan untuk elemen isi konten, paragraf, deskripsi tambahan, dan *body text*.
- **Font Sekunder (Secondary - Heading & Aksen):** Wajib menggunakan **Plus Jakarta Sans**.
  - Font ini secara eksklusif digunakan untuk Judul (`h1`-`h6`), *Hero Text*, teks *CTA/Button*, angka penting, dan elemen penonjolan (aksen).

## 3. Desain Interaktif (Dynamic Interface)
- Antarmuka **wajib** terasa hidup dan responsif terhadap aksi pengguna.
- **Hover States:** Setiap elemen yang bisa diklik (tombol, *link*, kartu) harus memiliki efek *hover* yang jelas (contohnya pergeseran letak `translate-y-1`, perubahan warna `bg-`, penebalan, atau pendaran bayangan/glow).
- **Transisi Halus:** Setiap perubahan properti (*color*, *transform*, *opacity*) wajib dibungkus dengan transisi yang halus (contoh di Tailwind: `transition-all duration-300 ease-in-out`).
- **Feedback Visual:** Berikan respon seketika saat tombol ditekan (contoh: efek klik *scale-95*) dan state memuat (*loading state*) saat dibutuhkan.

## 4. UX Copywriting (Marketing Best Practice)
- **Singkat, Padat, Menjual:** Gunakan prinsip "*Less is more*". Jangan membuat pengguna bosan dengan blok teks yang besar.
- **Berorientasi pada Manfaat (Benefit-Driven):** Fokus pada "Apa yang didapat pengguna?" ketimbang "Apa fitur sistem ini?". (Misal: "Tingkatkan Penjualan Anda 300% dalam Sebulan", bukan "Sistem Dilengkapi Algoritma X").
- **Call-to-Action (CTA) Jelas:** Jangan gunakan teks pasif seperti "Kirim" atau "Lanjut". Gunakan teks aktif dan bernilai seperti "Mulai Optimasi Sekarang" atau "Klaim Strategi Gratis".

## 5. Hierarki Komponen & Layout
- **Hirarki Visual yang Ketat:** Pastikan hal terpenting di layar adalah elemen terbesar/paling tebal. Gunakan aturan hierarki warna (Primary, Secondary, Muted/Tertiary) dan hierarki teks secara konsisten.
- **Isolasi Komponen (Modular):** Jangan membangun blok halaman besar dan monolitik. Pecah halaman menjadi komponen-komponen mandiri dan terisolasi dengan baik, di mana setiap komponen memiliki satu tujuan (contoh: *TestimonialCard*, *FeatureGrid*, *HeroBanner*).
- **White Space (Negative Space):** Berikan jarak bernapas yang lega antar komponen. UI yang padat terkesan murah; UI yang luas terkesan mewah dan *premium*.

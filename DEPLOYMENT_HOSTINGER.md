# Panduan Deployment ke Hostinger

Dokumen ini menjelaskan cara men-deploy aplikasi **Liva Studio Hub (Project, Social Media & Content Calendar)** ke Hostinger.

---

## 1. Persiapan Kredensial Database MySQL di Hostinger
Aplikasi ini sudah dilengkapi **Auto-Migration Otomatis**. Saat server dinyalakan, backend akan otomatis membuat seluruh tabel:
- `sm_brands`
- `sm_social_accounts`
- `pm_projects`
- `pm_tasks`
- `sm_content_pillars`
- `sm_content_posts`
beserta starter seed data jika tabel masih kosong.

Pastikan variabel environment berikut terisi di file `.env` di server Hostinger:
```env
NODE_ENV=production
PORT=3000

# Database MySQL Hostinger
DB_HOST=localhost # atau IP Remote MySQL Hostinger (misal: 153.92.15.31)
DB_PORT=3306
DB_USER=u287082095_systemuser
DB_PASS=PasswordDatabaseAnda
DB_NAME=u287082095_systemdb

# Keamanan
SESSION_SECRET=masukkan_random_secret_panjang_disini
ALLOWED_ORIGINS=https://domain-anda.com
```

---

## 2. Opsi A: Deploy ke Hostinger VPS (Direkomendasikan)

### Langkah 1: Clone atau Upload File Project
Di terminal VPS:
```bash
git clone git@github.com:livadevice-tech/Liva-Media-Kreatif.git liva-hub
cd liva-hub
```

### Langkah 2: Install Dependensi & Build
```bash
npm install
npm run build
```
Perintah `npm run build` akan:
1. Membangun bundle frontend React ke folder `dist/`
2. Mem-bundle server Express ke `dist/server.cjs`

### Langkah 3: Jalankan dengan PM2
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Langkah 4: Nginx Reverse Proxy (Opsional)
Arahkan domain ke port 3000 di konfigurasi Nginx:
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Opsi B: Deploy ke Hostinger Cloud / Shared (hPanel Node.js Selector)

1. Buka **hPanel Hostinger** ➔ Masuk ke menu **Node.js**.
2. Klik **Create Application**:
   - **Node.js Version**: Pilih versi 20.x atau 22.x
   - **Application Mode**: Production
   - **Application Root**: folder tempat file diunggah (misal: `public_html/app`)
   - **Application Startup File**: `dist/server.cjs`
3. Upload file project (setelah di-build di lokal dengan `npm run build`), pastikan folder `dist/` dan `node_modules/` serta file `.env` terunggah.
4. Klik **Start Application**.
5. Database tabel akan otomatis terbuat saat aplikasi pertama kali menyala!

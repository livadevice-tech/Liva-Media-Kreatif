import { getPool } from "./db";

export async function runProjectAppMigrations() {
  const pool = getPool();
  console.log("🚀 Menjalankan Auto-Migration untuk Project Management, Social Media & Content Calendar...");

  // 1. Brands Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sm_brands (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      logo_url TEXT,
      color VARCHAR(30) DEFAULT '#6366f1',
      tone_of_voice TEXT,
      target_audience TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Social Accounts Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sm_social_accounts (
      id VARCHAR(50) PRIMARY KEY,
      brand_id VARCHAR(50) NOT NULL,
      platform ENUM('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin') NOT NULL,
      handle VARCHAR(100) NOT NULL,
      profile_url TEXT,
      pic_name VARCHAR(100),
      followers_count INT DEFAULT 0,
      monthly_target_posts INT DEFAULT 20,
      status ENUM('active', 'inactive', 'review') DEFAULT 'active',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_brand (brand_id),
      INDEX idx_platform (platform)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Projects Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pm_projects (
      id VARCHAR(50) PRIMARY KEY,
      brand_id VARCHAR(50),
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status ENUM('planning', 'in_progress', 'review', 'completed') DEFAULT 'planning',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      start_date DATE,
      due_date DATE,
      progress INT DEFAULT 0,
      color VARCHAR(30) DEFAULT '#4f46e5',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_brand (brand_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Tasks Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pm_tasks (
      id VARCHAR(50) PRIMARY KEY,
      project_id VARCHAR(50),
      title VARCHAR(250) NOT NULL,
      description TEXT,
      status ENUM('todo', 'in_progress', 'review', 'done') DEFAULT 'todo',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      assignee_name VARCHAR(100),
      due_date DATE,
      tags VARCHAR(255),
      order_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_project (project_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 5. Content Pillars Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sm_content_pillars (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(30) DEFAULT '#8b5cf6',
      description VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 6. Content Posts Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sm_content_posts (
      id VARCHAR(50) PRIMARY KEY,
      brand_id VARCHAR(50),
      social_account_id VARCHAR(50),
      project_id VARCHAR(50),
      title VARCHAR(250) NOT NULL,
      pillar_id VARCHAR(50),
      pillar_name VARCHAR(100),
      platform ENUM('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin') NOT NULL,
      content_type ENUM('feed_single', 'carousel', 'reels', 'story', 'tiktok_video', 'short') NOT NULL,
      hook TEXT,
      caption TEXT,
      hashtags TEXT,
      call_to_action TEXT,
      media_urls JSON,
      scheduled_at DATETIME NOT NULL,
      status ENUM('idea', 'drafting', 'review', 'approved', 'scheduled', 'published') DEFAULT 'idea',
      assignee_copy VARCHAR(100),
      assignee_design VARCHAR(100),
      notes TEXT,
      published_link TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_brand (brand_id),
      INDEX idx_account (social_account_id),
      INDEX idx_scheduled (scheduled_at),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 7. Users / Account Management Table
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_users (
      id VARCHAR(50) PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      position VARCHAR(100) NOT NULL,
      role ENUM('Master Admin', 'Admin', 'Staff') NOT NULL DEFAULT 'Staff',
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_username (username),
      INDEX idx_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Safe column migrations for pm_tasks
  try {
    await pool.execute(`ALTER TABLE pm_tasks ADD COLUMN visibility VARCHAR(20) DEFAULT 'public'`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE pm_tasks ADD COLUMN links TEXT NULL`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE pm_tasks ADD COLUMN subtasks TEXT NULL`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE pm_tasks MODIFY COLUMN assignee_name TEXT NULL`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE pm_tasks MODIFY COLUMN tags TEXT NULL`);
  } catch (e) {}

  // Safe column migration for sm_content_posts
  try {
    await pool.execute(`ALTER TABLE sm_content_posts MODIFY COLUMN assignee_copy TEXT NULL`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE sm_content_posts MODIFY COLUMN assignee_design TEXT NULL`);
  } catch (e) {}
  try {
    await pool.execute(`ALTER TABLE sm_content_posts MODIFY COLUMN scheduled_at DATETIME NULL`);
  } catch (e) {}

  // Safe column migration for pm_projects
  try {
    await pool.execute(`ALTER TABLE pm_projects ADD COLUMN project_type VARCHAR(50) DEFAULT 'Client'`);
  } catch (e) {}

  // Migrate app_users role to 2 roles: Master Admin & Team
  try {
    await pool.execute(`ALTER TABLE app_users MODIFY COLUMN role VARCHAR(50) NOT NULL DEFAULT 'Team'`);
    await pool.execute(`UPDATE app_users SET role = 'Team' WHERE role IN ('Admin', 'Staff')`);
  } catch (e) {}

  // 8. Content Drafts Table (Bank Ide & Referensi yang belum masuk ke kalender)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sm_content_drafts (
      id VARCHAR(50) PRIMARY KEY,
      brand_id VARCHAR(50),
      project_id VARCHAR(50),
      title VARCHAR(250) NOT NULL,
      hook TEXT,
      concept TEXT,
      reference_urls TEXT,
      reference_attachments TEXT,
      platform VARCHAR(50) DEFAULT 'instagram',
      content_type VARCHAR(50) DEFAULT 'reels',
      pillar_id VARCHAR(50),
      pillar_name VARCHAR(100),
      status VARCHAR(50) DEFAULT 'idea',
      scheduled_post_id VARCHAR(50),
      scheduled_at DATETIME,
      notes TEXT,
      tags VARCHAR(255),
      assignee_name VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_brand (brand_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 9. Digital Document Signatures Table (Ttd Berkas Internal & Eksternal)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_signed_documents (
      id VARCHAR(50) PRIMARY KEY,
      title VARCHAR(250) NOT NULL,
      file_url TEXT,
      file_name VARCHAR(250),
      file_source VARCHAR(50) DEFAULT 'asset',
      sign_type VARCHAR(50) DEFAULT 'internal',
      status VARCHAR(50) DEFAULT 'pending',
      signing_token VARCHAR(100) UNIQUE,
      signer_name VARCHAR(150),
      signer_role VARCHAR(100),
      signer_email VARCHAR(150),
      signer_phone VARCHAR(50),
      signer_notes TEXT,
      signature_data_url LONGTEXT,
      signed_file_url TEXT,
      signature_position TEXT,
      signed_at DATETIME,
      created_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_token (signing_token),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Pastikan kolom baru ada di database yang sudah ada sebelumnya
  try {
    await pool.execute(`ALTER TABLE app_signed_documents ADD COLUMN signed_file_url TEXT`);
  } catch (e: any) {
    // Ignore error jika kolom sudah ada
  }
  try {
    await pool.execute(`ALTER TABLE app_signed_documents ADD COLUMN signature_position TEXT`);
  } catch (e: any) {
    // Ignore error jika kolom sudah ada
  }

  // 10. Saved Signatures Table (Simpan Tanda Tangan Internal)
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_saved_signatures (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      signature_data_url LONGTEXT NOT NULL,
      user_id VARCHAR(50),
      created_by VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("✅ Seluruh tabel berhasil diverifikasi/dibuat!");

  // Auto Seeding jika data masih kosong
  await seedInitialData();
  await seedDraftsIfEmpty();
}

async function seedDraftsIfEmpty() {
  const pool = getPool();
  try {
    const [draftRows] = await pool.query<any[]>("SELECT COUNT(*) as count FROM sm_content_drafts");
    const draftCount = (draftRows[0] as any)?.count || 0;
    if (draftCount === 0) {
      await pool.query(`
        INSERT INTO sm_content_drafts 
        (id, brand_id, project_id, title, hook, concept, reference_urls, platform, content_type, pillar_name, status, notes) VALUES
        ('draft-1', 'b-liva', 'proj-rebrand', 'Behind The Scene Setup Studio Live 12 Jam', 'Pernah kepikiran gak gimana ribetnya siapin 12 jam live tanpa jeda?', 'Video transisi sinematik tim setup lighting, audio mixer, dan briefing host sebelum live dimulai.', 'https://www.tiktok.com/@tiktokcreators/video/example1, https://instagram.com/p/reel_agency_example', 'tiktok', 'tiktok_video', 'Entertainment & Tren', 'idea', 'Gunakan audio trending bertempo cepat. Highlight ekspresi antusias tim.'),
        ('draft-2', 'b-wardah', 'proj-99', 'Formula 3 Detik: Cara Mengetahui Skin Barrier Sedang Rusak', 'Jangan coba produk baru kalau kulitmu masih punya 3 tanda ini!', 'Edukasi carousell 6 slide yang menjelaskan tanda skin barrier rusak dan solusinya menggunakan serum ceramide.', 'https://www.instagram.com/reel/example_skincare_tips', 'instagram', 'carousel', 'Edukasi & Tips', 'research', 'Slide 1: Hook tegas. Slide 2-4: Tanda-tanda. Slide 5: Solusi produk. Slide 6: CTA.'),
        ('draft-3', 'b-somethinc', 'proj-viraltrend', 'Blind Test Sunscreen Murah vs Sunscreen Formula Baru', 'Kira-kira orang awam bisa bedain gak mana sunscreen 50rb vs 150rb?', 'Street interview di mall atau coffee shop menguji tekstur, whitecast, dan aroma sunscreen di punggung tangan responden.', 'https://youtube.com/shorts/example_blind_test', 'youtube', 'short', 'Social Proof & Testi', 'ready', 'Talent host: Sarah. Bawa microphone clip-on wireless.')
      `);
      console.log("✅ Starter sample draft ide konten berhasil diisikan!");
    }
  } catch (e) {
    console.warn("Notice seeding drafts:", e);
  }
}

async function seedInitialData() {
  const pool = getPool();

  const [brandRows] = await pool.query<any[]>("SELECT COUNT(*) as count FROM sm_brands");
  const brandCount = (brandRows[0] as any)?.count || 0;

  if (brandCount === 0) {
    console.log("🌱 Database kosong, mengisikan starter seed data otomatis...");

    // 1. Seed Brands
    await pool.query(`
      INSERT INTO sm_brands (id, name, logo_url, color, tone_of_voice, target_audience) VALUES
      ('b-liva', 'Liva Creative Media', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', '#6366f1', 'Trendy, Energik, Profesional & Berwibawa', 'Gen-Z & Milenial, Brand Owner, Content Creator'),
      ('b-wardah', 'Wardah Official', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100', '#0ea5e9', 'Inspiratif, Halal Beauty, Hangat & Edukatif', 'Wanita Muda, Mahasiswi, Muslimah Modern'),
      ('b-somethinc', 'Somethinc Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100', '#a855f7', 'Bold, Sains Skincare Terbukti, Playful', 'Beauty Enthusiast, Skincare Geek')
    `);

    // 2. Seed Content Pillars
    await pool.query(`
      INSERT INTO sm_content_pillars (id, name, color, description) VALUES
      ('pil-edu', 'Edukasi & Tips', '#3b82f6', 'Tutorial, cara penggunaan produk, tips praktis'),
      ('pil-promo', 'Promo & Penjualan', '#ef4444', 'Diskon kilat, voucher, bundling gajian'),
      ('pil-ent', 'Entertainment & Tren', '#ec4899', 'POV, humor relate, tren audio TikTok'),
      ('pil-bts', 'Behind The Scene', '#10b981', 'Proses syuting, keseruan tim di kantor'),
      ('pil-soc', 'Social Proof & Testi', '#f59e0b', 'Review jujur pengguna, testimonial, unboxing')
    `);

    // 3. Seed Social Accounts
    await pool.query(`
      INSERT INTO sm_social_accounts (id, brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status) VALUES
      ('acc-liva-ig', 'b-liva', 'instagram', '@livamedianetwork', 'https://instagram.com/livamedianetwork', 'Galang (Head Creative)', 48200, 30, 'active'),
      ('acc-liva-tt', 'b-liva', 'tiktok', '@livacreative', 'https://tiktok.com/@livacreative', 'Sarah (Social Lead)', 125000, 45, 'active'),
      ('acc-wardah-ig', 'b-wardah', 'instagram', '@wardahbeauty.id', 'https://instagram.com/wardahbeauty', 'Rina (Account Manager)', 840000, 40, 'active'),
      ('acc-somethinc-tt', 'b-somethinc', 'tiktok', '@somethincofficial', 'https://tiktok.com/@somethincofficial', 'Dimas (TikTok Strategist)', 520000, 50, 'active')
    `);

    // 4. Seed Projects
    await pool.query(`
      INSERT INTO pm_projects (id, brand_id, title, description, status, priority, start_date, due_date, progress, color) VALUES
      ('proj-99', 'b-wardah', 'Campaign 9.9 Super Glow Sale', 'Kampanye serentak Instagram & TikTok untuk peluncuran bundle diskon 9.9 serum halal.', 'in_progress', 'urgent', '2026-09-01', '2026-09-15', 65, '#0ea5e9'),
      ('proj-rebrand', 'b-liva', 'Liva Agency Media Kit & Showreel 2026', 'Penyusunan video showreel talent baru dan portofolio agency untuk prospek klien Q4.', 'planning', 'high', '2026-09-05', '2026-09-30', 25, '#6366f1'),
      ('proj-viraltrend', 'b-somethinc', 'TikTok Sunscreen Challenge', 'Aktivasi UGC hashtag challenge bersama 15 micro-influencer beauty TikTok.', 'in_progress', 'medium', '2026-09-03', '2026-09-20', 40, '#a855f7')
    `);

    // 5. Seed Tasks
    await pool.query(`
      INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, order_index) VALUES
      ('task-1', 'proj-99', 'Brief Copywriting 5 Video Reels 9.9', 'Tuliskan hook 3 detik pertama yang menarik perhatian dengan fokus promo diskon.', 'done', 'urgent', 'Nadia (Copywriter)', '2026-09-04', 'Copywriting,Promo', 0),
      ('task-2', 'proj-99', 'Desain 10 Carousel Promo Feed IG', 'Format 4:5 clean typography dengan palet warna brand Wardah.', 'in_progress', 'high', 'Bayu (Graphic Designer)', '2026-09-07', 'Design,Carousel', 1),
      ('task-3', 'proj-99', 'Shooting Video Talent & Editing Reels', 'Take video di Studio A, highlight tekstur serum.', 'todo', 'high', 'Rian (Videographer)', '2026-09-09', 'Video,Reels', 2),
      ('task-4', 'proj-99', 'Final Review & Approval Klien', 'Kirim preview postingan dan caption lengkap ke pihak Brand.', 'review', 'urgent', 'Galang', '2026-09-10', 'Approval,Client', 3),
      ('task-5', 'proj-rebrand', 'Kurasi Best Performance Clips Q1-Q3', 'Kumpulkan rekaman sesi livestream terbaik dan GMV tertinggi.', 'in_progress', 'medium', 'Citra (Analyst)', '2026-09-12', 'Showreel,Research', 0),
      ('task-6', 'proj-viraltrend', 'Outreach 15 Micro Influencer TikTok', 'Kirimkan PR package dan sound guidelines kampanye.', 'todo', 'medium', 'Sarah', '2026-09-14', 'KOL,TikTok', 0)
    `);

    // 6. Seed Content Posts (Calendar)
    const today = new Date();
    const formatDate = (offsetDays: number, hour: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString().slice(0, 19).replace('T', ' ');
    };

    await pool.query(`
      INSERT INTO sm_content_posts (id, brand_id, social_account_id, project_id, title, pillar_name, platform, content_type, hook, caption, hashtags, scheduled_at, status, assignee_copy, assignee_design) VALUES
      ('post-1', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Serum Rahasia Kulit Glowing 9.9', 'Edukasi & Tips', 'instagram', 'carousel', 'Kulit kusam bikin insecure pas hangout? Coba urutan skincare ini!', 'Gak perlu ribet 10 steps skincare, cukup 3 langkah ini buat bikin kulit kamu auto cerah dan kenyal kembali! Swipe sampai habis untuk rahasianya ✨', '#WardahGlow #SkincareRoutine #SerumHalal #BeautyTips', '${formatDate(0, 11)}', 'published', 'Nadia', 'Bayu'),
      ('post-2', 'b-liva', 'acc-liva-tt', 'proj-rebrand', 'POV: Satu Hari di Belakang Layar Agency', 'Entertainment & Tren', 'tiktok', 'tiktok_video', 'Kalian kira kerja di agency itu santai kayak di drakor?', 'Realita vs ekspektasi anak agency pas lagi persiapan live streaming 12 jam non-stop! Ada yang relate? 😂🎥', '#AgencyLife #LivaMedia #BehindTheScenes #WorkLifeBalance #fyp', '${formatDate(1, 19)}', 'scheduled', 'Sarah', 'Rian'),
      ('post-3', 'b-somethinc', 'acc-somethinc-tt', 'proj-viraltrend', 'Uji Ketahanan Sunscreen Bawah UV Camera', 'Social Proof & Testi', 'tiktok', 'tiktok_video', 'Beneran proteksi atau cuma gimmick? Kita tes langsung!', 'Kita buktikan di bawah kamera UV sinar ultraviolet langsung di lapangan! Jangan skip sunscreen kalian ya bestie! ☀️', '#SomethincReview #UVCam #SunscreenPalingNampol #SkincareViral', '${formatDate(2, 14)}', 'approved', 'Nadia', 'Rian'),
      ('post-4', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Countdown 2 Hari Menuju 9.9 Mega Flash Sale', 'Promo & Penjualan', 'instagram', 'reels', 'Jangan checkout sekarang! Tunggu jam 00:00 tanggal 9!', 'Diskon s/d 70% + voucher cashback ekstra eksklusif untuk kalian yang tonton live tanggal 9 nanti! Save postingan ini biar gak ketinggalan!', '#WardahMegaSale #Diskon99 #FlashSaleSkincare', '${formatDate(3, 17)}', 'review', 'Nadia', 'Bayu'),
      ('post-5', 'b-liva', 'acc-liva-ig', 'proj-rebrand', '5 Strategi Live Shopping Menembus 100 Juta Pertama', 'Edukasi & Tips', 'instagram', 'carousel', 'Host udah heboh tapi penonton gak ada yang checkout? Ini salahnya!', 'Kunci live streaming bukan cuma di diskon, tapi di storytelling dan pacing funnel produk. Simak analisa tim Liva Media berikut ini 📈', '#LiveStreamingAgency #TikTokShopTips #ShopeeLive #AgencyTips', '${formatDate(4, 10)}', 'drafting', 'Galang', 'Bayu')
    `);

    // 7. Seed Initial App Users
    const [userRows] = await pool.query<any[]>("SELECT COUNT(*) as count FROM app_users");
    const userCount = (userRows[0] as any)?.count || 0;
    if (userCount === 0) {
      await pool.query(`
        INSERT INTO app_users (id, username, password_hash, full_name, position, role, is_active) VALUES
        ('usr-1', 'admin', 'admin123', 'Galang Taufik', 'Founder & Creative Director', 'Master Admin', 1),
        ('usr-2', 'nazmi', 'nazmi123', 'Nazmi Javier', 'Senior Content Specialist', 'Admin', 1),
        ('usr-3', 'emilia', 'emilia123', 'Emilia Inder', 'Graphic & UI Designer', 'Staff', 1),
        ('usr-4', 'bayu', 'bayu123', 'Bayu Pratama', 'Video Editor & Motion Designer', 'Staff', 1)
      `);
      console.log("✅ Starter user accounts berhasil diisikan!");
    }

    console.log("✅ Starter seed data berhasil diisikan!");
  } else {
    // Check if app_users is empty even if brands exist
    const [userRows] = await pool.query<any[]>("SELECT COUNT(*) as count FROM app_users");
    const userCount = (userRows[0] as any)?.count || 0;
    if (userCount === 0) {
      await pool.query(`
        INSERT INTO app_users (id, username, password_hash, full_name, position, role, is_active) VALUES
        ('usr-1', 'admin', 'admin123', 'Galang Taufik', 'Founder & Creative Director', 'Master Admin', 1),
        ('usr-2', 'nazmi', 'nazmi123', 'Nazmi Javier', 'Senior Content Specialist', 'Admin', 1),
        ('usr-3', 'emilia', 'emilia123', 'Emilia Inder', 'Graphic & UI Designer', 'Staff', 1),
        ('usr-4', 'bayu', 'bayu123', 'Bayu Pratama', 'Video Editor & Motion Designer', 'Staff', 1)
      `);
      console.log("✅ Starter user accounts berhasil diisikan!");
    }
    console.log(`ℹ️ Tabel sudah memiliki data (${brandCount} brand terdaftar).`);
  }
}

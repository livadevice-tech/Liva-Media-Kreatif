-- ==========================================================
-- DATABASE SCHEMA & STARTER DATA: LIVA STUDIO HUB
-- Database: u287082095_projectliva
-- Project Management, Social Media & Content Calendar
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. TABEL BRANDS (Klien / Brand)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sm_brands` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `logo_url` TEXT DEFAULT NULL,
  `color` VARCHAR(30) DEFAULT '#6366f1',
  `tone_of_voice` TEXT DEFAULT NULL,
  `target_audience` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. TABEL CONTENT PILLARS (Pilar Konten)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sm_content_pillars` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `color` VARCHAR(30) DEFAULT '#8b5cf6',
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. TABEL SOCIAL ACCOUNTS (Akun Media Sosial)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sm_social_accounts` (
  `id` VARCHAR(50) NOT NULL,
  `brand_id` VARCHAR(50) NOT NULL,
  `platform` ENUM('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin') NOT NULL,
  `handle` VARCHAR(100) NOT NULL,
  `profile_url` TEXT DEFAULT NULL,
  `pic_name` VARCHAR(100) DEFAULT NULL,
  `followers_count` INT DEFAULT 0,
  `monthly_target_posts` INT DEFAULT 20,
  `status` ENUM('active', 'inactive', 'review') DEFAULT 'active',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_brand` (`brand_id`),
  KEY `idx_platform` (`platform`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. TABEL PROJECTS (Proyek / Kampanye)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pm_projects` (
  `id` VARCHAR(50) NOT NULL,
  `brand_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('planning', 'in_progress', 'review', 'completed') DEFAULT 'planning',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `start_date` DATE DEFAULT NULL,
  `due_date` DATE DEFAULT NULL,
  `progress` INT DEFAULT 0,
  `color` VARCHAR(30) DEFAULT '#4f46e5',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_brand` (`brand_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. TABEL TASKS (Tugas & Kanban Board)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pm_tasks` (
  `id` VARCHAR(50) NOT NULL,
  `project_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(250) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('todo', 'in_progress', 'review', 'done') DEFAULT 'todo',
  `priority` ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  `assignee_name` VARCHAR(100) DEFAULT NULL,
  `due_date` DATE DEFAULT NULL,
  `tags` VARCHAR(255) DEFAULT NULL,
  `order_index` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project` (`project_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. TABEL CONTENT POSTS (Kalender Konten)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sm_content_posts` (
  `id` VARCHAR(50) NOT NULL,
  `brand_id` VARCHAR(50) DEFAULT NULL,
  `social_account_id` VARCHAR(50) DEFAULT NULL,
  `project_id` VARCHAR(50) DEFAULT NULL,
  `title` VARCHAR(250) NOT NULL,
  `pillar_id` VARCHAR(50) DEFAULT NULL,
  `pillar_name` VARCHAR(100) DEFAULT NULL,
  `platform` ENUM('instagram', 'tiktok', 'youtube', 'facebook', 'twitter', 'linkedin') NOT NULL,
  `content_type` ENUM('feed_single', 'carousel', 'reels', 'story', 'tiktok_video', 'short') NOT NULL,
  `hook` TEXT DEFAULT NULL,
  `caption` TEXT DEFAULT NULL,
  `hashtags` TEXT DEFAULT NULL,
  `call_to_action` TEXT DEFAULT NULL,
  `media_urls` JSON DEFAULT NULL,
  `scheduled_at` DATETIME NOT NULL,
  `status` ENUM('idea', 'drafting', 'review', 'approved', 'scheduled', 'published') DEFAULT 'idea',
  `assignee_copy` VARCHAR(100) DEFAULT NULL,
  `assignee_design` VARCHAR(100) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `published_link` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_brand` (`brand_id`),
  KEY `idx_account` (`social_account_id`),
  KEY `idx_scheduled` (`scheduled_at`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- DATA AWAL (STARTER SEED DATA)
-- ==========================================================

-- Seed Brands
INSERT INTO `sm_brands` (`id`, `name`, `logo_url`, `color`, `tone_of_voice`, `target_audience`) VALUES
('b-liva', 'Liva Creative Media', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', '#6366f1', 'Trendy, Energik, Profesional & Berwibawa', 'Gen-Z & Milenial, Brand Owner, Content Creator'),
('b-wardah', 'Wardah Official', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100', '#0ea5e9', 'Inspiratif, Halal Beauty, Hangat & Edukatif', 'Wanita Muda, Mahasiswi, Muslimah Modern'),
('b-somethinc', 'Somethinc Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100', '#a855f7', 'Bold, Sains Skincare Terbukti, Playful', 'Beauty Enthusiast, Skincare Geek')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Content Pillars
INSERT INTO `sm_content_pillars` (`id`, `name`, `color`, `description`) VALUES
('pil-edu', 'Edukasi & Tips', '#3b82f6', 'Tutorial, cara penggunaan produk, tips praktis'),
('pil-promo', 'Promo & Penjualan', '#ef4444', 'Diskon kilat, voucher, bundling gajian'),
('pil-ent', 'Entertainment & Tren', '#ec4899', 'POV, humor relate, tren audio TikTok'),
('pil-bts', 'Behind The Scene', '#10b981', 'Proses syuting, keseruan tim di kantor'),
('pil-soc', 'Social Proof & Testi', '#f59e0b', 'Review jujur pengguna, testimonial, unboxing')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Social Accounts
INSERT INTO `sm_social_accounts` (`id`, `brand_id`, `platform`, `handle`, `profile_url`, `pic_name`, `followers_count`, `monthly_target_posts`, `status`) VALUES
('acc-liva-ig', 'b-liva', 'instagram', '@livamedianetwork', 'https://instagram.com/livamedianetwork', 'Galang (Head Creative)', 48200, 30, 'active'),
('acc-liva-tt', 'b-liva', 'tiktok', '@livacreative', 'https://tiktok.com/@livacreative', 'Sarah (Social Lead)', 125000, 45, 'active'),
('acc-wardah-ig', 'b-wardah', 'instagram', '@wardahbeauty.id', 'https://instagram.com/wardahbeauty', 'Rina (Account Manager)', 840000, 40, 'active'),
('acc-somethinc-tt', 'b-somethinc', 'tiktok', '@somethincofficial', 'https://tiktok.com/@somethincofficial', 'Dimas (TikTok Strategist)', 520000, 50, 'active')
ON DUPLICATE KEY UPDATE `handle` = VALUES(`handle`);

-- Seed Projects
INSERT INTO `pm_projects` (`id`, `brand_id`, `title`, `description`, `status`, `priority`, `start_date`, `due_date`, `progress`, `color`) VALUES
('proj-99', 'b-wardah', 'Campaign 9.9 Super Glow Sale', 'Kampanye serentak Instagram & TikTok untuk peluncuran bundle diskon 9.9 serum halal.', 'in_progress', 'urgent', '2026-09-01', '2026-09-15', 65, '#0ea5e9'),
('proj-rebrand', 'b-liva', 'Liva Agency Media Kit & Showreel 2026', 'Penyusunan video showreel talent baru dan portofolio agency untuk prospek klien Q4.', 'planning', 'high', '2026-09-05', '2026-09-30', 25, '#6366f1'),
('proj-viraltrend', 'b-somethinc', 'TikTok Sunscreen Challenge', 'Aktivasi UGC hashtag challenge bersama 15 micro-influencer beauty TikTok.', 'in_progress', 'medium', '2026-09-03', '2026-09-20', 40, '#a855f7')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Tasks
INSERT INTO `pm_tasks` (`id`, `project_id`, `title`, `description`, `status`, `priority`, `assignee_name`, `due_date`, `tags`, `order_index`) VALUES
('task-1', 'proj-99', 'Brief Copywriting 5 Video Reels 9.9', 'Tuliskan hook 3 detik pertama yang menarik perhatian dengan fokus promo diskon.', 'done', 'urgent', 'Nadia (Copywriter)', '2026-09-04', 'Copywriting,Promo', 0),
('task-2', 'proj-99', 'Desain 10 Carousel Promo Feed IG', 'Format 4:5 clean typography dengan palet warna brand Wardah.', 'in_progress', 'high', 'Bayu (Graphic Designer)', '2026-09-07', 'Design,Carousel', 1),
('task-3', 'proj-99', 'Shooting Video Talent & Editing Reels', 'Take video di Studio A, highlight tekstur serum.', 'todo', 'high', 'Rian (Videographer)', '2026-09-09', 'Video,Reels', 2),
('task-4', 'proj-99', 'Final Review & Approval Klien', 'Kirim preview postingan dan caption lengkap ke pihak Brand.', 'review', 'urgent', 'Galang', '2026-09-10', 'Approval,Client', 3),
('task-5', 'proj-rebrand', 'Kurasi Best Performance Clips Q1-Q3', 'Kumpulkan rekaman sesi livestream terbaik dan GMV tertinggi.', 'in_progress', 'medium', 'Citra (Analyst)', '2026-09-12', 'Showreel,Research', 0),
('task-6', 'proj-viraltrend', 'Outreach 15 Micro Influencer TikTok', 'Kirimkan PR package dan sound guidelines kampanye.', 'todo', 'medium', 'Sarah', '2026-09-14', 'KOL,TikTok', 0)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Content Posts
INSERT INTO `sm_content_posts` (`id`, `brand_id`, `social_account_id`, `project_id`, `title`, `pillar_name`, `platform`, `content_type`, `hook`, `caption`, `hashtags`, `scheduled_at`, `status`, `assignee_copy`, `assignee_design`) VALUES
('post-1', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Serum Rahasia Kulit Glowing 9.9', 'Edukasi & Tips', 'instagram', 'carousel', 'Kulit kusam bikin insecure pas hangout? Coba urutan skincare ini!', 'Gak perlu ribet 10 steps skincare, cukup 3 langkah ini buat bikin kulit kamu auto cerah dan kenyal kembali! Swipe sampai habis untuk rahasianya ✨', '#WardahGlow #SkincareRoutine #SerumHalal #BeautyTips', NOW(), 'published', 'Nadia', 'Bayu'),
('post-2', 'b-liva', 'acc-liva-tt', 'proj-rebrand', 'POV: Satu Hari di Belakang Layar Agency', 'Entertainment & Tren', 'tiktok', 'tiktok_video', 'Kalian kira kerja di agency itu santai kayak di drakor?', 'Realita vs ekspektasi anak agency pas lagi persiapan live streaming 12 jam non-stop! Ada yang relate? 😂🎥', '#AgencyLife #LivaMedia #BehindTheScenes #WorkLifeBalance #fyp', DATE_ADD(NOW(), INTERVAL 1 DAY), 'scheduled', 'Sarah', 'Rian'),
('post-3', 'b-somethinc', 'acc-somethinc-tt', 'proj-viraltrend', 'Uji Ketahanan Sunscreen Bawah UV Camera', 'Social Proof & Testi', 'tiktok', 'tiktok_video', 'Beneran proteksi atau cuma gimmick? Kita tes langsung!', 'Kita buktikan di bawah kamera UV sinar ultraviolet langsung di lapangan! Jangan skip sunscreen kalian ya bestie! ☀️', '#SomethincReview #UVCam #SunscreenPalingNampol #SkincareViral', DATE_ADD(NOW(), INTERVAL 2 DAY), 'approved', 'Nadia', 'Rian'),
('post-4', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Countdown 2 Hari Menuju 9.9 Mega Flash Sale', 'Promo & Penjualan', 'instagram', 'reels', 'Jangan checkout sekarang! Tunggu jam 00:00 tanggal 9!', 'Diskon s/d 70% + voucher cashback ekstra eksklusif untuk kalian yang tonton live tanggal 9 nanti! Save postingan ini biar gak ketinggalan!', '#WardahMegaSale #Diskon99 #FlashSaleSkincare', DATE_ADD(NOW(), INTERVAL 3 DAY), 'review', 'Nadia', 'Bayu'),
('post-5', 'b-liva', 'acc-liva-ig', 'proj-rebrand', '5 Strategi Live Shopping Menembus 100 Juta Pertama', 'Edukasi & Tips', 'instagram', 'carousel', 'Host udah heboh tapi penonton gak ada yang checkout? Ini salahnya!', 'Kunci live streaming bukan cuma di diskon, tapi di storytelling dan pacing funnel produk. Simak analisa tim Liva Media berikut ini 📈', '#LiveStreamingAgency #TikTokShopTips #ShopeeLive #AgencyTips', DATE_ADD(NOW(), INTERVAL 4 DAY), 'drafting', 'Galang', 'Bayu')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

SET FOREIGN_KEY_CHECKS = 1;

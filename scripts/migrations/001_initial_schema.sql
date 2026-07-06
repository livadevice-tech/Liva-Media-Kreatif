-- ==========================================================
-- Liva Media Kreatif - Host Intelligence Platform
-- MySQL Database Schema
-- Migration from: Firebase Firestore
-- Target: database selected by DB_NAME
-- ==========================================================

-- ----------------------------------------------------------
-- 1. HOSTS (HostEmployee)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS hosts (
  id                          VARCHAR(50)     NOT NULL,
  name                        VARCHAR(100)    NOT NULL,
  employee_id                 VARCHAR(50)     NOT NULL,
  avatar                      TEXT,
  role                        VARCHAR(80),
  base_monthly_target_hours   DECIMAL(10,2)   DEFAULT 0,
  base_monthly_target_revenue BIGINT          DEFAULT 0,
  consistency_score           DECIMAL(5,2)      DEFAULT 0,
  joined_date                 DATE,
  email                       VARCHAR(150),
  phone                       VARCHAR(40),
  username                    VARCHAR(100),
  password_hash               VARCHAR(255),
  bank_account                VARCHAR(150),
  bank_name                   VARCHAR(100),
  studio                      VARCHAR(150),
  host_type                   ENUM('Reguler','Backup') DEFAULT 'Reguler',
  custom_working_days_target  INT             DEFAULT NULL,
  custom_base_salary          BIGINT          DEFAULT NULL,
  custom_shift_rate           BIGINT          DEFAULT NULL,
  created_at                  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at                  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. HOST_PLATFORMS (platforms[] array from HostEmployee)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS host_platforms (
  id        INT           AUTO_INCREMENT,
  host_id   VARCHAR(50)   NOT NULL,
  platform  VARCHAR(100)  NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
  INDEX idx_host_id (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. HOST_BRANDS (brands[] array from HostEmployee)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS host_brands (
  id        INT           AUTO_INCREMENT,
  host_id   VARCHAR(50)   NOT NULL,
  brand     VARCHAR(100)  NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
  INDEX idx_host_id (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. ATTENDANCE_LOGS (AttendanceLog)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_logs (
  id                  VARCHAR(100)  NOT NULL,
  host_id             VARCHAR(50)   NOT NULL,
  host_name           VARCHAR(100),
  employee_id         VARCHAR(50),
  date                DATE          NOT NULL,
  shift_hours         VARCHAR(40),
  platform            VARCHAR(100),
  brand_handled       VARCHAR(100),
  live_duration       DECIMAL(6,2)  DEFAULT 0,
  session_count       INT           DEFAULT 0,
  status              ENUM('Present','Late','Absent','Excused') NOT NULL DEFAULT 'Present',
  check_in_time       VARCHAR(20),
  revenue_generated   BIGINT        DEFAULT 0,
  conversion_rate     DECIMAL(8,4)  DEFAULT 0,
  engagement_rate     DECIMAL(8,4)  DEFAULT 0,
  orders              INT           DEFAULT 0,
  avg_view_duration   DECIMAL(8,2)  DEFAULT NULL,
  studio              VARCHAR(150),
  flagged_as_anomaly  TINYINT(1)    DEFAULT 0,
  anomaly_reason      TEXT,
  is_duplicate        TINYINT(1)    DEFAULT 0,
  flagged_as_fraud    TINYINT(1)    DEFAULT 0,
  fraud_reason        TEXT,
  overtime_hours      DECIMAL(6,2)  DEFAULT 0,
  is_backup_shift     TINYINT(1)    DEFAULT 0,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
  INDEX idx_date           (date),
  INDEX idx_host_date      (host_id, date),
  INDEX idx_status         (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. SHIFT_SCHEDULES (ShiftSchedule)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS shift_schedules (
  id          VARCHAR(100)  NOT NULL,
  host_id     VARCHAR(50)   NOT NULL,
  host_name   VARCHAR(100),
  employee_id VARCHAR(50),
  date        DATE          NOT NULL,
  time_slot   VARCHAR(100),
  platform    VARCHAR(100),
  brand       VARCHAR(100),
  status      ENUM('Assigned','Completed','No Show') DEFAULT 'Assigned',
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
  INDEX idx_date     (date),
  INDEX idx_host_id  (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. KPI_ALERTS (KPIAlert)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_alerts (
  id            VARCHAR(100)  NOT NULL,
  host_id       VARCHAR(50)   NOT NULL,
  host_name     VARCHAR(100),
  metric_type   ENUM('Revenue','LiveHours','Engagement','Attendance','Fraud'),
  severity      ENUM('High','Medium','Low'),
  message       TEXT,
  date          DATE,
  current_value VARCHAR(255),
  target_value  VARCHAR(255),
  resolved      TINYINT(1)    DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE,
  INDEX idx_resolved  (resolved),
  INDEX idx_severity  (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. CLIENT_BRANDS (ClientBrand)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_brands (
  id                    VARCHAR(100)  NOT NULL,
  name                  VARCHAR(150)  NOT NULL,
  contract_start_date   DATE,
  contract_end_date     DATE,
  invoice_date          VARCHAR(50),
  monthly_meeting_date  VARCHAR(50),
  client_password       VARCHAR(255),
  client_username       VARCHAR(150),
  pic_name              VARCHAR(150),
  pic_phone             VARCHAR(40),
  pic_email             VARCHAR(150),
  company_address       TEXT,
  logo_url              VARCHAR(255),
  is_active             TINYINT(1)    NOT NULL DEFAULT 1,
  created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. BRAND_SESSIONS (ClientBrand.sessions[])
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_sessions (
  id        VARCHAR(100)  NOT NULL,
  brand_id  VARCHAR(100)  NOT NULL,
  shift     VARCHAR(100),
  platform  VARCHAR(100),
  studio    VARCHAR(150),
  host      VARCHAR(100),
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. BRAND_ACCOUNTS (ClientBrand.accounts[])
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_accounts (
  id        VARCHAR(100)  NOT NULL,
  brand_id  VARCHAR(100)  NOT NULL,
  type      VARCHAR(100),
  username  VARCHAR(150),
  password  TEXT,
  pic_otp   VARCHAR(100),
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. BRAND_INVOICES (BrandInvoice)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_invoices (
  id              VARCHAR(100)  NOT NULL,
  brand_id        VARCHAR(100)  NOT NULL,
  invoice_number  VARCHAR(100),
  issue_date      DATE,
  due_date        DATE,
  status          ENUM('Draft','Open Invoice','Paid','Overdue') DEFAULT 'Draft',
  recipient_name  VARCHAR(150),
  pt_name         VARCHAR(150),
  pic_name        VARCHAR(100),
  pic_phone       VARCHAR(40),
  email           VARCHAR(150),
  address         TEXT,
  total_amount    BIGINT        DEFAULT 0,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id  (brand_id),
  INDEX idx_status    (status),
  INDEX idx_due_date  (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. INVOICE_ITEMS (BrandInvoice.sessionItems[])
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
  id          INT           AUTO_INCREMENT,
  invoice_id  VARCHAR(100)  NOT NULL,
  session_id  VARCHAR(100),
  description TEXT,
  qty         INT           DEFAULT 1,
  cost        BIGINT        DEFAULT 0,
  PRIMARY KEY (id),
  FOREIGN KEY (invoice_id) REFERENCES brand_invoices(id) ON DELETE CASCADE,
  INDEX idx_invoice_id (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 12. BRAND_BERKAS (ClientBrand.berkas[])
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_berkas (
  id        VARCHAR(100)  NOT NULL,
  brand_id  VARCHAR(100)  NOT NULL,
  name      VARCHAR(255),
  type      VARCHAR(100),
  url       TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 13. CLIENT_LEADS (ClientLead)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_leads (
  id                VARCHAR(100)  NOT NULL,
  name              VARCHAR(150)  NOT NULL,
  contact_person    VARCHAR(100),
  contact_number    VARCHAR(40),
  platform_interest VARCHAR(150),
  status            ENUM('New','Contacted','Meeting Scheduled','Proposal Sent','Negotiation','Closed Won','Closed Lost') DEFAULT 'New',
  notes             TEXT,
  created_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 14. ADMIN_ACCOUNTS (AdminAccount)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_accounts (
  id            VARCHAR(100)  NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  username      VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 15. ADMIN_ACCESS_TABS (AdminAccount.accessTabs[])
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_access_tabs (
  id        INT           AUTO_INCREMENT,
  admin_id  VARCHAR(100)  NOT NULL,
  tab_name  VARCHAR(150)  NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (admin_id) REFERENCES admin_accounts(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 16. CLIENT_REPORTING (ClientReporting)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_reporting (
  id          VARCHAR(100)  NOT NULL,
  brand_id    VARCHAR(100),
  platform    VARCHAR(100),
  report_date DATE,
  file_name   VARCHAR(255),
  is_public   TINYINT(1)    DEFAULT 0,
  public_url  TEXT,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE SET NULL,
  INDEX idx_brand_id    (brand_id),
  INDEX idx_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 17. REPORTING_UPLOAD_BATCHES (Reporting Brand Upload History)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reporting_upload_batches (
  id           VARCHAR(100)  NOT NULL,
  brand_id     VARCHAR(100)  DEFAULT NULL,
  brand_name   VARCHAR(255)  NOT NULL,
  platform     VARCHAR(100)  NOT NULL,
  source_kind  VARCHAR(50)   DEFAULT NULL,
  report_type  VARCHAR(50)   DEFAULT NULL,
  file_name    VARCHAR(255)  DEFAULT NULL,
  row_count    INT           NOT NULL DEFAULT 0,
  total_gmv    DECIMAL(18,2) NOT NULL DEFAULT 0,
  uploaded_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE SET NULL,
  INDEX idx_reporting_brand (brand_id),
  INDEX idx_reporting_platform (platform),
  INDEX idx_reporting_source_kind (source_kind),
  INDEX idx_reporting_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 18. REPORTING_UPLOAD_ROWS (Reporting Brand Raw Rows)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reporting_upload_rows (
  id                  VARCHAR(140)  NOT NULL,
  batch_id            VARCHAR(100)   NOT NULL,
  brand_id            VARCHAR(100)   DEFAULT NULL,
  brand_name          VARCHAR(255)   DEFAULT NULL,
  platform            VARCHAR(100)   DEFAULT NULL,
  source_kind         VARCHAR(50)    DEFAULT NULL,
  report_type         VARCHAR(50)    DEFAULT NULL,
  title               VARCHAR(255)   DEFAULT NULL,
  report_date         DATE          DEFAULT NULL,
  report_datetime     DATETIME      DEFAULT NULL,
  shift               VARCHAR(100)  DEFAULT NULL,
  gmv                 DECIMAL(18,2) DEFAULT 0,
  products_sold       DECIMAL(18,2) DEFAULT 0,
  buyers              DECIMAL(18,2) DEFAULT 0,
  aov                 DECIMAL(18,2) DEFAULT 0,
  views               DECIMAL(18,2) DEFAULT 0,
  impressions         DECIMAL(18,2) DEFAULT 0,
  penonton            DECIMAL(18,2) DEFAULT 0,
  live_visits         DECIMAL(18,2) DEFAULT 0,
  product_impressions  DECIMAL(18,2) DEFAULT 0,
  clicks              DECIMAL(18,2) DEFAULT 0,
  orders              DECIMAL(18,2) DEFAULT 0,
  followers           DECIMAL(18,2) DEFAULT 0,
  likes               DECIMAL(18,2) DEFAULT 0,
  shares              DECIMAL(18,2) DEFAULT 0,
  comments            DECIMAL(18,2) DEFAULT 0,
  avg_view_duration   INT           DEFAULT 0,
  peak_viewers        DECIMAL(18,2) DEFAULT 0,
  shop_vouchers       DECIMAL(18,2) DEFAULT 0,
  special_vouchers    DECIMAL(18,2) DEFAULT 0,
  coins_claimed       DECIMAL(18,2) DEFAULT 0,
  has_funnel_in_file  TINYINT(1)     DEFAULT 0,
  raw_payload         JSON          DEFAULT NULL,
  uploaded_at         TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (batch_id) REFERENCES reporting_upload_batches(id) ON DELETE CASCADE,
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE SET NULL,
  INDEX idx_reporting_rows_batch (batch_id),
  INDEX idx_reporting_rows_brand (brand_id),
  INDEX idx_reporting_rows_platform (platform),
  INDEX idx_reporting_rows_source_kind (source_kind),
  INDEX idx_reporting_rows_report_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 19. STUDIO_ITEMS (StudioItem)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS studio_items (
  id        VARCHAR(100)  NOT NULL,
  name      VARCHAR(100)  NOT NULL,
  location  VARCHAR(100),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- END OF SCHEMA
-- Total: 19 tables
-- Run: mysql -u YOUR_USER -p liva_agency_db < schema.sql
-- ----------------------------------------------------------

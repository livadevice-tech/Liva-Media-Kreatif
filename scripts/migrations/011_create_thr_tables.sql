-- ----------------------------------------------------------
-- 011_create_thr_tables.sql
-- Modul THR Management (Periode, Aturan Hitung, dan Rincian Penerima)
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS thr_periods (
  id                  VARCHAR(100)  NOT NULL,
  year                INT           NOT NULL,
  holiday_name        VARCHAR(150)  NOT NULL,
  holiday_date        DATE          NOT NULL,
  payment_status      VARCHAR(50)   NOT NULL DEFAULT 'Draft',
  payment_date        DATE          NULL,
  notes               TEXT          NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_thr_periods_year (year),
  INDEX idx_thr_periods_holiday_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS thr_items (
  id                  VARCHAR(100)  NOT NULL,
  period_id           VARCHAR(100)  NOT NULL,
  employee_type       VARCHAR(20)   NOT NULL DEFAULT 'host',
  employee_id         VARCHAR(100)  NULL,
  employee_code       VARCHAR(50)   NULL,
  name                VARCHAR(150)  NOT NULL,
  role                VARCHAR(100)  NULL,
  department          VARCHAR(100)  NULL,
  joined_date         DATE          NOT NULL,
  tenure_months       INT           NOT NULL DEFAULT 0,
  basic_salary        DECIMAL(18,2) NOT NULL DEFAULT 0,
  fixed_allowance     DECIMAL(18,2) NOT NULL DEFAULT 0,
  thr_base_salary     DECIMAL(18,2) NOT NULL DEFAULT 0,
  calculated_thr      DECIMAL(18,2) NOT NULL DEFAULT 0,
  adjustment_amount   DECIMAL(18,2) NOT NULL DEFAULT 0,
  final_thr           DECIMAL(18,2) NOT NULL DEFAULT 0,
  is_eligible         TINYINT(1)    NOT NULL DEFAULT 1,
  status              VARCHAR(50)   NOT NULL DEFAULT 'Pending',
  bank_name           VARCHAR(100)  NULL,
  bank_account        VARCHAR(100)  NULL,
  notes               TEXT          NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (period_id) REFERENCES thr_periods(id) ON DELETE CASCADE,
  INDEX idx_thr_items_period (period_id),
  INDEX idx_thr_items_employee (employee_id),
  INDEX idx_thr_items_type (employee_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

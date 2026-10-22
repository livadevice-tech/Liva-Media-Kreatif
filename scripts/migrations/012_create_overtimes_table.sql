-- ----------------------------------------------------------
-- 012_create_overtimes_table.sql
-- Modul Lembur (Overtime) per Host dan Cut-Off Periode
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS overtimes (
  id                  VARCHAR(100)  NOT NULL,
  host_id             VARCHAR(100)  NOT NULL,
  host_name           VARCHAR(150)  NOT NULL,
  cutoff_period       VARCHAR(20)   NOT NULL,
  date                DATE          NULL,
  hours               DECIMAL(6,2)  NOT NULL DEFAULT 0,
  amount              DECIMAL(18,2) NOT NULL DEFAULT 0,
  notes               TEXT          NULL,
  created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_overtime_cutoff (cutoff_period),
  INDEX idx_overtime_host (host_id),
  INDEX idx_overtime_cutoff_host (cutoff_period, host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

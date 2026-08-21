CREATE TABLE IF NOT EXISTS brand_performance_analyses (
  id VARCHAR(100) PRIMARY KEY,
  brand_id VARCHAR(100) NOT NULL,
  period_a_start DATE NOT NULL,
  period_a_end DATE NOT NULL,
  period_b_start DATE NOT NULL,
  period_b_end DATE NOT NULL,
  platform VARCHAR(100) DEFAULT 'Semua Platform',
  comparison_metrics JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE CASCADE,
  INDEX idx_brand_id (brand_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

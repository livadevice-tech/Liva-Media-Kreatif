CREATE TABLE IF NOT EXISTS studio_active_shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studio_name VARCHAR(255) NOT NULL,
  shift_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_studio_shift (studio_name, shift_name)
);

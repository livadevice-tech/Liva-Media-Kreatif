-- Migration 015: Deduplicate attendance_logs keeping only 1 record per (host, date, shift, brand, platform)
DELETE t1 FROM attendance_logs t1
INNER JOIN attendance_logs t2 ON t1.id != t2.id
  AND (t1.host_id = t2.host_id OR (t1.host_name IS NOT NULL AND LOWER(TRIM(t1.host_name)) = LOWER(TRIM(t2.host_name))))
  AND t1.date = t2.date
  AND LOWER(TRIM(t1.shift_hours)) = LOWER(TRIM(t2.shift_hours))
  AND LOWER(TRIM(t1.brand_handled)) = LOWER(TRIM(t2.brand_handled))
  AND LOWER(TRIM(t1.platform)) = LOWER(TRIM(t2.platform))
  AND (
    (t1.proof_url IS NULL AND t1.proof_image IS NULL AND (t2.proof_url IS NOT NULL OR t2.proof_image IS NOT NULL))
    OR
    (
      ((t1.proof_url IS NOT NULL OR t1.proof_image IS NOT NULL) = (t2.proof_url IS NOT NULL OR t2.proof_image IS NOT NULL))
      AND (t1.created_at > t2.created_at OR (t1.created_at = t2.created_at AND t1.id > t2.id))
    )
  );

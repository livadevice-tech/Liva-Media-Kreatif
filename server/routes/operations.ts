import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup Multer Storage for Bukti Absensi
const attendanceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'attendance');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'att-' + uniqueSuffix + path.extname(file.originalname || '.jpg'));
  }
});

const uploadAttendance = multer({
  storage: attendanceStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

interface AttendanceLogRow {
  id: string;
  host_id: string;
  host_name?: string | null;
  employee_id?: string | null;
  date?: string | null;
  shift_hours?: string | null;
  platform?: string | null;
  brand_handled?: string | null;
  live_duration?: string | number | null;
  session_count?: number | string | null;
  status?: string | null;
  check_in_time?: string | null;
  revenue_generated?: string | number | null;
  conversion_rate?: string | number | null;
  engagement_rate?: string | number | null;
  orders?: number | string | null;
  avg_view_duration?: string | number | null;
  studio?: string | null;
  flagged_as_anomaly?: number | string | boolean | null;
  anomaly_reason?: string | null;
  is_duplicate?: number | string | boolean | null;
  flagged_as_fraud?: number | string | boolean | null;
  fraud_reason?: string | null;
  overtime_hours?: string | number | null;
  is_backup_shift?: number | string | boolean | null;
  proof_url?: string | null;
  proof_image?: string | null;
}

interface ShiftScheduleRow {
  id: string;
  host_id: string;
  host_name?: string | null;
  employee_id?: string | null;
  date?: string | null;
  time_slot?: string | null;
  platform?: string | null;
  brand?: string | null;
  status?: string | null;
  studio?: string | null;
}

interface KpiAlertRow {
  id: string;
  host_id?: string | null;
  host_name?: string | null;
  metric_type?: string | null;
  severity?: string | null;
  message?: string | null;
  date?: string | null;
  current_value?: string | number | null;
  target_value?: string | number | null;
  resolved?: number | string | boolean | null;
}

function mapAttendanceLog(l: AttendanceLogRow) {
  const toNumber = (value: string | number | null | undefined) =>
    Number(value ?? 0);
  return {
    id: l.id,
    hostId: l.host_id,
    hostName: l.host_name,
    employeeId: l.employee_id,
    date: l.date,
    shiftHours: l.shift_hours,
    platform: l.platform,
    brandHandled: l.brand_handled,
    liveDuration: toNumber(l.live_duration),
    sessionCount: l.session_count,
    status: l.status,
    checkInTime: l.check_in_time,
    revenueGenerated: Math.trunc(toNumber(l.revenue_generated)),
    conversionRate: toNumber(l.conversion_rate),
    engagementRate: toNumber(l.engagement_rate),
    orders: l.orders,
    avgViewDuration:
      l.avg_view_duration !== undefined && l.avg_view_duration !== null
        ? toNumber(l.avg_view_duration)
        : undefined,
    studio: l.studio,
    flaggedAsAnomaly: !!l.flagged_as_anomaly,
    anomalyReason: l.anomaly_reason,
    isDuplicate: !!l.is_duplicate,
    flaggedAsFraud: !!l.flagged_as_fraud,
    fraudReason: l.fraud_reason,
    overtimeHours: toNumber(l.overtime_hours),
    isBackupShift: !!l.is_backup_shift,
    proofUrl: l.proof_url || l.proof_image || undefined,
    proof_url: l.proof_url || l.proof_image || undefined,
    proofImage: l.proof_image || undefined,
    proof_image: l.proof_image || undefined,
  };
}

function mapSchedule(s: ShiftScheduleRow) {
  return {
    id: s.id,
    hostId: s.host_id,
    hostName: s.host_name,
    employeeId: s.employee_id,
    date: s.date,
    timeSlot: s.time_slot,
    platform: s.platform,
    brand: s.brand,
    status: s.status,
    studio: s.studio,
  };
}

function mapAlert(a: KpiAlertRow) {
  return {
    id: a.id,
    hostId: a.host_id,
    hostName: a.host_name,
    metricType: a.metric_type,
    severity: a.severity,
    message: a.message,
    date: a.date,
    currentValue: a.current_value,
    targetValue: a.target_value,
    resolved: !!a.resolved,
  };
}

export function registerOperationsRoutes(app: Express) {
  app.get("/api/logs", asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query as Record<string, string>;
    const hostId = req.auth?.role === "host"
      ? req.auth.subjectId
      : String(req.query.hostId || "");
    let sql = `SELECT * FROM attendance_logs WHERE 1=1`;
    const params: Array<string | number | null | undefined> = [];

    if (hostId) { sql += ` AND host_id = ?`; params.push(hostId); }
    if (dateFrom) { sql += ` AND date >= ?`; params.push(dateFrom); }
    if (dateTo) { sql += ` AND date <= ?`; params.push(dateTo); }

    sql += ` ORDER BY date DESC, host_name ASC`;
    const logs = await queryMany<AttendanceLogRow>(sql, params);
    res.json(logs.map(mapAttendanceLog));
  }));

  // Upload endpoint for attendance proof photo
  app.post("/api/logs/upload-proof", uploadAttendance.single("photo"), asyncHandler(async (req: Request, res: Response) => {
    if (req.file) {
      const proofUrl = `/uploads/attendance/${req.file.filename}`;
      let proofImage: string | undefined;
      try {
        const ext = path.extname(req.file.filename).toLowerCase().replace('.', '') || 'jpeg';
        const mime = ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/jpeg';
        proofImage = `data:${mime};base64,` + fs.readFileSync(req.file.path).toString('base64');
      } catch (err) {
        console.warn('Gagal membaca file foto menjadi base64:', err);
      }
      return res.json({ success: true, proofUrl, proofImage });
    }

    if (req.body && req.body.imageBase64) {
      const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const dir = path.join(process.cwd(), 'uploads', 'attendance');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const filename = `att-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
      fs.writeFileSync(path.join(dir, filename), Buffer.from(base64Data, 'base64'));
      const proofUrl = `/uploads/attendance/${filename}`;
      return res.json({ success: true, proofUrl, proofImage: req.body.imageBase64 });
    }

    return res.status(400).json({ error: "Foto bukti absensi tidak ditemukan." });
  }));

  // Upload or update photo directly for an attendance log
  app.post("/api/logs/:id/photo", uploadAttendance.single("photo"), asyncHandler(async (req: Request, res: Response) => {
    let proofImage: string | undefined;
    let proofUrl: string | undefined;

    if (req.file) {
      proofUrl = `/uploads/attendance/${req.file.filename}`;
      const ext = path.extname(req.file.filename).toLowerCase().replace('.', '') || 'jpeg';
      const mime = ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/jpeg';
      proofImage = `data:${mime};base64,` + fs.readFileSync(req.file.path).toString('base64');
    } else if (req.body && req.body.imageBase64) {
      proofImage = req.body.imageBase64;
      proofUrl = `/uploads/attendance/att-${Date.now()}.jpg`;
    }

    if (!proofImage) {
      return res.status(400).json({ error: "Foto bukti absensi tidak ditemukan." });
    }

    await execute("UPDATE attendance_logs SET proof_image = ?, proof_url = COALESCE(proof_url, ?) WHERE id = ?", [
      proofImage,
      proofUrl || null,
      req.params.id,
    ]);

    res.json({ success: true, proofImage, proofUrl });
  }));

  // Stream or serve proof image for an attendance log
  app.get("/api/logs/:id/proof", asyncHandler(async (req: Request, res: Response) => {
    const row = await queryOne<AttendanceLogRow>("SELECT id, proof_url, proof_image FROM attendance_logs WHERE id = ?", [req.params.id]);
    if (!row) {
      return res.status(404).send("Data absensi tidak ditemukan.");
    }

    if (row.proof_image && row.proof_image.startsWith("data:")) {
      const matches = row.proof_image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        res.setHeader("Content-Type", matches[1]);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(Buffer.from(matches[2], "base64"));
      }
    }

    if (row.proof_url) {
      const clean = row.proof_url.replace(/^\//, '');
      const basename = path.basename(clean);
      const searchDirs = [
        path.join(process.cwd(), clean),
        path.join(process.cwd(), 'uploads', 'attendance', basename),
        path.join(process.cwd(), 'public_html', clean),
        path.join(process.cwd(), '..', clean),
      ];
      for (const p of searchDirs) {
        if (fs.existsSync(p)) {
          return res.sendFile(p);
        }
      }
    }

    return res.status(404).send("File foto bukti absensi tidak ditemukan di server.");
  }));

  app.post("/api/logs", asyncHandler(async (req: Request, res: Response) => {
    const l = req.body;
    if (req.auth?.role === "host" && l.hostId !== req.auth.subjectId) {
      return res.status(403).json({ error: "Host hanya dapat mengisi absensinya sendiri." });
    }
    const id = l.id || genId("log");

    let proofImage = l.proofImage || l.proof_image || (l.proofUrl && l.proofUrl.startsWith('data:') ? l.proofUrl : null) || null;
    if (!proofImage && (l.proofUrl || l.proof_url)) {
      try {
        const u = l.proofUrl || l.proof_url;
        const cleanPath = u.startsWith('/') ? u.slice(1) : u;
        const fullPath = path.join(process.cwd(), cleanPath);
        if (fs.existsSync(fullPath)) {
          const ext = path.extname(fullPath).toLowerCase().replace('.', '') || 'jpeg';
          const mime = ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/jpeg';
          proofImage = `data:${mime};base64,` + fs.readFileSync(fullPath).toString('base64');
        }
      } catch (e) {}
    }

    await execute(`
      INSERT INTO attendance_logs (
        id, host_id, host_name, employee_id, date, shift_hours,
        platform, brand_handled, live_duration, session_count, status,
        check_in_time, revenue_generated, conversion_rate, engagement_rate,
        orders, avg_view_duration, studio, flagged_as_anomaly, anomaly_reason,
        is_duplicate, flagged_as_fraud, fraud_reason, overtime_hours, is_backup_shift,
        proof_url, proof_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, l.hostId, l.hostName || null, l.employeeId || null,
      l.date, l.shiftHours || null, l.platform || null, l.brandHandled || null,
      l.liveDuration || 0, l.sessionCount || 0, l.status || "Present",
      l.checkInTime || null, l.revenueGenerated || 0,
      l.conversionRate || 0, l.engagementRate || 0,
      l.orders || 0, l.avgViewDuration ?? null, l.studio || null,
      l.flaggedAsAnomaly ? 1 : 0, l.anomalyReason || null,
      l.isDuplicate ? 1 : 0, l.flaggedAsFraud ? 1 : 0,
      l.fraudReason || null, l.overtimeHours || 0, l.isBackupShift ? 1 : 0,
      l.proofUrl || l.proof_url || null,
      proofImage || null,
    ]);

    res.status(201).json({ id });
  }));

  app.put("/api/logs/:id", asyncHandler(async (req: Request, res: Response) => {
    const l = req.body;

    let proofImage = l.proofImage || l.proof_image || (l.proofUrl && l.proofUrl.startsWith('data:') ? l.proofUrl : null) || null;
    if (!proofImage && (l.proofUrl || l.proof_url)) {
      try {
        const u = l.proofUrl || l.proof_url;
        const cleanPath = u.startsWith('/') ? u.slice(1) : u;
        const fullPath = path.join(process.cwd(), cleanPath);
        if (fs.existsSync(fullPath)) {
          const ext = path.extname(fullPath).toLowerCase().replace('.', '') || 'jpeg';
          const mime = ext === 'jpg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'image/jpeg';
          proofImage = `data:${mime};base64,` + fs.readFileSync(fullPath).toString('base64');
        }
      } catch (e) {}
    }

    await execute(`
      UPDATE attendance_logs SET
        host_id = ?, host_name = ?, employee_id = ?, date = ?,
        shift_hours = ?, platform = ?, brand_handled = ?,
        live_duration = ?, session_count = ?, status = ?,
        check_in_time = ?, revenue_generated = ?, conversion_rate = ?,
        engagement_rate = ?, orders = ?, avg_view_duration = ?,
        studio = ?, flagged_as_anomaly = ?, anomaly_reason = ?,
        is_duplicate = ?, flagged_as_fraud = ?, fraud_reason = ?,
        overtime_hours = ?, is_backup_shift = ?, proof_url = ?,
        proof_image = COALESCE(?, proof_image)
      WHERE id = ?
    `, [
      l.hostId, l.hostName || null, l.employeeId || null, l.date,
      l.shiftHours || null, l.platform || null, l.brandHandled || null,
      l.liveDuration || 0, l.sessionCount || 0, l.status || "Present",
      l.checkInTime || null, l.revenueGenerated || 0,
      l.conversionRate || 0, l.engagementRate || 0,
      l.orders || 0, l.avgViewDuration ?? null, l.studio || null,
      l.flaggedAsAnomaly ? 1 : 0, l.anomalyReason || null,
      l.isDuplicate ? 1 : 0, l.flaggedAsFraud ? 1 : 0,
      l.fraudReason || null, l.overtimeHours || 0, l.isBackupShift ? 1 : 0,
      l.proofUrl || l.proof_url || null,
      proofImage || null,
      req.params.id,
    ]);
    res.json({ success: true });
  }));

  app.delete("/api/logs/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM attendance_logs WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.post("/api/logs/delete-many", asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: true, deleted: 0 });
    const placeholders = ids.map(() => "?").join(", ");
    const result = await execute(`DELETE FROM attendance_logs WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: result.affectedRows });
  }));

  app.get("/api/schedules", asyncHandler(async (req: Request, res: Response) => {
    const { date } = req.query as Record<string, string>;
    let sql = `SELECT * FROM shift_schedules WHERE 1=1`;
    const params: Array<string | number | null | undefined> = [];
    if (date) { sql += ` AND date = ?`; params.push(date); }
    if (req.auth?.role === "host") {
      sql += ` AND host_id = ?`;
      params.push(req.auth.subjectId);
    } else if (req.auth?.role === "brand") {
      const brand = await queryOne(`SELECT name FROM client_brands WHERE id = ?`, [req.auth.subjectId]);
      sql += ` AND brand = ?`;
      params.push(brand?.name || "__missing_brand__");
    } else if (req.query.hostId) {
      sql += ` AND host_id = ?`;
      params.push(String(req.query.hostId));
    } else if (req.query.brandId) {
      const brand = await queryOne(`SELECT name FROM client_brands WHERE id = ?`, [String(req.query.brandId)]);
      sql += ` AND brand = ?`;
      params.push(brand?.name || "__missing_brand__");
    }
    sql += ` ORDER BY date ASC, time_slot ASC`;

    const rows = await queryMany<ShiftScheduleRow>(sql, params);
    res.json(rows.map(mapSchedule));
  }));

  app.post("/api/schedules", asyncHandler(async (req: Request, res: Response) => {
    const s = req.body;
    const id = s.id || genId("sched");
    await execute(`
      INSERT INTO shift_schedules (id, host_id, host_name, employee_id, date, time_slot, platform, brand, status, studio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, s.hostId, s.hostName || null, s.employeeId || null, s.date, s.timeSlot || null, s.platform || null, s.brand || null, s.status || "Assigned", s.studio || null]);
    res.status(201).json({ id });
  }));

  app.put("/api/schedules/:id", asyncHandler(async (req: Request, res: Response) => {
    const s = req.body;
    await execute(`
      UPDATE shift_schedules SET host_id=?, host_name=?, employee_id=?, date=?, time_slot=?, platform=?, brand=?, status=?, studio=?
      WHERE id=?
    `, [s.hostId, s.hostName||null, s.employeeId||null, s.date, s.timeSlot||null, s.platform||null, s.brand||null, s.status||"Assigned", s.studio||null, req.params.id]);
    res.json({ success: true });
  }));

  app.delete("/api/schedules/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM shift_schedules WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/alerts", asyncHandler(async (req: Request, res: Response) => {
    const { resolved } = req.query as Record<string, string>;
    let sql = `SELECT * FROM kpi_alerts WHERE 1=1`;
    const params: Array<string | number | null | undefined> = [];
    if (resolved !== undefined) { sql += ` AND resolved = ?`; params.push(resolved === "1" ? 1 : 0); }
    sql += ` ORDER BY date DESC`;

    const rows = await queryMany<KpiAlertRow>(sql, params);
    res.json(rows.map(mapAlert));
  }));

  app.post("/api/alerts", asyncHandler(async (req: Request, res: Response) => {
    const a = req.body;
    const id = a.id || genId("alert");
    await execute(`
      INSERT INTO kpi_alerts (id, host_id, host_name, metric_type, severity, message, date, current_value, target_value, resolved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, a.hostId, a.hostName||null, a.metricType||null, a.severity||null, a.message||null, a.date||null, String(a.currentValue??""), String(a.targetValue??""), a.resolved ? 1 : 0]);
    res.status(201).json({ id });
  }));

  app.put("/api/alerts/:id", asyncHandler(async (req: Request, res: Response) => {
    const a = req.body;
    await execute(`
      UPDATE kpi_alerts SET host_id=?, host_name=?, metric_type=?, severity=?, message=?, date=?, current_value=?, target_value=?, resolved=?
      WHERE id=?
    `, [a.hostId, a.hostName||null, a.metricType||null, a.severity||null, a.message||null, a.date||null, String(a.currentValue??""), String(a.targetValue??""), a.resolved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  }));

  app.delete("/api/alerts/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM kpi_alerts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/studio-shifts", asyncHandler(async (req: Request, res: Response) => {
    const rows = await queryMany(`SELECT id, studio_name, shift_name FROM studio_active_shifts`);
    res.json(rows.map((r: any) => ({ id: r.id, studio: r.studio_name, shift: r.shift_name })));
  }));

  app.post("/api/studio-shifts", asyncHandler(async (req: Request, res: Response) => {
    const { studio, shift } = req.body;
    if (!studio || !shift) return res.status(400).json({ error: "Missing studio or shift" });
    await execute(`
      INSERT INTO studio_active_shifts (studio_name, shift_name) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE studio_name=studio_name
    `, [studio, shift]);
    res.status(201).json({ success: true });
  }));

  app.post("/api/studio-shifts/delete", asyncHandler(async (req: Request, res: Response) => {
    const { studio, shift } = req.body;
    if (!studio || !shift) return res.status(400).json({ error: "Missing studio or shift" });
    await execute(`DELETE FROM studio_active_shifts WHERE studio_name = ? AND shift_name = ?`, [studio, shift]);
    res.json({ success: true });
  }));
}


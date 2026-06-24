import nodemailer from 'nodemailer';
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

app.use(express.json({ limit: '10mb' }));

// ==================================================================
// MySQL Connection Pool
// ==================================================================
let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;

    if (!host || !user || !database) {
      throw new Error("Konfigurasi database MySQL belum lengkap. Cek DB_HOST, DB_USER, DB_PASS, DB_NAME di .env");
    }

    pool = mysql.createPool({
      host,
      port: parseInt(process.env.DB_PORT || '3306'),
      user,
      password: password || '',
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+07:00',
    });

    console.log(`✅ MySQL pool terhubung ke ${host}/${database}`);
  }
  return pool;
}

// ==================================================================
// Helpers
// ==================================================================

// Safe error message untuk production
function getSafeErrorMessage(error: any): string {
  if (process.env.NODE_ENV !== "production") {
    return error?.message || "Unknown error";
  }
  return "Internal Server Error";
}

// Wrapper async untuk route handler
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

// Generate ID baru jika tidak diberikan
function genId(prefix: string = 'id'): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
}

// Helper: query satu row
async function queryOne(sql: string, params: any[]): Promise<any | null> {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  const arr = rows as any[];
  return arr.length > 0 ? arr[0] : null;
}

// Helper: query banyak rows
async function queryMany(sql: string, params: any[] = []): Promise<any[]> {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  return rows as any[];
}

// Helper: execute (INSERT/UPDATE/DELETE)
async function execute(sql: string, params: any[]): Promise<mysql.ResultSetHeader> {
  const db = getPool();
  const [result] = await db.execute(sql, params);
  return result as mysql.ResultSetHeader;
}

// ==================================================================
// Lazy-initialized Gemini Client
// ==================================================================
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiInstance = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiInstance;
}

// ==================================================================
// HEALTH CHECK
// ==================================================================
app.get("/api/health", asyncHandler(async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await queryOne('SELECT 1', []);
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }
  res.json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}));

// ==================================================================
// HOSTS ENDPOINTS
// ==================================================================

// GET /api/hosts — ambil semua host dengan platforms & brands
app.get("/api/hosts", asyncHandler(async (req, res) => {
  const hosts = await queryMany(`SELECT * FROM hosts ORDER BY name ASC`);

  // Attach platforms & brands untuk setiap host
  for (const host of hosts) {
    const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
    const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
    host.platforms = platforms.map((p: any) => p.platform);
    host.brands = brands.map((b: any) => b.brand);
    // Map snake_case → camelCase
    host.employeeId = host.employee_id;
    host.baseMonthlyTargetHours = host.base_monthly_target_hours;
    host.baseMonthlyTargetRevenue = host.base_monthly_target_revenue;
    host.consistencyScore = host.consistency_score;
    host.joinedDate = host.joined_date;
    host.bankAccount = host.bank_account;
    host.hostType = host.host_type;
    host.customWorkingDaysTarget = host.custom_working_days_target;
    host.customBaseSalary = host.custom_base_salary;
    host.customShiftRate = host.custom_shift_rate;
  }

  res.json(hosts);
}));

// GET /api/hosts/:id
app.get("/api/hosts/:id", asyncHandler(async (req, res) => {
  const host = await queryOne(`SELECT * FROM hosts WHERE id = ?`, [req.params.id]);
  if (!host) return res.status(404).json({ error: 'Host tidak ditemukan' });

  const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
  const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
  host.platforms = platforms.map((p: any) => p.platform);
  host.brands = brands.map((b: any) => b.brand);

  res.json(host);
}));

// POST /api/hosts — buat host baru
app.post("/api/hosts", asyncHandler(async (req, res) => {
  const h = req.body;
  const id = h.id || genId('host');

  await execute(`
    INSERT INTO hosts (
      id, name, employee_id, avatar, role,
      base_monthly_target_hours, base_monthly_target_revenue,
      consistency_score, joined_date, email, phone,
      username, password_hash, bank_account, studio,
      host_type, custom_working_days_target, custom_base_salary, custom_shift_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, h.name, h.employeeId, h.avatar || null, h.role || null,
    h.baseMonthlyTargetHours || 0, h.baseMonthlyTargetRevenue || 0,
    h.consistencyScore || 0, h.joinedDate || null,
    h.email || null, h.phone || null,
    h.username || null, h.password || null,
    h.bankAccount || null, h.studio || null,
    h.hostType || 'Reguler',
    h.customWorkingDaysTarget ?? null,
    h.customBaseSalary ?? null,
    h.customShiftRate ?? null,
  ]);

  // Insert platforms
  if (Array.isArray(h.platforms)) {
    for (const platform of h.platforms) {
      await execute(`INSERT INTO host_platforms (host_id, platform) VALUES (?, ?)`, [id, platform]);
    }
  }

  // Insert brands
  if (Array.isArray(h.brands)) {
    for (const brand of h.brands) {
      await execute(`INSERT INTO host_brands (host_id, brand) VALUES (?, ?)`, [id, brand]);
    }
  }

  res.status(201).json({ id });
}));

// PUT /api/hosts/:id — update host
app.put("/api/hosts/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  const h = req.body;

  await execute(`
    UPDATE hosts SET
      name = ?, employee_id = ?, avatar = ?, role = ?,
      base_monthly_target_hours = ?, base_monthly_target_revenue = ?,
      consistency_score = ?, joined_date = ?, email = ?, phone = ?,
      username = ?, bank_account = ?, studio = ?,
      host_type = ?, custom_working_days_target = ?,
      custom_base_salary = ?, custom_shift_rate = ?
    WHERE id = ?
  `, [
    h.name, h.employeeId, h.avatar || null, h.role || null,
    h.baseMonthlyTargetHours || 0, h.baseMonthlyTargetRevenue || 0,
    h.consistencyScore || 0, h.joinedDate || null,
    h.email || null, h.phone || null,
    h.username || null, h.bankAccount || null, h.studio || null,
    h.hostType || 'Reguler',
    h.customWorkingDaysTarget ?? null,
    h.customBaseSalary ?? null,
    h.customShiftRate ?? null,
    id,
  ]);

  // Re-sync platforms
  if (Array.isArray(h.platforms)) {
    await execute(`DELETE FROM host_platforms WHERE host_id = ?`, [id]);
    for (const platform of h.platforms) {
      await execute(`INSERT INTO host_platforms (host_id, platform) VALUES (?, ?)`, [id, platform]);
    }
  }

  // Re-sync brands
  if (Array.isArray(h.brands)) {
    await execute(`DELETE FROM host_brands WHERE host_id = ?`, [id]);
    for (const brand of h.brands) {
      await execute(`INSERT INTO host_brands (host_id, brand) VALUES (?, ?)`, [id, brand]);
    }
  }

  res.json({ success: true });
}));

// DELETE /api/hosts/:id
app.delete("/api/hosts/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM hosts WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// ATTENDANCE LOGS ENDPOINTS
// ==================================================================

// GET /api/logs
app.get("/api/logs", asyncHandler(async (req, res) => {
  const { hostId, dateFrom, dateTo } = req.query as Record<string, string>;
  let sql = `SELECT * FROM attendance_logs WHERE 1=1`;
  const params: any[] = [];

  if (hostId)   { sql += ` AND host_id = ?`;  params.push(hostId); }
  if (dateFrom) { sql += ` AND date >= ?`;     params.push(dateFrom); }
  if (dateTo)   { sql += ` AND date <= ?`;     params.push(dateTo); }

  sql += ` ORDER BY date DESC, host_name ASC`;

  const logs = await queryMany(sql, params);

  // camelCase mapping
  const mapped = logs.map((l: any) => ({
    id: l.id,
    hostId: l.host_id,
    hostName: l.host_name,
    employeeId: l.employee_id,
    date: l.date,
    shiftHours: l.shift_hours,
    platform: l.platform,
    brandHandled: l.brand_handled,
    liveDuration: parseFloat(l.live_duration),
    sessionCount: l.session_count,
    status: l.status,
    checkInTime: l.check_in_time,
    revenueGenerated: parseInt(l.revenue_generated),
    conversionRate: parseFloat(l.conversion_rate),
    engagementRate: parseFloat(l.engagement_rate),
    orders: l.orders,
    avgViewDuration: l.avg_view_duration ? parseFloat(l.avg_view_duration) : undefined,
    studio: l.studio,
    flaggedAsAnomaly: !!l.flagged_as_anomaly,
    anomalyReason: l.anomaly_reason,
    isDuplicate: !!l.is_duplicate,
    flaggedAsFraud: !!l.flagged_as_fraud,
    fraudReason: l.fraud_reason,
    overtimeHours: parseFloat(l.overtime_hours) || 0,
    isBackupShift: !!l.is_backup_shift,
  }));

  res.json(mapped);
}));

// POST /api/logs
app.post("/api/logs", asyncHandler(async (req, res) => {
  const l = req.body;
  const id = l.id || genId('log');

  await execute(`
    INSERT INTO attendance_logs (
      id, host_id, host_name, employee_id, date, shift_hours,
      platform, brand_handled, live_duration, session_count, status,
      check_in_time, revenue_generated, conversion_rate, engagement_rate,
      orders, avg_view_duration, studio, flagged_as_anomaly, anomaly_reason,
      is_duplicate, flagged_as_fraud, fraud_reason, overtime_hours, is_backup_shift
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, l.hostId, l.hostName || null, l.employeeId || null,
    l.date, l.shiftHours || null, l.platform || null, l.brandHandled || null,
    l.liveDuration || 0, l.sessionCount || 0, l.status || 'Present',
    l.checkInTime || null, l.revenueGenerated || 0,
    l.conversionRate || 0, l.engagementRate || 0,
    l.orders || 0, l.avgViewDuration ?? null, l.studio || null,
    l.flaggedAsAnomaly ? 1 : 0, l.anomalyReason || null,
    l.isDuplicate ? 1 : 0, l.flaggedAsFraud ? 1 : 0,
    l.fraudReason || null, l.overtimeHours || 0, l.isBackupShift ? 1 : 0,
  ]);

  res.status(201).json({ id });
}));

// PUT /api/logs/:id
app.put("/api/logs/:id", asyncHandler(async (req, res) => {
  const l = req.body;
  await execute(`
    UPDATE attendance_logs SET
      host_id = ?, host_name = ?, employee_id = ?, date = ?,
      shift_hours = ?, platform = ?, brand_handled = ?,
      live_duration = ?, session_count = ?, status = ?,
      check_in_time = ?, revenue_generated = ?, conversion_rate = ?,
      engagement_rate = ?, orders = ?, avg_view_duration = ?,
      studio = ?, flagged_as_anomaly = ?, anomaly_reason = ?,
      is_duplicate = ?, flagged_as_fraud = ?, fraud_reason = ?,
      overtime_hours = ?, is_backup_shift = ?
    WHERE id = ?
  `, [
    l.hostId, l.hostName || null, l.employeeId || null, l.date,
    l.shiftHours || null, l.platform || null, l.brandHandled || null,
    l.liveDuration || 0, l.sessionCount || 0, l.status || 'Present',
    l.checkInTime || null, l.revenueGenerated || 0,
    l.conversionRate || 0, l.engagementRate || 0,
    l.orders || 0, l.avgViewDuration ?? null, l.studio || null,
    l.flaggedAsAnomaly ? 1 : 0, l.anomalyReason || null,
    l.isDuplicate ? 1 : 0, l.flaggedAsFraud ? 1 : 0,
    l.fraudReason || null, l.overtimeHours || 0, l.isBackupShift ? 1 : 0,
    req.params.id,
  ]);
  res.json({ success: true });
}));

// DELETE /api/logs/:id
app.delete("/api/logs/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM attendance_logs WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// POST /api/logs/delete-many
app.post("/api/logs/delete-many", asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: true, deleted: 0 });
  const placeholders = ids.map(() => '?').join(', ');
  const result = await execute(`DELETE FROM attendance_logs WHERE id IN (${placeholders})`, ids);
  res.json({ success: true, deleted: result.affectedRows });
}));

// ==================================================================
// SHIFT SCHEDULES ENDPOINTS
// ==================================================================

app.get("/api/schedules", asyncHandler(async (req, res) => {
  const { date } = req.query as Record<string, string>;
  let sql = `SELECT * FROM shift_schedules WHERE 1=1`;
  const params: any[] = [];
  if (date) { sql += ` AND date = ?`; params.push(date); }
  sql += ` ORDER BY date ASC, time_slot ASC`;

  const rows = await queryMany(sql, params);
  const mapped = rows.map((s: any) => ({
    id: s.id, hostId: s.host_id, hostName: s.host_name,
    employeeId: s.employee_id, date: s.date, timeSlot: s.time_slot,
    platform: s.platform, brand: s.brand, status: s.status,
  }));
  res.json(mapped);
}));

app.post("/api/schedules", asyncHandler(async (req, res) => {
  const s = req.body;
  const id = s.id || genId('sched');
  await execute(`
    INSERT INTO shift_schedules (id, host_id, host_name, employee_id, date, time_slot, platform, brand, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, s.hostId, s.hostName || null, s.employeeId || null, s.date, s.timeSlot || null, s.platform || null, s.brand || null, s.status || 'Assigned']);
  res.status(201).json({ id });
}));

app.put("/api/schedules/:id", asyncHandler(async (req, res) => {
  const s = req.body;
  await execute(`
    UPDATE shift_schedules SET host_id=?, host_name=?, employee_id=?, date=?, time_slot=?, platform=?, brand=?, status=?
    WHERE id=?
  `, [s.hostId, s.hostName||null, s.employeeId||null, s.date, s.timeSlot||null, s.platform||null, s.brand||null, s.status||'Assigned', req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/schedules/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM shift_schedules WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// KPI ALERTS ENDPOINTS
// ==================================================================

app.get("/api/alerts", asyncHandler(async (req, res) => {
  const { resolved } = req.query as Record<string, string>;
  let sql = `SELECT * FROM kpi_alerts WHERE 1=1`;
  const params: any[] = [];
  if (resolved !== undefined) { sql += ` AND resolved = ?`; params.push(resolved === '1' ? 1 : 0); }
  sql += ` ORDER BY date DESC`;

  const rows = await queryMany(sql, params);
  const mapped = rows.map((a: any) => ({
    id: a.id, hostId: a.host_id, hostName: a.host_name,
    metricType: a.metric_type, severity: a.severity, message: a.message,
    date: a.date, currentValue: a.current_value, targetValue: a.target_value,
    resolved: !!a.resolved,
  }));
  res.json(mapped);
}));

app.post("/api/alerts", asyncHandler(async (req, res) => {
  const a = req.body;
  const id = a.id || genId('alert');
  await execute(`
    INSERT INTO kpi_alerts (id, host_id, host_name, metric_type, severity, message, date, current_value, target_value, resolved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, a.hostId, a.hostName||null, a.metricType||null, a.severity||null, a.message||null, a.date||null, String(a.currentValue??''), String(a.targetValue??''), a.resolved?1:0]);
  res.status(201).json({ id });
}));

app.put("/api/alerts/:id", asyncHandler(async (req, res) => {
  const a = req.body;
  await execute(`
    UPDATE kpi_alerts SET host_id=?, host_name=?, metric_type=?, severity=?, message=?, date=?, current_value=?, target_value=?, resolved=?
    WHERE id=?
  `, [a.hostId, a.hostName||null, a.metricType||null, a.severity||null, a.message||null, a.date||null, String(a.currentValue??''), String(a.targetValue??''), a.resolved?1:0, req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/alerts/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM kpi_alerts WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// CLIENT BRANDS ENDPOINTS
// ==================================================================

async function buildBrand(brand: any) {
  const sessions  = await queryMany(`SELECT * FROM brand_sessions WHERE brand_id = ?`, [brand.id]);
  const accounts  = await queryMany(`SELECT * FROM brand_accounts WHERE brand_id = ?`, [brand.id]);
  const invoices  = await queryMany(`SELECT * FROM brand_invoices WHERE brand_id = ? ORDER BY issue_date DESC`, [brand.id]);
  const berkas    = await queryMany(`SELECT * FROM brand_berkas WHERE brand_id = ?`, [brand.id]);

  for (const inv of invoices) {
    inv.sessionItems = await queryMany(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
    inv.invoiceNumber = inv.invoice_number;
    inv.issueDate = inv.issue_date;
    inv.dueDate = inv.due_date;
    inv.recipientName = inv.recipient_name;
    inv.ptName = inv.pt_name;
    inv.picName = inv.pic_name;
    inv.picPhone = inv.pic_phone;
    inv.totalAmount = parseInt(inv.total_amount);
  }

  return {
    id: brand.id, name: brand.name,
    contractStartDate: brand.contract_start_date,
    contractEndDate: brand.contract_end_date,
    invoiceDate: brand.invoice_date,
    monthlyMeetingDate: brand.monthly_meeting_date,
    clientPassword: brand.client_password,
    clientUsername: brand.client_username,
    picName: brand.pic_name, picPhone: brand.pic_phone,
    picEmail: brand.pic_email, companyAddress: brand.company_address,
    sessions: sessions.map((s: any) => ({ id: s.id, shift: s.shift, platform: s.platform, studio: s.studio, host: s.host })),
    accounts: accounts.map((a: any) => ({ id: a.id, type: a.type, username: a.username, password: a.password, picOtp: a.pic_otp })),
    invoices, berkas,
  };
}

app.get("/api/client-brands", asyncHandler(async (req, res) => {
  const brands = await queryMany(`SELECT * FROM client_brands ORDER BY name ASC`);
  const result = await Promise.all(brands.map(buildBrand));
  res.json(result);
}));

app.get("/api/client-brands/:id", asyncHandler(async (req, res) => {
  const brand = await queryOne(`SELECT * FROM client_brands WHERE id = ?`, [req.params.id]);
  if (!brand) return res.status(404).json({ error: 'Brand tidak ditemukan' });
  res.json(await buildBrand(brand));
}));

app.post("/api/client-brands", asyncHandler(async (req, res) => {
  const b = req.body;
  const id = b.id || genId('brand');

  await execute(`
    INSERT INTO client_brands (id, name, contract_start_date, contract_end_date, invoice_date, monthly_meeting_date, client_password, client_username, pic_name, pic_phone, pic_email, company_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, b.name, b.contractStartDate||null, b.contractEndDate||null, b.invoiceDate||null, b.monthlyMeetingDate||null, b.clientPassword||null, b.clientUsername||null, b.picName||null, b.picPhone||null, b.picEmail||null, b.companyAddress||null]);

  // sessions
  if (Array.isArray(b.sessions)) {
    for (const s of b.sessions) {
      if (!s.id) continue;
      await execute(`INSERT INTO brand_sessions (id, brand_id, shift, platform, studio, host) VALUES (?,?,?,?,?,?)`, [s.id, id, s.shift||null, s.platform||null, s.studio||null, s.host||null]);
    }
  }
  // accounts
  if (Array.isArray(b.accounts)) {
    for (const a of b.accounts) {
      if (!a.id) continue;
      await execute(`INSERT INTO brand_accounts (id, brand_id, type, username, password, pic_otp) VALUES (?,?,?,?,?,?)`, [a.id, id, a.type||null, a.username||null, a.password||null, a.picOtp||null]);
    }
  }
  // invoices
  if (Array.isArray(b.invoices)) {
    for (const inv of b.invoices) {
      if (!inv.id) continue;
      await execute(`
        INSERT INTO brand_invoices (id, brand_id, invoice_number, issue_date, due_date, status, recipient_name, pt_name, pic_name, pic_phone, email, address, total_amount)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `, [inv.id, id, inv.invoiceNumber||null, inv.issueDate||null, inv.dueDate||null, inv.status||'Draft', inv.recipientName||null, inv.ptName||null, inv.picName||null, inv.picPhone||null, inv.email||null, inv.address||null, inv.totalAmount||0]);
      if (Array.isArray(inv.sessionItems)) {
        for (const item of inv.sessionItems) {
          await execute(`INSERT INTO invoice_items (invoice_id, session_id, description, qty, cost) VALUES (?,?,?,?,?)`, [inv.id, item.sessionId||null, item.description||null, item.qty||1, item.cost||0]);
        }
      }
    }
  }
  // berkas
  if (Array.isArray(b.berkas)) {
    for (const f of b.berkas) {
      if (!f.id) continue;
      await execute(`INSERT INTO brand_berkas (id, brand_id, name, type, url) VALUES (?,?,?,?,?)`, [f.id, id, f.name||null, f.type||null, f.url||null]);
    }
  }

  res.status(201).json({ id });
}));

app.put("/api/client-brands/:id", asyncHandler(async (req, res) => {
  const id = req.params.id;
  const b = req.body;

  await execute(`
    UPDATE client_brands SET name=?, contract_start_date=?, contract_end_date=?, invoice_date=?, monthly_meeting_date=?, client_password=?, client_username=?, pic_name=?, pic_phone=?, pic_email=?, company_address=?
    WHERE id=?
  `, [b.name, b.contractStartDate||null, b.contractEndDate||null, b.invoiceDate||null, b.monthlyMeetingDate||null, b.clientPassword||null, b.clientUsername||null, b.picName||null, b.picPhone||null, b.picEmail||null, b.companyAddress||null, id]);

  // Re-sync relational data
  if (Array.isArray(b.sessions)) {
    await execute(`DELETE FROM brand_sessions WHERE brand_id = ?`, [id]);
    for (const s of b.sessions) {
      if (!s.id) continue;
      await execute(`INSERT INTO brand_sessions (id, brand_id, shift, platform, studio, host) VALUES (?,?,?,?,?,?)`, [s.id, id, s.shift||null, s.platform||null, s.studio||null, s.host||null]);
    }
  }
  if (Array.isArray(b.accounts)) {
    await execute(`DELETE FROM brand_accounts WHERE brand_id = ?`, [id]);
    for (const a of b.accounts) {
      if (!a.id) continue;
      await execute(`INSERT INTO brand_accounts (id, brand_id, type, username, password, pic_otp) VALUES (?,?,?,?,?,?)`, [a.id, id, a.type||null, a.username||null, a.password||null, a.picOtp||null]);
    }
  }
  if (Array.isArray(b.invoices)) {
    // Hapus invoice items dulu (FK constraint)
    const oldInvIds = await queryMany(`SELECT id FROM brand_invoices WHERE brand_id = ?`, [id]);
    for (const inv of oldInvIds) {
      await execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
    }
    await execute(`DELETE FROM brand_invoices WHERE brand_id = ?`, [id]);
    for (const inv of b.invoices) {
      if (!inv.id) continue;
      await execute(`INSERT INTO brand_invoices (id, brand_id, invoice_number, issue_date, due_date, status, recipient_name, pt_name, pic_name, pic_phone, email, address, total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [inv.id, id, inv.invoiceNumber||null, inv.issueDate||null, inv.dueDate||null, inv.status||'Draft', inv.recipientName||null, inv.ptName||null, inv.picName||null, inv.picPhone||null, inv.email||null, inv.address||null, inv.totalAmount||0]);
      if (Array.isArray(inv.sessionItems)) {
        for (const item of inv.sessionItems) {
          await execute(`INSERT INTO invoice_items (invoice_id, session_id, description, qty, cost) VALUES (?,?,?,?,?)`, [inv.id, item.sessionId||null, item.description||null, item.qty||1, item.cost||0]);
        }
      }
    }
  }
  if (Array.isArray(b.berkas)) {
    await execute(`DELETE FROM brand_berkas WHERE brand_id = ?`, [id]);
    for (const f of b.berkas) {
      if (!f.id) continue;
      await execute(`INSERT INTO brand_berkas (id, brand_id, name, type, url) VALUES (?,?,?,?,?)`, [f.id, id, f.name||null, f.type||null, f.url||null]);
    }
  }

  res.json({ success: true });
}));

app.delete("/api/client-brands/:id", asyncHandler(async (req, res) => {
  // Hapus invoice items dulu karena FK tidak ON DELETE CASCADE ke invoice_items
  const invIds = await queryMany(`SELECT id FROM brand_invoices WHERE brand_id = ?`, [req.params.id]);
  for (const inv of invIds) {
    await execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
  }
  await execute(`DELETE FROM client_brands WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// CLIENT LEADS ENDPOINTS
// ==================================================================

app.get("/api/client-leads", asyncHandler(async (req, res) => {
  const rows = await queryMany(`SELECT * FROM client_leads ORDER BY created_at DESC`);
  const mapped = rows.map((l: any) => ({
    id: l.id, name: l.name, contactPerson: l.contact_person,
    contactNumber: l.contact_number, platformInterest: l.platform_interest,
    status: l.status, notes: l.notes,
  }));
  res.json(mapped);
}));

app.post("/api/client-leads", asyncHandler(async (req, res) => {
  const l = req.body;
  const id = l.id || genId('lead');
  await execute(`INSERT INTO client_leads (id, name, contact_person, contact_number, platform_interest, status, notes) VALUES (?,?,?,?,?,?,?)`,
    [id, l.name, l.contactPerson||null, l.contactNumber||null, l.platformInterest||null, l.status||'New', l.notes||null]);
  res.status(201).json({ id });
}));

app.put("/api/client-leads/:id", asyncHandler(async (req, res) => {
  const l = req.body;
  await execute(`UPDATE client_leads SET name=?, contact_person=?, contact_number=?, platform_interest=?, status=?, notes=? WHERE id=?`,
    [l.name, l.contactPerson||null, l.contactNumber||null, l.platformInterest||null, l.status||'New', l.notes||null, req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/client-leads/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM client_leads WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// ADMIN ACCOUNTS ENDPOINTS
// ==================================================================

app.get("/api/admin-accounts", asyncHandler(async (req, res) => {
  const admins = await queryMany(`SELECT id, name, username, created_at FROM admin_accounts`);
  for (const admin of admins) {
    const tabs = await queryMany(`SELECT tab_name FROM admin_access_tabs WHERE admin_id = ?`, [admin.id]);
    admin.accessTabs = tabs.map((t: any) => t.tab_name);
  }
  res.json(admins);
}));

app.post("/api/admin-accounts", asyncHandler(async (req, res) => {
  const a = req.body;
  const id = a.id || genId('admin');
  // Password disimpan as-is dari frontend (frontend bertanggung jawab hash atau kirim plain)
  await execute(`INSERT INTO admin_accounts (id, name, username, password_hash) VALUES (?,?,?,?)`,
    [id, a.name, a.username, a.password || a.passwordHash || '']);
  if (Array.isArray(a.accessTabs)) {
    for (const tab of a.accessTabs) {
      await execute(`INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?,?)`, [id, tab]);
    }
  }
  res.status(201).json({ id });
}));

app.put("/api/admin-accounts/:id", asyncHandler(async (req, res) => {
  const a = req.body;
  await execute(`UPDATE admin_accounts SET name=?, username=? WHERE id=?`, [a.name, a.username, req.params.id]);
  if (Array.isArray(a.accessTabs)) {
    await execute(`DELETE FROM admin_access_tabs WHERE admin_id = ?`, [req.params.id]);
    for (const tab of a.accessTabs) {
      await execute(`INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?,?)`, [req.params.id, tab]);
    }
  }
  res.json({ success: true });
}));

app.delete("/api/admin-accounts/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM admin_accounts WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// CLIENT REPORTING ENDPOINTS
// ==================================================================

app.get("/api/client-reporting", asyncHandler(async (req, res) => {
  const { brandId } = req.query as Record<string, string>;
  let sql = `SELECT * FROM client_reporting WHERE 1=1`;
  const params: any[] = [];
  if (brandId) { sql += ` AND brand_id = ?`; params.push(brandId); }
  sql += ` ORDER BY report_date DESC`;
  const rows = await queryMany(sql, params);
  const mapped = rows.map((r: any) => ({
    id: r.id, brandId: r.brand_id, platform: r.platform,
    reportDate: r.report_date, fileName: r.file_name,
    isPublic: !!r.is_public, publicUrl: r.public_url,
  }));
  res.json(mapped);
}));

app.post("/api/client-reporting", asyncHandler(async (req, res) => {
  const r = req.body;
  const id = r.id || genId('report');
  await execute(`INSERT INTO client_reporting (id, brand_id, platform, report_date, file_name, is_public, public_url) VALUES (?,?,?,?,?,?,?)`,
    [id, r.brandId||null, r.platform||null, r.reportDate||null, r.fileName||null, r.isPublic?1:0, r.publicUrl||null]);
  res.status(201).json({ id });
}));

app.put("/api/client-reporting/:id", asyncHandler(async (req, res) => {
  const r = req.body;
  await execute(`UPDATE client_reporting SET brand_id=?, platform=?, report_date=?, file_name=?, is_public=?, public_url=? WHERE id=?`,
    [r.brandId||null, r.platform||null, r.reportDate||null, r.fileName||null, r.isPublic?1:0, r.publicUrl||null, req.params.id]);
  res.json({ success: true });
}));

app.delete("/api/client-reporting/:id", asyncHandler(async (req, res) => {
  await execute(`DELETE FROM client_reporting WHERE id = ?`, [req.params.id]);
  res.json({ success: true });
}));

// ==================================================================
// AI ENDPOINTS (Gemini — tidak berubah dari versi lama)
// ==================================================================

// Dynamic AI Assistant
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, hosts, logs, alerts } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages body" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      const lowerMsg = lastUserMsg.toLowerCase();
      let responseText = "";

      if (lowerMsg.includes("top-performing") || lowerMsg.includes("top performing") || lowerMsg.includes("best host") || lowerMsg.includes("highest revenue")) {
        responseText = "📊 **[Demo Mode - No API Key Set]**\nBased on your agency data, **Amanda Putri** is the top-performing host this week, generating **Rp 77.4M** with a **4.82% average conversion rate** and a flawless **97% consistency rating**.";
      } else {
        responseText = `🤖 **[Demo Mode - AI Assistant]**\nI'm ready to help you coordinate Liva Media Kreatif streaming hosts!\n\nHere are some questions you can ask me:\n- "Who is the top-performing host this week?"\n- "Tell me about attendance anomalies."\n- "What are your smart recommendations for brand pairings?"`;
      }

      return res.json({ content: responseText, demoMode: true });
    }

    const hostsBrief = hosts ? hosts.map((h: any) => `${h.name} (${h.role}, ID: ${h.employeeId}, consistency: ${h.consistencyScore}%, brands: ${h.brands?.join(', ')})`).join("\n") : "";
    const logsBrief = logs ? logs.slice(0, 40).map((l: any) => `- ${l.date} | ${l.hostName} | Status: ${l.status} | Platform: ${l.platform} | Brand: ${l.brandHandled} | Rev: Rp ${l.revenueGenerated?.toLocaleString()} | Conv: ${l.conversionRate}% | Eng: ${l.engagementRate}%`).join("\n") : "";
    const activeAlertsBrief = alerts ? alerts.filter((a: any) => !a.resolved).map((a: any) => `ALERT: [${a.severity}] ${a.hostName} - ${a.message}`).join("\n") : "";

    const systemInstruction = `You are the Lead SaaS Workflow Architect & AI Officer for the "Host Intelligence Platform", a premium system built for "Liva Media Kreatif", an elite live streaming agency.\n\n[ACTIVE HOST EMPLOYEES]\n${hostsBrief}\n\n[RECENT ATTENDANCE & STREAM PERFORMANCE LOGS]\n${logsBrief}\n\n[CURRENT UNRESOLVED KPI ALERTS]\n${activeAlertsBrief}\n\nYour tone should be highly professional, structured, and direct. Use formatted markdown. When talking about monetary values, use IDR formatted with standard prefixes (e.g. Rp 15.000.000).`;

    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: formattedContents,
      config: { systemInstruction, temperature: 0.2 }
    });

    res.json({ content: response.text || "I was unable to analyze that. Please rephrase your query.", demoMode: false });

  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: "Error communicating with AI Assistant", details: getSafeErrorMessage(error) });
  }
});

// AI Weekly Summary Generator
app.post("/api/ai/weekly-summary", async (req, res) => {
  try {
    const { hosts, logs, alerts } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const summaryMarkdown = `### 📊 Liva Media Kreatif - Performance Summary\n\n#### 1. Core Operations & Performance Highlights\n- **Total Agency Streaming Revenue**: Data dari MySQL database.\n- Gunakan filter di dashboard untuk melihat performa terbaru.\n\n#### 2. 🚨 Attendance & Fraud Alerts\n- Cek tab KPI Alerts untuk status terbaru.\n\n#### 3. 💡 Smart Recommendations\n- Configure GEMINI_API_KEY untuk mendapatkan rekomendasi AI yang dipersonalisasi.`;
      return res.json({ summary: summaryMarkdown, demoMode: true });
    }

    const prompt = `Analyze the host streaming statistics and recent logs to generate a comprehensive, executive-level Agency Intelligence Summary for management.\n\nInclude three specific sections:\n1. Performance Highlights\n2. Attendance Anomalies & Fraud Risks\n3. Actionable Recommendations\n\nHosts Dataset:\n${JSON.stringify(hosts)}\n\nAttendance Logs:\n${JSON.stringify(logs)}\n\nUnresolved Alerts:\n${JSON.stringify(alerts)}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction: "You are an elite Operations Director and AI Analyst for a top Asian streaming MCN agency. Deliver highly structured, valuable, bulleted reports.", temperature: 0.15 }
    });

    res.json({ summary: response.text || "Could not generate summary." });

  } catch (error: any) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: "Failed to generate AI summary", details: getSafeErrorMessage(error) });
  }
});

// AI Performance Scorer
app.post("/api/ai/evaluate-host", async (req, res) => {
  try {
    const { host, logs } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      const result = { score: 85, grade: "B", strengths: ["Loyal brand connection", "Engaged performance"], growthAreas: ["Continue tracking KPIs", "Improve punctuality"], recommendedAction: "Regular check-ins." };
      return res.json({ evaluation: result, demoMode: true });
    }

    const prompt = `Generate a quick, precise KPI performance scoring card for this host.\nHost profile:\n${JSON.stringify(host)}\n\nLogs for past week:\n${JSON.stringify(logs)}\n\nFormat your output strictly as a JSON object with properties: "score" (0-100), "grade" ("A+","A","B","C","D"), "strengths" (array of 2 strings), "growthAreas" (array of 2 strings), "recommendedAction" (string). No markdown, just JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ evaluation: parsed, demoMode: false });

  } catch (error: any) {
    console.error("Evaluation API Error:", error);
    res.status(500).json({ error: "Failed to evaluate host KPI", details: getSafeErrorMessage(error) });
  }
});

// ==================================================================
// INVOICE EMAIL REMINDER (tidak berubah)
// ==================================================================
app.post('/api/invoice/send-reminder', async (req, res) => {
  try {
    const { brandName, invoiceDate, toEmails, amount, invoiceNumber } = req.body;

    const cleanEmails = typeof toEmails === 'string'
      ? toEmails.split(',').map((e: string) => e.trim()).filter((e: string) => !!e).join(', ')
      : toEmails;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.json({ success: true, message: 'Mock email terkirim. Konfigurasi SMTP di .env untuk mengirim secara nyata.', simulated: true });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Liva Agency" <no-reply@liva-agency.com>',
      to: cleanEmails,
      subject: "PEMBERITAHUAN PENAGIHAN INVOICE: " + brandName + " (Ref: " + new Date().getTime().toString().slice(-6) + ")",
      html: `<div style='font-family: sans-serif; padding: 20px; line-height: 1.5; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;'><h2 style='color: #4f46e5;'>🔔 Reminder Penagihan Invoice</h2><p>Halo Tim Admin PIC,</p><p>Ini adalah pengingat dari sistem otomatis bahwa sebuah invoice telah mencapai tanggal penagihan hari ini.</p><div style='background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;'><strong>Brand / Klien:</strong> ${brandName}<br/><strong>No. Invoice:</strong> ${invoiceNumber || 'N/A'}<br/><strong>Tanggal Tagih:</strong> ${invoiceDate}<br/><strong>Total Tagihan:</strong> ${amount ? 'Rp ' + amount.toLocaleString('id-ID') : 'N/A'}<br/></div><p>Mohon segera memeriksa dan memproses penagihan ke klien tersebut.</p><br/><p>Terima kasih,<br/><strong>Sistem Liva Agency</strong></p></div>`
    };

    const info = await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Email berhasil dikirim.', simulated: false, messageId: info.messageId });
  } catch (err: any) {
    console.error('Invoice Email Error:', err);
    return res.status(500).json({ error: 'Gagal memproses request pengiriman', details: err.message || 'Timeout' });
  }
});

// ==================================================================
// Error Handler Global
// ==================================================================
// ==================================================================
// SYSTEM STATUS ENDPOINT
// ==================================================================
app.get('/api/db-test', async (req, res) => {
  try {
    const db = getPool();
    const [rows] = await db.query('SELECT 1 as result');
    res.json({ success: true, message: 'Koneksi MySQL berhasil tersambung!', data: rows });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    res.status(500).json({ success: false, message: `Gagal terhubung ke MySQL: ${error.message}` });
  }
});

// ==================================================================
// Global Error Handler
// ==================================================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: getSafeErrorMessage(err) });
});

// ==================================================================
// Static Files & Vite Dev Server
// ==================================================================
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`🚀 Liva Media Kreatif Server berjalan di port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

bootstrap().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var import_express2 = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_dns = __toESM(require("dns"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);

// server/auth.ts
var import_node_crypto = require("node:crypto");

// src/shared/auth/access.ts
var MODULE_TAB_REQUIREMENTS = {
  adminAccounts: ["admin_privacy"],
  hosts: ["dashboard_utama", "absensi", "rekap_gaji", "database", "credentials", "settings"],
  logs: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  schedules: ["dashboard_utama", "absensi", "rekap_gaji", "database"],
  alerts: ["dashboard_utama", "copilot"],
  clientBrands: ["dashboard_utama", "data_brand", "invoice", "reporting_brand"],
  clientLeads: ["leads"],
  clientReporting: ["reporting_brand"],
  reportingBrand: ["reporting_brand"],
  settings: ["settings", "sheets"],
  invoice: ["invoice"],
  chat: ["copilot"],
  ai: ["copilot"]
};
function canAccessAnyTab(accessTabs, requiredTabs) {
  if (!accessTabs || accessTabs.length === 0) return false;
  const allowed = new Set(accessTabs);
  return requiredTabs.some((tab) => allowed.has(tab));
}
function canAccessDbTest(session) {
  return session?.role === "master" || session?.role === "admin";
}

// server/auth.ts
var AUTH_ROLES = /* @__PURE__ */ new Set(["master", "admin", "host", "brand"]);
function sign(value, secret) {
  return (0, import_node_crypto.createHmac)("sha256", secret).update(value).digest("base64url");
}
function createSessionToken(session, secret) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}
function parseSessionToken(token, secret, nowSeconds = Math.floor(Date.now() / 1e3)) {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !(0, import_node_crypto.timingSafeEqual)(expected, actual)) {
    return null;
  }
  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    if (!parsed.role || !AUTH_ROLES.has(parsed.role) || typeof parsed.subjectId !== "string" || !parsed.subjectId || typeof parsed.expiresAt !== "number" || parsed.expiresAt < nowSeconds) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
function verifyStoredPassword(candidate, stored) {
  if (!candidate || !stored) return false;
  if (stored.startsWith("scrypt:")) {
    const [, saltValue, hashValue, extra] = stored.split(":");
    if (!saltValue || !hashValue || extra) return false;
    try {
      const expectedBuffer2 = Buffer.from(hashValue, "base64url");
      const actualBuffer2 = (0, import_node_crypto.scryptSync)(
        candidate,
        Buffer.from(saltValue, "base64url"),
        expectedBuffer2.length
      );
      return (0, import_node_crypto.timingSafeEqual)(expectedBuffer2, actualBuffer2);
    } catch {
      return false;
    }
  }
  const expected = stored.startsWith("sha256:") ? stored : `plain:${stored}`;
  const actual = stored.startsWith("sha256:") ? `sha256:${(0, import_node_crypto.createHash)("sha256").update(candidate).digest("hex")}` : `plain:${candidate}`;
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  return expectedBuffer.length === actualBuffer.length && (0, import_node_crypto.timingSafeEqual)(expectedBuffer, actualBuffer);
}
function hashPasswordForStorage(password) {
  const salt = (0, import_node_crypto.randomBytes)(16);
  const hash = (0, import_node_crypto.scryptSync)(password, salt, 64);
  return `scrypt:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}
function isPathUnder(path4, prefix) {
  return path4 === prefix || path4.startsWith(`${prefix}/`);
}
function getAdminRequiredTabs(path4) {
  if (isPathUnder(path4, "/admin-accounts")) return MODULE_TAB_REQUIREMENTS.adminAccounts;
  if (isPathUnder(path4, "/hosts")) return MODULE_TAB_REQUIREMENTS.hosts;
  if (isPathUnder(path4, "/violations")) return MODULE_TAB_REQUIREMENTS.hosts;
  if (isPathUnder(path4, "/logs")) return MODULE_TAB_REQUIREMENTS.logs;
  if (isPathUnder(path4, "/schedules")) return MODULE_TAB_REQUIREMENTS.schedules;
  if (isPathUnder(path4, "/alerts")) return MODULE_TAB_REQUIREMENTS.alerts;
  if (isPathUnder(path4, "/client-brands")) return MODULE_TAB_REQUIREMENTS.clientBrands;
  if (isPathUnder(path4, "/client-leads")) return MODULE_TAB_REQUIREMENTS.clientLeads;
  if (isPathUnder(path4, "/client-reporting")) return MODULE_TAB_REQUIREMENTS.clientReporting;
  if (isPathUnder(path4, "/reporting/brand")) return MODULE_TAB_REQUIREMENTS.reportingBrand;
  if (isPathUnder(path4, "/settings")) return MODULE_TAB_REQUIREMENTS.settings;
  if (isPathUnder(path4, "/invoice")) return MODULE_TAB_REQUIREMENTS.invoice;
  if (isPathUnder(path4, "/chat")) return MODULE_TAB_REQUIREMENTS.chat;
  if (isPathUnder(path4, "/ai")) return MODULE_TAB_REQUIREMENTS.ai;
  return null;
}
function isRequestAllowed(session, method, path4) {
  if (method === "GET" && path4 === "/client-brands/public") return true;
  if (method === "GET" && path4 === "/client-brands/public-list") return true;
  if (session.role === "master") return true;
  if (session.role === "admin") {
    const requiredTabs = getAdminRequiredTabs(path4);
    return requiredTabs ? canAccessAnyTab(session.accessTabs, requiredTabs) : false;
  }
  if (session.role === "host") {
    return method === "GET" && path4 === `/hosts/${session.subjectId}` || method === "GET" && path4 === "/client-brands" || method === "GET" && path4 === "/reporting/brand" || method === "GET" && path4 === "/reporting/brand/analyses" || method === "GET" && path4 === "/violations" || method === "GET" && path4 === "/logs" || method === "POST" && path4 === "/logs" || method === "GET" && path4 === "/schedules" || method === "GET" && path4 === "/settings/liva_global_configs";
  }
  return method === "GET" && path4 === `/client-brands/${session.subjectId}` || method === "GET" && path4 === "/schedules" || method === "GET" && path4 === "/client-reporting" || method === "GET" && path4.startsWith("/reporting/brand") || method === "GET" && path4 === "/settings/liva_global_configs";
}
function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return null;
}

// server/db.ts
var import_promise = __toESM(require("mysql2/promise"), 1);
var pool = null;
function getPool() {
  if (!pool) {
    const host = process.env.DB_HOST;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASS;
    const database = process.env.DB_NAME;
    if (!host || !user || !database) {
      throw new Error(
        "Konfigurasi database MySQL belum lengkap. Cek DB_HOST, DB_USER, DB_PASS, DB_NAME di .env"
      );
    }
    pool = import_promise.default.createPool({
      host,
      port: parseInt(process.env.DB_PORT || "3306"),
      user,
      password: password || "",
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      timezone: "+07:00",
      dateStrings: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 1e4,
      connectTimeout: 2e4
    });
    console.log(`\u2705 MySQL pool terhubung ke ${host}/${database}`);
  }
  return pool;
}
async function queryOne(sql, params) {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  const arr = rows;
  return arr.length > 0 ? arr[0] : null;
}
async function queryMany(sql, params = []) {
  const db = getPool();
  const [rows] = await db.execute(sql, params);
  return rows;
}
async function execute(sql, params) {
  const db = getPool();
  const [result] = await db.execute(sql, params);
  return result;
}

// server/session.ts
var SESSION_COOKIE = "liva_session";
var SESSION_TTL_SECONDS = 12 * 60 * 60;
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET || "";
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("SESSION_SECRET wajib diisi minimal 32 karakter di production");
  }
  return secret || "development-session-secret-change-before-production";
}
function setSessionCookie(res, token, maxAge) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`
  );
}
function getRequestSession(req) {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  return token ? parseSessionToken(token, getSessionSecret()) : null;
}
function createAuthSessionToken(session) {
  session.expiresAt = Math.floor(Date.now() / 1e3) + SESSION_TTL_SECONDS;
  return createSessionToken(session, getSessionSecret());
}
function isStoredPasswordValid(password, stored) {
  return verifyStoredPassword(password, stored);
}

// server/http.ts
var import_crypto = require("crypto");
function getSafeErrorMessage(error) {
  if (process.env.NODE_ENV !== "production") {
    return error instanceof Error ? error.message : String(error ?? "Unknown error");
  }
  return "Internal Server Error";
}
var asyncHandler = (fn) => (req, res, next) => {
  fn(req, res, next).catch(next);
};
function genId(prefix = "id") {
  return `${prefix}_${(0, import_crypto.randomUUID)().replace(/-/g, "").substring(0, 12)}`;
}

// src/shared/utils/hostCredentials.ts
function normalizeHostStudioLocation(value) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const compact = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (compact.includes("tanggamus")) return "Tanggamus";
  if (compact.includes("bandar lampung")) return "Bandar Lampung";
  return trimmed.replace(/^Studio\s+/i, "");
}
function hasHostPasswordValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function resolveHostPasswordHash(candidatePassword, existingPasswordHash, hashPassword) {
  if (hasHostPasswordValue(candidatePassword)) {
    return hashPassword(candidatePassword.trim());
  }
  return existingPasswordHash || null;
}

// server/routes/hosts.ts
function mapHost(host) {
  host.employeeId = host.employee_id;
  host.baseMonthlyTargetHours = host.base_monthly_target_hours;
  host.baseMonthlyTargetRevenue = host.base_monthly_target_revenue;
  host.consistencyScore = host.consistency_score;
  host.joinedDate = host.joined_date;
  host.bankAccount = host.bank_account;
  host.bankName = host.bank_name;
  host.hostType = host.host_type;
  host.customWorkingDaysTarget = host.custom_working_days_target;
  host.customBaseSalary = host.custom_base_salary;
  host.customShiftRate = host.custom_shift_rate;
  host.hasPassword = Boolean(host.password_hash);
  host.password = "";
  delete host.password_hash;
}
function registerHostRoutes(app2) {
  app2.get("/api/host-activity-logs", asyncHandler(async (req, res) => {
    const logs = await queryMany(`
      SELECT l.*, h.name as host_name 
      FROM host_activity_logs l 
      LEFT JOIN hosts h ON l.host_id = h.id 
      ORDER BY l.created_at DESC 
      LIMIT 1000
    `);
    res.json(logs);
  }));
  app2.post("/api/host-activity-logs", asyncHandler(async (req, res) => {
    const { hostId, action, details } = req.body;
    const id = genId("act");
    await execute(`
      INSERT INTO host_activity_logs (id, host_id, action, details)
      VALUES (?, ?, ?, ?)
    `, [id, hostId, action, details ? JSON.stringify(details) : null]);
    res.status(201).json({ id });
  }));
  app2.get("/api/hosts", asyncHandler(async (req, res) => {
    const hosts = await queryMany(`SELECT * FROM hosts ORDER BY name ASC`);
    for (const host of hosts) {
      const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
      const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
      host.platforms = platforms.map((p) => p.platform);
      host.brands = brands.map((b) => b.brand);
      mapHost(host);
    }
    res.json(hosts);
  }));
  app2.get("/api/hosts/:id", asyncHandler(async (req, res) => {
    const host = await queryOne(`SELECT * FROM hosts WHERE id = ?`, [req.params.id]);
    if (!host) return res.status(404).json({ error: "Host tidak ditemukan" });
    const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
    const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
    host.platforms = platforms.map((p) => p.platform);
    host.brands = brands.map((b) => b.brand);
    host.hasPassword = Boolean(host.password_hash);
    host.password = "";
    delete host.password_hash;
    host.bankName = host.bank_name;
    res.json(host);
  }));
  app2.post("/api/hosts", asyncHandler(async (req, res) => {
    const h = req.body;
    const id = h.id || genId("host");
    const studio = normalizeHostStudioLocation(h.studio) || null;
    await execute(`
      INSERT INTO hosts (
        id, name, employee_id, avatar, role,
        base_monthly_target_hours, base_monthly_target_revenue,
        consistency_score, joined_date, email, phone,
        username, password_hash, bank_account, bank_name, studio,
        host_type, custom_working_days_target, custom_base_salary, custom_shift_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      h.name,
      h.employeeId,
      h.avatar || null,
      h.role || null,
      h.baseMonthlyTargetHours || 0,
      h.baseMonthlyTargetRevenue || 0,
      h.consistencyScore || 0,
      h.joinedDate || null,
      h.email || null,
      h.phone || null,
      h.username || null,
      resolveHostPasswordHash(h.password, null, hashPasswordForStorage),
      h.bankAccount || null,
      h.bankName || null,
      studio,
      h.hostType || "Reguler",
      h.customWorkingDaysTarget ?? null,
      h.customBaseSalary ?? null,
      h.customShiftRate ?? null
    ]);
    if (Array.isArray(h.platforms)) {
      for (const platform of h.platforms) {
        await execute(`INSERT INTO host_platforms (host_id, platform) VALUES (?, ?)`, [id, platform]);
      }
    }
    if (Array.isArray(h.brands)) {
      for (const brand of h.brands) {
        await execute(`INSERT INTO host_brands (host_id, brand) VALUES (?, ?)`, [id, brand]);
      }
    }
    res.status(201).json({ id });
  }));
  app2.put("/api/hosts/:id", asyncHandler(async (req, res) => {
    const id = req.params.id;
    const h = req.body;
    const studio = normalizeHostStudioLocation(h.studio) || null;
    const existing = await queryOne(`SELECT password_hash FROM hosts WHERE id = ?`, [id]);
    const passwordHash = resolveHostPasswordHash(
      h.password,
      existing?.password_hash,
      hashPasswordForStorage
    );
    await execute(`
      UPDATE hosts SET
        name = ?, employee_id = ?, avatar = ?, role = ?,
        base_monthly_target_hours = ?, base_monthly_target_revenue = ?,
        consistency_score = ?, joined_date = ?, email = ?, phone = ?,
        username = ?, password_hash = ?, bank_account = ?, bank_name = ?, studio = ?,
        host_type = ?, custom_working_days_target = ?,
        custom_base_salary = ?, custom_shift_rate = ?
      WHERE id = ?
    `, [
      h.name,
      h.employeeId,
      h.avatar || null,
      h.role || null,
      h.baseMonthlyTargetHours || 0,
      h.baseMonthlyTargetRevenue || 0,
      h.consistencyScore || 0,
      h.joinedDate || null,
      h.email || null,
      h.phone || null,
      h.username || null,
      passwordHash,
      h.bankAccount || null,
      h.bankName || null,
      studio,
      h.hostType || "Reguler",
      h.customWorkingDaysTarget ?? null,
      h.customBaseSalary ?? null,
      h.customShiftRate ?? null,
      id
    ]);
    if (Array.isArray(h.platforms)) {
      await execute(`DELETE FROM host_platforms WHERE host_id = ?`, [id]);
      for (const platform of h.platforms) {
        await execute(`INSERT INTO host_platforms (host_id, platform) VALUES (?, ?)`, [id, platform]);
      }
    }
    if (Array.isArray(h.brands)) {
      await execute(`DELETE FROM host_brands WHERE host_id = ?`, [id]);
      for (const brand of h.brands) {
        await execute(`INSERT INTO host_brands (host_id, brand) VALUES (?, ?)`, [id, brand]);
      }
    }
    res.json({ success: true });
  }));
  app2.delete("/api/hosts/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM hosts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
}

// server/routes/operations.ts
function mapAttendanceLog(l) {
  const toNumber = (value) => Number(value ?? 0);
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
    avgViewDuration: l.avg_view_duration !== void 0 && l.avg_view_duration !== null ? toNumber(l.avg_view_duration) : void 0,
    studio: l.studio,
    flaggedAsAnomaly: !!l.flagged_as_anomaly,
    anomalyReason: l.anomaly_reason,
    isDuplicate: !!l.is_duplicate,
    flaggedAsFraud: !!l.flagged_as_fraud,
    fraudReason: l.fraud_reason,
    overtimeHours: toNumber(l.overtime_hours),
    isBackupShift: !!l.is_backup_shift
  };
}
function mapSchedule(s) {
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
    studio: s.studio
  };
}
function mapAlert(a) {
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
    resolved: !!a.resolved
  };
}
function registerOperationsRoutes(app2) {
  app2.get("/api/logs", asyncHandler(async (req, res) => {
    const { dateFrom, dateTo } = req.query;
    const hostId = req.auth?.role === "host" ? req.auth.subjectId : String(req.query.hostId || "");
    let sql = `SELECT * FROM attendance_logs WHERE 1=1`;
    const params = [];
    if (hostId) {
      sql += ` AND host_id = ?`;
      params.push(hostId);
    }
    if (dateFrom) {
      sql += ` AND date >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND date <= ?`;
      params.push(dateTo);
    }
    sql += ` ORDER BY date DESC, host_name ASC`;
    const logs = await queryMany(sql, params);
    res.json(logs.map(mapAttendanceLog));
  }));
  app2.post("/api/logs", asyncHandler(async (req, res) => {
    const l = req.body;
    if (req.auth?.role === "host" && l.hostId !== req.auth.subjectId) {
      return res.status(403).json({ error: "Host hanya dapat mengisi absensinya sendiri." });
    }
    const id = l.id || genId("log");
    await execute(`
      INSERT INTO attendance_logs (
        id, host_id, host_name, employee_id, date, shift_hours,
        platform, brand_handled, live_duration, session_count, status,
        check_in_time, revenue_generated, conversion_rate, engagement_rate,
        orders, avg_view_duration, studio, flagged_as_anomaly, anomaly_reason,
        is_duplicate, flagged_as_fraud, fraud_reason, overtime_hours, is_backup_shift
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      l.hostId,
      l.hostName || null,
      l.employeeId || null,
      l.date,
      l.shiftHours || null,
      l.platform || null,
      l.brandHandled || null,
      l.liveDuration || 0,
      l.sessionCount || 0,
      l.status || "Present",
      l.checkInTime || null,
      l.revenueGenerated || 0,
      l.conversionRate || 0,
      l.engagementRate || 0,
      l.orders || 0,
      l.avgViewDuration ?? null,
      l.studio || null,
      l.flaggedAsAnomaly ? 1 : 0,
      l.anomalyReason || null,
      l.isDuplicate ? 1 : 0,
      l.flaggedAsFraud ? 1 : 0,
      l.fraudReason || null,
      l.overtimeHours || 0,
      l.isBackupShift ? 1 : 0
    ]);
    res.status(201).json({ id });
  }));
  app2.put("/api/logs/:id", asyncHandler(async (req, res) => {
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
      l.hostId,
      l.hostName || null,
      l.employeeId || null,
      l.date,
      l.shiftHours || null,
      l.platform || null,
      l.brandHandled || null,
      l.liveDuration || 0,
      l.sessionCount || 0,
      l.status || "Present",
      l.checkInTime || null,
      l.revenueGenerated || 0,
      l.conversionRate || 0,
      l.engagementRate || 0,
      l.orders || 0,
      l.avgViewDuration ?? null,
      l.studio || null,
      l.flaggedAsAnomaly ? 1 : 0,
      l.anomalyReason || null,
      l.isDuplicate ? 1 : 0,
      l.flaggedAsFraud ? 1 : 0,
      l.fraudReason || null,
      l.overtimeHours || 0,
      l.isBackupShift ? 1 : 0,
      req.params.id
    ]);
    res.json({ success: true });
  }));
  app2.delete("/api/logs/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM attendance_logs WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
  app2.post("/api/logs/delete-many", asyncHandler(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: true, deleted: 0 });
    const placeholders = ids.map(() => "?").join(", ");
    const result = await execute(`DELETE FROM attendance_logs WHERE id IN (${placeholders})`, ids);
    res.json({ success: true, deleted: result.affectedRows });
  }));
  app2.get("/api/schedules", asyncHandler(async (req, res) => {
    const { date } = req.query;
    let sql = `SELECT * FROM shift_schedules WHERE 1=1`;
    const params = [];
    if (date) {
      sql += ` AND date = ?`;
      params.push(date);
    }
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
    const rows = await queryMany(sql, params);
    res.json(rows.map(mapSchedule));
  }));
  app2.post("/api/schedules", asyncHandler(async (req, res) => {
    const s = req.body;
    const id = s.id || genId("sched");
    await execute(`
      INSERT INTO shift_schedules (id, host_id, host_name, employee_id, date, time_slot, platform, brand, status, studio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, s.hostId, s.hostName || null, s.employeeId || null, s.date, s.timeSlot || null, s.platform || null, s.brand || null, s.status || "Assigned", s.studio || null]);
    res.status(201).json({ id });
  }));
  app2.put("/api/schedules/:id", asyncHandler(async (req, res) => {
    const s = req.body;
    await execute(`
      UPDATE shift_schedules SET host_id=?, host_name=?, employee_id=?, date=?, time_slot=?, platform=?, brand=?, status=?, studio=?
      WHERE id=?
    `, [s.hostId, s.hostName || null, s.employeeId || null, s.date, s.timeSlot || null, s.platform || null, s.brand || null, s.status || "Assigned", s.studio || null, req.params.id]);
    res.json({ success: true });
  }));
  app2.delete("/api/schedules/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM shift_schedules WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
  app2.get("/api/alerts", asyncHandler(async (req, res) => {
    const { resolved } = req.query;
    let sql = `SELECT * FROM kpi_alerts WHERE 1=1`;
    const params = [];
    if (resolved !== void 0) {
      sql += ` AND resolved = ?`;
      params.push(resolved === "1" ? 1 : 0);
    }
    sql += ` ORDER BY date DESC`;
    const rows = await queryMany(sql, params);
    res.json(rows.map(mapAlert));
  }));
  app2.post("/api/alerts", asyncHandler(async (req, res) => {
    const a = req.body;
    const id = a.id || genId("alert");
    await execute(`
      INSERT INTO kpi_alerts (id, host_id, host_name, metric_type, severity, message, date, current_value, target_value, resolved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, a.hostId, a.hostName || null, a.metricType || null, a.severity || null, a.message || null, a.date || null, String(a.currentValue ?? ""), String(a.targetValue ?? ""), a.resolved ? 1 : 0]);
    res.status(201).json({ id });
  }));
  app2.put("/api/alerts/:id", asyncHandler(async (req, res) => {
    const a = req.body;
    await execute(`
      UPDATE kpi_alerts SET host_id=?, host_name=?, metric_type=?, severity=?, message=?, date=?, current_value=?, target_value=?, resolved=?
      WHERE id=?
    `, [a.hostId, a.hostName || null, a.metricType || null, a.severity || null, a.message || null, a.date || null, String(a.currentValue ?? ""), String(a.targetValue ?? ""), a.resolved ? 1 : 0, req.params.id]);
    res.json({ success: true });
  }));
  app2.delete("/api/alerts/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM kpi_alerts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
  app2.get("/api/studio-shifts", asyncHandler(async (req, res) => {
    const rows = await queryMany(`SELECT id, studio_name, shift_name FROM studio_active_shifts`);
    res.json(rows.map((r) => ({ id: r.id, studio: r.studio_name, shift: r.shift_name })));
  }));
  app2.post("/api/studio-shifts", asyncHandler(async (req, res) => {
    const { studio, shift } = req.body;
    if (!studio || !shift) return res.status(400).json({ error: "Missing studio or shift" });
    await execute(`
      INSERT INTO studio_active_shifts (studio_name, shift_name) 
      VALUES (?, ?) 
      ON DUPLICATE KEY UPDATE studio_name=studio_name
    `, [studio, shift]);
    res.status(201).json({ success: true });
  }));
  app2.post("/api/studio-shifts/delete", asyncHandler(async (req, res) => {
    const { studio, shift } = req.body;
    if (!studio || !shift) return res.status(400).json({ error: "Missing studio or shift" });
    await execute(`DELETE FROM studio_active_shifts WHERE studio_name = ? AND shift_name = ?`, [studio, shift]);
    res.json({ success: true });
  }));
}

// server/routes/client.ts
var import_multer = __toESM(require("multer"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var storage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    const dir = import_path.default.join(process.cwd(), "uploads", "berkas");
    if (!import_fs.default.existsSync(dir)) {
      import_fs.default.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + import_path.default.extname(file.originalname));
  }
});
var upload = (0, import_multer.default)({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
  // 50MB max file size
});
async function buildBrand(brand) {
  const sessions = await queryMany(
    `SELECT * FROM brand_sessions WHERE brand_id = ?`,
    [brand.id]
  );
  const accounts = await queryMany(
    `SELECT * FROM brand_accounts WHERE brand_id = ?`,
    [brand.id]
  );
  const invoices = await queryMany(
    `SELECT * FROM brand_invoices WHERE brand_id = ? ORDER BY issue_date DESC`,
    [brand.id]
  );
  const berkas = await queryMany(
    `SELECT * FROM brand_berkas WHERE brand_id = ?`,
    [brand.id]
  );
  const mappedInvoices = await Promise.all(
    invoices.map(async (inv) => {
      const sessionItems = await queryMany(
        `SELECT * FROM invoice_items WHERE invoice_id = ?`,
        [inv.id]
      );
      return {
        ...inv,
        sessionItems,
        invoiceNumber: inv.invoice_number || null,
        issueDate: inv.issue_date || null,
        dueDate: inv.due_date || null,
        recipientName: inv.recipient_name || null,
        ptName: inv.pt_name || null,
        picName: inv.pic_name || null,
        picPhone: inv.pic_phone || null,
        totalAmount: parseInt(String(inv.total_amount || 0), 10) || 0
      };
    })
  );
  return {
    id: brand.id,
    name: brand.name,
    companyName: brand.company_name,
    contractStartDate: brand.contract_start_date,
    contractEndDate: brand.contract_end_date,
    invoiceDate: brand.invoice_date,
    monthlyMeetingDate: brand.monthly_meeting_date,
    clientPassword: brand.client_password,
    clientUsername: brand.client_username,
    picName: brand.pic_name,
    picPhone: brand.pic_phone,
    picEmail: brand.pic_email,
    companyAddress: brand.company_address,
    logoUrl: brand.logo_url,
    isActive: brand.is_active === null || brand.is_active === void 0 ? true : Boolean(brand.is_active),
    dashboardSettings: brand.dashboard_settings ? JSON.parse(brand.dashboard_settings) : void 0,
    sessions: sessions.map((session) => ({
      id: session.id,
      shift: session.shift,
      platform: session.platform,
      studio: session.studio,
      host: session.host
    })),
    accounts: accounts.map((account) => ({
      id: account.id,
      type: account.type,
      username: account.username,
      password: account.password,
      picOtp: account.pic_otp
    })),
    invoices: mappedInvoices,
    berkas
  };
}
function registerClientRoutes(app2) {
  app2.post("/api/client-brands/berkas/upload", upload.single("berkas_file"), asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/berkas/${req.file.filename}`;
    res.json({ url: fileUrl });
  }));
  app2.get("/api/client-brands", asyncHandler(async (req, res) => {
    const brands = await queryMany(`SELECT * FROM client_brands ORDER BY name ASC`);
    const result = await Promise.all(brands.map(buildBrand));
    res.json(result);
  }));
  app2.get("/api/client-brands/public", asyncHandler(async (req, res) => {
    const brands = await queryMany(`SELECT name FROM client_brands WHERE is_active = 1 ORDER BY name ASC`);
    res.json(brands.map((b) => b.name));
  }));
  app2.get("/api/client-brands/public-list", asyncHandler(async (req, res) => {
    const brands = await queryMany(`SELECT id, name FROM client_brands WHERE is_active = 1 ORDER BY name ASC`);
    res.json(brands);
  }));
  app2.get("/api/client-brands/:id", asyncHandler(async (req, res) => {
    const brand = await queryOne(`SELECT * FROM client_brands WHERE id = ?`, [req.params.id]);
    if (!brand) return res.status(404).json({ error: "Brand tidak ditemukan" });
    res.json(await buildBrand(brand));
  }));
  app2.post("/api/client-brands", asyncHandler(async (req, res) => {
    const b = req.body;
    const id = b.id || genId("brand");
    await execute(`
      INSERT INTO client_brands (id, name, company_name, contract_start_date, contract_end_date, invoice_date, monthly_meeting_date, client_password, client_username, pic_name, pic_phone, pic_email, company_address, logo_url, is_active, dashboard_settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, b.name, b.companyName || null, b.contractStartDate || null, b.contractEndDate || null, b.invoiceDate || null, b.monthlyMeetingDate || null, b.clientPassword || null, b.clientUsername || null, b.picName || null, b.picPhone || null, b.picEmail || null, b.companyAddress || null, b.logoUrl || null, b.isActive !== false ? 1 : 0, b.dashboardSettings ? JSON.stringify(b.dashboardSettings) : null]);
    if (Array.isArray(b.sessions)) {
      for (const s of b.sessions) {
        if (!s.id) continue;
        await execute(`INSERT INTO brand_sessions (id, brand_id, shift, platform, studio, host) VALUES (?,?,?,?,?,?)`, [s.id, id, s.shift || null, s.platform || null, s.studio || null, s.host || null]);
      }
    }
    if (Array.isArray(b.accounts)) {
      for (const a of b.accounts) {
        if (!a.id) continue;
        await execute(`INSERT INTO brand_accounts (id, brand_id, type, username, password, pic_otp) VALUES (?,?,?,?,?,?)`, [a.id, id, a.type || null, a.username || null, a.password || null, a.picOtp || null]);
      }
    }
    if (Array.isArray(b.invoices)) {
      for (const inv of b.invoices) {
        if (!inv.id) continue;
        await execute(`
          INSERT INTO brand_invoices (id, brand_id, invoice_number, issue_date, due_date, status, recipient_name, pt_name, pic_name, pic_phone, email, address, total_amount)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        `, [inv.id, id, inv.invoiceNumber || null, inv.issueDate || null, inv.dueDate || null, inv.status || "Draft", inv.recipientName || null, inv.ptName || null, inv.picName || null, inv.picPhone || null, inv.email || null, inv.address || null, inv.totalAmount || 0]);
        if (Array.isArray(inv.sessionItems)) {
          for (const item of inv.sessionItems) {
            await execute(`INSERT INTO invoice_items (invoice_id, session_id, description, qty, cost) VALUES (?,?,?,?,?)`, [inv.id, item.sessionId || null, item.description || null, item.qty || 1, item.cost || 0]);
          }
        }
      }
    }
    if (Array.isArray(b.berkas)) {
      for (const f of b.berkas) {
        if (!f.id) continue;
        await execute(`INSERT INTO brand_berkas (id, brand_id, name, type, url) VALUES (?,?,?,?,?)`, [f.id, id, f.name || null, f.type || null, f.url || null]);
      }
    }
    res.status(201).json({ id });
  }));
  app2.put("/api/client-brands/:id", asyncHandler(async (req, res) => {
    const id = req.params.id;
    const b = req.body;
    await execute(`
      UPDATE client_brands 
      SET name = ?, company_name = ?, contract_start_date = ?, contract_end_date = ?, invoice_date = ?, monthly_meeting_date = ?, client_password = ?, client_username = ?, pic_name = ?, pic_phone = ?, pic_email = ?, company_address = ?, logo_url = ?, is_active = ?, dashboard_settings = ?
      WHERE id = ?
    `, [b.name, b.companyName || null, b.contractStartDate || null, b.contractEndDate || null, b.invoiceDate || null, b.monthlyMeetingDate || null, b.clientPassword || null, b.clientUsername || null, b.picName || null, b.picPhone || null, b.picEmail || null, b.companyAddress || null, b.logoUrl || null, b.isActive !== false ? 1 : 0, b.dashboardSettings ? JSON.stringify(b.dashboardSettings) : null, id]);
    if (Array.isArray(b.sessions)) {
      await execute(`DELETE FROM brand_sessions WHERE brand_id = ?`, [id]);
      for (const s of b.sessions) {
        if (!s.id) continue;
        await execute(`INSERT INTO brand_sessions (id, brand_id, shift, platform, studio, host) VALUES (?,?,?,?,?,?)`, [s.id, id, s.shift || null, s.platform || null, s.studio || null, s.host || null]);
      }
    }
    if (Array.isArray(b.accounts)) {
      await execute(`DELETE FROM brand_accounts WHERE brand_id = ?`, [id]);
      for (const a of b.accounts) {
        if (!a.id) continue;
        await execute(`INSERT INTO brand_accounts (id, brand_id, type, username, password, pic_otp) VALUES (?,?,?,?,?,?)`, [a.id, id, a.type || null, a.username || null, a.password || null, a.picOtp || null]);
      }
    }
    if (Array.isArray(b.invoices)) {
      const oldInvIds = await queryMany(`SELECT id FROM brand_invoices WHERE brand_id = ?`, [id]);
      for (const inv of oldInvIds) {
        await execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
      }
      await execute(`DELETE FROM brand_invoices WHERE brand_id = ?`, [id]);
      for (const inv of b.invoices) {
        if (!inv.id) continue;
        await execute(
          `INSERT INTO brand_invoices (id, brand_id, invoice_number, issue_date, due_date, status, recipient_name, pt_name, pic_name, pic_phone, email, address, total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [inv.id, id, inv.invoiceNumber || null, inv.issueDate || null, inv.dueDate || null, inv.status || "Draft", inv.recipientName || null, inv.ptName || null, inv.picName || null, inv.picPhone || null, inv.email || null, inv.address || null, inv.totalAmount || 0]
        );
        if (Array.isArray(inv.sessionItems)) {
          for (const item of inv.sessionItems) {
            await execute(`INSERT INTO invoice_items (invoice_id, session_id, description, qty, cost) VALUES (?,?,?,?,?)`, [inv.id, item.sessionId || null, item.description || null, item.qty || 1, item.cost || 0]);
          }
        }
      }
    }
    if (Array.isArray(b.berkas)) {
      await execute(`DELETE FROM brand_berkas WHERE brand_id = ?`, [id]);
      for (const f of b.berkas) {
        if (!f.id) continue;
        await execute(`INSERT INTO brand_berkas (id, brand_id, name, type, url) VALUES (?,?,?,?,?)`, [f.id, id, f.name || null, f.type || null, f.url || null]);
      }
    }
    res.json({ success: true });
  }));
  app2.delete("/api/client-brands/:id", asyncHandler(async (req, res) => {
    const invIds = await queryMany(`SELECT id FROM brand_invoices WHERE brand_id = ?`, [req.params.id]);
    for (const inv of invIds) {
      await execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
    }
    await execute(`DELETE FROM client_brands WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
  app2.get("/api/admin-accounts", asyncHandler(async (req, res) => {
    const admins = await queryMany(`SELECT id, name, username, password_hash, created_at FROM admin_accounts`);
    for (const admin of admins) {
      const tabs = await queryMany(`SELECT tab_name FROM admin_access_tabs WHERE admin_id = ?`, [admin.id]);
      admin.accessTabs = tabs.map((t) => t.tab_name);
      admin.password = "";
      delete admin.password_hash;
    }
    res.json(admins);
  }));
  app2.post("/api/admin-accounts", asyncHandler(async (req, res) => {
    const a = req.body;
    const id = a.id || genId("admin");
    await execute(
      `INSERT INTO admin_accounts (id, name, username, password_hash) VALUES (?,?,?,?)`,
      [id, a.name, a.username, hashPasswordForStorage(a.password || a.passwordHash || "")]
    );
    if (Array.isArray(a.accessTabs)) {
      for (const tab of a.accessTabs) {
        await execute(`INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?,?)`, [id, tab]);
      }
    }
    res.status(201).json({ id });
  }));
  app2.put("/api/admin-accounts/:id", asyncHandler(async (req, res) => {
    const a = req.body;
    if (a.password || a.passwordHash) {
      await execute(
        `UPDATE admin_accounts SET name=?, username=?, password_hash=? WHERE id=?`,
        [a.name, a.username, hashPasswordForStorage(a.password || a.passwordHash), req.params.id]
      );
    } else {
      await execute(
        `UPDATE admin_accounts SET name=?, username=? WHERE id=?`,
        [a.name, a.username, req.params.id]
      );
    }
    if (Array.isArray(a.accessTabs)) {
      await execute(`DELETE FROM admin_access_tabs WHERE admin_id = ?`, [req.params.id]);
      for (const tab of a.accessTabs) {
        await execute(`INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?,?)`, [req.params.id, tab]);
      }
    }
    res.json({ success: true });
  }));
  app2.delete("/api/admin-accounts/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM admin_accounts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
  app2.get("/api/client-reporting", asyncHandler(async (req, res) => {
    const brandId = req.auth?.role === "brand" ? req.auth.subjectId : String(req.query.brandId || "");
    let sql = `SELECT * FROM client_reporting WHERE 1=1`;
    const params = [];
    if (brandId) {
      sql += ` AND brand_id = ?`;
      params.push(brandId);
    }
    sql += ` ORDER BY report_date DESC`;
    const rows = await queryMany(sql, params);
    const mapped = rows.map((r) => ({
      id: r.id,
      brandId: r.brand_id,
      platform: r.platform,
      reportDate: r.report_date,
      fileName: r.file_name,
      isPublic: !!r.is_public,
      publicUrl: r.public_url
    }));
    res.json(mapped);
  }));
  app2.post("/api/client-reporting", asyncHandler(async (req, res) => {
    const r = req.body;
    const id = r.id || genId("report");
    await execute(
      `INSERT INTO client_reporting (id, brand_id, platform, report_date, file_name, is_public, public_url) VALUES (?,?,?,?,?,?,?)`,
      [id, r.brandId || null, r.platform || null, r.reportDate || null, r.fileName || null, r.isPublic ? 1 : 0, r.publicUrl || null]
    );
    res.status(201).json({ id });
  }));
  app2.put("/api/client-reporting/:id", asyncHandler(async (req, res) => {
    const r = req.body;
    await execute(
      `UPDATE client_reporting SET brand_id=?, platform=?, report_date=?, file_name=?, is_public=?, public_url=? WHERE id=?`,
      [r.brandId || null, r.platform || null, r.reportDate || null, r.fileName || null, r.isPublic ? 1 : 0, r.publicUrl || null, req.params.id]
    );
    res.json({ success: true });
  }));
  app2.delete("/api/client-reporting/:id", asyncHandler(async (req, res) => {
    await execute(`DELETE FROM client_reporting WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
}

// server/routes/violations.ts
var import_multer2 = __toESM(require("multer"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var storage2 = import_multer2.default.diskStorage({
  destination: (req, file, cb) => {
    const dir = import_path2.default.join(process.cwd(), "uploads", "violations");
    if (!import_fs2.default.existsSync(dir)) {
      import_fs2.default.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "violation-" + uniqueSuffix + import_path2.default.extname(file.originalname));
  }
});
var upload2 = (0, import_multer2.default)({
  storage: storage2,
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
function registerViolationRoutes(app2) {
  app2.get("/api/violations", asyncHandler(async (req, res) => {
    const hostId = req.query.hostId ? String(req.query.hostId) : null;
    let query = `
      SELECT hv.*, h.name as host_name, cb.name as brand_name
      FROM host_violations hv
      LEFT JOIN hosts h ON hv.host_id = h.id
      LEFT JOIN client_brands cb ON hv.brand_id = cb.id
      ORDER BY hv.created_at DESC
    `;
    let params = [];
    if (hostId) {
      query = `
        SELECT hv.*, h.name as host_name, cb.name as brand_name
        FROM host_violations hv
        LEFT JOIN hosts h ON hv.host_id = h.id
        LEFT JOIN client_brands cb ON hv.brand_id = cb.id
        WHERE hv.host_id = ?
        ORDER BY hv.created_at DESC
      `;
      params = [hostId];
    }
    const rows = await queryMany(query, params);
    return res.json(rows);
  }));
  app2.post("/api/violations", upload2.single("proof"), asyncHandler(async (req, res) => {
    const { host_id, brand_id, shift, platform, violation_type, consequence, violation_date } = req.body;
    if (!host_id || !violation_type) {
      return res.status(400).json({ error: "Host dan jenis pelanggaran wajib diisi." });
    }
    let proof_url = "";
    if (req.file) {
      proof_url = `/uploads/violations/${req.file.filename}`;
    }
    const id = "violation-" + genId();
    await execute(
      `INSERT INTO host_violations (id, host_id, brand_id, shift, platform, violation_type, proof_url, consequence, violation_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        host_id,
        brand_id || null,
        shift || null,
        platform || null,
        violation_type,
        proof_url || null,
        consequence || null,
        violation_date || null
      ]
    );
    return res.json({ success: true, id });
  }));
  app2.delete("/api/violations/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const row = await queryOne(`SELECT proof_url FROM host_violations WHERE id = ?`, [id]);
    if (row && row.proof_url) {
      const filePath = import_path2.default.join(process.cwd(), row.proof_url);
      if (import_fs2.default.existsSync(filePath)) {
        try {
          import_fs2.default.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file:", filePath, e);
        }
      }
    }
    await execute(`DELETE FROM host_violations WHERE id = ?`, [id]);
    return res.json({ success: true });
  }));
}

// server/productionConfig.ts
function isPlaceholder(value) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "change_this" || normalized === "change-this" || normalized === "change_me" || normalized === "change-me" || normalized === "todo" || normalized === "your_db_user" || normalized === "your_db_pass" || normalized === "your_db_name" || normalized === "your_session_secret" || normalized === "development-session-secret-change-before-production" || normalized === "my_gemini_api_key" || normalized.startsWith("your_") || normalized.startsWith("change_this");
}
function isValidHttpsOrigin(raw) {
  try {
    const cleaned = raw.trim().replace(/\/+$/, "");
    const url = new URL(cleaned);
    return url.protocol === "https:" && url.origin.toLowerCase() === cleaned.toLowerCase();
  } catch {
    return false;
  }
}
function validateProductionConfig(env) {
  if (env.NODE_ENV !== "production") return [];
  const errors = [];
  const sessionSecret = env.SESSION_SECRET?.trim() || "";
  if (sessionSecret.length < 32 || isPlaceholder(sessionSecret)) {
    errors.push("SESSION_SECRET harus minimal 32 karakter dan bukan placeholder.");
  }
  const adminUsername = env.ADMIN_USERNAME?.trim() || "";
  if (!adminUsername || isPlaceholder(adminUsername)) {
    errors.push("ADMIN_USERNAME harus diisi.");
  }
  const adminPassword = env.ADMIN_PASSWORD?.trim() || "";
  const adminPasswordHash = env.ADMIN_PASSWORD_HASH?.trim() || "";
  const hasAdminPassword = !!adminPassword && !isPlaceholder(adminPassword);
  const hasAdminPasswordHash = !!adminPasswordHash && !isPlaceholder(adminPasswordHash);
  if (!hasAdminPassword && !hasAdminPasswordHash) {
    errors.push("ADMIN_PASSWORD atau ADMIN_PASSWORD_HASH harus diisi dan bukan placeholder.");
  }
  for (const key of ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"]) {
    const value = env[key]?.trim() || "";
    if (!value || isPlaceholder(value)) {
      errors.push(`${key} harus diisi dan bukan placeholder.`);
    }
  }
  const origins = (env.ALLOWED_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean);
  const hasInvalidOrigin = origins.length === 0 || origins.some(
    (origin) => origin === "*" || !isValidHttpsOrigin(origin)
  );
  if (hasInvalidOrigin) {
    errors.push("ALLOWED_ORIGINS harus berisi daftar origin HTTPS yang valid dan bukan wildcard.");
  }
  return errors;
}

// server/routes/projectApp.ts
var import_express = require("express");
var projectAppRouter = (0, import_express.Router)();
projectAppRouter.get("/db-test", async (req, res) => {
  const start = Date.now();
  try {
    const pool2 = getPool();
    const [rows] = await pool2.query("SELECT 1 as connected, DATABASE() as db_name, VERSION() as version, NOW() as server_time");
    const [tables] = await pool2.query("SHOW TABLES");
    const latencyMs = Date.now() - start;
    let tableNames = [];
    if (Array.isArray(tables)) {
      tableNames = tables.map((t) => Object.values(t)[0]);
    }
    res.json({
      success: true,
      message: "Koneksi ke MySQL database berhasil!",
      latencyMs,
      database: rows[0]?.db_name || process.env.DB_NAME || "Unknown",
      version: rows[0]?.version || "Unknown",
      serverTime: rows[0]?.server_time || (/* @__PURE__ */ new Date()).toISOString(),
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "3306",
      tablesCount: tableNames.length,
      tables: tableNames
    });
  } catch (error) {
    const latencyMs = Date.now() - start;
    console.error("MySQL connection check error:", error);
    res.status(500).json({
      success: false,
      message: `Gagal terhubung ke MySQL: ${error.message}`,
      latencyMs,
      database: process.env.DB_NAME || "Unknown",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || "3306"
    });
  }
});
projectAppRouter.get("/stats", async (req, res) => {
  try {
    const pool2 = getPool();
    const [projectsCount] = await pool2.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM pm_projects
    `);
    const [tasksCount] = await pool2.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
      FROM pm_tasks
    `);
    const [postsCount] = await pool2.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status IN ('idea', 'drafting', 'review') THEN 1 ELSE 0 END) as in_pipeline
      FROM sm_content_posts
    `);
    const [accountsCount] = await pool2.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(followers_count) as total_followers
      FROM sm_social_accounts
    `);
    const [upcomingPosts] = await pool2.query(`
      SELECT p.*, b.name as brand_name, b.color as brand_color, a.handle as account_handle
      FROM sm_content_posts p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      LEFT JOIN sm_social_accounts a ON p.social_account_id = a.id
      WHERE p.scheduled_at >= NOW()
      ORDER BY p.scheduled_at ASC
      LIMIT 5
    `);
    const [urgentTasks] = await pool2.query(`
      SELECT t.*, p.title as project_title, p.color as project_color
      FROM pm_tasks t
      LEFT JOIN pm_projects p ON t.project_id = p.id
      WHERE t.status != 'done'
      ORDER BY 
        CASE t.priority 
          WHEN 'urgent' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        t.due_date ASC
      LIMIT 5
    `);
    res.json({
      projects: projectsCount[0] || { total: 0, in_progress: 0, completed: 0 },
      tasks: tasksCount[0] || { total: 0, todo: 0, in_progress: 0, review: 0, done: 0 },
      posts: postsCount[0] || { total: 0, scheduled: 0, approved: 0, published: 0, in_pipeline: 0 },
      accounts: accountsCount[0] || { total: 0, active: 0, total_followers: 0 },
      upcomingPosts,
      urgentTasks
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/brands", async (_req, res) => {
  try {
    const pool2 = getPool();
    const [rows] = await pool2.query(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM sm_social_accounts a WHERE a.brand_id = b.id) as accounts_count,
        (SELECT COUNT(*) FROM pm_projects p WHERE p.brand_id = b.id) as projects_count
      FROM sm_brands b 
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/brands", async (req, res) => {
  try {
    const pool2 = getPool();
    const { name, logo_url, color, tone_of_voice, target_audience } = req.body;
    const id = `b-${Date.now().toString(36)}`;
    await pool2.query(
      `INSERT INTO sm_brands (id, name, logo_url, color, tone_of_voice, target_audience) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, logo_url || null, color || "#6366f1", tone_of_voice || "", target_audience || ""]
    );
    res.json({ success: true, id, message: "Brand berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.put("/brands/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { name, logo_url, color, tone_of_voice, target_audience } = req.body;
    await pool2.query(
      `UPDATE sm_brands SET name = ?, logo_url = ?, color = ?, tone_of_voice = ?, target_audience = ? WHERE id = ?`,
      [name, logo_url, color, tone_of_voice, target_audience, id]
    );
    res.json({ success: true, message: "Brand berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.delete("/brands/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    await pool2.query(`DELETE FROM sm_brands WHERE id = ?`, [id]);
    res.json({ success: true, message: "Brand berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/social-accounts", async (_req, res) => {
  try {
    const pool2 = getPool();
    const [rows] = await pool2.query(`
      SELECT a.*, b.name as brand_name, b.color as brand_color, b.logo_url as brand_logo
      FROM sm_social_accounts a
      LEFT JOIN sm_brands b ON a.brand_id = b.id
      ORDER BY a.followers_count DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/social-accounts", async (req, res) => {
  try {
    const pool2 = getPool();
    const { brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes } = req.body;
    const id = `acc-${Date.now().toString(36)}`;
    await pool2.query(
      `INSERT INTO sm_social_accounts (id, brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, brand_id, platform, handle, profile_url || null, pic_name || "", followers_count || 0, monthly_target_posts || 20, status || "active", notes || ""]
    );
    res.json({ success: true, id, message: "Akun media sosial berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.put("/social-accounts/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes } = req.body;
    await pool2.query(
      `UPDATE sm_social_accounts 
       SET brand_id = ?, platform = ?, handle = ?, profile_url = ?, pic_name = ?, followers_count = ?, monthly_target_posts = ?, status = ?, notes = ?
       WHERE id = ?`,
      [brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status, notes, id]
    );
    res.json({ success: true, message: "Akun berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.delete("/social-accounts/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    await pool2.query(`DELETE FROM sm_social_accounts WHERE id = ?`, [id]);
    res.json({ success: true, message: "Akun berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/projects", async (_req, res) => {
  try {
    const pool2 = getPool();
    const [rows] = await pool2.query(`
      SELECT p.*, b.name as brand_name, b.color as brand_color,
        (SELECT COUNT(*) FROM pm_tasks t WHERE t.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM pm_tasks t WHERE t.project_id = p.id AND t.status = 'done') as completed_tasks
      FROM pm_projects p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      ORDER BY p.due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/projects", async (req, res) => {
  try {
    const pool2 = getPool();
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color } = req.body;
    const id = `proj-${Date.now().toString(36)}`;
    await pool2.query(
      `INSERT INTO pm_projects (id, brand_id, title, description, status, priority, start_date, due_date, progress, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, brand_id || null, title, description || "", status || "planning", priority || "medium", start_date || null, due_date || null, progress || 0, color || "#4f46e5"]
    );
    res.json({ success: true, id, message: "Proyek berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.put("/projects/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { brand_id, title, description, status, priority, start_date, due_date, progress, color } = req.body;
    await pool2.query(
      `UPDATE pm_projects 
       SET brand_id = ?, title = ?, description = ?, status = ?, priority = ?, start_date = ?, due_date = ?, progress = ?, color = ?
       WHERE id = ?`,
      [brand_id, title, description, status, priority, start_date, due_date, progress, color, id]
    );
    res.json({ success: true, message: "Proyek berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.delete("/projects/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    await pool2.query(`DELETE FROM pm_tasks WHERE project_id = ?`, [id]);
    await pool2.query(`DELETE FROM pm_projects WHERE id = ?`, [id]);
    res.json({ success: true, message: "Proyek beserta task terkait berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/tasks", async (req, res) => {
  try {
    const pool2 = getPool();
    const { project_id, status } = req.query;
    let query = `
      SELECT t.*, p.title as project_title, p.color as project_color, b.name as brand_name
      FROM pm_tasks t
      LEFT JOIN pm_projects p ON t.project_id = p.id
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    const params = [];
    if (project_id) {
      query += ` AND t.project_id = ?`;
      params.push(project_id);
    }
    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    query += ` ORDER BY t.order_index ASC, t.created_at DESC`;
    const [rows] = await pool2.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/tasks", async (req, res) => {
  try {
    const pool2 = getPool();
    const { project_id, title, description, status, priority, assignee_name, due_date, tags } = req.body;
    const id = `task-${Date.now().toString(36)}`;
    await pool2.query(
      `INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, project_id || null, title, description || "", status || "todo", priority || "medium", assignee_name || "", due_date || null, tags || "", 0]
    );
    res.json({ success: true, id, message: "Task berhasil dibuat" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.patch("/tasks/:id/status", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { status } = req.body;
    await pool2.query(`UPDATE pm_tasks SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: "Status task berhasil diubah" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.put("/tasks/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { project_id, title, description, status, priority, assignee_name, due_date, tags } = req.body;
    await pool2.query(
      `UPDATE pm_tasks 
       SET project_id = ?, title = ?, description = ?, status = ?, priority = ?, assignee_name = ?, due_date = ?, tags = ?
       WHERE id = ?`,
      [project_id, title, description, status, priority, assignee_name, due_date, tags, id]
    );
    res.json({ success: true, message: "Task berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.delete("/tasks/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    await pool2.query(`DELETE FROM pm_tasks WHERE id = ?`, [id]);
    res.json({ success: true, message: "Task berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/content-pillars", async (_req, res) => {
  try {
    const pool2 = getPool();
    const [rows] = await pool2.query(`SELECT * FROM sm_content_pillars ORDER BY name ASC`);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.get("/content-posts", async (req, res) => {
  try {
    const pool2 = getPool();
    const { brand_id, platform, status, month, year } = req.query;
    let query = `
      SELECT p.*, b.name as brand_name, b.color as brand_color, b.logo_url as brand_logo,
             a.handle as account_handle, a.platform as account_platform
      FROM sm_content_posts p
      LEFT JOIN sm_brands b ON p.brand_id = b.id
      LEFT JOIN sm_social_accounts a ON p.social_account_id = a.id
      WHERE 1=1
    `;
    const params = [];
    if (brand_id) {
      query += ` AND p.brand_id = ?`;
      params.push(brand_id);
    }
    if (platform) {
      query += ` AND p.platform = ?`;
      params.push(platform);
    }
    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (month && year) {
      query += ` AND MONTH(p.scheduled_at) = ? AND YEAR(p.scheduled_at) = ?`;
      params.push(month, year);
    }
    query += ` ORDER BY p.scheduled_at ASC`;
    const [rows] = await pool2.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/content-posts", async (req, res) => {
  try {
    const pool2 = getPool();
    const {
      brand_id,
      social_account_id,
      project_id,
      title,
      pillar_name,
      platform,
      content_type,
      hook,
      caption,
      hashtags,
      call_to_action,
      media_urls,
      scheduled_at,
      status,
      assignee_copy,
      assignee_design,
      notes
    } = req.body;
    const id = `post-${Date.now().toString(36)}`;
    await pool2.query(
      `INSERT INTO sm_content_posts 
       (id, brand_id, social_account_id, project_id, title, pillar_name, platform, content_type,
        hook, caption, hashtags, call_to_action, media_urls, scheduled_at, status, assignee_copy, assignee_design, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        brand_id || null,
        social_account_id || null,
        project_id || null,
        title,
        pillar_name || "Edukasi & Tips",
        platform || "instagram",
        content_type || "feed_single",
        hook || "",
        caption || "",
        hashtags || "",
        call_to_action || "",
        JSON.stringify(media_urls || []),
        scheduled_at,
        status || "idea",
        assignee_copy || "",
        assignee_design || "",
        notes || ""
      ]
    );
    res.json({ success: true, id, message: "Postingan konten berhasil dijadwalkan" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.patch("/content-posts/:id/status", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const { status } = req.body;
    await pool2.query(`UPDATE sm_content_posts SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true, message: "Status konten berhasil diupdate" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.put("/content-posts/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    const {
      brand_id,
      social_account_id,
      project_id,
      title,
      pillar_name,
      platform,
      content_type,
      hook,
      caption,
      hashtags,
      call_to_action,
      media_urls,
      scheduled_at,
      status,
      assignee_copy,
      assignee_design,
      notes,
      published_link
    } = req.body;
    await pool2.query(
      `UPDATE sm_content_posts 
       SET brand_id = ?, social_account_id = ?, project_id = ?, title = ?, pillar_name = ?, platform = ?,
           content_type = ?, hook = ?, caption = ?, hashtags = ?, call_to_action = ?, media_urls = ?,
           scheduled_at = ?, status = ?, assignee_copy = ?, assignee_design = ?, notes = ?, published_link = ?
       WHERE id = ?`,
      [
        brand_id,
        social_account_id,
        project_id,
        title,
        pillar_name,
        platform,
        content_type,
        hook,
        caption,
        hashtags,
        call_to_action,
        JSON.stringify(media_urls || []),
        scheduled_at,
        status,
        assignee_copy,
        assignee_design,
        notes,
        published_link,
        id
      ]
    );
    res.json({ success: true, message: "Konten berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.post("/ai-generate", async (req, res) => {
  try {
    const { topic, pillar, platform, brand_tone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "ISI_DENGAN_API_KEY_GEMINI_ANDA" && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        const { GoogleGenAI: GoogleGenAI2 } = await import("@google/genai");
        const ai = new GoogleGenAI2({ apiKey });
        const prompt = `Kamu adalah copywriter profesional untuk agensi media sosial.
Buatkan konten media sosial untuk platform ${platform || "Instagram"} dengan topik: "${topic}".
Pilar konten: ${pillar || "Edukasi & Tips"}
Tone of voice brand: ${brand_tone || "Ramah, modern, dan informatif"}

Berikan output JSON dalam format:
{
  "hook": "1 kalimat pembuka 3 detik pertama yang sangat memikat / clickworthy",
  "caption": "Teks caption lengkap dengan paragraf rapi dan persuasif",
  "hashtags": "5-8 hashtag relevan berurutan diawali tanda pagar",
  "call_to_action": "1 kalimat ajakan bertindak (CTA)"
}`;
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt
        });
        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json(parsed);
        }
      } catch (aiErr) {
        console.warn("Gemini API call error, falling back to smart template:", aiErr);
      }
    }
    const templates = {
      "Edukasi & Tips": {
        hook: `Stop lakuin hal ini kalau kalian mau hasil maksimal di ${topic}! \u274C`,
        caption: `Banyak orang yang masih keliru saat ngurusin ${topic}.

Berikut 3 langkah simpel yang terbukti efektif:
1. Pahami pola dasar dan tentukan target yang jelas
2. Konsistensi kecil setiap hari > heboh sehari doang
3. Evaluasi metrik setiap akhir pekan

Praktekin trik ini sekarang juga dan rasakan bedanya! \u2728`,
        hashtags: `#${(topic || "Tips").replace(/\s+/g, "")} #EdukasiKreatif #DigitalMarketing #AgencyTips #TipsPraktis`,
        call_to_action: "Save postingan ini biar gak lupa pas praktek nanti! \u{1F4CC}"
      },
      "Promo & Penjualan": {
        hook: `PROMO TERBATAS! Khusus 50 orang tercepat hari ini aja! \u26A1\u{1F525}`,
        caption: `Kabar gembira buat kalian yang udah nungguin momen ini! Sekarang ${topic} lagi ada diskon spesial s/d 50% + bonus eksklusif.

Jangan tunggu sampai kehabisan kuota ya, promo ini cuma berlaku sampai stok habis! \u{1F6D2}\u2728`,
        hashtags: `#PromoSpesial #DiskonGajian #FlashSale #BeliSekarang #BestDeal`,
        call_to_action: 'Klik link di bio atau komen "MAU" buat dapetin voucher khususnya sekarang! \u{1F6CD}\uFE0F'
      },
      "Entertainment & Tren": {
        hook: `Realita vs Ekspektasi pas lagi ngerjain ${topic}... \u{1F602}`,
        caption: `Kira-kira begini nih di balik layar kalau tim kreatif lagi fokus garap ${topic}.
Siapa di sini yang tim 'sebentar lagi beres' tapi kenyataannya masih revisi ke-15? \u{1F64B}\u200D\u2642\uFE0F\u{1F3AC}

Tag temen kalian yang relate banget sama kondisi ini!`,
        hashtags: `#RelateBanget #BehindTheScenes #AgencyLife #POV #FYP #Trending`,
        call_to_action: "Tag temen kantor kalian yang kelakuannya persis begini di kolom komentar! \u{1F447}"
      }
    };
    const selected = templates[pillar] || templates["Edukasi & Tips"];
    res.json(selected);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
projectAppRouter.delete("/content-posts/:id", async (req, res) => {
  try {
    const pool2 = getPool();
    const { id } = req.params;
    await pool2.query(`DELETE FROM sm_content_posts WHERE id = ?`, [id]);
    res.json({ success: true, message: "Konten berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/migrateProjectApp.ts
async function runProjectAppMigrations() {
  const pool2 = getPool();
  console.log("\u{1F680} Menjalankan Auto-Migration untuk Project Management, Social Media & Content Calendar...");
  await pool2.execute(`
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
  await pool2.execute(`
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
  await pool2.execute(`
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
  await pool2.execute(`
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
  await pool2.execute(`
    CREATE TABLE IF NOT EXISTS sm_content_pillars (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      color VARCHAR(30) DEFAULT '#8b5cf6',
      description VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  await pool2.execute(`
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
  console.log("\u2705 Seluruh tabel berhasil diverifikasi/dibuat!");
  await seedInitialData();
}
async function seedInitialData() {
  const pool2 = getPool();
  const [brandRows] = await pool2.query("SELECT COUNT(*) as count FROM sm_brands");
  const brandCount = brandRows[0]?.count || 0;
  if (brandCount === 0) {
    console.log("\u{1F331} Database kosong, mengisikan starter seed data otomatis...");
    await pool2.query(`
      INSERT INTO sm_brands (id, name, logo_url, color, tone_of_voice, target_audience) VALUES
      ('b-liva', 'Liva Creative Media', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100', '#6366f1', 'Trendy, Energik, Profesional & Berwibawa', 'Gen-Z & Milenial, Brand Owner, Content Creator'),
      ('b-wardah', 'Wardah Official', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100', '#0ea5e9', 'Inspiratif, Halal Beauty, Hangat & Edukatif', 'Wanita Muda, Mahasiswi, Muslimah Modern'),
      ('b-somethinc', 'Somethinc Beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100', '#a855f7', 'Bold, Sains Skincare Terbukti, Playful', 'Beauty Enthusiast, Skincare Geek')
    `);
    await pool2.query(`
      INSERT INTO sm_content_pillars (id, name, color, description) VALUES
      ('pil-edu', 'Edukasi & Tips', '#3b82f6', 'Tutorial, cara penggunaan produk, tips praktis'),
      ('pil-promo', 'Promo & Penjualan', '#ef4444', 'Diskon kilat, voucher, bundling gajian'),
      ('pil-ent', 'Entertainment & Tren', '#ec4899', 'POV, humor relate, tren audio TikTok'),
      ('pil-bts', 'Behind The Scene', '#10b981', 'Proses syuting, keseruan tim di kantor'),
      ('pil-soc', 'Social Proof & Testi', '#f59e0b', 'Review jujur pengguna, testimonial, unboxing')
    `);
    await pool2.query(`
      INSERT INTO sm_social_accounts (id, brand_id, platform, handle, profile_url, pic_name, followers_count, monthly_target_posts, status) VALUES
      ('acc-liva-ig', 'b-liva', 'instagram', '@livamedianetwork', 'https://instagram.com/livamedianetwork', 'Galang (Head Creative)', 48200, 30, 'active'),
      ('acc-liva-tt', 'b-liva', 'tiktok', '@livacreative', 'https://tiktok.com/@livacreative', 'Sarah (Social Lead)', 125000, 45, 'active'),
      ('acc-wardah-ig', 'b-wardah', 'instagram', '@wardahbeauty.id', 'https://instagram.com/wardahbeauty', 'Rina (Account Manager)', 840000, 40, 'active'),
      ('acc-somethinc-tt', 'b-somethinc', 'tiktok', '@somethincofficial', 'https://tiktok.com/@somethincofficial', 'Dimas (TikTok Strategist)', 520000, 50, 'active')
    `);
    await pool2.query(`
      INSERT INTO pm_projects (id, brand_id, title, description, status, priority, start_date, due_date, progress, color) VALUES
      ('proj-99', 'b-wardah', 'Campaign 9.9 Super Glow Sale', 'Kampanye serentak Instagram & TikTok untuk peluncuran bundle diskon 9.9 serum halal.', 'in_progress', 'urgent', '2026-09-01', '2026-09-15', 65, '#0ea5e9'),
      ('proj-rebrand', 'b-liva', 'Liva Agency Media Kit & Showreel 2026', 'Penyusunan video showreel talent baru dan portofolio agency untuk prospek klien Q4.', 'planning', 'high', '2026-09-05', '2026-09-30', 25, '#6366f1'),
      ('proj-viraltrend', 'b-somethinc', 'TikTok Sunscreen Challenge', 'Aktivasi UGC hashtag challenge bersama 15 micro-influencer beauty TikTok.', 'in_progress', 'medium', '2026-09-03', '2026-09-20', 40, '#a855f7')
    `);
    await pool2.query(`
      INSERT INTO pm_tasks (id, project_id, title, description, status, priority, assignee_name, due_date, tags, order_index) VALUES
      ('task-1', 'proj-99', 'Brief Copywriting 5 Video Reels 9.9', 'Tuliskan hook 3 detik pertama yang menarik perhatian dengan fokus promo diskon.', 'done', 'urgent', 'Nadia (Copywriter)', '2026-09-04', 'Copywriting,Promo', 0),
      ('task-2', 'proj-99', 'Desain 10 Carousel Promo Feed IG', 'Format 4:5 clean typography dengan palet warna brand Wardah.', 'in_progress', 'high', 'Bayu (Graphic Designer)', '2026-09-07', 'Design,Carousel', 1),
      ('task-3', 'proj-99', 'Shooting Video Talent & Editing Reels', 'Take video di Studio A, highlight tekstur serum.', 'todo', 'high', 'Rian (Videographer)', '2026-09-09', 'Video,Reels', 2),
      ('task-4', 'proj-99', 'Final Review & Approval Klien', 'Kirim preview postingan dan caption lengkap ke pihak Brand.', 'review', 'urgent', 'Galang', '2026-09-10', 'Approval,Client', 3),
      ('task-5', 'proj-rebrand', 'Kurasi Best Performance Clips Q1-Q3', 'Kumpulkan rekaman sesi livestream terbaik dan GMV tertinggi.', 'in_progress', 'medium', 'Citra (Analyst)', '2026-09-12', 'Showreel,Research', 0),
      ('task-6', 'proj-viraltrend', 'Outreach 15 Micro Influencer TikTok', 'Kirimkan PR package dan sound guidelines kampanye.', 'todo', 'medium', 'Sarah', '2026-09-14', 'KOL,TikTok', 0)
    `);
    const today = /* @__PURE__ */ new Date();
    const formatDate = (offsetDays, hour) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      d.setHours(hour, 0, 0, 0);
      return d.toISOString().slice(0, 19).replace("T", " ");
    };
    await pool2.query(`
      INSERT INTO sm_content_posts (id, brand_id, social_account_id, project_id, title, pillar_name, platform, content_type, hook, caption, hashtags, scheduled_at, status, assignee_copy, assignee_design) VALUES
      ('post-1', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Serum Rahasia Kulit Glowing 9.9', 'Edukasi & Tips', 'instagram', 'carousel', 'Kulit kusam bikin insecure pas hangout? Coba urutan skincare ini!', 'Gak perlu ribet 10 steps skincare, cukup 3 langkah ini buat bikin kulit kamu auto cerah dan kenyal kembali! Swipe sampai habis untuk rahasianya \u2728', '#WardahGlow #SkincareRoutine #SerumHalal #BeautyTips', '${formatDate(0, 11)}', 'published', 'Nadia', 'Bayu'),
      ('post-2', 'b-liva', 'acc-liva-tt', 'proj-rebrand', 'POV: Satu Hari di Belakang Layar Agency', 'Entertainment & Tren', 'tiktok', 'tiktok_video', 'Kalian kira kerja di agency itu santai kayak di drakor?', 'Realita vs ekspektasi anak agency pas lagi persiapan live streaming 12 jam non-stop! Ada yang relate? \u{1F602}\u{1F3A5}', '#AgencyLife #LivaMedia #BehindTheScenes #WorkLifeBalance #fyp', '${formatDate(1, 19)}', 'scheduled', 'Sarah', 'Rian'),
      ('post-3', 'b-somethinc', 'acc-somethinc-tt', 'proj-viraltrend', 'Uji Ketahanan Sunscreen Bawah UV Camera', 'Social Proof & Testi', 'tiktok', 'tiktok_video', 'Beneran proteksi atau cuma gimmick? Kita tes langsung!', 'Kita buktikan di bawah kamera UV sinar ultraviolet langsung di lapangan! Jangan skip sunscreen kalian ya bestie! \u2600\uFE0F', '#SomethincReview #UVCam #SunscreenPalingNampol #SkincareViral', '${formatDate(2, 14)}', 'approved', 'Nadia', 'Rian'),
      ('post-4', 'b-wardah', 'acc-wardah-ig', 'proj-99', 'Countdown 2 Hari Menuju 9.9 Mega Flash Sale', 'Promo & Penjualan', 'instagram', 'reels', 'Jangan checkout sekarang! Tunggu jam 00:00 tanggal 9!', 'Diskon s/d 70% + voucher cashback ekstra eksklusif untuk kalian yang tonton live tanggal 9 nanti! Save postingan ini biar gak ketinggalan!', '#WardahMegaSale #Diskon99 #FlashSaleSkincare', '${formatDate(3, 17)}', 'review', 'Nadia', 'Bayu'),
      ('post-5', 'b-liva', 'acc-liva-ig', 'proj-rebrand', '5 Strategi Live Shopping Menembus 100 Juta Pertama', 'Edukasi & Tips', 'instagram', 'carousel', 'Host udah heboh tapi penonton gak ada yang checkout? Ini salahnya!', 'Kunci live streaming bukan cuma di diskon, tapi di storytelling dan pacing funnel produk. Simak analisa tim Liva Media berikut ini \u{1F4C8}', '#LiveStreamingAgency #TikTokShopTips #ShopeeLive #AgencyTips', '${formatDate(4, 10)}', 'drafting', 'Galang', 'Bayu')
    `);
    console.log("\u2705 Starter seed data berhasil diisikan!");
  } else {
    console.log(`\u2139\uFE0F Tabel sudah memiliki data (${brandCount} brand terdaftar).`);
  }
}

// server.ts
import_dns.default.setDefaultResultOrder("ipv4first");
import_dotenv.default.config();
var productionConfigErrors = validateProductionConfig(process.env);
if (productionConfigErrors.length > 0) {
  console.error(`\u26A0\uFE0F Peringatan Konfigurasi production:
- ${productionConfigErrors.join("\n- ")}`);
}
var app = (0, import_express2.default)();
var PORT = process.env.PORT || 3e3;
app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(import_express2.default.json({ limit: "50mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use("/uploads", import_express2.default.static(import_path3.default.join(process.cwd(), "uploads")));
app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const role = String(req.body?.role || "");
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (!username || !password || username.length > 150 || password.length > 300) {
    return res.status(400).json({ error: "Username atau password tidak valid." });
  }
  let session = null;
  if (role === "admin") {
    const masterUsername = process.env.ADMIN_USERNAME || "";
    const masterPassword = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";
    if (masterUsername && username === masterUsername && isStoredPasswordValid(password, masterPassword)) {
      session = { role: "master", subjectId: "master", expiresAt: 0 };
    } else {
      const admin = await queryOne(
        `SELECT id, password_hash FROM admin_accounts WHERE LOWER(username) = LOWER(?) LIMIT 1`,
        [username]
      );
      if (admin && isStoredPasswordValid(password, admin.password_hash || "")) {
        const tabs = await queryMany(
          `SELECT tab_name FROM admin_access_tabs WHERE admin_id = ?`,
          [admin.id]
        );
        session = {
          role: "admin",
          subjectId: admin.id,
          expiresAt: 0,
          accessTabs: tabs.map((tab) => tab.tab_name)
        };
      }
    }
  } else if (role === "host") {
    const host = await queryOne(
      `SELECT id, password_hash FROM hosts WHERE LOWER(username) = LOWER(?) LIMIT 1`,
      [username]
    );
    if (host && isStoredPasswordValid(password, host.password_hash || "")) {
      session = { role: "host", subjectId: host.id, expiresAt: 0 };
    }
  } else if (role === "brand") {
    const brand = await queryOne(
      `SELECT id, client_password FROM client_brands WHERE LOWER(client_username) = LOWER(?) LIMIT 1`,
      [username]
    );
    if (brand && isStoredPasswordValid(password, brand.client_password || "")) {
      session = { role: "brand", subjectId: brand.id, expiresAt: 0 };
    }
  } else {
    return res.status(400).json({ error: "Role login tidak valid." });
  }
  if (!session) {
    return res.status(401).json({ error: "Username atau password salah." });
  }
  const token = createAuthSessionToken(session);
  setSessionCookie(res, token, SESSION_TTL_SECONDS);
  return res.json(session);
}));
app.get("/api/auth/session", (req, res) => {
  const session = getRequestSession(req);
  return res.json(session);
});
app.post("/api/auth/logout", (req, res) => {
  setSessionCookie(res, "", 0);
  return res.json({ success: true });
});
app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  if (req.method === "GET" && req.path === "/settings/brandResources") return next();
  if (req.method === "GET" && req.path === "/client-brands/public-list") return next();
  if (req.path.startsWith("/project-app")) return next();
  const session = getRequestSession(req);
  if (!session) return res.status(401).json({ error: "Autentikasi diperlukan." });
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin) {
      const proto = (req.get("x-forwarded-proto") || req.protocol).split(",")[0].trim();
      const expectedOrigin = `${proto}://${req.get("host")}`;
      const configuredOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean);
      if (origin !== expectedOrigin && !configuredOrigins.includes(origin)) {
        return res.status(403).json({ error: "Origin request tidak diizinkan." });
      }
    }
  }
  req.auth = session;
  if (!isRequestAllowed(session, req.method, req.path)) {
    return res.status(403).json({ error: "Akses tidak diizinkan." });
  }
  return next();
});
registerHostRoutes(app);
registerOperationsRoutes(app);
registerClientRoutes(app);
registerViolationRoutes(app);
app.use("/api/project-app", projectAppRouter);
var aiInstance = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiInstance = new import_genai.GoogleGenAI({ apiKey: key });
    }
  }
  return aiInstance;
}
app.get("/api/settings/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (key === "adminCredentials") {
    return res.status(404).json({ error: "Pengaturan tidak ditemukan." });
  }
  const row = await queryOne(`SELECT setting_value FROM global_settings WHERE setting_key = ?`, [key]);
  if (!row) {
    return res.json(null);
  }
  let value = row.setting_value;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (e) {
    }
  }
  if (key === "liva_global_configs") {
    if (value && typeof value === "object") delete value.adminCredentials;
  }
  return res.json(value);
}));
app.post("/api/settings/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (key === "adminCredentials") {
    return res.status(403).json({ error: "Kredensial admin dikelola oleh server." });
  }
  const value = req.body && typeof req.body === "object" ? Array.isArray(req.body) ? [...req.body] : { ...req.body } : req.body;
  if (key === "liva_global_configs" && value) delete value.adminCredentials;
  await execute(`
    INSERT INTO global_settings (setting_key, setting_value) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE setting_value = ?
  `, [key, JSON.stringify(value), JSON.stringify(value)]);
  res.json({ success: true, key });
}));
app.get("/api/health", asyncHandler(async (req, res) => {
  let dbStatus = "disconnected";
  try {
    await queryOne("SELECT 1", []);
    dbStatus = "connected";
  } catch {
    dbStatus = "error";
  }
  res.json({
    status: "healthy",
    database: dbStatus,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}));
app.get("/api/reporting/brand/summary", asyncHandler(async (req, res) => {
  const brandId = req.auth?.role === "brand" ? req.auth.subjectId : "";
  const batchFilter = brandId ? "WHERE brand_id = ?" : "";
  const filterParams = brandId ? [brandId] : [];
  const [batchRows, rowRows] = await Promise.all([
    queryMany(`
      SELECT brand_id AS brandId, MAX(brand_name) AS brandName, COUNT(*) AS batchCount, COALESCE(SUM(total_gmv), 0) AS totalGmv
      FROM reporting_upload_batches
      ${batchFilter}
      GROUP BY brand_id
    `, filterParams),
    queryMany(`
      SELECT brand_id AS brandId, COUNT(*) AS sessionCount
      FROM reporting_upload_rows
      ${batchFilter}
      GROUP BY brand_id
    `, filterParams)
  ]);
  const summaryMap = /* @__PURE__ */ new Map();
  for (const batch of batchRows) {
    const key = batch.brandId || "";
    if (!key) continue;
    summaryMap.set(key, {
      brandId: key,
      brandName: batch.brandName || "",
      batchCount: Number(batch.batchCount || 0),
      sessionCount: 0,
      totalGmv: Number(batch.totalGmv || 0)
    });
  }
  for (const row of rowRows) {
    const key = row.brandId || "";
    if (!key) continue;
    const current = summaryMap.get(key) || {
      brandId: key,
      brandName: "",
      batchCount: 0,
      sessionCount: 0,
      totalGmv: 0
    };
    current.sessionCount = Number(row.sessionCount || 0);
    summaryMap.set(key, current);
  }
  res.json(Array.from(summaryMap.values()));
}));
var mapReportingBatch = (row) => ({
  id: row.id,
  batchId: row.id,
  brandId: row.brand_id,
  brandName: row.brand_name,
  platform: row.platform,
  sourceKind: row.source_kind,
  reportType: row.report_type,
  fileName: row.file_name,
  rowCount: Number(row.row_count || 0),
  gmv: Number(row.total_gmv || 0),
  uploadedAt: row.uploaded_at,
  updatedAt: row.updated_at
});
var mapReportingRow = (row) => ({
  id: row.id,
  batchId: row.batch_id,
  brandId: row.brand_id,
  brandName: row.brand_name,
  platform: row.platform,
  sourceKind: row.source_kind,
  reportType: row.report_type,
  title: row.title,
  date: row.report_date,
  dateTime: row.report_datetime,
  shift: row.shift,
  duration: Number(row.duration || 0),
  gmv: Number(row.gmv || 0),
  products_sold: Number(row.products_sold || 0),
  buyers: Number(row.buyers || 0),
  aov: Number(row.aov || 0),
  views: Number(row.views || 0),
  impressions: Number(row.impressions || 0),
  penonton: Number(row.penonton || 0),
  liveVisits: Number(row.live_visits || 0),
  productImpressions: Number(row.product_impressions || 0),
  clicks: Number(row.clicks || 0),
  orders: Number(row.orders || 0),
  followers: Number(row.followers || 0),
  likes: Number(row.likes || 0),
  shares: Number(row.shares || 0),
  comments: Number(row.comments || 0),
  avgViewDuration: Number(row.avg_view_duration || 0),
  peakViewers: Number(row.peak_viewers || 0),
  shopVouchers: Number(row.shop_vouchers || 0),
  specialVouchers: Number(row.special_vouchers || 0),
  coinsClaimed: Number(row.coins_claimed || 0),
  hasFunnelInFile: !!row.has_funnel_in_file,
  uploadedAt: row.uploaded_at
});
app.get("/api/reporting/brand", asyncHandler(async (req, res) => {
  const { platform, sourceKind } = req.query;
  const brandId = req.auth?.role === "brand" ? req.auth.subjectId : String(req.query.brandId || "");
  const batchParams = [];
  let batchSql = `
    SELECT id, brand_id, brand_name, platform, source_kind, report_type,
           file_name, row_count, total_gmv, uploaded_at, updated_at
    FROM reporting_upload_batches
    WHERE 1=1
  `;
  if (brandId) {
    batchSql += ` AND brand_id = ?`;
    batchParams.push(brandId);
  }
  if (platform) {
    batchSql += ` AND platform = ?`;
    batchParams.push(platform);
  }
  if (sourceKind) {
    batchSql += ` AND source_kind = ?`;
    batchParams.push(sourceKind);
  }
  batchSql += ` ORDER BY uploaded_at DESC`;
  const rowParams = [];
  let rowSql = `
    SELECT id, batch_id, brand_id, brand_name, platform, source_kind, report_type,
           title, report_date, report_datetime, shift, duration, gmv, products_sold, buyers,
           aov, views, impressions, penonton, live_visits, product_impressions,
           clicks, orders, followers, likes, shares, comments, avg_view_duration,
           peak_viewers, shop_vouchers, special_vouchers, coins_claimed,
           has_funnel_in_file, uploaded_at
    FROM reporting_upload_rows
    WHERE 1=1
  `;
  if (brandId) {
    rowSql += ` AND brand_id = ?`;
    rowParams.push(brandId);
  }
  if (platform) {
    rowSql += ` AND platform = ?`;
    rowParams.push(platform);
  }
  if (sourceKind) {
    rowSql += ` AND source_kind = ?`;
    rowParams.push(sourceKind);
  }
  rowSql += ` ORDER BY uploaded_at DESC, report_datetime DESC, report_date DESC`;
  const [batchRows, rowRows] = await Promise.all([
    queryMany(batchSql, batchParams),
    queryMany(rowSql, rowParams)
  ]);
  res.json({
    batches: batchRows.map(mapReportingBatch),
    rows: rowRows.map(mapReportingRow)
  });
}));
app.post("/api/reporting/brand/batch", asyncHandler(async (req, res) => {
  const { batch, rows } = req.body || {};
  if (!batch || !batch.id) {
    return res.status(400).json({ error: "Batch reporting tidak valid." });
  }
  const db = getPool();
  const conn = await db.getConnection();
  const rowsArray = Array.isArray(rows) ? rows : [];
  try {
    await conn.beginTransaction();
    await conn.execute(`SET FOREIGN_KEY_CHECKS = 0`, []);
    await conn.execute(`DELETE FROM reporting_upload_rows WHERE batch_id = ?`, [batch.id]);
    await conn.execute(`
      INSERT INTO reporting_upload_batches (
        id, brand_id, brand_name, platform, source_kind, report_type, file_name, row_count, total_gmv
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        brand_id = VALUES(brand_id),
        brand_name = VALUES(brand_name),
        platform = VALUES(platform),
        source_kind = VALUES(source_kind),
        report_type = VALUES(report_type),
        file_name = VALUES(file_name),
        row_count = VALUES(row_count),
        total_gmv = VALUES(total_gmv)
    `, [
      batch.id,
      batch.brandId || null,
      batch.brandName || null,
      batch.platform || null,
      batch.sourceKind || null,
      batch.reportType || null,
      batch.fileName || null,
      Number(batch.rowCount || 0),
      Number(batch.gmv || 0)
    ]);
    if (rowsArray.length > 0) {
      const CHUNK_SIZE = 25;
      const rowPlaceholder = `(${Array.from({ length: 34 }, () => "?").join(",")})`;
      for (let offset = 0; offset < rowsArray.length; offset += CHUNK_SIZE) {
        const chunk = rowsArray.slice(offset, offset + CHUNK_SIZE);
        const rowSql = `
          INSERT INTO reporting_upload_rows (
            id, batch_id, brand_id, brand_name, platform, source_kind, report_type, title, report_date, report_datetime, shift,
            duration, gmv, products_sold, buyers, aov, views, impressions, penonton, live_visits, product_impressions, clicks, orders,
            followers, likes, shares, comments, avg_view_duration, peak_viewers, shop_vouchers, special_vouchers, coins_claimed,
            has_funnel_in_file, raw_payload
          ) VALUES ${chunk.map(() => rowPlaceholder).join(",")}
          ON DUPLICATE KEY UPDATE
            gmv = VALUES(gmv), products_sold = VALUES(products_sold), buyers = VALUES(buyers),
            views = VALUES(views), orders = VALUES(orders), likes = VALUES(likes),
            comments = VALUES(comments), shares = VALUES(shares), followers = VALUES(followers)
        `;
        const params = [];
        for (const row of chunk) {
          const safeId = String(row.id || "").substring(0, 140);
          params.push(
            safeId,
            row.batchId || batch.id,
            row.brandId || batch.brandId || null,
            row.brandName || batch.brandName || null,
            row.platform || batch.platform || null,
            row.sourceKind || batch.sourceKind || null,
            row.reportType || batch.reportType || null,
            row.title || null,
            row.date || null,
            row.dateTime || null,
            row.shift || null,
            Number(row.duration || 0),
            Number(row.gmv || 0),
            Number(row.products_sold || 0),
            Number(row.buyers || 0),
            Number(row.aov || 0),
            Number(row.views || 0),
            Number(row.impressions || 0),
            Number(row.penonton || 0),
            Number(row.liveVisits || 0),
            Number(row.productImpressions || 0),
            Number(row.clicks || 0),
            Number(row.orders || 0),
            Number(row.followers || 0),
            Number(row.likes || 0),
            Number(row.shares || 0),
            Number(row.comments || 0),
            Number(row.avgViewDuration || 0),
            Number(row.peakViewers || 0),
            Number(row.shopVouchers || 0),
            Number(row.specialVouchers || 0),
            Number(row.coinsClaimed || 0),
            row.hasFunnelInFile ? 1 : 0,
            JSON.stringify(row)
          );
        }
        await conn.execute(rowSql, params);
      }
    }
    await conn.execute(`SET FOREIGN_KEY_CHECKS = 1`, []);
    await conn.commit();
    res.status(201).json({ success: true, id: batch.id, rowCount: rowsArray.length });
  } catch (e) {
    console.error("[reporting/brand/batch] INSERT gagal:", e?.message || e);
    await conn.execute(`SET FOREIGN_KEY_CHECKS = 1`, []).catch(() => {
    });
    await conn.rollback();
    if (e?.code === "ER_NO_REFERENCED_ROW_2") {
      const conn2 = await db.getConnection();
      try {
        await conn2.beginTransaction();
        await conn2.execute(`DELETE FROM reporting_upload_rows WHERE batch_id = ?`, [batch.id]);
        await conn2.execute(`
          INSERT INTO reporting_upload_batches (
            id, brand_id, brand_name, platform, source_kind, report_type, file_name, row_count, total_gmv
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            brand_name = VALUES(brand_name), platform = VALUES(platform),
            report_type = VALUES(report_type), file_name = VALUES(file_name),
            row_count = VALUES(row_count), total_gmv = VALUES(total_gmv)
        `, [
          batch.id,
          batch.brandName || null,
          batch.platform || null,
          batch.sourceKind || null,
          batch.reportType || null,
          batch.fileName || null,
          Number(batch.rowCount || 0),
          Number(batch.gmv || 0)
        ]);
        const CHUNK_SIZE2 = 25;
        const rowPlaceholder2 = `(${Array.from({ length: 34 }, () => "?").join(",")})`;
        for (let off = 0; off < rowsArray.length; off += CHUNK_SIZE2) {
          const ch = rowsArray.slice(off, off + CHUNK_SIZE2);
          const sql2 = `INSERT INTO reporting_upload_rows (
            id,batch_id,brand_id,brand_name,platform,source_kind,report_type,title,report_date,report_datetime,shift,
            duration,gmv,products_sold,buyers,aov,views,impressions,penonton,live_visits,product_impressions,clicks,orders,
            followers,likes,shares,comments,avg_view_duration,peak_viewers,shop_vouchers,special_vouchers,coins_claimed,
            has_funnel_in_file,raw_payload
          ) VALUES ${ch.map(() => rowPlaceholder2).join(",")}`;
          const p2 = [];
          for (const row of ch) {
            p2.push(
              String(row.id || "").substring(0, 140),
              row.batchId || batch.id,
              null,
              row.brandName || batch.brandName || null,
              row.platform || batch.platform || null,
              row.sourceKind || batch.sourceKind || null,
              row.reportType || batch.reportType || null,
              row.title || null,
              row.date || null,
              row.dateTime || null,
              row.shift || null,
              Number(row.duration || 0),
              Number(row.gmv || 0),
              Number(row.products_sold || 0),
              Number(row.buyers || 0),
              Number(row.aov || 0),
              Number(row.views || 0),
              Number(row.impressions || 0),
              Number(row.penonton || 0),
              Number(row.liveVisits || 0),
              Number(row.productImpressions || 0),
              Number(row.clicks || 0),
              Number(row.orders || 0),
              Number(row.followers || 0),
              Number(row.likes || 0),
              Number(row.shares || 0),
              Number(row.comments || 0),
              Number(row.avgViewDuration || 0),
              Number(row.peakViewers || 0),
              Number(row.shopVouchers || 0),
              Number(row.specialVouchers || 0),
              Number(row.coinsClaimed || 0),
              row.hasFunnelInFile ? 1 : 0,
              JSON.stringify(row)
            );
          }
          await conn2.execute(sql2, p2);
        }
        await conn2.commit();
        console.log(`[reporting/brand/batch] Retry sukses (brand_id di-set NULL karena FK violation)`);
        return res.status(201).json({ success: true, id: batch.id, rowCount: rowsArray.length });
      } catch (e2) {
        await conn2.rollback();
        console.error("[reporting/brand/batch] Retry juga gagal:", e2?.message);
        throw e2;
      } finally {
        conn2.release();
      }
    }
    throw e;
  } finally {
    conn.release();
  }
}));
app.post("/api/reporting/brand/delete-many", asyncHandler(async (req, res) => {
  const batchIds = Array.isArray(req.body?.batchIds) ? req.body.batchIds.filter(Boolean) : [];
  const logIds = Array.isArray(req.body?.logIds) ? req.body.logIds.filter(Boolean) : [];
  const db = getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    if (logIds.length > 0) {
      const placeholders = logIds.map(() => "?").join(",");
      const [affectedRows] = await conn.execute(
        `SELECT DISTINCT batch_id FROM reporting_upload_rows WHERE id IN (${placeholders})`,
        logIds
      );
      await conn.execute(
        `DELETE FROM reporting_upload_rows WHERE id IN (${placeholders})`,
        logIds
      );
      const affectedBatchIds = affectedRows.map((r) => r.batch_id).filter(Boolean);
      for (const batchId of affectedBatchIds) {
        const [summaryRows] = await conn.execute(
          `SELECT COUNT(*) AS rowCount, COALESCE(SUM(gmv), 0) AS totalGmv FROM reporting_upload_rows WHERE batch_id = ?`,
          [batchId]
        );
        const summary = summaryRows[0];
        const rowCount = Number(summary?.rowCount || 0);
        const totalGmv = Number(summary?.totalGmv || 0);
        if (rowCount === 0) {
          await conn.execute(`DELETE FROM reporting_upload_batches WHERE id = ?`, [batchId]);
        } else {
          await conn.execute(
            `UPDATE reporting_upload_batches SET row_count = ?, total_gmv = ? WHERE id = ?`,
            [rowCount, totalGmv, batchId]
          );
        }
      }
    }
    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => "?").join(",");
      await conn.execute(
        `DELETE FROM reporting_upload_batches WHERE id IN (${placeholders})`,
        batchIds
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}));
app.get("/api/reporting/brand/analyses", asyncHandler(async (req, res) => {
  const brandId = req.query.brandId;
  if (!brandId) return res.json([]);
  const analyses = await queryMany(
    `SELECT * FROM brand_performance_analyses WHERE brand_id = ? ORDER BY created_at DESC`,
    [brandId]
  );
  const parsedAnalyses = analyses.map((a) => ({
    ...a,
    comparison_metrics: typeof a.comparison_metrics === "string" ? JSON.parse(a.comparison_metrics) : a.comparison_metrics
  }));
  res.json(parsedAnalyses);
}));
app.post("/api/reporting/brand/analyses", asyncHandler(async (req, res) => {
  const { brand_id, name, period_a_start, period_a_end, period_b_start, period_b_end, platform, comparison_metrics, description, next_plan } = req.body;
  const id = genId();
  await execute(
    `INSERT INTO brand_performance_analyses (id, brand_id, name, period_a_start, period_a_end, period_b_start, period_b_end, platform, comparison_metrics, description, next_plan) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, brand_id, name || null, period_a_start, period_a_end, period_b_start, period_b_end, platform, JSON.stringify(comparison_metrics || []), description, next_plan || null]
  );
  res.json({ success: true, id });
}));
app.delete("/api/reporting/brand/analyses/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  await execute(`DELETE FROM brand_performance_analyses WHERE id = ?`, [id]);
  res.json({ success: true });
}));
app.put("/api/reporting/brand/analyses/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, period_a_start, period_a_end, period_b_start, period_b_end, platform, comparison_metrics, description, next_plan } = req.body;
  await execute(
    `UPDATE brand_performance_analyses SET name=?, period_a_start=?, period_a_end=?, period_b_start=?, period_b_end=?, platform=?, comparison_metrics=?, description=?, next_plan=? WHERE id=?`,
    [name || null, period_a_start, period_a_end, period_b_start, period_b_end, platform, JSON.stringify(comparison_metrics || []), description, next_plan || null, id]
  );
  res.json({ success: true });
}));
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
        responseText = "\u{1F4CA} **[Demo Mode - No API Key Set]**\nBased on your agency data, **Amanda Putri** is the top-performing host this week, generating **Rp 77.4M** with a **4.82% average conversion rate** and a flawless **97% consistency rating**.";
      } else {
        responseText = `\u{1F916} **[Demo Mode - AI Assistant]**
I'm ready to help you coordinate Liva Media Kreatif streaming hosts!

Here are some questions you can ask me:
- "Who is the top-performing host this week?"
- "Tell me about attendance anomalies."
- "What are your smart recommendations for brand pairings?"`;
      }
      return res.json({ content: responseText, demoMode: true });
    }
    const hostsBrief = hosts ? hosts.map((h) => `${h.name} (${h.role}, ID: ${h.employeeId}, consistency: ${h.consistencyScore}%, brands: ${h.brands?.join(", ")})`).join("\n") : "";
    const logsBrief = logs ? logs.slice(0, 40).map((l) => `- ${l.date} | ${l.hostName} | Status: ${l.status} | Platform: ${l.platform} | Brand: ${l.brandHandled} | Rev: Rp ${l.revenueGenerated?.toLocaleString()} | Conv: ${l.conversionRate}% | Eng: ${l.engagementRate}%`).join("\n") : "";
    const activeAlertsBrief = alerts ? alerts.filter((a) => !a.resolved).map((a) => `ALERT: [${a.severity}] ${a.hostName} - ${a.message}`).join("\n") : "";
    const systemInstruction = `You are the Lead SaaS Workflow Architect & AI Officer for the "Host Intelligence Platform", a premium system built for "Liva Media Kreatif", an elite live streaming agency.

[ACTIVE HOST EMPLOYEES]
${hostsBrief}

[RECENT ATTENDANCE & STREAM PERFORMANCE LOGS]
${logsBrief}

[CURRENT UNRESOLVED KPI ALERTS]
${activeAlertsBrief}

Your tone should be highly professional, structured, and direct. Use formatted markdown. When talking about monetary values, use IDR formatted with standard prefixes (e.g. Rp 15.000.000).`;
    const formattedContents = messages.map((m) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: formattedContents,
      config: { systemInstruction, temperature: 0.2 }
    });
    res.json({ content: response.text || "I was unable to analyze that. Please rephrase your query.", demoMode: false });
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: "Error communicating with AI Assistant", details: getSafeErrorMessage(error) });
  }
});
app.post("/api/ai/weekly-summary", async (req, res) => {
  try {
    const { hosts, logs, alerts } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      const summaryMarkdown = `### \u{1F4CA} Liva Media Kreatif - Performance Summary

#### 1. Core Operations & Performance Highlights
- **Total Agency Streaming Revenue**: Data dari MySQL database.
- Gunakan filter di dashboard untuk melihat performa terbaru.

#### 2. \u{1F6A8} Attendance & Fraud Alerts
- Cek tab KPI Alerts untuk status terbaru.

#### 3. \u{1F4A1} Smart Recommendations
- Configure GEMINI_API_KEY untuk mendapatkan rekomendasi AI yang dipersonalisasi.`;
      return res.json({ summary: summaryMarkdown, demoMode: true });
    }
    const prompt = `Analyze the host streaming statistics and recent logs to generate a comprehensive, executive-level Agency Intelligence Summary for management.

Include three specific sections:
1. Performance Highlights
2. Attendance Anomalies & Fraud Risks
3. Actionable Recommendations

Hosts Dataset:
${JSON.stringify(hosts)}

Attendance Logs:
${JSON.stringify(logs)}

Unresolved Alerts:
${JSON.stringify(alerts)}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction: "You are an elite Operations Director and AI Analyst for a top Asian streaming MCN agency. Deliver highly structured, valuable, bulleted reports.", temperature: 0.15 }
    });
    res.json({ summary: response.text || "Could not generate summary." });
  } catch (error) {
    console.error("Summary API Error:", error);
    res.status(500).json({ error: "Failed to generate AI summary", details: getSafeErrorMessage(error) });
  }
});
app.post("/api/ai/evaluate-host", async (req, res) => {
  try {
    const { host, logs } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      const result = { score: 85, grade: "B", strengths: ["Loyal brand connection", "Engaged performance"], growthAreas: ["Continue tracking KPIs", "Improve punctuality"], recommendedAction: "Regular check-ins." };
      return res.json({ evaluation: result, demoMode: true });
    }
    const prompt = `Generate a quick, precise KPI performance scoring card for this host.
Host profile:
${JSON.stringify(host)}

Logs for past week:
${JSON.stringify(logs)}

Format your output strictly as a JSON object with properties: "score" (0-100), "grade" ("A+","A","B","C","D"), "strengths" (array of 2 strings), "growthAreas" (array of 2 strings), "recommendedAction" (string). No markdown, just JSON.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.1 }
    });
    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ evaluation: parsed, demoMode: false });
  } catch (error) {
    console.error("Evaluation API Error:", error);
    res.status(500).json({ error: "Failed to evaluate host KPI", details: getSafeErrorMessage(error) });
  }
});
app.post("/api/invoice/send-reminder", async (req, res) => {
  try {
    const { brandName, invoiceDate, toEmails, amount, invoiceNumber } = req.body;
    const cleanEmails = typeof toEmails === "string" ? toEmails.split(",").map((e) => e.trim()).filter((e) => !!e).join(", ") : toEmails;
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.json({ success: true, message: "Mock email terkirim. Konfigurasi SMTP di .env untuk mengirim secara nyata.", simulated: true });
    }
    const transporter = import_nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      connectionTimeout: 1e4,
      greetingTimeout: 1e4,
      socketTimeout: 1e4,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const mailOptions = {
      from: process.env.SMTP_FROM || '"Liva Agency" <no-reply@liva-agency.com>',
      to: cleanEmails,
      subject: "PEMBERITAHUAN PENAGIHAN INVOICE: " + brandName + " (Ref: " + (/* @__PURE__ */ new Date()).getTime().toString().slice(-6) + ")",
      html: `<div style='font-family: sans-serif; padding: 20px; line-height: 1.5; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;'><h2 style='color: #4f46e5;'>\u{1F514} Reminder Penagihan Invoice</h2><p>Halo Tim Admin PIC,</p><p>Ini adalah pengingat dari sistem otomatis bahwa sebuah invoice telah mencapai tanggal penagihan hari ini.</p><div style='background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;'><strong>Brand / Klien:</strong> ${brandName}<br/><strong>No. Invoice:</strong> ${invoiceNumber || "N/A"}<br/><strong>Tanggal Tagih:</strong> ${invoiceDate}<br/><strong>Total Tagihan:</strong> ${amount ? "Rp " + amount.toLocaleString("id-ID") : "N/A"}<br/></div><p>Mohon segera memeriksa dan memproses penagihan ke klien tersebut.</p><br/><p>Terima kasih,<br/><strong>Sistem Liva Agency</strong></p></div>`
    };
    const info = await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: "Email berhasil dikirim.", simulated: false, messageId: info.messageId });
  } catch (err) {
    console.error("Invoice Email Error:", err);
    return res.status(500).json({ error: "Gagal memproses request pengiriman", details: err.message || "Timeout" });
  }
});
app.get("/api/db-test", async (req, res) => {
  try {
    const session = getRequestSession(req);
    if (!canAccessDbTest(session)) {
      return res.status(403).json({ success: false, message: "Akses tidak diizinkan." });
    }
    const db = getPool();
    const [rows] = await db.query("SELECT 1 as result");
    res.json({ success: true, message: "Koneksi MySQL berhasil tersambung!", data: rows });
  } catch (error) {
    console.error("Database connection test failed:", error);
    res.status(500).json({ success: false, message: `Gagal terhubung ke MySQL: ${error.message}` });
  }
});
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: getSafeErrorMessage(err) });
});
async function runMigrations() {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, []);
    console.log("\u2705 Migration: Tabel global_settings dipastikan ada.");
  } catch (e) {
    console.warn("Migration global_settings warning:", e?.message);
  }
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS host_activity_logs (
        id VARCHAR(100) PRIMARY KEY,
        host_id VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_host_id (host_id),
        INDEX idx_created_at (created_at)
      )
    `, []);
    console.log("\u2705 Migration: Tabel host_activity_logs dipastikan ada.");
  } catch (e) {
    console.warn("Migration host_activity_logs warning:", e?.message);
  }
  try {
    await execute(`ALTER TABLE shift_schedules ADD COLUMN studio VARCHAR(255) NULL`, []);
    console.log("\u2705 Migration: kolom studio ditambahkan ke shift_schedules.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom studio sudah ada di shift_schedules.");
    } else {
      console.warn("Migration studio column warning:", e?.message);
    }
  }
  try {
    await execute(`ALTER TABLE hosts ADD COLUMN bank_name VARCHAR(100) NULL`, []);
    console.log("\u2705 Migration: kolom bank_name ditambahkan ke hosts.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom bank_name sudah ada di hosts.");
    } else {
      console.warn("Migration bank_name warning:", e?.message);
    }
  }
  try {
    await execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, []);
    console.log("\u2705 Migration: tabel reporting_upload_batches dipastikan ada.");
  } catch (e) {
    console.warn("Migration reporting_upload_batches warning:", e?.message);
  }
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS reporting_upload_rows (
        id                 VARCHAR(140)  NOT NULL,
        batch_id           VARCHAR(100)   NOT NULL,
        brand_id           VARCHAR(100)   DEFAULT NULL,
        brand_name         VARCHAR(255)   DEFAULT NULL,
        platform           VARCHAR(100)   DEFAULT NULL,
        source_kind        VARCHAR(50)    DEFAULT NULL,
        report_type        VARCHAR(50)    DEFAULT NULL,
        title              VARCHAR(255)   DEFAULT NULL,
        report_date        DATE          DEFAULT NULL,
        report_datetime    DATETIME      DEFAULT NULL,
        shift              VARCHAR(100)  DEFAULT NULL,
        duration           INT           DEFAULT 0,
        gmv                DECIMAL(18,2) DEFAULT 0,
        products_sold      DECIMAL(18,2) DEFAULT 0,
        buyers             DECIMAL(18,2) DEFAULT 0,
        aov                DECIMAL(18,2) DEFAULT 0,
        views              DECIMAL(18,2) DEFAULT 0,
        impressions        DECIMAL(18,2) DEFAULT 0,
        penonton           DECIMAL(18,2) DEFAULT 0,
        live_visits        DECIMAL(18,2) DEFAULT 0,
        product_impressions DECIMAL(18,2) DEFAULT 0,
        clicks             DECIMAL(18,2) DEFAULT 0,
        orders             DECIMAL(18,2) DEFAULT 0,
        followers          DECIMAL(18,2) DEFAULT 0,
        likes              DECIMAL(18,2) DEFAULT 0,
        shares             DECIMAL(18,2) DEFAULT 0,
        comments           DECIMAL(18,2) DEFAULT 0,
        avg_view_duration  INT           DEFAULT 0,
        peak_viewers       DECIMAL(18,2) DEFAULT 0,
        shop_vouchers      DECIMAL(18,2) DEFAULT 0,
        special_vouchers   DECIMAL(18,2) DEFAULT 0,
        coins_claimed      DECIMAL(18,2) DEFAULT 0,
        has_funnel_in_file TINYINT(1)     DEFAULT 0,
        raw_payload        JSON          DEFAULT NULL,
        uploaded_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (batch_id) REFERENCES reporting_upload_batches(id) ON DELETE CASCADE,
        FOREIGN KEY (brand_id) REFERENCES client_brands(id) ON DELETE SET NULL,
        INDEX idx_reporting_rows_batch (batch_id),
        INDEX idx_reporting_rows_brand (brand_id),
        INDEX idx_reporting_rows_platform (platform),
        INDEX idx_reporting_rows_source_kind (source_kind),
        INDEX idx_reporting_rows_report_date (report_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, []);
    console.log("\u2705 Migration: tabel reporting_upload_rows dipastikan ada.");
  } catch (e) {
    console.warn("Migration reporting_upload_rows warning:", e?.message);
  }
  try {
    await execute(`ALTER TABLE client_brands ADD COLUMN logo_url VARCHAR(255) NULL`, []);
    console.log("\u2705 Migration: kolom logo_url ditambahkan ke client_brands.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom logo_url sudah ada di client_brands.");
    } else {
      console.warn("Migration logo_url column warning:", e?.message);
    }
  }
  try {
    await execute(`ALTER TABLE client_brands ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`, []);
    console.log("\u2705 Migration: kolom is_active ditambahkan ke client_brands.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom is_active sudah ada di client_brands.");
    } else {
      console.warn("Migration is_active column warning:", e?.message);
    }
  }
  try {
    await execute(`ALTER TABLE reporting_upload_rows ADD COLUMN duration INT DEFAULT 0`, []);
    console.log("\u2705 Migration: kolom duration ditambahkan ke reporting_upload_rows.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom duration sudah ada di reporting_upload_rows.");
    } else {
      console.warn("Migration duration column warning:", e?.message);
    }
  }
  try {
    await execute(
      `
        UPDATE reporting_upload_rows
        SET duration = COALESCE(
          NULLIF(duration, 0),
          CAST(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(raw_payload, '$.duration')), '') AS UNSIGNED),
          0
        )
        WHERE (duration IS NULL OR duration = 0) AND raw_payload IS NOT NULL
      `,
      []
    );
    console.log("\u2705 Migration: duration reporting_upload_rows diisi dari raw_payload bila ada.");
  } catch (e) {
    console.warn("Migration duration backfill warning:", e?.message);
  }
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS host_violations (
        id VARCHAR(150) PRIMARY KEY,
        host_id VARCHAR(150) NOT NULL,
        brand_id VARCHAR(150) NULL,
        shift VARCHAR(100) NULL,
        platform VARCHAR(100) NULL,
        violation_type TEXT NULL,
        proof_url VARCHAR(255) NULL,
        consequence TEXT NULL,
        violation_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `, []);
    console.log("\u2705 Migration: tabel host_violations dipastikan ada.");
  } catch (e) {
    console.warn("Migration host_violations warning:", e?.message);
  }
  try {
    await execute(`ALTER TABLE host_violations ADD COLUMN violation_date DATE NULL`, []);
    console.log("\u2705 Migration: kolom violation_date ditambahkan ke host_violations.");
  } catch (e) {
    if (e?.code === "ER_DUP_FIELDNAME") {
      console.log("\u2705 Migration: kolom violation_date sudah ada di host_violations.");
    } else {
      console.warn("Migration violation_date column warning:", e?.message);
    }
  }
  for (const [tbl, constraintGuess] of [
    ["reporting_upload_batches", "reporting_upload_batches_ibfk_1"],
    ["reporting_upload_rows", "reporting_upload_rows_ibfk_1"],
    ["reporting_upload_rows", "reporting_upload_rows_ibfk_2"]
  ]) {
    try {
      await execute(`ALTER TABLE ${tbl} DROP FOREIGN KEY ${constraintGuess}`, []);
      console.log(`\u2705 Migration: FK ${constraintGuess} dihapus dari ${tbl}.`);
    } catch (e) {
      if (e?.code !== "ER_CANT_DROP_FIELD_OR_KEY") {
        console.log(`\u2139\uFE0F  Migration: FK ${constraintGuess} di ${tbl}: ${e?.message}`);
      }
    }
  }
}
async function bootstrap() {
  try {
    getSessionSecret();
  } catch (err) {
    console.warn("\u26A0\uFE0F getSessionSecret warning:", err?.message);
  }
  app.get("/api/health", async (req, res) => {
    let dbStatus = "disconnected";
    try {
      const pool2 = getPool();
      await pool2.query("SELECT 1");
      dbStatus = "connected";
    } catch (e) {
      dbStatus = `error: ${e?.message || "unknown"}`;
    }
    res.json({
      status: "ok",
      app: "projectliva",
      node_env: process.env.NODE_ENV,
      database: dbStatus,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  try {
    await runMigrations();
  } catch (err) {
    console.warn("\u26A0\uFE0F Warning pada migrasi legacy:", err?.message);
  }
  try {
    await runProjectAppMigrations();
  } catch (err) {
    console.warn("\u26A0\uFE0F Warning pada migrasi project app:", err?.message);
  }
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  if (typeof PORT === "string" && isNaN(Number(PORT))) {
    app.listen(PORT, () => {
      console.log(`\u{1F680} Liva Media Kreatif Server berjalan di socket ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  } else {
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`\u{1F680} Liva Media Kreatif Server berjalan di port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
  }
}
bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map

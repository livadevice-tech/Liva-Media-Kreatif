import nodemailer from 'nodemailer';
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dns from "dns";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  type AuthSession,
  canAccessDbTest,
  hashPasswordForStorage,
  isRequestAllowed,
} from "./server/auth";
import { execute, getPool, queryMany, queryOne } from "./server/db";
import {
  allowLoginAttempt,
  createAuthSessionToken,
  getRequestSession,
  getSessionSecret,
  setSessionCookie,
  SESSION_TTL_SECONDS,
  isStoredPasswordValid,
} from "./server/session";
import {
  asyncHandler,
  genId,
  getSafeErrorMessage,
} from "./server/http";
import { registerHostRoutes } from "./server/routes/hosts";
import { registerOperationsRoutes } from "./server/routes/operations";
import { registerClientRoutes } from "./server/routes/client";
import { validateProductionConfig } from "./server/productionConfig";

dns.setDefaultResultOrder('ipv4first');
dotenv.config();

const productionConfigErrors = validateProductionConfig(process.env);
if (productionConfigErrors.length > 0) {
  throw new Error(`Konfigurasi production tidak valid:\n- ${productionConfigErrors.join("\n- ")}`);
}

const app = express();
const PORT = parseInt(process.env.PORT || "3000");

declare global {
  namespace Express {
    interface Request {
      auth?: AuthSession;
    }
  }
}

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// ==================================================================
// Authentication
// ==================================================================

app.post("/api/auth/login", asyncHandler(async (req, res) => {
  const role = String(req.body?.role || "");
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (!allowLoginAttempt(req.ip || req.socket.remoteAddress || "unknown")) {
    return res.status(429).json({ error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." });
  }
  if (!username || !password || username.length > 150 || password.length > 300) {
    return res.status(400).json({ error: "Username atau password tidak valid." });
  }

  let session: AuthSession | null = null;
  if (role === "admin") {
    const masterUsername = process.env.ADMIN_USERNAME || "";
    const masterPassword = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";
    if (
      masterUsername &&
      username === masterUsername &&
      isStoredPasswordValid(password, masterPassword)
    ) {
      session = { role: "master", subjectId: "master", expiresAt: 0 };
    } else {
      const admin = await queryOne(
        `SELECT id, password_hash FROM admin_accounts WHERE LOWER(username) = LOWER(?) LIMIT 1`,
        [username],
      );
      if (admin && isStoredPasswordValid(password, admin.password_hash || "")) {
        const tabs = await queryMany(
          `SELECT tab_name FROM admin_access_tabs WHERE admin_id = ?`,
          [admin.id],
        );
        session = {
          role: "admin",
          subjectId: admin.id,
          expiresAt: 0,
          accessTabs: tabs.map((tab: any) => tab.tab_name),
        };
      }
    }
  } else if (role === "host") {
    const host = await queryOne(
      `SELECT id, password_hash FROM hosts WHERE LOWER(username) = LOWER(?) LIMIT 1`,
      [username],
    );
    if (host && isStoredPasswordValid(password, host.password_hash || "")) {
      session = { role: "host", subjectId: host.id, expiresAt: 0 };
    }
  } else if (role === "brand") {
    const brand = await queryOne(
      `SELECT id, client_password FROM client_brands WHERE LOWER(client_username) = LOWER(?) LIMIT 1`,
      [username],
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

  const session = getRequestSession(req);
  if (!session) return res.status(401).json({ error: "Autentikasi diperlukan." });

  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.get("origin");
    if (origin) {
      const proto = (req.get("x-forwarded-proto") || req.protocol).split(",")[0].trim();
      const expectedOrigin = `${proto}://${req.get("host")}`;
      const configuredOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
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
// SETTINGS / GLOBAL CONFIGS
// ==================================================================
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
  if (key === "liva_global_configs") {
    if (typeof value === "string") value = JSON.parse(value);
    if (value && typeof value === "object") delete value.adminCredentials;
  }
  return res.json(value);
}));

app.post("/api/settings/:key", asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (key === "adminCredentials") {
    return res.status(403).json({ error: "Kredensial admin dikelola oleh server." });
  }
  const value = req.body && typeof req.body === "object"
    ? { ...req.body }
    : req.body;
  if (key === "liva_global_configs" && value) delete value.adminCredentials;
  await execute(`
    INSERT INTO global_settings (setting_key, setting_value) 
    VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE setting_value = ?
  `, [key, JSON.stringify(value), JSON.stringify(value)]);
  res.json({ success: true, key });
}));

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
    `, filterParams),
  ]);

  const summaryMap = new Map<string, any>();

  for (const batch of batchRows as any[]) {
    const key = batch.brandId || "";
    if (!key) continue;
    summaryMap.set(key, {
      brandId: key,
      brandName: batch.brandName || "",
      batchCount: Number(batch.batchCount || 0),
      sessionCount: 0,
      totalGmv: Number(batch.totalGmv || 0),
    });
  }

  for (const row of rowRows as any[]) {
    const key = row.brandId || "";
    if (!key) continue;
    const current = summaryMap.get(key) || {
      brandId: key,
      brandName: "",
      batchCount: 0,
      sessionCount: 0,
      totalGmv: 0,
    };
    current.sessionCount = Number(row.sessionCount || 0);
    summaryMap.set(key, current);
  }

  res.json(Array.from(summaryMap.values()));
}));

const mapReportingBatch = (row: any) => ({
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
  updatedAt: row.updated_at,
});

const mapReportingRow = (row: any) => ({
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
  uploadedAt: row.uploaded_at,
});

app.get("/api/reporting/brand", asyncHandler(async (req, res) => {
  const { platform, sourceKind } = req.query as Record<string, string>;
  const brandId = req.auth?.role === "brand"
    ? req.auth.subjectId
    : String(req.query.brandId || "");

  const batchParams: any[] = [];
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

  const rowParams: any[] = [];
  // raw_payload sengaja tidak dikirim ke halaman dashboard. Kolom JSON ini hanya
  // diperlukan sebagai arsip impor dan dapat membuat response menjadi sangat besar.
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
    queryMany(rowSql, rowParams),
  ]);

  res.json({
    batches: batchRows.map(mapReportingBatch),
    rows: rowRows.map(mapReportingRow),
  });
}));

app.post("/api/reporting/brand/batch", asyncHandler(async (req, res) => {
  const { batch, rows } = req.body || {};
  if (!batch || !batch.id) {
    return res.status(400).json({ error: "Batch reporting tidak valid." });
  }

  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

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
      Number(batch.gmv || 0),
    ]);

    const rowsArray = Array.isArray(rows) ? rows : [];
    if (rowsArray.length > 0) {
      const rowPlaceholder = `(${Array.from({ length: 34 }, () => "?").join(",")})`;
      const rowSql = `
        INSERT INTO reporting_upload_rows (
          id, batch_id, brand_id, brand_name, platform, source_kind, report_type, title, report_date, report_datetime, shift,
          duration, gmv, products_sold, buyers, aov, views, impressions, penonton, live_visits, product_impressions, clicks, orders,
          followers, likes, shares, comments, avg_view_duration, peak_viewers, shop_vouchers, special_vouchers, coins_claimed,
          has_funnel_in_file, raw_payload
        ) VALUES ${rowsArray.map(() => rowPlaceholder).join(",")}
      `;
      const params: any[] = [];
      for (const row of rowsArray) {
        params.push(
          row.id,
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
          JSON.stringify(row),
        );
      }
      await conn.execute(rowSql, params);
    }

    await conn.commit();
    res.status(201).json({ success: true, id: batch.id, rowCount: rowsArray.length });
  } catch (e: any) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}));

app.post("/api/reporting/brand/delete-many", asyncHandler(async (req, res) => {
  const batchIds: string[] = Array.isArray(req.body?.batchIds) ? req.body.batchIds.filter(Boolean) : [];
  const logIds: string[] = Array.isArray(req.body?.logIds) ? req.body.logIds.filter(Boolean) : [];
  const db = getPool();
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    if (logIds.length > 0) {
      const placeholders = logIds.map(() => "?").join(",");
      const [affectedRows] = await conn.execute<any[]>(
        `SELECT DISTINCT batch_id FROM reporting_upload_rows WHERE id IN (${placeholders})`,
        logIds,
      );
      await conn.execute(
        `DELETE FROM reporting_upload_rows WHERE id IN (${placeholders})`,
        logIds,
      );

      const affectedBatchIds = (affectedRows as any[]).map((r: any) => r.batch_id).filter(Boolean);
      for (const batchId of affectedBatchIds) {
        const [summaryRows] = await conn.execute<any[]>(
          `SELECT COUNT(*) AS rowCount, COALESCE(SUM(gmv), 0) AS totalGmv FROM reporting_upload_rows WHERE batch_id = ?`,
          [batchId],
        );
        const summary = (summaryRows as any[])[0];
        const rowCount = Number(summary?.rowCount || 0);
        const totalGmv = Number(summary?.totalGmv || 0);

        if (rowCount === 0) {
          await conn.execute(`DELETE FROM reporting_upload_batches WHERE id = ?`, [batchId]);
        } else {
          await conn.execute(
            `UPDATE reporting_upload_batches SET row_count = ?, total_gmv = ? WHERE id = ?`,
            [rowCount, totalGmv, batchId],
          );
        }
      }
    }

    if (batchIds.length > 0) {
      const placeholders = batchIds.map(() => "?").join(",");
      await conn.execute(
        `DELETE FROM reporting_upload_batches WHERE id IN (${placeholders})`,
        batchIds,
      );
    }

    await conn.commit();
    res.json({ success: true });
  } catch (e: any) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
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
    const session = getRequestSession(req);
    if (!canAccessDbTest(session)) {
      return res.status(403).json({ success: false, message: "Akses tidak diizinkan." });
    }
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
async function runMigrations() {
  try {
    // Create global_settings table
    await execute(`
      CREATE TABLE IF NOT EXISTS global_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, []);
    console.log('✅ Migration: Tabel global_settings dipastikan ada.');
  } catch (e: any) {
    console.warn('Migration global_settings warning:', e?.message);
  }

  try {
    // Tambah kolom studio ke shift_schedules jika belum ada
    // Tidak pakai IF NOT EXISTS karena MySQL lama (sebelum 8.0) tidak support
    await execute(`ALTER TABLE shift_schedules ADD COLUMN studio VARCHAR(255) NULL`, []);
    console.log('✅ Migration: kolom studio ditambahkan ke shift_schedules.');
  } catch (e: any) {
    if (e?.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration: kolom studio sudah ada di shift_schedules.');
    } else {
      console.warn('Migration studio column warning:', e?.message);
    }
  }

  try {
    // Tambah kolom bank_name ke hosts jika belum ada
    await execute(`ALTER TABLE hosts ADD COLUMN bank_name VARCHAR(100) NULL`, []);
    console.log('✅ Migration: kolom bank_name ditambahkan ke hosts.');
  } catch (e: any) {
    if (e?.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration: kolom bank_name sudah ada di hosts.');
    } else {
      console.warn('Migration bank_name warning:', e?.message);
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
    console.log('✅ Migration: tabel reporting_upload_batches dipastikan ada.');
  } catch (e: any) {
    console.warn('Migration reporting_upload_batches warning:', e?.message);
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
    console.log('✅ Migration: tabel reporting_upload_rows dipastikan ada.');
  } catch (e: any) {
    console.warn('Migration reporting_upload_rows warning:', e?.message);
  }

  try {
    await execute(`ALTER TABLE client_brands ADD COLUMN logo_url VARCHAR(255) NULL`, []);
    console.log('✅ Migration: kolom logo_url ditambahkan ke client_brands.');
  } catch (e: any) {
    if (e?.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration: kolom logo_url sudah ada di client_brands.');
    } else {
      console.warn('Migration logo_url column warning:', e?.message);
    }
  }

  try {
    await execute(`ALTER TABLE client_brands ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1`, []);
    console.log('✅ Migration: kolom is_active ditambahkan ke client_brands.');
  } catch (e: any) {
    if (e?.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration: kolom is_active sudah ada di client_brands.');
    } else {
      console.warn('Migration is_active column warning:', e?.message);
    }
  }

  try {
    await execute(`ALTER TABLE reporting_upload_rows ADD COLUMN duration INT DEFAULT 0`, []);
    console.log('✅ Migration: kolom duration ditambahkan ke reporting_upload_rows.');
  } catch (e: any) {
    if (e?.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Migration: kolom duration sudah ada di reporting_upload_rows.');
    } else {
      console.warn('Migration duration column warning:', e?.message);
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
      [],
    );
    console.log('✅ Migration: duration reporting_upload_rows diisi dari raw_payload bila ada.');
  } catch (e: any) {
    console.warn('Migration duration backfill warning:', e?.message);
  }
}

async function bootstrap() {
  getSessionSecret();
  await runMigrations();

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

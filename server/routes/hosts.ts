import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";
import { hashPasswordForStorage } from "../auth";
import {
  normalizeHostStudioLocation,
  resolveHostPasswordHash,
} from "../../src/shared/utils/hostCredentials";

function mapHost(host: any) {
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

export function registerHostRoutes(app: Express) {
  app.get("/api/host-activity-logs", asyncHandler(async (req, res) => {
    const { hostId, date, search, limit } = req.query as any;
    let sql = `
      SELECT 
        l.id,
        l.host_id,
        l.action,
        l.details,
        CONVERT_TZ(l.created_at, @@session.time_zone, '+07:00') as created_at,
        h.name as host_name 
      FROM host_activity_logs l 
      LEFT JOIN hosts h ON l.host_id = h.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    if (hostId && hostId !== 'all') {
      sql += ` AND (l.host_id = ? OR h.name = ?)`;
      params.push(hostId, hostId);
    }
    if (date && date !== 'all') {
      sql += ` AND DATE(CONVERT_TZ(l.created_at, @@session.time_zone, '+07:00')) = ?`;
      params.push(date);
    }
    if (search) {
      sql += ` AND (h.name LIKE ? OR l.action LIKE ? OR l.details LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY l.created_at DESC LIMIT ?`;
    params.push(limit ? Math.min(Math.max(parseInt(limit, 10), 1), 5000) : 1000);

    const logs = await queryMany(sql, params);
    const mappedLogs = logs.map((l: any) => {
      let createdAt = l.created_at;
      if (typeof createdAt === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(createdAt)) {
        createdAt = createdAt.replace(' ', 'T') + '+07:00';
      }
      return {
        ...l,
        created_at: createdAt
      };
    });
    res.json(mappedLogs);
  }));

  app.post("/api/host-activity-logs", asyncHandler(async (req, res) => {
    const { hostId, action, details } = req.body;
    const id = genId("act");
    await execute(`
      INSERT INTO host_activity_logs (id, host_id, action, details)
      VALUES (?, ?, ?, ?)
    `, [id, hostId, action, details ? JSON.stringify(details) : null]);
    res.status(201).json({ id });
  }));

  app.get("/api/hosts", asyncHandler(async (req, res) => {
    const hosts = await queryMany(`SELECT * FROM hosts ORDER BY name ASC`);

    for (const host of hosts) {
      const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
      const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
      host.platforms = platforms.map((p: any) => p.platform);
      host.brands = brands.map((b: any) => b.brand);
      mapHost(host);
    }

    res.json(hosts);
  }));

  app.get("/api/hosts/:id", asyncHandler(async (req: Request, res: Response) => {
    const host = await queryOne(`SELECT * FROM hosts WHERE id = ?`, [req.params.id]);
    if (!host) return res.status(404).json({ error: "Host tidak ditemukan" });

    const platforms = await queryMany(`SELECT platform FROM host_platforms WHERE host_id = ?`, [host.id]);
    const brands = await queryMany(`SELECT brand FROM host_brands WHERE host_id = ?`, [host.id]);
    host.platforms = platforms.map((p: any) => p.platform);
    host.brands = brands.map((b: any) => b.brand);
    host.hasPassword = Boolean(host.password_hash);
    host.password = "";
    delete host.password_hash;
    host.bankName = host.bank_name;

    res.json(host);
  }));

  app.post("/api/hosts", asyncHandler(async (req: Request, res: Response) => {
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
      id, h.name, h.employeeId, h.avatar || null, h.role || null,
      h.baseMonthlyTargetHours || 0, h.baseMonthlyTargetRevenue || 0,
      h.consistencyScore || 0, h.joinedDate || null,
      h.email || null, h.phone || null,
      h.username || null, resolveHostPasswordHash(h.password, null, hashPasswordForStorage),
      h.bankAccount || null, h.bankName || null, studio,
      h.hostType || "Reguler",
      h.customWorkingDaysTarget ?? null,
      h.customBaseSalary ?? null,
      h.customShiftRate ?? null,
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

  app.put("/api/hosts/:id", asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const h = req.body;
    const studio = normalizeHostStudioLocation(h.studio) || null;

    const existing = await queryOne(`SELECT password_hash FROM hosts WHERE id = ?`, [id]);
    const passwordHash = resolveHostPasswordHash(
      h.password,
      existing?.password_hash,
      hashPasswordForStorage,
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
      h.name, h.employeeId, h.avatar || null, h.role || null,
      h.baseMonthlyTargetHours || 0, h.baseMonthlyTargetRevenue || 0,
      h.consistencyScore || 0, h.joinedDate || null,
      h.email || null, h.phone || null,
      h.username || null, passwordHash, h.bankAccount || null, h.bankName || null, studio,
      h.hostType || "Reguler",
      h.customWorkingDaysTarget ?? null,
      h.customBaseSalary ?? null,
      h.customShiftRate ?? null,
      id,
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

  app.delete("/api/hosts/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM hosts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  // ==================================================================
  // HOST NOTIFICATIONS (PWA & IN-APP INBOX)
  // ==================================================================
  app.get("/api/host-notifications", asyncHandler(async (req: Request, res: Response) => {
    const session = (req as any).authSession;
    let sql = `
      SELECT 
        id, 
        host_id as hostId, 
        title, 
        message, 
        date_str as date, 
        type, 
        is_read as \`read\`, 
        CONVERT_TZ(created_at, @@session.time_zone, '+07:00') as createdAt
      FROM host_notifications
    `;
    const params: any[] = [];
    if (session?.role === 'host') {
      sql += ` WHERE host_id = ? OR host_id = 'all'`;
      params.push(session.subjectId);
    } else if (req.query.hostId) {
      sql += ` WHERE host_id = ? OR host_id = 'all'`;
      params.push(req.query.hostId);
    }
    sql += ` ORDER BY created_at DESC LIMIT 300`;

    const rows = await queryMany(sql, params);
    res.json(rows.map(r => ({ ...r, read: Boolean(r.read) })));
  }));

  app.post("/api/host-notifications/broadcast", asyncHandler(async (req: Request, res: Response) => {
    const { hostIds, title, message, dateRangeStr } = req.body;
    if (!Array.isArray(hostIds) || hostIds.length === 0 || !title) {
      return res.status(400).json({ error: "Data broadcast tidak lengkap." });
    }

    for (const hId of hostIds) {
      const notifId = `hnotif_${Date.now()}_${hId}_${Math.random().toString(36).substring(2, 6)}`;
      await execute(`
        INSERT INTO host_notifications (id, host_id, title, message, date_str, type, is_read)
        VALUES (?, ?, ?, ?, ?, 'schedule_broadcast', 0)
      `, [notifId, hId, title, message, dateRangeStr || null]);
    }

    res.json({ success: true, count: hostIds.length });
  }));

  app.put("/api/host-notifications/mark-read", asyncHandler(async (req: Request, res: Response) => {
    const { hostId, id } = req.body;
    if (id) {
      await execute(`UPDATE host_notifications SET is_read = 1 WHERE id = ?`, [id]);
    } else if (hostId) {
      await execute(`UPDATE host_notifications SET is_read = 1 WHERE host_id = ?`, [hostId]);
    }
    res.json({ success: true });
  }));
}

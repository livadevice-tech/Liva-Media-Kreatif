import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";
import { hashPasswordForStorage } from "../auth";

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
  host.password = "";
  delete host.password_hash;
}

export function registerHostRoutes(app: Express) {
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
    host.password = "";
    delete host.password_hash;
    host.bankName = host.bank_name;

    res.json(host);
  }));

  app.post("/api/hosts", asyncHandler(async (req: Request, res: Response) => {
    const h = req.body;
    const id = h.id || genId("host");

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
      h.username || null, h.password ? hashPasswordForStorage(h.password) : null,
      h.bankAccount || null, h.bankName || null, h.studio || null,
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

    const existing = await queryOne(`SELECT password_hash FROM hosts WHERE id = ?`, [id]);
    const passwordHash = h.password
      ? hashPasswordForStorage(h.password)
      : existing?.password_hash || null;

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
      h.username || null, passwordHash, h.bankAccount || null, h.bankName || null, h.studio || null,
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
}

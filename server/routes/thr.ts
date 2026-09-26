import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";

function mapPeriod(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    year: Number(row.year),
    holidayName: row.holiday_name,
    holidayDate: row.holiday_date ? String(row.holiday_date).split("T")[0] : "",
    paymentStatus: row.payment_status || "Draft",
    paymentDate: row.payment_date ? String(row.payment_date).split("T")[0] : null,
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    totalEmployees: Number(row.total_employees || 0),
    totalBudget: Number(row.total_budget || 0),
    paidBudget: Number(row.paid_budget || 0),
  };
}

function mapItem(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    periodId: row.period_id,
    employeeType: row.employee_type || "host",
    employeeId: row.employee_id || null,
    employeeCode: row.employee_code || null,
    name: row.name,
    role: row.role || null,
    department: row.department || null,
    joinedDate: row.joined_date ? String(row.joined_date).split("T")[0] : "",
    tenureMonths: Number(row.tenure_months || 0),
    basicSalary: Number(row.basic_salary || 0),
    fixedAllowance: Number(row.fixed_allowance || 0),
    thrBaseSalary: Number(row.thr_base_salary || 0),
    calculatedThr: Number(row.calculated_thr || 0),
    adjustmentAmount: Number(row.adjustment_amount || 0),
    finalThr: Number(row.final_thr || 0),
    isEligible: Boolean(row.is_eligible),
    status: row.status || "Pending",
    bankName: row.bank_name || null,
    bankAccount: row.bank_account || null,
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function registerThrRoutes(app: Express) {
  /**
   * GET /api/thr/periods
   * Ambil semua riwayat periode THR beserta ringkasan metrik budget
   */
  app.get("/api/thr/periods", asyncHandler(async (_req: Request, res: Response) => {
    const rows = await queryMany(`
      SELECT 
        p.*,
        COUNT(i.id) AS total_employees,
        COALESCE(SUM(i.final_thr), 0) AS total_budget,
        COALESCE(SUM(CASE WHEN i.status = 'Dibayar' THEN i.final_thr ELSE 0 END), 0) AS paid_budget
      FROM thr_periods p
      LEFT JOIN thr_items i ON p.id = i.period_id
      GROUP BY p.id
      ORDER BY p.year DESC, p.holiday_date DESC
    `);
    res.json(rows.map(mapPeriod));
  }));

  /**
   * POST /api/thr/periods
   * Buat periode THR baru
   */
  app.post("/api/thr/periods", asyncHandler(async (req: Request, res: Response) => {
    const { year, holidayName, holidayDate, paymentStatus, notes } = req.body;
    if (!holidayName || !holidayDate) {
      return res.status(400).json({ error: "Nama dan tanggal hari raya wajib diisi" });
    }

    const id = req.body.id || genId("thr_period");
    const periodYear = year || new Date(holidayDate).getFullYear();

    await execute(`
      INSERT INTO thr_periods (id, year, holiday_name, holiday_date, payment_status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, periodYear, holidayName, holidayDate, paymentStatus || "Draft", notes || null]);

    const created = await queryOne(`SELECT * FROM thr_periods WHERE id = ?`, [id]);
    res.status(201).json(mapPeriod(created));
  }));

  /**
   * GET /api/thr/periods/:id
   * Ambil detail periode THR tunggal
   */
  app.get("/api/thr/periods/:id", asyncHandler(async (req: Request, res: Response) => {
    const period = await queryOne(`
      SELECT 
        p.*,
        COUNT(i.id) AS total_employees,
        COALESCE(SUM(i.final_thr), 0) AS total_budget,
        COALESCE(SUM(CASE WHEN i.status = 'Dibayar' THEN i.final_thr ELSE 0 END), 0) AS paid_budget
      FROM thr_periods p
      LEFT JOIN thr_items i ON p.id = i.period_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [req.params.id]);

    if (!period) {
      return res.status(404).json({ error: "Periode THR tidak ditemukan" });
    }
    res.json(mapPeriod(period));
  }));

  /**
   * PUT /api/thr/periods/:id
   * Update informasi periode THR (status, tanggal, hari raya, catatan)
   */
  app.put("/api/thr/periods/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { year, holidayName, holidayDate, paymentStatus, paymentDate, notes } = req.body;

    const existing = await queryOne(`SELECT id FROM thr_periods WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: "Periode THR tidak ditemukan" });
    }

    await execute(`
      UPDATE thr_periods
      SET year = COALESCE(?, year),
          holiday_name = COALESCE(?, holiday_name),
          holiday_date = COALESCE(?, holiday_date),
          payment_status = COALESCE(?, payment_status),
          payment_date = ?,
          notes = ?
      WHERE id = ?
    `, [
      year ?? null,
      holidayName ?? null,
      holidayDate ?? null,
      paymentStatus ?? null,
      paymentDate || null,
      notes !== undefined ? notes : null,
      id
    ]);

    const updated = await queryOne(`
      SELECT 
        p.*,
        COUNT(i.id) AS total_employees,
        COALESCE(SUM(i.final_thr), 0) AS total_budget,
        COALESCE(SUM(CASE WHEN i.status = 'Dibayar' THEN i.final_thr ELSE 0 END), 0) AS paid_budget
      FROM thr_periods p
      LEFT JOIN thr_items i ON p.id = i.period_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    res.json(mapPeriod(updated));
  }));

  /**
   * DELETE /api/thr/periods/:id
   * Hapus periode THR beserta seluruh rincian penerima
   */
  app.delete("/api/thr/periods/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await execute(`DELETE FROM thr_items WHERE period_id = ?`, [id]);
    await execute(`DELETE FROM thr_periods WHERE id = ?`, [id]);
    res.json({ success: true, message: "Periode THR berhasil dihapus" });
  }));

  /**
   * GET /api/thr/periods/:id/items
   * Ambil seluruh rincian penerima THR pada periode tertentu
   */
  app.get("/api/thr/periods/:id/items", asyncHandler(async (req: Request, res: Response) => {
    const items = await queryMany(`
      SELECT * FROM thr_items
      WHERE period_id = ?
      ORDER BY employee_type ASC, name ASC
    `, [req.params.id]);
    res.json(items.map(mapItem));
  }));

  /**
   * POST /api/thr/periods/:id/items
   * Tambah data karyawan baru (karyawan ops atau host tambahan)
   */
  app.post("/api/thr/periods/:id/items", asyncHandler(async (req: Request, res: Response) => {
    const periodId = req.params.id;
    const body = req.body;
    const id = body.id || genId("thr_item");

    await execute(`
      INSERT INTO thr_items (
        id, period_id, employee_type, employee_id, employee_code,
        name, role, department, joined_date, tenure_months,
        basic_salary, fixed_allowance, thr_base_salary, calculated_thr,
        adjustment_amount, final_thr, is_eligible, status,
        bank_name, bank_account, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      periodId,
      body.employeeType || "ops",
      body.employeeId || null,
      body.employeeCode || null,
      body.name,
      body.role || null,
      body.department || null,
      body.joinedDate,
      body.tenureMonths || 0,
      body.basicSalary || 0,
      body.fixedAllowance || 0,
      body.thrBaseSalary || body.basicSalary || 0,
      body.calculatedThr || 0,
      body.adjustmentAmount || 0,
      body.finalThr || 0,
      body.isEligible !== undefined ? (body.isEligible ? 1 : 0) : 1,
      body.status || "Pending",
      body.bankName || null,
      body.bankAccount || null,
      body.notes || null,
    ]);

    const created = await queryOne(`SELECT * FROM thr_items WHERE id = ?`, [id]);
    res.status(201).json(mapItem(created));
  }));

  /**
   * PUT /api/thr/periods/:id/items/:itemId
   * Update rincian penerima THR (join date, gaji, adjustment, catatan, status)
   */
  app.put("/api/thr/periods/:id/items/:itemId", asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const body = req.body;

    const existing = await queryOne(`SELECT * FROM thr_items WHERE id = ?`, [itemId]);
    if (!existing) {
      return res.status(404).json({ error: "Item THR tidak ditemukan" });
    }

    await execute(`
      UPDATE thr_items
      SET name = COALESCE(?, name),
          role = COALESCE(?, role),
          department = COALESCE(?, department),
          joined_date = COALESCE(?, joined_date),
          tenure_months = COALESCE(?, tenure_months),
          basic_salary = COALESCE(?, basic_salary),
          fixed_allowance = COALESCE(?, fixed_allowance),
          thr_base_salary = COALESCE(?, thr_base_salary),
          calculated_thr = COALESCE(?, calculated_thr),
          adjustment_amount = COALESCE(?, adjustment_amount),
          final_thr = COALESCE(?, final_thr),
          is_eligible = COALESCE(?, is_eligible),
          status = COALESCE(?, status),
          bank_name = COALESCE(?, bank_name),
          bank_account = COALESCE(?, bank_account),
          notes = ?
      WHERE id = ?
    `, [
      body.name ?? null,
      body.role ?? null,
      body.department ?? null,
      body.joinedDate ?? null,
      body.tenureMonths ?? null,
      body.basicSalary ?? null,
      body.fixedAllowance ?? null,
      body.thrBaseSalary ?? null,
      body.calculatedThr ?? null,
      body.adjustmentAmount ?? null,
      body.finalThr ?? null,
      body.isEligible !== undefined ? (body.isEligible ? 1 : 0) : null,
      body.status ?? null,
      body.bankName ?? null,
      body.bankAccount ?? null,
      body.notes !== undefined ? body.notes : null,
      itemId,
    ]);

    // Jika diminta update profil host (sync tanggal join ke tabel hosts)
    if (body.updateHostProfile && existing.employee_type === "host" && existing.employee_id && body.joinedDate) {
      try {
        await execute(`UPDATE hosts SET joined_date = ? WHERE id = ?`, [
          body.joinedDate,
          existing.employee_id,
        ]);
        console.log(`✅ Profil Host ${existing.employee_id} diupdate join_date: ${body.joinedDate}`);
      } catch (err: any) {
        console.warn("Gagal update profil host:", err?.message);
      }
    }

    const updated = await queryOne(`SELECT * FROM thr_items WHERE id = ?`, [itemId]);
    res.json(mapItem(updated));
  }));

  /**
   * DELETE /api/thr/periods/:id/items/:itemId
   * Hapus item penerima THR
   */
  app.delete("/api/thr/periods/:id/items/:itemId", asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    await execute(`DELETE FROM thr_items WHERE id = ?`, [itemId]);
    res.json({ success: true, message: "Item THR berhasil dihapus" });
  }));

  /**
   * POST /api/thr/periods/:id/batch-save
   * Simpan massal item THR (setelah auto-generate atau review HR)
   */
  app.post("/api/thr/periods/:id/batch-save", asyncHandler(async (req: Request, res: Response) => {
    const periodId = req.params.id;
    const { items, updateHostProfiles } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items harus berupa array" });
    }

    for (const item of items) {
      const id = item.id || genId("thr_item");
      await execute(`
        INSERT INTO thr_items (
          id, period_id, employee_type, employee_id, employee_code,
          name, role, department, joined_date, tenure_months,
          basic_salary, fixed_allowance, thr_base_salary, calculated_thr,
          adjustment_amount, final_thr, is_eligible, status,
          bank_name, bank_account, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          role = VALUES(role),
          department = VALUES(department),
          joined_date = VALUES(joined_date),
          tenure_months = VALUES(tenure_months),
          basic_salary = VALUES(basic_salary),
          fixed_allowance = VALUES(fixed_allowance),
          thr_base_salary = VALUES(thr_base_salary),
          calculated_thr = VALUES(calculated_thr),
          adjustment_amount = VALUES(adjustment_amount),
          final_thr = VALUES(final_thr),
          is_eligible = VALUES(is_eligible),
          status = VALUES(status),
          bank_name = VALUES(bank_name),
          bank_account = VALUES(bank_account),
          notes = VALUES(notes)
      `, [
        id,
        periodId,
        item.employeeType || "host",
        item.employeeId || null,
        item.employeeCode || null,
        item.name,
        item.role || null,
        item.department || null,
        item.joinedDate,
        item.tenureMonths || 0,
        item.basicSalary || 0,
        item.fixedAllowance || 0,
        item.thrBaseSalary || item.basicSalary || 0,
        item.calculatedThr || 0,
        item.adjustmentAmount || 0,
        item.finalThr || 0,
        item.isEligible !== undefined ? (item.isEligible ? 1 : 0) : 1,
        item.status || "Pending",
        item.bankName || null,
        item.bankAccount || null,
        item.notes || null,
      ]);

      if (updateHostProfiles && item.employeeType === "host" && item.employeeId && item.joinedDate) {
        try {
          await execute(`UPDATE hosts SET joined_date = ? WHERE id = ?`, [
            item.joinedDate,
            item.employeeId,
          ]);
        } catch {
          // ignore
        }
      }
    }

    const savedItems = await queryMany(`
      SELECT * FROM thr_items
      WHERE period_id = ?
      ORDER BY employee_type ASC, name ASC
    `, [periodId]);

    res.json(savedItems.map(mapItem));
  }));
}

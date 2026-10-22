import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";

function mapOvertime(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    hostId: row.host_id,
    hostName: row.host_name,
    cutoffPeriod: row.cutoff_period,
    date: row.date ? String(row.date).split("T")[0] : null,
    hours: Number(row.hours || 0),
    amount: Number(row.amount || 0),
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function registerOvertimeRoutes(app: Express) {
  /**
   * GET /api/overtimes
   * Ambil data lembur dengan opsi filter cutoff_period dan host_id
   */
  app.get("/api/overtimes", asyncHandler(async (req: Request, res: Response) => {
    const cutoff = (req.query.cutoff_period || req.query.cutoffPeriod) as string | undefined;
    const hostId = (req.query.host_id || req.query.hostId) as string | undefined;

    const conditions: string[] = [];
    const params: any[] = [];

    if (cutoff && cutoff !== "Semua") {
      conditions.push("cutoff_period = ?");
      params.push(cutoff);
    }

    if (hostId && hostId !== "Semua") {
      conditions.push("host_id = ?");
      params.push(hostId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM overtimes
      ${whereClause}
      ORDER BY date DESC, created_at DESC
    `;

    const rows = await queryMany(sql, params);
    res.json(rows.map(mapOvertime));
  }));

  /**
   * GET /api/overtimes/summary
   * Ringkasan agregasi lembur (total jam, total uang, total host)
   */
  app.get("/api/overtimes/summary", asyncHandler(async (req: Request, res: Response) => {
    const cutoff = (req.query.cutoff_period || req.query.cutoffPeriod) as string | undefined;

    let sql = `
      SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT host_id) as total_hosts,
        COALESCE(SUM(hours), 0) as total_hours,
        COALESCE(SUM(amount), 0) as total_amount
      FROM overtimes
    `;
    const params: any[] = [];

    if (cutoff && cutoff !== "Semua") {
      sql += " WHERE cutoff_period = ?";
      params.push(cutoff);
    }

    const row = await queryOne(sql, params);
    res.json({
      totalEntries: Number(row?.total_entries || 0),
      totalHosts: Number(row?.total_hosts || 0),
      totalHours: Number(row?.total_hours || 0),
      totalAmount: Number(row?.total_amount || 0),
    });
  }));

  /**
   * GET /api/overtimes/:id
   * Detail lembur spesifik
   */
  app.get("/api/overtimes/:id", asyncHandler(async (req: Request, res: Response) => {
    const row = await queryOne("SELECT * FROM overtimes WHERE id = ?", [req.params.id]);
    if (!row) {
      return res.status(404).json({ error: "Data lembur tidak ditemukan" });
    }
    res.json(mapOvertime(row));
  }));

  /**
   * POST /api/overtimes
   * Buat rekaman lembur baru
   */
  app.post("/api/overtimes", asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    const hostId = body.hostId || body.host_id;
    const cutoffPeriod = body.cutoffPeriod || body.cutoff_period;

    if (!hostId) {
      return res.status(400).json({ error: "Host wajib dipilih" });
    }
    if (!cutoffPeriod) {
      return res.status(400).json({ error: "Periode Cut-Off wajib dipilih" });
    }

    const id = body.id || genId("ot");
    const hostName = body.hostName || body.host_name || "";
    const date = body.date || new Date().toISOString().split("T")[0];
    const hours = Math.max(0, Number(body.hours || 0));
    const amount = Math.max(0, Number(body.amount || 0));
    const notes = body.notes || "";

    await execute(`
      INSERT INTO overtimes (
        id, host_id, host_name, cutoff_period, date, hours, amount, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, hostId, hostName, cutoffPeriod, date, hours, amount, notes]);

    const created = await queryOne("SELECT * FROM overtimes WHERE id = ?", [id]);
    res.status(201).json(mapOvertime(created));
  }));

  /**
   * PUT /api/overtimes/:id
   * Perbarui rekaman lembur
   */
  app.put("/api/overtimes/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const existing = await queryOne("SELECT * FROM overtimes WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ error: "Data lembur tidak ditemukan" });
    }

    const hostId = body.hostId || body.host_id || existing.host_id;
    const hostName = body.hostName || body.host_name || existing.host_name;
    const cutoffPeriod = body.cutoffPeriod || body.cutoff_period || existing.cutoff_period;
    const date = body.date !== undefined ? body.date : (existing.date ? String(existing.date).split("T")[0] : null);
    const hours = body.hours !== undefined ? Math.max(0, Number(body.hours)) : Number(existing.hours);
    const amount = body.amount !== undefined ? Math.max(0, Number(body.amount)) : Number(existing.amount);
    const notes = body.notes !== undefined ? body.notes : existing.notes;

    await execute(`
      UPDATE overtimes
      SET host_id = ?,
          host_name = ?,
          cutoff_period = ?,
          date = ?,
          hours = ?,
          amount = ?,
          notes = ?
      WHERE id = ?
    `, [hostId, hostName, cutoffPeriod, date, hours, amount, notes, id]);

    const updated = await queryOne("SELECT * FROM overtimes WHERE id = ?", [id]);
    res.json(mapOvertime(updated));
  }));

  /**
   * DELETE /api/overtimes/:id
   * Hapus rekaman lembur
   */
  app.delete("/api/overtimes/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await queryOne("SELECT * FROM overtimes WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ error: "Data lembur tidak ditemukan" });
    }

    await execute("DELETE FROM overtimes WHERE id = ?", [id]);
    res.json({ success: true, message: "Data lembur berhasil dihapus" });
  }));
}

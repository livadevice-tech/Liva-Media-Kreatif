import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";

export interface HostScheduleRequestRow {
  id: string;
  host_id: string;
  host_name: string;
  employee_id: string | null;
  type: string;
  status: string;
  date: string;
  end_date: string | null;
  reason_category: string | null;
  current_shift: string | null;
  target_date: string | null;
  target_shift: string | null;
  replacement_host_id: string | null;
  replacement_host_name: string | null;
  notes: string | null;
  proof_url: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapHostRequest(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    hostId: row.host_id,
    hostName: row.host_name,
    employeeId: row.employee_id || undefined,
    type: row.type,
    status: row.status,
    date: row.date ? String(row.date).split("T")[0] : "",
    endDate: row.end_date ? String(row.end_date).split("T")[0] : undefined,
    reasonCategory: row.reason_category || undefined,
    currentShift: row.current_shift || undefined,
    targetDate: row.target_date ? String(row.target_date).split("T")[0] : undefined,
    targetShift: row.target_shift || undefined,
    replacementHostId: row.replacement_host_id || undefined,
    replacementHostName: row.replacement_host_name || undefined,
    notes: row.notes || "",
    proofUrl: row.proof_url || undefined,
    adminNotes: row.admin_notes || undefined,
    reviewedBy: row.reviewed_by || undefined,
    reviewedAt: row.reviewed_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function registerHostRequestRoutes(app: Express) {
  /**
   * GET /api/host-requests
   * Host hanya melihat pengajuan miliknya, Admin dapat melihat seluruh pengajuan
   * dengan filter status, type, hostId, startDate, endDate, search
   */
  app.get("/api/host-requests", asyncHandler(async (req: Request, res: Response) => {
    const { status, type, hostId, startDate, endDate, search } = req.query as Record<string, string>;

    const conditions: string[] = [];
    const params: any[] = [];

    if (req.auth?.role === "host") {
      conditions.push("host_id = ?");
      params.push(req.auth.subjectId);
    } else if (hostId && hostId !== "Semua") {
      conditions.push("host_id = ?");
      params.push(hostId);
    }

    if (status && status !== "Semua") {
      conditions.push("status = ?");
      params.push(status);
    }

    if (type && type !== "Semua") {
      conditions.push("type = ?");
      params.push(type);
    }

    if (startDate) {
      conditions.push("date >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("date <= ?");
      params.push(endDate);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push("(host_name LIKE ? OR notes LIKE ? OR current_shift LIKE ? OR target_shift LIKE ?)");
      params.push(q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `
      SELECT * FROM host_schedule_requests
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const rows = await queryMany<HostScheduleRequestRow>(sql, params);
    res.json(rows.map(mapHostRequest));
  }));

  /**
   * POST /api/host-requests
   * Buat pengajuan izin atau tukar jadwal baru
   */
  app.post("/api/host-requests", asyncHandler(async (req: Request, res: Response) => {
    const body = req.body;
    const id = body.id || genId("req");
    const hostId = req.auth?.role === "host" ? req.auth.subjectId : body.hostId;

    // Ambil data host jika hostName belum ada
    let hostName = body.hostName;
    let employeeId = body.employeeId || null;
    if (!hostName && hostId) {
      const hostRow = await queryOne<{ name: string; employee_id?: string }>(
        `SELECT name, employee_id FROM hosts WHERE id = ?`,
        [hostId]
      );
      if (hostRow) {
        hostName = hostRow.name;
        employeeId = hostRow.employee_id || employeeId;
      }
    }

    if (!hostId || !hostName) {
      return res.status(400).json({ error: "Host ID dan nama host diperlukan." });
    }

    const type = body.type === "tukar_jadwal" ? "tukar_jadwal" : "izin";
    const status = "pending";
    const date = body.date || new Date().toISOString().split("T")[0];
    const endDate = body.endDate || null;
    const reasonCategory = body.reasonCategory || null;
    const currentShift = body.currentShift || null;
    const targetDate = body.targetDate || null;
    const targetShift = body.targetShift || null;
    const replacementHostId = body.replacementHostId || null;
    const replacementHostName = body.replacementHostName || null;
    const notes = body.notes || "";
    const proofUrl = body.proofUrl || null;

    await execute(`
      INSERT INTO host_schedule_requests (
        id, host_id, host_name, employee_id, type, status,
        date, end_date, reason_category, current_shift,
        target_date, target_shift, replacement_host_id, replacement_host_name,
        notes, proof_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, hostId, hostName, employeeId, type, status,
      date, endDate, reasonCategory, currentShift,
      targetDate, targetShift, replacementHostId, replacementHostName,
      notes, proofUrl
    ]);

    // Catat ke host activity logs
    try {
      const actId = genId("act");
      const actionName = type === "izin" ? "Ajukan Izin" : "Ajukan Tukar Jadwal";
      const details = JSON.stringify({
        requestId: id,
        type,
        date,
        currentShift,
        targetShift,
        reason: notes || reasonCategory
      });
      await execute(`
        INSERT INTO host_activity_logs (id, host_id, action, details)
        VALUES (?, ?, ?, ?)
      `, [actId, hostId, actionName, details]);
    } catch (logErr) {
      console.warn("Failed to record host activity log:", logErr);
    }

    res.status(201).json({ id, success: true });
  }));

  /**
   * PUT /api/host-requests/:id
   * Admin meninjau / menerima / menolak, atau Host mengupdate catatannya
   */
  app.put("/api/host-requests/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await queryOne<HostScheduleRequestRow>(
      `SELECT * FROM host_schedule_requests WHERE id = ?`,
      [id]
    );

    if (!existing) {
      return res.status(404).json({ error: "Pengajuan tidak ditemukan." });
    }

    // Jika role host, hanya bisa edit pengajuan milik sendiri yang statusnya masih 'pending'
    if (req.auth?.role === "host") {
      if (existing.host_id !== req.auth.subjectId) {
        return res.status(403).json({ error: "Akses ditolak." });
      }
      if (existing.status !== "pending") {
        return res.status(400).json({ error: "Pengajuan yang sudah ditinjau tidak dapat diubah." });
      }

      const body = req.body;
      await execute(`
        UPDATE host_schedule_requests SET
          date = COALESCE(?, date),
          end_date = ?,
          reason_category = COALESCE(?, reason_category),
          current_shift = COALESCE(?, current_shift),
          target_date = ?,
          target_shift = COALESCE(?, target_shift),
          replacement_host_id = ?,
          replacement_host_name = ?,
          notes = COALESCE(?, notes),
          proof_url = COALESCE(?, proof_url)
        WHERE id = ?
      `, [
        body.date,
        body.endDate || null,
        body.reasonCategory,
        body.currentShift,
        body.targetDate || null,
        body.targetShift,
        body.replacementHostId || null,
        body.replacementHostName || null,
        body.notes,
        body.proofUrl || null,
        id
      ]);

      return res.json({ success: true });
    }

    // Role Admin / Master
    const body = req.body;
    const newStatus = body.status || existing.status;
    const adminNotes = body.adminNotes !== undefined ? body.adminNotes : existing.admin_notes;
    const reviewedBy = body.reviewedBy || req.auth?.role === "master" ? "Master Admin" : "Admin";
    const reviewedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await execute(`
      UPDATE host_schedule_requests SET
        status = ?,
        admin_notes = ?,
        reviewed_by = ?,
        reviewed_at = ?,
        notes = COALESCE(?, notes),
        reason_category = COALESCE(?, reason_category),
        current_shift = COALESCE(?, current_shift),
        target_shift = COALESCE(?, target_shift),
        date = COALESCE(?, date)
      WHERE id = ?
    `, [
      newStatus,
      adminNotes,
      reviewedBy,
      reviewedAt,
      body.notes || null,
      body.reasonCategory || null,
      body.currentShift || null,
      body.targetShift || null,
      body.date || null,
      id
    ]);

    // Beri notifikasi ke Host jika status berubah menjadi approved / rejected / in_review
    if (newStatus !== existing.status) {
      try {
        const notifId = genId("notif");
        let notifTitle = "Pembaruan Pengajuan";
        let notifMessage = "";

        const typeLabel = existing.type === "izin" ? "Izin" : "Tukar Jadwal";

        if (newStatus === "approved") {
          notifTitle = `✅ Pengajuan ${typeLabel} Diterima`;
          notifMessage = `Pengajuan ${typeLabel.toLowerCase()} Anda untuk tanggal ${existing.date} telah DISETUJUI oleh admin.${adminNotes ? ` Catatan admin: "${adminNotes}"` : ""}`;
        } else if (newStatus === "in_review") {
          notifTitle = `⏳ Pengajuan ${typeLabel} Sedang Ditinjau`;
          notifMessage = `Pengajuan ${typeLabel.toLowerCase()} Anda untuk tanggal ${existing.date} sedang DITINJAU oleh admin.${adminNotes ? ` Catatan: "${adminNotes}"` : ""}`;
        } else if (newStatus === "rejected") {
          notifTitle = `❌ Pengajuan ${typeLabel} Ditolak`;
          notifMessage = `Pengajuan ${typeLabel.toLowerCase()} Anda untuk tanggal ${existing.date} DITOLAK oleh admin.${adminNotes ? ` Alasan: "${adminNotes}"` : ""}`;
        }

        if (notifMessage) {
          await execute(`
            INSERT INTO host_notifications (id, host_id, title, message, date_str, type, is_read)
            VALUES (?, ?, ?, ?, ?, 'schedule_broadcast', 0)
          `, [notifId, existing.host_id, notifTitle, notifMessage, existing.date]);
        }
      } catch (notifErr) {
        console.warn("Failed to create host notification for request update:", notifErr);
      }
    }

    res.json({ success: true, status: newStatus });
  }));

  /**
   * DELETE /api/host-requests/:id
   * Hapus pengajuan (Admin dapat menghapus, Host hanya jika masih pending)
   */
  app.delete("/api/host-requests/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const existing = await queryOne<HostScheduleRequestRow>(
      `SELECT * FROM host_schedule_requests WHERE id = ?`,
      [id]
    );

    if (!existing) {
      return res.status(404).json({ error: "Pengajuan tidak ditemukan." });
    }

    if (req.auth?.role === "host") {
      if (existing.host_id !== req.auth.subjectId) {
        return res.status(403).json({ error: "Akses ditolak." });
      }
      if (existing.status !== "pending") {
        return res.status(400).json({ error: "Hanya pengajuan dengan status menunggu yang dapat dibatalkan." });
      }
    }

    await execute(`DELETE FROM host_schedule_requests WHERE id = ?`, [id]);
    res.json({ success: true });
  }));
}

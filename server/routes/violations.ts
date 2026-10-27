import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup Multer Storage for Bukti Pelanggaran
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'violations');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'violation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export function registerViolationRoutes(app: Express) {
  // Get all violations or filtered by hostId
  app.get("/api/violations", asyncHandler(async (req: Request, res: Response) => {
    const hostId = req.query.hostId ? String(req.query.hostId) : null;
    
    let query = `
      SELECT hv.*, h.name as host_name, cb.name as brand_name
      FROM host_violations hv
      LEFT JOIN hosts h ON hv.host_id = h.id
      LEFT JOIN client_brands cb ON hv.brand_id = cb.id
      ORDER BY hv.created_at DESC
    `;
    let params: any[] = [];
    
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

  // Create a new violation
  app.post("/api/violations", upload.single("proof"), asyncHandler(async (req: Request, res: Response) => {
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

  // Update a violation
  app.put("/api/violations/:id", upload.single("proof"), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { host_id, brand_id, shift, platform, violation_type, consequence, violation_date, remove_proof } = req.body;

    const existing = await queryOne<any>(`SELECT * FROM host_violations WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({ error: "Catatan pelanggaran tidak ditemukan." });
    }

    if (!host_id || !violation_type) {
      return res.status(400).json({ error: "Host dan jenis pelanggaran wajib diisi." });
    }

    let proof_url = existing.proof_url;

    if (req.file) {
      // If a new file is uploaded, remove the old file if it exists
      if (existing.proof_url) {
        const oldPath = path.join(process.cwd(), existing.proof_url);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.warn("Could not delete old proof file:", oldPath, e);
          }
        }
      }
      proof_url = `/uploads/violations/${req.file.filename}`;
    } else if (remove_proof === "true" || remove_proof === true) {
      if (existing.proof_url) {
        const oldPath = path.join(process.cwd(), existing.proof_url);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (e) {
            console.warn("Could not delete proof file:", oldPath, e);
          }
        }
      }
      proof_url = null;
    }

    await execute(
      `UPDATE host_violations
       SET host_id = ?, brand_id = ?, shift = ?, platform = ?, violation_type = ?, proof_url = ?, consequence = ?, violation_date = ?
       WHERE id = ?`,
      [
        host_id,
        brand_id || null,
        shift || null,
        platform || null,
        violation_type,
        proof_url || null,
        consequence || null,
        violation_date || null,
        id
      ]
    );

    return res.json({ success: true, id, proof_url });
  }));

  // Delete a violation
  app.delete("/api/violations/:id", asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Optional: delete image file from server
    const row = await queryOne(`SELECT proof_url FROM host_violations WHERE id = ?`, [id]);
    if (row && row.proof_url) {
      const filePath = path.join(process.cwd(), row.proof_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file:", filePath, e);
        }
      }
    }
    
    await execute(`DELETE FROM host_violations WHERE id = ?`, [id]);
    return res.json({ success: true });
  }));
}

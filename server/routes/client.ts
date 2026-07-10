import type { Express, Request, Response } from "express";
import { execute, queryMany, queryOne } from "../db";
import { asyncHandler, genId } from "../http";
import { hashPasswordForStorage } from "../auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Setup Multer Storage for Berkas
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'berkas');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max file size
});

interface BrandSessionRow {
  id: string;
  shift?: string | null;
  platform?: string | null;
  studio?: string | null;
  host?: string | null;
}

interface BrandAccountRow {
  id: string;
  type?: string | null;
  username?: string | null;
  password?: string | null;
  pic_otp?: string | null;
}

interface BrandInvoiceRow {
  id: string;
  invoice_number?: string | null;
  issue_date?: string | null;
  due_date?: string | null;
  status?: string | null;
  recipient_name?: string | null;
  pt_name?: string | null;
  pic_name?: string | null;
  pic_phone?: string | null;
  email?: string | null;
  address?: string | null;
  total_amount?: string | number | null;
}

interface InvoiceItemRow {
  id?: string;
  session_id?: string | null;
  description?: string | null;
  qty?: number | string | null;
  cost?: number | string | null;
}

interface BrandBerkasRow {
  id: string;
  name?: string | null;
  type?: string | null;
  url?: string | null;
}

interface ClientBrandRow {
  id: string;
  name: string;
  company_name?: string | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  invoice_date?: string | null;
  monthly_meeting_date?: string | null;
  client_password?: string | null;
  client_username?: string | null;
  pic_name?: string | null;
  pic_phone?: string | null;
  pic_email?: string | null;
  company_address?: string | null;
  logo_url?: string | null;
  is_active?: number | null;
  dashboard_settings?: string | null;
}

interface ClientLeadRow {
  id: string;
  name: string;
  contact_person?: string | null;
  contact_number?: string | null;
  platform_interest?: string | null;
  status?: string | null;
  notes?: string | null;
}

interface AdminAccountRow {
  id: string;
  name: string;
  username: string;
  password_hash?: string | null;
  created_at?: string;
  accessTabs?: string[];
  password?: string;
}

interface AdminAccessTabRow {
  tab_name: string;
}

interface ClientReportingRow {
  id: string;
  brand_id?: string | null;
  platform?: string | null;
  report_date?: string | null;
  file_name?: string | null;
  is_public?: number | string | boolean | null;
  public_url?: string | null;
}

interface BrandViewModel {
  id: string;
  name: string;
  companyName?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  invoiceDate?: string | null;
  monthlyMeetingDate?: string | null;
  clientPassword?: string | null;
  clientUsername?: string | null;
  picName?: string | null;
  picPhone?: string | null;
  picEmail?: string | null;
  companyAddress?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
  dashboardSettings?: { hiddenMetrics?: string[]; hiddenColumns?: string[] } | null;
  sessions: { id: string; shift?: string | null; platform?: string | null; studio?: string | null; host?: string | null }[];
  accounts: { id: string; type?: string | null; username?: string | null; password?: string | null; picOtp?: string | null }[];
  invoices: Array<BrandInvoiceRow & {
    sessionItems: InvoiceItemRow[];
    invoiceNumber: string | null;
    issueDate: string | null;
    dueDate: string | null;
    recipientName: string | null;
    ptName: string | null;
    picName: string | null;
    picPhone: string | null;
    totalAmount: number;
  }>;
  berkas: BrandBerkasRow[];
}

async function buildBrand(brand: ClientBrandRow): Promise<BrandViewModel> {
  const sessions = await queryMany<BrandSessionRow>(
    `SELECT * FROM brand_sessions WHERE brand_id = ?`,
    [brand.id],
  );
  const accounts = await queryMany<BrandAccountRow>(
    `SELECT * FROM brand_accounts WHERE brand_id = ?`,
    [brand.id],
  );
  const invoices = await queryMany<BrandInvoiceRow>(
    `SELECT * FROM brand_invoices WHERE brand_id = ? ORDER BY issue_date DESC`,
    [brand.id],
  );
  const berkas = await queryMany<BrandBerkasRow>(
    `SELECT * FROM brand_berkas WHERE brand_id = ?`,
    [brand.id],
  );

  const mappedInvoices = await Promise.all(
    invoices.map(async (inv) => {
      const sessionItems = await queryMany<InvoiceItemRow>(
        `SELECT * FROM invoice_items WHERE invoice_id = ?`,
        [inv.id],
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
        totalAmount: parseInt(String(inv.total_amount || 0), 10) || 0,
      };
    }),
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
    isActive: brand.is_active === null || brand.is_active === undefined ? true : Boolean(brand.is_active),
    dashboardSettings: brand.dashboard_settings ? JSON.parse(brand.dashboard_settings) : undefined,
    sessions: sessions.map((session) => ({
      id: session.id,
      shift: session.shift,
      platform: session.platform,
      studio: session.studio,
      host: session.host,
    })),
    accounts: accounts.map((account) => ({
      id: account.id,
      type: account.type,
      username: account.username,
      password: account.password,
      picOtp: account.pic_otp,
    })),
    invoices: mappedInvoices,
    berkas,
  };
}

export function registerClientRoutes(app: Express) {
  // File Upload Route for Berkas
  app.post("/api/client-brands/berkas/upload", upload.single('berkas_file'), asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Return the URL path to the frontend
    const fileUrl = `/uploads/berkas/${req.file.filename}`;
    res.json({ url: fileUrl });
  }));

  app.get("/api/client-brands", asyncHandler(async (req: Request, res: Response) => {
    const brands = await queryMany<ClientBrandRow>(`SELECT * FROM client_brands ORDER BY name ASC`);
    const result = await Promise.all(brands.map(buildBrand));
    res.json(result);
  }));

  app.get("/api/client-brands/public", asyncHandler(async (req: Request, res: Response) => {
    const brands = await queryMany<{name: string}>(`SELECT name FROM client_brands WHERE is_active = 1 ORDER BY name ASC`);
    res.json(brands.map(b => b.name));
  }));

  app.get("/api/client-brands/:id", asyncHandler(async (req: Request, res: Response) => {
    const brand = await queryOne<ClientBrandRow>(`SELECT * FROM client_brands WHERE id = ?`, [req.params.id]);
    if (!brand) return res.status(404).json({ error: "Brand tidak ditemukan" });
    res.json(await buildBrand(brand));
  }));

  app.post("/api/client-brands", asyncHandler(async (req: Request, res: Response) => {
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

  app.put("/api/client-brands/:id", asyncHandler(async (req: Request, res: Response) => {
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
        await execute(`INSERT INTO brand_invoices (id, brand_id, invoice_number, issue_date, due_date, status, recipient_name, pt_name, pic_name, pic_phone, email, address, total_amount) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [inv.id, id, inv.invoiceNumber || null, inv.issueDate || null, inv.dueDate || null, inv.status || "Draft", inv.recipientName || null, inv.ptName || null, inv.picName || null, inv.picPhone || null, inv.email || null, inv.address || null, inv.totalAmount || 0]);
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

  app.delete("/api/client-brands/:id", asyncHandler(async (req: Request, res: Response) => {
    const invIds = await queryMany(`SELECT id FROM brand_invoices WHERE brand_id = ?`, [req.params.id]);
    for (const inv of invIds) {
      await execute(`DELETE FROM invoice_items WHERE invoice_id = ?`, [inv.id]);
    }
    await execute(`DELETE FROM client_brands WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/client-leads", asyncHandler(async (req: Request, res: Response) => {
    const rows = await queryMany<ClientLeadRow>(`SELECT * FROM client_leads ORDER BY created_at DESC`);
    const mapped = rows.map((l) => ({
      id: l.id,
      name: l.name,
      contactPerson: l.contact_person,
      contactNumber: l.contact_number,
      platformInterest: l.platform_interest,
      status: l.status,
      notes: l.notes,
    }));
    res.json(mapped);
  }));

  app.post("/api/client-leads", asyncHandler(async (req: Request, res: Response) => {
    const l = req.body;
    const id = l.id || genId("lead");
    await execute(`INSERT INTO client_leads (id, name, contact_person, contact_number, platform_interest, status, notes) VALUES (?,?,?,?,?,?,?)`,
      [id, l.name, l.contactPerson || null, l.contactNumber || null, l.platformInterest || null, l.status || "New", l.notes || null]);
    res.status(201).json({ id });
  }));

  app.put("/api/client-leads/:id", asyncHandler(async (req: Request, res: Response) => {
    const l = req.body;
    await execute(`UPDATE client_leads SET name=?, contact_person=?, contact_number=?, platform_interest=?, status=?, notes=? WHERE id=?`,
      [l.name, l.contactPerson || null, l.contactNumber || null, l.platformInterest || null, l.status || "New", l.notes || null, req.params.id]);
    res.json({ success: true });
  }));

  app.delete("/api/client-leads/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM client_leads WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/admin-accounts", asyncHandler(async (req: Request, res: Response) => {
    const admins = await queryMany<AdminAccountRow>(`SELECT id, name, username, password_hash, created_at FROM admin_accounts`);
    for (const admin of admins) {
      const tabs = await queryMany<AdminAccessTabRow>(`SELECT tab_name FROM admin_access_tabs WHERE admin_id = ?`, [admin.id]);
      admin.accessTabs = tabs.map((t) => t.tab_name);
      admin.password = "";
      delete admin.password_hash;
    }
    res.json(admins);
  }));

  app.post("/api/admin-accounts", asyncHandler(async (req: Request, res: Response) => {
    const a = req.body;
    const id = a.id || genId("admin");
    await execute(`INSERT INTO admin_accounts (id, name, username, password_hash) VALUES (?,?,?,?)`,
      [id, a.name, a.username, hashPasswordForStorage(a.password || a.passwordHash || "")]);
    if (Array.isArray(a.accessTabs)) {
      for (const tab of a.accessTabs) {
        await execute(`INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?,?)`, [id, tab]);
      }
    }
    res.status(201).json({ id });
  }));

  app.put("/api/admin-accounts/:id", asyncHandler(async (req: Request, res: Response) => {
    const a = req.body;
    if (a.password || a.passwordHash) {
      await execute(
        `UPDATE admin_accounts SET name=?, username=?, password_hash=? WHERE id=?`,
        [a.name, a.username, hashPasswordForStorage(a.password || a.passwordHash), req.params.id],
      );
    } else {
      await execute(
        `UPDATE admin_accounts SET name=?, username=? WHERE id=?`,
        [a.name, a.username, req.params.id],
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

  app.delete("/api/admin-accounts/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM admin_accounts WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));

  app.get("/api/client-reporting", asyncHandler(async (req: Request, res: Response) => {
    const brandId = req.auth?.role === "brand"
      ? req.auth.subjectId
      : String(req.query.brandId || "");
    let sql = `SELECT * FROM client_reporting WHERE 1=1`;
    const params: Array<string | number | null | undefined> = [];
    if (brandId) { sql += ` AND brand_id = ?`; params.push(brandId); }
    sql += ` ORDER BY report_date DESC`;
    const rows = await queryMany<ClientReportingRow>(sql, params);
    const mapped = rows.map((r) => ({
      id: r.id,
      brandId: r.brand_id,
      platform: r.platform,
      reportDate: r.report_date,
      fileName: r.file_name,
      isPublic: !!r.is_public,
      publicUrl: r.public_url,
    }));
    res.json(mapped);
  }));

  app.post("/api/client-reporting", asyncHandler(async (req: Request, res: Response) => {
    const r = req.body;
    const id = r.id || genId("report");
    await execute(`INSERT INTO client_reporting (id, brand_id, platform, report_date, file_name, is_public, public_url) VALUES (?,?,?,?,?,?,?)`,
      [id, r.brandId || null, r.platform || null, r.reportDate || null, r.fileName || null, r.isPublic ? 1 : 0, r.publicUrl || null]);
    res.status(201).json({ id });
  }));

  app.put("/api/client-reporting/:id", asyncHandler(async (req: Request, res: Response) => {
    const r = req.body;
    await execute(`UPDATE client_reporting SET brand_id=?, platform=?, report_date=?, file_name=?, is_public=?, public_url=? WHERE id=?`,
      [r.brandId || null, r.platform || null, r.reportDate || null, r.fileName || null, r.isPublic ? 1 : 0, r.publicUrl || null, req.params.id]);
    res.json({ success: true });
  }));

  app.delete("/api/client-reporting/:id", asyncHandler(async (req: Request, res: Response) => {
    await execute(`DELETE FROM client_reporting WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  }));
}

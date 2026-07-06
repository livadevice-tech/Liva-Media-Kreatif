import mysql from "mysql2/promise";
import 'dotenv/config';

async function run() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      charset: "utf8mb4",
    });

    const b = {
      name: "Biokos",
      contractStartDate: "2026-02-02",
      contractEndDate: "2026-05-31",
      invoiceDate: null,
      monthlyMeetingDate: null,
      clientPassword: null,
      clientUsername: null,
      picName: null,
      picPhone: null,
      picEmail: null,
      companyAddress: null,
      logoUrl: null,
      isActive: false
    };

    const id = 'cb_12345'; // dummy ID

    await db.execute(`
      UPDATE client_brands SET name=?, contract_start_date=?, contract_end_date=?, invoice_date=?, monthly_meeting_date=?, client_password=?, client_username=?, pic_name=?, pic_phone=?, pic_email=?, company_address=?, logo_url=?, is_active=?
      WHERE id=?
    `, [b.name, b.contractStartDate || null, b.contractEndDate || null, b.invoiceDate || null, b.monthlyMeetingDate || null, b.clientPassword || null, b.clientUsername || null, b.picName || null, b.picPhone || null, b.picEmail || null, b.companyAddress || null, b.logoUrl || null, b.isActive !== false ? 1 : 0, id]);

    console.log("SUKSES UPDATE!");
    process.exit(0);
  } catch (err) {
    console.error("ERROR DATABASE:", err);
    process.exit(1);
  }
}
run();

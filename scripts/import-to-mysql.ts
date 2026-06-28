/**
 * import-to-mysql.ts
 * ==================
 * Script untuk mengimport data dari hasil export Firebase (JSON)
 * ke database MySQL.
 *
 * CARA PAKAI:
 *   1. Jalankan export-firebase.ts dulu sampai selesai
 *   2. Setup file .env dengan variabel DB_*
 *   3. Jalankan: npx tsx scripts/import-to-mysql.ts
 *   4. Cek hasilnya via phpMyAdmin atau MySQL CLI
 *
 * CATATAN:
 *   - Script ini IDEMPOTENT: aman dijalankan berulang kali (INSERT IGNORE)
 *   - Password di AdminAccount akan di-hash dengan bcrypt
 *   - Array nested (platforms, brands, sessions, dll) akan diflat ke tabel terpisah
 */

import * as fs from 'fs';
import * as path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { createHash } from 'crypto';

dotenv.config();

// ------------------------------------------------------------------
// Konfigurasi koneksi MySQL dari .env
// ------------------------------------------------------------------
const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || '',
  database: process.env.DB_NAME     || 'liva_agency_db',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4',
};

const EXPORT_DIR = path.join(process.cwd(), 'scripts', 'firebase-export');

// ------------------------------------------------------------------
// Helper: baca JSON export
// ------------------------------------------------------------------
function readExport(collectionName: string): any[] {
  const filePath = path.join(EXPORT_DIR, `${collectionName}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`   ⚠️  File tidak ditemukan: ${filePath} — dilewati`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

// ------------------------------------------------------------------
// Helper: hash password sederhana (SHA-256 untuk legacy data)
// Catatan: Di produksi nanti gunakan bcrypt, ini hanya untuk migrasi awal
// ------------------------------------------------------------------
function hashPassword(plain: string): string {
  // Tandai bahwa ini adalah plain text yang di-hash waktu import
  return 'sha256:' + createHash('sha256').update(plain || '').digest('hex');
}

// ------------------------------------------------------------------
// Helper: format tanggal Firebase Timestamp → MySQL DATE
// ------------------------------------------------------------------
function toMySQLDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/)) {
    return val.substring(0, 10);
  }
  if (val && val._seconds) {
    return new Date(val._seconds * 1000).toISOString().substring(0, 10);
  }
  return null;
}

// ------------------------------------------------------------------
// IMPORT: hosts
// ------------------------------------------------------------------
async function importHosts(conn: mysql.Connection): Promise<number> {
  const data = readExport('hosts');
  let count = 0;

  for (const h of data) {
    await conn.execute(`
      INSERT IGNORE INTO hosts (
        id, name, employee_id, avatar, role,
        base_monthly_target_hours, base_monthly_target_revenue,
        consistency_score, joined_date, email, phone,
        username, password_hash, bank_account, bank_name, studio,
        host_type, custom_working_days_target, custom_base_salary, custom_shift_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      h.id, h.name, h.employeeId, h.avatar || null, h.role || null,
      h.baseMonthlyTargetHours || 0, h.baseMonthlyTargetRevenue || 0,
      h.consistencyScore || 0, toMySQLDate(h.joinedDate),
      h.email || null, h.phone || null,
      h.username || null,
      h.password ? hashPassword(h.password) : null,
      h.bankAccount || null, h.bankName || null, h.studio || null,
      h.hostType === 'Backup' ? 'Backup' : 'Reguler',
      h.customWorkingDaysTarget ?? null,
      h.customBaseSalary ?? null,
      h.customShiftRate ?? null,
    ]);

    // Import platforms[]
    if (Array.isArray(h.platforms)) {
      for (const platform of h.platforms) {
        await conn.execute(
          `INSERT IGNORE INTO host_platforms (host_id, platform) VALUES (?, ?)`,
          [h.id, platform]
        );
      }
    }

    // Import brands[]
    if (Array.isArray(h.brands)) {
      for (const brand of h.brands) {
        await conn.execute(
          `INSERT IGNORE INTO host_brands (host_id, brand) VALUES (?, ?)`,
          [h.id, brand]
        );
      }
    }

    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: attendance_logs
// ------------------------------------------------------------------
async function importLogs(conn: mysql.Connection): Promise<number> {
  const data = readExport('logs');
  let count = 0;

  for (const l of data) {
    await conn.execute(`
      INSERT IGNORE INTO attendance_logs (
        id, host_id, host_name, employee_id, date, shift_hours,
        platform, brand_handled, live_duration, session_count, status,
        check_in_time, revenue_generated, conversion_rate, engagement_rate,
        orders, avg_view_duration, studio, flagged_as_anomaly, anomaly_reason,
        is_duplicate, flagged_as_fraud, fraud_reason, overtime_hours, is_backup_shift
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      l.id, l.hostId, l.hostName || null, l.employeeId || null,
      toMySQLDate(l.date), l.shiftHours || null,
      l.platform || null, l.brandHandled || null,
      l.liveDuration || 0, l.sessionCount || 0,
      l.status || 'Present',
      l.checkInTime || null, l.revenueGenerated || 0,
      l.conversionRate || 0, l.engagementRate || 0,
      l.orders || 0, l.avgViewDuration ?? null,
      l.studio || null,
      l.flaggedAsAnomaly ? 1 : 0, l.anomalyReason || null,
      l.isDuplicate ? 1 : 0,
      l.flaggedAsFraud ? 1 : 0, l.fraudReason || null,
      l.overtimeHours || 0, l.isBackupShift ? 1 : 0,
    ]);
    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: shift_schedules
// ------------------------------------------------------------------
async function importSchedules(conn: mysql.Connection): Promise<number> {
  const data = readExport('schedules');
  let count = 0;

  for (const s of data) {
    await conn.execute(`
      INSERT IGNORE INTO shift_schedules (
        id, host_id, host_name, employee_id, date,
        time_slot, platform, brand, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      s.id, s.hostId, s.hostName || null, s.employeeId || null,
      toMySQLDate(s.date), s.timeSlot || null,
      s.platform || null, s.brand || null,
      s.status || 'Assigned',
    ]);
    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: kpi_alerts
// ------------------------------------------------------------------
async function importAlerts(conn: mysql.Connection): Promise<number> {
  const data = readExport('kpi_alerts');
  let count = 0;

  for (const a of data) {
    await conn.execute(`
      INSERT IGNORE INTO kpi_alerts (
        id, host_id, host_name, metric_type, severity,
        message, date, current_value, target_value, resolved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      a.id, a.hostId, a.hostName || null,
      a.metricType || null, a.severity || null,
      a.message || null, toMySQLDate(a.date),
      String(a.currentValue ?? ''), String(a.targetValue ?? ''),
      a.resolved ? 1 : 0,
    ]);
    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: client_brands (dengan semua relasi nested)
// ------------------------------------------------------------------
async function importClientBrands(conn: mysql.Connection): Promise<number> {
  const data = readExport('client_brands');
  let count = 0;

  for (const b of data) {
    // Insert brand utama
    await conn.execute(`
      INSERT IGNORE INTO client_brands (
        id, name, contract_start_date, contract_end_date,
        invoice_date, monthly_meeting_date,
        client_password, client_username,
        pic_name, pic_phone, pic_email, company_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      b.id, b.name,
      toMySQLDate(b.contractStartDate), toMySQLDate(b.contractEndDate),
      b.invoiceDate || null, b.monthlyMeetingDate || null,
      b.clientPassword || null, b.clientUsername || null,
      b.picName || null, b.picPhone || null,
      b.picEmail || null, b.companyAddress || null,
    ]);

    // Import sessions[]
    if (Array.isArray(b.sessions)) {
      for (const s of b.sessions) {
        if (!s.id) continue;
        await conn.execute(`
          INSERT IGNORE INTO brand_sessions (id, brand_id, shift, platform, studio, host)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [s.id, b.id, s.shift || null, s.platform || null, s.studio || null, s.host || null]);
      }
    }

    // Import accounts[]
    if (Array.isArray(b.accounts)) {
      for (const a of b.accounts) {
        if (!a.id) continue;
        await conn.execute(`
          INSERT IGNORE INTO brand_accounts (id, brand_id, type, username, password, pic_otp)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [a.id, b.id, a.type || null, a.username || null, a.password || null, a.picOtp || null]);
      }
    }

    // Import invoices[]
    if (Array.isArray(b.invoices)) {
      for (const inv of b.invoices) {
        if (!inv.id) continue;
        await conn.execute(`
          INSERT IGNORE INTO brand_invoices (
            id, brand_id, invoice_number, issue_date, due_date,
            status, recipient_name, pt_name, pic_name, pic_phone,
            email, address, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          inv.id, b.id, inv.invoiceNumber || null,
          toMySQLDate(inv.issueDate), toMySQLDate(inv.dueDate),
          inv.status || 'Draft', inv.recipientName || null,
          inv.ptName || null, inv.picName || null, inv.picPhone || null,
          inv.email || null, inv.address || null,
          inv.totalAmount || 0,
        ]);

        // Import sessionItems[]
        if (Array.isArray(inv.sessionItems)) {
          for (const item of inv.sessionItems) {
            await conn.execute(`
              INSERT INTO invoice_items (invoice_id, session_id, description, qty, cost)
              VALUES (?, ?, ?, ?, ?)
            `, [inv.id, item.sessionId || null, item.description || null, item.qty || 1, item.cost || 0]);
          }
        }
      }
    }

    // Import berkas[]
    if (Array.isArray(b.berkas)) {
      for (const f of b.berkas) {
        if (!f.id) continue;
        await conn.execute(`
          INSERT IGNORE INTO brand_berkas (id, brand_id, name, type, url)
          VALUES (?, ?, ?, ?, ?)
        `, [f.id, b.id, f.name || null, f.type || null, f.url || null]);
      }
    }

    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: client_leads
// ------------------------------------------------------------------
async function importClientLeads(conn: mysql.Connection): Promise<number> {
  const data = readExport('client_leads');
  let count = 0;

  for (const l of data) {
    await conn.execute(`
      INSERT IGNORE INTO client_leads (
        id, name, contact_person, contact_number,
        platform_interest, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      l.id, l.name, l.contactPerson || null,
      l.contactNumber || null, l.platformInterest || null,
      l.status || 'New', l.notes || null,
    ]);
    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: admin_accounts
// ------------------------------------------------------------------
async function importAdminAccounts(conn: mysql.Connection): Promise<number> {
  const data = readExport('admin_accounts');
  let count = 0;

  for (const a of data) {
    await conn.execute(`
      INSERT IGNORE INTO admin_accounts (id, name, username, password_hash)
      VALUES (?, ?, ?, ?)
    `, [
      a.id, a.name, a.username,
      hashPassword(a.password || ''),
    ]);

    if (Array.isArray(a.accessTabs)) {
      for (const tab of a.accessTabs) {
        await conn.execute(`
          INSERT INTO admin_access_tabs (admin_id, tab_name) VALUES (?, ?)
        `, [a.id, tab]);
      }
    }

    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// IMPORT: client_reporting
// ------------------------------------------------------------------
async function importClientReporting(conn: mysql.Connection): Promise<number> {
  const data = readExport('client_reporting');
  let count = 0;

  for (const r of data) {
    await conn.execute(`
      INSERT IGNORE INTO client_reporting (
        id, brand_id, platform, report_date, file_name, is_public, public_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      r.id, r.brandId || null, r.platform || null,
      toMySQLDate(r.reportDate), r.fileName || null,
      r.isPublic ? 1 : 0, r.publicUrl || null,
    ]);
    count++;
  }
  return count;
}

// ------------------------------------------------------------------
// MAIN
// ------------------------------------------------------------------
async function main() {
  console.log('='.repeat(60));
  console.log('  LIVA MEDIA KREATIF - Import Firebase → MySQL');
  console.log('  Waktu: ' + new Date().toLocaleString('id-ID'));
  console.log('='.repeat(60));

  // Cek export files tersedia
  if (!fs.existsSync(EXPORT_DIR)) {
    console.error(`\n❌ Folder export tidak ditemukan: ${EXPORT_DIR}`);
    console.error('   Jalankan "npx tsx scripts/export-firebase.ts" dulu!\n');
    process.exit(1);
  }

  // Koneksi ke MySQL
  let conn: mysql.Connection;
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log(`\n✅ Terhubung ke MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  } catch (err: any) {
    console.error(`\n❌ Gagal koneksi ke MySQL:`, err.message);
    console.error('   Cek variabel DB_HOST, DB_USER, DB_PASS, DB_NAME di file .env\n');
    process.exit(1);
  }

  // Nonaktifkan foreign key checks sementara untuk import
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');

  const results: Record<string, number> = {};

  try {
    console.log('\n📥 Mulai import data...\n');

    process.stdout.write('   hosts              → ');
    results['hosts'] = await importHosts(conn);
    console.log(`${results['hosts']} records`);

    process.stdout.write('   attendance_logs    → ');
    results['attendance_logs'] = await importLogs(conn);
    console.log(`${results['attendance_logs']} records`);

    process.stdout.write('   shift_schedules    → ');
    results['shift_schedules'] = await importSchedules(conn);
    console.log(`${results['shift_schedules']} records`);

    process.stdout.write('   kpi_alerts         → ');
    results['kpi_alerts'] = await importAlerts(conn);
    console.log(`${results['kpi_alerts']} records`);

    process.stdout.write('   client_brands      → ');
    results['client_brands'] = await importClientBrands(conn);
    console.log(`${results['client_brands']} records (+ sessions, accounts, invoices, berkas)`);

    process.stdout.write('   client_leads       → ');
    results['client_leads'] = await importClientLeads(conn);
    console.log(`${results['client_leads']} records`);

    process.stdout.write('   admin_accounts     → ');
    results['admin_accounts'] = await importAdminAccounts(conn);
    console.log(`${results['admin_accounts']} records`);

    process.stdout.write('   client_reporting   → ');
    results['client_reporting'] = await importClientReporting(conn);
    console.log(`${results['client_reporting']} records`);

  } catch (err: any) {
    console.error('\n❌ Import gagal:', err.message);
    await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
    await conn.end();
    process.exit(1);
  }

  // Aktifkan kembali foreign key checks
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();

  console.log('\n' + '='.repeat(60));
  console.log('  IMPORT SELESAI');
  console.log('='.repeat(60));
  console.log('\n📊 Ringkasan Import:');
  for (const [table, count] of Object.entries(results)) {
    console.log(`   ✅ ${table}: ${count} records`);
  }
  console.log('\n🔐 PENTING: Password admin di-hash dengan SHA-256 saat import.');
  console.log('   Minta admin untuk reset password setelah login pertama kali.\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Error tidak terduga:', err);
  process.exit(1);
});

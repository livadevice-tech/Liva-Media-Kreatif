import type { HostEmployee } from '../../types';
import type { HostReportRow } from './salaryReporting';
import { formatIDR } from './currency';

export function generatePayslipPrintHtml(params: {
  host: HostEmployee;
  salaryReport: HostReportRow;
  cutoffLabel: string;
  agencyLogoUrl?: string;
}): string {
  const { host, salaryReport, cutoffLabel, agencyLogoUrl } = params;
  const isReguler = (host.hostType || 'Reguler') === 'Reguler';
  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const baseCalculated = isReguler
    ? Math.round((salaryReport.basePayRate / salaryReport.requiredWorkingDays) * salaryReport.totalHadir)
    : salaryReport.basePayRate * salaryReport.totalHadir;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Slip Gaji - ${host.name} - ${cutoffLabel}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    body {
      background: #f8fafc;
      color: #0f172a;
      padding: 20px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .payslip-container {
      max-width: 750px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .agency-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #1e1b4b;
      text-transform: uppercase;
    }
    .agency-sub {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
      font-weight: 600;
    }
    .doc-badge {
      text-align: right;
    }
    .doc-title {
      font-size: 14px;
      font-weight: 800;
      color: #2563eb;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-period {
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      margin-top: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .info-item {
      display: flex;
      flex-direction: column;
    }
    .info-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 22px;
    }
    .table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      text-align: left;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
    }
    .table td {
      padding: 9px 12px;
      font-size: 12px;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .font-mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .total-box {
      background: #ecfdf5;
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 18px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 26px;
    }
    .total-label {
      font-size: 13px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .total-sub {
      font-size: 11px;
      color: #047857;
      margin-top: 2px;
    }
    .total-val {
      font-size: 24px;
      font-weight: 900;
      color: #047857;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 18px;
      border-top: 1px dashed #cbd5e1;
      margin-top: 10px;
    }
    .legal-note {
      font-size: 10px;
      color: #64748b;
      line-height: 1.5;
      max-width: 420px;
    }
    .sign-box {
      text-align: center;
      min-width: 160px;
    }
    .sign-title {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 45px;
    }
    .sign-name {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
    }
    .sign-role {
      font-size: 10px;
      color: #64748b;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .payslip-container {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    <div class="header">
      <div>
        <div class="agency-title">LIVA MEDIA KREATIF</div>
        <div class="agency-sub">Live Streaming Talent Agency & Operational Management</div>
      </div>
      <div class="doc-badge">
        <div class="doc-title">SLIP PEMBAYARAN GAJI</div>
        <div class="doc-period">${cutoffLabel}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Nama Karyawan</span>
        <span class="info-value">${host.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">ID Pegawai / Tipe</span>
        <span class="info-value font-mono">${host.employeeId || '-'} (${host.hostType || 'Reguler'})</span>
      </div>
      <div class="info-item">
        <span class="info-label">Studio & Brand</span>
        <span class="info-value">${host.studio || 'Bandar Lampung'} • ${host.brands?.join(', ') || '-'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Rekening Penerima</span>
        <span class="info-value">${host.bankName || '-'} (${host.bankAccount || '-'})</span>
      </div>
    </div>

    <!-- Tabel Rekapitulasi Absen -->
    <div class="section-title">1. REKAPITULASI KEHADIRAN & ABSENSI</div>
    <table class="table">
      <thead>
        <tr>
          <th class="text-center">Target Kerja</th>
          <th class="text-center">Tepat Waktu</th>
          <th class="text-center">Terlambat</th>
          <th class="text-center">Izin / Sakit</th>
          <th class="text-center">Alpa</th>
          <th class="text-center">Total Hadir</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center font-mono font-bold">${salaryReport.requiredWorkingDays} Hari</td>
          <td class="text-center font-mono text-emerald-600 font-bold">${salaryReport.countTepatWaktu}</td>
          <td class="text-center font-mono text-amber-600 font-bold">${salaryReport.countTerlambat}</td>
          <td class="text-center font-mono">${salaryReport.countIzin}</td>
          <td class="text-center font-mono text-rose-600 font-bold">${salaryReport.countAlpa}</td>
          <td class="text-center font-mono font-bold" style="background: #f8fafc;">${salaryReport.totalHadir} Hari</td>
        </tr>
      </tbody>
    </table>

    <!-- Tabel Rincian Penerimaan -->
    <div class="section-title">2. RINCIAN PENDAPATAN & PENERIMAAN</div>
    <table class="table">
      <thead>
        <tr>
          <th>Komponen Gaji</th>
          <th class="text-center">Volume / Keterangan</th>
          <th class="text-right">Nominal (IDR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Gaji Pokok Kehadiran</strong>
            <div style="font-size: 10px; color: #64748b;">
              ${isReguler 
                ? `Prorata: ${salaryReport.totalHadir}/${salaryReport.requiredWorkingDays} Hari x ${formatIDR(salaryReport.basePayRate)}`
                : `${salaryReport.totalHadir} Sesi x ${formatIDR(salaryReport.basePayRate)}`
              }
            </div>
          </td>
          <td class="text-center font-mono">${salaryReport.totalHadir} Hari Masuk</td>
          <td class="text-right font-mono font-bold">${formatIDR(baseCalculated)}</td>
        </tr>
        ${salaryReport.totalBackupShiftsAsReguler > 0 ? `
        <tr>
          <td>
            <strong>Shift Tambahan / Backup</strong>
            <div style="font-size: 10px; color: #64748b;">Honor pengganti shift live di luar jadwal reguler</div>
          </td>
          <td class="text-center font-mono">${salaryReport.totalBackupShiftsAsReguler} Shift</td>
          <td class="text-right font-mono font-bold text-emerald-600">+${formatIDR(salaryReport.calculatedBackupPay)}</td>
        </tr>
        ` : ''}
        ${salaryReport.totalOvertimeHours > 0 ? `
        <tr>
          <td>
            <strong>Uang Lembur (Overtime)</strong>
            <div style="font-size: 10px; color: #64748b;">Kompensasi penambahan jam siaran live streaming</div>
          </td>
          <td class="text-center font-mono">${salaryReport.totalOvertimeHours} Jam</td>
          <td class="text-right font-mono font-bold text-emerald-600">+${formatIDR(salaryReport.calculatedOvertimePay)}</td>
        </tr>
        ` : ''}
        ${salaryReport.isEligibleForBonus ? `
        <tr>
          <td>
            <strong>Bonus Disiplin Kehadiran</strong>
            <div style="font-size: 10px; color: #64748b;">Reward 100% kehadiran penuh, terlambat &le; 3x & tanpa SP</div>
          </td>
          <td class="text-center font-mono">Penuh (100%)</td>
          <td class="text-right font-mono font-bold text-emerald-600">+${formatIDR(salaryReport.calculatedBonus)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <!-- Kotak Total Gaji Bersih -->
    <div class="total-box">
      <div>
        <div class="total-label">TOTAL GAJI BERSIH (TAKE-HOME PAY)</div>
        <div class="total-sub">Ditransfer ke rekening ${host.bankName || 'Bank'} ${host.bankAccount || ''}</div>
      </div>
      <div class="total-val">${formatIDR(salaryReport.netSalary)}</div>
    </div>

    <!-- Footer & Tanda Tangan -->
    <div class="footer">
      <div class="legal-note">
        <strong>Pemberitahuan:</strong><br>
        Slip gaji ini diterbitkan secara digital dan sah oleh Sistem Absensi & Payroll Liva Device Agency. Data kehadiran dihitung real-time berdasarkan riwayat absensi siaran harian.
      </div>
      <div class="sign-box">
        <div class="sign-title">Bandar Lampung, ${currentDateFormatted}</div>
        <div class="sign-name">Liva Finance & Payroll</div>
        <div class="sign-role">PT Liva Media Kreatif</div>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;
}

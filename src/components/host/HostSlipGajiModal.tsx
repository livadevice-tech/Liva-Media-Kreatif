import React, { useState } from 'react';
import { 
  X, Printer, Copy, Check, DollarSign, Calendar, Clock, 
  CheckCircle2, AlertCircle, Building2, User, CreditCard, Sparkles, FileText
} from 'lucide-react';
import type { HostEmployee } from '../../types';
import type { HostReportRow } from '../../shared/utils/salaryReporting';
import { formatIDR } from '../../shared/utils/currency';
import { generatePayslipPrintHtml } from '../../shared/utils/payslipPrintHtml';

interface HostSlipGajiModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: HostEmployee;
  salaryReport: HostReportRow;
  cutoffLabel: string;
}

export default function HostSlipGajiModal({
  isOpen,
  onClose,
  host,
  salaryReport,
  cutoffLabel,
}: HostSlipGajiModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const hostAny = host as any;
  const hostType = host.hostType || hostAny.host_type || 'Reguler';
  const employeeId = host.employeeId || hostAny.employee_id || '-';
  const studio = host.studio || hostAny.studio || 'Bandar Lampung';
  const bankName = host.bankName || hostAny.bank_name || '-';
  const bankAccount = host.bankAccount || hostAny.bank_account || '-';

  const isReguler = hostType === 'Reguler';
  const baseCalculated = isReguler
    ? Math.round((salaryReport.basePayRate / salaryReport.requiredWorkingDays) * salaryReport.totalHadir)
    : salaryReport.basePayRate * salaryReport.totalHadir;

  const handlePrint = () => {
    const html = generatePayslipPrintHtml({
      host,
      salaryReport,
      cutoffLabel,
    });
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const handleCopySummary = () => {
    const text = `*SLIP PEMBAYARAN GAJI HOST LIVE STREAMING*
PT Liva Media Kreatif
Periode: ${cutoffLabel}

*Data Karyawan:*
• Nama: ${host.name}
• ID Pegawai: ${employeeId}
• Tipe Host: ${hostType}
• Studio: ${studio}
• Brand: ${host.brands?.join(', ') || '-'}

*Rekapitulasi Absensi:*
• Target Hari Kerja: ${salaryReport.requiredWorkingDays} Hari
• Total Hadir: ${salaryReport.totalHadir} Hari
  - Tepat Waktu: ${salaryReport.countTepatWaktu}x
  - Terlambat: ${salaryReport.countTerlambat}x
  - Izin / Sakit: ${salaryReport.countIzin}x
  - Alpa / Mangkir: ${salaryReport.countAlpa}x

*Rincian Penerimaan:*
• Gaji Pokok Kehadiran: ${formatIDR(baseCalculated)}
${salaryReport.totalBackupShiftsAsReguler > 0 ? `• Shift Tambahan / Backup: +${formatIDR(salaryReport.calculatedBackupPay)}\n` : ''}${salaryReport.totalOvertimeHours > 0 ? `• Uang Lembur (${salaryReport.totalOvertimeHours} Jam): +${formatIDR(salaryReport.calculatedOvertimePay)}\n` : ''}${salaryReport.isEligibleForBonus ? `• Bonus Disiplin Kehadiran (100%): +${formatIDR(salaryReport.calculatedBonus)}\n` : ''}------------------------------------------
*TOTAL DITERIMA (TAKE-HOME PAY): ${formatIDR(salaryReport.netSalary)}*
Rekening Tujuan: ${bankName} ${bankAccount}

_Diterbitkan secara digital oleh Sistem Absensi Liva Device_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-blue-300 border border-white/15">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-wide uppercase">Slip Gaji Resmi</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {host.hostType || 'Reguler'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {cutoffLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Box Karyawan & Rekening */}
          <div className="bg-[#f8f9fc] rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-500">Nama Host</span>
              </div>
              <span className="text-xs font-black text-slate-900">{host.name}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <span className="text-xs font-bold text-slate-500">ID Pegawai</span>
              <span className="text-xs font-bold font-mono text-slate-800">{employeeId}</span>
            </div>

            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Studio & Brand</span>
              </div>
              <span className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                {studio} • {host.brands?.join(', ') || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Rekening Tujuan</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">{bankName}</span>
                <span className="text-[11px] font-mono font-bold text-slate-600 block">{bankAccount}</span>
              </div>
            </div>
          </div>

          {/* Rekapitulasi Absensi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Rekapitulasi Kehadiran
              </span>
              <span className="text-[11px] font-bold text-slate-600 font-mono">
                {salaryReport.totalHadir} / {salaryReport.requiredWorkingDays} Hari
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-emerald-700 block uppercase">Tepat Waktu</span>
                <span className="text-base font-black text-emerald-800 font-mono">{salaryReport.countTepatWaktu}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-amber-700 block uppercase">Terlambat</span>
                <span className="text-base font-black text-amber-800 font-mono">{salaryReport.countTerlambat}</span>
              </div>
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-blue-700 block uppercase">Izin / Sakit</span>
                <span className="text-base font-black text-blue-800 font-mono">{salaryReport.countIzin}</span>
              </div>
              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-rose-700 block uppercase">Alpa</span>
                <span className="text-base font-black text-rose-800 font-mono">{salaryReport.countAlpa}</span>
              </div>
            </div>
          </div>

          {/* Rincian Komponen Gaji */}
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
              Rincian Penghasilan
            </span>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
              {/* Pokok */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Gaji Pokok Kehadiran</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {isReguler
                      ? `${salaryReport.totalHadir}/${salaryReport.requiredWorkingDays} hari x ${formatIDR(salaryReport.basePayRate)}`
                      : `${salaryReport.totalHadir} sesi x ${formatIDR(salaryReport.basePayRate)}`
                    }
                  </span>
                </div>
                <span className="text-xs font-black font-mono text-slate-900">
                  {formatIDR(baseCalculated)}
                </span>
              </div>

              {/* Shift Backup */}
              {salaryReport.totalBackupShiftsAsReguler > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Shift Backup / Tambahan</span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      +{salaryReport.totalBackupShiftsAsReguler} Shift Siaran
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-700">
                    +{formatIDR(salaryReport.calculatedBackupPay)}
                  </span>
                </div>
              )}

              {/* Lembur */}
              {salaryReport.totalOvertimeHours > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Uang Lembur (Overtime)</span>
                    <span className="text-[10px] text-indigo-600 font-medium">
                      +{salaryReport.totalOvertimeHours} Jam Sesi Tambahan
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono text-emerald-700">
                    +{formatIDR(salaryReport.calculatedOvertimePay)}
                  </span>
                </div>
              )}

              {/* Bonus Kehadiran */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bonus Disiplin Kehadiran (100%)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {salaryReport.isEligibleForBonus
                      ? 'Memenuhi syarat kehadiran penuh'
                      : 'Belum memenuhi syarat bonus'
                    }
                  </span>
                </div>
                <span className={`text-xs font-black font-mono ${salaryReport.isEligibleForBonus ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {salaryReport.isEligibleForBonus ? `+${formatIDR(salaryReport.calculatedBonus)}` : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>

          {/* Kotak Total Take Home Pay */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-4 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
                Total Gaji Bersih (Take Home Pay)
              </span>
              <span className="text-[11px] text-emerald-100/90 font-medium">
                Sesuai akumulasi kehadiran absen
              </span>
            </div>
            <span className="text-xl font-black font-mono tracking-tight">
              {formatIDR(salaryReport.netSalary)}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic">
            *Nominal di atas dihitung secara real-time berdasarkan rekapan absen dan jadwal siaran yang tercatat di sistem.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="flex-1 py-3 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Tersalin!' : 'Salin Ringkasan'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

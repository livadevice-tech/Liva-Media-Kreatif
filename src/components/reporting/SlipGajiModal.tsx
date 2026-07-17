import React from "react";
import { X, Printer } from "lucide-react";
import type { HostReportRow } from "../../shared/utils/salaryReporting";

interface SlipGajiModalProps {
  isOpen: boolean;
  onClose: () => void;
  hostData: HostReportRow | null;
  periode: string; // e.g. "Juli 2026"
}

const formatIDR = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const SlipGajiModal: React.FC<SlipGajiModalProps> = ({
  isOpen,
  onClose,
  hostData,
  periode,
}) => {
  if (!isOpen || !hostData) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReguler = hostData.hostType === "Reguler" || !hostData.hostType;
  const gajiPokok = isReguler
    ? Math.round(
        (hostData.basePayRate / hostData.requiredWorkingDays) *
          hostData.totalHadir,
      )
    : hostData.basePayRate; // Tarif per shift untuk non-reguler

  const logoUrl = "https://ui-avatars.com/api/?name=Liva+Agency&background=4f46e5&color=fff&rounded=true&bold=true"; // Dummy logo, using generic for now

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:block">
      {/* Container Modal */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header - Sembunyikan saat print */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center text-indigo-600">
              📄
            </span>
            Slip Gaji Host
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Area Print (Kertas Slip Gaji) */}
        <div className="p-8 overflow-y-auto print:overflow-visible print:p-4 text-slate-800 font-sans print:h-[297mm] print:w-[210mm] print:box-border mx-auto">
          
          {/* Kop Surat */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Liva Agency" className="w-16 h-16 rounded-xl" />
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Liva Agency</h1>
                <p className="text-xs text-slate-500 font-medium">Manajemen Live Streaming & Kreator Konten</p>
                <p className="text-[10px] text-slate-400">Jl. Contoh Alamat Liva No. 123, Bandar Lampung</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-indigo-700 uppercase tracking-widest border border-indigo-200 bg-indigo-50 px-4 py-1.5 rounded-lg inline-block">Slip Gaji</h2>
              <p className="text-xs font-bold text-slate-600 mt-2">Periode: {periode}</p>
            </div>
          </div>

          {/* Informasi Host */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Nama Host</span>
                <span className="col-span-2 font-bold text-slate-900">: {hostData.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Tipe Host</span>
                <span className="col-span-2 font-bold text-slate-900">: {hostData.hostType || "Reguler"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Penempatan</span>
                <span className="col-span-2 font-bold text-slate-900">: {hostData.studio?.includes("Tanggamus") ? "Studio Tanggamus" : "Studio Bandar Lampung"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Kehadiran</span>
                <span className="col-span-2 font-bold text-slate-900">: {hostData.totalHadir} Hari / Shift</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Terlambat</span>
                <span className="col-span-2 font-bold text-red-600">: {hostData.countTerlambat}x</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-semibold">Alpa / Izin</span>
                <span className="col-span-2 font-bold text-red-600">: {hostData.countAlpa} / {hostData.countIzin} Hari</span>
              </div>
            </div>
          </div>

          {/* Rincian Pendapatan & Potongan */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Kolom Pendapatan */}
            <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-3 uppercase text-xs tracking-wider">Pendapatan</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{isReguler ? "Gaji Pokok (Prata)" : "Total Tarif Shift"}</span>
                  <span className="font-semibold text-slate-900">{formatIDR(gajiPokok)}</span>
                </div>
                {hostData.calculatedBonus > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bonus Kehadiran</span>
                    <span className="font-semibold text-slate-900">{formatIDR(hostData.calculatedBonus)}</span>
                  </div>
                )}
                {hostData.calculatedOvertimePay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bonus Lembur ({hostData.totalOvertimeHours} Jam)</span>
                    <span className="font-semibold text-slate-900">{formatIDR(hostData.calculatedOvertimePay)}</span>
                  </div>
                )}
                {hostData.calculatedBackupPay > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tarif Backup Silang ({hostData.totalBackupShiftsAsReguler}x)</span>
                    <span className="font-semibold text-slate-900">{formatIDR(hostData.calculatedBackupPay)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Potongan */}
            <div>
              <h3 className="font-bold text-slate-800 border-b border-slate-300 pb-2 mb-3 uppercase text-xs tracking-wider">Potongan</h3>
              <div className="space-y-3 text-sm">
                {(!isReguler && hostData.totalHadir === 0) ? (
                  <div className="flex justify-between">
                    <span className="text-slate-600">-</span>
                    <span className="font-semibold text-slate-900">Rp 0</span>
                  </div>
                ) : (
                  <>
                     <div className="flex justify-between">
                        <span className="text-slate-600">Tidak ada potongan sistem tertulis</span>
                        <span className="font-semibold text-slate-900">Rp 0</span>
                      </div>
                      {/* Placeholder untuk denda manual jika ada */}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Total Gaji */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-5 flex items-center justify-between mb-10">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Total Gaji Bersih (Take Home Pay)</span>
            <span className="text-2xl font-black text-indigo-700">{formatIDR(hostData.netSalary)}</span>
          </div>

          {/* Transfer Info & Tanda Tangan */}
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-slate-700 mb-2">Informasi Pembayaran:</h4>
              <p className="text-slate-600 flex flex-col gap-1">
                <span><span className="inline-block w-24">Nama Bank</span>: <strong>{hostData.bankName || "-"}</strong></span>
                <span><span className="inline-block w-24">No. Rekening</span>: <strong className="font-mono">{hostData.bankAccount || "-"}</strong></span>
                <span><span className="inline-block w-24">Atas Nama</span>: <strong>{hostData.name}</strong></span>
              </p>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-slate-600 mb-16">Mengetahui, Manajer Operasional</p>
              <p className="font-bold text-slate-800 uppercase underline underline-offset-4 decoration-2">Tim Admin / HR Liva Agency</p>
            </div>
          </div>

          {/* Footer Print */}
          <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-medium print:block hidden">
            Dokumen ini dicetak otomatis oleh Sistem Liva Agency pada {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}.
          </div>

        </div>
      </div>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0, .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            min-height: 100vh;
            background: white !important;
            display: block !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

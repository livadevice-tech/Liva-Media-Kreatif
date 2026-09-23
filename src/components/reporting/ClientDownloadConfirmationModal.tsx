import { Download, X, FileText, FileSpreadsheet } from "lucide-react";
import { formatDateTimeSafe } from "../../shared/utils/dateTime";

interface ClientDownloadConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  platform: string;
  onDownloadExcel: () => void;
  onDownloadPdf: () => void;
}

export function ClientDownloadConfirmationModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  platform,
  onDownloadExcel,
  onDownloadPdf,
}: ClientDownloadConfirmationModalProps) {
  if (!isOpen) return null;

  const formattedStart = startDate ? formatDateTimeSafe(startDate, { day: "numeric", month: "long", year: "numeric" }) : "";
  const formattedEnd = endDate ? formatDateTimeSafe(endDate, { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel from right */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out border-l border-slate-100">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Export Laporan</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Pilih format file dan verifikasi periode
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Info summary card */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Detail Laporan
              </span>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Platform:</span>
                  <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs">
                    {platform || "Semua Platform"}
                  </span>
                </div>
                <div className="flex justify-between items-start py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Periode:</span>
                  <div className="text-right font-bold text-slate-800 text-xs">
                    {formattedStart && formattedEnd && formattedStart !== formattedEnd ? (
                      <>
                        <div>{formattedStart}</div>
                        <div className="text-slate-400 text-[10px]">sampai</div>
                        <div>{formattedEnd}</div>
                      </>
                    ) : (
                      <div>{formattedStart || formattedEnd || "Semua Tanggal"}</div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Data yang diekspor mencakup ringkasan metrik, performa live stream, dan riwayat sesuai filter yang aktif.
              </p>
            </div>

            {/* Format choice cards */}
            <div className="space-y-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Pilih Format File
              </span>

              {/* Excel Card */}
              <button
                type="button"
                onClick={() => {
                  onDownloadExcel();
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-4 text-left transition-all hover:border-emerald-500 hover:bg-emerald-50/80 hover:shadow-md hover:shadow-emerald-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      Unduh Excel (.xlsx)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tabel komplit, mudah diolah untuk spreadsheet
                    </p>
                  </div>
                </div>
                <div className="text-emerald-600 font-black text-sm pr-1 transition-transform group-hover:translate-x-1">
                  →
                </div>
              </button>

              {/* PDF Card */}
              <button
                type="button"
                onClick={() => {
                  onDownloadPdf();
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border-2 border-indigo-500/20 bg-indigo-50/40 p-4 text-left transition-all hover:border-indigo-500 hover:bg-indigo-50/80 hover:shadow-md hover:shadow-indigo-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      Unduh PDF (.pdf)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Format dokumen cetak rapi & siap dibagikan
                    </p>
                  </div>
                </div>
                <div className="text-indigo-600 font-black text-sm pr-1 transition-transform group-hover:translate-x-1">
                  →
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

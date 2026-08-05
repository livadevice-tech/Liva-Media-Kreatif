import React from "react";
import { Download, X, FileText, FileSpreadsheet } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5600e0]/10">
            <Download className="h-6 w-6 text-[#5600e0]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Konfirmasi Unduhan</h2>
            <p className="text-sm font-medium text-gray-500">
              Pilih format file laporan Anda
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl bg-gray-50 p-5 text-sm font-medium text-gray-700 leading-relaxed border border-gray-100">
          Anda ingin mengunduh laporan dari tanggal <strong className="text-[#5600e0]">{startDate || "-"}</strong> ke <strong className="text-[#5600e0]">{endDate || "-"}</strong> yang ada di platform <strong className="text-[#5600e0]">{platform || "Semua Platform"}</strong>.
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onDownloadExcel();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#5600e0] px-4 py-4 text-[15px] font-bold text-white transition-all hover:bg-[#4b00c4] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          >
            <FileSpreadsheet size={20} />
            Unduh Excel (.xlsx)
          </button>
          
          <button
            onClick={() => {
              onDownloadPdf();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#5600e0] bg-white px-4 py-4 text-[15px] font-bold text-[#5600e0] transition-all hover:bg-[#5600e0]/5 active:bg-[#5600e0]/10"
          >
            <FileText size={20} />
            Unduh PDF (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}

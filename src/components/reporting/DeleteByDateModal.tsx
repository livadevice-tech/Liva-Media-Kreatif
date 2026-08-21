import { Trash2 } from "lucide-react";
import { CustomDatePicker } from "../ui/CustomDatePicker";

type DeleteByDateModalProps = {
  isOpen: boolean;
  isSavingReport: boolean;
  startDate: string;
  endDate: string;
  selectedPlatform: string;
  availablePlatforms: string[];
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteByDateModal({
  isOpen,
  isSavingReport,
  startDate,
  endDate,
  selectedPlatform,
  availablePlatforms,
  onStartDateChange,
  onEndDateChange,
  onPlatformChange,
  onClose,
  onConfirm,
}: DeleteByDateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 sm:pt-[10vh] sm:pb-12 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-scaleUp my-auto sm:my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-transparent border-0 cursor-pointer"
        >
          ✕
        </button>
        <h3 className="text-lg font-black text-slate-800 mb-2">
          Hapus Berdasarkan Rentang Waktu
        </h3>
        <p className="text-xs font-semibold text-slate-500 mb-6">
          Pilih rentang tanggal dan platform. Semua raw data milik brand ini pada periode
          dan platform yang dipilih akan dihapus permanen.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
              Dari Tanggal (Start)
            </label>
            <CustomDatePicker
              value={startDate}
              onChange={(value) => onStartDateChange(value)}
              placeholder="Pilih Tanggal Mulai"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
              Sampai Tanggal (End)
            </label>
            <CustomDatePicker
              value={endDate}
              onChange={(value) => onEndDateChange(value)}
              placeholder="Pilih Tanggal Selesai"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => onPlatformChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="Semua Platform">Semua Platform</option>
              {availablePlatforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border-0"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer border-0 shadow-sm flex items-center gap-2"
            disabled={isSavingReport}
          >
            <Trash2 className="w-3.5 h-3.5" /> Hapus Data
          </button>
        </div>
      </div>
    </div>
  );
}

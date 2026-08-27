import React, { useState } from "react";

interface AddManualDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (date: string, durationSeconds: number) => void;
}

export function AddManualDurationModal({
  isOpen,
  onClose,
  onSave,
}: AddManualDurationModalProps) {
  const [date, setDate] = useState("");
  const [durationStr, setDurationStr] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert("Harap pilih tanggal!");
      return;
    }
    
    let newDuration = 0;
    const parts = durationStr.split(":").map(p => parseInt(p, 10));
    if (parts.length === 3 && !parts.some(isNaN)) {
      newDuration = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2 && !parts.some(isNaN)) {
      newDuration = parts[0] * 60 + parts[1];
    } else {
      newDuration = parseInt(durationStr, 10) || 0;
    }

    if (newDuration <= 0) {
      alert("Format durasi tidak valid atau 0. Gunakan format HH:MM:SS atau HH:MM.");
      return;
    }

    onSave(date, newDuration);
    setDate("");
    setDurationStr("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Tambah Durasi Manual</h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Tambahkan sesi live stream tanpa metrik penjualan</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors focus:outline-none"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durasi (HH:MM:SS)</label>
              <input
                type="text"
                required
                placeholder="Contoh: 02:30:00"
                value={durationStr}
                onChange={(e) => setDurationStr(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all focus:outline-none"
            >
              Simpan Durasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

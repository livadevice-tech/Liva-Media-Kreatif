import React, { useState, useEffect } from "react";
import {
  X,
  Clock,
  Calendar,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";
import type { HostEmployee, OvertimeRecord } from "../../types";
import { formatCutoffPeriodOptionLabel } from "../../shared/utils/reporting";
import { overtimesApi } from "../../api";

interface OvertimeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  hosts: HostEmployee[];
  availableCutoffMonths: string[];
  defaultCutoff?: string;
  defaultHostId?: string;
  hourlyRate?: number;
  onSaved: (record: OvertimeRecord) => void;
  formatIDR: (amount: number) => string;
  initialData?: OvertimeRecord | null;
}

export const OvertimeInputModal: React.FC<OvertimeInputModalProps> = ({
  isOpen,
  onClose,
  hosts,
  availableCutoffMonths,
  defaultCutoff = "",
  defaultHostId = "",
  onSaved,
  formatIDR,
  initialData,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Form states
  const [hostId, setHostId] = useState<string>(defaultHostId);
  const [cutoffPeriod, setCutoffPeriod] = useState<string>(defaultCutoff);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState<number>(2);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Sync initial or default values when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setHostId(initialData.hostId || "");
      setCutoffPeriod(initialData.cutoffPeriod || defaultCutoff || (availableCutoffMonths[0] || ""));
      setDate(initialData.date ? initialData.date.split("T")[0] : new Date().toISOString().split("T")[0]);
      setHours(initialData.hours || 0);
      setAmount(initialData.amount || 0);
      setNotes(initialData.notes || "");
    } else {
      setHostId(defaultHostId || (hosts.length > 0 ? hosts[0].id : ""));
      setCutoffPeriod(defaultCutoff || (availableCutoffMonths[0] || ""));
      setDate(new Date().toISOString().split("T")[0]);
      setHours(2);
      setAmount(0);
      setNotes("");
    }
    setErrorMsg("");
  }, [isOpen, initialData, defaultCutoff, defaultHostId, hosts, availableCutoffMonths]);

  const handleHoursChange = (newHours: number) => {
    const validH = Math.max(0, newHours);
    setHours(validH);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostId) {
      setErrorMsg("Pilih host terlebih dahulu.");
      return;
    }
    if (!cutoffPeriod) {
      setErrorMsg("Pilih periode cut-off penggajian.");
      return;
    }
    if (hours <= 0) {
      setErrorMsg("Jumlah jam lembur harus lebih besar dari 0.");
      return;
    }
    if (amount <= 0) {
      setErrorMsg("Masukkan nominal jumlah yang dibayarkan.");
      return;
    }

    const selectedHost = hosts.find((h) => h.id === hostId);
    const hostName = selectedHost ? selectedHost.name : (initialData?.hostName || "");

    setLoading(true);
    setErrorMsg("");

    try {
      const payload: Partial<OvertimeRecord> = {
        hostId,
        hostName,
        cutoffPeriod,
        date,
        hours: Number(hours),
        amount: Number(amount),
        notes: notes.trim(),
      };

      let savedRecord: OvertimeRecord;
      if (isEditing && initialData?.id) {
        savedRecord = await overtimesApi.update(initialData.id, payload);
      } else {
        savedRecord = await overtimesApi.create(payload);
      }

      onSaved(savedRecord);
      onClose();
    } catch (err: any) {
      console.error("Gagal menyimpan data lembur:", err);
      setErrorMsg(err?.message || "Terjadi kesalahan saat menyimpan lembur.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedHostObj = hosts.find((h) => h.id === hostId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 via-white to-purple-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                {isEditing ? "Edit Data Lembur" : "Kit Input Lembur Host"}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Input jam & langsung isi nominal yang dibayarkan untuk cut-off terpilih
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Pilih Cutoff Periode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>Periode Cut-Off (Gaji Ditambahkan Ke Sini)</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={cutoffPeriod}
              onChange={(e) => setCutoffPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all cursor-pointer"
            >
              {availableCutoffMonths.map((m) => (
                <option key={m} value={m}>
                  {formatCutoffPeriodOptionLabel(m)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Nominal lembur ini akan langsung otomatis masuk ke slip dan draf gaji pada cut-off ini.
            </p>
          </div>

          {/* 2. Pilih Host */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-600" />
              <span>Pilih Host Streamer</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              value={hostId}
              onChange={(e) => setHostId(e.target.value)}
              disabled={isEditing}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <option value="">-- Pilih Host --</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.studio || "Bandar Lampung"} - {h.hostType || "Reguler"})
                </option>
              ))}
            </select>
            {selectedHostObj && (
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                  {selectedHostObj.studio || "Studio Bandar Lampung"}
                </span>
                <span>•</span>
                <span>Tipe: {selectedHostObj.hostType || "Reguler"}</span>
              </div>
            )}
          </div>

          {/* Row: Tanggal & Jumlah Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Tanggal Lembur */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Lembur</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all"
              />
            </div>

            {/* Jumlah Jam */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-600" />
                  <span>Jumlah Jam Lembur</span>
                  <span className="text-red-500">*</span>
                </span>
                <span className="text-[10px] text-violet-600 font-bold">{hours} Jam</span>
              </label>
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10 transition-all overflow-hidden">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={hours}
                  onChange={(e) => handleHoursChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                  placeholder="Contoh: 2"
                />
                <span className="px-3 py-2 text-xs font-bold text-slate-400 bg-slate-100/60 border-l border-slate-200 shrink-0">
                  Jam
                </span>
              </div>
              {/* Quick Hours Pills */}
              <div className="flex items-center gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => handleHoursChange(h)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      hours === h
                        ? "bg-violet-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Jumlah yang Dibayarkan (Nominal Langsung) */}
          <div className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-2.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-violet-600" />
              <span>Jumlah yang Dibayarkan (Nominal Langsung)</span>
              <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center rounded-xl border border-violet-200/90 bg-white focus-within:border-violet-600 focus-within:ring-4 focus-within:ring-violet-600/10 transition-all overflow-hidden shadow-2xs">
              <span className="px-3.5 py-2.5 text-xs font-black text-violet-700 bg-violet-100/50 border-r border-violet-200/80 shrink-0 select-none">
                Rp
              </span>
              <input
                type="text"
                value={amount > 0 ? new Intl.NumberFormat("id-ID").format(amount) : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  const parsed = raw ? parseInt(raw, 10) : 0;
                  setAmount(parsed);
                }}
                className="w-full bg-transparent px-3.5 py-2.5 text-sm font-black text-slate-900 outline-none font-mono placeholder:text-slate-400 placeholder:font-normal"
                placeholder="Ketik langsung nominal uang lembur, cth: 50.000"
                autoFocus
              />
            </div>

            {/* Quick Nominal Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-slate-400 font-medium mr-0.5">Pilihan Cepat:</span>
              {[25000, 50000, 75000, 100000, 150000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    amount === val
                      ? "bg-violet-600 text-white border-violet-600 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50"
                  }`}
                >
                  +{formatIDR(val)}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500">
              Ketik langsung nominal rupiah yang akan ditambahkan ke gaji host (bukan perkalian tarif per jam).
            </p>
          </div>

          {/* 4. Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Keterangan Lembur</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Lembur Live Campaign 10.10, Tambahan siaran malam brand X..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-xs font-bold text-white shadow-md shadow-violet-600/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isEditing ? "Simpan Perubahan" : "Simpan Lembur"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

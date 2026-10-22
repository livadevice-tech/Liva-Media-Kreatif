import React, { useState, useMemo } from "react";
import {
  Clock,
  Plus,
  Search,
  Calendar,
  User,
  DollarSign,
  Edit2,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Building2,
  MapPin,
  ChevronDown,
  Info,
  AlertTriangle,
  Loader2,
  FileText,
} from "lucide-react";
import type { HostEmployee, OvertimeRecord } from "../../types";
import { formatCutoffPeriodOptionLabel } from "../../shared/utils/reporting";
import { overtimesApi } from "../../api";
import { OvertimeInputModal } from "./OvertimeInputModal";

interface OvertimeManagementPanelProps {
  hosts: HostEmployee[];
  overtimes: OvertimeRecord[];
  onRefreshOvertimes: () => Promise<void>;
  availableCutoffMonths: string[];
  activeCutoff: string;
  onCutoffChange: (cutoff: string) => void;
  hourlyRate?: number;
  formatIDR: (amount: number) => string;
}

export const OvertimeManagementPanel: React.FC<OvertimeManagementPanelProps> = ({
  hosts,
  overtimes,
  onRefreshOvertimes,
  availableCutoffMonths,
  activeCutoff,
  onCutoffChange,
  hourlyRate = 20000,
  formatIDR,
}) => {
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OvertimeRecord | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [locationTab, setLocationTab] = useState<"Semua" | "Bandar Lampung" | "Tanggamus">("Semua");
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [deletingItemObj, setDeletingItemObj] = useState<OvertimeRecord | null>(null);

  // Quick inline form state
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickHostId, setQuickHostId] = useState("");
  const [quickCutoff, setQuickCutoff] = useState(activeCutoff || (availableCutoffMonths[0] || ""));
  const [quickDate, setQuickDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quickHours, setQuickHours] = useState(2);
  const [quickAmount, setQuickAmount] = useState(40000);
  const [quickNotes, setQuickNotes] = useState("");
  const [quickManualAmount, setQuickManualAmount] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [quickSuccess, setQuickSuccess] = useState("");

  const handleQuickHoursChange = (h: number) => {
    const val = Math.max(0, h);
    setQuickHours(val);
    if (!quickManualAmount) {
      setQuickAmount(Math.round(val * (hourlyRate || 20000)));
    }
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickHostId) {
      setQuickError("Pilih host terlebih dahulu.");
      return;
    }
    if (!quickCutoff) {
      setQuickError("Pilih cut-off periode.");
      return;
    }
    if (quickHours <= 0) {
      setQuickError("Jam lembur harus lebih besar dari 0.");
      return;
    }

    const hostObj = hosts.find((h) => h.id === quickHostId);
    const hostName = hostObj ? hostObj.name : "";

    setQuickLoading(true);
    setQuickError("");
    setQuickSuccess("");

    try {
      await overtimesApi.create({
        hostId: quickHostId,
        hostName,
        cutoffPeriod: quickCutoff,
        date: quickDate,
        hours: Number(quickHours),
        amount: Number(quickAmount),
        notes: quickNotes.trim(),
      });

      await onRefreshOvertimes();
      setQuickSuccess(`Lembur ${hostName} (${quickHours} jam) berhasil disimpan!`);
      setQuickNotes("");
      setQuickHours(2);
      setQuickAmount(2 * (hourlyRate || 20000));
      setQuickManualAmount(false);
      setTimeout(() => setQuickSuccess(""), 4000);
    } catch (err: any) {
      setQuickError(err?.message || "Gagal menyimpan lembur.");
    } finally {
      setQuickLoading(false);
    }
  };

  // Delete Overtime
  const confirmDelete = async () => {
    if (!deletingItemObj) return;
    setIsDeletingId(deletingItemObj.id);
    try {
      await overtimesApi.delete(deletingItemObj.id);
      await onRefreshOvertimes();
      setDeletingItemObj(null);
    } catch (err: any) {
      alert("Gagal menghapus lembur: " + err.message);
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered list
  const filteredOvertimes = useMemo(() => {
    return overtimes.filter((item) => {
      // Cutoff filter
      const matchCutoff =
        !activeCutoff || activeCutoff === "Semua" || item.cutoffPeriod === activeCutoff;

      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        item.hostName?.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query) ||
        item.date?.includes(query);

      // Location filter
      const host = hosts.find((h) => h.id === item.hostId || h.name === item.hostName);
      let matchLocation = true;
      if (locationTab === "Bandar Lampung") {
        matchLocation = !host?.studio?.includes("Tanggamus");
      } else if (locationTab === "Tanggamus") {
        matchLocation = host?.studio?.includes("Tanggamus") || false;
      }

      return matchCutoff && matchQuery && matchLocation;
    });
  }, [overtimes, activeCutoff, searchQuery, locationTab, hosts]);

  // Statistics for active cutoff
  const stats = useMemo(() => {
    const listForCutoff = overtimes.filter(
      (o) => !activeCutoff || activeCutoff === "Semua" || o.cutoffPeriod === activeCutoff,
    );
    const totalAmount = listForCutoff.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const totalHours = listForCutoff.reduce((sum, o) => sum + (Number(o.hours) || 0), 0);
    const uniqueHosts = new Set(listForCutoff.map((o) => o.hostId || o.hostName)).size;
    const totalEntries = listForCutoff.length;

    return { totalAmount, totalHours, uniqueHosts, totalEntries };
  }, [overtimes, activeCutoff]);

  // Export CSV of overtime
  const handleExportCSV = () => {
    const headers = [
      "Nama Host",
      "Studio/Wilayah",
      "Periode Cut-Off",
      "Tanggal Lembur",
      "Jumlah Jam",
      "Nominal Dibayarkan (Rp)",
      "Keterangan",
    ];

    const rows = filteredOvertimes.map((o) => {
      const host = hosts.find((h) => h.id === o.hostId || h.name === o.hostName);
      return [
        o.hostName,
        host?.studio || "Bandar Lampung",
        o.cutoffPeriod,
        o.date || "-",
        o.hours,
        o.amount,
        o.notes || "-",
      ];
    });

    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((r) =>
          r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Lembur_${activeCutoff || "Semua"}_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="p-5 md:p-6 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,white_0,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2 text-violet-100 border border-white/20">
              <Clock className="w-3.5 h-3.5" />
              <span>Modul Penggajian Ekstra</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight">
              Manajemen Lembur (Overtime) Host
            </h1>
            <p className="text-xs md:text-sm text-violet-100/90 mt-1 max-w-xl font-medium leading-relaxed">
              Catat jam lembur dan nominal gaji tambahan per cut-off periode. Nominal lembur otomatis masuk ke perhitungan gaji bersih host.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowQuickForm(!showQuickForm)}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-all border border-white/25 active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{showQuickForm ? "Tutup Form Cepat" : "Form Cepat Lembur"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="px-4.5 py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 text-xs font-black transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input Lembur Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK INLINE KIT FORM (Toggleable) */}
      {showQuickForm && (
        <div className="p-5 bg-white rounded-3xl border border-violet-100 shadow-md space-y-4 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Kit Input Cepat Lembur (Langsung Tambah ke Cut-Off)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              Tarif standar: {formatIDR(hourlyRate)}/jam
            </span>
          </div>

          {quickSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{quickSuccess}</span>
            </div>
          )}
          {quickError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {quickError}
            </div>
          )}

          <form onSubmit={handleQuickSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Cutoff Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-violet-600" />
                  <span>Cut-Off Periode</span>
                </label>
                <select
                  value={quickCutoff}
                  onChange={(e) => setQuickCutoff(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-violet-500 transition-all cursor-pointer"
                >
                  {availableCutoffMonths.map((m) => (
                    <option key={m} value={m}>
                      {formatCutoffPeriodOptionLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Host Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-violet-600" />
                  <span>Pilih Host</span>
                </label>
                <select
                  value={quickHostId}
                  onChange={(e) => setQuickHostId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-violet-500 transition-all cursor-pointer"
                >
                  <option value="">-- Pilih Host --</option>
                  {hosts.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.studio || "Bandar Lampung"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Jumlah Jam */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-violet-600" />
                    <span>Jumlah Jam</span>
                  </span>
                  <span className="text-[10px] text-violet-600 font-bold">{quickHours} Jam</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-violet-500 transition-all">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={quickHours}
                    onChange={(e) => handleQuickHoursChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent px-3 py-2 text-xs font-bold text-slate-800 outline-none"
                    placeholder="2"
                  />
                  <span className="px-2.5 py-2 text-xs font-bold text-slate-400 bg-slate-100/60 border-l border-slate-200">
                    Jam
                  </span>
                </div>
              </div>

              {/* Jumlah yang Dibayarkan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-violet-600" />
                    <span>Dibayarkan (Rp)</span>
                  </span>
                  {quickManualAmount && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAmount(Math.round(quickHours * (hourlyRate || 20000)));
                        setQuickManualAmount(false);
                      }}
                      className="text-[9px] text-violet-600 hover:underline font-bold"
                    >
                      Reset Standar
                    </button>
                  )}
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-violet-500 transition-all">
                  <span className="px-2.5 py-2 text-xs font-bold text-slate-400 bg-slate-100/60 border-r border-slate-200">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={new Intl.NumberFormat("id-ID").format(quickAmount)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      setQuickAmount(raw ? parseInt(raw, 10) : 0);
                      setQuickManualAmount(true);
                    }}
                    className="w-full bg-transparent px-3 py-2 text-xs font-bold text-slate-800 outline-none font-mono"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Tanggal, Keterangan & Submit */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <div className="sm:col-span-3">
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-violet-500"
                />
              </div>
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Keterangan lembur (contoh: Lembur Live Sale 10.10, Tambahan shift malam...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium outline-none focus:bg-white focus:border-violet-500 placeholder:text-slate-400"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button
                  type="submit"
                  disabled={quickLoading}
                  className="w-full py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 active:scale-95 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
                >
                  {quickLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Tambah Lembur</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SUMMARY STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 md:gap-4">
        {/* Card 1: Total Biaya Lembur */}
        <div className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Uang Lembur
            </span>
            <div className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center shadow-3xs">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-lg md:text-xl font-black text-slate-900 tracking-tight block">
              {formatIDR(stats.totalAmount)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cut-off terpilih
            </span>
          </div>
        </div>

        {/* Card 2: Total Jam Lembur */}
        <div className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Jam Lembur
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-3xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {stats.totalHours}{" "}
              <span className="text-[10px] font-bold text-slate-400 uppercase">Jam</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Akumulasi jam kerja tambahan
            </span>
          </div>
        </div>

        {/* Card 3: Host yang Lembur */}
        <div className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Host Yang Lembur
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-3xs">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {stats.uniqueHosts}{" "}
              <span className="text-[10px] font-bold text-slate-400 uppercase">Orang</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Menerima uang lembur
            </span>
          </div>
        </div>

        {/* Card 4: Total Entri Lembur */}
        <div className="p-4 bg-white rounded-2xl shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Sesi Lembur
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-3xs">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-lg md:text-xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
              {stats.totalEntries}{" "}
              <span className="text-[10px] font-bold text-slate-400 uppercase">Sesi</span>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Tercatat pada cut-off
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama host atau keterangan lembur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 font-semibold focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Cut-Off Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>Cut-Off:</span>
            </span>
            <select
              value={activeCutoff}
              onChange={(e) => onCutoffChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-violet-500 outline-none transition-all cursor-pointer"
            >
              <option value="Semua">Semua Periode Cut-Off</option>
              {availableCutoffMonths.map((m) => (
                <option key={m} value={m}>
                  {formatCutoffPeriodOptionLabel(m)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Unduh Data Lembur CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Location Filter Tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3">
          {(["Semua", "Bandar Lampung", "Tanggamus"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setLocationTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                locationTab === tab
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab === "Semua" ? "Semua Wilayah" : `Studio ${tab}`}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            Menampilkan {filteredOvertimes.length} data lembur
          </span>
        </div>
      </div>

      {/* OVERTIME DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-4 px-6">Host & Wilayah</th>
                <th className="py-4 px-4 text-center">Periode Cut-Off</th>
                <th className="py-4 px-4 text-center">Tanggal Lembur</th>
                <th className="py-4 px-4 text-center">Jumlah Jam</th>
                <th className="py-4 px-4 text-right">Jumlah Dibayarkan</th>
                <th className="py-4 px-6">Keterangan</th>
                <th className="py-4 px-6 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOvertimes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Belum Ada Rekam Data Lembur</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeCutoff && activeCutoff !== "Semua"
                        ? `Tidak ada lembur tercatat pada periode ${formatCutoffPeriodOptionLabel(activeCutoff)}`
                        : "Klik tombol '+ Input Lembur Baru' untuk mencatat lembur pertama"}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setIsModalOpen(true);
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Input Lembur Sekarang</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredOvertimes.map((item) => {
                  const host = hosts.find((h) => h.id === item.hostId || h.name === item.hostName);
                  const isTanggamus = host?.studio?.includes("Tanggamus");

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-violet-50/30 transition-colors group"
                    >
                      {/* Host info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 font-black text-xs flex items-center justify-center shrink-0 border border-violet-200 uppercase">
                            {item.hostName?.substring(0, 2) || "HO"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate text-xs">
                              {item.hostName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                  isTanggamus
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : "bg-blue-50 text-blue-700 border border-blue-200/60"
                                }`}
                              >
                                {isTanggamus ? "Tanggamus" : "Bandar Lampung"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {host?.hostType || "Reguler"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cutoff period */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200/60 font-mono">
                          {item.cutoffPeriod}
                        </span>
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-4 text-center font-medium text-slate-600 whitespace-nowrap">
                        {item.date ? item.date.split("T")[0] : "-"}
                      </td>

                      {/* Jam Lembur */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-mono font-bold text-xs">
                          <Clock className="w-3 h-3 text-violet-600" />
                          <span>{item.hours} Jam</span>
                        </span>
                      </td>

                      {/* Nominal Dibayarkan */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-mono font-black text-sm text-emerald-700">
                          {formatIDR(item.amount)}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-4 px-6 text-slate-600 font-medium max-w-xs">
                        {item.notes ? (
                          <span className="truncate block" title={item.notes}>
                            {item.notes}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">- Tanpa catatan -</span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                            title="Edit Data Lembur"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItemObj(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Data Lembur"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INPUT / EDIT MODAL */}
      <OvertimeInputModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        hosts={hosts}
        availableCutoffMonths={availableCutoffMonths}
        defaultCutoff={activeCutoff && activeCutoff !== "Semua" ? activeCutoff : availableCutoffMonths[0]}
        hourlyRate={hourlyRate}
        onSaved={async () => {
          await onRefreshOvertimes();
        }}
        formatIDR={formatIDR}
        initialData={editingItem}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItemObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Hapus Data Lembur?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Anda akan menghapus lembur <strong>{deletingItemObj.hostName}</strong> ({deletingItemObj.hours} jam - {formatIDR(deletingItemObj.amount)}) pada cut-off <strong>{deletingItemObj.cutoffPeriod}</strong>. Nominal ini akan langsung dipotong dari draf gaji.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItemObj(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(isDeletingId)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {isDeletingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Ya, Hapus</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

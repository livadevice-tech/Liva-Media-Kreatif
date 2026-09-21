import React, { useState, useMemo } from "react";
import { X, FileSpreadsheet, Download, Calendar, Filter, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import type { ShiftSchedule, ClientBrand, HostEmployee } from "../../types";
import { CustomDatePicker } from "../ui/CustomDatePicker";

interface ScheduleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: ShiftSchedule[];
  clientBrands: ClientBrand[];
  hosts: HostEmployee[];
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export const ScheduleExportModal: React.FC<ScheduleExportModalProps> = ({
  isOpen,
  onClose,
  schedules,
  clientBrands,
  hosts,
  defaultStartDate,
  defaultEndDate,
}) => {
  // Format today helper
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getWeekStartEnd = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const dayStr = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${dayStr}`;
    };
    return { start: fmt(monday), end: fmt(sunday) };
  };

  const weekRange = useMemo(() => getWeekStartEnd(), []);

  const [startDate, setStartDate] = useState<string>(defaultStartDate || weekRange.start);
  const [endDate, setEndDate] = useState<string>(defaultEndDate || weekRange.end);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedHost, setSelectedHost] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // List unique brand names
  const brandOptions = useMemo(() => {
    const list = clientBrands.filter((b) => b.isActive !== false).map((b) => b.name);
    // Include any brands from schedules as well
    schedules.forEach((s) => {
      if (s.brand && !list.includes(s.brand)) list.push(s.brand);
    });
    return Array.from(new Set(list)).sort();
  }, [clientBrands, schedules]);

  // Filtered schedules preview count
  const matchingSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const sDate = (s.date || "").split("T")[0];
      if (!sDate) return false;
      if (startDate && sDate < startDate) return false;
      if (endDate && sDate > endDate) return false;
      if (selectedBrand !== "all" && s.brand?.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (selectedHost !== "all" && s.hostId !== selectedHost && s.hostName?.toLowerCase() !== selectedHost.toLowerCase()) return false;
      return true;
    });
  }, [schedules, startDate, endDate, selectedBrand, selectedHost]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (matchingSchedules.length === 0) {
      alert("Tidak ada jadwal yang sesuai dengan filter tanggal dan brand yang dipilih.");
      return;
    }

    setIsExporting(true);
    try {
      // Sort schedules chronologically by date and shift
      const sorted = [...matchingSchedules].sort((a, b) => {
        const dateDiff = (a.date || "").localeCompare(b.date || "");
        if (dateDiff !== 0) return dateDiff;
        return (a.timeSlot || "").localeCompare(b.timeSlot || "");
      });

      // Prepare Excel rows
      const rows = sorted.map((s, idx) => {
        const d = new Date(s.date);
        const dayName = !isNaN(d.getTime())
          ? d.toLocaleDateString("id-ID", { weekday: "long" })
          : "";

        return {
          No: idx + 1,
          Tanggal: s.date || "",
          Hari: dayName,
          "Shift / Jam Siaran": s.timeSlot || "",
          "Nama Host": s.hostName || "-",
          "ID Host": s.employeeId || "-",
          Brand: s.brand || "-",
          Platform: s.platform || "-",
          Studio: s.studio || "-",
          Status: s.status || "Assigned",
          "Host Backup": s.backupHostName || "-",
          Keterangan: s.isOffDay ? "Libur (Off)" : s.isPindahStudio ? "Pindah Studio" : "-",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      const colWidths = [
        { wch: 6 },  // No
        { wch: 14 }, // Tanggal
        { wch: 10 }, // Hari
        { wch: 26 }, // Shift / Jam Siaran
        { wch: 22 }, // Nama Host
        { wch: 12 }, // ID Host
        { wch: 18 }, // Brand
        { wch: 16 }, // Platform
        { wch: 22 }, // Studio
        { wch: 12 }, // Status
        { wch: 20 }, // Host Backup
        { wch: 18 }, // Keterangan
      ];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Jadwal Siaran");

      // File naming
      const brandPart = selectedBrand === "all" ? "SemuaBrand" : selectedBrand.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `Jadwal_Host_${brandPart}_${startDate}_sd_${endDate}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Gagal export excel jadwal:", err);
      alert("Terjadi kesalahan saat mengekspor Excel jadwal.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Export Jadwal ke Excel
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Download file .xlsx jadwal host berdasarkan rentang tanggal & brand
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Quick Date Presets */}
          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Periode Tanggal Jadwal
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  const today = getTodayStr();
                  setStartDate(today);
                  setEndDate(today);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border-0 cursor-pointer"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate(weekRange.start);
                  setEndDate(weekRange.end);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border-0 cursor-pointer"
              >
                Minggu Ini
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  const y = d.getFullYear();
                  const m = d.getMonth();
                  const start = `${y}-${String(m + 1).padStart(2, "0")}-01`;
                  const lastDay = new Date(y, m + 1, 0).getDate();
                  const end = `${y}-${String(m + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border-0 cursor-pointer"
              >
                Bulan Ini
              </button>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">DARI TANGGAL</span>
                <CustomDatePicker
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  className="w-full text-xs font-semibold"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold px-1 self-end pb-2">s/d</span>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">SAMPAI TANGGAL</span>
                <CustomDatePicker
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  className="w-full text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Filter Brand */}
          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Pilih Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer transition-all outline-none"
            >
              <option value="all">Semua Brand ({brandOptions.length} Brand)</option>
              {brandOptions.map((brandName) => (
                <option key={brandName} value={brandName}>
                  {brandName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Host (Opsional) */}
          <div>
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Pilih Host (Opsional)
            </label>
            <select
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer transition-all outline-none"
            >
              <option value="all">Semua Host ({hosts.length} Host)</option>
              {hosts.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} {h.employeeId ? `(${h.employeeId})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Box */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-800 block">
                Total Jadwal Terfilter:
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                {startDate} s.d. {endDate} • {selectedBrand === "all" ? "Semua Brand" : selectedBrand}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-emerald-700">
                {matchingSchedules.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold block uppercase">
                Sesi Siaran
              </span>
            </div>
          </div>

          {/* Export Success Message */}
          {exportSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              File Excel berhasil diunduh!
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer border-0 bg-transparent"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isExporting || matchingSchedules.length === 0}
            onClick={handleExport}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Mengekspor..." : `Export Excel (${matchingSchedules.length} Sesi)`}
          </button>
        </div>
      </div>
    </div>
  );
};

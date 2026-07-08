import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Plus, Calendar, Clock, Edit2, Trash2 } from "lucide-react";
import type { AttendanceLog, HostEmployee, ClientBrand } from "../../types";
import { SearchableHostSelect } from "./HostManagement";

interface SalarySettings {
  useCutOff: boolean;
  cutOffStartDay: number;
  cutOffEndDay: number;
}

interface AttendanceCalendarViewProps {
  logs: AttendanceLog[];
  hosts: HostEmployee[];
  clientBrands: ClientBrand[];
  platforms: string[];
  shifts: string[];
  studios: string[];
  salarySettings: SalarySettings;
  onSaveLog: (log: AttendanceLog) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
}

type ViewMode = "monthly" | "cutoff";

export function AttendanceCalendarView({ 
  logs, 
  hosts, 
  clientBrands, 
  platforms, 
  shifts, 
  studios, 
  salarySettings,
  onSaveLog,
  onDeleteLog 
}: AttendanceCalendarViewProps) {
  const [selectedHostId, setSelectedHostId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [modalDate, setModalDate] = useState<string>("");
  
  // Form State
  const [formBrand, setFormBrand] = useState("");
  const [formPlatform, setFormPlatform] = useState("");
  const [formShift, setFormShift] = useState("");
  const [formStudio, setFormStudio] = useState("");
  const [formStatus, setFormStatus] = useState<"Present" | "Late" | "Absent" | "Excused">("Present");
  const [formOvertime, setFormOvertime] = useState(0);
  const [formIsBackup, setFormIsBackup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate Calendar Days based on Mode
  const calendarDays = useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];
    
    if (viewMode === "monthly") {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(currentYear, currentMonth, i);
        days.push({
          date: d,
          isCurrentMonth: true,
          dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        });
      }
    } else {
      // Cut Off Mode (e.g. 16 Prev Month - 15 Current Month)
      const startDay = salarySettings.cutOffStartDay ?? 16;
      const endDay = salarySettings.cutOffEndDay ?? 15;
      
      const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
      
      // Add days from previous month
      for (let i = startDay; i <= prevMonthDays; i++) {
        const d = new Date(currentYear, currentMonth - 1, i);
        days.push({
          date: d,
          isCurrentMonth: false,
          dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        });
      }
      // Add days from current month
      for (let i = 1; i <= endDay; i++) {
        const d = new Date(currentYear, currentMonth, i);
        days.push({
          date: d,
          isCurrentMonth: true,
          dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
        });
      }
    }
    return days;
  }, [currentMonth, currentYear, viewMode, salarySettings]);

  const firstDayOfGrid = calendarDays.length > 0 ? calendarDays[0].date.getDay() : 0;
  
  // Format Title
  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const gridTitle = viewMode === "monthly" 
    ? monthName 
    : `Cut-Off ${monthName}`;

  // Get selected host logs
  const selectedHostLogs = useMemo(() => {
    if (!selectedHostId) return [];
    return logs.filter((log) => log.hostId === selectedHostId || log.employeeId === selectedHostId);
  }, [logs, selectedHostId]);

  const getLogForDate = (dateStr: string) => {
    return selectedHostLogs.find(l => {
      const logDate = l.date || (typeof (l as any).timestamp === "string" ? (l as any).timestamp.split(" ")[0] : "");
      return logDate === dateStr;
    });
  };

  const handleOpenModal = (dateStr: string, existingLog?: AttendanceLog) => {
    setModalDate(dateStr);
    
    const defaultStudio = studios[0];
    const defaultStudioStr = typeof defaultStudio === 'object' && defaultStudio !== null ? (defaultStudio as any).name : defaultStudio;

    if (existingLog) {
      setEditingLogId(existingLog.id);
      setFormBrand(existingLog.brandHandled);
      setFormPlatform(existingLog.platform);
      setFormShift(existingLog.shiftHours);
      setFormStudio(existingLog.studio || (defaultStudioStr || ""));
      setFormStatus(existingLog.status);
      setFormOvertime(existingLog.overtimeHours || 0);
      setFormIsBackup(existingLog.isBackupShift || false);
    } else {
      setEditingLogId(null);
      setFormBrand(clientBrands[0]?.name || "");
      setFormPlatform(platforms[0] || "");
      setFormShift(shifts[0] || "");
      setFormStudio(defaultStudioStr || "");
      setFormStatus("Present");
      setFormOvertime(0);
      setFormIsBackup(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLogId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHostId) return;

    const host = hosts.find(h => h.id === selectedHostId);
    if (!host) return;

    setIsSubmitting(true);
    try {
      const randomOrders = formStatus === "Absent" ? 0 : Math.floor(Math.random() * 200) + 100;
      const randomRevenue = formStatus === "Absent" ? 0 : randomOrders * 60000;

      const logData: AttendanceLog = {
        id: editingLogId || `log_manual_cal_${Date.now()}`,
        hostId: host.id,
        hostName: host.name,
        employeeId: host.employeeId,
        date: modalDate,
        shiftHours: formShift,
        platform: formPlatform,
        brandHandled: formBrand,
        studio: formStudio,
        liveDuration: formStatus === "Absent" ? 0 : 4,
        sessionCount: formStatus === "Absent" ? 0 : 1,
        status: formStatus,
        revenueGenerated: editingLogId ? (getLogForDate(modalDate)?.revenueGenerated || randomRevenue) : randomRevenue,
        conversionRate: formStatus === "Absent" ? 0 : 3.8,
        engagementRate: formStatus === "Absent" ? 0 : 7.2,
        orders: editingLogId ? (getLogForDate(modalDate)?.orders || randomOrders) : randomOrders,
        overtimeHours: formOvertime,
        isBackupShift: formIsBackup,
      };

      await onSaveLog(logData);
      handleCloseModal();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingLogId) return;
    if (window.confirm("Apakah Anda yakin ingin menghapus data absensi ini?")) {
      setIsSubmitting(true);
      try {
        await onDeleteLog(editingLogId);
        handleCloseModal();
      } catch (error) {
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 overflow-hidden mt-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="w-full lg:w-[350px] flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchableHostSelect
              hosts={hosts}
              value={selectedHostId}
              onChange={setSelectedHostId}
              placeholder="Pilih Host..."
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-0 ${
                viewMode === "monthly"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setViewMode("cutoff")}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border-0 ${
                viewMode === "cutoff"
                  ? "bg-white text-purple-700 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Cut Off Penggajian
            </button>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200/60">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-slate-700 min-w-[150px] text-center text-sm">
              {gridTitle}
            </span>
            <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!selectedHostId ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 mb-4 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-2xl">📅</span>
          </div>
          <p className="font-medium text-sm">Silakan pilih nama host terlebih dahulu untuk melihat kalender absensi.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div key={d} className="py-3 text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDayOfGrid }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] border-r border-b border-slate-100 bg-slate-50/50"></div>
            ))}
            
            {calendarDays.map((dayObj) => {
              const log = getLogForDate(dayObj.dateStr);
              const isToday = new Date().toDateString() === dayObj.date.toDateString();
              
              let badgeColor = "bg-slate-100 text-slate-600 border-slate-200";
              let label = "Tidak Ada Data";

              if (log) {
                switch (log.status) {
                  case "Present":
                    badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    label = "Hadir";
                    break;
                  case "Late":
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                    label = "Terlambat";
                    break;
                  case "Absent":
                    badgeColor = "bg-red-50 text-red-700 border-red-200";
                    label = "Alpa";
                    break;
                  case "Excused":
                    badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-200";
                    label = "Izin/Sakit";
                    break;
                }
              }
              
              return (
                <div 
                  key={dayObj.dateStr} 
                  onClick={() => handleOpenModal(dayObj.dateStr, log)}
                  className={`min-h-[120px] p-2 border-r border-b border-slate-100 group cursor-pointer transition-colors relative
                    ${isToday ? 'bg-purple-50/40' : ''} 
                    ${!dayObj.isCurrentMonth && viewMode === "monthly" ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${isToday ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700'}`}>
                      {dayObj.date.getDate()}
                    </div>
                    {/* Month indicator for CutOff mode */}
                    {dayObj.date.getDate() === 1 && viewMode === "cutoff" && (
                      <span className="text-[9px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">
                        {dayObj.date.toLocaleString('id-ID', { month: 'short' })}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {log ? (
                      <div className={`text-[10px] font-bold px-2 py-1.5 rounded-md border text-center ${badgeColor}`}>
                        {label}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center py-1 mt-1 text-[10px] font-bold text-purple-600 bg-purple-50 rounded-md">
                        <Plus className="w-3 h-3 mr-1" /> Tambah
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Fill the rest of the grid cells for the last week */}
            {Array.from({ length: (7 - ((firstDayOfGrid + calendarDays.length) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[120px] border-r border-b border-slate-100 bg-slate-50/50"></div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fadeIn p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-scaleIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {editingLogId ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Calendar className="w-5 h-5 text-purple-500" />}
                {editingLogId ? "Edit Absensi" : "Tambah Absensi"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0 bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="mb-6 pb-4 border-b border-slate-100 flex gap-4 text-sm">
                <div className="flex-1">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Tanggal</p>
                  <p className="font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                    {new Date(modalDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Status Absensi</label>
                  <select 
                    value={formStatus} 
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    required
                  >
                    <option value="Present">Hadir</option>
                    <option value="Late">Terlambat</option>
                    <option value="Absent">Alpa</option>
                    <option value="Excused">Izin/Sakit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Brand</label>
                  <select 
                    value={formBrand} 
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    required
                  >
                    {clientBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Platform</label>
                  <select 
                    value={formPlatform} 
                    onChange={(e) => setFormPlatform(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    required
                  >
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Shift</label>
                  <select 
                    value={formShift} 
                    onChange={(e) => setFormShift(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    required
                  >
                    {shifts.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Studio</label>
                  <select 
                    value={formStudio} 
                    onChange={(e) => setFormStudio(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 cursor-pointer"
                    required
                  >
                    {studios.map(s => {
                      const val = typeof s === 'object' && s !== null ? (s as any).name : s;
                      return <option key={val} value={val}>{val}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">Lembur (Jam)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.5"
                    value={formOvertime}
                    onChange={(e) => setFormOvertime(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  />
                </div>
                <div className="flex flex-col justify-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={formIsBackup}
                        onChange={(e) => setFormIsBackup(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">Shift Backup</span>
                  </label>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                {editingLogId ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors border-0 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" /> Hapus
                  </button>
                ) : <div></div>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors border-0 cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-colors border-0 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

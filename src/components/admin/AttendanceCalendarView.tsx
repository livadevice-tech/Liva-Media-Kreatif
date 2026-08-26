import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
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

  const currentHostIndex = hosts.findIndex((h) => h.id === selectedHostId);

  const handlePrevHost = () => {
    if (currentHostIndex > 0) {
      setSelectedHostId(hosts[currentHostIndex - 1].id);
    }
  };

  const handleNextHost = () => {
    if (currentHostIndex < hosts.length - 1 && currentHostIndex !== -1) {
      setSelectedHostId(hosts[currentHostIndex + 1].id);
    } else if (currentHostIndex === -1 && hosts.length > 0) {
      setSelectedHostId(hosts[0].id);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [duplicateLogs, setDuplicateLogs] = useState<AttendanceLog[] | null>(null);
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

  const firstDayOfGrid = calendarDays.length > 0 ? (calendarDays[0].date.getDay() + 6) % 7 : 0;
  
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

  const getLogsForDate = (dateStr: string) => {
    return selectedHostLogs.filter(l => {
      const logDate = l.date || (typeof (l as any).timestamp === "string" ? (l as any).timestamp.split(" ")[0] : "");
      return logDate === dateStr;
    });
  };

  const selectLogToEdit = (log: AttendanceLog) => {
    const defaultStudio = studios[0];
    const defaultStudioStr = typeof defaultStudio === 'object' && defaultStudio !== null ? (defaultStudio as any).name : defaultStudio;

    setEditingLogId(log.id);
    setFormBrand(log.brandHandled);
    setFormPlatform(log.platform);
    setFormShift(log.shiftHours);
    setFormStudio(log.studio || (defaultStudioStr || ""));
    setFormStatus(log.status);
    setFormOvertime(log.overtimeHours || 0);
    setFormIsBackup(log.isBackupShift || false);
    setDuplicateLogs(null); // Once selected, hide duplicate list
  };

  const handleOpenModal = (dateStr: string, existingLogOrGroup?: AttendanceLog | AttendanceLog[]) => {
    setModalDate(dateStr);
    setDuplicateLogs(null);
    setEditingLogId(null);
    
    const defaultStudio = studios[0];
    const defaultStudioStr = typeof defaultStudio === 'object' && defaultStudio !== null ? (defaultStudio as any).name : defaultStudio;

    if (Array.isArray(existingLogOrGroup) && existingLogOrGroup.length > 1) {
      setDuplicateLogs(existingLogOrGroup);
    } else if (existingLogOrGroup) {
      const log = Array.isArray(existingLogOrGroup) ? existingLogOrGroup[0] : existingLogOrGroup;
      selectLogToEdit(log);
    } else {
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
    setDuplicateLogs(null);
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
        revenueGenerated: editingLogId ? (selectedHostLogs.find(l => l.id === editingLogId)?.revenueGenerated || randomRevenue) : randomRevenue,
        conversionRate: formStatus === "Absent" ? 0 : 3.8,
        engagementRate: formStatus === "Absent" ? 0 : 7.2,
        orders: editingLogId ? (selectedHostLogs.find(l => l.id === editingLogId)?.orders || randomOrders) : randomOrders,
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

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Look for the portal target defined in App.tsx
    setPortalTarget(document.getElementById("calendar-mobile-header-portal"));
  }, []);

  const hostSelectorUI = (
    <div className="w-full lg:w-[350px] flex items-center gap-1.5 sm:gap-2">
      <div className="flex-1">
        <SearchableHostSelect
          hosts={hosts}
          value={selectedHostId}
          onChange={setSelectedHostId}
          placeholder="Pilih Host..."
          triggerClassName="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 sm:px-3.5 sm:py-2.5 font-bold text-left text-slate-700 hover:bg-slate-100/50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer transition-all flex items-center justify-between min-h-[36px] sm:min-h-[42px] text-xs sm:text-sm"
        />
      </div>
      <div className="flex bg-slate-100/70 rounded-xl border border-slate-200/60 p-0.5 sm:p-1">
        <button
          onClick={handlePrevHost}
          disabled={currentHostIndex <= 0}
          className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
          title="Host Sebelumnya"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={handleNextHost}
          disabled={currentHostIndex === -1 || currentHostIndex >= hosts.length - 1}
          className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 transition-colors"
          title="Host Selanjutnya"
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white md:rounded-3xl border-0 md:border md:border-slate-200/50 md:shadow-sm p-2 sm:p-4 md:p-6 overflow-hidden mt-0 md:mt-6">
      
      {/* Mobile Host Selector Portal */}
      {portalTarget && createPortal(
        <div className="px-3 py-2 border-b border-slate-100 bg-white">
          {hostSelectorUI}
        </div>,
        portalTarget
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 mb-4 md:mb-8">
        {/* Desktop Host Selector (or fallback if portal missing) */}
        <div className={portalTarget ? "hidden sm:block" : ""}>
          {hostSelectorUI}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto">
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode("monthly")}
              className={`flex-1 sm:flex-none px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border-0 ${
                viewMode === "monthly"
                  ? "bg-white text-purple-700 shadow-sm ring-1 ring-black/5"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setViewMode("cutoff")}
              className={`flex-1 sm:flex-none px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border-0 ${
                viewMode === "cutoff"
                  ? "bg-white text-purple-700 shadow-sm ring-1 ring-black/5"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Cut Off Penggajian
            </button>
          </div>

          <div className="flex items-center justify-between min-w-[200px] sm:min-w-[220px] bg-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 shadow-sm mx-auto sm:mx-0">
            <button onClick={handlePrevMonth} className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-700">
              {gridTitle}
            </h2>
            <button onClick={handleNextMonth} className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer border-0 bg-transparent">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {!selectedHostId ? (
        <div className="py-10 md:py-20 px-4 text-center flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-xl md:text-2xl">📅</span>
          </div>
          <p className="font-medium text-xs md:text-sm">Silakan pilih nama host terlebih dahulu untuk melihat kalender absensi.</p>
        </div>
      ) : (
        <div className="bg-white md:rounded-2xl md:border border-slate-200/70 overflow-hidden md:shadow-sm mt-2 md:mt-0">
          <div className="grid grid-cols-7 bg-white md:bg-slate-50/80 md:border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
              <div key={d} className="py-2 md:py-4 text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-4 md:gap-y-0 px-2 md:px-0 py-4 md:py-0">
            {Array.from({ length: firstDayOfGrid }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[40px] md:min-h-[130px] md:border-r md:border-b border-slate-100 md:bg-slate-50/30"></div>
            ))}
            
            {calendarDays.map((dayObj) => {
              const dayLogs = getLogsForDate(dayObj.dateStr);
              const isToday = new Date().toDateString() === dayObj.date.toDateString();
              
              // Group logs by brand and shift
              const groupedLogs = dayLogs.reduce((acc, log) => {
                const normalizedShift = (log.shiftHours || "").replace(/\s+/g, "").toLowerCase();
                const key = `${log.brandHandled}_${normalizedShift}_${log.status}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(log);
                return acc;
              }, {} as Record<string, typeof logs>);
              const logGroups = Object.values(groupedLogs);
              
              const hasLogs = dayLogs.length > 0;
              let mobileCircleBg = "bg-transparent border-2 border-dashed border-slate-200";
              let firstLogBrandLogo = null;
              let firstLogBrandName = "";

              if (hasLogs) {
                const firstLog = dayLogs[0];
                firstLogBrandName = firstLog.brandHandled || "";
                const brand = clientBrands.find(b => b.name === firstLogBrandName);
                if (brand && brand.logoUrl) {
                   firstLogBrandLogo = brand.logoUrl;
                }

                const hasAbsent = dayLogs.some(l => l.status === "Absent");
                const hasLate = dayLogs.some(l => l.status === "Late");
                const hasExcused = dayLogs.some(l => l.status === "Excused");
                if (hasAbsent) {
                   mobileCircleBg = "bg-[#747d7c]"; 
                } else if (hasLate) {
                   mobileCircleBg = "bg-[#fbe083]"; 
                } else if (hasExcused) {
                   mobileCircleBg = "bg-[#b2db9d]";
                } else {
                   mobileCircleBg = "bg-[#5bb073]"; 
                }
              }

              return (
                <div 
                  key={dayObj.dateStr} 
                  onClick={() => handleOpenModal(dayObj.dateStr)}
                  className={`flex flex-col items-center md:items-stretch md:min-h-[130px] md:p-2.5 md:border-r md:border-b border-slate-100 group cursor-pointer transition-all relative
                    ${isToday ? 'md:bg-purple-50/20' : ''} 
                    ${!dayObj.isCurrentMonth && viewMode === "monthly" ? 'opacity-40 md:bg-slate-50' : 'md:hover:bg-slate-50'}
                  `}
                >
                  {/* MOBILE VIEW */}
                  <div 
                    onClick={(e) => { 
                      if (dayLogs.length > 0) {
                        e.stopPropagation(); 
                        handleOpenModal(dayObj.dateStr, dayLogs);
                      }
                    }}
                    className="md:hidden flex flex-col items-center justify-start w-full relative min-h-[70px] pt-1"
                  >
                    <div className={`w-11 h-11 flex flex-shrink-0 items-center justify-center rounded-full transition-all ${mobileCircleBg} relative`}>
                      {hasLogs && firstLogBrandLogo ? (
                        <img src={firstLogBrandLogo} alt={firstLogBrandName} className="w-full h-full object-cover rounded-full" />
                      ) : hasLogs ? (
                        <span className="font-black text-xl text-slate-700/90 leading-none">{firstLogBrandName.charAt(0).toUpperCase()}</span>
                      ) : null}
                      
                      {/* Double Absent Badge */}
                      {dayLogs.length > 1 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                           +{dayLogs.length - 1}
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isToday ? "bg-[#5bb073] text-white" : "text-slate-400"}`}>
                        {dayObj.date.getDate()}
                      </span>
                    </div>
                  </div>

                  {/* DESKTOP VIEW */}
                  <div className="hidden md:flex flex-col h-full w-full">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all ${isToday ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-100' : 'text-slate-600 group-hover:text-slate-900 group-hover:bg-slate-100'}`}>
                        {dayObj.date.getDate()}
                      </div>
                      {/* Month indicator for CutOff mode */}
                      {dayObj.date.getDate() === 1 && viewMode === "cutoff" && (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                          {dayObj.date.toLocaleString('id-ID', { month: 'short' })}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {logGroups.length > 0 ? (
                        logGroups.map((group: any, idx: number) => {
                          const log = group[0];
                          const duplicateCount = group.length;

                          let badgeBg = "bg-slate-50";
                          let badgeBorder = "border-slate-200";
                          let badgeText = "text-slate-500";
                          let badgeDot = "bg-slate-400";
                          let label = "Tidak Ada Data";

                          if (log.status === "Present") {
                            badgeBg = "bg-[#faf8ff]";
                            badgeBorder = "border-[#e4ddf6]";
                            badgeText = "text-[#5600e0]";
                            badgeDot = "bg-[#5600e0]";
                            label = "Hadir";
                          } else if (log.status === "Absent") {
                            badgeBg = "bg-rose-50/80";
                            badgeBorder = "border-rose-200";
                            badgeText = "text-rose-600";
                            badgeDot = "bg-rose-500";
                            label = "Alpa";
                          } else if (log.status === "Late") {
                            badgeBg = "bg-amber-50/80";
                            badgeBorder = "border-amber-200";
                            badgeText = "text-amber-600";
                            badgeDot = "bg-amber-500";
                            label = "Terlambat";
                          } else if (log.status === "Excused") {
                            badgeBg = "bg-blue-50/80";
                            badgeBorder = "border-blue-200";
                            badgeText = "text-blue-600";
                            badgeDot = "bg-blue-500";
                            label = "Izin/Sakit";
                          }

                          if (duplicateCount > 1) {
                            badgeBg = "bg-yellow-50/80";
                            badgeBorder = "border-yellow-300";
                            badgeText = "text-yellow-800";
                            badgeDot = "bg-yellow-500";
                          }

                          return (
                            <div key={idx} onClick={(e) => { e.stopPropagation(); handleOpenModal(dayObj.dateStr, group as any); }} className="flex flex-col gap-1.5 mb-1.5 last:mb-0">
                              <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${badgeBg} ${badgeBorder} transition-transform hover:scale-[1.02]`}>
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${badgeDot}`}></div>
                                  <span className={`text-[10px] font-bold flex items-center gap-1 ${badgeText}`}>
                                    {label}
                                    {duplicateCount > 1 && (
                                      <span className="bg-white/60 px-1 py-0.5 rounded text-[9px] ml-1 border border-current shadow-sm">
                                        +{duplicateCount}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {log.isBackupShift && (
                                  <span className="text-[8px] font-black uppercase tracking-wider text-fuchsia-600 bg-fuchsia-100/80 px-1.5 py-0.5 rounded-sm">
                                    Backup
                                  </span>
                                )}
                              </div>
                              {log.brandHandled && (
                                <div className={`px-2 py-1 rounded text-[9px] font-semibold truncate w-full shadow-sm border ${
                                  log.isBackupShift 
                                    ? 'bg-fuchsia-50/50 text-fuchsia-700 border-fuchsia-100' 
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}>
                                  {log.brandHandled}
                                </div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center py-1.5 mt-1 text-[10px] font-bold text-purple-600 bg-purple-50/80 rounded-lg border border-purple-100 border-dashed">
                          <Plus className="w-3 h-3 mr-1" /> Tambah Data
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Fill the rest of the grid cells for the last week */}
            {Array.from({ length: (7 - ((firstDayOfGrid + calendarDays.length) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[40px] md:min-h-[120px] md:border-r md:border-b border-slate-100 md:bg-slate-50/50"></div>
            ))}
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-200 rounded-full sm:hidden"></div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mt-2 sm:mt-0">
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
            
            {duplicateLogs ? (
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Pilih Data Absensi ({duplicateLogs.length} Data)</p>
                  <p className="font-bold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                    {new Date(modalDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  {duplicateLogs.map((log, i) => (
                    <div key={log.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer" onClick={() => selectLogToEdit(log)}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{log.brandHandled}</span>
                          <span className="text-xs font-medium text-slate-500">{log.platform}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">{log.shiftHours}</span>
                          {log.overtimeHours ? <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">+{log.overtimeHours}j Lembur</span> : null}
                          {log.isBackupShift && <span className="text-[10px] font-bold text-fuchsia-600 bg-fuchsia-50 px-1.5 py-0.5 rounded border border-fuchsia-100">Backup</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Apakah Anda yakin ingin menghapus absensi ini?")) {
                              onDeleteLog(log.id).then(() => {
                                const newLogs = duplicateLogs.filter(l => l.id !== log.id);
                                if (newLogs.length <= 1) {
                                  handleCloseModal();
                                } else {
                                  setDuplicateLogs(newLogs);
                                }
                              });
                            }
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-lg transition-colors border-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectLogToEdit(log);
                          }}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition-colors border-0 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
                    {clientBrands.filter(b => b.isActive !== false).map(b => (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState, useEffect } from 'react';
import { ShiftSchedule, StudioItem, ClientBrand } from '../../types';
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle, CheckSquare, Square, Trash2, Edit3, Check, Bookmark, Radio, FileSpreadsheet, Building2 } from 'lucide-react';
import { getBrandColor, compareShiftsByTime } from '../../shared/utils/appUi';

interface AdminWeeklyScheduleGridProps {
  computedSchedules: ShiftSchedule[];
  studios: StudioItem[];
  weekStartDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onCellClick: (dateStr: string, studio: string, shift: string) => void;
  onScheduleClick?: (sched: ShiftSchedule) => void;
  onDeleteSchedule?: (sched: ShiftSchedule) => void;
  onMassCellSelect?: (slots: {date: string, studio: string, shift: string}[]) => void;
  masterShifts?: string[];
  clientBrands?: ClientBrand[];
  onOpenTemplateModal?: () => void;
  onOpenExportModal?: () => void;
  onAddStudio?: (newStudio: { name: string; location: string }) => void;
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function getStudioInitials(name: string) {
    return name.split(/\s+/).map(word => {
        if (word.match(/\d/)) return word; // keep numbers like A1, B1, 1, 2
        if (word.toUpperCase() === word && word.length > 1) return word; // keep PSW, TP
        return word.charAt(0).toUpperCase();
    }).join('');
}

export function AdminWeeklyScheduleGrid({
  computedSchedules,
  studios,
  weekStartDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onCellClick,
  onScheduleClick,
  onDeleteSchedule,
  onMassCellSelect,
  masterShifts = [],
  clientBrands = [],
  onOpenTemplateModal,
  onOpenExportModal,
  onAddStudio
}: AdminWeeklyScheduleGridProps) {


  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set());
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  
  // State for manual shifts
  const [addedShifts, setAddedShifts] = useState<Record<string, Set<string>>>({});
  const [studioToAdjust, setStudioToAdjust] = useState<{name: string, align: 'top' | 'bottom'} | null>(null);

  // State for adding new studio directly from grid
  const [isAddStudioOpen, setIsAddStudioOpen] = useState(false);
  const [newStudioNameInput, setNewStudioNameInput] = useState('');
  const [newStudioLocInput, setNewStudioLocInput] = useState('Bandar Lampung');
  const [newStudioError, setNewStudioError] = useState('');

  useEffect(() => {
    fetch('/api/studio-shifts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAddedShifts(prev => {
            const newState = { ...prev };
            data.forEach(item => {
              if (!newState[item.studio]) {
                newState[item.studio] = new Set();
              }
              newState[item.studio].add(item.shift);
            });
            return newState;
          });
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (dragSelection.size > 1) {
          // If dragged across multiple cells, add to selectedSlots
          setSelectedSlots(prev => {
            const next = new Set(prev);
            dragSelection.forEach(item => next.add(item));
            return next;
          });
        }
        setDragSelection(new Set());
      }
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragSelection]);

  const handleCellMouseDown = (e: React.MouseEvent, date: string, studio: string, shift: string) => {
    // Only drag with left mouse button without ctrl/meta key
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !isMultiSelectMode) {
      setIsDragging(true);
      setDragSelection(new Set([`${date}|${studio}|${shift}`]));
    }
  };

  const handleCellMouseEnter = (date: string, studio: string, shift: string) => {
    if (isDragging) {
      setDragSelection(prev => {
        const next = new Set(prev);
        next.add(`${date}|${studio}|${shift}`);
        return next;
      });
    }
  };

  const toggleSlotSelection = (key: string) => {
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedSlots(new Set());
    setDragSelection(new Set());
  };

  // Generate 7 days for the current week
    const weekDays = useMemo(() => {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dateStr = String(d.getDate()).padStart(2, '0');
        days.push({
          name: DAYS_OF_WEEK[i],
          date: `${y}-${m}-${dateStr}`,
          displayDate: `${dateStr}/${m}`
        });
      }
      return days;
    }, [weekStartDate]);

    // Group studios dynamically from master data, ONLY including shifts that have schedules THIS WEEK
  const studioGroups = useMemo(() => {
    const groupsMap = new Map<string, { name: string; shifts: string[] }[]>();
    
    // Valid dates for this week
    const validDates = new Set(weekDays.map(d => d.date));

    // Filter schedules to only this week
    const thisWeekSchedules = computedSchedules.filter(s => {
        const d = (s.date || "").split('T')[0];
        return validDates.has(d);
    });

    studios.forEach(st => {
      // Exclude standby/all-studio placeholder from regular studio list
      if (st.name === "All Studio" || st.name === "All Studio (Standby)") return;

      const loc = st.location || "Lainnya";
      
      const studioSchedules = thisWeekSchedules.filter(s => s.studio === st.name);
      let uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean) as string[];
      
      // Merge with manually added shifts
      const manualShifts = addedShifts[st.name];
      if (manualShifts) {
        uniqueShifts = Array.from(new Set([...uniqueShifts, ...Array.from(manualShifts)])) as string[];
      }

      // If studio has no schedules and no manual shifts yet, display default shift (or first master shift)
      // so the studio is visible and ready for scheduling
      if (uniqueShifts.length === 0) {
        if (masterShifts && masterShifts.length > 0) {
          uniqueShifts = [masterShifts[0]];
        } else {
          uniqueShifts = ["Shift 1 (08.00-12.00)"];
        }
      }

      uniqueShifts.sort(compareShiftsByTime);
      
      if (!groupsMap.has(loc)) {
        groupsMap.set(loc, []);
      }
      groupsMap.get(loc)!.push({
        name: st.name,
        shifts: uniqueShifts
      });
    });

    // Natural sort helper: handles names like "Studio A1", "Studio A2", "Studio B10"
    const naturalSort = (a: string, b: string) =>
      a.localeCompare('id', undefined, { numeric: true, sensitivity: 'base' });

    const sorted = Array.from(groupsMap.entries())
      .sort(([locA], [locB]) => naturalSort(locA, locB))
      .map(([location, studiosData]) => ({
        location,
        studios: [...studiosData].sort((a, b) => naturalSort(a.name, b.name))
      }));

    return sorted;
  }, [studios, computedSchedules, weekDays, addedShifts, masterShifts]);

  // State for hidden standby shifts (e.g. user removed Standby 1 or Standby 2)
  const [hiddenStandbyShifts, setHiddenStandbyShifts] = useState<Set<string>>(() => new Set());

  // Shifts specifically for Host Standby (All Studio)
  const standbyShifts = useMemo(() => {
    const validDates = new Set(weekDays.map(d => d.date));
    const thisWeekSchedules = computedSchedules.filter(s => {
      const d = (s.date || "").split('T')[0];
      return validDates.has(d) && (s.studio === "All Studio" || s.studio === "All Studio (Standby)" || s.brand === "Host Standby");
    });

    let shiftsList = Array.from(new Set(thisWeekSchedules.map(s => s.timeSlot))).filter(Boolean) as string[];
    const manualStandby = addedShifts["All Studio"] || addedShifts["All Studio (Standby)"];
    if (manualStandby) {
      shiftsList = Array.from(new Set([...shiftsList, ...Array.from(manualStandby)])) as string[];
    }

    // Default standby shifts if user hasn't hidden them
    const defaults = ["Standby 1", "Standby 2"].filter(s => !hiddenStandbyShifts.has(s));
    defaults.forEach(def => {
      if (!shiftsList.includes(def)) {
        shiftsList.push(def);
      }
    });

    // Filter out any shift that user explicitly hid, unless it has active schedules this week
    shiftsList = shiftsList.filter(s => {
      const hasSchedule = thisWeekSchedules.some(sched => sched.timeSlot === s);
      return hasSchedule || !hiddenStandbyShifts.has(s);
    });

    // If completely empty, at least show Standby 1
    if (shiftsList.length === 0) {
      shiftsList = ["Standby 1"];
    }

    shiftsList.sort(compareShiftsByTime);
    return shiftsList;
  }, [computedSchedules, weekDays, addedShifts, hiddenStandbyShifts]);

  // Studio badge color helper for pastel letter 'S'
  const getStudioBadgeStyle = (name: string) => {
    const s = name.toUpperCase();
    if (s.includes("A3") || s.includes("3")) return { bg: "bg-blue-50 text-blue-600 border border-blue-200/60" };
    if (s.includes("A1") || s.includes("1")) return { bg: "bg-emerald-50 text-emerald-600 border border-emerald-200/60" };
    if (s.includes("A2") || s.includes("2")) return { bg: "bg-purple-50 text-purple-600 border border-purple-200/60" };
    if (s.includes("B1")) return { bg: "bg-cyan-50 text-cyan-600 border border-cyan-200/60" };
    if (s.includes("B2")) return { bg: "bg-amber-50 text-amber-600 border border-amber-200/60" };
    return { bg: "bg-indigo-50 text-indigo-600 border border-indigo-200/60" };
  };

  // Helper to split shift into title and time
  const parseShiftDisplay = (shiftStr: string) => {
    // Example: "Reg 2 (11.00-17.00)" or "Reg 2 11:00-17:00" or "Safi (01.00-07.00)"
    const match = shiftStr.match(/^([^(]+?)\s*(\(.*?\))$/);
    if (match) {
      return { title: match[1].trim(), hours: match[2].trim() };
    }
    // Match pattern with hours like 11.00-17.00 or 11:00-17:00
    const matchHours = shiftStr.match(/^(.*?)\s*([0-2]?\d[.:][0-5]\d\s*-\s*[0-2]?\d[.:][0-5]\d.*)$/);
    if (matchHours) {
      return { title: matchHours[1].trim(), hours: `(${matchHours[2].trim()})` };
    }
    return { title: shiftStr, hours: "" };
  };

  // Create a fast lookup map: key = `${date}|${studio}|${shift}`
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ShiftSchedule[]>();
    computedSchedules.forEach(s => {
      const d = (s.date || "").split('T')[0];
      const timeSlot = s.timeSlot;
      const studio = s.studio || "-";
      const key = `${d}|${studio}|${timeSlot}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(s);
    });
    return map;
  }, [computedSchedules]);

  const formatWeekRange = () => {
    if (weekDays.length === 0) return "";
    const first = new Date(weekDays[0].date);
    const last = new Date(weekDays[6].date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${first.toLocaleDateString('id-ID', options)} - ${last.toLocaleDateString('id-ID', { ...options, year: 'numeric' })}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200/90 overflow-hidden mt-1">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3.5 py-2.5 border-b border-slate-200/80 bg-white gap-3">
        <div className="flex items-center gap-3">
          <div className="text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            Jadwal Mingguan
          </h3>
          <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
            {formatWeekRange()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onAddStudio && (
            <button
              type="button"
              onClick={() => {
                setNewStudioNameInput('');
                setNewStudioLocInput('Bandar Lampung');
                setNewStudioError('');
                setIsAddStudioOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100/70"
              title="Tambah Studio Baru"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Tambah Studio</span>
            </button>
          )}
          {onOpenExportModal && (
            <button
              type="button"
              onClick={onOpenExportModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70"
              title="Export Jadwal ke Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          )}
          {onOpenTemplateModal && (
            <button
              type="button"
              onClick={onOpenTemplateModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer border bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/70"
              title="Kelola & Terapkan Template Jadwal"
            >
              <Bookmark className="w-3.5 h-3.5 text-blue-600" />
              <span>Template Jadwal</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsMultiSelectMode(prev => {
                if (prev) clearSelection();
                return !prev;
              });
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer border ${
              isMultiSelectMode || selectedSlots.size > 0
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Klik untuk memilih banyak shift sekaligus"
          >
            {isMultiSelectMode || selectedSlots.size > 0 ? (
              <CheckSquare className="w-3.5 h-3.5" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            <span>{isMultiSelectMode ? 'Mode Pilih Aktif' : 'Pilih Massal'}</span>
            {selectedSlots.size > 0 && (
              <span className="ml-0.5 bg-white text-indigo-600 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                {selectedSlots.size}
              </span>
            )}
          </button>
          <button
            onClick={onCurrentWeek}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Minggu Ini
          </button>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <button
              onClick={onPrevWeek}
              className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-600 transition-colors border-r border-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNextWeek}
              className="px-2 py-1.5 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-2 px-1 text-center text-xs font-bold text-slate-600 border-r border-slate-200 w-[54px]">
                Studio
              </th>
              <th className="py-2 px-1 text-center text-xs font-bold text-slate-600 border-r border-slate-200 w-[86px]">
                Shift
              </th>
              {weekDays.map(day => {
                const daySchedules = computedSchedules.filter(s => (s.date || "").split('T')[0] === day.date);
                const hostCounts = new Map<string, number>();
                let hasDoubleHost = false;
                let doubleHostNames: string[] = [];
                
                daySchedules.forEach(s => {
                  const host = s.hostName?.trim();
                  if (host && host.toLowerCase() !== "tba") {
                    const count = (hostCounts.get(host) || 0) + 1;
                    hostCounts.set(host, count);
                    if (count === 2) {
                       hasDoubleHost = true;
                       doubleHostNames.push(host);
                    }
                  }
                });

                return (
                  <th key={day.date} className="py-2 px-1 text-center text-slate-700 border-r border-slate-200 w-[calc((100%-140px)/7)]">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-slate-700">{day.name}</span>
                      {hasDoubleHost && (
                        <div title={`Peringatan: Host double (${doubleHostNames.join(', ')})`} className="text-rose-500 bg-rose-100 rounded-full w-[13px] h-[13px] flex items-center justify-center cursor-help">
                          <AlertTriangle className="w-[8px] h-[8px] stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">{day.displayDate}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Host Standby (All Studio) Row at the Very Top */}
            {standbyShifts.map((shift, shiftIdx) => {
              const isFirstRowInStandby = shiftIdx === 0;
              const isLastRowInStandby = shiftIdx === standbyShifts.length - 1;
              const borderClass = isLastRowInStandby ? "border-b-[3px] border-b-indigo-300" : "border-b border-indigo-100/60";
              const { title: shiftTitle, hours: shiftHours } = parseShiftDisplay(shift);

              return (
                <tr key={`standby-all-studio-${shift}`} className="bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors">
                  {/* Studio Cell (Rowspan for All Studio Standby) */}
                  {isFirstRowInStandby && (
                    <td
                      rowSpan={standbyShifts.length}
                      className="border-r border-indigo-200/80 p-1 text-center align-middle bg-indigo-50/30 group/studio relative border-b-[3px] border-b-indigo-300 shadow-[inset_-1px_0_0_rgba(99,102,241,0.1)]"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const align = rect.top > (window.innerHeight / 2) ? 'bottom' : 'top';
                          setStudioToAdjust({ name: "All Studio", align });
                        }}
                        className="w-full h-full min-h-[50px] flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition-all hover:bg-indigo-100/50"
                        title="Klik untuk menambahkan shift standby"
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs mb-1 bg-amber-50 text-amber-600 border border-amber-300/80">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </div>
                        <span className="font-extrabold text-indigo-900 text-xs tracking-tight">
                          All Studio
                        </span>
                        <span className="text-[9.5px] font-semibold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded mt-0.5 border border-amber-200">
                          Standby
                        </span>
                        <span className="opacity-0 group-hover/studio:opacity-100 text-[9px] mt-1 text-indigo-600 font-medium transition-opacity flex items-center">
                          <Plus className="w-2.5 h-2.5 mr-0.5" /> Shift
                        </span>
                      </button>

                      {/* INLINE POPOVER FOR ADDING SHIFT TO ALL STUDIO */}
                      {studioToAdjust?.name === "All Studio" && (
                        <>
                          <div 
                            className="fixed inset-0 z-[110]" 
                            onClick={(e) => { e.stopPropagation(); setStudioToAdjust(null); }} 
                          />
                          <div 
                            className={`absolute ${studioToAdjust.align === 'bottom' ? 'bottom-0' : 'top-0'} left-full ml-1 z-[120] bg-white rounded-xl w-[300px] overflow-hidden shadow-2xl flex flex-col border border-indigo-200 animate-fadeIn text-left`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="bg-indigo-600 p-2.5 flex items-center justify-between">
                              <h3 className="text-white font-bold flex items-center gap-2 text-xs">
                                <span>⚙️</span>
                                Tambah Shift - All Studio (Standby)
                              </h3>
                              <button
                                type="button"
                                onClick={() => setStudioToAdjust(null)}
                                className="text-white hover:bg-white/20 p-1 rounded-md transition-colors cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="p-2 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                              <div className="space-y-1">
                                {[...masterShifts].sort(compareShiftsByTime).map(mShift => {
                                  const isAlreadyVisible = standbyShifts.includes(mShift);
                                  if (isAlreadyVisible) return null;
                                  
                                  return (
                                    <button
                                      key={mShift}
                                      onClick={() => {
                                        fetch('/api/studio-shifts', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ studio: "All Studio", shift: mShift })
                                        }).catch(console.error);

                                        setAddedShifts(prev => {
                                           const newSet = new Set(prev["All Studio"] || []);
                                           newSet.add(mShift);
                                           return { ...prev, ["All Studio"]: newSet };
                                        });

                                        setHiddenStandbyShifts(prev => {
                                           const next = new Set(prev);
                                           next.delete(mShift);
                                           return next;
                                        });
                                        setStudioToAdjust(null);
                                      }}
                                      className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium text-[11px] text-slate-700 flex items-center justify-between"
                                    >
                                      <span className="truncate pr-2">{mShift}</span>
                                      <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
                                    </button>
                                  );
                                })}
                                {masterShifts.every(mShift => standbyShifts.includes(mShift)) && (
                                  <div className="text-center text-[10px] text-slate-500 p-2">Semua shift master sudah ditampilkan.</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </td>
                  )}

                  {/* Shift Cell */}
                  <td className={`${borderClass} border-r border-indigo-200/60 py-2 px-1.5 text-center bg-indigo-50/10 whitespace-nowrap group/shiftcell relative`}>
                    <div className="flex flex-col items-center justify-center">
                      <span className="font-bold text-xs text-indigo-900 leading-tight">
                        {shiftTitle}
                      </span>
                      {shiftHours && (
                        <span className="text-[10px] text-indigo-500/80 font-normal leading-tight mt-0.5">
                          {shiftHours}
                        </span>
                      )}
                    </div>
                    {standbyShifts.length > 1 && (
                      <button
                        type="button"
                        title="Hapus baris shift ini"
                        onClick={() => {
                          const hasSchedules = weekDays.some(day => {
                            const cellSchedules = (scheduleMap.get(`${day.date}|All Studio|${shift}`) || [])
                              .concat(scheduleMap.get(`${day.date}|All Studio (Standby)|${shift}`) || []);
                            return cellSchedules && cellSchedules.length > 0;
                          });
                          
                          if (hasSchedules) {
                            alert('Tidak bisa menyembunyikan shift yang masih memiliki jadwal standby di minggu ini. Silakan hapus jadwalnya terlebih dahulu.');
                            return;
                          }
                          
                          fetch('/api/studio-shifts/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studio: "All Studio", shift })
                          }).catch(console.error);

                          setAddedShifts(prev => {
                            const newSet = new Set(prev["All Studio"] || []);
                            newSet.delete(shift);
                            return { ...prev, ["All Studio"]: newSet };
                          });

                          setHiddenStandbyShifts(prev => {
                            const next = new Set(prev);
                            next.add(shift);
                            return next;
                          });
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/shiftcell:opacity-100 hover:bg-rose-100 text-rose-500 rounded p-1 transition-all cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </td>

                  {/* Days Cells for All Studio Standby */}
                  {weekDays.map(day => {
                    const primarySchedules = scheduleMap.get(`${day.date}|All Studio|${shift}`) || [];
                    const secondarySchedules = scheduleMap.get(`${day.date}|All Studio (Standby)|${shift}`) || [];
                    const cellSchedules = [...primarySchedules, ...secondarySchedules];
                    const hasData = cellSchedules.length > 0;
                    const cellKey = `${day.date}|All Studio|${shift}`;
                    const isSelected = selectedSlots.has(cellKey);
                    const isDragSelected = dragSelection.has(cellKey);

                    return (
                      <td
                        key={cellKey}
                        onMouseDown={(e) => handleCellMouseDown(e, day.date, "All Studio", shift)}
                        onMouseEnter={() => handleCellMouseEnter(day.date, "All Studio", shift)}
                        onClick={(e) => {
                          if (e.ctrlKey || e.metaKey || e.shiftKey || isMultiSelectMode || selectedSlots.size > 0) {
                            toggleSlotSelection(cellKey);
                          } else {
                            if (!dragSelection || dragSelection.size <= 1) {
                              onCellClick(day.date, "All Studio", shift);
                            }
                          }
                        }}
                        className={`${borderClass} border-r border-indigo-200/60 p-1 cursor-pointer transition-all align-middle relative group min-h-[48px] select-none ${
                          isSelected || isDragSelected
                            ? 'bg-indigo-100/80 ring-2 ring-inset ring-indigo-500 shadow-inner'
                            : 'hover:bg-amber-50/50'
                        }`}
                      >
                        {!isSelected && !isDragSelected && !isMultiSelectMode && selectedSlots.size === 0 && (
                          <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-amber-100/30 z-0 pointer-events-none">
                            <Plus className="w-4 h-4 text-amber-500" />
                          </div>
                        )}

                        {(isSelected || isDragSelected) && (
                          <div className="absolute top-1 right-1 z-30 pointer-events-none">
                            <div className="bg-indigo-600 text-white rounded-md p-0.5 shadow-sm flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        )}

                        <div className="relative z-10 flex flex-col gap-1 w-full h-full min-h-[42px] justify-center">
                          {cellSchedules.map((sched, idx) => {
                            const isStandbyBrand = sched.brand?.toLowerCase().includes("standby");
                            const cardBg = isStandbyBrand ? "bg-amber-50" : "bg-purple-50";
                            const cardBorder = isStandbyBrand ? "border-amber-300 border-[1.5px]" : "border-purple-300 border-[1.5px]";
                            const cardText = isStandbyBrand ? "text-amber-900" : "text-purple-900";
                            const platformClean = sched.platform ? sched.platform.replace(/ live/i, '').trim() : '';

                            return (
                              <div
                                key={idx}
                                onDragStart={(e) => e.preventDefault()}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (e.ctrlKey || e.metaKey || e.shiftKey || isMultiSelectMode || selectedSlots.size > 0) {
                                    toggleSlotSelection(cellKey);
                                    return;
                                  }
                                  if (onScheduleClick) {
                                    onScheduleClick({
                                      ...sched,
                                      date: day.date,
                                      studio: "All Studio",
                                      timeSlot: shift
                                    });
                                  }
                                }}
                                className={`group relative ${cardBg} border ${cardBorder} ${cardText} px-1.5 py-1 rounded-md flex flex-col justify-center transition-all hover:shadow-2xs cursor-pointer ${
                                  isSelected ? 'ring-1 ring-indigo-400 font-semibold' : ''
                                }`}
                                title={`Host Standby: ${sched.hostName}${sched.brand ? ` (${sched.brand})` : ''}`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-extrabold text-[9.5px] uppercase tracking-wider text-amber-700 bg-amber-100/80 px-1 py-0.2 rounded">
                                    STANDBY
                                  </span>
                                  {sched.brand && sched.brand !== "Host Standby" && (
                                    <span className="font-semibold text-[9px] text-slate-500 truncate">
                                      {sched.brand}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-bold text-slate-900 truncate leading-tight mt-0.5 pr-2.5">
                                  {sched.hostName}
                                </div>
                                {platformClean && (
                                  <div className="text-[8.5px] text-slate-500 truncate">
                                    {platformClean}
                                  </div>
                                )}
                                {onDeleteSchedule && !isMultiSelectMode && selectedSlots.size === 0 && (
                                  <button
                                    type="button"
                                    title="Hapus Jadwal Ini"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteSchedule({
                                        ...sched,
                                        date: day.date,
                                        studio: "All Studio",
                                        timeSlot: shift
                                      });
                                    }}
                                    className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/80 rounded p-0.5 transition-all text-slate-400 hover:text-rose-600"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}

                          {!hasData && (
                            <div className="w-full text-center text-slate-300 font-medium select-none text-xs">-</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {studioGroups.map((group) => {
              return group.studios.map((studio) => {
                const studioBadge = getStudioBadgeStyle(studio.name);
                const studioInitials = getStudioInitials(studio.name);

                return studio.shifts.map((shift, shiftIdx) => {
                  const isFirstRowInStudio = shiftIdx === 0;
                  const isLastRowInStudio = shiftIdx === studio.shifts.length - 1;
                  // Distinct studio border separator: thicker and distinctive slate-300 divider
                  const borderClass = isLastRowInStudio ? "border-b-[3px] border-b-slate-300" : "border-b border-slate-100";
                  const { title: shiftTitle, hours: shiftHours } = parseShiftDisplay(shift);

                  return (
                    <tr key={`${group.location}-${studio.name}-${shift}`} className="hover:bg-slate-50/40 transition-colors">

                      {/* Studio Cell (Rowspan) */}
                      {isFirstRowInStudio && (
                        <td 
                          rowSpan={studio.shifts.length} 
                          className="border-r border-slate-200 p-1 text-center align-middle bg-white group/studio relative border-b-[3px] border-b-slate-300 shadow-[inset_-1px_0_0_rgba(0,0,0,0.04)]"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                               const rect = e.currentTarget.getBoundingClientRect();
                               const align = rect.top > (window.innerHeight / 2) ? 'bottom' : 'top';
                               setStudioToAdjust({ name: studio.name, align });
                            }}
                            className="w-full h-full min-h-[50px] flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition-all hover:bg-slate-50"
                            title="Klik untuk menambahkan shift"
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs mb-1.5 ${studioBadge.bg}`}>
                              S
                            </div>
                            <span 
                               className="font-bold text-slate-700 text-xs tracking-tight" 
                               title={studio.name}
                            >
                               {studioInitials}
                            </span>
                            <span className="opacity-0 group-hover/studio:opacity-100 text-[9px] mt-1 text-indigo-500 font-normal transition-opacity flex items-center">
                              <Plus className="w-2.5 h-2.5 mr-0.5" /> Shift
                            </span>
                          </button>
                          
                          {/* INLINE POPOVER */}
                          {studioToAdjust?.name === studio.name && (
                            <>
                              <div 
                                className="fixed inset-0 z-[110]" 
                                onClick={(e) => { e.stopPropagation(); setStudioToAdjust(null); }} 
                              />
                              <div 
                                className={`absolute ${studioToAdjust.align === 'bottom' ? 'bottom-0' : 'top-0'} left-full ml-1 z-[120] bg-white rounded-xl w-[300px] overflow-hidden shadow-2xl flex flex-col border border-slate-200 animate-fadeIn text-left`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="bg-indigo-600 p-2.5 flex items-center justify-between">
                                  <h3 className="text-white font-bold flex items-center gap-2 text-xs">
                                    <span>⚙️</span>
                                    Tambah Shift - {studio.name}
                                  </h3>
                                  <button
                                    type="button"
                                    onClick={() => setStudioToAdjust(null)}
                                    className="text-white hover:bg-white/20 p-1 rounded-md transition-colors cursor-pointer"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                
                                <div className="p-2 space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                                  <div className="space-y-1">
                                    {[...masterShifts].sort(compareShiftsByTime).map(mShift => {
                                      const isAlreadyVisible = studio.shifts.includes(mShift);
                                      if (isAlreadyVisible) return null;
                                      
                                      return (
                                        <button
                                          key={mShift}
                                          onClick={() => {
                                            fetch('/api/studio-shifts', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ studio: studio.name, shift: mShift })
                                            }).catch(console.error);

                                            setAddedShifts(prev => {
                                               const newSet = new Set(prev[studio.name] || []);
                                               newSet.add(mShift);
                                               return { ...prev, [studio.name]: newSet };
                                            });
                                            setStudioToAdjust(null);
                                          }}
                                          className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium text-[11px] text-slate-700 flex items-center justify-between"
                                        >
                                          <span className="truncate pr-2">{mShift}</span>
                                          <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
                                        </button>
                                      );
                                    })}
                                    {masterShifts.every(mShift => studio.shifts.includes(mShift)) && (
                                      <div className="text-center text-[10px] text-slate-500 p-2">Semua shift master sudah ditampilkan.</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </td>
                      )}

                      {/* Shift Cell */}
                      <td className={`${borderClass} border-r border-slate-200 py-2 px-1.5 text-center bg-white whitespace-nowrap group/shiftcell relative`}>
                        <div className="flex flex-col items-center justify-center">
                          <span className="font-semibold text-xs text-slate-700 leading-tight">
                            {shiftTitle}
                          </span>
                          {shiftHours && (
                            <span className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">
                              {shiftHours}
                            </span>
                          )}
                        </div>
                        <button
                           type="button"
                           title="Hapus baris shift ini"
                           onClick={() => {
                              const hasSchedules = weekDays.some(day => {
                                 const cellSchedules = scheduleMap.get(`${day.date}|${studio.name}|${shift}`);
                                 return cellSchedules && cellSchedules.length > 0;
                              });
                              
                              if (hasSchedules) {
                                 alert('Tidak bisa menyembunyikan shift yang masih memiliki jadwal di minggu ini. Silakan hapus jadwalnya terlebih dahulu.');
                                 return;
                              }
                              
                              fetch('/api/studio-shifts/delete', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ studio: studio.name, shift })
                              }).catch(console.error);

                              setAddedShifts(prev => {
                                 const newSet = new Set(prev[studio.name] || []);
                                 newSet.delete(shift);
                                 return { ...prev, [studio.name]: newSet };
                              });
                           }}
                           className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/shiftcell:opacity-100 hover:bg-rose-100 text-rose-500 rounded p-1 transition-all cursor-pointer"
                        >
                           <X className="w-3 h-3" />
                        </button>
                      </td>

                      {/* Days Cells */}
                      {weekDays.map(day => {
                        const cellSchedules = scheduleMap.get(`${day.date}|${studio.name}|${shift}`) || [];
                        const hasData = cellSchedules.length > 0;
                        const cellKey = `${day.date}|${studio.name}|${shift}`;
                        const isSelected = selectedSlots.has(cellKey);
                        const isDragSelected = dragSelection.has(cellKey);

                        return (
                          <td 
                            key={cellKey}
                            onMouseDown={(e) => handleCellMouseDown(e, day.date, studio.name, shift)}
                            onMouseEnter={() => handleCellMouseEnter(day.date, studio.name, shift)}
                            onClick={(e) => {
                              // If Ctrl/Cmd/Shift is held or multi-select mode is active, toggle selection
                              if (e.ctrlKey || e.metaKey || e.shiftKey || isMultiSelectMode || selectedSlots.size > 0) {
                                toggleSlotSelection(cellKey);
                              } else {
                                if (!dragSelection || dragSelection.size <= 1) {
                                  onCellClick(day.date, studio.name, shift);
                                }
                              }
                            }}
                            className={`${borderClass} border-r border-slate-200 p-1 cursor-pointer transition-all align-middle relative group min-h-[48px] select-none ${
                              isSelected || isDragSelected
                                ? 'bg-indigo-50/80 ring-2 ring-inset ring-indigo-500 shadow-inner' 
                                : 'hover:bg-slate-50/70'
                            }`}
                          >
                            {/* Hover Plus Icon (when not selected and no multi-select active) */}
                            {!isSelected && !isDragSelected && !isMultiSelectMode && selectedSlots.size === 0 && (
                              <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-blue-50/30 z-0 pointer-events-none">
                                <Plus className="w-4 h-4 text-blue-400" />
                              </div>
                            )}

                            {/* Selection Badge / Overlay */}
                            {(isSelected || isDragSelected) && (
                              <div className="absolute top-1 right-1 z-30 pointer-events-none">
                                <div className="bg-indigo-600 text-white rounded-md p-0.5 shadow-sm flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              </div>
                            )}
                            
                            <div className="relative z-10 flex flex-col gap-1 w-full h-full min-h-[42px] justify-center">
                              {cellSchedules.map((sched, idx) => {
                                const brandColor = getBrandColor(sched.brand);
                                const isNotRegularHost = !clientBrands.some(
                                  b => b.name?.trim().toLowerCase() === sched.brand?.trim().toLowerCase() && 
                                       b.sessions?.some(s => s.host?.trim().toLowerCase() === sched.hostName?.trim().toLowerCase())
                                );
                                
                                // User request: warna tetap sama dengan warna brand tersebut tapi yang buat berbeda itu bordernya saja yang warna merah
                                const cardBg = brandColor.bg;
                                const cardBorder = isNotRegularHost ? 'border-red-500 border-[1.5px]' : brandColor.border;
                                const cardText = brandColor.text;

                                const platformClean = sched.platform ? sched.platform.replace(/ live/i, '').trim() : '';

                                return (
                                  <div 
                                    key={idx} 
                                    onDragStart={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // If in multi-select mode or holding modifier key, toggle the slot selection instead
                                      if (e.ctrlKey || e.metaKey || e.shiftKey || isMultiSelectMode || selectedSlots.size > 0) {
                                        toggleSlotSelection(cellKey);
                                        return;
                                      }
                                      
                                      if (onScheduleClick) {
                                        onScheduleClick({
                                          ...sched,
                                          date: day.date,
                                          studio: studio.name,
                                          timeSlot: shift
                                        });
                                      }
                                    }}
                                    className={`group relative ${cardBg} border ${cardBorder} ${cardText} px-1.5 py-1 rounded-md flex flex-col justify-center transition-all hover:shadow-2xs cursor-pointer ${
                                      isSelected ? 'ring-1 ring-indigo-400 font-semibold' : ''
                                    }`}
                                    title={`${sched.brand}${platformClean ? ` - ${platformClean}` : ''} - ${sched.hostName}${isNotRegularHost ? ' (Bukan Host Reguler)' : ''}`}
                                  >
                                    <div className="font-bold text-[10px] truncate leading-tight pr-2.5">
                                      {sched.brand}{platformClean ? ` - ${platformClean}` : ''}
                                    </div>
                                    <div className={`text-[9.5px] truncate leading-tight mt-0.5 pr-2.5 ${isNotRegularHost ? 'font-bold text-red-600' : 'text-slate-600 font-medium'}`}>
                                      {sched.hostName}
                                    </div>
                                    {onDeleteSchedule && !isMultiSelectMode && selectedSlots.size === 0 && (
                                      <button
                                        type="button"
                                        title="Hapus Jadwal Ini"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteSchedule({
                                            ...sched,
                                            date: day.date,
                                            studio: studio.name,
                                            timeSlot: shift
                                          });
                                        }}
                                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/80 rounded p-0.5 transition-all text-slate-400 hover:text-rose-600"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {!hasData && (
                                <div className="w-full text-center text-slate-300 font-medium select-none text-xs">-</div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Action Bar for Selected Slots (Add, Edit, Delete) */}
      {selectedSlots.size > 0 && (
        <div className="sticky bottom-4 left-0 right-0 z-40 mx-4 my-2 animate-slideUp">
          <div className="bg-slate-900/95 text-white rounded-2xl shadow-2xl p-3 px-5 border border-slate-700/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white rounded-xl p-2 flex items-center justify-center font-bold text-sm min-w-[32px]">
                {selectedSlots.size}
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Slot Terpilih</span>
                  <span className="text-[11px] font-normal text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/60">
                    {Array.from(selectedSlots).some(k => (scheduleMap.get(k) || []).length > 0) ? 'Ada Jadwal Terisi' : 'Slot Kosong'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300">
                  {selectedSlots.size} hari & shift dipilih. Pilih tindakan di samping:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Button: Add / Fill Schedule */}
              <button
                type="button"
                onClick={() => {
                  if (onMassCellSelect) {
                    const slots = Array.from(selectedSlots).map((val: string) => {
                      const [date, studio, shift] = val.split('|');
                      return { date, studio, shift };
                    });
                    onMassCellSelect(slots);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-indigo-500"
              >
                <Plus className="w-4 h-4" />
                <span>Isi / Ubah Jadwal ({selectedSlots.size})</span>
              </button>

              {/* Button: Delete Schedules in Selected Slots */}
              {Array.from(selectedSlots).some(k => (scheduleMap.get(k) || []).length > 0) && onDeleteSchedule && (
                <button
                  type="button"
                  onClick={() => {
                    const slotsList = Array.from(selectedSlots);
                    const toDeleteList: ShiftSchedule[] = [];
                    slotsList.forEach(key => {
                      const scheds = scheduleMap.get(key) || [];
                      toDeleteList.push(...scheds);
                    });

                    if (toDeleteList.length === 0) {
                      alert('Tidak ada jadwal terisi pada slot yang dipilih.');
                      return;
                    }

                    if (window.confirm(`Hapus ${toDeleteList.length} jadwal pada ${selectedSlots.size} slot terpilih?`)) {
                      toDeleteList.forEach(s => onDeleteSchedule(s));
                      clearSelection();
                    }
                  }}
                  className="bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Jadwal Terisi</span>
                </button>
              )}

              {/* Button: Clear / Cancel Selection */}
              <button
                type="button"
                onClick={clearSelection}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all cursor-pointer border border-slate-600 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Studio Baru */}
      {isAddStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Tambah Studio Baru</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudioOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {newStudioError && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{newStudioError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Studio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Studio A4, Studio VIP 1"
                  value={newStudioNameInput}
                  onChange={(e) => {
                    setNewStudioNameInput(e.target.value);
                    if (newStudioError) setNewStudioError('');
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lokasi Cabang <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newStudioLocInput}
                  onChange={(e) => setNewStudioLocInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-800 bg-white"
                >
                  <option value="Bandar Lampung">Bandar Lampung</option>
                  <option value="Tanggamus">Tanggamus</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddStudioOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const trimmed = newStudioNameInput.trim();
                  if (!trimmed) {
                    setNewStudioError('Nama studio tidak boleh kosong');
                    return;
                  }

                  const exists = studios.some(
                    (s) => s.name.toLowerCase() === trimmed.toLowerCase() && s.location === newStudioLocInput
                  );
                  if (exists) {
                    setNewStudioError(`Studio "${trimmed}" sudah ada di cabang ${newStudioLocInput}`);
                    return;
                  }

                  if (onAddStudio) {
                    onAddStudio({ name: trimmed, location: newStudioLocInput });
                  }
                  setIsAddStudioOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
              >
                Simpan Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

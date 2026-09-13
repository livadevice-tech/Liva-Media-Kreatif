import React, { useMemo, useState, useEffect } from 'react';
import { ShiftSchedule, StudioItem, ClientBrand } from '../../types';
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle } from 'lucide-react';
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
  clientBrands = []
}: AdminWeeklyScheduleGridProps) {


  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set());
  
  // State for manual shifts
  const [addedShifts, setAddedShifts] = useState<Record<string, Set<string>>>({});
  const [studioToAdjust, setStudioToAdjust] = useState<{name: string, align: 'top' | 'bottom'} | null>(null);

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
        if (dragSelection.size > 1 && onMassCellSelect) {
          const slots = Array.from(dragSelection).map((val: string) => {
            const [date, studio, shift] = val.split('|');
            return { date, studio, shift };
          });
          onMassCellSelect(slots);
        } else if (dragSelection.size === 1) {
            // single click is handled by onClick, but to prevent race conditions or if onClick doesn't fire, we can let onClick handle it.
            // Wait, onClick handles it natively, so we just reset.
        }
        setDragSelection(new Set());
      }
    };
    
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragSelection, onMassCellSelect]);

  const handleCellMouseDown = (date: string, studio: string, shift: string) => {
    setIsDragging(true);
    setDragSelection(new Set([`${date}|${studio}|${shift}`]));
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
    
    // Get all valid dates for this week
    const validDates = new Set(weekDays.map(d => d.date));

    // Filter schedules to only this week
    const thisWeekSchedules = computedSchedules.filter(s => {
        const d = (s.date || "").split('T')[0];
        return validDates.has(d);
    });

    studios.forEach(st => {
      const loc = st.location || "Lainnya";
      
      const studioSchedules = thisWeekSchedules.filter(s => s.studio === st.name);
      let uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean) as string[];
      
      // Merge with manually added shifts
      const manualShifts = addedShifts[st.name];
      if (manualShifts) {
        uniqueShifts = Array.from(new Set([...uniqueShifts, ...Array.from(manualShifts)])) as string[];
      }
      uniqueShifts.sort(compareShiftsByTime);
      
      if (uniqueShifts.length > 0) {
          if (!groupsMap.has(loc)) {
            groupsMap.set(loc, []);
          }
          groupsMap.get(loc)!.push({
            name: st.name,
            shifts: uniqueShifts
          });
      }
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
  }, [studios, computedSchedules, weekDays, addedShifts]);

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden mt-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-white gap-4">
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="py-2.5 px-2 text-center text-xs font-bold text-slate-600 border-r border-slate-200 w-[75px] min-w-[75px]">
                Studio
              </th>
              <th className="py-2.5 px-2 text-center text-xs font-bold text-slate-600 border-r border-slate-200 w-[120px] min-w-[120px]">
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
                  <th key={day.date} className="py-2.5 px-1 text-center text-slate-700 border-r border-slate-200 min-w-[125px] w-[calc((100%-195px)/7)]">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-xs font-bold text-slate-700">{day.name}</span>
                      {hasDoubleHost && (
                        <div title={`Peringatan: Host double (${doubleHostNames.join(', ')})`} className="text-rose-500 bg-rose-100 rounded-full w-[14px] h-[14px] flex items-center justify-center cursor-help">
                          <AlertTriangle className="w-[9px] h-[9px] stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 leading-none mt-0.5">{day.displayDate}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {studioGroups.map((group) => {
              return group.studios.map((studio) => {
                const studioBadge = getStudioBadgeStyle(studio.name);
                const studioInitials = getStudioInitials(studio.name);

                return studio.shifts.map((shift, shiftIdx) => {
                  const isFirstRowInStudio = shiftIdx === 0;
                  const isLastRowInStudio = shiftIdx === studio.shifts.length - 1;
                  const borderClass = isLastRowInStudio ? "border-b-2 border-b-slate-200" : "border-b border-slate-100";
                  const { title: shiftTitle, hours: shiftHours } = parseShiftDisplay(shift);

                  return (
                    <tr key={`${group.location}-${studio.name}-${shift}`} className="hover:bg-slate-50/40 transition-colors">

                      {/* Studio Cell (Rowspan) */}
                      {isFirstRowInStudio && (
                        <td 
                          rowSpan={studio.shifts.length} 
                          className="border-r border-slate-200 p-2 text-center align-middle bg-white group/studio relative border-b-2 border-b-slate-200"
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

                        return (
                          <td 
                            key={`${day.date}-${studio.name}-${shift}`}
                            onMouseDown={() => handleCellMouseDown(day.date, studio.name, shift)}
                            onMouseEnter={() => handleCellMouseEnter(day.date, studio.name, shift)}
                            onClick={() => {
                              if (!dragSelection || dragSelection.size <= 1) {
                                onCellClick(day.date, studio.name, shift);
                              }
                            }}
                            className={`${borderClass} border-r border-slate-200 p-1 cursor-pointer transition-colors align-middle relative group min-h-[48px] select-none ${
                              dragSelection.has(`${day.date}|${studio.name}|${shift}`) 
                                ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' 
                                : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-blue-50/30 z-0 pointer-events-none">
                              <Plus className="w-4 h-4 text-blue-400" />
                            </div>

                            {/* Selection Overlay */}
                            {dragSelection.has(`${day.date}|${studio.name}|${shift}`) && (
                              <div className="absolute inset-0 bg-blue-500/10 z-20 pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-blue-600 text-white rounded-full p-1 shadow-md">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
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
                                
                                const cardBg = isNotRegularHost ? 'bg-rose-50' : brandColor.bg;
                                const cardBorder = isNotRegularHost ? 'border-rose-200' : brandColor.border;
                                const cardText = isNotRegularHost ? 'text-rose-600' : brandColor.text;

                                const platformClean = sched.platform ? sched.platform.replace(/ live/i, '').trim() : '';

                                return (
                                  <div 
                                    key={idx} 
                                    onDragStart={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onScheduleClick) {
                                        onScheduleClick({
                                          ...sched,
                                          date: day.date,
                                          studio: studio.name,
                                          timeSlot: shift
                                        });
                                      }
                                    }}
                                    className={`group relative ${cardBg} border ${cardBorder} ${cardText} px-2 py-1.5 rounded-lg flex flex-col justify-center transition-all hover:shadow-2xs cursor-pointer`}
                                    title={`${sched.brand}${platformClean ? ` - ${platformClean}` : ''} - ${sched.hostName}`}
                                  >
                                    <div className="font-bold text-[11px] truncate leading-tight pr-3">
                                      {sched.brand}{platformClean ? ` - ${platformClean}` : ''}
                                    </div>
                                    <div className={`text-[10px] truncate leading-tight mt-0.5 pr-3 ${isNotRegularHost ? 'font-bold text-rose-600' : 'text-slate-600 font-medium'}`}>
                                      {sched.hostName}
                                    </div>
                                    {onDeleteSchedule && (
                                      <button
                                        type="button"
                                        title="Hapus Jadwal"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteSchedule({
                                            ...sched,
                                            date: day.date,
                                            studio: studio.name,
                                            timeSlot: shift
                                          });
                                        }}
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 hover:bg-white/80 rounded p-0.5 transition-all text-slate-400 hover:text-rose-600"
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
    </div>
  );
}

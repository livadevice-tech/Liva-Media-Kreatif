import React, { useMemo, useState, useEffect } from 'react';
import { ShiftSchedule, StudioItem } from '../../types';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { getBrandColor } from '../../shared/utils/appUi';

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
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

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
  masterShifts = []
}: AdminWeeklyScheduleGridProps) {


  const [isDragging, setIsDragging] = useState(false);
  const [dragSelection, setDragSelection] = useState<Set<string>>(new Set());
  
  // State for manual shifts
  const [addedShifts, setAddedShifts] = useState<Record<string, Set<string>>>({});
  const [studioToAdjust, setStudioToAdjust] = useState<{name: string, align: 'top' | 'bottom'} | null>(null);

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
      uniqueShifts.sort();
      
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

    return Array.from(groupsMap.entries()).map(([location, studiosData]) => ({
      location,
      studios: studiosData
    }));
  }, [studios, computedSchedules, weekDays]);


  

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50 gap-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          📅 Jadwal Mingguan
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide">
            {formatWeekRange()}
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onCurrentWeek}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Minggu Ini
          </button>
          <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
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
      <div className="overflow-x-auto w-full pb-2">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b border-slate-200 p-1 text-center text-slate-700 bg-slate-100 font-bold border-r w-[60px]">Studio</th>
              <th className="border-b border-slate-200 p-1 text-center text-slate-700 bg-slate-100 font-bold border-r w-[60px]">Shift</th>
              {weekDays.map(day => (
                <th key={day.date} className="border-b border-slate-200 p-1 text-center text-slate-700 bg-slate-100 font-bold border-r w-auto">
                  <div>{day.name}</div>
                  <div className="text-[9px] font-medium text-slate-500 leading-tight">{day.displayDate}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {studioGroups.map((group, groupIdx) => {
              // Calculate total rows for this location to handle rowspan
              const totalLocationRows = group.studios.reduce((acc, studio) => acc + studio.shifts.length, 0);

              return group.studios.map((studio, studioIdx) => {
                return studio.shifts.map((shift, shiftIdx) => {
                  const isFirstRowInLocation = studioIdx === 0 && shiftIdx === 0;
                  const isFirstRowInStudio = shiftIdx === 0;

                  return (
                    <tr key={`${group.location}-${studio.name}-${shift}`} className="hover:bg-slate-50/50 transition-colors">

                      {/* Studio Cell (Rowspan) */}
                      {isFirstRowInStudio && (
                        <td 
                          rowSpan={studio.shifts.length} 
                          className="border-b border-r border-slate-200 p-1 text-center align-middle bg-white group/studio relative"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                               const rect = e.currentTarget.getBoundingClientRect();
                               // If the element is in the bottom half of the window, open upwards
                               const align = rect.top > (window.innerHeight / 2) ? 'bottom' : 'top';
                               setStudioToAdjust({ name: studio.name, align });
                            }}
                            className="w-full h-full min-h-[40px] font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 transition-colors flex flex-col items-center justify-center p-1 rounded cursor-pointer group-hover/studio:ring-2 group-hover/studio:ring-inset group-hover/studio:ring-indigo-300"
                            title="Klik untuk menambahkan shift"
                          >
                            <span className="break-words line-clamp-2 leading-tight">{studio.name}</span>
                            <span className="opacity-0 group-hover/studio:opacity-100 text-[9px] mt-1 text-indigo-500 font-normal transition-opacity flex items-center">
                              <Plus className="w-3 h-3 mr-0.5" /> Tambah Shift
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
                                    {masterShifts.map(shift => {
                                      const isAlreadyVisible = studio.shifts.includes(shift);
                                      if (isAlreadyVisible) return null;
                                      
                                      return (
                                        <button
                                          key={shift}
                                          onClick={() => {
                                            setAddedShifts(prev => {
                                               const newSet = new Set(prev[studio.name] || []);
                                               newSet.add(shift);
                                               return { ...prev, [studio.name]: newSet };
                                            });
                                            setStudioToAdjust(null);
                                          }}
                                          className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all font-medium text-[11px] text-slate-700 flex items-center justify-between"
                                        >
                                          <span className="truncate pr-2">{shift}</span>
                                          <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
                                        </button>
                                      );
                                    })}
                                    {masterShifts.every(shift => studio.shifts.includes(shift)) && (
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
                      <td className="border-b border-r border-slate-200 p-1 text-center font-bold text-slate-700 bg-slate-50/30 whitespace-nowrap">
                        {shift}
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
                              // If we didn't drag multiple, it's a single click
                              if (!dragSelection || dragSelection.size <= 1) {
                                onCellClick(day.date, studio.name, shift);
                              }
                            }}
                            className={`border-b border-r border-slate-200 p-0.5 cursor-pointer transition-colors align-top relative group h-[40px] select-none ${
                              dragSelection.has(`${day.date}|${studio.name}|${shift}`) 
                                ? 'bg-indigo-100 ring-2 ring-inset ring-indigo-400' 
                                : 'hover:bg-indigo-50'
                            }`}
                          >
                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-indigo-100/30 z-0 pointer-events-none">
                              <Plus className="w-4 h-4 text-indigo-400" />
                            </div>

                            {/* Selection Overlay */}
                            {dragSelection.has(`${day.date}|${studio.name}|${shift}`) && (
                              <div className="absolute inset-0 bg-indigo-500/20 z-20 pointer-events-none flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-indigo-600 text-white rounded-full p-1 shadow-md">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                              </div>
                            )}
                            
                            <div className="relative z-10 flex flex-col gap-0.5 w-full h-full min-h-[28px]">
                              {cellSchedules.map((sched, idx) => {
                                const brandColor = getBrandColor(sched.brand);
                                return (
                                  <div 
                                    key={idx} 
                                    onDragStart={(e) => e.preventDefault()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onScheduleClick) onScheduleClick(sched);
                                    }}
                                    className={`group relative ${brandColor.bg} border ${brandColor.border} ${brandColor.text} text-[9px] px-1 py-0.5 rounded flex-1 flex flex-col justify-center shadow-sm hover:brightness-95 cursor-pointer transition-all overflow-hidden`}
                                    title={`${sched.brand} - ${sched.hostName}`}
                                  >
                                    <span className="font-bold truncate pr-3 leading-tight">{sched.brand}</span>
                                    <span className="text-[8px] truncate leading-none mt-[1px] opacity-80 pr-3">{sched.hostName}</span>
                                    {onDeleteSchedule && (
                                      <button
                                        type="button"
                                        title="Hapus Jadwal"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteSchedule(sched);
                                        }}
                                        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 hover:bg-white/50 rounded-full p-0.5 transition-all text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                              
                              {!hasData && (
                                <div className="w-full h-full text-transparent select-none">-</div>
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

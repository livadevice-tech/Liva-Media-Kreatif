import React, { useMemo } from 'react';
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
  onDeleteSchedule
}: AdminWeeklyScheduleGridProps) {

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
      const uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean).sort();
      
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
                          className="border-b border-r border-slate-200 p-1 text-center align-middle font-bold text-slate-700 bg-white"
                        >
                          <span className="break-words line-clamp-2 leading-tight">{studio.name}</span>
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
                            onClick={() => onCellClick(day.date, studio.name, shift)}
                            className="border-b border-r border-slate-200 p-0.5 cursor-pointer hover:bg-indigo-50 transition-colors align-top relative group h-[40px]"
                          >
                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-indigo-100/30 z-0 pointer-events-none">
                              <Plus className="w-4 h-4 text-indigo-400" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col gap-0.5 w-full h-full min-h-[28px]">
                              {cellSchedules.map((sched, idx) => {
                                const brandColor = getBrandColor(sched.brand);
                                return (
                                  <div 
                                    key={idx} 
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

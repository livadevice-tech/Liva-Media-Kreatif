import React, { useMemo } from 'react';
import { ShiftSchedule, StudioItem } from '../../types';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface AdminWeeklyScheduleGridProps {
  computedSchedules: ShiftSchedule[];
  studios: StudioItem[];
  weekStartDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onCellClick: (dateStr: string, studio: string, shift: string) => void;
}

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function AdminWeeklyScheduleGrid({
  computedSchedules,
  studios,
  weekStartDate,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  onCellClick
}: AdminWeeklyScheduleGridProps) {
  // Default shifts for any studio
  const DEFAULT_SHIFTS = ["00.00 - 06.00", "06.00 - 12.00", "11.00 - 17.00", "17.00 - 23.00"];

  // Group studios by location dynamically from master data
  const studioGroups = useMemo(() => {
    const groupsMap = new Map<string, { name: string; shifts: string[] }[]>();
    studios.forEach(st => {
      const loc = st.location || "Lainnya";
      if (!groupsMap.has(loc)) {
        groupsMap.set(loc, []);
      }
      
      // Extract unique shifts for this studio from computedSchedules, or use defaults
      const studioSchedules = computedSchedules.filter(s => s.studio === st.name);
      const uniqueShifts = Array.from(new Set(studioSchedules.map(s => s.timeSlot))).filter(Boolean);
      
      // Merge unique shifts with some defaults to ensure grid is always visible
      const shiftsToUse = Array.from(new Set([...DEFAULT_SHIFTS, ...uniqueShifts])).sort();

      groupsMap.get(loc)!.push({
        name: st.name,
        shifts: shiftsToUse.length > 0 ? shiftsToUse : DEFAULT_SHIFTS
      });
    });

    return Array.from(groupsMap.entries()).map(([location, studiosData]) => ({
      location,
      studios: studiosData
    }));
  }, [studios, computedSchedules]);


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
        <table className="w-full text-xs text-left border-collapse min-w-[1000px]">
          <thead>
            <tr>
              <th className="border-b border-slate-200 p-2 text-center text-slate-700 bg-slate-100 font-bold border-r w-[80px]">Lokasi</th>
              <th className="border-b border-slate-200 p-2 text-center text-slate-700 bg-slate-100 font-bold border-r w-[100px]">Studio</th>
              <th className="border-b border-slate-200 p-2 text-center text-slate-700 bg-slate-100 font-bold border-r w-[110px]">Shift</th>
              {weekDays.map(day => (
                <th key={day.date} className="border-b border-slate-200 p-2 text-center text-slate-700 bg-slate-100 font-bold border-r min-w-[120px]">
                  <div>{day.name}</div>
                  <div className="text-[10px] font-medium text-slate-500">{day.displayDate}</div>
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
                      {/* Location Cell (Rowspan) */}
                      {isFirstRowInLocation && (
                        <td 
                          rowSpan={totalLocationRows} 
                          className="border-b border-r border-slate-200 p-2 text-center align-middle font-bold text-slate-600 bg-white"
                        >
                          <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }} className="mx-auto whitespace-nowrap">
                            {group.location}
                          </div>
                        </td>
                      )}

                      {/* Studio Cell (Rowspan) */}
                      {isFirstRowInStudio && (
                        <td 
                          rowSpan={studio.shifts.length} 
                          className="border-b border-r border-slate-200 p-2 align-middle font-bold text-slate-700 bg-white"
                        >
                          {studio.name}
                        </td>
                      )}

                      {/* Shift Cell */}
                      <td className="border-b border-r border-slate-200 p-2 text-center font-bold text-slate-700 bg-slate-50/30 whitespace-nowrap">
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
                            className="border-b border-r border-slate-200 p-1.5 cursor-pointer hover:bg-indigo-50 transition-colors align-top relative group h-[40px] min-h-[40px]"
                          >
                            <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-indigo-100/30 z-0 pointer-events-none">
                              <Plus className="w-4 h-4 text-indigo-400" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col gap-1 w-full h-full min-h-[28px]">
                              {cellSchedules.map((sched, idx) => (
                                <div 
                                  key={idx} 
                                  className="bg-indigo-50 border border-indigo-100 text-indigo-800 text-[10px] px-1.5 py-1 rounded truncate flex-1 flex flex-col justify-center min-h-[28px] shadow-sm"
                                  title={`${sched.brand} - ${sched.hostName}`}
                                >
                                  <span className="font-bold truncate">{sched.brand}</span>
                                  <span className="text-[9px] text-indigo-600 truncate leading-none mt-0.5">{sched.hostName}</span>
                                </div>
                              ))}
                              
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

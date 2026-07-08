import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AttendanceLog, HostEmployee } from "../../types";
import { SearchableHostSelect } from "./HostManagement";

interface AttendanceCalendarViewProps {
  logs: AttendanceLog[];
  hosts: HostEmployee[];
}

export function AttendanceCalendarView({ logs, hosts }: AttendanceCalendarViewProps) {
  const [selectedHostId, setSelectedHostId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  
  // Format MM/YYYY
  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  // Get selected host logs
  const selectedHostLogs = useMemo(() => {
    if (!selectedHostId) return [];
    return logs.filter((log) => log.hostId === selectedHostId || log.employeeId === selectedHostId);
  }, [logs, selectedHostId]);

  const getLogForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    // Assuming log.date is YYYY-MM-DD
    return selectedHostLogs.find(l => {
      // log.date could be YYYY-MM-DD
      const logDate = l.date || (typeof (l as any).timestamp === "string" ? (l as any).timestamp.split(" ")[0] : "");
      return logDate === dateStr;
    });
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/60 shadow-sm p-6 overflow-hidden mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-[300px]">
          <SearchableHostSelect
            hosts={hosts}
            value={selectedHostId}
            onChange={setSelectedHostId}
            placeholder="Pilih Host..."
          />
        </div>
        <div className="flex items-center gap-4 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200/60">
          <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-700 min-w-[140px] text-center">
            {monthName}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
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
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-slate-100 bg-slate-50/50"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const log = getLogForDay(day);
              
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              
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
                <div key={`day-${day}`} className={`min-h-[100px] p-2 border-r border-b border-slate-100 ${isToday ? 'bg-purple-50/40' : ''}`}>
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold mb-2 ${isToday ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-700'}`}>
                    {day}
                  </div>
                  {log ? (
                    <div className={`text-[10px] font-bold px-2 py-1 rounded-md border text-center ${badgeColor}`}>
                      {label}
                    </div>
                  ) : null}
                </div>
              );
            })}
            
            {/* Fill the rest of the grid cells for the last week */}
            {Array.from({ length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7 }).map((_, i) => (
              <div key={`empty-end-${i}`} className="min-h-[100px] border-r border-b border-slate-100 bg-slate-50/50"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

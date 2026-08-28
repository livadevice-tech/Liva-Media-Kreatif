import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { getBrandColor } from "../../shared/utils/appUi";

interface Schedule {
  id: string;
  hostId: string;
  hostName: string;
  employeeId?: string;
  date: string;
  timeSlot: string;
  platform: string;
  brand: string;
  status: string;
  studio: string;
}

interface MobileWeeklyScheduleProps {
  schedules: Schedule[];
  clientBrands: any[];
  onBackClick?: () => void;
  onEmptyCellClick?: (dateStr: string, studio: string) => void;
  onScheduleClick?: (schedule: Schedule) => void;
}

export const MobileWeeklySchedule: React.FC<MobileWeeklyScheduleProps> = ({ 
  schedules, 
  clientBrands, 
  onBackClick,
  onEmptyCellClick,
  onScheduleClick
}) => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Generate current week dates (Monday to Sunday)
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday + (weekOffset * 7));

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d,
      dateString: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      dayName: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][d.getDay()],
      shortDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    };
  });

  const [activeDate, setActiveDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  const headerDateRange = `${weekDays[0].date.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][weekDays[0].date.getMonth()]} - ${weekDays[6].date.getDate()} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][weekDays[6].date.getMonth()]} ${weekDays[6].date.getFullYear()}`;

  // Filter based on week
  const weekSchedules = schedules.filter(s => weekDays.some(wd => wd.dateString === s.date));

  // Group schedules by studio for the whole week
  const studiosMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    weekSchedules.forEach(s => {
      // Clean up studio name
      const studio = s.studio || "Unknown Studio";
      if (!map[studio]) map[studio] = [];
      map[studio].push(s);
    });
    return map;
  }, [weekSchedules]);

  // Sort studios alphabetically
  const sortedStudios = Object.keys(studiosMap).sort();

  // Helper to format time strings like "Reg 2 - (11.00 - 17.00)" or "11:00 - 17:00" to "11-17"
  const formatTime = (timeSlot: string) => {
    if (!timeSlot) return "";
    const matches = timeSlot.match(/\b(\d{1,2})[:\.]\d{2}\b/g);
    if (matches && matches.length >= 2) {
      const start = matches[0].split(/[:\.]/)[0];
      const end = matches[matches.length - 1].split(/[:\.]/)[0];
      return `${start}-${end}`;
    }
    return timeSlot.length > 7 ? timeSlot.substring(0, 7) : timeSlot;
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-white pb-24 w-full font-sans">
      {/* HEADER DESIGN */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-[28px] font-medium text-black tracking-tight">Calender Host</h1>
      </div>

      {/* Date Navigator */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between border-2 border-indigo-500 rounded-[24px] p-1.5 shadow-sm">
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-[15px] font-medium text-black">
            {headerDateRange}
          </span>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="w-full overflow-x-auto no-scrollbar border-t border-slate-100 pt-2">
        <div className="w-full">
          {/* Rows (Studios) */}
          <div className="mt-2 pb-10">
            {sortedStudios.length === 0 && (
              <div className="text-center py-10 text-slate-400">Belum ada jadwal minggu ini</div>
            )}
            {sortedStudios.map((studioName, idx) => {
              const studioSchedules = studiosMap[studioName];
              
              return (
                <div key={idx} className="mb-3 border-b border-slate-200 pb-3 last:border-b-0">
                  <h2 className="text-[17px] font-medium text-black mb-3 px-3">{studioName}</h2>
                  
                  {/* Table Header (Days) Per Studio */}
                  <div className="grid grid-cols-7 border-b border-slate-200 mb-3 bg-[#faf9fe]">
                    {weekDays.map((wd, i) => {
                      const isActive = wd.dateString === activeDate;
                      return (
                        <button 
                          key={i} 
                          onClick={() => setActiveDate(wd.dateString)}
                          className={`flex flex-col items-center justify-center py-2.5 mx-0.5 mb-1 rounded-[14px] transition-colors cursor-pointer ${
                            isActive ? 'bg-indigo-50' : 'bg-transparent'
                          }`}
                        >
                          <div className={`text-[11px] font-bold ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{wd.dayName}</div>
                          <div className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{wd.shortDate}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-7 gap-1 px-1.5">
                    {weekDays.map((wd, i) => {
                      // Find schedules for this day
                      const daySchedules = studioSchedules.filter(s => s.date === wd.dateString);
                      
                      return (
                        <div key={i} className="flex flex-col gap-1.5">
                          {daySchedules.map((s, sIdx) => {
                            const timeStr = formatTime(s.timeSlot);
                            const brandColor = getBrandColor(s.brand);
                            
                            return (
                              <button 
                                key={sIdx} 
                                onClick={() => onScheduleClick && onScheduleClick(s)}
                                className="w-full bg-white border rounded-[10px] py-1.5 px-0.5 flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
                                style={{ borderColor: brandColor }}
                              >
                                <span className="text-[8.5px] font-bold text-black text-center w-full truncate leading-tight">
                                  {s.brand.split(' ')[0]}
                                </span>
                                <span className="text-[8px] font-medium text-black uppercase text-center w-full truncate leading-tight mt-0.5">
                                  {s.hostName.split(' ')[0]}
                                </span>
                                <span className="text-[8.5px] font-bold mt-1 leading-tight" style={{ color: brandColor }}>
                                  {timeStr}
                                </span>
                              </button>
                            );
                          })}
                          
                          {/* Add button placeholder to match design */}
                          <button 
                            onClick={() => onEmptyCellClick && onEmptyCellClick(wd.dateString, studioName)}
                            className="w-full h-11 bg-slate-50/50 border border-slate-200 rounded-[12px] flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors active:scale-95 cursor-pointer"
                          >
                            <span className="text-sm font-medium">+</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from "react";
import { ChevronRight, ChevronLeft, Settings } from "lucide-react";
import { getBrandStyle } from "../../shared/utils/appUi";
import { HostEmployee } from "../../types";

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
  hosts: HostEmployee[];
  onBackClick?: () => void;
  onEmptyCellClick?: (dateStr: string, studio: string) => void;
  onScheduleClick?: (schedule: Schedule) => void;
  onSettingsClick?: () => void;
}

export const MobileWeeklySchedule: React.FC<MobileWeeklyScheduleProps> = ({ 
  schedules, 
  clientBrands, 
  hosts,
  onBackClick,
  onEmptyCellClick,
  onScheduleClick,
  onSettingsClick
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

  const [selectedHost, setSelectedHost] = useState("Semua Host");
  const [selectedBrand, setSelectedBrand] = useState("Semua Brand");

  const hostOptions = useMemo(() => ["Semua Host", ...hosts.map(h => h.id)], [hosts]);

  const handlePrevHost = () => {
    const currentIndex = hostOptions.indexOf(selectedHost);
    if (currentIndex > 0) {
      setSelectedHost(hostOptions[currentIndex - 1]);
    } else {
      setSelectedHost(hostOptions[hostOptions.length - 1]);
    }
  };

  const handleNextHost = () => {
    const currentIndex = hostOptions.indexOf(selectedHost);
    if (currentIndex < hostOptions.length - 1) {
      setSelectedHost(hostOptions[currentIndex + 1]);
    } else {
      setSelectedHost(hostOptions[0]);
    }
  };

  // Filter schedules based on dropdowns
  const filteredSchedules = useMemo(() => {
    return weekSchedules.filter(s => {
      if (selectedHost !== "Semua Host" && s.hostId !== selectedHost) return false;
      if (selectedBrand !== "Semua Brand" && s.brand !== selectedBrand) return false;
      return true;
    });
  }, [weekSchedules, selectedHost, selectedBrand]);

  // Group schedules by studio for the whole week
  const studiosMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    filteredSchedules.forEach(s => {
      // Clean up studio name
      const studio = s.studio || "Unknown Studio";
      if (!map[studio]) map[studio] = [];
      map[studio].push(s);
    });
    return map;
  }, [filteredSchedules]);

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
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackClick && (
            <button 
              onClick={onBackClick}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-[28px] font-medium text-black tracking-tight">Calender Host</h1>
        </div>
        
        {onSettingsClick && (
          <button 
            onClick={onSettingsClick}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Date Navigator */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between border border-indigo-500 rounded-[20px] p-1 shadow-sm max-w-[280px] mx-auto">
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-black">
            {headerDateRange}
          </span>
          <button 
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setWeekOffset(prev => prev + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters (Host & Brand) */}
      <div className="px-4 mb-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 flex-1 items-center">
          {/* Host Filter with Nav */}
          <div className="flex items-center flex-1 min-w-0 bg-white border border-slate-200 rounded-[14px] p-0.5 shadow-sm">
            <button 
              onClick={handlePrevHost} 
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 shrink-0 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <select 
              value={selectedHost}
              onChange={(e) => setSelectedHost(e.target.value)}
              className="flex-1 min-w-0 bg-transparent px-2 py-2 text-[11px] font-medium text-slate-700 outline-none appearance-none text-center"
            >
              <option value="Semua Host">Semua Host</option>
              {hosts.map(h => (
                <option key={h.id} value={h.id}>{h.username || h.name}</option>
              ))}
            </select>
            <button 
              onClick={handleNextHost} 
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 shrink-0 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <select 
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="flex-1 min-w-0 bg-white border border-slate-200 rounded-[14px] px-3 py-2 text-[11px] font-medium text-slate-700 outline-none appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', paddingRight: '24px' }}
          >
            <option value="Semua Brand">Semua Brand</option>
            {clientBrands.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="w-full overflow-hidden border-t border-slate-100 pt-2">
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
                  <div className="flex justify-between items-center px-3 mb-3">
                    <h2 className="text-[17px] font-medium text-black">{studioName}</h2>
                    <button 
                      onClick={() => onEmptyCellClick && onEmptyCellClick(activeDate, studioName)}
                      className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 cursor-pointer active:scale-95 transition-transform"
                    >
                      <span className="text-base font-medium leading-none mb-0.5">+</span>
                    </button>
                  </div>
                  
                  {/* Table Header (Days) Per Studio */}
                  <div className="grid grid-cols-7 border-b border-slate-200 mb-3 bg-[#faf9fe]">
                    {weekDays.map((wd, i) => {
                      const isActive = wd.dateString === activeDate;
                      return (
                        <button 
                          key={i} 
                          onClick={() => setActiveDate(wd.dateString)}
                          className={`flex flex-col items-center justify-center py-2.5 mx-0.5 mb-1 rounded-[14px] min-w-0 transition-colors cursor-pointer ${
                            isActive ? 'bg-indigo-50' : 'bg-transparent'
                          }`}
                        >
                          <div className={`text-[11px] font-bold ${isActive ? 'text-indigo-700' : 'text-slate-500'}`}>{wd.dayName}</div>
                          <div className={`text-[9px] font-medium mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{wd.shortDate}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-1.5 px-1.5">
                    {(() => {
                      const uniqueShifts = Array.from(new Set(studioSchedules.map(s => formatTime(s.timeSlot)))).sort();
                      
                      return uniqueShifts.map((shift, shiftIdx) => (
                        <div key={shiftIdx} className="grid grid-cols-7 gap-1">
                          {weekDays.map((wd, i) => {
                            const shiftSchedules = studioSchedules.filter(s => s.date === wd.dateString && formatTime(s.timeSlot) === shift);
                            
                            if (shiftSchedules.length === 0) {
                              return (
                                <button 
                                  key={`empty-${i}`}
                                  onClick={() => onEmptyCellClick && onEmptyCellClick(wd.dateString, studioName)}
                                  className="w-full min-w-0 h-[52px] bg-slate-50/50 border border-slate-200 rounded-[10px] flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-indigo-500 transition-colors active:scale-95 cursor-pointer"
                                >
                                  <span className="text-[14px] font-medium">+</span>
                                </button>
                              );
                            }

                            return (
                              <div key={`filled-${i}`} className="flex flex-col gap-1 min-w-0">
                                {shiftSchedules.map((s, sIdx) => {
                                  const brandStyle = getBrandStyle(s.brand);
                                  const hostData = hosts.find(h => h.id === s.hostId);
                                  const displayName = hostData?.username || s.hostName;
                                  
                                  return (
                                    <button 
                                      key={sIdx} 
                                      onClick={() => onScheduleClick && onScheduleClick(s)}
                                      className={`w-full min-w-0 border rounded-[10px] py-1.5 px-0.5 flex flex-col items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform ${brandStyle}`}
                                    >
                                      <span className="text-[8.5px] font-extrabold text-center w-full truncate leading-tight opacity-90">
                                        {s.brand.split(' ')[0]}
                                      </span>
                                      <span className="text-[8px] font-semibold uppercase text-center w-full truncate leading-tight mt-0.5 opacity-80">
                                        {displayName.split(' ')[0]}
                                      </span>
                                      <span className="text-[8.5px] font-bold mt-1 leading-tight">
                                        {shift}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      ));
                    })()}
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

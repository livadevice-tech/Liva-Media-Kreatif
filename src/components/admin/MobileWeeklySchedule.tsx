import React, { useMemo, useState } from "react";
import { Menu, Filter, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

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
  onMenuClick?: () => void;
}

const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  "sumber ayu": { bg: "bg-orange-100", text: "text-orange-600" },
  "safi": { bg: "bg-blue-100", text: "text-blue-600" },
  "dewi sri": { bg: "bg-green-100", text: "text-green-600" },
  "rhc": { bg: "bg-red-100", text: "text-red-500" },
  "isago": { bg: "bg-purple-100", text: "text-purple-600" },
  "mirael": { bg: "bg-cyan-100", text: "text-cyan-600" },
  "sari ayu": { bg: "bg-pink-100", text: "text-pink-600" },
  "default": { bg: "bg-slate-100", text: "text-slate-600" },
};

const getBrandColor = (brandName: string) => {
  const lower = brandName.toLowerCase();
  for (const key in BRAND_COLORS) {
    if (lower.includes(key)) return BRAND_COLORS[key];
  }
  return BRAND_COLORS.default;
};

// Map real studio names to short aliases if possible
const getStudioAlias = (studioName: string) => {
  const name = (studioName || "").toLowerCase();
  if (name.includes("sba1") || name.includes("bandar lampung 1")) return "SBA1";
  if (name.includes("sba2") || name.includes("bandar lampung 2")) return "SBA2";
  if (name.includes("sba3") || name.includes("bandar lampung 3")) return "SBA3";
  if (name.includes("bandar lampung")) return "SBA1";
  if (name.includes("sbb1") || name.includes("cibubur 1") || name.includes("cibubur")) return "SBB1";
  if (name.includes("spsw") || name.includes("pesanggrahan") || name.includes("pesawaran")) return "SPSW";
  if (name.includes("stp1") || name.includes("tanggamus 1") || name.includes("tanggamus")) return "STP1";
  
  // Jika sudah inisial (pendek), kembalikan langsung
  if (studioName.length <= 4) return studioName.toUpperCase();
  
  // Fallback: buat inisial otomatis dari huruf pertama tiap kata
  const initials = studioName.split(" ").map(w => w[0]).join("").toUpperCase();
  return initials.length > 4 ? initials.substring(0, 4) : initials;
};

export const MobileWeeklySchedule: React.FC<MobileWeeklyScheduleProps> = ({ schedules, clientBrands, onMenuClick }) => {
  // Generate current week dates (Monday to Sunday)
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

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

  // Group schedules by studio
  const studiosMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    schedules.forEach(s => {
      // Only include schedules in the current week
      if (weekDays.some(wd => wd.dateString === s.date)) {
        if (!map[s.studio]) map[s.studio] = [];
        map[s.studio].push(s);
      }
    });
    return map;
  }, [schedules, weekDays]);

  // Extract unique brands for Legend
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    schedules.forEach(s => {
      if (weekDays.some(wd => wd.dateString === s.date)) {
         brands.add(s.brand);
      }
    });
    return Array.from(brands);
  }, [schedules, weekDays]);

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-[#fafafc] pb-24 w-full text-slate-800 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 bg-white sticky top-0 z-20">
        <button onClick={onMenuClick} className="p-1">
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">Jadwal Mingguan</h1>
        <button className="p-1">
          <Filter className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      <div className="px-3 pt-4">
        {/* Date Selector Pill */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-50/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-900">{headerDateRange}</span>
            <ChevronRight className="w-4 h-4 text-indigo-400 rotate-90" />
          </div>
        </div>

        {/* Horizontal Days Row */}
        <div className="flex justify-between items-center mb-6 px-1">
          {weekDays.map((wd, i) => {
            const isActive = wd.dateString === activeDate;
            return (
              <button 
                key={i}
                onClick={() => setActiveDate(wd.dateString)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-[14px] w-12 transition-all ${
                  isActive ? 'bg-indigo-500 text-white shadow-md scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[11px] font-semibold mb-0.5 ${isActive ? 'text-indigo-50' : 'text-slate-500'}`}>
                  {wd.dayName}
                </span>
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {wd.shortDate}
                </span>
              </button>
            );
          })}
        </div>

        {/* Studio Cards */}
        <div className="space-y-4">
          {Object.keys(studiosMap).length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
               <p className="text-slate-400 text-sm font-medium">Tidak ada jadwal minggu ini.</p>
            </div>
          )}

          {Object.entries(studiosMap).map(([studioName, studioSchedules], idx) => {
            const alias = getStudioAlias(studioName);

            return (
              <div key={idx} className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">{alias}</h2>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                
                {/* 7-Day Grid within Card */}
                <div className="grid grid-cols-7 gap-1.5 w-full">
                  {/* Days Header */}
                  {weekDays.map((wd, i) => (
                    <div key={`header-${i}`} className="text-center pb-2">
                      <span className="text-[9px] font-semibold text-slate-500">{wd.dayName}</span>
                    </div>
                  ))}

                  {/* Shift 1 Row */}
                  {weekDays.map((wd, i) => {
                    // Find schedules for this day
                    const daySchedules = studioSchedules.filter(s => s.date === wd.dateString);
                    // Sort to guess shift 1 vs 2 (e.g. by timeSlot or just take first)
                    const shift1 = daySchedules[0];

                    return (
                      <div key={`s1-${i}`} className="flex justify-center h-8">
                        {shift1 ? (() => {
                          const color = getBrandColor(shift1.brand);
                          const hostShort = shift1.hostName.split(' ')[0].substring(0, 5);
                          return (
                            <div className={`w-full h-full rounded-md flex items-center justify-center ${color.bg} ${color.text} border border-white`}>
                              <span className="text-[9px] font-bold tracking-tight px-0.5 leading-tight text-center line-clamp-1 truncate w-full">{hostShort}</span>
                            </div>
                          );
                        })() : (
                          <div className="w-full h-full rounded-md flex items-center justify-center border border-slate-100 bg-slate-50/50">
                            <span className="text-[10px] text-slate-300">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Shift 2 Row */}
                  {weekDays.map((wd, i) => {
                    // Find schedules for this day
                    const daySchedules = studioSchedules.filter(s => s.date === wd.dateString);
                    const shift2 = daySchedules[1]; // second shift if exists

                    return (
                      <div key={`s2-${i}`} className="flex justify-center h-8 mt-1">
                        {shift2 ? (() => {
                          const color = getBrandColor(shift2.brand);
                          const hostShort = shift2.hostName.split(' ')[0].substring(0, 5);
                          return (
                            <div className={`w-full h-full rounded-md flex items-center justify-center ${color.bg} ${color.text} border border-white`}>
                              <span className="text-[9px] font-bold tracking-tight px-0.5 leading-tight text-center line-clamp-1 truncate w-full">{hostShort}</span>
                            </div>
                          );
                        })() : (
                          <div className="w-full h-full rounded-md flex items-center justify-center border border-slate-100 bg-slate-50/50">
                            <span className="text-[10px] text-slate-300">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {uniqueBrands.length > 0 && (
          <div className="mt-8 px-2 flex flex-wrap gap-x-4 gap-y-3 justify-center">
            {uniqueBrands.slice(0, 8).map((brand, i) => {
              const color = getBrandColor(brand);
              // Extract solid color for the dot from bg class if possible, or fallback
              let dotColor = "bg-slate-400";
              if (color.bg.includes('orange')) dotColor = "bg-orange-500";
              else if (color.bg.includes('blue')) dotColor = "bg-blue-500";
              else if (color.bg.includes('green')) dotColor = "bg-green-500";
              else if (color.bg.includes('red')) dotColor = "bg-red-500";
              else if (color.bg.includes('purple')) dotColor = "bg-purple-500";
              else if (color.bg.includes('cyan')) dotColor = "bg-cyan-500";
              else if (color.bg.includes('pink')) dotColor = "bg-pink-500";

              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                  <span className="text-[11px] font-bold text-slate-700">{brand}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

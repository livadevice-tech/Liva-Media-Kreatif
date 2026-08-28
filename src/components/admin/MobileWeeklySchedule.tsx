import React, { useMemo, useState } from "react";
import { ArrowLeft, Calendar as CalendarIcon, ChevronRight } from "lucide-react";

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

// Remove getStudioAlias since we want full names

export const MobileWeeklySchedule: React.FC<MobileWeeklyScheduleProps> = ({ schedules, clientBrands, onBackClick }) => {
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

  // Group schedules by studio for the active date
  const activeSchedulesMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    schedules.forEach(s => {
      // Only include schedules for the selected day
      if (s.date === activeDate) {
        if (!map[s.studio]) map[s.studio] = [];
        map[s.studio].push(s);
      }
    });
    return map;
  }, [schedules, activeDate]);

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
      <div className="flex justify-between items-center px-5 py-4 bg-white sticky top-0 z-20 shadow-sm">
        <button onClick={onBackClick} className="p-1">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800">Calender Kerja Host</h1>
        <div className="w-6 h-6"></div> {/* Spacer for centering */}
      </div>

      <div className="px-2 pt-4">
        {/* Date Selector Pill */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-50/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-semibold text-indigo-900">{headerDateRange}</span>
            <ChevronRight className="w-4 h-4 text-indigo-400 rotate-90" />
          </div>
        </div>

        {/* Horizontal Days Row */}
        <div className="flex justify-between items-center mb-6 px-0.5">
          {weekDays.map((wd, i) => {
            const isActive = wd.dateString === activeDate;
            return (
              <button 
                key={i}
                onClick={() => setActiveDate(wd.dateString)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-[14px] w-[13%] transition-all ${
                  isActive ? 'bg-indigo-500 text-white shadow-md scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[11px] font-semibold mb-0.5 ${isActive ? 'text-indigo-50' : 'text-slate-500'}`}>
                  {wd.dayName}
                </span>
                <span className={`text-[11px] sm:text-xs font-bold ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {wd.shortDate}
                </span>
              </button>
            );
          })}
        </div>

        {/* Studio Cards */}
        <div className="space-y-3">
          {Object.keys(activeSchedulesMap).length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
               <p className="text-slate-400 text-sm font-medium">Tidak ada jadwal untuk tanggal ini.</p>
            </div>
          )}

          {Object.entries(activeSchedulesMap).map(([studioName, studioSchedules], idx) => {
            return (
              <div key={idx} className="bg-white rounded-2xl p-3 sm:p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-[15px] sm:text-[17px] font-bold text-slate-800 tracking-tight">{studioName}</h2>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                
                {/* Daily Schedule List within Card */}
                <div className="space-y-2">
                  {studioSchedules.map((s, i) => {
                    const color = getBrandColor(s.brand);
                    return (
                      <div key={i} className={`rounded-xl p-3 ${color.bg} border border-white flex flex-col gap-1.5 shadow-sm`}>
                        <div className="flex justify-between items-start">
                          <span className={`text-[13px] font-extrabold ${color.text} tracking-tight`}>{s.hostName}</span>
                          <span className="text-[10px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-lg border border-white shadow-xs">
                            {s.timeSlot}
                          </span>
                        </div>
                        <div className={`text-[11px] font-bold ${color.text} opacity-90 uppercase tracking-wider mt-0.5 flex flex-wrap gap-1 items-center`}>
                          <span className="w-1 h-1 rounded-full bg-current opacity-50 hidden sm:block"></span>
                          Brand: {s.brand}
                        </div>
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

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

// Generate short studio aliases for the left column
const getStudioAlias = (studioName: string) => {
  const name = (studioName || "").toLowerCase();
  if (name.includes("sba1") || name.includes("bandar lampung 1")) return "SBA1";
  if (name.includes("sba2") || name.includes("bandar lampung 2")) return "SBA2";
  if (name.includes("sba3") || name.includes("bandar lampung 3")) return "SBA3";
  if (name.includes("bandar lampung")) return "SBA1";
  if (name.includes("sbb1") || name.includes("cibubur 1") || name.includes("cibubur")) return "SBB1";
  if (name.includes("spsw") || name.includes("pesanggrahan") || name.includes("pesawaran")) return "SPSW";
  if (name.includes("stp1") || name.includes("tanggamus 1") || name.includes("tanggamus")) return "STP1";
  if (studioName.length <= 4) return studioName.toUpperCase();
  const initials = studioName.split(" ").map(w => w[0]).join("").toUpperCase();
  return initials.length > 4 ? initials.substring(0, 4) : initials;
};

import { Video, Users, Tag, Calendar as CalendarIcon, ChevronRight, ChevronLeft } from "lucide-react";

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
  const fullDate = `${today.getDate()} ${['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][today.getMonth()]} ${today.getFullYear()}`;
  const dayNameFull = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][today.getDay()];

  // Filter based on week
  const weekSchedules = schedules.filter(s => weekDays.some(wd => wd.dateString === s.date));

  // Group schedules by studio for the whole week
  const studiosMap = useMemo(() => {
    const map: Record<string, Schedule[]> = {};
    weekSchedules.forEach(s => {
      if (!map[s.studio]) map[s.studio] = [];
      map[s.studio].push(s);
    });
    return map;
  }, [weekSchedules]);

  // Extract unique brands for Legend
  const uniqueBrands = useMemo(() => {
    const brands = new Set<string>();
    weekSchedules.forEach(s => brands.add(s.brand));
    return Array.from(brands);
  }, [weekSchedules]);

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-[#faf9fe] pb-24 w-full text-slate-800 font-sans">
      {/* NEW HEADER DESIGN */}
      <div className="px-2 pt-6 pb-4">
        <div className="flex justify-between items-center mb-1">
          <div>
            <h1 className="text-2xl font-black text-indigo-950 tracking-tight leading-tight">Jadwal Siaran Aktif</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Pantau jadwal live hari ini & minggu ini</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md shrink-0">
            <Video className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="px-2 space-y-4">
        {/* Date Navigator */}
        <div className="bg-white rounded-2xl p-1.5 flex items-center justify-between border border-slate-100 shadow-sm">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100" onClick={onBackClick}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-red-500" />
            <span className="text-[13px] font-bold text-indigo-900">{dayNameFull}, {fullDate}</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Pill */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="bg-white border border-slate-100 px-3 py-2 rounded-[14px] flex items-center gap-2 text-xs font-semibold text-slate-700 shadow-sm whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Semua Host <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
          </button>
          <button className="bg-white border border-slate-100 px-3 py-2 rounded-[14px] flex items-center gap-2 text-xs font-semibold text-slate-700 shadow-sm whitespace-nowrap">
            <Tag className="w-3.5 h-3.5 text-slate-400" /> Semua Brand <ChevronRight className="w-3 h-3 text-slate-400 rotate-90" />
          </button>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-[14px] text-xs font-bold whitespace-nowrap border border-indigo-100 ml-auto">
            {weekSchedules.length} Terdaftar
          </div>
        </div>

        {/* Main Weekly Container (No Outer Card) */}
        <div className="mt-6 mb-4">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-md shrink-0">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-indigo-950 leading-tight">Jadwal Mingguan</h2>
              <div className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5">
                {headerDateRange}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar -mx-2 px-2 pb-4">
            <div className="min-w-[550px]">
              {/* Table Header (Days) */}
              <div className="flex mb-1.5">
                <div className="w-[80px] shrink-0"></div>
                <div className="flex-1 grid grid-cols-7 gap-1">
                  {weekDays.map((wd, i) => {
                    const isActive = wd.dateString === activeDate;
                    return (
                      <button 
                        key={i} 
                        onClick={() => setActiveDate(wd.dateString)}
                        className={`text-center py-2 rounded-t-[14px] transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/80 border-x border-t border-indigo-100/50' : 'bg-transparent'}`}
                      >
                        <div className={`text-[11px] font-bold ${isActive ? 'text-indigo-800' : 'text-slate-500'}`}>{wd.dayName}</div>
                        <div className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{wd.shortDate}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rows (Studios) */}
              <div className="space-y-1.5 relative">
                {Object.entries(studiosMap).map(([studioName, studioSchedules], idx) => {
                  const alias = getStudioAlias(studioName);
                  // Define studio colors based on alias
                  let studioColor = "text-orange-500 bg-orange-50 border-orange-100";
                  if (alias.includes("SBA2")) studioColor = "text-green-500 bg-green-50 border-green-100";
                  else if (alias.includes("SBA3") || alias.includes("ST3")) studioColor = "text-purple-500 bg-purple-50 border-purple-100";
                  else if (alias.includes("SBB1") || alias.includes("SBB")) studioColor = "text-cyan-500 bg-cyan-50 border-cyan-100";
                  
                  return (
                    <div key={idx} className="flex border border-slate-200 rounded-[16px] bg-white items-stretch relative overflow-hidden">
                      {/* Highlight column background overlay */}
                      <div className="absolute inset-y-0 left-[80px] right-0 pointer-events-none flex">
                        <div className="grid grid-cols-7 gap-1 w-full h-full">
                          {weekDays.map((wd, i) => (
                            <div key={i} className={`h-full ${wd.dateString === activeDate ? 'bg-indigo-50/40 border-x border-indigo-100/30' : ''}`} />
                          ))}
                        </div>
                      </div>

                      {/* Left: Studio Info */}
                      <div className="w-[80px] shrink-0 flex flex-col items-center justify-center py-3 px-1 border-r border-slate-100 bg-white z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 border ${studioColor}`}>
                          <Video className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-slate-800 tracking-tight">{alias}</span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">{studioSchedules.length} Shift</span>
                      </div>

                      {/* Right: 7-Day Grid */}
                      <div className="flex-1 grid grid-cols-7 gap-1 p-1 z-10">
                        {weekDays.map((wd, i) => {
                          // Find schedules for this day
                          const daySchedules = studioSchedules.filter(s => s.date === wd.dateString);
                          
                          // Aggregate by brand
                          const brandCounts: Record<string, number> = {};
                          daySchedules.forEach(s => {
                            brandCounts[s.brand] = (brandCounts[s.brand] || 0) + 1;
                          });

                          const brandsList = Object.entries(brandCounts);

                          return (
                            <div key={i} className="flex flex-col gap-1 min-h-[60px] justify-center items-center py-1">
                              {brandsList.length === 0 ? (
                                <div className="w-4 border-t-[1.5px] border-slate-200 rounded-full mt-1"></div>
                              ) : (
                                brandsList.map(([brand, count], bIdx) => {
                                  const color = getBrandColor(brand);
                                  return (
                                    <div key={bIdx} className={`w-full max-w-[50px] ${color.bg} border border-${color.text.replace('text-', '')}/30 rounded-[8px] py-1 px-0.5 flex flex-col items-center justify-center shadow-xs`}>
                                      <span className={`text-[8px] font-black ${color.text} leading-[1.1] text-center w-full break-words truncate px-0.5`}>
                                        {brand.split(' ')[0]}
                                      </span>
                                      <span className={`text-[9px] font-bold ${color.text} mt-[1px] opacity-90`}>
                                        +{count}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
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

        {/* Legend */}
        {uniqueBrands.length > 0 && (
          <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-100 mt-4 mb-8">
            <h3 className="text-[13px] font-bold text-slate-800 mb-3">Legenda Brand</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-3">
              {uniqueBrands.map((brand, i) => {
                const color = getBrandColor(brand);
                let dotColor = "bg-slate-400";
                if (color.bg.includes('orange')) dotColor = "bg-orange-500";
                else if (color.bg.includes('blue')) dotColor = "bg-blue-500";
                else if (color.bg.includes('green')) dotColor = "bg-green-500";
                else if (color.bg.includes('red')) dotColor = "bg-red-500";
                else if (color.bg.includes('purple')) dotColor = "bg-purple-500";
                else if (color.bg.includes('cyan')) dotColor = "bg-cyan-500";
                else if (color.bg.includes('pink')) dotColor = "bg-pink-500";

                return (
                  <div key={i} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-full border border-slate-100">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                    <span className="text-[10px] font-bold text-slate-700 capitalize">{brand}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

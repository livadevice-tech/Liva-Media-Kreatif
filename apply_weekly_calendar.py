import re

with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add currentWeekStart state
state_target = r"const \[selectedDate, setSelectedDate\] = useState<string \| null>\(\(\) => \{[^}]+\}\);"
state_replace = """const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Start on Sunday
    return d;
  });"""
content = re.sub(state_target, state_replace, content)

# 2. Replace Kalender tab content
# Need to find the block for kalender tab.
# Starts at: {/* --- TAB CONTENT: KALENDER --- */}
# Ends before: return ( inside HostDashboard? No, it's inside the main return.
# Let's use a regex to match from `{activeTab === 'kalender' && (` down to its closing `)}`
# Wait, parsing brackets in regex is hard. Let's just find the start and end manually.

lines = content.split('\n')
start_idx = -1
end_idx = -1
nested = 0
for i, line in enumerate(lines):
    if "{activeTab === 'kalender' && (" in line:
        start_idx = i
        nested = 1
        continue
    if start_idx != -1:
        nested += line.count('(') - line.count(')')
        if nested == 0:
            end_idx = i
            break

weekly_calendar_code = """      {activeTab === 'kalender' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-purple-50 rounded-[20px] p-4 border border-purple-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black tracking-wider text-purple-900 mb-1 uppercase">Jadwal Siaran & Libur (Mingguan)</h3>
              <p className="text-[11px] font-bold text-purple-700">Jadwal penempatan studio, brand, dan jam shift dalam tampilan mingguan.</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Header / Navigasi */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-black text-purple-950 flex items-center gap-2">
                <CalendarIcon size={20} className="text-purple-500" />
                {(() => {
                  const end = new Date(currentWeekStart);
                  end.setDate(end.getDate() + 6);
                  const formatOpt = { month: 'short', year: 'numeric' } as const;
                  return `${currentWeekStart.toLocaleDateString('id-ID', { day: 'numeric', ...formatOpt })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', ...formatOpt })}`;
                })()}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() - 7);
                    setCurrentWeekStart(d);
                  }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors"
                >&lt;</button>
                <button 
                  onClick={() => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() - d.getDay());
                    setCurrentWeekStart(d);
                  }}
                  className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-black uppercase cursor-pointer transition-colors"
                >Minggu Ini</button>
                <button 
                  onClick={() => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() + 7);
                    setCurrentWeekStart(d);
                  }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors"
                >&gt;</button>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-xl relative bg-slate-50">
              <div className="min-w-[800px] h-full flex flex-col">
                
                {/* Days Header */}
                <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20">
                  <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() + i);
                    const isToday = new Date().toDateString() === d.toDateString();
                    return (
                      <div key={i} className={`flex-1 min-w-0 py-3 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-purple-50/50' : ''}`}>
                        <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>
                          {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-black ${isToday ? 'text-purple-700' : 'text-slate-700'}`}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Grid (Scrollable Y) */}
                <div className="relative flex-1 bg-white">
                  {/* Time Labels (Y-Axis) */}
                  <div className="absolute top-0 bottom-0 left-0 w-16 bg-white border-r border-slate-200 z-10 flex flex-col">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-16 flex items-start justify-center text-[10px] font-bold text-slate-400 pt-1">
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Grid Lines */}
                  <div className="absolute top-0 bottom-0 left-16 right-0 flex flex-col pointer-events-none z-0">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-16 border-b border-slate-100 border-dashed w-full"></div>
                    ))}
                  </div>

                  {/* Events Container */}
                  <div className="absolute top-0 bottom-0 left-16 right-0 flex z-10">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const d = new Date(currentWeekStart);
                      d.setDate(d.getDate() + dayIndex);
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      
                      const daySchedules = hostSchedules.filter(s => s.date === dateStr);
                      const isToday = new Date().toDateString() === d.toDateString();

                      return (
                        <div key={dayIndex} className={`flex-1 relative min-w-0 border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-purple-50/20' : ''}`}>
                          {/* Current Time Indicator (if today) */}
                          {isToday && (
                            <div 
                              className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                              style={{ top: `${(currentTime.getHours() + currentTime.getMinutes() / 60) * 4}rem` }}
                            >
                              <div className="w-2 h-2 rounded-full bg-red-400 absolute -left-1 -top-[5px]"></div>
                            </div>
                          )}

                          {/* Event Blocks */}
                          {daySchedules.map((schedule, idx) => {
                            let startHour = 8;
                            let endHour = 12;
                            const match = schedule.timeSlot?.match(/\\((\\d{2}):\\d{2}\\s*-\\s*(\\d{2}):\\d{2}\\)/);
                            if (match) {
                              startHour = parseInt(match[1], 10);
                              endHour = parseInt(match[2], 10);
                              if (endHour <= startHour) endHour += 24; 
                            }
                            // Calculate top and height in REM (1 hour = 4rem = h-16)
                            const top = startHour * 4;
                            const height = (endHour - startHour) * 4;
                            const brandColor = getBrandColor(schedule.brandHandled || schedule.brand);

                            return (
                              <div 
                                key={idx}
                                className={`absolute left-1 right-1 rounded-lg border p-2 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-purple-400 transition-all ${brandColor.bg.replace('bg-', 'bg-opacity-20 bg-')}`}
                                style={{ 
                                  top: `${top}rem`, 
                                  height: `${height}rem`,
                                  backgroundColor: 'var(--tw-bg-opacity, 1)', // Fallback, will rely on classes
                                }}
                              >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${brandColor.bg}`}></div>
                                <div className="pl-1 flex flex-col h-full">
                                  <div className="text-[10px] font-black text-slate-800 leading-tight mb-0.5 truncate">
                                    {schedule.brandHandled || schedule.brand}
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-500 mb-1 truncate">
                                    {schedule.timeSlot?.match(/\\((.*?)\\)/)?.[1] || schedule.shift}
                                  </div>
                                  {height >= 6 && (
                                    <>
                                      <div className="text-[9px] font-bold text-slate-600 flex items-center gap-1 mt-auto truncate">
                                        <MapPin size={10} className="text-slate-400 flex-shrink-0"/> <span className="truncate">{schedule.studio}</span>
                                      </div>
                                      <div className="text-[9px] font-bold text-slate-600 flex items-center gap-1 truncate">
                                        <User size={10} className="text-slate-400 flex-shrink-0"/> <span className="truncate">{schedule.platform}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
              <h4 className="text-[10px] font-black text-purple-900 w-full mb-1">Keterangan Warna Brand:</h4>
              {uniqueBrands.map((brand) => {
                const colorObj = getBrandColor(brand);
                return (
                  <div key={brand} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorObj.bg} border ${colorObj.border}`}></div>
                    <span className="text-[9px] font-bold text-slate-600">{brand}</span>
                  </div>
                );
              })}
              {uniqueBrands.length === 0 && (
                <span className="text-[10px] font-bold text-slate-400">Belum ada jadwal terdaftar</span>
              )}
            </div>
          </div>
        </div>
      )}"""

if start_idx != -1 and end_idx != -1:
    lines = lines[:start_idx] + [weekly_calendar_code] + lines[end_idx+1:]
    with open('src/components/host/HostDashboard.tsx', 'w') as f:
        f.write('\n'.join(lines))
else:
    print("Could not find calendar tab block")


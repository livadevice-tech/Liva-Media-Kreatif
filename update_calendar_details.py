import re

with open('src/components/host/HostDashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add selectedDate state
state_target = r"const \[currentTime, setCurrentTime\] = useState\(new Date\(\)\);"
state_replace = """const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });"""
content = re.sub(state_target, state_replace, content)

# 2. Update renderCalendarDays to make dates clickable
render_target = r"return \(\s*<div key=\{day\} className=\{`py-1\.5 rounded-lg text-xs flex items-center justify-center \$\{style\}`\}>\s*\{day\}\s*</div>\s*\);"
render_replace = """return (
        <div key={day} onClick={() => setSelectedDate(dateStr)} className={`py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all ${style} ${selectedDate === dateStr ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 z-10' : ''}`}>
          {day}
        </div>
      );"""
content = re.sub(render_target, render_replace, content)

# 3. Add details view at the bottom of Kalender tab
details_target = r"\{\s*uniqueBrands\.length === 0 && \(\s*<span className=\"text-\[10px\] font-bold text-slate-400\">Belum ada jadwal yang terdaftar</span>\s*\)\s*\}\s*</div>\s*</div>"
details_replace = """{uniqueBrands.length === 0 && (
                  <span className="text-[10px] font-bold text-slate-400">Belum ada jadwal yang terdaftar</span>
                )}
              </div>
            </div>

            {selectedDate && (
              <div className="mt-6 border-t border-slate-200 pt-6 animate-fadeIn">
                <h4 className="text-xs font-black text-purple-900 mb-4 uppercase flex items-center gap-2">
                  <CalendarIcon size={14} className="text-purple-500" />
                  Jadwal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                {(() => {
                  const daySchedules = hostSchedules.filter(s => s.date === selectedDate);
                  if (daySchedules.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-slate-500">Tidak ada jadwal pada tanggal ini.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col gap-3">
                      {daySchedules.map((schedule, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${getBrandColor(schedule.brandHandled || schedule.brand).bg}`}></div>
                          <div className="flex justify-between items-start pl-2">
                            <span className="text-xs font-black text-slate-900">{schedule.brandHandled || schedule.brand}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">{schedule.shift || schedule.shiftHours}</span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-600 flex flex-wrap gap-x-4 gap-y-2 pl-2 mt-1">
                            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/> {schedule.studio}</div>
                            <div className="flex items-center gap-1.5"><User size={12} className="text-slate-400"/> {schedule.platform}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}"""
content = re.sub(details_target, details_replace, content)

with open('src/components/host/HostDashboard.tsx', 'w') as f:
    f.write(content)

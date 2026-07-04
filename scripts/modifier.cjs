const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = code.split('\n');

// Find where I started putting the mock calendar
const startIdx = lines.findIndex(l => l.includes("{/* Calendar View UI Replacement */}"));
const endIdx = lines.findIndex(l => l.includes("{/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}"));

if (startIdx !== -1 && endIdx !== -1) {
    const calendarLogic = `
                {/* CALENDAR VIEW UNTUK JADWAL HOST */}
                <div className="bg-[#fafafc] w-full font-sans">
                  <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-150">
                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-1 leading-none tracking-tight flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-[#2563eb]" /> 
                          Jadwal Host
                        </h2>
                        <p className="text-[13px] text-slate-500 font-medium">Manajemen Jadwal Siaran (Roster) Seluruh Host</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                           {hosts.slice(0, 4).map((h, i) => (
                             <div key={h.id} className="w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-bold z-30 shadow-sm" style={{ backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0') + '40', color: '#1e293b' }}>
                               {h.name.substring(0, 2).toUpperCase()}
                             </div>
                           ))}
                           {hosts.length > 4 && (
                             <div className="w-8 h-8 rounded-full bg-slate-50 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">
                               +{hosts.length - 4}
                             </div>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Tabs & Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 border-b border-slate-100/80 pb-4">
                       <div className="flex items-center gap-2.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar -mb-[17px]">
                          <button className="px-3 py-2.5 rounded-none border-b-2 border-slate-800 text-slate-800 font-bold text-[13px] flex items-center gap-2 whitespace-nowrap">
                            <Calendar className="w-4 h-4" strokeWidth={2.5} /> Jadwal Aktif
                          </button>
                          <button 
                            onClick={() => {
                              // Trigger auto fill shift
                              setOperatorTab("auto_fill_roster"); // just an example or we can do nothing
                            }}
                            className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-slate-400 font-bold text-[13px] flex items-center gap-2 hover:text-slate-600 transition-colors whitespace-nowrap">
                            <Sparkles className="w-4 h-4" strokeWidth={2.5} /> Auto Generate
                          </button>
                       </div>
                       <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar">
                          <button 
                             onClick={() => {
                               // Open generic create modal
                               setIsScheduleModalOpen(true);
                               setScheduleForm({
                                  id: "",
                                  hostId: hosts[0]?.id || "",
                                  timeSlot: shifts[0] || "",
                                  brand: brands[0] || "",
                                  platform: platforms[0] || "",
                                  studio: studios[0]?.name || "",
                                  isOffDay: false,
                                  isPindahStudio: false,
                                  backupOption: "none",
                                  backupHostId: ""
                               });
                             }}
                             className="px-4 py-2 bg-[#1e1b2e] hover:bg-[#2c2844] border-0 rounded-xl text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-sm">
                            <Plus className="w-4 h-4" /> Entry Manual Baru
                          </button>
                       </div>
                    </div>

                    {/* Calendar Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 p-2">
                       <div className="flex items-center gap-4">
                         <h3 className="text-xl font-bold text-slate-800 capitalize">
                           {(()=>{
                             const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                             return \`\${monthNames[calendarMonth]} \${calendarYear}\`;
                           })()}
                         </h3>
                         <button 
                           onClick={() => {
                             const now = new Date();
                             setCalendarMonth(now.getMonth());
                             setCalendarYear(now.getFullYear());
                           }}
                           className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                           Hari Ini
                         </button>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                          <button
                            onClick={() => {
                              if (calendarMonth === 0) {
                                setCalendarMonth(11);
                                setCalendarYear(y => y - 1);
                              } else {
                                setCalendarMonth(m => m - 1);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => {
                              if (calendarMonth === 11) {
                                setCalendarMonth(0);
                                setCalendarYear(y => y + 1);
                              } else {
                                setCalendarMonth(m => m + 1);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Main Monthly Calendar Layout (Modern & Clean) */}
                    <div className="border border-slate-100/80 rounded-[16px] overflow-hidden bg-white shadow-xs">
                      {/* Weekday Titles Header */}
                      <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                        {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((dayName, idx) => (
                           <div key={dayName} className="py-4 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center">
                             <span className={\`text-[10px] font-extrabold uppercase tracking-wider mb-1 \${idx === 0 ? "text-red-500" : "text-slate-400"}\`}>
                               {dayName}
                             </span>
                           </div>
                        ))}
                      </div>

                      {/* Calendar Grid Body */}
                      <div className="grid grid-cols-7 bg-slate-50 gap-px">
                        {(() => {
                           const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                           const offset = new Date(calendarYear, calendarMonth, 1).getDay();
                           
                           const cells = [];
                           // Fill initial blanks
                           for (let i = 0; i < offset; i++) {
                             cells.push(<div key={\`blank-\${i}\`} className="bg-slate-50/40 min-h-[140px]" />);
                           }
                           
                           // Fill actual days
                           for (let i = 1; i <= daysInMonth; i++) {
                             const dateString = \`\${calendarYear}-\${String(calendarMonth + 1).padStart(2, '0')}-\${String(i).padStart(2, '0')}\`;
                             const daySchedules = computedSchedules.filter(s => s.date === dateString);
                             const isSelected = selectedCalendarDate === dateString;
                             const isToday = (new Date().toISOString().split('T')[0]) === dateString;
                             
                             cells.push(
                               <div
                                 key={i}
                                 onClick={() => {
                                   setSelectedCalendarDate(dateString);
                                   setIsScheduleModalOpen(true);
                                   setScheduleForm({
                                     id: "",
                                     hostId: hosts[0]?.id || "",
                                     timeSlot: shifts[0] || "",
                                     brand: brands[0] || "",
                                     platform: platforms[0] || "",
                                     studio: studios[0]?.name || "",
                                     isOffDay: false,
                                     isPindahStudio: false,
                                     backupOption: "none",
                                     backupHostId: ""
                                   });
                                 }}
                                 className={\`min-h-[140px] p-2.5 transition-all flex flex-col justify-start cursor-pointer group bg-white \${
                                   isSelected ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/10" : "hover:bg-slate-50"
                                 }\`}
                               >
                                 <div className="flex justify-between items-center mb-2">
                                   <span className={\`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold \${
                                     isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                                   }\`}>
                                     {i}
                                   </span>
                                   {daySchedules.length > 0 && (
                                     <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-500">
                                       {daySchedules.length} Sesi
                                     </span>
                                   )}
                                 </div>
                                 
                                 <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[100px] hide-scrollbar">
                                   {daySchedules.slice(0,4).map((sch) => {
                                      // Assign pastel colors based on shift or brand
                                      const colorNum = sch.timeSlot.charCodeAt(0) % 5;
                                      const colorClasses = [
                                        "bg-[#f3e8ff] border-[#d8b4fe] text-[#6b21a8]",
                                        "bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1]",
                                        "bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]",
                                        "bg-[#ffedd5] border-[#fdba74] text-[#c2410c]",
                                        "bg-[#fce7f3] border-[#fbcfe8] text-[#be185d]"
                                      ][colorNum];
                                      
                                      const isOff = sch.isOffDay;
                                      
                                      if (isOff) {
                                        return (
                                          <div key={sch.id} className="text-[9px] font-bold px-1.5 py-1 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate">
                                            🏖️ {sch.hostName} Off
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={sch.id} className={\`text-[9px] font-bold px-1.5 py-1 rounded border-l-[3px] truncate \${colorClasses}\`} title={\`\${sch.hostName} - \${sch.timeSlot}\`}>
                                          {sch.hostName} • {sch.studio.split(' ')[0]}
                                        </div>
                                      );
                                   })}
                                   {daySchedules.length > 4 && (
                                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                                        + {daySchedules.length - 4} lainnya
                                      </div>
                                   )}
                                 </div>
                               </div>
                             );
                           }
                           
                           // Fill trailing blanks to complete the grid nicely
                           const totalCells = cells.length;
                           const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                           for (let i = 0; i < remaining; i++) {
                             cells.push(<div key={\`blank-end-\${i}\`} className="bg-slate-50/40 min-h-[140px]" />);
                           }
                           
                           return cells;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
`;
    // Insert back in
    lines.splice(startIdx, endIdx - startIdx, calendarLogic.trimEnd() + '\n');
    fs.writeFileSync('src/App.tsx', lines.join('\n'));
    console.log("Success! Replaced mock with functional and styled host schedule.");
} else {
    console.log("Could not find bounds", startIdx, endIdx);
}

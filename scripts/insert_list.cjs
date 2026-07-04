const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const listCode = `
                        {/* JADWAL TERDAFTAR SEBELUMNYA PADA HARI INI */}
                        <div className="space-y-3 mt-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4 flex-wrap gap-2">
                            <h5 className="text-[14px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                              <span>📋</span> Jadwal Siaran Aktif Tanggal Ini
                            </h5>
                            <div className="flex items-center gap-3">
                              <div className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                                {(()=>{
                                  try {
                                    const d = new Date(selectedCalendarDate);
                                    if(isNaN(d.getTime())) return selectedCalendarDate;
                                    return d.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                  } catch (e) {
                                    return selectedCalendarDate;
                                  }
                                })()}
                              </div>
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Cari host/brand..."
                                  value={scheduleModalSearch}
                                  onChange={(e) => setScheduleModalSearch(e.target.value)}
                                  className="w-[180px] bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold"
                                />
                              </div>
                              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-700">
                                {computedSchedules.filter(s => s.date === selectedCalendarDate).length} Terdaftar
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {(() => {
                              let dayScheds = computedSchedules.filter(s => s.date === selectedCalendarDate);
                              
                              if (scheduleModalSearch.trim()) {
                                const q = scheduleModalSearch.toLowerCase();
                                dayScheds = dayScheds.filter(s => 
                                  s.hostName?.toLowerCase().includes(q) || 
                                  s.brand?.toLowerCase().includes(q) || 
                                  s.platform?.toLowerCase().includes(q) ||
                                  s.studio?.toLowerCase().includes(q)
                                );
                              }

                              const timeRegex = /\\b(\\d{2}:\\d{2})\\b/;
                              dayScheds.sort((a, b) => {
                                const matchA = (a.timeSlot || "").match(timeRegex);
                                const matchB = (b.timeSlot || "").match(timeRegex);
                                const timeA = matchA ? matchA[1] : a.timeSlot;
                                const timeB = matchB ? matchB[1] : b.timeSlot;
                                
                                if (timeA < timeB) return -1;
                                if (timeA > timeB) return 1;
                                return 0;
                              });

                              if (dayScheds.length === 0) {
                                return (
                                  <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    {scheduleModalSearch ? "Tidak ada jadwal yang sesuai pencarian." : "Belum ada jadwal terdaftar untuk tanggal yang dipilih."}
                                  </div>
                                );
                              }

                              const uniqueScheds = Array.from(new Map(dayScheds.map(s => [s.id, s])).values());
                              
                              return uniqueScheds.map((sch) => {
                                const isOff = sch.isOffDay;
                                return (
                                  <div 
                                    key={sch.id}
                                    className={\`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm \${
                                      isOff 
                                        ? "bg-amber-50/50 border-amber-200" 
                                        : sch.backupHostId 
                                        ? "bg-emerald-50/40 border-emerald-250" 
                                        : "bg-slate-50/45 border-slate-100"
                                    }\`}
                                  >
                                    <div>
                                      <div className="font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                                        <span className="text-xs bg-slate-200 font-mono text-slate-700 px-2 py-1 rounded leading-none">
                                          {sch.timeSlot}
                                        </span>
                                        <span className="text-base text-slate-800">{sch.hostName}</span>
                                        <span className="text-[11px] text-slate-400 font-mono font-medium">({sch.employeeId})</span>
                                      </div>
                                      
                                      <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                                        🛍️ Brand: <b>{sch.brand}</b> ({sch.platform}) <span className="text-slate-300">•</span> 🏢 {sch.studio}
                                      </div>

                                      {isOff && (
                                        <div className="text-xs text-amber-900 font-extrabold mt-1.5">
                                          🏖️ Off-Day Reguler — Di-backup Backup Host: <span className="underline text-amber-950">{sch.backupHostName || "Belum ditentukan"}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action button edit/delete */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsScheduleModalOpen(true);
                                          setScheduleForm({
                                            id: sch.id,
                                            hostId: sch.hostId,
                                            timeSlot: sch.timeSlot,
                                            brand: sch.brand,
                                            platform: sch.platform,
                                            studio: sch.studio,
                                            isOffDay: sch.isOffDay || false,
                                            isPindahStudio: sch.isPindahStudio || false,
                                            backupOption: sch.backupHostId ? 'backup' : 'none',
                                            backupHostId: sch.backupHostId || ""
                                          });
                                        }}
                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer flex items-center gap-1"
                                        title="Ubah Jadwal"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: "Hapus Jadwal",
                                            message: \`Menghapus jadwal referensi \${sch.hostName} pada tanggal \${sch.date}?\`,
                                            type: "danger",
                                            confirmText: "Hapus",
                                            onConfirm: () => {
                                              setSchedules(prev => prev.filter(s => s.id !== sch.id));
                                              setConfirmModal(null);
                                            }
                                          });
                                        }}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer flex items-center gap-1"
                                        title="Hapus Jadwal"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
`;

const insertMarker = '{/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}';
const insertIdx = code.indexOf(insertMarker);

if (insertIdx !== -1) {
  code = code.substring(0, insertIdx) + listCode + '\n                ' + code.substring(insertIdx);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Success inserting list code.");
} else {
  console.log("Marker not found.");
}

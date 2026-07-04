const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetDetails = `                    // Let's filter host schedules
                    {(()=>{
                      const myAllScheds = computedSchedules.filter(s => s.hostId === loggedInHostId || s.backupHostId === loggedInHostId);
                      if (myAllScheds.length === 0) {
                        return (
                          <div className="text-center py-6 text-purple-400 font-mono text-[10px] italic bg-white rounded-xl border border-purple-50">
                            Belum ada jadwal yang di-assign untuk Anda.
                          </div>
                        );
                      }
                      
                      // Sort by date ascending
                      const sortedScheds = [...myAllScheds].sort((a,b) => a.date.localeCompare(b.date));
                      
                      return sortedScheds.map(sch => {
                        const isPrimaryOff = sch.isOffDay && sch.hostId === loggedInHostId;
                        const isReplacement = sch.backupHostId === loggedInHostId;
                        
                        return (
                          <div 
                            key={sch.id} 
                            className={\`p-3 rounded-xl border transition-all \${
                              isPrimaryOff 
                                ? "bg-amber-50/70 border-amber-200 text-amber-950 shadow-3xs" 
                                : isReplacement 
                                ? "bg-emerald-50/75 border-emerald-200 text-emerald-950 shadow-3xs" 
                                : "bg-purple-50/35 border-purple-100/65 text-purple-950"
                            }\`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black tracking-wide uppercase font-mono">
                                📅 {sch.date}
                              </span>
                              <span className={\`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide \${
                                isPrimaryOff 
                                  ? "bg-amber-100 text-amber-800 border border-amber-300" 
                                  : isReplacement 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-350" 
                                  : "bg-purple-100 text-purple-800 border border-purple-250"
                              }\`}>
                                {isPrimaryOff ? "HARI LIBUR" : isReplacement ? "MASUK BACKUP" : "MASUK KERJA"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[11px] font-sans mt-2">
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Shift:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.timeSlot}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Brand:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.brand} ({sch.platform})</span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-purple-50/50 mt-1">
                                <span className="text-[9px] text-indigo-400/80 block uppercase font-bold tracking-wider font-mono">Penempatan Studio:</span>
                                <span className="font-black text-xs text-indigo-950">
                                  🏢 {sch.studio || "Studio Utama Lampung"}
                                </span>
                              </div>
                            </div>

                            {/* Additional Info about regular host off / backup replacement */}
                            {isPrimaryOff && (
                              <div className="mt-2.5 p-2 bg-white/70 border border-amber-200/50 rounded-lg text-[9.5px] text-amber-900 font-bold leading-relaxed shadow-3xs">
                                ℹ️ Hari libur reguler Anda. Tugas siaran Anda diisi oleh backup partner: <b className="text-amber-950 underline font-black">{sch.backupHostName || "Belum Ditentukan"}</b>.
                              </div>
                            )}

                            {isReplacement && (
                              <div className="mt-2.5 p-2 bg-white/70 border border-emerald-200/50 rounded-lg text-[9.5px] text-emerald-900 font-bold leading-relaxed shadow-3xs">
                                🤝 Anda ditugaskan masuk siaran menggantikan host reguler <b className="text-emerald-950 underline font-extrabold">{sch.hostName}</b> yang sedang libur.
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}`;

const replacementDetails = `                    {/* Let's filter host schedules */}
                    {(()=>{
                      const myAllScheds = computedSchedules.filter(s => s.hostId === loggedInHostId);
                      if (myAllScheds.length === 0) {
                        return (
                          <div className="text-center py-6 text-pink-400 font-mono text-[10px] italic bg-white rounded-xl border border-pink-50">
                            Belum ada jadwal yang di-assign untuk Anda.
                          </div>
                        );
                      }
                      
                      // Sort by date ascending
                      const sortedScheds = [...myAllScheds].sort((a,b) => a.date.localeCompare(b.date));
                      
                      return sortedScheds.map(sch => {
                        return (
                          <div 
                            key={sch.id} 
                            className="p-3 rounded-xl border transition-all bg-purple-50/35 border-purple-100/65 text-purple-950"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black tracking-wide uppercase font-mono">
                                📅 {sch.date}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-250">
                                MASUK KERJA
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[11px] font-sans mt-2">
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Shift:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.timeSlot}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Brand:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.brand} ({sch.platform})</span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-purple-50/50 mt-1">
                                <span className="text-[9px] text-indigo-400/80 block uppercase font-bold tracking-wider font-mono">Penempatan Studio:</span>
                                <span className="font-black text-xs text-indigo-950">
                                  🏢 {sch.studio || "Studio Utama Lampung"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}`;

if(code.indexOf('const myAllScheds = computedSchedules.filter(s => s.hostId === loggedInHostId || s.backupHostId === loggedInHostId);') !== -1) {
    code = code.replace(targetDetails, replacementDetails);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Replaced host details!");
} else {
    console.log("Not replaced.");
}

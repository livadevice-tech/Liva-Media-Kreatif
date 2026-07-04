const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const target1 = `                                   <div className="flex items-center gap-1">
                                     <button
                                       type="button"
                                       className="hidden group-hover:flex items-center justify-center w-6 h-6 bg-indigo-100 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-full transition-colors z-10 cursor-pointer"
                                       onClick={(e) => {
                                          e.stopPropagation();
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
                                       title="Tambah Jadwal"
                                     >
                                       <Plus className="w-3.5 h-3.5" />
                                     </button>
                                     {daySchedules.length > 0 && (
                                       <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-500">
                                         {daySchedules.length} Sesi
                                       </span>
                                     )}
                                   </div>`;

const repl1 = `                                   <div className="flex items-center gap-1">
                                     {daySchedules.length > 0 && (
                                       <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-500">
                                         {daySchedules.length} Sesi
                                       </span>
                                     )}
                                   </div>`;

code = code.replace(target1, repl1);

const target2 = `                                   {daySchedules.length > 4 && (
                                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                                        + {daySchedules.length - 4} lainnya
                                      </div>
                                   )}
                                 </div>
                               </div>`;

const repl2 = `                                   {daySchedules.length > 4 && (
                                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                                        + {daySchedules.length - 4} lainnya
                                      </div>
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   className="hidden group-hover:flex absolute bottom-2 right-2 items-center justify-center w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-full transition-all z-10 cursor-pointer"
                                   onClick={(e) => {
                                      e.stopPropagation();
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
                                   title="Tambah Jadwal"
                                 >
                                   <Plus className="w-4 h-4" />
                                 </button>
                               </div>`;

code = code.replace(target2, repl2);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed!");

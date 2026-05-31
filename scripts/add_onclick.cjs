const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetOff = `                                              if (isOff) {
                                                return (
                                                  <div key={sch.id} className="text-[8.5px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate">
                                                    🏖️ {sch.hostName} Off
                                                  </div>
                                                );
                                              }`;

const replacementOff = `                                              if (isOff) {
                                                return (
                                                  <div 
                                                    key={sch.id} 
                                                    onClick={(e) => { 
                                                      e.stopPropagation(); 
                                                      setIsScheduleModalOpen(true); 
                                                      setSelectedCalendarDate(sch.date);
                                                      setScheduleForm({
                                                        id: sch.id,
                                                        hostId: sch.hostId,
                                                        timeSlot: sch.timeSlot,
                                                        brand: sch.brand,
                                                        platform: sch.platform,
                                                        studio: sch.studio,
                                                        isOffDay: sch.isOffDay || false,
                                                        isPindahStudio: sch.isPindahStudio || false,
                                                        backupOption: sch.isPindahStudio || sch.isOffDay ? (sch.backupHostId ? "other" : "none") : "none",
                                                        backupHostId: sch.backupHostId || ""
                                                      }); 
                                                    }}
                                                    className="cursor-pointer hover:bg-slate-200 text-[8.5px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate">
                                                    🏖️ {sch.hostName} Off
                                                  </div>
                                                );
                                              }`;
                                              
const targetReg = `                                              return (
                                                <div key={sch.id} className={\`text-[8.5px] font-bold px-1 py-0.5 rounded border-l-[3px] truncate \${colorClasses}\`} title={\`\${sch.hostName} - \${sch.timeSlot}\`}>
                                                  {sch.hostName}
                                                </div>
                                              );`;

const replacementReg = `                                              return (
                                                <div 
                                                  key={sch.id} 
                                                  onClick={(e) => { 
                                                      e.stopPropagation(); 
                                                      setIsScheduleModalOpen(true); 
                                                      setSelectedCalendarDate(sch.date);
                                                      setScheduleForm({
                                                        id: sch.id,
                                                        hostId: sch.hostId,
                                                        timeSlot: sch.timeSlot,
                                                        brand: sch.brand,
                                                        platform: sch.platform,
                                                        studio: sch.studio,
                                                        isOffDay: sch.isOffDay || false,
                                                        isPindahStudio: sch.isPindahStudio || false,
                                                        backupOption: sch.isPindahStudio || sch.isOffDay ? (sch.backupHostId ? "other" : "none") : "none",
                                                        backupHostId: sch.backupHostId || ""
                                                      }); 
                                                  }}
                                                  className={\`cursor-pointer text-[8.5px] font-bold px-1 py-0.5 rounded border-l-[3px] truncate hover:brightness-95 \${colorClasses}\`} 
                                                  title={\`\${sch.hostName} - \${sch.timeSlot}\`}
                                                >
                                                  {sch.hostName}
                                                </div>
                                              );`;

code = code.replace(targetOff, replacementOff);
code = code.replace(targetReg, replacementReg);

fs.writeFileSync('src/App.tsx', code);
console.log('Added onClick to schedules.');

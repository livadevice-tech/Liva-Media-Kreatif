const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Group by Studio in Operator Calendar
const opCalRegex = /<div className="flex-1 space-y-1\.5 overflow-y-auto max-h-\[100px\] hide-scrollbar">[\s\S]*?\{daySchedules\.length > 4 && \([\s\S]*?\} lainnya\s*<\/div>\s*\)\}\s*<\/div>/;

const replacementOpCal = `<div className="flex-1 space-y-1.5 overflow-y-auto max-h-[100px] hide-scrollbar">
                                   {(()=>{
                                     const groupedSchedules = {};
                                     daySchedules.forEach(sch => {
                                       const stdName = (sch.studio || "Studio Bandar Lampung").split(' ')[0];
                                       if (!groupedSchedules[stdName]) groupedSchedules[stdName] = [];
                                       groupedSchedules[stdName].push(sch);
                                     });

                                     return Object.entries(groupedSchedules).slice(0, 3).map(([stdName, scheds]) => (
                                       <div key={stdName} className="mb-1.5 last:mb-0 bg-slate-50 rounded p-1 border border-slate-100">
                                         <div className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-wider">{stdName}</div>
                                         <div className="space-y-1">
                                           {scheds.slice(0, 4).map((sch) => {
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
                                                  <div key={sch.id} className="text-[8.5px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate">
                                                    🏖️ {sch.hostName} Off
                                                  </div>
                                                );
                                              }

                                              return (
                                                <div key={sch.id} className={\`text-[8.5px] font-bold px-1 py-0.5 rounded border-l-[3px] truncate \${colorClasses}\`} title={\`\${sch.hostName} - \${sch.timeSlot}\`}>
                                                  {sch.hostName}
                                                </div>
                                              );
                                           })}
                                           {scheds.length > 4 && (
                                              <div className="text-[8px] font-bold text-slate-400">
                                                + {scheds.length - 4} host
                                              </div>
                                           )}
                                         </div>
                                       </div>
                                     ));
                                   })()}
                                   {Object.keys(daySchedules.reduce((acc, sch) => {
                                       const stdName = (sch.studio || "Studio Bandar Lampung").split(' ')[0];
                                       acc[stdName] = true;
                                       return acc;
                                    }, {})).length > 3 && (
                                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                                        + studio lainnya
                                      </div>
                                   )}
                                 </div>`;

code = code.replace(opCalRegex, replacementOpCal);

fs.writeFileSync('src/App.tsx', code);
console.log('Done replacement 1');

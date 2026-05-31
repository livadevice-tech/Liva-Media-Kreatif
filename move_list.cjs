const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove setIsScheduleModalOpen(true) and setScheduleForm from calendar cell onClick
const cellOnClickRegex = /onClick=\{\(\) \=\> \{\s*setSelectedCalendarDate\(dateString\);\s*setIsScheduleModalOpen\(true\);\s*setScheduleForm\(\{\s*id: "",\s*hostId: hosts\[0\]\?\.id \|\| "",\s*timeSlot: shifts\[0\] \|\| "",\s*brand: brands\[0\] \|\| "",\s*platform: platforms\[0\] \|\| "",\s*studio: studios\[0\]\?\.name \|\| "",\s*isOffDay: false,\s*isPindahStudio: false,\s*backupOption: "none",\s*backupHostId: ""\s*\}\);\s*\}\}/g;

code = code.replace(cellOnClickRegex, 'onClick={() => setSelectedCalendarDate(dateString)}');

// 2. Extract the list UI
const listStartMatch = "{/* JADWAL TERDAFTAR SEBELUMNYA PADA HARI INI */}";
const startIdx = code.indexOf(listStartMatch);
const listEndMatch = "{/* FORM MASUKKAN DATA HOST & BACKUP */}";
const endIdx = code.indexOf(listEndMatch);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find list boundary");
  process.exit(1);
}

let listCode = code.substring(startIdx, endIdx);

// We need to adjust layout since it's no longer inside modal (max-h-[240px] etc)
listCode = listCode.replace('max-h-[240px]', ''); // remove max height
listCode = listCode.replace('overflow-y-auto', '');

// Wait, the edit button logic:
//                                         onClick={() => {
//                                           setScheduleForm({ ... });
//                                           setTimeout(() => {
//                                             document.getElementById("schedule_form_section")?.scrollIntoView({ behavior: "smooth", block: "start" });
//                                           }, 50);
//                                         }}
// Needs to ALSO open the modal!
listCode = listCode.replace(
  'setScheduleForm({',
  'setIsScheduleModalOpen(true);\n                                          setScheduleForm({'
);


// Remove from the modal
code = code.substring(0, startIdx) + code.substring(endIdx);


const calendarEndStr = `                            return cells;
                        })()}
                      </div>
                    </div>`;

const appendIdx = code.indexOf(calendarEndStr);
if (appendIdx !== -1) {
  const insertionPoint = appendIdx + calendarEndStr.length;
  // Let's add the selected date representation so we know which date we are looking at!
  const listHeaderExtras = `
                      <div className="mb-4 text-center">
                         <h3 className="text-lg font-bold text-slate-800">
                           {(()=>{
                             const d = new Date(selectedCalendarDate);
                             if(isNaN(d.getTime())) return selectedCalendarDate;
                             return d.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                           })()}
                         </h3>
                      </div>
  `;
  const toInsert = `
                    
                    {/* --- DAFTAR JADWAL HARIAN (DIPINDAH DARI MODAL) --- */}
                    <div className="mt-8 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">` + 
                      listHeaderExtras + 
                      listCode + `
                    </div>`;
  code = code.substring(0, insertionPoint) + toInsert + code.substring(insertionPoint);
} else {
    console.log("Could not find calendar end");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Done extracting list.");

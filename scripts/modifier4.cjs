const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Step 1: Extract the List
const listStartMarker = '{/* JADWAL TERDAFTAR SEBELUMNYA PADA HARI INI */}';
const listEndMarker = '{/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}';

const startIdx = code.indexOf(listStartMarker);
const endIdx = code.indexOf(listEndMarker);

if (startIdx === -1 || endIdx === -1) {
  console.log("Could not find list boundary.");
  process.exit(1);
}

// We extract the list
let listCode = code.substring(startIdx, endIdx);

// Remove the extracted list from its current position
code = code.substring(0, startIdx) + code.substring(endIdx);

// Change the border/shadow styling of the list so it blends better if it's placed earlier
// Let's adjust its margins
listCode = listCode.replace('mt-6 bg-white', 'mb-6 bg-white');


// Step 2: Insert the list right BEFORE the calendar controls 
// or BEFORE the main calendar layout
const calendarControlsMarker = '{/* Calendar Controls */}';
const controlsIdx = code.indexOf(calendarControlsMarker);

if (controlsIdx !== -1) {
  code = code.substring(0, controlsIdx) + listCode + code.substring(controlsIdx);
} else {
  console.log("Could not find Calendar Controls marker.");
  process.exit(1);
}

// Step 3: Add hover button on each calendar day cell
const cellDivStart = `                                 onClick={() => setSelectedCalendarDate(dateString)}
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
                                   )}`;

const newCellDivStart = `                                 onClick={() => setSelectedCalendarDate(dateString)}
                                 className={\`min-h-[140px] p-2.5 transition-all flex flex-col justify-start cursor-pointer group relative bg-white \${
                                   isSelected ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/10" : "hover:bg-slate-50"
                                 }\`}
                               >
                                 <div className="flex justify-between items-center mb-2 relative">
                                   <span className={\`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold \${
                                     isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                                   }\`}>
                                     {i}
                                   </span>
                                   <div className="flex items-center gap-1">
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

code = code.replace(cellDivStart, newCellDivStart);

fs.writeFileSync('src/App.tsx', code);
console.log("Applied changes for list ordering and hover button.");

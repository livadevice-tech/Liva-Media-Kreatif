const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetHostCal = `                          // Decide background check
                          let cellBg = "hover:bg-purple-50 text-slate-700";
                          let borderStyle = "border border-transparent";
                          
                          if (daySchedules.length > 0) {
                            const hasOffDay = daySchedules.some(s => s.isOffDay && s.hostId === loggedInHostId);
                            
                            if (hasOffDay) {
                              cellBg = "bg-rose-100 text-rose-800 font-extrabold";
                              borderStyle = "border border-rose-300";
                            } else {
                              cellBg = "bg-emerald-100 text-emerald-800 font-extrabold";
                              borderStyle = "border border-emerald-300";
                            }
                          }`;

const replacementHostCal = `                          // Decide background check
                          let cellBg = "bg-pink-100 text-pink-800 font-extrabold"; // Default to pink if no schedules
                          let borderStyle = "border border-pink-300";
                          
                          if (daySchedules.length > 0) {
                            const hasOffDay = daySchedules.some(s => s.isOffDay && s.hostId === loggedInHostId);
                            
                            if (hasOffDay) {
                              cellBg = "bg-rose-100 text-rose-800 font-extrabold";
                              borderStyle = "border border-rose-300";
                            } else {
                              cellBg = "bg-emerald-100 text-emerald-800 font-extrabold";
                              borderStyle = "border border-emerald-300";
                            }
                          }`;

code = code.replace(targetHostCal, replacementHostCal);
fs.writeFileSync('src/App.tsx', code);
console.log('Done replacement 2');

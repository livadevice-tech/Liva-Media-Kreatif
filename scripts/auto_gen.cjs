const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const generateLogic = `
                               if (!window.confirm("Auto Generate akan membuat jadwal harian untuk seluruh sesi di bulan ini (dan menghapus jadwal lama yang berpotongan). Lanjutkan?")) return;

                               const year = operatorSelectedYear;
                               const month = operatorSelectedMonth; // 0-indexed
                               
                               const daysInMonth = new Date(year, month + 1, 0).getDate();
                               const newSchedules = [];
                               
                               for (let day = 1; day <= daysInMonth; day++) {
                                 const d = new Date(year, month, day);
                                 // format YYYY-MM-DD
                                 const yyyy = d.getFullYear();
                                 const mm = String(d.getMonth() + 1).padStart(2, '0');
                                 const dd = String(d.getDate()).padStart(2, '0');
                                 const dateStr = \`\${yyyy}-\${mm}-\${dd}\`;
                                 
                                 clientBrands.forEach(brand => {
                                   if (brand.sessions) {
                                     brand.sessions.forEach(sess => {
                                        if (!sess.host) return;
                                        
                                        // find the host
                                        const hostObj = hosts.find(h => h.name === sess.host);
                                        if (hostObj) {
                                          newSchedules.push({
                                            id: \`auto_gen_\${brand.id}_\${dateStr}_\${sess.id}\`,
                                            hostId: hostObj.id,
                                            date: dateStr,
                                            timeSlot: sess.shift,
                                            platform: sess.platform || "",
                                            brand: brand.name,
                                            status: "Assigned",
                                            studio: sess.studio || "Studio Bandar Lampung",
                                            isOffDay: false,
                                            isPindahStudio: false,
                                            backupHostId: "",
                                            backupHostName: ""
                                          });
                                        }
                                     });
                                   }
                                 });
                               }
                               
                               // Replace existing schedules for this month with the newly generated ones
                               setSchedules(prev => {
                                 const filtered = prev.filter(s => {
                                   const sDate = new Date(s.date);
                                   return sDate.getFullYear() !== year || sDate.getMonth() !== month;
                                 });
                                 return [...filtered, ...newSchedules];
                               });
                               
                               addNotification("Jadwal Berhasil Dibuat", \`Auto Generate selesai memproduksi \${newSchedules.length} sesi untuk bulan \${getIndonesianMonthLabel(month)} \${year}.\`, "success", "absensi");
`;

const target = `alert("Fitur Auto Generate jadwal otomatis sedang dalam tahap pengembangan.");`;

if (code.includes(target)) {
  code = code.replace(target, generateLogic);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Replaced auto generate");
} else {
  console.log("Target not found");
}

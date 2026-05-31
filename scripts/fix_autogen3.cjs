const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `                               const year = operatorSelectedYear;
                               const month = operatorSelectedMonth; // 0-indexed`;

const replacementStr = `                               const [yearStr, monthStr] = operatorSelectedMonth.split("-");
                               const year = parseInt(yearStr);
                               const month = parseInt(monthStr) - 1;`;

const targetNotif = `addNotification("Jadwal Berhasil Dibuat", \`Auto Generate selesai memproduksi \${newSchedules.length} sesi untuk bulan \${getIndonesianMonthLabel(month)} \${year}.\`, "success", "absensi");`;

const replaceNotif = `addNotification("Jadwal Berhasil Dibuat", \`Auto Generate selesai memproduksi \${newSchedules.length} sesi untuk bulan \${getIndonesianMonthLabel(operatorSelectedMonth)}.\`, "success", "absensi");`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    code = code.replace(targetNotif, replaceNotif);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed undefined vars in auto gen!");
} else {
    console.log("Not found.");
}

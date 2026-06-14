const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/const allDates = Array\.from\(new Set\(filteredDb\.map\(l => normalizeDateYMD\(l\.date\)\)\.filter\(Boolean\)\)\) as string\[\]; allDates\.sort\(\);/g, 'const allDates = Array.from<string>(new Set(filteredDb.map(l => normalizeDateYMD(l.date)).filter(Boolean) as string[])); allDates.sort();');

fs.writeFileSync('src/App.tsx', c);

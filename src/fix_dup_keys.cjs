const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/scheds\.slice\(0,\s*4\)\.map\(\(\s*sch\s*:\s*any\s*\)\s*=>/g, 'scheds.slice(0, 4).map((sch: any, idxSch: number) =>');
c = c.replace(/key=\{sch\.id\}/g, 'key={(sch.id || "") + "_" + (typeof idxSch !== "undefined" ? idxSch : Math.random())}');

fs.writeFileSync('src/App.tsx', c);

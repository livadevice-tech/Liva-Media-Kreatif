const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/key=\{\(sch\.id \|\| ""\) \+ "_" \+ \(typeof idxSch !== "undefined" \? idxSch : Math\.random\(\)\)\}/g, 'key={sch.id}');
c = c.replace(/scheds\.slice\(0, 4\)\.map\(\(sch: any, idxSch: number\) =>/g, 'scheds.slice(0, 4).map((sch: any) =>');

fs.writeFileSync('src/App.tsx', c);

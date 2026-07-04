const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/key=\{sch\.id \+ "_" \+ \(typeof idxSch !== "undefined" \? idxSch : typeof schIdx !== "undefined" \? schIdx : Math\.random\(\)\)\}/g, 'key={sch.id + "_" + (sch.timeSlot || "") + "_" + (sch.studio || "")}');

fs.writeFileSync('src/App.tsx', c);

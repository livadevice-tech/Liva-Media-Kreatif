const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/key=\{sch\.id \+ "_" \+ idxSch\}/g, 'key={sch.id + "_" + (typeof idxSch !== "undefined" ? idxSch : typeof schIdx !== "undefined" ? schIdx : Math.random())}');

fs.writeFileSync('src/App.tsx', c);

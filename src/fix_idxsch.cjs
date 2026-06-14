const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/studioScheds\.map\(\(sch: any\) => \{/g, 'studioScheds.map((sch: any, idxSch: number) => {');

fs.writeFileSync('src/App.tsx', c);

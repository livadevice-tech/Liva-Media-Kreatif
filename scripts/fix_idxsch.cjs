const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/studioScheds\.map\(\(sch: unknown\) => \{/g, 'studioScheds.map((sch: unknown, idxSch: number) => {');

fs.writeFileSync('src/App.tsx', c);

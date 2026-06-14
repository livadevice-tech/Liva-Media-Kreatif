const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/return \(\\n\s*<div \\n\s*key=\{sch\.id \+ "_" \+ idxSch\}/g, 'return (\n                                                  <div \n                                                    key={sch.id + "_" + idxSch}');

fs.writeFileSync('src/App.tsx', c);

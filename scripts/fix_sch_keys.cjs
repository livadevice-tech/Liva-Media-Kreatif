const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/key=\{sch\.id \+ "_" \+ \(sch\.timeSlot \|\| ""\) \+ "_" \+ \(sch\.studio \|\| ""\)\}/g, 'key={(sch?.id || "") + "_" + Math.random().toString(36).substr(2, 9)}');

fs.writeFileSync('src/App.tsx', c);

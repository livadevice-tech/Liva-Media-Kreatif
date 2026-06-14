const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

// Fix 1: Admin Calendar mappings
c = c.replace(/scheds\.slice\(0,\s*4\)\.map\(\(sch:\s*any\)\s*=>\s*\{/g, 'scheds.slice(0, 4).map((sch: any, idxSch: number) => {');
c = c.replace(/return \(\s*<div\s*key=\{sch\.id\}/g, 'return (\\n                                                  <div \\n                                                    key={sch.id + "_" + idxSch}');

// Fix 2: Operator Calendar mappings
c = c.replace(/daySchedules\.map\(\s*sch\s*=>\s*\{/g, 'daySchedules.map((sch, schIdx) => {');
c = c.replace(/<div\s*key=\{sch\.id\}/g, '<div key={sch.id + "_" + schIdx}');

// Fix 3: Host Logs map
c = c.replace(/hostLogs\.map\(item\s*=>\s*\(/g, 'hostLogs.map((item, idx) => (');
c = c.replace(/<div key=\{item\.id\}/g, '<div key={item.id + "_" + idx}');

// Fix 4: Other small maps
c = c.replace(/filteredHostReportList\.map\(\(item\)\s*=>/g, 'filteredHostReportList.map((item, idx) =>');
c = c.replace(/<div key=\{item\.id\} className="p-4 space-y-4/g, '<div key={item.id + "_" + idx} className="p-4 space-y-4');

fs.writeFileSync('src/App.tsx', c);

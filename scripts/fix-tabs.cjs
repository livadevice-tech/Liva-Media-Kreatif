const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const shiftDropdown = `
                                  <select
                                    value={operatorShiftFilter}
                                    onChange={(e) =>
                                      setOperatorShiftFilter(e.target.value)
                                    }
                                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 shadow-sm"
                                  >
                                    <option value="">Semua Shift</option>
                                    {shifts.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>`;

const countBefore = code.match(/operatorShiftFilter/g)?.length || 0;

code = code.replace(/(\{\s*platforms\.map\(\(p\) => \([\s\S]*?<\/option>\s*\)\)\s*\}\s*<\/select>)\s*(?=<\/div>\s*<div className="relative flex gap-2 w-full sm:w-auto h-9">)/g, `$1${shiftDropdown}\n                                `);

const countAfter = code.match(/operatorShiftFilter/g)?.length || 0;

fs.writeFileSync('src/App.tsx', code);
console.log(`Replaced. Count before: ${countBefore}, Count after: ${countAfter}`);

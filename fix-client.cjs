const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `                              </select>
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
                                  </select>
                                </div>`;

const replacement = `                              </select>
                            </div>`;

code = code.replace(target, replacement);
code = code.replace(target, replacement);
fs.writeFileSync('src/App.tsx', code);
console.log("Replaced target");

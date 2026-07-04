const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs max-w-5xl" id="salary_parameter_grid_panel">
                  <div className="flex items-center gap-2 text-[#2563eb] font-extrabold text-sm mb-4 border-b border-slate-100 pb-2.5">
                    <Sliders className="w-4 h-4 text-[#2563eb]" />
                    PENGATURAN PARAMETER GAJI STREAMER AGENCY (DIFERENSIASI REGULER & BACKUP)
                  </div>`;

const replacementStr = `                {/* ================= ACCORDION: SETTING PAYROLL ================= */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs max-w-5xl overflow-hidden mb-6">
                  <button
                    type="button"
                    onClick={() => setIsPayrollConfigOpen(!isPayrollConfigOpen)}
                    className="w-full flex items-center justify-between p-4 md:p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer border-0"
                  >
                    <div className="flex items-center gap-2 text-[#2563eb] font-extrabold text-sm">
                      <Sliders className="w-4 h-4 text-[#2563eb]" />
                      SETTING PAYROLL CONFIGURATION
                    </div>
                    <ChevronDown className={\`w-5 h-5 text-slate-500 transition-transform duration-300 \${isPayrollConfigOpen ? 'rotate-180' : ''}\`} />
                  </button>
                  
                  {isPayrollConfigOpen && (
                    <div className="p-4 md:p-6 border-t border-slate-100" id="salary_parameter_grid_panel">
                      <div className="text-slate-500 font-bold text-xs mb-4">
                        PENGATURAN PARAMETER GAJI STREAMER AGENCY (DIFERENSIASI REGULER & BACKUP)
                      </div>`;

code = code.replace(targetStr, replacementStr);

const targetEndStr = `                    </div>

                  </div>
                </div>

                {/* Search & Configuration in calculator */}`;

const replacementEndStr = `                    </div>

                  </div>
                    </div>
                  )}
                </div>

                {/* Search & Configuration in calculator */}`;

code = code.replace(targetEndStr, replacementEndStr);

fs.writeFileSync('src/App.tsx', code);
console.log('Replaced.');

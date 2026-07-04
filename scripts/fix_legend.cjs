const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetLegend = `                    {/* Legend */}
                    <div className="mt-3 bg-purple-50/50 p-2 rounded-lg flex items-center justify-between text-[9px] text-purple-650 font-bold font-sans">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 block"></span>
                        <span>Jadwal Siaran (Masuk)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300 block"></span>
                        <span>Hari Libur (Off-Day)</span>
                      </div>
                    </div>`;

const replacementLegend = `                    {/* Legend */}
                    <div className="mt-3 bg-purple-50/50 p-2 rounded-lg flex items-center justify-between text-[8px] text-purple-650 font-bold font-sans">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 block"></span>
                        <span>Jadwal (Masuk)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300 block"></span>
                        <span>Libur (Off-Day)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-pink-100 border border-pink-300 block"></span>
                        <span>Tidak Ada Jadwal</span>
                      </div>
                    </div>`;

code = code.replace(targetLegend, replacementLegend);
fs.writeFileSync('src/App.tsx', code);
console.log('Done legend replacement');

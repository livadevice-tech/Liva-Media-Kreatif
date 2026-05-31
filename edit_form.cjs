const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const startMatch = '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">';
const endMatch = '{/* SUBMIT BUTTON */}';
const searchStart = code.indexOf('id="schedule_form_section"');
const startIdx = code.indexOf(startMatch, searchStart);
const endIdx = code.indexOf(endMatch, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log("Indices not found.");
  process.exit(1);
}

const replacement = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Pilih Studio:</label>
                                <select
                                  value={scheduleForm.studio}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, studio: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {studios.map(s => (
                                    <option key={s.id} value={s.name}>{s.name} ({s.location})</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Host:</label>
                                <select
                                  value={scheduleForm.hostId}
                                  onChange={(e) => {
                                      const hostId = e.target.value;
                                      const hostObj = hosts.find(h => h.id === hostId);
                                      if (!hostObj) {
                                          setScheduleForm(prev => ({ ...prev, hostId }));
                                          return;
                                      }

                                      // Auto-detect if host has a default session assigned in brands
                                      let foundBrand = "";
                                      let foundPlatform = "";
                                      let foundShift = "";

                                      for (const b of clientBrands) {
                                          const sess = b.sessions?.find(s => s.host === hostObj.name);
                                          if (sess) {
                                              foundBrand = b.name;
                                              foundPlatform = sess.platform;
                                              foundShift = sess.shift;
                                              break;
                                          }
                                      }
                                      
                                      setScheduleForm(prev => ({
                                          ...prev,
                                          hostId,
                                          brand: foundBrand || prev.brand,
                                          platform: foundPlatform || prev.platform,
                                          timeSlot: foundShift || prev.timeSlot
                                      }));
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                  required
                                >
                                  <option value="">-- Pilih Host --</option>
                                  {hosts.map(h => (
                                    <option key={h.id} value={h.id}>
                                      {h.name} ({h.hostType === "Reguler" ? "Reguler" : "Backup"})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Shift:</label>
                                <select
                                  value={scheduleForm.timeSlot}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {shifts.map(sh => (
                                    <option key={sh} value={sh}>{sh}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Brand:</label>
                                <select
                                  value={scheduleForm.brand}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, brand: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {brands.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Platform:</label>
                                <select
                                  value={scheduleForm.platform}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, platform: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {platforms.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            `;

code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
fs.writeFileSync('src/App.tsx', code);
console.log('Replaced form fields.');

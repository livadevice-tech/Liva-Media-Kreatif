const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `  const [brands, _setBrands] = useState<string[]>(() => {`;
const replaceState = `  const [agencyLogoUrl, _setAgencyLogoUrl] = useState<string>(() => {
    return localStorage.getItem("mcn_agency_logo") || "";
  });
  const setAgencyLogoUrl = useCallback((action: any) => {
    _setAgencyLogoUrl(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("mcn_agency_logo", next);
      setDoc(doc(db, "settings", "global_configs"), { agencyLogoUrl: next }, { merge: true }).catch(console.error);
      return next;
    });
  }, []);

  const [brands, _setBrands] = useState<string[]>(() => {`;
code = code.replace(targetState, replaceState);

const targetGlobal = `if (Array.isArray(data.platforms)) _setPlatforms(data.platforms);`;
const replaceGlobal = `if (Array.isArray(data.platforms)) _setPlatforms(data.platforms);
        if (typeof data.agencyLogoUrl === "string") _setAgencyLogoUrl(data.agencyLogoUrl);`;
code = code.replace(targetGlobal, replaceGlobal);

const targetFallback = `if (platformsSaved) initialConfig.platforms = JSON.parse(platformsSaved);`;
const replaceFallback = `if (platformsSaved) initialConfig.platforms = JSON.parse(platformsSaved);
          const agencyLogoSaved = localStorage.getItem("mcn_agency_logo");
          if (agencyLogoSaved) initialConfig.agencyLogoUrl = agencyLogoSaved;`;
code = code.replace(targetFallback, replaceFallback);

const targetLogoRender = `<div className="px-2 py-4 border-b border-purple-50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                        LM
                      </div>
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-[#2563eb] block uppercase">Liva Agency</span>
                        <h2 className="text-xs font-black text-slate-900 font-sans tracking-wide">OPERATOR DESKTOP</h2>
                      </div>
                    </div>`;
const replaceLogoRender = `<div className="px-2 py-4 border-b border-purple-50 flex items-center gap-3">
                      {agencyLogoUrl ? (
                         <img src={agencyLogoUrl} className="w-10 h-10 rounded-lg object-contain bg-slate-50 border border-slate-100" alt="Logo" />
                      ) : (
                         <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">LM</div>
                      )}
                      <div>
                        {agencyLogoUrl ? null : <span className="text-[9px] font-black tracking-widest text-[#2563eb] block uppercase">Liva Agency</span>}
                        <h2 className="text-xs font-black text-slate-900 font-sans tracking-wide">OPERATOR DESKTOP</h2>
                      </div>
                    </div>`;
code = code.replace(targetLogoRender, replaceLogoRender);

const targetPanel = `{/* 1. PLATFORM CONFIGURATION CARD */}`;
const replacePanel = `{/* AGENCY LOGO UPLOAD CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between md:col-span-2 xl:col-span-4" id="setting_logo_panel">
                    <div className="space-y-4">
                      <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                          🖼️ Logo Agency
                        </h4>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex-shrink-0">
                          {agencyLogoUrl ? (
                             <img src={agencyLogoUrl} className="w-20 h-20 rounded-xl object-contain bg-slate-50 border border-slate-200 shadow-sm" alt="Logo Preview" />
                          ) : (
                             <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold border-dashed">No Logo</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Upload Logo Baru (.jpg / .png)</label>
                          <input type="file" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                 setAgencyLogoUrl(evt.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                          <p className="text-[10px] text-slate-400 mt-2 font-medium">Logo akan langsung berubah di sidebar utama dan tersimpan ke cloud. Rekomendasi rasio 1:1, max 1MB.</p>
                          {agencyLogoUrl && (
                             <button onClick={() => setAgencyLogoUrl("")} className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 underline cursor-pointer">Hapus Logo</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 1. PLATFORM CONFIGURATION CARD */}`;
code = code.replace(targetPanel, replacePanel);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx Updated');

const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src', 'App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf-8');

// Find the start of the DATA BRAND subtab
const startMarker = '{/* ==================== SUBTAB: DATA BRAND ==================== */}';
const endMarker = '{/* ==================== SUBTAB: INVOICE BRAND ==================== */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers');
  process.exit(1);
}

const newJsx = `
                {/* ==================== SUBTAB: DATA BRAND ==================== */}
                {operatorTab === "data_brand" && (
                  <div
                    className="space-y-6 animate-fadeIn"
                    id="operator_data_brand_content"
                  >
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-sm font-black text-slate-800">
                            Manajemen Data Brand Klien
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Data detail terkait kontrak, invoice, dan kredensial brand aktif.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setBrandFormEditor({ sessions: [], accounts: [] });
                            setBrandFormTab("basic");
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all border-0 cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Klien Baru
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                          <button
                            onClick={() => setBrandDataTab("active")}
                            className={\`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 \${brandDataTab === "active" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}\`}
                          >
                            ✅ Aktif
                          </button>
                          <button
                            onClick={() => setBrandDataTab("inactive")}
                            className={\`px-4 py-2 text-xs font-black rounded-lg transition-all duration-300 \${brandDataTab === "inactive" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}\`}
                          >
                            🔴 Tidak Aktif
                          </button>
                        </div>
                        <div className="relative flex-1 w-full">
                          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari nama brand klien..."
                            value={brandDataSearch}
                            onChange={(e) => setBrandDataSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-semibold"
                          />
                        </div>
                        <button
                          onClick={() => setBrandDataSortDir(prev => prev === "asc" ? "desc" : "asc")}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shrink-0"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          {brandDataSortDir === "asc" ? "A–Z" : "Z–A"}
                        </button>
                      </div>

                      {/* Brand Card List */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredAndSortedBrands.length === 0 ? (
                          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">
                              {brandDataSearch ? "Brand tidak ditemukan." : "Belum ada data brand klien."}
                            </p>
                            <p className="text-slate-300 text-xs mt-1">Klik tombol "+ Klien Baru" untuk menambahkan.</p>
                          </div>
                        ) : (
                          filteredAndSortedBrands.map((brand, i) => {
                            const today = new Date();
                            const endDate = brand.contractEndDate ? new Date(brand.contractEndDate) : null;
                            const isExpired = endDate ? endDate < today : false;
                            const daysLeft = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                            const isNearExpiry = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

                            const formatContractDate = (d) => {
                              if (!d) return "—";
                              const datePart = d.split("T")[0];
                              const p = datePart.split("-");
                              if (p.length === 3) return \`\${p[2]}/\${p[1]}/\${p[0]}\`;
                              return d;
                            };

                            return (
                              <div
                                key={brand.id || i}
                                className={\`flex flex-col bg-white rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group \${
                                  isExpired
                                    ? "border-rose-200 shadow-[0_4px_20px_-10px_rgba(244,63,94,0.3)]"
                                    : isNearExpiry
                                    ? "border-amber-200 shadow-[0_4px_20px_-10px_rgba(251,191,36,0.3)]"
                                    : "border-indigo-100 shadow-[0_4px_20px_-10px_rgba(79,70,229,0.1)]"
                                }\`}
                              >
                                {/* Header Card */}
                                <div className={\`px-5 py-4 flex items-center justify-between rounded-t-2xl border-b \${
                                  isExpired ? "bg-rose-50/50 border-rose-100" : isNearExpiry ? "bg-amber-50/50 border-amber-100" : "bg-slate-50/50 border-slate-100"
                                }\`}>
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-lg \${
                                      isExpired ? "bg-rose-100 text-rose-600" : isNearExpiry ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"
                                    }\`}>
                                      {(brand.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-black text-slate-800 text-[15px] truncate">{brand.name}</h4>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        {isExpired ? (
                                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Kontrak Selesai</span>
                                        ) : isNearExpiry ? (
                                          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sisa {daysLeft} hari</span>
                                        ) : (
                                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Body Card */}
                                <div className="p-5 flex-1 flex flex-col gap-4">
                                  {/* Info Singkat */}
                                  <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      {formatContractDate(brand.contractEndDate)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                      {brand.picName || "Tanpa PIC"}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                      Invoice: Tgl {brand.invoiceDate || "-"}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      Meeting: Tgl {brand.monthlyMeetingDate || "-"}
                                    </div>
                                  </div>

                                  {/* Sessions Summary */}
                                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Platform & Sesi</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {brand.sessions && brand.sessions.length > 0 ? (
                                        brand.sessions.map((sess) => (
                                          <div key={sess.id} className="bg-white border border-slate-200 rounded-md px-2 py-1 text-[10px] shadow-sm">
                                            <span className="font-black text-indigo-600">{sess.platform}</span>
                                            <span className="text-slate-400 mx-1">·</span>
                                            <span className="font-bold text-slate-600">{sess.shift}</span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[10px] text-slate-400 italic">Belum ada sesi</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Footer Card (Action Buttons) */}
                                <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-2xl">
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => handleEditBrand(brand)}
                                      className="p-2 bg-white border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                                      title="Edit Brand"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBrand(brand.id)}
                                      className="p-2 bg-white border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 rounded-lg transition-colors"
                                      title="Hapus Brand"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setOperatorTab("invoice");
                                      setTimeout(() => {
                                        window.dispatchEvent(new CustomEvent('openInvoiceForBrand', { detail: brand.id }));
                                      }, 300);
                                    }}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-[11px] rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-200/50"
                                  >
                                    <Receipt className="w-3.5 h-3.5" /> Buat Invoice
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* MODAL FORM BRAND */}
                    {brandFormEditor && (
                      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <div 
                          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                          onClick={() => setBrandFormEditor(null)}
                        ></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
                          {/* Modal Header */}
                          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h4 className="text-lg font-black text-slate-800 flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-indigo-600" />
                              {brandFormEditor.id ? "Edit Data Brand Klien" : "Tambah Brand Klien Baru"}
                            </h4>
                            <button
                              onClick={() => setBrandFormEditor(null)}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* Tabs */}
                          <div className="flex items-center px-6 border-b border-slate-200 bg-white">
                            <button
                              onClick={() => setBrandFormTab("basic")}
                              className={\`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors \${brandFormTab === "basic" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}\`}
                            >
                              Info Dasar
                            </button>
                            <button
                              onClick={() => setBrandFormTab("sessions")}
                              className={\`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors \${brandFormTab === "sessions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}\`}
                            >
                              Jadwal Sesi
                            </button>
                            <button
                              onClick={() => setBrandFormTab("accounts")}
                              className={\`px-4 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-colors \${brandFormTab === "accounts" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-400 hover:text-slate-600"}\`}
                            >
                              Kredensial Akun
                            </button>
                          </div>

                          {/* Modal Body */}
                          <div className="p-6 overflow-y-auto flex-1 bg-slate-50/30">
                            <form
                              id="brand-form"
                              onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const nameVal = fd.get("name");
                                const defaultUsername = nameVal
                                  ? nameVal.toLowerCase().replace(/[^a-z0-9]/g, "")
                                  : \`brand_\${Date.now()}\`;
                                const enteredUsername = (fd.get("clientUsername"))?.trim();

                                const newBrand = {
                                  id: brandFormEditor.id || \`cb_\${Date.now()}\`,
                                  name: nameVal,
                                  contractStartDate: fd.get("contractStartDate"),
                                  contractEndDate: fd.get("contractEndDate"),
                                  invoiceDate: fd.get("invoiceDate"),
                                  monthlyMeetingDate: fd.get("monthlyMeetingDate"),
                                  picName: fd.get("picName"),
                                  picPhone: fd.get("picPhone"),
                                  sessions: brandFormEditor.sessions || [],
                                  accounts: brandFormEditor.accounts || [],
                                  clientUsername: enteredUsername || brandFormEditor.clientUsername || defaultUsername,
                                  clientPassword: (fd.get("clientPassword")) || "liva123",
                                };

                                if (brandFormEditor.id) {
                                  setClientBrands((prev) => prev.map((b) => b.id === newBrand.id ? newBrand : b));
                                  addNotification("💼 Brand Diperbarui", \`Data brand "\${newBrand.name}" berhasil diperbarui.\`, "info", "data_brand");
                                } else {
                                  setClientBrands((prev) => [...prev, newBrand]);
                                  addNotification("🎉 Brand Baru", \`Brand "\${newBrand.name}" baru saja didaftarkan.\`, "success", "data_brand");
                                }
                                setBrandFormEditor(null);
                              }}
                              className="space-y-5"
                            >
                              {/* TAB 1: BASIC INFO */}
                              <div className={brandFormTab === "basic" ? "block animate-fadeIn" : "hidden"}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="md:col-span-2">
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Nama Brand *</label>
                                    <input
                                      required
                                      name="name"
                                      defaultValue={brandFormEditor.name}
                                      type="text"
                                      placeholder="Masukkan nama brand..."
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Mulai Kontrak</label>
                                    <input
                                      name="contractStartDate"
                                      defaultValue={brandFormEditor.contractStartDate || new Date().toISOString().split("T")[0]}
                                      type="date"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Selesai Kontrak</label>
                                    <input
                                      name="contractEndDate"
                                      defaultValue={brandFormEditor.contractEndDate || new Date().toISOString().split("T")[0]}
                                      type="date"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Tgl Invoice Bulanan</label>
                                    <input
                                      name="invoiceDate"
                                      defaultValue={brandFormEditor.invoiceDate}
                                      type="number" min="1" max="31"
                                      placeholder="Contoh: 5"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Tgl Meeting Bulanan</label>
                                    <input
                                      name="monthlyMeetingDate"
                                      defaultValue={brandFormEditor.monthlyMeetingDate}
                                      type="number" min="1" max="31"
                                      placeholder="Contoh: 10"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">Nama PIC</label>
                                    <input
                                      name="picName"
                                      defaultValue={brandFormEditor.picName}
                                      type="text"
                                      placeholder="Nama penanggung jawab"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-slate-700 font-bold text-xs mb-1.5">No WhatsApp PIC</label>
                                    <input
                                      name="picPhone"
                                      defaultValue={brandFormEditor.picPhone}
                                      type="text"
                                      placeholder="Misal: 08123456789"
                                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* TAB 2: SESSIONS */}
                              <div className={brandFormTab === "sessions" ? "block animate-fadeIn" : "hidden"}>
                                <div className="flex justify-between items-center mb-4">
                                  <h5 className="font-bold text-slate-700 text-sm">Jadwal & Sesi Regular</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBrandFormEditor((prev) => prev ? {
                                        ...prev,
                                        sessions: [...(prev.sessions || []), { id: \`s_\${Date.now()}\`, platform: platforms[0] || "", shift: shifts[0] || "", studio: studios[0]?.name || "", host: "" }]
                                      } : prev);
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Sesi
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {(brandFormEditor.sessions || []).map((sess, idx) => (
                                    <div key={sess.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
                                      <select
                                        value={sess.platform}
                                        onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, platform: e.target.value } : s) } : prev)}
                                        className="w-full md:w-[150px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                                      >
                                        {platforms.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                      </select>
                                      <select
                                        value={sess.shift}
                                        onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, shift: e.target.value } : s) } : prev)}
                                        className="w-full md:flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                                      >
                                        {shifts.map((sh, i) => <option key={i} value={sh}>{sh}</option>)}
                                      </select>
                                      <select
                                        value={sess.studio || ""}
                                        onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, studio: e.target.value } : s) } : prev)}
                                        className="w-full md:w-[180px] bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                                      >
                                        <option value="">Pilih Studio...</option>
                                        {studios.map((st, i) => <option key={i} value={st.name}>{st.name} - {st.location}</option>)}
                                      </select>
                                      <SearchableHostSelect
                                        hosts={hosts}
                                        value={sess.host || ""}
                                        valueType="name"
                                        onChange={(hostName) => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, host: hostName } : s) } : prev)}
                                        className="w-full md:w-[180px]"
                                        placeholder="Dedicated Host..."
                                        triggerClassName="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-100 focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs text-left flex items-center justify-between"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.filter((_, i) => i !== idx) } : prev)}
                                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  {(!brandFormEditor.sessions || brandFormEditor.sessions.length === 0) && (
                                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                                      <p className="text-slate-400 font-bold text-sm">Belum ada sesi</p>
                                      <p className="text-slate-400 text-xs mt-1">Sesi digunakan untuk filter jadwal otomatis.</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* TAB 3: ACCOUNTS */}
                              <div className={brandFormTab === "accounts" ? "block animate-fadeIn" : "hidden"}>
                                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-5">
                                  <h5 className="font-bold text-indigo-900 text-sm mb-3">Portal Brand (Client Access)</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-indigo-700 font-bold text-[10px] uppercase mb-1">Username Portal</label>
                                      <input
                                        name="clientUsername"
                                        defaultValue={brandFormEditor.clientUsername}
                                        type="text"
                                        placeholder="Kosongkan utk default"
                                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-mono text-indigo-900 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-indigo-700 font-bold text-[10px] uppercase mb-1">Password Portal</label>
                                      <input
                                        name="clientPassword"
                                        defaultValue={brandFormEditor.clientPassword || "liva123"}
                                        type="text"
                                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-xs font-mono text-indigo-900 focus:border-indigo-500 outline-none"
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between items-center mb-4">
                                  <h5 className="font-bold text-slate-700 text-sm">Kredensial Seller Center</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBrandFormEditor((prev) => prev ? {
                                        ...prev,
                                        accounts: [...(prev.accounts || []), { id: \`a_\${Date.now()}\`, type: platforms[0] || "", username: "", password: "", picOtp: "" }]
                                      } : prev);
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Tambah Akun
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {(brandFormEditor.accounts || []).map((acc, idx) => (
                                    <div key={acc.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                      <div className="md:col-span-3">
                                        <label className="block text-slate-500 font-bold text-[10px] mb-1">Platform</label>
                                        <select
                                          value={acc.type}
                                          onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, type: e.target.value } : a) } : prev)}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 focus:border-indigo-500 outline-none font-bold text-slate-700 text-xs"
                                        >
                                          {platforms.map((p, i) => <option key={i} value={p}>{p}</option>)}
                                          <option value="Lainnya">Lainnya</option>
                                        </select>
                                      </div>
                                      <div className="md:col-span-3">
                                        <label className="block text-slate-500 font-bold text-[10px] mb-1">Username / Email</label>
                                        <input
                                          type="text"
                                          value={acc.username}
                                          onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, username: e.target.value } : a) } : prev)}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="md:col-span-3">
                                        <label className="block text-slate-500 font-bold text-[10px] mb-1">Password</label>
                                        <input
                                          type="text"
                                          value={acc.password}
                                          onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, password: e.target.value } : a) } : prev)}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="block text-slate-500 font-bold text-[10px] mb-1">PIC OTP</label>
                                        <input
                                          type="text"
                                          value={acc.picOtp}
                                          onChange={(e) => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, picOtp: e.target.value } : a) } : prev)}
                                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="md:col-span-1 flex justify-end pb-0.5">
                                        <button
                                          type="button"
                                          onClick={() => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.filter((_, i) => i !== idx) } : prev)}
                                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  {(!brandFormEditor.accounts || brandFormEditor.accounts.length === 0) && (
                                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center">
                                      <p className="text-slate-400 font-bold text-sm">Belum ada akun</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </form>
                          </div>

                          {/* Modal Footer */}
                          <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setBrandFormEditor(null)}
                              className="px-5 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-all"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              form="brand-form"
                              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Check className="w-4 h-4" /> Simpan Data Brand
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
`;

content = content.replace(content.substring(startIndex, endIndex), newJsx + '\n');
fs.writeFileSync(appTsxPath, content);
console.log('Refactored Data Brand menu in App.tsx');

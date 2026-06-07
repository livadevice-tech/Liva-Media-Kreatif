const fs = require('fs');
let c = fs.readFileSync('src/components/InvoiceDashboard.tsx', 'utf8');

const target1 = '\{invoiceEditor && \(';
const replace1 = \`
      {activeTab === \"berkas\" && (
        <div className=\"bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn\">
           <div className=\"flex justify-between items-center mb-6 border-b border-slate-100 pb-4\">
              <h3 className=\"text-xl font-black text-slate-800 flex items-center gap-2\"><FileText className=\"w-6 h-6 text-indigo-600\" /> Kelola Berkas Klien</h3>
              <div className=\"flex gap-2\">
                <button 
                  onClick={() => setBerkasEditor({ brandId: clientBrands[0]?.id || \"\", id: \"b_\" + Date.now(), name: \"\", type: \"Dokumen\", url: \"\" })}
                  className=\"px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-all cursor-pointer flex items-center gap-2 text-sm\"
                >
                  <Plus className=\"w-4 h-4\" /> Tambah Berkas
                </button>
                <button onClick={() => setActiveTab(\"overview\")} className=\"px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer\">Kembali</button>
              </div>
           </div>
           <div className=\"overflow-x-auto\">
              <table className=\"w-full text-left border-collapse whitespace-nowrap\">
                <thead>
                  <tr className=\"bg-slate-50 border-y border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider\">
                    <th className=\"px-4 py-3\">No</th>
                    <th className=\"px-4 py-3\">Nama Berkas</th>
                    <th className=\"px-4 py-3\">Brand Klien</th>
                    <th className=\"px-4 py-3\">Jenis Berkas</th>
                    <th className=\"px-4 py-3\">Link Berkas</th>
                    <th className=\"px-4 py-3 text-right\">Edit</th>
                  </tr>
                </thead>
                <tbody className=\"divide-y divide-slate-100 font-medium text-sm\">
                  {clientBrands.flatMap(b => (b.berkas || []).map(berk => ({ ...berk, brandId: b.id, brandName: b.name }))).map((berk, idx) => (
                    <tr key={berk.id} className=\"hover:bg-slate-50 transition-colors\">
                      <td className=\"px-4 py-3 text-slate-500 font-bold\">{idx + 1}</td>
                      <td className=\"px-4 py-3 font-bold text-slate-800\">{berk.name}</td>
                      <td className=\"px-4 py-3 text-slate-600\">{berk.brandName}</td>
                      <td className=\"px-4 py-3\"><span className=\"bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase\">{berk.type}</span></td>
                      <td className=\"px-4 py-3\"><a href={berk.url} target=\"_blank\" rel=\"noreferrer\" className=\"text-indigo-600 hover:underline font-bold text-xs truncate max-w-[200px] inline-block\">{berk.url}</a></td>
                      <td className=\"px-4 py-3 text-right\">
                        <button onClick={() => setBerkasEditor(berk)} className=\"p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer mr-1\"><Edit2 className=\"w-4 h-4\" /></button>
                        <button onClick={() => setBerkasToDelete({ brandId: berk.brandId, berkasId: berk.id })} className=\"p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer\"><Trash2 className=\"w-4 h-4\" /></button>
                      </td>
                    </tr>
                  ))}
                  {clientBrands.flatMap(b => (b.berkas || [])).length === 0 && (
                     <tr>
                        <td colSpan={6} className=\"px-4 py-8 text-center text-slate-400 font-medium italic\">Belum ada berkas yang diupload</td>
                     </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {invoiceEditor && (\`;

const replace2 = \`
      {berkasEditor && (
        <div className=\"fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4\">
          <div className=\"bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn flex flex-col\">
            <div className=\"p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50\">
              <h3 className=\"text-xl font-black text-slate-800\">{berkasEditor.name ? \"Edit Berkas\" : \"Tambah Berkas Baru\"}</h3>
              <button onClick={() => setBerkasEditor(null)} className=\"text-slate-400 hover:text-slate-600 cursor-pointer\"><X className=\"w-6 h-6\" /></button>
            </div>
            <div className=\"p-6 space-y-4 font-sans\">
              <div>
                <label className=\"block text-xs font-bold text-slate-500 mb-1\">Brand Klien</label>
                <select 
                  className=\"w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white cursor-pointer\"
                  value={berkasEditor.brandId}
                  onChange={(e) => setBerkasEditor({ ...berkasEditor, brandId: e.target.value })}
                >
                  <option value=\"\">Pilih Brand</option>
                  {clientBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className=\"block text-xs font-bold text-slate-500 mb-1\">Nama Berkas</label>
                <input type=\"text\" className=\"w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white\" placeholder=\"Misal: Kontrak Kerja\" value={berkasEditor.name} onChange={(e) => setBerkasEditor({ ...berkasEditor, name: e.target.value })} />
              </div>
              <div>
                <label className=\"block text-xs font-bold text-slate-500 mb-1\">Jenis Berkas</label>
                <select 
                  className=\"w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white cursor-pointer\"
                  value={berkasEditor.type} 
                  onChange={(e) => setBerkasEditor({ ...berkasEditor, type: e.target.value })}
                >
                  <option value=\"Dokumen\">Dokumen</option>
                  <option value=\"Laporan\">Laporan</option>
                  <option value=\"Kontrak\">Kontrak</option>
                  <option value=\"Gambar/Video\">Gambar/Video</option>
                  <option value=\"Lainnya\">Lainnya</option>
                </select>
              </div>
              <div>
                <label className=\"block text-xs font-bold text-slate-500 mb-1\">Link Berkas (URL)</label>
                <input type=\"url\" className=\"w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white\" placeholder=\"https://\" value={berkasEditor.url} onChange={(e) => setBerkasEditor({ ...berkasEditor, url: e.target.value })} />
              </div>
            </div>
            <div className=\"p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3\">
              <button onClick={() => setBerkasEditor(null)} className=\"px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all\">Batal</button>
              <button 
                onClick={() => {
                  if (!berkasEditor.brandId || !berkasEditor.name || !berkasEditor.url) return;
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id === berkasEditor.brandId) {
                      const updatedBerkas = [...(b.berkas || [])];
                      const idx = updatedBerkas.findIndex(berk => berk.id === berkasEditor.id);
                      if (idx > -1) {
                         updatedBerkas[idx] = { id: berkasEditor.id, name: berkasEditor.name, type: berkasEditor.type, url: berkasEditor.url };
                      } else {
                         updatedBerkas.push({ id: berkasEditor.id, name: berkasEditor.name, type: berkasEditor.type, url: berkasEditor.url });
                      }
                      return { ...b, berkas: updatedBerkas };
                    }
                    return b;
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasEditor(null);
                }}
                className=\"px-5 py-2.5 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all active:scale-95\"
              >
                Simpan Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {berkasToDelete && (
        <div className=\"fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4\">
          <div className=\"bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fadeIn\">
            <div className=\"w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4\">
              <Trash2 className=\"w-8 h-8\" />
            </div>
            <h3 className=\"text-xl font-black text-slate-800 mb-2\">Hapus Berkas?</h3>
            <p className=\"text-sm font-semibold text-slate-500 mb-6\">Berkas akan dihapus secara permanen dari sistem.</p>
            <div className=\"flex justify-center gap-3\">
              <button onClick={() => setBerkasToDelete(null)} className=\"px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all flex-1\">Batal</button>
              <button 
                onClick={() => {
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id === berkasToDelete.brandId) {
                      return { ...b, berkas: (b.berkas || []).filter(berk => berk.id !== berkasToDelete.berkasId) };
                    }
                    return b;
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasToDelete(null);
                }}
                className=\"px-5 py-2.5 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-95 flex-1\"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
\`;

c = c.replace('{invoiceEditor && (', replace1);
c = c.replace(/\s*<\/div>\s*<\/div>\s*\)\s*;\s*\}\s*;\s*$/, replace2);
fs.writeFileSync('src/components/InvoiceDashboard.tsx', c);

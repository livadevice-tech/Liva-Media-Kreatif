const fs = require('fs');let c = fs.readFileSync('src/components/InvoiceDashboard.tsx', 'utf8');const berkasCode = \`
      {activeTab === \"berkas\" && (
        <div className=\"bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn\">
           <div className=\"flex justify-between items-center mb-6 border-b border-slate-100 pb-4\">
              <h3 className=\"text-xl font-black text-slate-800 flex items-center gap-2\"><FileText className=\"w-6 h-6 text-indigo-600\" /> Kelola Berkas Klien</h3>
              <div className=\"flex gap-2\">
                <button 
                  onClick={() => setBerkasEditor({ brandId: clientBrands[0]?.id || \"\", id: \`b_\1780815377945\`, name: \"\", type: \"Dokumen\", url: \"\" })}
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
      {invoiceEditor && (\`;c = c.replace(/\s*\{invoiceEditor && \(/, \"\
\" + berkasCode);fs.writeFileSync('src/components/InvoiceDashboard.tsx', c);
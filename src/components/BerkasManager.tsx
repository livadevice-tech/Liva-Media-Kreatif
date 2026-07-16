import React, { useState } from 'react';
import { Search, Plus, X, FileText, Trash2, Edit2, FileArchive, FileImage, FileCode, FolderOpen } from 'lucide-react';
import { ClientBrand } from '../types';

interface BerkasManagerProps {
  clientBrands: ClientBrand[];
  onUpdateBrands: (brands: ClientBrand[]) => void;
  onBack: () => void;
}

export const BerkasManager: React.FC<BerkasManagerProps> = ({ clientBrands, onUpdateBrands, onBack }) => {
  const [berkasSearch, setBerkasSearch] = useState("");
  const [berkasEditor, setBerkasEditor] = useState<{ brandId: string; id: string; name: string; type: string; url: string; } | null>(null);
  const [berkasToDelete, setBerkasToDelete] = useState<{ brandId: string; berkasId: string; } | null>(null);
  const [inputMode, setInputMode] = useState<'link' | 'upload'>('link');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "SPK": return <FileText className="w-8 h-8 text-blue-500" />;
      case "SOP": return <FileCode className="w-8 h-8 text-amber-500" />;
      case "Script": return <FileText className="w-8 h-8 text-emerald-500" />;
      case "Rekap": return <FileArchive className="w-8 h-8 text-indigo-500" />;
      default: return <FileImage className="w-8 h-8 text-slate-500" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "SPK": return "bg-blue-50 border border-blue-100 text-blue-600";
      case "SOP": return "bg-amber-50 border border-amber-100 text-amber-600";
      case "Script": return "bg-emerald-50 border border-emerald-100 text-emerald-600";
      case "Rekap": return "bg-indigo-50 border border-indigo-100 text-indigo-600";
      default: return "bg-slate-50 border border-slate-200 text-slate-600";
    }
  };

  const allBerkasMap = new Map();
  clientBrands.forEach(b => {
    (b.berkas || []).forEach(berk => {
      if (!allBerkasMap.has(berk.id)) {
        allBerkasMap.set(berk.id, { ...berk, brandIds: [b.id], brandNames: [b.name] });
      } else {
        const existing = allBerkasMap.get(berk.id);
        existing.brandIds.push(b.id);
        existing.brandNames.push(b.name);
      }
    });
  });
  
  const allBerkas = Array.from(allBerkasMap.values()).map(berk => ({
    ...berk,
    brandId: berk.brandIds.length === clientBrands.length && clientBrands.length > 0 ? 'all' : berk.brandIds[0],
    brandName: berk.brandIds.length === clientBrands.length && clientBrands.length > 0 ? 'Semua Brand (Global)' : berk.brandNames.join(', ')
  }));

  const filteredBerkas = allBerkas.filter(berk => berk.name.toLowerCase().includes(berkasSearch.toLowerCase()) || berk.brandName.toLowerCase().includes(berkasSearch.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-slate-100 pb-5 w-full">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari nama berkas atau brand..." 
            value={berkasSearch}
            onChange={(e) => setBerkasSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 font-medium transition-all text-slate-800 shadow-sm"
          />
        </div>
        <button 
          onClick={() => {
            setBerkasEditor({ brandId: clientBrands[0]?.id || "", id: "b_" + Date.now(), name: "", type: "Dokumen", url: "" });
            setInputMode('link');
            setSelectedFile(null);
          }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Tambah Berkas
        </button>
      </div>

      {filteredBerkas.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-100 rounded-3xl shadow-inner">
          <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-5 border border-slate-100">
            <FolderOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-800 mb-2">{berkasSearch ? "Pencarian Tidak Ditemukan" : "Belum Ada Berkas"}</h4>
          <p className="text-sm text-slate-500 max-w-sm mb-6">
            {berkasSearch ? "Coba gunakan kata kunci lain untuk mencari berkas." : "Simpan dan kelola SPK, Script, SOP, serta dokumen klien lainnya di sini."}
          </p>
          {!berkasSearch && (
            <button 
              onClick={() => {
                setBerkasEditor({ brandId: clientBrands[0]?.id || "", id: "b_" + Date.now(), name: "", type: "Dokumen", url: "" });
                setInputMode('link');
                setSelectedFile(null);
              }}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-all cursor-pointer shadow-sm"
            >
              Mulai Upload Berkas
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="py-4 px-6 font-semibold">Nama Berkas</th>
                <th className="py-4 px-6 font-semibold hidden md:table-cell">Brand Klien</th>
                <th className="py-4 px-6 font-semibold">Jenis</th>
                <th className="py-4 px-6 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBerkas.map((berk) => (
                <tr key={berk.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                        {React.cloneElement(getFileIcon(berk.type) as React.ReactElement, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm mb-0.5">{berk.name}</p>
                        <p className="text-xs font-medium text-slate-500 md:hidden">{berk.brandName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell">
                    <p className="text-sm font-medium text-slate-600">{berk.brandName}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${getBadgeColor(berk.type)}`}>
                      {berk.type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <a href={berk.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer inline-block">
                        Buka Tautan
                      </a>
                      <button onClick={() => { 
                        // Cek apakah berkas ini ada di semua brand
                        const isGlobal = clientBrands.length > 0 && clientBrands.every(b => (b.berkas || []).some(bk => bk.id === berk.id));
                        setBerkasEditor({ ...berk, brandId: isGlobal ? 'all' : berk.brandId }); 
                        setInputMode(berk.url.startsWith('http') ? 'link' : 'upload'); 
                        setSelectedFile(null);
                      }} className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg cursor-pointer shadow-sm"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setBerkasToDelete({ brandId: berk.brandId, berkasId: berk.id })} className="p-1.5 bg-white border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 rounded-lg cursor-pointer shadow-sm"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {berkasEditor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Formulir Berkas</h3>
              <button onClick={() => { setBerkasEditor(null); setSelectedFile(null); setInputMode('link'); }} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Brand Klien</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300" 
                  value={berkasEditor.brandId} 
                  onChange={e => setBerkasEditor({...berkasEditor, brandId: e.target.value})}
                >
                  <option value="" disabled>Pilih Brand Klien</option>
                  <option value="all">Semua Brand (Global)</option>
                  {clientBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Nama Berkas</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-300" value={berkasEditor.name} onChange={e => setBerkasEditor({...berkasEditor, name: e.target.value})} placeholder="Contoh: SPK Bulan Maret 2024" required />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Jenis Berkas</label>
                <select className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-300" value={berkasEditor.type} onChange={e => setBerkasEditor({...berkasEditor, type: e.target.value})}>
                  <option value="SPK">SPK / Kontrak</option>
                  <option value="SOP">SOP Brand</option>
                  <option value="Script">Script Live</option>
                  <option value="Rekap">Rekap Penjualan</option>
                  <option value="Dokumen">Dokumen Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Metode Input</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="inputMode" value="link" checked={inputMode === 'link'} onChange={() => setInputMode('link')} className="accent-slate-900" />
                    <span className="text-sm font-medium text-slate-700">Tautan Link</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="inputMode" value="upload" checked={inputMode === 'upload'} onChange={() => setInputMode('upload')} className="accent-slate-900" />
                    <span className="text-sm font-medium text-slate-700">Upload File</span>
                  </label>
                </div>

                {inputMode === 'link' ? (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Link Tautan (G-Drive / Docs)</label>
                    <input type="url" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-300" value={berkasEditor.url} onChange={e => setBerkasEditor({...berkasEditor, url: e.target.value})} placeholder="https://docs.google.com/..." />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Upload File Dokumen</label>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          setSelectedFile(e.dataTransfer.files[0]);
                        }
                      }}
                    >
                      <input 
                        type="file" 
                        id="file-upload"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                      />
                      <FileText className={`w-10 h-10 mb-3 ${isDragging ? 'text-indigo-500' : 'text-slate-400'}`} />
                      <p className="text-sm font-medium text-slate-700 text-center">
                        {selectedFile ? selectedFile.name : (
                          <>
                            <span className="text-indigo-600">Klik untuk memilih file</span> atau seret file ke sini
                          </>
                        )}
                      </p>
                      {!selectedFile && (
                        <p className="text-xs text-slate-500 mt-1">Mendukung format PDF, gambar, dll. (Maks 50MB)</p>
                      )}
                    </div>
                    {berkasEditor.url && !berkasEditor.url.startsWith('http') && !selectedFile && (
                      <p className="text-xs text-emerald-600 mt-2 font-medium">File saat ini tersimpan: {berkasEditor.url.split('/').pop()}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setBerkasEditor(null)} disabled={isUploading} className="px-5 py-2.5 rounded-lg font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all disabled:opacity-50">Batal</button>
              <button 
                disabled={isUploading}
                onClick={async () => {
                  if (!berkasEditor.name || !berkasEditor.brandId) return alert("Pilih brand dan masukkan nama berkas!");
                  if (inputMode === 'link' && !berkasEditor.url) return alert("Masukkan link tautan!");
                  if (inputMode === 'upload' && !selectedFile && !berkasEditor.url) return alert("Pilih file yang akan diupload!");

                  let finalUrl = berkasEditor.url;
                  
                  if (inputMode === 'upload' && selectedFile) {
                    setIsUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append('berkas_file', selectedFile);
                      
                      const res = await fetch('/api/client-brands/berkas/upload', {
                        method: 'POST',
                        body: formData
                      });
                      
                      if (!res.ok) throw new Error("Gagal mengupload file");
                      
                      const data = await res.json();
                      finalUrl = data.url;
                    } catch (error) {
                      alert("Terjadi kesalahan saat mengupload file");
                      setIsUploading(false);
                      return;
                    }
                    setIsUploading(false);
                  }

                  const updatedBrands = clientBrands.map((b) => {
                    // Selalu hapus file dari brand ini dulu (mencegah duplikat saat pindah brand)
                    let existingBerkas = (b.berkas || []).filter(bk => bk.id !== berkasEditor.id);
                    
                    // Tambahkan ke brand ini jika target brand cocok atau 'all'
                    const isTargetBrand = berkasEditor.brandId === "all" || b.id === berkasEditor.brandId;
                    if (isTargetBrand) {
                      existingBerkas = [...existingBerkas, { ...berkasEditor, url: finalUrl }];
                    }
                    
                    return { ...b, berkas: existingBerkas };
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasEditor(null);
                  setSelectedFile(null);
                  setInputMode('link');
                }}
                className="px-6 py-2.5 rounded-lg font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm cursor-pointer transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? "Mengupload..." : "Simpan Data Berkas"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {berkasToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Berkas?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">Berkas ini akan dihapus permanen dari dashboard Anda dan Klien. Apakah Anda yakin?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  const isGlobal = berkasToDelete.brandId === 'all';
                  const updatedBrands = clientBrands.map((b) => {
                    if (!isGlobal && b.id !== berkasToDelete.brandId) return b;
                    return {
                      ...b,
                      berkas: (b.berkas || []).filter(bk => bk.id !== berkasToDelete.berkasId)
                    };
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasToDelete(null);
                }}
                className="w-full py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
              <button 
                onClick={() => setBerkasToDelete(null)}
                className="w-full py-2.5 rounded-lg font-medium bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
              >  Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

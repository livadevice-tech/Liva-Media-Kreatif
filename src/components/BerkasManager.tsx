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

  const allBerkas = clientBrands.flatMap(b => (b.berkas || []).map(berk => ({ ...berk, brandId: b.id, brandName: b.name })));
  const filteredBerkas = allBerkas.filter(berk => berk.name.toLowerCase().includes(berkasSearch.toLowerCase()) || berk.brandName.toLowerCase().includes(berkasSearch.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-5">
        <div>
           <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2 tracking-tight">
             <FolderOpen className="w-6 h-6 text-slate-700" /> Kelola Berkas & Dokumen
           </h3>
           <p className="text-sm text-slate-500 mt-1">Manajemen SPK, Script, SOP, dan aset digital klien lainnya.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Cari nama berkas..." 
              value={berkasSearch}
              onChange={(e) => setBerkasSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 font-medium transition-all text-slate-800"
            />
          </div>
          <button 
            onClick={() => {
              setBerkasEditor({ brandId: clientBrands[0]?.id || "", id: "b_" + Date.now(), name: "", type: "Dokumen", url: "" });
              setInputMode('link');
              setSelectedFile(null);
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Tambah Berkas
          </button>
        </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBerkas.map((berk) => (
            <div key={berk.id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-gradient-to-l from-white via-white to-transparent">
                  <button onClick={() => { 
                    setBerkasEditor(berk); 
                    setInputMode(berk.url.startsWith('http') ? 'link' : 'upload'); 
                    setSelectedFile(null);
                  }} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setBerkasToDelete({ brandId: berk.brandId, berkasId: berk.id })} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
               </div>
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    {getFileIcon(berk.type)}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getBadgeColor(berk.type)}`}>
                    {berk.type}
                  </span>
               </div>
               <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate pr-10" title={berk.name}>{berk.name}</h4>
               <p className="text-xs font-medium text-slate-500 truncate mb-4">{berk.brandName}</p>
               <div className="mt-auto pt-4 border-t border-slate-100">
                 <a href={berk.url} target="_blank" rel="noreferrer" className="w-full block text-center py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg transition-colors border border-slate-200">
                   Buka Tautan Eksternal
                 </a>
               </div>
            </div>
          ))}
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
                  disabled={!!clientBrands.flatMap(b => b.berkas || []).find(berk => berk.id === berkasEditor.id)}
                >
                  <option value="" disabled>Pilih Brand Klien</option>
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
                    <input type="file" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                    {berkasEditor.url && !berkasEditor.url.startsWith('http') && (
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
                    if (b.id !== berkasEditor.brandId) return b;
                    let existingBerkas = b.berkas || [];
                    const found = existingBerkas.some(bk => bk.id === berkasEditor.id);
                    if (found) {
                      existingBerkas = existingBerkas.map(bk => bk.id === berkasEditor.id ? { ...berkasEditor, url: finalUrl } : bk);
                    } else {
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
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id !== berkasToDelete.brandId) return b;
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

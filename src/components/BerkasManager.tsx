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
      case "SPK": return "bg-blue-100 text-blue-700";
      case "SOP": return "bg-amber-100 text-amber-700";
      case "Script": return "bg-emerald-100 text-emerald-700";
      case "Rekap": return "bg-indigo-100 text-indigo-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const allBerkas = clientBrands.flatMap(b => (b.berkas || []).map(berk => ({ ...berk, brandId: b.id, brandName: b.name })));
  const filteredBerkas = allBerkas.filter(berk => berk.name.toLowerCase().includes(berkasSearch.toLowerCase()) || berk.brandName.toLowerCase().includes(berkasSearch.toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-5">
        <div>
           <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
             <FolderOpen className="w-7 h-7 text-indigo-600" /> Kelola Berkas & Dokumen
           </h3>
           <p className="text-sm font-semibold text-slate-500 mt-1">Manajemen SPK, Script, SOP, dan aset digital klien lainnya.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setBerkasEditor({ brandId: clientBrands[0]?.id || "", id: "b_" + Date.now(), name: "", type: "Dokumen", url: "" })}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Tambah Berkas Baru
          </button>
          <button onClick={onBack} className="px-5 py-2.5 font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">Kembali</button>
        </div>
      </div>

      <div className="mb-6 max-w-md relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari berdasarkan nama berkas atau brand..." 
          value={berkasSearch}
          onChange={(e) => setBerkasSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 font-bold transition-all text-slate-700"
        />
      </div>

      {filteredBerkas.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
          <FolderOpen className="w-16 h-16 text-slate-300 mb-4" />
          <h4 className="text-lg font-black text-slate-700 mb-1">{berkasSearch ? "Berkas Tidak Ditemukan" : "Folder Kosong"}</h4>
          <p className="text-sm font-semibold text-slate-500 max-w-sm">
            {berkasSearch ? "Coba gunakan kata kunci lain untuk mencari berkas." : "Belum ada berkas klien yang diunggah. Klik 'Tambah Berkas Baru' untuk memulai."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredBerkas.map((berk) => (
            <div key={berk.id} className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-gradient-to-l from-white via-white to-transparent">
                  <button onClick={() => setBerkasEditor(berk)} className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-lg cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setBerkasToDelete({ brandId: berk.brandId, berkasId: berk.id })} className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
               </div>
               <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {getFileIcon(berk.type)}
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${getBadgeColor(berk.type)}`}>
                    {berk.type}
                  </span>
               </div>
               <h4 className="font-black text-slate-800 text-base mb-1 truncate pr-10" title={berk.name}>{berk.name}</h4>
               <p className="text-xs font-bold text-slate-500 truncate mb-4">{berk.brandName}</p>
               <div className="mt-auto pt-4 border-t border-slate-100">
                 <a href={berk.url} target="_blank" rel="noreferrer" className="w-full block text-center py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-black text-xs rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">Formulir Berkas</h3>
              <button onClick={() => setBerkasEditor(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Brand Klien</label>
                <select 
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-400" 
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
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Nama Berkas</label>
                <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400" value={berkasEditor.name} onChange={e => setBerkasEditor({...berkasEditor, name: e.target.value})} placeholder="Contoh: SPK Bulan Maret 2024" required />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Jenis Berkas</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold bg-slate-50 text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-400" value={berkasEditor.type} onChange={e => setBerkasEditor({...berkasEditor, type: e.target.value})}>
                  <option value="SPK">SPK / Kontrak</option>
                  <option value="SOP">SOP Brand</option>
                  <option value="Script">Script Live</option>
                  <option value="Rekap">Rekap Penjualan</option>
                  <option value="Dokumen">Dokumen Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Link Tautan (G-Drive / Docs)</label>
                <input type="url" className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-indigo-400" value={berkasEditor.url} onChange={e => setBerkasEditor({...berkasEditor, url: e.target.value})} placeholder="https://docs.google.com/..." required />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setBerkasEditor(null)} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all">Batal</button>
              <button 
                onClick={() => {
                  if (!berkasEditor.name || !berkasEditor.url || !berkasEditor.brandId) return alert("Pilih brand dan lengkapi data!");
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id !== berkasEditor.brandId) return b;
                    let existingBerkas = b.berkas || [];
                    const found = existingBerkas.some(bk => bk.id === berkasEditor.id);
                    if (found) {
                      existingBerkas = existingBerkas.map(bk => bk.id === berkasEditor.id ? { ...berkasEditor } : bk);
                    } else {
                      existingBerkas = [...existingBerkas, { ...berkasEditor }];
                    }
                    return { ...b, berkas: existingBerkas };
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasEditor(null);
                }}
                className="px-6 py-2.5 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
              >
                Simpan Data Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {berkasToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Hapus Berkas?</h3>
            <p className="text-sm font-semibold text-slate-500 mb-8 leading-relaxed">Berkas ini akan dihapus permanen dari dashboard Anda dan Klien. Apakah Anda yakin?</p>
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
                className="w-full py-3.5 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-95"
              >
                Ya, Hapus Permanen
              </button>
              <button onClick={() => setBerkasToDelete(null)} className="w-full py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer transition-all">
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

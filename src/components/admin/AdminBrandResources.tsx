import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Plus, Edit2, Trash2, Save, X, Search, FileText } from 'lucide-react';
import type { ClientBrand, BrandResource } from '../../types';
import { brandResourcesApi } from '../../api';

export function AdminBrandResources({ 
  brands 
}: { 
  brands: ClientBrand[] 
}) {
  const [resources, setResources] = useState<BrandResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<Partial<BrandResource> | null>(null);
  
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'guideline' | 'script' | 'sop'>('all');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    const data = await brandResourcesApi.getAll();
    setResources(data || []);
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!currentEdit?.title || !currentEdit?.brandId || !currentEdit?.content) {
      alert("Pastikan Brand, Judul, dan Konten terisi!");
      return;
    }
    
    let newResources = [...resources];
    
    if (currentEdit.id) {
      // Update
      newResources = newResources.map(r => r.id === currentEdit.id ? { ...r, ...currentEdit } as BrandResource : r);
    } else {
      // Create
      const newId = `res_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
      newResources.push({
        ...currentEdit,
        id: newId,
        createdAt: new Date().toISOString(),
      } as BrandResource);
    }
    
    await brandResourcesApi.saveAll(newResources);
    setResources(newResources);
    setIsEditing(false);
    setCurrentEdit(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Yakin ingin menghapus panduan ini?")) return;
    
    const newResources = resources.filter(r => r.id !== id);
    await brandResourcesApi.saveAll(newResources);
    setResources(newResources);
  };

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchBrand = filterBrand === 'all' || r.brandId === filterBrand;
    const matchTab = activeTab === 'all' || r.type === activeTab;
    return matchSearch && matchBrand && matchTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Panduan & Script</h2>
          <p className="text-sm text-slate-500">Kelola informasi publik untuk masing-masing Brand</p>
        </div>
        <button
          onClick={() => {
            setCurrentEdit({ type: 'script', brandId: brands[0]?.id });
            setIsEditing(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Panduan
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-4">
            <h3 className="font-bold text-slate-800">{currentEdit?.id ? 'Edit Panduan' : 'Tambah Panduan Baru'}</h3>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand Client</label>
              <select
                value={currentEdit?.brandId || ''}
                onChange={(e) => setCurrentEdit({ ...currentEdit, brandId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Panduan</label>
              <select
                value={currentEdit?.type || 'script'}
                onChange={(e) => setCurrentEdit({ ...currentEdit, type: e.target.value as any })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
              >
                <option value="script">Script Siaran</option>
                <option value="guideline">Guideline / Referensi</option>
                <option value="sop">SOP Kerja</option>
                <option value="other">Lainnya</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Dokumen</label>
              <input
                type="text"
                value={currentEdit?.title || ''}
                onChange={(e) => setCurrentEdit({ ...currentEdit, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"
                placeholder="Misal: Script Live Madu Uray Spesial Payday"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Konten / Isi (Atau Link Google Drive)</label>
              <ReactQuill
                theme="snow"
                value={currentEdit?.content || ''}
                onChange={(content) => setCurrentEdit({ ...currentEdit, content })}
                className="bg-white border-slate-300 rounded-lg text-sm [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-slate-700"
                placeholder="Tuliskan isi panduan di sini, dapat menyertakan gambar, link, atau memformat teks..."
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'guideline', label: 'Panduan' },
              { id: 'script', label: 'Script' },
              { id: 'sop', label: 'SOP' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari panduan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <select
              value={filterBrand}
              onChange={e => setFilterBrand(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="all">Semua Brand</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Brand</th>
                  <th className="p-4">Judul Dokumen</th>
                  <th className="p-4">Tipe</th>
                  <th className="p-4">Diperbarui</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Memuat data...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada panduan ditemukan.</td></tr>
                ) : (
                  filtered.map(r => {
                    const brand = brands.find(b => b.id === r.brandId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {brand?.logoUrl ? (
                              <img src={brand.logoUrl} className="w-6 h-6 rounded-full object-cover border" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                {brand?.name?.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-slate-900 text-sm">{brand?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-700 text-sm">{r.title}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            r.type === 'script' ? 'bg-purple-100 text-purple-700' :
                            r.type === 'sop' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setCurrentEdit(r);
                                setIsEditing(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(r.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

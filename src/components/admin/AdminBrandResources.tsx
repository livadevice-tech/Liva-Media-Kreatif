import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import ReactQuill from 'react-quill-new';
const Quill = ReactQuill.Quill;
import 'react-quill-new/dist/quill.snow.css';
// @ts-ignore
import BlotFormatter from '@enzedonline/quill-blot-formatter2';

Quill.register('modules/blotFormatter', BlotFormatter);
import { Plus, Edit2, Trash2, Save, X, Search, FileText, ExternalLink, Mic, BookOpen, Settings } from 'lucide-react';

const bgGradients = [
  'from-[#65db72] to-[#45b651]', // Green
  'from-[#5d75f3] to-[#4a5fdb]', // Blue
  'from-[#ff6b7e] to-[#f04f63]', // Red/Pink
  'from-[#6870d4] to-[#5058ba]', // Indigo/Purple
  'from-[#3ea2eb] to-[#288dd4]', // Cyan
  'from-[#ffb141] to-[#e69829]', // Orange
];
import type { ClientBrand, BrandResource } from '../../types';
import { brandResourcesApi } from '../../api';
import { ImageCropperModal } from '../ui/ImageCropperModal';

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
  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<string>>(new Set());

  const quillRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');

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
    
    try {
      await brandResourcesApi.saveAll(newResources);
      setResources(newResources);
      setIsEditing(false);
      setCurrentEdit(null);
    } catch (error: any) {
      console.error("Gagal menyimpan panduan:", error);
      alert("Gagal menyimpan panduan. Ukuran konten mungkin terlalu besar karena gambar, atau terjadi masalah jaringan.");
    }
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

  const imageHandler = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleCropComplete = (croppedImageBase64: string) => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const range = editor.getSelection(true);
      editor.insertEmbed(range.index, 'image', croppedImageBase64);
      editor.setSelection(range.index + 1);
    }
    setIsCropperOpen(false);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    blotFormatter: {}
  }), [imageHandler]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Panduan & Script</h2>
          <p className="text-sm text-slate-500">Kelola informasi publik untuk masing-masing Brand</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.open('/brand-resources', '_blank')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Halaman Publik
          </button>
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
                {brands.filter(b => b.isActive !== false).map(b => (
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
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={currentEdit?.content || ''}
                onChange={(content) => setCurrentEdit({ ...currentEdit, content })}
                className="bg-white border-slate-300 rounded-lg text-sm [&_.ql-editor]:min-h-[150px] [&_.ql-editor]:text-slate-700"
                placeholder="Tuliskan isi panduan di sini, dapat menyertakan gambar, link, atau memformat teks..."
                modules={modules}
              />
              <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={cropImageSrc}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
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
              {brands.filter(b => b.isActive !== false).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Memuat data...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(() => {
                  const brandsToRender = brands.filter(b => {
                    if (filterBrand !== 'all' && b.id !== filterBrand) return false;
                    if (b.isActive === false) return false;
                    return true;
                  });

                  if (brandsToRender.length === 0) {
                    return <div className="col-span-full p-8 text-center text-slate-400">Tidak ada brand yang sesuai.</div>;
                  }

                  let colorIndex = 0;

                  return brandsToRender.map(brand => {
                    const brandResources = filtered.filter(r => r.brandId === brand.id);
                    if (search && brandResources.length === 0) return null; // Hide if searching and no matches

                    const gradient = bgGradients[colorIndex % bgGradients.length];
                    colorIndex++;
                    const isExpanded = expandedBrandIds.has(brand.id);

                    return (
                      <div key={brand.id} className="col-span-full xl:col-span-1 flex flex-col gap-4">
                         {/* Brand Card */}
                         <div 
                           onClick={() => {
                             setExpandedBrandIds(prev => {
                               const next = new Set(prev);
                               if (next.has(brand.id)) next.delete(brand.id);
                               else next.add(brand.id);
                               return next;
                             });
                           }}
                           className={`relative overflow-hidden rounded-[24px] p-6 h-[220px] flex flex-col justify-between text-white bg-gradient-to-br ${gradient} shadow-sm hover:shadow-md transition-shadow cursor-pointer group w-full`}
                         >
                           <div className="absolute right-[-20px] top-1/4 opacity-20 transform rotate-12 scale-150 transition-transform group-hover:scale-125 pointer-events-none">
                             <BookOpen size={120} />
                           </div>
                           
                           <div className="relative z-10 pr-4">
                             <div className="w-12 h-12 bg-white/20 rounded-full mb-4 flex items-center justify-center overflow-hidden backdrop-blur-sm border border-white/30">
                               {brand.logoUrl ? (
                                 <img src={brand.logoUrl} className="w-full h-full object-cover" />
                               ) : (
                                 <span className="font-bold text-xl">{brand.name.charAt(0)}</span>
                               )}
                             </div>
                             <h4 className="font-bold text-[24px] leading-tight drop-shadow-sm line-clamp-2">{brand.name}</h4>
                           </div>
                           
                           <div className="relative z-10 flex items-end justify-between mt-auto">
                             <div>
                               <p className="text-[14px] font-medium text-white/90 drop-shadow-sm">{brandResources.length} Dokumen</p>
                             </div>
                             <div className="flex items-center gap-1.5">
                               <div className="bg-white text-slate-800 text-[12px] font-bold px-4 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-colors">
                                 {isExpanded ? 'Tutup' : 'Lihat'}
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* Resources List */}
                         {isExpanded && (
                           <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 shadow-inner">
                             {brandResources.length === 0 ? (
                                <div className="text-center text-slate-400 py-6 text-sm">Belum ada panduan.</div>
                             ) : (
                                <div className="space-y-3">
                                  {brandResources.map(r => (
                                    <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors shadow-sm">
                                       <div className="flex items-center gap-3">
                                          <div className={`p-2.5 rounded-lg ${r.type === 'script' ? 'bg-purple-100 text-purple-600' : r.type === 'sop' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {r.type === 'script' ? <Mic size={20} /> : r.type === 'sop' ? <Settings size={20} /> : <BookOpen size={20} />}
                                          </div>
                                          <div>
                                            <h5 className="font-bold text-slate-700 text-sm leading-tight mb-0.5">{r.title}</h5>
                                            <p className="text-[11px] font-medium text-slate-500 capitalize">{r.type === 'guideline' ? 'Panduan' : r.type} • {new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-1.5 shrink-0">
                                         <button 
                                           onClick={(e) => { e.stopPropagation(); setCurrentEdit(r); setIsEditing(true); }} 
                                           className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                         >
                                           <Edit2 className="w-4 h-4" />
                                         </button>
                                         <button 
                                           onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }} 
                                           className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                         >
                                           <Trash2 className="w-4 h-4" />
                                         </button>
                                       </div>
                                    </div>
                                  ))}
                                </div>
                             )}
                             <button
                               onClick={() => {
                                 setCurrentEdit({ type: 'script', brandId: brand.id });
                                 setIsEditing(true);
                               }}
                               className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 bg-white"
                             >
                               <Plus className="w-4 h-4" /> Tambah Dokumen Baru
                             </button>
                           </div>
                         )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

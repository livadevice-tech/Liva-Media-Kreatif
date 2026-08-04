import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Search, Filter, FileText, ChevronRight } from 'lucide-react';
import type { ClientBrand, BrandResource } from '../../types';
import { brandResourcesApi } from '../../api';

export function PublicBrandResources({ 
  brands,
  onBack 
}: { 
  brands: ClientBrand[];
  onBack: () => void;
}) {
  const [resources, setResources] = useState<BrandResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<BrandResource | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    const data = await brandResourcesApi.getAll();
    setResources(data || []);
    setIsLoading(false);
  };

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchBrand = selectedBrandId === 'all' || r.brandId === selectedBrandId;
    return matchSearch && matchBrand;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h1 className="text-lg font-bold text-slate-900">Pusat Panduan Brand</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedResource ? (
          /* Detail View */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8">
              <button 
                onClick={() => setSelectedResource(null)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
              </button>
              
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    selectedResource.type === 'script' ? 'bg-purple-100 text-purple-700' :
                    selectedResource.type === 'sop' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedResource.type}
                  </span>
                  <span className="text-sm text-slate-500">
                    Diperbarui {new Date(selectedResource.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">
                  {selectedResource.title}
                </h1>
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  Brand: <span className="text-slate-900">{brands.find(b => b.id === selectedResource.brandId)?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                {selectedResource.content.split('\n').map((paragraph, idx) => {
                  // Jika berupa link, buat clickable
                  if (paragraph.trim().startsWith('http://') || paragraph.trim().startsWith('https://')) {
                    return (
                      <p key={idx}>
                        <a href={paragraph.trim()} target="_blank" rel="noreferrer" className="text-blue-600 underline break-all">
                          {paragraph.trim()}
                        </a>
                      </p>
                    );
                  }
                  return (
                    <p key={idx} className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filter */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" /> Filter Brand
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedBrandId('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedBrandId === 'all' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Semua Brand
                  </button>
                  {brands.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrandId(b.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${
                        selectedBrandId === b.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b.logoUrl ? (
                        <img src={b.logoUrl} className="w-5 h-5 rounded-full object-cover border" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold">
                          {b.name?.charAt(0)}
                        </div>
                      )}
                      <span className="truncate">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="lg:col-span-3">
              <div className="mb-6 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Cari panduan, script, SOP..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium">Memuat panduan...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada panduan</h3>
                  <p className="text-slate-500 text-sm">Tidak ada dokumen yang sesuai dengan pencarian Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map(r => {
                    const brand = brands.find(b => b.id === r.brandId);
                    return (
                      <button
                        key={r.id}
                        onClick={() => setSelectedResource(r)}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition-all group flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            r.type === 'script' ? 'bg-purple-100 text-purple-700' :
                            r.type === 'sop' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {r.type}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                        
                        <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                          {r.title}
                        </h3>
                        
                        <div className="mt-auto pt-3 flex items-center gap-2 border-t border-slate-100 w-full">
                          {brand?.logoUrl ? (
                            <img src={brand.logoUrl} className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold">
                              {brand?.name?.charAt(0)}
                            </div>
                          )}
                          <span className="text-xs font-medium text-slate-500 truncate">{brand?.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

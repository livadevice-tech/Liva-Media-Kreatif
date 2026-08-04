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
  const [publicBrands, setPublicBrands] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'guideline' | 'script' | 'sop'>('all');
  const [selectedResource, setSelectedResource] = useState<BrandResource | null>(null);

  const displayBrands = brands.length > 0 ? brands : publicBrands;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [resData, brandsData] = await Promise.all([
        brandResourcesApi.getAll(),
        brands.length === 0 ? clientBrandsApi.getPublicList() : Promise.resolve([])
      ]);
      setResources(resData || []);
      if (brands.length === 0 && brandsData) {
        setPublicBrands(brandsData);
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchBrand = selectedBrandId === 'all' || r.brandId === selectedBrandId;
    const matchTab = activeTab === 'all' || r.type === activeTab;
    return matchSearch && matchBrand && matchTab;
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Navigation & Filters) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" /> Filter
              </h3>
              
              <div className="space-y-3 mb-6">
                <select
                  value={selectedBrandId}
                  onChange={(e) => {
                    setSelectedBrandId(e.target.value);
                    setSelectedResource(null);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Brand --</option>
                  {displayBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Cari panduan..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Navigation List grouped by type */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-4 text-sm text-slate-400">Memuat...</div>
                ) : !selectedBrandId ? (
                  <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p>Silakan pilih brand dari dropdown<br/>di atas terlebih dahulu.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-4 text-sm text-slate-400">Tidak ada dokumen ditemukan</div>
                ) : (
                  <>
                    {/* Panduan */}
                    {filtered.filter(r => r.type === 'guideline' || r.type === 'other').length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2 px-2">Panduan & Umum</h4>
                        <div className="space-y-1 border-l-2 border-slate-100 ml-2 pl-2">
                          {filtered.filter(r => r.type === 'guideline' || r.type === 'other').map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelectedResource(r)}
                              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedResource?.id === r.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {r.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Script */}
                    {filtered.filter(r => r.type === 'script').length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-2 px-2">Script</h4>
                        <div className="space-y-1 border-l-2 border-slate-100 ml-2 pl-2">
                          {filtered.filter(r => r.type === 'script').map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelectedResource(r)}
                              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedResource?.id === r.id ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {r.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SOP */}
                    {filtered.filter(r => r.type === 'sop').length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2 px-2">SOP</h4>
                        <div className="space-y-1 border-l-2 border-slate-100 ml-2 pl-2">
                          {filtered.filter(r => r.type === 'sop').map(r => (
                            <button
                              key={r.id}
                              onClick={() => setSelectedResource(r)}
                              className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                selectedResource?.id === r.id ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {r.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-3">
            {selectedResource ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
                <div className="p-8 md:p-10">
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
                    <h1 className="text-3xl font-black text-slate-900 mb-3">
                      {selectedResource.title}
                    </h1>
                    {(() => {
                      const brand = displayBrands.find(b => b.id === selectedResource.brandId);
                      return (
                        <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                          Brand: <span className="text-slate-900">{brand?.name || 'Unknown'}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="prose prose-slate max-w-none">
                    {selectedResource.content.split('\n').map((paragraph, idx) => {
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
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px]">
                <BookOpen className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">Pilih Dokumen</h3>
                <p className="text-slate-500 max-w-md">
                  Silakan pilih Panduan, Script, atau SOP dari menu di sebelah kiri untuk membaca detailnya.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

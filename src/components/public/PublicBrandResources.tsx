import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, Search, Filter, FileText, ChevronRight, ChevronDown, Moon, Sun, Type, ZoomIn, ZoomOut, List, X } from 'lucide-react';
import type { ClientBrand, BrandResource } from '../../types';
import { brandResourcesApi, clientBrandsApi } from '../../api';
import { CustomSelect } from '../ui/CustomSelect';

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

  // Reading Mode States
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState<'prose-sm' | 'prose-base' | 'prose-lg' | 'prose-xl' | 'prose-2xl'>('prose-base');
  const [toc, setToc] = useState<{id: string, text: string, level: string}[]>([]);
  const [showToc, setShowToc] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isResourceDropdownOpen, setResourceDropdownOpen] = useState(false);
  const [resourceSearch, setResourceSearch] = useState('');
  
  const displayBrands = (brands.length > 0 ? brands : publicBrands).filter(b => b.isActive !== false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setResourceDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  useEffect(() => {
    if (selectedResource?.content) {
      // Parse HTML to find headers for TOC
      const parser = new DOMParser();
      const doc = parser.parseFromString(selectedResource.content, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3');
      const tocItems: {id: string, text: string, level: string}[] = [];
      
      headings.forEach((h, index) => {
        const id = `heading-${index}`;
        h.id = id;
        tocItems.push({
          id,
          text: h.textContent || '',
          level: h.tagName.toLowerCase()
        });
      });
      
      setToc(tocItems);
      // Store html with ids inside an arbitrary property (since type is strict, cast to any)
      (selectedResource as any)._htmlWithIds = doc.body.innerHTML; 
    } else {
      setToc([]);
      setShowToc(false);
    }
  }, [selectedResource?.id]);

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.content.toLowerCase().includes(search.toLowerCase());
    const matchBrand = selectedBrandId === 'all' || r.brandId === selectedBrandId;
    const matchTab = activeTab === 'all' || r.type === activeTab;
    return matchSearch && matchBrand && matchTab;
  });

  const changeFontSize = (increase: boolean) => {
    const sizes = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl'] as const;
    const currentIndex = sizes.indexOf(fontSize);
    if (increase && currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    } else if (!increase && currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowToc(false);
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header - Hidden on mobile if viewing resource */}
      <div className={`${selectedResource ? 'hidden lg:block' : 'block'} ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b sticky top-0 z-10 shadow-sm transition-colors duration-300`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className={`p-2 -ml-2 rounded-full transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pusat Panduan Brand</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar */}
          <div className={`lg:col-span-1 space-y-6 ${selectedResource ? 'hidden lg:block' : 'block'}`}>
            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl shadow-sm border p-4 transition-colors duration-300`}>
              <h3 className={`font-bold mb-3 text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Filter className="w-4 h-4 text-slate-500" /> Filter
              </h3>
              
              <div className="space-y-3 mb-6">
                <CustomSelect
                  value={selectedBrandId}
                  onChange={(val) => {
                    setSelectedBrandId(val);
                    setSelectedResource(null);
                  }}
                  options={displayBrands.map(b => ({ value: b.id, label: b.name }))}
                  placeholder="-- Pilih Brand --"
                  searchable={true}
                  className="mb-4"
                />

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Cari panduan..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-slate-200 text-slate-900'}`}
                  />
                </div>
              </div>

              {/* Navigation List */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-4 text-sm text-slate-400">Memuat...</div>
                ) : !selectedBrandId ? (
                  <div className={`text-center py-8 text-sm rounded-lg border ${isDarkMode ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                    <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2 opacity-50" />
                    <p>Silakan pilih brand dari dropdown<br/>di atas terlebih dahulu.</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-4 text-sm text-slate-400">Tidak ada dokumen ditemukan</div>
                ) : (
                  <>
                    {['guideline', 'script', 'sop'].map(typeGroup => {
                      const items = filtered.filter(r => typeGroup === 'guideline' ? (r.type === 'guideline' || r.type === 'other') : r.type === typeGroup);
                      if (items.length === 0) return null;
                      
                      const colorMap = {
                        guideline: 'blue',
                        script: 'purple',
                        sop: 'amber'
                      };
                      const color = colorMap[typeGroup as keyof typeof colorMap];
                      
                      return (
                        <div key={typeGroup}>
                          <h4 className={`text-[11px] font-bold text-${color}-500 uppercase tracking-wider mb-2 px-2`}>
                            {typeGroup === 'guideline' ? 'Panduan & Umum' : typeGroup}
                          </h4>
                          <div className={`space-y-1 border-l-2 ml-2 pl-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                            {items.map(r => {
                              const isSelected = selectedResource?.id === r.id;
                              return (
                                <button
                                  key={r.id}
                                  onClick={() => setSelectedResource(r)}
                                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isSelected 
                                      ? (isDarkMode ? `bg-${color}-500/20 text-${color}-400 font-semibold` : `bg-${color}-50 text-${color}-700 font-semibold`)
                                      : (isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50')
                                  }`}
                                >
                                  {r.title}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className={`lg:col-span-3 ${!selectedResource ? 'hidden lg:block' : 'block'}`}>
            {selectedResource ? (
              <div className={`rounded-2xl shadow-sm border min-h-[500px] relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                
                {/* Mobile Back Button & Floating Toolbar Container */}
                <div className={`sticky top-0 z-20 w-full flex items-center justify-between p-4 border-b rounded-t-2xl backdrop-blur-md ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
                  <button 
                    onClick={() => setSelectedResource(null)} 
                    className={`lg:hidden flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  
                  {/* Desktop Title / Empty Space for mobile & Mobile Title Dropdown */}
                  <div className="flex-1 min-w-0 px-2 lg:px-4 relative" ref={dropdownRef}>
                    <button 
                      onClick={() => setResourceDropdownOpen(!isResourceDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border w-fit max-w-full transition-colors ${isDarkMode ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className={`text-sm font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        {selectedResource.title}
                      </span>
                      <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isResourceDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>

                    {isResourceDropdownOpen && (
                      <div className={`absolute top-full left-2 lg:left-4 mt-2 w-[300px] max-w-[calc(100vw-32px)] max-h-[60vh] overflow-hidden flex flex-col rounded-xl shadow-lg border z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                        <div className={`p-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              type="text"
                              placeholder="Cari dokumen..."
                              value={resourceSearch}
                              onChange={(e) => setResourceSearch(e.target.value)}
                              className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-1">
                          {['guideline', 'script', 'sop'].map(typeGroup => {
                            const items = resources.filter(r => {
                              const matchType = typeGroup === 'guideline' ? (r.type === 'guideline' || r.type === 'other') : r.type === typeGroup;
                              const matchSearch = r.title.toLowerCase().includes(resourceSearch.toLowerCase());
                              return matchType && matchSearch;
                            });
                            if (items.length === 0) return null;
                            return (
                              <div key={typeGroup} className="mb-2 last:mb-0">
                                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                  {typeGroup === 'guideline' ? 'Panduan & Umum' : typeGroup}
                                </div>
                                {items.map(r => (
                                  <button
                                    key={r.id}
                                    onClick={() => {
                                      setSelectedResource(r);
                                      setResourceDropdownOpen(false);
                                      setResourceSearch('');
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                      selectedResource.id === r.id 
                                        ? (isDarkMode ? 'bg-blue-500/20 text-blue-400 font-medium' : 'bg-blue-50 text-blue-600 font-medium')
                                        : (isDarkMode ? 'text-slate-300 hover:bg-slate-700/50' : 'text-slate-700 hover:bg-slate-50')
                                    }`}
                                  >
                                    {r.title}
                                  </button>
                                ))}
                              </div>
                            );
                          })}
                          {resources.filter(r => r.title.toLowerCase().includes(resourceSearch.toLowerCase())).length === 0 && (
                            <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              Dokumen tidak ditemukan
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reader Toolbar */}
                  <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                    <button 
                      onClick={() => changeFontSize(false)}
                      title="Perkecil Teks"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => changeFontSize(true)}
                      title="Perbesar Teks"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      title="Mode Gelap/Terang"
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    {toc.length > 0 && (
                      <button 
                        onClick={() => setShowToc(!showToc)}
                        title="Daftar Isi"
                        className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Table of Contents Drawer/Popup */}
                {showToc && toc.length > 0 && (
                  <div className={`absolute top-[70px] right-4 z-30 w-64 max-h-[60vh] overflow-y-auto rounded-xl shadow-xl border p-2 animate-in fade-in slide-in-from-top-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className={`flex items-center justify-between px-3 py-2 mb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                      <h4 className="text-sm font-bold">Daftar Isi</h4>
                      <button onClick={() => setShowToc(false)} className={`p-1 rounded-md ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}><X className="w-4 h-4"/></button>
                    </div>
                    <div className="space-y-1">
                      {toc.map(item => (
                        <button
                          key={item.id}
                          onClick={() => scrollToId(item.id)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            item.level === 'h1' ? 'font-bold' : 
                            item.level === 'h2' ? 'ml-2 font-medium' : 'ml-4 text-xs'
                          } ${isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          {item.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 md:p-10 pb-20">
                  <div className={`mb-8 border-b pb-6 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                        selectedResource.type === 'script' ? (isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700') :
                        selectedResource.type === 'sop' ? (isDarkMode ? 'bg-amber-900/50 text-amber-300' : 'bg-amber-100 text-amber-700') :
                        (isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700')
                      }`}>
                        {selectedResource.type}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Diperbarui {new Date(selectedResource.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <h1 className={`text-3xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedResource.title}
                    </h1>
                    {(() => {
                      const brand = displayBrands.find(b => b.id === selectedResource.brandId);
                      return (
                        <div className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Brand: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{brand?.name || 'Unknown'}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Typography Fix: Replace &nbsp; with normal space to allow natural word wrapping */}
                  <div 
                    ref={contentRef}
                    className={`prose ${fontSize} max-w-none transition-all duration-300 ${
                      isDarkMode 
                        ? 'prose-invert prose-slate prose-a:text-blue-400 hover:prose-a:text-blue-300' 
                        : 'prose-slate prose-a:text-blue-600 hover:prose-a:text-blue-700'
                    } break-words whitespace-normal [&_a]:break-all [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:shadow-sm`}
                    dangerouslySetInnerHTML={{ __html: ((selectedResource as any)._htmlWithIds || selectedResource.content).replace(/&nbsp;/g, ' ') }}
                  />
                </div>
              </div>
            ) : (
              <div className={`rounded-2xl shadow-sm border flex flex-col items-center justify-center p-12 text-center h-full min-h-[500px] transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <BookOpen className={`w-16 h-16 mb-4 ${isDarkMode ? 'text-slate-600' : 'text-slate-200'}`} />
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Pilih Dokumen</h3>
                <p className={`max-w-md ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
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

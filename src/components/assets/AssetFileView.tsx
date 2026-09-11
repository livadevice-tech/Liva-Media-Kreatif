import React, { useState, useMemo } from 'react';
import { 
  FolderArchive, 
  Search, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Folder, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  X, 
  Trash2, 
  Filter,
  Globe,
  Grid,
  List as ListIcon,
  Tag,
  Briefcase
} from 'lucide-react';
import { AssetFileItem, Brand, ContentPost, Task } from '../../types/app';

interface AssetFileViewProps {
  brands: Brand[];
  posts: ContentPost[];
  tasks: Task[];
  onOpenCalendar?: () => void;
}

const STORAGE_KEY = 'liva_custom_asset_files';

export const AssetFileView: React.FC<AssetFileViewProps> = ({
  brands,
  posts,
  tasks,
  onOpenCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Add Asset state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState<{
    title: string;
    url: string;
    type: AssetFileItem['type'];
    brand_id: string;
    notes: string;
  }>({
    title: '',
    url: '',
    type: 'gdrive',
    brand_id: brands[0]?.id || '',
    notes: '',
  });

  // Custom manual asset files stored locally
  const [manualAssets, setManualAssets] = useState<AssetFileItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'asset-default-1',
        title: 'Master Google Drive - Liva Creative Media Q3/Q4',
        url: 'https://drive.google.com/drive/folders/liva-master-assets-2026',
        type: 'gdrive',
        brand_id: 'b-liva',
        brand_name: 'Liva Creative Media',
        source: 'manual',
        notes: 'Folder utama asset foto, video raw footage, dan project files agency',
        created_at: new Date().toISOString(),
      },
      {
        id: 'asset-default-2',
        title: 'Figma UI/UX & Brand Design System Wardah',
        url: 'https://figma.com/@wardah-brand-system-2026',
        type: 'figma',
        brand_id: 'b-wardah',
        brand_name: 'Wardah Official',
        source: 'manual',
        notes: 'Komponen desain feed Instagram, carousel template & story guide',
        created_at: new Date().toISOString(),
      },
      {
        id: 'asset-default-3',
        title: 'Canva Template Bundling Promo 9.9',
        url: 'https://canva.com/design/wardah-promo-bundling-sale',
        type: 'canva',
        brand_id: 'b-wardah',
        brand_name: 'Wardah Official',
        source: 'manual',
        notes: 'Template materi promosi kilat TikTok & Instagram Story',
        created_at: new Date().toISOString(),
      },
    ];
  });

  const saveManualAssets = (items: AssetFileItem[]) => {
    setManualAssets(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  };

  // Helper to detect type from URL or text
  const detectType = (urlStr: string): AssetFileItem['type'] => {
    const lower = urlStr.toLowerCase();
    if (lower.includes('drive.google.com')) return 'gdrive';
    if (lower.includes('figma.com')) return 'figma';
    if (lower.includes('canva.com')) return 'canva';
    if (lower.match(/\.(mp4|mov|avi|mkv|webm)$/) || lower.includes('youtube') || lower.includes('tiktok.com')) return 'video';
    if (lower.match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) return 'image';
    if (lower.match(/\.(pdf|doc|docx|xls|xlsx|csv)$/)) return 'document';
    return 'other';
  };

  // Extract assets from content posts (media_urls)
  const calendarAssets = useMemo<AssetFileItem[]>(() => {
    const list: AssetFileItem[] = [];
    posts.forEach((p) => {
      if (p.media_urls && typeof p.media_urls === 'string' && p.media_urls.trim()) {
        const raw = p.media_urls.trim();
        // Support multiple comma-separated or space-separated URLs
        const urls = raw.split(/[\n,]+/).map((u) => u.trim()).filter((u) => u.startsWith('http') || u.includes('.'));
        if (urls.length > 0) {
          urls.forEach((u, i) => {
            list.push({
              id: `post-asset-${p.id}-${i}`,
              title: `${p.title} ${urls.length > 1 ? `(Asset ${i + 1})` : ''}`,
              url: u,
              type: detectType(u),
              brand_id: p.brand_id,
              brand_name: p.brand_name || brands.find((b) => b.id === p.brand_id)?.name || 'General',
              project_title: `Konten: ${p.pillar_name || 'Calendar'}`,
              source: 'calendar',
              notes: p.caption ? `Caption: ${p.caption.slice(0, 70)}...` : undefined,
              created_at: p.scheduled_at,
            });
          });
        } else if (raw.length > 5) {
          list.push({
            id: `post-asset-${p.id}`,
            title: p.title,
            url: raw,
            type: detectType(raw),
            brand_id: p.brand_id,
            brand_name: p.brand_name || brands.find((b) => b.id === p.brand_id)?.name || 'General',
            project_title: `Konten: ${p.pillar_name || 'Calendar'}`,
            source: 'calendar',
            created_at: p.scheduled_at,
          });
        }
      }
    });
    return list;
  }, [posts, brands]);

  // Extract assets from tasks (links)
  const taskAssets = useMemo<AssetFileItem[]>(() => {
    const list: AssetFileItem[] = [];
    tasks.forEach((t) => {
      if (t.links && typeof t.links === 'string' && t.links.trim()) {
        const raw = t.links.trim();
        const urls = raw.split(/[\n,]+/).map((u) => u.trim()).filter((u) => u.startsWith('http') || u.includes('.'));
        urls.forEach((u, i) => {
          list.push({
            id: `task-asset-${t.id}-${i}`,
            title: `${t.title} ${urls.length > 1 ? `(Tautan ${i + 1})` : ''}`,
            url: u,
            type: detectType(u),
            brand_name: t.brand_name || 'Project Task',
            project_title: t.project_title || 'Task Management',
            source: 'task',
            created_at: t.due_date,
          });
        });
      }
    });
    return list;
  }, [tasks]);

  // Combine all assets
  const allAssets = useMemo(() => {
    return [...manualAssets, ...calendarAssets, ...taskAssets];
  }, [manualAssets, calendarAssets, taskAssets]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return allAssets.filter((item) => {
      if (selectedBrand !== 'all') {
        const brandMatch = item.brand_id === selectedBrand || 
          (brands.find(b => b.id === selectedBrand)?.name.toLowerCase() === item.brand_name?.toLowerCase());
        if (!brandMatch) return false;
      }
      if (selectedCategory !== 'all' && item.type !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUrl = item.url.toLowerCase().includes(q);
        const matchBrand = item.brand_name?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchUrl && !matchBrand && !matchNotes) return false;
      }
      return true;
    });
  }, [allAssets, selectedBrand, selectedCategory, searchQuery, brands]);

  // Copy URL to clipboard
  const handleCopyLink = (item: AssetFileItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add new manual asset
  const handleAddAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.title.trim() || !newAsset.url.trim()) return;

    const brandObj = brands.find((b) => b.id === newAsset.brand_id);
    const createdItem: AssetFileItem = {
      id: `manual-${Date.now()}`,
      title: newAsset.title.trim(),
      url: newAsset.url.trim(),
      type: newAsset.type || detectType(newAsset.url),
      brand_id: newAsset.brand_id,
      brand_name: brandObj?.name || 'General',
      source: 'manual',
      notes: newAsset.notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    saveManualAssets([createdItem, ...manualAssets]);
    setIsAddModalOpen(false);
    setNewAsset({
      title: '',
      url: '',
      type: 'gdrive',
      brand_id: brands[0]?.id || '',
      notes: '',
    });
  };

  const handleDeleteManual = (id: string) => {
    saveManualAssets(manualAssets.filter((a) => a.id !== id));
  };

  // Type badge & icon helper
  const getTypeBadge = (type: AssetFileItem['type']) => {
    switch (type) {
      case 'gdrive':
        return {
          icon: <Folder className="w-4 h-4 text-blue-600" />,
          label: 'Google Drive',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'figma':
        return {
          icon: <Layers className="w-4 h-4 text-purple-600" />,
          label: 'Figma',
          badge: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'canva':
        return {
          icon: <Sparkles className="w-4 h-4 text-cyan-600" />,
          label: 'Canva',
          badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'video':
        return {
          icon: <Video className="w-4 h-4 text-rose-600" />,
          label: 'Video',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-4 h-4 text-emerald-600" />,
          label: 'Foto / Image',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'document':
        return {
          icon: <FileText className="w-4 h-4 text-amber-600" />,
          label: 'Dokumen',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      default:
        return {
          icon: <Globe className="w-4 h-4 text-slate-600" />,
          label: 'Media Link',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
      {/* Top Header */}
      <div className="h-18 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Asset File & Media Hub
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {allAssets.length} total file
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pusat penyimpanan link aset kreatif, Google Drive, Figma, Canva, dan media kampanye
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Asset File</span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      <div className="p-4 px-6 border-b border-slate-200/80 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari asset, brand, atau link..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Brand / Klien</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'gdrive', label: 'Google Drive' },
              { id: 'figma', label: 'Figma' },
              { id: 'canva', label: 'Canva' },
              { id: 'video', label: 'Video' },
              { id: 'document', label: 'Dokumen' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Tampilan Tabel / List"
          >
            <ListIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 custom-scrollbar">
        {filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 mb-3 shadow-2xs">
              <FolderArchive className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak ada asset file ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
              Coba ganti kata kunci pencarian atau tambahkan asset file baru menggunakan tombol di kanan atas.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Tambah Asset Baru
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((item) => {
              const typeInfo = getTypeBadge(item.type);
              const isCopied = copiedId === item.id;
              const linkUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Type & Brand */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badge}`}>
                        {typeInfo.icon}
                        <span>{typeInfo.label}</span>
                      </span>

                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                        {item.brand_name || 'General'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Notes or Project context */}
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    {/* Source label */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                        Sumber:
                      </span>
                      <span className="text-[10px] font-medium text-slate-600 truncate">
                        {item.source === 'calendar' ? 'Content Calendar' : item.source === 'task' ? 'Task Project' : 'Asset Manual'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 gap-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(item)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Salin Link Asset"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[11px]">{isCopied ? 'Tersalin!' : 'Salin'}</span>
                      </button>

                      {item.source === 'manual' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteManual(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Asset Manual"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span>Buka</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List View */
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Asset</th>
                  <th className="py-3 px-4">Jenis / Type</th>
                  <th className="py-3 px-4">Brand / Klien</th>
                  <th className="py-3 px-4">Sumber</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAssets.map((item) => {
                  const typeInfo = getTypeBadge(item.type);
                  const isCopied = copiedId === item.id;
                  const linkUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs truncate">
                        <div className="truncate" title={item.title}>{item.title}</div>
                        {item.notes && <div className="text-[10px] text-slate-400 truncate">{item.notes}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badge}`}>
                          {typeInfo.icon}
                          <span>{typeInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {item.brand_name || 'General'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {item.source === 'calendar' ? 'Content Calendar' : item.source === 'task' ? 'Task Project' : 'Asset Manual'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(item)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Salin Link"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          {item.source === 'manual' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteManual(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Asset File Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Asset File Baru</h3>
                  <p className="text-[11px] text-slate-400">Simpan tautan aset kreatif atau berkas kampanye</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Judul Asset <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Master Video Raw Footage Shopee 9.9"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand / Klien
                  </label>
                  <select
                    value={newAsset.brand_id}
                    onChange={(e) => setNewAsset({ ...newAsset, brand_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Asset
                  </label>
                  <select
                    value={newAsset.type}
                    onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="gdrive">Google Drive</option>
                    <option value="figma">Figma</option>
                    <option value="canva">Canva</option>
                    <option value="video">Video Footage</option>
                    <option value="image">Foto / Image Kit</option>
                    <option value="document">Dokumen / PDF</option>
                    <option value="other">Tautan Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL / Tautan Link <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... atau https://figma.com/..."
                    value={newAsset.url}
                    onChange={(e) => setNewAsset({ ...newAsset, url: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Catatan (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan akses folder, password, atau panduan penggunaan..."
                  value={newAsset.notes}
                  onChange={(e) => setNewAsset({ ...newAsset, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Asset File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

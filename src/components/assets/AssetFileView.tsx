import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  Edit2,
  Lock,
  Globe2,
  ShieldAlert,
  UploadCloud,
  Paperclip,
  FileCheck,
  Loader2
} from 'lucide-react';
import { appApi } from '../../services/appApi';
import { AssetFileItem, Brand, ContentPost, Task, Project, UserAccount } from '../../types/app';

interface AssetFileViewProps {
  brands: Brand[];
  projects?: Project[];
  posts: ContentPost[];
  tasks: Task[];
  currentUser?: UserAccount | null;
  onOpenCalendar?: () => void;
}

const STORAGE_KEY = 'liva_custom_asset_files';

export const AssetFileView: React.FC<AssetFileViewProps> = ({
  brands,
  projects = [],
  posts,
  tasks,
  currentUser,
  onOpenCalendar,
}) => {
  const isMasterAdmin = currentUser?.role === 'Master Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState<'all' | 'Internal' | 'Client'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Hidden/deleted asset IDs (persisted in localStorage so users can delete calendar/task/manual assets)
  const [deletedAssetIds, setDeletedAssetIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('liva_deleted_asset_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveDeletedAssetIds = (ids: string[]) => {
    setDeletedAssetIds(ids);
    try {
      localStorage.setItem('liva_deleted_asset_ids', JSON.stringify(ids));
    } catch {}
  };

  // Sidebar CRUD Asset state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [assetForm, setAssetForm] = useState<{
    id?: string;
    title: string;
    url: string;
    type: AssetFileItem['type'];
    project_type: 'Internal' | 'Client';
    notes: string;
    file_name?: string;
    file_size?: number;
    is_attached?: boolean;
  }>({
    title: '',
    url: '',
    type: 'gdrive',
    project_type: 'Client',
    notes: '',
    file_name: undefined,
    file_size: undefined,
    is_attached: false,
  });

  const openSidebarForCreate = () => {
    setEditingAssetId(null);
    setUploadError(null);
    setAssetForm({
      title: '',
      url: '',
      type: 'gdrive',
      project_type: 'Client',
      notes: '',
      file_name: undefined,
      file_size: undefined,
      is_attached: false,
    });
    setIsSidebarOpen(true);
  };

  const openSidebarForEdit = (item: AssetFileItem) => {
    setEditingAssetId(item.id);
    setUploadError(null);
    setAssetForm({
      id: item.id,
      title: item.title,
      url: item.url,
      type: item.type,
      project_type: (item.project_type === 'Internal' || item.brand_name === 'Internal') ? 'Internal' : 'Client',
      notes: item.notes || '',
      file_name: item.file_name,
      file_size: item.file_size,
      is_attached: !!item.is_attached,
    });
    setIsSidebarOpen(true);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setEditingAssetId(null);
    setUploadError(null);
  };

  // Handle local PDF / Image file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 50 MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await appApi.uploadAssetFile(file);
      if (res && res.url) {
        // Auto fill title if empty
        const autoTitle = assetForm.title.trim() 
          ? assetForm.title 
          : file.name.replace(/\.[^/.]+$/, '');

        setAssetForm((prev) => ({
          ...prev,
          title: autoTitle,
          url: res.url,
          type: res.fileType as any,
          file_name: file.name,
          file_size: file.size,
          is_attached: true,
        }));
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err.message || 'Gagal mengunggah file. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  // Remove attached file
  const handleRemoveAttachment = () => {
    setAssetForm((prev) => ({
      ...prev,
      url: '',
      file_name: undefined,
      file_size: undefined,
      is_attached: false,
    }));
  };

  // Drag resize handler for sidebar
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newW = Math.max(380, Math.min(window.innerWidth - 80, window.innerWidth - e.clientX));
      setSidebarWidth(newW);
    };
    const handleMouseUp = () => setIsResizing(false);
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
        project_type: 'Internal',
        brand_name: 'Internal',
        source: 'manual',
        notes: 'Folder utama asset foto, video raw footage, dan project files agency',
        created_at: new Date().toISOString(),
      },
      {
        id: 'asset-default-2',
        title: 'Figma UI/UX & Brand Design System Client',
        url: 'https://figma.com/@client-brand-system-2026',
        type: 'figma',
        project_type: 'Client',
        brand_name: 'Client',
        source: 'manual',
        notes: 'Komponen desain feed Instagram, carousel template & story guide',
        created_at: new Date().toISOString(),
      },
      {
        id: 'asset-default-3',
        title: 'Canva Template Bundling Promo 9.9',
        url: 'https://canva.com/design/client-promo-bundling-sale',
        type: 'canva',
        project_type: 'Client',
        brand_name: 'Client',
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

  // Map helper to determine if a project is Internal or Client
  const getProjectType = (projectId?: string): 'Internal' | 'Client' => {
    if (!projectId) return 'Client';
    const found = projects.find(p => p.id === projectId);
    if (found && found.project_type) {
      return (found.project_type.toLowerCase() === 'internal') ? 'Internal' : 'Client';
    }
    return 'Client';
  };

  // Extract assets from content posts (media_urls)
  const calendarAssets = useMemo<AssetFileItem[]>(() => {
    const list: AssetFileItem[] = [];
    posts.forEach((p) => {
      if (p.media_urls && typeof p.media_urls === 'string' && p.media_urls.trim()) {
        const raw = p.media_urls.trim();
        const pType = getProjectType(p.project_id);
        const urls = raw.split(/[\n,]+/).map((u) => u.trim()).filter((u) => u.startsWith('http') || u.includes('.'));
        if (urls.length > 0) {
          urls.forEach((u, i) => {
            list.push({
              id: `post-asset-${p.id}-${i}`,
              title: `${p.title} ${urls.length > 1 ? `(Asset ${i + 1})` : ''}`,
              url: u,
              type: detectType(u),
              project_type: pType,
              brand_name: pType,
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
            project_type: pType,
            brand_name: pType,
            project_title: `Konten: ${p.pillar_name || 'Calendar'}`,
            source: 'calendar',
            created_at: p.scheduled_at,
          });
        }
      }
    });
    return list;
  }, [posts, projects]);

  // Extract assets from tasks (links)
  const taskAssets = useMemo<AssetFileItem[]>(() => {
    const list: AssetFileItem[] = [];
    tasks.forEach((t) => {
      // Keamanan visibilitas: task private hanya diekstrak jika Master Admin
      if (t.visibility === 'private' && !isMasterAdmin) return;

      if (t.links && typeof t.links === 'string' && t.links.trim()) {
        const raw = t.links.trim();
        const pType = getProjectType(t.project_id);
        const urls = raw.split(/[\n,]+/).map((u) => u.trim()).filter((u) => u.startsWith('http') || u.includes('.'));
        urls.forEach((u, i) => {
          list.push({
            id: `task-asset-${t.id}-${i}`,
            title: `${t.title} ${urls.length > 1 ? `(Tautan ${i + 1})` : ''}`,
            url: u,
            type: detectType(u),
            project_type: pType,
            brand_name: pType,
            project_title: t.project_title || 'Task Management',
            source: 'task',
            created_at: t.due_date,
          });
        });
      }
    });
    return list;
  }, [tasks, projects, isMasterAdmin]);

  // Combine all assets and filter out any deleted assets
  const allAssets = useMemo(() => {
    const combined = [...manualAssets, ...calendarAssets, ...taskAssets];
    return combined.filter((item) => !deletedAssetIds.includes(item.id));
  }, [manualAssets, calendarAssets, taskAssets, deletedAssetIds]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    return allAssets.filter((item) => {
      if (selectedProjectType !== 'all') {
        const itemType = item.project_type || (item.brand_name?.toLowerCase() === 'internal' ? 'Internal' : 'Client');
        if (itemType !== selectedProjectType) return false;
      }
      if (selectedCategory !== 'all' && item.type !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchUrl = item.url.toLowerCase().includes(q);
        const matchType = item.project_type?.toLowerCase().includes(q);
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchUrl && !matchType && !matchNotes) return false;
      }
      return true;
    });
  }, [allAssets, selectedProjectType, selectedCategory, searchQuery]);

  // Copy URL to clipboard
  const handleCopyLink = (item: AssetFileItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save asset (Create or Edit)
  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.title.trim() || !assetForm.url.trim()) return;

    if (editingAssetId) {
      const isExistingManual = manualAssets.some((m) => m.id === editingAssetId);
      if (isExistingManual) {
        // Edit existing manual asset
        const updated = manualAssets.map((item) => {
          if (item.id === editingAssetId) {
            return {
              ...item,
              title: assetForm.title.trim(),
              url: assetForm.url.trim(),
              type: assetForm.type || detectType(assetForm.url),
              project_type: assetForm.project_type,
              brand_name: assetForm.project_type,
              notes: assetForm.notes.trim() || undefined,
              file_name: assetForm.file_name,
              file_size: assetForm.file_size,
              is_attached: assetForm.is_attached,
            };
          }
          return item;
        });
        saveManualAssets(updated);
      } else {
        // Editing a calendar or task asset: hide the original ID and add it as a new customized manual asset
        const customizedItem: AssetFileItem = {
          id: `manual-custom-${Date.now()}`,
          title: assetForm.title.trim(),
          url: assetForm.url.trim(),
          type: assetForm.type || detectType(assetForm.url),
          project_type: assetForm.project_type,
          brand_name: assetForm.project_type,
          source: 'manual',
          notes: assetForm.notes.trim() || undefined,
          file_name: assetForm.file_name,
          file_size: assetForm.file_size,
          is_attached: assetForm.is_attached,
          created_at: new Date().toISOString(),
        };
        saveDeletedAssetIds([...deletedAssetIds, editingAssetId]);
        saveManualAssets([customizedItem, ...manualAssets]);
      }
    } else {
      // Create new manual asset
      const createdItem: AssetFileItem = {
        id: `manual-${Date.now()}`,
        title: assetForm.title.trim(),
        url: assetForm.url.trim(),
        type: assetForm.type || detectType(assetForm.url),
        project_type: assetForm.project_type,
        brand_name: assetForm.project_type,
        source: 'manual',
        notes: assetForm.notes.trim() || undefined,
        file_name: assetForm.file_name,
        file_size: assetForm.file_size,
        is_attached: assetForm.is_attached,
        created_at: new Date().toISOString(),
      };
      saveManualAssets([createdItem, ...manualAssets]);
    }

    closeSidebar();
  };

  const handleDeleteAsset = (item: AssetFileItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus asset file "${item.title}"?`)) {
      if (item.source === 'manual') {
        saveManualAssets(manualAssets.filter((a) => a.id !== item.id));
      } else {
        // Mark non-manual asset as deleted so it disappears from view
        saveDeletedAssetIds([...deletedAssetIds, item.id]);
      }
      if (editingAssetId === item.id) {
        closeSidebar();
      }
    }
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

        <div className="flex items-center gap-2.5">
          <button
            onClick={openSidebarForCreate}
            className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Asset File</span>
          </button>
        </div>
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

          {/* Jenis Project Filter (Internal / Client) */}
          <select
            value={selectedProjectType}
            onChange={(e) => setSelectedProjectType(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Project (Internal / Client)</option>
            <option value="Internal">Internal</option>
            <option value="Client">Client</option>
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
      {/* Main Content & Sidebar Layout */}
      <div className="flex-1 flex overflow-hidden relative">
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
                onClick={openSidebarForCreate}
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

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md truncate max-w-[120px] ${
                          (item.project_type === 'Internal' || item.brand_name === 'Internal')
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {item.project_type || item.brand_name || 'Client'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>

                      {/* File attachment indicator */}
                      {item.is_attached && (
                        <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] text-slate-600 truncate">
                          <Paperclip className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="font-medium truncate">{item.file_name || 'Berkas Terlampir'}</span>
                          {item.file_size && (
                            <span className="text-slate-400 shrink-0">({(item.file_size / (1024 * 1024)).toFixed(2)} MB)</span>
                          )}
                        </div>
                      )}

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
                          className="px-2 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Salin Link Asset"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span className="text-[11px]">{isCopied ? 'Tersalin!' : 'Salin'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openSidebarForEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Asset"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
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
                    <th className="py-3 px-4">Jenis Project</th>
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
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="truncate" title={item.title}>{item.title}</span>
                            {item.is_attached && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0" title={item.file_name || 'Berkas Terlampir'}>
                                <Paperclip className="w-2.5 h-2.5 text-indigo-600" />
                                <span>Lampiran</span>
                              </span>
                            )}
                          </div>
                          {item.file_name && item.is_attached && (
                            <div className="text-[10px] text-indigo-600 font-medium truncate flex items-center gap-1 mt-0.5">
                              <span>📎 {item.file_name}</span>
                              {item.file_size && <span className="text-slate-400 font-normal">({(item.file_size / (1024 * 1024)).toFixed(2)} MB)</span>}
                            </div>
                          )}
                          {item.notes && <div className="text-[10px] text-slate-400 truncate">{item.notes}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeInfo.badge}`}>
                            {typeInfo.icon}
                            <span>{typeInfo.label}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            (item.project_type === 'Internal' || item.brand_name === 'Internal')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {item.project_type || item.brand_name || 'Client'}
                          </span>
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
                            <button
                              type="button"
                              onClick={() => openSidebarForEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Asset"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAsset(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Asset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* Sidebar Drawer: Tambah / Edit Asset File */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in duration-150">
            <aside
              style={{ width: `${sidebarWidth}px` }}
              className="relative h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200"
            >
              {/* Resize Handle */}
              <div
                onMouseDown={() => setIsResizing(true)}
                className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-50 hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors flex items-center justify-center group"
                title="Tarik untuk mengubah ukuran sidebar"
              >
                <div className="w-1 h-8 rounded-full bg-slate-300 group-hover:bg-indigo-500" />
              </div>

              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
                    <FolderArchive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {editingAssetId ? 'Edit Asset File' : 'Tambah Asset File Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingAssetId ? 'Perbarui informasi tautan atau berkas asset' : 'Simpan tautan aset kreatif atau berkas kampanye'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Preset Width Buttons */}
                  <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg mr-1 text-[10px] font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setSidebarWidth(420)}
                      className={`px-1.5 py-0.5 rounded ${sidebarWidth === 420 ? 'bg-white shadow-2xs text-indigo-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Compact
                    </button>
                    <button
                      type="button"
                      onClick={() => setSidebarWidth(560)}
                      className={`px-1.5 py-0.5 rounded ${sidebarWidth === 560 ? 'bg-white shadow-2xs text-indigo-600 font-bold' : 'hover:text-slate-900'}`}
                    >
                      Wide
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={closeSidebar}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Tutup Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sidebar Form Body */}
              <form onSubmit={handleSaveAsset} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama / Judul Asset <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Master Video Raw Footage Shopee 9.9"
                      value={assetForm.title}
                      onChange={(e) => setAssetForm({ ...assetForm, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jenis Project <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={assetForm.project_type}
                        onChange={(e) => setAssetForm({ ...assetForm, project_type: e.target.value as 'Internal' | 'Client' })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="Internal">Internal</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jenis Asset
                      </label>
                      <select
                        value={assetForm.type}
                        onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value as any })}
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

                  {/* Upload / Attach File (PDF / Gambar) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Lampirkan File (PDF / Gambar)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">Opsional (Maks. 50 MB)</span>
                    </div>

                    {assetForm.is_attached && assetForm.url ? (
                      /* Attached File Preview Card */
                      <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                            {assetForm.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate" title={assetForm.file_name || 'File Terlampir'}>
                              {assetForm.file_name || 'Berkas Terlampir'}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-semibold text-indigo-600 uppercase">
                                {assetForm.type === 'image' ? 'Foto / Gambar' : 'Dokumen PDF'}
                              </span>
                              {assetForm.file_size && (
                                <span>• {(assetForm.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                              )}
                              <span>• Tersimpan di Server</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={assetForm.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-white text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                            title="Buka Berkas"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={handleRemoveAttachment}
                            className="p-1.5 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Hapus Lampiran"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop or Click File Picker */
                      <label className={`group border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        isUploading 
                          ? 'border-indigo-400 bg-indigo-50/50 cursor-wait'
                          : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
                      }`}>
                        <input
                          type="file"
                          accept="image/*,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,.svg"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2 py-1">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                            <span className="text-xs font-semibold text-indigo-700">Sedang mengunggah file...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1.5 py-1">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform shadow-2xs">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-700">
                              Klik untuk pilih <span className="text-indigo-600">Foto / PDF</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Format: JPG, PNG, WEBP, SVG, atau PDF (Otomatis generate URL)
                            </div>
                          </div>
                        )}
                      </label>
                    )}

                    {uploadError && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700">
                        URL / Tautan Link <span className="text-rose-500">*</span>
                      </label>
                      {assetForm.is_attached && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          <span>Terisi otomatis dari upload</span>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="https://drive.google.com/... atau tautan file"
                        value={assetForm.url}
                        onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Keterangan / Catatan (Opsional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Catatan akses folder, password, briefing, atau panduan penggunaan..."
                      value={assetForm.notes}
                      onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {editingAssetId && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteManual(editingAssetId)}
                        className="w-full py-2 px-3 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Asset Ini</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeSidebar}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                  >
                    {editingAssetId ? 'Simpan Perubahan' : 'Tambah Asset File'}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};


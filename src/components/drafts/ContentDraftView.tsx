import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Link as LinkIcon, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Layers,
  LayoutGrid,
  List as ListIcon,
  X,
  Share2,
  Tag,
  Copy,
  Check,
  User,
  FileText
} from 'lucide-react';
import { 
  ContentPost, 
  Brand, 
  Project, 
  ContentPillar, 
  ContentStatus, 
  ContentPlatform,
  UserAccount 
} from '../../types/app';
import { ContentDraftModal } from './ContentDraftModal';
import { ScheduleToCalendarModal } from './ScheduleToCalendarModal';

interface ContentDraftViewProps {
  posts: ContentPost[];
  brands: Brand[];
  projects: Project[];
  pillars: ContentPillar[];
  accounts?: UserAccount[];
  onSavePost: (post: Partial<ContentPost>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, status: ContentStatus) => Promise<void>;
  onOpenCalendar?: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; icon: string }> = {
  drafting: { label: 'Drafting', badge: 'bg-amber-50 text-amber-800 border-amber-200', icon: '📝' },
  idea: { label: 'Ide Baru', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: '💡' },
  review: { label: 'Dalam Review', badge: 'bg-purple-50 text-purple-700 border-purple-200', icon: '🔍' },
  approved: { label: 'Disetujui', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: '👍' },
  scheduled: { label: 'Sudah di Kalender', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold', icon: '📅' },
  published: { label: 'Sudah Tayang', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: '🚀' },
};

const PLATFORM_CONFIG: Record<string, { label: string; icon: string; badge: string }> = {
  instagram: { label: 'Instagram', icon: '📸', badge: 'bg-pink-50 text-pink-700 border-pink-200' },
  tiktok: { label: 'TikTok', icon: '🎵', badge: 'bg-slate-900 text-white border-slate-900' },
  youtube: { label: 'YouTube', icon: '▶️', badge: 'bg-red-50 text-red-700 border-red-200' },
  facebook: { label: 'Facebook', icon: '👥', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  twitter: { label: 'Twitter / X', icon: '🐦', badge: 'bg-slate-100 text-slate-800 border-slate-300' },
  linkedin: { label: 'LinkedIn', icon: '💼', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
};

export const ContentDraftView: React.FC<ContentDraftViewProps> = ({
  posts,
  brands,
  projects,
  pillars,
  accounts = [],
  onSavePost,
  onDeletePost,
  onUpdateStatus,
  onOpenCalendar,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all_drafts');

  // Modal states
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<ContentPost> | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [postToSchedule, setPostToSchedule] = useState<ContentPost | null>(null);

  // Hook copy feedback
  const [copiedHookId, setCopiedHookId] = useState<string | null>(null);

  // Map brand helper
  const getBrandName = (brandId?: string) => {
    if (!brandId) return 'Brand General';
    const found = brands.find((b) => b.id === brandId);
    return found ? found.name : 'Brand General';
  };

  // Filter posts
  const filteredDrafts = useMemo(() => {
    return posts.filter((p) => {
      // Status tab filter
      if (selectedStatusTab === 'all_drafts') {
        // Show non-scheduled or drafting/idea/review
        if (p.status === 'scheduled' || p.status === 'published') return false;
      } else if (selectedStatusTab !== 'all') {
        if (p.status !== selectedStatusTab) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        if (p.brand_id !== selectedBrand) return false;
      }

      // Platform filter
      if (selectedPlatform !== 'all') {
        if (p.platform !== selectedPlatform) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title?.toLowerCase().includes(q);
        const matchHook = p.hook?.toLowerCase().includes(q);
        const matchCaption = p.caption?.toLowerCase().includes(q);
        const matchPillar = p.pillar_name?.toLowerCase().includes(q);
        const matchBrand = getBrandName(p.brand_id).toLowerCase().includes(q);
        const matchAssignee = (p.assignee_copy || '').toLowerCase().includes(q) || (p.assignee_design || '').toLowerCase().includes(q);
        if (!matchTitle && !matchHook && !matchCaption && !matchPillar && !matchBrand && !matchAssignee) {
          return false;
        }
      }

      return true;
    });
  }, [posts, selectedStatusTab, selectedBrand, selectedPlatform, searchQuery, brands]);

  // Counts for tabs
  const counts = useMemo(() => {
    const allDraftsCount = posts.filter((p) => p.status !== 'scheduled' && p.status !== 'published').length;
    const draftingCount = posts.filter((p) => p.status === 'drafting').length;
    const ideaCount = posts.filter((p) => p.status === 'idea').length;
    const reviewCount = posts.filter((p) => p.status === 'review').length;
    const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
    return {
      all_drafts: allDraftsCount,
      drafting: draftingCount,
      idea: ideaCount,
      review: reviewCount,
      scheduled: scheduledCount,
      total: posts.length,
    };
  }, [posts]);

  // Handlers
  const handleCopyHook = (id: string, hookText?: string) => {
    if (!hookText) return;
    navigator.clipboard.writeText(hookText);
    setCopiedHookId(id);
    setTimeout(() => setCopiedHookId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingPost({
      title: '',
      brand_id: brands[0]?.id || '',
      pillar_name: pillars[0]?.name || 'Edukasi & Tips',
      platform: 'instagram',
      content_type: 'reels',
      status: 'drafting',
      hook: '',
      caption: '',
      assignee_copy: '',
      assignee_design: '',
    });
    setIsDraftModalOpen(true);
  };

  const handleOpenEditModal = (post: ContentPost) => {
    setEditingPost(post);
    setIsDraftModalOpen(true);
  };

  const handleOpenScheduleModal = (post: ContentPost) => {
    setPostToSchedule(post);
    setIsScheduleModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus draft konten: "${title}"?`)) {
      await onDeletePost(id);
    }
  };

  // Helper to parse media urls string or array
  const parseMediaUrls = (val?: any): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return val.split(',').map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* 1. Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Draft Konten
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {counts.all_drafts} Draft Belum Terjadwal
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bank konten & ide yang sedang disusun sebelum dijadwalkan ke Kalender Konten
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle: Card vs List */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Card (Grid)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Card</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel (List)"
              >
                <ListIcon className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Buat Draft Baru Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Draft Baru</span>
            </button>
          </div>
        </div>

        {/* 2. Filters & Search Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedStatusTab('all_drafts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedStatusTab === 'all_drafts'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Semua Draft ({counts.all_drafts})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('drafting')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedStatusTab === 'drafting'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Drafting ({counts.drafting})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('idea')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedStatusTab === 'idea'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Ide Baru ({counts.idea})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('review')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedStatusTab === 'review'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Dalam Review ({counts.review})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatusTab('scheduled')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                selectedStatusTab === 'scheduled'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Sudah di Kalender ({counts.scheduled})
            </button>
          </div>

          {/* Search, Brand, & Platform Dropdowns */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari draft, hook, naskah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Platform</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Content: Card Grid vs List Table */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {filteredDrafts.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Draft Konten yang Sesuai
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 mb-5 leading-relaxed">
              {searchQuery || selectedBrand !== 'all' || selectedPlatform !== 'all'
                ? 'Tidak ada hasil untuk filter pencarian Anda. Coba reset filter.'
                : 'Mulai buat draft konten baru dengan isi lengkap seperti di Content Calendar!'}
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Draft Konten Sekarang</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* CARD MODE (GRID) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrafts.map((post) => {
              const platformInfo = PLATFORM_CONFIG[post.platform] || { label: post.platform, icon: '📱', badge: 'bg-slate-100 text-slate-700' };
              const statusInfo = STATUS_CONFIG[post.status] || { label: post.status, badge: 'bg-slate-100 text-slate-700', icon: '📝' };
              const mediaList = parseMediaUrls(post.media_urls);

              return (
                <div
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Brand, Platform, Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/80">
                          {getBrandName(post.brand_id)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${platformInfo.badge}`}>
                          <span>{platformInfo.icon}</span>
                          <span>{platformInfo.label}</span>
                        </span>
                      </div>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                    </div>

                    {/* Pilar & Format Pills */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.pillar_name && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                          {post.pillar_name}
                        </span>
                      )}
                      {post.content_type && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                          {post.content_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {/* Judul Konten */}
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {post.title}
                    </h3>

                    {/* Hook Box (3 Detik Pertama) */}
                    {post.hook && (
                      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 space-y-1 relative group/hook">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            HOOK (3 DETIK PERTAMA)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyHook(post.id, post.hook)}
                            className="text-[10px] font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors cursor-pointer"
                            title="Salin naskah hook"
                          >
                            {copiedHookId === post.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-800 italic leading-relaxed">
                          "{post.hook}"
                        </p>
                      </div>
                    )}

                    {/* Caption Preview */}
                    {post.caption && (
                      <div className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                        {post.caption}
                      </div>
                    )}

                    {/* Media / Reference Link Chips */}
                    {mediaList.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          <span>REFERENSI & LAMPIRAN:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mediaList.map((url, idx) => {
                            let label = 'Link ' + (idx + 1);
                            try {
                              const u = new URL(url);
                              label = u.hostname.replace('www.', '');
                            } catch {}

                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors"
                              >
                                <span className="truncate max-w-[120px]">{label}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PIC Tim Info */}
                    {(post.assignee_copy || post.assignee_design) && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                        {post.assignee_copy && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                              CP
                            </span>
                            <span className="truncate max-w-[100px]">{post.assignee_copy}</span>
                          </div>
                        )}
                        {post.assignee_design && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-bold text-[9px] flex items-center justify-center">
                              DS
                            </span>
                            <span className="truncate max-w-[100px]">{post.assignee_design}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Jadwalkan ke Kalender Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenScheduleModal(post)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        post.status === 'scheduled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {post.status === 'scheduled' ? 'Terjadwal (Atur Ulang)' : 'Jadwalkan ke Kalender'}
                      </span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(post)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                      title="Edit Draft Konten"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus Draft Konten"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST MODE (TABLE) */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3.5">Judul Konten & Hook</th>
                    <th className="p-3.5">Brand / Klien</th>
                    <th className="p-3.5">Platform & Format</th>
                    <th className="p-3.5">Pilar Konten</th>
                    <th className="p-3.5">PIC Tim</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Rencana Tayang</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrafts.map((post) => {
                    const platformInfo = PLATFORM_CONFIG[post.platform] || { label: post.platform, icon: '📱', badge: 'bg-slate-100 text-slate-700' };
                    const statusInfo = STATUS_CONFIG[post.status] || { label: post.status, badge: 'bg-slate-100 text-slate-700', icon: '📝' };

                    return (
                      <tr 
                        key={post.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* Judul & Hook */}
                        <td className="p-3.5 max-w-xs">
                          <div className="font-bold text-slate-900 leading-snug line-clamp-2">
                            {post.title}
                          </div>
                          {post.hook && (
                            <div className="text-[11px] text-amber-800 italic mt-0.5 line-clamp-1">
                              "{post.hook}"
                            </div>
                          )}
                        </td>

                        {/* Brand */}
                        <td className="p-3.5 font-medium text-slate-700 whitespace-nowrap">
                          {getBrandName(post.brand_id)}
                        </td>

                        {/* Platform & Format */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 ${platformInfo.badge}`}>
                              <span>{platformInfo.icon}</span>
                              <span>{platformInfo.label}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium capitalize">
                              {post.content_type?.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        {/* Pilar Konten */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                            {post.pillar_name || '-'}
                          </span>
                        </td>

                        {/* PIC Tim */}
                        <td className="p-3.5 whitespace-nowrap text-slate-600">
                          <div className="text-[11px]">
                            {post.assignee_copy && <div>Copy: {post.assignee_copy}</div>}
                            {post.assignee_design && <div>Design: {post.assignee_design}</div>}
                            {!post.assignee_copy && !post.assignee_design && <span className="text-slate-400">-</span>}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badge}`}>
                            {statusInfo.icon} {statusInfo.label}
                          </span>
                        </td>

                        {/* Rencana Tayang */}
                        <td className="p-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                          {post.scheduled_at ? post.scheduled_at.slice(0, 16) : <span className="text-slate-400 font-sans italic">Belum Ada</span>}
                        </td>

                        {/* Aksi */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenScheduleModal(post)}
                              className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Jadwalkan ke Kalender"
                            >
                              <CalendarIcon className="w-3 h-3" />
                              <span>Jadwalkan</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(post)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Konten"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Konten"
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
          </div>
        )}
      </div>

      {/* 4. Content Draft Edit / Create Modal */}
      {isDraftModalOpen && (
        <ContentDraftModal
          isOpen={isDraftModalOpen}
          onClose={() => setIsDraftModalOpen(false)}
          onSave={onSavePost}
          initialPost={editingPost}
          brands={brands}
          pillars={pillars}
          accounts={accounts}
        />
      )}

      {/* 5. Quick Schedule to Calendar Modal */}
      {isScheduleModalOpen && (
        <ScheduleToCalendarModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setPostToSchedule(null);
          }}
          post={postToSchedule}
          brands={brands}
          onSchedule={onSavePost}
          onSuccessNavigateToCalendar={onOpenCalendar}
        />
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit2, 
  Sparkles, 
  Link as LinkIcon, 
  Image as ImageIcon,
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Layers,
  LayoutGrid,
  List as ListIcon,
  X,
  Share2,
  Tag
} from 'lucide-react';
import { 
  ContentDraftItem, 
  Brand, 
  Project, 
  ContentPillar, 
  DraftStatus, 
  ContentPlatform 
} from '../../types/app';
import { DraftFormModal } from './DraftFormModal';
import { ScheduleToCalendarModal } from './ScheduleToCalendarModal';

interface ContentDraftViewProps {
  drafts: ContentDraftItem[];
  brands: Brand[];
  projects: Project[];
  pillars: ContentPillar[];
  onSaveDraft: (draft: Partial<ContentDraftItem>) => Promise<void>;
  onDeleteDraft: (id: string) => Promise<void>;
  onScheduleDraft: (id: string, payload: {
    scheduled_at: string;
    brand_id?: string;
    platform?: string;
    content_type?: string;
  }) => Promise<void>;
  onOpenCalendar?: () => void;
}

const STATUS_CONFIG: Record<DraftStatus, { label: string; badge: string; icon: string }> = {
  idea: { label: 'Ide Baru', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: '💡' },
  research: { label: 'Dalam Riset', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: '🔍' },
  ready: { label: 'Siap Dijadwalkan', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold', icon: '✅' },
  scheduled: { label: 'Sudah di Kalender', badge: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold', icon: '📅' },
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-50 text-pink-700 border-pink-100',
  tiktok: 'bg-slate-900 text-white',
  youtube: 'bg-rose-50 text-rose-700 border-rose-100',
  facebook: 'bg-blue-50 text-blue-700 border-blue-100',
  twitter: 'bg-sky-50 text-sky-700 border-sky-100',
  linkedin: 'bg-blue-50 text-blue-800 border-blue-200',
};

export const ContentDraftView: React.FC<ContentDraftViewProps> = ({
  drafts,
  brands,
  projects,
  pillars,
  onSaveDraft,
  onDeleteDraft,
  onScheduleDraft,
  onOpenCalendar,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDraft, setEditingDraft] = useState<Partial<ContentDraftItem> | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [draftToSchedule, setDraftToSchedule] = useState<ContentDraftItem | null>(null);

  // Filtered drafts
  const filteredDrafts = useMemo(() => {
    return drafts.filter(draft => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = draft.title?.toLowerCase().includes(q);
        const matchHook = draft.hook?.toLowerCase().includes(q);
        const matchConcept = draft.concept?.toLowerCase().includes(q);
        const matchRef = draft.reference_urls?.toLowerCase().includes(q);
        const matchBrand = draft.brand_name?.toLowerCase().includes(q);
        if (!matchTitle && !matchHook && !matchConcept && !matchRef && !matchBrand) return false;
      }
      // Brand
      if (selectedBrand !== 'all' && draft.brand_id !== selectedBrand) return false;
      // Platform
      if (selectedPlatform !== 'all' && draft.platform !== selectedPlatform) return false;
      // Status
      if (selectedStatus !== 'all' && draft.status !== selectedStatus) return false;

      return true;
    });
  }, [drafts, searchQuery, selectedBrand, selectedPlatform, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const unscheduled = drafts.filter(d => d.status !== 'scheduled').length;
    const ready = drafts.filter(d => d.status === 'ready').length;
    const scheduled = drafts.filter(d => d.status === 'scheduled').length;
    return { total: drafts.length, unscheduled, ready, scheduled };
  }, [drafts]);

  // Handlers
  const handleCreateNew = () => {
    setEditingDraft(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (draft: ContentDraftItem) => {
    setEditingDraft(draft);
    setIsFormModalOpen(true);
  };

  const handleDelete = async (draft: ContentDraftItem) => {
    if (window.confirm(`Hapus draft ide konten "${draft.title}"?`)) {
      await onDeleteDraft(draft.id);
    }
  };

  const handleOpenScheduleModal = (draft: ContentDraftItem) => {
    setDraftToSchedule(draft);
    setIsScheduleModalOpen(true);
  };

  // Helper to parse reference URLs
  const parseUrls = (text?: string): string[] => {
    if (!text) return [];
    return text
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://'));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* 1. TOP HEADER */}
      <header className="h-18 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Lightbulb className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Draft Konten & Bank Ide
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {stats.unscheduled} Ide Belum Masuk Kalender
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Kelola ide konten kreatif, hook, dan referensi sebelum dijadwalkan ke Calender Content
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenCalendar && (
            <button
              onClick={onOpenCalendar}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka Kalender</span>
            </button>
          )}

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold shadow-sm shadow-amber-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ide Konten</span>
          </button>
        </div>
      </header>

      {/* 2. FILTER & TOOLBAR */}
      <div className="p-6 pb-2 space-y-3 shrink-0">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul ide, hook, konsep, link referensi..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-9 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-amber-500 shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & View Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:outline-amber-500 cursor-pointer"
            >
              <option value="all">Semua Brand</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs focus:outline-amber-500 cursor-pointer capitalize"
            >
              <option value="all">Semua Platform</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter / X</option>
            </select>

            {/* Grid / List Switcher */}
            <div className="bg-slate-200/70 p-0.5 rounded-xl flex items-center shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Kartu (Grid)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tampilan Tabel (List)"
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'Semua Ide', count: stats.total },
            { id: 'idea', label: '💡 Ide Baru', count: drafts.filter(d => d.status === 'idea').length },
            { id: 'research', label: '🔍 Dalam Riset', count: drafts.filter(d => d.status === 'research').length },
            { id: 'ready', label: '✅ Siap Dijadwalkan', count: stats.ready },
            { id: 'scheduled', label: '📅 Sudah Terjadwal', count: stats.scheduled },
          ].map(tab => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white font-bold shadow-xs'
                    : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 shadow-2xs'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DRAFTS CONTENT VIEW (GRID OR LIST) */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 custom-scrollbar">
        {filteredDrafts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto mt-6 space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-2xs">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              Tidak Ada Ide Konten yang Ditemukan
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Kumpulkan ide-ide konten, sudut pandang (hook), dan link referensi inspirasi Anda di sini sebelum dimasukkan ke kalender.
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              + Tambah Ide Konten Baru
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredDrafts.map((draft) => {
              const urls = parseUrls(draft.reference_urls);
              const statusInfo = STATUS_CONFIG[draft.status] || STATUS_CONFIG.idea;

              return (
                <div
                  key={draft.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between space-y-3.5 group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Brand & Platform & Pillar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {draft.brand_name && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                            {draft.brand_name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border capitalize ${
                          PLATFORM_COLORS[draft.platform] || 'bg-slate-100 text-slate-700'
                        }`}>
                          {draft.platform}
                        </span>
                        {draft.pillar_name && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-100">
                            {draft.pillar_name}
                          </span>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 shrink-0 ${statusInfo.badge}`}>
                        <span>{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => handleEdit(draft)}
                      className="font-bold text-slate-900 text-sm leading-snug cursor-pointer group-hover:text-amber-600 transition-colors"
                    >
                      {draft.title}
                    </h3>

                    {/* Hook Box (if present) */}
                    {draft.hook && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50/70 to-orange-50/40 border border-amber-200/60 text-xs">
                        <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>Hook Pembuka:</span>
                        </div>
                        <p className="text-slate-800 italic font-medium leading-relaxed">
                          "{draft.hook}"
                        </p>
                      </div>
                    )}

                    {/* Concept Description (if present) */}
                    {draft.concept && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {draft.concept}
                      </p>
                    )}

                    {/* References Section: URLs and Image Attachment */}
                    {(urls.length > 0 || draft.reference_attachments) && (
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <LinkIcon className="w-3 h-3 text-slate-400" />
                          <span>Referensi & Inspirasi:</span>
                        </div>

                        {/* Clickable Reference URLs */}
                        {urls.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {urls.map((url, idx) => {
                              let domain = 'Link Referensi';
                              try {
                                const parsed = new URL(url);
                                domain = parsed.hostname.replace('www.', '');
                              } catch {}
                              return (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-700 hover:text-amber-800 text-[11px] font-medium transition-colors"
                                  title={url}
                                >
                                  <span>{domain}</span>
                                  <ExternalLink className="w-3 h-3 text-slate-400" />
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {/* Image Preview */}
                        {draft.reference_attachments && (
                          <div className="relative group/img overflow-hidden rounded-xl border border-slate-200 bg-slate-50 max-h-32">
                            <a
                              href={draft.reference_attachments}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                              title="Klik untuk melihat lampiran referensi penuh"
                            >
                              <img
                                src={draft.reference_attachments}
                                alt="Referensi"
                                className="w-full h-28 object-cover group-hover/img:scale-105 transition-transform"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Main Action: Jadwalkan ke Kalender */}
                    {draft.status === 'scheduled' ? (
                      <button
                        onClick={onOpenCalendar}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Lihat di Kalender</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenScheduleModal(draft)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-blue-500/25 transition-all cursor-pointer"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Jadwalkan ke Kalender</span>
                      </button>
                    )}

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(draft)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Ide Konten"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(draft)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Ide Konten"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE LIST VIEW */
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden pt-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Judul Ide Konten</th>
                  <th className="p-3.5">Brand</th>
                  <th className="p-3.5">Platform</th>
                  <th className="p-3.5">Pilar</th>
                  <th className="p-3.5">Referensi</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrafts.map((draft) => {
                  const urls = parseUrls(draft.reference_urls);
                  const statusInfo = STATUS_CONFIG[draft.status] || STATUS_CONFIG.idea;

                  return (
                    <tr 
                      key={draft.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="p-3.5">
                        <div 
                          onClick={() => handleEdit(draft)}
                          className="font-bold text-slate-900 cursor-pointer hover:text-amber-600"
                        >
                          {draft.title}
                        </div>
                        {draft.hook && (
                          <div className="text-[11px] text-slate-500 italic truncate max-w-sm">
                            "{draft.hook}"
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        {draft.brand_name || '-'}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-slate-700">
                          {draft.platform}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {draft.pillar_name || '-'}
                      </td>
                      <td className="p-3.5">
                        {urls.length > 0 ? (
                          <a
                            href={urls[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-[11px] font-medium"
                          >
                            <span>Link ({urls.length})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : draft.reference_attachments ? (
                          <span className="text-slate-400 font-medium text-[11px]">Ada Gambar</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {draft.status !== 'scheduled' && (
                            <button
                              onClick={() => handleOpenScheduleModal(draft)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold"
                            >
                              Jadwalkan
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(draft)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(draft)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Hapus"
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

      {/* 4. FORM MODAL */}
      <DraftFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={onSaveDraft}
        draft={editingDraft}
        brands={brands}
        projects={projects}
        pillars={pillars}
      />

      {/* 5. SCHEDULE TO CALENDAR MODAL */}
      <ScheduleToCalendarModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        draft={draftToSchedule}
        brands={brands}
        onSchedule={onScheduleDraft}
        onSuccessNavigateToCalendar={onOpenCalendar}
      />
    </div>
  );
};

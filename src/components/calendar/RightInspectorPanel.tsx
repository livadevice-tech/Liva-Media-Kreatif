import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Link as LinkIcon, 
  FileText, 
  User, 
  Tag, 
  Layers, 
  Sparkles, 
  Check, 
  UploadCloud,
  Share2
} from 'lucide-react';
import { ContentPost, ContentStatus, ContentPlatform, ContentType, UserAccount, ContentPillar } from '../../types/app';

interface RightInspectorPanelProps {
  post: Partial<ContentPost> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ContentPost>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  accounts?: UserAccount[];
  pillars?: ContentPillar[];
}

const DEFAULT_PILLARS = [
  { id: 'edu', name: 'Educational', color: '#3b82f6', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'promo', name: 'Promotional', color: '#f59e0b', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'ent', name: 'Entertainment', color: '#a855f7', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'auth', name: 'Authority', color: '#10b981', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'bts', name: 'Behind The Scene', color: '#f43f5e', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'eng', name: 'Engagement', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

const PLATFORMS: { id: ContentPlatform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'facebook', label: 'Facebook' },
];

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'reels', label: 'Reels / Video' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'feed_single', label: 'Single Feed' },
  { id: 'story', label: 'Story' },
  { id: 'short', label: 'Shorts' },
];

const STATUS_LIST: { id: ContentStatus; label: string; badge: string }[] = [
  { id: 'idea', label: 'Idea', badge: 'bg-slate-100 text-slate-700' },
  { id: 'drafting', label: 'Drafting', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { id: 'review', label: 'In Review', badge: 'bg-purple-50 text-purple-700 border border-purple-200' },
  { id: 'approved', label: 'Approved', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  { id: 'scheduled', label: 'Scheduled', badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  { id: 'published', label: 'Published', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
];

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  onDelete,
  accounts = [],
  pillars = [],
}) => {
  const [formData, setFormData] = useState<Partial<ContentPost>>({
    title: '',
    pillar_name: 'Educational',
    caption: '',
    notes: '',
    media_urls: '',
    assignee_copy: 'Nazmi Javier',
    assignee_design: 'Emilia Inder',
    platform: 'instagram',
    content_type: 'reels',
    scheduled_at: new Date().toISOString().slice(0, 10),
    start_time: '09:00',
    status: 'scheduled',
    color: '#3b82f6',
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        title: post.title || '',
        pillar_name: post.pillar_name || 'Educational',
        caption: post.caption || post.notes || '',
        media_urls: typeof post.media_urls === 'string' ? post.media_urls : '',
        assignee_copy: post.assignee_copy || 'Nazmi Javier',
        assignee_design: post.assignee_design || '',
        platform: post.platform || 'instagram',
        content_type: post.content_type || 'reels',
        scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        start_time: post.start_time || '09:00',
        status: post.status || 'scheduled',
        color: post.color || '#3b82f6',
      });
    }
  }, [post]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.id || !onDelete) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus konten "${formData.title}"?`)) {
      setDeleting(true);
      try {
        await onDelete(formData.id);
        onClose();
      } finally {
        setDeleting(false);
      }
    }
  };

  const availablePillars = pillars.length > 0 ? pillars : DEFAULT_PILLARS;

  return (
    <aside className="w-80 lg:w-[380px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-800 tracking-tight">
                {formData.id ? 'Edit Content Post' : 'Buat Konten Baru'}
              </h3>
              <p className="text-[10px] text-slate-400">Content Calendar • Liva Media Kreatif</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Tutup Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* 1. Name Content */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Name Content (Judul Konten) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: 5 Tips Hook Konten FYP Bikin Melejit"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* 2. Pillar Konten */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Pillar Konten
            </label>
            <select
              value={formData.pillar_name || 'Educational'}
              onChange={(e) => {
                const selectedPillar = availablePillars.find(p => p.name === e.target.value);
                setFormData({ 
                  ...formData, 
                  pillar_name: e.target.value,
                  color: selectedPillar?.color || '#3b82f6'
                });
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
            >
              {availablePillars.map((pil) => (
                <option key={pil.id || pil.name} value={pil.name}>
                  {pil.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Brief Konten & Visual Direction */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Brief & Copywriting
            </label>
            <textarea
              rows={4}
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value, notes: e.target.value })}
              placeholder="Tuliskan brief ide, hook 3 detik pertama, visual direction, caption, hashtag, atau call to action (CTA)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* 4. File (Drive Link / Media URL) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              File Asset (Drive / Link Desain & Video)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={formData.media_urls || ''}
                onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })}
                placeholder="https://drive.google.com/... atau link Figma/Canva"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          {/* 5. Assign Tim (PIC Copywriter & PIC Designer / Editor) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Assign PIC Copy
              </label>
              <select
                value={formData.assignee_copy || ''}
                onChange={(e) => setFormData({ ...formData, assignee_copy: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Pilih Anggota...</option>
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.full_name}>
                      {acc.full_name} ({acc.role})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Nazmi Javier">Nazmi Javier (Copywriter)</option>
                    <option value="Emilia Inder">Emilia Inder (Designer)</option>
                    <option value="Galang Taufik">Galang Taufik (Lead)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Assign PIC Design / Editor
              </label>
              <select
                value={formData.assignee_design || ''}
                onChange={(e) => setFormData({ ...formData, assignee_design: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Pilih Anggota...</option>
                {accounts.length > 0 ? (
                  accounts.map((acc) => (
                    <option key={acc.id} value={acc.full_name}>
                      {acc.full_name} ({acc.role})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Emilia Inder">Emilia Inder (Designer)</option>
                    <option value="Nazmi Javier">Nazmi Javier (Editor)</option>
                    <option value="Galang Taufik">Galang Taufik (Lead)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* 6. Platform & Format Konten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Platform
              </label>
              <select
                value={formData.platform || 'instagram'}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Format Konten
              </label>
              <select
                value={formData.content_type || 'reels'}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7. Jadwal Tayang: Tanggal & Jam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Tanggal Tayang
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Jam Tayang
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.start_time || '09:00'}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* 8. Status Konten */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Status Konten
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {STATUS_LIST.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setFormData({ ...formData, status: st.id })}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    formData.status === st.id
                      ? `${st.badge} ring-1 ring-offset-1 ring-indigo-500 shadow-2xs`
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          {formData.id && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Hapus Konten"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title}
              className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{formData.id ? 'Simpan Perubahan' : 'Buat Konten'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
};

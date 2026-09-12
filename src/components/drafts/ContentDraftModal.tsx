import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Share2, 
  Link as LinkIcon, 
  User, 
  Tag, 
  Clock, 
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { 
  ContentPost, 
  Brand, 
  ContentPillar, 
  ContentPlatform, 
  ContentType, 
  ContentStatus,
  UserAccount 
} from '../../types/app';

interface ContentDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ContentPost>) => Promise<void>;
  initialPost?: Partial<ContentPost> | null;
  brands: Brand[];
  pillars: ContentPillar[];
  accounts?: UserAccount[];
}

const PLATFORMS: { id: ContentPlatform; label: string; icon: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-slate-900 to-cyan-500' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'from-red-600 to-rose-700' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'from-blue-600 to-indigo-600' },
  { id: 'twitter', label: 'Twitter / X', icon: '🐦', color: 'from-slate-700 to-slate-900' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-cyan-700' },
];

const CONTENT_TYPES: { id: ContentType; label: string; desc: string }[] = [
  { id: 'reels', label: 'Reels / Video Pendek', desc: '9:16 Video' },
  { id: 'carousel', label: 'Carousel (Multi-slide)', desc: 'Slide Post' },
  { id: 'feed_single', label: 'Single Post Feed', desc: '1:1 / 4:5 Foto' },
  { id: 'tiktok_video', label: 'TikTok Video', desc: '9:16 Video' },
  { id: 'story', label: 'Story (24 Jam)', desc: 'Vertical Story' },
  { id: 'short', label: 'YouTube Shorts', desc: 'Short-form' },
];

const STATUS_LIST: { id: ContentStatus; label: string; badge: string }[] = [
  { id: 'drafting', label: 'Penyusunan Draft', badge: 'bg-amber-100 text-amber-800' },
  { id: 'idea', label: 'Ide Baru', badge: 'bg-slate-100 text-slate-800' },
  { id: 'review', label: 'Dalam Review Tim', badge: 'bg-purple-100 text-purple-800' },
  { id: 'approved', label: 'Approved (Disetujui)', badge: 'bg-blue-100 text-blue-800' },
  { id: 'scheduled', label: 'Terjadwal (Ready)', badge: 'bg-emerald-100 text-emerald-800' },
];

export const ContentDraftModal: React.FC<ContentDraftModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPost,
  brands,
  pillars,
  accounts = [],
}) => {
  const [formData, setFormData] = useState<Partial<ContentPost>>({
    title: '',
    brand_id: brands[0]?.id || '',
    pillar_name: pillars[0]?.name || 'Edukasi & Tips',
    platform: 'instagram',
    content_type: 'reels',
    status: 'drafting',
    hook: '',
    caption: '',
    hashtags: '',
    call_to_action: '',
    assignee_copy: '',
    assignee_design: '',
    media_urls: '',
    notes: '',
    scheduled_at: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setFormData({
        title: initialPost.title || '',
        brand_id: initialPost.brand_id || brands[0]?.id || '',
        pillar_name: initialPost.pillar_name || pillars[0]?.name || 'Edukasi & Tips',
        platform: initialPost.platform || 'instagram',
        content_type: initialPost.content_type || 'reels',
        status: initialPost.status || 'drafting',
        hook: initialPost.hook || '',
        caption: initialPost.caption || '',
        hashtags: initialPost.hashtags || '',
        call_to_action: initialPost.call_to_action || '',
        assignee_copy: initialPost.assignee_copy || '',
        assignee_design: initialPost.assignee_design || '',
        media_urls: typeof initialPost.media_urls === 'string' 
          ? initialPost.media_urls 
          : Array.isArray(initialPost.media_urls) 
            ? initialPost.media_urls.join(', ') 
            : '',
        notes: initialPost.notes || '',
        scheduled_at: initialPost.scheduled_at 
          ? initialPost.scheduled_at.replace(' ', 'T').slice(0, 16) 
          : '',
        id: initialPost.id,
      });
    } else {
      setFormData({
        title: '',
        brand_id: brands[0]?.id || '',
        pillar_name: pillars[0]?.name || 'Edukasi & Tips',
        platform: 'instagram',
        content_type: 'reels',
        status: 'drafting',
        hook: '',
        caption: '',
        hashtags: '',
        call_to_action: '',
        assignee_copy: '',
        assignee_design: '',
        media_urls: '',
        notes: '',
        scheduled_at: '',
      });
    }
  }, [initialPost, brands, pillars]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<ContentPost> = {
        ...formData,
        status: formData.status || 'drafting',
        scheduled_at: formData.scheduled_at || undefined,
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                {formData.id ? 'Edit Draft Konten' : 'Buat Draft Konten Baru'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Isi konsep, hook pembuka, naskah copywriting, dan PIC tim (Status: Draft)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs custom-scrollbar">
          {/* Judul Konten */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Judul / Topik Konten <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: 3 Tips Skincare Ampuh Mengatasi Kusam Sebelum Tidur"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-semibold transition-all"
            />
          </div>

          {/* Grid Brand & Pilar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Brand / Klien</label>
              <select
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-medium cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Pilar Konten</label>
              <select
                value={formData.pillar_name || ''}
                onChange={(e) => setFormData({ ...formData, pillar_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-medium cursor-pointer"
              >
                <option value="">Pilih Pilar Konten...</option>
                {pillars.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Platform Media Sosial */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Platform Media Sosial</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setFormData({ ...formData, platform: p.id })}
                  className={`flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    formData.platform === p.id
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span className="truncate">{p.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Format / Tipe Konten & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Format / Tipe Konten</label>
              <select
                value={formData.content_type || 'reels'}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-medium cursor-pointer"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} ({t.desc})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Status Konten</label>
              <select
                value={formData.status || 'drafting'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-semibold cursor-pointer"
              >
                {STATUS_LIST.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hook (3 Detik Pertama) */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Hook / Headline (3 Detik Pertama)</span>
              </label>
              <span className="text-[10px] text-amber-700/80">Pancingan teks/audio pembuka</span>
            </div>
            <input
              type="text"
              value={formData.hook || ''}
              onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
              placeholder="Contoh: Stop cuci muka kayak gini kalau gak mau breakout makin parah!"
              className="w-full bg-white border border-amber-300/80 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-medium"
            />
          </div>

          {/* Caption / Naskah Isi Konten */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Draft Naskah & Caption Lengkap
            </label>
            <textarea
              rows={3}
              value={formData.caption || ''}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              placeholder="Tuliskan naskah isi video atau teks caption postingan..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs transition-all leading-relaxed"
            />
          </div>

          {/* Hashtags & CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Hashtags (#)</label>
              <input
                type="text"
                value={formData.hashtags || ''}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                placeholder="#SkincareTips #BeautyTok #Trending"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Call to Action (CTA)</label>
              <input
                type="text"
                value={formData.call_to_action || ''}
                onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
                placeholder="Cek keranjang kuning / Klik link di bio!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* PIC Tim Karyawan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">PIC Copywriter / Scriptwriter</label>
              <input
                type="text"
                value={formData.assignee_copy || ''}
                onChange={(e) => setFormData({ ...formData, assignee_copy: e.target.value })}
                placeholder="Nama karyawan copywriter (misal: Sarah)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">PIC Desain / Video Editor</label>
              <input
                type="text"
                value={formData.assignee_design || ''}
                onChange={(e) => setFormData({ ...formData, assignee_design: e.target.value })}
                placeholder="Nama karyawan editor/desainer (misal: Bayu)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Media & Link Referensi */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-600" />
              <span>Link Media & Referensi Inspirasi</span>
            </label>
            <input
              type="text"
              value={formData.media_urls || ''}
              onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })}
              placeholder="https://drive.google.com/..., https://tiktok.com/@..., https://figma.com/..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-xs font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Bisa berisi link Google Drive, Figma, video TikTok inspirasi, atau tautan aset desain.
            </p>
          </div>

          {/* Rencana Jadwal (Opsional) */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1">
            <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Rencana Tanggal & Jam Tayang (Opsional)</span>
            </label>
            <p className="text-[11px] text-slate-400 pb-1">
              Bila diisi dan status diubah ke "Terjadwal", draft ini akan otomatis tayang di Kalender Konten.
            </p>
            <input
              type="datetime-local"
              value={formData.scheduled_at || ''}
              onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Status tersimpan sebagai <strong>{formData.status || 'drafting'}</strong></span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !formData.title?.trim()}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-1">⏳</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Draft Konten</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

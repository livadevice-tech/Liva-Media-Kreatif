import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Instagram, 
  Video, 
  FileText, 
  Tag, 
  User, 
  Clock, 
  Sparkles,
  Share2
} from 'lucide-react';
import { 
  ContentPost, 
  Brand, 
  ContentPillar, 
  ContentPlatform, 
  ContentType, 
  ContentStatus 
} from '../../types/app';

interface ContentPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ContentPost>) => Promise<void>;
  initialPost?: Partial<ContentPost> | null;
  brands: Brand[];
  pillars: ContentPillar[];
  initialDate?: string;
}

const PLATFORMS: { id: ContentPlatform; label: string; icon: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-600' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-slate-900 to-cyan-500' },
  { id: 'youtube', label: 'YouTube', icon: '▶️', color: 'from-red-600 to-rose-700' },
  { id: 'facebook', label: 'Facebook', icon: '👥', color: 'from-blue-600 to-indigo-600' },
  { id: 'twitter', label: 'Twitter / X', icon: '🐦', color: 'from-slate-700 to-slate-900' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-cyan-700' },
];

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'reels', label: 'Reels' },
  { id: 'carousel', label: 'Carousel (Multi-slide)' },
  { id: 'feed_single', label: 'Single Post Feed' },
  { id: 'tiktok_video', label: 'TikTok Video' },
  { id: 'story', label: 'Story' },
  { id: 'short', label: 'YouTube Shorts' },
];

const STATUS_LIST: { id: ContentStatus; label: string; color: string }[] = [
  { id: 'idea', label: 'Ide Baru', color: 'bg-slate-700 text-slate-200' },
  { id: 'drafting', label: 'Penyusunan Draft', color: 'bg-amber-500/20 text-amber-300' },
  { id: 'review', label: 'Review Internal', color: 'bg-purple-500/20 text-purple-300' },
  { id: 'approved', label: 'Approved (Disetujui)', color: 'bg-blue-500/20 text-blue-300' },
  { id: 'scheduled', label: 'Terjadwal (Ready)', color: 'bg-emerald-500/20 text-emerald-300' },
  { id: 'published', label: 'Sudah Tayang', color: 'bg-cyan-500/20 text-cyan-300' },
];

export const ContentPostModal: React.FC<ContentPostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPost,
  brands,
  pillars,
  initialDate,
}) => {
  const [formData, setFormData] = useState<Partial<ContentPost>>({
    title: '',
    brand_id: brands[0]?.id || '',
    platform: 'instagram',
    content_type: 'reels',
    status: 'drafting',
    hook: '',
    caption: '',
    hashtags: '',
    call_to_action: '',
    assignee_copy: '',
    assignee_design: '',
    scheduled_at: initialDate ? `${initialDate}T10:00` : new Date().toISOString().slice(0, 16),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialPost) {
      const scheduledStr = initialPost.scheduled_at 
        ? initialPost.scheduled_at.replace(' ', 'T').slice(0, 16)
        : initialDate ? `${initialDate}T10:00` : new Date().toISOString().slice(0, 16);

      setFormData({
        ...initialPost,
        scheduled_at: scheduledStr,
      });
    } else {
      setFormData({
        title: '',
        brand_id: brands[0]?.id || '',
        platform: 'instagram',
        content_type: 'reels',
        status: 'drafting',
        hook: '',
        caption: '',
        hashtags: '',
        call_to_action: '',
        assignee_copy: '',
        assignee_design: '',
        scheduled_at: initialDate ? `${initialDate}T10:00` : new Date().toISOString().slice(0, 16),
      });
    }
  }, [initialPost, initialDate, brands]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {formData.id ? 'Edit Rencana Konten' : 'Buat Jadwal Konten Baru'}
              </h3>
              <p className="text-xs text-slate-400">Atur konsep, naskah hook, jadwal, dan PIC tim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Judul Konten */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Judul / Topik Konten <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: 3 Tips Skincare Ampuh Mengatasi Kusam Sebelum Tidur"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
          </div>

          {/* Grid Brand & Pilar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Brand / Klien</label>
              <select
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Pilar Konten</label>
              <select
                value={formData.pillar_name || ''}
                onChange={(e) => setFormData({ ...formData, pillar_name: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
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

          {/* Platform & Tipe Konten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Platform Media Sosial</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setFormData({ ...formData, platform: p.id })}
                    className={`flex items-center justify-center space-x-1 px-2.5 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      formData.platform === p.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/70 border-slate-700/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span className="truncate">{p.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Format / Tipe Konten</label>
              <select
                value={formData.content_type || 'reels'}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Waktu Tayang & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Jadwal Tanggal & Jam Tayang <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.scheduled_at || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Status Alur Kerja</label>
              <select
                value={formData.status || 'drafting'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
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
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hook / Headline (3 Detik Pertama)</span>
              </label>
              <span className="text-[10px] text-slate-500">Pancingan visual atau teks pembuka</span>
            </div>
            <input
              type="text"
              value={formData.hook || ''}
              onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
              placeholder="Contoh: Stop cuci muka kayak gini kalau gak mau breakout makin parah!"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Caption & Hashtags */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Draft Caption Lengkap</label>
              <textarea
                rows={3}
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Tuliskan naskah isi konten atau deskripsi postingan..."
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Hashtags & Call to Action (CTA)</label>
              <input
                type="text"
                value={formData.hashtags || ''}
                onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })}
                placeholder="#SkincareTips #BeautyTok #Trending #BrandName | Cek keranjang kuning sekarang!"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* PIC Tim Karyawan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">PIC Copywriter / Scriptwriter</label>
              <input
                type="text"
                value={formData.assignee_copy || ''}
                onChange={(e) => setFormData({ ...formData, assignee_copy: e.target.value })}
                placeholder="Nama karyawan copywriter (misal: Sarah)"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">PIC Desain / Video Editor</label>
              <input
                type="text"
                value={formData.assignee_design || ''}
                onChange={(e) => setFormData({ ...formData, assignee_design: e.target.value })}
                placeholder="Nama karyawan editor/desainer (misal: Bayu)"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !formData.title}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
          >
            {saving && <span className="animate-spin mr-1">⏳</span>}
            <span>{formData.id ? 'Simpan Perubahan' : 'Jadwalkan Konten'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

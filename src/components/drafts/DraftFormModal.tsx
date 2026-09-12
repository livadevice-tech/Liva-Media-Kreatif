import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lightbulb, 
  UploadCloud, 
  ExternalLink, 
  Link as LinkIcon, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import { ContentDraftItem, Brand, Project, ContentPillar, ContentPlatform, ContentType, DraftStatus } from '../../types/app';

interface DraftFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: Partial<ContentDraftItem>) => Promise<void>;
  draft?: Partial<ContentDraftItem> | null;
  brands: Brand[];
  projects: Project[];
  pillars: ContentPillar[];
}

const PLATFORMS: { id: ContentPlatform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'linkedin', label: 'LinkedIn' },
];

const CONTENT_TYPES: { id: ContentType; label: string }[] = [
  { id: 'reels', label: 'Reels / Short Video' },
  { id: 'carousel', label: 'Carousel (Multi-Slide)' },
  { id: 'feed_single', label: 'Single Feed Image' },
  { id: 'story', label: 'Story' },
  { id: 'tiktok_video', label: 'TikTok Video' },
  { id: 'short', label: 'YouTube Shorts' },
];

const DEFAULT_PILLARS = [
  'Edukasi & Tips',
  'Promo & Penjualan',
  'Entertainment & Tren',
  'Behind The Scene',
  'Social Proof & Testi',
  'Engagement'
];

export const DraftFormModal: React.FC<DraftFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  draft,
  brands,
  projects,
  pillars,
}) => {
  const [formData, setFormData] = useState<Partial<ContentDraftItem>>({
    title: '',
    brand_id: '',
    project_id: '',
    platform: 'instagram',
    content_type: 'reels',
    pillar_name: 'Edukasi & Tips',
    hook: '',
    concept: '',
    reference_urls: '',
    reference_attachments: '',
    status: 'idea',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (draft) {
      setFormData({
        ...draft,
        title: draft.title || '',
        brand_id: draft.brand_id || (brands[0]?.id || ''),
        project_id: draft.project_id || '',
        platform: draft.platform || 'instagram',
        content_type: draft.content_type || 'reels',
        pillar_name: draft.pillar_name || 'Edukasi & Tips',
        hook: draft.hook || '',
        concept: draft.concept || '',
        reference_urls: draft.reference_urls || '',
        reference_attachments: draft.reference_attachments || '',
        status: draft.status || 'idea',
        notes: draft.notes || '',
      });
    } else {
      setFormData({
        title: '',
        brand_id: brands[0]?.id || '',
        project_id: projects[0]?.id || '',
        platform: 'instagram',
        content_type: 'reels',
        pillar_name: 'Edukasi & Tips',
        hook: '',
        concept: '',
        reference_urls: '',
        reference_attachments: '',
        status: 'idea',
        notes: '',
      });
    }
    setErrorMsg('');
  }, [draft, brands, projects, isOpen]);

  if (!isOpen) return null;

  // Handle file upload for reference attachment
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append('asset_file', file);

      const res = await fetch('/api/project-app/upload-asset', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.success && result.url) {
        setFormData(prev => ({
          ...prev,
          reference_attachments: result.url
        }));
      } else {
        alert(result.error || 'Gagal mengunggah berkas.');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah berkas.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      setErrorMsg('Judul ide konten wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan draft ide konten.');
    } finally {
      setSaving(false);
    }
  };

  const availablePillars = pillars.length > 0 ? pillars.map(p => p.name) : DEFAULT_PILLARS;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {formData.id ? 'Edit Draft Ide Konten' : 'Tambah Ide Konten Baru'}
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Ide & referensi konten yang belum masuk ke kalender
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Judul Ide Konten */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Judul / Topik Ide Konten <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: 5 Rahasia Storytelling Video TikTok Biar FYP"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          {/* 2. Brand & Proyek */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand / Klien</label>
              <select
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Pilih Brand --</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proyek Terkait (Opsional)</label>
              <select
                value={formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Tanpa Proyek Spesifik --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Platform & Format & Pilar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Platform</label>
              <select
                value={formData.platform || 'instagram'}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Format Konten</label>
              <select
                value={formData.content_type || 'reels'}
                onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {CONTENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Content Pillar</label>
              <select
                value={formData.pillar_name || 'Edukasi & Tips'}
                onChange={(e) => setFormData({ ...formData, pillar_name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {availablePillars.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Hook Pembuka */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800">Hook / 3 Detik Pertama</label>
              <span className="text-[10px] text-slate-400 font-medium">Kalimat pemikat perhatian audiens</span>
            </div>
            <input
              type="text"
              value={formData.hook || ''}
              onChange={(e) => setFormData({ ...formData, hook: e.target.value })}
              placeholder="Contoh: 'Hentikan scroll! Ini kesalahan fatal yang bikin audiensmu kabur...'"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 5. Konsep / Alur Storyline */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-800">Konsep Konten / Storyline</label>
              <span className="text-[10px] text-slate-400 font-medium">Alur cerita, poin penting, atau visual sketch</span>
            </div>
            <textarea
              rows={3}
              value={formData.concept || ''}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              placeholder="Jelaskan gambaran alur video / slide, transisi yang dipakai, talent yang tampil, dsb."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            />
          </div>

          {/* 6. Link Referensi (URLs) */}
          <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-amber-600" />
              <label className="font-bold text-slate-800 text-xs">
                Tautan / URL Referensi Konten
              </label>
            </div>
            <textarea
              rows={2}
              value={formData.reference_urls || ''}
              onChange={(e) => setFormData({ ...formData, reference_urls: e.target.value })}
              placeholder="Masukkan link referensi (pisahkan dengan koma atau baris baru):&#10;Contoh: https://tiktok.com/@creator/video/..., https://instagram.com/reel/..."
              className="w-full bg-white border border-amber-200/80 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs resize-none"
            />
          </div>

          {/* 7. Lampiran Gambar / File Referensi */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-2.5">
            <label className="font-bold text-slate-800 block text-xs">
              Lampiran Gambar / Asset Referensi
            </label>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-semibold text-xs cursor-pointer transition-colors">
                <UploadCloud className="w-4 h-4" />
                <span>{uploading ? 'Mengunggah...' : 'Pilih Gambar Referensi'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">Atau masukkan URL gambar langsung di bawah</span>
            </div>

            <input
              type="url"
              value={formData.reference_attachments || ''}
              onChange={(e) => setFormData({ ...formData, reference_attachments: e.target.value })}
              placeholder="https://... URL gambar/screenshot referensi"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono text-[11px] focus:bg-white focus:outline-none focus:border-amber-500"
            />

            {formData.reference_attachments && (
              <div className="flex items-center gap-2.5 pt-1">
                <img
                  src={formData.reference_attachments}
                  alt="Preview Referensi"
                  className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="text-[11px] text-slate-500">
                  <span>Pratinjau lampiran referensi berhasil dimuat</span>
                </div>
              </div>
            )}
          </div>

          {/* 8. Status Ide Konten */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Status Progres Ide</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'idea', label: '💡 Ide Baru', desc: 'Masih berupa konsep dasar' },
                { id: 'research', label: '🔍 Dalam Riset', desc: 'Sedang mencari referensi & hook' },
                { id: 'ready', label: '✅ Siap Dijadwalkan', desc: 'Siap dimasukkan ke kalender' },
              ].map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setFormData({ ...formData, status: s.id as DraftStatus })}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    formData.status === s.id
                      ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Ide Konten'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  Share2,
  ExternalLink,
  Instagram,
  Video,
  PenTool,
  Palette,
  AlignLeft,
  CheckCircle2,
  Settings2,
  Edit2,
  Plus
} from 'lucide-react';
import { ContentPost, ContentStatus, ContentPlatform, ContentType, UserAccount, ContentPillar } from '../../types/app';

interface RightInspectorPanelProps {
  post: Partial<ContentPost> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Partial<ContentPost>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onSavePillar?: (pillar: Partial<ContentPillar>) => Promise<void>;
  onDeletePillar?: (id: string) => Promise<void>;
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

const PLATFORMS: { id: ContentPlatform; label: string; iconColor: string }[] = [
  { id: 'instagram', label: 'Instagram', iconColor: 'text-pink-600' },
  { id: 'tiktok', label: 'TikTok', iconColor: 'text-slate-900' },
  { id: 'youtube', label: 'YouTube', iconColor: 'text-rose-600' },
  { id: 'linkedin', label: 'LinkedIn', iconColor: 'text-blue-700' },
  { id: 'facebook', label: 'Facebook', iconColor: 'text-blue-600' },
];

const CONTENT_TYPES: { id: ContentType; label: string; desc: string }[] = [
  { id: 'reels', label: 'Reels / Video', desc: '9:16 Video' },
  { id: 'carousel', label: 'Carousel', desc: 'Slide Post' },
  { id: 'feed_single', label: 'Single Feed', desc: '1:1 / 4:5 Post' },
  { id: 'story', label: 'Story', desc: '24h Vertical' },
  { id: 'short', label: 'Shorts', desc: 'Short-form' },
];

const STATUS_LIST: { id: ContentStatus; label: string; dot: string; activeBadge: string }[] = [
  { id: 'idea', label: 'Idea', dot: 'bg-slate-400', activeBadge: 'bg-slate-100 text-slate-800 border-slate-300 ring-slate-200' },
  { id: 'drafting', label: 'Drafting', dot: 'bg-amber-500', activeBadge: 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-200' },
  { id: 'review', label: 'In Review', dot: 'bg-purple-500', activeBadge: 'bg-purple-50 text-purple-800 border-purple-300 ring-purple-200' },
  { id: 'approved', label: 'Approved', dot: 'bg-blue-500', activeBadge: 'bg-blue-50 text-blue-800 border-blue-300 ring-blue-200' },
  { id: 'scheduled', label: 'Scheduled', dot: 'bg-indigo-500', activeBadge: 'bg-indigo-50 text-indigo-800 border-indigo-300 ring-indigo-200' },
  { id: 'published', label: 'Published', dot: 'bg-emerald-500', activeBadge: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-200' },
];

export const RightInspectorPanel: React.FC<RightInspectorPanelProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onSavePillar,
  onDeletePillar,
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

  // Manage Pillars Modal state
  const [isManagePillarsOpen, setIsManagePillarsOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<{
    id?: string;
    name: string;
    color: string;
    description: string;
  }>({
    name: '',
    color: '#3b82f6',
    description: '',
  });
  const [savingPillar, setSavingPillar] = useState(false);
  const [deletingPillarId, setDeletingPillarId] = useState<string | null>(null);

  const COLOR_PRESETS = [
    { hex: '#3b82f6', name: 'Biru' },
    { hex: '#10b981', name: 'Hijau Emerald' },
    { hex: '#f43f5e', name: 'Merah Rose' },
    { hex: '#ef4444', name: 'Merah' },
    { hex: '#f59e0b', name: 'Kuning Amber' },
    { hex: '#a855f7', name: 'Ungu' },
    { hex: '#6366f1', name: 'Indigo' },
    { hex: '#06b6d4', name: 'Sian' },
    { hex: '#ec4899', name: 'Pink' },
    { hex: '#64748b', name: 'Slate' },
  ];

  const handleSavePillarSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingPillar.name.trim()) return;

    setSavingPillar(true);
    try {
      if (onSavePillar) {
        await onSavePillar(editingPillar);
      }
      if (editingPillar.id && formData.pillar_name) {
        setFormData((prev) => ({
          ...prev,
          pillar_name: editingPillar.name.trim(),
          color: editingPillar.color,
        }));
      } else if (!editingPillar.id) {
        setFormData((prev) => ({
          ...prev,
          pillar_name: editingPillar.name.trim(),
          color: editingPillar.color,
        }));
      }
      setEditingPillar({ name: '', color: '#3b82f6', description: '' });
    } finally {
      setSavingPillar(false);
    }
  };

  const handleDeletePillarClick = async (pillarId: string, pillarName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pillar "${pillarName}"?`)) return;

    setDeletingPillarId(pillarId);
    try {
      if (onDeletePillar) {
        await onDeletePillar(pillarId);
      }
      if (formData.pillar_name === pillarName) {
        const remaining = (pillars.length > 0 ? pillars : DEFAULT_PILLARS).filter((p) => p.id !== pillarId);
        if (remaining.length > 0) {
          setFormData((prev) => ({
            ...prev,
            pillar_name: remaining[0].name,
            color: remaining[0].color || '#3b82f6',
          }));
        }
      }
      if (editingPillar.id === pillarId) {
        setEditingPillar({ name: '', color: '#3b82f6', description: '' });
      }
    } finally {
      setDeletingPillarId(null);
    }
  };

  useEffect(() => {
    if (post) {
      setFormData({
        ...post,
        title: post.title || '',
        pillar_name: post.pillar_name || 'Educational',
        caption: post.caption || '',
        notes: post.notes || '',
        media_urls: typeof post.media_urls === 'string' ? post.media_urls : '',
        assignee_copy: post.assignee_copy || 'Nazmi Javier',
        assignee_design: post.assignee_design || 'Emilia Inder',
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
  const currentStatusObj = STATUS_LIST.find(s => s.id === formData.status) || STATUS_LIST[0];

  return (
    <aside className="w-full sm:w-[520px] md:w-[600px] lg:w-[660px] xl:w-[720px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-all animate-in slide-in-from-right duration-200">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Modern Header with Status Indicator */}
        <div className="h-18 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                  {formData.id ? 'Edit Konten Kalender' : 'Buat Konten Baru'}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${currentStatusObj.activeBadge}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatusObj.dot}`} />
                  {currentStatusObj.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Content Planner • Liva Media Kreatif</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Tutup Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body with Clean Spacing & Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20">
          
          {/* SECTION 1: INFORMASI UTAMA */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Informasi Utama Konten</h4>
            </div>

            {/* 1. Name Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Name Content (Judul Konten) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Topik / Headline Konten</span>
              </div>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: 5 Rahasia Hook FYP TikTok Bikin Melejit"
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* 2. Pillar Konten (Interactive Grid of Badges + Kelola Button) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Pillar Konten
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">({availablePillars.length} pilar)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManagePillarsOpen(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-indigo-100"
                  title="Edit isi, nama, warna, atau tambah pilar konten baru"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Kelola / Edit Pillar</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availablePillars.map((pil) => {
                  const isSelected = formData.pillar_name === pil.name;
                  return (
                    <button
                      type="button"
                      key={pil.id || pil.name}
                      onClick={() => {
                        setFormData({ 
                          ...formData, 
                          pillar_name: pil.name,
                          color: pil.color || '#3b82f6'
                        });
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: pil.color || '#3b82f6' }} 
                      />
                      <span className="truncate">{pil.name}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 ml-auto text-indigo-600 shrink-0 stroke-[3]" />
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPillar({
                              id: pil.id,
                              name: pil.name,
                              color: pil.color || '#3b82f6',
                              description: pil.description || ''
                            });
                            setIsManagePillarsOpen(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-auto p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-opacity"
                          title="Edit nama/warna pilar ini"
                        >
                          <Edit2 className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Direct + Tambah Pillar Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingPillar({ name: '', color: '#3b82f6', description: '' });
                    setIsManagePillarsOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                  title="Tambah Kategori Pillar Baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah</span>
                </button>
              </div>
            </div>

            {/* Platform & Format Konten in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Platform Media
                </label>
                <select
                  value={formData.platform || 'instagram'}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentPlatform })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Format Konten
                </label>
                <select
                  value={formData.content_type || 'reels'}
                  onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  {CONTENT_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label} ({t.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: BRIEF & COPYWRITING (EXPANDED & SPACIOUS) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Brief & Copywriting</h4>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Bisa di-resize / ditarik ke bawah</span>
            </div>

            {/* 3. Brief Konten & Visual Direction */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Brief Ide & Visual Direction
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {(formData.notes || '').length} karakter
                  </span>
                </div>
              </div>

              {/* Quick Template Chips for Brief */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n[HOOK 3 DETIK]: \n';
                    setFormData({ ...formData, notes: (formData.notes || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + Hook 3s
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n[VISUAL CONCEPT]: \n';
                    setFormData({ ...formData, notes: (formData.notes || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + Visual Mood
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n[AUDIO / MUSIC]: \n';
                    setFormData({ ...formData, notes: (formData.notes || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + Audio Ref
                </button>
              </div>

              <textarea
                rows={6}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tuliskan brief konsep konten secara lengkap:&#10;• Hook awal 3 detik yang memikat audiens&#10;• Alur cerita / sudut pandang (angle)&#10;• Mood visual & instruksi khusus untuk desainer / video editor..."
                className="w-full min-h-[140px] bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed"
              />
            </div>

            {/* Copywriting / Caption */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Caption & Copywriting (CTA / Hashtag)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    {(formData.caption || '').length} karakter
                  </span>
                </div>
              </div>

              {/* Quick Template Chips for Caption */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n[HEADLINE]: \n';
                    setFormData({ ...formData, caption: (formData.caption || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + Headline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n👉 Komen \'INFO\' atau klik link di bio untuk detail selengkapnya!';
                    setFormData({ ...formData, caption: (formData.caption || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + CTA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const addition = '\n\n#LivaMedia #ContentCreator #SocialMediaStrategy #MarketingTips';
                    setFormData({ ...formData, caption: (formData.caption || '') + addition });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border border-slate-200/60"
                >
                  + Hashtags
                </button>
              </div>

              <textarea
                rows={8}
                value={formData.caption || ''}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                placeholder="Tuliskan draft copywriting caption postingan:&#10;• Kalimat pembuka / Hook&#10;• Isi pesan / storytelling&#10;• Call to Action (CTA) ke profil, DM, atau website&#10;• Kumpulan hashtag relevan..."
                className="w-full min-h-[180px] bg-slate-50/70 border border-slate-200 rounded-xl p-4 text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* SECTION 3: PRODUKSI & ASSET TIM */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UploadCloud className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">File Asset & Assign Tim</h4>
            </div>

            {/* 4. File (Drive Link / Media URL) with quick open action */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  File Asset (Google Drive / Figma / Canva / Media Link)
                </label>
                {formData.media_urls && formData.media_urls.startsWith('http') && (
                  <a
                    href={formData.media_urls}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Buka Tautan</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.media_urls || ''}
                  onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })}
                  placeholder="https://drive.google.com/drive/folders/... atau link Figma"
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* 5. Assign Tim in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign PIC Copywriter</span>
                </label>
                <select
                  value={formData.assignee_copy || ''}
                  onChange={(e) => setFormData({ ...formData, assignee_copy: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Pilih Anggota Copy...</option>
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <option key={acc.id} value={acc.full_name}>
                        {acc.full_name} ({acc.role})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Nazmi Javier">Nazmi Javier (Copywriter)</option>
                      <option value="Emilia Inder">Emilia Inder (Content Specialist)</option>
                      <option value="Galang Taufik">Galang Taufik (Lead Creative)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign PIC Designer / Editor</span>
                </label>
                <select
                  value={formData.assignee_design || ''}
                  onChange={(e) => setFormData({ ...formData, assignee_design: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="">Pilih Anggota Desain/Editor...</option>
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <option key={acc.id} value={acc.full_name}>
                        {acc.full_name} ({acc.role})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Emilia Inder">Emilia Inder (Graphic Designer)</option>
                      <option value="Nazmi Javier">Nazmi Javier (Video Editor)</option>
                      <option value="Galang Taufik">Galang Taufik (Lead Creative)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: JADWAL & STATUS PUBLIKASI */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Jadwal & Status Tayang</h4>
            </div>

            {/* Jadwal Tayang: Tanggal & Jam in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Tayang</span>
                </label>
                <input
                  type="date"
                  value={formData.scheduled_at || ''}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Jam Tayang (WIB)</span>
                </label>
                <input
                  type="time"
                  value={formData.start_time || '09:00'}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Status Konten: Interactive 6-item Grid */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700">
                  Status Konten
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Update tahapan pengerjaan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATUS_LIST.map((st) => {
                  const isSelected = formData.status === st.id;
                  return (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setFormData({ ...formData, status: st.id })}
                      className={`flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-left ${
                        isSelected
                          ? `${st.activeBadge} ring-2 shadow-2xs font-bold`
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                      <span className="truncate">{st.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Footer Actions with High Contrast */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          {formData.id && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Hapus Konten"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Konten</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title}
              className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formData.id ? 'Simpan Perubahan' : 'Buat Konten'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal Dialog: Kelola Pillar Konten */}
      {isManagePillarsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Kelola Pillar Konten</h3>
                  <p className="text-[11px] text-slate-400">Ubah nama, warna, atau tambah pilar baru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsManagePillarsOpen(false);
                  setEditingPillar({ name: '', color: '#3b82f6', description: '' });
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input / Edit Form Card */}
            <div className="p-4 my-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {editingPillar.id ? `Edit: ${editingPillar.name}` : '+ Tambah Pillar Baru'}
                </span>
                {editingPillar.id && (
                  <button
                    type="button"
                    onClick={() => setEditingPillar({ name: '', color: '#3b82f6', description: '' })}
                    className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Batal Edit (Buat Baru)
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Nama Pillar <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingPillar.name}
                    onChange={(e) => setEditingPillar({ ...editingPillar, name: e.target.value })}
                    placeholder="Contoh: Edukasi & Tips, Promo Kilat, BTS..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Warna Aksen
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {COLOR_PRESETS.map((col) => {
                      const isColSelected = editingPillar.color === col.hex;
                      return (
                        <button
                          type="button"
                          key={col.hex}
                          onClick={() => setEditingPillar({ ...editingPillar, color: col.hex })}
                          title={col.name}
                          className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
                            isColSelected
                              ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                              : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col.hex }}
                        >
                          {isColSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    disabled={savingPillar || !editingPillar.name.trim()}
                    onClick={handleSavePillarSubmit}
                    className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {savingPillar ? (
                      <>
                        <span className="animate-spin text-xs">⏳</span>
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingPillar.id ? 'Simpan Perubahan' : 'Tambah Pillar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* List Existing Pillars */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Daftar Pillar Aktif ({availablePillars.length})
              </p>
              {availablePillars.map((p) => {
                const isBeingEdited = editingPillar.id === p.id;
                return (
                  <div
                    key={p.id || p.name}
                    className={`flex items-center justify-between p-2.5 px-3 rounded-xl border transition-all ${
                      isBeingEdited
                        ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-300'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: p.color || '#3b82f6' }}
                      />
                      <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPillar({
                            id: p.id,
                            name: p.name,
                            color: p.color || '#3b82f6',
                            description: p.description || '',
                          });
                        }}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Nama / Warna Pillar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={deletingPillarId === p.id}
                        onClick={() => handleDeletePillarClick(p.id, p.name)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Hapus Pillar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsManagePillarsOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

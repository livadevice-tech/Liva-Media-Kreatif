import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  AlertTriangle,
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

  // Inline Pillar Management state (no separate modal form)
  const [isManageMode, setIsManageMode] = useState(false);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineEditingPillar, setInlineEditingPillar] = useState<{
    id?: string;
    name: string;
    color: string;
    description: string;
  }>({
    name: '',
    color: '#3b82f6',
    description: '',
  });
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [newPillarData, setNewPillarData] = useState<{
    name: string;
    color: string;
  }>({
    name: '',
    color: '#3b82f6',
  });
  const [savingPillar, setSavingPillar] = useState(false);
  const [deletingPillarId, setDeletingPillarId] = useState<string | null>(null);
  const [confirmDeletePillar, setConfirmDeletePillar] = useState<{ id: string; name: string } | null>(null);
  const [isConfirmDeletePost, setIsConfirmDeletePost] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [newAssigneeInput, setNewAssigneeInput] = useState('');

  const teamAccounts = useMemo(() => {
    if (accounts && accounts.length > 0) {
      return accounts.filter((a) => a.is_active !== false);
    }
    return [
      { id: 'acc-1', full_name: 'Nazmi Javier', position: 'Copywriter', role: 'Team' as const },
      { id: 'acc-2', full_name: 'Emilia Inder', position: 'Graphic Designer', role: 'Team' as const },
      { id: 'acc-3', full_name: 'Sarah', position: 'Social Lead', role: 'Team' as const },
      { id: 'acc-4', full_name: 'Dimas', position: 'Video Editor', role: 'Team' as const },
    ];
  }, [accounts]);

  const handleAddAssignee = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!selectedAssignees.includes(trimmed)) {
      setSelectedAssignees((prev) => [...prev, trimmed]);
    }
    setNewAssigneeInput('');
  };

  const handleRemoveAssignee = (name: string) => {
    setSelectedAssignees((prev) => prev.filter((n) => n !== name));
  };

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

  const handleSaveInlineEdit = async (pillarId?: string) => {
    if (!inlineEditingPillar.name.trim()) return;

    setSavingPillar(true);
    try {
      const trimmedName = inlineEditingPillar.name.trim();
      if (onSavePillar) {
        await onSavePillar({
          id: pillarId,
          name: trimmedName,
          color: inlineEditingPillar.color,
          description: inlineEditingPillar.description || '',
        });
      }
      if (formData.pillar_name === inlineEditingPillar.name || formData.pillar_name === availablePillars.find(p => p.id === pillarId)?.name) {
        setFormData((prev) => ({
          ...prev,
          pillar_name: trimmedName,
          color: inlineEditingPillar.color,
        }));
      }
      setInlineEditingId(null);
    } finally {
      setSavingPillar(false);
    }
  };

  const handleCreateInlinePillar = async () => {
    if (!newPillarData.name.trim()) return;

    setSavingPillar(true);
    try {
      const trimmedName = newPillarData.name.trim();
      if (onSavePillar) {
        await onSavePillar({
          name: trimmedName,
          color: newPillarData.color,
          description: '',
        });
      }
      setFormData((prev) => ({
        ...prev,
        pillar_name: trimmedName,
        color: newPillarData.color,
      }));
      setNewPillarData({ name: '', color: '#3b82f6' });
      setIsAddingInline(false);
    } finally {
      setSavingPillar(false);
    }
  };

  const executeDeletePillar = async () => {
    if (!confirmDeletePillar) return;
    const { id: pillarId, name: pillarName } = confirmDeletePillar;

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
      if (inlineEditingId === pillarId) {
        setInlineEditingId(null);
      }
      setConfirmDeletePillar(null);
    } finally {
      setDeletingPillarId(null);
    }
  };

  useEffect(() => {
    if (post) {
      let parsedAssignees: string[] = [];
      if (Array.isArray((post as any).assignees) && (post as any).assignees.length > 0) {
        parsedAssignees = (post as any).assignees;
      } else {
        const raw = [post.assignee_copy, post.assignee_design].filter(Boolean).join(', ');
        parsedAssignees = raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      setSelectedAssignees(parsedAssignees);

      setFormData({
        ...post,
        title: post.title || '',
        pillar_name: post.pillar_name || 'Educational',
        caption: post.caption || '',
        notes: post.notes || '',
        media_urls: typeof post.media_urls === 'string' ? post.media_urls : '',
        platform: post.platform || 'instagram',
        content_type: post.content_type || 'reels',
        scheduled_at: post.scheduled_at ? post.scheduled_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        start_time: post.start_time || '09:00',
        status: post.status || 'scheduled',
        color: post.color || '#3b82f6',
      });
    } else {
      setSelectedAssignees([]);
      setFormData({
        title: '',
        pillar_name: 'Educational',
        caption: '',
        notes: '',
        media_urls: '',
        platform: 'instagram',
        content_type: 'reels',
        scheduled_at: new Date().toISOString().slice(0, 10),
        start_time: '09:00',
        status: 'scheduled',
        color: '#3b82f6',
      });
    }
  }, [post]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<ContentPost> = {
        ...formData,
        assignee_copy: selectedAssignees.join(', '),
        assignee_design: '',
        assignees: selectedAssignees,
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const executeDeletePost = async () => {
    if (!formData.id || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(formData.id);
      setIsConfirmDeletePost(false);
      onClose();
    } finally {
      setDeleting(false);
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
          <div className="flex items-center gap-1.5">
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={() => setIsConfirmDeletePost(true)}
                disabled={deleting}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Hapus Konten Ini"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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

            {/* 2. Pillar Konten (Interactive Grid of Badges with Direct Inline Edit & Delete) */}
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
                  onClick={() => setIsManageMode(!isManageMode)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                    isManageMode
                      ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                      : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border-indigo-100'
                  }`}
                  title={isManageMode ? 'Klik untuk keluar dari mode kelola' : 'Klik untuk menampilkan tombol edit dan hapus pada setiap pilar'}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>{isManageMode ? 'Selesai Kelola' : 'Kelola / Edit Pillar'}</span>
                </button>
              </div>

              {isManageMode && (
                <div className="mb-2.5 p-2 px-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-800 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Mode Kelola Aktif: Klik pensil untuk edit langsung, atau tempat sampah untuk hapus.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsManageMode(false)}
                    className="text-[10px] font-bold text-amber-900 hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availablePillars.map((pil) => {
                  const isSelected = formData.pillar_name === pil.name;
                  const isInlineEditing = inlineEditingId === (pil.id || pil.name);

                  if (isInlineEditing) {
                    return (
                      <div
                        key={pil.id || pil.name}
                        className="col-span-full sm:col-span-2 lg:col-span-3 p-2.5 bg-indigo-50/90 border-2 border-indigo-500 rounded-xl space-y-2 shadow-2xs animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] font-bold text-indigo-900 mr-1">Warna:</span>
                            {COLOR_PRESETS.map((c) => {
                              const isC = inlineEditingPillar.color === c.hex;
                              return (
                                <button
                                  type="button"
                                  key={c.hex}
                                  onClick={() => setInlineEditingPillar({ ...inlineEditingPillar, color: c.hex })}
                                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                    isC ? 'ring-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Edit Langsung</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={inlineEditingPillar.name}
                            onChange={(e) => setInlineEditingPillar({ ...inlineEditingPillar, name: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveInlineEdit(pil.id);
                              } else if (e.key === 'Escape') {
                                setInlineEditingId(null);
                              }
                            }}
                            placeholder="Nama pilar..."
                            className="flex-1 min-w-0 bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            disabled={savingPillar || !inlineEditingPillar.name.trim()}
                            onClick={() => handleSaveInlineEdit(pil.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                            title="Simpan Perubahan Langsung"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span className="text-[11px] hidden sm:inline">Simpan</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInlineEditingId(null)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingPillarId === pil.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setConfirmDeletePillar({ id: pil.id, name: pil.name });
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                            title="Hapus Pilar Langsung"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={pil.id || pil.name}
                      className={`group relative flex items-center justify-between gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {/* Clickable Badge to select pillar */}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            pillar_name: pil.name,
                            color: pil.color || '#3b82f6'
                          });
                        }}
                        className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer overflow-hidden py-0.5"
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: pil.color || '#3b82f6' }} 
                        />
                        <span className="truncate">{pil.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 stroke-[3] ml-1" />
                        )}
                      </button>

                      {/* Direct Edit & Delete Buttons Right Here */}
                      <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
                        isManageMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInlineEditingId(pil.id || pil.name);
                            setInlineEditingPillar({
                              id: pil.id,
                              name: pil.name,
                              color: pil.color || '#3b82f6',
                              description: pil.description || ''
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Edit nama & warna langsung di sini"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingPillarId === pil.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmDeletePillar({ id: pil.id, name: pil.name });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Hapus pilar langsung di sini"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Direct + Tambah Button or Inline Input */}
                {isAddingInline ? (
                  <div className="col-span-full sm:col-span-2 lg:col-span-3 p-2.5 bg-emerald-50/90 border-2 border-emerald-500 rounded-xl space-y-2 shadow-2xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] font-bold text-emerald-900 mr-1">Pilih Warna:</span>
                        {COLOR_PRESETS.map((c) => {
                          const isC = newPillarData.color === c.hex;
                          return (
                            <button
                              type="button"
                              key={c.hex}
                              onClick={() => setNewPillarData({ ...newPillarData, color: c.hex })}
                              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                isC ? 'ring-2 ring-emerald-600 scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">+ Tambah Langsung</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        autoFocus
                        value={newPillarData.name}
                        onChange={(e) => setNewPillarData({ ...newPillarData, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateInlinePillar();
                          } else if (e.key === 'Escape') {
                            setIsAddingInline(false);
                          }
                        }}
                        placeholder="Ketik nama pilar baru..."
                        className="flex-1 min-w-0 bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        disabled={savingPillar || !newPillarData.name.trim()}
                        onClick={handleCreateInlinePillar}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="text-[11px]">Tambah</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingInline(false)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingInline(true);
                      setNewPillarData({ name: '', color: '#3b82f6' });
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                    title="Tambah pilar baru langsung di sini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Tambah</span>
                  </button>
                )}
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

            {/* 5. General Multi-Assignee (Ditugaskan Kepada) */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>Assign To (Ditugaskan Kepada)</span>
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  {selectedAssignees.length} orang ditugaskan
                </span>
              </div>

              {/* Selected Assignees Pill Badges */}
              <div className="flex flex-wrap items-center gap-1.5 min-h-[40px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
                {selectedAssignees.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-1">
                    Belum ada anggota yang ditugaskan. Pilih akun tim di bawah atau ketik nama.
                  </span>
                ) : (
                  selectedAssignees.map((name) => {
                    const initials = name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={name}
                        className="inline-flex items-center gap-1.5 bg-white border border-indigo-200/80 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-950 shadow-2xs group animate-in fade-in zoom-in-95 duration-150"
                      >
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {initials}
                        </span>
                        <span className="truncate max-w-[150px]">{name}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveAssignee(name);
                          }}
                          className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          title="Hapus penugasan"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Input to Add Custom Assignee */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newAssigneeInput}
                  onChange={(e) => setNewAssigneeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAssignee(newAssigneeInput);
                    }
                  }}
                  placeholder="Ketik nama anggota lain lalu tekan Enter..."
                  className="flex-1 min-w-0 text-xs bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  disabled={!newAssigneeInput.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddAssignee(newAssigneeInput);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Team Accounts from Manajemen Akun */}
              <div>
                <div className="flex items-center justify-between mb-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3 text-indigo-600" />
                    <span>Pilih Akun Tim (Klik untuk Tambah/Hapus):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {teamAccounts.length} akun tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                  {teamAccounts.map((acc) => {
                    const isAdded = selectedAssignees.includes(acc.full_name);
                    const initials = acc.full_name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          isAdded ? handleRemoveAssignee(acc.full_name) : handleAddAssignee(acc.full_name);
                        }}
                        className={`flex items-center gap-2.5 p-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-indigo-50/90 border-indigo-400 text-indigo-950 ring-2 ring-indigo-400/20 shadow-2xs font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isAdded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-tight">{acc.full_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400 truncate">
                              {acc.position || 'Staff'}
                            </span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-semibold shrink-0 ${
                                acc.role === 'Master Admin'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-blue-50 text-blue-700'
                              }`}
                            >
                              {acc.role}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1">
                          {isAdded ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600">
                              <Plus className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
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
              onClick={() => setIsConfirmDeletePost(true)}
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

      {/* In-App Confirmation Modal: Delete Pillar */}
      {confirmDeletePillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-2xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Hapus Pilar Konten?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Apakah Anda yakin ingin menghapus pilar <strong>"{confirmDeletePillar.name}"</strong>? Data pilar ini akan dihapus dari opsi pilihan pilar.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeletePillar(null)}
                disabled={Boolean(deletingPillarId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePillar}
                disabled={Boolean(deletingPillarId)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {deletingPillarId ? 'Menghapus...' : 'Ya, Hapus Pilar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Delete Content Post */}
      {isConfirmDeletePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Hapus Konten Kalender?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Apakah Anda yakin ingin menghapus konten <strong>"{formData.title}"</strong>? Tindakan ini akan menghapus jadwal postingan ini secara permanen.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmDeletePost(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeletePost}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Konten'}
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};

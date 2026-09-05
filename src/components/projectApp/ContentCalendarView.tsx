import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Grid3X3, 
  List, 
  Clock, 
  User, 
  CheckCircle2, 
  Eye, 
  X, 
  Trash2, 
  Sparkles,
  Share2
} from 'lucide-react';
import { ContentPost, Brand, SocialAccount, ContentPillar, ContentStatus, ContentType, PlatformType } from '../../types/projectApp';

interface ContentCalendarViewProps {
  posts: ContentPost[];
  brands: Brand[];
  accounts: SocialAccount[];
  pillars: ContentPillar[];
  loading: boolean;
  onSavePost: (postData: Partial<ContentPost>) => Promise<void>;
  onUpdateStatus: (postId: string, status: ContentStatus) => void;
  onDeletePost: (postId: string) => void;
}

const STATUS_PIPELINE: { id: ContentStatus; label: string; bg: string; text: string }[] = [
  { id: 'idea', label: 'Ideasi', bg: 'bg-slate-100', text: 'text-slate-700' },
  { id: 'drafting', label: 'Drafting Copy', bg: 'bg-amber-100', text: 'text-amber-800' },
  { id: 'review', label: 'In Review', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { id: 'approved', label: 'Approved', bg: 'bg-blue-100', text: 'text-blue-800' },
  { id: 'scheduled', label: 'Scheduled', bg: 'bg-purple-100', text: 'text-purple-800' },
  { id: 'published', label: 'Published', bg: 'bg-emerald-100', text: 'text-emerald-800' },
];

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({
  posts,
  brands,
  accounts,
  pillars,
  loading,
  onSavePost,
  onUpdateStatus,
  onDeletePost,
}) => {
  // Navigation & View Mode
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'feed' | 'list'>('calendar');

  // Filters
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);

  // Form State
  const [form, setForm] = useState<{
    id?: string;
    brand_id: string;
    social_account_id: string;
    title: string;
    pillar_name: string;
    platform: PlatformType;
    content_type: ContentType;
    hook: string;
    caption: string;
    hashtags: string;
    call_to_action: string;
    scheduled_at: string;
    status: ContentStatus;
    assignee_copy: string;
    assignee_design: string;
    notes: string;
  }>({
    brand_id: brands[0]?.id || '',
    social_account_id: accounts[0]?.id || '',
    title: '',
    pillar_name: 'Edukasi & Tips',
    platform: 'instagram',
    content_type: 'carousel',
    hook: '',
    caption: '',
    hashtags: '',
    call_to_action: '',
    scheduled_at: new Date().toISOString().slice(0, 16),
    status: 'idea',
    assignee_copy: '',
    assignee_design: '',
    notes: '',
  });

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Previous & Next Month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedBrandId !== 'all' && p.brand_id !== selectedBrandId) return false;
      if (selectedPlatform !== 'all' && p.platform !== selectedPlatform) return false;
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
      return true;
    });
  }, [posts, selectedBrandId, selectedPlatform, selectedStatus]);

  // Open Add Post Modal with pre-selected date
  const handleOpenNewPost = (dateStr?: string) => {
    setEditingPost(null);
    let targetDate = new Date();
    if (dateStr) {
      targetDate = new Date(`${dateStr}T11:00:00`);
    }

    const defaultBrand = selectedBrandId !== 'all' ? selectedBrandId : (brands[0]?.id || '');
    const defaultAcc = accounts.find(a => a.brand_id === defaultBrand)?.id || accounts[0]?.id || '';

    setForm({
      brand_id: defaultBrand,
      social_account_id: defaultAcc,
      title: '',
      pillar_name: 'Edukasi & Tips',
      platform: 'instagram',
      content_type: 'carousel',
      hook: '',
      caption: '',
      hashtags: '#LivaMedia #ContentCreator #DigitalMarketing',
      call_to_action: 'Save postingan ini untuk dibaca nanti! 📌',
      scheduled_at: targetDate.toISOString().slice(0, 16),
      status: 'idea',
      assignee_copy: '',
      assignee_design: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditPost = (post: ContentPost) => {
    setEditingPost(post);
    setForm({
      id: post.id,
      brand_id: post.brand_id || brands[0]?.id || '',
      social_account_id: post.social_account_id || accounts[0]?.id || '',
      title: post.title,
      pillar_name: post.pillar_name || 'Edukasi & Tips',
      platform: post.platform,
      content_type: post.content_type,
      hook: post.hook || '',
      caption: post.caption || '',
      hashtags: post.hashtags || '',
      call_to_action: post.call_to_action || '',
      scheduled_at: post.scheduled_at ? post.scheduled_at.replace(' ', 'T').slice(0, 16) : '',
      status: post.status,
      assignee_copy: post.assignee_copy || '',
      assignee_design: post.assignee_design || '',
      notes: post.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onSavePost(form);
    setIsModalOpen(false);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar: Controls & View Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-black text-slate-800 min-w-[130px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            Bulan Ini
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand Filter */}
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 focus:outline-none cursor-pointer"
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
            className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Platform</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="facebook">Facebook</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Kalender"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'feed' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Preview Grid Feed Instagram"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan List Timeline"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => handleOpenNewPost()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer ml-2"
          >
            <Plus className="w-4 h-4" />
            <span>Jadwalkan Konten</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-extrabold text-slate-600 uppercase tracking-wider">
            <span>Minggu</span>
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {/* Empty cells for preceding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50/40 p-2" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              const dayPosts = filteredPosts.filter((p) => {
                const pDate = p.scheduled_at?.split('T')[0]?.split(' ')[0];
                return pDate === dateStr;
              });

              return (
                <div
                  key={dateStr}
                  onClick={() => handleOpenNewPost(dateStr)}
                  className={`min-h-[130px] p-2 hover:bg-slate-50/80 transition-colors flex flex-col justify-between group cursor-pointer ${
                    isToday ? 'bg-indigo-50/30 ring-1 ring-inset ring-indigo-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-700'
                    }`}>
                      {dayNum}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenNewPost(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-indigo-100 text-indigo-600 rounded-md transition-all cursor-pointer"
                      title="Tambah postingan di hari ini"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Posts for this day */}
                  <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto max-h-[110px]">
                    {dayPosts.map((post) => {
                      const postTime = new Date(post.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditPost(post);
                          }}
                          className={`p-1.5 rounded-lg border text-[11px] transition-all hover:shadow-xs cursor-pointer ${
                            post.status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                            post.status === 'scheduled' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                            post.status === 'approved' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                            post.status === 'review' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                            'bg-white border-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold">
                            <span className="truncate">{post.title}</span>
                          </div>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 mt-0.5">
                            <span className="capitalize">{post.platform} • {post.content_type.replace('_', ' ')}</span>
                            <span>{postTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: INSTAGRAM 3x3 FEED PREVIEW MOCKUP */}
      {viewMode === 'feed' && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6">
          <div className="text-center pb-6 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-center gap-2">
              <span>📸</span>
              <span>Instagram Feed Mockup Preview (3x3)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visualisasi estetika susunan grid postingan sebelum diterbitkan ke Instagram
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {filteredPosts.slice(0, 9).map((post, idx) => (
              <div
                key={post.id || idx}
                onClick={() => handleOpenEditPost(post)}
                className="aspect-square bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-3 flex flex-col justify-between text-white relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-all shadow-md"
              >
                <div className="flex justify-between items-start z-10">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded">
                    {post.content_type.replace('_', ' ')}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${
                    post.status === 'published' ? 'bg-emerald-400' : 'bg-purple-400'
                  }`} />
                </div>

                <div className="z-10">
                  <h5 className="font-extrabold text-xs line-clamp-2 leading-tight">
                    {post.title}
                  </h5>
                  <p className="text-[9px] text-slate-300 mt-1">
                    {new Date(post.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                {/* Subtle Overlay on Hover */}
                <div className="absolute inset-0 bg-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
              </div>
            ))}

            {Array.from({ length: Math.max(0, 9 - filteredPosts.length) }).map((_, i) => (
              <div
                key={`blank-${i}`}
                onClick={() => handleOpenNewPost()}
                className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:border-indigo-300 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold mt-1">Slot Kosong</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: LIST TIMELINE VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredPosts.map((p) => {
            const dateObj = new Date(p.scheduled_at);
            const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={p.id}
                onClick={() => handleOpenEditPost(p)}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                      {p.platform} • {p.content_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {p.brand_name || 'Brand'}
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                      {p.pillar_name || 'Edukasi'}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900">{p.title}</h4>

                  {p.hook && (
                    <p className="text-xs text-slate-600 italic line-clamp-1">
                      Hook: "{p.hook}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs">
                    <div className="font-bold text-slate-800">{dateStr}</div>
                    <div className="text-slate-400">{timeStr} WIB</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                    p.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                    p.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              Belum ada postingan konten yang sesuai dengan filter.
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Content Post */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {editingPost ? 'Edit Jadwal Konten' : 'Jadwalkan Konten Baru'}
                </h3>
                <p className="text-xs text-slate-400">Kelola teks hook, caption, pilar, dan status persetujuan</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Status Pipeline Switcher */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Tahapan Status (Pipeline Approval)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_PIPELINE.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setForm({ ...form, status: st.id })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        form.status === st.id
                          ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400'
                          : `${st.bg} ${st.text} hover:opacity-80`
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Pillar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul / Konsep Postingan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 3 Tips Skincare Ampuh untuk Kulit Kusam"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilar Konten</label>
                  <select
                    value={form.pillar_name}
                    onChange={(e) => setForm({ ...form, pillar_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Edukasi & Tips">Edukasi & Tips</option>
                    <option value="Promo & Penjualan">Promo & Penjualan</option>
                    <option value="Entertainment & Tren">Entertainment & Tren</option>
                    <option value="Behind The Scene">Behind The Scene</option>
                    <option value="Social Proof & Testi">Social Proof & Testi</option>
                  </select>
                </div>
              </div>

              {/* Brand, Platform & Content Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform *</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as PlatformType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format Konten *</label>
                  <select
                    value={form.content_type}
                    onChange={(e) => setForm({ ...form, content_type: e.target.value as ContentType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="carousel">Carousel Feed</option>
                    <option value="feed_single">Single Post Feed</option>
                    <option value="reels">Reels / Short Video</option>
                    <option value="story">Story</option>
                    <option value="tiktok_video">TikTok Video</option>
                  </select>
                </div>
              </div>

              {/* Hook (Headline) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🔥 Hook 3 Detik Pertama (Cover Text / Headline)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jangan pernah coba trik ini kalau gak mau ketagihan!"
                  value={form.hook}
                  onChange={(e) => setForm({ ...form, hook: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900 bg-indigo-50/20"
                />
              </div>

              {/* Caption & Hashtags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Copywriting Caption</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan isi caption lengkap disini..."
                  value={form.caption}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Hashtags</label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, hashtags: `${form.hashtags} #Trending #Viral #fyp` })}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      +Trending
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, hashtags: `${form.hashtags} #Promo #Diskon #SpesialPromo` })}
                      className="text-indigo-600 hover:underline font-bold"
                    >
                      +Promo
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="#BrandName #Tips #Tutorial #AgencyLife"
                  value={form.hashtags}
                  onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Waktu Publikasi & Assignee */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jadwal Tayang (Tgl & Jam) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Copywriter</label>
                  <input
                    type="text"
                    placeholder="Nama Copywriter"
                    value={form.assignee_copy}
                    onChange={(e) => setForm({ ...form, assignee_copy: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designer / Editor</label>
                  <input
                    type="text"
                    placeholder="Nama Designer"
                    value={form.assignee_design}
                    onChange={(e) => setForm({ ...form, assignee_design: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {editingPost ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Yakin ingin menghapus postingan ini dari kalender?')) {
                        onDeletePost(editingPost.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Postingan</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

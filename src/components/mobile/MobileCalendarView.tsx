import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { ContentPost, Brand, ContentPillar, ContentStatus, UserAccount } from '../../types/app';
import { RightInspectorPanel } from '../calendar/RightInspectorPanel';

interface MobileCalendarViewProps {
  posts: ContentPost[];
  brands: Brand[];
  pillars: ContentPillar[];
  accounts?: UserAccount[];
  onSavePost: (post: Partial<ContentPost>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ContentStatus) => Promise<void>;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MobileCalendarView: React.FC<MobileCalendarViewProps> = ({
  posts,
  brands,
  pillars,
  accounts = [],
  onSavePost,
  onDeletePost,
  onUpdateStatus,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Inspector State for creating / editing post
  const [selectedPost, setSelectedPost] = useState<Partial<ContentPost> | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Month and date helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      if (selectedBrand !== 'all' && post.brand_id !== selectedBrand) return false;
      if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) return false;
      return true;
    });
  }, [posts, selectedBrand, selectedPlatform]);

  // Group posts by YYYY-MM-DD
  const postsByDate = useMemo(() => {
    const map = new Map<string, ContentPost[]>();
    filteredPosts.forEach(post => {
      if (!post.scheduled_date) return;
      const key = post.scheduled_date.slice(0, 10);
      const list = map.get(key) || [];
      list.push(post);
      map.set(key, list);
    });
    return map;
  }, [filteredPosts]);

  // Calendar Grid generation (Monday start)
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
    // Adjust to Monday = 0
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      dateObj: Date;
    }[] = [];

    // Previous month trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, day);
      const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      cells.push({
        day,
        dateStr: `${prevDate.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        dateObj: prevDate
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      cells.push({
        day,
        dateStr: `${year}-${mStr}-${dStr}`,
        isCurrentMonth: true,
        dateObj: curDate
      });
    }

    // Next month leading days (fill up to multiple of 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      cells.push({
        day: i,
        dateStr: `${nextDate.getFullYear()}-${mStr}-${dStr}`,
        isCurrentMonth: false,
        dateObj: nextDate
      });
    }

    return cells;
  }, [year, month]);

  // Format Selected Date string YYYY-MM-DD
  const selectedDateStr = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Posts for the selected date
  const postsForSelectedDate = useMemo(() => {
    return postsByDate.get(selectedDateStr) || [];
  }, [postsByDate, selectedDateStr]);

  // Format date in Indonesian for card
  const formattedIndoDate = useMemo(() => {
    const dayName = INDO_DAYS[selectedDate.getDay()];
    const dateNum = selectedDate.getDate();
    const monthName = INDO_MONTHS[selectedDate.getMonth()];
    const yearNum = selectedDate.getFullYear();
    return `${dayName}, ${dateNum} ${monthName} ${yearNum}`;
  }, [selectedDate]);

  // Open Inspector to create new post on selected date
  const handleOpenCreatePost = () => {
    setSelectedPost({
      scheduled_date: selectedDateStr,
      scheduled_time: '12:00',
      status: 'idea',
      platform: 'instagram',
      content_type: 'feed_single'
    });
    setIsInspectorOpen(true);
  };

  const handleEditPost = (post: ContentPost) => {
    setSelectedPost(post);
    setIsInspectorOpen(true);
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* 1. TITLE & SUBTITLE */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Calender Content
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Kelola jadwal dan konten produksi Anda
        </p>
      </div>

      {/* 2. ACTION ROW: < , >, Filter, + Buat Konten */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterModal(true)}
            className={`h-10 px-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer ${
              selectedBrand !== 'all' || selectedPlatform !== 'all'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
            {(selectedBrand !== 'all' || selectedPlatform !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </button>

          <button
            onClick={handleOpenCreatePost}
            className="h-10 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Konten</span>
          </button>
        </div>
      </div>

      {/* 3. MONTH & RANGE HEADER */}
      <div className="pt-1">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
          {MONTH_NAMES_EN[month]} {year}
        </h2>
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          {MONTH_NAMES_EN[month]} 1, {year} - {MONTH_NAMES_EN[month]} {new Date(year, month + 1, 0).getDate()}, {year}
        </p>
      </div>

      {/* 4. SEGMENTED VIEW SWITCHER: Month | Week | Day */}
      <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
            viewMode === 'month'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Month
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
            viewMode === 'week'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Week
        </button>
        <button
          onClick={() => setViewMode('day')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
            viewMode === 'day'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Day
        </button>
      </div>

      {/* 5. MOBILE CALENDAR GRID */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs overflow-hidden">
          {/* Day Headers (MON-SUN) */}
          <div className="grid grid-cols-7 mb-1 text-center">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div
                key={day}
                className="text-[10px] font-bold text-slate-400 tracking-wider py-1.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarCells.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const datePosts = postsByDate.get(cell.dateStr) || [];
              const hasPosts = datePosts.length > 0;

              return (
                <button
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => {
                    setSelectedDate(cell.dateObj);
                    if (!cell.isCurrentMonth) {
                      setCurrentDate(new Date(cell.dateObj.getFullYear(), cell.dateObj.getMonth(), 1));
                    }
                  }}
                  className="flex flex-col items-center justify-center py-1.5 cursor-pointer rounded-xl transition-colors hover:bg-slate-50"
                >
                  {/* Date Badge */}
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-slate-800 font-medium'
                        : 'text-slate-300 font-normal'
                    }`}
                  >
                    {cell.day}
                  </div>

                  {/* Dot Indicator for scheduled posts */}
                  <div className="h-1.5 mt-0.5 flex items-center justify-center gap-0.5">
                    {hasPosts ? (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`} />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'week' ? (
        /* Week View: 7 days horizontal strip */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-3 shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-800">Minggu Ini</div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: 7 }).map((_, i) => {
              // Current week dates based on selected date
              const curr = new Date(selectedDate);
              const firstDayOfWeek = curr.getDate() - ((curr.getDay() + 6) % 7);
              const dayObj = new Date(curr.setDate(firstDayOfWeek + i));
              const dStr = `${dayObj.getFullYear()}-${String(dayObj.getMonth() + 1).padStart(2, '0')}-${String(dayObj.getDate()).padStart(2, '0')}`;
              const isSel = dStr === selectedDateStr;
              const hasP = (postsByDate.get(dStr) || []).length > 0;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dayObj)}
                  className={`p-2 rounded-2xl text-center cursor-pointer transition-all ${
                    isSel ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`text-[9px] font-bold uppercase ${isSel ? 'text-slate-300' : 'text-slate-400'}`}>
                    {['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'][i]}
                  </div>
                  <div className="text-xs font-bold mt-0.5">{dayObj.getDate()}</div>
                  {hasP && <div className="w-1 h-1 rounded-full bg-blue-500 mx-auto mt-1" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Day View: Summary of today */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs text-center space-y-2">
          <div className="text-sm font-bold text-slate-900">{formattedIndoDate}</div>
          <p className="text-xs text-slate-500">
            {postsForSelectedDate.length} konten dijadwalkan pada hari ini.
          </p>
        </div>
      )}

      {/* 6. SELECTED DATE SUMMARY CARD (Matching Mockup 1) */}
      <div 
        onClick={() => {
          if (postsForSelectedDate.length === 0) {
            handleOpenCreatePost();
          }
        }}
        className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex items-center justify-between cursor-pointer hover:border-slate-300 active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-900">
              {formattedIndoDate}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {postsForSelectedDate.length === 0
                ? 'Belum ada konten untuk tanggal ini'
                : `${postsForSelectedDate.length} konten terjadwal`}
            </div>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* 7. POSTS LIST FOR SELECTED DATE */}
      {postsForSelectedDate.length > 0 && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">
              Daftar Konten ({postsForSelectedDate.length})
            </span>
            <button
              onClick={handleOpenCreatePost}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>

          {postsForSelectedDate.map((post) => (
            <div
              key={post.id}
              onClick={() => handleEditPost(post)}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs space-y-2.5 cursor-pointer hover:border-blue-200 active:scale-[0.99] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700 capitalize">
                    {post.platform}
                  </span>
                  {post.pillar_name && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-600">
                      {post.pillar_name}
                    </span>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                  post.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700'
                    : post.status === 'scheduled'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {post.status}
                </span>
              </div>

              <div className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                {post.title}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{post.scheduled_time || '12:00'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPost(post);
                    }}
                    className="text-slate-400 hover:text-blue-600 p-1 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus jadwal konten "${post.title}"?`)) {
                        onDeletePost(post.id);
                      }
                    }}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. FILTER MODAL */}
      {showFilterModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setShowFilterModal(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 p-5 w-full max-w-sm shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Filter Konten Kalender</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Brand / Klien</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-blue-500"
                >
                  <option value="all">Semua Brand</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Platform Sosial</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-blue-500"
                >
                  <option value="all">Semua Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedBrand('all');
                  setSelectedPlatform('all');
                  setShowFilterModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. RIGHT INSPECTOR PANEL (Mobile Full Drawer / Modal) */}
      {isInspectorOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          onClick={() => setIsInspectorOpen(false)}
        >
          <div 
            className="w-full sm:max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <RightInspectorPanel
              isOpen={isInspectorOpen}
              onClose={() => setIsInspectorOpen(false)}
              onSave={onSavePost}
              onDelete={onDeletePost}
              post={selectedPost}
              brands={brands}
              pillars={pillars}
              accounts={accounts}
            />
          </div>
        </div>
      )}
    </div>
  );
};

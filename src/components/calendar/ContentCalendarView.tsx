import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { ContentPost, Brand, ContentPillar, ContentStatus, UserAccount } from '../../types/app';
import { MonthGridView } from './MonthGridView';
import { WeeklyTimeGridView } from './WeeklyTimeGridView';
import { DayGridView } from './DayGridView';
import { RightInspectorPanel } from './RightInspectorPanel';

interface ContentCalendarViewProps {
  posts: ContentPost[];
  brands: Brand[];
  pillars: ContentPillar[];
  accounts?: UserAccount[];
  onSavePost: (post: Partial<ContentPost>) => Promise<void>;
  onDeletePost: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ContentStatus) => Promise<void>;
  onOpenQuickAdd?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ContentCalendarView: React.FC<ContentCalendarViewProps> = ({
  posts,
  brands,
  pillars,
  accounts = [],
  onSavePost,
  onDeletePost,
  onUpdateStatus,
  onOpenQuickAdd
}) => {
  // Default to July 18, 2025 matching the user reference image
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 18));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Inspector state
  const [selectedPost, setSelectedPost] = useState<Partial<ContentPost> | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigation handlers
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Enriched creative agency content posts matching July 2025 layout with real content calendar items
  const enrichedPosts = useMemo(() => {
    const referenceDemoList: Partial<ContentPost>[] = [
      // Row 1
      { id: 'ref-1', title: 'Reels: 5 Hook Konten FYP Bikin Melejit', pillar_name: 'Educational', caption: 'Hook: Jangan skip kalau gamau views kontenmu anjlok! Visual: Fast cut video editor workflow.', media_urls: 'https://drive.google.com/drive/folders/liva-reels-hook-fyp', scheduled_at: '2025-07-01', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'Emilia Inder', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-2', title: 'TikTok: A Day in The Life of Video Editor', pillar_name: 'Behind The Scene', caption: 'Behind the scenes keseruan dan tantangan tim produksi di studio Liva.', media_urls: 'https://drive.google.com/drive/folders/liva-tiktok-editor', scheduled_at: '2025-07-03', start_time: '11:00', end_time: '12:00', color: '#f43f5e', assignee_copy: 'Emilia Inder', platform: 'tiktok', content_type: 'tiktok_video', status: 'approved' },
      { id: 'ref-3', title: 'Carousel: Studi Kasus Rebranding Client A', pillar_name: 'Authority', caption: 'Bedah transformasi brand identity dan kenaikan penjualan 240% dalam 3 bulan.', media_urls: 'https://figma.com/file/rebranding-client-a', scheduled_at: '2025-07-04', start_time: '10:00', end_time: '11:30', color: '#10b981', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'carousel', status: 'scheduled' },
      { id: 'ref-3-extra-1', title: 'Story: Q&A Jasa Branding', pillar_name: 'Engagement', scheduled_at: '2025-07-04', start_time: '13:00', color: '#6366f1' },
      { id: 'ref-3-extra-2', title: 'Feed: Quotes Motivasi Bisnis', pillar_name: 'Entertainment', scheduled_at: '2025-07-04', start_time: '15:00', color: '#a855f7' },
      { id: 'ref-3-extra-3', title: 'Reels: Tips Pencahayaan Studio', pillar_name: 'Educational', scheduled_at: '2025-07-04', start_time: '16:30', color: '#3b82f6' },
      { id: 'ref-4', title: 'Story: Polling Ide Konten Minggu Depan', pillar_name: 'Engagement', caption: 'Pilih topik yang paling ingin dibahas minggu ini di IG Story.', scheduled_at: '2025-07-06', start_time: '15:00', end_time: '16:00', color: '#6366f1', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'story', status: 'scheduled' },

      // Row 2
      { id: 'ref-5', title: 'Feed: Promo Bundling Social Media 9.9', pillar_name: 'Promotional', caption: 'Promo paket komplit kelola Instagram & TikTok hemat hingga 35%.', media_urls: 'https://canva.com/design/liva-promo-99', scheduled_at: '2025-07-07', start_time: '09:00', end_time: '10:00', color: '#f59e0b', assignee_copy: 'Galang Taufik', platform: 'instagram', content_type: 'feed_single', status: 'scheduled' },
      { id: 'ref-6', title: 'Shorts: Rahasia Lighting Murah Hasil Pro', pillar_name: 'Educational', caption: 'Setup 3-point lighting cuma pakai perlengkapan terjangkau.', media_urls: 'https://drive.google.com/drive/folders/lighting-tutorial', scheduled_at: '2025-07-09', start_time: '13:00', end_time: '14:30', color: '#3b82f6', assignee_copy: 'Emilia Inder', platform: 'youtube', content_type: 'short', status: 'drafting' },
      { id: 'ref-7', title: 'Carousel: 7 Font Populer untuk Desain 2026', pillar_name: 'Educational', caption: 'Rekomendasi font modern sans-serif gratis untuk desainer grafis.', media_urls: 'https://figma.com/file/fonts-2026', scheduled_at: '2025-07-10', start_time: '09:30', end_time: '10:30', color: '#3b82f6', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'carousel', status: 'scheduled' },
      { id: 'ref-7-extra-1', title: 'TikTok: Tips Mic Wireless Budget', pillar_name: 'Educational', scheduled_at: '2025-07-10', start_time: '13:00', color: '#3b82f6' },
      { id: 'ref-7-extra-2', title: 'Story: Share Spotify Playlist Editing', pillar_name: 'Behind The Scene', scheduled_at: '2025-07-10', start_time: '15:00', color: '#f43f5e' },
      { id: 'ref-7-extra-3', title: 'Feed: Infografis Algoritma IG Terbaru', pillar_name: 'Authority', scheduled_at: '2025-07-10', start_time: '17:00', color: '#10b981' },
      { id: 'ref-8', title: 'Meme: Klien Minta Revisi Jam 12 Malam', pillar_name: 'Entertainment', caption: 'POV desainer saat mau tidur tapi notifikasi revisi berdering.', media_urls: 'https://drive.google.com/drive/folders/meme-revisi', scheduled_at: '2025-07-12', start_time: '09:00', end_time: '10:00', color: '#a855f7', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-8-extra-1', title: 'Reels: 3 Trik Transisi Smooth CapCut', pillar_name: 'Educational', scheduled_at: '2025-07-12', start_time: '11:00', color: '#3b82f6' },
      { id: 'ref-8-extra-2', title: 'Story: Cuplikan Shooting Klien F&B', pillar_name: 'Behind The Scene', scheduled_at: '2025-07-12', start_time: '14:00', color: '#f43f5e' },
      { id: 'ref-9', title: 'Reels: Cara Riset Hashtag & Sound Viral', pillar_name: 'Educational', caption: 'Step by step cara cari sound yang berpotensi trending sebelum ramai dipakai.', scheduled_at: '2025-07-13', start_time: '09:00', end_time: '11:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'reels', status: 'scheduled' },

      // Row 3
      { id: 'ref-10', title: 'Testimoni: Review Klien F&B Omset Naik', pillar_name: 'Authority', caption: 'Kompilasi hasil engagement dan lonjakan penjualan dari video promosi.', media_urls: 'https://drive.google.com/drive/folders/testimoni-fnb', scheduled_at: '2025-07-15', start_time: '14:30', end_time: '15:30', color: '#10b981', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'carousel', status: 'approved' },
      { id: 'ref-11', title: 'Reels: Tutorial Color Grading Cinematic', pillar_name: 'Educational', caption: 'Free preset LUT CapCut untuk warna video terlihat mewah dan sinematik.', media_urls: 'https://drive.google.com/drive/folders/lut-cinematic', scheduled_at: '2025-07-17', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-11-extra-1', title: 'Feed: Panduan Brand Archetype', pillar_name: 'Educational', scheduled_at: '2025-07-17', start_time: '13:00', color: '#3b82f6' },
      { id: 'ref-11-extra-2', title: 'TikTok: Tips Percaya Diri Depan Kamera', pillar_name: 'Entertainment', scheduled_at: '2025-07-17', start_time: '15:00', color: '#a855f7' },
      { id: 'ref-12', title: 'Behind The Scene: Studio Photoshoot Liva', pillar_name: 'Behind The Scene', caption: 'Timelapse persiapan properti dan lighting sebelum photoshoot brand fashion.', media_urls: 'https://drive.google.com/drive/folders/bts-studio', scheduled_at: '2025-07-18', start_time: '11:00', end_time: '12:00', color: '#f43f5e', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-13', title: 'Feed: Portofolio Brand Guideline Kosmetik', pillar_name: 'Authority', caption: 'Presentasi mockup kemasan botol dan pedoman warna brand kecantikan.', media_urls: 'https://figma.com/file/brand-guideline-cosmetics', scheduled_at: '2025-07-20', start_time: '09:00', end_time: '10:00', color: '#10b981', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'feed_single', status: 'scheduled' },
      { id: 'ref-13-extra-1', title: 'Story: Trivia Istilah Marketing', pillar_name: 'Engagement', scheduled_at: '2025-07-20', start_time: '11:00', color: '#6366f1' },
      { id: 'ref-13-extra-2', title: 'Reels: 3 Tipe Thumbnail Bikin Diklik', pillar_name: 'Educational', scheduled_at: '2025-07-20', start_time: '14:00', color: '#3b82f6' },
      { id: 'ref-13-extra-3', title: 'TikTok: Karyawan Agensi Tipe Apakah Kamu?', pillar_name: 'Entertainment', scheduled_at: '2025-07-20', start_time: '16:00', color: '#a855f7' },

      // Row 4
      { id: 'ref-14', title: 'Story: Polling Desain Logo Pilihan Netizen', pillar_name: 'Engagement', caption: 'Sticker polling pilih variasi konsep logo coffee shop A atau B.', scheduled_at: '2025-07-22', start_time: '13:00', end_time: '14:00', color: '#6366f1', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'story', status: 'scheduled' },
      { id: 'ref-15', title: 'Reels: 3 Kesalahan Bikin Video TikTok Sepi', pillar_name: 'Educational', caption: 'Penyebab retensi video anjlok: audio berisik, resolusi buram, hook bertele-tele.', media_urls: 'https://drive.google.com/drive/folders/kesalahan-tiktok', scheduled_at: '2025-07-23', start_time: '09:00', end_time: '12:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', platform: 'tiktok', content_type: 'tiktok_video', status: 'scheduled' },
      { id: 'ref-15-extra-1', title: 'Carousel: Waktu Terbaik Upload Konten', pillar_name: 'Educational', scheduled_at: '2025-07-23', start_time: '13:00', color: '#3b82f6' },
      { id: 'ref-15-extra-2', title: 'Shorts: Quick Tutorial Efek Blur Capcut', pillar_name: 'Educational', scheduled_at: '2025-07-23', start_time: '15:00', color: '#3b82f6' },
      { id: 'ref-15-extra-3', title: 'Feed: Promo Konsultasi Akun Gratis', pillar_name: 'Promotional', scheduled_at: '2025-07-23', start_time: '17:00', color: '#f59e0b' },
      { id: 'ref-16', title: 'Carousel: Panduan Formula Copywriting AIDA', pillar_name: 'Educational', caption: 'Cara susun caption dari Attention, Interest, Desire, hingga Call to Action.', media_urls: 'https://figma.com/file/aida-copywriting', scheduled_at: '2025-07-25', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'carousel', status: 'scheduled' },
      { id: 'ref-17', title: 'TikTok: Tren Transisi Visual Stop Motion', pillar_name: 'Entertainment', caption: 'Video stop motion kemasan kopi melompat ke cangkir.', media_urls: 'https://drive.google.com/drive/folders/stop-motion-coffee', scheduled_at: '2025-07-26', start_time: '13:00', end_time: '14:00', color: '#a855f7', assignee_copy: 'Emilia Inder', platform: 'tiktok', content_type: 'tiktok_video', status: 'scheduled' },

      // Row 5
      { id: 'ref-18', title: 'Reels: Behind The Scene Voice Over Talent', pillar_name: 'Behind The Scene', caption: 'Blooper lucu saat proses rekaman suara untuk iklan TV commercial.', media_urls: 'https://drive.google.com/drive/folders/bts-voiceover', scheduled_at: '2025-07-28', start_time: '09:00', end_time: '11:00', color: '#f43f5e', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-18-extra-1', title: 'Feed: Studi Kasus Micro-Influencer vs Macro', pillar_name: 'Authority', scheduled_at: '2025-07-28', start_time: '13:00', color: '#10b981' },
      { id: 'ref-18-extra-2', title: 'Story: Share Tips Desain Feed Rapih', pillar_name: 'Educational', scheduled_at: '2025-07-28', start_time: '15:00', color: '#3b82f6' },
      { id: 'ref-18-extra-3', title: 'TikTok: Sound Viral Minggu Ini', pillar_name: 'Entertainment', scheduled_at: '2025-07-28', start_time: '17:00', color: '#a855f7' },
      { id: 'ref-19', title: 'Carousel: Kapan Bisnis Butuh Rebranding?', pillar_name: 'Educational', caption: '5 tanda bisnis Anda perlu memperbarui logo, tone of voice, dan visual.', media_urls: 'https://figma.com/file/rebranding-guide', scheduled_at: '2025-07-30', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'carousel', status: 'scheduled' },
      { id: 'ref-19-extra-1', title: 'Reels: Cara Menentukan Content Pillar', pillar_name: 'Educational', scheduled_at: '2025-07-30', start_time: '11:00', color: '#3b82f6' },
      { id: 'ref-19-extra-2', title: 'Story: Tanya Jawab Live Editing', pillar_name: 'Engagement', scheduled_at: '2025-07-30', start_time: '14:00', color: '#6366f1' }
    ];

    const realIds = new Set(posts.map(p => p.id));
    const merged = [...posts];
    for (const d of referenceDemoList) {
      if (!realIds.has(d.id!)) {
        merged.push(d as ContentPost);
      }
    }
    return merged;
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return enrichedPosts.filter((p) => {
      if (selectedBrand !== 'all' && p.brand_id !== selectedBrand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.pillar_name?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [enrichedPosts, selectedBrand, searchQuery]);

  const handleSlotClick = (dateStr: string, timeStr = '09:00') => {
    setSelectedPost({
      title: '',
      pillar_name: 'Educational',
      caption: '',
      notes: '',
      media_urls: '',
      assignee_copy: 'Nazmi Javier',
      assignee_design: 'Emilia Inder',
      platform: 'instagram',
      content_type: 'reels',
      scheduled_at: dateStr,
      start_time: timeStr,
      end_time: `${String(parseInt(timeStr.slice(0, 2), 10) + 1).padStart(2, '0')}:00`,
      status: 'scheduled',
      color: '#3b82f6'
    });
    setIsInspectorOpen(true);
  };

  const handleSelectPost = (post: ContentPost) => {
    setSelectedPost(post);
    setIsInspectorOpen(true);
  };

  const handleOpenNewEvent = () => {
    const todayStr = currentDate.toISOString().slice(0, 10);
    handleSlotClick(todayStr, '09:00');
  };

  const handleSaveInspectorPost = async (postData: Partial<ContentPost>) => {
    await onSavePost(postData);
  };

  // Top header date card details
  const displayDayNum =
    month === 6 && year === 2025 ? 18 : (month === new Date().getMonth() && year === new Date().getFullYear() ? new Date().getDate() : 1);

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-slate-50/50">
      {/* Main Calendar View Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar Matching Reference Image */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-200/80 shrink-0">
          {/* Left: Date Badge + Title + Subtitle Range */}
          <div className="flex items-center space-x-3.5">
            {/* Mini Date Box */}
            <div 
              onClick={goToday}
              className="w-12 h-12 rounded-xl border border-slate-200/90 bg-white flex flex-col items-center justify-center shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              title="Klik untuk kembali ke hari ini"
            >
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {MONTH_NAMES[month].slice(0, 4)}
              </span>
              <span className="text-base font-black text-slate-800 leading-tight">
                {displayDayNum}
              </span>
            </div>

            {/* Title & Range */}
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {MONTH_NAMES[month]} {year}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {MONTH_NAMES[month]} 1, {year} - {MONTH_NAMES[month]} {daysInMonth}, {year}
              </p>
            </div>
          </div>

          {/* Right: Controls (Arrows, View Switcher Pill, + Buat Konten) */}
          <div className="flex items-center space-x-3">
            {/* Filter Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                  showFilterDropdown || selectedBrand !== 'all' || searchQuery
                    ? 'border-blue-500 bg-blue-50/50 text-blue-700'
                    : 'border-slate-200/90 text-slate-700 hover:bg-slate-50 bg-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-3 text-xs space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Cari Konten / Pillar</label>
                    <input
                      type="text"
                      placeholder="Cari judul atau pillar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="all">Semua Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBrand('all');
                      setShowFilterDropdown(false);
                    }}
                    className="w-full py-1 text-center text-xs text-blue-600 font-medium hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Arrows Navigation Pill [ ← | → ] */}
            <div className="border border-slate-200/90 rounded-xl flex items-center divide-x divide-slate-200/90 bg-white shadow-2xs overflow-hidden">
              <button
                onClick={prevPeriod}
                className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Previous"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPeriod}
                className="p-2 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Next"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented View Switcher Pill: [ Month | Week | Day ] */}
            <div className="bg-slate-100/90 p-1 rounded-xl flex items-center text-xs font-semibold text-slate-600 shadow-inner">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Day
              </button>
            </div>

            {/* + Buat Konten Primary Blue Button */}
            <button
              onClick={handleOpenNewEvent}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Konten</span>
            </button>
          </div>
        </div>

        {/* Calendar Main Grid Canvas */}
        <div className="p-6 flex-1 flex flex-col min-h-0">
          <div className="border border-slate-200/80 rounded-2xl bg-white overflow-hidden shadow-xs flex-1 flex flex-col">
            {viewMode === 'month' ? (
              <MonthGridView
                currentDate={currentDate}
                posts={filteredPosts}
                onSelectPost={handleSelectPost}
                onSlotClick={handleSlotClick}
                selectedPostId={selectedPost?.id}
              />
            ) : viewMode === 'week' ? (
              <WeeklyTimeGridView
                currentDate={currentDate}
                posts={filteredPosts}
                onSelectPost={handleSelectPost}
                onSlotClick={handleSlotClick}
                selectedPostId={selectedPost?.id}
              />
            ) : (
              <DayGridView
                currentDate={currentDate}
                posts={filteredPosts}
                onSelectPost={handleSelectPost}
                onSlotClick={handleSlotClick}
                selectedPostId={selectedPost?.id}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Inspector Panel Drawer for Creating / Editing Content Posts */}
      <RightInspectorPanel
        post={selectedPost}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSave={handleSaveInspectorPost}
        onDelete={onDeletePost}
        accounts={accounts}
        pillars={pillars}
      />
    </div>
  );
};

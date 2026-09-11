import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ChevronDown,
  Trash2,
  CalendarX,
  AlertTriangle,
  Layers
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
  onDeleteMonthPosts?: (year: number, month: number) => Promise<void>;
  onDeleteAllPosts?: () => Promise<void>;
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
  onDeleteMonthPosts,
  onDeleteAllPosts,
  onUpdateStatus,
  onOpenQuickAdd
}) => {
  // Default to July 18, 2025 matching the user reference image
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 18));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDeleteDropdown, setShowDeleteDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  // Confirmation modal state for bulk deletion
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    isOpen: boolean;
    type: 'month' | 'all';
    title: string;
    message: string;
    count: number;
  }>({
    isOpen: false,
    type: 'month',
    title: '',
    message: '',
    count: 0,
  });
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  // Track deleted demo IDs so they don't reappear after being cleared
  const [deletedDemoIds, setDeletedDemoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('liva_deleted_demo_content_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
    setCurrentDate(new Date(2025, 6, 18));
  };

  // Pre-populate mock agency content for July 2025
  const enrichedPosts = useMemo(() => {
    const referenceDemoList: Partial<ContentPost>[] = [
      // Row 1
      { id: 'ref-1', title: 'Reels: 5 Tips Hook Konten FYP', pillar_name: 'Educational', caption: 'Bedah 5 formula hook video 3 detik pertama yang bikin audiens auto stop scrolling.', media_urls: 'https://drive.google.com/drive/folders/hook-konten-fyp', scheduled_at: '2025-07-01', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-2', title: 'Carousel: Panduan Desain Brand Guide', pillar_name: 'Educational', caption: 'Langkah praktis menyusun color palette dan typography hierarchy untuk UMKM.', media_urls: 'https://figma.com/file/brand-guide-template', scheduled_at: '2025-07-03', start_time: '11:00', end_time: '12:00', color: '#10b981', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'carousel', status: 'approved' },
      { id: 'ref-3', title: 'Feed: Case Study Brand Skincare Viral', pillar_name: 'Authority', caption: 'Analisis strategi konten peluncuran serum pencerah yang tembus 10.000 orderan.', media_urls: 'https://drive.google.com/drive/folders/case-study-skincare', scheduled_at: '2025-07-04', start_time: '10:00', end_time: '11:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'feed_single', status: 'scheduled' },
      { id: 'ref-4', title: 'Shorts: Behind The Scene Voice Over', pillar_name: 'Behind The Scene', caption: 'Proses recording talent VO di studio rekaman audio Liva Media.', media_urls: 'https://drive.google.com/drive/folders/bts-vo-talent', scheduled_at: '2025-07-04', start_time: '13:00', end_time: '14:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', platform: 'youtube', content_type: 'short', status: 'review' },
      { id: 'ref-4-extra', title: 'Story: Q&A Seputar Desain Logo', pillar_name: 'Engagement', scheduled_at: '2025-07-04', start_time: '15:30', color: '#6366f1' },
      { id: 'ref-5', title: 'TikTok: Mitos vs Fakta Live TikTok', pillar_name: 'Educational', caption: 'Membongkar anggapan salah soal durasi live streaming dan shadowban.', media_urls: 'https://drive.google.com/drive/folders/live-stream-hacks', scheduled_at: '2025-07-06', start_time: '15:00', end_time: '16:00', color: '#f59e0b', assignee_copy: 'Nazmi Javier', platform: 'tiktok', content_type: 'tiktok_video', status: 'scheduled' },

      // Row 2
      { id: 'ref-6', title: 'Feed: 3 Kesalahan Visual Feed Instagram', pillar_name: 'Educational', caption: 'Kenapa feed bisnismu terlihat berantakan dan solusinya dalam 3 langkah.', media_urls: 'https://canva.com/design/feed-tips', scheduled_at: '2025-07-07', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'feed_single', status: 'scheduled' },
      { id: 'ref-7', title: 'Carousel: Strategi Social Media Q3', pillar_name: 'Promotional', caption: 'Paket bundling manajemen akun Instagram & TikTok spesial pertengahan tahun.', media_urls: 'https://drive.google.com/drive/folders/promo-q3', scheduled_at: '2025-07-09', start_time: '13:00', end_time: '14:00', color: '#f59e0b', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'carousel', status: 'drafting' },
      { id: 'ref-8', title: 'Reels: Tren Audio Instagram Minggu Ini', pillar_name: 'Entertainment', caption: 'Kumpulan 4 audio trending dengan ritme cepat cocok untuk video katalog produk.', media_urls: 'https://instagram.com/reels/audio-trending', scheduled_at: '2025-07-10', start_time: '09:30', end_time: '10:30', color: '#3b82f6', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-9', title: 'Feed: Promo Flash Sale Jasa Foto Produk', pillar_name: 'Promotional', caption: 'Slot terbatas untuk 5 brand UMKM pertama di bulan Juli.', media_urls: 'https://drive.google.com/drive/folders/promo-foto-produk', scheduled_at: '2025-07-10', start_time: '13:00', end_time: '14:00', color: '#f59e0b', assignee_copy: 'Nazmi Javier', platform: 'instagram', content_type: 'feed_single', status: 'approved' },
      { id: 'ref-9-extra-1', title: 'TikTok: POV Bikin Desain Minta Revisi', pillar_name: 'Entertainment', scheduled_at: '2025-07-10', start_time: '16:00', color: '#a855f7' },
      { id: 'ref-9-extra-2', title: 'Reels: Behind The Scene Lighting Set', pillar_name: 'Behind The Scene', caption: 'Setup 3-point lighting untuk video interview profesional.', scheduled_at: '2025-07-12', start_time: '09:00', end_time: '10:00', color: '#f43f5e', assignee_copy: 'Emilia Inder', platform: 'instagram', content_type: 'reels', status: 'scheduled' },
      { id: 'ref-9-extra-3', title: 'TikTok: Tips Copywriting Headline Iklan', pillar_name: 'Educational', caption: 'Cara bikin judul iklan yang menarik rasa penasaran audiens dalam 2 detik.', scheduled_at: '2025-07-12', start_time: '11:00', end_time: '12:00', color: '#f43f5e', assignee_copy: 'Nazmi Javier', platform: 'tiktok', content_type: 'tiktok_video', status: 'scheduled' },
      { id: 'ref-9-extra-4', title: 'Story: Polling Topik Pembahasan Besok', pillar_name: 'Engagement', scheduled_at: '2025-07-12', start_time: '14:00', color: '#6366f1' },
      { id: 'ref-9-extra-5', title: 'Carousel: Teori Warna untuk Marketing', pillar_name: 'Educational', caption: 'Kenapa warna merah memicu nafsu makan dan biru menumbuhkan rasa percaya.', media_urls: 'https://figma.com/file/color-psychology', scheduled_at: '2025-07-13', start_time: '09:00', end_time: '10:00', color: '#3b82f6', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', platform: 'instagram', content_type: 'carousel', status: 'scheduled' },

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
    const deletedSet = new Set(deletedDemoIds);
    const merged = [...posts];
    for (const d of referenceDemoList) {
      if (!realIds.has(d.id!) && !deletedSet.has(d.id!)) {
        merged.push(d as ContentPost);
      }
    }
    return merged;
  }, [posts, deletedDemoIds]);

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

  // Current month count for bulk delete statistics
  const currentMonthPostsCount = useMemo(() => {
    return filteredPosts.filter((p) => {
      if (!p.scheduled_at) return false;
      const d = new Date(p.scheduled_at);
      return d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [filteredPosts, year, month]);

  const totalPostsCount = filteredPosts.length;

  const handleSlotClick = (dateStr: string, timeStr = '09:00') => {
    setSelectedPost({
      title: '',
      pillar_name: 'Educational',
      caption: '',
      notes: '',
      media_urls: '',
      assignee_copy: 'Nazmi Javier',
      assignee_design: 'Emilia Inder',
      scheduled_at: dateStr,
      start_time: timeStr,
      platform: 'instagram',
      content_type: 'reels',
      status: 'scheduled',
      color: '#3b82f6',
    });
    setIsInspectorOpen(true);
  };

  const handleSelectPost = (post: ContentPost) => {
    setSelectedPost(post);
    setIsInspectorOpen(true);
  };

  const handleOpenNewEvent = () => {
    const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-18`;
    setSelectedPost({
      title: '',
      pillar_name: 'Educational',
      caption: '',
      notes: '',
      media_urls: '',
      assignee_copy: 'Nazmi Javier',
      assignee_design: 'Emilia Inder',
      scheduled_at: todayStr,
      start_time: '09:00',
      platform: 'instagram',
      content_type: 'reels',
      status: 'scheduled',
      color: '#3b82f6',
    });
    setIsInspectorOpen(true);
  };

  const handleSaveInspectorPost = async (updatedData: Partial<ContentPost>) => {
    await onSavePost(updatedData);
  };

  // Bulk Delete Execution
  const handleConfirmBulkDelete = async () => {
    setIsDeletingBulk(true);
    try {
      if (confirmDeleteModal.type === 'month') {
        // Find demo IDs in this month
        const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const toDeleteDemoIds = enrichedPosts
          .filter(p => p.id?.startsWith('ref-') && p.scheduled_at?.startsWith(monthPrefix))
          .map(p => p.id!);

        const updatedDeleted = Array.from(new Set([...deletedDemoIds, ...toDeleteDemoIds]));
        setDeletedDemoIds(updatedDeleted);
        localStorage.setItem('liva_deleted_demo_content_ids', JSON.stringify(updatedDeleted));

        if (onDeleteMonthPosts) {
          await onDeleteMonthPosts(year, month + 1);
        }
      } else if (confirmDeleteModal.type === 'all') {
        // Mark all demo items as deleted
        const allDemoIds = enrichedPosts
          .filter(p => p.id?.startsWith('ref-'))
          .map(p => p.id!);

        const updatedDeleted = Array.from(new Set([...deletedDemoIds, ...allDemoIds]));
        setDeletedDemoIds(updatedDeleted);
        localStorage.setItem('liva_deleted_demo_content_ids', JSON.stringify(updatedDeleted));

        if (onDeleteAllPosts) {
          await onDeleteAllPosts();
        }
      }
      setConfirmDeleteModal(prev => ({ ...prev, isOpen: false }));
      setShowDeleteDropdown(false);
    } finally {
      setIsDeletingBulk(false);
    }
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

          {/* Right: Controls (Filter, Hapus Data, Arrows, View Switcher Pill, + Buat Konten) */}
          <div className="flex items-center space-x-2.5">
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
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-3 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
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
                      className="w-full py-1 text-center text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Hapus Data Dropdown (Hapus Data All & Data Bulan) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDeleteDropdown(!showDeleteDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                  showDeleteDropdown
                    ? 'border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                    : 'border-slate-200/90 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 bg-white'
                }`}
                title="Pilihan Hapus Data Konten"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Data</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showDeleteDropdown && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowDeleteDropdown(false)} />
                  <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-30 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 text-xs">Pembersihan Data Kalender</p>
                      <p className="text-[10px] text-slate-400">Pilih rentang data yang ingin dihapus</p>
                    </div>

                    {/* Opsi 1: Hapus Data Bulan Ini */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteDropdown(false);
                        setConfirmDeleteModal({
                          isOpen: true,
                          type: 'month',
                          title: `Hapus Konten Bulan ${MONTH_NAMES[month]} ${year}`,
                          message: `Apakah Anda yakin ingin menghapus seluruh data konten pada bulan ${MONTH_NAMES[month]} ${year} (${currentMonthPostsCount} konten)? Data pada bulan lain tidak akan terhapus.`,
                          count: currentMonthPostsCount,
                        });
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50/80 transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-2xs">
                        <CalendarX className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-rose-700 transition-colors">
                          Hapus Data Bulan Ini
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {currentMonthPostsCount} konten pada {MONTH_NAMES[month]} {year}
                        </p>
                      </div>
                    </button>

                    {/* Opsi 2: Hapus Semua Data (All) */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteDropdown(false);
                        setConfirmDeleteModal({
                          isOpen: true,
                          type: 'all',
                          title: 'Hapus SEMUA Data Konten (All)',
                          message: `PERINGATAN: Anda akan menghapus seluruh ${totalPostsCount} konten di SEMUA bulan secara permanen dari kalender. Tindakan ini tidak dapat dibatalkan.`,
                          count: totalPostsCount,
                        });
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50/80 transition-colors flex items-start gap-2.5 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-2xs">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-rose-600 group-hover:text-rose-700 transition-colors">
                          Hapus Semua Data (All)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Total {totalPostsCount} konten di seluruh bulan
                        </p>
                      </div>
                    </button>
                  </div>
                </>
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

      {/* Confirmation Modal for Bulk Delete (Month or All) */}
      {confirmDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              {confirmDeleteModal.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {confirmDeleteModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmDeleteModal(prev => ({ ...prev, isOpen: false }))}
                disabled={isDeletingBulk}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeletingBulk}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md hover:shadow-rose-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeletingBulk ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ya, Hapus Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

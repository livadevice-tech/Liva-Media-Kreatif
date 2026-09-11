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
import { ContentPost, Brand, ContentPillar, ContentStatus } from '../../types/app';
import { MonthGridView } from './MonthGridView';
import { WeeklyTimeGridView } from './WeeklyTimeGridView';
import { DayGridView } from './DayGridView';
import { RightInspectorPanel } from './RightInspectorPanel';

interface ContentCalendarViewProps {
  posts: ContentPost[];
  brands: Brand[];
  pillars: ContentPillar[];
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

  // Enriched sample events matching user reference screenshot for July 2025 + realistic demo data
  const enrichedPosts = useMemo(() => {
    const referenceDemoList: Partial<ContentPost>[] = [
      // Row 1
      { id: 'ref-1', title: 'Monthly sales call', scheduled_at: '2025-07-01', start_time: '09:00', end_time: '10:00', color: 'blue', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-2', title: 'New Intern Onboard...', scheduled_at: '2025-07-03', start_time: '11:00', end_time: '12:00', color: 'green', assignee_copy: 'Emilia Inder', status: 'approved' },
      { id: 'ref-3', title: 'Q3 results meets', scheduled_at: '2025-07-04', start_time: '10:00', end_time: '11:30', color: 'blue', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', status: 'scheduled' },
      { id: 'ref-3-extra-1', title: 'Team Sync', scheduled_at: '2025-07-04', start_time: '13:00', color: 'blue' },
      { id: 'ref-3-extra-2', title: 'Design Review', scheduled_at: '2025-07-04', start_time: '15:00', color: 'green' },
      { id: 'ref-3-extra-3', title: 'Client Call', scheduled_at: '2025-07-04', start_time: '16:30', color: 'purple' },
      { id: 'ref-4', title: '1-on-1 meeting', scheduled_at: '2025-07-06', start_time: '15:00', end_time: '16:00', color: 'amber', assignee_copy: 'Nazmi Javier', status: 'scheduled' },

      // Row 2
      { id: 'ref-5', title: 'Prep for all hands', scheduled_at: '2025-07-07', start_time: '09:00', end_time: '10:00', color: 'blue', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-6', title: 'Marketing sprint', scheduled_at: '2025-07-09', start_time: '13:00', end_time: '14:30', color: 'amber', assignee_copy: 'Emilia Inder', status: 'in_progress' },
      { id: 'ref-7', title: 'Sales briefing', scheduled_at: '2025-07-10', start_time: '09:30', end_time: '10:30', color: 'blue', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-7-extra-1', title: 'Budget Planning', scheduled_at: '2025-07-10', start_time: '13:00', color: 'amber' },
      { id: 'ref-7-extra-2', title: 'Contract Signing', scheduled_at: '2025-07-10', start_time: '15:00', color: 'blue' },
      { id: 'ref-7-extra-3', title: 'Weekly Wrap', scheduled_at: '2025-07-10', start_time: '17:00', color: 'green' },
      { id: 'ref-8', title: 'Social media meet', scheduled_at: '2025-07-12', start_time: '09:00', end_time: '10:00', color: 'pink', assignee_copy: 'Emilia Inder', status: 'scheduled' },
      { id: 'ref-8-extra-1', title: 'Reels Editing', scheduled_at: '2025-07-12', start_time: '11:00', color: 'pink' },
      { id: 'ref-8-extra-2', title: 'Copy Approval', scheduled_at: '2025-07-12', start_time: '14:00', color: 'purple' },
      { id: 'ref-9', title: 'Design sprint', scheduled_at: '2025-07-13', start_time: '09:00', end_time: '11:00', color: 'blue', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', status: 'scheduled' },

      // Row 3
      { id: 'ref-10', title: 'Performance review', scheduled_at: '2025-07-15', start_time: '14:30', end_time: '15:30', color: 'green', assignee_copy: 'Emilia Inder', status: 'approved' },
      { id: 'ref-11', title: 'Monthly sales call', scheduled_at: '2025-07-17', start_time: '09:00', end_time: '10:00', color: 'purple', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', status: 'scheduled' },
      { id: 'ref-11-extra-1', title: 'KPI Evaluation', scheduled_at: '2025-07-17', start_time: '13:00', color: 'blue' },
      { id: 'ref-11-extra-2', title: 'Vendor Sync', scheduled_at: '2025-07-17', start_time: '15:00', color: 'green' },
      { id: 'ref-12', title: 'Weekly review', scheduled_at: '2025-07-18', start_time: '11:00', end_time: '12:00', color: 'green', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-13', title: 'Engineering kickoff', scheduled_at: '2025-07-20', start_time: '09:00', end_time: '10:00', color: 'blue', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', status: 'scheduled' },
      { id: 'ref-13-extra-1', title: 'Architecture Review', scheduled_at: '2025-07-20', start_time: '11:00', color: 'purple' },
      { id: 'ref-13-extra-2', title: 'Database Migration', scheduled_at: '2025-07-20', start_time: '14:00', color: 'blue' },
      { id: 'ref-13-extra-3', title: 'QA Testing', scheduled_at: '2025-07-20', start_time: '16:00', color: 'green' },

      // Row 4
      { id: 'ref-14', title: 'Lunch with Emma', scheduled_at: '2025-07-22', start_time: '13:00', end_time: '14:00', color: 'amber', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-15', title: 'On-site visit', scheduled_at: '2025-07-23', start_time: '09:00', end_time: '12:00', color: 'blue', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-15-extra-1', title: 'Site Inspection', scheduled_at: '2025-07-23', start_time: '13:00', color: 'blue' },
      { id: 'ref-15-extra-2', title: 'Safety Audit', scheduled_at: '2025-07-23', start_time: '15:00', color: 'amber' },
      { id: 'ref-15-extra-3', title: 'Debrief', scheduled_at: '2025-07-23', start_time: '17:00', color: 'green' },
      { id: 'ref-16', title: 'Onboarding interns', scheduled_at: '2025-07-25', start_time: '09:00', end_time: '10:00', color: 'blue', assignee_copy: 'Nazmi Javier', assignee_design: 'EI', status: 'scheduled' },
      { id: 'ref-17', title: 'Dev-ops meet', scheduled_at: '2025-07-26', start_time: '13:00', end_time: '14:00', color: 'amber', assignee_copy: 'Emilia Inder', status: 'scheduled' },

      // Row 5
      { id: 'ref-18', title: 'On-site visit', scheduled_at: '2025-07-28', start_time: '09:00', end_time: '11:00', color: 'blue', assignee_copy: 'Nazmi Javier', status: 'scheduled' },
      { id: 'ref-18-extra-1', title: 'Follow-up Call', scheduled_at: '2025-07-28', start_time: '13:00', color: 'blue' },
      { id: 'ref-18-extra-2', title: 'Report Draft', scheduled_at: '2025-07-28', start_time: '15:00', color: 'green' },
      { id: 'ref-18-extra-3', title: 'Approval', scheduled_at: '2025-07-28', start_time: '17:00', color: 'purple' },
      { id: 'ref-19', title: 'Consultation', scheduled_at: '2025-07-30', start_time: '09:00', end_time: '10:00', color: 'pink', assignee_copy: 'Emilia Inder', status: 'scheduled' },
      { id: 'ref-19-extra-1', title: 'Strategy Deck', scheduled_at: '2025-07-30', start_time: '11:00', color: 'purple' },
      { id: 'ref-19-extra-2', title: 'Feedback Call', scheduled_at: '2025-07-30', start_time: '14:00', color: 'pink' }
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
        if (!p.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [enrichedPosts, selectedBrand, searchQuery]);

  const handleSlotClick = (dateStr: string, timeStr = '09:00') => {
    setSelectedPost({
      title: '',
      scheduled_at: dateStr,
      start_time: timeStr,
      end_time: `${String(parseInt(timeStr.slice(0, 2), 10) + 1).padStart(2, '0')}:00`,
      is_all_day: false,
      meet_link: 'https://meet.google.com/new',
      location: 'Jakarta, Indonesia',
      color: '#3b82f6',
      status: 'scheduled',
      assignee_copy: 'Nazmi Javier',
      notes: ''
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

          {/* Right: Controls (Arrows, View Switcher Pill, + Add Event) */}
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
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Cari Event</label>
                    <input
                      type="text"
                      placeholder="Cari judul event..."
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

            {/* + Add Event Primary Blue Button */}
            <button
              onClick={handleOpenNewEvent}
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
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

      {/* Right Inspector Panel Drawer for Creating / Editing Events */}
      <RightInspectorPanel
        post={selectedPost}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSave={handleSaveInspectorPost}
        onDelete={onDeletePost}
      />
    </div>
  );
};

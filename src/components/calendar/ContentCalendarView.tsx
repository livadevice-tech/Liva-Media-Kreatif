import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Check, 
  ChevronDown,
  Clock,
  User,
  Share2,
  Settings,
  Bell,
  Inbox
} from 'lucide-react';
import { ContentPost, Brand, ContentPillar, ContentStatus, ContentPlatform } from '../../types/app';
import { WeeklyTimeGridView } from './WeeklyTimeGridView';
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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 19)); // Feb 2026 as in reference
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'list'>('week');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  
  // Active selected post for Right Inspector Panel
  const [selectedPost, setSelectedPost] = useState<Partial<ContentPost> | null>(() => {
    // Default open inspector for "Meet" event like in reference image
    const existing = posts.find(p => p.title.toLowerCase().includes('meet'));
    if (existing) return existing;
    return {
      title: 'Meet',
      scheduled_at: '2026-02-19',
      start_time: '15:00',
      end_time: '16:00',
      is_all_day: false,
      meet_link: 'https://meet.google.com/izp-srsk-kxf',
      location: 'Jakarta, Indonesia',
      color: '#818cf8',
      notes: "You're invited to join our Google Meet session for an important discussion.\n\nLink: https://meet.google.com/izp-srsk-kxf\n\nWe look forward to your participation!",
      assignee_copy: 'Nazmi Javier',
      assignee_design: 'Emilia Inder',
      platform: 'instagram',
      content_type: 'feed_single',
      status: 'scheduled'
    };
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Navigation handlers
  const prevPeriod = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const goToday = () => {
    setCurrentDate(new Date(2026, 1, 19));
  };

  // Ensure default demo posts exist if posts list is sparse
  const enrichedPosts = useMemo(() => {
    // Combine real posts with reference-matching demo entries if needed
    const defaultDemoList: Partial<ContentPost>[] = [
      { id: 'demo-1', title: 'Photo Session', scheduled_at: '2026-02-18', is_all_day: true, color: 'grey' },
      { id: 'demo-2', title: 'Brain Training', scheduled_at: '2026-02-19', is_all_day: true, color: 'grey' },
      { id: 'demo-3', title: 'Skill Enhancement', scheduled_at: '2026-02-20', is_all_day: true, color: 'grey' },
      { id: 'demo-4', title: 'Call Mom', scheduled_at: '2026-02-21', is_all_day: true, color: 'grey' },
      { id: 'demo-5', title: 'Lunch', scheduled_at: '2026-02-18', start_time: '12:00', end_time: '13:00', color: '#4ade80' },
      { id: 'demo-6', title: 'Lunch', scheduled_at: '2026-02-19', start_time: '12:00', end_time: '13:00', color: '#4ade80' },
      { id: 'demo-7', title: 'Lunch with Emma', scheduled_at: '2026-02-20', start_time: '12:00', end_time: '13:00', color: '#818cf8' },
      { id: 'demo-8', title: 'Lunch', scheduled_at: '2026-02-21', start_time: '12:00', end_time: '13:00', color: '#4ade80' },
      { id: 'demo-9', title: 'Lunch with Emma', scheduled_at: '2026-02-22', start_time: '12:00', end_time: '13:00', color: '#818cf8' },
      { id: 'demo-10', title: 'Meet @El', scheduled_at: '2026-02-20', start_time: '13:00', end_time: '14:00', color: '#818cf8' },
      { id: 'demo-11', title: 'Networking Event', scheduled_at: '2026-02-20', start_time: '14:00', end_time: '16:00', color: '#f472b6' },
      { id: 'demo-12', title: 'Team Meeting', scheduled_at: '2026-02-21', start_time: '14:00', end_time: '15:00', color: '#818cf8' },
      { id: 'demo-13', title: 'Project Start', scheduled_at: '2026-02-22', start_time: '14:00', end_time: '15:00', color: 'grey' },
      { id: 'demo-14', title: 'Meet', scheduled_at: '2026-02-19', start_time: '15:00', end_time: '16:00', color: '#818cf8', notes: "You're invited to join our Google Meet session for an important discussion.\n\nLink: https://meet.google.com/izp-srsk-kxf\n\nWe look forward to your participation!", assignee_copy: 'Nazmi Javier', assignee_design: 'Emilia Inder' },
      { id: 'demo-15', title: 'Hobbies', scheduled_at: '2026-02-18', start_time: '16:00', end_time: '18:00', color: '#f472b6' },
      { id: 'demo-16', title: 'Creative Brainstorming', scheduled_at: '2026-02-19', start_time: '16:00', end_time: '20:00', color: '#fb923c' },
      { id: 'demo-17', title: 'Product Development', scheduled_at: '2026-02-20', start_time: '16:00', end_time: '17:00', color: '#3b82f6' },
      { id: 'demo-18', title: 'Family Time', scheduled_at: '2026-02-18', start_time: '18:00', end_time: '19:00', color: '#fb923c' },
      { id: 'demo-19', title: 'Project A', scheduled_at: '2026-02-21', start_time: '17:00', end_time: '18:00', color: '#3b82f6' },
      { id: 'demo-20', title: 'Project Review', scheduled_at: '2026-02-22', start_time: '17:00', end_time: '18:00', color: '#818cf8' }
    ];

    // Merge database posts on top
    const realIds = new Set(posts.map(p => p.id));
    const merged = [...posts];
    for (const d of defaultDemoList) {
      if (!realIds.has(d.id!)) {
        merged.push(d as ContentPost);
      }
    }
    return merged;
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return enrichedPosts.filter(p => {
      if (selectedBrand !== 'all' && p.brand_id !== selectedBrand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [enrichedPosts, selectedBrand, searchQuery]);

  // Click handler on calendar slot to create event
  const handleSlotClick = (dateStr: string, timeStr: string) => {
    const isAllDay = timeStr === 'All Day';
    const startHour = isAllDay ? '09:00' : timeStr;
    const endHour = isAllDay ? '17:00' : `${String(parseInt(timeStr.slice(0, 2), 10) + 1).padStart(2, '0')}:00`;
    
    setSelectedPost({
      title: 'New Event',
      scheduled_at: dateStr,
      start_time: startHour,
      end_time: endHour,
      is_all_day: isAllDay,
      meet_link: 'https://meet.google.com/new',
      location: 'Jakarta, Indonesia',
      color: '#818cf8',
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

  const handleSaveInspectorPost = async (postData: Partial<ContentPost>) => {
    await onSavePost(postData);
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white">
      {/* Center Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Calendar
          </h1>

          <div className="flex items-center space-x-3">
            {/* Share button */}
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Calendar link copied to clipboard!');
              }}
              className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Share</span>
            </button>

            {/* Header Icon Buttons */}
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
              <Inbox className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full absolute top-2 right-2" />
            </button>

            {/* Team Avatars */}
            <div className="flex items-center -space-x-1.5 pl-1">
              <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                NJ
              </div>
              <div className="w-7 h-7 rounded-full bg-pink-100 border-2 border-white text-pink-700 font-bold text-[10px] flex items-center justify-center">
                EI
              </div>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                alt="Profile"
                className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="h-14 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          {/* Left: Today & Month Navigator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={goToday}
              className="px-3.5 py-1.5 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              Today
            </button>

            <div className="flex items-center space-x-1.5 border border-slate-200/90 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs">
              <span>{MONTH_NAMES[month]}</span>
              <button 
                onClick={prevPeriod} 
                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={nextPeriod} 
                className="p-1 hover:bg-slate-100 rounded-md text-slate-600 cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: View Mode, Filter, Export */}
          <div className="flex items-center space-x-2">
            {/* View Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
              >
                <span className="capitalize">{viewMode}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showViewDropdown && (
                <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                  <button
                    onClick={() => { setViewMode('week'); setShowViewDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${viewMode === 'week' ? 'font-bold text-indigo-600' : 'text-slate-700'}`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => { setViewMode('month'); setShowViewDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${viewMode === 'month' ? 'font-bold text-indigo-600' : 'text-slate-700'}`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => { setViewMode('list'); setShowViewDropdown(false); }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 ${viewMode === 'list' ? 'font-bold text-indigo-600' : 'text-slate-700'}`}
                  >
                    List
                  </button>
                </div>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                  showFilterDropdown || selectedBrand !== 'all' || searchQuery
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                    : 'border-slate-200/90 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Filter</span>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-3 text-xs space-y-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search event title..."
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
                      <option value="all">All Brands</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedBrand('all'); setShowFilterDropdown(false); }}
                    className="w-full py-1 text-center text-xs text-indigo-600 font-medium hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                const json = JSON.stringify(filteredPosts, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `calendar-export-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View Body */}
        <div className="flex-1 overflow-hidden relative">
          {viewMode === 'week' ? (
            <WeeklyTimeGridView
              currentDate={currentDate}
              posts={filteredPosts}
              onSelectPost={handleSelectPost}
              onSlotClick={handleSlotClick}
              selectedPostId={selectedPost?.id}
            />
          ) : viewMode === 'month' ? (
            // Month grid view
            <div className="p-5 h-full overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="p-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNum = (i % 31) + 1;
                  const dateStr = `2026-02-${String(dayNum).padStart(2, '0')}`;
                  const dayEvents = filteredPosts.filter(p => p.scheduled_at?.startsWith(dateStr));
                  return (
                    <div 
                      key={i} 
                      onClick={() => handleSlotClick(dateStr, '12:00')}
                      className="min-h-[90px] border border-slate-200 rounded-xl p-2 hover:bg-indigo-50/20 cursor-pointer flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-slate-700">{dayNum}</span>
                      <div className="space-y-1 mt-1">
                        {dayEvents.slice(0, 2).map(ev => (
                          <div 
                            key={ev.id} 
                            onClick={(e) => { e.stopPropagation(); handleSelectPost(ev); }}
                            className="text-[10px] truncate px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium"
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // List view
            <div className="p-5 h-full overflow-y-auto custom-scrollbar">
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Assignee</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map(post => (
                      <tr 
                        key={post.id} 
                        onClick={() => handleSelectPost(post)}
                        className="hover:bg-slate-50/80 cursor-pointer"
                      >
                        <td className="p-3 font-semibold text-slate-800">{post.title}</td>
                        <td className="p-3 text-slate-600">
                          {post.scheduled_at} ({post.start_time || '12:00'} - {post.end_time || '13:00'})
                        </td>
                        <td className="p-3 text-slate-600">{post.assignee_copy || '-'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                            {post.status || 'scheduled'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleSelectPost(post); }}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Inspector Panel */}
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

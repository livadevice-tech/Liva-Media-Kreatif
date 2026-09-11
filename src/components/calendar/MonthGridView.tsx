import React from 'react';
import { Plus, Video, Image, FileText, Sparkles } from 'lucide-react';
import { ContentPost } from '../../types/app';

interface MonthGridViewProps {
  currentDate: Date;
  posts: ContentPost[];
  onSelectPost: (post: ContentPost) => void;
  onSlotClick: (dateStr: string, defaultTime?: string) => void;
  selectedPostId?: string;
}

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function formatEventTime(timeStr?: string): string {
  if (!timeStr) return '9:00am';
  const parts = timeStr.split(':');
  let hour = parseInt(parts[0], 10);
  const minute = parts[1] ? parts[1].padStart(2, '0') : '00';
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return minute === '00' ? `${hour}:00${ampm}` : `${hour}:${minute}${ampm}`;
}

const PILLAR_COLORS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  educational: { border: 'border-l-blue-500', bg: 'bg-blue-50/90 hover:bg-blue-100/90', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  promotional: { border: 'border-l-amber-500', bg: 'bg-amber-50/90 hover:bg-amber-100/90', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
  entertainment: { border: 'border-l-purple-500', bg: 'bg-purple-50/90 hover:bg-purple-100/90', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  authority: { border: 'border-l-emerald-500', bg: 'bg-emerald-50/90 hover:bg-emerald-100/90', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  'behind the scene': { border: 'border-l-rose-500', bg: 'bg-rose-50/90 hover:bg-rose-100/90', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' },
  engagement: { border: 'border-l-indigo-500', bg: 'bg-indigo-50/90 hover:bg-indigo-100/90', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' },
};

function getPillarStyle(pillarName?: string, color?: string) {
  const p = (pillarName || '').toLowerCase().trim();
  if (PILLAR_COLORS[p]) return PILLAR_COLORS[p];

  const c = (color || '').toLowerCase();
  if (c.includes('green') || c.includes('emerald')) return PILLAR_COLORS.authority;
  if (c.includes('amber') || c.includes('orange')) return PILLAR_COLORS.promotional;
  if (c.includes('purple')) return PILLAR_COLORS.entertainment;
  if (c.includes('pink') || c.includes('rose')) return PILLAR_COLORS['behind the scene'];
  if (c.includes('indigo')) return PILLAR_COLORS.engagement;

  return PILLAR_COLORS.educational;
}

export const MonthGridView: React.FC<MonthGridViewProps> = ({
  currentDate,
  posts,
  onSelectPost,
  onSlotClick,
  selectedPostId,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month
  const firstDay = new Date(year, month, 1);
  // Day of week index (Monday = 0 ... Sunday = 6)
  let startDayIndex = firstDay.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isHighlightTarget = (dNum: number, isCurMonth: boolean) => {
    if (!isCurMonth) return false;
    if (year === 2025 && month === 6) {
      return dNum === 18;
    }
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === dNum
    );
  };

  const totalDaysCount = startDayIndex + daysInMonth > 35 ? 42 : 35;

  const cells = [];
  for (let i = 0; i < totalDaysCount; i++) {
    let dayNum: number;
    let isCurrentMonth = false;
    let cellDateStr = '';

    if (i < startDayIndex) {
      // Prev month
      dayNum = daysInPrevMonth - startDayIndex + i + 1;
      const prevM = month === 0 ? 12 : month;
      const prevY = month === 0 ? year - 1 : year;
      cellDateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    } else if (i < startDayIndex + daysInMonth) {
      // Current month
      dayNum = i - startDayIndex + 1;
      isCurrentMonth = true;
      cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    } else {
      // Next month
      dayNum = i - startDayIndex - daysInMonth + 1;
      const nextM = month === 11 ? 1 : month + 2;
      const nextY = month === 11 ? year + 1 : year;
      cellDateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    }

    const dayPosts = posts.filter(
      (p) => p.scheduled_at && p.scheduled_at.startsWith(cellDateStr)
    );

    cells.push({
      dayNum,
      isCurrentMonth,
      dateStr: cellDateStr,
      isHighlighted: isHighlightTarget(dayNum, isCurrentMonth),
      posts: dayPosts,
    });
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-slate-200/80 bg-white shrink-0">
        {DAY_NAMES.map((day, idx) => (
          <div
            key={day}
            className={`py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider ${
              idx < 6 ? 'border-r border-slate-200/60' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className="grid grid-cols-7 flex-1 min-h-0 divide-y divide-slate-200/60 overflow-y-auto custom-scrollbar"
        style={{
          gridTemplateRows: `repeat(${totalDaysCount / 7}, minmax(115px, 1fr))`,
        }}
      >
        {cells.map((cell, idx) => {
          const colIndex = idx % 7;
          const isRightCol = colIndex === 6;

          return (
            <div
              key={cell.dateStr + '-' + idx}
              onClick={() => onSlotClick(cell.dateStr, '09:00')}
              className={`p-2 flex flex-col justify-between transition-colors group cursor-pointer hover:bg-slate-50/40 relative min-h-[115px] ${
                !isRightCol ? 'border-r border-slate-200/60' : ''
              } ${!cell.isCurrentMonth ? 'bg-slate-50/30' : 'bg-white'}`}
            >
              {/* Cell Header: Day Number + Quick Add Button */}
              <div className="flex items-center justify-between shrink-0 mb-1">
                {cell.isHighlighted ? (
                  <span className="w-5 h-5 rounded bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {cell.dayNum}
                  </span>
                ) : (
                  <span
                    className={`text-xs font-semibold px-0.5 ${
                      cell.isCurrentMonth
                        ? 'text-slate-700 group-hover:text-indigo-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(cell.dateStr, '09:00');
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer"
                  title={`Tambah konten tanggal ${cell.dateStr}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event / Content Cards inside Day Cell */}
              <div className="space-y-1.5 flex-1 overflow-hidden flex flex-col justify-start">
                {cell.posts.slice(0, 2).map((post) => {
                  const style = getPillarStyle(post.pillar_name, post.color);
                  const isSelected = selectedPostId === post.id;

                  return (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPost(post);
                      }}
                      className={`p-1.5 rounded-lg border-l-[3px] ${style.border} ${style.bg} transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01] ${
                        isSelected ? 'ring-2 ring-indigo-500' : ''
                      }`}
                    >
                      {/* Name Content */}
                      <div className="text-[11px] font-bold text-slate-800 truncate leading-snug">
                        {post.title}
                      </div>

                      {/* Pillar Badge */}
                      {post.pillar_name && (
                        <div className="mt-0.5">
                          <span className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded ${style.badge}`}>
                            {post.pillar_name}
                          </span>
                        </div>
                      )}

                      {/* Footer: Assign & Time */}
                      <div className="flex items-center justify-between mt-1 pt-0.5">
                        {/* Assign Avatars */}
                        <div 
                          className="flex items-center -space-x-1" 
                          title={`Assign: ${post.assignee_copy || 'Tim'} ${post.assignee_design ? '& ' + post.assignee_design : ''}`}
                        >
                          <div className="w-4 h-4 rounded-full bg-indigo-100 border border-white text-indigo-700 text-[8px] font-bold flex items-center justify-center">
                            {post.assignee_copy
                              ? post.assignee_copy
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase()
                              : 'NJ'}
                          </div>
                          {post.assignee_design && (
                            <div className="w-4 h-4 rounded-full bg-pink-100 border border-white text-pink-700 text-[8px] font-bold flex items-center justify-center">
                              {post.assignee_design
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Scheduled Time */}
                        <span className="text-[10px] text-slate-500 font-medium ml-1">
                          {formatEventTime(post.start_time)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* More events indicator */}
                {cell.posts.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPost(cell.posts[2]);
                    }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-indigo-600 transition-colors text-left pl-0.5 block cursor-pointer"
                  >
                    {cell.posts.length - 2} more...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

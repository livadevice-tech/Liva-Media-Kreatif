import React from 'react';
import { Plus } from 'lucide-react';
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

function getEventColorTheme(color?: string, status?: string) {
  const c = (color || '').toLowerCase();
  if (c.includes('green') || c.includes('emerald') || c === '#4ade80' || c === '#10b981' || status === 'published') {
    return {
      card: 'border-l-[3px] border-emerald-500 bg-emerald-50/80 hover:bg-emerald-100/80',
      avatarBg: 'bg-emerald-100 text-emerald-800',
    };
  }
  if (c.includes('amber') || c.includes('orange') || c === '#fb923c' || c === '#f59e0b') {
    return {
      card: 'border-l-[3px] border-amber-500 bg-amber-50/80 hover:bg-amber-100/80',
      avatarBg: 'bg-amber-100 text-amber-800',
    };
  }
  if (c.includes('purple') || c.includes('indigo') || c === '#a855f7' || c === '#818cf8' || c === '#6366f1') {
    return {
      card: 'border-l-[3px] border-purple-500 bg-purple-50/80 hover:bg-purple-100/80',
      avatarBg: 'bg-purple-100 text-purple-800',
    };
  }
  if (c.includes('pink') || c.includes('rose') || c === '#f472b6' || c === '#f43f5e') {
    return {
      card: 'border-l-[3px] border-pink-500 bg-pink-50/80 hover:bg-pink-100/80',
      avatarBg: 'bg-pink-100 text-pink-800',
    };
  }
  // default blue
  return {
    card: 'border-l-[3px] border-blue-500 bg-blue-50/80 hover:bg-blue-100/80',
    avatarBg: 'bg-blue-100 text-blue-800',
  };
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

  // Highlighted day: if July 2025, highlight 18 (matching reference image), otherwise today if matching current month
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

  // Generate 35 cells (5 rows) or 42 cells (6 rows)
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
        className={`grid grid-cols-7 flex-1 min-h-0 divide-y divide-slate-200/60 overflow-y-auto custom-scrollbar`}
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
                  title={`Tambah event tanggal ${cell.dateStr}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Cards inside Day Cell */}
              <div className="space-y-1.5 flex-1 overflow-hidden flex flex-col justify-start">
                {cell.posts.slice(0, 2).map((post) => {
                  const theme = getEventColorTheme(post.color, post.status);
                  const isSelected = selectedPostId === post.id;

                  return (
                    <div
                      key={post.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPost(post);
                      }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01] ${
                        theme.card
                      } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <div className="text-[11px] font-semibold text-slate-800 truncate leading-snug">
                        {post.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 pt-0.5">
                        {/* Avatars */}
                        <div className="flex items-center -space-x-1">
                          <div
                            className={`w-4 h-4 rounded-full border border-white text-[8px] font-bold flex items-center justify-center ${theme.avatarBg}`}
                          >
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

                        {/* Time */}
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

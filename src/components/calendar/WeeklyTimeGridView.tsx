import React, { useMemo } from 'react';
import { ContentPost } from '../../types/app';

interface WeeklyTimeGridViewProps {
  currentDate: Date;
  posts: ContentPost[];
  onSelectPost: (post: ContentPost) => void;
  onSlotClick: (dateStr: string, timeStr: string) => void;
  selectedPostId?: string;
}

const HOURS = [
  { hour: 12, label: '12 PM', timeStr: '12:00' },
  { hour: 13, label: '1 PM', timeStr: '13:00' },
  { hour: 14, label: '2 PM', timeStr: '14:00' },
  { hour: 15, label: '3 PM', timeStr: '15:00' },
  { hour: 16, label: '4 PM', timeStr: '16:00' },
  { hour: 17, label: '5 PM', timeStr: '17:00' },
  { hour: 18, label: '6 PM', timeStr: '18:00' },
  { hour: 19, label: '7 PM', timeStr: '19:00' },
  { hour: 20, label: '8 PM', timeStr: '20:00' }
];

export const WeeklyTimeGridView: React.FC<WeeklyTimeGridViewProps> = ({
  currentDate,
  posts,
  onSelectPost,
  onSlotClick,
  selectedPostId
}) => {
  // Generate 5 days (Sun to Thu as in screenshot) or 7 days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    // Find Sunday of this week
    const dayOfWeek = d.getDay(); // 0 is Sunday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 5; i++) {
      const current = new Date(sunday);
      current.setDate(sunday.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.push({
        date: current,
        dateString: current.toISOString().slice(0, 10),
        dayName: dayNames[current.getDay()],
        dayNum: current.getDate(),
        isToday: current.toDateString() === new Date().toDateString(),
        isActiveDay: i === 1 // Mon 19 as highlighted active day
      });
    }
    return days;
  }, [currentDate]);

  // Event color styling helper
  const getEventStyle = (post: ContentPost, isSelected: boolean) => {
    const title = post.title.toLowerCase();
    
    // Green (Lunch)
    if (title.includes('lunch')) {
      return {
        bg: 'bg-[#e7f9ee] hover:bg-[#d8f5e2]',
        border: 'border-[#bcf0cb]',
        text: 'text-[#186b32]',
        subText: 'text-[#2e7d47]'
      };
    }
    // Amber / Yellow (Creative / Family)
    if (title.includes('creative') || title.includes('family') || post.color === '#facc15' || post.color === '#fb923c') {
      return {
        bg: 'bg-gradient-to-b from-[#fef5d6] to-[#fde5a8] hover:from-[#fef2c5] hover:to-[#fddf94]',
        border: 'border-[#f8dba0]',
        text: 'text-[#7d4808]',
        subText: 'text-[#965a12]'
      };
    }
    // Pink (Hobbies)
    if (title.includes('hobbi') || post.color === '#f472b6' || post.color === '#f87171') {
      return {
        bg: 'bg-[#fdecf3] hover:bg-[#fbd9e6]',
        border: 'border-[#f8c9dc]',
        text: 'text-[#9c184c]',
        subText: 'text-[#ad2d5f]'
      };
    }
    // Blue (Project A, Product Dev)
    if (title.includes('project a') || title.includes('product') || post.color === '#3b82f6' || post.color === '#22d3ee') {
      return {
        bg: 'bg-[#e2f4fc] hover:bg-[#d4effa]',
        border: 'border-[#bfe5f7]',
        text: 'text-[#0d5c88]',
        subText: 'text-[#20729e]'
      };
    }
    // Soft Grey (Project Start)
    if (title.includes('project start') || post.color === 'grey') {
      return {
        bg: 'bg-[#f0f2f5] hover:bg-[#e4e7ec]',
        border: 'border-[#dce0e5]',
        text: 'text-[#343a40]',
        subText: 'text-[#495057]'
      };
    }
    // Purple / Indigo default (Meet, Networking, Team Meeting)
    return {
      bg: 'bg-[#f1edfe] hover:bg-[#e7e0fd]',
      border: 'border-[#ded4fc]',
      text: 'text-[#4d23a3]',
      subText: 'text-[#683eb8]'
    };
  };

  // Group events by day and whether they are all-day
  const allDayEvents = useMemo(() => {
    return posts.filter(p => p.is_all_day);
  }, [posts]);

  // Hourly positioned events
  const hourlyEvents = useMemo(() => {
    return posts.filter(p => !p.is_all_day);
  }, [posts]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* Grid Header: Days of the week */}
      <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-200/80 bg-white sticky top-0 z-10">
        {/* Top Left Timezone */}
        <div className="p-3 text-[11px] font-semibold text-slate-400 flex items-center justify-center border-r border-slate-200/60">
          UTC +7
        </div>

        {/* Day Column Headers */}
        {weekDays.map((day) => (
          <div
            key={day.dateString}
            className={`p-3 text-center border-r border-slate-200/60 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50/60 transition-colors ${
              day.isActiveDay ? 'font-bold' : ''
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-xs ${day.isActiveDay ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                {day.dayName}
              </span>
              <span className={`text-xs ${day.isActiveDay ? 'text-slate-900 font-extrabold' : 'text-slate-800 font-semibold'}`}>
                {day.dayNum}
              </span>
            </div>

            {/* Active underline indicator like in screenshot */}
            {day.isActiveDay && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* All Day Row */}
      <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-slate-200/80 bg-slate-50/40 min-h-[44px]">
        <div className="px-2 py-2.5 text-[11px] font-medium text-slate-400 text-center flex items-center justify-center border-r border-slate-200/60">
          All day
        </div>

        {weekDays.map((day, idx) => {
          const dayAllDay = allDayEvents.filter(p => p.scheduled_at?.startsWith(day.dateString));
          return (
            <div
              key={day.dateString}
              onClick={() => onSlotClick(day.dateString, 'All Day')}
              className="p-1.5 border-r border-slate-200/60 flex flex-wrap gap-1 items-center min-h-[44px] hover:bg-slate-100/40 cursor-pointer"
            >
              {dayAllDay.map((ev) => (
                <div
                  key={ev.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPost(ev);
                  }}
                  className="w-full text-center px-2 py-1 rounded-lg bg-slate-100 border border-slate-200/70 text-slate-700 text-[11px] font-medium truncate shadow-2xs hover:bg-slate-200/70 transition-colors"
                >
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Hourly Time Slots Canvas */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Current Time Indicator Line (2:45 PM indicator matching screenshot) */}
        <div 
          className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
          style={{ top: '235px' }}
        >
          <div className="w-[70px] flex justify-end pr-1">
            <span className="bg-[#6366f1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
              2:45 PM
            </span>
          </div>
          <div className="flex-1 h-[1.5px] bg-[#6366f1]/80 relative">
            <div className="absolute left-[38%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#4f46e5] ring-2 ring-indigo-200" />
          </div>
        </div>

        {/* Hour Rows */}
        <div className="relative divide-y divide-slate-100">
          {HOURS.map((hourObj) => (
            <div
              key={hourObj.hour}
              className="grid grid-cols-[70px_repeat(5,1fr)] min-h-[76px] relative group"
            >
              {/* Hour Label */}
              <div className="pr-3 text-[11px] font-medium text-slate-400 text-right pt-2 border-r border-slate-200/60 select-none">
                {hourObj.label}
              </div>

              {/* Day slot columns */}
              {weekDays.map((day) => {
                return (
                  <div
                    key={day.dateString}
                    onClick={() => onSlotClick(day.dateString, hourObj.timeStr)}
                    className="border-r border-slate-200/50 hover:bg-indigo-50/20 transition-colors relative cursor-pointer p-1"
                  >
                    {/* Events starting at this day & hour */}
                    {hourlyEvents
                      .filter((post) => {
                        if (!post.scheduled_at?.startsWith(day.dateString)) return false;
                        const postHour = parseInt(post.start_time?.slice(0, 2) || '12', 10);
                        return postHour === hourObj.hour;
                      })
                      .map((post) => {
                        const isSelected = selectedPostId === post.id;
                        const style = getEventStyle(post, isSelected);
                        
                        // Calculate span height if multi-hour
                        const startH = parseInt(post.start_time?.slice(0, 2) || '12', 10);
                        const endH = parseInt(post.end_time?.slice(0, 2) || `${startH + 1}`, 10);
                        const durationHours = Math.max(1, endH - startH);
                        const heightPx = durationHours * 76 - 8;

                        return (
                          <div
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectPost(post);
                            }}
                            style={{ height: `${heightPx}px` }}
                            className={`w-full rounded-2xl border ${style.bg} ${style.border} p-2.5 flex flex-col justify-start overflow-hidden cursor-pointer shadow-xs transition-all relative z-10 ${
                              isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-sm'
                            }`}
                          >
                            <span className={`text-xs font-semibold leading-snug truncate ${style.text}`}>
                              {post.title}
                            </span>
                            <span className={`text-[10px] font-medium mt-0.5 ${style.subText}`}>
                              {post.start_time?.slice(0, 5)} - {post.end_time?.slice(0, 5)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

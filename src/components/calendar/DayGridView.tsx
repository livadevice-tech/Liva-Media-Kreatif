import React from 'react';
import { Plus, Clock, MapPin, Video, CheckCircle2 } from 'lucide-react';
import { ContentPost } from '../../types/app';

interface DayGridViewProps {
  currentDate: Date;
  posts: ContentPost[];
  onSelectPost: (post: ContentPost) => void;
  onSlotClick: (dateStr: string, defaultTime?: string) => void;
  selectedPostId?: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

export const DayGridView: React.FC<DayGridViewProps> = ({
  currentDate,
  posts,
  onSelectPost,
  onSlotClick,
  selectedPostId,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const day = currentDate.getDate();
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const dayPosts = posts.filter((p) => p.scheduled_at && p.scheduled_at.startsWith(dateStr));

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Day Overview Banner */}
      <div className="px-6 py-3 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <p className="text-xs text-slate-500">{dayPosts.length} event dijadwalkan untuk hari ini</p>
        </div>
        <button
          onClick={() => onSlotClick(dateStr, '09:00')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Event</span>
        </button>
      </div>

      {/* Hourly Timeline */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
        {HOURS.map((hour) => {
          const hourStr = `${String(hour).padStart(2, '0')}:00`;
          const hourPosts = dayPosts.filter((p) => {
            const startTime = p.start_time || '09:00';
            return parseInt(startTime.split(':')[0], 10) === hour;
          });

          return (
            <div key={hour} className="flex gap-4 items-start group">
              <span className="w-16 text-xs font-semibold text-slate-400 pt-1 shrink-0 font-mono">
                {hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour}:00 AM`}
              </span>

              <div
                onClick={() => onSlotClick(dateStr, hourStr)}
                className={`flex-1 min-h-[56px] border border-slate-200/80 rounded-xl p-2.5 transition-all cursor-pointer ${
                  hourPosts.length > 0 ? 'bg-slate-50/40' : 'hover:bg-slate-50/60 hover:border-slate-300'
                }`}
              >
                {hourPosts.length === 0 ? (
                  <div className="h-full flex items-center text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    + Klik untuk tambah event jam {hourStr}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hourPosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPost(post);
                        }}
                        className={`p-3 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex items-center justify-between ${
                          selectedPostId === post.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{post.title}</h4>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {post.start_time || '09:00'} - {post.end_time || '10:00'}
                            </span>
                            {post.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {post.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                          {post.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

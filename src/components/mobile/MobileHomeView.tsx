import React from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  FolderArchive, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Zap
} from 'lucide-react';
import { ContentPost, Task, UserAccount } from '../../types/app';
import { MobileTab } from './MobileLayout';

interface MobileHomeViewProps {
  currentUser: UserAccount | null;
  posts: ContentPost[];
  tasks: Task[];
  onNavigate: (tab: MobileTab) => void;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  currentUser,
  posts,
  tasks,
  onNavigate
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const visibleTasks = tasks.filter(t => currentUser?.role === 'Master Admin' || t.visibility !== 'private');
  const todoTasks = visibleTasks.filter(t => t.status === 'todo' || t.status === 'in_progress');
  const upcomingPosts = posts
    .filter(p => p.scheduled_date && p.scheduled_date >= todayStr)
    .sort((a, b) => (a.scheduled_date || '').localeCompare(b.scheduled_date || ''))
    .slice(0, 3);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  return (
    <div className="p-4 space-y-5 max-w-md mx-auto animate-in fade-in duration-200">
      {/* 1. WELCOME BANNER */}
      <div className="bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/15 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-white">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">
            {greeting()}, {currentUser?.full_name?.split(' ')[0] || 'Team'}! 👋
          </h2>
          <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
            Semua jadwal produksi dan task kreatif Anda dalam satu sentuhan aplikasi mobile.
          </p>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onNavigate('calendar')}
            className="flex-1 py-2 px-3 rounded-xl bg-white text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Lihat Kalender</span>
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="flex-1 py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-sm active:scale-95 transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Buka Tasks</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calendar Summary */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2 cursor-pointer hover:border-blue-300 active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {posts.length}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Jadwal Konten
            </div>
          </div>
        </div>

        {/* Task Summary */}
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2 cursor-pointer hover:border-blue-300 active:scale-98 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {todoTasks.length}
            </div>
            <div className="text-xs font-medium text-slate-500">
              Task Aktif
            </div>
          </div>
        </div>
      </div>

      {/* 3. UPCOMING CONTENT PREVIEW */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Jadwal Konten Terdekat
          </h3>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Lihat Semua
          </button>
        </div>

        {upcomingPosts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 text-center text-xs text-slate-400">
            Belum ada jadwal konten terdekat.
          </div>
        ) : (
          upcomingPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate('calendar')}
              className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-blue-200 active:scale-99 transition-all"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 capitalize">
                    {post.platform}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {post.scheduled_date}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-800 truncate">
                  {post.title}
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. QUICK MODULES GRID */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
          Akses Cepat Modul
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => onNavigate('assets')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-left hover:border-blue-200 active:scale-98 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FolderArchive className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-800">Asset File</div>
              <div className="text-[10px] text-slate-400">Media & Dokumen</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/90 text-left hover:border-blue-200 active:scale-98 transition-all shadow-xs flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs text-slate-800">Reports</div>
              <div className="text-[10px] text-slate-400">Analitik & KPI</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  CalendarDays, 
  Users, 
  ArrowUpRight, 
  Clock, 
  AlertCircle, 
  Instagram, 
  Flame, 
  Layers
} from 'lucide-react';
import { DashboardStats, Task, ContentPost } from '../../types/projectApp';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onNavigate: (tab: 'projects' | 'social' | 'calendar' | 'brands') => void;
  onTaskClick: (task: Task) => void;
  onPostClick: (post: ContentPost) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  loading,
  onNavigate,
  onTaskClick,
  onPostClick,
}) => {
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { projects, tasks, posts, accounts, upcomingPosts, urgentTasks } = stats;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Creative Agency Workflow Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Selamat Datang di Hub Manajemen Media Kreatif
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Kelola seluruh alur kerja tim, pantau akun-akun media sosial multi-brand, dan atur jadwal penerbitan konten secara terpusat dalam satu dashboard.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-indigo-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Proyek Aktif</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{projects.total}</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {projects.in_progress} Berjalan
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{projects.completed} Proyek Selesai</span>
            <ArrowUpRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Tasks Card */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tugas & Kanban</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{tasks.total}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {tasks.in_progress} Sedang Dikerjakan
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{tasks.done} Selesai • {tasks.review} Perlu Review</span>
            <ArrowUpRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Content Scheduled Card */}
        <div 
          onClick={() => onNavigate('calendar')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-purple-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Konten Terjadwal</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{posts.scheduled + posts.approved}</span>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
              Siap Tayang
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{posts.in_pipeline} Masih di Pipeline</span>
            <ArrowUpRight className="w-4 h-4 text-purple-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* Social Accounts Card */}
        <div 
          onClick={() => onNavigate('social')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-pink-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Akun Medsos</span>
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{accounts.total}</span>
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
              {accounts.active} Aktif
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>{(accounts.total_followers || 0).toLocaleString()} Total Audiens</span>
            <ArrowUpRight className="w-4 h-4 text-pink-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Urgent Tasks & Upcoming Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Urgent Tasks */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-sm">Prioritas Tugas Mendesak</h3>
            </div>
            <button 
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Lihat Kanban
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {urgentTasks && urgentTasks.length > 0 ? (
              urgentTasks.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        t.priority === 'urgent' 
                          ? 'bg-rose-100 text-rose-700' 
                          : t.priority === 'high' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {t.priority}
                      </span>
                      {t.project_title && (
                        <span className="text-[11px] font-medium text-slate-500 truncate max-w-[150px]">
                          {t.project_title}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {t.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>👤 {t.assignee_name || 'Belum di-assign'}</span>
                      {t.due_date && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3" />
                          {t.due_date.split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      t.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'review' ? 'bg-purple-100 text-purple-700' :
                      t.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Tidak ada tugas mendesak saat ini. Semua terkendali! 🎉
              </div>
            )}
          </div>
        </div>

        {/* Right: Upcoming Scheduled Content */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900 text-sm">Jadwal Konten Mendatang</h3>
            </div>
            <button 
              onClick={() => onNavigate('calendar')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Lihat Kalender
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingPosts && upcomingPosts.length > 0 ? (
              upcomingPosts.map((p) => {
                const dateObj = new Date(p.scheduled_at);
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                return (
                  <div 
                    key={p.id}
                    onClick={() => onPostClick(p)}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-purple-200 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex flex-col items-center justify-center shrink-0 border border-indigo-100">
                        <span className="text-[10px] font-bold text-slate-500">{dateStr.split(' ')[1]}</span>
                        <span className="text-xs font-black text-indigo-700">{dateStr.split(' ')[0]}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            p.platform === 'instagram' ? 'bg-pink-100 text-pink-700' :
                            p.platform === 'tiktok' ? 'bg-slate-900 text-white' :
                            p.platform === 'youtube' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {p.platform} • {p.content_type.replace('_', ' ')}
                          </span>
                          {p.brand_name && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              {p.brand_name}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                          {p.title}
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          <span>⏰ {timeStr} WIB</span>
                          <span>• {p.pillar_name || 'Edukasi'}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                      p.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                      p.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada konten yang dijadwalkan untuk beberapa hari ke depan.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

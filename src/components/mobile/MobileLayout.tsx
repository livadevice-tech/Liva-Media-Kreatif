import React, { useState } from 'react';
import { 
  Sparkles, 
  Home, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  FileText, 
  MoreHorizontal,
  ChevronDown,
  FolderArchive,
  Users,
  Settings,
  Zap,
  LogOut,
  Database,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { UserAccount, DbStatus } from '../../types/app';
import { AppSettings } from '../settings/SettingsView';

export type MobileTab = 'home' | 'calendar' | 'tasks' | 'reports' | 'more' | 'assets' | 'accounts' | 'settings' | 'automation' | 'ai';

interface MobileLayoutProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  currentUser: UserAccount | null;
  appSettings: AppSettings;
  taskCount?: number;
  dbStatus: DbStatus | null;
  onOpenDbModal: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  appSettings,
  taskCount = 0,
  dbStatus,
  onOpenDbModal,
  onLogout,
  children
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

  // Derive user initial for avatar (e.g., "G" or "AD")
  const getUserInitial = () => {
    if (!currentUser?.full_name) return 'G';
    const parts = currentUser.full_name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 1).toUpperCase();
  };

  const appName = appSettings?.general?.appName || 'Liva Production';

  const handleTabClick = (tab: MobileTab) => {
    if (tab === 'more') {
      setIsMoreOpen(true);
    } else {
      setIsMoreOpen(false);
      onTabChange(tab);
    }
  };

  const handleMoreNavigation = (tab: MobileTab) => {
    setIsMoreOpen(false);
    onTabChange(tab);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* 1. TOP MOBILE APP BAR (Matching Mockups) */}
      <header className="shrink-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 flex items-center justify-between z-30 pt-safe">
        <div className="flex items-center gap-2.5">
          {/* Sparkle Logo inside Blue Rounded Square */}
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>

          {/* App Name Dropdown */}
          <button
            onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
            className="flex items-center gap-1.5 py-1 px-1.5 -ml-1 rounded-lg hover:bg-slate-100/70 transition-colors cursor-pointer text-left"
          >
            <span className="font-bold text-slate-900 text-base tracking-tight leading-none">
              {appName}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={() => setIsMoreOpen(true)}
          className="relative w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-transform"
          title={`Profil: ${currentUser?.full_name || 'User'}`}
        >
          {getUserInitial()}
          {currentUser?.role === 'Master Admin' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
          )}
        </button>
      </header>

      {/* App Info / Switcher Popup (Dropdown when tapping App Name) */}
      {isAppMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs"
          onClick={() => setIsAppMenuOpen(false)}
        >
          <div 
            className="absolute top-16 left-4 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 w-64 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 truncate">{appName}</div>
                <div className="text-[10px] text-slate-500">Creative Production & Calendar</div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Versi:</span>
                <span className="font-semibold text-slate-700">v2.4 Mobile Pro</span>
              </div>
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Role Anda:</span>
                <span className={`font-bold ${currentUser?.role === 'Master Admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                  {currentUser?.role || 'Team'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsAppMenuOpen(false);
                onOpenDbModal();
              }}
              className="w-full mt-2.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Cek Database Status
            </button>
          </div>
        </div>
      )}

      {/* 2. SCROLLABLE VIEW CONTENT */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 pb-20">
        {children}
      </main>

      {/* 3. BOTTOM NAVIGATION BAR (Matching Mockup 1 & 2) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around pb-safe">
        {/* Home */}
        <button
          onClick={() => handleTabClick('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-blue-50' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Calendar */}
        <button
          onClick={() => handleTabClick('calendar')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'calendar' ? 'bg-blue-50' : ''}`}>
            <CalendarIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Calendar</span>
        </button>

        {/* Task */}
        <button
          onClick={() => handleTabClick('tasks')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors relative ${activeTab === 'tasks' ? 'bg-blue-50' : ''}`}>
            <CheckSquare className="w-5 h-5" />
            {taskCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold flex items-center justify-center border border-white">
                {taskCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Task</span>
        </button>

        {/* Reports */}
        <button
          onClick={() => handleTabClick('reports')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${activeTab === 'reports' ? 'bg-blue-50' : ''}`}>
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Reports</span>
        </button>

        {/* More */}
        <button
          onClick={() => handleTabClick('more')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            ['assets', 'accounts', 'settings', 'automation', 'ai', 'more'].includes(activeTab)
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition-colors ${['assets', 'accounts', 'settings', 'automation', 'ai'].includes(activeTab) ? 'bg-blue-50' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </nav>

      {/* 4. "MORE" BOTTOM SHEET / MODAL */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150"
          onClick={() => setIsMoreOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl border-t border-slate-200 p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto -mt-1 mb-2" />

            {/* Header User Card */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {getUserInitial()}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 leading-tight">
                    {currentUser?.full_name || 'Admin User'}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className={`font-semibold ${currentUser?.role === 'Master Admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                      {currentUser?.role || 'Team'}
                    </span>
                    {currentUser?.position && <span>• {currentUser.position}</span>}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-1">
                Fitur Tambahan
              </div>

              {/* Asset File */}
              <button
                onClick={() => handleMoreNavigation('assets')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                  activeTab === 'assets'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FolderArchive className="w-4 h-4" />
                  </div>
                  <span>Asset File (Media Hub)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Buka File</span>
              </button>

              {/* Manajemen Akun (Khusus Master Admin) */}
              {currentUser?.role === 'Master Admin' && (
                <button
                  onClick={() => handleMoreNavigation('accounts')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                    activeTab === 'accounts'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>Manajemen Akun</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                    Master Admin
                  </span>
                </button>
              )}

              {/* Settings (Khusus Master Admin) */}
              {currentUser?.role === 'Master Admin' && (
                <button
                  onClick={() => handleMoreNavigation('settings')}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span>Pengaturan Aplikasi</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Kelola</span>
                </button>
              )}

              {/* Automation */}
              <button
                onClick={() => handleMoreNavigation('automation')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                  activeTab === 'automation'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span>Automation</span>
                </div>
              </button>

              {/* AI Features */}
              <button
                onClick={() => handleMoreNavigation('ai')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-emerald-700 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>New AI Features</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                  New
                </span>
              </button>
            </div>

            {/* System Info & Database */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onOpenDbModal();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-slate-50 text-slate-700 text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${dbStatus?.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span>Database MySQL Hostinger</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {dbStatus?.latencyMs !== undefined ? `${dbStatus.latencyMs}ms` : 'Cek'}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-rose-600 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Keluar dari Sistem (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

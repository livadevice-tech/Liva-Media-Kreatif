import React from 'react';
import { LayoutDashboard, Kanban, Share2, Calendar, Building2, Plus, Sparkles } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'projects' | 'social' | 'calendar' | 'brands';

interface AppHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: (type: 'task' | 'post' | 'project' | 'account') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ activeTab, onTabChange, onQuickAdd }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Agency Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-2 ring-white/10">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Liva Studio Hub
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Pro v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Project, Social Media & Content Planner
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => onTabChange('projects')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Projects & Kanban</span>
            </button>

            <button
              onClick={() => onTabChange('social')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'social'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Accounts</span>
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Content Calendar</span>
            </button>

            <button
              onClick={() => onTabChange('brands')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'brands'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Brands</span>
            </button>
          </nav>

          {/* Quick Actions Dropdown / Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onQuickAdd(activeTab === 'calendar' ? 'post' : activeTab === 'projects' ? 'task' : 'post')}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">
                {activeTab === 'calendar' ? 'Buat Konten Baru' : activeTab === 'projects' ? 'Tambah Task' : 'Buat Konten'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-between py-2.5 border-t border-slate-800 overflow-x-auto gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => onTabChange('projects')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>
          <button
            onClick={() => onTabChange('social')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'social' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Accounts</span>
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => onTabChange('brands')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'brands' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Brands</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from "react";
import { Bell, ChevronRight, Calendar, MoreVertical, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
type MobileDashboardHomeProps = {
  hosts: any[];
  clientBrands: any[];
  schedules: any[];
  studios: any[];
  loggedInAdminName?: string;
  avatarUrl?: string; // Optional avatar
  onNavigate?: (tabId: string) => void;
  adminNavItems?: any[];
};

const SparklineSVG = ({ color }: { color: string }) => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 18 C 5 18, 8 6, 12 6 C 16 6, 18 20, 22 20 C 26 20, 28 8, 32 8 C 36 8, 40 16, 46 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MobileDashboardHome: React.FC<MobileDashboardHomeProps> = ({
  hosts,
  clientBrands,
  schedules,
  studios,
  loggedInAdminName,
  avatarUrl,
  onNavigate,
  adminNavItems = [],
}) => {
  const [activeProjectTab, setActiveProjectTab] = useState<"today" | "upcoming">("today");

  const today = new Date();
  const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  const todaySessions = schedules.filter(s => s.date === todayLocal);
  const upcomingSessions = schedules.filter(s => s.date && s.date > todayLocal);
  const activeBrands = clientBrands.filter(b => b.isActive !== false);

  const displayedSessions = activeProjectTab === "today" ? todaySessions : upcomingSessions;

  return (
    <div className="md:hidden flex flex-col min-h-screen bg-[#fcfbfe] text-slate-800 font-sans pb-28 w-full max-w-[100vw] overflow-x-hidden">
      {/* 1. Header Area */}
      <div className="flex items-center justify-between px-4 py-8">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-slate-100" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shadow-sm">
              {loggedInAdminName ? loggedInAdminName.substring(0, 1).toUpperCase() : "A"}
            </div>
          )}
          <div>
            <p className="text-sm text-slate-500 mb-0.5">Welcome</p>
            <h1 className="text-xl font-bold text-slate-900 leading-none">{loggedInAdminName || "Administrator"}</h1>
          </div>
        </div>
        <div className="relative">
          <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 text-slate-600">
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute top-0 right-0 w-4 h-4 bg-orange-400 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">2</span>
        </div>
      </div>

      {/* 2. Overview Section */}
      <div className="px-4 mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1">
            This Week <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Card 1: Total Host (Purple) */}
          <div className="bg-[#f2edfb] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between aspect-[1.25]">
            <div className="flex justify-between items-start w-full">
              <span className="text-3xl font-black text-slate-800">{hosts.length}</span>
              <SparklineSVG color="#a881e6" />
            </div>
            <div className="flex justify-between items-end w-full">
              <span className="text-sm font-semibold text-slate-600">Total Host</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Card 2: Total Brand (Orange) */}
          <div className="bg-[#fcedeb] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between aspect-[1.25]">
            <div className="flex justify-between items-start w-full">
              <span className="text-3xl font-black text-slate-800">{activeBrands.length}</span>
              <SparklineSVG color="#f0967a" />
            </div>
            <div className="flex justify-between items-end w-full">
              <span className="text-sm font-semibold text-slate-600">Brands</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Card 3: Sesi Hari Ini (Blue) */}
          <div className="bg-[#ebf4fa] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between aspect-[1.25]">
            <div className="flex justify-between items-start w-full">
              <span className="text-3xl font-black text-slate-800">{todaySessions.length}</span>
              <SparklineSVG color="#79b6e8" />
            </div>
            <div className="flex justify-between items-end w-full">
              <span className="text-sm font-semibold text-slate-600">Sessions</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Card 4: Total Studio (Green) */}
          <div className="bg-[#ebf5ef] rounded-[20px] p-5 relative overflow-hidden flex flex-col justify-between aspect-[1.25]">
            <div className="flex justify-between items-start w-full">
              <span className="text-3xl font-black text-slate-800">{studios.length}</span>
              <SparklineSVG color="#62c286" />
            </div>
            <div className="flex justify-between items-end w-full">
              <span className="text-sm font-semibold text-slate-600">Studios</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      {adminNavItems.length > 0 && (
        <div className="mb-8 w-full max-w-full overflow-hidden">
          <div className="flex justify-between items-end mb-4 px-4">
            <h2 className="text-xl font-bold text-slate-900">Categories</h2>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 pl-[10px] pr-4 scrollbar-hide snap-x w-full">
            {adminNavItems
              .filter(item => !item.type && item.tabId !== "dashboard_utama")
              .map((item, idx) => {
                const IconComponent = item.icon || Calendar;
                const colors = [
                  "bg-blue-100 text-blue-600",
                  "bg-purple-100 text-purple-600",
                  "bg-pink-100 text-pink-600",
                  "bg-orange-100 text-orange-600",
                  "bg-emerald-100 text-emerald-600",
                  "bg-cyan-100 text-cyan-600",
                  "bg-amber-100 text-amber-600",
                  "bg-rose-100 text-rose-600"
                ];
                const colorClass = colors[idx % colors.length];
                
                return (
                  <button 
                    key={item.tabId || idx}
                    onClick={() => onNavigate && item.tabId && onNavigate(item.tabId)}
                    className="flex flex-col items-center gap-1.5 flex-none w-[60px] snap-start"
                  >
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 text-center leading-[1.1] line-clamp-2">
                      {item.label}
                    </span>
                  </button>
                );
              })
            }
          </div>
        </div>
      )}

      {/* 3. Sesi Siaran Section (Projects) */}
      <div className="px-4 flex-1">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Sesi Siaran</h2>
          <div className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-1">
            All time <ChevronRight className="w-3 h-3 rotate-90" />
          </div>
        </div>

        {/* Pill Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveProjectTab("today")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeProjectTab === "today"
                ? "bg-black text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            Hari Ini ({todaySessions.length})
          </button>
          <button
            onClick={() => setActiveProjectTab("upcoming")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeProjectTab === "upcoming"
                ? "bg-black text-white shadow-md"
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            Mendatang ({upcomingSessions.length})
          </button>
        </div>

        {/* List Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {displayedSessions.length > 0 ? (
              displayedSessions.slice(0, 5).map((session, i) => {
                const brandObj = clientBrands.find((b) => b.id === session.brandId);
                const hostObj = hosts.find((h) => h.id === session.hostId);
                const studioObj = studios.find((s) => s.id === session.studioId);

                return (
                  <motion.div
                    key={session.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="bg-[#f6f7fa] px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-[11px] font-bold text-slate-700">
                          {session.date} • {session.shift}
                        </span>
                      </div>
                      <button className="w-8 h-8 bg-[#f6f7fa] hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-[17px] font-bold text-slate-900 mb-4">
                      {brandObj ? brandObj.name : session.brandId}
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-xs font-semibold text-slate-500">
                          Host: {hostObj ? hostObj.name : "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-semibold text-slate-500">
                          Studio: {studioObj ? studioObj.name : "Utama"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-semibold">Tidak ada jadwal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  LayoutGrid, BookOpen, Calendar as CalendarIcon, Bell, MessageSquare,
  CheckCircle2, AlertTriangle, X, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${name}&background=random`;

// Assuming these types are available or passed in
type HostDashboardProps = {
  activeHostObj: any;
  hostForm: any;
  setHostForm: React.Dispatch<React.SetStateAction<any>>;
  handleHostAttendanceSubmit: (e: React.FormEvent) => void;
  hostFormError: string;
  setHostFormError: React.Dispatch<React.SetStateAction<string>>;
  showFormSuccess: boolean;
  submittedMessage: string;
  showLateAlert: boolean;
  setShowLateAlert: React.Dispatch<React.SetStateAction<boolean>>;
  lateCheckInDetails: any;
  handleLogout: () => void;
  brands: any[];
  clientBrands: any[];
  platforms: string[];
  shifts: string[];
  studios: any[];
  hostLogs: any[];
  hostCalendarMonth: number;
  hostCalendarYear: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  renderCalendarDays: () => React.ReactNode;
};

export default function HostDashboard({
  activeHostObj,
  hostForm,
  setHostForm,
  handleHostAttendanceSubmit,
  hostFormError,
  setHostFormError,
  showFormSuccess,
  submittedMessage,
  showLateAlert,
  setShowLateAlert,
  lateCheckInDetails,
  handleLogout,
  brands,
  clientBrands,
  platforms,
  shifts,
  studios,
  hostLogs,
  hostCalendarMonth,
  hostCalendarYear,
  handlePrevMonth,
  handleNextMonth,
  renderCalendarDays,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'calendar' | 'notifications'>('home');

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[460px] mx-auto bg-[#fafafa] font-sans overflow-hidden text-slate-800">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-24 px-6 pt-10">
        
        {/* TOP HEADER - AVATAR & GREETING */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={activeHostObj?.avatar || getAvatarUrl(activeHostObj?.name || "Host")}
            alt={activeHostObj?.name}
            className="w-12 h-12 rounded-full object-cover shadow-sm"
          />
          {activeTab === 'home' && (
            <div className="flex flex-col">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Hello {activeHostObj?.name?.split(' ')[0] || "Thomas"},
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                you have {hostLogs.filter(l => l.date === new Date().toISOString().split('T')[0]).length || 0} shifts today.
              </p>
            </div>
          )}
        </div>

        {/* --- HOME TAB --- */}
        {activeTab === 'home' && (
          <div className="animate-fadeIn">
            
            {/* Quick Cards (Horizontal Scroll) */}
            <div className="flex gap-4 overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="min-w-[180px] bg-white rounded-[20px] p-5 flex flex-col justify-between shadow-sm border border-slate-50">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">Today's Shift</div>
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {hostForm.shift || "No shift selected"}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {hostForm.brand || "Brand"} • {hostForm.platform || "Platform"}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-900">Pending</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                </div>
              </div>

              <div className="min-w-[180px] bg-white rounded-[20px] p-5 flex flex-col justify-between shadow-sm border border-slate-50">
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">Studio Location</div>
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {hostForm.studio || (activeHostObj?.studio || "Bandar Lampung")}
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-900">Scheduled</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                </div>
              </div>
            </div>

            {/* ATTENDANCE FORM (Clean Design) */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2 tracking-wide">
                Attendance Form
              </h3>
              
              <AnimatePresence>
                {showLateAlert && lateCheckInDetails && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-100 flex gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Late check-in (+{lateCheckInDetails.diffMinutes}m)</span>. Recorded time: {lateCheckInDetails.time}.
                    </div>
                    <button onClick={() => setShowLateAlert(false)} className="ml-auto"><X className="w-3 h-3" /></button>
                  </motion.div>
                )}
                {showFormSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 border border-emerald-100 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{submittedMessage}</span>
                  </motion.div>
                )}
                {hostFormError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 bg-red-50 rounded-xl p-3 text-xs text-red-800 border border-red-100 font-medium">
                    {hostFormError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleHostAttendanceSubmit} className="space-y-4 bg-white p-5 rounded-[24px] shadow-sm border border-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Brand</label>
                    <select value={hostForm.brand} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, brand: e.target.value })); }} required className="w-full bg-[#f8f9fa] border-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                      <option value="" disabled>Select Brand</option>
                      {Array.from(new Set([hostForm.brand, ...(clientBrands.length > 0 ? clientBrands.map((cb) => cb.name) : brands)].map(b => b?.trim()).filter(Boolean))).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Platform</label>
                    <select value={hostForm.platform} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, platform: e.target.value })); }} required className="w-full bg-[#f8f9fa] border-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                      <option value="" disabled>Select Platform</option>
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shift</label>
                    <select value={hostForm.shift} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, shift: e.target.value })); }} required className="w-full bg-[#f8f9fa] border-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                      <option value="" disabled>Select Shift</option>
                      {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Studio</label>
                    <select value={hostForm.studio} onChange={(e) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, studio: e.target.value })); }} required className="w-full bg-[#f8f9fa] border-none rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-slate-300 cursor-pointer">
                      <option value="" disabled>Select Studio</option>
                      {studios.map(st => <option key={st.id} value={st.name}>{st.name} - {st.location}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-3.5 text-xs font-bold tracking-wide mt-2 hover:bg-slate-800 transition-colors shadow-md">
                  Submit Check-In
                </button>
              </form>
            </div>

            {/* TIMELINE (Recent History) */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 font-bold mb-4 px-2">
                <span className="bg-slate-200 text-slate-800 px-3 py-1 rounded-full text-[10px]">Today</span>
              </div>
              
              <div className="flex flex-col gap-6 ml-2">
                {hostLogs.length === 0 ? (
                  <p className="text-xs text-slate-400 pl-4">No recent activity.</p>
                ) : (
                  hostLogs.slice(0, 4).map((log, i) => (
                    <div key={log.id} className="relative flex items-start gap-6">
                      {/* Vertical line connecting timeline */}
                      {i !== Math.min(hostLogs.length - 1, 3) && (
                        <div className="absolute left-[7px] top-4 bottom-[-24px] w-[2px] bg-slate-200"></div>
                      )}
                      
                      <div className="flex flex-col items-center gap-1 mt-1 z-10 text-[10px] text-slate-400 font-bold">
                        <div>{log.shiftHours?.split('-')[0] || '00:00'}</div>
                        {/* Custom colored hollow dot */}
                        <div className={`w-[16px] h-[16px] rounded-full border-[3px] bg-white ${log.status === 'Present' ? 'border-sky-400' : log.status === 'Late' ? 'border-amber-400' : 'border-rose-400'}`}></div>
                      </div>
                      
                      <div className="flex-1 mt-1">
                        <div className="text-xs font-bold text-slate-900">{log.brandHandled}</div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">{log.platform}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{log.studio}</span>
                          {log.checkInTime && <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">In: {log.checkInTime}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- CALENDAR TAB --- */}
        {activeTab === 'calendar' && (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][hostCalendarMonth]} <span className="text-slate-300 font-light">&lt;/&gt;</span>
              </h2>
              <div className="flex gap-4 text-slate-700">
                <button onClick={handlePrevMonth} className="hover:text-slate-900 transition-colors">⟲</button>
                <button onClick={handleNextMonth} className="hover:text-slate-900 transition-colors">⊕</button>
              </div>
            </div>

            {/* Custom Calendar Implementation (Placeholder referencing existing logic) */}
            <div className="mb-8">
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 text-center gap-y-4 text-sm font-semibold text-slate-700">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Below Calendar Agenda List */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                Upcoming Shifts
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 text-[10px] font-semibold text-slate-400 text-right leading-tight">17:00<br/>19:30</div>
                  <div className="w-2 h-2 rounded-full bg-sky-400 mt-1"></div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Live Streaming Session</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Tiktok • Liva Media</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LOGOUT IN PROFILE TAB (Simple representation) --- */}
        {activeTab === 'notifications' && (
          <div className="flex flex-col items-center justify-center h-full pt-20">
             <button onClick={handleLogout} className="px-6 py-2.5 rounded-full border border-red-200 text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 transition-colors">
               Log Out Account
             </button>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 w-full max-w-[460px] bg-white border-t border-slate-100 flex items-center justify-between px-8 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2 transition-colors ${activeTab === 'home' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}>
          <LayoutGrid className="w-6 h-6" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('history')} className={`p-2 transition-colors ${activeTab === 'history' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}>
          <BookOpen className="w-6 h-6" strokeWidth={activeTab === 'history' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`p-2 transition-colors ${activeTab === 'calendar' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}>
          <CalendarIcon className="w-6 h-6" strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
        </button>
        <button onClick={() => setActiveTab('notifications')} className={`p-2 transition-colors ${activeTab === 'notifications' ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}>
          <Bell className="w-6 h-6" strokeWidth={activeTab === 'notifications' ? 2.5 : 2} />
        </button>
      </div>
    </div>
  );
}

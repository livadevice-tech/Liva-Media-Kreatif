import React from "react";
import { Search, Bell, Book, Calendar, ClipboardList, CheckCircle2, MoreHorizontal, Flame, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DesktopDashboardHomeProps {
  hosts: any[];
  clientBrands: any[];
  schedules: any[];
  studios: any[];
  loggedInAdminName?: string;
  avatarUrl?: string;
  onNavigate?: (tabId: string) => void;
}

export const DesktopDashboardHome: React.FC<DesktopDashboardHomeProps> = ({
  hosts,
  clientBrands,
  schedules,
  studios,
  loggedInAdminName,
  avatarUrl,
  onNavigate,
}) => {
  const today = new Date();
  const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todaySessions = schedules.filter(s => s.date === todayLocal);
  const activeBrands = clientBrands.filter(b => b.isActive !== false);

  // Mock data for Line Chart (Performance Overview)
  const performanceData = [
    { name: '1 Oct', val: 20 },
    { name: '8 Oct', val: 40 },
    { name: '15 Oct', val: 30 },
    { name: '22 Oct', val: 70 },
    { name: '29 Oct', val: 50 },
    { name: '4 Nov', val: 85 },
  ];

  // Mock data for Pie Chart (Learning Progress)
  const progressData = [
    { name: 'Completed', value: 72, color: '#4f46e5' }, // indigo-600
    { name: 'In Progress', value: 20, color: '#f59e0b' }, // amber-500
    { name: 'Not Started', value: 8, color: '#e2e8f0' } // slate-200
  ];

  const greetingTime = today.getHours() < 12 ? "Good Morning" : today.getHours() < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="hidden md:block bg-[#fafafc] min-h-screen pb-12 w-full animate-fadeIn font-sans text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <p className="text-sm font-semibold text-slate-500">{greetingTime},</p>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2 mt-1">
            {loggedInAdminName || "Administrator"} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Let's make today productive!</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search for host, brands..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white">3</span>
          </div>
          {avatarUrl ? (
             <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shadow-sm border border-slate-200">
              {loggedInAdminName ? loggedInAdminName.substring(0, 1).toUpperCase() : "A"}
            </div>
          )}
        </div>
      </div>

      {/* 4 KPI CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-6 px-2">
        {/* Card 1 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-slate-500 mb-4">Total Host Aktif</h3>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{hosts.length}</div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Total Hosts</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Book className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-slate-500 mb-4">Total Brand</h3>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{activeBrands.length}</div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Active Brands</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-slate-500 mb-4">Sesi Hari Ini</h3>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{todaySessions.length}</div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Scheduled</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
          <h3 className="text-[13px] font-bold text-slate-500 mb-4">Total Studio</h3>
          <div className="flex justify-between items-end">
            <div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">{studios.length}</div>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">Available Rooms</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-2 gap-6 px-2">
        {/* LEFT COLUMN */}
        <div className="space-y-6 flex flex-col">
          {/* Today's Schedule List */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Today's Schedule
              </h2>
              <button 
                onClick={() => onNavigate && onNavigate('absensi')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-20 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {todaySessions.length > 0 ? todaySessions.slice(0, 3).map((session, i) => {
                const brandObj = clientBrands.find((b) => b.id === session.brandId);
                const hostObj = hosts.find((h) => h.id === session.hostId);
                
                // Extract hours mockup from shift string, or generate mockup times
                let timeStr = "09:00 AM";
                let endTimeStr = "10:00 AM";
                if (session.shift?.toLowerCase().includes("siang")) { timeStr = "01:00 PM"; endTimeStr = "02:00 PM"; }
                if (session.shift?.toLowerCase().includes("malam")) { timeStr = "07:00 PM"; endTimeStr = "08:00 PM"; }

                return (
                  <div key={session.id || i} className="relative flex items-start py-5 group">
                    <div className="flex flex-col w-24 flex-shrink-0 pt-0.5">
                      <span className="text-sm font-bold text-slate-900">{timeStr}</span>
                      <span className="text-[11px] font-semibold text-slate-400 mt-1">{endTimeStr}</span>
                    </div>
                    
                    {/* Timeline dot */}
                    <div className="w-4 h-4 rounded-full bg-white border-[3px] border-indigo-600 absolute left-24 -ml-2 top-6 group-hover:scale-125 transition-transform z-10" />

                    <div className="ml-10 flex-1 flex justify-between items-start">
                      <div>
                        <h4 className="text-[15px] font-bold text-slate-900 mb-1">{brandObj ? brandObj.name : session.brandId}</h4>
                        <p className="text-[13px] font-medium text-slate-500">Host: {hostObj ? hostObj.name : session.hostId}</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-500 px-3 py-1 bg-emerald-50 rounded-full flex items-center gap-1">
                        Sesi Siaran <span className="ml-0.5">&gt;</span>
                      </span>
                    </div>
                  </div>
                );
              }) : (
                 <div className="py-10 text-center">
                   <p className="text-sm font-semibold text-slate-500">Tidak ada sesi terjadwal untuk hari ini.</p>
                 </div>
              )}
            </div>
          </div>

          {/* Bottom Left Grid (Study Goals & Streak) */}
          <div className="grid grid-cols-2 gap-6 h-[240px]">
            {/* Study Goals (Target) */}
            <div className="bg-white rounded-[28px] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col justify-between">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  Target Liva
                </h2>
                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                  View All
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[13px] font-bold text-slate-800">Target Durasi Live</span>
                    <span className="text-xs font-bold text-slate-900">72%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Target: 20 Nov 2026</p>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-[13px] font-bold text-slate-800">Target Omset Bulan Ini</span>
                    <span className="text-xs font-bold text-slate-900">50%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400">Target: 30 Nov 2026</p>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-[28px] p-7 shadow-lg flex flex-col items-center justify-between text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl"></div>
               <div className="w-full flex justify-between items-center relative z-10">
                 <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
                   <Flame className="w-4 h-4 text-orange-300" /> Current Streak
                 </span>
                 <MoreHorizontal className="w-4 h-4 text-indigo-200" />
               </div>
               
               <div className="flex flex-col items-center relative z-10 mt-4">
                 <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/20">
                   <Flame className="w-8 h-8 text-orange-400 fill-orange-400" />
                 </div>
                 <h2 className="text-4xl font-black text-white tracking-tight">12</h2>
                 <p className="text-sm font-semibold text-indigo-200 mt-1">Days</p>
               </div>

               <p className="text-[10px] font-semibold text-indigo-100 mt-4 relative z-10">
                 Keep it up! You're doing great.
               </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 flex flex-col">
          {/* Learning Progress (Donut Chart) */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Learning Progress
              </h2>
              <div className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer">
                This Week ▾
              </div>
            </div>

            <div className="flex-1 flex items-center justify-between px-6">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={10}
                    >
                      {progressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-900">72%</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">Selesai</span>
                </div>
              </div>

              <div className="space-y-4">
                {progressData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Overview (Line Chart) */}
          <div className="bg-white rounded-[28px] p-7 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 h-[240px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Performance Overview
              </h2>
              <div className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 bg-slate-50 cursor-pointer">
                This Month ▾
              </div>
            </div>

            <div className="flex-1 w-full h-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Bell, MapPin, User, FileText, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCutoffPeriodOptionLabel } from '../../shared/utils/reporting';


function CustomSelect({ value, options, onChange, placeholder, error }: any) {
  // normalize options to {value, label} format
  const normalizedOptions = options.map((opt: any) => typeof opt === 'string' ? { value: opt, label: opt } : opt);
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white border ${error ? 'border-red-300 ring-4 ring-red-50' : isOpen ? 'border-purple-500 ring-4 ring-purple-50' : 'border-slate-200'} text-left rounded-xl px-4 py-3 text-xs outline-none transition-all flex items-center justify-between group`}
      >
        <span className={`font-bold ${value ? 'text-slate-800' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 z-50 overflow-hidden"
          >
            <div className="max-h-[220px] overflow-y-auto p-1">
              {normalizedOptions.map((opt: any) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${value === opt.value ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {opt.label}
                  {value === opt.value && <CheckCircle2 size={14} className="text-purple-600" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  setHostCalendarMonth: React.Dispatch<React.SetStateAction<number>>;
  setHostCalendarYear: React.Dispatch<React.SetStateAction<number>>;
  hostCutoffPeriod: string;
  setHostCutoffPeriod: React.Dispatch<React.SetStateAction<string>>;
  availableCutoffMonths: string[];
  computedSchedules: any[];
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
  setHostCalendarMonth,
  setHostCalendarYear,
  hostCutoffPeriod,
  setHostCutoffPeriod,
  availableCutoffMonths,
  computedSchedules,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'absen' | 'rekap' | 'kalender'>('absen');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeHostObj || !computedSchedules) return;
    if (hasAutoFilled) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const todaySchedule = computedSchedules.find(
      (s) => s.hostId === activeHostObj.id && !s.isDeleted && !s.isOffDay && s.date === todayStr
    );

    if (todaySchedule) {
      setHostForm({
        brand: todaySchedule.brandHandled || todaySchedule.brand || '',
        platform: todaySchedule.platform || '',
        shift: todaySchedule.shift || '',
        studio: todaySchedule.studio || activeHostObj.studio || ''
      });
    } else {
      // Empty the form if there's no schedule for today
      setHostForm({
        brand: '',
        platform: '',
        shift: '',
        studio: ''
      });
    }
    setHasAutoFilled(true);
  }, [activeHostObj, computedSchedules, setHostForm, hasAutoFilled]);

  const handlePrevMonth = () => {
    if (hostCalendarMonth === 0) {
      setHostCalendarMonth(11);
      setHostCalendarYear((y: number) => y - 1);
    } else {
      setHostCalendarMonth((m: number) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (hostCalendarMonth === 11) {
      setHostCalendarMonth(0);
      setHostCalendarYear((y: number) => y + 1);
    } else {
      setHostCalendarMonth((m: number) => m + 1);
    }
  };

  const hostSchedules = (computedSchedules || []).filter(s => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay);
  
  // Extract unique brands for the legend and assign a color index
  const uniqueBrands = Array.from(new Set(hostSchedules.map(s => s.brandHandled || s.brand)));
  const brandColors = [
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300' },
  ];

  const getBrandColor = (brand: string) => {
    const idx = uniqueBrands.indexOf(brand);
    return brandColors[idx % brandColors.length];
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
    const firstDay = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    return Array.from({ length: 42 }).map((_, i) => {
      if (i < adjustedFirstDay || i >= adjustedFirstDay + daysInMonth) {
        return <div key={`empty-${i}`} className="py-1.5" />;
      }
      
      const day = i - adjustedFirstDay + 1;
      
      // Check if there is a schedule for this date
      const dateStr = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySchedule = hostSchedules.find(s => s.date === dateStr);

      let style = 'bg-white text-slate-500 border border-slate-200';
      if (daySchedule) {
        const brand = daySchedule.brandHandled || daySchedule.brand;
        const colorObj = getBrandColor(brand);
        style = `${colorObj.bg} ${colorObj.text} border-2 ${colorObj.border} font-black`;
      }
      
      return (
        <div key={day} onClick={() => setSelectedDate(dateStr)} className={`py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all ${style} ${selectedDate === dateStr ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 z-10' : ''}`}>
          {day}
        </div>
      );
    });
  };

  const initials = activeHostObj?.name 
    ? activeHostObj.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'NA';

  // Check schedule and attendance for today
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const hasScheduleToday = computedSchedules?.some(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === todayStr
  );
  
  const hasCheckedInToday = hostLogs?.some(
    (log) => log.hostId === activeHostObj?.id && log.date === todayStr
  );

  // Check schedule for today and tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  
  const timeRegex = /\b(\d{2}[.:]\d{2})\b/;
  const sortByTime = (schedules: any[]) => {
    return [...schedules].sort((a, b) => {
      const matchA = (a.timeSlot || "").match(timeRegex);
      const matchB = (b.timeSlot || "").match(timeRegex);
      const timeA = matchA ? matchA[1].replace('.', ':') : (a.timeSlot || "");
      const timeB = matchB ? matchB[1].replace('.', ':') : (b.timeSlot || "");
      return timeA.localeCompare(timeB);
    });
  };

  const todaySchedules = (computedSchedules || []).filter(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === todayStr
  );
  const tomorrowSchedules = (computedSchedules || []).filter(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === tomorrowStr
  );

  const sortedTodaySchedules = sortByTime(todaySchedules);
  const sortedTomorrowSchedules = sortByTime(tomorrowSchedules);

  let upcomingSchedule = null;
  let upcomingDateStr = "";
  let upcomingLabel = "";

  if (sortedTodaySchedules.length > 0) {
    const todaySched = sortedTodaySchedules[0];
    let shiftHasStarted = false;
    const match = (todaySched.timeSlot || "").match(timeRegex);
    if (match) {
      const formattedTime = match[1].replace('.', ':');
      const targetDate = new Date(`${todayStr}T${formattedTime}:00`);
      if (!isNaN(targetDate.getTime()) && currentTime.getTime() >= targetDate.getTime()) {
         shiftHasStarted = true;
      }
    }
    
    if (hasCheckedInToday && shiftHasStarted) {
      upcomingSchedule = sortedTomorrowSchedules[0];
      upcomingDateStr = tomorrowStr;
      upcomingLabel = "Jadwal Besok";
    } else {
      upcomingSchedule = todaySched;
      upcomingDateStr = todayStr;
      upcomingLabel = "Jadwal Hari Ini";
    }
  } else {
    upcomingSchedule = sortedTomorrowSchedules[0];
    upcomingDateStr = tomorrowStr;
    upcomingLabel = "Jadwal Besok";
  }

  let statusLabel = '';
  let statusStyle = '';
  let StatusIcon = null;

  if (!hasScheduleToday) {
    statusLabel = 'Kamu tidak ada jadwal hari ini';
    statusStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    StatusIcon = CalendarIcon;
  } else if (hasCheckedInToday) {
    statusLabel = 'Kamu sudah absen';
    statusStyle = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    StatusIcon = CheckCircle2;
  } else {
    statusLabel = 'Kamu belum absen hari ini';
    statusStyle = 'bg-amber-50 text-amber-600 border-amber-200';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-[#f8f9fc] p-4 font-sans text-slate-800">
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mb-4 flex justify-between items-start gap-4">
        
        {/* Left Side: Avatar & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-[72px] h-[72px] shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-[28px] font-black">
            {initials}
          </div>
          <div className="flex flex-col items-start pt-1">
            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-[10px] font-black tracking-widest uppercase rounded-full mb-2">
              HOST CONNECT
            </span>
            <h2 className="text-xl font-black text-slate-900 leading-tight mb-1 pr-2">
              {activeHostObj?.name || 'Nabila Zahratun Sita'}
            </h2>
            <div className="text-xs text-slate-500 font-semibold mb-1">
              ID: {activeHostObj?.employeeId || '-'}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <MapPin size={14} className="text-purple-600" />
              {activeHostObj?.studio || 'Tanggamus'}
            </div>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 pt-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">
            <Bell size={18} />
          </button>
          <button onClick={handleLogout} className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 text-[10px] font-black tracking-wider uppercase hover:bg-red-50 transition-colors">
            LOG OUT
          </button>
          <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            AKTIF
          </div>
        </div>
      </div>

      {/* Upcoming Schedule Card */}
      {upcomingSchedule && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] border border-indigo-400 p-5 shadow-md shadow-indigo-200/50 mb-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <CalendarIcon size={80} />
          </div>
          <div className="relative z-10">
            <div className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-80">{upcomingLabel}</div>
            <h3 className="text-xl font-black mb-3">
              {upcomingSchedule.brandHandled || upcomingSchedule.brand}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Shift</div>
                <div className="text-sm font-black">{upcomingSchedule.timeSlot || upcomingSchedule.shift}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center">
                <div className="text-[10px] font-bold uppercase opacity-80 mb-0.5">Studio</div>
                <div className="text-sm font-black truncate">{upcomingSchedule.studio}</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between backdrop-blur-sm">
              <span className="text-xs font-bold opacity-90">Menuju sesi:</span>
              <span className="text-lg font-black tracking-wider text-amber-300">
                {(() => {
                   const match = (upcomingSchedule.timeSlot || "").match(/\b(\d{2}[.:]\d{2})\b/);
                   if (!match) return "-";
                   const formattedTime = match[1].replace('.', ':');
                   const targetDate = new Date(`${upcomingDateStr}T${formattedTime}:00`);
                   if (isNaN(targetDate.getTime())) return "-";
                   
                   const diffMs = targetDate.getTime() - currentTime.getTime();
                   if (diffMs <= 0) return "Tiba!";
                   
                   const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                   const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                   const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
                   
                   return `${diffHours}j ${diffMins}m ${String(diffSecs).padStart(2, '0')}d`;
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Status Label Banner */}
      <div className={`mb-4 px-4 py-3 rounded-[20px] border flex items-center justify-center gap-2 text-xs font-bold ${statusStyle} shadow-sm`}>
        <StatusIcon size={16} />
        {statusLabel}
      </div>

      {/* Segmented Control / Tabs */}
      <div className="bg-[#f0f2f5] p-1.5 rounded-[20px] flex gap-1 mb-4 border border-slate-200">
        <button 
          onClick={() => setActiveTab('absen')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'absen' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <User size={16} /> Absen
        </button>
        <button 
          onClick={() => setActiveTab('rekap')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'rekap' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <FileText size={16} /> Rekap
        </button>
        <button 
          onClick={() => setActiveTab('kalender')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === 'kalender' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
        >
          <CalendarIcon size={16} /> Kalender
        </button>
      </div>

      {/* --- TAB CONTENT: ABSEN --- */}
      {activeTab === 'absen' && (
        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm animate-fadeIn">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Form Absensi Hari Ini</h3>
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[11px] font-black tracking-widest shadow-sm">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
            <p className="text-[13px] font-bold text-slate-700 leading-relaxed">
              Isi data di bawah sesuai jadwal yang sedang kamu jalani. Kalau ada yang belum terisi, pilih dulu sebelum submit.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Brand</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.brand || 'Pilih brand'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Platform</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.platform || 'Pilih platform'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Shift</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.shift || 'Pilih shift'}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-2 text-center flex flex-col justify-center gap-1 h-[60px]">
              <span className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Studio</span>
              <span className="text-[10px] font-bold text-slate-800 truncate">{hostForm.studio || 'Pilih studio'}</span>
            </div>
          </div>

          <AnimatePresence>
            {showLateAlert && lateCheckInDetails && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-100 flex gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div>
                  <span className="font-bold">Late check-in (+{lateCheckInDetails.diffMinutes}m)</span>. Waktu: {lateCheckInDetails.time}.
                </div>
                <button type="button" onClick={() => setShowLateAlert(false)} className="ml-auto"><X className="w-3 h-3" /></button>
              </motion.div>
            )}
            {showFormSuccess && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 border border-emerald-100 flex gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">{submittedMessage}</span>
              </motion.div>
            )}
            {hostFormError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 bg-red-50 rounded-xl p-3 text-xs text-red-800 border border-red-100 font-bold">
                {hostFormError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleHostAttendanceSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Brand Besutan:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <CustomSelect 
                value={hostForm.brand} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, brand: val })); }} 
                options={Array.from(new Set([hostForm.brand, ...(clientBrands?.length > 0 ? clientBrands.map((cb) => cb.name) : brands)].map(b => b?.trim()).filter(Boolean)))} 
                placeholder="-- Pilih Brand Besutan --" 
                error={hostFormError && !hostForm.brand} 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Platform Streaming:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <CustomSelect 
                value={hostForm.platform} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, platform: val })); }} 
                options={platforms} 
                placeholder="-- Pilih Platform Streaming --" 
                error={hostFormError && !hostForm.platform} 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Shift Kerja Live:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <CustomSelect 
                value={hostForm.shift} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, shift: val })); }} 
                options={shifts} 
                placeholder="-- Pilih Shift Kerja --" 
                error={hostFormError && !hostForm.shift} 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-end">
                <label className="text-xs font-black text-slate-800">Studio Penempatan:</label>
                <span className="text-[10px] font-bold text-red-500">*Wajib diisi</span>
              </div>
              <CustomSelect 
                value={hostForm.studio} 
                onChange={(val: string) => { setHostFormError(""); setHostForm((prev: any) => ({ ...prev, studio: val })); }} 
                options={studios.map(st => ({ value: st.name, label: `${st.name} - ${st.location}` }))} 
                placeholder="-- Pilih Studio Penempatan --" 
                error={hostFormError && !hostForm.studio} 
              />
            </div>

            <button type="submit" className="w-full bg-purple-700 text-white rounded-xl py-3.5 text-xs font-black tracking-wider uppercase mt-4 hover:bg-purple-800 transition-colors shadow-md">
              Submit Absen Sekarang
            </button>
          </form>
        </div>
      )}

      {/* --- TAB CONTENT: REKAP (Timeline) --- */}
      {activeTab === 'rekap' && (
        <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm animate-fadeIn">
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 flex flex-col items-center justify-center shadow-sm">
              <span className="text-2xl font-black text-emerald-700">{hostLogs.filter(l => l.status !== 'Late').length}</span>
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">Hadir</span>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex flex-col items-center justify-center shadow-sm">
              <span className="text-2xl font-black text-amber-700">{hostLogs.filter(l => l.status === 'Late').length}</span>
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest mt-1">Telat</span>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-100 flex flex-col items-center justify-center shadow-sm">
              <span className="text-2xl font-black text-rose-700">0</span>
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest mt-1">Mangkir</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-black tracking-widest text-slate-500 uppercase">Riwayat Hari Ini</h3>
            <select
              value={hostCutoffPeriod}
              onChange={(e) => setHostCutoffPeriod(e.target.value)}
              className="bg-[#f0f2f5] border border-slate-200 text-[10px] font-bold text-slate-700 rounded-lg px-2 py-1 outline-none appearance-none pr-6 relative"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 6px center',
                backgroundSize: '12px'
              }}
            >
              <option value="Semua">Semua Waktu</option>
              {availableCutoffMonths.map((m) => (
                <option key={m} value={m}>{formatCutoffPeriodOptionLabel(m)}</option>
              ))}
            </select>
          </div>

          {hostLogs.length === 0 ? (
            <p className="text-sm font-semibold text-slate-400">Belum ada absen hari ini.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {hostLogs.map(log => (
                <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-slate-900">{log.brandHandled}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">{log.shiftHours}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600 mb-1">{log.platform} • {log.studio}</div>
                  <div className="text-[10px] font-bold text-slate-400">
                    Tercatat: {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} {log.checkInTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: KALENDER --- */}
      {activeTab === 'kalender' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-purple-50 rounded-[20px] p-4 border border-purple-100">
            <h3 className="text-xs font-black tracking-wider text-purple-900 mb-1 uppercase">Jadwal Siaran & Libur</h3>
            <p className="text-[11px] font-bold text-purple-700">Berikut ini jadwal penempatan studio, brand, dan status kerja Anda.</p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-purple-950">
                {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][hostCalendarMonth]} {hostCalendarYear}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">&lt;</button>
                <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black uppercase">Bulan Ini</div>
                <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors">&gt;</button>
              </div>
            </div>

            <div className="mb-4">
              <div className="grid grid-cols-7 text-center text-[10px] font-black text-purple-500 mb-4 uppercase tracking-widest">
                <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
              </div>
              <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center text-sm font-bold text-slate-500">
                {renderCalendarDays()}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mt-6">
              <h4 className="text-[10px] font-black text-purple-900 mb-3">Keterangan Warna Shift Brand:</h4>
              <div className="flex flex-wrap gap-4">
                {uniqueBrands.map((brand) => {
                  const colorObj = getBrandColor(brand);
                  return (
                    <div key={brand} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colorObj.bg} border ${colorObj.border}`}></div>
                      <span className="text-[10px] font-bold text-slate-600">{brand}</span>
                    </div>
                  );
                })}
                {uniqueBrands.length === 0 && (
                  <span className="text-[10px] font-bold text-slate-400">Belum ada jadwal yang terdaftar</span>
                )}
              </div>
            </div>

            {selectedDate && (
              <div className="mt-6 border-t border-slate-200 pt-6 animate-fadeIn">
                <h4 className="text-xs font-black text-purple-900 mb-4 uppercase flex items-center gap-2">
                  <CalendarIcon size={14} className="text-purple-500" />
                  Jadwal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                {(() => {
                  const daySchedules = hostSchedules.filter(s => s.date === selectedDate);
                  if (daySchedules.length === 0) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                        <p className="text-xs font-bold text-slate-500">Tidak ada jadwal pada tanggal ini.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="flex flex-col gap-3">
                      {daySchedules.map((schedule, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 relative overflow-hidden">
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${getBrandColor(schedule.brandHandled || schedule.brand).bg}`}></div>
                          <div className="flex justify-between items-start pl-2">
                            <span className="text-xs font-black text-slate-900">{schedule.brandHandled || schedule.brand}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">{schedule.timeSlot || schedule.shift}</span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-600 flex flex-wrap gap-x-4 gap-y-2 pl-2 mt-1">
                            <div className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/> {schedule.studio}</div>
                            <div className="flex items-center gap-1.5"><User size={12} className="text-slate-400"/> {schedule.platform}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

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
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay()); // Start on Sunday
    return d;
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

    return Array.from({ length: 42 }).map((_, i) => {
      if (i < firstDay || i >= firstDay + daysInMonth) {
        return <div key={`empty-${i}`} className="py-1.5" />;
      }
      
      const day = i - firstDay + 1;
      
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
                  <div className="text-[10px] font-bold text-slate-400">Tercatat: {log.checkInTime}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: KALENDER --- */}
      {activeTab === 'kalender' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-purple-50 rounded-[20px] p-4 border border-purple-100 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black tracking-wider text-purple-900 mb-1 uppercase">Jadwal Siaran & Libur (Mingguan)</h3>
              <p className="text-[11px] font-bold text-purple-700">Jadwal penempatan studio, brand, dan jam shift dalam tampilan mingguan.</p>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-5 shadow-sm overflow-hidden flex flex-col h-[600px]">
            {/* Header / Navigasi */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-lg font-black text-purple-950 flex items-center gap-2">
                <CalendarIcon size={20} className="text-purple-500" />
                {(() => {
                  const end = new Date(currentWeekStart);
                  end.setDate(end.getDate() + 6);
                  const formatOpt = { month: 'short', year: 'numeric' } as const;
                  return `${currentWeekStart.toLocaleDateString('id-ID', { day: 'numeric', ...formatOpt })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', ...formatOpt })}`;
                })()}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() - 7);
                    setCurrentWeekStart(d);
                  }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors"
                >&lt;</button>
                <button 
                  onClick={() => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    d.setDate(d.getDate() - d.getDay());
                    setCurrentWeekStart(d);
                  }}
                  className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-black uppercase cursor-pointer transition-colors"
                >Minggu Ini</button>
                <button 
                  onClick={() => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() + 7);
                    setCurrentWeekStart(d);
                  }} 
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-purple-600 hover:bg-slate-50 transition-colors"
                >&gt;</button>
              </div>
            </div>

            {/* Weekly Grid */}
            <div className="flex-1 overflow-auto border border-slate-100 rounded-xl relative bg-slate-50">
              <div className="min-w-[800px] h-full flex flex-col">
                
                {/* Days Header */}
                <div className="flex border-b border-slate-200 bg-white sticky top-0 z-20">
                  <div className="w-16 flex-shrink-0 border-r border-slate-200"></div>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(currentWeekStart);
                    d.setDate(d.getDate() + i);
                    const isToday = new Date().toDateString() === d.toDateString();
                    return (
                      <div key={i} className={`flex-1 min-w-0 py-3 text-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-purple-50/50' : ''}`}>
                        <div className={`text-[10px] font-bold uppercase ${isToday ? 'text-purple-600' : 'text-slate-400'}`}>
                          {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-black ${isToday ? 'text-purple-700' : 'text-slate-700'}`}>
                          {d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timeline Grid (Scrollable Y) */}
                <div className="relative flex-1 bg-white">
                  {/* Time Labels (Y-Axis) */}
                  <div className="absolute top-0 bottom-0 left-0 w-16 bg-white border-r border-slate-200 z-10 flex flex-col">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-16 flex items-start justify-center text-[10px] font-bold text-slate-400 pt-1">
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Grid Lines */}
                  <div className="absolute top-0 bottom-0 left-16 right-0 flex flex-col pointer-events-none z-0">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="h-16 border-b border-slate-100 border-dashed w-full"></div>
                    ))}
                  </div>

                  {/* Events Container */}
                  <div className="absolute top-0 bottom-0 left-16 right-0 flex z-10">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const d = new Date(currentWeekStart);
                      d.setDate(d.getDate() + dayIndex);
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      
                      const daySchedules = hostSchedules.filter(s => s.date === dateStr);
                      const isToday = new Date().toDateString() === d.toDateString();

                      return (
                        <div key={dayIndex} className={`flex-1 relative min-w-0 border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-purple-50/20' : ''}`}>
                          {/* Current Time Indicator (if today) */}
                          {isToday && (
                            <div 
                              className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                              style={{ top: `${(currentTime.getHours() + currentTime.getMinutes() / 60) * 4}rem` }}
                            >
                              <div className="w-2 h-2 rounded-full bg-red-400 absolute -left-1 -top-[5px]"></div>
                            </div>
                          )}

                          {/* Event Blocks */}
                          {daySchedules.map((schedule, idx) => {
                            let startHour = 8;
                            let endHour = 12;
                            const match = schedule.timeSlot?.match(/\((\d{2}):\d{2}\s*-\s*(\d{2}):\d{2}\)/);
                            if (match) {
                              startHour = parseInt(match[1], 10);
                              endHour = parseInt(match[2], 10);
                              if (endHour <= startHour) endHour += 24; 
                            }
                            // Calculate top and height in REM (1 hour = 4rem = h-16)
                            const top = startHour * 4;
                            const height = (endHour - startHour) * 4;
                            const brandColor = getBrandColor(schedule.brandHandled || schedule.brand);

                            return (
                              <div 
                                key={idx}
                                className={`absolute left-1 right-1 rounded-lg border p-2 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-purple-400 transition-all ${brandColor.bg.replace('bg-', 'bg-opacity-20 bg-')}`}
                                style={{ 
                                  top: `${top}rem`, 
                                  height: `${height}rem`,
                                  backgroundColor: 'var(--tw-bg-opacity, 1)', // Fallback, will rely on classes
                                }}
                              >
                                <div className={`absolute top-0 left-0 bottom-0 w-1 ${brandColor.bg}`}></div>
                                <div className="pl-1 flex flex-col h-full">
                                  <div className="text-[10px] font-black text-slate-800 leading-tight mb-0.5 truncate">
                                    {schedule.brandHandled || schedule.brand}
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-500 mb-1 truncate">
                                    {schedule.timeSlot?.match(/\((.*?)\)/)?.[1] || schedule.shift}
                                  </div>
                                  {height >= 6 && (
                                    <>
                                      <div className="text-[9px] font-bold text-slate-600 flex items-center gap-1 mt-auto truncate">
                                        <MapPin size={10} className="text-slate-400 flex-shrink-0"/> <span className="truncate">{schedule.studio}</span>
                                      </div>
                                      <div className="text-[9px] font-bold text-slate-600 flex items-center gap-1 truncate">
                                        <User size={10} className="text-slate-400 flex-shrink-0"/> <span className="truncate">{schedule.platform}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100 flex-shrink-0">
              <h4 className="text-[10px] font-black text-purple-900 w-full mb-1">Keterangan Warna Brand:</h4>
              {uniqueBrands.map((brand) => {
                const colorObj = getBrandColor(brand);
                return (
                  <div key={brand} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${colorObj.bg} border ${colorObj.border}`}></div>
                    <span className="text-[9px] font-bold text-slate-600">{brand}</span>
                  </div>
                );
              })}
              {uniqueBrands.length === 0 && (
                <span className="text-[10px] font-bold text-slate-400">Belum ada jadwal terdaftar</span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

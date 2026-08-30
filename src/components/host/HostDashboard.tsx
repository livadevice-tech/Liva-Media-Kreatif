import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, MapPin, User, FileText, Calendar as CalendarIcon,
  CheckCircle2, AlertTriangle, ChevronDown, Clock,
  Image, ExternalLink, Sun, LogOut, Home, PieChart, ScanLine, MessageSquare, ChevronLeft, ChevronRight, Filter, Fingerprint, BarChart2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCutoffPeriodOptionLabel } from '../../shared/utils/reporting';
import { activityLogsApi } from '../../api';


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

interface HostDashboardProps {
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
  violations: any[];
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
  violations,
}: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'beranda' | 'absen' | 'rekap' | 'kalender'>('beranda');
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weeklyOffset, setWeeklyOffset] = useState(0); // Offset in weeks from current week
  const [isAbsenModalOpen, setIsAbsenModalOpen] = useState(false);
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
    if (showFormSuccess) {
      setIsAbsenModalOpen(false);
    }
  }, [showFormSuccess]);

  useEffect(() => {
    if (activeHostObj) {
      activityLogsApi.create({
        hostId: activeHostObj.id,
        action: "PAGE_LOAD",
        details: { message: "Host opened/refreshed the dashboard" }
      }).catch(() => {});
    }
  }, [activeHostObj]);

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
        shift: todaySchedule.timeSlot || todaySchedule.shift || '',
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

  const { disciplineScore, avgEarlyArrival, readinessRate, attendanceHistory } = useMemo(() => {
    let score = 100;
    let totalEarlyMinutes = 0;
    let earlyCount = 0;
    let validShifts = 0;
    let toleransiCount = 0;
    
    // Sort logs from oldest to newest to apply score sequentially
    const sortedLogs = [...(hostLogs || [])].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    const history: Array<{
      date: string;
      brand: string;
      shift: string;
      status: string;
      pointChange: number;
      reason: string;
      earlyMinutes: number;
      checkInTime?: string;
    }> = [];

    sortedLogs.forEach(log => {
      let pointChange = 0;
      let reason = "";
      let earlyMinutes = 0;

      if (log.status === 'Absent') {
        pointChange = -15;
        reason = "Mangkir (Tanpa Keterangan)";
      } else if (log.status === 'Excused') {
        pointChange = 0;
        reason = "Izin/Sakit";
      } else if (log.checkInTime && log.shiftHours) {
        const match = log.shiftHours.match(/(\d{1,2}[:.]\d{2})/);
        if (match) {
          const shiftStartStr = match[1].replace('.', ':');
          const shiftDate = new Date(`${log.date}T${shiftStartStr}:00`);
          const normalizedCheckInTime = log.checkInTime.replace(/\./g, ':');
          const checkInDate = new Date(`${log.date}T${normalizedCheckInTime}`);
          
          if (!isNaN(shiftDate.getTime()) && !isNaN(checkInDate.getTime())) {
            const diffMs = shiftDate.getTime() - checkInDate.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            earlyMinutes = diffMins;
            validShifts++;
            
            if (log.status === 'Present' && diffMins < 0) {
              // Jika di-update manual oleh admin jadi Present meskipun jam aslinya telat
              pointChange = 0;
              reason = `Tepat Waktu`;
              totalEarlyMinutes += 0;
            } else if (diffMins >= 0) {
              pointChange = 0;
              reason = `Tepat Waktu`;
              totalEarlyMinutes += diffMins;
              if (diffMins >= 30) earlyCount++;
            } else if (diffMins < 0 && diffMins >= -5) {
              if (toleransiCount < 3) {
                pointChange = -5;
                reason = `Toleransi Telat (${Math.abs(diffMins)}m)`;
                toleransiCount++;
              } else {
                pointChange = -10;
                reason = `Telat (${Math.abs(diffMins)}m)`;
              }
            } else if (diffMins < -5) {
              pointChange = -10;
              reason = `Telat (${Math.abs(diffMins)}m)`;
            }
          }
        }
      }

      if (!reason) {
        if (log.status === 'Late') {
          pointChange = -10;
          reason = 'Telat (Manual)';
        } else if (log.status === 'Present') {
          pointChange = 0;
          reason = 'Tepat Waktu (Manual)';
        }
      }

      score += pointChange;
      
      history.push({
        date: log.date,
        brand: log.brandHandled,
        shift: log.shiftHours,
        status: log.status,
        pointChange,
        reason,
        earlyMinutes,
        checkInTime: log.checkInTime,
      });
    });

    history.reverse();

    return {
      disciplineScore: Math.min(100, Math.max(0, score)),
      avgEarlyArrival: validShifts > 0 ? Math.round(totalEarlyMinutes / validShifts) : 0,
      readinessRate: validShifts > 0 ? Math.round((earlyCount / validShifts) * 100) : 0,
      attendanceHistory: history,
    };
  }, [hostLogs]);

  const hostSchedules = (computedSchedules || []).filter(s => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay);
  
  // Extract unique brands for the legend and assign a color index
  const uniqueBrands = Array.from(new Set(hostSchedules.map(s => s.brandHandled || s.brand)));
  const brandColors = [
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500', solid: 'bg-purple-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', solid: 'bg-emerald-500' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', solid: 'bg-blue-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', solid: 'bg-amber-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-300', solid: 'bg-rose-500' },
  ];

  const getBrandColor = (brand: string) => {
    const idx = uniqueBrands.indexOf(brand);
    return brandColors[idx % brandColors.length];
  };

  const kalenderStats = useMemo(() => {
    let hadir = 0;
    let telat = 0;
    let tidakHadir = 0;
    const now = new Date();
    
    // Filter by viewed month
    const monthLogs = (hostLogs || []).filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === hostCalendarMonth && d.getFullYear() === hostCalendarYear;
    });

    const monthSchedules = hostSchedules.filter(s => {
      const d = new Date(s.date);
      return d.getMonth() === hostCalendarMonth && d.getFullYear() === hostCalendarYear;
    });

    monthLogs.forEach(log => {
      if (log.status === 'Present') hadir++;
      else if (log.status === 'Late') telat++;
      else if (log.status === 'Absent' || log.status === 'Excused') tidakHadir++;
    });

    return { hadir, telat, tidakHadir };
  }, [hostLogs, hostSchedules, hostCalendarMonth, hostCalendarYear]);

  const renderFullCalendarDays = () => {
    const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
    const firstDayRaw = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
    const firstDay = (firstDayRaw + 6) % 7; // Monday = 0, Sunday = 6
    const days = [];
    
    // Previous month empty days
    const prevMonthDays = new Date(hostCalendarYear, hostCalendarMonth, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-prev-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-300 font-medium text-sm">
          {prevMonthDays - firstDay + i + 1}
        </div>
      );
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const schedule = hostSchedules.find(s => s.date === dateStr);
      const log = (hostLogs || []).find(l => l.date === dateStr);
      
      let dotColor = null;
      if (schedule) {
        const brand = schedule.brandHandled || schedule.brand;
        dotColor = getBrandColor(brand).solid;
      }

      days.push(
        <div key={`day-${day}`} className="flex flex-col items-center justify-center relative w-10 h-11">
          <button 
            onClick={() => setSelectedDate(dateStr)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-bold transition-all z-10 ${
              isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
          {dotColor && (
            <div className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${dotColor} ${isSelected ? 'opacity-0' : ''}`} />
          )}
          {isSelected && dotColor && (
             <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white z-20`} />
          )}
        </div>
      );
    }
    
    // Next month empty days
    const totalSlots = days.length;
    const remainingSlots = 42 - totalSlots; // 6 rows of 7
    for (let i = 1; i <= remainingSlots; i++) {
      if (days.length % 7 === 0 && remainingSlots < 7 && i > 1) break; // Don't add an empty 6th row
      days.push(
        <div key={`empty-next-${i}`} className="w-10 h-11 flex items-center justify-center text-slate-300 font-medium text-sm">
          {i}
        </div>
      );
    }
    
    return days;
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
    const firstDay = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const todayStrObj = new Date();
    const todayStr = `${todayStrObj.getFullYear()}-${String(todayStrObj.getMonth() + 1).padStart(2, '0')}-${String(todayStrObj.getDate()).padStart(2, '0')}`;

    return Array.from({ length: 42 }).map((_, i) => {
      if (i < adjustedFirstDay || i >= adjustedFirstDay + daysInMonth) {
        return <div key={`empty-${i}`} className="py-1.5" />;
      }
      
      const day = i - adjustedFirstDay + 1;
      
      // Check if there is a schedule for this date
      const dateStr = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const daySchedule = hostSchedules.find(s => s.date === dateStr);

      let style = 'bg-white text-slate-500 border border-slate-200';
      let isPassedAndCheckedIn = false;

      if (daySchedule) {
        const hasCheckedInOnDate = hostLogs?.some(
          (log) => log.hostId === activeHostObj?.id && log.date === dateStr
        );

        if (hasCheckedInOnDate) {
          isPassedAndCheckedIn = true;
          style = `bg-emerald-700 text-white border-2 border-emerald-800 font-black relative group`;
        } else {
          const brand = daySchedule.brandHandled || daySchedule.brand;
          const colorObj = getBrandColor(brand);
          style = `${colorObj.bg} ${colorObj.text} border-2 ${colorObj.border} font-black`;
        }
      }
      
      return (
        <div key={day} onClick={() => setSelectedDate(dateStr)} className={`py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-all ${style} ${selectedDate === dateStr ? 'ring-2 ring-purple-500 ring-offset-1 scale-110 z-10' : ''}`}>
          {day}
          {isPassedAndCheckedIn && (
            <span className="hidden group-hover:block absolute bottom-full mb-1 bg-emerald-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap z-20">
              Sudah Absen
            </span>
          )}
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
  const hasCheckedInSelectedDate = hostLogs?.some(
    (log) => log.hostId === activeHostObj?.id && log.date === selectedDate
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

  const selectedSchedules = (computedSchedules || []).filter(
    (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === selectedDate
  );

  const sortedSelectedSchedules = sortByTime(selectedSchedules);

  let upcomingSchedule = null;
  let upcomingDateStr = "";
  let upcomingLabel = "";

  if (selectedDate === todayStr) {
    const tomorrowSchedules = (computedSchedules || []).filter(
      (s) => s.hostId === activeHostObj?.id && !s.isDeleted && !s.isOffDay && s.date === tomorrowStr
    );
    const sortedTomorrowSchedules = sortByTime(tomorrowSchedules);

    if (sortedSelectedSchedules.length > 0) {
      const todaySched = sortedSelectedSchedules[0];
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
  } else {
    upcomingSchedule = sortedSelectedSchedules[0] || null;
    upcomingDateStr = selectedDate || "";
    if (selectedDate === tomorrowStr) {
      upcomingLabel = "Jadwal Besok";
    } else {
      const d = new Date(selectedDate || "");
      upcomingLabel = isNaN(d.getTime()) ? "Jadwal" : `Jadwal ${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;
    }
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
    <div className="w-full max-w-[480px] mx-auto min-h-screen bg-[#f8f9fc] p-4 font-sans text-slate-800 pb-28 overflow-x-hidden">
      
      {/* Top Profile Header (Mobile App Style) */}
      <div className="flex items-center justify-between py-2 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold border-[3px] border-white shadow-sm overflow-hidden">
            {/* Display profilePicture if exists, otherwise show initials */}
            {(activeHostObj as any)?.profilePicture ? (
              <img src={(activeHostObj as any).profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : <User className="w-6 h-6 fill-current" />}
          </div>
          
          <div className="flex flex-col justify-center">
            <h2 className="text-[17px] font-bold text-slate-800 leading-tight">
              {activeHostObj?.name || 'Pujia Puspita Sari'}
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">
              Studio Lampung
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          
          <button className="relative w-9 h-9 flex items-center justify-center text-slate-600">
            <Bell className="w-[22px] h-[22px]" />
            <div className="absolute top-1 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#f8f9fc]"></div>
          </button>
          
          <button onClick={handleLogout} className="relative w-9 h-9 flex items-center justify-center text-red-400 hover:text-red-500">
            <LogOut className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      {/* Konten Home / Beranda */}
      {activeTab === 'beranda' && (
      <div className="mt-2 animate-fadeIn">
        {/* Calendar Strip */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-800 text-[15px]">
              {(() => {
                const today = new Date();
                today.setDate(today.getDate() + (weeklyOffset * 7));
                return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              })()}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setWeeklyOffset(prev => prev - 1)} className="w-8 h-8 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={() => setWeeklyOffset(prev => prev + 1)} className="w-8 h-8 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex justify-between mb-6 px-1">
          {(() => {
            const today = new Date();
            const dayOfWeek = today.getDay() || 7; // Make Monday=1, Sunday=7
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + 1 + (weeklyOffset * 7));

            return Array.from({ length: 7 }).map((_, i) => {
              const currentDay = new Date(startOfWeek);
              currentDay.setDate(startOfWeek.getDate() + i);
              const dateStr = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
              const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' });
              const isActive = selectedDate === dateStr;

              return (
                <div key={i} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setSelectedDate(dateStr)}>
                  <span className={`text-[11px] font-medium ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{dayName}</span>
                  <div className={`w-10 h-11 flex flex-col items-center justify-center rounded-xl transition-all relative ${
                    isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-700'
                  }`}>
                    <span className="font-bold text-[15px]">{currentDay.getDate()}</span>
                    {isActive && <div className="absolute -bottom-2 w-4 h-1 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* JADWAL HARI INI Card */}
        {upcomingSchedule ? (
          <div className="bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[24px] p-5 text-white shadow-[0_8px_24px_rgba(79,70,229,0.25)] mb-8 relative overflow-hidden">
            {/* subtle decorative blur behind */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[30px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase">{upcomingLabel}</span>
              
              <div className="grid grid-cols-3 gap-2 mt-5 mb-7">
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Brand</div>
                  <div className="font-bold text-[14px] leading-tight pr-1">{upcomingSchedule.brandHandled || upcomingSchedule.brand}</div>
                </div>
                <div>
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Shift</div>
                  <div className="font-bold text-[14px] leading-tight pr-1">{upcomingSchedule.timeSlot || upcomingSchedule.shift}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-white/80 font-medium mb-0.5">Studio</div>
                  <div className="font-bold text-[14px] leading-tight">{upcomingSchedule.studio}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setIsAbsenModalOpen(true)}
                  className="bg-white text-blue-600 rounded-[14px] px-4 py-2.5 font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Clock size={16} className="text-blue-500" /> {hasCheckedInSelectedDate ? 'Sudah Absen' : 'Belum Absen'}
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/80 font-medium mb-0.5">Jam Mulai</span>
                  <span className="font-black text-xl tracking-wide font-mono">
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
                      
                      return `${String(diffHours).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-[24px] p-8 text-center border border-slate-200 mb-8 flex flex-col items-center">
            <CalendarIcon size={32} className="text-slate-300 mb-3" />
            <p className="font-bold text-slate-500 text-sm">Tidak ada jadwal terdekat</p>
          </div>
        )}

        {/* History Kehadiran */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-[15px]">History Kehadiran</h3>
            <div className="relative">
              <select
                value={hostCutoffPeriod}
                onChange={(e) => setHostCutoffPeriod(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-1.5 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Semua">Semua Waktu</option>
                {availableCutoffMonths.map((period) => (
                  <option key={period} value={period}>
                    {formatCutoffPeriodOptionLabel(period)}
                  </option>
                ))}
              </select>
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={12} className="text-slate-400 rotate-90" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 pb-8">
            {attendanceHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">Belum ada riwayat kehadiran</div>
            ) : (
              attendanceHistory.slice(0, 5).map((log, idx) => (
                <div key={idx} className="bg-white rounded-[20px] p-4 flex items-center gap-4 border border-slate-100 shadow-sm">
                   <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
                     <CalendarIcon size={20} strokeWidth={1.5} />
                   </div>
                   <div className="flex-1">
                     <div className="font-bold text-slate-800 text-sm mb-0.5">{log.brand}</div>
                     <div className="text-[11px] text-slate-500 font-medium mb-0.5">{log.shift}</div>
                     <div className="text-[10px] text-slate-400 font-medium">{new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                   </div>
                   <div className="text-right flex flex-col items-end">
                     <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full mb-1 ${
                       log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                       log.status === 'Late' ? 'bg-rose-50 text-rose-500' :
                       'bg-slate-100 text-slate-500'
                     }`}>
                       {log.status === 'Present' ? 'Tepat Waktu' : log.status === 'Late' ? 'Telat' : log.status}
                     </div>
                     <div className={`font-bold text-sm ${log.status === 'Late' ? 'text-rose-500' : 'text-emerald-600'}`}>
                       {log.checkInTime ? log.checkInTime.substring(0, 5) : '-'}
                     </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      )}

      {/* Konten Kalender / Jadwal */}
      {activeTab === 'kalender' && (
        <div className="mt-2 animate-fadeIn pb-24 px-1">
          <h2 className="text-[17px] font-black text-slate-800 mb-4 ml-1">Rekap Attendance</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Kehadiran</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-indigo-600 leading-none">{kalenderStats.hadir}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <CalendarIcon className="absolute -bottom-3 -right-3 w-16 h-16 text-indigo-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>
            
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-fuchsia-500 flex items-center justify-center shrink-0 shadow-sm shadow-fuchsia-500/20">
                  <X className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Tidak Hadir</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-fuchsia-500 leading-none">{kalenderStats.tidakHadir}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <X className="absolute -bottom-3 -right-3 w-16 h-16 text-fuchsia-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>

            <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[100px]">
              <div className="flex items-center gap-2 z-10">
                <div className="w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-400/20">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 leading-tight">Telat</span>
              </div>
              <div className="z-10 mt-2">
                <div className="text-3xl font-black text-amber-500 leading-none">{kalenderStats.telat}</div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Hari</div>
              </div>
              <Clock className="absolute -bottom-3 -right-3 w-16 h-16 text-amber-50/60 rotate-[-15deg] pointer-events-none" strokeWidth={1} />
            </div>
          </div>

          {/* Kalender Card */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 mb-5 relative">
            <h3 className="text-[15px] font-bold text-slate-800 mb-5">Kalender Kerja Host</h3>
            
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors">
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <span className="font-bold text-[15px] text-slate-800">
                {new Date(hostCalendarYear, hostCalendarMonth).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleNextMonth} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600 hover:bg-slate-50 transition-colors">
                  <ChevronRight size={16} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => {
                    const today = new Date();
                    setHostCalendarMonth(today.getMonth());
                    setHostCalendarYear(today.getFullYear());
                    setSelectedDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
                  }} 
                  className="px-3 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Hari Ini
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-y-3 justify-items-center mb-6">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, idx) => (
                <div key={day} className="text-[11px] font-medium text-slate-400 w-10 text-center mb-2">{day}</div>
              ))}
              {renderFullCalendarDays()}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-slate-100/80">
              {uniqueBrands.length > 0 ? (
                uniqueBrands.map(brand => (
                  <div key={brand} className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${getBrandColor(brand).solid}`} />
                    <span className="text-[10px] font-medium text-slate-500">{brand}</span>
                  </div>
                ))
              ) : (
                <span className="text-[10px] font-medium text-slate-400">Belum ada brand</span>
              )}
            </div>
          </div>

          {/* Jadwal Berikutnya Card */}
          {(() => {
            const todayStr = (() => {
              const d = new Date();
              return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            })();
            const isToday = selectedDate === todayStr;
            const isPast = selectedDate < todayStr;
            const selectedSchedule = hostSchedules.find(s => s.date === selectedDate);
            const selectedDateObj = new Date(selectedDate);
            const dateLabel = isToday ? 'Hari Ini' : (new Date(selectedDateObj.getTime() - 86400000).toISOString().split('T')[0] === todayStr ? 'Besok' : '');
            const dateFormatted = selectedDateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            
            if (!selectedSchedule) {
              return (
                <div className="bg-indigo-50/40 rounded-3xl p-5 border border-indigo-100 text-center py-8">
                   <CalendarIcon className="w-10 h-10 text-indigo-200 mx-auto mb-2" />
                   <div className="font-bold text-slate-600 text-sm">Tidak Ada Jadwal</div>
                   <div className="text-[11px] text-slate-500 mt-1">{dateFormatted}</div>
                </div>
              );
            }

            return (
              <div className="bg-[#f5f7fa] rounded-3xl p-4 border border-indigo-50 shadow-sm relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-100/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
                      <CalendarIcon className="w-4.5 h-4.5" strokeWidth={2.5} />
                    </div>
                    <div className="font-bold text-slate-800 text-[15px]">{isPast ? 'Detail Jadwal' : 'Jadwal Berikutnya'}</div>
                  </div>
                  <div className="bg-indigo-100/60 px-3 py-1.5 rounded-full">
                    <span className="text-[9px] font-bold text-indigo-600">{dateLabel ? `${dateLabel} • ` : ''}{dateFormatted}</span>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-1 gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Home className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Brand</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.brandHandled || selectedSchedule.brand}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Shift</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.timeSlot || selectedSchedule.shift}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <div className="text-[9px] font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Studio</div>
                      <div className="font-bold text-sm text-slate-800 leading-tight break-words">{selectedSchedule.studio}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pt-2 bg-gradient-to-t from-[#f8f9fc] via-[#f8f9fc] to-transparent">
        <div className="w-full max-w-[400px] mx-4 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 px-6 py-3 flex items-center justify-between relative">
          
          {/* 1. Beranda */}
          <button 
            onClick={() => setActiveTab('beranda')} 
            className="flex flex-col items-center justify-center gap-1 w-12 group"
          >
            <Home className={`w-[22px] h-[22px] transition-colors ${activeTab === 'beranda' || activeTab === 'rekap' ? 'text-blue-600 fill-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
            <span className={`text-[9px] font-bold ${activeTab === 'beranda' || activeTab === 'rekap' ? 'text-blue-600' : 'text-slate-400'}`}>Beranda</span>
            {(activeTab === 'beranda' || activeTab === 'rekap') && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>
          
          {/* 2. Jadwal */}
          <button 
            onClick={() => setActiveTab('kalender')} 
            className="flex flex-col items-center justify-center gap-1 w-12 group"
          >
            <CalendarIcon className={`w-[22px] h-[22px] transition-colors ${activeTab === 'kalender' ? 'text-blue-600 fill-blue-600/20' : 'text-slate-400 group-hover:text-blue-500'}`} strokeWidth={1.5} />
            <span className={`text-[9px] font-bold ${activeTab === 'kalender' ? 'text-blue-600' : 'text-slate-400'}`}>Jadwal</span>
            {activeTab === 'kalender' && <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full mt-1" />}
          </button>

          {/* 3. Center Action: Absen */}
          <button 
            onClick={() => setIsAbsenModalOpen(true)} 
            className="relative -top-5 flex flex-col items-center justify-center group"
          >
            <div className="w-[58px] h-[58px] bg-blue-600 rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.4)] ring-4 ring-[#f8f9fc] group-hover:scale-105 transition-all duration-300">
              <Fingerprint className="w-[28px] h-[28px]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold text-blue-600 mt-1 absolute -bottom-5">Absen</span>
          </button>

          {/* 4. Performa */}
          <button className="flex flex-col items-center justify-center gap-1 w-12 group">
            <BarChart2 className="w-[22px] h-[22px] text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
            <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-500">Performa</span>
          </button>

          {/* 5. Akun */}
          <button className="flex flex-col items-center justify-center gap-1 w-12 group">
            <User className="w-[22px] h-[22px] text-slate-400 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
            <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-500">Akun</span>
          </button>
        </div>
      </div>

      {/* Absen Bottom Sheet Modal */}
      <AnimatePresence>
        {isAbsenModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAbsenModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-[32px] z-[70] shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setIsAbsenModalOpen(false)}>
                <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
              </div>
              
              <div className="px-6 pb-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 mt-2">
                  <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <ScanLine size={16} /> Absen {hasCheckedInToday ? 'Pulang/Ulang' : 'Masuk'}
                  </div>
                </div>

                <form onSubmit={handleHostAttendanceSubmit}>
                  {hostFormError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 border border-red-100 flex items-start gap-2">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <span className="font-medium">{hostFormError}</span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Brand</label>
                      <CustomSelect
                        value={hostForm.brand}
                        options={brands}
                        onChange={(v: string) => setHostForm({...hostForm, brand: v})}
                        placeholder="Pilih Brand"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Shift</label>
                      <CustomSelect
                        value={hostForm.shift}
                        options={shifts.map(s => ({value: s, label: s}))}
                        onChange={(v: string) => setHostForm({...hostForm, shift: v})}
                        placeholder="Pilih Shift"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">Studio</label>
                      <CustomSelect
                        value={hostForm.studio}
                        options={studios}
                        onChange={(v: string) => setHostForm({...hostForm, studio: v})}
                        placeholder="Pilih Studio"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold rounded-2xl py-4 mt-8 shadow-[0_8px_20px_rgba(37,99,235,0.3)] hover:bg-blue-700 active:scale-[0.98] transition-all"
                  >
                    Absen Sekarang
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

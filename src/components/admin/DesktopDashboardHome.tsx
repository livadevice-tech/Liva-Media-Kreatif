import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CheckSquare,
  ChevronRight,
  Radio,
  Image as ImageIcon,
  Check,
  Building2,
  Book,
  Search,
  Bell,
  TrendingUp,
  Target,
  Sparkles,
  Users,
  Briefcase,
  Layers,
} from "lucide-react";
import { getCutoffMonthForDate } from "../../shared/utils/appUi";
import { loadTasksFromStorage } from "../tasks/taskStorage";
import { TaskItem } from "../tasks/types";

interface DesktopDashboardHomeProps {
  hosts: any[];
  clientBrands: any[];
  schedules: any[];
  studios: any[];
  logs?: any[];
  violations?: any[];
  loggedInAdminName?: string;
  avatarUrl?: string;
  onNavigate?: (tabId: string) => void;
}

// Helper to parse shift time into start & end minutes from midnight
function parseShiftTime(timeStr?: string, shiftStr?: string): {
  startMinutes: number;
  endMinutes: number;
  startTimeFormatted: string;
  endTimeFormatted: string;
} {
  const combined = `${timeStr || ""} ${shiftStr || ""}`;
  const match = combined.match(/(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/);
  if (match) {
    const startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    let endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);
    if (endH < startH) {
      endH += 24; // spans midnight
    }
    return {
      startMinutes: startH * 60 + startM,
      endMinutes: endH * 60 + endM,
      startTimeFormatted: `${String(match[1]).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
      endTimeFormatted: `${String(match[3]).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
    };
  }

  const lower = combined.toLowerCase();
  if (lower.includes("pagi") || lower.includes("morning")) {
    return { startMinutes: 8 * 60, endMinutes: 12 * 60, startTimeFormatted: "08:00", endTimeFormatted: "12:00" };
  }
  if (lower.includes("siang") || lower.includes("afternoon")) {
    return { startMinutes: 13 * 60, endMinutes: 17 * 60, startTimeFormatted: "13:00", endTimeFormatted: "17:00" };
  }
  if (lower.includes("sore")) {
    return { startMinutes: 16 * 60, endMinutes: 20 * 60, startTimeFormatted: "16:00", endTimeFormatted: "20:00" };
  }
  if (lower.includes("malam") || lower.includes("evening") || lower.includes("night")) {
    return { startMinutes: 19 * 60, endMinutes: 23 * 60, startTimeFormatted: "19:00", endTimeFormatted: "23:00" };
  }

  return { startMinutes: 9 * 60, endMinutes: 13 * 60, startTimeFormatted: "09:00", endTimeFormatted: "13:00" };
}

export const DesktopDashboardHome: React.FC<DesktopDashboardHomeProps> = ({
  hosts,
  clientBrands,
  schedules,
  studios,
  logs = [],
  loggedInAdminName,
  onNavigate,
}) => {
  // Live wall clock time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Loaded tasks
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  useEffect(() => {
    let isMounted = true;
    loadTasksFromStorage()
      .then((items) => {
        if (isMounted) setTasks(items || []);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter tabs
  const [latePeriodTab, setLatePeriodTab] = useState<"today" | "week" | "cutoff">("today");
  const [taskPeriodTab, setTaskPeriodTab] = useState<"today" | "week">("today");
  const [scheduleFilterTab, setScheduleFilterTab] = useState<"all" | "active">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Date constants
  const todayStr = useMemo(() => {
    return `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, "0")}-${String(currentTime.getDate()).padStart(2, "0")}`;
  }, [currentTime]);

  // Current week bounds (Monday to Sunday)
  const { mondayStr, sundayStr } = useMemo(() => {
    const day = currentTime.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    const mon = new Date(currentTime);
    mon.setDate(currentTime.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const mStr = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
    const sStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, "0")}-${String(sun.getDate()).padStart(2, "0")}`;
    return { mondayStr: mStr, sundayStr: sStr };
  }, [currentTime]);

  // Current Cutoff period
  const activeCutoffMonth = useMemo(() => {
    return getCutoffMonthForDate(todayStr);
  }, [todayStr]);

  // Active Brands
  const activeBrands = useMemo(() => {
    return clientBrands.filter((b) => b.isActive !== false);
  }, [clientBrands]);

  // =========================================================================
  // 1. JADWAL HOST (SORTED NEAREST TO CURRENT TIME)
  // =========================================================================
  const currentMinutesFromMidnight = currentTime.getHours() * 60 + currentTime.getMinutes();

  const sortedNearestSchedules = useMemo(() => {
    const todaySessions = schedules.filter((s) => s.date === todayStr);

    const enriched = todaySessions.map((session) => {
      const parsed = parseShiftTime(session.timeSlot, session.shift);
      const hostObj = hosts.find((h) => h.id === session.hostId || h.name === session.hostName);
      const brandObj = clientBrands.find((b) => b.id === session.brandId || b.name === session.brand);
      const studioObj = studios.find((st) => st.id === session.studio || st.name === session.studio);

      const isLive = currentMinutesFromMidnight >= parsed.startMinutes && currentMinutesFromMidnight < parsed.endMinutes;
      const isUpcoming = currentMinutesFromMidnight < parsed.startMinutes;
      const isFinished = currentMinutesFromMidnight >= parsed.endMinutes;

      let sortScore = 0;
      let remainingText = "";

      if (isLive) {
        sortScore = 0 - (parsed.endMinutes - currentMinutesFromMidnight);
        const rem = parsed.endMinutes - currentMinutesFromMidnight;
        if (rem >= 60) {
          const h = Math.floor(rem / 60);
          const m = rem % 60;
          remainingText = `Sisa ${h}j ${m > 0 ? `${m}m` : ""}`;
        } else {
          remainingText = `Sisa ${rem}m`;
        }
      } else if (isUpcoming) {
        const diff = parsed.startMinutes - currentMinutesFromMidnight;
        sortScore = 1000 + diff;
        if (diff < 60) {
          remainingText = `Mulai ${diff}m`;
        } else {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          remainingText = `Mulai ${h}j ${m > 0 ? `${m}m` : ""}`;
        }
      } else {
        const passed = currentMinutesFromMidnight - parsed.endMinutes;
        sortScore = 100000 + passed;
        remainingText = `Selesai ${parsed.endTimeFormatted}`;
      }

      return {
        ...session,
        parsed,
        hostName: hostObj ? hostObj.name : session.hostName || "Host",
        hostRole: hostObj?.role || "Host Streamer",
        hostAvatar: hostObj?.avatar,
        brandName: brandObj ? brandObj.name : session.brand || "Brand",
        platform: session.platform || "Live Stream",
        studioName: studioObj ? studioObj.name : session.studio || "Studio Utama",
        isLive,
        isUpcoming,
        isFinished,
        sortScore,
        remainingText,
      };
    });

    enriched.sort((a, b) => a.sortScore - b.sortScore);
    return enriched;
  }, [schedules, todayStr, currentMinutesFromMidnight, hosts, clientBrands, studios]);

  const displayedSchedules = useMemo(() => {
    let list = sortedNearestSchedules;
    if (scheduleFilterTab === "active") {
      list = list.filter((s) => s.isLive || s.isUpcoming);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.hostName?.toLowerCase().includes(q) ||
          s.brandName?.toLowerCase().includes(q) ||
          s.studioName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sortedNearestSchedules, scheduleFilterTab, searchQuery]);

  // Session counters
  const liveCount = useMemo(() => sortedNearestSchedules.filter((s) => s.isLive).length, [sortedNearestSchedules]);
  const upcomingCount = useMemo(() => sortedNearestSchedules.filter((s) => s.isUpcoming).length, [sortedNearestSchedules]);

  // =========================================================================
  // 2. KETERLAMBATAN & PERFORMA KEHADIRAN (DONUT CHART DATA)
  // =========================================================================
  const { todayLateLogs, weekLateLogs, cutoffLateLogs, todayTotal, weekTotal, cutoffTotal } = useMemo(() => {
    const todayLogs = logs.filter((l) => l.date === todayStr);
    const weekLogs = logs.filter((l) => l.date >= mondayStr && l.date <= sundayStr);
    const cutoffLogs = logs.filter((l) => getCutoffMonthForDate(l.date) === activeCutoffMonth);

    const isLate = (l: any) => l.status === "Late" || String(l.status).toLowerCase() === "late";

    return {
      todayLateLogs: todayLogs.filter(isLate),
      weekLateLogs: weekLogs.filter(isLate),
      cutoffLateLogs: cutoffLogs.filter(isLate),
      todayTotal: todayLogs.length,
      weekTotal: weekLogs.length,
      cutoffTotal: cutoffLogs.length,
    };
  }, [logs, todayStr, mondayStr, sundayStr, activeCutoffMonth]);

  const currentLateLogsList = useMemo(() => {
    if (latePeriodTab === "today") return todayLateLogs;
    if (latePeriodTab === "week") return weekLateLogs;
    return cutoffLateLogs;
  }, [latePeriodTab, todayLateLogs, weekLateLogs, cutoffLateLogs]);

  const { activePunctualityRate, activeOnTimeCount, activeLateCount, activeTotalCount } = useMemo(() => {
    const total = latePeriodTab === "today" ? todayTotal : latePeriodTab === "week" ? weekTotal : cutoffTotal;
    const late = currentLateLogsList.length;
    const onTime = Math.max(0, total - late);
    const rate = total === 0 ? 100 : Math.round((onTime / total) * 100);
    return {
      activePunctualityRate: rate,
      activeOnTimeCount: onTime,
      activeLateCount: late,
      activeTotalCount: total,
    };
  }, [latePeriodTab, todayTotal, weekTotal, cutoffTotal, currentLateLogsList]);

  // Donut chart stroke calculation (radius = 54, circumference ~339.29)
  const donutRadius = 54;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOnTimeOffset = donutCircumference - (donutCircumference * activePunctualityRate) / 100;

  // =========================================================================
  // 3. TREN KEHADIRAN 7 HARI MINGGU INI (LINE / SPARKLINE CHART DATA)
  // =========================================================================
  const weeklyTrendData = useMemo(() => {
    const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const mon = new Date(currentTime);
    const day = mon.getDay();
    const diffToMon = (day === 0 ? -6 : 1) - day;
    mon.setDate(mon.getDate() + diffToMon);

    return days.map((dayLabel, index) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + index);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const dayLogs = logs.filter((l) => l.date === dateStr);
      const lateCount = dayLogs.filter((l) => l.status === "Late" || String(l.status).toLowerCase() === "late").length;
      const totalCount = dayLogs.length;

      let punctualityRate = 100;
      if (totalCount > 0) {
        punctualityRate = Math.round(((totalCount - lateCount) / totalCount) * 100);
      } else {
        punctualityRate = d > currentTime ? 0 : 100;
      }

      return {
        day: dayLabel,
        date: dateStr,
        total: totalCount,
        late: lateCount,
        rate: punctualityRate,
        isFuture: d > currentTime,
      };
    });
  }, [currentTime, logs]);

  // =========================================================================
  // 4. TASK OPERASIONAL
  // =========================================================================
  const { todayTasks, weekTasks, activeTasksTotal } = useMemo(() => {
    const todayList = tasks.filter((t) => {
      if (t.status === "done") return false;
      return t.deadline === todayStr;
    });

    const weekList = tasks.filter((t) => {
      if (t.status === "done") return false;
      if (!t.deadline) return false;
      return t.deadline >= mondayStr && t.deadline <= sundayStr;
    });

    const activeList = tasks.filter((t) => t.status !== "done");

    return {
      todayTasks: todayList,
      weekTasks: weekList,
      activeTasksTotal: activeList.length,
    };
  }, [tasks, todayStr, mondayStr, sundayStr]);

  const currentTasksList = taskPeriodTab === "today" ? todayTasks : weekTasks;

  const taskCompletionRate = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    const done = tasks.filter((t) => t.status === "done").length;
    return Math.round((done / total) * 100);
  }, [tasks]);

  const greetingTime =
    currentTime.getHours() < 12
      ? "Selamat Pagi"
      : currentTime.getHours() < 15
      ? "Selamat Siang"
      : currentTime.getHours() < 18
      ? "Selamat Sore"
      : "Selamat Malam";

  return (
    <div className="hidden md:block bg-[#f8f9fc] min-h-screen pb-16 w-full animate-fadeIn font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* HEADER SECTION (CLEAN & MINIMALIST WITHOUT EMOTICONS) */}
      {/* ========================================================================= */}
      <div className="flex justify-between items-center mb-6 pt-2 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operator
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{greetingTime},</span>
            <span className="text-indigo-600">{loggedInAdminName || "Master Admin"}</span>
          </h1>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari host, brand, studio..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-3xs w-60"
            />
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2 shadow-3xs">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-800 font-mono">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </span>
          </div>

          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
            {(loggedInAdminName || "M").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 TOP KPI CARDS (CLEAN & BALANCED) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-4 gap-4 mb-6 px-1">
        {/* Card 1: Total Host */}
        <div
          onClick={() => onNavigate && onNavigate("credentials")}
          className="bg-white rounded-2xl p-4.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Host Aktif</h3>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{hosts.length}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              <span className="text-emerald-600 font-bold">{hosts.filter((h) => h.hostType !== "Backup").length} Reguler</span> • {hosts.filter((h) => h.hostType === "Backup").length} Backup
            </p>
          </div>
        </div>

        {/* Card 2: Total Brand */}
        <div
          onClick={() => onNavigate && onNavigate("data_brand")}
          className="bg-white rounded-2xl p-4.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-purple-300 hover:shadow-xs transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Brand</h3>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{activeBrands.length}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Dari {clientBrands.length} brand terdaftar
            </p>
          </div>
        </div>

        {/* Card 3: Sesi Hari Ini */}
        <div
          onClick={() => onNavigate && onNavigate("absensi")}
          className="bg-white rounded-2xl p-4.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-orange-300 hover:shadow-xs transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sesi Hari Ini</h3>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{sortedNearestSchedules.length}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              <span className="text-rose-600 font-bold">{liveCount} Live</span> • <span className="text-indigo-600 font-bold">{upcomingCount} Segera</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Studio */}
        <div
          onClick={() => onNavigate && onNavigate("settings")}
          className="bg-white rounded-2xl p-4.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Studio</h3>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{studios.length}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Ruang siaran aktif
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN MAIN SECTION: SCHEDULE (LEFT) & DONUT CHART (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-1 mb-6 items-stretch">
        {/* ======================================================================= */}
        {/* KOLOM KIRI: TODAY'S SCHEDULE (MINIMALIST & CLEAN) */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Today's Schedule</h2>
                </div>
              </div>

              {/* Quick Filter */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setScheduleFilterTab("all")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      scheduleFilterTab === "all" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Semua ({sortedNearestSchedules.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleFilterTab("active")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      scheduleFilterTab === "active" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Live & Terdekat
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("absensi")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer ml-1"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List Schedules */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {displayedSchedules.length > 0 ? (
                displayedSchedules.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="p-3 rounded-2xl border border-slate-100/90 hover:border-slate-200 hover:bg-slate-50/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    {/* Time Pill */}
                    <div className="w-16 shrink-0 text-left">
                      <span className="font-mono text-xs font-black text-slate-900 block leading-tight">
                        {session.parsed.startTimeFormatted}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 font-medium block leading-tight">
                        {session.parsed.endTimeFormatted}
                      </span>
                    </div>

                    {/* Status Circle */}
                    <div className="shrink-0">
                      {session.isLive ? (
                        <div className="w-3 h-3 rounded-full border-2 border-rose-500 bg-rose-100 animate-pulse" />
                      ) : session.isUpcoming ? (
                        <div className="w-3 h-3 rounded-full border-2 border-amber-400 bg-amber-50" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-slate-100" />
                      )}
                    </div>

                    {/* Host & Brand info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {session.hostName}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-xs text-slate-600 truncate">{session.brandName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                        <span>{session.platform}</span>
                        <span>•</span>
                        <span>{session.studioName}</span>
                      </div>
                    </div>

                    {/* Right pill */}
                    <div className="shrink-0">
                      {session.isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {session.remainingText}
                        </span>
                      ) : session.isUpcoming ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                          <span>Sesi Siaran</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-500">
                          <Check className="w-3 h-3 text-slate-400" />
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">Tidak ada sesi siaran terjadwal.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{sortedNearestSchedules.length} Sesi Terjadwal Hari Ini</span>
            <span className="font-bold text-indigo-600 cursor-pointer" onClick={() => onNavigate && onNavigate("absensi")}>
              Buka Jadwal Kerja &gt;
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM KANAN: PERFORMA KEHADIRAN (DONUT / RADIAL PROGRESS CHART) */}
        {/* ======================================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Performa Kehadiran Host</h2>
                </div>
              </div>

              {/* Period Dropdown / Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("today")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "today" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("week")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "week" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("cutoff")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "cutoff" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cut-Off
                </button>
              </div>
            </div>

            {/* DONUT CHART & LEGEND */}
            <div className="flex items-center justify-center gap-8 py-3">
              {/* Radial Donut SVG */}
              <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 140 140">
                  {/* Track circle */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {/* On-Time Circle (Indigo) */}
                  <circle
                    cx="70"
                    cy="70"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="14"
                    strokeDasharray={donutCircumference}
                    strokeDashoffset={donutOnTimeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                  {/* Late Circle (Amber, if late exists) */}
                  {activeLateCount > 0 && activeTotalCount > 0 && (
                    <circle
                      cx="70"
                      cy="70"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="14"
                      strokeDasharray={donutCircumference}
                      strokeDashoffset={
                        donutCircumference - (donutCircumference * (activeLateCount / activeTotalCount))
                      }
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </svg>

                {/* Center Percentage Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {activePunctualityRate}%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    TEPAT WAKTU
                  </span>
                </div>
              </div>

              {/* Legend with Metrics */}
              <div className="space-y-3 min-w-[170px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">Tepat Waktu</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{activePunctualityRate}%</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">Terlambat</span>
                  </div>
                  <span className="text-xs font-black text-amber-600">{100 - activePunctualityRate}%</span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                    <span className="text-xs font-medium text-slate-400">Total Absen</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{activeTotalCount} Sesi</span>
                </div>
              </div>
            </div>

            {/* List Keterlambatan if any, or Success State */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Log Keterlambatan
                </span>
                <span className="text-[11px] font-black text-amber-600">
                  {activeLateCount} Host Terlambat
                </span>
              </div>

              <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                {currentLateLogsList.length > 0 ? (
                  currentLateLogsList.slice(0, 3).map((log, idx) => (
                    <div
                      key={log.id || idx}
                      className="p-2 rounded-xl bg-slate-50/60 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {log.hostName ? log.hostName.charAt(0).toUpperCase() : "H"}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 truncate block text-xs leading-none">
                            {log.hostName}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate mt-0.5 block">
                            {log.date} • {log.brandHandled}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-lg shrink-0">
                        {log.checkInTime ? `Absen ${log.checkInTime.substring(0, 5)}` : "Late"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 text-center text-emerald-600 flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-50/40 rounded-xl border border-emerald-100/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Semua host hadir tepat waktu pada periode ini</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Cut-off: {activeCutoffMonth}</span>
            <span className="font-bold text-indigo-600 cursor-pointer" onClick={() => onNavigate && onNavigate("database")}>
              Database Absensi &gt;
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM ROW: TARGET & TASKS (LEFT) & PERFORMANCE TREND LINE CHART (RIGHT) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 px-1 items-stretch">
        {/* TASK OPERASIONAL (COL-SPAN-5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Task Operasional Tim</h2>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("today")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    taskPeriodTab === "today" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini ({todayTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("week")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    taskPeriodTab === "week" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini ({weekTasks.length})
                </button>
              </div>
            </div>

            {/* Task Completion Progress Bar */}
            <div className="mb-4 bg-slate-50/60 border border-slate-100 rounded-2xl p-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Progress Penyelesaian</span>
                <span className="text-indigo-600 font-black">{taskCompletionRate}%</span>
              </div>
              <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>
            </div>

            {/* List Tasks */}
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {currentTasksList.length > 0 ? (
                currentTasksList.slice(0, 4).map((task) => {
                  const checklistTotal = task.checklist?.length || 0;
                  const checklistDone = task.checklist?.filter((c) => c.isDone).length || 0;
                  const briefImagesCount = task.briefImages?.length || 0;
                  const isUrgent = task.priority === "urgent";

                  return (
                    <div
                      key={task.id}
                      onClick={() => onNavigate && onNavigate("task_management")}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-2xs bg-white transition-all cursor-pointer group flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isUrgent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          )}
                          <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                            {task.title}
                          </h4>
                          {briefImagesCount > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
                              <ImageIcon className="w-3 h-3 text-slate-400" />
                              {briefImagesCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{task.category || "General"}</span>
                          {checklistTotal > 0 && (
                            <span>• Checklist {checklistDone}/{checklistTotal}</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          {task.deadline === todayStr ? (
                            <span className="text-amber-600">Hari Ini</span>
                          ) : (
                            task.deadline || "No date"
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                  <CheckSquare className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs font-medium text-slate-600">Semua task selesai.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>{activeTasksTotal} Task Aktif</span>
            <span className="font-bold text-indigo-600 cursor-pointer" onClick={() => onNavigate && onNavigate("task_management")}>
              Buka Task Management &gt;
            </span>
          </div>
        </div>

        {/* PERFORMANCE OVERVIEW (LINE / TREND CHART - COL-SPAN-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between h-full min-h-[380px]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Performance Overview</h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tren ketepatan kehadiran host 7 hari terakhir (Minggu Ini)</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                  This Week
                </span>
              </div>
            </div>

            {/* SMOOTH SVG LINE CHART */}
            <div className="py-2">
              <div className="w-full h-44 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 40, 80, 120].map((y, idx) => (
                    <line
                      key={idx}
                      x1="35"
                      y1={y + 10}
                      x2="480"
                      y2={y + 10}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Y Axis labels */}
                  <text x="5" y="14" fill="#94a3b8" fontSize="9" fontWeight="600">100</text>
                  <text x="12" y="54" fill="#94a3b8" fontSize="9" fontWeight="600">75</text>
                  <text x="12" y="94" fill="#94a3b8" fontSize="9" fontWeight="600">50</text>
                  <text x="12" y="134" fill="#94a3b8" fontSize="9" fontWeight="600">25</text>

                  {/* Path coordinates calculation */}
                  {(() => {
                    const points = weeklyTrendData.map((d, i) => {
                      const x = 50 + i * ((470 - 50) / 6);
                      // Map rate (0 to 100) to y (130 to 10)
                      const clampedRate = Math.max(0, Math.min(100, d.rate));
                      const y = 130 - (clampedRate / 100) * 120;
                      return { x, y, ...d };
                    });

                    // Build smooth curve path
                    let pathD = `M ${points[0].x} ${points[0].y}`;
                    for (let i = 0; i < points.length - 1; i++) {
                      const curr = points[i];
                      const next = points[i + 1];
                      const cp1x = curr.x + (next.x - curr.x) / 2;
                      const cp1y = curr.y;
                      const cp2x = curr.x + (next.x - curr.x) / 2;
                      const cp2y = next.y;
                      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
                    }

                    const areaD = `${pathD} L ${points[points.length - 1].x} 130 L ${points[0].x} 130 Z`;

                    return (
                      <>
                        {/* Area fill */}
                        <path d={areaD} fill="url(#trendGradient)" />

                        {/* Stroke line */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Points */}
                        {points.map((pt, idx) => (
                          <g key={idx} className="group cursor-pointer">
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r="4.5"
                              fill="#ffffff"
                              stroke="#6366f1"
                              strokeWidth="2.5"
                              className="group-hover:r-6 transition-all"
                            />
                            {/* Hover tooltip text */}
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              textAnchor="middle"
                              fill="#4338ca"
                              fontSize="10"
                              fontWeight="800"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {pt.rate}%
                            </text>
                            {/* X Axis Day Label */}
                            <text
                              x={pt.x}
                              y="152"
                              textAnchor="middle"
                              fill={pt.date === todayStr ? "#4f46e5" : "#64748b"}
                              fontSize="10"
                              fontWeight={pt.date === todayStr ? "800" : "600"}
                            >
                              {pt.day}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Rata-rata ketepatan minggu ini: {Math.round(weeklyTrendData.reduce((acc, d) => acc + d.rate, 0) / 7)}%</span>
            <span className="font-bold text-indigo-600 cursor-pointer" onClick={() => onNavigate && onNavigate("absensi")}>
              Laporan Siaran &gt;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

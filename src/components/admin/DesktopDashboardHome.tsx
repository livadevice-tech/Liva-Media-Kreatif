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
} from "lucide-react";
import { getCutoffMonthForDate } from "../../shared/utils/appUi";
import { loadTasksFromStorage } from "../tasks/taskStorage";
import { TaskItem, TaskPriority } from "../tasks/types";

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

  // Active sub-tabs
  const [latePeriodTab, setLatePeriodTab] = useState<"today" | "week" | "cutoff">("today");
  const [taskPeriodTab, setTaskPeriodTab] = useState<"today" | "week">("today");
  const [scheduleFilterTab, setScheduleFilterTab] = useState<"all" | "active">("all");

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
  // 1. JADWAL HOST PALING DEKAT DENGAN JAM TERKINI
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
          remainingText = `Mulai dlm ${diff}m`;
        } else {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          remainingText = `Mulai dlm ${h}j ${m > 0 ? `${m}m` : ""}`;
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
    if (scheduleFilterTab === "active") {
      return sortedNearestSchedules.filter((s) => s.isLive || s.isUpcoming);
    }
    return sortedNearestSchedules;
  }, [sortedNearestSchedules, scheduleFilterTab]);

  // Quick stats for sessions
  const liveCount = useMemo(() => sortedNearestSchedules.filter((s) => s.isLive).length, [sortedNearestSchedules]);
  const upcomingCount = useMemo(() => sortedNearestSchedules.filter((s) => s.isUpcoming).length, [sortedNearestSchedules]);
  const finishedCount = useMemo(() => sortedNearestSchedules.filter((s) => s.isFinished).length, [sortedNearestSchedules]);

  // =========================================================================
  // 2. PERFORMA HOST: KETERLAMBATAN HARI INI, MINGGU INI & CUT-OFF
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

  // =========================================================================
  // 3. TASK HARI INI & TASK MINGGU INI
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
      {/* HEADER SECTION (CLEAN & MINIMALIST) */}
      {/* ========================================================================= */}
      <div className="flex justify-between items-center mb-6 pt-2 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operator Dashboard
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {greetingTime}, {loggedInAdminName || "Master Admin"} <span>👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoring performa siaran host, absensi keterlambatan, dan task operasional tim.
          </p>
        </div>

        {/* Live Clock Badge */}
        <div className="flex items-center gap-2.5 bg-white border border-slate-200/80 rounded-2xl px-4 py-2 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block leading-tight">
              Jam Terkini
            </span>
            <span className="text-xs font-black text-slate-800 font-mono leading-none">
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 TOP KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-4 gap-4 mb-6 px-1">
        {/* Card 1: Total Host */}
        <div
          onClick={() => onNavigate && onNavigate("credentials")}
          className="bg-white rounded-2xl p-4.5 border border-slate-200/70 shadow-2xs flex flex-col justify-between cursor-pointer hover:border-indigo-300 hover:shadow-xs transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Host</h3>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Book className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Brand Aktif</h3>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sesi Hari Ini</h3>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClipboardList className="w-3.5 h-3.5" />
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
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Studio Live</h3>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{studios.length}</div>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5">
              Bandar Lampung & Tanggamus
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN BALANCED OPERATIONAL SECTIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 px-1 items-stretch">
        {/* ======================================================================= */}
        {/* KOLOM KIRI: JADWAL HOST TERDEKAT (COMMAND CENTER) */}
        {/* ======================================================================= */}
        <div className="flex flex-col h-full">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col h-full min-h-[580px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    Jadwal Host Terdekat
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Jam Terkini
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Urutan otomatis prioritas sesi live, sesi terdekat, dan yang telah usai
                  </p>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[10px] font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setScheduleFilterTab("all")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    scheduleFilterTab === "all" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({sortedNearestSchedules.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFilterTab("active")}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    scheduleFilterTab === "active" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Live & Terdekat
                </button>
              </div>
            </div>

            {/* Quick Session Status Ribbon */}
            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="bg-rose-50/50 border border-rose-100/80 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-rose-600 uppercase block">Sedang Live</span>
                  <span className="text-base font-black text-rose-800 leading-tight">{liveCount} Sesi</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <div className="bg-amber-50/50 border border-amber-100/80 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-amber-600 uppercase block">Akan Datang</span>
                  <span className="text-base font-black text-amber-800 leading-tight">{upcomingCount} Sesi</span>
                </div>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Selesai</span>
                  <span className="text-base font-black text-slate-700 leading-tight">{finishedCount} Sesi</span>
                </div>
                <Check className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* List Schedules with Scroll */}
            <div className="space-y-2 flex-1 max-h-[460px] overflow-y-auto pr-1">
              {displayedSchedules.length > 0 ? (
                displayedSchedules.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-2xs bg-white transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Time pill */}
                      <div className="text-center w-20 shrink-0 bg-slate-50 border border-slate-200/60 rounded-lg py-1">
                        <span className="font-mono text-[11px] font-black text-slate-800 block leading-tight">
                          {session.parsed.startTimeFormatted}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium block leading-tight">
                          {session.parsed.endTimeFormatted}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {session.hostName}
                          </span>
                          <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                            {session.platform}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          <span className="font-medium text-slate-700">{session.brandName}</span>
                          <span className="text-slate-300 mx-1">•</span>
                          <span className="text-slate-400">{session.studioName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 text-right">
                      {session.isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-3xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          Live • {session.remainingText}
                        </span>
                      ) : session.isUpcoming ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {session.remainingText}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
                          <Check className="w-3 h-3 text-slate-400" />
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                  <Calendar className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Tidak ada sesi siaran terjadwal untuk hari ini.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">
                {sortedNearestSchedules.length} total sesi siaran hari ini
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("absensi")}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Kalender Kerja Host</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM KANAN: KETERLAMBATAN HOST + TASK OPERASIONAL */}
        {/* ======================================================================= */}
        <div className="flex flex-col gap-5 h-full">
          {/* CARD 1: KETERLAMBATAN HOST */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col flex-1 min-h-[290px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    Keterlambatan Host
                    {currentLateLogsList.length > 0 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {currentLateLogsList.length} Terlambat
                      </span>
                    )}
                  </h2>
                </div>
              </div>

              {/* Segmented Period Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("today")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    latePeriodTab === "today" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini ({todayLateLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("week")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    latePeriodTab === "week" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini ({weekLateLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("cutoff")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    latePeriodTab === "cutoff" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cut-Off ({cutoffLateLogs.length})
                </button>
              </div>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-2 text-center">
                <span className="text-[9px] font-bold text-amber-700 uppercase block">Terlambat</span>
                <span className="text-base font-black text-amber-800">{currentLateLogsList.length}</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2 text-center">
                <span className="text-[9px] font-bold text-emerald-700 uppercase block">Total Absen</span>
                <span className="text-base font-black text-emerald-800">
                  {latePeriodTab === "today" ? todayTotal : latePeriodTab === "week" ? weekTotal : cutoffTotal}
                </span>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-2 text-center">
                <span className="text-[9px] font-bold text-indigo-700 uppercase block">Ketepatan</span>
                <span className="text-base font-black text-indigo-800">
                  {(() => {
                    const total = latePeriodTab === "today" ? todayTotal : latePeriodTab === "week" ? weekTotal : cutoffTotal;
                    if (total === 0) return "100%";
                    const onTime = total - currentLateLogsList.length;
                    return `${Math.max(0, Math.round((onTime / total) * 100))}%`;
                  })()}
                </span>
              </div>
            </div>

            {/* List Keterlambatan */}
            <div className="space-y-1.5 flex-1 max-h-[175px] overflow-y-auto pr-1">
              {currentLateLogsList.length > 0 ? (
                currentLateLogsList.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-amber-200 bg-white transition-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {log.hostName ? log.hostName.charAt(0).toUpperCase() : "H"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 truncate block text-xs leading-tight">
                          {log.hostName}
                        </span>
                        <p className="text-[10px] text-slate-400 truncate">
                          {log.date} • {log.shiftHours || log.shift || "Live"} • {log.brandHandled}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/60 px-1.5 py-0.5 rounded">
                        {log.checkInTime ? `Absen ${log.checkInTime.substring(0, 5)}` : "Terlambat"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-800">Semua host hadir tepat waktu!</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Tidak ada data keterlambatan pada periode ini.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">Cut-off berjalan: {activeCutoffMonth}</span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("database")}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Database Absensi</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* CARD 2: TASK OPERASIONAL */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-2xs flex flex-col flex-1 min-h-[290px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    Task Operasional
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {activeTasksTotal} Aktif
                    </span>
                  </h2>
                </div>
              </div>

              {/* Segmented Filter */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/60 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("today")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    taskPeriodTab === "today" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini ({todayTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("week")}
                  className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                    taskPeriodTab === "week" ? "bg-white text-indigo-600 shadow-3xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini ({weekTasks.length})
                </button>
              </div>
            </div>

            {/* List Tasks */}
            <div className="space-y-1.5 flex-1 max-h-[185px] overflow-y-auto pr-1">
              {currentTasksList.length > 0 ? (
                currentTasksList.map((task) => {
                  const checklistTotal = task.checklist?.length || 0;
                  const checklistDone = task.checklist?.filter((c) => c.isDone).length || 0;
                  const briefImagesCount = task.briefImages?.length || 0;

                  const isUrgent = task.priority === "urgent";
                  const isHigh = task.priority === "high";

                  return (
                    <div
                      key={task.id}
                      onClick={() => onNavigate && onNavigate("task_management")}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-2xs bg-white transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                            <span
                              className={`text-[8px] font-black uppercase px-1 py-0.2 rounded border ${
                                isUrgent
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isHigh
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-50 text-indigo-700">
                              {task.category || "General"}
                            </span>
                            {briefImagesCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                                <ImageIcon className="w-2.5 h-2.5" />
                                {briefImagesCount}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {task.title}
                          </h4>
                        </div>

                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                          {task.deadline === todayStr ? (
                            <span className="text-amber-600 font-extrabold">Hari Ini</span>
                          ) : task.deadline && task.deadline < todayStr ? (
                            <span className="text-rose-600 font-extrabold">Overdue</span>
                          ) : (
                            task.deadline
                          )}
                        </span>
                      </div>

                      {checklistTotal > 0 && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="flex-1 bg-slate-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1 rounded-full transition-all"
                              style={{ width: `${Math.round((checklistDone / checklistTotal) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 shrink-0">
                            {checklistDone}/{checklistTotal}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-slate-400 bg-slate-50/40 rounded-xl border border-dashed border-slate-200">
                  <CheckSquare className="w-5 h-5 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Tidak ada task operasional pada periode {taskPeriodTab === "today" ? "hari ini" : "minggu ini"}.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-medium">
                {activeTasksTotal} task aktif
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("task_management")}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Task Management</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

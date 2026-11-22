import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Bell,
  Book,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  CheckSquare,
  ExternalLink,
  ChevronRight,
  Radio,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileText,
  User,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Building2,
  PlaySquare,
} from "lucide-react";
import { formatIDR } from "../../shared/utils/currency";
import { normalizeDateYMD, getCutoffMonthForDate } from "../../shared/utils/appUi";
import { loadTasksFromStorage } from "../tasks/taskStorage";
import { TaskItem, TaskPriority, TaskStatus } from "../tasks/types";

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
      endH += 24; // spans midnight (e.g. 22:00 - 02:00)
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
  violations = [],
  loggedInAdminName,
  avatarUrl,
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

  // Active sub-tabs for interactive cards
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
      let statusLabel = "";
      let remainingText = "";

      if (isLive) {
        sortScore = 0 - (parsed.endMinutes - currentMinutesFromMidnight);
        statusLabel = "SEDANG LIVE";
        const rem = parsed.endMinutes - currentMinutesFromMidnight;
        remainingText = `Sisa ${rem} mnt`;
      } else if (isUpcoming) {
        const diff = parsed.startMinutes - currentMinutesFromMidnight;
        sortScore = 1000 + diff;
        statusLabel = "AKAN DATANG";
        if (diff < 60) {
          remainingText = `Mulai dlm ${diff} mnt`;
        } else {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          remainingText = `Mulai dlm ${h}j ${m > 0 ? `${m}m` : ""}`;
        }
      } else {
        const passed = currentMinutesFromMidnight - parsed.endMinutes;
        sortScore = 100000 + passed;
        statusLabel = "SELESAI";
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
        statusLabel,
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
  // 3. OVERVIEW JATUH TEMPO INVOICE
  // =========================================================================
  const { overdueInvoices, dueSoonInvoices, totalUnpaidCount, totalUnpaidAmount, totalOverdueAmount } = useMemo(() => {
    const list: any[] = [];
    clientBrands.forEach((b) => {
      if (Array.isArray(b.invoices)) {
        b.invoices.forEach((inv) => {
          list.push({
            ...inv,
            brandId: b.id,
            brandName: b.name,
            companyName: b.companyName,
          });
        });
      }
    });

    const overdue: any[] = [];
    const dueSoon: any[] = [];
    let unpaidCount = 0;
    let unpaidAmount = 0;
    let overdueAmt = 0;

    const in7Days = new Date(currentTime);
    in7Days.setDate(currentTime.getDate() + 7);
    const in7DaysStr = `${in7Days.getFullYear()}-${String(in7Days.getMonth() + 1).padStart(2, "0")}-${String(in7Days.getDate()).padStart(2, "0")}`;

    list.forEach((inv) => {
      const isPaid = inv.status?.toLowerCase() === "paid";
      const isCancelled = inv.status?.toLowerCase() === "cancelled";
      if (isPaid || isCancelled) return;

      unpaidCount++;
      const amount = Number(inv.totalAmount) || 0;
      unpaidAmount += amount;

      const due = normalizeDateYMD(inv.dueDate);
      if (!due) return;

      // Calculate diff in days
      const d1 = new Date(due).getTime();
      const d2 = new Date(todayStr).getTime();
      const diffDays = Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));

      const enrichedInv = {
        ...inv,
        normalizedDue: due,
        diffDays,
      };

      if (inv.status?.toLowerCase() === "overdue" || due < todayStr) {
        overdue.push(enrichedInv);
        overdueAmt += amount;
      } else if (due <= in7DaysStr) {
        dueSoon.push(enrichedInv);
      }
    });

    // Sort overdue by most overdue first
    overdue.sort((a, b) => a.diffDays - b.diffDays);
    // Sort due soon by closest due date first
    dueSoon.sort((a, b) => a.diffDays - b.diffDays);

    return {
      overdueInvoices: overdue,
      dueSoonInvoices: dueSoon,
      totalUnpaidCount: unpaidCount,
      totalUnpaidAmount: unpaidAmount,
      totalOverdueAmount: overdueAmt,
    };
  }, [clientBrands, currentTime, todayStr]);

  // =========================================================================
  // 4. TASK HARI INI & TASK MINGGU INI
  // =========================================================================
  const { todayTasks, weekTasks, activeTasksTotal } = useMemo(() => {
    const todayList = tasks.filter((t) => {
      if (t.deadline === todayStr) return true;
      // Also show overdue uncompleted tasks in today's attention list
      if (t.deadline && t.deadline < todayStr && t.status !== "done") return true;
      return false;
    });

    const weekList = tasks.filter((t) => {
      if (!t.deadline) return false;
      return t.deadline >= mondayStr && t.deadline <= sundayStr;
    });

    const activeList = tasks.filter((t) => t.status !== "done");

    // Sort by priority (urgent -> high -> moderate -> low)
    const priorityWeight: Record<TaskPriority, number> = {
      urgent: 4,
      high: 3,
      moderate: 2,
      low: 1,
    };

    const sortByPriority = (a: TaskItem, b: TaskItem) => {
      const wa = priorityWeight[a.priority] || 0;
      const wb = priorityWeight[b.priority] || 0;
      return wb - wa;
    };

    todayList.sort(sortByPriority);
    weekList.sort(sortByPriority);

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
    <div className="hidden md:block bg-[#fafafc] min-h-screen pb-16 w-full animate-fadeIn font-sans text-slate-800">
      {/* ========================================================================= */}
      {/* HEADER SECTION */}
      {/* ========================================================================= */}
      <div className="flex justify-between items-center mb-7 px-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Operator Dashboard
            </span>
            <span className="text-xs font-semibold text-slate-400">
              • {currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2 mt-1 tracking-tight">
            {greetingTime}, {loggedInAdminName || "Administrator"} <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Berikut ringkasan performa host, absensi, tagihan jatuh tempo, jadwal siaran, dan task operasional hari ini.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-2 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jam Terkini</div>
              <div className="text-sm font-black text-slate-800 font-mono">
                {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => onNavigate && onNavigate("absensi")}
              className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center border border-slate-200/80 shadow-xs text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
              title="Notifikasi & Reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
            {overdueInvoices.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-xs">
                {overdueInvoices.length}
              </span>
            )}
          </div>

          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-2xl object-cover shadow-xs border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-200">
              {loggedInAdminName ? loggedInAdminName.substring(0, 1).toUpperCase() : "A"}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4 KPI CARDS UTAMA */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-4 gap-5 mb-7 px-2">
        {/* Card 1: Total Host Aktif */}
        <div
          onClick={() => onNavigate && onNavigate("credentials")}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/70 flex flex-col justify-between cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Host Terdaftar</h3>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Book className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{hosts.length}</div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
              <span>{hosts.filter((h) => h.hostType === "Backup").length} Host Backup</span> •
              <span className="text-emerald-600 font-bold">{hosts.filter((h) => h.hostType !== "Backup").length} Reguler</span>
            </p>
          </div>
        </div>

        {/* Card 2: Total Brand Aktif */}
        <div
          onClick={() => onNavigate && onNavigate("data_brand")}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/70 flex flex-col justify-between cursor-pointer hover:border-purple-300 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Brand Aktif</h3>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{activeBrands.length}</div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Dari total {clientBrands.length} brand klien
            </p>
          </div>
        </div>

        {/* Card 3: Sesi Hari Ini */}
        <div
          onClick={() => onNavigate && onNavigate("absensi")}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/70 flex flex-col justify-between cursor-pointer hover:border-orange-300 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sesi Hari Ini</h3>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{sortedNearestSchedules.length}</div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-rose-600 font-bold">{sortedNearestSchedules.filter((s) => s.isLive).length} Live</span> •
              <span className="text-indigo-600 font-bold">{sortedNearestSchedules.filter((s) => s.isUpcoming).length} Segera</span>
            </p>
          </div>
        </div>

        {/* Card 4: Total Studio */}
        <div
          onClick={() => onNavigate && onNavigate("settings")}
          className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/70 flex flex-col justify-between cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Studio Live</h3>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">{studios.length}</div>
            <p className="text-[11px] font-semibold text-slate-400 mt-1">
              Bandar Lampung & Tanggamus
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN OPERATIONAL DASHBOARD */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
        {/* ======================================================================= */}
        {/* KOLOM KIRI: JADWAL TERDEKAT & PERFORMA KETERLAMBATAN HOST */}
        {/* ======================================================================= */}
        <div className="space-y-6 flex flex-col">
          {/* SECTION 1: JADWAL HOST PALING DEKAT DENGAN JAM TERKINI */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Jadwal Host Terdekat
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Live Time
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Diurutkan otomatis sesuai kedekatan dengan jam terkini ({currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setScheduleFilterTab("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      scheduleFilterTab === "all" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Semua ({sortedNearestSchedules.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleFilterTab("active")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      scheduleFilterTab === "active" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Live & Terdekat
                  </button>
                </div>
              </div>
            </div>

            {/* List Jadwal Terdekat */}
            <div className="space-y-2.5 flex-1 max-h-[380px] overflow-y-auto pr-1">
              {displayedSchedules.length > 0 ? (
                displayedSchedules.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className={`rounded-xl p-3 border transition-all flex items-center justify-between gap-3 ${
                      session.isLive
                        ? "bg-rose-50/50 border-rose-200 shadow-xs ring-1 ring-rose-200"
                        : session.isUpcoming
                        ? "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs"
                        : "bg-slate-50/60 border-slate-200/60 opacity-80"
                    }`}
                  >
                    {/* Time & Indicator */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="text-center w-24 shrink-0 bg-white border border-slate-200/80 rounded-lg py-1.5 px-1 shadow-2xs">
                        <span className="font-mono text-xs font-black text-slate-800 block">
                          {session.parsed.startTimeFormatted}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          s/d {session.parsed.endTimeFormatted}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-xs text-slate-900 truncate">
                            {session.hostName}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                            {session.platform}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700">{session.brandName}</span>
                          <span>•</span>
                          <span className="text-slate-400 truncate">{session.studioName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 text-right">
                      {session.isLive ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                            SEDANG LIVE
                          </span>
                          <span className="text-[10px] font-bold text-rose-700 font-mono">
                            {session.remainingText}
                          </span>
                        </div>
                      ) : session.isUpcoming ? (
                        <div className="flex flex-col items-end gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {session.remainingText}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            Akan Datang
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                          <Check className="w-3 h-3 text-slate-400" />
                          Selesai
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Tidak ada sesi siaran terjadwal untuk hari ini.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Kelola jadwal di menu Calender Kerja Host.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Total {sortedNearestSchedules.length} sesi terdaftar hari ini
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("absensi")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Buka Calender Jadwal Host</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 2: PERFORMA HOST - KETERLAMBATAN ABSEN */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Keterlambatan Host
                    {currentLateLogsList.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {currentLateLogsList.length} Terlambat
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Pantau kepatuhan jam kehadiran host siaran
                  </p>
                </div>
              </div>

              {/* Segmented Filter: Hari Ini / Minggu Ini / Cut-Off */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("today")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "today" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini ({todayLateLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("week")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "week" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini ({weekLateLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLatePeriodTab("cutoff")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    latePeriodTab === "cutoff" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cut-Off ({cutoffLateLogs.length})
                </button>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-3 gap-3 mb-3.5">
              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase block">Total Terlambat</span>
                <span className="text-xl font-black text-amber-800">{currentLateLogsList.length}</span>
              </div>
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Total Sesi Absen</span>
                <span className="text-xl font-black text-emerald-800">
                  {latePeriodTab === "today" ? todayTotal : latePeriodTab === "week" ? weekTotal : cutoffTotal}
                </span>
              </div>
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block">Ketepatan Waktu</span>
                <span className="text-xl font-black text-indigo-800">
                  {(() => {
                    const total = latePeriodTab === "today" ? todayTotal : latePeriodTab === "week" ? weekTotal : cutoffTotal;
                    if (total === 0) return "100%";
                    const onTime = total - currentLateLogsList.length;
                    const pct = Math.max(0, Math.round((onTime / total) * 100));
                    return `${pct}%`;
                  })()}
                </span>
              </div>
            </div>

            {/* List Keterlambatan */}
            <div className="space-y-2 flex-1 max-h-[260px] overflow-y-auto pr-1">
              {currentLateLogsList.length > 0 ? (
                currentLateLogsList.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center shrink-0">
                        {log.hostName ? log.hostName.charAt(0).toUpperCase() : "H"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-800 truncate">{log.hostName}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Terlambat
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {log.date} • Shift: {log.shiftHours || log.shift || "Live"} • {log.brandHandled}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="font-mono text-xs font-bold text-rose-600 block">
                        {log.checkInTime ? `Absen ${log.checkInTime.substring(0, 5)}` : "Terlambat"}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        {log.platform || "Siaran"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-800">Tidak ada keterlambatan pada periode ini! 🎉</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Semua host hadir tepat waktu sesuai jadwal siaran.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Data cut-off berjalan: {activeCutoffMonth}
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("database")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Lihat Database Absensi Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* KOLOM KANAN: JATUH TEMPO INVOICE & TASK MANAGEMENT HARI / MINGGU INI */}
        {/* ======================================================================= */}
        <div className="space-y-6 flex flex-col">
          {/* SECTION 3: OVERVIEW JATUH TEMPO INVOICE */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Jatuh Tempo Invoice
                    {overdueInvoices.length > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        {overdueInvoices.length} Overdue
                      </span>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Monitoring penagihan klien & piutang berjalan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate("invoice")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Kelola Invoice</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3 Metric Chips */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Jatuh Tempo (Overdue)
                </span>
                <div className="text-lg font-black text-rose-800 mt-0.5">
                  {overdueInvoices.length} Tagihan
                </div>
                <div className="text-[11px] font-extrabold text-rose-600 font-mono mt-0.5 truncate">
                  {formatIDR(totalOverdueAmount)}
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Jatuh Tempo 7 Hari
                </span>
                <div className="text-lg font-black text-amber-800 mt-0.5">
                  {dueSoonInvoices.length} Tagihan
                </div>
                <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
                  Perlu Follow Up
                </div>
              </div>

              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-3">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                  Total Belum Lunas
                </span>
                <div className="text-lg font-black text-indigo-800 mt-0.5">
                  {totalUnpaidCount} Tagihan
                </div>
                <div className="text-[11px] font-extrabold text-indigo-600 font-mono mt-0.5 truncate">
                  {formatIDR(totalUnpaidAmount)}
                </div>
              </div>
            </div>

            {/* List Urgent Invoices (Overdue & Due Soon) */}
            <div className="space-y-2 flex-1 max-h-[250px] overflow-y-auto pr-1">
              {[...overdueInvoices, ...dueSoonInvoices].length > 0 ? (
                [...overdueInvoices, ...dueSoonInvoices].slice(0, 5).map((inv, idx) => (
                  <div
                    key={inv.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-2xs transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-black text-slate-900 truncate">
                          {inv.invoiceNumber}
                        </span>
                        {inv.diffDays < 0 ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 shrink-0">
                            Lewat {Math.abs(inv.diffDays)} hari
                          </span>
                        ) : inv.diffDays === 0 ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                            Jatuh Tempo Hari Ini
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 shrink-0">
                            {inv.diffDays} hari lagi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {inv.ptName || inv.brandName} • Due: {inv.normalizedDue}
                      </p>
                    </div>

                    <div className="shrink-0 text-right ml-3">
                      <span className="font-mono text-xs font-black text-slate-900 block">
                        {formatIDR(inv.totalAmount || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {inv.status || "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-800">Semua invoice terkendali! 🎉</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Tidak ada invoice overdue atau mendekati jatuh tempo saat ini.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Pembaruan otomatis dari modul Billing & Invoice
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("invoice")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Buka Manajemen Invoice</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SECTION 4: TASK OPERASIONAL (TASK HARI INI & TASK MINGGU INI) */}
          <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/70 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    Task Operasional
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      {activeTasksTotal} Aktif
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Pantau target tugas deadline hari ini & minggu ini
                  </p>
                </div>
              </div>

              {/* Segmented Filter: Hari Ini / Minggu Ini */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("today")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    taskPeriodTab === "today" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Hari Ini ({todayTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTaskPeriodTab("week")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    taskPeriodTab === "week" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Minggu Ini ({weekTasks.length})
                </button>
              </div>
            </div>

            {/* List Tasks */}
            <div className="space-y-2 flex-1 max-h-[290px] overflow-y-auto pr-1">
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
                      className="p-3 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                isUrgent
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isHigh
                                  ? "bg-orange-50 text-orange-700 border-orange-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {task.category || "General"}
                            </span>
                            {briefImagesCount > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
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

                      {/* Checklist progress bar if checklist exists */}
                      {checklistTotal > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full transition-all"
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
                <div className="py-8 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <CheckSquare className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">
                    Tidak ada task operasional pada periode {taskPeriodTab === "today" ? "hari ini" : "minggu ini"}.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Semua pekerjaan telah selesai atau belum dijadwalkan.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[11px] font-medium text-slate-400">
                Total {activeTasksTotal} task aktif dalam sistem
              </span>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("task_management")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Buka Task Management</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

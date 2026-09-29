import React, { useEffect, useState, useMemo, useRef } from "react";
import { activityLogsApi } from "../../api";
import type { HostActivityLog } from "../../types";
import {
  Activity,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Search,
  RotateCw,
  X,
  Check,
  Filter
} from "lucide-react";

interface ActivityLogsTableProps {
  hosts?: Array<{ id: string; name: string }>;
}

export const ActivityLogsTable: React.FC<ActivityLogsTableProps> = ({ hosts = [] }) => {
  const [logs, setLogs] = useState<HostActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters state
  const [dateFilterMode, setDateFilterMode] = useState<"daily" | "all">("daily");
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });
  const [selectedHost, setSelectedHost] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Host dropdown state
  const [isHostDropdownOpen, setIsHostDropdownOpen] = useState(false);
  const [hostSearchQuery, setHostSearchQuery] = useState("");
  const hostDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    fetchLogs();
  }, []);

  // Close host dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (hostDropdownRef.current && !hostDropdownRef.current.contains(event.target as Node)) {
        setIsHostDropdownOpen(false);
      }
    }
    if (isHostDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isHostDropdownOpen]);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    setError("");
    try {
      const data = await activityLogsApi.getAll();
      const loadedLogs = data || [];
      setLogs(loadedLogs);

      // If today has 0 logs, auto-default to latest log's date if available
      if (loadedLogs.length > 0) {
        const todayStr = getTodayDateStr();
        const hasToday = loadedLogs.some(l => getLogDateKey(l.created_at) === todayStr);
        if (!hasToday) {
          const latestLogDate = getLogDateKey(loadedLogs[0]?.created_at);
          if (latestLogDate) {
            setSelectedDate(latestLogDate);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data log");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const getTodayDateStr = (): string => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getLogDateKey = (dateStr?: string): string => {
    if (!dateStr) return "";
    try {
      const normalized = dateStr.includes("T")
        ? dateStr
        : dateStr.replace(" ", "T") + (dateStr.length === 19 ? "+07:00" : "");
      const d = new Date(normalized);
      if (isNaN(d.getTime())) return "";
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(d);
    } catch {
      return "";
    }
  };

  const shiftDate = (dateStr: string, days: number): string => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      date.setDate(date.getDate() + days);
      const ny = date.getFullYear();
      const nm = String(date.getMonth() + 1).padStart(2, "0");
      const nd = String(date.getDate()).padStart(2, "0");
      return `${ny}-${nm}-${nd}`;
    } catch {
      return dateStr;
    }
  };

  const handlePrevDay = () => {
    setDateFilterMode("daily");
    setSelectedDate(prev => shiftDate(prev || getTodayDateStr(), -1));
    setCurrentPage(1);
  };

  const handleNextDay = () => {
    setDateFilterMode("daily");
    setSelectedDate(prev => shiftDate(prev || getTodayDateStr(), 1));
    setCurrentPage(1);
  };

  const handleToday = () => {
    setDateFilterMode("daily");
    setSelectedDate(getTodayDateStr());
    setCurrentPage(1);
  };

  const handleAllDates = () => {
    setDateFilterMode("all");
    setCurrentPage(1);
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (isNaN(dateObj.getTime())) return dateStr;
      return dateObj.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const normalized = dateStr.includes("T")
        ? dateStr
        : dateStr.replace(" ", "T") + (dateStr.length === 19 ? "+07:00" : "");
      const date = new Date(normalized);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  const formatDetails = (detailsStr?: string) => {
    if (!detailsStr) return <span className="text-slate-400 italic">-</span>;
    try {
      const parsed = JSON.parse(detailsStr);
      if (typeof parsed === "object" && parsed !== null) {
        return (
          <div className="flex flex-wrap items-center gap-1.5">
            {Object.entries(parsed).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs"
              >
                <span className="text-slate-400 font-medium">{key}:</span>
                <span className="font-semibold text-slate-800">{String(value)}</span>
              </span>
            ))}
          </div>
        );
      }
      return <span className="text-slate-700">{String(parsed)}</span>;
    } catch {
      return <span className="text-slate-700">{detailsStr}</span>;
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action.toUpperCase()) {
      case "CLOCK_IN":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LOGIN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RELOAD":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PAGE_LOAD":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "LOGOUT":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Host list with count
  const hostOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();

    if (hosts && hosts.length > 0) {
      hosts.forEach(h => {
        if (h.name) {
          map.set(h.name.trim().toLowerCase(), {
            id: h.id,
            name: h.name.trim(),
            count: 0
          });
        }
      });
    }

    logs.forEach(l => {
      const name = l.host_name?.trim();
      if (name) {
        const key = name.toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            id: l.host_id || key,
            name: name,
            count: 1
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [hosts, logs]);

  const filteredHostsForDropdown = useMemo(() => {
    if (!hostSearchQuery.trim()) return hostOptions;
    const q = hostSearchQuery.toLowerCase().trim();
    return hostOptions.filter(h => h.name.toLowerCase().includes(q));
  }, [hostOptions, hostSearchQuery]);

  // Unique actions for quick action filter
  const actionOptions = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.action) set.add(l.action.toUpperCase());
    });
    return Array.from(set).sort();
  }, [logs]);

  // Main filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Date filter
      if (dateFilterMode === "daily") {
        const logDate = getLogDateKey(log.created_at);
        if (logDate !== selectedDate) return false;
      }

      // Host filter
      if (selectedHost) {
        const logHost = (log.host_name || "").toLowerCase().trim();
        const targetHost = selectedHost.toLowerCase().trim();
        const matchName = logHost === targetHost || logHost.includes(targetHost);
        const matchId = log.host_id === selectedHost;
        if (!matchName && !matchId) return false;
      }

      // Action filter
      if (selectedAction && selectedAction !== "all") {
        if (log.action.toUpperCase() !== selectedAction.toUpperCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchHost = (log.host_name || "").toLowerCase().includes(q);
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDetails = (log.details || "").toLowerCase().includes(q);
        if (!matchHost && !matchAction && !matchDetails) return false;
      }

      return true;
    });
  }, [logs, dateFilterMode, selectedDate, selectedHost, selectedAction, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedLogs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, safeCurrentPage, pageSize]);

  const hasActiveFilters = dateFilterMode === "daily" || selectedHost !== "" || selectedAction !== "all" || searchQuery !== "";

  const handleResetFilters = () => {
    setDateFilterMode("all");
    setSelectedHost("");
    setSelectedAction("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            Riwayat Aktivitas
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Menampilkan maksimal 1000 log aktivitas terbaru dari seluruh host.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={isRefreshing}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Segarkan data log terbaru dari server"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-600" : "text-slate-500"}`} />
          <span>{isRefreshing ? "Menyegarkan..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Date Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Pill Toggle: Per Hari vs Semua (All) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setDateFilterMode("daily");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  dateFilterMode === "daily"
                    ? "bg-white text-slate-800 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Per Hari</span>
              </button>
              <button
                type="button"
                onClick={handleAllDates}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  dateFilterMode === "all"
                    ? "bg-white text-purple-700 shadow-2xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span>Semua (All)</span>
              </button>
            </div>

            {/* Daily Navigators: Only when in daily mode */}
            {dateFilterMode === "daily" ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                  title="Hari Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Date Input with Label Overlay */}
                <div className="relative flex items-center bg-white border border-slate-200 hover:border-blue-400 rounded-xl px-3 py-1.5 shadow-2xs transition-colors cursor-pointer group">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 mr-2 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 tracking-tight">
                    {formatDisplayDate(selectedDate)}
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setDateFilterMode("daily");
                        setCurrentPage(1);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Klik untuk memilih tanggal kalender"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNextDay}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all active:scale-95 shadow-2xs cursor-pointer"
                  title="Hari Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                  title="Kembali ke Hari Ini"
                >
                  Hari Ini
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-slate-400 px-2">
                Menampilkan log dari seluruh tanggal
              </span>
            )}
          </div>

          {/* Right: Host Filter Dropdown & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Host Filter Dropdown */}
            <div className="relative inline-flex items-center" ref={hostDropdownRef}>
              <div className="flex items-center bg-white border border-slate-200/90 rounded-xl shadow-2xs hover:border-slate-300 transition-all overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsHostDropdownOpen(!isHostDropdownOpen)}
                  className="min-w-[180px] max-w-[220px] px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-all cursor-pointer flex justify-between items-center text-left"
                >
                  <div className="flex items-center gap-2 truncate pr-1">
                    <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">
                      {selectedHost || "Semua Host"}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 select-none ml-1 shrink-0 transition-transform ${isHostDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {selectedHost && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHost("");
                      setCurrentPage(1);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-l border-slate-100"
                    title="Hapus filter host"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Host Dropdown Popover */}
              {isHostDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                  <div className="px-2.5 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
                      <Search className="w-3 h-3 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Cari nama host..."
                        value={hostSearchQuery}
                        onChange={(e) => setHostSearchQuery(e.target.value)}
                        className="w-full text-xs bg-transparent border-0 outline-none text-slate-700 placeholder-slate-400"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto custom-scrollbar pt-1">
                    {/* Option: Semua Host */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHost("");
                        setIsHostDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        selectedHost === ""
                          ? "bg-purple-50 text-purple-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Semua Host</span>
                      </span>
                      {selectedHost === "" && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </button>

                    {/* Options: List of Hosts */}
                    {filteredHostsForDropdown.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400 italic text-center">
                        Tidak ada host ditemukan
                      </div>
                    ) : (
                      filteredHostsForDropdown.map((h) => {
                        const isSelected = selectedHost.toLowerCase() === h.name.toLowerCase();
                        return (
                          <button
                            key={h.id || h.name}
                            type="button"
                            onClick={() => {
                              setSelectedHost(h.name);
                              setIsHostDropdownOpen(false);
                              setCurrentPage(1);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-purple-50 text-purple-700 font-bold"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate pr-2">{h.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {h.count > 0 && (
                                <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                                  {h.count}
                                </span>
                              )}
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 ml-1" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari pesan / detail..."
                className="pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 outline-none hover:border-slate-300 focus:border-purple-500 shadow-2xs w-[160px] sm:w-[190px] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Filter Pills */}
        {actionOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              Aksi:
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAction("all");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                selectedAction === "all"
                  ? "bg-purple-600 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              Semua
            </button>
            {actionOptions.map((act) => {
              const isSelected = selectedAction === act;
              return (
                <button
                  key={act}
                  type="button"
                  onClick={() => {
                    setSelectedAction(isSelected ? "all" : act);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {act}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer py-1"
              >
                <X className="w-3 h-3" />
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Menampilkan <strong className="text-slate-800 font-bold">{filteredLogs.length}</strong> log aktivitas
          {dateFilterMode === "daily" && ` pada ${formatDisplayDate(selectedDate)}`}
          {selectedHost && ` untuk host "${selectedHost}"`}
          {logs.length > 0 && ` (dari total ${logs.length})`}
        </span>
        {filteredLogs.length > pageSize && (
          <span className="text-[11px] text-slate-400">
            Halaman {safeCurrentPage} dari {totalPages}
          </span>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-14 text-center text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-xl">
          <RotateCw className="w-5 h-5 animate-spin mx-auto text-purple-600 mb-2" />
          Memuat data log aktivitas...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
          {error}
          <div className="mt-2">
            <button
              onClick={fetchLogs}
              className="px-3 py-1 bg-white text-rose-700 text-xs font-bold rounded-lg border border-rose-200 hover:bg-rose-50 cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-12 text-center text-sm font-medium text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
          <Activity className="w-7 h-7 mx-auto text-slate-300 stroke-[1.5]" />
          <div className="text-slate-700 font-semibold">Tidak ada log aktivitas yang cocok</div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {dateFilterMode === "daily"
              ? `Belum ada log aktivitas tercatat pada tanggal ${formatDisplayDate(selectedDate)}.`
              : "Tidak ada data yang sesuai dengan filter pencarian Anda."}
          </p>
          {hasActiveFilters && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors border border-purple-200 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Lihat Semua Log (All)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap block sm:table">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 hidden sm:table-header-group">
                <tr>
                  <th className="px-4 py-3 w-[190px]">Waktu</th>
                  <th className="px-4 py-3 w-[200px]">Nama Host</th>
                  <th className="px-4 py-3 w-[120px]">Aksi</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y-0 sm:divide-y divide-slate-100 block sm:table-row-group space-y-3 sm:space-y-0 p-3 sm:p-0">
                {paginatedLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    {/* DESKTOP ROW */}
                    <tr className="hidden sm:table-row hover:bg-purple-50/20 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {log.host_name ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedHost(log.host_name || "");
                              setCurrentPage(1);
                            }}
                            className="text-left font-semibold text-slate-800 hover:text-purple-600 transition-colors cursor-pointer"
                            title={`Filter log khusus host: ${log.host_name}`}
                          >
                            {log.host_name}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic font-normal">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${getActionBadgeClass(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">
                        {formatDetails(log.details)}
                      </td>
                    </tr>

                    {/* MOBILE CARD */}
                    <tr className="sm:hidden block bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs relative text-slate-700 w-full box-border">
                      <td className="block w-full">
                        {/* Header */}
                        <div className="flex justify-between items-start w-full box-border mb-2.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getActionBadgeClass(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </div>

                        {/* Name */}
                        <div className="font-bold text-slate-800 text-[14px] mb-2.5">
                          {log.host_name || <span className="text-slate-400 italic">Unknown</span>}
                        </div>

                        <div className="border-t border-dashed border-slate-200 my-2.5"></div>

                        {/* Detail Activity */}
                        <div>
                          <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                            DETAIL AKTIVITAS
                          </div>
                          <div className="text-[11px]">
                            {formatDetails(log.details)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none cursor-pointer"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>per halaman</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                >
                  Sebelumnya
                </button>
                <span className="text-xs text-slate-600 px-2 font-medium">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

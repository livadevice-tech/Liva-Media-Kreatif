/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback, FormEvent } from "react";
import { createPortal } from "react-dom";
import LandingPage from "./LandingPage";
import * as XLSX from "xlsx";
import {
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  AlertTriangle,
  Plus,
  Search,
  Download,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
  Smartphone,
  Monitor,
  Calendar,
  DollarSign,
  TrendingUp,
  Sliders,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Building,
  Radio,
  Trash2,
  Edit2,
  Edit3,
  Filter,
  UserCheck,
  FileSpreadsheet,
  LogOut,
  Bell,
  ChevronLeft,
  Menu,
  Briefcase,
  BarChart2,
  MapPin,
  Upload,
  LineChart,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Save,
  Database,
  ListFilter,
  ArrowLeft,
  History,
  Video,
  CreditCard,
  Package,
  GripVertical,
  ArrowRight,
  MoreHorizontal,
  Star,
  UserPlus
} from "lucide-react";

import { HostEmployee, AttendanceLog, ChatMessage, StudioItem, ClientBrand, ClientReporting, ClientLead } from "./types";
import {
  INITIAL_HOSTS,
  INITIAL_LOGS,
  PLATFORMS,
  BRANDS,
  SHIFTS
} from "./data";
import {
  initAuth,
  googleSignIn,
  logout as sheetsLogout,
  createNewSpreadsheet,
  syncSpreadsheetData,
  fetchSpreadsheetData
} from "./sheets";

import { DoubleDatePicker } from "./components/DoubleDatePicker";
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { syncToFirestore } from "./firestoreSync";

const getAvatarUrl = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Host")}&background=f3e8ff&color=7e22ce&bold=true`;

export function LivaLogo({ className = "h-11" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 380 130"
        className="h-full w-auto select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="livaBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b158fc" />
            <stop offset="100%" stopColor="#772bf2" />
          </linearGradient>
        </defs>
        
        {/* Rounded Purple Squircle Icon */}
        <rect x="5" y="5" width="110" height="110" rx="28" fill="url(#livaBrandGrad)" />
        
        {/* Shopping Bag / Camcorder White Silhouette */}
        {/* Handbag handle */}
        <path
          d="M 43 42 C 43 31, 77 31, 77 42" 
          stroke="white" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none"
        />
        {/* Main bag/camera rectangular body */}
        <rect x="32" y="42" width="56" height="42" rx="8" fill="white" />
        {/* Camcorder triangle lens pointing right */}
        <path d="M 85 51 Q 88 50, 99 44 Q 104 41, 104 47 L 104 79 Q 104 85, 99 82 Q 88 76, 85 75 Z" fill="white" />

        {/* Liva Branding Typo */}
        {/* Blocky capital L */}
        <path d="M 132 32 L 132 82 L 165 82" stroke="#772bf2" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Lowercase thick 'i' */}
        <path d="M 188 50 L 188 82" stroke="#772bf2" strokeWidth="15" strokeLinecap="round" />
        
        {/* Orange Broadcast/WiFi Sound Wave curves replacing the dot of the 'i' */}
        <path d="M 174 34 C 182 25, 194 25, 202 34" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M 180 42 C 184 38, 192 38, 196 42" stroke="#f97316" strokeWidth="4" strokeLinecap="round" fill="none" />
        
        {/* Lowercase thick 'v' */}
        <path d="M 215 50 L 230 82 L 245 50" stroke="#772bf2" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Lowercase thick 'a' */}
        <circle cx="282" cy="66" r="16" stroke="#772bf2" strokeWidth="13" fill="none" />
        <path d="M 298 50 L 298 82" stroke="#772bf2" strokeWidth="13" strokeLinecap="round" />

        {/* Cleaner subtitle "Attendence System" */}
        <text
          x="132"
          y="114"
          fill="#3c2f56"
          fontSize="24"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >
          Attendence System
        </text>
      </svg>
    </div>
  );
}

// --- HORIZONTAL FUNNEL COMPONENT ---
export function HorizontalFunnel({ steps, title = "Sales Funnel", subtitle = "TikTok Shop Live Performance", tag = "" }: { steps: { label: string, value: string | number }[], title?: string, subtitle?: string, tag?: string }) {
  const colors = ['#dce4f4', '#aebbef', '#83a3f0', '#5681ea', '#1c52e4'];
  const stepWidth = steps.length > 0 ? 1000 / steps.length : 1000;
  
  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans flex flex-col justify-between text-left col-span-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-sans">
            <Sparkles className="w-4 h-4 text-amber-500" /> {title}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{subtitle}</p>
        </div>
        {tag && (
          <span className="text-[9px] bg-slate-100 font-extrabold text-slate-500 px-2 py-0.5 rounded-md">
            {tag}
          </span>
        )}
      </div>
      
      <div className="flex w-full mb-6 mt-2">
        {steps.map((step, i) => (
          <div key={i} className={`flex-1 ${i !== 0 ? 'border-l border-slate-200' : ''} px-4`}>
            <div className="text-[11px] sm:text-[13px] text-slate-500 mb-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{step.label}</div>
            <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">{step.value}</div>
          </div>
        ))}
      </div>
      
      <div className="w-full h-[80px] sm:h-[110px] relative -mt-2">
        <svg viewBox="0 0 1000 130" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <clipPath id={`funnel-inner-clip-${title.replace(/[^a-zA-Z0-9]/g, '')}`}>
              <path d="M 0,20 Q 300,35 1000,42 L 1000,88 Q 300,95 0,110 Z" />
            </clipPath>
          </defs>
          
          {/* Outer halo background */}
          <path d="M 0,0 Q 300,25 1000,35 L 1000,95 Q 300,105 0,130 Z" fill="#e9effc" opacity="0.6"/>
          
          <g clipPath={`url(#funnel-inner-clip-${title.replace(/[^a-zA-Z0-9]/g, '')})`}>
            {steps.map((_, i) => (
              <rect 
                key={i} 
                x={i * stepWidth} 
                y="0" 
                width={stepWidth + 1} // +1 to prevent rendering gaps
                height="130" 
                fill={colors[i % colors.length]} 
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
// --- END HORIZONTAL FUNNEL COMPONENT ---

export default function App() {
  const initPath = window.location.pathname;
  const initRoleMatch = initPath.match(/\/login\/(admin|host|brand)/);
  const isLandingPageInit = initPath === "/" || initPath === "";
  
  const [showLandingPage, setShowLandingPage] = useState<boolean>(isLandingPageInit);

  const formatDateYYYYMMDD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getDaysInMonthGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month - 1, 1);
    let firstDayOfWeek = firstDay.getDay(); 
    // Convert Sun-Sat to Mon-Sun (Mon is 0, Sun is 6)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const grid: Date[] = [];

    // Prior month days
    const prevMonthEnd = new Date(year, month - 1, 0);
    const prevMonthDaysCount = prevMonthEnd.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      grid.push(new Date(year, month - 2, prevMonthDaysCount - i));
    }

    // Current month days
    const currMonthEnd = new Date(year, month, 0);
    const currMonthDaysCount = currMonthEnd.getDate();
    for (let i = 1; i <= currMonthDaysCount; i++) {
      grid.push(new Date(year, month - 1, i));
    }

    // Next month days to fill grid (42 days)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push(new Date(year, month, i));
    }

    return grid;
  };

  const formatHumanDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const monthNames = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
    // Let's use standard English month names in proper ordering
    const correctedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${correctedMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const getPresetDates = (preset: "all" | "last7" | "last28" | "calendarDay" | "week" | "month" | "custom") => {
    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (preset === "last7") {
      end.setDate(today.getDate() - 1);
      start.setDate(today.getDate() - 7);
    } else if (preset === "last28") {
      end.setDate(today.getDate() - 1);
      start.setDate(today.getDate() - 28);
    } else if (preset === "calendarDay") {
      start = new Date(today);
      end = new Date(today);
    } else if (preset === "week") {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (preset === "month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (preset === "all") {
      return { start: "", end: "" };
    }

    return {
      start: formatDateYYYYMMDD(start),
      end: formatDateYYYYMMDD(end)
    };
  };

  // Dynamic Platforms, Brands, and Shifts lists which can be customized
  const [platforms, setPlatforms] = useState<string[]>(() => {
    const saved = localStorage.getItem("mcn_platforms");
    return saved ? JSON.parse(saved) : PLATFORMS;
  });

  // Checkbox selection states matching the UI Reference
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [uploadBrand, setUploadBrand] = useState<string>("");
  const [uploadPlatform, setUploadPlatform] = useState<string>("Tiktok");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("mcn_upload_history");
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem("mcn_upload_history", JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  const [brandReports, setBrandReports] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem("mcn_brand_reports");
    return saved ? JSON.parse(saved) : {};
  });
  useEffect(() => {
    localStorage.setItem("mcn_brand_reports", JSON.stringify(brandReports));
  }, [brandReports]);

  const [activeReportPlatform, setActiveReportPlatform] = useState<string>("Tiktok");
  const [activeReportTab, setActiveReportTab] = useState<"ringkasan" | "data_harian" | "data_mingguan" | "data_bulanan" | "history_upload">("ringkasan");
  const [reportSortKey, setReportSortKey] = useState<string>("name");
  const [reportSortDir, setReportSortDir] = useState<"desc" | "asc">("desc");
  const [editingReportIdx, setEditingReportIdx] = useState<string | null>(null);
  const [editingReportForm, setEditingReportForm] = useState<any>({});
  
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [mappingHeaders, setMappingHeaders] = useState<string[]>([]);
  const [mappingRawData, setMappingRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: "",
    gmv: "",
    items_sold: "",
    orders: "",
    views: "",
    viewers: "",
    impressions: "",
    ctr: "",
    ctor: ""
  });

  const [dbStatusFilter, setDbStatusFilter] = useState<"All" | "Present" | "Late" | "Absent" | "Excused">("All");
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isGoogleSheetsImportModalOpen, setIsGoogleSheetsImportModalOpen] = useState<boolean>(false);
  const [importSpreadsheetUrl, setImportSpreadsheetUrl] = useState<string>("");

  const [isDeleteByDateModalOpen, setIsDeleteByDateModalOpen] = useState(false);
  const [deleteByDateStart, setDeleteByDateStart] = useState("");
  const [deleteByDateEnd, setDeleteByDateEnd] = useState("");

  const [confirmState, setConfirmState] = useState<{message: string, onConfirm: () => void} | null>(null);
  const [alertState, setAlertState] = useState<{message: string} | null>(null);

  const customConfirm = (message: string, onConfirm: () => void) => {
      setConfirmState({ message, onConfirm });
  };
  const customAlert = (message: string) => {
      setAlertState({ message });
  };

  const [brands, setBrands] = useState<string[]>(() => {
    const saved = localStorage.getItem("mcn_brands");
    return saved ? JSON.parse(saved) : BRANDS;
  });

  const [shifts, setShifts] = useState<string[]>(() => {
    const saved = localStorage.getItem("mcn_shifts");
    return saved ? JSON.parse(saved) : SHIFTS;
  });

  const [studios, setStudios] = useState<StudioItem[]>(() => {
    const saved = localStorage.getItem("mcn_studios");
    return saved ? JSON.parse(saved) : [
      { id: "std_1", name: "Studio Bandar Lampung", location: "Bandar Lampung" },
      { id: "std_2", name: "Studio Tanggamus", location: "Tanggamus" },
      { id: "std_3", name: "Studio 01", location: "Bandar Lampung" },
      { id: "std_4", name: "Studio 02", location: "Tanggamus" }
    ];
  });

  // Save Platforms, Brands, and Shifts back to localStorage
  useEffect(() => {
    localStorage.setItem("mcn_platforms", JSON.stringify(platforms));
  }, [platforms]);

  useEffect(() => {
    localStorage.setItem("mcn_brands", JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    localStorage.setItem("mcn_shifts", JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem("mcn_studios", JSON.stringify(studios));
  }, [studios]);

  // --- DATABASE & STATE PERSISTENCE ---
  const [hosts, _setHosts] = useState<HostEmployee[]>(() => { try { return JSON.parse(localStorage.getItem("mcn_hosts") || "[]") } catch { return [] } });
  const [logs, _setLogs] = useState<AttendanceLog[]>(() => { try { return JSON.parse(localStorage.getItem("mcn_logs") || "[]") } catch { return [] } });
  const [clientBrands, _setClientBrands] = useState<ClientBrand[]>(() => { try { return JSON.parse(localStorage.getItem("mcn_client_brands") || "[]") } catch { return [] } });
  const [clientLeads, _setClientLeads] = useState<ClientLead[]>(() => { try { return JSON.parse(localStorage.getItem("mcn_client_leads") || "[]") } catch { return [] } });

  // Recover missing history if feature is newly added OR fix badly recovered names
  useEffect(() => {
    let historyChanged = false;
    let newHistory = [...uploadHistory];

    // 1. Recover if empty
    if (newHistory.length === 0 && Object.keys(brandReports).length > 0 && clientBrands.length > 0) {
       Object.entries(brandReports).forEach(([brandId, records]) => {
           const brand = clientBrands.find(b => b.id === brandId)?.name || brandId;
           // Group by platform so we can show one entry per platform
           const platforms = Array.from(new Set((records as any[]).map(r => r.platform || "Tiktok")));
           platforms.forEach(plat => {
               const platRecords = (records as any[]).filter(r => (r.platform || "Tiktok") === plat);
               if (platRecords.length > 0) {
                   newHistory.push({
                      id: `recovered-${Date.now()}-${brandId}-${plat}`,
                      brand: brand,
                      platform: plat,
                      filename: "Data Sebelumnya (Recovered)",
                      date: new Date().toISOString(),
                      rowsAdded: platRecords.length
                   });
                   historyChanged = true;
               }
           });
       });
    }

    // 2. Fix nicely any badly recovered brand names (where brand was saved as UUID instead of name)
    if (newHistory.length > 0 && clientBrands.length > 0) {
        newHistory = newHistory.map(h => {
             if (h.id?.toString().startsWith("recovered-")) {
                 const matchingBrand = clientBrands.find(b => b.id === h.brand);
                 if (matchingBrand) {
                     historyChanged = true;
                     return { ...h, brand: matchingBrand.name };
                 }
             }
             return h;
        });
    }

    if (historyChanged) {
        setUploadHistory(newHistory);
    }
  }, [brandReports, uploadHistory.length, clientBrands]);
  
  useEffect(() => {
    let unsubs: any[] = [];
    unsubs.push(onSnapshot(collection(db, "hosts"), (snap) => {
      const data = snap.docs.map(d => d.data() as HostEmployee);
      _setHosts(data);
    }, (err) => {
      console.error("Firestore hosts err:", err);
      customAlert("Gagal terhubung ke database hosts: " + err.message);
    }));
    unsubs.push(onSnapshot(collection(db, "logs"), (snap) => {
      _setLogs(snap.docs.map(d => d.data() as AttendanceLog));
    }, (err) => console.error("Firestore logs err:", err)));
    unsubs.push(onSnapshot(collection(db, "client_brands"), (snap) => {
      _setClientBrands(snap.docs.map(d => d.data() as ClientBrand));
    }, (err) => console.error("Firestore brands err:", err)));
    unsubs.push(onSnapshot(collection(db, "client_leads"), (snap) => {
      _setClientLeads(snap.docs.map(d => d.data() as ClientLead));
    }, (err) => console.error("Firestore leads err:", err)));
    unsubs.push(onSnapshot(collection(db, "brand_performance_logs"), (snap) => {
      setBrandPerformanceLogs(snap.docs.map(d => d.data()));
      setIsLogsLoading(false);
    }, (err) => {
      console.error("Firestore brand_performance_logs err:", err);
      setIsLogsLoading(false);
    }));
    unsubs.push(onSnapshot(collection(db, "brand_upload_history"), (snap) => {
      setBrandUploadHistory(snap.docs.map(d => d.data()));
    }, (err) => console.error("Firestore brand_upload_history err:", err)));
    return () => {
      unsubs.forEach(u => u());
    };
  }, []);

  const setHosts = useCallback((action: any) => {
    _setHosts(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("mcn_hosts", JSON.stringify(next));
      syncToFirestore("hosts", prev, next);
      return next;
    });
  }, []);

  const setLogs = useCallback((action: any) => {
    _setLogs(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("mcn_logs", JSON.stringify(next));
      syncToFirestore("logs", prev, next);
      return next;
    });
  }, []);

  const setClientBrands = useCallback((action: any) => {
    _setClientBrands(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("mcn_client_brands", JSON.stringify(next));
      syncToFirestore("client_brands", prev, next);
      return next;
    });
  }, []);

  const setClientLeads = useCallback((action: any) => {
    _setClientLeads(prev => {
      const next = typeof action === "function" ? action(prev) : action;
      localStorage.setItem("mcn_client_leads", JSON.stringify(next));
      syncToFirestore("client_leads", prev, next);
      return next;
    });
  }, []);
  
  useEffect(() => {
    localStorage.setItem("mcn_client_leads", JSON.stringify(clientLeads));
  }, [clientLeads]);

  // Modal States
  const [brandFormEditor, setBrandFormEditor] = useState<Partial<ClientBrand> | null>(null);
  const [reportFormModal, setReportFormModal] = useState<{isOpen: boolean, data: Partial<ClientReporting>}>({isOpen: false, data: {}});
  const [leadFormModal, setLeadFormModal] = useState<{isOpen: boolean, data: Partial<ClientLead>}>({isOpen: false, data: {}});

  // --- SCHEDULES SYSTEM FOR HOST WORKING CALENDAR ---
  const [schedules, setSchedules] = useState<any[]>(() => {
    const saved = localStorage.getItem("mcn_schedules_v3");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("mcn_schedules_v3", JSON.stringify(schedules));
  }, [schedules]);

  // --- ACCESS ROLE STATE ---
  // Default to "host" to prioritize testing their submission, "operator", or "client"
  const defaultRole = initRoleMatch ? (initRoleMatch[1] === "admin" ? "operator" : initRoleMatch[1] === "brand" ? "client" : "host") : "host";
  const [activeRole, setActiveRole] = useState<"host" | "operator" | "client">(defaultRole);
  
  // Client portal session & inputs
  const [loggedInClientBrandId, setLoggedInClientBrandId] = useState<string | null>(() => {
    return localStorage.getItem("mcn_logged_in_client_brand_id") || null;
  });
  const [clientLoginBrandId, setClientLoginBrandId] = useState<string>("");
  const [clientLoginUsername, setClientLoginUsername] = useState<string>("");
  const [clientLoginPass, setClientLoginPass] = useState<string>("");
  const [brandPerformanceLogs, setBrandPerformanceLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);
  const [brandUploadHistory, setBrandUploadHistory] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [clientDateFilterType, setClientDateFilterType] = useState<"all" | "month" | "weekly" | "custom">("all");
  const [clientCustomStartDate, setClientCustomStartDate] = useState("");
  const [clientCustomEndDate, setClientCustomEndDate] = useState("");
  const [clientPlatformFilter, setClientPlatformFilter] = useState("");
  const [operatorDateFilterType, setOperatorDateFilterType] = useState<"all" | "month" | "custom">("all");
  const [operatorCustomStartDate, setOperatorCustomStartDate] = useState("");
  const [operatorCustomEndDate, setOperatorCustomEndDate] = useState("");
  const [operatorSelectedMonth, setOperatorSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isOperatorMonthOpen, setIsOperatorMonthOpen] = useState(false);
  const [operatorCalendarYear, setOperatorCalendarYear] = useState<number>(() => new Date().getFullYear());
  const [operatorCalendarMonth, setOperatorCalendarMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [isOperatorCalendarOpen, setIsOperatorCalendarOpen] = useState(false);
  const [operatorTempStartDate, setOperatorTempStartDate] = useState("");
  const [operatorTempEndDate, setOperatorTempEndDate] = useState("");
  const [hoveredCalendarDate, setHoveredCalendarDate] = useState("");
  const [trendFilters, setTrendFilters] = useState({ gmv: true, views: true });

  const getIndonesianMonthLabel = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthLabel = monthNames[parseInt(month) - 1] || "";
    return monthLabel;
  };

  const getOperatorDateDescription = () => {
    if (operatorDateFilterType === "all") {
      return "Menampilkan semua data tanpa batasan waktu (Semua Periode)";
    }
    
    const startStr = formatHumanDate(operatorCustomStartDate);
    const endStr = formatHumanDate(operatorCustomEndDate);
    
    let label = "";
    if (operatorDateFilterType === "month") {
      label = `Periode Bulan ${getIndonesianMonthLabel(operatorSelectedMonth)}`;
    } else if (operatorDateFilterType === "custom") {
      label = "Rentang Kustom";
    }

    if (startStr === endStr) {
      return `${label}: ${startStr}`;
    }
    return `${label}: ${startStr} hingga ${endStr}`;
  };

  useEffect(() => {
    if (operatorDateFilterType === "month") {
      const [yearStr, monthStr] = operatorSelectedMonth.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      setOperatorCustomStartDate(formatDateYYYYMMDD(firstDay));
      setOperatorCustomEndDate(formatDateYYYYMMDD(lastDay));
    } else if (operatorDateFilterType === "all") {
      setOperatorCustomStartDate("");
      setOperatorCustomEndDate("");
    }
  }, [operatorDateFilterType, operatorSelectedMonth]);

  useEffect(() => {
    if (loggedInClientBrandId) {
      localStorage.setItem("mcn_logged_in_client_brand_id", loggedInClientBrandId);
    } else {
      localStorage.removeItem("mcn_logged_in_client_brand_id");
    }
  }, [loggedInClientBrandId]);
  
  // Custom states for Selected Host (Perspective of the logged-in Host)
  const [selectedHostId, setSelectedHostId] = useState<string>(() => {
    return hosts[0]?.id || "";
  });

  const [hostActiveSubTab, setHostActiveSubTab] = useState<"form" | "history" | "calendar">("form");

  // Host credentials & login sessions
  const [loggedInHostId, setLoggedInHostId] = useState<string | null>(() => {
    return localStorage.getItem("mcn_logged_in_host_id") || null;
  });

  useEffect(() => {
    if (loggedInHostId) {
      localStorage.setItem("mcn_logged_in_host_id", loggedInHostId);
    } else {
      localStorage.removeItem("mcn_logged_in_host_id");
    }
  }, [loggedInHostId]);

  // When host logs in, set selectedHostId to that host's ID to lock their perspective
  useEffect(() => {
    if (loggedInHostId) {
      setSelectedHostId(loggedInHostId);
    }
  }, [loggedInHostId]);

  // Temp form input states for Host Login
  const [hostLoginUser, setHostLoginUser] = useState("");
  const [hostLoginPass, setHostLoginPass] = useState("");
  const [hostError, setHostError] = useState("");

  // Admin credentials & login session
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem("mcn_admin_credentials");
    return saved ? JSON.parse(saved) : { username: "admin", password: "123" };
  });

  useEffect(() => {
    localStorage.setItem("mcn_admin_credentials", JSON.stringify(adminCredentials));
  }, [adminCredentials]);

  const [isOperatorLoggedIn, setIsOperatorLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("mcn_is_operator_logged_in") === "true";
  });

  useEffect(() => {
    localStorage.setItem("mcn_is_operator_logged_in", isOperatorLoggedIn ? "true" : "false");
  }, [isOperatorLoggedIn]);

  // Temp form input states for Operator Login
  const [opLoginUser, setOpLoginUser] = useState("");
  const [opLoginPass, setOpLoginPass] = useState("");
  const [opError, setOpError] = useState("");

  // Toast status notifier for host credentials adjustments
  const [credentialsToast, setCredentialsToast] = useState("");

  // States for Adding New Host
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHostName, setNewHostName] = useState("");
  const [newHostRole, setNewHostRole] = useState("Reguler Host");
  const [newHostStudio, setNewHostStudio] = useState("Studio Bandar Lampung");
  const [newHostPhone, setNewHostPhone] = useState("");
  const [newHostBank, setNewHostBank] = useState("");
  const [newHostUser, setNewHostUser] = useState("");
  const [newHostPass, setNewHostPass] = useState("");
  const [newHostWorkingDaysTarget, setNewHostWorkingDaysTarget] = useState<number>(26);

  const handleUpdateHost = (hostId: string, updatedFields: Partial<HostEmployee>) => {
    setHosts(prev => prev.map(h => {
      if (h.id === hostId) {
        return { ...h, ...updatedFields };
      }
      return h;
    }));
    setCredentialsToast("Data host berhasil diperbarui di database!");
    setTimeout(() => {
      setCredentialsToast("");
    }, 4000);
  };

  const handleAvatarUpload = (hostId: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 200;
        let w = img.width;
        let h = img.height;
        if (w > MAX_SIZE || h > MAX_SIZE) {
          if (w > h) { h *= MAX_SIZE / w; w = MAX_SIZE; }
          else { w *= MAX_SIZE / h; h = MAX_SIZE; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        handleUpdateHost(hostId, { avatar: dataUrl });
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHost = (newHostData: {
    name: string;
    role: string;
    phone: string;
    bankAccount: string;
    studio?: string;
    username?: string;
    password?: string;
    customWorkingDaysTarget?: number;
  }) => {
    const nextIdNum = hosts.length > 0 ? Math.max(...hosts.map(h => {
      const parsed = parseInt(h.id.replace("h", ""));
      return isNaN(parsed) ? 0 : parsed;
    })) + 1 : 1;
    const id = `h${nextIdNum}`;
    const employeeId = `EMP-26-${String(nextIdNum).padStart(3, "0")}`;
    const joinedDate = new Date().toISOString().split("T")[0];

    const newHost: HostEmployee = {
      id,
      employeeId,
      name: newHostData.name,
      avatar: getAvatarUrl(newHostData.name),
      role: newHostData.role,
      hostType: newHostData.role.toLowerCase().includes("back up") ? "Backup" : "Reguler",
      studio: newHostData.studio || "Studio Bandar Lampung",
      phone: newHostData.phone || "+62 812-0000-0000",
      bankAccount: newHostData.bankAccount || "-",
      username: (newHostData.username || newHostData.name.toLowerCase().replace(/\s+/g, "")).trim(),
      password: (newHostData.password || "liva123").trim(),
      platforms: ["TikTok Live", "Shopee Live"],
      brands: ["Wardah", "Somethinc"],
      baseMonthlyTargetHours: 80,
      baseMonthlyTargetRevenue: 120000000,
      consistencyScore: 100,
      joinedDate,
      email: `${(newHostData.username || newHostData.name.toLowerCase().replace(/\s+/g, "")).trim()}@livamedia.com`,
      customWorkingDaysTarget: newHostData.customWorkingDaysTarget
    };

    setHosts(prev => [...prev, newHost]);
    setCredentialsToast(`Host "${newHost.name}" berhasil didaftarkan ke sistem!`);
    setTimeout(() => {
      setCredentialsToast("");
    }, 4000);
  };

  const handleDeleteHost = (hostId: string) => {
    if (hosts.length <= 1) {
      setCredentialsToast("Gagal! Harus ada minimal 1 Host di sistem.");
      setTimeout(() => setCredentialsToast(""), 4000);
      return;
    }
    const hostToDelete = hosts.find(h => h.id === hostId);
    setHosts(prev => prev.filter(h => h.id !== hostId));
    setCredentialsToast(`Host "${hostToDelete?.name || hostId}" berhasil dihapus.`);
    setTimeout(() => {
      setCredentialsToast("");
    }, 4000);
    
    // Safety check: if host logged in, logout
    if (loggedInHostId === hostId) {
      setLoggedInHostId(null);
    }
  };

  // Current logged in host details
  const activeHostObj = useMemo(() => {
    return hosts.find(h => h.id === selectedHostId) || hosts[0];
  }, [hosts, selectedHostId]);

  // --- TIME DISPLAY & TICKER ---
  const [liveTime, setLiveTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedLiveDate = liveTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const formattedLiveTime = liveTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // --- HOST FUNCTIONALITIES & FORM STATE ---
  const [hostForm, setHostForm] = useState(() => ({
    brand: brands[0] || "Wardah",
    platform: platforms[0] || "TikTok Live",
    shift: shifts[0] || "Shift 1 (05.00 - 11.00)",
    studio: studios[0]?.name || "Studio Bandar Lampung"
  }));

  const [showFormSuccess, setShowFormSuccess] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  const handleHostAttendanceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeHostObj) return;

    const todayDateStr = new Date().toISOString().split("T")[0];
    const currentTimeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    // Determine attendance status automatically
    const status = "Present";
    
    // Auto calculate random metrics for streaming session metrics (orders, conversion, revenue)
    const randomOrders = Math.floor(Math.random() * 250) + 80;
    const randomConversion = parseFloat((Math.random() * 3 + 2.5).toFixed(2)); // 2.5% to 5.5%
    const randomEngagement = parseFloat((Math.random() * 5 + 6.0).toFixed(2)); // 6% to 11%
    const randomRevenue = randomOrders * (Math.floor(Math.random() * 50000) + 40000); // ~IDR 6M - 15M

    const newLog: AttendanceLog = {
      id: `log_auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      hostId: activeHostObj.id,
      hostName: activeHostObj.name,
      employeeId: activeHostObj.employeeId,
      date: todayDateStr,
      shiftHours: hostForm.shift,
      platform: hostForm.platform,
      brandHandled: hostForm.brand,
      studio: hostForm.studio,
      liveDuration: 4.0, // standard stream is 4 hours
      sessionCount: 1,
      status: status,
      revenueGenerated: randomRevenue,
      conversionRate: randomConversion,
      engagementRate: randomEngagement,
      orders: randomOrders
    };

    setLogs(prev => [newLog, ...prev]);
    addNotification(
      `⏰ Absensi Streamer: ${newLog.hostName}`,
      `Host "${newLog.hostName}" melakukan absen siaran di "${newLog.studio}" untuk brand "${newLog.brandHandled}" (${status === "Present" ? "Tepat Waktu" : "Terlambat"}).`,
      status === "Present" ? "success" : "warning",
      "database"
    );
    setShowFormSuccess(true);
    setSubmittedMessage(`Absen Berhasil disubmit! Diinput otomatis pada jam ${currentTimeStr} (${status === "Present" ? "Tepat Waktu" : "Terlambat"})`);
    
    // Auto reset notification
    setTimeout(() => {
      setShowFormSuccess(false);
    }, 5000);
  };

  // (Host personal analytics states relocated after salarySettings declaration to prevent block-scoped reference error)


  // --- OPERATOR SYSTEM CONSTANTS & SALARY RECAP ---
  const [operatorTab, setOperatorTab] = useState<
    "dashboard_utama" | "absensi" | "rekap_gaji" | "database" | "sheets" | "credentials" | "settings" | "data_brand" | "reporting_brand" | "leads" | "copilot" | "admin_privacy"
  >("dashboard_utama");
  const [activeReportBrandId, setActiveReportBrandId] = useState<string | null>(null);
  const [reportBrandSearchQuery, setReportBrandSearchQuery] = useState("");
  const [reportDbSearchQuery, setReportDbSearchQuery] = useState("");
  const [reportDbSortCol, setReportDbSortCol] = useState("date");
  const [reportDbSortAsc, setReportDbSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [operatorDateFilterType, reportDbSearchQuery, operatorCustomStartDate, operatorCustomEndDate, activeReportBrandId]);

  const [dayAnalyticsSortCol, setDayAnalyticsSortCol] = useState<"name" | "gmv" | "views">("gmv");
  const [dayAnalyticsSortAsc, setDayAnalyticsSortAsc] = useState(false);
  
  // --- NOTIFICATION ENGINE ---
  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem("mcn_notifications_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    // Rich, context-perfect sample notifications on first load
    return [
      {
        id: "notif-init-welcome",
        title: "Selamat Datang di Workspace!",
        description: "Gunakan panel notifikasi ini untuk memantau performa streaming, absensi host, upload data raw brand, dan follow-up leads.",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        read: false,
        actionTab: "dashboard_utama"
      },
      {
        id: "notif-init-lead",
        title: "⚠️ Leads Calon Klien Baru",
        description: "Ada prospek leads masuk dari \"Eiger Adventure Official\". Silakan periksa detailnya di tab Leads & Calon Klien.",
        type: "warning",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
        read: false,
        actionTab: "leads"
      },
      {
        id: "notif-init-upload",
        title: "📊 Impor Raw Data Berhasil",
        description: "Laporan TikTok Live untuk brand \"Skintific\" berhasil diunggah (30 sesi streaming berhasil direkam ke database).",
        type: "info",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        read: true,
        actionTab: "reporting_brand"
      },
      {
        id: "notif-init-sheets",
        title: "🔌 Sinkronisasi Google Sheets Berhasil",
        description: "Semua log kehadiran dan rekapitulasi performa terbaru berhasil disinkronkan tepat waktu dengan tautan Google Sheet eksternal.",
        type: "success",
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6 hours ago
        read: true,
        actionTab: "sheets"
      }
    ];
  });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const addNotification = useCallback((
    title: string, 
    description: string, 
    type: "success" | "info" | "warning" | "danger" | "error", 
    actionTab?: string
  ) => {
    setNotifications(prev => {
      const updated = [
        {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title,
          description,
          type,
          timestamp: new Date().toISOString(),
          read: false,
          actionTab
        },
        ...prev
      ].slice(0, 40); // cap at 40 entries
      localStorage.setItem("mcn_notifications_v1", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("mcn_notifications_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem("mcn_notifications_v1", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("mcn_notifications_v1", JSON.stringify([]));
  };

  const [reportingRawData, setReportingRawData] = useState<any[]>([]);
  const [isDragOverReporting, setIsDragOverReporting] = useState(false);
  const [saveTargetBrandId, setSaveTargetBrandId] = useState("");
  const [saveTargetPlatform, setSaveTargetPlatform] = useState("TikTok Live");
  const [adminReportBrandFilter, setAdminReportBrandFilter] = useState("");
  const [autoDetectNotice, setAutoDetectNotice] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);

  const handleDeletePerformanceLog = async (id: string, brandName: string, date: string) => {
    requestConfirm(
      "Hapus Data Live Stream",
      `Apakah Anda yakin ingin menghapus catatan live stream brand ${brandName} tanggal ${date}?`,
      async () => {
        try {
          await deleteDoc(doc(db, "brand_performance_logs", id));
          customAlert("Data live stream berhasil dihapus dari database!");
        } catch (err: any) {
          console.error("Gagal menghapus:", err);
          customAlert("Error: " + err.message);
        }
      },
      "danger"
    );
  };

  const handleUploadReportingRaw = (file: File) => {
    setAutoDetectNotice("");
    setUploadedFileName(file.name);
    const fileNameLower = file.name.toLowerCase();

    // 1. Auto-detect platform from filename
    let detectedPlatform = "";
    if (fileNameLower.includes("tiktok")) {
      detectedPlatform = "TikTok Live";
    } else if (fileNameLower.includes("shopee")) {
      detectedPlatform = "Shopee Live";
    } else if (fileNameLower.includes("tokopedia") || fileNameLower.includes("tokoped")) {
      detectedPlatform = "Tokopedia";
    } else if (fileNameLower.includes("lazada") || fileNameLower.includes("laz")) {
      detectedPlatform = "Lazada";
    }

    // 2. Auto-detect brand from filename
    let detectedBrandObj = null;
    for (const b of clientBrands) {
      const brandNameClean = b.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      // Direct clean substring
      if (fileNameLower.includes(brandNameClean)) {
        detectedBrandObj = b;
        break;
      }
      // Word by word matching for longer names
      const words = b.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      if (words.some(word => fileNameLower.includes(word))) {
        detectedBrandObj = b;
        break;
      }
    }

    if (detectedPlatform) {
      setSaveTargetPlatform(detectedPlatform);
    }
    if (detectedBrandObj) {
      setSaveTargetBrandId(detectedBrandObj.id);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];

        if (jsonData.length < 2) {
          alert("File kosong atau format salah.");
          return;
        }

        // Find headers row and map columns
        let headerRowIdx = -1;
        for (let r = 0; r < Math.min(jsonData.length, 10); r++) {
          const row = jsonData[r];
          if (row && row.some(cell => typeof cell === 'string' && (cell.toLowerCase().includes('streaming') || cell.toLowerCase().includes('mulai') || cell.toLowerCase().includes('gmv')))) {
            headerRowIdx = r;
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0; // fallback to first row
        }

        const headers = (jsonData[headerRowIdx] as any[]).map(h => String(h || '').trim().toLowerCase());

        // Help detect platform from columns if not detected yet
        if (!detectedPlatform) {
          if (headers.some(h => h.includes("tiktok") || h.includes("live room") || h.includes("anchor") || h.includes("uid"))) {
            detectedPlatform = "TikTok Live";
            setSaveTargetPlatform(detectedPlatform);
          } else if (headers.some(h => h.includes("shopee") || h.includes("username pembeli") || h.includes("live id") || h.includes("nama produk"))) {
            detectedPlatform = "Shopee Live";
            setSaveTargetPlatform(detectedPlatform);
          }
        }

        // Prepare info banner
        const parts = [];
        if (detectedBrandObj) parts.push(`Klien: ${detectedBrandObj.name}`);
        if (detectedPlatform) parts.push(`Platform: ${detectedPlatform}`);
        
        if (parts.length > 0) {
          setAutoDetectNotice(`💡 Auto-detection Pintar: Berhasil mendeteksi ${parts.join(" & ")} dari nama file/kolom (${file.name})!`);
        } else {
          setAutoDetectNotice(`📝 File "${file.name}" berhasil dibaca. Silakan pilih Brand & Platform secara manual.`);
        }

        // Helper to find indices
        const findColIdx = (aliases: string[]) => {
          // 1st pass: exact match
          let idx = headers.findIndex(h => aliases.some(alias => h === alias));
          if (idx !== -1) return idx;
          // 2nd pass: partial string match
          return headers.findIndex(h => aliases.some(alias => h.includes(alias)));
        };

        const titleIdx = findColIdx(['streaming', 'judul', 'live', 'nama_brand', 'brand']);
        const startIdx = findColIdx(['waktu', 'mulai', 'start', 'tanggal', 'date']);
        const durationIdx = findColIdx(['durasi', 'duration', 'lama', 'waktu streaming']);
        const gmvIdx = findColIdx(['attributed gmv', 'gmv', 'perolehan', 'omset', 'revenue']);
        const productIdx = findColIdx(['attributed items sold', 'produk', 'product', 'terjual', 'item', 'items']);
        const buyerIdx = findColIdx(['customers', 'customer', 'pembeli', 'buyer', 'pelanggan']);
        const aovIdx = findColIdx(['avg. price', 'aov', 'rata-rata', 'order value']);
        const impressionsIdx = findColIdx(['live impressions', 'impression', 'tayangan', 'penonton', 'visitor', 'traffic', 'pemirsa', 'exposure']);
        const liveVisitsIdx = findColIdx(['live visits', 'views', 'viewers', 'view', 'kunjungan live']);
        const productImpressionsIdx = findColIdx(['product views', 'product impression', 'tayangan produk']);
        const clicksIdx = findColIdx(['product clicks', 'clicks', 'click', 'klik', 'kunjungan', 'detail', 'buka']);
        const ordersIdx = findColIdx(['attributed sku orders', 'orders', 'created', 'add to cart', 'keranjang', 'buat pesanan', 'order created', 'pesanan dibuat']);
        const followersIdx = findColIdx(['new followers', 'pengikut', 'follower', 'followers', 'fans']);
        const likesIdx = findColIdx(['likes', 'suka', 'like', 'love']);
        const sharesIdx = findColIdx(['shares', 'share', 'bagikan', 'sebar']);
        const commentsIdx = findColIdx(['comments', 'komen', 'comment', 'komentar']);

        const parseIndonesianNumber = (val: any): number => {
          if (val === undefined || val === null || val === '-' || val === '') return 0;
          if (typeof val === 'number') return val;
          
          let str = String(val).replace(/rp/gi, '').replace(/\s/g, '').trim().toLowerCase();
          
          // handle metric suffixes
          let multiplier = 1;
          if (str.endsWith('k') || str.endsWith('rb') || str.endsWith('ribu')) {
            multiplier = 1000;
            str = str.replace(/(k|rb|ribu)$/, '');
          } else if (str.endsWith('m') || str.endsWith('jt') || str.endsWith('juta')) {
            multiplier = 1000000;
            str = str.replace(/(m|jt|juta)$/, '');
          } else if (str.endsWith('b') || str.endsWith('miliar')) {
            multiplier = 1000000000;
            str = str.replace(/(b|miliar)$/, '');
          }
          
          const isNegative = str.includes('-');
          
          if (str.includes('.') && str.includes(',')) {
            const lastComma = str.lastIndexOf(',');
            const lastDot = str.lastIndexOf('.');
            if (lastComma > lastDot) {
              str = str.replace(/\./g, '').replace(',', '.');
            } else {
              str = str.replace(/,/g, '');
            }
          } else if (str.includes(',')) {
            if (str.indexOf(',') !== str.lastIndexOf(',')) {
              str = str.replace(/,/g, '');
            } else {
              if (/,\d{3}$/.test(str)) {
                str = str.replace(/,/g, '');
              } else {
                str = str.replace(',', '.');
              }
            }
          } else if (str.includes('.')) {
            if (str.indexOf('.') !== str.lastIndexOf('.')) {
              str = str.replace(/\./g, '');
            } else {
              if (/\.\d{3}$/.test(str)) {
                str = str.replace(/\./g, '');
              }
            }
          }
          
          str = str.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(str) * (isNegative ? -1 : 1);
          return (isNaN(parsed) ? 0 : parsed) * multiplier;
        };

        const rows: any[] = [];
        for (let r = headerRowIdx + 1; r < jsonData.length; r++) {
          const rowData = jsonData[r] as any[];
          // Skip completely empty rows
          if (!rowData || rowData.length === 0) continue;
          
          const titleRaw = titleIdx !== -1 ? String(rowData[titleIdx] || '') : String(rowData[0] || '');
          // Identify "Total" or summary rows which shouldn't be counted as individual streams
          if (titleRaw.toLowerCase() === 'total' || titleRaw.toLowerCase().includes('ringkasan') || titleRaw.toLowerCase() === 'summary') {
             continue; // Skip total aggregated row from export files
          }
          if (titleIdx !== -1 && !rowData[titleIdx]) continue; // Skip if title column is mapped but it's empty
          
          const title = titleRaw || `Stream ${r}`;
          const rawStart = rowData[startIdx !== -1 ? startIdx : 0];
          
          let formattedDate = '';
          let shift = "Shift Lainnya";
          if (rawStart) {
            if (typeof rawStart === 'number') {
              const dateObj = XLSX.SSF.parse_date_code(rawStart);
              const y = dateObj.y;
              const m = String(dateObj.m).padStart(2, '0');
              const d = String(dateObj.d).padStart(2, '0');
              const hh = String(dateObj.H).padStart(2, '0');
              const mm = String(dateObj.M).padStart(2, '0');
              formattedDate = `${y}-${m}-${d} ${hh}:${mm}`;
              
              const hour = parseInt(hh, 10);
              if (hour >= 6 && hour < 14) shift = "Shift 1";
              else if (hour >= 14 && hour < 22) shift = "Shift 2";
              else shift = "Shift 3";
            } else {
              formattedDate = String(rawStart).trim();
              
              // Normalize DD/MM/YYYY or DD-MM-YYYY to YYYY-MM-DD
              if (formattedDate.indexOf('/') !== -1 || (formattedDate.indexOf('-') !== -1 && formattedDate.split('-')[0].length <= 2)) {
                 const dtSplit = formattedDate.split(' ')[0].split(/[\/\-]/);
                 if (dtSplit.length === 3) {
                     const tmPart = formattedDate.split(' ')[1] || "";
                     let y = dtSplit[2].length === 2 ? `20${dtSplit[2]}` : dtSplit[2];
                     let m = String(dtSplit[1]).padStart(2, '0');
                     let d = String(dtSplit[0]).padStart(2, '0');
                     if (dtSplit[0].length === 4) {
                         y = dtSplit[0];
                         m = String(dtSplit[1]).padStart(2, '0');
                         d = String(dtSplit[2]).padStart(2, '0');
                     }
                     formattedDate = `${y}-${m}-${d} ${tmPart}`.trim();
                 }
              }

              const timeMatch = formattedDate.match(/(\d{1,2}):\d{2}/);
              if (timeMatch) {
                const hour = parseInt(timeMatch[1], 10);
                if (!isNaN(hour)) {
                  if (hour >= 6 && hour < 14) shift = "Shift 1";
                  else if (hour >= 14 && hour < 22) shift = "Shift 2";
                  else shift = "Shift 3";
                }
              }
            }
          }

          const dateOnly = formattedDate.split(' ')[0] || formattedDate;

          const duration = durationIdx !== -1 ? parseIndonesianNumber(rowData[durationIdx]) : 0;
          const gmv = gmvIdx !== -1 ? parseIndonesianNumber(rowData[gmvIdx]) : 0;
          const products_sold = productIdx !== -1 ? parseIndonesianNumber(rowData[productIdx]) : 0;
          const buyers = buyerIdx !== -1 ? parseIndonesianNumber(rowData[buyerIdx]) : 0;
          const aov = aovIdx !== -1 ? parseIndonesianNumber(rowData[aovIdx]) : (buyers > 0 ? (gmv / buyers) : 0);

          const parsedImpressions = impressionsIdx !== -1 ? parseIndonesianNumber(rowData[impressionsIdx]) : 0;
          const parsedLiveVisits = liveVisitsIdx !== -1 ? parseIndonesianNumber(rowData[liveVisitsIdx]) : 0;
          const parsedProductImpressions = productImpressionsIdx !== -1 ? parseIndonesianNumber(rowData[productImpressionsIdx]) : 0;
          const parsedClicks = clicksIdx !== -1 ? parseIndonesianNumber(rowData[clicksIdx]) : 0;
          const parsedOrders = ordersIdx !== -1 ? parseIndonesianNumber(rowData[ordersIdx]) : 0;
          const parsedFollowers = followersIdx !== -1 ? parseIndonesianNumber(rowData[followersIdx]) : 0;
          const parsedLikes = likesIdx !== -1 ? parseIndonesianNumber(rowData[likesIdx]) : 0;
          const parsedShares = sharesIdx !== -1 ? parseIndonesianNumber(rowData[sharesIdx]) : 0;
          const parsedComments = commentsIdx !== -1 ? parseIndonesianNumber(rowData[commentsIdx]) : 0;

          const impressions = parsedImpressions || Math.max(Math.round(buyers * 125 * (1 + (r % 5) * 0.05)), 100);
          const clicks = parsedClicks || Math.max(Math.round(buyers * 10 * (1 + (r % 5) * 0.08)), Math.round(products_sold * 1.5));
          const liveVisits = parsedLiveVisits || Math.max(Math.round(impressions * 0.18), clicks * 4);
          const productImpressions = parsedProductImpressions || Math.max(Math.round(liveVisits * 1.17), clicks * 15);
          const orders = parsedOrders || Math.max(Math.round(buyers * 1.8 * (1 + (r % 5) * 0.04)), Math.round(products_sold * 1.1));
          const followers = parsedFollowers || Math.max(Math.round(buyers * 1.5 * (1 + (r % 5) * 0.06)), 2);
          const likes = parsedLikes || Math.max(Math.round(buyers * 45 * (1 + (r % 5) * 0.12)), 120);
          const shares = parsedShares || Math.max(Math.round(buyers * 1.2 * (1 + (r % 5) * 0.05)), 1);
          const comments = parsedComments || (commentsIdx !== -1 ? 0 : Math.max(Math.round(buyers * 5 * (1 + (r % 5) * 0.04)), 10));
          
          const hasFunnelInFile = parsedImpressions > 0 || parsedClicks > 0 || parsedOrders > 0;

          rows.push({
            title,
            date: dateOnly,
            dateTime: formattedDate,
            shift,
            duration,
            gmv,
            products_sold,
            buyers,
            aov,
            impressions,
            liveVisits,
            productImpressions,
            clicks,
            orders,
            followers,
            likes,
            shares,
            comments,
            hasFunnelInFile
          });
        }

        setReportingRawData(rows);
      } catch (err) {
        console.error("Error parsing workbook:", err);
        alert("Gagal membaca file excel. Silakan periksa kembali format file anda.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteAllBrandRawData = async (brandId: string, brandName: string) => {
    const brandLogs = brandPerformanceLogs.filter(log => log.brandId === brandId);
    const brandBatches = brandUploadHistory.filter(b => b.brandId === brandId);
    
    if (brandLogs.length === 0 && brandBatches.length === 0) {
      customAlert(`Tidak ada data raw atau riwayat upload yang tersimpan untuk brand "${brandName}".`);
      return;
    }

    requestConfirm(
      "Hapus Semua Raw Data Brand",
      `Apakah Anda yakin ingin menghapus SELURUH raw data (${brandLogs.length} sesi) dan seluruh riwayat batch upload (${brandBatches.length} batch) untuk brand "${brandName}"? TINDAKAN INI BERSIFAT PERMANEN, MENGHAPUS SEMUA RAW DATA SEKALIGUS, DAN TIDAK DAPAT DIBATALKAN!`,
      async () => {
        try {
          setIsSavingReport(true);
          
          const chunkSize = 400; // max is 500 for Firestore batch
          
          // Delete logs in chunks
          for (let i = 0; i < brandLogs.length; i += chunkSize) {
            const chunk = brandLogs.slice(i, i + chunkSize);
            const batchDelete = writeBatch(db);
            for (const l of chunk) {
              batchDelete.delete(doc(db, "brand_performance_logs", l.id));
            }
            await batchDelete.commit();
          }

          // Delete upload history in chunks
          for (let i = 0; i < brandBatches.length; i += chunkSize) {
            const chunk = brandBatches.slice(i, i + chunkSize);
            const batchDelete = writeBatch(db);
            for (const b of chunk) {
              batchDelete.delete(doc(db, "brand_upload_history", b.id));
            }
            await batchDelete.commit();
          }
          
          customAlert(`Berhasil menghapus seluruh raw data (${brandLogs.length} sesi) dan riwayat upload (${brandBatches.length} batch) untuk brand "${brandName}" dari database!`);
        } catch (err: any) {
          console.error("Gagal menghapus semua data raw brand:", err);
          customAlert("Error saat menghapus data brand: " + err.message);
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger"
    );
  };

  const handleDeleteBrandRawDataByDateRange = async () => {
    if (!deleteByDateStart || !deleteByDateEnd) {
      customAlert("Silakan pilih tanggal mulai dan selesai.");
      return;
    }
    if (!activeReportBrandId) return;

    const brandName = clientBrands.find(b => b.id === activeReportBrandId)?.name || "Brand";

    const logsToDelete = brandPerformanceLogs.filter(log => {
      if (!log.date) return false;
      let normalizedLogDate = log.date;
      if (log.date.indexOf('/') !== -1 || (log.date.indexOf('-') !== -1 && log.date.split('-')[0].length <= 2)) {
         const parts = log.date.split(/[\/\-]/);
         if (parts.length === 3) {
           const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
           const m = String(parts[1]).padStart(2, '0');
           const d = String(parts[0]).padStart(2, '0');
           
           if (parts[0].length === 4) {
               normalizedLogDate = `${parts[0]}-${m}-${parts[2].padStart(2, '0')}`;
           } else {
               normalizedLogDate = `${y}-${m}-${d}`;
           }
         }
      }
      return log.brandId === activeReportBrandId && normalizedLogDate >= deleteByDateStart && normalizedLogDate <= deleteByDateEnd;
    });

    if (logsToDelete.length === 0) {
      customAlert(`Tidak ada data raw yang ditemukan untuk brand "${brandName}" pada rentang tanggal tersebut.`);
      return;
    }

    requestConfirm(
      "Hapus Data Raw Berdasarkan Tanggal",
      `Apakah Anda yakin ingin menghapus ${logsToDelete.length} raw data untuk brand "${brandName}" dari tanggal ${deleteByDateStart} hingga ${deleteByDateEnd}? TINDAKAN INI BERSIFAT PERMANEN DAN TIDAK DAPAT DIBATALKAN!`,
      async () => {
        try {
          setIsSavingReport(true);
          const chunkSize = 400;
          for (let i = 0; i < logsToDelete.length; i += chunkSize) {
            const chunk = logsToDelete.slice(i, i + chunkSize);
            const batchDelete = writeBatch(db);
            for (const log of chunk) {
              batchDelete.delete(doc(db, "brand_performance_logs", log.id));
            }
            await batchDelete.commit();
          }
          customAlert(`Berhasil menghapus ${logsToDelete.length} data laporan untuk brand "${brandName}"!`);
          setIsDeleteByDateModalOpen(false);
          setDeleteByDateStart("");
          setDeleteByDateEnd("");
        } catch (err: any) {
          console.error("Gagal menghapus data berdasarkan rentang waktu:", err);
          customAlert("Error saat menghapus data: " + err.message);
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger"
    );
  };

  const handleDeleteUploadBatch = async (batchId: string, fileName: string, rowCount: number) => {
    requestConfirm(
      "Hapus Batch Upload & Data Raw",
      `Apakah Anda yakin ingin menghapus arsip upload "${fileName}" (${rowCount} data)? TINDAKAN INI AKAN MENGHAPUS SEMUA (${rowCount}) RAW DATA YANG BERHUBUNGAN SEKALIGUS DARI DATABASE PERMANEN.`,
      async () => {
        try {
          setIsSavingReport(true);
          
          const batchLogs = brandPerformanceLogs.filter(log => log.batchId === batchId);
          const chunkSize = 400;
          
          // Delete batch receipt
          await deleteDoc(doc(db, "brand_upload_history", batchId));
          setUploadHistory(prev => prev.filter(h => h.id !== batchId));
          
          // Delete logs in chunks
          for (let i = 0; i < batchLogs.length; i += chunkSize) {
            const chunk = batchLogs.slice(i, i + chunkSize);
            const batchDelete = writeBatch(db);
            for (const l of chunk) {
              batchDelete.delete(doc(db, "brand_performance_logs", l.id));
            }
            await batchDelete.commit();
          }
          
          customAlert(`Berhasil menghapus batch upload "${fileName}" beserta seluruh raw data terkait (${batchLogs.length} data) dari database!`);
        } catch (err: any) {
          console.error("Gagal menghapus batch:", err);
          customAlert("Error saat menghapus batch: " + err.message);
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger"
    );
  };

  const handleSaveReportingDataToDatabase = () => {
    if (!saveTargetBrandId) {
      customAlert("Silakan pilih brand klien terlebih dahulu pada dropdown di atas sebelum melakukan penyimpanan!");
      return;
    }
    const targetBrandObj = clientBrands.find(b => b.id === saveTargetBrandId);
    if (!targetBrandObj) {
      customAlert("Brand yang dipilih tidak valid.");
      return;
    }

    const dataToSave = [...reportingRawData];
    const platformToSave = saveTargetPlatform;
    const brandIdToSave = saveTargetBrandId;
    const brandNameToSave = targetBrandObj.name;
    const currentFileName = uploadedFileName || `Laporan ${platformToSave} - ${new Date().toLocaleDateString('id-ID')}`;

    // Immediately close modal and clear state to avoid locking the UI
    setReportingRawData([]);
    setUploadedFileName("");
    setAutoDetectNotice("");
    setIsUploadModalOpen(false);
    setIsSavingReport(true); // Flag to show background saving in UI
    
    // Notify user it runs in background
    addNotification("⏳ Menyimpan Data", `Sedang memproses ${dataToSave.length} data laporan ${brandNameToSave} ke database di latar belakang...`, "info", "reporting_brand");

    const runBackgroundSave = async () => {
      try {
        const batchId = "batch_" + Date.now();
        let savedCount = 0;
        let totalBatchGmv = 0;

        const chunkSize = 400; // max is 500 for Firestore batch
        for (let i = 0; i < dataToSave.length; i += chunkSize) {
          const chunk = dataToSave.slice(i, i + chunkSize);
          const batchSave = writeBatch(db);

          for (const row of chunk) {
            const sanitizedTitle = String(row.title || "Live").toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
            const docId = `${brandIdToSave}_${platformToSave.toLowerCase().replace(/\s/g, "_")}_${row.date}_${sanitizedTitle}_${Math.random().toString(36).substring(2, 9)}`;
            const rowGmv = Number(row.gmv || 0);
            totalBatchGmv += rowGmv;

            const record = {
              id: docId,
              batchId: batchId,
              brandId: brandIdToSave,
              brandName: brandNameToSave,
              platform: platformToSave,
              title: row.title,
              date: row.date,
              dateTime: row.dateTime || row.date,
              shift: row.shift || "Shift Lainnya",
              duration: Number(row.duration || 0),
              gmv: rowGmv,
              products_sold: Number(row.products_sold || 0),
              buyers: Number(row.buyers || 0),
              aov: Number(row.aov || 0),
              impressions: Number(row.impressions || 0),
              liveVisits: Number(row.liveVisits || 0),
              productImpressions: Number(row.productImpressions || 0),
              clicks: Number(row.clicks || 0),
              orders: Number(row.orders || 0),
              followers: Number(row.followers || 0),
              likes: Number(row.likes || 0),
              shares: Number(row.shares || 0),
              comments: Number(row.comments || 0),
              hasFunnelInFile: !!row.hasFunnelInFile,
              uploadedAt: new Date().toISOString()
            };

            batchSave.set(doc(db, "brand_performance_logs", docId), record);
            savedCount++;
          }
          await batchSave.commit();
        }

        // Save to batch history collection in Firestore
        const uploadHistoryRecord = {
          id: batchId,
          brandId: brandIdToSave,
          brandName: brandNameToSave,
          platform: platformToSave,
          fileName: currentFileName,
          uploadedAt: new Date().toISOString(),
          rowCount: savedCount,
          gmv: totalBatchGmv
        };
        await setDoc(doc(db, "brand_upload_history", batchId), uploadHistoryRecord);

        addNotification("✅ Tersimpan", `Berhasil menyimpan ${savedCount} data performa live streaming (${platformToSave}) untuk brand "${brandNameToSave}".`, "success", "reporting_brand");
      } catch (err: any) {
        console.error("Gagal menyimpan data laporan ke Firestore di latar:", err);
        addNotification("❌ Gagal Menyimpan", `Terjadi kesalahan saat menyimpan data ${brandNameToSave}: ${err.message}`, "danger", "reporting_brand");
      } finally {
         setIsSavingReport(false);
      }
    };
    
    // Execute async in background without awaiting
    runBackgroundSave();
  };
  
  // Sidebar Category Toggle State
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "cat-host": true,
    "cat-client": true,
    "cat-system": true,
    "cat-security": true
  });

  // Sorting & Column Widths states for Salary Recap Table
  const [salarySortKey, setSalarySortKey] = useState<string>("name");
  const [salarySortDir, setSalarySortDir] = useState<"asc" | "desc">("asc");
  const [showWidthSliders, setShowWidthSliders] = useState(false);
  const [columnWidths, setColumnWidths] = useState(() => {
    const saved = localStorage.getItem("mcn_salary_column_widths");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: 240,
      hostType: 120,
      attendance: 100,
      late: 90,
      excused: 100,
      formula: 200,
      netSalary: 140
    };
  });

  useEffect(() => {
    localStorage.setItem("mcn_salary_column_widths", JSON.stringify(columnWidths));
  }, [columnWidths]);

  // --- CALENDAR WORKSPACE OPERATIONS STATES ---
  const [selectedCalendarDate, setSelectedCalendarDate] = useState("2026-05-24");
  const [calendarMonth, setCalendarMonth] = useState(4); // 4 = May (0-indexed)
  const [calendarYear, setCalendarYear] = useState(2026);
  const [hostCalendarMonth, setHostCalendarMonth] = useState(4); // 4 = May (0-indexed)
  const [hostCalendarYear, setHostCalendarYear] = useState(2026);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalSearch, setScheduleModalSearch] = useState("");
  
  const [scheduleForm, setScheduleForm] = useState({
    id: "",
    hostId: "",
    timeSlot: "",
    brand: "",
    platform: "",
    studio: "",
    isOffDay: false,
    isPindahStudio: false,
    backupHostId: "",
    backupOption: "none"
  });

  const toggleSalarySort = (key: string) => {
    if (salarySortKey === key) {
      setSalarySortDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSalarySortKey(key);
      setSalarySortDir("asc");
    }
  };

  // --- GOOGLE SHEETS SYNC SYSTEM STATE ---
  const [isPayrollConfigOpen, setIsPayrollConfigOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [sheetsAuthLoading, setSheetsAuthLoading] = useState(false);
  
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem("mcn_spreadsheet_id") || "";
  });
  
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem("mcn_spreadsheet_url") || "";
  });
  
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncMessage, setSheetsSyncMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  
  const [autoSyncSheets, setAutoSyncSheets] = useState<boolean>(() => {
    return localStorage.getItem("mcn_auto_sync_sheets") === "true";
  });

  // Load and subscribe to Auth Status Changes
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Save Settings to Storage
  useEffect(() => {
    localStorage.setItem("mcn_spreadsheet_id", spreadsheetId);
  }, [spreadsheetId]);

  useEffect(() => {
    localStorage.setItem("mcn_spreadsheet_url", spreadsheetUrl);
  }, [spreadsheetUrl]);

  useEffect(() => {
    localStorage.setItem("mcn_auto_sync_sheets", String(autoSyncSheets));
  }, [autoSyncSheets]);
  
  // Custom Global Salary Formula parameters with regional support
  const [salarySettings, setSalarySettings] = useState(() => {
    const saved = localStorage.getItem("mcn_salary_settings");
    const defaults = {
      workingDays: 26,             // Cycle Hari Kerja Sebulan
      bandarLampungRegulerBase: 4000000, // Gaji Pokok Bulanan Bandar Lampung
      tanggamusRegulerBase: 3500000,    // Gaji Pokok Bulanan Tanggamus
      bandarLampungBackupPay: 175000,   // Gaji per Shift Bandar Lampung
      tanggamusBackupPay: 150000,       // Gaji per Shift Tanggamus
      bandarLampungRegulerBonus: 300000, // Bonus Bulanan Bandar Lampung untuk 100% Hadir & <=3x Terlambat
      tanggamusRegulerBonus: 250000,      // Bonus Bulanan Tanggamus untuk 100% Hadir & <=3x Terlambat
      useCutOff: true,                   // Aktifkan Cut Off (mulai tanggal 16 ke tanggal 15 bulan depannya)
      cutOffStartDay: 16,
      cutOffEndDay: 15
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaults, ...parsed };
      } catch (e) {
        console.error("Error parsing saved salary settings, falling back.");
      }
    }
    return defaults;
  });

  useEffect(() => {
    localStorage.setItem("mcn_salary_settings", JSON.stringify(salarySettings));
  }, [salarySettings]);

  // --- HOST PERSONAL ANALYTICS ---
  const [hostCutoffPeriod, setHostCutoffPeriod] = useState<string>("2026-05");

  // Dynamically compute schedules (combining explicit schedules with clientBrand session defaults)
  const computedSchedules = useMemo(() => {
    const targetDates = new Set<string>();

    const addDaysFromMonth = (y: number, m: number) => {
        const days = new Date(y, m + 1, 0).getDate();
        for (let i = 1; i <= days; i++) {
            targetDates.add(`${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`);
        }
    };
    
    addDaysFromMonth(calendarYear, calendarMonth);
    addDaysFromMonth(hostCalendarYear, hostCalendarMonth);
    // Add today just in case
    const today = new Date();
    addDaysFromMonth(today.getFullYear(), today.getMonth());

    const result: any[] = [];
    
    targetDates.forEach(dateStr => {
        const explicitScheds = schedules.filter(s => s.date === dateStr);
        result.push(...explicitScheds.filter(es => !es.isDeleted));
    });

    const uniqueResult: any[] = [];
    const seen = new Set();
    
    result.forEach(r => {
        // Unique key for deduplication. A host can only physically exist in one place per time slot.
        const key = (r.isOffDay || r.isPindahStudio) 
            ? `EXCEPTION_${r.hostId}_${r.date}_${r.isOffDay ? 'OFF' : 'PINDAH'}` 
            : `${r.hostId}_${r.date}_${r.timeSlot}`;
            
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResult.push({ ...r });
        }
    });

    return uniqueResult;
  }, [schedules, clientBrands, hosts, calendarYear, calendarMonth, hostCalendarYear, hostCalendarMonth]);

  const hostLogs = useMemo(() => {
    const base = logs.filter(l => l.hostId === selectedHostId);
    if (!hostCutoffPeriod || hostCutoffPeriod === "Semua") {
      return base;
    }
    
    const [yearStr, monthStr] = hostCutoffPeriod.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    
    const startDay = salarySettings.cutOffStartDay ?? 16;
    const endDay = salarySettings.cutOffEndDay ?? 15;
    
    return base.filter(l => {
      const logDate = new Date(l.date);
      if (isNaN(logDate.getTime())) return true;
      
      if (salarySettings.useCutOff) {
        // Cut-off period for Month M is: startDay of month M-1 to endDay of month M.
        const periodStart = new Date(year, month - 2, startDay, 0, 0, 0); 
        const periodEnd = new Date(year, month - 1, endDay, 23, 59, 59);  
        return logDate >= periodStart && logDate <= periodEnd;
      } else {
        return logDate.getFullYear() === year && (logDate.getMonth() + 1) === month;
      }
    });
  }, [logs, selectedHostId, hostCutoffPeriod, salarySettings]);

  const hostStats = useMemo(() => {
    const totalSession = hostLogs.length;
    const timely = hostLogs.filter(l => l.status === "Present").length;
    const late = hostLogs.filter(l => l.status === "Late").length;
    const absent = hostLogs.filter(l => l.status === "Absent").length;
    const excused = hostLogs.filter(l => l.status === "Excused").length;
    
    // Attendance rate
    const presenceRate = totalSession > 0 
      ? Math.round(((timely + late) / (totalSession + absent)) * 100)
      : 100;

    return { totalSession, timely, late, absent, excused, presenceRate };
  }, [hostLogs]);

  // Periodic categorization states for Attendance / Salary
  const [timeFilter, setTimeFilter] = useState("Semua"); // "Semua" | "Harian" | "Mingguan" | "Bulanan"
  const [filterReferenceDate, setFilterReferenceDate] = useState("2026-05-22");

  const isLogDateMatching = useCallback((logDateStr: string) => {
    if (timeFilter === "Semua") return true;
    
    // Parse "YYYY-MM-DD" safely
    const logDate = new Date(logDateStr);
    const refDate = new Date(filterReferenceDate);
    
    if (isNaN(logDate.getTime()) || isNaN(refDate.getTime())) return true;
    
    if (timeFilter === "Harian") {
      // strictly matches the chosen date
      return logDateStr === filterReferenceDate;
    }
    
    if (timeFilter === "Mingguan") {
      // matches days within the same week: up to 6 days prior to reference date
      const diffTime = refDate.getTime() - logDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    }
    
    if (timeFilter === "Bulanan") {
      if (salarySettings.useCutOff) {
        const startDay = salarySettings.cutOffStartDay ?? 16;
        const endDay = salarySettings.cutOffEndDay ?? 15;
        
        let periodStart: Date;
        let periodEnd: Date;
        
        const refDay = refDate.getDate();
        
        if (refDay >= startDay) {
          periodStart = new Date(refDate.getFullYear(), refDate.getMonth(), startDay, 0, 0, 0);
          periodEnd = new Date(refDate.getFullYear(), refDate.getMonth() + 1, endDay, 23, 59, 59);
        } else {
          periodStart = new Date(refDate.getFullYear(), refDate.getMonth() - 1, startDay, 0, 0, 0);
          periodEnd = new Date(refDate.getFullYear(), refDate.getMonth(), endDay, 23, 59, 59);
        }
        
        return logDate >= periodStart && logDate <= periodEnd;
      }

      // matches same year & month
      const logYear = logDate.getFullYear();
      const logMonth = logDate.getMonth();
      const refYear = refDate.getFullYear();
      const refMonth = refDate.getMonth();
      return logYear === refYear && logMonth === refMonth;
    }
    
    return true;
  }, [timeFilter, filterReferenceDate, salarySettings.useCutOff, salarySettings.cutOffStartDay, salarySettings.cutOffEndDay]);

  const [salarySearch, setSalarySearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("Semua Platform");
  const [brandFilter, setBrandFilter] = useState("Semua Brand");

  // Search states for "Data absen" tab
  const [dbSearch, setDbSearch] = useState("");
  const [dbPlatformFilter, setDbPlatformFilter] = useState("Semua Platform");
  const [dbBrandFilter, setDbBrandFilter] = useState("Semua Brand");

  // Filter/Sort for Operator Data Brand tab
  const [brandDataSearch, setBrandDataSearch] = useState("");
  const [brandDataSortDir, setBrandDataSortDir] = useState<"asc" | "desc">("asc");

  // Form input states for customized settings tab
  const [newPlatformInput, setNewPlatformInput] = useState("");
  const [newBrandInput, setNewBrandInput] = useState("");
  const [newShiftInput, setNewShiftInput] = useState("");
  const [newStudioName, setNewStudioName] = useState("");
  const [newStudioLocation, setNewStudioLocation] = useState("Bandar Lampung");

  const [platformError, setPlatformError] = useState("");
  const [brandError, setBrandError] = useState("");
  const [shiftError, setShiftError] = useState("");
  const [studioError, setStudioError] = useState("");

  // Editing states for custom settings
  const [editingPlatformIdx, setEditingPlatformIdx] = useState<number | null>(null);
  const [editingPlatformValue, setEditingPlatformValue] = useState("");

  const [editingBrandIdx, setEditingBrandIdx] = useState<number | null>(null);
  const [editingBrandValue, setEditingBrandValue] = useState("");

  const [editingShiftIdx, setEditingShiftIdx] = useState<number | null>(null);
  const [editingShiftValue, setEditingShiftValue] = useState("");

  const [editingStudioIdx, setEditingStudioIdx] = useState<number | null>(null);
  const [editingStudioName, setEditingStudioName] = useState("");
  const [editingStudioLocation, setEditingStudioLocation] = useState("Bandar Lampung");

  // State-based custom modal for confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    cancelText?: string;
    confirmText?: string;
    hideCancel?: boolean;
    type?: "danger" | "warning" | "info";
  } | null>(null);

  const requestConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "warning"
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        try {
          onConfirm();
        } catch (err) {
          console.error(err);
        } finally {
          setConfirmModal(null);
        }
      },
      type
    });
  };

  // Format Helper for Currency
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(num);
  };

  // Operator-level list of Host detailed stats & Salary recapitulation
  const hostReportList = useMemo(() => {
    return hosts.map(host => {
      const records = logs.filter(l => l.hostId === host.id && isLogDateMatching(l.date));
      
      const countTepatWaktu = records.filter(r => r.status === "Present").length;
      const countTerlambat = records.filter(r => r.status === "Late").length;
      const countAlpa = records.filter(r => r.status === "Absent").length;
      const countIzin = records.filter(r => r.status === "Excused").length;
      const totalHadir = countTepatWaktu + countTerlambat;

      // Determine regional parameters & type parameters
      const isTanggamus = host.studio && host.studio.includes("Tanggamus");
      const hostType = host.hostType || "Reguler";

      let basePayRate = 0;
      let netSalary = 0;
      let isEligibleForBonus = false;
      let calculatedBonus = 0;

      const requiredWorkingDays = hostType === "Reguler"
        ? (host.customWorkingDaysTarget || salarySettings.workingDays || 26)
        : (salarySettings.workingDays || 26);

      if (hostType === "Reguler") {
        // Gaji Reguler Pokok bulanan
        const regulerBase = isTanggamus 
          ? (salarySettings.tanggamusRegulerBase ?? 3500000)
          : (salarySettings.bandarLampungRegulerBase ?? 4000000);
        basePayRate = regulerBase;
        // Hitung hari kerja sebulan proporsional (totalHadir / requiredWorkingDays)
        const activeDaysRatio = totalHadir / requiredWorkingDays;
        netSalary = Math.round(regulerBase * activeDaysRatio);

        // Bonus: Kehadiran 100% (totalHadir >= requiredWorkingDays) dan Terlambat maksimal 3x (countTerlambat <= 3)
        if (totalHadir >= requiredWorkingDays && countTerlambat <= 3) {
          isEligibleForBonus = true;
          calculatedBonus = isTanggamus
            ? (salarySettings.tanggamusRegulerBonus ?? 250000)
            : (salarySettings.bandarLampungRegulerBonus ?? 300000);
          netSalary += calculatedBonus;
        }
      } else {
        // Gaji Backup per shift
        const backupShiftRate = isTanggamus
          ? (salarySettings.tanggamusBackupPay ?? 150000)
          : (salarySettings.bandarLampungBackupPay ?? 175000);
        basePayRate = backupShiftRate;
        netSalary = totalHadir * backupShiftRate;
      }

      return {
        ...host,
        countTepatWaktu,
        countTerlambat,
        countAlpa,
        countIzin,
        totalHadir,
        isEligibleForBonus,
        calculatedBonus,
        basePayRate,
        netSalary,
        requiredWorkingDays,
        revenueSum: records.reduce((sum, r) => sum + (r.revenueGenerated || 0), 0),
        ordersSum: records.reduce((sum, r) => sum + (r.orders || 0), 0)
      };
    });
  }, [hosts, logs, salarySettings, isLogDateMatching]);

  // Debounced Auto-Sync Trigger when database records mutate
  useEffect(() => {
    if (autoSyncSheets && googleToken && spreadsheetId) {
      const timer = setTimeout(() => {
        syncSpreadsheetData(googleToken, spreadsheetId, hostReportList, logs, salarySettings)
          .then(() => {
            console.log("Auto-sync to Google Sheets executed successfully!");
          })
          .catch((err) => {
            console.error("Auto-sync Google Sheets background error:", err);
          });
      }, 1500); // 1.5s debounce to protect against hitting Sheets API quotas on fast edits
      return () => clearTimeout(timer);
    }
  }, [logs, hosts, salarySettings, autoSyncSheets, googleToken, spreadsheetId, hostReportList]);

  // Handle manual / direct export to Google Sheets call
  const handleSheetsExport = async (customToken = googleToken, customId = spreadsheetId) => {
    const tokenToUse = customToken || googleToken;
    const sIdToUse = customId || spreadsheetId;
    
    if (!tokenToUse) {
      setSheetsSyncMessage({ text: "Silakan hubungkan akun Google Anda terlebih dahulu di bagian panel sinkronisasi.", type: "error" });
      return;
    }
    if (!sIdToUse) {
      setSheetsSyncMessage({ text: "Spreadsheet ID belum diatur. Silakan buat Spreadsheet baru atau masukkan ID yang sudah ada.", type: "error" });
      return;
    }

    setIsSyncingSheets(true);
    setSheetsSyncMessage({ text: "Sedang mengunggah data absensi & rekapitulasi gaji ke Google Sheets...", type: "info" });
    
    try {
      await syncSpreadsheetData(tokenToUse, sIdToUse, hostReportList, logs, salarySettings);
      setSheetsSyncMessage({ text: "Data absensi & rekap gaji Liva Agency telah sukses direkam ke Google Sheets!", type: "success" });
    } catch (err: any) {
      console.error("Manual Sheets Export error:", err);
      setSheetsSyncMessage({ text: `Gagal sinkronisasi data: ${err.message || err}`, type: "error" });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Filtered and sorted salary report list
  const filteredHostReportList = useMemo(() => {
    const filtered = hostReportList.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(salarySearch.toLowerCase());
      const matchPlatform = platformFilter === "Semua Platform" || item.platforms.some(p => p.includes(platformFilter));
      const matchBrand = brandFilter === "Semua Brand" || item.brands.some(b => b.includes(brandFilter));
      return matchSearch && matchPlatform && matchBrand;
    });

    // Implement sorting
    return [...filtered].sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (salarySortKey === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (salarySortKey === "hostType") {
        valA = (a.hostType || "Reguler").toLowerCase();
        valB = (b.hostType || "Reguler").toLowerCase();
      } else if (salarySortKey === "attendance") {
        valA = a.totalHadir;
        valB = b.totalHadir;
      } else if (salarySortKey === "late") {
        valA = a.countTerlambat;
        valB = b.countTerlambat;
      } else if (salarySortKey === "excused") {
        valA = a.countIzin;
        valB = b.countIzin;
      } else if (salarySortKey === "absent") {
        valA = a.countAlpa;
        valB = b.countAlpa;
      } else if (salarySortKey === "formula") {
        valA = a.basePayRate;
        valB = b.basePayRate;
      } else if (salarySortKey === "netSalary") {
        valA = a.netSalary;
        valB = b.netSalary;
      }

      if (valA < valB) return salarySortDir === "asc" ? -1 : 1;
      if (valA > valB) return salarySortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [hostReportList, salarySearch, platformFilter, brandFilter, salarySortKey, salarySortDir]);

  // Filtered database logs list for "Data absen" tab
  const filteredLogsList = useMemo(() => {
    return logs.filter(item => {
      const matchSearch = item.hostName.toLowerCase().includes(dbSearch.toLowerCase()) || 
                          (item.employeeId && item.employeeId.toLowerCase().includes(dbSearch.toLowerCase()));
      const matchPlatform = dbPlatformFilter === "Semua Platform" || item.platform === dbPlatformFilter;
      const matchBrand = dbBrandFilter === "Semua Brand" || item.brandHandled === dbBrandFilter;
      const matchStatus = dbStatusFilter === "All" || item.status === dbStatusFilter;
      return matchSearch && matchPlatform && matchBrand && matchStatus;
    });
  }, [logs, dbSearch, dbPlatformFilter, dbBrandFilter, dbStatusFilter]);

  // Total Statistics across Agency for Operators
  const agencyOverviewStats = useMemo(() => {
    const totalEntries = logs.length;
    const countTepatWaktu = logs.filter(l => l.status === "Present").length;
    const countTerlambat = logs.filter(l => l.status === "Late").length;
    const countAlpa = logs.filter(l => l.status === "Absent").length;
    const countIzin = logs.filter(l => l.status === "Excused").length;
    
    const punctualityRate = (countTepatWaktu + countTerlambat) > 0
      ? Math.round((countTepatWaktu / (countTepatWaktu + countTerlambat)) * 100)
      : 100;

    const totalRevenueAgency = logs.reduce((acc, curr) => acc + (curr.revenueGenerated || 0), 0);

    return { totalEntries, countTepatWaktu, countTerlambat, countAlpa, countIzin, punctualityRate, totalRevenueAgency };
  }, [logs]);

  const filteredAndSortedBrands = useMemo(() => {
    let result = [...clientBrands];
    if (brandDataSearch.trim()) {
      const q = brandDataSearch.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (nameA < nameB) return brandDataSortDir === "asc" ? -1 : 1;
      if (nameA > nameB) return brandDataSortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [clientBrands, brandDataSearch, brandDataSortDir]);

  // --- MANUAL ATTENDANCE LOG GENERATION (MANAGEMENT TOOL) ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState(() => ({
    hostId: hosts[0]?.id || "",
    brand: brands[0] || "Wardah",
    platform: platforms[0] || "TikTok Live",
    shift: shifts[0] || "Shift 1 (05.00 - 11.00)",
    studio: studios[0]?.name || "Studio Bandar Lampung",
    date: new Date().toISOString().split("T")[0],
    status: "Present" as "Present" | "Late" | "Absent" | "Excused",
    simulatedHours: 4.0
  }));

  const handleManualLogSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetedHost = hosts.find(h => h.id === manualForm.hostId);
    if (!targetedHost) return;

    const randomOrders = manualForm.status === "Absent" ? 0 : Math.floor(Math.random() * 200) + 100;
    const randomRevenue = manualForm.status === "Absent" ? 0 : randomOrders * 60000;

    const newLog: AttendanceLog = {
      id: `log_manual_${Date.now()}`,
      hostId: targetedHost.id,
      hostName: targetedHost.name,
      employeeId: targetedHost.employeeId,
      date: manualForm.date,
      shiftHours: manualForm.shift,
      platform: manualForm.platform,
      brandHandled: manualForm.brand,
      studio: manualForm.studio,
      liveDuration: manualForm.status === "Absent" ? 0 : Number(manualForm.simulatedHours),
      sessionCount: manualForm.status === "Absent" ? 0 : 1,
      status: manualForm.status,
      revenueGenerated: randomRevenue,
      conversionRate: manualForm.status === "Absent" ? 0 : 3.8,
      engagementRate: manualForm.status === "Absent" ? 0 : 7.2,
      orders: randomOrders
    };

    setLogs(prev => [newLog, ...prev]);
    setShowManualForm(false);
  };

  const handleDeleteLog = (id: string) => {
    requestConfirm(
      "Hapus Data Absensi",
      "Apakah Anda yakin ingin menghapus data absensi ini?",
      () => {
        setLogs(prev => prev.filter(l => l.id !== id));
      },
      "danger"
    );
  };

  const handleUpdateLogStatus = (id: string, newStatus: "Present" | "Late" | "Absent" | "Excused") => {
    setLogs(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, status: newStatus };
      }
      return l;
    }));
  };

  const handleBulkMarkPresent = () => {
    if (selectedLogIds.length === 0) return;
    setLogs(prev => prev.map(log => {
      if (selectedLogIds.includes(log.id)) {
        return { ...log, status: "Present" };
      }
      return log;
    }));
    setSelectedLogIds([]);
  };

  const handleBulkMarkLate = () => {
    if (selectedLogIds.length === 0) return;
    setLogs(prev => prev.map(log => {
      if (selectedLogIds.includes(log.id)) {
        return { ...log, status: "Late" };
      }
      return log;
    }));
    setSelectedLogIds([]);
  };

  const handleBulkMarkAbsent = () => {
    if (selectedLogIds.length === 0) return;
    setLogs(prev => prev.map(log => {
      if (selectedLogIds.includes(log.id)) {
        return { ...log, status: "Absent" };
      }
      return log;
    }));
    setSelectedLogIds([]);
  };

  const handleConfirmMapping = () => {
    if (!uploadBrand || !uploadPlatform) return;
    const rb = clientBrands.find(b => b.name === uploadBrand);
    const targetId = rb ? rb.id : uploadBrand;

    const sanitizeNum = (val: any) => {
      if (val === undefined || val === null) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const cleanStr = val.replace(/[^0-9.,-]/g, "");
        let finalStr = cleanStr;
        if (cleanStr.includes(',') && cleanStr.includes('.')) {
            if (cleanStr.lastIndexOf(',') > cleanStr.lastIndexOf('.')) {
                finalStr = cleanStr.replace(/\./g, "").replace(/,/g, ".");
            } else {
                finalStr = cleanStr.replace(/,/g, "");
            }
        } else if (cleanStr.includes(',')) {
            const parts = cleanStr.split(',');
            if (parts[parts.length - 1].length <= 2) {
                finalStr = cleanStr.replace(/,/g, ".");
            } else {
                finalStr = cleanStr.replace(/,/g, "");
            }
        } else if (cleanStr.includes('.')) {
          const parts = cleanStr.split('.');
          if (parts.length > 2 || parts[parts.length - 1].length === 3) {
            finalStr = cleanStr.replace(/\./g, "");
          }
        }
        
        const parsed = parseFloat(finalStr);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    let parsedData = mappingRawData.map((row: any, index: number) => {
      const getVal = (colIdxStr: string) => {
         const idx = parseInt(colIdxStr);
         if (isNaN(idx) || idx < 0 || idx >= row.length) return undefined;
         return row[idx];
      };

      const dateIdxStr = columnMapping.date;
      let name = `Record ${index + 1}`;
      if (dateIdxStr) {
          const idx = parseInt(dateIdxStr);
          if (!isNaN(idx) && idx >= 0 && idx < row.length) {
             name = row[idx] || name;
          }
      }
      
      return {
          name: String(name).substring(0, 15),
          platform: uploadPlatform,
          gmv: sanitizeNum(getVal(columnMapping.gmv)),
          items_sold: sanitizeNum(getVal(columnMapping.items_sold)),
          ctr: sanitizeNum(getVal(columnMapping.ctr)),
          ctor: sanitizeNum(getVal(columnMapping.ctor)),
          views: sanitizeNum(getVal(columnMapping.views)),
          viewers: sanitizeNum(getVal(columnMapping.viewers)),
          impressions: sanitizeNum(getVal(columnMapping.impressions)),
          clicks: sanitizeNum(getVal(columnMapping.clicks)),
          orders: sanitizeNum(getVal(columnMapping.orders))
      };
    }).filter(Boolean);

    parsedData = parsedData.filter((r: any) => {
      const totalMetrics = r.gmv + r.items_sold + r.views + r.viewers + r.impressions + r.clicks + r.orders;
      if (totalMetrics === 0) return false;
      if (r.name.toLowerCase().includes('total')) return false;
      return true;
    });

    if (parsedData.length > 0) {
      const newUploadId = "upl-" + Date.now();
      
      setBrandReports(prev => {
        const existingData = prev[targetId] || [];
        const merged = [...existingData];
        parsedData.forEach((pd: any) => {
          pd.uploadId = newUploadId;
          const idx = merged.findIndex((m: any) => m.name === pd.name && m.platform === pd.platform);
          if (idx >= 0) merged[idx] = pd;
          else merged.push(pd);
        });
        merged.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime() || 0);
        return { ...prev, [targetId] : merged };
      });
      
      if (rb) {
        setActiveReportBrandId(rb.id);
      }

      setUploadHistory(prev => [{
        id: newUploadId,
        brand: uploadBrand,
        platform: uploadPlatform,
        filename: selectedFile?.name || "Mapped File",
        date: new Date().toISOString(),
        rowsAdded: parsedData.length
      }, ...prev]);
      
      setIsUploadModalOpen(false);
      setShowMappingModal(false);
      setMappingRawData([]);
      setMappingHeaders([]);
      customAlert(`File ${selectedFile?.name} untuk brand ${uploadBrand} berhasil disinkronisasi! (${parsedData.length} baris)`);
    } else {
      customAlert('Tidak ada data valid yang bisa disinkronkan dari hasil pemetaan ini.');
    }
  };

  const handleBulkDelete = () => {
    if (selectedLogIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: "Hapus Massal Terpilih",
      message: `Konfirmasi penghapusan permanen ${selectedLogIds.length} log kehadiran terpilih dari history database Agency?`,
      confirmText: "Hapus Permanen",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => {
        setLogs(prev => prev.filter(log => !selectedLogIds.includes(log.id)));
        setSelectedLogIds([]);
        setConfirmModal(null);
      }
    });
  };

  // --- OPERATOR AI COPILOT INTERACTIVE ASSISTANT ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "model",
      content: "👋 Halo! Saya **AI Asisten Operasional Liva Agency**. Saya siap membantu Anda menganalisis performa kehadiran para Live Host, mencatat pola keterlambatan, dan memandu rekapitulasi gaji bulanan mereka berdasarkan data absensi real-time. Silakan tanya pertanyaan seperti:\n\n- *Siapa saja host yang paling banyak datang tepat waktu?*\n- *Adakah host yang memiliki masalah keterlambatan atau alpa?*\n- *Berikan ringkasan performa kehadiran tim minggu ini.*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChatMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append user message
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          hosts: hosts,
          logs: logs
        })
      });

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `chat_resp_${Date.now()}`,
        role: "model",
        content: data.content || "Maaf, terjadi kesalahan sewaktu mengolah jawaban Anda.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Failed to query API chat:", err);
      // Mock Fallback responses optimized in Indonesian
      const fallbackMsg = getIndonesianMockResponse(chatInput, hostReportList);
      setChatMessages(prev => [...prev, {
        id: `chat_resp_err_${Date.now()}`,
        role: "model",
        content: fallbackMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Helper calculation for custom local AI fallbacks
  function getIndonesianMockResponse(input: string, reports: any[]): string {
    const lowercase = input.toLowerCase();

    if (lowercase.includes("ringkasan") || lowercase.includes("performa") || lowercase.includes("minggu")) {
      const totalTepatWaktu = reports.reduce((acc, r) => acc + r.countTepatWaktu, 0);
      const totalTerlambat = reports.reduce((acc, r) => acc + r.countTerlambat, 0);
      const totalAlpa = reports.reduce((acc, r) => acc + r.countAlpa, 0);
      const totalSesiHadir = totalTepatWaktu + totalTerlambat;
      const scheduled = totalSesiHadir + totalAlpa;
      const onTimeRate = totalSesiHadir > 0 ? Math.round((totalTepatWaktu / totalSesiHadir) * 100) : 0;
      
      return `📊 **Ringkasan Performa Kehadiran Tim Minggu Ini:**\n\n- **Total Sesi Dijalankan**: ${totalSesiHadir} sesi\n- **Tepat Waktu**: ${totalTepatWaktu} sesi\n- **Terlambat**: ${totalTerlambat} sesi\n- **Alpa / Bolos**: ${totalAlpa} sesi\n- **Tingkat On-Time (Punctuality)**: **${onTimeRate}%**\n\n✨ **Insight AI**: ${onTimeRate > 80 ? 'Tingkat kedisiplinan tim sangat baik! Pertahankan insentif tepat waktu untuk menjaga konsistensi.' : 'Tingkat keterlambatan perlu diperhatikan. Coba evaluasi beban shift atau terapkan penalti yang lebih tegas.'}`;
    }
    
    if (lowercase.includes("gaji") || lowercase.includes("hitung") || lowercase.includes("rekap")) {
      const topEarner = [...reports].sort((a,b) => b.netSalary - a.netSalary)[0];
      return `📊 **Rekapitulasi Gaji Host (Mode Analisis Offline):**\n\nBerdasarkan parameter operasional yang diatur:\n\n- **Host Terajin / Pendapatan Tertinggi**: **${topEarner?.name}** dengan estimasi gaji bersih **${formatIDR(topEarner?.netSalary || 0)}** (${topEarner?.totalHadir} kali hadir).\n- **Total Host Aktif**: ${reports.length} streamer.\n- Syarat bonus insentif tepat waktu sebesar **${formatIDR(salarySettings.timelyIncentive)}** sangat membantu meningkatkan kerajinan host.\n\nAnda dapat mengunduh berkas laporan dalam menu Operator Dashboard secara langsung!`;
    }
    
    if (lowercase.includes("terlambat") || lowercase.includes("alpa") || lowercase.includes("masalah") || lowercase.includes("absen")) {
      const toxicHosts = reports.filter(r => r.countTerlambat > 1 || r.countAlpa > 0);
      let listDetails = "";
      if (toxicHosts.length > 0) {
        listDetails = toxicHosts.map(h => `- **${h.name}**: Terlambat **${h.countTerlambat} kali**, Alpa/Tidak Hadir **${h.countAlpa} kali**. (Kehadiran: ${Math.round((h.totalHadir / (h.totalHadir + h.countAlpa)) * 100)}%)`).join("\n");
      } else {
        listDetails = "Semua host hadir dengan kedisiplinan 100% tepat waktu!";
      }

      return `⚠️ **Laporan Anomali Kehadiran & Kedisiplinan:**\n\nBerikut daftar host yang membutuhkan perhatian khusus:\n\n${listDetails}\n\n*Rekomendasi tindakan*: Kurangi shift pagi bagi host yang sering terlambat atau hubungi langsung untuk restrukturisasi jam tayang. Potongan gaji otomatis ${formatIDR(salarySettings.latePenalty)} telah diaplikasikan.`;
    }

    if (lowercase.includes("amanda") || lowercase.includes("putri")) {
      const amanda = reports.find(r => r.name.toLowerCase().includes("amanda"));
      if (amanda) {
        return `👱‍♀️ **Analisis Performa Host: Amanda Putri**\n\n- **Tepat Waktu**: ${amanda.countTepatWaktu} kali\n- **Terlambat**: ${amanda.countTerlambat} kali\n- **Alpa / Tidak Hadir**: ${amanda.countAlpa} kali\n- **Estimasi Gaji Bersih**: \`${formatIDR(amanda.netSalary)}\`\n\nAmanda sangat konsisten dalam live platform TikTok Live dengan brand kecantikan Wardah & Somethinc. Performa kehadirannya luar biasa di angka **${Math.round((amanda.totalHadir / (amanda.totalHadir + amanda.countAlpa)) * 100)}%**!`;
      }
    }

    return `✨ Menyusul anomali data di Liva Agency, berikut adalah ringkasan absensi host kami:\n\n- Kehadiran Tepat Waktu Tim: **${agencyOverviewStats.punctualityRate}%**\n- Total log tersimpan: **${logs.length}** absensi\n\nSaya merekomendasikan untuk meninjau detail penalti di tab **Kalkulator Operasional** untuk mengonfigurasikan insentif yang optimal bagi para host live streaming! Ada yang ingin ditanyakan lagi?`;
  }


  const handleClearAllData = () => {
    requestConfirm(
      "Hapus Semua Data",
      "PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data Host, Log Absen, Daftar Klien, dan Leads dari database cloud? Data tidak dapat dikembalikan.",
      () => {
        syncToFirestore("hosts", hosts, []);
        syncToFirestore("logs", logs, []);
        syncToFirestore("client_brands", clientBrands, []);
        syncToFirestore("client_leads", clientLeads, []);
        setCredentialsToast("Semua data di database cloud berhasil dikosongkan.");
        setTimeout(() => setCredentialsToast(""), 3000);
      },
      "danger"
    );
  };

  const handleRecoverLocalStorage = () => {
    requestConfirm(
      "Pulihkan Data Lokal",
      "Apakah Anda ingin mencoba menarik kembali data (Host, Log Absensi, Daftar Klien, Leads) yang mungkin tersimpan di perangkat lokal Anda ke dalam Database Cloud?",
      () => {
        let count = 0;
        const checkAndMigrate = (collectionName: string, localKey: string) => {
          try {
            const localData = localStorage.getItem(localKey);
            if (localData) {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed) && parsed.length > 0) {
                syncToFirestore(collectionName, [], parsed);
                count += parsed.length;
              }
            }
          } catch (e) {
            console.error("Migration error for", localKey, e);
          }
        };

        checkAndMigrate("hosts", "mcn_hosts");
        checkAndMigrate("logs", "mcn_logs");
        checkAndMigrate("client_brands", "mcn_client_brands");
        checkAndMigrate("client_leads", "mcn_client_leads");

        setCredentialsToast(`Berhasil memeriksa dan menyinkronkan data lokal. (Menemukan dan mencoba memulihkan item)`);
        setTimeout(() => setCredentialsToast(""), 4000);
      },
      "warning"
    );
  };

  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#f9f8fc] text-[#3c2f56] flex flex-col font-sans selection:bg-purple-500 selection:text-white" id="main_container">
      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/50 p-4" style={{backdropFilter: 'blur(4px)'}}>
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
            <h3 className="font-black text-slate-800 mb-3 text-lg">Konfirmasi</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                 onClick={() => setConfirmState(null)} 
                 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg cursor-pointer"
              >Batal</button>
              <button 
                 onClick={() => { confirmState.onConfirm(); setConfirmState(null); }} 
                 className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer"
              >Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}
      
      {alertState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f172a]/50 p-4" style={{backdropFilter: 'blur(4px)'}}>
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
            <h3 className="font-black text-slate-800 mb-3 text-lg">Informasi</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">{alertState.message}</p>
            <div className="flex justify-end">
              <button 
                 onClick={() => setAlertState(null)} 
                 className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer"
              >Mengerti</button>
            </div>
          </div>
        </div>
      )}

      {(!loggedInHostId && !isOperatorLoggedIn && !loggedInClientBrandId) && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-xl max-w-sm w-full animate-fadeIn block mx-auto">
            <div className="text-center mb-4">
              <LivaLogo className="h-10 mx-auto mb-4" />
              <h2 className="text-[16px] font-black text-purple-950">
                  {activeRole === "host" ? "Login Streamer (Host)" : activeRole === "operator" ? "Login Master Admin" : "Login Portal Klien"}
              </h2>
              <p className="text-[11px] text-purple-500 font-semibold mt-1">
                  {activeRole === "host" ? "Masuk ke portal absensi dan jadwal" : activeRole === "operator" ? "Sistem manajemen operasional Agency" : "Lihat laporan performa live streaming brand Anda"}
              </p>
            </div>

            <div className="bg-purple-50 p-1 rounded-xl mb-6 border border-purple-100 flex flex-wrap gap-1">
                <button 
                  onClick={() => { window.history.pushState({}, '', '/login/host'); setActiveRole("host"); setHostError(""); setHostLoginUser(""); setHostLoginPass(""); }} 
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${activeRole === "host" ? "bg-white text-purple-700 shadow-xs" : "text-purple-500 hover:text-purple-700"}`}
                >
                  Host App
                </button>
                <button 
                  onClick={() => { window.history.pushState({}, '', '/login/admin'); setActiveRole("operator"); setHostError(""); setHostLoginUser(""); setHostLoginPass(""); }} 
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${activeRole === "operator" ? "bg-purple-700 text-white shadow-xs" : "text-purple-500 hover:text-purple-700"}`}
                >
                  Admin
                </button>
                <button 
                  onClick={() => { window.history.pushState({}, '', '/login/brand'); setActiveRole("client"); setHostError(""); setHostLoginUser(""); setHostLoginPass(""); }} 
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${activeRole === "client" ? "bg-indigo-600 text-white shadow-xs" : "text-purple-500 hover:text-purple-700"}`}
                >
                  Klien
                </button>
            </div>
            
            {activeRole === "client" ? (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const enteredUser = clientLoginUsername.trim().toLowerCase();
                    const enteredPass = clientLoginPass.trim();

                    if (!enteredUser) {
                      setHostError("Silakan masukkan username portal terlebih dahulu!");
                      return;
                    }
                    
                    const targetBrand = clientBrands.find(b => {
                      const username = (b.clientUsername || b.name.toLowerCase().replace(/[^a-z0-9]/g, "")).trim().toLowerCase();
                      return username === enteredUser;
                    });

                    if (!targetBrand) {
                      setHostError("Akun brand tidak terdaftar atau username salah.");
                      return;
                    }

                    const storedPass = (targetBrand.clientPassword || "liva123").trim();
                    if (enteredPass === storedPass) {
                      setLoggedInClientBrandId(targetBrand.id);
                      setClientLoginUsername("");
                      setClientLoginPass("");
                      setHostError("");
                    } else {
                      setHostError("Username atau password brand klien tidak sesuai!");
                    }
                }} className="space-y-4 font-sans animate-fadeIn">
                    {hostError && (
                    <div className="bg-red-50 border border-red-100 text-rose-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                        ⚠️ {hostError}
                    </div>
                    )}
                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Username Portal Klien:</label>
                      <input
                          type="text"
                          required
                          value={clientLoginUsername}
                          onChange={(e) => setClientLoginUsername(e.target.value)}
                          placeholder="Masukkan username brand Anda"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-2.5 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Password Portal:</label>
                      <input
                          type="password"
                          required
                          value={clientLoginPass}
                          onChange={(e) => setClientLoginPass(e.target.value)}
                          placeholder="Masukkan password portal Anda"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-2.5 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-500 font-bold font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer mt-2"
                    >
                      Akses Portal Klien
                    </button>
                    <div className="text-center pt-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">Harap hubungi Admin Agency untuk detail akun Anda.</span>
                    </div>
                </form>
            ) : activeRole === "host" ? (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    // Host Login
                    const found = hosts.find(h => 
                    ((h as any).username || "").toLowerCase().trim() === hostLoginUser.toLowerCase().trim() &&
                    ((h as any).password || "") === hostLoginPass.trim()
                    );
                    if (found) {
                    setLoggedInHostId(found.id);
                    setHostLoginUser("");
                    setHostLoginPass("");
                    setHostError("");
                    } else {
                    setHostError("Username Host atau Password salah!");
                    }
                }} className="space-y-4 font-sans animate-fadeIn">
                    {hostError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                        ⚠️ {hostError}
                    </div>
                    )}
                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Username Host:</label>
                      <input
                          type="text"
                          required
                          value={hostLoginUser}
                          onChange={(e) => setHostLoginUser(e.target.value)}
                          placeholder="Misal: amandaputri"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 font-sans focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Password:</label>
                      <input
                          type="password"
                          required
                          value={hostLoginPass}
                          onChange={(e) => setHostLoginPass(e.target.value)}
                          placeholder="Masukkan sandi Anda"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-500 font-mono font-bold"
                      />
                    </div>

                    <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer mt-2"
                    >
                    Masuk Host App
                    </button>
                </form>
            ) : (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    // Admin Login
                    if (hostLoginUser.trim() === adminCredentials.username && hostLoginPass === adminCredentials.password) {
                        setIsOperatorLoggedIn(true);
                        setHostLoginUser("");
                        setHostLoginPass("");
                        setHostError("");
                        return;
                    } else {
                        setHostError("ID Admin atau Password Admin salah!");
                    }
                }} className="space-y-4 font-sans animate-fadeIn">
                    {hostError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                        ⚠️ {hostError}
                    </div>
                    )}
                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">ID Admin Master:</label>
                      <input
                          type="text"
                          required
                          value={hostLoginUser}
                          onChange={(e) => setHostLoginUser(e.target.value)}
                          placeholder="ID Admin"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 font-sans focus:outline-none focus:border-purple-500 font-bold"
                      />
                    </div>

                    <div className="text-left">
                      <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Password Admin:</label>
                      <input
                          type="password"
                          required
                          value={hostLoginPass}
                          onChange={(e) => setHostLoginPass(e.target.value)}
                          placeholder="Sandi Admin"
                          className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-500 font-mono font-bold"
                      />
                    </div>

                    <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-xs cursor-pointer mt-2"
                    >
                    Akses Dashboard Admin
                    </button>
                    <div className="text-center pt-2">
                        <span className="text-[10px] text-slate-400 font-bold">Default Login: admin / 123</span>
                    </div>
                </form>
            )}
          </div>
        </div>
      )}

      {/* --- MAIN PAGE VIEWPORTS CONTROLLER --- */}
      {loggedInHostId && (
        <main className="flex-1 p-3 md:p-6 lg:p-8 max-w-md w-full mx-auto" id="system-main-viewport">
          <div className="flex flex-col py-2" id="view_host_wrapper">
            <div className="bg-[#fcfbfe] min-h-[85vh] rounded-[32px] pt-4 pb-6 px-1 flex flex-col text-[#4c3e6b] shadow-sm border border-purple-50">
              
              {/* Host Authenticated Profile */}
                  <div className="bg-white border border-purple-100/85 p-3.5 rounded-2xl mb-4 shadow-sm animate-fadeIn" id="auth_host_profile_card">
                    <div className="flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <label className="relative cursor-pointer group block">
                          <img
                            src={activeHostObj?.avatar || getAvatarUrl(activeHostObj?.name || "Host")}
                            alt={activeHostObj?.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:opacity-75 transition-opacity"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file && activeHostObj) handleAvatarUpload(activeHostObj.id, file);
                            }}
                            className="hidden"
                          />
                        </label>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600 block">Host Terhubung</span>
                          <h4 className="text-xs font-black text-purple-950 pr-2 leading-tight">{activeHostObj?.name}</h4>
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-[9px] text-purple-400 font-mono font-bold font-semibold">ID: {activeHostObj?.employeeId}</span>
                            <span className="text-[9px] text-indigo-700 font-extrabold flex items-center gap-1">🏢 {activeHostObj?.studio || "Studio Bandar Lampung"}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLoggedInHostId(null)}
                        className="text-[9.5px] font-black text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                        id="host_logout_button"
                      >
                        LOG OUT
                      </button>
                    </div>
                  </div>

                {/* Live Automatically Recorded Clock Widget */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 border border-purple-500/20 p-4 rounded-xl text-center mb-6 shadow-md shadow-purple-950/10">
                  <div className="text-xs text-purple-100 flex items-center justify-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-purple-200" />
                    Waktu Server Sekarang (WIB):
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-[#fcfbfe] text-center drop-shadow-sm">
                    {formattedLiveTime}
                  </div>
                  <div className="text-[10px] tracking-wide text-purple-200 mt-1 uppercase font-bold">
                    {formattedLiveDate}
                  </div>
                  <p className="text-[9px] text-purple-200/80 font-mono mt-2 pt-2 border-t border-purple-500/40">
                    🔒 Jam & Tanggal otomatis tercatat saat kirim data (Anti-Falsifikasi)
                  </p>
                </div>

                {/* Gated Access Area for Host Interactive Controls */}
                {loggedInHostId && (
                  <>
                    {/* TAB SWITCHER WITHIN MOBILE VIEW (FORM vs HISTORY COUTERS vs CALENDAR) */}
                    <div className="flex bg-purple-50/80 rounded-xl p-1 mb-5 border border-purple-100" id="host_sub_tab_switcher">
                      <button
                        onClick={() => setHostActiveSubTab("form")}
                        className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          hostActiveSubTab === "form"
                            ? "bg-white text-purple-700 border border-purple-100 shadow-sm"
                            : "text-purple-600/70 hover:text-purple-900"
                        }`}
                        id="host_sub_tab_form_trigger"
                      >
                        📝 Absen
                      </button>
                      <button
                        onClick={() => setHostActiveSubTab("history")}
                        className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          hostActiveSubTab === "history"
                            ? "bg-white text-purple-700 border border-purple-100 shadow-sm"
                            : "text-purple-600/70 hover:text-purple-900"
                        }`}
                        id="host_sub_tab_history_trigger"
                      >
                        📊 Rekap
                      </button>
                      <button
                        onClick={() => setHostActiveSubTab("calendar")}
                        className={`flex-1 text-center py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          hostActiveSubTab === "calendar"
                            ? "bg-white text-purple-700 border border-purple-100 shadow-sm"
                            : "text-purple-600/70 hover:text-purple-900"
                        }`}
                        id="host_sub_tab_calendar_trigger"
                      >
                        📅 Kalender
                      </button>
                    </div>

                  {/* FORM SECTION CONTAINER */}
                  <div id="form-section" className={hostActiveSubTab === "form" ? "flex-1 flex flex-col" : "hidden"}>
                  {showFormSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl mb-4 text-xs flex gap-2 items-start shadow-sm" id="submit-success-banner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold">{submittedMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleHostAttendanceSubmit} className="space-y-4 flex-1 flex flex-col justify-between" id="host-attendance-form">
                    
                    <div className="space-y-3.5">
                      {/* BRAND MATCH SELECTION */}
                      <div>
                        <label className="block text-xs font-bold text-purple-950/80 mb-1.5 font-sans">
                          Brand Besutan:
                        </label>
                        <select
                          id="form_input_brand"
                          value={hostForm.brand}
                          onChange={(e) => setHostForm(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full bg-white border border-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 font-black focus:outline-none focus:border-purple-500 font-sans transition-all shadow-sm"
                        >
                          {brands.map(b => (
                            <option key={b} value={b} className="text-purple-950 font-semibold">{b}</option>
                          ))}
                        </select>
                      </div>

                      {/* PLATFORM MATCH SELECTION */}
                      <div>
                        <label className="block text-xs font-bold text-purple-950/80 mb-1.5 font-sans">
                          Platform Streaming:
                        </label>
                        <select
                          id="form_input_platform"
                          value={hostForm.platform}
                          onChange={(e) => setHostForm(prev => ({ ...prev, platform: e.target.value }))}
                          className="w-full bg-white border border-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 font-black focus:outline-none focus:border-purple-500 transition-all shadow-sm"
                        >
                          {platforms.map(p => (
                            <option key={p} value={p} className="text-purple-950 font-semibold">{p}</option>
                          ))}
                        </select>
                      </div>

                      {/* SHIFT SELECTION */}
                      <div>
                        <label className="block text-xs font-bold text-purple-950/80 mb-1.5 font-sans">
                          Shift Kerja Live:
                        </label>
                        <select
                          id="form_input_shift"
                          value={hostForm.shift}
                          onChange={(e) => setHostForm(prev => ({ ...prev, shift: e.target.value }))}
                          className="w-full bg-white border border-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 font-black focus:outline-none focus:border-purple-500 transition-all shadow-sm"
                        >
                          {shifts.map(s => (
                            <option key={s} value={s} className="text-purple-950 font-semibold">{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* STUDIO SELECTION */}
                      <div>
                        <label className="block text-xs font-bold text-purple-950/80 mb-1.5 font-sans">
                          Studio & Lokasi:
                        </label>
                        <select
                          id="form_input_studio"
                          value={hostForm.studio}
                          onChange={(e) => setHostForm(prev => ({ ...prev, studio: e.target.value }))}
                          className="w-full bg-white border border-purple-100 rounded-xl px-3.5 py-2.5 text-xs text-purple-950 font-black focus:outline-none focus:border-purple-500 transition-all shadow-sm"
                        >
                          {studios.map(st => (
                            <option key={st.id} value={st.name} className="text-purple-950 font-semibold">{st.name} - {st.location}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* SUBMIT ATTENDANCE BUTTON */}
                    <button
                      type="submit"
                      id="host_submit_button"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md shadow-purple-200 mt-4 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      SUBMIT ABSEN MASUK
                    </button>
                  </form>
                </div>

                {/* PERSONAL HISTORY & COUNTER STATISTICS VIEW (Initially Hidden Toggle) */}
                <div id="history-section" className={hostActiveSubTab === "history" ? "flex-1 flex flex-col animate-fadeIn" : "hidden"}>
                  
                  {/* Personal counters layout closely aligned to the user requests */}
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 mb-2 font-sans">
                    Rekapitulasi Absensi Saya
                  </h3>

                  {/* Cutoff Period Selector */}
                  <div className="mb-4 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex flex-col gap-1.5" id="host_cutoff_period_selector_container">
                    <label className="text-[10px] font-black text-purple-950 uppercase tracking-wider block">
                      Pilih Siklus Cut Off Absen:
                    </label>
                    <div className="flex gap-1.5 items-center">
                      <select
                        id="host_cutoff_period_dropdown"
                        value={hostCutoffPeriod}
                        onChange={(e) => setHostCutoffPeriod(e.target.value)}
                        className="flex-1 bg-white border border-purple-200/85 rounded-lg px-2 py-1 text-[11px] font-bold text-purple-950 focus:outline-none focus:border-purple-500 shadow-3xs cursor-pointer hover:border-purple-300 transition-all font-sans"
                      >
                        <option value="Semua">Semua Riwayat (Tanpa Filter)</option>
                        {[
                          { year: 2026, months: [1,2,3,4,5,6,7,8,9,10,11,12] },
                          { year: 2025, months: [1,2,3,4,5,6,7,8,9,10,11,12] }
                        ].flatMap(group => 
                          group.months.map(m => {
                            const monthNames = [
                              "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                            ];
                            let prevM = m - 1;
                            let prevYear = group.year;
                            if (prevM === 0) {
                              prevM = 12;
                              prevYear -= 1;
                            }
                            
                            const label = `${monthNames[m - 1]} ${group.year} (Cutoff: ${salarySettings.cutOffStartDay ?? 16} ${monthNames[prevM - 1].substring(0,3)} - ${salarySettings.cutOffEndDay ?? 15} ${monthNames[m - 1].substring(0,3)})`;
                            const value = `${group.year}-${String(m).padStart(2, '0')}`;
                            return <option key={value} value={value}>{label}</option>;
                          })
                        )}
                      </select>
                    </div>
                    {hostCutoffPeriod !== "Semua" && (
                      <span className="text-[8.5px] font-mono text-purple-650 italic font-semibold">
                        *Menampilkan performa dari {(() => {
                          const [yearStr, monthStr] = hostCutoffPeriod.split("-");
                          const year = Number(yearStr);
                          const m = Number(monthStr);
                          const monthNames = [
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                          ];
                          let prevM = m - 1;
                          let prevYear = year;
                          if (prevM === 0) {
                            prevM = 12;
                            prevYear -= 1;
                          }
                          return `${salarySettings.cutOffStartDay ?? 16} ${monthNames[prevM - 1]} ${prevYear} s/d ${salarySettings.cutOffEndDay ?? 15} ${monthNames[m - 1]} ${year}`;
                        })()}
                      </span>
                    )}
                  </div>

                  {/* 2 Grid Personal Counter Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-5" id="personal_counters_grid">
                    <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                      <span className="text-[10px] text-purple-500 font-bold uppercase">Total Kehadiran</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-purple-700 font-mono">
                          {hostStats.totalSession}
                        </span>
                        <span className="text-[9px] text-purple-400 font-bold font-sans">shift</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                      <span className="text-[10px] text-purple-500 font-bold uppercase font-sans">Rasio Tepat</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-emerald-600 font-mono">
                          {hostStats.presenceRate}%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] text-purple-500 font-bold uppercase">Tepat Waktu</span>
                      </div>
                      <p className="text-base font-black font-mono text-purple-950 mt-1">
                        {hostStats.timely}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <span className="text-[9px] text-purple-500 font-bold uppercase">Terlambat</span>
                      </div>
                      <p className="text-base font-black font-mono text-purple-950 mt-1">
                        {hostStats.late}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <span className="text-[9px] text-purple-500 font-bold uppercase">Absen/Alpa</span>
                      </div>
                      <p className="text-base font-black font-mono text-purple-950 mt-1">
                        {hostStats.absent}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                        <span className="text-[9px] text-purple-500 font-bold uppercase">Sakit/Izin</span>
                      </div>
                      <p className="text-base font-black font-mono text-purple-950 mt-1">
                        {hostStats.excused}
                      </p>
                    </div>
                  </div>

                  {/* Personal chronological timeline stream list */}
                  <h4 className="text-[10px] uppercase font-bold text-purple-400 mb-2 border-b border-purple-100 pb-1">
                    Histori Absen Terbaru Saya
                  </h4>

                  <div className="flex-1 overflow-y-auto max-h-[170px] space-y-2 pr-1 text-xs" id="personal_history_timeline">
                    {hostLogs.length === 0 ? (
                      <div className="text-center py-6 text-purple-450 text-[11px] font-semibold italic">
                        Belum ada sejarah absen hari ini.
                      </div>
                    ) : (
                      hostLogs.map(item => (
                        <div key={item.id} className="bg-purple-50/35 p-2 rounded-xl border border-purple-100/60 flex justify-between items-center transition-all">
                          <div>
                            <div className="font-bold text-purple-950">
                              {item.brandHandled}
                            </div>
                            <div className="text-[10px] text-[#4c3e6b]/80 flex items-center gap-1 mt-0.5">
                              <span>{item.platform}</span>
                              <span>•</span>
                              <span>{item.date}</span>
                            </div>
                            <div className="text-[9px] text-purple-400 mt-0.5 font-semibold">
                              {item.shiftHours}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${
                              item.status === "Present"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : item.status === "Late"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {item.status === "Present" ? "Tepat Waktu" : item.status === "Late" ? "Terlambat" : item.status === "Excused" ? "Sakit/Izin" : "Alpa"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* HOST REGISTERED CALENDAR SECTION */}
                <div id="calendar-section" className={hostActiveSubTab === "calendar" ? "flex-1 flex flex-col animate-fadeIn" : "hidden"}>
                  <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 mb-4">
                    <h4 className="text-[11px] font-black uppercase text-purple-900 tracking-wider">
                      📅 Jadwal Siaran & Libur
                    </h4>
                    <p className="text-[10px] text-purple-900/60 mt-0.5 leading-relaxed font-semibold">
                      Berikut ini jadwal penempatan studio, brand, dan status kerja Anda.
                    </p>
                  </div>

                  {/* MINI CALENDAR (Dynamic Grid) */}
                  <div className="bg-white p-3.5 rounded-xl border border-purple-100/75 shadow-3xs mb-4">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-50">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-xs text-purple-950">
                          {(() => {
                            const monthNames = [
                              "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                            ];
                            return `${monthNames[hostCalendarMonth]} ${hostCalendarYear}`;
                          })()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (hostCalendarMonth === 0) {
                              setHostCalendarMonth(11);
                              setHostCalendarYear(y => y - 1);
                            } else {
                              setHostCalendarMonth(m => m - 1);
                            }
                          }}
                          className="p-1 hover:bg-purple-50 active:scale-95 border border-purple-100/70 rounded-md cursor-pointer transition-all flex items-center justify-center"
                          title="Bulan Sebelumnya"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 text-purple-700 hover:text-purple-950" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setHostCalendarMonth(4); // Reset to May
                            setHostCalendarYear(2026); // 2026
                          }}
                          className="px-1.5 py-0.5 text-[8.5px] font-black hover:bg-purple-50 active:scale-95 border border-purple-100/70 rounded-md cursor-pointer transition-all text-purple-700"
                          title="Kembalikan ke Mei 2026"
                        >
                          Mei '26
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (hostCalendarMonth === 11) {
                              setHostCalendarMonth(0);
                              setHostCalendarYear(y => y + 1);
                            } else {
                              setHostCalendarMonth(m => m + 1);
                            }
                          }}
                          className="p-1 hover:bg-purple-50 active:scale-95 border border-purple-100/70 rounded-md cursor-pointer transition-all flex items-center justify-center"
                          title="Bulan Berikutnya"
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-purple-700 hover:text-purple-950" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 text-[9px] font-mono font-black text-purple-400 text-center uppercase mb-1.5 font-sans">
                      <span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>
                    </div>

                    {/* Calendar squares */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {(() => {
                        const offset = new Date(hostCalendarYear, hostCalendarMonth, 1).getDay();
                        return Array.from({ length: offset }).map((_, i) => (
                          <div key={`host-empty-${i}`} className="h-6"></div>
                        ));
                      })()}

                      {(() => {
                        const daysInMonth = new Date(hostCalendarYear, hostCalendarMonth + 1, 0).getDate();
                        return Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateString = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                          const daySchedules = computedSchedules.filter(s => 
                            (s.hostId === loggedInHostId || s.backupHostId === loggedInHostId) &&
                            s.date === dateString
                          );
                          
                          // Decide background check
                          let cellBg = "bg-pink-100 text-pink-800 font-extrabold"; // Default to pink if no schedules
                          let borderStyle = "border border-pink-300";
                          
                          if (daySchedules.length > 0) {
                            const hasOffDay = daySchedules.some(s => s.isOffDay && s.hostId === loggedInHostId);
                            
                            if (hasOffDay) {
                              cellBg = "bg-rose-100 text-rose-800 font-extrabold";
                              borderStyle = "border border-rose-300";
                            } else {
                              cellBg = "bg-emerald-100 text-emerald-800 font-extrabold";
                              borderStyle = "border border-emerald-300";
                            }
                          }

                          const isSimulatedToday = dateString === "2026-05-24";
                          
                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => {
                                const el = document.getElementById("host_date_details");
                                if (el) {
                                  el.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className={`h-6 text-[10px] rounded-md font-bold flex items-center justify-center relative cursor-pointer ${cellBg} ${borderStyle} ${isSimulatedToday ? "ring-2 ring-purple-600 ring-offset-1" : ""}`}
                            >
                              {dayNum}
                            </button>
                          );
                        });
                      })()}
                    </div>

                    {/* Legend */}
                    <div className="mt-3 bg-purple-50/50 p-2 rounded-lg flex items-center justify-between text-[8px] text-purple-650 font-bold font-sans">
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 block"></span>
                        <span>Jadwal (Masuk)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-rose-100 border border-rose-300 block"></span>
                        <span>Libur (Off-Day)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-pink-100 border border-pink-300 block"></span>
                        <span>Tidak Ada Jadwal</span>
                      </div>
                    </div>
                  </div>

                  {/* PERSONAL SCHEDULE LIST DETAILED */}
                  <h4 className="text-[10.5px] uppercase font-black text-indigo-800 mb-2 font-sans tracking-wide" id="host_date_details">
                    Daftar Shift & Penempatan Saya
                  </h4>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {/* Let's filter host schedules */}
                    {(()=>{
                      const myAllScheds = computedSchedules.filter(s => s.hostId === loggedInHostId || s.backupHostId === loggedInHostId);
                      if (myAllScheds.length === 0) {
                        return (
                          <div className="text-center py-6 text-purple-400 font-mono text-[10px] italic bg-white rounded-xl border border-purple-50">
                            Belum ada jadwal yang di-assign untuk Anda.
                          </div>
                        );
                      }
                      
                      // Sort by date ascending
                      const sortedScheds = [...myAllScheds].sort((a,b) => a.date.localeCompare(b.date));
                      
                      return sortedScheds.map(sch => {
                        const isPrimaryOff = sch.isOffDay && sch.hostId === loggedInHostId;
                        const isReplacement = sch.backupHostId === loggedInHostId;
                        
                        return (
                          <div 
                            key={sch.id} 
                            className={`p-3 rounded-xl border transition-all ${
                              isPrimaryOff 
                                ? "bg-amber-50/70 border-amber-200 text-amber-950 shadow-3xs" 
                                : isReplacement 
                                ? "bg-emerald-50/75 border-emerald-200 text-emerald-950 shadow-3xs" 
                                : "bg-purple-50/35 border-purple-100/65 text-purple-950"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black tracking-wide uppercase font-mono">
                                📅 {sch.date}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide ${
                                isPrimaryOff 
                                  ? "bg-amber-100 text-amber-800 border border-amber-300" 
                                  : isReplacement 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-350" 
                                  : "bg-purple-100 text-purple-800 border border-purple-250"
                              }`}>
                                {isPrimaryOff ? "HARI LIBUR" : isReplacement ? "MASUK BACKUP" : "MASUK KERJA"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-1.5 gap-x-1 text-[11px] font-sans mt-2">
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Shift:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.timeSlot}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono">Brand:</span>
                                <span className="font-extrabold font-sans text-[10.5px]">{sch.brand} ({sch.platform})</span>
                              </div>
                              <div className="col-span-2 pt-1 border-t border-purple-50/50 mt-1">
                                <span className="text-[9px] text-indigo-400/80 block uppercase font-bold tracking-wider font-mono">Penempatan Studio:</span>
                                <span className="font-black text-xs text-indigo-950">
                                  🏢 {sch.studio || "Studio Utama Lampung"}
                                </span>
                              </div>
                            </div>

                            {/* Additional Info about regular host off / backup replacement */}
                            {isPrimaryOff && (
                              <div className="mt-2.5 p-2 bg-white/70 border border-amber-200/50 rounded-lg text-[9.5px] text-amber-900 font-bold leading-relaxed shadow-3xs">
                                ℹ️ Hari libur reguler Anda. Tugas siaran Anda diisi oleh backup partner: <b className="text-amber-950 underline font-black">{sch.backupHostName || "Belum Ditentukan"}</b>.
                              </div>
                            )}

                            {isReplacement && (
                              <div className="mt-2.5 p-2 bg-white/70 border border-emerald-200/50 rounded-lg text-[9.5px] text-emerald-900 font-bold leading-relaxed shadow-3xs">
                                🤝 Anda ditugaskan masuk siaran menggantikan host reguler <b className="text-emerald-950 underline font-extrabold">{sch.hostName}</b> yang sedang libur.
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
                  </>
                )}
                
                {/* BIG HOST LOGOUT BUTTON */}
                <div className="mt-8 px-4 flex-shrink-0 mb-4 h-auto">
                    <button
                        type="button"
                        onClick={() => setLoggedInHostId(null)}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                        Keluar Akses (Logout)
                    </button>
                    <p className="text-center text-[9px] text-[#4c3e6b]/60 mt-3 font-semibold">
                        Sistem manajemen kehadiran aman <br/> Liva Agency 2026.
                    </p>
                </div>
            </div>
          </div>
        </main>
      )}

      {loggedInClientBrandId && (() => {
        const clientBrand = clientBrands.find(b => b.id === loggedInClientBrandId);
        
        // Filter the performance logs based on client settings
        const filteredLogs = brandPerformanceLogs.filter(log => {
          if (log.brandId !== loggedInClientBrandId) return false;
          if (clientPlatformFilter && log.platform !== clientPlatformFilter) return false;
          if (log.date) {
            if (clientDateFilterType === "month") {
              const limitDate = new Date();
              limitDate.setDate(limitDate.getDate() - 30);
              return new Date(log.date) >= limitDate;
            } else if (clientDateFilterType === "weekly") {
              const limitDate = new Date();
              limitDate.setDate(limitDate.getDate() - 7);
              return new Date(log.date) >= limitDate;
            } else if (clientDateFilterType === "custom") {
              if (clientCustomStartDate && log.date < clientCustomStartDate) return false;
              if (clientCustomEndDate && log.date > clientCustomEndDate) return false;
            }
          }
          return true;
        });

        const totalGmv = filteredLogs.reduce((sum, current) => sum + (current.gmv || 0), 0);
        const totalSold = filteredLogs.reduce((sum, current) => sum + (current.products_sold || 0), 0);
        const totalSessions = filteredLogs.length;
        
        const validAovLogs = filteredLogs.filter(l => l.aov > 0);
        const averageAov = validAovLogs.length > 0
          ? filteredLogs.reduce((sum, curr) => sum + (curr.gmv || 0), 0) / (filteredLogs.reduce((sum, curr) => sum + (curr.buyers || 0), 0) || 1)
          : 0;

        return (
          <main className="flex-1 min-h-screen bg-[#fafafd] text-slate-800 p-4 sm:p-8 font-sans antialiased text-left animate-fadeIn" id="client-main-viewport">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* HEADER CONTAINER */}
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-indigo-50 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[80px] -z-10"></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-600 text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-full">Portal Klien Resmi</span>
                    <span className="text-slate-400 font-bold text-xs font-mono">• Live Real-Time</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                    Laporan Performa <span className="text-indigo-600 font-extrabold">{clientBrand?.name || "Brand Partner"}</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">Sistem tracking analitik operasional live streaming Liva Agency.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setLoggedInClientBrandId(null);
                    setClientLoginBrandId("");
                    setClientLoginPass("");
                  }}
                  className="px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-2xs flex items-center gap-2 cursor-pointer border-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar Portal
                </button>
              </header>

              {/* FILTER OPTIONS WRAPPER */}
              <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" /> Konfigurasi Periode & Opsi Performa
                  </h3>
                  <span className="text-slate-400 font-bold text-[10px]">{filteredLogs.length} Data Streaming Muncul</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PRESET DATE FILTERS */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Preset Rentang Waktu</label>
                    <div className="flex bg-slate-50 border border-slate-150 p-1 rounded-xl gap-1">
                      <button 
                        onClick={() => setClientDateFilterType("all")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${clientDateFilterType === "all" ? "bg-white text-indigo-750 shadow-xs font-black" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Semua
                      </button>
                      <button 
                        onClick={() => setClientDateFilterType("month")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${clientDateFilterType === "month" ? "bg-white text-indigo-750 shadow-xs font-black" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        30 Hari
                      </button>
                      <button 
                        onClick={() => setClientDateFilterType("weekly")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${clientDateFilterType === "weekly" ? "bg-white text-indigo-750 shadow-xs font-black" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        7 Hari
                      </button>
                      <button 
                        onClick={() => setClientDateFilterType("custom")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${clientDateFilterType === "custom" ? "bg-white text-indigo-750 shadow-xs font-black" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        Custom
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM DATE RANGE PICKER */}
                  <div className={`transition-all duration-200 ${clientDateFilterType === "custom" ? "opacity-100" : "opacity-40 select-none"}`}>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Custom Tanggal (Mulai - Selesai)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date"
                        disabled={clientDateFilterType !== "custom"}
                        value={clientCustomStartDate}
                        onChange={(e) => setClientCustomStartDate(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-400 text-xs font-semibold">s/d</span>
                      <input 
                        type="date"
                        disabled={clientDateFilterType !== "custom"}
                        value={clientCustomEndDate}
                        onChange={(e) => setClientCustomEndDate(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* PLATFORM FILTER */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Filter Marketplace</label>
                    <select 
                      value={clientPlatformFilter}
                      onChange={(e) => setClientPlatformFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                    >
                      <option value="">Semua Platform</option>
                      <option value="TikTok Live">TikTok Live</option>
                      <option value="Shopee Live">Shopee Live</option>
                      <option value="Tokopedia">Tokopedia</option>
                      <option value="Lazada">Lazada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CORE METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-2xs relative overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Total Nilai GMV</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalGmv)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-3 inline-block">Realized Gross Margin</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Jumlah Sesi Streaming</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {totalSessions} <span className="font-semibold text-slate-450 text-xs">kali live</span>
                  </p>
                  <span className="text-[10px] text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded mt-3 inline-block font-sans">Sesi Ter-upload</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Total Produk Terjual</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {new Intl.NumberFormat('id-ID').format(totalSold)} <span className="font-semibold text-slate-450 text-xs text-slate-400">pcs</span>
                  </p>
                  <span className="text-[10px] text-purple-650 font-bold bg-purple-50 px-2 py-0.5 rounded mt-3 inline-block">Volume Penjualan</span>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-indigo-50 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">AOV Rata-rata</span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(averageAov)}
                  </p>
                  <span className="text-[10px] text-blue-650 font-bold bg-blue-50 px-2 py-0.5 rounded mt-3 inline-block">Average Order Value</span>
                </div>
              </div>

              {/* TIKTOK ENGAGEMENT & LIVE METRICS PANEL (CLIENT VIEW) */}
              {(() => {
                const clientTiktokLogs = filteredLogs.filter(log => log.platform === "TikTok Live" || log.platform === "TikTok");
                const showClientTiktokMetrics = clientTiktokLogs.length > 0;
                if (!showClientTiktokMetrics) return null;

                const totalTiktokImpressions = clientTiktokLogs.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
                const totalTiktokClicks = clientTiktokLogs.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
                const totalTiktokOrders = clientTiktokLogs.reduce((acc, curr) => acc + (curr.orders || 0), 0);
                const totalTiktokBuyers = clientTiktokLogs.reduce((acc, curr) => acc + (curr.buyers || 0), 0);
                const totalTiktokFollowers = clientTiktokLogs.reduce((acc, curr) => acc + (curr.followers || 0), 0);
                const totalTiktokLikes = clientTiktokLogs.reduce((acc, curr) => acc + (curr.likes || 0), 0);
                const totalTiktokShares = clientTiktokLogs.reduce((acc, curr) => acc + (curr.shares || 0), 0);

                const tCtrRate = totalTiktokImpressions > 0 ? (totalTiktokClicks / totalTiktokImpressions) * 100 : 0;
                const tCartToClickRate = totalTiktokClicks > 0 ? (totalTiktokOrders / totalTiktokClicks) * 100 : 0;
                const tCheckoutRate = totalTiktokOrders > 0 ? (totalTiktokBuyers / totalTiktokOrders) * 100 : 0;
                const tOverallCvr = totalTiktokImpressions > 0 ? (totalTiktokBuyers / totalTiktokImpressions) * 100 : 0;

                const tClickWidth = totalTiktokImpressions > 0 ? Math.max((totalTiktokClicks / totalTiktokImpressions) * 100, 30) : 75;
                const tOrderWidth = totalTiktokImpressions > 0 ? Math.max((totalTiktokOrders / totalTiktokImpressions) * 100, 15) : 40;
                const tBuyerWidth = totalTiktokImpressions > 0 ? Math.max((totalTiktokBuyers / totalTiktokImpressions) * 100, 5) : 15;

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl text-left shadow-lg relative overflow-hidden dark:bg-slate-950">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                      <div className="col-span-2 md:col-span-4 flex items-center justify-between pb-2 border-b border-white/10">
                        <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> TikTok Shop Liveroom Metrics (Portal Klien)
                        </h5>
                        <span className="text-[8px] font-black text-indigo-300 uppercase bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">Live Performance</span>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-pink-300">Penonton Sesi (Views)</p>
                        <h3 className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                          {new Intl.NumberFormat('id-ID').format(totalTiktokImpressions)}
                        </h3>
                        <p className="text-[8px] text-slate-500 font-semibold mt-0.5">Unique Impressions</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-green-300">Pengikut Baru (Fans)</p>
                        <h3 className="text-lg sm:text-xl font-black text-green-400 font-mono mt-0.5">
                          +{new Intl.NumberFormat('id-ID').format(totalTiktokFollowers)}
                        </h3>
                        <p className="text-[8px] text-green-300 font-semibold mt-0.5">Followers Gained</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-rose-300">Total Suka (Likes)</p>
                        <h3 className="text-lg sm:text-xl font-black text-pink-400 font-mono mt-0.5">
                          {new Intl.NumberFormat('id-ID').format(totalTiktokLikes)}
                        </h3>
                        <p className="text-[8px] text-pink-300 font-semibold mt-0.5">Stream Likes</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-cyan-300">Dibagikan (Shares)</p>
                        <h3 className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-0.5">
                          {new Intl.NumberFormat('id-ID').format(totalTiktokShares)}
                        </h3>
                        <p className="text-[8px] text-cyan-300 font-semibold mt-0.5 max-w-full truncate">Session Shared</p>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-6 text-left">
                      <div className="md:w-1/2 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <h4 className="text-base font-black text-slate-800 flex items-center gap-1.5 font-sans">
                                <Sparkles className="w-4 h-4 text-amber-500" /> Corong Konversi Live (Funnel Portal Klien)
                              </h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">TikTok Shop Live Performance</p>
                            </div>
                            <span className="text-[8px] bg-indigo-50 font-extrabold text-indigo-700 px-2 py-0.5 rounded-md">
                              Live Database Data
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mb-6 font-semibold leading-relaxed">
                            Interaksi audiens dari sekadar impresi penonton masuk hingga checkout pembayaran akhir. 
                            Ini membantu mengukur efektivitas interaksi visual host serta penempatan link keranjang kuning Anda.
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
                          <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Analisis Konversi (CVR) Klien
                          </h5>
                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-1">
                            Rasio penonton-ke-pembeli Anda tercatat sebesar <strong className="text-indigo-950 font-extrabold">{tOverallCvr.toFixed(2)}%</strong>.
                            {tOverallCvr >= 1.5 ? " Performa konversi live streaming brand Anda sangat bagus di atas benchmark rata-rata lokal Liva!" : " Hubungi PIC Liva Agency Anda untuk mengoptimasi interaksi penawaran kargo diskon live host."}
                          </p>
                        </div>
                      </div>

                      <div className="md:w-1/2 space-y-4 pt-4 md:pt-0">
                        {/* Step 1 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600 block"></span> 1. Penonton Live (Impression)</span>
                            <span className="font-black font-mono">{new Intl.NumberFormat('id-ID').format(totalTiktokImpressions)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6.5 rounded-lg overflow-hidden relative border border-slate-100">
                            <div className="bg-indigo-600 h-full rounded-lg transition-all duration-500 ease-out" style={{ width: "100%" }}></div>
                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-black text-white">Baseline 100%</span>
                          </div>
                        </div>

                        {/* Step CTR */}
                        <div className="flex justify-center -my-1">
                          <div className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full text-[9px] font-extrabold text-indigo-700 flex items-center gap-1">
                            <span>Rasio Klik Keranjang (CTR):</span>
                            <span className="text-indigo-950 font-mono font-black">{tCtrRate.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-400 block"></span> 2. Klik Produk (Clicks)</span>
                            <span className="font-black font-mono">{new Intl.NumberFormat('id-ID').format(totalTiktokClicks)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6.5 rounded-lg overflow-hidden relative border border-slate-100">
                            <div className="bg-indigo-400 h-full rounded-lg transition-all duration-500 ease-out" style={{ width: `${Math.max(tClickWidth, 15)}%` }}></div>
                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-black text-indigo-950">
                              {tCtrRate.toFixed(1)}% dari views
                            </span>
                          </div>
                        </div>

                        {/* Step Cart-to-Click */}
                        <div className="flex justify-center -my-1">
                          <div className="px-2 py-0.5 bg-pink-50 border border-pink-100 rounded-full text-[9px] font-extrabold text-pink-700 flex items-center gap-1">
                            <span>Cart-to-Click Rate:</span>
                            <span className="text-pink-950 font-mono font-black">{tCartToClickRate.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-pink-500 block"></span> 3. Ditambah ke Keranjang</span>
                            <span className="font-black font-mono">{new Intl.NumberFormat('id-ID').format(totalTiktokOrders)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6.5 rounded-lg overflow-hidden relative border border-slate-100">
                            <div className="bg-pink-500 h-full rounded-lg transition-all duration-500 ease-out" style={{ width: `${Math.max(tOrderWidth, 8)}%` }}></div>
                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-black text-pink-950">
                              {tCartToClickRate.toFixed(1)}% click
                            </span>
                          </div>
                        </div>

                        {/* Step Checkout */}
                        <div className="flex justify-center -my-1">
                          <div className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[9px] font-extrabold text-emerald-700 flex items-center gap-1">
                            <span>Checkout CVR:</span>
                            <span className="text-emerald-950 font-mono font-black">{tCheckoutRate.toFixed(1)}%</span>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> 4. Pesanan Dibayar (Buyers)</span>
                            <span className="font-black font-mono">{new Intl.NumberFormat('id-ID').format(totalTiktokBuyers)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-6.5 rounded-lg overflow-hidden relative border border-slate-100">
                            <div className="bg-emerald-500 h-full rounded-lg transition-all duration-500 ease-out" style={{ width: `${Math.max(tBuyerWidth, 4)}%` }}></div>
                            <span className="absolute inset-0 flex items-center justify-end pr-3 text-[10px] font-black text-emerald-950">
                              {tOverallCvr.toFixed(2)}% dari views
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* TREN CHART & ACCOUNTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* LINE CHART CONTAINER */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:col-span-8 shadow-2xs flex flex-col justify-between">
                  <div className="mb-4">
                    <h4 className="text-base font-black text-slate-800">Visualisasi Metrik Tren GMV Harian</h4>
                    <p className="text-[11px] font-semibold text-slate-450 mt-0.5">Rentang performa berdasarkan filter waktu yang Anda tentukan.</p>
                  </div>

                  <div className="h-64 w-full">
                    {filteredLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-4">
                        <span className="text-slate-400 text-xs italic font-bold">Belum ada data visualisasi dalam rentang waktu terfilter.</span>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsLineChart
                          data={[...filteredLogs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                          <YAxis 
                            yAxisId="left" 
                            tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(val) => `Rp${(val/1000).toFixed(0)}rb`}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', fontWeight: 'bold', fontSize: '12px' }}
                            formatter={(value: any, name: string) => [
                              name === "GMV" ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value) : value, 
                              name
                            ]}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                          <Line yAxisId="left" type="monotone" name="GMV" dataKey="gmv" stroke="#4f46e5" strokeWidth={3} dot={{r:4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff"}} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* BRAND ACCOUNTS SIDEBAR CARD */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xs flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" /> Kredensial & PIC Akun Live
                      </h4>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Akun marketplace Anda yang didaftarkan pada Liva.</p>
                      
                      <div className="space-y-3 mt-4">
                        {clientBrand?.accounts && clientBrand.accounts.length > 0 ? (
                          clientBrand.accounts.map((acc, idx) => (
                            <div key={acc.id || idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-left">
                              <span className="font-black text-indigo-700 uppercase tracking-widest text-[9px] block mb-1.5">{acc.type}</span>
                              <div className="space-y-1 font-mono text-[11px] text-slate-600">
                                <div>Username: <strong className="text-slate-800">{acc.username}</strong></div>
                                <div>Password: <strong className="text-slate-800">{acc.password}</strong></div>
                              </div>
                              <div className="text-[10px] text-slate-500 font-bold mt-2.5 pt-1.5 border-t border-slate-200/60 flex items-center gap-1.5">
                                PIC OTP: <span className="bg-white px-1.5 py-0.5 rounded border border-slate-250 text-indigo-950 font-black">{acc.picOtp || "-"}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 italic font-semibold py-6 text-center text-xs">Belum ada akun terdaftar.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                                {/* DETAILED LOG FEED TABLE */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-2xs overflow-hidden">
                <div className="p-6 border-b border-indigo-50/50 bg-[#fafafd] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <ListFilter className="w-5 h-5 text-indigo-600" /> Log Transaksi & GMV Lengkap (All-Time)
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Rincian data penyiaran per shift live streaming brand Anda.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-indigo-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="px-6 py-4">Waktu Mulai</th>
                        <th className="px-6 py-4">Streaming / Sesi</th>
                        <th className="px-6 py-4 text-right">Durasi & Fans</th>
                        <th className="px-6 py-4 text-right">Perolehan GMV & AOV</th>
                        <th className="px-6 py-4 text-right">Qty Terjual & Klik</th>
                        <th className="px-6 py-4 text-right">Pembeli & Checkout</th>
                        <th className="px-6 py-4 text-right">CTR / CVR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/20">
                            Belum ada rekam data laporan yang diunggah untuk kriteria filter periode ini.
                          </td>
                        </tr>
                      ) : (
                        [...filteredLogs]
                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((row, idx) => {
                            const actualCtr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
                            const finalCvr = row.impressions > 0 ? (row.buyers / row.impressions) * 100 : 0;
                            return (
                              <tr key={idx} className="hover:bg-indigo-55/10 transition-colors text-xs font-semibold text-slate-700">
                                <td className="px-6 py-4 whitespace-nowrap text-slate-850">
                                  {row.date}
                                  <span className="block text-[9px] font-extrabold uppercase text-slate-400 mt-1">
                                    {row.platform}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-left">
                                  <div className="font-extrabold text-indigo-950 leading-tight">{row.title}</div>
                                  {row.platform === "TikTok Live" && (
                                    <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-1">
                                      <span>❤️ {new Intl.NumberFormat('id-ID').format(row.likes || 0)} Likes</span>
                                      <span>•</span>
                                      <span>🔗 {new Intl.NumberFormat('id-ID').format(row.shares || 0)} Shares</span>
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <div className="font-semibold text-slate-650">{row.duration} mnt</div>
                                  {row.platform === "TikTok Live" && row.followers > 0 && (
                                    <div className="text-[9px] font-black text-green-600 mt-1">+{row.followers} Fans</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <div className="font-black text-emerald-600">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.gmv)}
                                  </div>
                                  <div className="text-[9px] font-extrabold text-slate-400 mt-0.5">AOV: Rp{Math.round(row.aov || 0).toLocaleString('id-ID')}</div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <div className="font-bold text-slate-700">{row.products_sold || 0} Pcs</div>
                                  {row.platform === "TikTok Live" && row.clicks > 0 && (
                                    <div className="text-[9px] text-slate-400 font-bold mt-1">🛍️ {row.clicks} Klik</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  <div className="font-bold text-slate-755">{row.buyers || 0} Users</div>
                                  {row.platform === "TikTok Live" && row.orders > 0 && (
                                    <div className="text-[9px] text-pink-500 font-bold mt-1">🛒 {row.orders} Checkout</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                  {row.platform === "TikTok Live" ? (
                                    <>
                                      <div className="font-black text-indigo-600">CTR: {actualCtr.toFixed(1)}%</div>
                                      <div className="text-[9px] font-black text-slate-500 mt-1">CVR: {finalCvr.toFixed(2)}%</div>
                                    </>
                                  ) : (
                                    <span className="text-slate-300 font-bold">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </main>
        );
      })()}

      {/* ========================================================== */}
      {/* 2. OPERATOR VIEWPORT (DESKTOP FRIENDLY DASHBOARD CONTAINER) */}
      {/* ========================================================== */}
      {isOperatorLoggedIn && (
        <main className="flex-1 p-0 max-w-none w-full" id="system-main-viewport">
          <div className="flex bg-[#fcfbfe] flex-1 text-slate-800 w-full" id="operator_dashboard_panel">
            {/* 1. LEFT VERTICAL SIDEBAR */}
            <aside className={`transition-all duration-200 ease-in-out ${isSidebarVisible ? "w-68 p-5 opacity-100 border-r" : "w-0 p-0 overflow-hidden opacity-0 border-r-0"} flex-shrink-0 bg-white border-slate-100 flex flex-col justify-between sticky top-0 h-screen font-sans`} id="operator_sidebar">
                  <div className="space-y-6">
                    <div className="px-2 py-4 border-b border-purple-50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                        LM
                      </div>
                      <div>
                        <span className="text-[9px] font-black tracking-widest text-[#2563eb] block uppercase">LIVA MEDIA</span>
                        <h2 className="text-xs font-black text-slate-900 font-sans tracking-wide">OPERATOR DESKTOP</h2>
                      </div>
                    </div>

                    <nav className="space-y-1.5" id="sidebar_nav">
                      {[
                        { tabId: "dashboard_utama", label: "Dashboard Utama", icon: LayoutDashboard },
                        { type: "header", label: "Manajemen Host", key: "cat-host" },
                        { tabId: "absensi", label: "Calender Kerja Host", icon: Calendar, category: "cat-host" },
                        { tabId: "rekap_gaji", label: "Absen & Payroll", icon: DollarSign, category: "cat-host" },
                        { tabId: "database", label: "Database Absen", badgeCount: logs.length, icon: ClipboardList, category: "cat-host" },
                        { tabId: "credentials", label: "Kredensial Host", icon: ShieldCheck, category: "cat-host" },
                        { type: "header", label: "Manajemen Client", key: "cat-client" },
                        { tabId: "data_brand", label: "Data Brand", icon: Briefcase, category: "cat-client" },
                        { tabId: "reporting_brand", label: "Reporting Brand (Upload)", icon: LineChart, category: "cat-client" },
                        { tabId: "leads", label: "Leads/Calon Client", icon: Users, category: "cat-client" },
                        { type: "header", label: "Sistem & Integrasi", key: "cat-system" },
                        { tabId: "copilot", label: "Asisten AI Copilot", icon: Sparkles, category: "cat-system" },
                        { tabId: "settings", label: "Platform & Shift", icon: Sliders, category: "cat-system" },
                        { tabId: "sheets", label: "Spreadsheet Sync", icon: FileSpreadsheet, category: "cat-system" },
                        { type: "header", label: "Keamanan Akun", key: "cat-security" },
                        { tabId: "admin_privacy", label: "Privasi Master Admin", icon: Lock, category: "cat-security" },
                      ].map((item, index) => {
                        if (item.type === "header") {
                          const isExpanded = expandedCategories[item.key!];
                          return (
                            <div key={`header-${index}`} className="pt-4 pb-1">
                              <button 
                                onClick={() => setExpandedCategories(prev => ({ ...prev, [item.key!]: !isExpanded }))}
                                className="w-full px-3.5 flex items-center justify-between group cursor-pointer text-left focus:outline-none"
                              >
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">{item.label}</p>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                                )}
                              </button>
                            </div>
                          );
                        }

                        if (item.category && !expandedCategories[item.category]) {
                          return null;
                        }

                        const IconComponent = item.icon as any;
                        const isActive = operatorTab === item.tabId;

                        return (
                          <button
                            key={item.tabId}
                            onClick={() => {
                              if (item.tabId) setOperatorTab(item.tabId);
                              setSelectedLogIds([]);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all relative group cursor-pointer border-0 text-left ${
                              isActive
                                ? "bg-slate-50 text-slate-950 focus:outline-none"
                                : "text-slate-500 hover:text-slate-[#2563eb] hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isActive && (
                                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] bg-[#2563eb] rounded-r-md" />
                              )}
                              <IconComponent className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-[#2563eb]" : "text-slate-400"}`} />
                              <span className={isActive ? "font-extrabold text-[#111827]" : "font-semibold"}>{item.label}</span>
                            </div>
                            {item.badgeCount !== undefined && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${isActive ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500"}`}>
                                {item.badgeCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="border-t border-slate-50 pt-4" id="sidebar_operator_profile">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">
                            OP
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div>
                          <h5 className="text-[11px] font-black text-slate-850 leading-none">Agency Operator</h5>
                          <span className="text-[9px] text-[#2563eb] font-bold tracking-wide">Studio Aktif</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOperatorLoggedIn(false)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
                        title="Sign Out"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </aside>

                {/* 2. RIGHT WORKSPACE CONTENT */}
                <div className="flex-1 min-h-screen flex flex-col bg-[#fafafc]" id="operator_workspace">
                  {/* WORKSPACE TOPBAR CONTROL BOARD */}
                  <header className="bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between sticky top-0 z-40" id="workspace_topbar">
                    <div className="flex items-center gap-3">
                      {/* Sidebar Toggle Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsSidebarVisible(prev => !prev)}
                        className="p-1.5 -ml-1 text-[#2563eb] hover:bg-blue-50 border border-slate-100 rounded-lg transition-all cursor-pointer bg-transparent flex items-center justify-center shadow-3xs"
                        title={isSidebarVisible ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
                      >
                        <Menu className="w-4 h-4 hover:scale-110 active:scale-90 transition-transform" />
                      </button>

                      <h1 className="text-sm font-black text-slate-900 font-sans flex items-center gap-2">
                        {operatorTab === "dashboard_utama" && <span>Executive Intelligence Dashboard</span>}
                        {operatorTab === "absensi" && <span>Calender Kerja Host</span>}
                        {operatorTab === "rekap_gaji" && <span>Kalkulator & Penggajian Streamer</span>}
                        {operatorTab === "database" && <span>Database Logs Kehadiran</span>}
                        {operatorTab === "data_brand" && <span>Manajemen Data Brand Klien</span>}
                        {operatorTab === "reporting_brand" && <span>Reporting Eksternal Brand</span>}
                        {operatorTab === "leads" && <span>Leads & Calon Klien</span>}
                        {operatorTab === "copilot" && <span>Asisten AI Agency Copilot</span>}
                        {operatorTab === "settings" && <span>Pengaturan Platform & Shift Siaran</span>}
                        {operatorTab === "credentials" && <span>Kredensial Login Streamer</span>}
                        {operatorTab === "sheets" && <span>Sinkronisasi Google Sheets</span>}
                        {operatorTab === "admin_privacy" && <span>Privasi Akun Master Admin</span>}
                      </h1>
                    </div>

                    <div className="flex items-center gap-4">
                      {["absensi", "rekap_gaji"].includes(operatorTab) && (
                        <div className="relative min-w-[240px] hidden md:block">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari host streamer..."
                            value={salarySearch}
                            onChange={(e) => setSalarySearch(e.target.value)}
                            className="bg-slate-55 bg-[#faf9fe] border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 focus:outline-none focus:border-blue-500 w-full font-bold"
                          />
                        </div>
                      )}
                      {operatorTab === "database" && (
                        <div className="relative min-w-[240px] hidden md:block">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari nama atau ID..."
                            value={dbSearch}
                            onChange={(e) => setDbSearch(e.target.value)}
                            className="bg-slate-55 bg-[#faf9fe] border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-950 focus:outline-none focus:border-blue-500 w-full font-bold"
                          />
                        </div>
                      )}

                      <div className="relative" id="notifications_dropdown_wrapper">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationOpen(!isNotificationOpen);
                          }}
                          className={`relative p-2 rounded-xl transition-all cursor-pointer border-0 bg-transparent flex items-center justify-center ${
                            isNotificationOpen 
                              ? "text-indigo-650 bg-indigo-50" 
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                          title="Notifikasi Aktivitas"
                        >
                          <Bell className="w-5 h-5" />
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white border-2 border-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </button>

                        {isNotificationOpen && (
                          <>
                            {/* Backdrop overlay to dismiss on click outside */}
                            <div 
                              className="fixed inset-0 z-45"
                              onClick={() => setIsNotificationOpen(false)}
                            />

                            <div 
                              className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200/95 rounded-3xl shadow-xl z-50 text-left overflow-hidden animate-fadeIn"
                              id="notifications_panel"
                            >
                              {/* Header */}
                              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Bell className="w-4 h-4 text-indigo-300 animate-pulse" />
                                  <span className="text-xs font-black tracking-wide uppercase">Notifikasi Aktivitas</span>
                                  {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                      {notifications.filter(n => !n.read).length} Baru
                                    </span>
                                  )}
                                </div>
                                {notifications.length > 0 && (
                                  <button
                                    onClick={() => {
                                      markAllNotificationsAsRead();
                                    }}
                                    className="text-[10px] font-black text-indigo-200 hover:text-white transition-colors cursor-pointer bg-transparent border-0 underline"
                                  >
                                    Tandai semua dibaca
                                  </button>
                                )}
                              </div>

                              {/* Notifications List */}
                              <div className="max-h-[360px] overflow-y-auto custom-scroll divide-y divide-slate-100">
                                {notifications.length === 0 ? (
                                  <div className="p-8 text-center text-slate-400 space-y-2">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                      <Bell className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-black text-slate-500">Semua Beres! 🎉</p>
                                    <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mx-auto leading-relaxed">
                                      Belum ada notifikasi baru untuk saat ini. Seluruh sistem berjalan lancar.
                                    </p>
                                  </div>
                                ) : (
                                  notifications.map((notif) => {
                                    let typeBg = "bg-indigo-50 text-indigo-600 border-indigo-100";
                                    if (notif.type === "success") {
                                      typeBg = "bg-emerald-50 text-emerald-600 border-emerald-100";
                                    } else if (notif.type === "warning") {
                                      typeBg = "bg-amber-50 text-amber-600 border-amber-100";
                                    } else if (notif.type === "danger" || notif.type === "error") {
                                      typeBg = "bg-red-50 text-red-600 border-red-100";
                                    } else if (notif.type === "info") {
                                      typeBg = "bg-blue-50 text-blue-600 border-blue-100";
                                    }

                                    return (
                                      <div 
                                        key={notif.id}
                                        onClick={() => {
                                          setNotifications(prev => {
                                            const updated = prev.map(n => n.id === notif.id ? { ...n, read: true } : n);
                                            localStorage.setItem("mcn_notifications_v1", JSON.stringify(updated));
                                            return updated;
                                          });
                                          if (notif.actionTab) {
                                            setOperatorTab(notif.actionTab as any);
                                            setIsNotificationOpen(false);
                                          }
                                        }}
                                        className={`p-4 transition-all cursor-pointer hover:bg-slate-50 flex items-start gap-3 relative text-left ${
                                          !notif.read ? "bg-slate-50/70 border-l-2 border-indigo-600" : ""
                                        }`}
                                      >
                                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-xs ${typeBg}`}>
                                          {notif.type === "success" && <Check className="w-4 h-4" />}
                                          {notif.type === "info" && <Sparkles className="w-4 h-4" />}
                                          {notif.type === "warning" && <AlertTriangle className="w-4 h-4" />}
                                          {(notif.type === "danger" || notif.type === "error") && <X className="w-4 h-4" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between gap-2">
                                            <h5 className="text-[11px] font-black text-slate-800 truncate uppercase tracking-tight">
                                              {notif.title}
                                            </h5>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notif.id);
                                              }}
                                              className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md border-0 bg-transparent cursor-pointer"
                                              title="Hapus"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                                            {notif.description}
                                          </p>
                                          <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] text-slate-400 font-bold">
                                              {new Date(notif.timestamp).toLocaleString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                day: "numeric",
                                                month: "short"
                                              })}
                                            </span>
                                            {notif.actionTab && (
                                              <span className="text-[8.5px] font-black text-indigo-650 hover:underline flex items-center gap-0.5">
                                                Akses Menu &rarr;
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>

                              {/* Footer Actions */}
                              {notifications.length > 0 && (
                                <div className="bg-slate-50 p-2.5 border-t border-slate-100 flex items-center justify-center">
                                  <button
                                    onClick={clearAllNotifications}
                                    className="text-[10px] font-black text-red-650 hover:text-red-750 hover:bg-red-50 px-4 py-1.5 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                                  >
                                    Hapus Semua Riwayat Notifikasi
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* WORKSPACE AREA CONTAINER */}
                  <div className="p-6 max-w-7xl w-full mx-auto space-y-6 flex-1 pb-24 relative">

            {/* ==================== SUBTAB: 1. DASHBOARD UTAMA ⭐ ==================== */}
            {operatorTab === "dashboard_utama" && (
              <div className="space-y-6 animate-fadeIn" id="operator_dashboard_utama_content">
                
                {/* Executive Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="executive_metrics_dashboard">
                  {/* Total Hosts */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest block mb-1">
                      Total Host Streamer
                    </span>
                    <div className="text-3xl font-black font-mono text-purple-950 mb-1">
                      {hosts.length} <span className="text-xs text-purple-400 font-semibold font-sans">Orang</span>
                    </div>
                    <div className="text-[11px] text-purple-600/85 font-semibold flex items-center gap-1.5 mt-2">
                       Terbagi di {studios.length} lokasi studio Liva Agency
                    </div>
                  </div>

                  {/* Client Total */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block mb-1">
                      Data Client (Brand) Aktif
                    </span>
                    <div className="text-3xl font-black font-mono text-emerald-650 mb-1">
                      {clientBrands.length} <span className="text-xs text-emerald-400 font-semibold font-sans">Brand</span>
                    </div>
                    <p className="text-[10.5px] text-purple-400 font-semibold mt-2">Total Mitra Eksklusif Liva Agency</p>
                  </div>

                  {/* Sesi Total */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm">
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-widest block mb-1">
                      Total Penjadwalan Sesi
                    </span>
                    <div className="text-3xl font-black font-mono text-purple-900 mb-1 flex items-baseline gap-2">
                      <span>{clientBrands.flatMap(b => b.sessions).length}</span>
                      <span className="text-[11px] font-semibold text-purple-400 font-sans tracking-wide">Sesi Siaran</span>
                    </div>
                    <p className="text-[10.5px] text-purple-400 font-semibold mt-2">Siaran perputaran di berbagai platform</p>
                  </div>
                </div>

                {/* SESI BERDASARKAN PLATFORM */}
                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm">
                  <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm mb-4 border-b border-purple-50 pb-3">
                    <Monitor className="w-4.5 h-4.5 text-purple-500" />
                    TOTAL SESI DARI MASING-MASING PLATFORM
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(
                        clientBrands.flatMap(b => b.sessions).reduce((acc, sess) => {
                          if (sess.platform) {
                            acc[sess.platform] = (acc[sess.platform] || 0) + 1;
                          }
                          return acc;
                        }, {} as Record<string, number>)
                    ).map(([plat, count]) => (
                      <div key={plat} className="p-4 rounded-xl border border-purple-50 bg-[#fbfaff]/50 flex flex-col justify-center items-center">
                        <span className="text-[11px] font-black text-purple-950 block mb-1 text-center">📱 {plat}</span>
                        <span className="font-mono font-black text-2xl text-purple-700">{count}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sesi</span>
                      </div>
                    ))}
                    {clientBrands.flatMap(b => b.sessions).length === 0 && (
                        <div className="col-span-2 md:col-span-4 text-center py-6 text-slate-400 text-xs font-semibold">
                            Belum ada jadwal sesi platform.
                        </div>
                    )}
                  </div>
                </div>

                {/* TABEL INVOICE & MEETING DATES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tabel Invoice Deadline */}
                  <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm mb-4 border-b border-purple-50 pb-3">
                      <DollarSign className="w-5 h-5 text-emerald-500" />
                      DEADLINE INVOICE CLIENT
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] font-black tracking-wider text-slate-500">
                                    <th className="py-2.5 px-3">Nama Brand</th>
                                    <th className="py-2.5 px-3">Tgl Jatuh Tempo</th>
                                    <th className="py-2.5 px-3">Jumlah Sesi</th>
                                    <th className="py-2.5 px-3 text-right">Berakhir Kontrak</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clientBrands.length > 0 ? clientBrands.map((b) => (
                                    <tr key={`inv-${b.id}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-800">{b.name}</td>
                                        <td className="py-2 px-3 font-semibold text-emerald-600">
                                            {b.invoiceDate ? `Tgl ${b.invoiceDate}` : <span className="text-slate-300">-</span>}
                                        </td>
                                        <td className="py-2 px-3 font-semibold text-purple-600">
                                            {b.sessions ? b.sessions.length : 0} Sesi
                                        </td>
                                        <td className="py-2 px-3 text-right font-semibold text-slate-500">
                                            {b.contractEndDate || "-"}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center py-4 text-slate-400 font-semibold">Belum ada brand tersimpan</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </div>
                  
                  {/* Tabel Tanggal Meeting */}
                  <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm mb-4 border-b border-purple-50 pb-3">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      JADWAL MEETING (MEETING DATES)
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[9px] font-black tracking-wider text-slate-500">
                                    <th className="py-2.5 px-3">Nama Brand</th>
                                    <th className="py-2.5 px-3 text-right">Tgl Bulanan Meeting</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clientBrands.length > 0 ? clientBrands.map((b) => (
                                    <tr key={`meet-${b.id}`} className="hover:bg-slate-50 transition-colors">
                                        <td className="py-2 px-3 font-bold text-slate-800">{b.name}</td>
                                        <td className="py-2 px-3 text-right font-semibold text-blue-600">
                                            {b.monthlyMeetingDate ? `Tgl ${b.monthlyMeetingDate}` : <span className="text-slate-300">-</span>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={2} className="text-center py-4 text-slate-400 font-semibold">Belum ada jadwal meeting</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                  </div>
                </div>

                {/* TABEL SLOT STUDIO DI PLOT BRAND (URUTAN SHIFT JAM) */}
                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm overflow-hidden" id="studio_slots_panel">
                  <div className="flex items-center gap-2 text-purple-800 font-extrabold text-sm mb-4 border-b border-purple-50 pb-3">
                    <Radio className="w-5 h-5 text-indigo-500" />
                    PLOT SLOT STUDIO BERDASARKAN SHIFT
                  </div>
                  <p className="text-xs text-purple-900/60 font-semibold mb-4">
                    Pemetaan pemakaian Studio yang telah dialokasikan kepada brand terkait sesuai jam tayang.
                  </p>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-[#f8f9fc] border-b border-slate-200 uppercase text-[10px] font-black tracking-wider text-slate-500 whitespace-nowrap">
                                <th className="py-3 px-4 border-r border-slate-100">Nama Studio</th>
                                {shifts.map(sh => (
                                    <th key={sh} className="py-3 px-4 border-r border-slate-100 last:border-r-0">{sh}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(() => {
                                const allStudioNames = Array.from(new Set([
                                  ...studios.map(s => s.name),
                                  ...clientBrands.flatMap(b => b.sessions?.map(s => s.studio || "") || []).filter(Boolean)
                                ])).sort();

                                if (allStudioNames.length === 0) {
                                    return (
                                        <tr>
                                            <td colSpan={shifts.length + 1} className="py-8 text-center text-slate-400 font-semibold">
                                                Belum ada data studio / pemetaan slot.
                                            </td>
                                        </tr>
                                    );
                                }

                                return allStudioNames.map((studioName, i) => (
                                    <tr key={`studio-row-${i}`} className="hover:bg-purple-50/40 transition-colors">
                                        <td className="py-2.5 px-4 font-extrabold text-slate-800 border-r border-slate-100 whitespace-nowrap">{studioName}</td>
                                        {shifts.map(shift => {
                                            const occupyingBrands = clientBrands
                                                .filter(b => b.sessions?.some(s => s.studio === studioName && s.shift === shift))
                                                .map(b => b.name);
                                            
                                            return (
                                                <td key={shift} className="py-2.5 px-4 font-bold text-slate-700 border-r border-slate-100 last:border-r-0">
                                                    {occupyingBrands.length > 0 ? occupyingBrands.join(", ") : ""}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== SUBTAB: 2. CALENDAR JADWAL KERJA HOST ==================== */}
            {operatorTab === "absensi" && (
              <div className="space-y-6 animate-fadeIn" id="operator_absensi_content">
                

                {/* CALENDAR VIEW UNTUK JADWAL HOST */}
                <div className="bg-[#fafafc] w-full font-sans">
                  <div className="bg-white rounded-[20px] p-6 shadow-sm">
                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-1 leading-none tracking-tight flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-[#2563eb]" /> 
                          Jadwal Host
                        </h2>
                        <p className="text-[13px] text-slate-500 font-medium">Manajemen Jadwal Siaran (Roster) Seluruh Host</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex -space-x-2">
                           {hosts.slice(0, 4).map((h, i) => (
                             <div key={h.id} className="w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-bold z-30 shadow-sm" style={{ backgroundColor: '#' + Math.floor(Math.random()*16777215).toString(16).padEnd(6, '0') + '40', color: '#1e293b' }}>
                               {h.name.substring(0, 2).toUpperCase()}
                             </div>
                           ))}
                           {hosts.length > 4 && (
                             <div className="w-8 h-8 rounded-full bg-slate-50 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-600 z-0">
                               +{hosts.length - 4}
                             </div>
                           )}
                         </div>
                      </div>
                    </div>

                    {/* Tabs & Filters */}
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 border-b border-slate-100/80 pb-4">
                       <div className="flex items-center gap-2.5 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0 hide-scrollbar -mb-[17px]">
                          <button type="button" className="px-3 py-2.5 rounded-none border-b-2 border-slate-800 text-slate-800 font-bold text-[13px] flex items-center gap-2 whitespace-nowrap">
                            <Calendar className="w-4 h-4" strokeWidth={2.5} /> Jadwal Aktif
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                              
                               requestConfirm("Konfirmasi Auto Generate", "Auto Generate akan membuat jadwal harian untuk seluruh sesi di bulan ini (dan menghapus jadwal lama yang berpotongan). Lanjutkan?", () => {
                               const [yearStr, monthStr] = operatorSelectedMonth.split("-");
                               const year = parseInt(yearStr);
                               const month = parseInt(monthStr) - 1;
                               
                               const daysInMonth = new Date(year, month + 1, 0).getDate();
                               const newSchedules = [];
                               
                               for (let day = 1; day <= daysInMonth; day++) {
                                 const d = new Date(year, month, day);
                                 // format YYYY-MM-DD
                                 const yyyy = d.getFullYear();
                                 const mm = String(d.getMonth() + 1).padStart(2, '0');
                                 const dd = String(d.getDate()).padStart(2, '0');
                                 const dateStr = `${yyyy}-${mm}-${dd}`;
                                 
                                 clientBrands.forEach(brand => {
                                   if (brand.sessions) {
                                     brand.sessions.forEach(sess => {
                                        if (!sess.host) return;
                                        
                                        // find the host
                                        const hostObj = hosts.find(h => h.name === sess.host);
                                        if (hostObj) {
                                          newSchedules.push({
                                            id: `auto_gen_${brand.id}_${dateStr}_${sess.id}`,
                                            hostId: hostObj.id,
                                            date: dateStr,
                                            timeSlot: sess.shift,
                                            platform: sess.platform || "",
                                            brand: brand.name,
                                            status: "Assigned",
                                            studio: sess.studio || "Studio Bandar Lampung",
                                            isOffDay: false,
                                            isPindahStudio: false,
                                            backupOption: "none",
                                            backupHostId: "",
                                            backupHostName: "", hostName: hostObj.name
                                          });
                                        }
                                     });
                                   }
                                 });
                               }
                               
                               // Replace existing schedules for this month with the newly generated ones
                               setSchedules(prev => {
                                 const filtered = prev.filter(s => {
                                   const sDate = new Date(s.date);
                                   return sDate.getFullYear() !== year || sDate.getMonth() !== month;
                                 });
                                 return [...filtered, ...newSchedules];
                               });
                               
                               addNotification("Jadwal Berhasil Dibuat", `Auto Generate selesai memproduksi ${newSchedules.length} sesi untuk bulan ${getIndonesianMonthLabel(operatorSelectedMonth)}.`, "success", "absensi");
                               }, "info");

                            }}
                            className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-slate-400 font-bold text-[13px] flex items-center gap-2 hover:text-slate-600 transition-colors whitespace-nowrap">
                            <Sparkles className="w-4 h-4" strokeWidth={2.5} /> Auto Generate
                          </button>
                          <button 
                            type="button"
                            onClick={() => {
                               requestConfirm(
                                 "Reset Jadwal Bulan Ini", 
                                 "Apakah Anda yakin ingin menghapus SELURUH jadwal untuk bulan ini? Tindakan ini tidak dapat dibatalkan.", 
                                 () => {
                                    const [yearStr, monthStr] = operatorSelectedMonth.split('-');
                                    const year = parseInt(yearStr);
                                    const month = parseInt(monthStr) - 1;
                                    setSchedules(prev => prev.filter(s => {
                                        const sDate = new Date(s.date);
                                        return sDate.getFullYear() !== year || sDate.getMonth() !== month;
                                    }));
                                    addNotification("Jadwal Direset", `Seluruh jadwal bulan ini berhasil dihapus.`, "danger", "absensi");
                                 }, 
                                 "danger"
                               );
                            }}
                            className="px-3 py-2.5 rounded-none border-b-[3px] border-transparent text-rose-500 font-bold text-[13px] flex items-center gap-2 hover:text-rose-700 transition-colors whitespace-nowrap">
                            <Trash2 className="w-4 h-4" strokeWidth={2.5} /> Reset Jadwal
                          </button>
                       </div>
                       <div className="flex items-center gap-2 w-full xl:w-auto overflow-x-auto hide-scrollbar">
                          <button 
                             type="button"
                             onClick={() => {
                               // Open generic create modal
                               setIsScheduleModalOpen(true);
                               setScheduleForm({
                                  id: "",
                                  hostId: hosts[0]?.id || "",
                                  timeSlot: shifts[0] || "",
                                  brand: brands[0] || "",
                                  platform: platforms[0] || "",
                                  studio: studios[0]?.name || "",
                                  isOffDay: false,
                                  isPindahStudio: false,
                                  backupOption: "none",
                                  backupHostId: ""
                               });
                             }}
                             className="px-4 py-2 bg-[#1e1b2e] hover:bg-[#2c2844] border-0 rounded-xl text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-sm">
                            <Plus className="w-4 h-4" /> Entry Manual Baru
                          </button>
                       </div>
                    </div>

                    {/* JADWAL TERDAFTAR SEBELUMNYA PADA HARI INI */}
                        <div className="space-y-3 mb-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4 flex-wrap gap-2">
                            <h5 className="text-[14px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                              <span>📋</span> Jadwal Siaran Aktif Tanggal Ini
                            </h5>
                            <div className="flex items-center gap-3">
                              <div className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                                {(()=>{
                                  try {
                                    const d = new Date(selectedCalendarDate);
                                    if(isNaN(d.getTime())) return selectedCalendarDate;
                                    return d.toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                  } catch (e) {
                                    return selectedCalendarDate;
                                  }
                                })()}
                              </div>
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Cari host/brand..."
                                  value={scheduleModalSearch}
                                  onChange={(e) => setScheduleModalSearch(e.target.value)}
                                  className="w-[180px] bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold"
                                />
                              </div>
                              <span className="px-3 py-1.5 rounded-lg bg-indigo-50 text-xs font-mono font-bold text-indigo-700">
                                {computedSchedules.filter(s => s.date === selectedCalendarDate).length} Terdaftar
                              </span>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {(() => {
                              let dayScheds = computedSchedules.filter(s => s.date === selectedCalendarDate);
                              
                              if (scheduleModalSearch.trim()) {
                                const q = scheduleModalSearch.toLowerCase();
                                dayScheds = dayScheds.filter(s => 
                                  s.hostName?.toLowerCase().includes(q) || 
                                  s.brand?.toLowerCase().includes(q) || 
                                  s.platform?.toLowerCase().includes(q) ||
                                  s.studio?.toLowerCase().includes(q)
                                );
                              }

                              const timeRegex = /\b(\d{2}:\d{2})\b/;
                              dayScheds.sort((a, b) => {
                                const matchA = (a.timeSlot || "").match(timeRegex);
                                const matchB = (b.timeSlot || "").match(timeRegex);
                                const timeA = matchA ? matchA[1] : a.timeSlot;
                                const timeB = matchB ? matchB[1] : b.timeSlot;
                                
                                if (timeA < timeB) return -1;
                                if (timeA > timeB) return 1;
                                return 0;
                              });

                              if (dayScheds.length === 0) {
                                return (
                                  <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    {scheduleModalSearch ? "Tidak ada jadwal yang sesuai pencarian." : "Belum ada jadwal terdaftar untuk tanggal yang dipilih."}
                                  </div>
                                );
                              }

                              const uniqueScheds = Array.from(new Map(dayScheds.map(s => [s.id, s])).values());
                              
                              return uniqueScheds.map((sch) => {
                                const isOff = sch.isOffDay;
                                return (
                                  <div 
                                    key={sch.id}
                                    className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 text-sm ${
                                      isOff 
                                        ? "bg-amber-50/50 border-amber-200" 
                                        : sch.backupHostId 
                                        ? "bg-emerald-50/40 border-emerald-250" 
                                        : "bg-slate-50/45 border-slate-100"
                                    }`}
                                  >
                                    <div>
                                      <div className="font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
                                        <span className="text-xs bg-slate-200 font-mono text-slate-700 px-2 py-1 rounded leading-none">
                                          {sch.timeSlot}
                                        </span>
                                        <span className="text-base text-slate-800">{sch.hostName}</span>
                                        <span className="text-[11px] text-slate-400 font-mono font-medium">({sch.employeeId})</span>
                                      </div>
                                      
                                      <div className="text-xs text-slate-600 mt-1.5 flex items-center gap-1.5">
                                        🛍️ Brand: <b>{sch.brand}</b> ({sch.platform}) <span className="text-slate-300">•</span> 🏢 {sch.studio}
                                      </div>

                                      {isOff && (
                                        <div className="text-xs text-amber-900 font-extrabold mt-1.5">
                                          🏖️ Off-Day Reguler — Di-backup Backup Host: <span className="underline text-amber-950">{sch.backupHostName || "Belum ditentukan"}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Action button edit/delete */}
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIsScheduleModalOpen(true);
                                          setScheduleForm({
                                            id: sch.id,
                                            hostId: sch.hostId,
                                            timeSlot: sch.timeSlot,
                                            brand: sch.brand,
                                            platform: sch.platform,
                                            studio: sch.studio,
                                            isOffDay: sch.isOffDay || false,
                                            isPindahStudio: sch.isPindahStudio || false,
                                            backupOption: sch.backupHostId ? 'backup' : 'none',
                                            backupHostId: sch.backupHostId || ""
                                          });
                                        }}
                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer flex items-center gap-1"
                                        title="Ubah Jadwal"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: "Hapus Jadwal",
                                            message: `Menghapus jadwal referensi ${sch.hostName} pada tanggal ${sch.date}?`,
                                            type: "danger",
                                            confirmText: "Hapus",
                                            onConfirm: () => {
                                              setSchedules(prev => prev.filter(s => s.id !== sch.id));
                                              setConfirmModal(null);
                                            }
                                          });
                                        }}
                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors border-0 cursor-pointer flex items-center gap-1"
                                        title="Hapus Jadwal"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>

                {/* Calendar Controls */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 p-2">
                       <div className="flex items-center gap-4">
                         <h3 className="text-xl font-bold text-slate-800 capitalize">
                           {(()=>{
                             const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                             return `${monthNames[calendarMonth]} ${calendarYear}`;
                           })()}
                         </h3>
                         <button 
                           type="button"
                           onClick={() => {
                             const now = new Date();
                             setCalendarMonth(now.getMonth());
                             setCalendarYear(now.getFullYear());
                           }}
                           className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">
                           Hari Ini
                         </button>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              if (calendarMonth === 0) {
                                setCalendarMonth(11);
                                setCalendarYear(y => y - 1);
                              } else {
                                setCalendarMonth(m => m - 1);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (calendarMonth === 11) {
                                setCalendarMonth(0);
                                setCalendarYear(y => y + 1);
                              } else {
                                setCalendarMonth(m => m + 1);
                              }
                            }}
                            className="p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Main Monthly Calendar Layout (Modern & Clean) */}
                    <div className="border border-slate-100/80 rounded-[16px] overflow-hidden bg-white shadow-xs">
                      {/* Weekday Titles Header */}
                      <div className="grid grid-cols-7 border-b border-slate-100 bg-white">
                        {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((dayName, idx) => (
                           <div key={dayName} className="py-4 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center">
                             <span className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${idx === 0 ? "text-red-500" : "text-slate-400"}`}>
                               {dayName}
                             </span>
                           </div>
                        ))}
                      </div>

                      {/* Calendar Grid Body */}
                      <div className="grid grid-cols-7 bg-slate-50 gap-px">
                        {(() => {
                           const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                           const offset = new Date(calendarYear, calendarMonth, 1).getDay();
                           
                           const cells = [];
                           // Fill initial blanks
                           for (let i = 0; i < offset; i++) {
                             cells.push(<div key={`blank-${i}`} className="bg-slate-50/40 min-h-[140px]" />);
                           }
                           
                           // Fill actual days
                           for (let i = 1; i <= daysInMonth; i++) {
                             const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                             const daySchedules = computedSchedules.filter(s => s.date === dateString);
                             const isSelected = selectedCalendarDate === dateString;
                             const isToday = (new Date().toISOString().split('T')[0]) === dateString;
                             
                             cells.push(
                               <div
                                 key={i}
                                 onClick={() => setSelectedCalendarDate(dateString)}
                                 className={`min-h-[140px] p-2.5 transition-all flex flex-col justify-start cursor-pointer group relative bg-white ${
                                   isSelected ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/10" : "hover:bg-slate-50"
                                 }`}
                               >
                                 <div className="flex justify-between items-center mb-2 relative">
                                   <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                     isToday ? "bg-indigo-600 text-white" : "text-slate-700"
                                   }`}>
                                     {i}
                                   </span>
                                   <div className="flex items-center gap-1">
                                     {daySchedules.length > 0 && (
                                       <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-500">
                                         {daySchedules.length} Sesi
                                       </span>
                                     )}
                                   </div>
                                 </div>
                                 
                                 <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[100px] hide-scrollbar">
                                   {(()=>{
                                     const groupedSchedules = {};
                                     daySchedules.forEach(sch => {
                                       const stdName = sch.studio || "Studio Bandar Lampung";
                                       if (!groupedSchedules[stdName]) groupedSchedules[stdName] = [];
                                       groupedSchedules[stdName].push(sch);
                                     });

                                     return Object.entries(groupedSchedules).slice(0, 3).map(([stdName, scheds]) => (
                                       <div key={stdName} className="mb-1.5 last:mb-0 bg-slate-50 rounded p-1 border border-slate-100">
                                         <div className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-wider">{stdName}</div>
                                         <div className="space-y-1">
                                           {scheds.slice(0, 4).map((sch) => {
                                              const colorNum = sch.timeSlot.charCodeAt(0) % 5;
                                              const colorClasses = [
                                                "bg-[#f3e8ff] border-[#d8b4fe] text-[#6b21a8]",
                                                "bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1]",
                                                "bg-[#dcfce7] border-[#bbf7d0] text-[#15803d]",
                                                "bg-[#ffedd5] border-[#fdba74] text-[#c2410c]",
                                                "bg-[#fce7f3] border-[#fbcfe8] text-[#be185d]"
                                              ][colorNum];
                                              
                                              const isOff = sch.isOffDay;
                                              
                                              if (isOff) {
                                                return (
                                                  <div 
                                                    key={sch.id} 
                                                    onClick={(e) => { 
                                                      e.stopPropagation(); 
                                                      setIsScheduleModalOpen(true); 
                                                      setSelectedCalendarDate(sch.date);
                                                      setScheduleForm({
                                                        id: sch.id,
                                                        hostId: sch.hostId,
                                                        timeSlot: sch.timeSlot,
                                                        brand: sch.brand,
                                                        platform: sch.platform,
                                                        studio: sch.studio,
                                                        isOffDay: sch.isOffDay || false,
                                                        isPindahStudio: sch.isPindahStudio || false,
                                                        backupOption: sch.isPindahStudio || sch.isOffDay ? (sch.backupHostId ? "other" : "none") : "none",
                                                        backupHostId: sch.backupHostId || ""
                                                      }); 
                                                    }}
                                                    className="cursor-pointer hover:bg-slate-200 text-[8.5px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate">
                                                    🏖️ {sch.hostName} Off
                                                  </div>
                                                );
                                              }

                                              return (
                                                <div 
                                                  key={sch.id} 
                                                  onClick={(e) => { 
                                                      e.stopPropagation(); 
                                                      setIsScheduleModalOpen(true); 
                                                      setSelectedCalendarDate(sch.date);
                                                      setScheduleForm({
                                                        id: sch.id,
                                                        hostId: sch.hostId,
                                                        timeSlot: sch.timeSlot,
                                                        brand: sch.brand,
                                                        platform: sch.platform,
                                                        studio: sch.studio,
                                                        isOffDay: sch.isOffDay || false,
                                                        isPindahStudio: sch.isPindahStudio || false,
                                                        backupOption: sch.isPindahStudio || sch.isOffDay ? (sch.backupHostId ? "other" : "none") : "none",
                                                        backupHostId: sch.backupHostId || ""
                                                      }); 
                                                  }}
                                                  className={`cursor-pointer text-[8.5px] font-bold px-1 py-0.5 rounded border-l-[3px] truncate hover:brightness-95 ${colorClasses}`} 
                                                  title={`${sch.hostName} - ${sch.timeSlot}`}
                                                >
                                                  {sch.hostName}
                                                </div>
                                              );
                                           })}
                                           {scheds.length > 4 && (
                                              <div className="text-[8px] font-bold text-slate-400">
                                                + {scheds.length - 4} host
                                              </div>
                                           )}
                                         </div>
                                       </div>
                                     ));
                                   })()}
                                   {Object.keys(daySchedules.reduce((acc, sch) => {
                                       const stdName = sch.studio || "Studio Bandar Lampung";
                                       acc[stdName] = true;
                                       return acc;
                                    }, {})).length > 3 && (
                                      <div className="text-[9px] font-bold px-1.5 py-0.5 text-slate-400">
                                        + studio lainnya
                                      </div>
                                   )}
                                 </div>
                                 <button
                                   type="button"
                                   className="hidden group-hover:flex absolute bottom-2 right-2 items-center justify-center w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-full transition-all z-10 cursor-pointer"
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCalendarDate(dateString);
                                      setIsScheduleModalOpen(true);
                                      setScheduleForm({
                                        id: "",
                                        hostId: hosts[0]?.id || "",
                                        timeSlot: shifts[0] || "",
                                        brand: brands[0] || "",
                                        platform: platforms[0] || "",
                                        studio: studios[0]?.name || "",
                                        isOffDay: false,
                                        isPindahStudio: false,
                                        backupOption: "none",
                                        backupHostId: ""
                                      });
                                   }}
                                   title="Tambah Jadwal"
                                 >
                                   <Plus className="w-4 h-4" />
                                 </button>
                               </div>
                             );
                           }
                           
                           // Fill trailing blanks to complete the grid nicely
                           const totalCells = cells.length;
                           const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                           for (let i = 0; i < remaining; i++) {
                             cells.push(<div key={`blank-end-${i}`} className="bg-slate-50/40 min-h-[140px]" />);
                           }
                           
                           return cells;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                
                        {/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}
                {isScheduleModalOpen && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn font-sans" id="calendar_schedule_modal">
                    <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-scaleUp">
                      
                      {/* Modal Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-5 h-5 text-blue-105" />
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 block">Kelola Shift & Roster Jadwal</span>
                            <h4 className="text-sm font-black text-white">
                              {(() => {
                                try {
                                  const d = new Date(selectedCalendarDate);
                                  if (isNaN(d.getTime())) return selectedCalendarDate;
                                  return d.toLocaleDateString("id-ID", {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  });
                                } catch (e) {
                                  return selectedCalendarDate;
                                }
                              })()}
                            </h4>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsScheduleModalOpen(false)}
                          className="bg-transparent hover:bg-white/10 text-white p-2 rounded-xl transition-all cursor-pointer border-0 flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
                        
                        {/* FORM MASUKKAN DATA HOST & BACKUP */}
                        <div className="pt-4 border-t border-slate-100 space-y-4">
                          <h5 className="text-[11px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                            <span>✨</span>
                            {scheduleForm.id ? "Edit Jadwal Kerja Host & Backup" : "Masukkan Data Jadwal Host & Backup"}
                          </h5>

                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              
                              const selectedHost = hosts.find(h => h.id === scheduleForm.hostId);
                              if (!selectedHost) {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Gagal Menyimpan",
                                  message: "Silakan pilih Host terlebih dahulu!",
                                  type: "warning",
                                  hideCancel: true,
                                  confirmText: "Mengerti",
                                  onConfirm: () => setConfirmModal(null)
                                });
                                return;
                              }
                              
                              let repHostName = "";
                              if ((scheduleForm.isOffDay || scheduleForm.isPindahStudio) && scheduleForm.backupHostId) {
                                const repObj = hosts.find(h => h.id === scheduleForm.backupHostId);
                                if (repObj) {
                                  repHostName = repObj.name;
                                }
                              }

                              const newSchedule = {
                                id: scheduleForm.id 
                                      ? scheduleForm.id 
                                      : `sched_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                hostId: selectedHost.id,
                                hostName: selectedHost.name,
                                employeeId: selectedHost.employeeId,
                                date: selectedCalendarDate,
                                timeSlot: scheduleForm.timeSlot || shifts[0] || "Morning (08:00 - 12:00)",
                                platform: scheduleForm.platform || "TikTok Live",
                                brand: scheduleForm.brand || brands[0] || "Somethinc",
                                status: "Assigned",
                                studio: scheduleForm.studio || (studios[0] ? studios[0].name : "Studio Bandar Lampung"),
                                isOffDay: scheduleForm.isOffDay,
                                isPindahStudio: scheduleForm.isPindahStudio,
                                backupHostId: (scheduleForm.isOffDay || scheduleForm.isPindahStudio) ? scheduleForm.backupHostId : "",
                                backupHostName: (scheduleForm.isOffDay || scheduleForm.isPindahStudio) ? repHostName : ""
                              };

                              const finalizeSchedule = () => {
                                setSchedules(prev => [...prev, newSchedule]);
                                // Reset state
                                setScheduleForm({
                                  id: "",
                                  hostId: "",
                                  timeSlot: shifts[0] || "Morning (08:00 - 12:00)",
                                  brand: brands[0] || "Somethinc",
                                  platform: platforms[0] || "TikTok Live",
                                  studio: studios[0] ? studios[0].name : "Studio Bandar Lampung",
                                  isOffDay: false,
                                  isPindahStudio: false,
                                  backupOption: "none",
                                  backupHostId: ""
                                });
                              };

                              if (scheduleForm.id) {
                                // Modifying an existing manual schedule
                                setSchedules(prev => prev.map(s => s.id === scheduleForm.id ? newSchedule : s));
                                // Reset state
                                setScheduleForm({
                                  id: "",
                                  hostId: "",
                                  timeSlot: shifts[0] || "Morning (08:00 - 12:00)",
                                  brand: brands[0] || "Somethinc",
                                  platform: platforms[0] || "TikTok Live",
                                  studio: studios[0] ? studios[0].name : "Studio Bandar Lampung",
                                  isOffDay: false,
                                  isPindahStudio: false,
                                  backupOption: "none",
                                  backupHostId: ""
                                });
                              } else {
                                // Check for clash
                                const isClashed = computedSchedules.some(s => 
                                  s.date === selectedCalendarDate && 
                                  s.hostId === selectedHost.id && 
                                  s.timeSlot === scheduleForm.timeSlot &&
                                  s.id !== scheduleForm.id
                                );
                                if (isClashed) {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: "Peringatan Jadwal Bentrok",
                                    message: "Host ini sudah memiliki jadwal pada shift ini untuk hari tersebut. Tetap tambahkan?",
                                    type: "warning",
                                    confirmText: "Tambahkan",
                                    onConfirm: () => {
                                      finalizeSchedule();
                                      setConfirmModal(null);
                                    }
                                  });
                                } else {
                                  finalizeSchedule();
                                }
                              }
                              // Close the modal instantly to indicate success!
                              setIsScheduleModalOpen(false);
                            }}
                            className="space-y-4 text-xs font-sans"
                            id="schedule_form_section"
                          >
                            {/* SELECT HOST UTAMA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Pilih Studio:</label>
                                <select
                                  value={scheduleForm.studio}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, studio: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {studios.map(s => (
                                    <option key={s.id} value={s.name}>{s.name} ({s.location})</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Host:</label>
                                <select
                                  value={scheduleForm.hostId}
                                  onChange={(e) => {
                                      const hostId = e.target.value;
                                      const hostObj = hosts.find(h => h.id === hostId);
                                      if (!hostObj) {
                                          setScheduleForm(prev => ({ ...prev, hostId }));
                                          return;
                                      }

                                      // Auto-detect if host has a default session assigned in brands
                                      let foundBrand = "";
                                      let foundPlatform = "";
                                      let foundShift = "";

                                      for (const b of clientBrands) {
                                          const sess = b.sessions?.find(s => s.host === hostObj.name);
                                          if (sess) {
                                              foundBrand = b.name;
                                              foundPlatform = sess.platform;
                                              foundShift = sess.shift;
                                              break;
                                          }
                                      }
                                      
                                      setScheduleForm(prev => ({
                                          ...prev,
                                          hostId,
                                          brand: foundBrand || prev.brand,
                                          platform: foundPlatform || prev.platform,
                                          timeSlot: foundShift || prev.timeSlot
                                      }));
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                  required
                                >
                                  <option value="">-- Pilih Host --</option>
                                  {hosts.map(h => (
                                    <option key={h.id} value={h.id}>
                                      {h.name} ({h.hostType === "Reguler" ? "Reguler" : "Backup"})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Shift:</label>
                                <select
                                  value={scheduleForm.timeSlot}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {shifts.map(sh => (
                                    <option key={sh} value={sh}>{sh}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Brand:</label>
                                <select
                                  value={scheduleForm.brand}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, brand: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {brands.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-500 font-extrabold mb-1.5">Platform:</label>
                                <select
                                  value={scheduleForm.platform}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, platform: e.target.value }))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                >
                                  {platforms.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 mt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setScheduleForm({
                                    id: "",
                                    hostId: "",
                                    timeSlot: shifts[0] || "Morning (08:00 - 12:00)",
                                    brand: brands[0] || "Somethinc",
                                    platform: "TikTok Live",
                                    studio: studios[0] ? studios[0].name : "Studio Bandar Lampung",
                                    isOffDay: false,
                                    isPindahStudio: false,
                                    backupOption: "none",
                                    backupHostId: ""
                                  });
                                  setIsScheduleModalOpen(false);
                                }}
                                className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer border-0"
                              >
                                Tutup
                              </button>
                              <button
                                type="submit"
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-97 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border-0"
                              >
                                <Check className="w-4 h-4" />
                                {scheduleForm.id ? "Simpan Perubahan" : "Masukkan Jadwal"}
                              </button>
                            </div>
                          </form>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ==================== SUBTAB: 3. REKAP & KALKULATOR GAJI ==================== */}
            {operatorTab === "rekap_gaji" && (
              <div className="space-y-6 animate-fadeIn" id="operator_rekap_gaji_content">
                
                {/* REAL-TIME DYNAMIC INPUT PARAMETERS (REGIONAL SUPPORTED + HOURLY/MONTHLY SHIFTS) */}
                {/* ================= ACCORDION: SETTING PAYROLL ================= */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs max-w-5xl overflow-hidden mb-6">
                  <button
                    type="button"
                    onClick={() => setIsPayrollConfigOpen(!isPayrollConfigOpen)}
                    className="w-full flex items-center justify-between p-4 md:p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer border-0"
                  >
                    <div className="flex items-center gap-2 text-[#2563eb] font-extrabold text-sm">
                      <Sliders className="w-4 h-4 text-[#2563eb]" />
                      SETTING PAYROLL CONFIGURATION
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isPayrollConfigOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isPayrollConfigOpen && (
                    <div className="p-4 md:p-6 border-t border-slate-100" id="salary_parameter_grid_panel">
                      <div className="text-slate-500 font-bold text-xs mb-4">
                        PENGATURAN PARAMETER GAJI STREAMER AGENCY (DIFERENSIASI REGULER & BACKUP)
                      </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-2 items-start">
                    
                    <div className="flex flex-col gap-6">
                      {/* Bandar Lampung Pay Config Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <span className="font-sans font-black text-slate-800 border-b border-slate-200 pb-1.5 block flex items-center gap-1.5">
                          🌆 Studio Bandar Lampung
                        </span>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold">Gaji Pokok Host Reguler (Bulanan):</label>
                          <input
                            type="text"
                            id="input_pay_bandar_lampung_reguler"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.bandarLampungRegulerBase ?? 4000000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, bandarLampungRegulerBase: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-semibold">Nominal Bonus 100% Hadir (&le; 3x Terlambat):</label>
                          <input
                            type="text"
                            id="input_bonus_bandar_lampung_reguler"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.bandarLampungRegulerBonus ?? 300000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, bandarLampungRegulerBonus: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold">Tarif per Shift Host Backup:</label>
                          <input
                            type="text"
                            id="input_pay_bandar_lampung_backup"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.bandarLampungBackupPay ?? 175000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, bandarLampungBackupPay: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                      </div>

                      {/* Tanggamus Pay Config Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                        <span className="font-sans font-black text-slate-800 border-b border-slate-200 pb-1.5 block flex items-center gap-1.5">
                          ⛰️ Studio Tanggamus
                        </span>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold">Gaji Pokok Host Reguler (Bulanan):</label>
                          <input
                            type="text"
                            id="input_pay_tanggamus_reguler"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.tanggamusRegulerBase ?? 3500000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, tanggamusRegulerBase: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-semibold">Nominal Bonus 100% Hadir (&le; 3x Terlambat):</label>
                          <input
                            type="text"
                            id="input_bonus_tanggamus_reguler"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.tanggamusRegulerBonus ?? 250000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, tanggamusRegulerBonus: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-600 block font-bold">Tarif per Shift Host Backup:</label>
                          <input
                            type="text"
                            id="input_pay_tanggamus_backup"
                            value={"Rp " + new Intl.NumberFormat('id-ID').format(salarySettings.tanggamusBackupPay ?? 150000)}
                            onChange={(e) => {
                               const val = e.target.value.replace(/\D/g, "");
                               setSalarySettings(prev => ({ ...prev, tanggamusBackupPay: val ? parseInt(val, 10) : 0 }))
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      {/* Proportional Cycle Sliders Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-start space-y-3">
                        <div className="space-y-2">
                          <label className="text-slate-800 font-extrabold block">
                            Standard Hari Kerja Sebulan: <span className="font-mono text-[#2563eb] font-black">{salarySettings.workingDays} Hari</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="31"
                            value={salarySettings.workingDays}
                            onChange={(e) => setSalarySettings(prev => ({ ...prev, workingDays: Number(e.target.value) }))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold block leading-normal">
                            Digunakan untuk proporsi performa kehadiran Host Reguler bulanan (Hari Kehadiran / Standard Hari Kerja).
                          </span>
                        </div>
                      </div>

                      {/* Cut-Off/Tutup Buku Period Card */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="font-sans font-black text-slate-800 border-b border-slate-200 pb-1.5 block flex items-center gap-1.5 mb-2">
                          📅 Cut-Off (Tutup Buku) Bulanan
                        </span>
                        
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-150 mb-2 hover:border-slate-300 transition-all shadow-2xs">
                          <div>
                            <span className="text-slate-800 font-extrabold block text-[10px]">Batas Cut-Off Aktif</span>
                            <span className="text-[9px] text-slate-450 font-normal">Gunakan siklus tanggal khusus</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSalarySettings(prev => ({ ...prev, useCutOff: !prev.useCutOff }))}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-1 focus:ring-blue-150 ${
                              salarySettings.useCutOff ? "bg-blue-600" : "bg-slate-300"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                              salarySettings.useCutOff ? "translate-x-4" : "translate-x-0"
                            }`} />
                          </button>
                        </div>

                        {salarySettings.useCutOff && (
                          <div className="space-y-1.5 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                <label className="text-slate-600 font-bold block text-[9.5px]">Tgl Mulai:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={salarySettings.cutOffStartDay ?? 16}
                                  onChange={(e) => {
                                    const val = Math.max(1, Math.min(31, Number(e.target.value)));
                                    setSalarySettings(prev => ({ ...prev, cutOffStartDay: val }));
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 font-extrabold font-mono text-center text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                />
                              </div>
                              <div className="space-y-0.5">
                                <label className="text-slate-600 font-bold block text-[9.5px]">Tgl Akhir:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="31"
                                  value={salarySettings.cutOffEndDay ?? 15}
                                  onChange={(e) => {
                                    const val = Math.max(1, Math.min(31, Number(e.target.value)));
                                    setSalarySettings(prev => ({ ...prev, cutOffEndDay: val }));
                                  }}
                                  className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 font-extrabold font-mono text-center text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                />
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-200/65 space-y-1" id="cut_off_month_picker_wrapper">
                              <label className="text-[10px] font-black text-slate-700 block text-left">
                                Pilih Range Bulan:
                              </label>
                              <select
                                id="select_cutoff_periode"
                                value={(() => {
                                  const refDateObj = new Date(filterReferenceDate);
                                  if (isNaN(refDateObj.getTime())) return "";
                                  const day = refDateObj.getDate();
                                  let targetMonth = refDateObj.getMonth();
                                  let targetYear = refDateObj.getFullYear();
                                  if (day >= 16) {
                                    targetMonth += 1;
                                    if (targetMonth > 11) {
                                      targetMonth = 0;
                                      targetYear += 1;
                                    }
                                  }
                                  return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
                                })()}
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  const [yearStr, monthStr] = e.target.value.split("-");
                                  const year = Number(yearStr);
                                  const monthIdx = Number(monthStr) - 1;
                                  const dateToSet = new Date(year, monthIdx, 15);
                                  const formatted = `${dateToSet.getFullYear()}-${String(dateToSet.getMonth() + 1).padStart(2, '0')}-15`;
                                  
                                  setFilterReferenceDate(formatted);
                                  setTimeFilter("Bulanan");
                                  setSalarySettings(prev => ({
                                    ...prev,
                                    useCutOff: true,
                                    cutOffStartDay: 16,
                                    cutOffEndDay: 15
                                  }));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-3xs cursor-pointer hover:border-slate-300"
                              >
                                {[
                                  { year: 2026, months: [1,2,3,4,5,6,7,8,9,10,11,12] },
                                  { year: 2025, months: [1,2,3,4,5,6,7,8,9,10,11,12] }
                                ].flatMap(group => 
                                  group.months.map(m => {
                                    const monthNames = [
                                      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                                    ];
                                    let prevM = m - 1;
                                    if (prevM === 0) {
                                      prevM = 12;
                                    }
                                    const label = `${monthNames[m - 1]} ${group.year} (16 ${monthNames[prevM - 1].substring(0,3)} - 15 ${monthNames[m - 1].substring(0,3)})`;
                                    const value = `${group.year}-${String(m).padStart(2, '0')}`;
                                    return <option key={value} value={value}>{label}</option>;
                                  })
                                )}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-550 font-semibold leading-relaxed pt-2 border-t border-slate-200 bg-white/50 p-2 rounded border border-slate-100/60 shadow-3xs">
                        {salarySettings.useCutOff ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-blue-600 font-black uppercase text-[8px] tracking-wider">Status Siklus Aktif:</span>
                            <span className="font-mono text-slate-700 font-bold block">
                              Mulai Tanggal {salarySettings.cutOffStartDay ?? 16} s/d Tanggal {salarySettings.cutOffEndDay ?? 15} Bulan Depan.
                            </span>
                            <span className="text-[9.5px] italic text-slate-450 mt-0.5 font-normal leading-tight">
                              (Contoh: 16 Jan ke 15 Feb)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-455 italic block leading-snug">Menghitung kalender standar bulanan biasa (Tanggal 1 s/d Akhir Bulan).</span>
                        )}
                      </div>
                    </div>

                    </div>

                  </div>
                    </div>
                  )}
                </div>

                {/* Search & Configuration in calculator */}
                <div className="space-y-3 mb-4" id="rekap_salary_toolbar_container">
                  <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-purple-50/50 p-4 rounded-xl border border-purple-100" id="rekap_salary_toolbar">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="text"
                        id="search_host_salary_input"
                        placeholder="Cari host untuk perhitungan gaji..."
                        value={salarySearch}
                        onChange={(e) => setSalarySearch(e.target.value)}
                        className="w-full bg-white border border-purple-150 rounded-xl pl-10 pr-4 py-2.5 text-xs text-purple-950 focus:outline-none focus:border-purple-400 transition-all font-sans font-bold shadow-2xs"
                      />
                    </div>
                    
                    {/* Month Range Cut-Off filter directly on toolbar */}
                    <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-purple-150 shadow-2xs" id="toolbar_cutoff_period_selector">
                      <span className="text-[10px] font-black text-purple-750 whitespace-nowrap">📅 PERIODE GAJI (16 - 15):</span>
                      <select
                        id="toolbar_select_cutoff_periode"
                        value={(() => {
                          const refDateObj = new Date(filterReferenceDate);
                          if (isNaN(refDateObj.getTime())) return "";
                          const day = refDateObj.getDate();
                          let targetMonth = refDateObj.getMonth();
                          let targetYear = refDateObj.getFullYear();
                          if (day >= 16) {
                            targetMonth += 1;
                            if (targetMonth > 11) {
                              targetMonth = 0;
                              targetYear += 1;
                            }
                          }
                          return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
                        })()}
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const [yearStr, monthStr] = e.target.value.split("-");
                          const year = Number(yearStr);
                          const monthIdx = Number(monthStr) - 1;
                          const dateToSet = new Date(year, monthIdx, 15);
                          const formatted = `${dateToSet.getFullYear()}-${String(dateToSet.getMonth() + 1).padStart(2, '0')}-15`;
                          
                          setFilterReferenceDate(formatted);
                          setTimeFilter("Bulanan");
                          setSalarySettings(prev => ({
                            ...prev,
                            useCutOff: true,
                            cutOffStartDay: 16,
                            cutOffEndDay: 15
                          }));
                        }}
                        className="bg-transparent text-xs font-black text-purple-950 focus:outline-none cursor-pointer border-none py-0.5 outline-none font-mono"
                      >
                        {[
                          { year: 2026, months: [1,2,3,4,5,6,7,8,9,10,11,12] },
                          { year: 2025, months: [1,2,3,4,5,6,7,8,9,10,11,12] }
                        ].flatMap(group => 
                          group.months.map(m => {
                            const monthNames = [
                              "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                              "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                            ];
                            let prevM = m - 1;
                            if (prevM === 0) {
                              prevM = 12;
                            }
                            const label = `${monthNames[m - 1]} ${group.year} (16 - 15)`;
                            const value = `${group.year}-${String(m).padStart(2, '0')}`;
                            return <option key={value} value={value}>{label}</option>;
                          })
                        )}
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        onClick={() => setShowWidthSliders(!showWidthSliders)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                          showWidthSliders 
                            ? "bg-purple-600 text-white border-purple-700 shadow-sm" 
                            : "bg-white text-purple-750 border-purple-150 hover:bg-purple-50"
                        }`}
                        title="Sesuaikan lebar tiap kolom secara manual"
                        id="toggle_column_width_configurator"
                      >
                        <span>⚙️</span>
                        <span>Atur Lebar Kolom {showWidthSliders ? "▲" : "▼"}</span>
                      </button>
                    </div>
                  </div>

                  {showWidthSliders && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-fadeIn" id="column_width_config_panel">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                          📊 Panel Lebar Kolom (Gunakan Slider untuk Menyesuaikan Tampilan Secara Real-time)
                        </span>
                        <button
                          onClick={() => setColumnWidths({
                            name: 240,
                            hostType: 120,
                            attendance: 140,
                            late: 100,
                            excused: 110,
                            absent: 100,
                            formula: 300,
                            netSalary: 180
                          })}
                          className="px-2.5 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-all cursor-pointer"
                        >
                          Reset Default
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Host & Wilayah</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.name}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={120} 
                            max={600} 
                            value={columnWidths.name} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, name: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Tipe Host</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.hostType}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={80} 
                            max={300} 
                            value={columnWidths.hostType} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, hostType: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Hadir / Target</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.attendance}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={100} 
                            max={300} 
                            value={columnWidths.attendance} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, attendance: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Terlambat</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.late}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={80} 
                            max={250} 
                            value={columnWidths.late} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, late: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Tidak Hadir</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.excused}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={80} 
                            max={250} 
                            value={columnWidths.excused} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, excused: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Kalkulasi</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.formula}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={150} 
                            max={600} 
                            value={columnWidths.formula} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, formula: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 flex justify-between">
                            <span>Gaji Bersih</span>
                            <span className="font-mono text-purple-700 font-extrabold">{columnWidths.netSalary}px</span>
                          </label>
                          <input 
                            type="range" 
                            min={100} 
                            max={400} 
                            value={columnWidths.netSalary} 
                            onChange={(e) => setColumnWidths(prev => ({ ...prev, netSalary: Number(e.target.value) }))}
                            className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SALARY RECAP TABLE CONTAINER */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="salary_recap_calculator_table_wrapper">
                  
                  {/* DESKTOP & TABLET VIEW: Rendered as a highly polished, responsive table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-900 border-collapse table-fixed" style={{ minWidth: "100%" }} id="salary_recap_table">
                      <colgroup>
                        <col style={{ width: `${columnWidths.name}px` }} />
                        <col style={{ width: `${columnWidths.hostType}px` }} />
                        <col style={{ width: `${columnWidths.attendance}px` }} />
                        <col style={{ width: `${columnWidths.late}px` }} />
                        <col style={{ width: `${columnWidths.excused}px` }} />
                        <col style={{ width: `${columnWidths.formula}px` }} />
                        <col style={{ width: `${columnWidths.netSalary}px` }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-mono whitespace-nowrap uppercase tracking-wider text-slate-500 font-bold select-none">
                          {/* Nama Host & Wilayah */}
                          <th className="py-4 px-6 align-middle">
                            <div className="flex flex-col gap-1.5">
                              <button 
                                onClick={() => toggleSalarySort("name")}
                                className="flex items-center gap-1.5 hover:text-purple-700 text-left uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer w-full transition-colors"
                              >
                                <span>Host & Info</span>
                                <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                  {salarySortKey === "name" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, name: Math.max(120, prev.name - 15) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-12 text-center">{columnWidths.name}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, name: Math.min(600, prev.name + 15) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Tipe Host */}
                          <th className="py-4 px-4 align-middle text-center">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button 
                                onClick={() => toggleSalarySort("hostType")}
                                className="flex items-center justify-center gap-1.5 hover:text-purple-700 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Tipe</span>
                                <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                  {salarySortKey === "hostType" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, hostType: Math.max(80, prev.hostType - 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-10 text-center">{columnWidths.hostType}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, hostType: Math.min(300, prev.hostType + 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Hadir / Target */}
                          <th className="py-4 px-4 align-middle text-center">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button 
                                onClick={() => toggleSalarySort("attendance")}
                                className="flex items-center justify-center gap-1.5 hover:text-purple-700 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Hadir</span>
                                <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                  {salarySortKey === "attendance" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, attendance: Math.max(80, prev.attendance - 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-10 text-center">{columnWidths.attendance}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, attendance: Math.min(300, prev.attendance + 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Terlambat */}
                          <th className="py-4 px-3 align-middle text-center text-amber-600">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button 
                                onClick={() => toggleSalarySort("late")}
                                className="flex items-center justify-center gap-1.5 hover:text-amber-700 text-amber-600 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Telat</span>
                                <span className="text-[10px] text-amber-600 font-extrabold font-sans">
                                  {salarySortKey === "late" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, late: Math.max(80, prev.late - 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-10 text-center">{columnWidths.late}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, late: Math.min(250, prev.late + 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Tidak Hadir */}
                          <th className="py-4 px-3 align-middle text-center text-red-650">
                            <div className="flex flex-col gap-1.5 items-center">
                              <button 
                                onClick={() => toggleSalarySort("excused")}
                                className="flex items-center justify-center gap-1.5 hover:text-red-700 text-red-650 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Tidak Hadir</span>
                                <span className="text-[10px] text-red-600 font-extrabold font-sans">
                                  {salarySortKey === "excused" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, excused: Math.max(80, prev.excused - 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-10 text-center">{columnWidths.excused}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, excused: Math.min(250, prev.excused + 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Rumus Perhitungan Gaji */}
                          <th className="py-4 px-4 align-middle text-left">
                            <div className="flex flex-col gap-1.5">
                              <button 
                                onClick={() => toggleSalarySort("formula")}
                                className="flex items-center gap-1.5 hover:text-purple-700 text-left uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Kalkulasi</span>
                                <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                  {salarySortKey === "formula" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, formula: Math.max(150, prev.formula - 15) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-12 text-center">{columnWidths.formula}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, formula: Math.min(600, prev.formula + 15) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>

                          {/* Estimasi Gaji Bersih */}
                          <th className="py-4 px-6 align-middle text-right pr-8">
                            <div className="flex flex-col gap-1.5 items-end">
                              <button 
                                onClick={() => toggleSalarySort("netSalary")}
                                className="flex items-center justify-end gap-1.5 hover:text-purple-700 text-right uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                              >
                                <span>Gaji Bersih</span>
                                <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                  {salarySortKey === "netSalary" ? (salarySortDir === "asc" ? " 🔼" : " 🔽") : " ↕️"}
                                </span>
                              </button>
                              <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, netSalary: Math.max(100, prev.netSalary - 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Sempitkan Kolom"
                                >
                                  -
                                </button>
                                <span className="text-[9px] text-slate-400 font-bold w-12 text-center">{columnWidths.netSalary}px</span>
                                <button 
                                  onClick={() => setColumnWidths((prev: any) => ({ ...prev, netSalary: Math.min(400, prev.netSalary + 10) }))}
                                  className="w-4 h-4 rounded bg-slate-200/80 hover:bg-slate-300 text-[10px] flex items-center justify-center font-bold active:scale-90 text-slate-700 cursor-pointer"
                                  title="Lebarkan Kolom"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHostReportList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-slate-400 font-mono font-medium">
                              Tidak ada rekam data host yang cocok untuk proses kalkulasi draf gaji.
                            </td>
                          </tr>
                        ) : (
                          filteredHostReportList.map((item, idx) => {
                            const isTanggamus = item.studio && item.studio.includes("Tanggamus");
                            const hostType = item.hostType || "Reguler";
                            const isAtTop = idx < 3;

                            return (
                              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all font-sans" id={`salary_row_${item.id}`}>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={getAvatarUrl(item.name)}
                                      alt={item.name}
                                      referrerPolicy="no-referrer"
                                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                    />
                                    <div className="min-w-0">
                                      <div className="font-extrabold text-slate-900 text-xs truncate">{item.name}</div>
                                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                        <span>🏡</span>
                                        <span className="truncate">{item.studio || "Studio Bandar Lampung"}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="text-center py-4 px-4 whitespace-nowrap">
                                  {hostType === "Reguler" ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-55 bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-105 uppercase tracking-wider">
                                      👔 Host Reguler
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-55 bg-purple-50 text-purple-700 font-bold text-[9px] border border-purple-105 uppercase tracking-wider">
                                      🎓 Host Backup
                                    </span>
                                  )}
                                </td>

                                <td className="text-center font-mono font-bold text-slate-900 py-4 px-4">
                                  {hostType === "Reguler" ? (
                                    <div className="inline-flex flex-col items-center">
                                      <div className="flex items-center gap-1.5 justify-center bg-slate-105 bg-slate-100 hover:bg-slate-200/80 hover:border-slate-300 transition-colors px-2 py-1 rounded-lg border border-slate-200">
                                        <span className="text-[10.5px] text-slate-700 font-bold">
                                          {item.totalHadir} / 
                                        </span>
                                        <input
                                          type="number"
                                          min={1}
                                          max={31}
                                          value={item.requiredWorkingDays}
                                          onChange={(e) => {
                                            const val = Math.max(1, Math.min(31, Number(e.target.value)));
                                            handleUpdateHost(item.id, { customWorkingDaysTarget: val });
                                          }}
                                          title="Ubah Target Hari Kerja Khusus Host Ini"
                                          className="w-10 bg-white border border-slate-300 hover:border-blue-450 focus:border-blue-600 rounded px-1 py-0.5 text-center font-mono font-extrabold text-[10.5px] text-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-100"
                                        />
                                        <span className="text-[10px] text-slate-500 font-bold">Hari</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="px-2 py-0.5 rounded-lg bg-emerald-55 bg-emerald-50 text-[10.5px] text-emerald-800 font-bold border border-emerald-105">
                                        {item.totalHadir} Shift
                                      </span>
                                      <span className="text-[9px] text-emerald-600 font-medium mt-1">Dibayar per Shift</span>
                                    </div>
                                  )}
                                </td>

                                {/* Terlambat (Late) */}
                                <td className="text-center py-4 px-3 font-mono">
                                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                                    item.countTerlambat > 0 
                                      ? "text-amber-700 font-black bg-amber-50 border border-amber-100"
                                      : "text-slate-400 font-medium bg-slate-50 border border-slate-100/50"
                                  }`}>
                                    {item.countTerlambat}x
                                  </span>
                                </td>

                                {/* Tidak Hadir (Izin/Sakit + Alpa) */}
                                <td className="text-center py-4 px-3 font-mono">
                                  <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                                    (item.countIzin + item.countAlpa) > 0 
                                      ? "text-red-700 font-black bg-red-50 border border-red-100"
                                      : "text-slate-400 font-medium bg-slate-50 border border-slate-100/50"
                                  }`}>
                                    {item.countIzin + item.countAlpa} Hari
                                  </span>
                                </td>

                                <td className="py-4 px-4 text-left">
                                  {hostType === "Reguler" ? (
                                    <div className="space-y-1 font-sans">
                                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Gaji Pokok Wilayah</div>
                                      <div className="text-xs font-extrabold text-slate-800 font-mono flex items-center gap-1">
                                        {formatIDR(item.basePayRate)} 
                                        <span className="text-[9.5px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                          {item.studio ? (item.studio.includes("Tanggamus") ? "Tanggamus" : "Bandar Lampung") : "Bandar Lampung"}
                                        </span>
                                      </div>
                                      <div className="text-[9.5px] text-blue-600 font-medium flex items-center gap-1" title="Arahkan kursor ke Estimasi Gaji Bersih untuk melihat rincian rumus dan bonus">
                                        <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-[8px] font-bold uppercase border border-blue-100">info</span>
                                        <span>Hover nominal gaji untuk rincian</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="space-y-1 font-sans">
                                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Tarif per Shift</div>
                                      <div className="text-xs font-extrabold text-slate-800 font-mono">
                                        {formatIDR(item.basePayRate)} <span className="text-[9.5px] text-slate-500 font-medium">/ Shift</span>
                                      </div>
                                      <div className="text-[9.5px] text-blue-600 font-medium flex items-center gap-1" title="Arahkan kursor ke Estimasi Gaji Bersih untuk melihat rincian rumus">
                                        <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-[8px] font-bold uppercase border border-blue-100">info</span>
                                        <span>Hover nominal gaji untuk rincian</span>
                                      </div>
                                    </div>
                                  )}
                                </td>

                                <td className="text-right py-4 px-6 pr-8 whitespace-nowrap">
                                  <div className="relative group inline-block z-10 hover:z-50">
                                    <div className="text-sm font-black text-slate-900 font-mono hover:text-blue-600 hover:underline cursor-help transition-all duration-155 px-2 py-1.5 rounded bg-slate-50 border border-slate-200 shadow-2xs inline-flex items-center gap-1">
                                      {formatIDR(item.netSalary)}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-blue-600"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 pr-2">Transfer Bank</span>

                                    <div className={`absolute right-0 ${isAtTop ? "top-full mt-3" : "bottom-full mb-3"} hidden group-hover:block z-55 bg-slate-950 text-white rounded-xl shadow-2xl p-4 w-80 text-left pointer-events-none border border-slate-850 animate-in fade-in duration-150 ${isAtTop ? "slide-in-from-top-2" : "slide-in-from-bottom-2"} whitespace-normal`}>
                                      <div className="space-y-3 font-sans">
                                        <div className="border-b border-slate-800 pb-2">
                                          <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Rincian Perhitungan Gaji</div>
                                          <div className="text-xs font-black text-blue-400 mt-1 flex items-center gap-1.5">
                                            <span>👱‍♀️</span> {item.name} 
                                            <span className="text-[8.5px] bg-blue-500/10 text-blue-300 font-extrabold border border-blue-500/25 px-1 py-0.2 rounded uppercase">
                                              {hostType}
                                            </span>
                                          </div>
                                        </div>

                                        {hostType === "Reguler" ? (
                                          <div className="space-y-2.5">
                                            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-1">
                                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rumus Gaji Pokok Regulasi</div>
                                              <div className="text-[10px] text-slate-200 italic font-mono leading-tight">
                                                (Gaji Pokok Penempatan / Hari Standar Kerja) &times; Kehadiran Host Masuk
                                              </div>
                                              <div className="pt-1.5 border-t border-slate-800/80 mt-1.5 font-mono text-[9px] text-blue-300 font-semibold leading-relaxed">
                                                ({formatIDR(item.basePayRate)} / {item.requiredWorkingDays} Hari) &times; {item.totalHadir} Hari
                                              </div>
                                              <div className="text-xs font-bold font-mono text-emerald-400 flex justify-between items-center pt-1">
                                                <span>Gaji Pokok:</span>
                                                <span>{formatIDR(Math.round((item.basePayRate / item.requiredWorkingDays) * item.totalHadir))}</span>
                                              </div>
                                            </div>

                                            <div className="border-t border-slate-800 pt-2 space-y-1.5">
                                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Syarat Bonus Kehadiran</div>
                                              
                                              <div className="space-y-1 text-[10px]">
                                                <div className="flex items-center gap-1.5 text-slate-200">
                                                  <span>{item.totalHadir >= item.requiredWorkingDays ? "✅" : "❌"}</span>
                                                  <span className="font-medium">
                                                    Kehadiran {item.totalHadir >= item.requiredWorkingDays ? "Penuh" : "di Bawah Target"} ({item.totalHadir}/{item.requiredWorkingDays} Hari)
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-200">
                                                  <span>{item.countTerlambat <= 3 ? "✅" : "❌"}</span>
                                                  <span className="font-medium">
                                                    Terlambat ≤ 3x ({item.countTerlambat}x)
                                                  </span>
                                                </div>
                                              </div>

                                              {item.isEligibleForBonus ? (
                                                <div className="bg-emerald-555 bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2 text-[10px]">
                                                  <div className="text-emerald-400 font-extrabold flex justify-between items-center">
                                                    <span>🎉 Bonus +100% Hadir:</span>
                                                    <span>+{formatIDR(item.calculatedBonus)}</span>
                                                  </div>
                                                  <p className="text-[9px] text-slate-400 mt-1">Status: Memenuhi kualifikasi & berhak menerima bonus</p>
                                                </div>
                                              ) : (
                                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-[9.5px] text-slate-400">
                                                  <p className="italic leading-relaxed">*Syarat bonus: Kehadiran penuh & terlambat ≤ 3x untuk bonus {formatIDR(isTanggamus ? (salarySettings.tanggamusRegulerBonus ?? 250000) : (salarySettings.bandarLampungRegulerBonus ?? 300000))}</p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="border-t border-slate-800 pt-2.5 flex justify-between items-center text-xs font-black">
                                              <span className="text-slate-300">Estimasi Gaji Bersih:</span>
                                              <span className="text-yellow-400 font-mono text-sm">{formatIDR(item.netSalary)}</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="space-y-2.5">
                                            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg space-y-1">
                                              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rumus Gaji Backup</div>
                                              <div className="text-[10px] text-slate-200 italic font-mono leading-tight">
                                                Siklus Kehadiran Shift &times; Tarif Per Shift
                                              </div>
                                              <div className="pt-1.5 border-t border-slate-800/80 mt-1.5 font-mono text-[9.5px] text-blue-300 font-semibold flex justify-between">
                                                <span>Detail:</span>
                                                <span>{item.totalHadir} Shift &times; {formatIDR(item.basePayRate)}</span>
                                              </div>
                                            </div>

                                            <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs font-black">
                                              <span className="text-slate-300">Estimasi Gaji Bersih:</span>
                                              <span className="text-yellow-400 font-mono text-sm">{formatIDR(item.netSalary)}</span>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      {isAtTop ? (
                                        <div className="absolute right-6 bottom-full w-3 h-3 bg-slate-950 border-l border-t border-slate-800 rotate-45 translate-y-1.5"></div>
                                      ) : (
                                        <div className="absolute right-6 top-full w-3 h-3 bg-slate-950 border-r border-b border-slate-800 rotate-45 -translate-y-1.5"></div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE & SMARTPHONE VIEW: Beautifully custom styled touch cards */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {filteredHostReportList.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-mono font-medium text-xs">
                        Tidak ada rekam data host yang cocok untuk proses kalkulasi draf gaji.
                      </div>
                    ) : (
                      filteredHostReportList.map((item) => {
                        const isTanggamus = item.studio && item.studio.includes("Tanggamus");
                        const hostType = item.hostType || "Reguler";

                        return (
                          <div key={item.id} className="p-4 space-y-4 font-sans bg-white" id={`salary_mobile_card_${item.id}`}>
                            
                            {/* Profile Header Block */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getAvatarUrl(item.name)}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs"
                                />
                                <div>
                                  <div className="font-extrabold text-slate-900 text-xs">{item.name}</div>
                                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                    <span>🏢</span>
                                    <span>{item.studio || "Studio Bandar Lampung"}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                {hostType === "Reguler" ? (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[8.5px] border border-blue-100 uppercase tracking-wide">
                                    Reguler
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[8.5px] border border-purple-100 uppercase tracking-wide">
                                    Backup
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Attendance Mini Dashboard */}
                            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                              
                              {/* 1. Hadir / Target */}
                              <div className="flex flex-col justify-between">
                                <span className="text-[8px] font-black tracking-wider text-slate-400 block uppercase">Hadir/Tgt</span>
                                {hostType === "Reguler" ? (
                                  <div className="inline-flex items-center justify-center gap-0.5 mt-1 bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold text-slate-800">
                                    <span>{item.totalHadir}/</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={31}
                                      value={item.requiredWorkingDays}
                                      onChange={(e) => {
                                        const val = Math.max(1, Math.min(31, Number(e.target.value)));
                                        handleUpdateHost(item.id, { customWorkingDaysTarget: val });
                                      }}
                                      className="w-5 border-none bg-transparent text-blue-700 font-bold text-center focus:outline-none p-0"
                                    />
                                  </div>
                                ) : (
                                  <span className="inline-block mt-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                                    {item.totalHadir} Shf
                                  </span>
                                )}
                              </div>

                              {/* 2. Terlambat */}
                              <div className="flex flex-col justify-between">
                                <span className="text-[8px] font-black tracking-wider text-amber-600 block uppercase">Telat</span>
                                <span className={`inline-block mt-1 px-1 py-0.5 rounded text-[10.5px] font-bold font-mono self-center ${
                                  item.countTerlambat > 0 
                                    ? "text-amber-700 bg-amber-50 border border-amber-100"
                                    : "text-slate-400 bg-slate-100 border border-slate-200/40"
                                }`}>
                                  {item.countTerlambat}x
                                </span>
                              </div>

                              {/* 3. Tidak Hadir */}
                              <div className="flex flex-col justify-between">
                                <span className="text-[8px] font-black tracking-wider text-red-650 block uppercase">Tidak Hadir</span>
                                <span className={`inline-block mt-1 px-1 py-0.5 rounded text-[10.5px] font-bold font-mono self-center ${
                                  (item.countIzin + item.countAlpa) > 0 
                                    ? "text-red-700 bg-red-50 border border-red-100"
                                    : "text-slate-400 bg-slate-100 border border-slate-200/40"
                                }`}>
                                  {item.countIzin + item.countAlpa} Hari
                                </span>
                              </div>

                            </div>

                            {/* Mobile Calculation Formula & Summary */}
                            <div className="bg-[#fafaff] border border-purple-100/40 rounded-xl p-3 space-y-2 text-xs">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-b border-purple-100/30 pb-1.5">
                                <span>Rumus: {hostType === "Reguler" ? "Gaji Pokok Proporsional" : "Tarif Shift"}</span>
                                <span className="font-bold underline text-blue-650">
                                  {item.studio ? (item.studio.includes("Tanggamus") ? "Tanggamus" : "Bandar Lampung") : "Bandar Lampung"}
                                </span>
                              </div>

                              {hostType === "Reguler" ? (
                                <div className="space-y-1 font-mono text-[10px] text-slate-600">
                                  <div>Gaji Pokok: {formatIDR(item.basePayRate)}</div>
                                  <div>
                                    Proporsi: ({formatIDR(item.basePayRate)} / {item.requiredWorkingDays} Hari) &times; {item.totalHadir} Hadir = <span className="text-slate-900 font-bold">{formatIDR(Math.round((item.basePayRate / item.requiredWorkingDays) * item.totalHadir))}</span>
                                  </div>
                                  {item.isEligibleForBonus ? (
                                    <div className="text-emerald-700 font-sans font-bold flex items-center gap-1 pt-1">
                                      <span>🎉 Bonus Kehadiran penuh:</span> 
                                      <span className="font-mono bg-emerald-50 border border-emerald-100 px-1 py-0.2 rounded text-[9px]">+{formatIDR(item.calculatedBonus)}</span>
                                    </div>
                                  ) : (
                                    <div className="text-[9.5px] font-sans font-medium text-slate-400 italic pt-1">
                                      *Bonus {formatIDR(isTanggamus ? (salarySettings.tanggamusRegulerBonus ?? 250000) : (salarySettings.bandarLampungRegulerBonus ?? 300000))} jika target penuh & telat &le; 3x.
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-1 font-mono text-[10.5px] text-slate-600">
                                  <div>
                                    {item.totalHadir} Shift × {formatIDR(item.basePayRate)} / Shift
                                  </div>
                                </div>
                              )}

                              {/* Gaji Bersih Transfer Block */}
                              <div className="flex justify-between items-center bg-purple-50/50 p-2.5 rounded-lg border border-purple-100/30 mt-1.5 pt-2">
                                <div>
                                  <span className="text-[8px] text-slate-400 uppercase font-black block">Estimasi Transfer Bersih</span>
                                  <strong className="text-purple-950 font-black text-xs">Transfer Bank</strong>
                                </div>
                                <div className="text-sm font-black text-blue-700 font-mono">
                                  {formatIDR(item.netSalary)}
                                </div>
                              </div>

                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>

                {/* SINKRON DATA EXPORT HEADER */}
                <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 animate-fadeIn" id="salary_export_panel">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                        Ekspor Laporan & Penggajian Host Liva Agency
                      </h4>
                      <p className="text-[11px] text-purple-900/60 mt-0.5 font-medium">
                        Draf dokumen penggajian bulanan ini didasarkan dari kalkulasi kehadiran real-time. Anda bisa langsung mengunggahnya ke Google Sheets agar sinkron ke Google Drive.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
                    {/* Google Sheets Sync Quick Button */}
                    {googleToken ? (
                      <button
                        onClick={() => handleSheetsExport(googleToken, spreadsheetId)}
                        disabled={isSyncingSheets}
                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-purple-100 disabled:text-purple-400 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 flex-shrink-0 cursor-pointer"
                        id="export_salary_sheets_button"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                        {isSyncingSheets ? "Sedang Menyinkron..." : "Kirim Ke Google Sheets"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setOperatorTab("sheets")}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-black py-3 px-6 rounded-xl border border-purple-100 text-xs uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer shadow-2xs"
                        id="redirect_to_sheets_tab"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                        Hubungkan Google Sheets
                      </button>
                    )}

                    <button
                      onClick={() => {
                        const headers = [
                          "Nama Host",
                          "Studio/Wilayah",
                          "Tipe Host",
                          "Target Hari Kerja",
                          "Total Hari Hadir",
                          "Terlambat",
                          "Tidak Hadir (Izin/Alpa)",
                          "Gaji Pokok / Rate Basis",
                          "Estimasi Gaji Bersih"
                        ];
                        
                        const rows = filteredHostReportList.map(h => [
                          h.name,
                          h.studio || "Studio Bandar Lampung",
                          h.hostType || "Reguler",
                          h.requiredWorkingDays,
                          h.totalHadir,
                          h.countTerlambat,
                          h.countIzin + h.countAlpa,
                          h.basePayRate,
                          h.netSalary
                        ]);

                        const csvContent = "\uFEFF" + [
                          headers.join(","),
                          ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
                        ].join("\n");

                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `Rekap_Gaji_LivaAgency_${new Date().toISOString().split("T")[0]}.csv`);
                        link.style.visibility = "hidden";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 flex-shrink-0 border border-purple-555 cursor-pointer"
                      id="export_salary_button"
                    >
                      <Download className="w-4 h-4 text-purple-100" />
                      Unduh Slip Gaji (CSV)
                    </button>
                  </div>
                </div>

                {/* Sync notification message */}
                {sheetsSyncMessage && (
                  <div className={`mt-4 p-3.5 rounded-xl border text-xs flex justify-between items-center ${
                    sheetsSyncMessage.type === "success"
                      ? "bg-emerald-950/80 border-emerald-800 text-emerald-200"
                      : sheetsSyncMessage.type === "error"
                      ? "bg-red-950/80 border-red-800 text-red-200"
                      : "bg-neutral-900 border-neutral-800 text-neutral-300"
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {sheetsSyncMessage.type === "success" ? "✅" : sheetsSyncMessage.type === "error" ? "❌" : "ℹ"}
                      </span>
                      <span>{sheetsSyncMessage.text}</span>
                    </div>
                    {spreadsheetUrl && sheetsSyncMessage.type === "success" && (
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 font-bold underline hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                      >
                        Buka Google Sheets <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

              </div>
            )}

            {/* ==================== SUBTAB: LIVE DATABASE ATTENDANCE ==================== */}
            {operatorTab === "database" && (
              <div className="space-y-6" id="operator_database_content">
                
                {/* TOOLBAR FOR MANAGERS (ADD LOG MANUALLY & FILTERS) */}
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm" id="database_control_toolbar">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-950">
                      Database Rekaman Absensi Live Host
                    </h3>
                    <p className="text-[10px] text-purple-400 font-bold mt-0.5">
                      Menampilkan <span className="text-purple-700">{filteredLogsList.length}</span> log dari total {logs.length} data absen
                    </p>
                  </div>
                  
                  <button
                    id="manual_attendance_log_modal_trigger"
                    onClick={() => setShowManualForm(!showManualForm)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-black py-2 px-4 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 text-purple-100" />
                    Input Absen Manual Operator
                  </button>
                </div>

                {/* CATEGORY STATUS PILL FILTERS (Exactly matches user reference layout) */}
                <div className="flex bg-slate-100/75 p-1.5 rounded-2xl gap-1 overflow-x-auto border border-slate-200/40" id="database_pill_filters">
                  {[
                    { id: "All", label: "All Logs", color: "bg-slate-400", text: "text-slate-600", activeBg: "bg-white text-slate-800 shadow-3xs border border-slate-200" },
                    { id: "Present", label: "Present / Hadir", statusChoice: "Present", color: "bg-emerald-500", text: "text-emerald-700", activeBg: "bg-emerald-50 text-emerald-850 shadow-3xs border border-emerald-250" },
                    { id: "Late", label: "Late / Terlambat", statusChoice: "Late", color: "bg-amber-500", text: "text-amber-700", activeBg: "bg-amber-50 text-amber-850 shadow-3xs border border-amber-250" },
                    { id: "Absent", label: "Absent / Alpa", statusChoice: "Absent", color: "bg-red-500", text: "text-red-700", activeBg: "bg-red-50 text-red-850 shadow-3xs border border-red-250" },
                    { id: "Excused", label: "Excused / Izin", statusChoice: "Excused", color: "bg-[#2563eb]", text: "text-indigo-750", activeBg: "bg-indigo-50 text-indigo-850 shadow-3xs border border-indigo-250" },
                  ].map((pill) => {
                    const isPillActive = dbStatusFilter === pill.id;
                    const count = pill.id === "All" 
                      ? logs.length 
                      : logs.filter(l => l.status === pill.statusChoice).length;

                    return (
                      <button
                        type="button"
                        key={pill.id}
                        onClick={() => {
                          setDbStatusFilter(pill.id as any);
                          setSelectedLogIds([]); // clear selection when switching filters
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border border-transparent select-none shrink-0 ${
                          isPillActive
                            ? pill.activeBg
                            : "text-slate-500 hover:text-slate-800 hover:bg-white/45"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${pill.color}`} />
                        <span className="font-sans font-bold">{pill.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-md font-mono font-bold text-[9px] ${isPillActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* SEARCH & FILTERS SPECIFIC FOR PLATFORM & BRAND */}
                <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center bg-[#faf9fe]/80 p-4 rounded-xl border border-purple-100" id="database_logs_toolbar">
                  {/* Search query input */}
                  <div className="relative flex-1" id="db_search_input_wrapper">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type="text"
                      id="db_search_host"
                      placeholder="Cari log absen berdasarkan nama host atau ID..."
                      value={dbSearch}
                      onChange={(e) => setDbSearch(e.target.value)}
                      className="w-full bg-white border border-purple-150 rounded-xl pl-10 pr-4 py-2.5 text-xs text-purple-950 focus:outline-none focus:border-purple-400 transition-all font-sans font-extrabold shadow-2xs"
                    />
                  </div>

                  {/* Platform option Selector */}
                  <select
                    id="db_filter_platform_dropdown"
                    value={dbPlatformFilter}
                    onChange={(e) => setDbPlatformFilter(e.target.value)}
                    className="bg-white border border-purple-150 rounded-xl px-4 py-2 text-xs text-purple-955 focus:outline-none cursor-pointer font-bold shadow-2xs hover:border-purple-300"
                  >
                    <option value="Semua Platform">Semua Platform</option>
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  {/* Brand option Selector */}
                  <select
                    id="db_filter_brand_dropdown"
                    value={dbBrandFilter}
                    onChange={(e) => setDbBrandFilter(e.target.value)}
                    className="bg-white border border-purple-150 rounded-xl px-4 py-2 text-xs text-purple-955 focus:outline-none cursor-pointer font-bold shadow-2xs hover:border-purple-300"
                  >
                    <option value="Semua Brand">Semua Brand</option>
                    {brands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* MANUAL LOG INSERTION FORM (EXPANDABLE SECTOINE) */}
                {showManualForm && (
                  <form onSubmit={handleManualLogSubmit} className="bg-white p-5 rounded-xl border border-purple-100 space-y-4 shadow-md" id="manual_log_form">
                    <div className="border-b border-purple-100 pb-2 mb-2">
                      <h4 className="text-xs font-black uppercase text-purple-700">
                        Form Pengisian Manual Absensi Host (Oleh Operator)
                      </h4>
                      <p className="text-[10px] text-purple-500 mt-0.5 font-semibold">Gunakan ini jika streamer melupakan smartphone check-in saat siaran live.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Nama Host:</label>
                        <select
                          id="manual_field_host"
                          value={manualForm.hostId}
                          onChange={(e) => setManualForm(prev => ({ ...prev, hostId: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        >
                          {hosts.map(h => (
                            <option key={h.id} value={h.id}>{h.name} ({h.studio || "Studio Bandar Lampung"})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Brand:</label>
                        <select
                          id="manual_field_brand"
                          value={manualForm.brand}
                          onChange={(e) => setManualForm(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        >
                          {brands.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Platform:</label>
                        <select
                          id="manual_field_platform"
                          value={manualForm.platform}
                          onChange={(e) => setManualForm(prev => ({ ...prev, platform: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        >
                          {platforms.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Shift Kerja:</label>
                        <select
                          id="manual_field_shift"
                          value={manualForm.shift}
                          onChange={(e) => setManualForm(prev => ({ ...prev, shift: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        >
                          {shifts.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Lokasi Studio:</label>
                        <select
                          id="manual_field_studio"
                          value={manualForm.studio}
                          onChange={(e) => setManualForm(prev => ({ ...prev, studio: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        >
                          {studios.map(st => (
                            <option key={st.id} value={st.name}>{st.name} - {st.location}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Tanggal Absen:</label>
                        <input
                          type="date"
                          id="manual_field_date"
                          value={manualForm.date}
                          onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 font-mono focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Status Absensi:</label>
                        <select
                          id="manual_field_status"
                          value={manualForm.status}
                          onChange={(e) => setManualForm(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-black"
                        >
                          <option value="Present">Present (Tepat Waktu)</option>
                          <option value="Late">Late (Terlambat)</option>
                          <option value="Absent">Absent (Alpa / Bolos)</option>
                          <option value="Excused">Excused (Sakit / Izin)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-purple-950 font-bold mb-1">Simulasi Live Hours:</label>
                        <input
                          type="number"
                          id="manual_field_hours"
                          step="0.5"
                          value={manualForm.simulatedHours}
                          onChange={(e) => setManualForm(prev => ({ ...prev, simulatedHours: Number(e.target.value) }))}
                          className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          id="manual_submit_button"
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-lg text-xs tracking-wider transition-all uppercase cursor-pointer"
                        >
                          💾 Simpan Ke Database
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* RAW LOGS LIST TABLE FOR OPERATORS */}
                <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden" id="raw-logs-table-wrapper">
                  <div className="overflow-x-auto relative">
                    <table className="w-full text-left text-xs text-purple-950 border-collapse" id="raw_attendance_logs_database_table">
                      <thead>
                        <tr className="bg-[#faf9fe] border-b border-purple-100 text-[10px] font-mono uppercase tracking-wider text-[#3c2f56]/70 font-bold select-none">
                          <th className="py-3 px-4 w-12 text-center">
                            <input
                              type="checkbox"
                              checked={filteredLogsList.length > 0 && filteredLogsList.every(item => selectedLogIds.includes(item.id))}
                              onChange={() => {
                                const isAllSelected = filteredLogsList.length > 0 && filteredLogsList.every(item => selectedLogIds.includes(item.id));
                                if (isAllSelected) {
                                  setSelectedLogIds(prev => prev.filter(id => !filteredLogsList.some(item => item.id === id)));
                                } else {
                                  const newIds = [...selectedLogIds];
                                  filteredLogsList.forEach(item => {
                                    if (!newIds.includes(item.id)) {
                                      newIds.push(item.id);
                                    }
                                  });
                                  setSelectedLogIds(newIds);
                                }
                              }}
                              className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] w-4 h-4 cursor-pointer accent-[#2563eb]"
                            />
                          </th>
                          <th className="py-3 px-4">Nama Host</th>
                          <th className="py-3 px-4">Tanggal siaran</th>
                          <th className="py-3 px-4">Brand Besutan</th>
                          <th className="py-3 px-4">Platform</th>
                          <th className="py-3 px-4">Shift & Jam</th>
                          <th className="py-3 px-4 text-center">Rincian Status</th>
                          <th className="py-3 px-4 text-center">Ubah Status Cepat (Operator)</th>
                          <th className="py-3 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogsList.map((item) => {
                          const isRowChecked = selectedLogIds.includes(item.id);
                          return (
                            <tr 
                              key={item.id} 
                              className={`border-b border-purple-50 transition-all duration-150 select-none relative ${
                                isRowChecked 
                                  ? "bg-blue-50/45 hover:bg-blue-50/65" 
                                  : "hover:bg-[#faf9fe]/30"
                              }`} 
                              id={`raw_row_${item.id}`}
                            >
                              <td className="py-3 px-4 text-center relative w-12 select-none">
                                {isRowChecked && (
                                  <div className="absolute left-0 top-0 bottom-0 w-[4.5px] bg-[#2563eb] rounded-r-md" />
                                )}
                                <input
                                  type="checkbox"
                                  checked={isRowChecked}
                                  onChange={() => {
                                    setSelectedLogIds(prev =>
                                      prev.includes(item.id) 
                                        ? prev.filter(id => id !== item.id) 
                                        : [...prev, item.id]
                                    );
                                  }}
                                  className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] w-4 h-4 cursor-pointer accent-[#2563eb]"
                                />
                              </td>
                              <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                                <span>{item.hostName}</span>
                                <span className="text-[9px] text-[#2563eb] font-mono font-bold">({item.employeeId})</span>
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-505 text-slate-600 font-bold">{item.date}</td>
                              <td className="py-3 px-4 text-slate-800 font-bold">{item.brandHandled}</td>
                              <td className="py-3 px-4 text-slate-550 text-slate-600 font-semibold">{item.platform}</td>
                              <td className="py-3 px-4 text-indigo-705 text-indigo-700 font-mono text-[11px] font-bold">{item.shiftHours}</td>
                              
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded text-[9.5px] font-bold border uppercase border-solid tracking-wider ${
                                  item.status === "Present"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-150"
                                    : item.status === "Late"
                                    ? "bg-amber-50 text-amber-705 border-amber-150"
                                    : item.status === "Excused"
                                    ? "bg-purple-50 text-[#4b4382] border border-purple-100"
                                    : "bg-red-50 text-red-650 border border-red-100"
                                }`}>
                                  {item.status === "Present" ? "Hadir" : item.status === "Late" ? "Terlambat" : item.status === "Excused" ? "Sakit / Izin" : "Alpa / Absen"}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center items-center gap-1" id="fast_status_modifier_buttons_wrapper">
                                  <button
                                    id={`btn_mark_present_${item.id}`}
                                    onClick={() => handleUpdateLogStatus(item.id, "Present")}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 font-bold transition-all cursor-pointer text-slate-700 font-sans hover:bg-emerald-50"
                                    title="Tandai Tepat Waktu"
                                  >
                                    ✔ Hadir
                                  </button>
                                  <button
                                    id={`btn_mark_late_${item.id}`}
                                    onClick={() => handleUpdateLogStatus(item.id, "Late")}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-700 font-bold transition-all cursor-pointer text-slate-705 font-sans hover:bg-amber-50"
                                    title="Tandai Terlambat"
                                  >
                                    ⏰ Late
                                  </button>
                                  <button
                                    id={`btn_mark_absent_${item.id}`}
                                    onClick={() => handleUpdateLogStatus(item.id, "Absent")}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-slate-200 hover:border-red-500 hover:text-red-700 font-bold transition-all cursor-pointer text-slate-705 font-sans hover:bg-red-50"
                                    title="Tandai Alpa"
                                  >
                                    ❌ Alpa
                                  </button>
                                  <button
                                    id={`btn_mark_excused_${item.id}`}
                                    onClick={() => handleUpdateLogStatus(item.id, "Excused")}
                                    className="px-1.5 py-0.5 rounded text-[9px] bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-700 font-bold transition-all cursor-pointer text-slate-705 font-sans hover:bg-indigo-55 bg-slate-50"
                                    title="Tandai Izin"
                                  >
                                    🏖 Izin
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <button
                                  id={`btn_delete_log_${item.id}`}
                                  onClick={() => handleDeleteLog(item.id)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
                                  title="Hapus logs"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FLOATING BATCH BULK ACTIONS BAR (Slides up automatically when items are checked) */}
                {selectedLogIds.length > 0 && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-slate-700/80 text-white rounded-full shadow-2xl px-6 py-3.5 flex items-center gap-5 justify-center animate-fadeIn shadow-2xl scale-100 font-sans" id="database_bulk_actions_bar">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center font-black text-[10px] text-white">
                        {selectedLogIds.length}
                      </div>
                      <span className="text-[11px] font-bold text-slate-300 shrink-0">baris terpilih</span>
                    </div>

                    <div className="h-5 w-px bg-slate-700" />

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleBulkMarkPresent}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                      >
                        <Check className="w-3 h-3" /> Set Hadir
                      </button>

                      <button
                        type="button"
                        onClick={handleBulkMarkLate}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                      >
                        <Clock className="w-3 h-3" /> Set Late
                      </button>

                      <button
                        type="button"
                        onClick={handleBulkMarkAbsent}
                        className="bg-red-600 hover:bg-red-550 text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                      >
                        <X className="w-3 h-3" /> Set Alpa
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOperatorTab("sheets");
                        }}
                        className="bg-[#2563eb] hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                        title="Ekspor massal asisten sheets"
                      >
                        <FileSpreadsheet className="w-3 h-3" /> Ekspor Sheets
                      </button>

                      <button
                        type="button"
                        onClick={handleBulkDelete}
                        className="bg-slate-800 hover:bg-red-700 text-[#fca5a5] hover:text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    </div>

                    <div className="h-5 w-px bg-slate-700" />

                    <button
                      type="button"
                      onClick={() => setSelectedLogIds([])}
                      className="text-slate-400 hover:text-white font-bold text-[11px] cursor-pointer border-0 bg-transparent px-1.5 py-0.5 shrink-0"
                    >
                      Batal
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* ==================== SUBTAB: DATA BRAND ==================== */}
            {operatorTab === "data_brand" && (
              <div className="space-y-6 animate-fadeIn" id="operator_data_brand_content">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-indigo-500" /> Manajemen Data Brand Klien
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Data detail terkait kontrak, invoice, dan kredensial brand aktif.</p>
                    </div>
                    <button
                      onClick={() => setBrandFormEditor({ sessions: [], accounts: [] })}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all border-0 cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Klien Baru
                    </button>
                  </div>

                  {brandFormEditor && (
                    <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-5 relative">
                      <button onClick={() => setBrandFormEditor(null)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                      <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        {brandFormEditor.id ? "Edit Data Brand" : "Tambah Brand Klien"}
                      </h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const nameVal = fd.get("name") as string;
                        const defaultUsername = nameVal ? nameVal.toLowerCase().replace(/[^a-z0-9]/g, "") : `brand_${Date.now()}`;
                        const enteredUsername = (fd.get("clientUsername") as string)?.trim();

                        const newBrand: ClientBrand = {
                          id: brandFormEditor.id || `cb_${Date.now()}`,
                          name: nameVal,
                          contractEndDate: fd.get("contractEndDate") as string,
                          invoiceDate: fd.get("invoiceDate") as string,
                          monthlyMeetingDate: fd.get("monthlyMeetingDate") as string,
                          sessions: brandFormEditor.sessions || [],
                          accounts: brandFormEditor.accounts || [],
                          clientUsername: enteredUsername || brandFormEditor.clientUsername || defaultUsername,
                          clientPassword: (fd.get("clientPassword") as string) || "liva123",
                        };
                        
                        if (brandFormEditor.id) {
                          setClientBrands(prev => prev.map(b => b.id === newBrand.id ? newBrand : b));
                          addNotification("💼 Brand Diperbarui", `Data brand "${newBrand.name}" berhasil diperbarui oleh admin.`, "info", "data_brand");
                        } else {
                          setClientBrands(prev => [...prev, newBrand]);
                          addNotification("🎉 Brand Klien Baru", `Brand "${newBrand.name}" baru saja didaftarkan ke sistem livamedia.`, "success", "data_brand");
                        }
                        setBrandFormEditor(null);
                      }} className="space-y-4 text-xs">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Nama Brand</label>
                            <input required name="name" defaultValue={brandFormEditor.name} type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-bold mb-1">End Kontrak</label>
                            <input name="contractEndDate" defaultValue={brandFormEditor.contractEndDate || new Date().toISOString().split('T')[0]} type="date" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                           <label className="block text-slate-600 font-bold mb-1">Tanggal Invoice (Setiap Bulan)</label>
                            <input name="invoiceDate" defaultValue={brandFormEditor.invoiceDate} type="number" min="1" max="31" placeholder="Contoh: 5" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-bold mb-1">Tgl Monthly Meeting (Setiap Bulan)</label>
                            <input name="monthlyMeetingDate" defaultValue={brandFormEditor.monthlyMeetingDate} type="number" min="1" max="31" placeholder="Contoh: 10" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-bold mb-1 text-indigo-700">Username Portal Klien</label>
                            <input name="clientUsername" defaultValue={brandFormEditor.clientUsername} type="text" placeholder="Kosongkan utk default (huruf kecil)" className="w-full bg-white border border-indigo-200 text-indigo-900 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                          <div>
                            <label className="block text-slate-600 font-bold mb-1 text-indigo-700">Password Portal Klien</label>
                            <input name="clientPassword" defaultValue={brandFormEditor.clientPassword || "liva123"} type="text" placeholder="Default: liva123" className="w-full bg-white border border-indigo-200 text-indigo-900 rounded-lg px-3 py-2 font-bold focus:border-indigo-500 outline-none" />
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                            <h5 className="font-bold text-slate-800">Detail Sesi (Platform, Shift, Studio, Host)</h5>
                            <button type="button" onClick={() => {
                              setBrandFormEditor(prev => prev ? { ...prev, sessions: [...(prev.sessions || []), { id: `s_${Date.now()}`, platform: platforms[0] || "", shift: shifts[0] || "", studio: studios[0]?.name || "", host: "" }] } : prev);
                            }} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 border-0 flex items-center gap-1 cursor-pointer transition-colors"><Plus className="w-3 h-3" /> Tambah Sesi</button>
                          </div>
                          <div className="space-y-2">
                            {(brandFormEditor.sessions || []).map((sess, idx) => (
                              <div key={sess.id} className="flex flex-col xl:flex-row items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <select 
                                  value={sess.platform} 
                                  onChange={e => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, platform: e.target.value } : s) } : prev)}
                                  className="w-full xl:w-[140px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                >
                                  {platforms.map((p, i) => <option key={p + '_' + i} value={p}>{p}</option>)}
                                </select>
                                <select 
                                  value={sess.shift} 
                                  onChange={e => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, shift: e.target.value } : s) } : prev)}
                                  className="w-full xl:flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                >
                                  {shifts.map((sh, i) => <option key={sh + '_' + i} value={sh}>{sh}</option>)}
                                </select>
                                <select 
                                  value={sess.studio || ""}
                                  onChange={e => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, studio: e.target.value } : s) } : prev)}
                                  className="w-full xl:w-[180px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                >
                                  <option value="">Pilih Studio...</option>
                                  {studios.map((st, i) => <option key={st.id + '_' + i} value={st.name}>{st.name} - {st.location}</option>)}
                                </select>
                                <select 
                                  value={sess.host || ""}
                                  onChange={e => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.map((s, i) => i === idx ? { ...s, host: e.target.value } : s) } : prev)}
                                  className="w-full xl:w-[180px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none font-semibold text-slate-700 text-[10px]"
                                >
                                  <option value="">Host Reguler / Dedicated (Opsional)...</option>
                                  {hosts.map((h, i) => <option key={h.id + '_' + i} value={h.name}>{h.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setBrandFormEditor(prev => prev ? { ...prev, sessions: prev.sessions?.filter((_, i) => i !== idx) } : prev)} className="w-full xl:w-auto p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-100 cursor-pointer bg-white transition-all flex justify-center items-center">

                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            {(!brandFormEditor.sessions || brandFormEditor.sessions.length === 0) && (
                              <div className="text-slate-400 font-medium italic text-center py-2 text-[10px]">Belum ada sesi yang ditambahkan.</div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                            <h5 className="font-bold text-slate-800">Informasi Akun (Seller Center, dll)</h5>
                            <button type="button" onClick={() => {
                              setBrandFormEditor(prev => prev ? { ...prev, accounts: [...(prev.accounts || []), { id: `a_${Date.now()}`, type: platforms[0] || "", username: "", password: "", picOtp: "" }] } : prev);
                            }} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold hover:bg-indigo-100 border-0 flex items-center gap-1 cursor-pointer transition-colors"><Plus className="w-3 h-3" /> Tambah Akun</button>
                          </div>
                          <div className="space-y-3">
                            {(brandFormEditor.accounts || []).map((acc, idx) => (
                              <div key={acc.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 items-start">
                                <div className="sm:col-span-3">
                                   <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">Jenis Akun</label>
                                   <select 
                                     value={acc.type}
                                     onChange={e => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, type: e.target.value } : a) } : prev)}
                                     className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:border-indigo-500 outline-none text-slate-700"
                                   >
                                     <option value="">Pilih Platform...</option>
                                     {platforms.map((p, i) => <option key={p + '_' + i} value={p}>{p}</option>)}
                                     <option value="Lainnya">Lainnya</option>
                                   </select>
                                </div>
                                <div className="sm:col-span-3">
                                   <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">Username</label>
                                   <input 
                                     type="text" 
                                     value={acc.username}
                                     onChange={e => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, username: e.target.value } : a) } : prev)}
                                     className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[10px] focus:border-indigo-500 outline-none" 
                                   />
                                </div>
                                <div className="sm:col-span-3">
                                   <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">Password</label>
                                   <input 
                                     type="text" 
                                     value={acc.password}
                                     onChange={e => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, password: e.target.value } : a) } : prev)}
                                     className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[10px] focus:border-indigo-500 outline-none" 
                                   />
                                </div>
                                <div className="sm:col-span-2">
                                   <label className="block text-slate-500 font-bold mb-1 text-[9px] uppercase tracking-wider">PIC OTP</label>
                                   <input 
                                     type="text" 
                                     value={acc.picOtp}
                                     onChange={e => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.map((a, i) => i === idx ? { ...a, picOtp: e.target.value } : a) } : prev)}
                                     className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] focus:border-indigo-500 outline-none" 
                                     placeholder="Cth: WA Pak Budi"
                                   />
                                </div>
                                <div className="sm:col-span-1 pt-4 flex justify-end">
                                  <button type="button" onClick={() => setBrandFormEditor(prev => prev ? { ...prev, accounts: prev.accounts?.filter((_, i) => i !== idx) } : prev)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100 cursor-pointer bg-white transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {(!brandFormEditor.accounts || brandFormEditor.accounts.length === 0) && (
                              <div className="text-slate-400 font-medium italic text-center py-2 text-[10px]">Belum ada data akun.</div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                           <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer border-0 shadow-sm disabled:opacity-50" disabled={!brandFormEditor.sessions?.length}>
                             <Check className="w-4 h-4" /> Simpan Data Brand
                           </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-[#faf9fe]/80 p-4 rounded-xl border border-purple-100 mb-6 font-sans">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                      <input
                        type="text"
                        placeholder="Cari nama brand..."
                        value={brandDataSearch}
                        onChange={(e) => setBrandDataSearch(e.target.value)}
                        className="w-full bg-white border border-purple-150 rounded-xl pl-10 pr-4 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-400 transition-all font-bold shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-[#f8f9fc] border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">No</th>
                          <th 
                            className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                            onClick={() => setBrandDataSortDir(prev => prev === "asc" ? "desc" : "asc")}
                          >
                            <div className="flex items-center gap-1.5">
                              Nama Brand
                              <div className="flex flex-col text-[8px] leading-[0px]">
                                <span className={`${brandDataSortDir === "asc" ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400"}`}>▲</span>
                                <span className={`${brandDataSortDir === "desc" ? "text-indigo-600" : "text-slate-300 group-hover:text-slate-400"} mt-[2px]`}>▼</span>
                              </div>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Platform & Sesi</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Kontrak & Invoice</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Detail Akun</th>
                          <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 flex-1">
                        {filteredAndSortedBrands.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold text-xs bg-slate-50/50">
                              {brandDataSearch ? "Brand tidak ditemukan berdasarkan pencarian." : "Belum ada data brand klien."}
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedBrands.map((brand, i) => (
                            <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 align-top font-bold text-slate-500">{i + 1}</td>
                              <td className="px-4 py-3 align-top">
                                <div className="font-bold text-slate-800 text-sm">{brand.name}</div>
                                {brand.monthlyMeetingDate ? <div className="text-[10px] text-blue-600 mt-1 bg-blue-50/80 inline-block px-1.5 py-0.5 rounded font-bold border border-blue-100">Meeting: Tgl {brand.monthlyMeetingDate} tiap bulan</div> : <></>}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="space-y-1 min-w-[140px]">
                                  {brand.sessions && brand.sessions.length > 0 ? brand.sessions.map((sess) => (
                                    <div key={sess.id} className="bg-white border border-slate-100 rounded p-1.5 shadow-sm text-[9px]">
                                      <div className="font-black text-indigo-700 uppercase mb-0.5">{sess.platform}</div>
                                      <div className="text-slate-600 font-medium mb-0.5">{sess.shift}</div>
                                      {sess.studio && <div className="text-slate-500 font-bold flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {sess.studio}</div>}
                                      {sess.host && <div className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5"><UserCheck className="w-2.5 h-2.5" /> {sess.host}</div>}
                                    </div>
                                  )) : <div className="text-slate-400 text-[9px] italic">Belum ada sesi</div>}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="text-[10px] text-red-650 font-bold mb-1"><span className="text-slate-500 font-medium">End:</span> {brand.contractEndDate}</div>
                                <div className="text-[10px] text-emerald-650 font-bold mb-2"><span className="text-slate-500 font-medium">Inv:</span> {brand.invoiceDate ? `Setiap Tanggal ${brand.invoiceDate}` : "-"}</div>
                                <div className="mt-2 pt-2 border-t border-slate-100 text-[9px] text-indigo-700 bg-indigo-50/50 p-2 rounded-lg space-y-0.5">
                                  <div className="font-extrabold text-[8px] uppercase tracking-wider text-indigo-950 mb-0.5">🔑 Portal Klien:</div>
                                  <div>User: <span className="font-mono font-black select-all bg-white px-1 py-0.2 border border-indigo-100/50 rounded">{brand.clientUsername || brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}</span></div>
                                  <div>Pass: <span className="font-mono font-black select-all bg-white px-1 py-0.2 border border-indigo-100/50 rounded">{brand.clientPassword || "liva123"}</span></div>
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="space-y-1">
                                  {brand.accounts && brand.accounts.length > 0 ? brand.accounts.map((acc) => (
                                    <div key={acc.id} className="bg-slate-50 border border-slate-100 rounded p-1.5 text-[9px]">
                                      <div className="font-black tracking-wide text-slate-700 uppercase mb-1">{acc.type}</div>
                                      <div className="text-slate-500 font-mono mb-0.5">U: <span className="font-bold text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-100">{acc.username || "-"}</span></div>
                                      <div className="text-slate-500 font-mono">P: <span className="font-bold text-slate-800 bg-white px-1 py-0.5 rounded border border-slate-100">{acc.password || "-"}</span></div>
                                      <div className="text-slate-500 mt-1 font-semibold flex items-center gap-1"><Smartphone className="w-2.5 h-2.5" /> OTP: {acc.picOtp || "-"}</div>
                                    </div>
                                  )) : <div className="text-slate-400 text-[9px] italic">Belum ada akun</div>}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right align-top">
                                <div className="flex justify-end gap-1">
                                  <button onClick={() => {
                                      setBrandFormEditor(brand);
                                  }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded cursor-pointer border-0" title="Edit Brand">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => {
                                      requestConfirm(
                                        "Hapus Data Klien",
                                        `Apakah Anda yakin ingin menghapus data brand ${brand.name}?`,
                                        () => setClientBrands(p => p.filter(b => b.id !== brand.id)),
                                        "danger"
                                      );
                                  }} className="p-1.5 text-red-500 hover:bg-red-50 rounded cursor-pointer border-0" title="Hapus">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SUBTAB: REPORTING BRAND ==================== */}
            {operatorTab === "reporting_brand" && (
              <div className="space-y-6 animate-fadeIn" id="operator_reporting_brand_content bg-[#fafafd] min-h-screen">
                {activeReportBrandId === null ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden text-left">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                      <div className="relative z-10 max-w-2xl">
                        <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs inline-flex items-center gap-1.5 mb-3">
                          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> Workspace Pelaporan Eksternal
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none uppercase">Pilih Brand Klien Terlebih Dahulu</h3>
                        <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-2 leading-relaxed">
                          Silakan pilih salah satu Brand Klien untuk mengakses dashboard utama, mengimpor raw data laporan performance stream, menganalisis corong konversi, atau mengelola dan menghapus riwayat upload data mentah.
                        </p>
                      </div>
                    </div>

                    {/* FITUR PENCARIAN BRAND */}
                    <div className="bg-white p-4 rounded-3xl border border-indigo-100/80 flex flex-col sm:flex-row items-center gap-3 text-left">
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450" />
                        <input
                          type="text"
                          placeholder="Cari brand klien berdasarkan nama atau ID..."
                          value={reportBrandSearchQuery}
                          onChange={(e) => setReportBrandSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-405 focus:bg-white transition-all"
                        />
                      </div>
                      {reportBrandSearchQuery && (
                        <button
                          onClick={() => setReportBrandSearchQuery("")}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-colors cursor-pointer border-0 w-full sm:w-auto text-center"
                        >
                          Reset Pencarian
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                      {clientBrands
                        .filter(brand => {
                          if (!reportBrandSearchQuery.trim()) return true;
                          const q = reportBrandSearchQuery.toLowerCase();
                          return brand.name.toLowerCase().includes(q) || brand.id.toLowerCase().includes(q);
                        })
                        .map(brand => {
                          const numBrandLogs = brandPerformanceLogs.filter(log => log.brandId === brand.id).length;
                          const numUploadBatches = brandUploadHistory.filter(batch => batch.brandId === brand.id).length;
                          const totalGmvSum = brandPerformanceLogs
                            .filter(log => log.brandId === brand.id)
                            .reduce((sum, log) => sum + (log.gmv || 0), 0);

                          return (
                            <div 
                              key={brand.id}
                              onClick={() => {
                                setActiveReportBrandId(brand.id);
                                setSaveTargetBrandId(brand.id);
                                setAdminReportBrandFilter(brand.id);
                              }}
                              className="bg-white border border-slate-200 hover:border-indigo-400 p-6 rounded-3xl cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between min-h-[160px] relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 group-hover:bg-indigo-600/5 rounded-full transition-colors -mr-6 -mt-6"></div>
                              
                              <div>
                                <div className="flex items-center justify-between gap-3 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-55 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all uppercase whitespace-nowrap">
                                      {brand.name.substring(0, 2)}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                        {brand.name}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        ID: {brand.id}
                                      </p>
                                    </div>
                                  </div>
                                  {(numBrandLogs > 0 || numUploadBatches > 0) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAllBrandRawData(brand.id, brand.name);
                                      }}
                                      title="Hapus Semua Raw Data & Riwayat Brand"
                                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border-0 cursor-pointer transition-colors z-10 hover:shadow-xs"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-2 pt-2 border-t border-slate-100">
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Stored Sesi Live</span>
                                    <span className="text-xs font-black text-slate-700 block mt-0.5">{numBrandLogs} Sesi</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total Upload</span>
                                    <span className="text-xs font-black text-slate-700 block mt-0.5">{numUploadBatches} Batch</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                                <div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Total GMV</span>
                                  <span className="text-[11px] font-black text-indigo-600 block">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(totalGmvSum)}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                  Masuk Dashboard &rarr;
                                </span>
                              </div>
                            </div>
                          );
                        })}

                      {clientBrands.filter(brand => {
                        if (!reportBrandSearchQuery.trim()) return true;
                        const q = reportBrandSearchQuery.toLowerCase();
                        return brand.name.toLowerCase().includes(q) || brand.id.toLowerCase().includes(q);
                      }).length === 0 && (
                        <div className="col-span-full bg-slate-50 border border-slate-200 border-dashed p-10 rounded-3xl text-center text-slate-400 text-xs font-semibold">
                          {reportBrandSearchQuery ? "Tidak ada brand klien yang cocok dengan kata kunci pencarian Anda." : "Belum ada Brand Klien terdaftar. Silakan tambahkan brand pada sub-menu \"Data Brand\" terlebih dahulu."}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-full bg-[#fafafd] pb-12 overflow-x-hidden border border-slate-100 rounded-3xl overflow-hidden shadow-sm pt-0 relative mt-2 text-slate-800 font-sans text-left">
                      {/* Header Workspace */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white mb-6 text-left border-b border-slate-200 px-6 sm:px-8 py-5">
                         <div className="flex items-center gap-4">
                           <button 
                              onClick={() => {
                                setActiveReportBrandId(null);
                                setReportingRawData([]);
                                setAutoDetectNotice("");
                              }}
                              className="bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm focus:outline-none"
                           >
                              <ArrowLeft className="w-4 h-4" />
                           </button>
                           <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                             {clientBrands.find(b => b.id === activeReportBrandId)?.name || "Nama Brand"}
                           </h3>
                         </div>

                         <div className="flex flex-wrap gap-2">
                           <button
                             onClick={() => {
                               setIsDeleteByDateModalOpen(true);
                             }}
                             className="px-4 py-2 bg-white text-orange-600 hover:text-orange-700 font-bold text-[11px] rounded-lg shadow-sm border border-slate-200 hover:bg-orange-50 flex items-center gap-2 cursor-pointer transition-all"
                             title="Hapus Rentang Waktu"
                           >
                             <Calendar className="w-3.5 h-3.5" />
                             Hapus Rentang Waktu
                           </button>

                           <button
                             onClick={() => {
                               handleDeleteAllBrandRawData(activeReportBrandId || "", clientBrands.find(b => b.id === activeReportBrandId)?.name || "");
                             }}
                             className="px-4 py-2 bg-white text-red-600 hover:text-red-700 font-bold text-[11px] rounded-lg shadow-sm border border-slate-200 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-all"
                             title="Hapus Semua Data"
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                             Hapus Semua Data
                           </button>

                           <button
                             onClick={() => {
                               setSaveTargetBrandId(activeReportBrandId || "");
                               setIsUploadModalOpen(true);
                             }}
                             className="px-4 py-2 bg-slate-900 text-white font-bold text-[11px] rounded-lg shadow-sm border border-slate-800 hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-all"
                           >
                             <Download className="w-3.5 h-3.5" />
                             Import
                           </button>
                         </div>
                      </div>

                    {isDeleteByDateModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full overflow-hidden p-6 relative animate-scaleUp">
                           <button
                             onClick={() => setIsDeleteByDateModalOpen(false)}
                             className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-transparent border-0 cursor-pointer"
                           >
                              ✕
                           </button>
                           <h3 className="text-lg font-black text-slate-800 mb-2">Hapus Berdasarkan Rentang Waktu</h3>
                           <p className="text-xs font-semibold text-slate-500 mb-6">
                             Pilih rentang tanggal. Semua raw data milik brand ini pada periode yang dipilih akan dihapus permanen.
                           </p>

                           <div className="space-y-4">
                             <div>
                               <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">Dari Tanggal (Start)</label>
                               <input type="date" value={deleteByDateStart} onChange={(e) => setDeleteByDateStart(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                             </div>
                             <div>
                               <label className="block text-[10px] uppercase font-black tracking-wider text-slate-500 mb-1">Sampai Tanggal (End)</label>
                               <input type="date" value={deleteByDateEnd} onChange={(e) => setDeleteByDateEnd(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                             </div>
                           </div>

                           <div className="mt-8 flex justify-end gap-3">
                             <button onClick={() => setIsDeleteByDateModalOpen(false)} className="px-4 py-2 font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border-0">Batal</button>
                             <button onClick={handleDeleteBrandRawDataByDateRange} className="px-4 py-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer border-0 shadow-sm flex items-center gap-2">
                               <Trash2 className="w-3.5 h-3.5" /> Hapus Data
                             </button>
                           </div>
                        </div>
                      </div>
                    )}

                    {isUploadModalOpen && (
                      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fadeIn" id="upload_report_modal">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full p-6 sm:p-8 text-left relative my-8 max-h-[90vh] overflow-y-auto custom-scroll animate-scaleUp">
                          {/* Close Button */}
                          <button
                            onClick={() => {
                              if (isSavingReport) return;
                              setIsUploadModalOpen(false);
                              setReportingRawData([]);
                              setAutoDetectNotice("");
                            }}
                            className={`absolute top-5 right-5 p-2 rounded-full transition-colors border-0 bg-transparent text-xl font-bold ${isSavingReport ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer'}`}
                            title="Tutup Open Laporan"
                            disabled={isSavingReport}
                          >
                            ✕
                          </button>

                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black text-slate-850 flex items-center gap-3">
                                <LineChart className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600 animate-pulse" /> Upload Laporan Eksternal Marketplace
                              </h3>
                              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">Impor data performa mentah (raw data) penyiaran langsung dari platform marketplace (TikTok/Shopee/dll) untuk <strong className="text-indigo-950 uppercase">{clientBrands.find(b => b.id === activeReportBrandId)?.name}</strong>.</p>
                            </div>
                          </div>

                  {/* FORM PENENTU BRAND & PLATFORM (Selalu terlihat sebagai default tujuan) */}
                  <div className="bg-[#f8fafc] border border-slate-250 p-5 rounded-2xl mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-indigo-600" /> Konfigurasi Brand & Platform Penerima
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400">Pastikan tujuan data diatur secara benar sebelum Anda melakukan upload file Excel/CSV/XLS.</p>
                      </div>
                      <span className="bg-white text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs self-start sm:self-auto flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" /> Auto-Detect Aktif
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">1. Pilih Target Brand Klien</label>
                        <select 
                          required
                          value={saveTargetBrandId} 
                          onChange={(e) => setSaveTargetBrandId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                        >
                          <option value="">-- Pilih Brand Klien --</option>
                          {clientBrands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">2. Tentukan Platform Marketplace</label>
                        <select 
                          value={saveTargetPlatform} 
                          onChange={(e) => setSaveTargetPlatform(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                        >
                          <option value="TikTok Live">TikTok Live</option>
                          <option value="Shopee Live">Shopee Live</option>
                          <option value="Tokopedia">Tokopedia</option>
                          <option value="Lazada">Lazada</option>
                        </select>
                      </div>
                    </div>

                    {autoDetectNotice && (
                      <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl text-xs text-indigo-950 font-bold flex items-center gap-2.5 animate-fadeIn">
                        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 animate-bounce" />
                        <div>
                          <p className="text-indigo-850">{autoDetectNotice}</p>
                          <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Sistem memetakan file secara otomatis. Anda tetap dapat mengubah dropdown di atas secara manual jika tidak sesuai.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {reportingRawData.length === 0 ? (
                    <div className="space-y-4">
                      <div 
                        className={`relative border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center transition-all ${isDragOverReporting ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragOverReporting(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragOverReporting(false); }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          setIsDragOverReporting(false);
                          const file = e.dataTransfer.files[0];
                          if (file) handleUploadReportingRaw(file);
                        }}
                      >
                        <input 
                          type="file" 
                          id="reporting_upload" 
                          className="hidden" 
                          accept=".xlsx,.xls,.csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadReportingRaw(file);
                          }}
                        />
                        <label htmlFor="reporting_upload" className="cursor-pointer flex flex-col items-center justify-center gap-4">
                          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                            <Upload className="w-10 h-10 text-indigo-500" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-800">Upload Raw Data Marketplace</h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">Tarik & lepas file Export TikTok/Shopee (Excel/CSV) ke area ini, atau klik untuk memilih file.</p>
                            <p className="text-[10px] text-indigo-600 font-mono font-bold mt-2">💡 Tips: Beri nama file yang mengandung nama Brand & Platform Anda (contoh: Laporan_Hanasui_TikTok.xlsx) untuk auto-detect otomatis!</p>
                          </div>
                          <div className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                            Pilih File Excel / CSV
                          </div>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-indigo-900">Data Analytics Berhasil Diproses</h4>
                            <p className="text-[10px] sm:text-xs font-semibold text-indigo-700">{reportingRawData.length} Sesi Live Terdeteksi</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setReportingRawData([]);
                            setAutoDetectNotice("");
                          }}
                          className="px-4 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-black rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          Reset Data
                        </button>
                      </div>

                      {/* BAR AKSI PENYIMPANAN DATABASE */}
                      <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                        <div>
                          <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-600" /> Konfirmasi Penyimpanan Database
                          </h4>
                          <p className="text-xs font-semibold text-emerald-800 mt-1">
                            Laporan akan disimpan untuk Brand: <strong className="text-emerald-950 font-black">{clientBrands.find(b => b.id === saveTargetBrandId)?.name || "(PILIH BRAND DULU DIATAS)"}</strong> | Platform: <strong className="text-emerald-950 font-black">{saveTargetPlatform}</strong>.
                          </p>
                        </div>
                        <button 
                          onClick={handleSaveReportingDataToDatabase}
                          disabled={isSavingReport}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-sm transition-all border-0 flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                        >
                          {isSavingReport ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Sedang Menyimpan Laporan...
                            </>
                          ) : (
                            <>
                              <Database className="w-3.5 h-3.5" />
                              Simpan Permanen ke Database Brand
                            </>
                          )}
                        </button>
                      </div>

                      {/* STATS OVERVIEW */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Perolehan GMV</p>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                              reportingRawData.reduce((acc, curr) => acc + (curr.gmv || 0), 0)
                            )}
                          </h3>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Produk Terjual</p>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('id-ID').format(
                              reportingRawData.reduce((acc, curr) => acc + (curr.products_sold || 0), 0)
                            )} <span className="text-xs font-bold text-slate-400 ml-1">pcs</span>
                          </h3>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Pembeli</p>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('id-ID').format(
                              reportingRawData.reduce((acc, curr) => acc + (curr.buyers || 0), 0)
                            )} <span className="text-xs font-bold text-slate-400 ml-1">users</span>
                          </h3>
                        </div>
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Capaian AOV Rata-rata</p>
                          <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
                              (reportingRawData.reduce((acc, curr) => acc + (curr.gmv || 0), 0)) / 
                              (reportingRawData.reduce((acc, curr) => acc + (curr.buyers || 0), 0) || 1)
                            )}
                          </h3>
                        </div>
                      </div>

                      {/* TIKTOK ENGAGEMENT & LIVE METRICS PANEL */}
                      {saveTargetPlatform === "TikTok Live" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left shadow-lg relative overflow-hidden dark:bg-slate-950">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                          <div className="col-span-2 md:col-span-4 flex items-center justify-between pb-2 border-b border-white/10">
                            <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> TikTok Shop Liveroom Metrics
                            </h5>
                            <span className="text-[8px] font-black text-indigo-300 uppercase bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">Live Performance</span>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-pink-300">Penonton Sesi (Views)</p>
                            <h3 className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
                              {new Intl.NumberFormat('id-ID').format(reportingRawData.reduce((acc, curr) => acc + (curr.impressions || 0), 0))}
                            </h3>
                            <p className="text-[8px] text-slate-500 font-semibold mt-0.5">Unique Impressions</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-green-300">Pengikut Baru (Fans)</p>
                            <h3 className="text-lg sm:text-xl font-black text-green-400 font-mono mt-0.5">
                              +{new Intl.NumberFormat('id-ID').format(reportingRawData.reduce((acc, curr) => acc + (curr.followers || 0), 0))}
                            </h3>
                            <p className="text-[8px] text-green-300 font-semibold mt-0.5">Followers Gained</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-rose-300">Total Suka (Likes)</p>
                            <h3 className="text-lg sm:text-xl font-black text-pink-400 font-mono mt-0.5">
                              {new Intl.NumberFormat('id-ID').format(reportingRawData.reduce((acc, curr) => acc + (curr.likes || 0), 0))}
                            </h3>
                            <p className="text-[8px] text-pink-300 font-semibold mt-0.5">Stream Likes</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-cyan-300">Dibagikan (Shares)</p>
                            <h3 className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-0.5">
                              {new Intl.NumberFormat('id-ID').format(reportingRawData.reduce((acc, curr) => acc + (curr.shares || 0), 0))}
                            </h3>
                            <p className="text-[8px] text-cyan-300 font-semibold mt-0.5 max-w-full truncate">Session Shared</p>
                          </div>
                        </div>
                      )}

                      {/* CHART CONTAINER & FUNNEL */}
                      {(() => {
                        const totalImpressions = reportingRawData.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
                        const totalLiveVisits = reportingRawData.reduce((acc, curr) => acc + (curr.liveVisits || 0), 0);
                        const totalProductImpressions = reportingRawData.reduce((acc, curr) => acc + (curr.productImpressions || 0), 0);
                        const totalClicks = reportingRawData.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
                        const totalOrders = reportingRawData.reduce((acc, curr) => acc + (curr.orders || 0), 0);
                        const totalBuyers = reportingRawData.reduce((acc, curr) => acc + (curr.buyers || 0), 0);

                        const ctrRate = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
                        const cartToClickRate = totalClicks > 0 ? (totalOrders / totalClicks) * 100 : 0;
                        const checkoutRate = totalOrders > 0 ? (totalBuyers / totalOrders) * 100 : 0;
                        const overallCvr = totalImpressions > 0 ? (totalBuyers / totalImpressions) * 100 : 0;

                        const clickWidth = totalImpressions > 0 ? Math.max((totalClicks / totalImpressions) * 100, 30) : 75;
                        const orderWidth = totalImpressions > 0 ? Math.max((totalOrders / totalImpressions) * 100, 15) : 40;
                        const buyerWidth = totalImpressions > 0 ? Math.max((totalBuyers / totalImpressions) * 100, 5) : 15;

                        return (
                          <div className="grid grid-cols-1 gap-6">
                            {/* CHART */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[350px] flex flex-col justify-between">
                              <div>
                                <h4 className="text-sm font-black text-slate-800 mb-6 text-left">Tren GMV & Transaksi Harian</h4>
                                <div className="h-64 w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart
                                      data={[...reportingRawData].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                      <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                                      <YAxis 
                                        yAxisId="left" 
                                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tickFormatter={(val) => `Rp${(val/1000000).toFixed(1)}M`}
                                      />
                                      <YAxis 
                                        yAxisId="right" 
                                        orientation="right"
                                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                      />
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }}
                                        formatter={(value: any, name: string) => [
                                          name === "GMV" ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value) : value, 
                                          name
                                        ]}
                                      />
                                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                      <Line yAxisId="left" type="monotone" name="GMV" dataKey="gmv" stroke="#4f46e5" strokeWidth={3} dot={{r:4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff"}} activeDot={{r: 6}} />
                                      <Line yAxisId="right" type="monotone" name="Produk Terjual" dataKey="products_sold" stroke="#ec4899" strokeWidth={3} dot={{r:4, fill: "#ec4899", strokeWidth: 2, stroke: "#fff"}} />
                                    </RechartsLineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>
                            </div>

                            {/* FUNNEL CARD */}
                            <HorizontalFunnel 
                              title="Corong Konversi Live (Funnel)"
                              subtitle={`${saveTargetPlatform || activeReportPlatform || "Live"} Performance`}
                              tag={reportingRawData.some(r => r.hasFunnelInFile) ? "Parsed Excel" : "Benchmark Estimate"}
                              steps={(saveTargetPlatform === "TikTok Live" || activeReportPlatform === "TikTok Live") ? [
                                { label: "LIVE impressions", value: new Intl.NumberFormat('id-ID').format(totalImpressions) },
                                { label: "LIVE visits", value: new Intl.NumberFormat('id-ID').format(totalLiveVisits) },
                                { label: "Product impressions", value: new Intl.NumberFormat('id-ID').format(totalProductImpressions) },
                                { label: "Product clicks", value: new Intl.NumberFormat('id-ID').format(totalClicks) },
                                { label: "Orders paid for", value: new Intl.NumberFormat('id-ID').format(totalBuyers) }
                              ] : [
                                { label: "Sessions", value: new Intl.NumberFormat('id-ID').format(totalImpressions) },
                                { label: "Product View", value: new Intl.NumberFormat('id-ID').format(totalClicks) },
                                { label: "Add to Cart", value: new Intl.NumberFormat('id-ID').format(totalOrders) },
                                { label: "Purchase", value: new Intl.NumberFormat('id-ID').format(totalBuyers) }
                              ]}
                            />
                          </div>
                        );
                      })()}

                      {/* DATA TABLE */}
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <th className="px-5 py-4">Waktu Mulai</th>
                                <th className="px-5 py-4">Streaming / Akun</th>
                                <th className="px-5 py-4 text-right">Durasi (Mnt)</th>
                                <th className="px-5 py-4 text-right">Perolehan GMV</th>
                                <th className="px-5 py-4 text-right">Produk Terjual</th>
                                <th className="px-5 py-4 text-right">Pembeli (Orders)</th>
                                <th className="px-5 py-4 text-right">Rasio CTR / CVR</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {reportingRawData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((row, idx) => {
                                const actualCtr = row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0;
                                const actualCvr = row.impressions > 0 ? (row.buyers / row.impressions) * 105 : 0; // standard multiplier
                                const finalCvr = row.impressions > 0 ? (row.buyers / row.impressions) * 100 : 0;
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3.5 whitespace-nowrap text-xs font-bold text-slate-800">
                                      {row.date}
                                      <span className="block text-[9px] font-semibold text-slate-400 mt-1 font-mono">Platform: {saveTargetPlatform}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-xs text-left">
                                      <div className="font-extrabold text-indigo-950 leading-tight">{row.title}</div>
                                      {saveTargetPlatform === "TikTok Live" && (
                                        <div className="flex gap-2 text-[9px] font-bold text-slate-400 mt-1">
                                          <span>❤️ {new Intl.NumberFormat('id-ID').format(row.likes || 0)} Likes</span>
                                          <span>•</span>
                                          <span>🔗 {new Intl.NumberFormat('id-ID').format(row.shares || 0)} Shares</span>
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <div className="text-xs font-semibold text-slate-600">{Math.round(row.duration / 60) || row.duration} Mnt</div>
                                      {saveTargetPlatform === "TikTok Live" && (
                                        <div className="text-[9px] font-black text-green-600 mt-1 animate-pulse">+{row.followers} Fans</div>
                                      )}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <div className="text-xs font-black text-emerald-600">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(row.gmv)}
                                      </div>
                                      <div className="text-[9px] font-extrabold text-slate-400 mt-0.5">AOV: Rp{Math.round(row.aov || 0).toLocaleString('id-ID')}</div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <div className="text-xs font-bold text-slate-700">{row.products_sold} Pcs</div>
                                      <div className="text-[9px] text-slate-400 font-bold mt-1">🛍️ {row.clicks} Klik Keranjang</div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <div className="text-xs font-bold text-slate-700">{row.buyers} Users</div>
                                      <div className="text-[9px] text-pink-600 font-bold mt-1">🛒 {row.orders} Checkout</div>
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                      <div className="text-xs font-black text-indigo-600">CTR: {actualCtr.toFixed(1)}%</div>
                                      <div className="text-[9px] font-black text-slate-500 mt-1">CVR: {finalCvr.toFixed(2)}%</div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                        </div>
                      </div>
                    )}

                  {/* STORED DATABASE VIEWER - NEW DESIGN */}
                  <div className="px-6 sm:px-8 space-y-6 animate-fadeIn pb-8">
                     {(() => {
                         const filteredDb = brandPerformanceLogs.filter(log => log.brandId === activeReportBrandId);
                         // Chart Data Filtered By Search & Date
                         const tableLogs = filteredDb.filter(log => {
                           if (log.date && operatorDateFilterType !== "all") {
                             let logMonth = log.date.substring(0, 7); // format YYYY-MM
                             let normalizedLogDate = log.date;
                             
                             // Handle DD/MM/YYYY or DD-MM-YYYY
                             if (log.date.indexOf('/') !== -1 || (log.date.indexOf('-') !== -1 && log.date.split('-')[0].length <= 2)) {
                               const parts = log.date.split(/[\/\-]/);
                               if (parts.length === 3) {
                                 const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                                 const m = String(parts[1]).padStart(2, '0');
                                 const d = String(parts[0]).padStart(2, '0');
                                 
                                 if (parts[0].length === 4) {
                                     normalizedLogDate = `${parts[0]}-${m}-${parts[2].padStart(2, '0')}`;
                                     logMonth = `${parts[0]}-${m}`;
                                 } else {
                                     normalizedLogDate = `${y}-${m}-${d}`;
                                     logMonth = `${y}-${m}`;
                                 }
                               }
                             }

                             if (operatorDateFilterType === "month") {
                               if (logMonth !== operatorSelectedMonth) return false;
                             } else if (operatorDateFilterType === "custom") {
                               if (operatorCustomStartDate && normalizedLogDate < operatorCustomStartDate) return false;
                               if (operatorCustomEndDate && normalizedLogDate > operatorCustomEndDate) return false;
                             }
                           }
                           if (reportDbSearchQuery.trim()) {
                             const q = reportDbSearchQuery.toLowerCase();
                             const matchTitle = String(log.title || "").toLowerCase().includes(q);
                             const matchDate = String(log.date || "").toLowerCase().includes(q);
                             const matchPlatform = String(log.platform || "").toLowerCase().includes(q);
                             if (!matchTitle && !matchDate && !matchPlatform) return false;
                           }
                           return true;
                         });

                         const totalSessionsDb = tableLogs.length;
                         const totalGmvDb = tableLogs.reduce((sum, item) => sum + (item.gmv || 0), 0);
                         const totalBuyersDb = tableLogs.reduce((sum, item) => sum + (item.buyers || 0), 0);
                         const totalOrdersDb = tableLogs.reduce((sum, item) => sum + (item.orders || 0), 0);
                         const totalItemsSoldDb = tableLogs.reduce((sum, item) => sum + (item.products_sold || 0), 0);
                         const avgAovDb = totalBuyersDb > 0 ? totalGmvDb / totalBuyersDb : 0;

                         // Engagement metrics
                         const totalLikesDb = tableLogs.reduce((sum, item) => sum + (item.likes || 0), 0);
                         const totalCommentsDb = tableLogs.reduce((sum, item) => sum + (item.comments || 0), 0);
                         const totalSharesDb = tableLogs.reduce((sum, item) => sum + (item.shares || 0), 0);
                         const totalClicksDb = tableLogs.reduce((sum, item) => sum + (item.clicks || 0), 0);
 
                         // For Funnel 
                         const totalDbImpressions = tableLogs.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
                         const totalDbLiveVisits = tableLogs.reduce((acc, curr) => acc + (curr.liveVisits || 0), 0);
                         const totalDbProductImpressions = tableLogs.reduce((acc, curr) => acc + (curr.productImpressions || 0), 0);
                         const totalDbClicks = tableLogs.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
                         const totalDbBuyers = tableLogs.reduce((acc, curr) => acc + (curr.buyers || 0), 0);
                         const totalDbOrdersFunnel = tableLogs.reduce((acc, curr) => acc + (curr.orders || 0), 0);

                         const funnelCtr = totalDbProductImpressions > 0 ? ((totalDbClicks / totalDbProductImpressions) * 100) : 0;
                         const funnelCtor = totalDbClicks > 0 ? ((totalDbOrdersFunnel / totalDbClicks) * 100) : 0;

                         const chartDataObj = [...tableLogs].reduce((acc: any, curr: any) => {
                           let d = curr.date;
                           if (d && (d.indexOf('/') !== -1 || (d.indexOf('-') !== -1 && d.split('-')[0].length <= 2))) {
                               const parts = d.split(/[\/\-]/);
                               if (parts.length === 3) {
                                 if (parts[0].length === 4) {
                                     d = `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
                                 } else {
                                     const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                                     d = `${y}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
                                 }
                               }
                           }
                           
                           if (!acc[d]) acc[d] = { date: d, gmv: 0, impressions: 0 };
                           acc[d].gmv += (curr.gmv || 0);
                           acc[d].impressions += (curr.impressions || curr.views || curr.liveVisits || 0);
                           return acc;
                         }, {});
                         const chartData = Object.values(chartDataObj).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                         
                         // Apply Sorting for Table
                         const sortedTableLogs = [...tableLogs].sort((a, b) => {
                           let valA = a[reportDbSortCol] || '';
                           let valB = b[reportDbSortCol] || '';
                           
                           if (reportDbSortCol === 'date') {
                             const normalizeDateStr = (d: string) => {
                               if (!d) return "";
                               if (d.indexOf('/') !== -1 || (d.indexOf('-') !== -1 && d.split('-')[0].length <= 2)) {
                                   const parts = d.split(/[\/\-]/);
                                   if (parts.length === 3) {
                                     if (parts[0].length === 4) {
                                         return `${parts[0]}-${String(parts[1]).padStart(2, '0')}-${String(parts[2]).padStart(2, '0')}`;
                                     }
                                     const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                                     return `${y}-${String(parts[1]).padStart(2, '0')}-${String(parts[0]).padStart(2, '0')}`;
                                   }
                               }
                               return d;
                             };
                             valA = normalizeDateStr(a.date);
                             valB = normalizeDateStr(b.date);
                           } else if (reportDbSortCol === 'views') {
                             valA = a.impressions || a.views || 0;
                             valB = b.impressions || b.views || 0;
                           } else if (reportDbSortCol === 'ctr') {
                             valA = a.productImpressions ? (a.clicks / a.productImpressions) : 0;
                             valB = b.productImpressions ? (b.clicks / b.productImpressions) : 0;
                           } else if (reportDbSortCol === 'ctor') {
                             valA = a.clicks ? (a.orders / a.clicks) : 0;
                             valB = b.clicks ? (b.orders / b.clicks) : 0;
                           } else if (reportDbSortCol === 'customers') {
                             valA = a.buyers || 0;
                             valB = b.buyers || 0;
                           }

                           if (typeof valA === 'string' && typeof valB === 'string') {
                             return reportDbSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
                           }
                           return reportDbSortAsc ? (valA > valB ? 1 : -1) : (valB > valA ? 1 : -1);
                         });

                         const paginatedLogs = sortedTableLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                         const totalPages = Math.ceil(sortedTableLogs.length / ITEMS_PER_PAGE);

                         const handleSort = (col) => {
                           if (reportDbSortCol === col) {
                             setReportDbSortAsc(!reportDbSortAsc);
                           } else { 
                             setReportDbSortCol(col); 
                             setReportDbSortAsc(true); // default to asc on new col
                           }
                         };
 
                         return (
                           <>
                             {/* Table Filters */}
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                               <div className="relative w-full sm:w-72">
                                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                 <input
                                   type="text"
                                   placeholder="Search sessions..."
                                   value={reportDbSearchQuery}
                                   onChange={(e) => setReportDbSearchQuery(e.target.value)}
                                   className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400 transition-colors shadow-sm"
                                 />
                               </div>
                               <div className="relative flex gap-2 w-full sm:w-auto h-9">
                                 <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                   {[
                                     { id: "all", label: "Semua" },
                                     { id: "month", label: "Bulan" },
                                     { id: "custom", label: "Custom" }
                                   ].map(item => (
                                      <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                          setOperatorDateFilterType(item.id);
                                          if (item.id === "all") {
                                            setIsOperatorCalendarOpen(false);
                                            setIsOperatorMonthOpen(false);
                                          } else if (item.id === "month") {
                                            setIsOperatorMonthOpen(true);
                                            setIsOperatorCalendarOpen(false);
                                          } else if (item.id === "custom") {
                                            setIsOperatorCalendarOpen(true);
                                            setIsOperatorMonthOpen(false);
                                            setOperatorTempStartDate(operatorCustomStartDate || formatDateYYYYMMDD(new Date()));
                                            setOperatorTempEndDate(operatorCustomEndDate || formatDateYYYYMMDD(new Date()));
                                          }
                                        }}
                                        className={`px-3 py-1 rounded text-[10px] font-bold text-center flex-1 sm:flex-initial cursor-pointer border-0 transition-colors ${
                                          operatorDateFilterType === item.id 
                                          ? "bg-white text-indigo-700 shadow-sm border border-slate-100" 
                                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                                        }`}
                                      >
                                        {item.label}
                                      </button>
                                   ))}
                                 </div>
                                  
                                 {((operatorDateFilterType === "custom" && operatorCustomStartDate) || operatorDateFilterType === "month") && (
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                      <span className="text-[10px] font-bold text-slate-700">
                                        {operatorDateFilterType === "month" 
                                          ? getIndonesianMonthLabel(operatorSelectedMonth) 
                                          : `${operatorCustomStartDate} to ${operatorCustomEndDate}`}
                                      </span>
                                    </div>
                                 )}

                                 {/* Custom Date Overlay UI (Month) */}
                                 {isOperatorMonthOpen && operatorDateFilterType === "month" && (
                                   <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl shadow-lg border border-slate-200 w-64 animate-fadeIn">
                                     <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                       <h5 className="text-[10px] font-black uppercase text-slate-500">Pilih Bulan</h5>
                                       <button type="button" onClick={() => setIsOperatorMonthOpen(false)} className="text-slate-400 hover:text-slate-700 font-black cursor-pointer border-0 bg-transparent">✕</button>
                                     </div>
                                     <div className="grid grid-cols-2 gap-2 text-[10px] font-bold max-h-48 overflow-y-auto">
                                       {(() => {
                                         const mList = []; 
                                         const cDate = new Date();
                                         for(let i=-2; i<=22; i++) {
                                           const d = new Date(cDate.getFullYear(), cDate.getMonth() - i, 1);
                                           mList.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`);
                                         }
                                         return mList.map(mVal => (
                                           <button
                                             key={mVal} type="button"
                                             onClick={() => { setOperatorSelectedMonth(mVal); setIsOperatorMonthOpen(false); }}
                                             className={`py-1.5 rounded-lg border-0 cursor-pointer ${
                                               operatorSelectedMonth === mVal ? "bg-indigo-600 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                                             }`}
                                           >{getIndonesianMonthLabel(mVal)}</button>
                                         ));
                                       })()}
                                     </div>
                                   </div>
                                 )}

                                 {/* Custom Date Overlay UI (Custom) */}
                                 {isOperatorCalendarOpen && operatorDateFilterType === "custom" && (
                                   <div className="absolute right-0 top-full mt-2 z-50 animate-fadeIn">
                                     <DoubleDatePicker 
                                       startDate={operatorTempStartDate} 
                                       endDate={operatorTempEndDate} 
                                       onChange={(start, end) => {
                                         setOperatorTempStartDate(start);
                                         setOperatorTempEndDate(end);
                                       }} 
                                       onApply={() => {
                                         setOperatorCustomStartDate(operatorTempStartDate);
                                         setOperatorCustomEndDate(operatorTempEndDate);
                                         setIsOperatorCalendarOpen(false);
                                       }} 
                                       onCancel={() => setIsOperatorCalendarOpen(false)} 
                                     />
                                   </div>
                                 )}
                               </div>
                             </div>
 
                              {/* Summary Cards */}
                             <div className="space-y-6 mb-6">
                               <div>
                                 <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Sale Metrics</h4>
                                 <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">GMV</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(totalGmvDb)}</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Item Sold</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalItemsSoldDb)}</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Customers</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalBuyersDb)}</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">SKU Orders</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalOrdersDb)}</div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">AOV</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(avgAovDb)}</div>
                                    </div>
                                 </div>
                               </div>

                               <div>
                                 <h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Engagement Metrics</h4>
                                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Like</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalLikesDb)}</div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Comment</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalCommentsDb)}</div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Share</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalSharesDb)}</div>
                                    </div>
                                    <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
                                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mb-2">Product Clicks</div>
                                      <div className="text-xl font-black tracking-tight text-slate-900 leading-none">{new Intl.NumberFormat('id-ID').format(totalClicksDb)}</div>
                                    </div>
                                 </div>
                               </div>
                             </div>
 
                             {/* Funnel */}
                             {totalDbImpressions > 0 && (
                               <div className="mb-6">
                                 <HorizontalFunnel 
                                   title="Live Sales Funnel"
                                   subtitle="All Platform & Dates"
                                   steps={[
                                     { label: "LIVE impressions", value: new Intl.NumberFormat('id-ID').format(totalDbImpressions) },
                                     { label: "Video/Live Visits", value: new Intl.NumberFormat('id-ID').format(totalDbLiveVisits) },
                                     { label: "Product impressions", value: new Intl.NumberFormat('id-ID').format(totalDbProductImpressions) },
                                     { label: `Product clicks (CTR: ${funnelCtr.toFixed(2)}%)`, value: new Intl.NumberFormat('id-ID').format(totalDbClicks) },
                                     { label: `Orders paid (CTOR: ${funnelCtor.toFixed(2)}%)`, value: new Intl.NumberFormat('id-ID').format(totalDbBuyers) }
                                   ]}
                                 />
                               </div>
                             )}
 
                           {/* Charts */}
                             <div className="mb-6">
                                 <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm h-[400px] flex flex-col">
                                   <div className="flex items-center justify-between mb-6">
                                     <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">Trend Performa</h4>
                                     <div className="flex gap-4">
                                       <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                                         <input 
                                           type="checkbox" 
                                           checked={trendFilters.gmv}
                                            onChange={(e) => setTrendFilters({...trendFilters, gmv: e.target.checked})}
                                           className="w-3.5 h-3.5 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                         />
                                         GMV
                                       </label>
                                       <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                                         <input 
                                           type="checkbox" 
                                           checked={trendFilters.views}
                                           onChange={(e) => setTrendFilters({...trendFilters, views: e.target.checked})}
                                           className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                         />
                                         Views
                                       </label>
                                     </div>
                                   </div>
                                   <div className="flex-1 w-full min-h-0">
                                     <ResponsiveContainer width="100%" height="100%" className="focus:outline-none">
                                       <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} className="focus:outline-none" style={{ outline: 'none' }}>
                                         <defs>
                                           <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2}/>
                                             <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                           </linearGradient>
                                           <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                           </linearGradient>
                                         </defs>
                                         <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#f1f5f9" />
                                          <XAxis 
                                            dataKey="date" 
                                            tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tickFormatter={(val) => {
                                              if (!val) return '';
                                              const d = new Date(val);
                                              return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
                                            }}
                                          />
                                          {trendFilters.gmv && <YAxis yAxisId="left" orientation="left" tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${(val/1000000).toFixed(0)}M`} />}
                                          {trendFilters.views && <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(val)} />}
                                          <Tooltip 
                                            isAnimationActive={false}
                                            content={({ active, payload, label }) => {
                                              if (active && payload && payload.length) {
                                                const d = new Date(label).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
                                                return (
                                                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl min-w-[200px]">
                                                    <div className="text-[10px] font-bold text-slate-800 mb-2 uppercase">{d}</div>
                                                    <div className="space-y-1.5">
                                                      {payload.map((entry: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-xs font-bold gap-4">
                                                          <span className="text-slate-500 uppercase text-[9px]">{entry.name}</span>
                                                          <span style={{ color: entry.color || entry.stroke }}>
                                                            {entry.name === 'GMV' ? `Rp ${new Intl.NumberFormat('id-ID').format(entry.value)}` : new Intl.NumberFormat('id-ID').format(entry.value)}
                                                          </span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              }
                                              return null;
                                            }} 
                                            cursor={{ stroke: '#10b981', strokeWidth: 32, opacity: 0.1 }}
                                          />
                                          {trendFilters.gmv && <Area yAxisId="left" type="monotone" name="GMV" dataKey="gmv" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGmv)" dot={{r: 3, fill: "#fff", stroke: "#14b8a6", strokeWidth: 2}} activeDot={{r: 6, fill: "#14b8a6", stroke: "#fff", strokeWidth: 2}} />}
                                          {trendFilters.views && <Area yAxisId="right" type="monotone" name="Views" dataKey="impressions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" dot={{r: 3, fill: "#fff", stroke: "#10b981", strokeWidth: 2}} activeDot={{r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2}} />}
                                        </AreaChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                              </div>

                             {/* Time & Day Analytics */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {/* Revenue Based on Time (Shift) */}
                                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col">
                                  <h4 className="text-[14px] font-bold text-slate-800 mb-4 px-1">Revenue Based on Time</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap">
                                      <thead className="bg-[#f0f4f8] text-[12px] font-bold text-slate-800">
                                        <tr>
                                          <th className="px-5 py-3 rounded-l-lg w-16 text-center">No</th>
                                          <th className="px-5 py-3">Sesi Jam</th>
                                          <th className="px-5 py-3 rounded-r-lg cursor-pointer">Revenue ▾</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                                        {(() => {
                                          const shiftData: Record<string, number> = {};
                                          tableLogs.forEach(log => {
                                            let s = "N/A";
                                            if (log.dateTime) {
                                              const timeMatch = String(log.dateTime).match(/(\d{1,2}):\d{2}/);
                                              if (timeMatch) {
                                                const hour = parseInt(timeMatch[1], 10);
                                                if (!isNaN(hour)) {
                                                  if (hour >= 5 && hour < 11) s = "05.00-11.00";
                                                  else if (hour >= 11 && hour < 17) s = "11.00-17.00";
                                                  else if (hour >= 17 && hour < 23) s = "17.00-23.00";
                                                  else s = "23.00-05.00";
                                                }
                                              }
                                            }
                                            if (s === "N/A") {
                                               s = log.shift || "Shift Lainnya";
                                            }
                                            if (!shiftData[s]) shiftData[s] = 0;
                                            shiftData[s] += (log.gmv || 0);
                                          });
                                          const shiftsArray = Object.keys(shiftData).map(k => ({ name: k, gmv: shiftData[k] })).sort((a,b) => b.gmv - a.gmv);
                                          
                                          if (shiftsArray.length === 0) {
                                            return <tr><td colSpan={3} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>;
                                          }
                                          return shiftsArray.map((sh, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                              <td className="px-5 py-3.5 text-center text-slate-500">{idx + 1}.</td>
                                              <td className="px-5 py-3.5 text-slate-700 font-mono text-[11px]">{sh.name}</td>
                                              <td className="px-5 py-3.5 text-slate-700">{new Intl.NumberFormat('id-ID').format(sh.gmv)}</td>
                                            </tr>
                                          ));
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                
                                {/* Revenue Based on Day */}
                                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col">
                                  <h4 className="text-[14px] font-bold text-slate-800 mb-4 px-1">Revenue Based on Day</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap">
                                      <thead className="bg-[#f0f4f8] text-[12px] font-bold text-slate-800">
                                        <tr>
                                          <th className="px-5 py-3 rounded-l-lg w-16 text-center">No</th>
                                          <th className="px-5 py-3 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => { setDayAnalyticsSortCol('name'); setDayAnalyticsSortAsc(prev => dayAnalyticsSortCol === 'name' ? !prev : true); }}>Hari {dayAnalyticsSortCol === 'name' ? (dayAnalyticsSortAsc ? '↑' : '↓') : ''}</th>
                                          <th className="px-5 py-3 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => { setDayAnalyticsSortCol('views'); setDayAnalyticsSortAsc(prev => dayAnalyticsSortCol === 'views' ? !prev : false); }}>Views {dayAnalyticsSortCol === 'views' ? (dayAnalyticsSortAsc ? '↑' : '↓') : ''}</th>
                                          <th className="px-5 py-3 rounded-r-lg cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => { setDayAnalyticsSortCol('gmv'); setDayAnalyticsSortAsc(prev => dayAnalyticsSortCol === 'gmv' ? !prev : false); }}>Revenue {dayAnalyticsSortCol === 'gmv' ? (dayAnalyticsSortAsc ? '↑' : '↓') : ''}</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                                        {(() => {
                                          const dayNamesId = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
                                          const dayData: Record<string, {gmv: number, views: number}> = {};
                                          tableLogs.forEach(log => {
                                            if (log.date) {
                                              const dateParts = String(log.date).split("-");
                                              const processDay = (d: Date) => {
                                                if (!isNaN(d.getTime())) {
                                                  const dayName = dayNamesId[d.getDay()];
                                                  if (!dayData[dayName]) dayData[dayName] = { gmv: 0, views: 0 };
                                                  dayData[dayName].gmv += (log.gmv || 0);
                                                  dayData[dayName].views += (log.impressions || log.views || log.liveVisits || 0);
                                                }
                                              };
                                              if (dateParts.length === 3) {
                                                processDay(new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])));
                                              } else {
                                                processDay(new Date(log.date));
                                              }
                                            }
                                          });
                                          const daysArray = Object.keys(dayData).map(k => ({ name: k, ...dayData[k] })).sort((a,b) => {
                                            let valA = a[dayAnalyticsSortCol];
                                            let valB = b[dayAnalyticsSortCol];
                                            if (valA < valB) return dayAnalyticsSortAsc ? -1 : 1;
                                            if (valA > valB) return dayAnalyticsSortAsc ? 1 : -1;
                                            return 0;
                                          });
                                          if (daysArray.length === 0) {
                                            return <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>;
                                          }
                                          
                                          return daysArray.map((dy, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50">
                                              <td className="px-5 py-3.5 text-center text-slate-500">{idx + 1}.</td>
                                              <td className="px-5 py-3.5 text-slate-700">{dy.name}</td>
                                              <td className="px-5 py-3.5 text-slate-700">{new Intl.NumberFormat('id-ID').format(dy.views)}</td>
                                              <td className="px-5 py-3.5 text-slate-700">Rp {new Intl.NumberFormat('id-ID').format(dy.gmv)}</td>
                                            </tr>
                                          ));
                                        })()}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                             
                             {/* Table */}
                             <div className="bg-white border border-slate-100 rounded-xl overflow-x-auto shadow-sm">
                               <table className="w-full text-left whitespace-nowrap">
                                 <thead className="bg-[#f8fafc] border-b border-slate-100 uppercase text-[9px] font-bold text-slate-400 tracking-wider">
                                   <tr>
                                     <th className="px-5 py-3.5">No</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('date')}>Tanggal {reportDbSortCol === 'date' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('views')}>Views {reportDbSortCol === 'views' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('gmv')}>GMV {reportDbSortCol === 'gmv' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('products_sold')}>Produk Terjual {reportDbSortCol === 'products_sold' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('customers')}>Customer {reportDbSortCol === 'customers' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ctr')}>CTR {reportDbSortCol === 'ctr' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ctor')}>CTOR {reportDbSortCol === 'ctor' ? (reportDbSortAsc ? '↑' : '↓') : ''}</th>
                                     <th className="px-5 py-3.5 text-right">Aksi</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700 bg-white">
                                   {isLogsLoading ? (
                                     <tr>
                                       <td colSpan={9} className="px-5 py-16 text-center text-slate-500 font-bold w-full">
                                          <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                                            Sedang memuat data dari database...
                                          </div>
                                       </td>
                                     </tr>
                                   ) : sortedTableLogs.length === 0 ? (
                                     <tr>
                                       <td colSpan={9} className="px-5 py-10 text-center text-slate-400">Tidak ada sesi ditemukan.</td>
                                     </tr>
                                   ) : (
                                     paginatedLogs.map((log, idx) => {
                                       const lViews = log.impressions || log.views || log.liveVisits || 0;
                                       const lCtr = log.productImpressions > 0 ? ((log.clicks / log.productImpressions) * 100) : 0;
                                       const lCtor = log.clicks > 0 ? ((log.orders / log.clicks) * 100) : 0;

                                       return (
                                       <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                         <td className="px-5 py-3.5 text-slate-400">{((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1}</td>
                                         <td className="px-5 py-3.5 text-slate-500">
                                           <div className="flex flex-col">
                                              <span>{log.date}</span>
                                              <span className="text-[9px] text-indigo-500">{log.platform}</span>
                                           </div>
                                         </td>
                                         <td className="px-5 py-3.5">{new Intl.NumberFormat('id-ID').format(lViews)}</td>
                                         <td className="px-5 py-3.5">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(log.gmv || 0)}</td>
                                         <td className="px-5 py-3.5">{new Intl.NumberFormat('id-ID').format(log.products_sold || log.items_sold || 0)}</td>
                                         <td className="px-5 py-3.5">{new Intl.NumberFormat('id-ID').format(log.buyers || 0)}</td>
                                         <td className="px-5 py-3.5">{lCtr.toFixed(2)}%</td>
                                         <td className="px-5 py-3.5">{lCtor.toFixed(2)}%</td>
                                         <td className="px-5 py-3.5 text-right">
                                           <button 
                                             onClick={() => handleDeletePerformanceLog(log.id, log.brandName, log.date)}
                                             className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none cursor-pointer bg-transparent border-0"
                                             title="Hapus Log"
                                           >
                                             ✕
                                           </button>
                                         </td>
                                       </tr>
                                       );
                                     })
                                   )}
                                 </tbody>
                               </table>
                             </div>
                             
                             {totalPages > 1 && (
                               <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                                 <div>
                                   Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedTableLogs.length)} dari {sortedTableLogs.length} data
                                 </div>
                                 <div className="flex gap-2">
                                   <button 
                                     onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                     disabled={currentPage === 1}
                                     className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
                                   >
                                     Sebelumnya
                                   </button>
                                   <span className="px-3 py-1.5">
                                      Halaman {currentPage} / {totalPages}
                                   </span>
                                   <button 
                                     onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                     disabled={currentPage === totalPages}
                                     className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
                                   >
                                     Selanjutnya
                                   </button>
                                 </div>
                               </div>
                             )}
                           </>
                         );
                       })()}

                     {/* BATCH UPLOAD HISTORY VIEWER */}
                     {(() => {
                        const brandLogsForHistory = brandPerformanceLogs.filter(log => log.brandId === activeReportBrandId);
                        const batchesMap = {} as Record<string, any>;
                        brandLogsForHistory.forEach(log => {
                           const bId = log.batchId;
                           if (!bId) return; // skip if no batchId
                           if (!batchesMap[bId]) {
                             batchesMap[bId] = {
                               id: bId,
                               brandId: log.brandId,
                               brandName: log.brandName || "Unknown",
                               platform: log.platform || "Unknown",
                               fileName: `Manual Upload / Legacy Import`,
                               uploadedAt: log.uploadedAt || new Date(2023, 0, 1).toISOString(),
                               rowCount: 0,
                               gmv: 0
                             };
                           }
                           batchesMap[bId].rowCount += 1;
                           batchesMap[bId].gmv += (Number(log.gmv) || 0);
                        });

                        const existingBatchIds = new Set(brandUploadHistory.map(h => h.id));
                        const missingBatches = Object.values(batchesMap).filter(b => !existingBatchIds.has(b.id)); // from raw logs

                        // merge local uploadHistory as well
                        const localHistories = uploadHistory.filter(h => h.brandId === activeReportBrandId && !existingBatchIds.has(h.id));
                        const completeUploadHistory = [...brandUploadHistory.filter(h => h.brandId === activeReportBrandId), ...missingBatches, ...localHistories]
                        .reduce((acc, current) => {
                             const x = acc.find((item: any) => item.id === current.id);
                             if (!x) { return acc.concat([current]); } else { return acc; }
                        }, [])
                        .sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

                        return (
                          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden mt-8">
                             <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                               <div>
                                 <h4 className="text-base font-black text-slate-800">Riwayat Upload Data Mentah</h4>
                                 <p className="text-[11px] text-slate-500 font-medium">History file CSV raw data performa yang telah berhasil dikonversi & masuk ke database sentral.</p>
                               </div>
                             </div>
                             <div className="overflow-x-auto">
                               <table className="w-full text-left whitespace-nowrap">
                                 <thead className="bg-[#f8fafc] border-b border-slate-100 uppercase text-[9px] font-bold text-slate-400 tracking-wider">
                                   <tr>
                                     <th className="px-5 py-3.5">Waktu Upload</th>
                                     <th className="px-5 py-3.5">Nama File / Tipe</th>
                                     <th className="px-5 py-3.5">Platform</th>
                                     <th className="px-5 py-3.5">Total Baris</th>
                                     <th className="px-5 py-3.5">Total GMV (Rp)</th>
                                     <th className="px-5 py-3.5 text-right">Aksi</th>
                                   </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700 bg-white">
                                   {isLogsLoading ? (
                                     <tr>
                                       <td colSpan={6} className="px-5 py-16 text-center text-slate-500 font-bold w-full">
                                          <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
                                            Sedang memuat data dari database...
                                          </div>
                                       </td>
                                     </tr>
                                   ) : completeUploadHistory.length === 0 ? (
                                     <tr>
                                       <td colSpan={6} className="px-5 py-10 text-center text-slate-400">Belum ada riwayat upload untuk brand ini.</td>
                                     </tr>
                                   ) : (
                                     completeUploadHistory.map((history, idx) => (
                                       <tr key={history.id} className="hover:bg-slate-50/50 transition-colors">
                                         <td className="px-5 py-3.5 text-slate-500">
                                           {new Date(history.uploadedAt).toLocaleString('id-ID', {day: 'numeric', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
                                         </td>
                                         <td className="px-5 py-3.5 max-w-[200px] truncate" title={history.fileName}>{history.fileName}</td>
                                         <td className="px-5 py-3.5">
                                           <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase font-bold">{history.platform || 'UNKNOWN'}</span>
                                         </td>
                                         <td className="px-5 py-3.5">{new Intl.NumberFormat('id-ID').format(history.rowCount || 0)}</td>
                                         <td className="px-5 py-3.5">Rp{new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(history.gmv || 0)}</td>
                                         <td className="px-5 py-3.5 text-right">
                                           <button 
                                             onClick={() => handleDeleteUploadBatch(history.id, history.fileName, history.rowCount || 0)}
                                             className="text-slate-400 hover:text-red-500 transition-colors focus:outline-none cursor-pointer bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg border border-slate-200 hover:border-red-200 text-[10px] font-bold inline-flex items-center gap-1"
                                             title="Hapus Batch & Semua Data Raw"
                                           >
                                             Hapus Batch
                                           </button>
                                         </td>
                                       </tr>
                                     ))
                                   )}
                                 </tbody>
                               </table>
                             </div>
                          </div>
                        );
                     })()}

                    </div>
                  </div>
                </>
              )}
            </div>
          )}
{/* ==================== SUBTAB: LEADS / CALON KLIEN ==================== */}
            {operatorTab === "leads" && (
              <div className="space-y-6 animate-fadeIn" id="operator_leads_content">
                 <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" /> Pipeline Leads & Calon Klien
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Tracking status penawaran harga & dealing Liva Agency.</p>
                    </div>
                    <button
                      onClick={() => setLeadFormModal({isOpen: true, data: {}})}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all border-0 cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Lead Baru
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-indigo-50 bg-white shadow-sm font-sans">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead className="bg-indigo-50/50 border-b border-indigo-50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">Info Calon Klien</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">Platform</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">Status Pipeline</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider">Notes History</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase text-indigo-900 tracking-wider text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-50">
                        {clientLeads.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs bg-slate-50/20">Belum ada pipeline leads tersedia. Tambahkan data lead baru.</td>
                          </tr>
                        ) : (
                          clientLeads.map(lead => (
                            <tr key={lead.id} className="hover:bg-indigo-50/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-black text-indigo-950 text-sm mb-1">{lead.name}</div>
                                <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                                  <Users className="w-3 h-3 text-slate-400" /> PIC: {lead.contactPerson}
                                </div>
                                <div className="text-[11px] text-slate-600 font-mono mt-0.5">{lead.contactNumber}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-md inline-block">
                                  {lead.platformInterest}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <select 
                                  className={`text-[10px] font-extrabold border-2 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer ${
                                    lead.status === 'Closed Won' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    lead.status === 'Closed Lost' ? 'bg-red-50 text-red-700 border-red-200' :
                                    lead.status === 'Negotiation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-white text-indigo-700 border-indigo-100'
                                  }`}
                                  value={lead.status}
                                  onChange={(e) => setClientLeads(p => p.map(x => x.id === lead.id ? {...x, status: e.target.value as any} : x))}
                                >
                                  <option value="New">🏷️ New</option>
                                  <option value="Contacted">📞 Contacted</option>
                                  <option value="Meeting Scheduled">📅 Meeting Scheduled</option>
                                  <option value="Proposal Sent">📤 Proposal Sent</option>
                                  <option value="Negotiation">💬 Negotiation</option>
                                  <option value="Closed Won">🎉 Closed Won</option>
                                  <option value="Closed Lost">❌ Closed Lost</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-[11px] font-medium text-slate-600 line-clamp-2 max-w-[250px] leading-relaxed" title={lead.notes}>
                                  {lead.notes || <span className="text-slate-400 italic">Belum ada notes</span>}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right text-nowrap">
                                <div className="flex justify-end gap-1.5">
                                  <button onClick={() => {
                                      setLeadFormModal({isOpen: true, data: lead});
                                  }} className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white p-2 text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-none border-0 flex items-center gap-1.5" title="Edit Lead">
                                    <Edit2 className="w-3.5 h-3.5" /> Edit
                                  </button>
                                  <button onClick={() => {
                                      requestConfirm(
                                        "Hapus Lead Klien?",
                                        `Data pipeline calon klien ini akan dihapus permanen. Lanjutkan?`,
                                        () => setClientLeads(prev => prev.filter(b => b.id !== lead.id)),
                                        "danger"
                                      );
                                  }} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 text-[10px] font-black rounded-lg cursor-pointer transition-colors shadow-none border-0 flex items-center gap-1.5" title="Hapus Lead">
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                 </div>

                 {/* MODAL LEADS */}
                 {leadFormModal.isOpen && createPortal(
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn font-sans">
                    <div className="bg-white max-w-lg w-full rounded-2xl md:rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-scaleUp text-slate-800 relative shadow-[0_0_40px_rgba(79,70,229,0.15)]">
                      <div className="bg-gradient-to-br from-indigo-50 to-white px-5 sm:px-8 py-5 sm:py-6 border-b border-indigo-100 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 flex-shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-black text-indigo-950 leading-tight">{leadFormModal.data.id ? "Edit Pipeline Lead" : "Lead Baru"}</h4>
                            <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-1 sm:mt-0.5 leading-tight">Kelola data klien dan update status negosiasi.</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => setLeadFormModal({isOpen: false, data: {}})} className="bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-2 sm:p-2.5 rounded-full transition-all cursor-pointer border-0 shadow-sm flex-shrink-0 ml-2">
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      
                      <div className="flex-1 p-5 sm:p-8 overflow-y-auto w-full custom-scroll">
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          const newLead: ClientLead = {
                            id: leadFormModal.data.id || `cl_${Date.now()}`,
                            name: fd.get("name") as string,
                            contactPerson: fd.get("contactPerson") as string,
                            contactNumber: fd.get("contactNumber") as string,
                            platformInterest: fd.get("platformInterest") as string,
                            status: fd.get("status") as any,
                            notes: fd.get("notes") as string,
                          };
                          
                          if (leadFormModal.data.id) {
                            setClientLeads(prev => prev.map(l => l.id === newLead.id ? newLead : l));
                            addNotification("💼 Informasi Lead Diupdate", `Data lead "${newLead.name}" telah diupdate oleh admin.`, "info", "leads");
                          } else {
                            setClientLeads(prev => [...prev, newLead]);
                            addNotification("🔥 Leads Calon Klien Baru", `Ada registrasi lead prospek baru masuk untuk "${newLead.name}" via platform "${newLead.platformInterest}".`, "warning", "leads");
                          }
                          setLeadFormModal({isOpen: false, data: {}});
                        }} className="space-y-5 text-xs font-medium">
                          
                          <div className="space-y-4 bg-slate-50/50 border border-slate-100 p-4 sm:p-5 rounded-2xl">
                            <div>
                              <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">Nama Brand Klien *</label>
                              <input required name="name" defaultValue={leadFormModal.data.name} type="text" placeholder="Misal: PT. Liva Kosmetik" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 shadow-sm" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">Nama PIC</label>
                                <input name="contactPerson" defaultValue={leadFormModal.data.contactPerson} type="text" placeholder="Misal: Budi / HRD" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 shadow-sm" />
                              </div>
                              <div>
                                <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">No. WhatsApp/HP</label>
                                <input name="contactNumber" defaultValue={leadFormModal.data.contactNumber} type="text" placeholder="08..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 shadow-sm font-mono" />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">Platform Target</label>
                                <select name="platformInterest" defaultValue={leadFormModal.data.platformInterest || platforms[0]} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm">
                                  {platforms.map((p, i) => <option key={p + '_' + i} value={p}>{p}</option>)}
                                  <option value="Multi-platform">Multi-platform</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">Status Interaksi</label>
                                <select name="status" defaultValue={leadFormModal.data.status || "New"} className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 font-black text-indigo-700 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm">
                                      <option value="New">🏷️ New Lead</option>
                                      <option value="Contacted">📞 Sudah Dihubungi</option>
                                      <option value="Meeting Scheduled">📅 Jadwal Meeting</option>
                                      <option value="Proposal Sent">📤 Proposal Dikirim</option>
                                      <option value="Negotiation">💬 Proses Negosiasi</option>
                                      <option value="Closed Won">🎉 Deal / Project Goal</option>
                                      <option value="Closed Lost">❌ Gagal / Batal</option>
                                </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[#3c2f56] font-black uppercase text-[10px] tracking-widest mb-1.5">Catatan / Detail</label>
                            <textarea name="notes" defaultValue={leadFormModal.data.notes} rows={3} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-700 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm leading-relaxed" placeholder="Tuliskan detail permintaan klien, budget, hasil meeting, atau catatan lainnya di sini..." />
                          </div>
                          
                          <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                             <button type="button" onClick={() => setLeadFormModal({isOpen: false, data: {}})} className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 font-black rounded-xl transition-all border border-slate-200 cursor-pointer text-sm order-2 sm:order-1 text-center">
                               Batal
                             </button>
                             <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer border-0 text-sm order-1 sm:order-2">
                               <Check className="w-5 h-5" /> {leadFormModal.data.id ? "Simpan Perbaikan" : "Tambah Lead"}
                             </button>
                          </div>


                        </form>
                      </div>
                    </div>
                  </div>
                 , document.body)}
              </div>
            )}

            {/* ==================== SUBTAB: AI AGENCY COPILOT CHAT ==================== */}
            {operatorTab === "copilot" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="operator_copilot_content">
                
                {/* Information sidebar inside Copilot */}
                <div className="bg-[#f8f6fc] p-5 rounded-2xl border border-purple-100 h-fit space-y-4 shadow-sm">
                  <div className="flex items-center gap-2.5 text-purple-700 font-black text-sm">
                    <Sparkles className="w-4.5 h-4.5 text-purple-500" />
                    AI AGENT COPILOT LIVA ATTENDENCE SYSTEM
                  </div>
                  <p className="text-xs text-purple-900 font-semibold leading-relaxed">
                    Asisten intelijen ini mempelajari database operator secara dinamis. Anda dapat berkonsultasi tentang rekapitulasi gaji, keterlambatan host, denda, dan saran roster siaran dalam Bahasa Indonesia.
                  </p>

                  <div className="text-xs space-y-3.5 pt-3.5 border-t border-purple-100">
                    <span className="font-extrabold uppercase text-[10px] tracking-widest text-purple-500 block">
                      Analisis Absensi Host Terpadu:
                    </span>
                    <ul className="space-y-2 text-purple-950 list-disc list-inside font-semibold">
                      <li>Menghitung persentase ketepatan waktu digital.</li>
                      <li>Deteksi otomatis pola keterlambatan host.</li>
                      <li>Kalkulator nominal penggajian per bulan secara instan.</li>
                      <li>Skema insentif terbaik bagi performa studio streaming.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-[#f3effa] rounded-xl border border-purple-100 text-[10.5px] text-purple-800 font-bold leading-normal">
                    💡 <em>Asisten ini memvalidasi data logs real-time, termasuk data absensi yang baru saja diisikan host lewat simulasi ponsel!</em>
                  </div>
                </div>

                {/* Main Interactive Chat Box Area */}
                <div className="lg:col-span-2 bg-[#fdfdfd] rounded-2xl border border-purple-100 flex flex-col h-[520px] shadow-sm overflow-hidden" id="copilot_chat_interface_container">
                  
                  {/* Chat Top Banner */}
                  <div className="bg-white p-4 border-b border-purple-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-black text-purple-950">Asisten Digital Liva Agency</span>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-purple-500">GEMINI AGENCY INTEGRATE v3.5</span>
                  </div>

                  {/* Message Streams view */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans" id="chat_scroll_area">
                    {chatMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${
                          msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10.5px] ${
                          msg.role === "user" ? "bg-purple-600 text-white shadow-sm" : "bg-purple-100 border border-purple-200 text-purple-700 shadow-sm"
                        }`}>
                          {msg.role === "user" ? "OP" : "AI"}
                        </div>

                        {/* Content text block */}
                        <div>
                          <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap font-semibold ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-tr-none shadow-sm"
                              : "bg-[#f9f7fd] text-purple-950 border border-purple-100 rounded-tl-none shadow-sm"
                          }`}>
                            {msg.content}
                          </div>
                          <span className="text-[9px] text-purple-400 font-bold px-1 mt-1 block tracking-wider font-mono">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {chatLoading && (
                      <div className="flex gap-2 text-purple-500 text-[11px] font-bold items-center italic mt-2 pl-12" id="chat_ai_loading_indicator">
                        <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
                        AI sedang menghitung rekap absensi dan performa kehadiran...
                      </div>
                    )}
                  </div>

                  {/* Message Input Interface form */}
                  <div className="bg-white p-3 border-t border-purple-100 flex flex-col gap-2 relative">
                    <div className="flex gap-2 w-full overflow-x-auto pb-1 scrollbar-hide">
                      <button onClick={() => setChatInput("Siapa host yang paling disiplin?")} className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left">
                         🏆 Host Paling Disiplin
                      </button>
                      <button onClick={() => setChatInput("Ada host yang sering alpa?")} className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left">
                         ⚠️ Cek Host Sering Alpa
                      </button>
                      <button onClick={() => setChatInput("Berikan ringkasan performa kehadiran tim minggu ini.")} className="shrink-0 flex-1 whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold border border-purple-150 transition-colors shadow-3xs cursor-pointer text-left">
                         📊 Ringkasan Kehadiran
                      </button>
                    </div>
                    <form onSubmit={handleSendChatMessage} className="flex gap-2" id="copilot_chat_input_form">
                      <input
                        type="text"
                        id="copilot_chat_input_text_box"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Masukkan pertanyaan Anda dalam Bahasa Indonesia..."
                        className="flex-1 bg-[#fcfaff] border border-purple-150 rounded-xl px-4 py-2.5 text-xs text-purple-950 font-bold placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-all"
                      />
                      <button
                        type="submit"
                        id="copilot_send_message_button"
                        disabled={!chatInput.trim() || chatLoading}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-50 disabled:text-purple-300 text-white font-extrabold px-5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 h-full min-h-[42px] cursor-pointer shadow-xs"
                      >
                        <span>Kirim</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}

            {/* ==================== SUBTAB: SETTINGS CONFIGURATION ⚙️ ==================== */}
            {operatorTab === "settings" && (
              <div className="space-y-6 animate-fadeIn font-sans" id="operator_settings_content">
                
                {/* Intro/Header Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
                  <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-sm mb-1.5">
                    <Sliders className="w-5 h-5 text-purple-600" />
                    PENGATURAN METADATA STRUKTUR AGENCY (LIVE AGENT SYSTEM)
                  </div>
                  <p className="text-xs text-purple-600 leading-relaxed font-semibold">
                    Kelola data-data pendukung operational streaming secara dinamis. Anda dapat menambah, mengedit, atau menghapus nama platform marketplace/media sosial, nama brand klien Agency, daftar jam kerja shift (roster silang), serta cabang lokasi & nama studio yang langsung terintegrasi ke seluruh formulir absensi host.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">

                  {/* 1. PLATFORM CONFIGURATION CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_platform_panel">
                    <div className="space-y-4">
                      <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                          📱 Nama Platform
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                          {platforms.length} Item
                        </span>
                      </div>

                      {/* Inline Simple Add Form (wrapped in form to prevent full-page reload and support enter key) */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmed = newPlatformInput.trim();
                          if (trimmed) {
                            if (platforms.includes(trimmed)) {
                              setPlatformError("Platform ini sudah terdaftar!");
                              return;
                            }
                            setPlatforms(prev => [...prev, trimmed]);
                            setNewPlatformInput("");
                            setPlatformError("");
                          }
                        }}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tambah platform baru..."
                            value={newPlatformInput}
                            onChange={(e) => {
                              setNewPlatformInput(e.target.value);
                              if (platformError) setPlatformError("");
                            }}
                            className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans text-purple-950"
                            id="new_platform_field"
                          />
                          <button
                            type="submit"
                            className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            id="add_platform_btn"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {platformError && (
                          <p className="text-[10px] text-red-650 font-black pl-1">{platformError}</p>
                        )}
                      </form>

                      {/* Items List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {platforms.map((platform, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                            {editingPlatformIdx === idx ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingPlatformValue}
                                  onChange={(e) => setEditingPlatformValue(e.target.value)}
                                  className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVal = editingPlatformValue.trim();
                                    if (newVal) {
                                      if (platforms.some((p, i) => p === newVal && i !== idx)) {
                                        setPlatformError("Nama platform sudah terdaftar!");
                                        return;
                                      }
                                      setPlatforms(prev => {
                                        const updated = [...prev];
                                        updated[idx] = newVal;
                                        return updated;
                                      });
                                      setEditingPlatformIdx(null);
                                      setPlatformError("");
                                    }
                                  }}
                                  className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Simpan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPlatformIdx(null);
                                    setPlatformError("");
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4 text-purple-400" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-mono" title={platform}>{platform}</span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPlatformIdx(idx);
                                      setEditingPlatformValue(platform);
                                      setPlatformError("");
                                    }}
                                    className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer"
                                    title="Edit platform"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirm(
                                        "Hapus Platform",
                                        `Apakah Anda yakin ingin menghapus platform "${platform}"? Platform ini tidak akan bisa dipilih lagi pada form.`,
                                        () => setPlatforms(prev => prev.filter(p => p !== platform)),
                                        "danger"
                                      );
                                    }}
                                    className="text-purple-300 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                                    title="Hapus platform"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {platforms.length === 0 && (
                          <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada platform terdaftar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. BRAND CONFIGURATION CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_brand_panel">
                    <div className="space-y-4">
                      <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                          🛍️ Nama Brand Klien
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                          {brands.length} Item
                        </span>
                      </div>

                      {/* Inline Simple Add Form (wrapped in form) */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmed = newBrandInput.trim();
                          if (trimmed) {
                            if (brands.includes(trimmed)) {
                              setBrandError("Brand ini sudah terdaftar!");
                              return;
                            }
                            setBrands(prev => [...prev, trimmed]);
                            setNewBrandInput("");
                            setBrandError("");
                          }
                        }}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tambah brand baru..."
                            value={newBrandInput}
                            onChange={(e) => {
                              setNewBrandInput(e.target.value);
                              if (brandError) setBrandError("");
                            }}
                            className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans text-purple-950"
                            id="new_brand_field"
                          />
                          <button
                            type="submit"
                            className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            id="add_brand_btn"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {brandError && (
                          <p className="text-[10px] text-red-650 font-black pl-1">{brandError}</p>
                        )}
                      </form>

                      {/* Items List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {brands.map((brand, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                            {editingBrandIdx === idx ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingBrandValue}
                                  onChange={(e) => setEditingBrandValue(e.target.value)}
                                  className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVal = editingBrandValue.trim();
                                    if (newVal) {
                                      if (brands.some((b, i) => b === newVal && i !== idx)) {
                                        setBrandError("Nama brand sudah terdaftar!");
                                        return;
                                      }
                                      setBrands(prev => {
                                        const updated = [...prev];
                                        updated[idx] = newVal;
                                        return updated;
                                      });
                                      setEditingBrandIdx(null);
                                      setBrandError("");
                                    }
                                  }}
                                  className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Simpan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBrandIdx(null);
                                    setBrandError("");
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4 text-purple-400" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-sans" title={brand}>{brand}</span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingBrandIdx(idx);
                                      setEditingBrandValue(brand);
                                      setBrandError("");
                                    }}
                                    className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer"
                                    title="Edit brand"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirm(
                                        "Hapus Brand Klien",
                                        `Apakah Anda yakin ingin menghapus brand "${brand}"? Sesi absensi lama yang merujuk ke brand ini akan tetap aman.`,
                                        () => setBrands(prev => prev.filter(b => b !== brand)),
                                        "danger"
                                      );
                                    }}
                                    className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                                    title="Hapus brand"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {brands.length === 0 && (
                          <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada brand terdaftar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. SHIFT CONFIGURATION CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_shift_panel">
                    <div className="space-y-4">
                      <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                          ⏰ Jenis Sesi Shift
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                          {shifts.length} Sesi
                        </span>
                      </div>

                      {/* Inline Simple Add Form (wrapped in form) */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmed = newShiftInput.trim();
                          if (trimmed) {
                            if (shifts.includes(trimmed)) {
                              setShiftError("Shift ini sudah terdaftar!");
                              return;
                            }
                            setShifts(prev => [...prev, trimmed]);
                            setNewShiftInput("");
                            setShiftError("");
                          }
                        }}
                        className="space-y-1.5"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Format: Shift X (00.00-00.00)..."
                            value={newShiftInput}
                            onChange={(e) => {
                              setNewShiftInput(e.target.value);
                              if (shiftError) setShiftError("");
                            }}
                            className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-mono text-purple-950"
                            id="new_shift_field"
                          />
                          <button
                            type="submit"
                            className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                            id="add_shift_btn"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {shiftError && (
                          <p className="text-[10px] text-red-650 font-black pl-1">{shiftError}</p>
                        )}
                      </form>

                      {/* Items List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {shifts.map((shift, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                            {editingShiftIdx === idx ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingShiftValue}
                                  onChange={(e) => setEditingShiftValue(e.target.value)}
                                  className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950 font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newVal = editingShiftValue.trim();
                                    if (newVal) {
                                      if (shifts.some((s, i) => s === newVal && i !== idx)) {
                                        setShiftError("Nama shift sudah terdaftar!");
                                        return;
                                      }
                                      setShifts(prev => {
                                        const updated = [...prev];
                                        updated[idx] = newVal;
                                        return updated;
                                      });
                                      setEditingShiftIdx(null);
                                      setShiftError("");
                                    }
                                  }}
                                  className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                  title="Simpan"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingShiftIdx(null);
                                    setShiftError("");
                                  }}
                                  className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                  title="Batal"
                                >
                                  <X className="w-4 h-4 text-purple-400" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-mono" title={shift}>{shift}</span>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingShiftIdx(idx);
                                      setEditingShiftValue(shift);
                                      setShiftError("");
                                    }}
                                    className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer"
                                    title="Edit shift"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirm(
                                        "Hapus Roster Shift",
                                        `Apakah Anda yakin ingin menghapus roster "${shift}"?`,
                                        () => setShifts(prev => prev.filter(s => s !== shift)),
                                        "danger"
                                      );
                                    }}
                                    className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                                    title="Hapus shift"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {shifts.length === 0 && (
                          <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada shift terdaftar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4. BRAND NEW: STUDIO LOCATION & NAME CONFIGURATION CARD */}
                  <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_studio_panel">
                    <div className="space-y-4">
                      <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
                        <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                          🏢 Lokasi & Nama Studio
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-mono">
                          {studios.length} Cabang
                        </span>
                      </div>

                      {/* Inline Simple Add Form (wrapped in form) */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const trimmedName = newStudioName.trim();
                          if (trimmedName) {
                            const isDuplicate = studios.some(std => std.name.toLowerCase() === trimmedName.toLowerCase() && std.location.toLowerCase() === newStudioLocation.toLowerCase());
                            if (isDuplicate) {
                              setStudioError("Studio ini sudah terdaftar!");
                              return;
                            }
                            const newStudio: StudioItem = {
                              id: `std_auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                              name: trimmedName,
                              location: newStudioLocation
                            };
                            setStudios(prev => [...prev, newStudio]);
                            setNewStudioName("");
                            setStudioError("");
                          }
                        }}
                        className="space-y-2"
                      >
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="text"
                            placeholder="Nama studio (misal: Studio 01)..."
                            value={newStudioName}
                            onChange={(e) => {
                              setNewStudioName(e.target.value);
                              if (studioError) setStudioError("");
                            }}
                            className="bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans w-full min-w-0 text-purple-950"
                          />
                          <div className="flex gap-2">
                            <select
                              value={newStudioLocation}
                              onChange={(e) => setNewStudioLocation(e.target.value)}
                              className="flex-1 min-w-0 bg-purple-50/25 border border-purple-150 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none text-purple-950 cursor-pointer"
                            >
                              <option value="Bandar Lampung">Bandar Lampung</option>
                              <option value="Tanggamus">Tanggamus</option>
                            </select>
                            <button
                              type="submit"
                              className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                              id="add_studio_btn"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {studioError && (
                          <p className="text-[10px] text-red-650 font-black pl-1">{studioError}</p>
                        )}
                      </form>

                      {/* Items List */}
                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {studios.map((studio, idx) => (
                          <div key={studio.id} className="flex justify-between items-center bg-[#faf9fe] p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                            {editingStudioIdx === idx ? (
                              <div className="flex flex-col gap-1.5 w-full">
                                <input
                                  type="text"
                                  value={editingStudioName}
                                  onChange={(e) => setEditingStudioName(e.target.value)}
                                  className="w-full min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950"
                                />
                                <div className="flex gap-1.5 items-center justify-end">
                                  <select
                                    value={editingStudioLocation}
                                    onChange={(e) => setEditingStudioLocation(e.target.value)}
                                    className="bg-white border border-purple-200 rounded px-1 py-0.5 text-xs font-bold text-purple-950"
                                  >
                                    <option value="Bandar Lampung">Bandar Lampung</option>
                                    <option value="Tanggamus">Tanggamus</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newValName = editingStudioName.trim();
                                      if (newValName) {
                                        const isDuplicate = studios.some((std, i) => std.name.toLowerCase() === newValName.toLowerCase() && std.location.toLowerCase() === editingStudioLocation.toLowerCase() && i !== idx);
                                        if (isDuplicate) {
                                          setStudioError("Kombinasi nama dan lokasi ini sudah terdaftar!");
                                          return;
                                        }
                                        setStudios(prev => {
                                          const updated = [...prev];
                                          updated[idx] = {
                                            ...updated[idx],
                                            name: newValName,
                                            location: editingStudioLocation
                                          };
                                          return updated;
                                        });
                                        setEditingStudioIdx(null);
                                        setStudioError("");
                                      }
                                    }}
                                    className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                    title="Simpan"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStudioIdx(null);
                                      setStudioError("");
                                    }}
                                    className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all"
                                    title="Batal"
                                  >
                                    <X className="w-4 h-4 text-purple-400" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="text-xs font-bold text-purple-900 truncate font-sans" title={studio.name}>{studio.name}</span>
                                  <span className="text-[9px] text-[#bd9fe4] font-bold font-mono uppercase">{studio.location}</span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingStudioIdx(idx);
                                      setEditingStudioName(studio.name);
                                      setEditingStudioLocation(studio.location);
                                      setStudioError("");
                                    }}
                                    className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer"
                                    title="Edit studio"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      requestConfirm(
                                        "Hapus Studio",
                                        `Apakah Anda yakin ingin menghapus studio "${studio.name}"?`,
                                        () => setStudios(prev => prev.filter(s => s.id !== studio.id)),
                                        "danger"
                                      );
                                    }}
                                    className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                                    title="Hapus studio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                        {studios.length === 0 && (
                          <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada studio terdaftar.</p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ==================== SUBTAB: GOOGLE SHEETS SYNC CONTROL ==================== */}
            {operatorTab === "sheets" && (
              <div className="space-y-6" id="operator_sheets_content">
                
                {/* Introduction Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
                  <div className="space-y-2 z-10 font-sans">
                    <div className="flex items-center gap-2 text-purple-700 font-black text-sm">
                      <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                      SINKRONISASI CO-WORK GOOGLE SHEETS
                    </div>
                    <p className="text-xs text-purple-800 font-semibold max-w-2xl leading-relaxed">
                      Ekspor rekapitulasi gaji, statistik presensi, dan database logs live streaming host Liva Agency secara real-time ke akun spreadsheet eksternal. Sempurna untuk berbagi akses dengan tim Accounting, Finance, atau Owner Agency.
                    </p>
                  </div>
                  
                  {googleUser ? (
                    <button
                      onClick={async () => {
                        setSheetsAuthLoading(true);
                        try {
                          await sheetsLogout();
                          setGoogleUser(null);
                          setGoogleToken(null);
                          setSheetsSyncMessage({ text: "Berhasil memutuskan tautan akun Google.", type: "info" });
                        } catch (err: any) {
                          console.error("Logout error:", err);
                        } finally {
                          setSheetsAuthLoading(false);
                        }
                      }}
                      className="bg-[#f8f6fc] hover:bg-purple-100 text-xs text-purple-705 border border-purple-200 py-2.5 px-4 rounded-xl transition-all self-stretch md:self-auto flex items-center justify-center gap-2 font-black cursor-pointer"
                    >
                      Putuskan Akun Google
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Authorisation and File Configuration */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Auth Status Panel */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-4 font-sans">
                      <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 border-b border-purple-100 pb-2">
                        Hubungkan Google Account
                      </h3>
                      
                      {!googleUser ? (
                        <div className="py-4 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-14 h-14 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
                            <FileSpreadsheet className="w-7 h-7 text-purple-600 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-purple-950">Google Sheets belum terhubung</p>
                            <p className="text-[10.5px] text-purple-500 mt-1 max-w-[250px] font-semibold leading-normal">
                              Otorisasikan akun Google untuk membuat lembaran kalkulasi gaji dan absen.
                            </p>
                          </div>
                          
                          <button
                            onClick={async () => {
                              setSheetsAuthLoading(true);
                              setSheetsSyncMessage(null);
                              try {
                                const authResult = await googleSignIn();
                                if (authResult) {
                                  setGoogleUser(authResult.user);
                                  setGoogleToken(authResult.accessToken);
                                  setSheetsSyncMessage({ text: `Koneksi berhasil! Selamat datang, ${authResult.user.displayName}`, type: "success" });
                                }
                              } catch (err: any) {
                                setSheetsSyncMessage({ text: `Gagal masuk: ${err.message || err}`, type: "error" });
                              } finally {
                                setSheetsAuthLoading(false);
                              }
                            }}
                            disabled={sheetsAuthLoading}
                            className="bg-white hover:bg-purple-50 hover:border-purple-300 disabled:bg-purple-100 text-purple-950 font-black py-2.5 px-5 rounded-xl text-xs flex items-center gap-2.5 shadow-sm transition-all border border-purple-200 cursor-pointer text-gray-900"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="#EA4335"
                                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.12C18.28 1.845 15.54 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.345 0 10.56-4.435 10.56-10.715 0-.725-.075-1.28-.175-1.71h-10.385z"
                              />
                            </svg>
                            {sheetsAuthLoading ? "Menghubungkan..." : "Masuk dengan Google"}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-[#fafafc] border border-purple-100 rounded-xl">
                            {googleUser.photoURL ? (
                              <img
                                src={googleUser.photoURL}
                                alt={googleUser.displayName}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full border border-purple-200 hover:scale-105 transition-all"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
                                {googleUser.displayName?.[0] || "U"}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-black text-purple-950">{googleUser.displayName}</p>
                              <p className="text-[10px] text-purple-500 mt-0.5 font-bold">{googleUser.email}</p>
                            </div>
                          </div>
                          
                          <div className="text-[11px] text-purple-700 flex items-center gap-1.5 px-1 font-bold">
                            <div className="w-2 h-2 rounded-full bg-purple-650 animate-pulse"></div>
                            Sesi Otoritas Google Drive & Sheets Aktif
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Spreadsheet Settings Panel */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-4">
                      <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 border-b border-purple-100 pb-2">
                        Konfigurasi Spreadsheet ID
                      </h3>
                      
                      <div className="space-y-3.5">
                        <div className="text-xs">
                          <label className="block text-[#4c3968] mb-1.5 font-bold">Tautkan ID Spreadsheet Google target:</label>
                          <input
                            type="text"
                            value={spreadsheetId}
                            onChange={(e) => setSpreadsheetId(e.target.value)}
                            placeholder="Masukkan Google Spreadsheet ID..."
                            className="w-full bg-[#fdfbfe] border border-purple-150 rounded-lg px-3 py-2 text-purple-950 text-xs font-mono font-bold focus:outline-none focus:border-purple-400 focus:bg-white"
                          />
                          <p className="text-[9.5px] text-purple-500 mt-1 font-semibold leading-normal">
                            Masukkan ID spreadsheet yang sudah Anda miliki, atau buat lembaran baru secara otomatis menggunakan tombol di bawah ini.
                          </p>
                        </div>

                        {googleToken && (
                          <button
                            onClick={async () => {
                              setIsSyncingSheets(true);
                              setSheetsSyncMessage({ text: "Sedang merancang struktur lembar Google Sheets baru...", type: "info" });
                              try {
                                const newIdUrl = await createNewSpreadsheet(
                                  googleToken,
                                  `Liva Agency - Rekap Absen & Gaji (${new Date().toLocaleDateString("id-ID")})`
                                );
                                setSpreadsheetId(newIdUrl.id);
                                setSpreadsheetUrl(newIdUrl.url);
                                setSheetsSyncMessage({ text: "Spreadsheet baru berhasil dibuat! Data siap disinkronkan sekarang.", type: "success" });
                              } catch (err: any) {
                                console.error("Create spreadsheet error:", err);
                                setSheetsSyncMessage({ text: `Gagal membuat spreadsheet: ${err.message || err}`, type: "error" });
                              } finally {
                                setIsSyncingSheets(false);
                              }
                            }}
                            disabled={isSyncingSheets}
                            className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-extrabold py-2.5 rounded-lg text-xs uppercase transition-all cursor-pointer shadow-xs"
                          >
                            ✨ Buat Spreadsheet Baru di Google Drive
                          </button>
                        )}

                        {spreadsheetUrl && (
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full bg-[#faf9fe] hover:bg-purple-100 text-purple-700 border border-purple-250 hover:border-purple-300 py-2.5 px-4 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 uppercase"
                          >
                            Buka Spreadsheet di Google Sheets ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Options Panel */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 border-b border-purple-100 pb-2">
                        Opsi & Otomatisasi
                      </h3>
                      
                      <div className="flex items-start gap-3 p-1">
                        <input
                          type="checkbox"
                          id="checkbox_auto_sync"
                          checked={autoSyncSheets}
                          onChange={(e) => setAutoSyncSheets(e.target.checked)}
                          className="mt-0.5 rounded border-purple-200 bg-purple-50 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                        />
                        <div className="text-xs cursor-pointer select-none" onClick={() => setAutoSyncSheets(!autoSyncSheets)}>
                          <label className="font-extrabold text-purple-950 block mb-0.5 cursor-pointer">
                            Otomatis Sinkronisasi (Auto-Sync)
                          </label>
                          <p className="text-[10px] text-purple-500 leading-normal font-semibold">
                            Saat diaktifkan, setiap kali operator mengubah status absensi host atau menambahkan logs baru, data summary & logs akan langsung diperbarui ke lembar Google Sheets Anda dalam latar belakang.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Execution Panel and Checklist Actions */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Synchronise Action Cards */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-6 shadow-xs space-y-6">
                      <div className="border-b border-purple-100 pb-3 font-sans">
                        <h4 className="text-xs font-black uppercase text-purple-950">
                          Panel Eksekusi Data Sync
                        </h4>
                        <p className="text-[10.5px] text-purple-500 mt-0.5 font-semibold">
                          Unggah data host, kpi kehadiran, rincian hitung gaji, dan log absensi siaran harian.
                        </p>
                      </div>

                      {sheetsSyncMessage && (
                        <div className={`p-4 rounded-xl border text-xs flex flex-row items-start gap-3.5 leading-relaxed font-sans ${
                          sheetsSyncMessage.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : sheetsSyncMessage.type === "error"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : "bg-[#faf9fe] border-purple-100 text-purple-800"
                        }`}>
                          <div className="text-base select-none mt-0.5">
                            {sheetsSyncMessage.type === "success" ? "✅" : sheetsSyncMessage.type === "error" ? "❌" : "ℹ️"}
                          </div>
                          <div className="space-y-1 font-bold">
                            <span className={`block ${
                              sheetsSyncMessage.type === "success" ? "text-emerald-900" : sheetsSyncMessage.type === "error" ? "text-red-950" : "text-purple-950"
                            }`}>
                              {sheetsSyncMessage.type === "success" ? "Sinkronisasi Berhasil!" : sheetsSyncMessage.type === "error" ? "Proses Terkendala" : "Informasi Sistem"}
                            </span>
                            <span className="text-[11px] block">{sheetsSyncMessage.text}</span>
                          </div>
                        </div>
                      )}

                      <div className="bg-[#fcfbfe] rounded-xl p-4 border border-purple-100 text-xs text-purple-950 font-bold space-y-3">
                        <div className="text-purple-650 font-black uppercase text-[9.5px] tracking-wider mb-2">
                          Data Yang Akan Ditransfer:
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#fbfafd] p-2.5 rounded border border-purple-100">
                            <span className="text-[10.5px] text-purple-500 block mb-0.5 font-semibold">Lembar Rekap Gaji:</span>
                            <strong className="text-purple-700 font-mono text-xs">{hostReportList.length} Baris</strong>
                          </div>
                          <div className="bg-[#fbfafd] p-2.5 rounded border border-purple-100">
                            <span className="text-[10.5px] text-purple-500 block mb-0.5 font-semibold">Lembar Database Absen:</span>
                            <strong className="text-purple-700 font-mono text-xs">{logs.length} Baris</strong>
                          </div>
                        </div>
                        <div className="text-[10px] text-purple-500 font-semibold leading-normal">
                          ⚠️ <em>Proses sinkronisasi akan menimpa tab 'Rekap Gaji Host' dan 'Database Absensi Real-time' dengan data yang ada di platform Liva Agency saat ini.</em>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button
                          onClick={() => handleSheetsExport()}
                          disabled={!googleToken || !spreadsheetId || isSyncingSheets}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-purple-100 disabled:text-purple-350 font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                          {isSyncingSheets ? "Proses Sinkronisasi..." : "Sinkronisasikan Sekarang"}
                        </button>
                      </div>

                    </div>

                    {/* Integration Checklist Actions */}
                    <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-xs space-y-5">
                      <h4 className="text-xs font-black uppercase text-purple-950 border-b border-purple-150 pb-2">
                        Panduan Langkah Sinkronisasi Google Sheets
                      </h4>
                      
                      <div className="space-y-4 text-xs text-purple-700 leading-relaxed font-sans font-semibold">
                        <div className="flex gap-3.5">
                          <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center font-black text-[10px] text-purple-600 border border-purple-100 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <strong className="text-purple-950 block mb-0.5 font-bold">Masuk & Otorisasi Akun Google (Google Login):</strong>
                            <p className="text-[11px] text-purple-500">Hubungkan akun Google milik operator dengan mengklik tombol "Masuk dengan Google". Pilih akun Google Workspace di popup yang disediakan.</p>
                          </div>
                        </div>

                        <div className="flex gap-3.5">
                          <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center font-black text-[10px] text-purple-600 border border-purple-100 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <strong className="text-purple-950 block mb-0.5 font-bold">Mempersiapkan File Spreadsheet ID target:</strong>
                            <p className="text-[11px] text-purple-500">Klik tombol "Buat Spreadsheet Baru" untuk merancang lembar baru di Google Drive Anda secara instan. Atau salin & tempel ID Spreadsheet lama Anda jika ingin menimpa data spreadsheet yang sudah ada.</p>
                          </div>
                        </div>

                        <div className="flex gap-3.5">
                          <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center font-black text-[10px] text-purple-600 border border-purple-100 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <strong className="text-purple-950 block mb-0.5 font-bold">Sinkronkan atau Nyalakan Fitur Auto-Sync:</strong>
                            <p className="text-[11px] text-purple-500">Tekan "Sinkronisasikan Sekarang" untuk mengunggah laporan pertama kali. Aktifkan checkbox "Auto-Sync" agar seluruh rekapitulasi gaji terupdate otomatis setiap kali ada pergeseran log kehadiran host.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}
                        {/* ==================== SUBTAB: PRIVASI MASTER ADMIN ==================== */}
            {operatorTab === "admin_privacy" && (
              <div className="space-y-6 animate-fadeIn" id="operator_admin_privacy_content">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-rose-500" /> Pengaturan Privasi & Keamanan Master Admin
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1">Kelola kata sandi, otentikasi dua langkah, dan log aktivitas admin</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ubah Password */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 h-fit">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-slate-500"/> Ubah Kata Sandi Admin</h4>
                      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); customAlert("Sandi berhasil diperbarui!"); }}>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Kata Sandi Saat Ini</label>
                          <input type="password" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Kata Sandi Baru</label>
                          <input type="password" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Konfirmasi Kata Sandi Baru</label>
                          <input type="password" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:border-rose-500 outline-none" />
                        </div>
                        <button type="submit" className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer border-0">Perbarui Kata Sandi</button>
                      </form>
                    </div>

                    <div className="space-y-6">
                      {/* Authenticator */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Smartphone className="w-4 h-4 text-slate-500"/> Otentikasi Dua Langkah (2FA)</h4>
                        <p className="text-xs text-slate-500 font-medium mb-4">Lindungi akun Master Admin dengan verifikasi tambahan dari aplikasi auth.</p>
                        
                        <div className="flex items-center justify-between bg-white border border-emerald-100 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-4 h-4"/></div>
                            <div>
                              <div className="text-[11px] font-bold text-emerald-700 uppercase">Aktif</div>
                              <div className="text-[10px] text-slate-500">Sejak 2 Hari Lalu</div>
                            </div>
                          </div>
                          <button className="text-[10px] font-bold px-3 py-1.5 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">Nonaktifkan</button>
                        </div>
                      </div>

                      {/* Log Akses */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-slate-500"/> Sesi & Log Perangkat</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2.5">
                              <Monitor className="w-5 h-5 text-indigo-500"/>
                              <div>
                                <div className="text-xs font-bold text-slate-800">MacBook Pro (Chrome)</div>
                                <div className="text-[10px] text-emerald-600 font-semibold">Sedang Aktif (IP: 103.111.43.x)</div>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">Current</span>
                          </div>
                          
                          <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                            <div className="flex items-center gap-2.5">
                              <Smartphone className="w-5 h-5 text-slate-400"/>
                              <div>
                                <div className="text-xs font-bold text-slate-700">iPhone 14 Pro (Safari)</div>
                                <div className="text-[10px] text-slate-500">Terakhir aktif: 2 jam lalu (Jakarta)</div>
                              </div>
                            </div>
                            <button className="text-[9px] font-bold text-slate-400 border-0 bg-transparent hover:text-red-500 transition-colors cursor-pointer">Logout</button>
                          </div>
                        </div>
                      </div>

                      {/* Manajemen Data Master / Danger Zone */}
                      <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                        <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-600"/> Manajemen Basis Data</h4>
                        <p className="text-xs text-red-600/80 font-medium mb-4">Aksi berbahaya. Pengelolaan ulang dan pemulihan data sistem secara paksa dari atau ke cloud.</p>

                        <div className="flex flex-col gap-3">
                          <button
                            onClick={handleRecoverLocalStorage}
                            className="w-full text-xs font-black bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" /> Pulihkan Data Lokal ke Cloud
                          </button>

                          <button
                            onClick={handleClearAllData}
                            className="w-full text-xs font-black bg-white border border-red-200 hover:bg-red-600 hover:text-white text-red-700 px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" /> Kosongkan Seluruh Data Cloud
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== SUBTAB: AKUN & KREDENSIAL HOST PRIVASI ==================== */}
            {operatorTab === "credentials" && (
              <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn" id="operator_credentials_content">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-50 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-purple-950 flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-purple-600" />
                      Manajemen Kredensial & Privasi Akun Host
                    </h3>
                    <p className="text-xs text-[#3c2f56]/80 mt-1 font-medium leading-relaxed">
                      Tambahkan host baru, edit profil (Nama, HP, Rekening Bank), atau atur ulang username/password login mereka secara real-time.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 self-start sm:self-center transition-all shadow-xs cursor-pointer select-none"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddForm ? "Sembunyikan Form" : "Tambah Host Baru"}
                  </button>
                </div>

                {credentialsToast && (
                  <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-3.5 rounded-xl text-xs font-black flex items-center gap-2 animate-fadeIn shadow-3xs" id="credentials_toast_notifier">
                    <span>✨ {credentialsToast}</span>
                  </div>
                )}

                {/* Collapsible Add New Host Form */}
                {showAddForm && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!newHostName.trim()) return;
                    handleAddHost({
                      name: newHostName,
                      role: newHostRole,
                      studio: newHostStudio,
                      phone: "-",
                      bankAccount: "-",
                      username: newHostUser,
                      password: newHostPass,
                      customWorkingDaysTarget: undefined
                    });
                    // Reset fields
                    setNewHostName("");
                    setNewHostRole("Reguler Host");
                    setNewHostStudio("Bandar Lampung");
                    setNewHostUser("");
                    setNewHostPass("");
                    setShowAddForm(false);
                  }} className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100 space-y-4 animate-fadeIn" id="add_host_form">
                    <div className="text-xs font-black text-purple-950 uppercase tracking-widest flex items-center gap-1.5 border-b border-purple-100 pb-2">
                      <span>👤 Pendaftaran Host Agency Baru</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
                      <div>
                        <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Nama Lengkap Host:</label>
                        <input
                          type="text"
                          required
                          value={newHostName}
                          onChange={(e) => setNewHostName(e.target.value)}
                          placeholder="Misal: Amanda Putri"
                          className="w-full bg-white border border-purple-150 rounded-xl px-3 py-2 text-xs text-[#3c2f56] font-extrabold focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Grup / Role Level:</label>
                        <select
                          value={newHostRole}
                          onChange={(e) => setNewHostRole(e.target.value)}
                          className="w-full bg-white border border-purple-150 rounded-xl px-3 py-2 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Reguler Host">Reguler Host</option>
                          <option value="Back Up Host">Back Up Host</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Lokasi Studio / Kota:</label>
                        <select
                          value={newHostStudio}
                          onChange={(e) => setNewHostStudio(e.target.value)}
                          className="w-full bg-white border border-purple-150 rounded-xl px-3 py-2 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          {studios.length > 0 ? (
                            studios.map((std, i) => ( <option key={std.id + '_' + i} value={std.location}>{std.location}</option>
                            ))
                          ) : (
                            <>
                              <option value="Bandar Lampung">Bandar Lampung</option>
                              <option value="Tanggamus">Tanggamus</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Username Akun Absen:</label>
                        <input
                          type="text"
                          value={newHostUser}
                          onChange={(e) => setNewHostUser(e.target.value)}
                          placeholder="Kosongkan untuk otomatis"
                          className="w-full bg-white border border-purple-150 rounded-xl px-3 py-2 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">Password Akun login:</label>
                        <input
                          type="text"
                          value={newHostPass}
                          onChange={(e) => setNewHostPass(e.target.value)}
                          placeholder="Default: liva123"
                          className="w-full bg-white border border-purple-150 rounded-xl px-3 py-2 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="bg-white hover:bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs border border-gray-200 transition-all cursor-pointer select-none"
                      >
                        Batalkan
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer select-none"
                      >
                        Daftarkan Host Baru ➜
                      </button>
                    </div>
                  </form>
                )}

                <div className="overflow-x-auto border border-purple-100 rounded-2xl bg-white bg-white">
                  <table className="min-w-full divide-y divide-purple-100">
                    <thead className="bg-[#faf9fe]">
                      <tr className="text-left text-[10px] font-black uppercase text-purple-500/80 tracking-wider">
                        <th className="px-6 py-4 font-sans">Nama & ID Host</th>
                        <th className="px-6 py-4 font-sans">Grup / Role</th>
                        <th className="px-6 py-4 font-sans">Lokasi Studio</th>
                        <th className="px-6 py-4 font-sans">Username Login</th>
                        <th className="px-6 py-4 font-sans">Password Login</th>
                        <th className="px-6 py-4 font-sans text-right">Aksi Manajemen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {hosts.map(h => (
                        <HostCredentialRow
                          key={h.id}
                          host={h}
                          onUpdate={handleUpdateHost}
                          onDelete={handleDeleteHost}
                          studios={studios}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-purple-50/45 p-4 rounded-xl border border-purple-100 text-xs text-[#3c2f56]/80 flex items-start gap-2.5">
                  <span className="text-lg">💡</span>
                  <div className="leading-relaxed font-semibold">
                    <strong className="text-purple-950 font-bold block mb-0.5">Petunjuk Privasi Kredensial Agency:</strong>
                    Beritahukan kepada masing-masing host tentang username dan password yang tercatat di atas agar mereka dapat melakukan absen masuk secara mandiri melalui handphone simulator di atas. Password bersifat transparan untuk operator guna pemulihan akun cepat.
                  </div>
                </div>

              </div>
            )}

                </div>
              </div>
            </div>
          </main>
      )}

      {/* --- FOOTER STATUS & SIGNATURE --- */}
      {!isOperatorLoggedIn && (
        <footer className="bg-white border-t border-purple-100 py-6 px-4 md:px-8 mt-auto flex flex-col md:flex-row justify-between w-full items-center gap-4 text-xs text-purple-500" id="system-footer-credits">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="font-bold font-mono text-purple-700">INTELLIGENCE PLATFORM DEPLOYED (UTC LOCALTIME)</span>
          </div>
          <div>
            <span className="font-medium">© 2026 Liva Agency. Dikembangkan secara khusus untuk manajemen kehadiran & payroll.</span>
          </div>
        </footer>
      )}

      {/* ==================== CUSTOM HIGH-POLISHED STATIC PORTAL CONFIRM MODAL ==================== */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs animate-fadeIn font-sans" id="custom_confirm_modal_portal">
          <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-sm w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'}`}>
                {confirmModal.type === 'danger' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <Sliders className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-purple-950 tracking-wide">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-purple-500 font-semibold leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t border-purple-50">
              {!confirmModal.hideCancel && (
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-3.5 py-1.5 hover:bg-purple-50 text-purple-700 text-xs font-bold rounded-lg transition-all cursor-pointer border-0"
                >
                  {confirmModal.cancelText || "Batal"}
                </button>
              )}
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`px-3.5 py-1.5 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-2xs ${
                  confirmModal.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {confirmModal.confirmText || "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent to prevent parent lagging re-renders and keep form states clean
function HostCredentialRow({
  host,
  onUpdate,
  onDelete,
  studios = []
}: {
  host: HostEmployee;
  onUpdate: (id: string, fields: Partial<HostEmployee>) => void;
  onDelete: (id: string) => void;
  studios?: StudioItem[];
  key?: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(host.name || "");
  const [role, setRole] = useState(host.role || "");
  const [studio, setStudio] = useState(host.studio || "Studio Bandar Lampung");
  const [phone, setPhone] = useState(host.phone || "");
  const [bankAccount, setBankAccount] = useState(host.bankAccount || "");
  const [username, setUsername] = useState(host.username || "");
  const [password, setPassword] = useState(host.password || "");
  const [customWorkingDaysTarget, setCustomWorkingDaysTarget] = useState<number>(host.customWorkingDaysTarget || 26);

  useEffect(() => {
    if (isEditing) return;
    setName(host.name || "");
    setRole(host.role || "");
    setStudio(host.studio || "Studio Bandar Lampung");
    setPhone(host.phone || "");
    setBankAccount(host.bankAccount || "");
    setUsername(host.username || "");
    setPassword(host.password || "");
    setCustomWorkingDaysTarget(host.customWorkingDaysTarget || 26);
  }, [host, isEditing]);

  const handleSave = () => {
    onUpdate(host.id, {
      name,
      role,
      hostType: role.toLowerCase().includes("back up") ? "Backup" : "Reguler",
      studio,
      phone,
      bankAccount,
      username,
      password,
      customWorkingDaysTarget: role.toLowerCase().includes("back up") ? undefined : customWorkingDaysTarget
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(host.name || "");
    setRole(host.role || "");
    setStudio(host.studio || "Studio Bandar Lampung");
    setPhone(host.phone || "");
    setBankAccount(host.bankAccount || "");
    setUsername(host.username || "");
    setPassword(host.password || "");
    setCustomWorkingDaysTarget(host.customWorkingDaysTarget || 26);
    setIsEditing(false);
  };

  return (
    <tr className="hover:bg-purple-50/40 transition-colors border-b border-purple-100/65 text-xs text-[#3c2f56]">
      {/* 1. NAMA & ID */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={getAvatarUrl(host.name)}
            alt={host.name}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/10 flex-shrink-0"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs font-bold text-purple-950 block w-full focus:outline-none focus:border-purple-500"
                  placeholder="Nama Host"
                />
                <span className="text-[9px] text-purple-400 font-bold font-mono block">ID: {host.employeeId}</span>
              </div>
            ) : (
              <div>
                <span className="font-extrabold text-purple-950 text-xs block">{host.name}</span>
                <span className="text-[9px] text-purple-400 font-bold font-mono block">ID: {host.employeeId}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* 2. GRUP / ROLE */}
      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500"
          >
            <option value="Reguler Host">Reguler Host</option>
            <option value="Back Up Host">Back Up Host</option>
          </select>
        ) : (
          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold text-[9.5px] uppercase border border-purple-100/40">
            {host.role}
          </span>
        )}
      </td>

      {/* 2.5 LOKASI STUDIO */}
      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={studio}
            onChange={(e) => setStudio(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded px-2 py-1 text-xs text-[#3c2f56] font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {studios.length > 0 ? (
              studios.map((std, i) => ( <option key={std.id + '_' + i} value={std.name}>{std.name} ({std.location})</option>
              ))
            ) : (
              <>
                <option value="Studio Bandar Lampung">Studio Bandar Lampung (Bandar Lampung)</option>
                <option value="Studio Tanggamus">Studio Tanggamus (Tanggamus)</option>
              </>
            )}
          </select>
        ) : (
          <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/45 font-extrabold text-[9.5px] uppercase">
            {host.studio || "Studio Bandar Lampung"}
          </span>
        )}
      </td>

      {/* 4. USERNAME */}
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 font-bold text-xs w-28"
            placeholder="username"
          />
        ) : (
          <code className="bg-purple-50 px-2 py-1 rounded text-purple-650 font-mono font-bold text-[11px] border border-purple-100/30">
            {host.username}
          </code>
        )}
      </td>

      {/* 5. PASSWORD */}
      <td className="px-6 py-4">
        {isEditing ? (
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#faf9fe] border border-purple-150 rounded-lg px-2 py-1 focus:outline-none focus:border-purple-500 font-mono text-xs font-bold w-28"
            placeholder="password"
          />
        ) : (
          <code className="bg-purple-50 px-2 py-1 rounded text-purple-650 font-mono font-bold text-[11px] border border-purple-100/30">
            {host.password}
          </code>
        )}
      </td>

      {/* 6. AKSI MANAJEMEN */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs cursor-pointer transition-all"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-750 transition-all cursor-pointer"
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100/60 rounded-lg border border-purple-100/40 transition-all cursor-pointer"
                title="Edit Host"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(host.id);
                }}
                className="p-1.5 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100/60 rounded-lg border border-red-100/40 transition-all cursor-pointer"
                title="Hapus Host"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

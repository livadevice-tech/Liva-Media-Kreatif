/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  FormEvent,
} from "react";
import { BrandFormEditor } from "./components/BrandFormEditor";
import { motion, AnimatePresence } from "motion/react";
import { createPortal } from "react-dom";
import LandingPage from "./LandingPage";
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
  Shield,
  ShieldCheck,
  Check,
  Copy,
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
  Receipt,
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
  Gift,
  MoreHorizontal,
  Star,
  UserPlus,
  ArrowUpDown,
  TrendingDown,
  Loader2,
  Fingerprint,
  Building2,
  PlaySquare,
  Percent,
  Calculator,
  CalendarDays,
  FileText,
  Settings,
  FolderOpen,
  XCircle,
  Info,
} from "lucide-react";

import {
  HostEmployee,
  AttendanceLog,
  StudioItem,
  ClientBrand,
  ClientReporting,
  ClientLead,
  ShiftSchedule,
  AdminAccount,
} from "./types";
import { INITIAL_HOSTS, INITIAL_LOGS, PLATFORMS, BRANDS, SHIFTS } from "./data";
import { DoubleDatePicker } from "./components/DoubleDatePicker";
import {
  formatDateYYYYMMDD,
  formatDateUI,
  formatHumanDate,
} from "./shared/utils/date";
import { formatIDR } from "./shared/utils/currency";
import { formatContractDate, padLocal } from "./shared/utils/dateFormatting";
import { getPickerDays } from "./shared/utils/calendar";
import {
  applyDateFilterSelection,
  getAvailableReportDates,
  getReportPeriodLabel,
  shiftAvailableReportDate,
} from "./shared/utils/reportDateFilters";
import {
  buildDatabaseBackupPayload,
  createBackupDownloadHref,
  extractBackupImportCollections,
  getBackupFilename,
  hasAnyBackupCollections,
  recoverCollectionsFromLocalStorage,
} from "./shared/utils/dataBackup";
import {
  normalizeHostStudioLocation,
} from "./shared/utils/hostCredentials";
import {
  buildMappedUploadRows,
} from "./shared/utils/mappingUpload";
import { exportReportToExcel } from "./shared/utils/excelExportUtils";
import { buildProductPerformanceViewModel } from "./shared/utils/productPerformanceViewModel";
import {
  parseReportingUploadRows,
  parseSkuUploadRows,
  readFirstWorksheetRowsFromFile,
} from "./shared/utils/xlsxUploadParsers";
import { buildReportingUploadSummary } from "./shared/utils/reportingUploadSummary";
import {
  detectBrandFromFilename,
  detectPlatformFromFilename,
  findReportingUploadHeaderRowIndex,
  detectReportingPlatformFromHeaders,
} from "./shared/utils/uploadAutoDetect";
import {
  type BrandReportRow,
  type BrandPerformanceLogEntry,
  type UploadHistoryEntry,
  type ReportingRawRow,
  type SkuRawRow,
  type SkuLogEntry,
} from "./shared/types/reporting";
import {
  getAvatarUrl,
  isPlatformMatch,
  formatDisplayDate,
  normalizeDateYMD,
  PercentBadge,
  getBrandStyle,
  getShiftStyle,
  getStudioHeaderStyle,
  getBrandColor,
  getShiftFromHour,
} from "./shared/utils/appUi";
import {
  buildDailyChart,
  buildMonthlyChart,
  buildAvailableCutoffMonths,
  getIndonesianMonthLabel,
  getLogDateInput,
  getMonthOffset,
  isLogDateMatching,
} from "./shared/utils/reporting";
import { filterItemsWithinDateRange } from "./shared/utils/reportingDeletion";
import { buildLiveReportViewModel } from "./shared/utils/liveReporting";
import { buildEngagementReportViewModel } from "./shared/utils/engagementReporting";
import { buildActiveReportBrandUploadHistory } from "./shared/utils/uploadHistory";
import { buildHostReportList, HostReportRow } from "./shared/utils/salaryReporting";
import { SlipGajiModal } from "./components/reporting/SlipGajiModal";
import {
  buildReportChartData,
  filterReportLogs,
  getNextSortState,
  sortReportLogs,
} from "./shared/utils/reportTable";
import {
  buildReportBrandSummary,
  getAvailablePlatformsForBrand,
  selectMostUsedPlatform,
} from "./shared/utils/reportBrandSummary";
import {
  markAllAsRead,
  markHostNotificationsAsRead as markHostNotificationsAsReadList,
  prependCappedNotification,
  removeNotification,
} from "./shared/utils/notificationList";
import {
  DEFAULT_GLOBAL_CONFIG,
  type GlobalConfigData,
  parseNestedJsonValue,
  saveLocalConfig,
} from "./shared/config/globalConfig";
import type { AuthSession } from "./shared/auth/session";
import {
  type AdminTab,
  canAccessAnyTab,
  canAccessDbTest,
  MODULE_TAB_REQUIREMENTS,
} from "./shared/auth/access";
import {
  hostsApi,
  logsApi,
  schedulesApi,
  alertsApi,
  clientBrandsApi,
  clientLeadsApi,
  adminAccountsApi,
  settingsApi,
  testDbConnection,
  authApi,
  reportingBrandApi,
} from "./api";
import { syncToFirestore } from "./firestoreSync"; // shim → syncToMySQL
import { InvoiceDashboard } from "./components/InvoiceDashboard";
import { QuickGridInput } from "./components/QuickGridInput";
import {
  HostCredentialRow,
  SearchableHostSelect,
} from "./components/admin/HostManagement";
import { AttendanceCalendarView } from "./components/admin/AttendanceCalendarView";

import {
  HorizontalFunnel,
  LivaLogo,
} from "./components/branding/BrandGraphics";

import { ReportMetricCard } from "./components/reporting/ReportMetricCard";
import { ReportFiltersBar } from "./components/reporting/ReportFiltersBar";
import { ReportRawSessionsCard } from "./components/reporting/ReportRawSessionsCard";
import { UploadHistoryCard } from "./components/reporting/UploadHistoryCard";
import { LeadPipelinePanel } from "./components/reporting/LeadPipelinePanel";
import { LeadFormModal } from "./components/reporting/LeadFormModal";
import {
  ReportingWorkspaceHeader,
  ReportingWorkspaceTabs,
} from "./components/reporting/ReportingWorkspaceHeader";
import { BrandDashboardSettingsPanel } from "./components/reporting/BrandDashboardSettingsPanel";
import { ReportBrandSelectionPanel } from "./components/reporting/ReportBrandSelectionPanel";
import { ProductPerformancePanel } from "./components/reporting/ProductPerformancePanel";
import { DeleteByDateModal } from "./components/reporting/DeleteByDateModal";
import { SkuUploadModal } from "./components/reporting/SkuUploadModal";
import { DownloadReportModal } from "./components/reporting/DownloadReportModal";
import { ReportingUploadAnalyticsSection } from "./components/reporting/ReportingUploadAnalyticsSection";
import { ReportingUploadPreviewTable } from "./components/reporting/ReportingUploadPreviewTable";
import { CutoffPeriodSelector } from "./components/reporting/CutoffPeriodSelector";
import { SettingsMetadataPanels } from "./components/reporting/SettingsMetadataPanels";
import { AdminPasswordCard } from "./components/reporting/AdminPasswordCard";
import { AdminMaintenancePanel } from "./components/reporting/AdminMaintenancePanel";
import {
  aggregateSkuLogs,
  filterSkuLogs,
  getLatestDateForBrand,
} from "./shared/utils/skuReporting";

const LiveReportPanel = React.lazy(() =>
  import("./components/reporting/LiveReportPanel").then((module) => ({
    default: module.LiveReportPanel,
  })),
);
const EngagementReportPanel = React.lazy(() =>
  import("./components/reporting/EngagementReportPanel").then((module) => ({
    default: module.EngagementReportPanel,
  })),
);

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "success" | "info" | "warning" | "danger" | "error";
  timestamp: string;
  read: boolean;
  actionTab?: string;
}

interface HostNotificationItem {
  id: string;
  hostId: string;
  title: string;
  message: string;
  date: string;
  createdAt: string;
  read: boolean;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

type ShopeeRawGroupRow = {
  label: string;
  duration?: number;
  penonton: number;
  gmv: number;
  products_sold: number;
  orders: number;
};

type ReportChartPoint = {
  date: string;
  gmv: number;
  orders: number;
  itemsSold: number;
  clicks: number;
  penonton: number;
};

type DailyEngagementAggregate = {
  date: string;
  penonton: number;
  likes: number;
  shares: number;
  comments: number;
  followers: number;
};

export default function App() {
  const initPath = window.location.pathname;
  const initRoleMatch = initPath.match(/\/login\/(admin|host|brand)/);

  // Dynamic Platforms, Brands, and Shifts lists which can be customized
  const [platforms, _setPlatforms] = useState<string[]>(PLATFORMS);
  const [isGlobalConfigsLoaded, setIsGlobalConfigsLoaded] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [isQuotaBannerDismissed, setIsQuotaBannerDismissed] = useState(false);

  // Checkbox selection states matching the UI Reference
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);
  const [uploadBrand, setUploadBrand] = useState<string>("");
  const [uploadPlatform, setUploadPlatform] = useState<string>("Tiktok");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryEntry[]>(
    [],
  );

  useEffect(() => {
    if (isGlobalConfigsLoaded && uploadHistory.length > 0) {
      saveLocalConfig({ uploadHistory });
    }
  }, [uploadHistory, isGlobalConfigsLoaded]);


  const [brandReports, setBrandReports] = useState<
    Record<string, BrandReportRow[]>
  >({});

  useEffect(() => {
    if (isGlobalConfigsLoaded && Object.keys(brandReports).length > 0) {
      saveLocalConfig({ brandReports });
    }
  }, [brandReports, isGlobalConfigsLoaded]);


  // States for custom salary overrides
  const [editingSalaryHostId, setEditingSalaryHostId] = useState<string | null>(
    null,
  );
  const [tempSalaryValue, setTempSalaryValue] = useState<string>("");
  const [copiedSalaryHostId, setCopiedSalaryHostId] = useState<string | null>(null);
  const [pendingDeleteLogId, setPendingDeleteLogId] = useState<string | null>(null);

  const [activeReportPlatform, setActiveReportPlatform] =
    useState<string>("Tiktok");
  const [activeReportTab, setActiveReportTab] = useState<
    | "ringkasan"
    | "data_harian"
    | "data_mingguan"
    | "data_bulanan"
    | "history_upload"
  >("ringkasan");
  const [reportSortKey, setReportSortKey] = useState<string>("name");
  const [reportSortDir, setReportSortDir] = useState<"desc" | "asc">("desc");
  const [editingReportIdx, setEditingReportIdx] = useState<string | null>(null);
  const [editingReportForm, setEditingReportForm] =
    useState<Partial<ClientReporting>>({});

  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [mappingHeaders, setMappingHeaders] = useState<string[]>([]);
  const [mappingRawData, setMappingRawData] = useState<unknown[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    date: "",
    gmv: "",
    items_sold: "",
    orders: "",
    views: "",
    viewers: "",
    impressions: "",
    ctr: "",
    ctor: "",
  });

  const [dbStatusFilter, setDbStatusFilter] = useState<
    "All" | "Present" | "Late" | "Absent" | "Excused"
  >("All");
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [isClientSidebarVisible, setIsClientSidebarVisible] =
    useState<boolean>(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetTab, setUploadTargetTab] = useState<"live" | "engagement">(
    "live",
  );
  const [isSkuUploadModalOpen, setIsSkuUploadModalOpen] =
    useState<boolean>(false);
  const [isGoogleSheetsImportModalOpen, setIsGoogleSheetsImportModalOpen] =
    useState<boolean>(false);
  const [importSpreadsheetUrl, setImportSpreadsheetUrl] = useState<string>("");

  const [isDeleteByDateModalOpen, setIsDeleteByDateModalOpen] = useState(false);
  const [deleteByDateTargetBrand, setDeleteByDateTargetBrand] = useState<{id: string, name: string} | null>(null);
  const [deleteByDateStart, setDeleteByDateStart] = useState("");
  const [deleteByDateEnd, setDeleteByDateEnd] = useState("");

  const [confirmState, setConfirmState] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [alertState, setAlertState] = useState<{ message: string } | null>(
    null,
  );

  const customConfirm = (message: string, onConfirm: () => void) => {
    setConfirmState({ message, onConfirm });
  };
  const customAlert = (message: string) => {
    setAlertState({ message });
  };

  const handleQuotaError = useCallback((err: unknown, context?: string) => {
    const message = err instanceof Error ? err.message : String(err ?? "");
    if (message.toLowerCase().includes("quota")) {
      setIsQuotaExceeded(true);
      console.warn(`Firestore Quota Limit Exceeded detected in ${context || "general"}. Standard cached/local values are active.`);
    } else {
      console.error(`Firestore error in ${context || "general"}:`, err);
    }
  }, []);

  const [agencyLogoUrl, _setAgencyLogoUrl] = useState<string>("");
  const setAgencyLogoUrl = useCallback(
    (action: React.SetStateAction<string>) => {
      _setAgencyLogoUrl((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prevState: string) => string)(prev)
            : action;
        saveLocalConfig({ agencyLogoUrl: next });
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    if (agencyLogoUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = agencyLogoUrl;
    }
  }, [agencyLogoUrl]);

  const [brands, _setBrands] = useState<string[]>(BRANDS);

  const [shifts, _setShifts] = useState<string[]>(SHIFTS);

  const [studios, _setStudios] = useState<StudioItem[]>([
    {
      id: "std_1",
      name: "Studio Bandar Lampung",
      location: "Bandar Lampung",
    },
    { id: "std_2", name: "Studio Tanggamus", location: "Tanggamus" },
    { id: "std_3", name: "Studio 01", location: "Bandar Lampung" },
    { id: "std_4", name: "Studio 02", location: "Tanggamus" },
  ]);

  const setPlatforms = useCallback((action: React.SetStateAction<string[]>) => {
    _setPlatforms((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: string[]) => string[])(prev)
          : action;
      saveLocalConfig({ platforms: next });
      return next;
    });
  }, []);

  const setBrands = useCallback((action: React.SetStateAction<string[]>) => {
    _setBrands((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: string[]) => string[])(prev)
          : action;
      saveLocalConfig({ brands: next });
      return next;
    });
  }, []);

  const setShifts = useCallback((action: React.SetStateAction<string[]>) => {
    _setShifts((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: string[]) => string[])(prev)
          : action;
      saveLocalConfig({ shifts: next });
      return next;
    });
  }, []);

  const setStudios = useCallback(
    (action: React.SetStateAction<StudioItem[]>) => {
    _setStudios((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: StudioItem[]) => StudioItem[])(prev)
          : action;
      saveLocalConfig({ studios: next });
      return next;
    });
  }, []);

  // --- DATABASE & STATE PERSISTENCE ---
  const [hosts, _setHosts] = useState<HostEmployee[]>([]);
  const [logs, _setLogs] = useState<AttendanceLog[]>([]);
  const [clientBrands, _setClientBrands] = useState<ClientBrand[]>([]);
  const [clientLeads, _setClientLeads] = useState<ClientLead[]>([]);

  // Recover missing history if feature is newly added OR fix badly recovered names
  useEffect(() => {
    let historyChanged = false;
    let newHistory = [...uploadHistory];

    // 1. Recover if empty
    if (
      newHistory.length === 0 &&
      Object.keys(brandReports).length > 0 &&
      clientBrands.length > 0
    ) {
      Object.entries(brandReports).forEach(([brandId, records]) => {
        const brand =
          clientBrands.find((b) => b.id === brandId)?.name || brandId;
        // Group by platform so we can show one entry per platform
        const platforms = Array.from(
          new Set((records as BrandReportRow[]).map((r) => r.platform || "Tiktok")),
        );
        platforms.forEach((plat) => {
          const platRecords = (records as BrandReportRow[]).filter(
            (r) => (r.platform || "Tiktok") === plat,
          );
          if (platRecords.length > 0) {
            newHistory.push({
              id: `recovered-${Date.now()}-${brandId}-${plat}`,
              brand: brand,
              platform: plat,
              filename: "Data Sebelumnya (Recovered)",
              date: new Date().toISOString(),
              rowsAdded: platRecords.length,
            });
            historyChanged = true;
          }
        });
      });
    }

    // 2. Fix nicely any badly recovered brand names (where brand was saved as UUID instead of name)
    if (newHistory.length > 0 && clientBrands.length > 0) {
      newHistory = newHistory.map((h) => {
        if (h.id?.toString().startsWith("recovered-")) {
          const matchingBrand = clientBrands.find((b) => b.id === h.brand);
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

  const [salarySettings, setSalarySettings] = useState({
    workingDays: 26, // Cycle Hari Kerja Sebulan
    bandarLampungRegulerBase: 4000000, // Gaji Pokok Bulanan Bandar Lampung
    tanggamusRegulerBase: 3500000, // Gaji Pokok Bulanan Tanggamus
    bandarLampungBackupPay: 175000, // Gaji per Shift Bandar Lampung
    tanggamusBackupPay: 150000, // Gaji per Shift Tanggamus
    bandarLampungRegulerBonus: 300000, // Bonus Bulanan Bandar Lampung untuk 100% Hadir & <=3x Terlambat
    tanggamusRegulerBonus: 250000, // Bonus Bulanan Tanggamus untuk 100% Hadir & <=3x Terlambat
    overtimePayPerHour: 20000, // Nominal Gaji Lembur per Jam
    useCutOff: true, // Aktifkan Cut Off (mulai tanggal 16 ke tanggal 15 bulan depannya)
    cutOffStartDay: 16,
    cutOffEndDay: 15,
  });

  const [loggedInClientBrandId, setLoggedInClientBrandId] = useState<
    string | null
  >(null);

  const [loggedInHostId, setLoggedInHostId] = useState<string | null>(null);

  const [loggedInAdminId, setLoggedInAdminId] = useState<string | null>(null);

  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  const [isOperatorLoggedIn, setIsOperatorLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [globalConfigFetchFailed, setGlobalConfigFetchFailed] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getSession()
      .then((session) => {
        if (cancelled || !session) return;
        setAuthSession(session);
        if (session.role === "host") setLoggedInHostId(session.subjectId);
        if (session.role === "brand") setLoggedInClientBrandId(session.subjectId);
        if (session.role === "master" || session.role === "admin") {
          setIsOperatorLoggedIn(true);
          setLoggedInAdminId(session.role === "admin" ? session.subjectId : null);
          if (session.accessTabs?.length) {
            setOperatorTab(session.accessTabs[0] as AdminTab);
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setLoggedInClientBrandId(null);
        setLoggedInHostId(null);
        setLoggedInAdminId(null);
        setIsOperatorLoggedIn(false);
        setAuthSession(null);
      })
      .finally(() => {
        if (!cancelled) setIsAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = useCallback(() => {
    authApi.logout().catch(console.error);
    setLoggedInClientBrandId(null);
    setLoggedInHostId(null);
    setLoggedInAdminId(null);
    setIsOperatorLoggedIn(false);
    setAuthSession(null);
    setClientLoginBrandId("");
    setClientLoginPass("");
  }, []);

  const salarySettingsRef = useRef(salarySettings);

  useEffect(() => {
    salarySettingsRef.current = salarySettings;
  }, [salarySettings]);

  // Simpan salarySettings ke localStorage (dengan debounce 1 detik)
  useEffect(() => {
    if (!isGlobalConfigsLoaded || !isOperatorLoggedIn || globalConfigFetchFailed) return;
    const timer = setTimeout(() => {
      saveLocalConfig({ salarySettings });
    }, 1000);
    return () => clearTimeout(timer);
  }, [salarySettings, isGlobalConfigsLoaded, isOperatorLoggedIn, globalConfigFetchFailed]);

  useEffect(() => {
    let cancelled = false;

    if (!isAuthReady) return;

    const isAdminOrOperator = loggedInAdminId || isOperatorLoggedIn;
    const isHost = loggedInHostId;
    const isBrand = loggedInClientBrandId;
    const isGuest = !isAdminOrOperator && !isHost && !isBrand;
    const isMaster = authSession?.role === "master";
    const canLoad = (...tabs: string[]) =>
      isMaster || canAccessAnyTab(authSession?.accessTabs, tabs);

    if (isGuest) {
      setIsGlobalConfigsLoaded(true);
      setIsLogsLoading(false);
      return;
    }

    // MySQL REST API: load semua data sesuai role
    // (tidak ada real-time listener, data di-fetch saat mount)
    const loadAll = async () => {
      setIsLogsLoading(true);
      try {
        const loadTasks: Promise<unknown>[] = [];

        // 1. admin_accounts
        if (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.adminAccounts)) {
          loadTasks.push(
            adminAccountsApi
              .getAll()
              .then(_setAdminAccounts)
              .catch((err) => handleQuotaError(err, "admin_accounts")),
          );
        }

        // 2. hosts
        if (isHost || (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.hosts))) {
          loadTasks.push(
            (isHost
              ? hostsApi.getById(loggedInHostId).then((host) => [host])
              : hostsApi.getAll())
              .then(_setHosts)
              .catch((err) => handleQuotaError(err, "hosts")),
          );
        }

        // 3. logs
        if (isHost || (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.logs))) {
          loadTasks.push(
            logsApi
              .getAll(isHost ? { hostId: loggedInHostId } : undefined)
              .then(_setLogs)
              .catch((err) => handleQuotaError(err, "logs")),
          );
        }

        // 4. client_brands
        if (isBrand || (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.clientBrands))) {
          loadTasks.push(
            (isBrand
              ? clientBrandsApi.getById(loggedInClientBrandId).then((brand) => [brand])
              : clientBrandsApi.getAll())
              .then((brandsData) => {
                _setClientBrands(brandsData);
                if (!isBrand) {
                  _setBrands(brandsData.map(b => b.name));
                }
              })
              .catch((err) => handleQuotaError(err, "client_brands")),
          );
        } else {
          loadTasks.push(
            clientBrandsApi.getPublicNames()
              .then((names) => _setBrands(names)) // Overwrite global brands list with active client brands
              .catch((err) => handleQuotaError(err, "client_brands")),
          );
        }

        // 5. client_leads
        if (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.clientLeads)) {
          loadTasks.push(
            clientLeadsApi
              .getAll()
              .then(_setClientLeads)
              .catch((err) => handleQuotaError(err, "client_leads")),
          );
        }

        // 6. schedules
        if (
          isHost ||
          isBrand ||
          (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.schedules))
        ) {
          loadTasks.push(
            schedulesApi
              .getAll(
                isHost
                  ? { hostId: loggedInHostId }
                  : isBrand
                    ? { brandId: loggedInClientBrandId }
                    : undefined,
              )
              .then(_setSchedules)
              .catch((err) => handleQuotaError(err, "schedules")),
          );
        }

        // 7. alerts
        if (isAdminOrOperator && canLoad(...MODULE_TAB_REQUIREMENTS.alerts)) {
          loadTasks.push(
            alertsApi
              .getAll()
              .then((data) => {
                // alerts state akan di-set jika ada state untuk itu
                // jika tidak ada, ignore saja
                return data;
              })
              .catch(console.error),
          );
        }

        // 8. brand performance logs + upload history (untuk reporting)
        if (isAdminOrOperator || isBrand) {
          loadTasks.push(
            reportingBrandApi
              .getAll(isBrand ? { brandId: loggedInClientBrandId } : undefined)
              .then(({ batches, rows }) => {
                if (!cancelled) {
                  setBrandPerformanceLogs(rows);
                  setBrandUploadHistory(batches);
                  setUploadHistory(batches);
                }
              })
              .catch((err) => handleQuotaError(err, "brand_reporting")),
          );
        }

        // Global configs — load dari MySQL (dengan fallback ke localStorage)
        loadTasks.push(
          settingsApi
            .get<GlobalConfigData | string>("liva_global_configs")
            .then((mysqlData) => {
              let data = parseNestedJsonValue<GlobalConfigData>(mysqlData);

              if (
                !data ||
                Object.keys(data).length === 0 ||
                typeof data !== "object"
              ) {
                // fallback to localStorage jika MySQL kosong
                const storedConfig = localStorage.getItem(
                  "liva_global_configs",
                );
                if (storedConfig) {
                  const parsedStoredConfig =
                    parseNestedJsonValue<GlobalConfigData>(storedConfig);

                  if (parsedStoredConfig) {
                    data = parsedStoredConfig;
                    // Do NOT aggressively save fallback to MySQL to avoid overwriting during temporary disconnects
                  }
                } else {
                  // Seed default global configs
                  const defaults = DEFAULT_GLOBAL_CONFIG;
                  data = defaults;
                  localStorage.setItem(
                    "liva_global_configs",
                    JSON.stringify(defaults),
                  );
                  // Do NOT aggressively save defaults to MySQL to avoid overwriting
                }
              } else {
                // MySQL has data, save to localStorage for offline cache
                localStorage.setItem("liva_global_configs", JSON.stringify(data));
              }

              // Set all the states
              const configData =
                data && typeof data === "object"
                  ? (data as GlobalConfigData)
                  : null;

              if (configData) {
                // if (Array.isArray(configData.brands)) _setBrands(configData.brands); // Obsolete, replaced by client_brands
                if (Array.isArray(configData.shifts)) _setShifts(configData.shifts);
                if (Array.isArray(configData.studios)) _setStudios(configData.studios);
                if (Array.isArray(configData.platforms)) _setPlatforms(configData.platforms);
                if (typeof configData.agencyLogoUrl === "string")
                  _setAgencyLogoUrl(configData.agencyLogoUrl);
                if (configData.salarySettings) setSalarySettings(configData.salarySettings);
                if (configData.adminShiftChecklistObj)
                  setAdminShiftChecklistObj(configData.adminShiftChecklistObj);
              }
            })
            .catch((err) => {
              console.error("Error loading global configs:", err);
              setGlobalConfigFetchFailed(true);
            }),
        );

        await Promise.allSettled(loadTasks);

      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        if (!cancelled) {
          setIsGlobalConfigsLoaded(true);
          setIsLogsLoading(false);
        }
      }
    };

    loadAll();

    // Tidak ada unsubscribe karena tidak ada listener real-time
    return () => {
      cancelled = true;
    };

  }, [isAuthReady, loggedInHostId, loggedInAdminId, isOperatorLoggedIn, loggedInClientBrandId, authSession]);

  const setHosts = useCallback((action: React.SetStateAction<HostEmployee[]>) => {
    _setHosts((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: HostEmployee[]) => HostEmployee[])(prev)
          : action;
      return next;
    });
  }, []);

  const setLogs = useCallback((action: React.SetStateAction<AttendanceLog[]>) => {
    _setLogs((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: AttendanceLog[]) => AttendanceLog[])(prev)
          : action;
      return next;
    });
  }, []);

  const setClientBrands = useCallback(
    (action: React.SetStateAction<ClientBrand[]>) => {
    _setClientBrands((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: ClientBrand[]) => ClientBrand[])(prev)
          : action;
      return next;
    });
  }, []);

  const setClientLeads = useCallback((action: React.SetStateAction<ClientLead[]>) => {
    _setClientLeads((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: ClientLead[]) => ClientLead[])(prev)
          : action;
      return next;
    });
  }, []);

  // Modal States
  const [brandFormEditor, setBrandFormEditor] =
    useState<Partial<ClientBrand> | null>(null);
  const [brandFormTab, setBrandFormTab] = useState<"basic" | "sessions" | "accounts">("basic");
  const [brandInvoiceModalInfo, setBrandInvoiceModalInfo] =
    useState<ClientBrand | null>(null);
  const [reportFormModal, setReportFormModal] = useState<{
    isOpen: boolean;
    data: Partial<ClientReporting>;
  }>({ isOpen: false, data: {} });
  const [leadFormModal, setLeadFormModal] = useState<{
    isOpen: boolean;
    data: Partial<ClientLead>;
  }>({ isOpen: false, data: {} });
  const [leadSearchQuery, setLeadSearchQuery] = useState("");

  // --- SCHEDULES SYSTEM FOR HOST WORKING CALENDAR ---
  const [schedules, _setSchedules] = useState<ShiftSchedule[]>([]);

  const setSchedules = useCallback((action: React.SetStateAction<ShiftSchedule[]>) => {
    _setSchedules((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: ShiftSchedule[]) => ShiftSchedule[])(prev)
          : action;
      return next;
    });
  }, []);

  // --- ACCESS ROLE STATE ---
  // Default to "host" to prioritize testing their submission, "operator", or "client"
  const defaultRole = initRoleMatch
    ? initRoleMatch[1] === "admin"
      ? "operator"
      : initRoleMatch[1] === "brand"
        ? "client"
        : "host"
    : null;
  const [activeRole, setActiveRole] = useState<
    "host" | "operator" | "client" | null
  >(defaultRole);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/\/login\/(admin|host|brand)/);
      if (match) {
        const role =
          match[1] === "admin"
            ? "operator"
            : match[1] === "brand"
              ? "client"
              : "host";
        setActiveRole(role);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Client portal session & inputs
  const [clientLoginBrandId, setClientLoginBrandId] = useState<string>("");
  const [clientLoginUsername, setClientLoginUsername] = useState<string>("");
  const [clientLoginPass, setClientLoginPass] = useState<string>("");
  const [brandPerformanceLogs, setBrandPerformanceLogs] = useState<
    BrandPerformanceLogEntry[]
  >([]);
  const [isLogsLoading, setIsLogsLoading] = useState<boolean>(true);
  const [brandUploadHistory, setBrandUploadHistory] = useState<
    UploadHistoryEntry[]
  >([]);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [clientDateFilterType, setClientDateFilterType] = useState<
    "latest" | "all" | "month" | "weekly" | "custom"
  >("latest");
  const [clientSelectedLatestDate, setClientSelectedLatestDate] =
    useState("");
  const [clientCustomStartDate, setClientCustomStartDate] = useState("");
  const [clientCustomEndDate, setClientCustomEndDate] = useState("");
  const [clientTempStartDate, setClientTempStartDate] = useState("");
  const [clientTempEndDate, setClientTempEndDate] = useState("");
  const [isClientMonthOpen, setIsClientMonthOpen] = useState(false);
  const [isClientCalendarOpen, setIsClientCalendarOpen] = useState(false);
  const [clientPlatformFilter, setClientPlatformFilter] =
    useState("TikTok Live");
  const [clientReportingTab, setClientReportingTab] = useState<
    "live" | "engagement" | "product"
  >("live");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [clientSelectedMonth, setClientSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [clientMonthPickerYear, setClientMonthPickerYear] = useState<number>(
    () => new Date().getFullYear(),
  );


  const [operatorDateFilterType, setOperatorDateFilterType] = useState<ReportDateFilterType>("latest");
  const [operatorSelectedLatestDate, setOperatorSelectedLatestDate] =
    useState("");
  const [operatorPlatformFilter, setOperatorPlatformFilter] =
    useState("TikTok Live");
  const [operatorShiftFilters, setOperatorShiftFilters] = useState<string[]>(
    [],
  );
  const [isShiftFilterOpen, setIsShiftFilterOpen] = useState(false);
  const [operatorCustomStartDate, setOperatorCustomStartDate] = useState("");
  const [operatorCustomEndDate, setOperatorCustomEndDate] = useState("");
  const [operatorSelectedMonth, setOperatorSelectedMonth] = useState<string>(
    () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    },
  );
  const [operatorMonthPickerYear, setOperatorMonthPickerYear] =
    useState<number>(() => new Date().getFullYear());
  const [isOperatorMonthOpen, setIsOperatorMonthOpen] = useState(false);
  const [operatorCalendarYear, setOperatorCalendarYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [operatorCalendarMonth, setOperatorCalendarMonth] = useState<number>(
    () => new Date().getMonth() + 1,
  );
  const [isOperatorCalendarOpen, setIsOperatorCalendarOpen] = useState(false);
  const [operatorTempStartDate, setOperatorTempStartDate] = useState("");
  const [operatorTempEndDate, setOperatorTempEndDate] = useState("");
  const [hoveredCalendarDate, setHoveredCalendarDate] = useState("");
  const [trendFilters, setTrendFilters] = useState({ gmv: true, views: true });

  const handleClientDateFilterSelect = (
    value: ReportDateFilterType,
  ) => {
    setClientSelectedLatestDate("");
    applyDateFilterSelection({
      value,
      setFilterType: setClientDateFilterType,
      setMonthOpen: setIsClientMonthOpen,
      setCalendarOpen: setIsClientCalendarOpen,
      setTempStartDate: setClientTempStartDate,
      setTempEndDate: setClientTempEndDate,
      currentStartDate: clientCustomStartDate,
      currentEndDate: clientCustomEndDate,
    });
  };

  const handleOperatorDateFilterSelect = (
    value: ReportDateFilterType,
  ) => {
    if (value !== "latest") {
      setOperatorSelectedLatestDate("");
    }
    applyDateFilterSelection({
      value,
      setFilterType: setOperatorDateFilterType,
      setMonthOpen: setIsOperatorMonthOpen,
      setCalendarOpen: setIsOperatorCalendarOpen,
      setTempStartDate: setOperatorTempStartDate,
      setTempEndDate: setOperatorTempEndDate,
      currentStartDate: operatorCustomStartDate,
      currentEndDate: operatorCustomEndDate,
    });
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
      sessionStorage.setItem(
        "mcn_logged_in_client_brand_id",
        loggedInClientBrandId,
      );
    } else {
      sessionStorage.removeItem("mcn_logged_in_client_brand_id");
    }
  }, [loggedInClientBrandId]);

  // Custom states for Selected Host (Perspective of the logged-in Host)
  const [selectedHostId, setSelectedHostId] = useState<string>(() => {
    return hosts[0]?.id || "";
  });

  const [hostActiveSubTab, setHostActiveSubTab] = useState<
    "form" | "history" | "calendar"
  >("form");

  // Host credentials & login sessions
  useEffect(() => {
    if (loggedInHostId) {
      sessionStorage.setItem("mcn_logged_in_host_id", loggedInHostId);
    } else {
      sessionStorage.removeItem("mcn_logged_in_host_id");
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
  const [adminAccounts, _setAdminAccounts] = useState<AdminAccount[]>([]);
  const setAdminAccounts = useCallback(
    (action: React.SetStateAction<AdminAccount[]>) => {
    _setAdminAccounts((prev) => {
      const next =
        typeof action === "function"
          ? (action as (prevState: AdminAccount[]) => AdminAccount[])(prev)
          : action;
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      // Admin accounts seeding is handled in the backend now, do not push localstorage
      localStorage.removeItem("mcn_admin_accounts");
    } catch {}
  }, []);

  useEffect(() => {
    if (loggedInAdminId)
      sessionStorage.setItem("mcn_logged_in_admin_id", loggedInAdminId);
    else sessionStorage.removeItem("mcn_logged_in_admin_id");
  }, [loggedInAdminId]);

  // STATE ADMIN AKUN TAMBAHAN
  const [showAdminAccountForm, setShowAdminAccountForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminUser, setNewAdminUser] = useState("");
  const [newAdminPass, setNewAdminPass] = useState("");
  const [newAdminAccess, setNewAdminAccess] = useState<string[]>([]);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.setItem(
      "mcn_is_operator_logged_in",
      isOperatorLoggedIn ? "true" : "false",
    );
  }, [isOperatorLoggedIn]);

  // Temp form input states for Operator Login
  const [opLoginUser, setOpLoginUser] = useState("");
  const [opLoginPass, setOpLoginPass] = useState("");
  const [opError, setOpError] = useState("");

  // Cybersecurity & Admin Privacy states
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  // States for Adding New Host
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHostName, setNewHostName] = useState("");
  const [newHostRole, setNewHostRole] = useState("Reguler Host");
  const [newHostStudio, setNewHostStudio] = useState("Bandar Lampung");
  const [newHostPhone, setNewHostPhone] = useState("");
  const [newHostBank, setNewHostBank] = useState("");
  const [newHostBankName, setNewHostBankName] = useState("");
  const [newHostUser, setNewHostUser] = useState("");
  const [newHostPass, setNewHostPass] = useState("");
  const [newHostWorkingDaysTarget, setNewHostWorkingDaysTarget] =
    useState<number>(26);

  const handleUpdateHost = async (
    hostId: string,
    updatedFields: Partial<HostEmployee>,
  ) => {
    const normalizedFields =
      typeof updatedFields.studio === "string"
        ? {
            ...updatedFields,
            studio: normalizeHostStudioLocation(updatedFields.studio),
          }
        : updatedFields;

    const hostToUpdate = hosts.find((h) => h.id === hostId);
    if (!hostToUpdate) return;

    const finalHost = { ...hostToUpdate, ...normalizedFields };

    try {
      if (typeof hostsApi !== "undefined" && hostsApi.update) {
        await hostsApi.update(hostId, finalHost);
      }
      setHosts((prev) =>
        prev.map((h) => {
          if (h.id === hostId) {
            return finalHost;
          }
          return h;
        }),
      );
      customAlert("Data host berhasil diperbarui di database!");
    } catch (error) {
      console.error("Gagal update host:", error);
      customAlert("Gagal memperbarui data host ke server.");
    }
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
          if (w > h) {
            h *= MAX_SIZE / w;
            w = MAX_SIZE;
          } else {
            w *= MAX_SIZE / h;
            h = MAX_SIZE;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        handleUpdateHost(hostId, { avatar: dataUrl });
      };
      if (typeof reader.result === "string") {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddHost = async (newHostData: {
    name: string;
    role: string;
    phone: string;
    bankAccount: string;
    bankName: string;
    studio?: string;
    username?: string;
    password?: string;
    customWorkingDaysTarget?: number;
  }) => {
    const nextIdNum =
      hosts.length > 0
        ? Math.max(
            ...hosts.map((h) => {
              const parsed = parseInt((h.id || "").replace("h", ""));
              return isNaN(parsed) ? 0 : parsed;
            }),
          ) + 1
        : 1;
    const id = `h${nextIdNum}`;
    const employeeId = `EMP-26-${String(nextIdNum).padStart(3, "0")}`;
    const joinedDate = new Date().toISOString().split("T")[0];

    const newHost: HostEmployee = {
      id,
      employeeId,
      name: newHostData.name,
      avatar: getAvatarUrl(newHostData.name),
      role: newHostData.role,
      hostType: newHostData.role.toLowerCase().includes("back up")
        ? "Backup"
        : "Reguler",
      studio: normalizeHostStudioLocation(newHostData.studio) || "Bandar Lampung",
      phone: newHostData.phone || "+62 812-0000-0000",
      bankAccount: newHostData.bankAccount || "-",
      username: (
        newHostData.username ||
        newHostData.name.toLowerCase().replace(/\s+/g, "")
      ).trim(),
      password: (newHostData.password || "liva123").trim(),
      hasPassword: true,
      platforms: ["TikTok Live", "Shopee Live"],
      brands: ["Wardah", "Somethinc"],
      baseMonthlyTargetHours: 80,
      baseMonthlyTargetRevenue: 120000000,
      consistencyScore: 100,
      joinedDate,
      email: `${(newHostData.username || newHostData.name.toLowerCase().replace(/\s+/g, "")).trim()}@livaagency.com`,
      customWorkingDaysTarget: newHostData.customWorkingDaysTarget,
    };

    try {
      if (typeof hostsApi !== "undefined" && hostsApi.create) {
        const res = await hostsApi.create(newHost);
        if (res && res.id && res.id !== id) {
          newHost.id = res.id;
        }
      }
      setHosts((prev) => [...prev, newHost]);
      customAlert(`Host "${newHost.name}" berhasil didaftarkan ke sistem!`);
    } catch (error) {
      console.error("Gagal mendaftarkan host:", error);
      customAlert("Gagal mendaftarkan host ke server.");
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    if (hosts.length <= 1) {
      customAlert("Gagal! Harus ada minimal 1 Host di sistem.");
      return;
    }
    const hostToDelete = hosts.find((h) => h.id === hostId);

    try {
      if (typeof hostsApi !== "undefined" && hostsApi.delete) {
        await hostsApi.delete(hostId);
      }
      setHosts((prev) => prev.filter((h) => h.id !== hostId));
      customAlert(`Host "${hostToDelete?.name || hostId}" berhasil dihapus.`);

      // Safety check: if host logged in, logout
      if (loggedInHostId === hostId) {
        handleLogout();
      }
    } catch (error) {
      console.error("Gagal menghapus host:", error);
      customAlert("Gagal menghapus host dari server.");
    }
  };

  // Current logged in host details
  const activeHostObj = useMemo(() => {
    return hosts.find((h) => h.id === selectedHostId) || hosts[0];
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
    day: "numeric",
  });

  const formattedLiveTime = liveTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // --- HOST FUNCTIONALITIES & FORM STATE ---
  const [hostForm, setHostForm] = useState(() => ({
    brand: "",
    platform: "",
    shift: "",
    studio: "",
  }));

  useEffect(() => {
    if (activeHostObj) {
      setHostForm((prev) => ({
        ...prev,
        brand: activeHostObj.brands && activeHostObj.brands.length === 1 && !prev.brand ? activeHostObj.brands[0] : prev.brand,
        platform: activeHostObj.platforms && activeHostObj.platforms.length === 1 && !prev.platform ? activeHostObj.platforms[0] : prev.platform,
        studio: activeHostObj.studio && !prev.studio 
          ? (() => {
              const st = studios.find(s => s.name === activeHostObj.studio);
              return st ? `${st.name} - ${st.location}` : "";
            })()
          : prev.studio,
      }));
    }
  }, [activeHostObj, studios]);

  const [hostFormError, setHostFormError] = useState("");
  const [showLateAlert, setShowLateAlert] = useState(false);
  const [lateCheckInDetails, setLateCheckInDetails] = useState<{
    time: string;
    shift: string;
    diffMinutes: number;
  } | null>(null);

  const [showFormSuccess, setShowFormSuccess] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState("");

  const handleHostAttendanceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!activeHostObj) return;

    if (
      !hostForm.brand ||
      !hostForm.platform ||
      !hostForm.shift ||
      !hostForm.studio
    ) {
      setHostFormError(
        "Harap lengkapi semua rincian absen (Brand, Platform, Shift, dan Studio) terlebih dahulu!",
      );
      return;
    }

    const todayDateStr = new Date().toISOString().split("T")[0];
    const nowObj = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    const exactCheckInTime = `${pad(nowObj.getHours())}:${pad(nowObj.getMinutes())}:${pad(nowObj.getSeconds())}`;
    const currentTimeStr = `${pad(nowObj.getHours())}:${pad(nowObj.getMinutes())}:${pad(nowObj.getSeconds())}`;

    // Determine attendance status automatically
    let status: "Present" | "Late" = "Present";
    const cleanShift = hostForm.shift.replace(/\s+/g, "");

    // Find ranges like HH.MM-HH.MM or HH:MM-HH:MM
    let parsedStart: { hour: number; minute: number } | null = null;
    const rangeMatch = cleanShift.match(/(\d{1,2})[:.](\d{2})[-–—]/);
    if (rangeMatch) {
      parsedStart = {
        hour: parseInt(rangeMatch[1], 10),
        minute: parseInt(rangeMatch[2], 10),
      };
    } else {
      const singleMatch = cleanShift.match(/(\d{1,2})[:.](\d{2})/);
      if (singleMatch) {
        parsedStart = {
          hour: parseInt(singleMatch[1], 10),
          minute: parseInt(singleMatch[2], 10),
        };
      }
    }

    if (parsedStart) {
      const currentHour = nowObj.getHours();
      const currentMinute = nowObj.getMinutes();
      const currentSecond = nowObj.getSeconds();

      const startTotalMin = parsedStart.hour * 60 + parsedStart.minute;
      const currTotalMin = currentHour * 60 + currentMinute;
      let diffMin = currTotalMin - startTotalMin;

      // Handle 24-hour wrap-around (e.g. shift starts at 22:00, checking in at 01:00 the next day)
      if (diffMin < -720) {
        diffMin += 1440;
      } else if (diffMin > 720) {
        diffMin -= 1440;
      }

      if (diffMin > 0 || (diffMin === 0 && currentSecond > 0)) {
        status = "Late";
        setLateCheckInDetails({
          time: exactCheckInTime,
          shift: hostForm.shift,
          diffMinutes: diffMin,
        });
        setShowLateAlert(true);
      } else {
        setShowLateAlert(false);
        setLateCheckInDetails(null);
      }
    } else {
      setShowLateAlert(false);
      setLateCheckInDetails(null);
    }

    // Auto calculate random metrics for streaming session metrics (orders, conversion, revenue)
    const randomOrders = Math.floor(Math.random() * 250) + 80;
    const randomConversion = parseFloat((Math.random() * 3 + 2.5).toFixed(2)); // 2.5% to 5.5%
    const randomEngagement = parseFloat((Math.random() * 5 + 6.0).toFixed(2)); // 6% to 11%
    const randomAvgViewDuration = Math.floor(Math.random() * 120 + 40); // 40 to 160 seconds
    const randomRevenue =
      randomOrders * (Math.floor(Math.random() * 50000) + 40000); // ~IDR 6M - 15M

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
      checkInTime: exactCheckInTime,
      revenueGenerated: randomRevenue,
      conversionRate: randomConversion,
      engagementRate: randomEngagement,
      avgViewDuration: randomAvgViewDuration,
      orders: randomOrders,
    };

    try {
      if (typeof logsApi !== "undefined" && logsApi.create) {
        await logsApi.create(newLog);
      }
      setLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      console.error("Gagal menyimpan log:", error);
      customAlert("Gagal menyimpan data absensi ke server.");
      return;
    }
    
    addNotification(
      `⏰ Absensi Streamer: ${newLog.hostName}`,
      `Host "${newLog.hostName}" melakukan absen siaran di "${newLog.studio}" untuk brand "${newLog.brandHandled}" (${status === "Present" ? "Tepat Waktu" : "Terlambat"} - pukul ${exactCheckInTime}).`,
      status === "Present" ? "success" : "warning",
      "database",
    );
    setHostFormError("");
    setShowFormSuccess(true);
    setSubmittedMessage(
      `Absen Berhasil disubmit! Diinput otomatis pada jam ${currentTimeStr} (${status === "Present" ? "Tepat Waktu" : "Terlambat"})`,
    );

    // Reset form fields back to empty (unselected/default)
    setHostForm({
      brand: "",
      platform: "",
      shift: "",
      studio: "",
    });

    // Auto reset success notification banner after 6 seconds
    setTimeout(() => {
      setShowFormSuccess(false);
    }, 6000);
  };

  // (Host personal analytics states relocated after salarySettings declaration to prevent block-scoped reference error)

  // --- OPERATOR SYSTEM CONSTANTS & SALARY RECAP ---
  const [operatorTab, setOperatorTab] = useState<
    | "dashboard_utama"
    | "absensi"
    | "rekap_gaji"
    | "database"
    | "credentials"
    | "settings"
    | "data_brand"
    | "reporting_brand"
    | "leads"
    | "admin_privacy"
    | "invoice"
  >("dashboard_utama");
  const [operatorReportingTab, setOperatorReportingTab] = useState<
    "live" | "product" | "engagement"
  >("live");
  const [brandDataTab, setBrandDataTab] = useState<"active" | "inactive">(
    "active",
  );
  const [liveChartSelectedMetrics, setLiveChartSelectedMetrics] = useState<
    string[]
  >(["gmv", "orders", "penonton"]);
  const [engagementChartSelectedMetrics, setEngagementChartSelectedMetrics] =
    useState<string[]>(["errRateNumeric", "uniqueViewers"]);
  const [activeReportBrandId, setActiveReportBrandId] = useState<string | null>(
    null,
  );
  const [reportBrandSearchQuery, setReportBrandSearchQuery] = useState("");
  const [reportBrandPlatformFilter, setReportBrandPlatformFilter] =
    useState("Semua Platform");
  const [reportBrandStatusFilter, setReportBrandStatusFilter] =
    useState("Semua Status");
  const [reportBrandSortKey, setReportBrandSortKey] = useState<
    "latest_activity" | "gmv" | "sessions" | "uploads" | "name"
  >("latest_activity");
  const [reportBrandPage, setReportBrandPage] = useState(1);
  const [openBrandCardActionsId, setOpenBrandCardActionsId] = useState<
    string | null
  >(null);
  const handleOpenReportBrand = (brandId: string) => {
    setActiveReportBrandId(brandId);
    setSaveTargetBrandId(brandId);
    setAdminReportBrandFilter(brandId);
    setOpenBrandCardActionsId(null);
  };
  const handleToggleBrandCardActions = (brandId: string) => {
    setOpenBrandCardActionsId((prev) => (prev === brandId ? null : brandId));
  };
  const [reportDbSearchQuery, setReportDbSearchQuery] = useState("");

  const clientLiveReportView = useMemo(
    () =>
      buildLiveReportViewModel({
        brandPerformanceLogs,
        activeReportBrandId: loggedInClientBrandId || "",
        dateFilterType: clientDateFilterType,
        selectedLatestDate: clientSelectedLatestDate,
        selectedMonth: clientSelectedMonth,
        customStartDate: clientCustomStartDate,
        customEndDate: clientCustomEndDate,
        searchQuery: reportDbSearchQuery,
        platformFilter: clientPlatformFilter,
        shiftFilters: operatorShiftFilters,
      }),
    [
      loggedInClientBrandId,
      brandPerformanceLogs,
      clientCustomEndDate,
      clientCustomStartDate,
      clientDateFilterType,
      clientPlatformFilter,
      clientSelectedMonth,
      clientSelectedLatestDate,
      operatorShiftFilters,
      reportDbSearchQuery,
    ],
  );

  const clientEngagementReportView = useMemo(
    () =>
      buildEngagementReportViewModel({
        brandPerformanceLogs,
        activeReportBrandId: loggedInClientBrandId || "",
        operatorDateFilterType: clientDateFilterType,
        selectedLatestDate: clientSelectedLatestDate,
        operatorPlatformFilter: clientPlatformFilter,
        operatorShiftFilters: operatorShiftFilters,
        operatorSelectedMonth: clientSelectedMonth,
        operatorCustomStartDate: clientCustomStartDate,
        operatorCustomEndDate: clientCustomEndDate,
      }),
    [
      loggedInClientBrandId,
      brandPerformanceLogs,
      clientCustomEndDate,
      clientCustomStartDate,
      clientDateFilterType,
      clientPlatformFilter,
      clientSelectedMonth,
      clientSelectedLatestDate,
      operatorShiftFilters,
    ],
  );

  const [shopeeSkuLogs, setShopeeSkuLogs] = useState<SkuLogEntry[]>([]);

  const clientProductReportView = useMemo(
    () =>
      buildProductPerformanceViewModel({
        shopeeSkuLogs,
        brandPerformanceLogs,
        activeReportBrandId: loggedInClientBrandId || "",
        operatorDateFilterType: clientDateFilterType,
        selectedLatestDate: clientSelectedLatestDate,
        operatorCustomStartDate: clientCustomStartDate,
        operatorCustomEndDate: clientCustomEndDate,
        operatorSelectedMonth: clientSelectedMonth,
        operatorPlatformFilter: clientPlatformFilter,
        operatorShiftFilters: operatorShiftFilters,
        reportDbSearchQuery,
      }),
    [
      shopeeSkuLogs,
      brandPerformanceLogs,
      loggedInClientBrandId,
      clientDateFilterType,
      clientSelectedLatestDate,
      clientCustomStartDate,
      clientCustomEndDate,
      clientSelectedMonth,
      clientPlatformFilter,
      operatorShiftFilters,
      reportDbSearchQuery,
    ],
  );

  const [reportDbSortCol, setReportDbSortCol] = useState("date");
  const [reportDbSortAsc, setReportDbSortAsc] = useState(false);
  const [skuSortCol, setSkuSortCol] = useState<"sold" | "revenue">("sold");
  const [skuSortAsc, setSkuSortAsc] = useState(false);
  const [rawDateSortAsc, setRawDateSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const availableOperatorPlatforms = useMemo(
    () =>
      getAvailablePlatformsForBrand(
        activeReportBrandId || "",
        brandPerformanceLogs,
        platforms,
      ),
    [activeReportBrandId, brandPerformanceLogs, platforms],
  );

  const availableClientPlatforms = useMemo(
    () =>
      getAvailablePlatformsForBrand(
        loggedInClientBrandId || "",
        brandPerformanceLogs,
        platforms,
      ),
    [loggedInClientBrandId, brandPerformanceLogs, platforms],
  );

  const prevActiveReportBrandIdRef = useRef("");
  useEffect(() => {
    if (activeReportBrandId && activeReportBrandId !== prevActiveReportBrandIdRef.current && brandPerformanceLogs.length > 0) {
      const logs = brandPerformanceLogs.filter((log) => log.brandId === activeReportBrandId);
      if (logs.length > 0) {
        setOperatorPlatformFilter(selectMostUsedPlatform(logs));
        prevActiveReportBrandIdRef.current = activeReportBrandId;
      }
    }
  }, [activeReportBrandId, brandPerformanceLogs]);

  const prevLoggedInClientBrandIdRef = useRef("");
  useEffect(() => {
    if (loggedInClientBrandId && loggedInClientBrandId !== prevLoggedInClientBrandIdRef.current && brandPerformanceLogs.length > 0) {
      const logs = brandPerformanceLogs.filter((log) => log.brandId === loggedInClientBrandId);
      if (logs.length > 0) {
        setClientPlatformFilter(selectMostUsedPlatform(logs));
        prevLoggedInClientBrandIdRef.current = loggedInClientBrandId;
      }
    }
  }, [loggedInClientBrandId, brandPerformanceLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    operatorDateFilterType,
    reportDbSearchQuery,
    operatorCustomStartDate,
    operatorCustomEndDate,
    activeReportBrandId,
  ]);

  const availableReportBrandPlatforms = useMemo(() => {
    const defaults = ["Shopee Live", "TikTok Live"];
    const platformsFromLogs = Array.from(
      new Set(
        brandPerformanceLogs
          .map((log) => log.platform)
          .filter((platform): platform is string => Boolean(platform)),
      ),
    );
    const preferred = defaults.filter((platform) =>
      platformsFromLogs.includes(platform),
    );
    return preferred.length > 0
      ? preferred
      : platformsFromLogs.length > 0
        ? platformsFromLogs
        : defaults;
  }, [brandPerformanceLogs]);

  const { overviewStats: reportBrandOverviewStats, rows: filteredReportBrandRows } = useMemo(
    () =>
      buildReportBrandSummary({
        clientBrands,
        brandPerformanceLogs,
        brandUploadHistory,
        reportBrandSearchQuery,
        reportBrandPlatformFilter,
        reportBrandStatusFilter,
        reportBrandSortKey,
      }),
    [
      brandPerformanceLogs,
      brandUploadHistory,
      clientBrands,
      reportBrandPlatformFilter,
      reportBrandSearchQuery,
      reportBrandSortKey,
      reportBrandStatusFilter,
    ],
  );

  const totalReportBrandPages = Math.max(
    1,
    Math.ceil(filteredReportBrandRows.length / 9),
  );
  const visibleReportBrandRows = filteredReportBrandRows.slice(
    (reportBrandPage - 1) * 9,
    reportBrandPage * 9,
  );

  const activeReportBrandUploadHistory = useMemo(
    () =>
      buildActiveReportBrandUploadHistory({
        activeReportBrandId: activeReportBrandId || "",
        brandPerformanceLogs,
        brandUploadHistory,
        uploadHistory,
      }),
    [activeReportBrandId, brandPerformanceLogs, brandUploadHistory, uploadHistory],
  );

  const liveReportView = useMemo(
    () =>
      buildLiveReportViewModel({
        brandPerformanceLogs,
        activeReportBrandId: activeReportBrandId || "",
        dateFilterType: operatorDateFilterType,
        selectedLatestDate: operatorSelectedLatestDate,
        selectedMonth: operatorSelectedMonth,
        customStartDate: operatorCustomStartDate,
        customEndDate: operatorCustomEndDate,
        searchQuery: reportDbSearchQuery,
        platformFilter: operatorPlatformFilter,
        shiftFilters: operatorShiftFilters,
      }),
    [
      activeReportBrandId,
      brandPerformanceLogs,
      operatorCustomEndDate,
      operatorCustomStartDate,
      operatorDateFilterType,
      operatorPlatformFilter,
      operatorSelectedMonth,
      operatorSelectedLatestDate,
      operatorShiftFilters,
      reportDbSearchQuery,
    ],
  );

  const handleOperatorLatestDateShift = (
    direction: -1 | 1,
    logs: readonly { date?: string; platform?: string }[],
  ) => {
    const availableDates = getAvailableReportDates({
      logs,
      platformFilter: operatorPlatformFilter,
    });
    if (availableDates.length === 0) return;
    const nextDate = shiftAvailableReportDate({
      logs,
      platformFilter: operatorPlatformFilter,
      currentDate:
        operatorSelectedLatestDate ||
        availableDates[availableDates.length - 1] ||
        "",
      direction,
    });
    if (!nextDate) return;
    setOperatorSelectedLatestDate(nextDate);
    setOperatorDateFilterType("latest");
  };

  const engagementReportView = useMemo(
    () =>
      buildEngagementReportViewModel({
        brandPerformanceLogs,
        activeReportBrandId: activeReportBrandId || "",
        operatorDateFilterType,
        selectedLatestDate: operatorSelectedLatestDate,
        operatorPlatformFilter,
        operatorShiftFilters,
        operatorSelectedMonth,
        operatorCustomStartDate,
        operatorCustomEndDate,
      }),
    [
      activeReportBrandId,
      brandPerformanceLogs,
      operatorCustomEndDate,
      operatorCustomStartDate,
      operatorDateFilterType,
      operatorPlatformFilter,
      operatorSelectedMonth,
      operatorSelectedLatestDate,
      operatorShiftFilters,
    ],
  );

  useEffect(() => {
    setReportBrandPage(1);
  }, [
    reportBrandSearchQuery,
    reportBrandPlatformFilter,
    reportBrandStatusFilter,
    reportBrandSortKey,
  ]);

  const [dayAnalyticsSortCol, setDayAnalyticsSortCol] = useState<
    "name" | "gmv" | "views"
  >("gmv");
  const [dayAnalyticsSortAsc, setDayAnalyticsSortAsc] = useState(false);

  // --- NOTIFICATION ENGINE ---
  const [notifications, _setNotifications] = useState<NotificationItem[]>([]);

  const setNotifications = useCallback(
    (action: React.SetStateAction<NotificationItem[]>) => {
      _setNotifications((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prevState: NotificationItem[]) => NotificationItem[])(prev)
            : action;
        return next;
      });
    },
    [],
  );

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const addNotification = useCallback(
    (
      title: string,
      description: string,
      type: "success" | "info" | "warning" | "danger" | "error",
      actionTab?: string,
    ) => {
      setNotifications((prev) => {
        return prependCappedNotification(
          prev,
          {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title,
            description,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            actionTab,
          },
          40,
        );
      });
    },
    [setNotifications],
  );

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => markAllAsRead(prev));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => removeNotification(prev, id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // --- HOST NOTIFICATION ENGINE ---
  const [hostNotifications, _setHostNotifications] = useState<HostNotificationItem[]>([]);

  const setHostNotifications = useCallback(
    (action: React.SetStateAction<HostNotificationItem[]>) => {
      _setHostNotifications((prev) => {
        const next =
          typeof action === "function"
            ? (action as (prevState: HostNotificationItem[]) => HostNotificationItem[])(prev)
            : action;
        return next;
      });
    },
    [],
  );

  const [isHostNotificationOpen, setIsHostNotificationOpen] = useState(false);

  const addHostNotification = useCallback(
    (hostId: string, title: string, message: string, dateStr: string) => {
      setHostNotifications((prev) => {
        const newNotif = {
          id: `hnotif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          hostId,
          title,
          message,
          date: dateStr,
          createdAt: new Date().toISOString(),
          read: false,
        };
        return [newNotif, ...prev].slice(0, 50); // cap at 50
      });
    },
    [setHostNotifications],
  );

  const markHostNotificationsAsRead = (hostId: string) => {
    setHostNotifications((prev) => markHostNotificationsAsReadList(prev, hostId));
  };

  const [reportingRawData, setReportingRawData] = useState<ReportingRawRow[]>(
    [],
  );
  const reportingUploadSummary = useMemo(
    () => buildReportingUploadSummary(reportingRawData),
    [reportingRawData],
  );
  const [skuRawData, setSkuRawData] = useState<SkuRawRow[]>([]);
  const productReportView = useMemo(
    () =>
      buildProductPerformanceViewModel({
        shopeeSkuLogs,
        brandPerformanceLogs,
        activeReportBrandId: activeReportBrandId || "",
        operatorDateFilterType,
        selectedLatestDate: operatorSelectedLatestDate,
        operatorCustomStartDate,
        operatorCustomEndDate,
        operatorSelectedMonth,
        operatorPlatformFilter,
        operatorShiftFilters,
        reportDbSearchQuery,
      }),
    [
      activeReportBrandId,
      brandPerformanceLogs,
      operatorCustomEndDate,
      operatorCustomStartDate,
      operatorDateFilterType,
      operatorPlatformFilter,
      operatorSelectedMonth,
      operatorSelectedLatestDate,
      operatorShiftFilters,
      reportDbSearchQuery,
      shopeeSkuLogs,
    ],
  );

  const operatorWorkspaceDateLogs = useMemo(() => {
    if (operatorReportingTab === "engagement") {
      return engagementReportView.logs;
    }
    if (operatorReportingTab === "product") {
      return shopeeSkuLogs.filter(
        (log) => log.brandId === (activeReportBrandId || ""),
      );
    }
    return liveReportView.filteredDb;
  }, [
    activeReportBrandId,
    engagementReportView.logs,
    liveReportView.filteredDb,
    operatorReportingTab,
    shopeeSkuLogs,
  ]);

  const operatorWorkspaceAvailableDates = useMemo(
    () =>
      getAvailableReportDates({
        logs: operatorWorkspaceDateLogs,
        platformFilter: operatorPlatformFilter,
      }),
    [operatorPlatformFilter, operatorWorkspaceDateLogs],
  );

  const operatorWorkspaceTargetLatestDate = useMemo(() => {
    if (operatorReportingTab === "engagement") {
      return engagementReportView.engagementLatestDate || "";
    }
    if (operatorReportingTab === "product") {
      return productReportView.targetLatestDate || "";
    }
    return liveReportView.targetLatestDate || "";
  }, [
    engagementReportView.engagementLatestDate,
    liveReportView.targetLatestDate,
    operatorReportingTab,
    productReportView.targetLatestDate,
  ]);

  const operatorWorkspacePeriodLabel = useMemo(() => {
    if (operatorReportingTab === "engagement") {
      return engagementReportView.engagementPeriodLabel;
    }
    if (operatorReportingTab === "product") {
      return productReportView.productPeriodLabel;
    }
    return getReportPeriodLabel({
      dateFilterType: operatorDateFilterType,
      latestDateLabel: liveReportView.latestDateLabel,
      targetLatestDate: liveReportView.targetLatestDate,
      customStartDate: operatorCustomStartDate,
    });
  }, [
    engagementReportView.engagementPeriodLabel,
    liveReportView.latestDateLabel,
    liveReportView.targetLatestDate,
    operatorCustomStartDate,
    operatorDateFilterType,
    operatorReportingTab,
    productReportView.productPeriodLabel,
  ]);

  const operatorWorkspaceCurrentDate = useMemo(() => {
    if (operatorDateFilterType !== "latest") {
      return "";
    }
    return (
      operatorSelectedLatestDate ||
      operatorWorkspaceTargetLatestDate ||
      operatorWorkspaceAvailableDates[operatorWorkspaceAvailableDates.length - 1] ||
      ""
    );
  }, [
    operatorDateFilterType,
    operatorSelectedLatestDate,
    operatorWorkspaceAvailableDates,
    operatorWorkspaceTargetLatestDate,
  ]);

  const canPrevOperatorWorkspaceDate =
    operatorWorkspaceAvailableDates.length > 0 &&
    operatorWorkspaceAvailableDates.indexOf(operatorWorkspaceCurrentDate) > 0;
  const canNextOperatorWorkspaceDate =
    operatorWorkspaceAvailableDates.length > 0 &&
    operatorWorkspaceAvailableDates.indexOf(operatorWorkspaceCurrentDate) <
      operatorWorkspaceAvailableDates.length - 1;
  const [isDragOverReporting, setIsDragOverReporting] = useState(false);
  const [saveTargetBrandId, setSaveTargetBrandId] = useState("");
  const [saveTargetPlatform, setSaveTargetPlatform] = useState("TikTok Live");
  const [shopeeRawTab, setShopeeRawTab] = useState<
    "day" | "shift" | "dayOfWeek" | "raw"
  >("day");
  const [reportingShopeeRawTab, setReportingShopeeRawTab] = useState<
    "day" | "shift" | "dayOfWeek" | "raw"
  >("day");
  const [adminReportBrandFilter, setAdminReportBrandFilter] = useState("");
  const [adminShiftChecklistObj, setAdminShiftChecklistObj] = useState<Record<string, string[]>>({});
  const adminShiftChecklist = adminShiftChecklistObj[adminReportBrandFilter || "default_brand"] || [];
  const setAdminShiftChecklist = (val: string[]) => {
    const newObj = { ...adminShiftChecklistObj, [adminReportBrandFilter || "default_brand"]: val };
    setAdminShiftChecklistObj(newObj);
  };

  useEffect(() => {
    if (!isGlobalConfigsLoaded || !isOperatorLoggedIn || globalConfigFetchFailed) return;
    const timer = setTimeout(() => {
      saveLocalConfig({ adminShiftChecklistObj });

    }, 1000); // 1-second debounce
    return () => clearTimeout(timer);
  }, [adminShiftChecklistObj, isGlobalConfigsLoaded, isOperatorLoggedIn, globalConfigFetchFailed]);
  const [autoDetectNotice, setAutoDetectNotice] = useState("");
  const [isSavingReport, setIsSavingReport] = useState(false);

  useEffect(() => {
    // --- ONE-TIME AUTO CLEANUP FOR BUGGED 2026-12-01 DATES ---
    // (Sekarang berbasis state lokal, bukan Firestore)
    setBrandPerformanceLogs((prev) => {
      const badIds = prev
        .filter((d) => {
          const date = d.date;
          return date && (date.includes('2026-12-') || date.includes('2026-11-') || date > '2026-06-30');
        })
        .map((d) => d.id);
      if (badIds.length > 0) {
        console.log(`Auto-cleaning ${badIds.length} bad future date records from state...`);
        return prev.filter((d) => !badIds.includes(d.id));
      }
      return prev;
    });
  }, []);


  const handleDeletePerformanceLog = async (
    id: string,
    brandName: string,
    date: string,
  ) => {
    requestConfirm(
      "Hapus Data Live Stream",
      `Apakah Anda yakin ingin menghapus catatan live stream brand ${brandName} tanggal ${date}?`,
      async () => {
        try {
          // Hapus dari state lokal
          setBrandPerformanceLogs((prev) => prev.filter((log) => log.id !== id));
          customAlert("Data live stream berhasil dihapus dari database!");
        } catch (err: unknown) {
          console.error("Gagal menghapus:", err);
          customAlert("Error: " + getErrorMessage(err));
        }
      },
      "danger",
    );
  };


  const handleUploadSkuRaw = async (file: File) => {
    setAutoDetectNotice("");
    setUploadedFileName(file.name);

    const detectedBrandObj = detectBrandFromFilename(file.name, clientBrands);

    if (detectedBrandObj) {
      setSaveTargetBrandId(detectedBrandObj.id);
    }
    setSaveTargetPlatform(detectPlatformFromFilename(file.name) || "Shopee Live");

    try {
      const jsonData = await readFirstWorksheetRowsFromFile(file);

      if (jsonData.length < 2) {
        alert("File kosong atau format salah.");
        return;
      }

      // Find headers
      let headerRowIdx = -1;
      for (let r = 0; r < Math.min(jsonData.length, 50); r++) {
        const row = jsonData[r];
        if (
          row &&
          row?.some(
            (cell) =>
              typeof cell === "string" &&
              (cell.toLowerCase().includes("sku") ||
                cell.toLowerCase().includes("produk") ||
                cell.toLowerCase().includes("product") ||
                cell.toLowerCase().includes("item") ||
                cell.toLowerCase().includes("judul")),
          )
        ) {
          headerRowIdx = r;
          break;
        }
      }
      if (headerRowIdx === -1) headerRowIdx = 0;

      const headers = Array.from(jsonData[headerRowIdx] || []).map((h) =>
        String(h || "")
          .trim()
          .toLowerCase(),
      );

      let detectedPlatform = detectPlatformFromFilename(file.name);
      if (!detectedPlatform) {
        detectedPlatform = detectReportingPlatformFromHeaders(headers);
      }
      if (detectedPlatform) {
        setSaveTargetPlatform(detectedPlatform);
      }

      const skuRows = parseSkuUploadRows(jsonData, file.name);
      setSkuRawData(skuRows);
      if (detectedBrandObj) {
        setAutoDetectNotice(
          `Auto-detected Klien: ${detectedBrandObj.name} (${skuRows.length} records).`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err);
    }
  };

  const handleUploadReportingRaw = async (file: File) => {
    setAutoDetectNotice("");
    setUploadedFileName(file.name);
    const detectedPlatform = detectPlatformFromFilename(file.name);
    const detectedBrandObj = detectBrandFromFilename(file.name, clientBrands);

    if (detectedPlatform) {
      setSaveTargetPlatform(detectedPlatform);
    }
    if (detectedBrandObj) {
      setSaveTargetBrandId(detectedBrandObj.id);
    }

    try {
      const jsonData = await readFirstWorksheetRowsFromFile(file);

      if (jsonData.length < 2) {
        alert("File kosong atau format salah.");
        return;
      }

      // Find headers row and map columns
      let headerRowIdx = findReportingUploadHeaderRowIndex(jsonData);

      if (headerRowIdx === -1) {
        headerRowIdx = 0; // fallback to first row
      }

      const headers = Array.from(jsonData[headerRowIdx] || []).map((h) =>
        String(h || "")
          .trim()
          .toLowerCase(),
      );

      let detectedPlatform = detectPlatformFromFilename(file.name);
      if (!detectedPlatform) {
        detectedPlatform = detectReportingPlatformFromHeaders(headers);
      }
      if (detectedPlatform) {
        setSaveTargetPlatform(detectedPlatform);
      }

      // Prepare info banner
      const parts = [];
      if (detectedBrandObj) parts.push(`Klien: ${detectedBrandObj.name}`);
      if (detectedPlatform) parts.push(`Platform: ${detectedPlatform}`);

      if (parts.length > 0) {
        setAutoDetectNotice(
          `Auto-detection Pintar: Berhasil mendeteksi ${parts.join(" & ")} dari nama file/kolom (${file.name})!`,
        );
      } else {
        setAutoDetectNotice(
          `File "${file.name}" berhasil dibaca. Silakan pilih Brand & Platform secara manual.`,
        );
      }

      const reportingRows = parseReportingUploadRows(jsonData, shifts);
      setReportingRawData(reportingRows);
    } catch (err) {
      console.error("Error parsing workbook:", err);
      alert(
        "Gagal membaca file excel. Silakan periksa kembali format file anda.",
      );
    }
  };

  const handleDeleteSkuBatch = async (batchId: string) => {
    requestConfirm(
      "Hapus History Upload SKU",
      "Apakah Anda yakin ingin menghapus data dari batch upload ini secara permanen?",
      async () => {
        try {
          setIsSavingReport(true);
          const relatedLogs = shopeeSkuLogs.filter(
            (r) => r.batchId === batchId,
          );
          if (relatedLogs.length === 0) {
            customAlert("Tidak ada data log SKU yang ditemukan untuk batch identifier ini.");
            return;
          }
          const idsToDelete = new Set(relatedLogs.map((l) => l.id));
          setShopeeSkuLogs((prev) => prev.filter((l) => !idsToDelete.has(l.id)));
          customAlert(`Data upload history SKU (${relatedLogs.length} baris) berhasil dihapus.`);
        } catch (e: unknown) {
          console.error(e);
          customAlert("Gagal menghapus data: " + getErrorMessage(e));
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger"
    );
  };


  const handleDeleteAllBrandRawData = async (
    brandId: string,
    brandName: string,
    targetType: "all" | "product" | "performance" | "live" | "engagement" = "all"
  ) => {
    const brandLogs = brandPerformanceLogs.filter(
      (log) => log.brandId === brandId,
    );
    const brandBatches = brandUploadHistory.filter(
      (b) => b.brandId === brandId,
    );

    if (targetType === "product") {
      const brandSkuLogs = shopeeSkuLogs.filter(
        (log) => log.brandId === brandId,
      );
      if (brandSkuLogs.length === 0) {
        customAlert(`Tidak ada data Product Performance / SKU untuk brand "${brandName}".`);
        return;
      }
      requestConfirm(
        "Hapus Data Product Performance",
        `Apakah Anda yakin menghapus SEMUA data SKU (${brandSkuLogs.length} data) untuk brand "${brandName}"? TINDAKAN INI BERSIFAT PERMANEN!`,
        async () => {
          try {
            setIsSavingReport(true);
            const idsToDelete = new Set(brandSkuLogs.map((l) => l.id));
            setShopeeSkuLogs((prev) => prev.filter((l) => !idsToDelete.has(l.id)));
            customAlert("Data Product Performance SKU berhasil dihapus.");
          } catch (e: unknown) {
            console.error(e);
            customAlert("Gagal menghapus data: " + getErrorMessage(e));
          } finally { setIsSavingReport(false); }
        },
        "danger"
      );
      return;
    }

    if (targetType === "live" || targetType === "engagement" || targetType === "performance") {
      const logsToDelete = targetType === "performance" ? brandLogs : brandLogs.filter(l => targetType === "engagement" ? l.reportType === "engagement" : l.reportType !== "engagement");
      const batchesToDelete = targetType === "performance" ? brandBatches : brandBatches.filter(b => targetType === "engagement" ? b.reportType === "engagement" : b.reportType !== "engagement");
      
      if (logsToDelete.length === 0 && batchesToDelete.length === 0) {
        customAlert(`Tidak ada data ${targetType === "live" ? "Live Streaming" : targetType === "engagement" ? "Engagement" : "Live / Engagement"} raw untuk brand "${brandName}".`);
        return;
      }
      requestConfirm(
        `Hapus Data ${targetType === "live" ? "Live Streaming" : targetType === "engagement" ? "Engagement" : "Live & Engagement"}`,
        `Apakah Anda yakin menghapus SELURUH raw data (${logsToDelete.length} sesi) untuk brand "${brandName}"? TINDAKAN INI BERSIFAT PERMANEN!`,
        async () => {
          try {
            setIsSavingReport(true);
            const logIdsToDelete: Set<string> = new Set(
              logsToDelete.map((l) => String(l.id)),
            );
            const batchIdsToDelete: Set<string> = new Set(
              batchesToDelete.map((b) => String(b.id)),
            );
            // Hapus dari MySQL terlebih dahulu
            await reportingBrandApi.deleteMany({
              logIds: Array.from(logIdsToDelete),
              batchIds: Array.from(batchIdsToDelete),
            });
            // Baru update state lokal
            setBrandPerformanceLogs((prev) => prev.filter((l) => !logIdsToDelete.has(l.id)));
            setBrandUploadHistory((prev) => prev.filter((b) => !batchIdsToDelete.has(b.id)));
            setUploadHistory((prev) => prev.filter((b) => !batchIdsToDelete.has(b.id)));
            customAlert("Data raw berhasil dihapus.");
          } catch (e: unknown) {
            console.error(e);
            customAlert("Gagal menghapus data: " + getErrorMessage(e));
          } finally { setIsSavingReport(false); }
        },
        "danger"
      );
      return;
    }

    if (brandLogs.length === 0 && brandBatches.length === 0) {
      customAlert(
        `Tidak ada data raw atau riwayat upload yang tersimpan untuk brand "${brandName}".`,
      );
      return;
    }

    requestConfirm(
      "Hapus Semua Raw Data Brand",
      `Apakah Anda yakin ingin menghapus SELURUH raw data (${brandLogs.length} sesi) dan seluruh riwayat batch upload (${brandBatches.length} batch) untuk brand "${brandName}"? TINDAKAN INI BERSIFAT PERMANEN, MENGHAPUS SEMUA RAW DATA SEKALIGUS, DAN TIDAK DAPAT DIBATALKAN!`,
      async () => {
        try {
          setIsSavingReport(true);

          const brandSkuLogs = shopeeSkuLogs.filter(
            (log) => log.brandId === brandId,
          );

          const logIds: Set<string> = new Set(
            brandLogs.map((l) => String(l.id)),
          );
          const batchIds: Set<string> = new Set(
            brandBatches.map((b) => String(b.id)),
          );
          const skuIds: Set<string> = new Set(
            brandSkuLogs.map((l) => String(l.id)),
          );

          // Hapus dari MySQL terlebih dahulu
          await reportingBrandApi.deleteMany({
            logIds: Array.from(logIds),
            batchIds: Array.from(batchIds),
          });

          // Baru update state lokal
          setBrandPerformanceLogs((prev) => prev.filter((l) => !logIds.has(l.id)));
          setBrandUploadHistory((prev) => prev.filter((b) => !batchIds.has(b.id)));
          setUploadHistory((prev) => prev.filter((b) => !batchIds.has(b.id)));
          setShopeeSkuLogs((prev) => prev.filter((l) => !skuIds.has(l.id)));

          customAlert(
            `Berhasil menghapus seluruh raw data (${brandLogs.length} sesi), ${brandSkuLogs.length} SKU logs, dan riwayat upload (${brandBatches.length} batch) untuk brand "${brandName}" dari database!`,
          );
        } catch (err: unknown) {
          console.error("Gagal menghapus semua data raw brand:", err);
          customAlert("Error saat menghapus data brand: " + getErrorMessage(err));
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger",
    );
  };

  const handleEditBrand = (brand: ClientBrand) => {
    setBrandFormEditor(brand);
  };

  const handleDeleteBrand = (brandId: string) => {
    const brandToDelete = clientBrands.find((b) => b.id === brandId);
    requestConfirm(
      "Hapus Data Brand",
      `Apakah Anda yakin ingin menghapus data brand "${brandToDelete?.name || brandId}" beserta seluruh data terkaitnya? TINDAKAN INI BERSIFAT PERMANEN!`,
      async () => {
        try {
          // If you have backend api delete
          if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.delete) {
             await clientBrandsApi.delete(brandId);
          }
          setClientBrands((prev) => prev.filter((b) => b.id !== brandId));
          addNotification(
            "Brand Dihapus",
            `Data brand "${brandToDelete?.name || brandId}" berhasil dihapus dari sistem.`,
            "warning",
            "data_brand"
          );
          customAlert(`Data brand "${brandToDelete?.name || brandId}" berhasil dihapus permanen.`);
        } catch (error: unknown) {
          console.error("Gagal menghapus brand:", error);
          customAlert("Error saat menghapus data brand: " + getErrorMessage(error));
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
    const targetBrandId = deleteByDateTargetBrand?.id || activeReportBrandId;
    if (!targetBrandId) return;

    const brandName = deleteByDateTargetBrand?.name || clientBrands.find((b) => b.id === targetBrandId)?.name || "Brand";

    const targetType = deleteByDateTargetBrand ? "all" : operatorReportingTab;

    if (targetType === "product") {
      const logsToDelete = filterItemsWithinDateRange<SkuLogEntry>(
        shopeeSkuLogs,
        deleteByDateStart,
        deleteByDateEnd,
        (log) => log.brandId === targetBrandId,
      );

      if (logsToDelete.length === 0) {
        customAlert(
          `Tidak ada data Product Performance / SKU yang ditemukan untuk brand "${brandName}" pada rentang tanggal tersebut.`,
        );
        return;
      }

      requestConfirm(
        "Hapus Data Product Performance Berdasarkan Tanggal",
        `Apakah Anda yakin menghapus ${logsToDelete.length} data Product Performance untuk brand "${brandName}" dari tanggal ${deleteByDateStart} hingga ${deleteByDateEnd}? TINDAKAN INI BERSIFAT PERMANEN!`,
        async () => {
          try {
            setIsSavingReport(true);
            const idsToDelete = new Set(logsToDelete.map((l) => l.id));
            setShopeeSkuLogs((prev) => prev.filter((l) => !idsToDelete.has(l.id)));
            customAlert(`Berhasil menghapus ${logsToDelete.length} data Product Performance untuk brand "${brandName}"!`);
            setIsDeleteByDateModalOpen(false);
            setDeleteByDateStart("");
            setDeleteByDateEnd("");
          } catch (e: unknown) {
             console.error(e);
             customAlert("Gagal menghapus data: " + getErrorMessage(e));
          } finally { setIsSavingReport(false); }
        },
        "danger"
      );
      return;
    }

    const logsToDelete = filterItemsWithinDateRange<BrandPerformanceLogEntry>(
      brandPerformanceLogs,
      deleteByDateStart,
      deleteByDateEnd,
      (log) => {
        if (log.brandId !== targetBrandId) return false;
        if (targetType === "live" && log.reportType === "engagement") return false;
        if (targetType === "engagement" && log.reportType !== "engagement") return false;
        return true;
      },
    );

    const skuLogsToDelete = targetType === "all" ? filterItemsWithinDateRange<SkuLogEntry>(
      shopeeSkuLogs,
      deleteByDateStart,
      deleteByDateEnd,
      (log) => log.brandId === targetBrandId,
    ) : [];

    const displayType = targetType === "all" ? "Semua Raw Data & Product" : targetType === "live" ? "Live Streaming" : targetType === "engagement" ? "Engagement" : "Live & Engagement";

    if (logsToDelete.length === 0 && skuLogsToDelete.length === 0) {
      customAlert(
        `Tidak ada data ${displayType} yang ditemukan untuk brand "${brandName}" pada rentang tanggal tersebut.`,
      );
      return;
    }

    requestConfirm(
      `Hapus Data ${displayType} Berdasarkan Tanggal`,
      `Apakah Anda yakin menghapus ${logsToDelete.length} data ${displayType} dan ${skuLogsToDelete.length} data Product untuk brand "${brandName}" dari tanggal ${deleteByDateStart} hingga ${deleteByDateEnd}? TINDAKAN INI BERSIFAT PERMANEN!`,
      async () => {
        try {
          setIsSavingReport(true);
          const idsToDelete = new Set(logsToDelete.map((l) => l.id));
          const skuIdsToDelete = new Set(skuLogsToDelete.map((l) => l.id));
          
          // Hapus dari MySQL terlebih dahulu (asumsi deleteMany API handle logs biasa)
          await reportingBrandApi.deleteMany({
            logIds: [...idsToDelete],
          });
          
          setBrandPerformanceLogs((prev) => prev.filter((l) => !idsToDelete.has(l.id)));
          setShopeeSkuLogs((prev) => prev.filter((l) => !skuIdsToDelete.has(l.id)));
          
          customAlert(
            `Berhasil menghapus ${logsToDelete.length} data ${displayType} dan ${skuLogsToDelete.length} data Product untuk brand "${brandName}"!`,
          );
          setIsDeleteByDateModalOpen(false);
          setDeleteByDateStart("");
          setDeleteByDateEnd("");
        } catch (err: unknown) {
          console.error("Gagal menghapus data berdasarkan rentang waktu:", err);
          customAlert("Error saat menghapus data: " + getErrorMessage(err));
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger"
    );
  };


  const handleDeleteUploadBatch = async (
    batchId: string,
    fileName: string,
    rowCount: number,
  ) => {
    requestConfirm(
      "Hapus Batch Upload & Data Raw",
      `Apakah Anda yakin ingin menghapus arsip upload "${fileName}" (${rowCount} data)? TINDAKAN INI AKAN MENGHAPUS SEMUA (${rowCount}) RAW DATA YANG BERHUBUNGAN SEKALIGUS DARI DATABASE PERMANEN.`,
      async () => {
        try {
          setIsSavingReport(true);

          const batchLogs = brandPerformanceLogs.filter(
            (log) => log.batchId === batchId,
          );

          // Hapus dari MySQL terlebih dahulu
          await reportingBrandApi.deleteMany({
            logIds: [...batchLogs.map((l) => l.id)],
            batchIds: [batchId],
          });

          // Hapus dari state lokal
          setUploadHistory((prev) => prev.filter((h) => h.id !== batchId));
          setBrandUploadHistory((prev) => prev.filter((h) => h.id !== batchId));

          const logIds = new Set(batchLogs.map((l) => l.id));
          setBrandPerformanceLogs((prev) => prev.filter((l) => !logIds.has(l.id)));

          customAlert(
            `Berhasil menghapus batch upload "${fileName}" beserta seluruh raw data terkait (${batchLogs.length} data) dari database!`,
          );
        } catch (err: unknown) {
          console.error("Gagal menghapus batch:", err);
          customAlert("Error saat menghapus batch: " + getErrorMessage(err));
        } finally {
          setIsSavingReport(false);
        }
      },
      "danger",
    );
  };


  const handleSaveReportingDataToDatabase = () => {
    if (!saveTargetBrandId) {
      customAlert(
        "Silakan pilih brand klien terlebih dahulu pada dropdown di atas sebelum melakukan penyimpanan!",
      );
      return;
    }
    const targetBrandObj = clientBrands.find((b) => b.id === saveTargetBrandId);
    if (!targetBrandObj) {
      customAlert("Brand yang dipilih tidak valid.");
      return;
    }

    const dataToSave = [...reportingRawData];
    const platformToSave = saveTargetPlatform;
    const brandIdToSave = saveTargetBrandId;
    const brandNameToSave = targetBrandObj.name;
    const currentFileName =
      uploadedFileName ||
      `Laporan ${platformToSave} - ${new Date().toLocaleDateString("id-ID")}`;

    // Immediately close modal and clear state to avoid locking the UI
    setReportingRawData([]);
    setUploadedFileName("");
    setAutoDetectNotice("");
    setIsUploadModalOpen(false);
    setIsSavingReport(true); // Flag to show background saving in UI

    // Notify user it runs in background
    addNotification(
      "⏳ Menyimpan Data",
      `Sedang memproses ${dataToSave.length} baris laporan ${brandNameToSave} ke database di latar belakang...`,
      "info",
      "reporting_brand",
    );

    const runBackgroundSave = async () => {
      try {
        const batchId = "batch_" + Date.now();
        let totalBatchGmv = 0;
        let allRecordsToSave: BrandPerformanceLogEntry[] = [];

        for (const row of dataToSave) {
          const sanitizedTitle = String(row.title || "Live")
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, "");
          const baseId = `${brandIdToSave}_${platformToSave.toLowerCase().replace(/\s/g, "_")}_${row.date}_${sanitizedTitle}_${Math.random().toString(36).substring(2, 9)}`;
          const rowGmv = Number(row.gmv || 0);
          totalBatchGmv += rowGmv;

          const isTiktok = String(platformToSave).toLowerCase().includes("tiktok");
          if (isTiktok) {
            allRecordsToSave.push({
              id: baseId + "_live",
              batchId: batchId,
              brandId: brandIdToSave,
              brandName: brandNameToSave,
              platform: platformToSave,
              title: row.title,
              date: row.date,
              dateTime: row.dateTime || row.date,
              uploadedAt: new Date().toISOString(),
              reportType: "live",
              shift: row.shift || "Shift Lainnya",
              duration: Number(row.duration || 0),
              gmv: rowGmv,
              products_sold: Number(row.products_sold || 0),
              buyers: Number(row.buyers || 0),
              aov: Number(row.aov || 0),
              views: Number(row.views || 0),
              impressions: Number(row.impressions || 0),
              penonton: Number(row.penonton || row.impressions || 0),
              liveVisits: Number(row.liveVisits || 0),
              productImpressions: Number(row.productImpressions || 0),
              clicks: Number(row.clicks || 0),
              orders: Number(row.orders || 0),
              followers: Number(row.followers || 0),
              likes: Number(row.likes || 0),
              shares: Number(row.shares || 0),
              comments: Number(row.comments || 0),
              avgViewDuration: Number(row.avgViewDuration || 0),
              peakViewers: Number(row.peakViewers || 0),
              shopVouchers: Number(row.shopVouchers || 0),
              specialVouchers: Number(row.specialVouchers || 0),
              coinsClaimed: Number(row.coinsClaimed || 0),
              hasFunnelInFile: !!row.hasFunnelInFile,
            });

            allRecordsToSave.push({
              id: baseId + "_eng",
              batchId: batchId,
              brandId: brandIdToSave,
              brandName: brandNameToSave,
              platform: platformToSave,
              title: row.title,
              date: row.date,
              dateTime: row.dateTime || row.date,
              uploadedAt: new Date().toISOString(),
              reportType: "engagement",
              likes: Number(row.likes || 0),
              comments: Number(row.comments || 0),
              shares: Number(row.shares || 0),
              followers: Number(row.followers || 0),
              peakViewers: Number(row.peakViewers || 0),
              penonton: Number(row.penonton || row.impressions || 0),
              views: Number(row.views || 0),
              impressions: Number(row.impressions || 0),
              shopVouchers: Number(row.shopVouchers || 0),
              specialVouchers: Number(row.specialVouchers || 0),
              coinsClaimed: Number(row.coinsClaimed || 0),
            });
          } else {
            const isEngagement = uploadTargetTab === "engagement";
            const record: BrandPerformanceLogEntry = {
              id: baseId,
              batchId: batchId,
              brandId: brandIdToSave,
              brandName: brandNameToSave,
              platform: platformToSave,
              title: row.title,
              date: row.date,
              dateTime: row.dateTime || row.date,
              uploadedAt: new Date().toISOString(),
              reportType: "live", // Always save as live so it shows in Live Dashboard
            };

            if (isEngagement) {
              record.likes = Number(row.likes || 0);
              record.comments = Number(row.comments || 0);
              record.shares = Number(row.shares || 0);
              record.followers = Number(row.followers || 0);
              record.peakViewers = Number(row.peakViewers || 0);
              record.penonton = Number(row.penonton || row.impressions || 0);
              record.views = Number(row.views || 0);
              record.impressions = Number(row.impressions || 0);
              record.shopVouchers = Number(row.shopVouchers || 0);
              record.specialVouchers = Number(row.specialVouchers || 0);
              record.coinsClaimed = Number(row.coinsClaimed || 0);
              record.buyers = Number(row.buyers || 0); // Customer mapping
            } else {
              record.shift = row.shift || "Shift Lainnya";
              record.duration = Number(row.duration || 0);
              record.gmv = rowGmv;
              record.products_sold = Number(row.products_sold || 0);
              record.buyers = Number(row.buyers || 0);
              record.aov = Number(row.aov || 0);
              record.views = Number(row.views || 0);
              record.impressions = Number(row.impressions || 0);
              record.penonton = Number(row.penonton || row.impressions || 0);
              record.liveVisits = Number(row.liveVisits || 0);
              record.productImpressions = Number(row.productImpressions || 0);
              record.clicks = Number(row.clicks || 0);
              record.orders = Number(row.orders || 0);
              record.followers = Number(row.followers || 0);
              record.likes = Number(row.likes || 0);
              record.shares = Number(row.shares || 0);
              record.comments = Number(row.comments || 0);
              record.avgViewDuration = Number(row.avgViewDuration || 0);
              record.peakViewers = Number(row.peakViewers || 0);
              record.shopVouchers = Number(row.shopVouchers || 0);
              record.specialVouchers = Number(row.specialVouchers || 0);
              record.coinsClaimed = Number(row.coinsClaimed || 0);
              record.hasFunnelInFile = !!row.hasFunnelInFile;
            }
            allRecordsToSave.push(record);
          }
        }

        const isTiktokUpload = String(platformToSave).toLowerCase().includes("tiktok");

        // Buat batch record untuk upload history
        const uploadHistoryRecord: UploadHistoryEntry = {
          id: batchId,
          brandId: brandIdToSave,
          brandName: brandNameToSave,
          platform: platformToSave,
          fileName: currentFileName,
          uploadedAt: new Date().toISOString(),
          rowCount: dataToSave.length,
          gmv: totalBatchGmv,
          reportType:
            String(platformToSave).toLowerCase().includes("tiktok") ? "both" : uploadTargetTab,
        };

        // Simpan ke MySQL via API (agar data tidak hilang saat refresh)
        await reportingBrandApi.createBatch({
          batch: uploadHistoryRecord,
          rows: allRecordsToSave,
        });

        // Setelah berhasil disimpan ke MySQL, update state lokal
        setBrandPerformanceLogs((prev) => {
          const existingIds = new Set(prev.map((l) => l.id));
          const newRecords = allRecordsToSave.filter((r) => !existingIds.has(r.id));
          return [...prev, ...newRecords];
        });
        setBrandUploadHistory((prev) => [...prev, uploadHistoryRecord]);
        setUploadHistory((prev) => [...prev, uploadHistoryRecord]);

        if (isTiktokUpload) {
          // TikTok live + engagement memakai raw source yang sama.
          // Setelah upload, tetap di tanggal terbaru agar panel Live/Engagement
          // langsung menyorot data hari terakhir yang tersedia.
          setOperatorDateFilterType("latest");
          setCurrentPage(1);
        }

        addNotification(
          "✅ Tersimpan",
          isTiktokUpload
            ? `Berhasil menyimpan ${dataToSave.length} baris data TikTok untuk brand "${brandNameToSave}". Total GMV: ${formatIDR(totalBatchGmv)}. Panel dibuka ke data terbaru agar data Live & Engagement langsung terlihat.`
            : `Berhasil menyimpan ${dataToSave.length} baris data untuk brand "${brandNameToSave}". Total GMV: ${formatIDR(totalBatchGmv)}.`,
          "success",
          "reporting_brand",
        );
      } catch (err: unknown) {
        console.error(
          "Gagal menyimpan data laporan:",
          err,
        );
        addNotification(
          "❌ Gagal Menyimpan",
          `Terjadi kesalahan saat menyimpan data ${brandNameToSave}: ${getErrorMessage(err)}`,
          "danger",
          "reporting_brand",
        );
      } finally {
        setIsSavingReport(false);
      }
    };

    // Execute async in background without awaiting
    runBackgroundSave();
  };

  // Sidebar Category Toggle State
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    "cat-host": true,
    "cat-client": true,
    "cat-system": true,
    "cat-security": true,
  });

  // Sorting & Column Widths states for Salary Recap Table
  const [salarySortKey, setSalarySortKey] = useState<string>("name");
  const [salarySortDir, setSalarySortDir] = useState<"asc" | "desc">("asc");
  const [expandedHostSalaryId, setExpandedHostSalaryId] = useState<string | null>(null);

  // --- CALENDAR WORKSPACE OPERATIONS STATES ---
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [isScheduleActionsOpen, setIsScheduleActionsOpen] = useState(false);
  const [pickerTempDate, setPickerTempDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [pickerMonth, setPickerMonth] = useState(() => new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(() => new Date().getFullYear());

  const handleDaySelect = (dayObj: {
    day: number;
    monthType: "prev" | "current" | "next";
    dateString: string;
  }) => {
    setPickerTempDate(dayObj.dateString);
    if (dayObj.monthType === "prev") {
      if (pickerMonth === 0) {
        setPickerMonth(11);
        setPickerYear(pickerYear - 1);
      } else {
        setPickerMonth(pickerMonth - 1);
      }
    } else if (dayObj.monthType === "next") {
      if (pickerMonth === 11) {
        setPickerMonth(0);
        setPickerYear(pickerYear + 1);
      } else {
        setPickerMonth(pickerMonth + 1);
      }
    }
  };
  const [selectedHostCalendarDate, setSelectedHostCalendarDate] = useState<
    string | null
  >(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [calendarMonth, setCalendarMonth] = useState(() =>
    new Date().getMonth(),
  );
  const [calendarYear, setCalendarYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [adminCalendarHostFilter, setAdminCalendarHostFilter] = useState("all");
  const [scheduleActionStartDate, setScheduleActionStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [scheduleActionEndDate, setScheduleActionEndDate] = useState(() => {
    const d = new Date();
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const month = calendarMonth;
    const year = calendarYear;
    const lastDay = new Date(year, month + 1, 0).getDate();
    setScheduleActionStartDate(
      `${year}-${String(month + 1).padStart(2, "0")}-01`,
    );
    setScheduleActionEndDate(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
    );
  }, [calendarMonth, calendarYear]);
  const [hostCalendarMonth, setHostCalendarMonth] = useState(() =>
    new Date().getMonth(),
  );
  const [hostCalendarYear, setHostCalendarYear] = useState(() =>
    new Date().getFullYear(),
  );
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
    backupOption: "none",
  });

  const toggleSalarySort = (key: string) => {
    const nextSort = getNextSortState(
      salarySortKey,
      salarySortDir === "asc",
      key,
    );
    setSalarySortKey(nextSort.sortKey);
    setSalarySortDir(nextSort.sortAsc ? "asc" : "desc");
  };

  const [isPayrollConfigOpen, setIsPayrollConfigOpen] = useState(false);


  const [salaryRecapLocationTab, setSalaryRecapLocationTab] = useState("Semua Host");

  // --- HOST PERSONAL ANALYTICS ---
  const [hostCutoffPeriod, setHostCutoffPeriod] = useState<string>(() => {
    const d = new Date();
    const day = d.getDate();
    let m = d.getMonth() + 1; // 1-12
    let y = d.getFullYear();
    const startDay = 16; // cutoff start boundary
    if (day >= startDay) {
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return `${y}-${String(m).padStart(2, "0")}`;
  });

  // Dynamically compute schedules (combining explicit schedules with clientBrand session defaults)
  const computedSchedules = useMemo(() => {
    const result = schedules.filter((es) => !es.isDeleted);

    const uniqueResult: ShiftSchedule[] = [];
    const seen = new Set<string>();

    result.forEach((r) => {
      // Unique key for deduplication. A host can only physically exist in one place per time slot.
      const key =
        r.isOffDay || r.isPindahStudio
          ? `EXCEPTION_${r.hostId}_${r.date}_${r.isOffDay ? "OFF" : "PINDAH"}`
          : `${r.hostId}_${r.date}_${r.timeSlot}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniqueResult.push({ ...r });
      }
    });

    return uniqueResult;
  }, [schedules]);

  const hostLogs = useMemo(() => {
    const base = logs.filter((l) => l.hostId === selectedHostId);
    if (!hostCutoffPeriod || hostCutoffPeriod === "Semua") {
      return base;
    }

    const [yearStr, monthStr] = hostCutoffPeriod.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    const startDay = salarySettings.cutOffStartDay ?? 16;
    const endDay = salarySettings.cutOffEndDay ?? 15;

    return base.filter((l) => {
      const rawDate = getLogDateInput(l);
      const logDateStr = normalizeDateYMD(rawDate);
      if (!logDateStr) return false;

      if (salarySettings.useCutOff) {
        let startPeriodY = year;
        let startPeriodM = month - 1;
        if (startPeriodM < 1) {
          startPeriodM = 12;
          startPeriodY -= 1;
        }
        
        const startStr = `${startPeriodY}-${padLocal(startPeriodM)}-${padLocal(startDay)}`;
        const endStr = `${year}-${padLocal(month)}-${padLocal(endDay)}`;

        return logDateStr >= startStr && logDateStr <= endStr;
      } else {
        const [logY, logM] = logDateStr.split("-").map(Number);
        return logY === year && logM === month;
      }
    });
  }, [logs, selectedHostId, hostCutoffPeriod, salarySettings]);

  const hostStats = useMemo(() => {
    const totalSession = hostLogs.length;
    const timely = hostLogs.filter((l) => l.status === "Present").length;
    const late = hostLogs.filter((l) => l.status === "Late").length;
    const absent = hostLogs.filter(
      (l) =>
        l.status !== "Present" && l.status !== "Late" && l.status !== "Excused",
    ).length;
    const excused = hostLogs.filter((l) => l.status === "Excused").length;

    // Attendance rate
    const presenceRate =
      totalSession > 0
        ? Math.round(((timely + late) / (totalSession + absent)) * 100)
        : 100;

    return { totalSession, timely, late, absent, excused, presenceRate };
  }, [hostLogs]);

  // Periodic categorization states for Attendance / Salary
  const [timeFilter, setTimeFilter] = useState("Bulanan"); // "Semua" | "Harian" | "Mingguan" | "Bulanan"
  const [filterReferenceDate, setFilterReferenceDate] = useState(() => {
    const d = new Date();
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });

  const isLogDateMatchingMemo = useCallback(
    (rawLogDateStr: string) =>
      isLogDateMatching(rawLogDateStr, {
        timeFilter,
        referenceDate: filterReferenceDate,
        useCutOff: salarySettings.useCutOff,
        cutOffStartDay: salarySettings.cutOffStartDay,
        cutOffEndDay: salarySettings.cutOffEndDay,
      }),
    [
      timeFilter,
      filterReferenceDate,
      salarySettings.useCutOff,
      salarySettings.cutOffStartDay,
      salarySettings.cutOffEndDay,
    ],
  );

  const [globalSearch, setGlobalSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("Semua Platform");
  const [brandFilter, setBrandFilter] = useState("Semua Brand");

  // Search states for "Data absen" tab
  const [dbPlatformFilter, setDbPlatformFilter] = useState("Semua Platform");
  const [dbBrandFilter, setDbBrandFilter] = useState("Semua Brand");
  const [dbShiftFilter, setDbShiftFilter] = useState("Semua Shift");
  const [dbDateFilterStart, setDbDateFilterStart] = useState("");
  const [dbDateFilterEnd, setDbDateFilterEnd] = useState("");
  const [dbSortDir, setDbSortDir] = useState<"desc" | "asc">("desc");
  const [dbTabMode, setDbTabMode] = useState<"today" | "all" | "calendar">("today");

  const [selectedSlipHost, setSelectedSlipHost] = useState<HostReportRow | null>(null);

  const availableCutoffMonths = useMemo(
    () => buildAvailableCutoffMonths(logs, filterReferenceDate),
    [logs, filterReferenceDate],
  );

  // Filter/Sort for Operator Data Brand tab
  const [brandDataSearch, setBrandDataSearch] = useState("");
  const [brandDataSortDir, setBrandDataSortDir] = useState<"asc" | "desc">(
    "asc",
  );

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
  const [editingPlatformIdx, setEditingPlatformIdx] = useState<number | null>(
    null,
  );
  const [editingPlatformValue, setEditingPlatformValue] = useState("");

  const [editingBrandIdx, setEditingBrandIdx] = useState<number | null>(null);
  const [editingBrandValue, setEditingBrandValue] = useState("");

  const [editingShiftIdx, setEditingShiftIdx] = useState<number | null>(null);
  const [editingShiftValue, setEditingShiftValue] = useState("");

  const [editingStudioIdx, setEditingStudioIdx] = useState<number | null>(null);
  const [editingStudioName, setEditingStudioName] = useState("");
  const [editingStudioLocation, setEditingStudioLocation] =
    useState("Bandar Lampung");

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
    type: "danger" | "warning" | "info" = "warning",
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
      type,
    });
  };

  // Operator-level list of Host detailed stats & Salary recapitulation
  const hostReportList = useMemo(
    () =>
      buildHostReportList(
        hosts,
        logs,
        salarySettings,
        (rawDate) => isLogDateMatchingMemo(rawDate),
        getLogDateInput,
      ),
    [hosts, logs, salarySettings, isLogDateMatchingMemo],
  );

  // Filtered and sorted salary report list
  const filteredHostReportList = useMemo(() => {
    const filtered = hostReportList.filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(globalSearch.toLowerCase());
      const matchPlatform =
        platformFilter === "Semua Platform" ||
        platformFilter === "" ||
        item.platforms?.some((p) => p.includes(platformFilter));
      const matchBrand =
        brandFilter === "Semua Brand" ||
        brandFilter === "" ||
        item.brands?.some((b) => b.includes(brandFilter));
      
      let matchLocation = true;
      if (salaryRecapLocationTab === "Bandar Lampung") {
        matchLocation = !item.studio?.includes("Tanggamus");
      } else if (salaryRecapLocationTab === "Tanggamus") {
        matchLocation = item.studio?.includes("Tanggamus") || false;
      }

      return matchSearch && matchPlatform && matchBrand && matchLocation;
    });

    // Implement sorting
    return [...filtered].sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;

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
  }, [
    hostReportList,
    globalSearch,
    platformFilter,
    brandFilter,
    salarySortKey,
    salarySortDir,
    salaryRecapLocationTab,
  ]);

  // Filtered logs list excluding status filter to provide proper counts on pills
  const dbActiveBaseLogs = useMemo(() => {
    return logs.filter((item) => {
      const globalSearchLower = (globalSearch || "").toLowerCase();
      const matchSearch =
        (item.hostName || "").toLowerCase().includes(globalSearchLower) ||
        (item.employeeId &&
          item.employeeId.toLowerCase().includes(globalSearchLower));
      const matchPlatform = isPlatformMatch(item.platform, dbPlatformFilter);
      const matchBrand =
        dbBrandFilter === "Semua Brand" ||
        item.brandHandled === dbBrandFilter;
      const matchShift = 
        dbShiftFilter === "Semua Shift" ||
        item.shift === dbShiftFilter;

      let matchDate = true;
      if (dbTabMode === "today") {
        const datePartRaw = item.date || (typeof item.timestamp === "string" ? item.timestamp.split(" ")[0] : "");
        const datePart = normalizeDateYMD(datePartRaw);
        matchDate = datePart === filterReferenceDate;
      } else if (dbDateFilterStart || dbDateFilterEnd) {
        // use item.date if available, else fallback to extracting from timestamp if it's a string
        const datePartRaw =
          item.date ||
          (typeof item.timestamp === "string"
            ? item.timestamp.split(" ")[0]
            : "");
        const datePart = normalizeDateYMD(datePartRaw);
        if (!datePart) {
          matchDate = false;
        } else {
          if (dbDateFilterStart && dbDateFilterEnd) {
            matchDate =
              datePart >= dbDateFilterStart && datePart <= dbDateFilterEnd;
          } else if (dbDateFilterStart) {
            matchDate = datePart >= dbDateFilterStart;
          } else if (dbDateFilterEnd) {
            matchDate = datePart <= dbDateFilterEnd;
          }
        }
      }

      return matchSearch && matchPlatform && matchBrand && matchShift && matchDate;
    });
  }, [
    logs,
    globalSearch,
    dbPlatformFilter,
    dbBrandFilter,
    dbShiftFilter,
    dbDateFilterStart,
    dbDateFilterEnd,
    dbTabMode,
  ]);

  // Filtered database logs list for "Data absen" tab
  const filteredLogsList = useMemo(() => {
    return dbActiveBaseLogs
      .filter((item) => {
        let matchStatus = false;
        if (dbStatusFilter === "All") {
          matchStatus = true;
        } else if (dbStatusFilter === "Absent") {
          matchStatus =
            item.status !== "Present" &&
            item.status !== "Late" &&
            item.status !== "Excused";
        } else {
          matchStatus = item.status === dbStatusFilter;
        }
        return matchStatus;
      })
      .sort((a, b) => {
        // Sort primarily by date then by timestamp
        const timeA = new Date(a.date || a.timestamp || 0).getTime();
        const timeB = new Date(b.date || b.timestamp || 0).getTime();
        return dbSortDir === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [
    dbActiveBaseLogs,
    dbStatusFilter,
    dbSortDir,
  ]);

  // Total Statistics across Agency for Operators
  const agencyOverviewStats = useMemo(() => {
    const totalEntries = logs.length;
    const countTepatWaktu = logs.filter((l) => l.status === "Present").length;
    const countTerlambat = logs.filter((l) => l.status === "Late").length;
    const countAlpa = logs.filter(
      (l) =>
        l.status !== "Present" && l.status !== "Late" && l.status !== "Excused",
    ).length;
    const countIzin = logs.filter((l) => l.status === "Excused").length;

    const punctualityRate =
      countTepatWaktu + countTerlambat > 0
        ? Math.round(
            (countTepatWaktu / (countTepatWaktu + countTerlambat)) * 100,
          )
        : 100;

    const totalRevenueAgency = logs.reduce(
      (acc, curr) => acc + (curr.revenueGenerated || 0),
      0,
    );

    return {
      totalEntries,
      countTepatWaktu,
      countTerlambat,
      countAlpa,
      countIzin,
      punctualityRate,
      totalRevenueAgency,
    };
  }, [logs]);

  const filteredAndSortedBrands = useMemo(() => {
    let result = clientBrands.filter((b) => {
      const active = b.isActive !== false; // default true if undefined
      if (brandDataTab === "active") return active;
      return !active;
    });

    if (brandDataSearch.trim()) {
      const q = brandDataSearch.toLowerCase();
      result = result.filter((b) => (b.name || "").toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      if (nameA < nameB) return brandDataSortDir === "asc" ? -1 : 1;
      if (nameA > nameB) return brandDataSortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [clientBrands, brandDataSearch, brandDataSortDir, brandDataTab]);

  // --- MANUAL ATTENDANCE LOG GENERATION (MANAGEMENT TOOL) ---
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFormMode, setManualFormMode] = useState<"standard" | "grid">("standard");
  const [manualForm, setManualForm] = useState<{
    hostId: string;
    hostIds: string[];
    isBulkHost: boolean;
    brand: string;
    platform: string;
    shift: string;
    studio: string;
    date: string;
    dates: string[];
    isBulkDate: boolean;
    dateRangeStart: string;
    dateRangeEnd: string;
    excludeWeekends: boolean;
    status: "Present" | "Late" | "Absent" | "Excused";
    overtimeHours: number;
    isBackupShift: boolean;
  }>(() => ({
    hostId: hosts[0]?.id || "",
    hostIds: [],
    isBulkHost: false,
    brand: brands[0] || "Wardah",
    platform: platforms[0] || "TikTok Live",
    shift: shifts[0] || "Shift 1 (05.00 - 11.00)",
    studio: studios[0]?.name || "Studio Bandar Lampung",
    date: new Date().toISOString().split("T")[0],
    dates: [new Date().toISOString().split("T")[0]],
    isBulkDate: false,
    dateRangeStart: new Date().toISOString().split("T")[0],
    dateRangeEnd: new Date().toISOString().split("T")[0],
    excludeWeekends: true,
    status: "Present" as "Present" | "Late" | "Absent" | "Excused",
    overtimeHours: 0,
    isBackupShift: false,
  }));

  const handleGenerateDateRange = () => {
    if (!manualForm.dateRangeStart || !manualForm.dateRangeEnd) return;
    const start = new Date(manualForm.dateRangeStart);
    const end = new Date(manualForm.dateRangeEnd);
    if (start > end) return customAlert("Tanggal akhir harus setelah tanggal awal.");
    
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (!manualForm.excludeWeekends || (day !== 0 && day !== 6)) {
        dates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    setManualForm(prev => ({ ...prev, dates }));
  };

  const handleSavePreset = () => {
    const preset = {
      brand: manualForm.brand,
      platform: manualForm.platform,
      shift: manualForm.shift,
      studio: manualForm.studio,
    };
    localStorage.setItem("liva_manual_form_preset", JSON.stringify(preset));
    customAlert("Preset konfigurasi berhasil disimpan!");
  };

  const handleLoadPreset = () => {
    const saved = localStorage.getItem("liva_manual_form_preset");
    if (saved) {
      const preset = JSON.parse(saved);
      setManualForm(prev => ({ ...prev, ...preset }));
      customAlert("Preset berhasil dimuat!");
    } else {
      customAlert("Tidak ada preset yang tersimpan.");
    }
  };

  const handleManualLogSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let targetHostIds = manualForm.isBulkHost
        ? manualForm.hostIds
        : [manualForm.hostId];
      if (targetHostIds.length === 0 && manualForm.hostId) {
        targetHostIds = [manualForm.hostId];
      }
      if (targetHostIds.length === 0 && hosts.length > 0) {
        targetHostIds = [hosts[0].id];
      }

      const matchedHosts = hosts.filter((h) => targetHostIds.includes(h.id));
      if (matchedHosts.length === 0) {
        customAlert("Gagal: Tidak ada host yang dipilih.");

        return;
      }

      let targetDates: string[] = [];
      if (manualForm.isBulkDate) {
        // filter out empty dates and ensure uniqueness
        targetDates = Array.from(
          new Set(manualForm.dates.filter((d) => Boolean(d))),
        );
      } else {
        if (!manualForm.date) {
          customAlert("Gagal: Tanggal tidak boleh kosong.");

          return;
        }
        targetDates = [manualForm.date];
      }

      if (targetDates.length === 0) {
        customAlert("Gagal: Minimal harus ada satu tanggal yang valid.");

        return;
      }

      const newLogs: AttendanceLog[] = [];
      targetDates.forEach((dateStr, dIdx) => {
        matchedHosts.forEach((targetedHost, hIdx) => {
          const randomOrders =
            manualForm.status === "Absent"
              ? 0
              : Math.floor(Math.random() * 200) + 100;
          const randomRevenue =
            manualForm.status === "Absent" ? 0 : randomOrders * 60000;
          newLogs.push({
            id: `log_manual_${Date.now()}_${dIdx}_${hIdx}`,
            hostId: targetedHost.id,
            hostName: targetedHost.name,
            employeeId: targetedHost.employeeId,
            date: dateStr,
            shiftHours: manualForm.shift,
            platform: manualForm.platform,
            brandHandled: manualForm.brand,
            studio: manualForm.studio,
            liveDuration: manualForm.status === "Absent" ? 0 : 4,
            sessionCount: manualForm.status === "Absent" ? 0 : 1,
            status: manualForm.status,
            revenueGenerated: randomRevenue,
            conversionRate: manualForm.status === "Absent" ? 0 : 3.8,
            engagementRate: manualForm.status === "Absent" ? 0 : 7.2,
            orders: randomOrders,
            overtimeHours: manualForm.overtimeHours,
            isBackupShift: manualForm.isBackupShift,
          });
        });
      });

      if (newLogs.length > 0) {
        if (typeof logsApi !== "undefined" && logsApi.createMany) {
          await logsApi.createMany(newLogs);
        }
        setLogs((prev: AttendanceLog[]) => [...newLogs, ...prev]);
        customAlert(
          `✅ Berhasil menyimpan ${newLogs.length} data absensi manual.`,
        );
        // PHASE 4: Keep form open and reset only dynamic fields
        setManualForm(prev => ({
          ...prev,
          dates: [new Date().toISOString().split("T")[0]],
          date: new Date().toISOString().split("T")[0],
          status: "Present",
          overtimeHours: 0,
          isBackupShift: false,
        }));
      }
      // setShowManualForm(false); removed in Phase 4
    } catch (err: unknown) {
      alert("Error: " + getErrorMessage(err));
    }
  };

  const handleDeleteLog = (id: string) => {
    requestConfirm(
      "Hapus Data Absensi",
      "Apakah Anda yakin ingin menghapus data absensi ini?",
      async () => {
        try {
          if (typeof logsApi !== "undefined" && logsApi.delete) {
            await logsApi.delete(id);
          }
          setLogs((prev) => prev.filter((l) => l.id !== id));
        } catch (error) {
          console.error("Gagal menghapus log:", error);
          customAlert("Gagal menghapus data log dari server.");
        }
      },
    );
  };

  const handleCalendarSaveLog = async (log: AttendanceLog) => {
    try {
      const isExisting = logs.some((l) => l.id === log.id);
      if (isExisting) {
        if (typeof logsApi !== "undefined" && logsApi.update) {
          await logsApi.update(log.id, log);
        }
        setLogs((prev) => prev.map((l) => (l.id === log.id ? log : l)));
      } else {
        if (typeof logsApi !== "undefined" && logsApi.create) {
          await logsApi.create(log);
        }
        setLogs((prev) => [log, ...prev]);
      }
      customAlert("✅ Data absensi kalender berhasil disimpan.");
    } catch (error) {
      console.error("Gagal menyimpan log:", error);
      customAlert("Gagal menyimpan data absensi ke server.");
      throw error;
    }
  };

  const handleCalendarDeleteLog = async (id: string) => {
    try {
      if (typeof logsApi !== "undefined" && logsApi.delete) {
        await logsApi.delete(id);
      }
      setLogs((prev) => prev.filter((l) => l.id !== id));
      customAlert("✅ Data absensi berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus log:", error);
      customAlert("Gagal menghapus data absensi dari server.");
      throw error;
    }
  };

  const handleUpdateLogStatus = async (
    id: string,
    newStatus: "Present" | "Late" | "Absent" | "Excused",
  ) => {
    const logToUpdate = logs.find((l) => l.id === id);
    if (!logToUpdate) return;
    
    const updatedLog = { ...logToUpdate, status: newStatus };
    
    try {
      if (typeof logsApi !== "undefined" && logsApi.update) {
        await logsApi.update(id, updatedLog);
      }
      setLogs((prev) =>
        prev.map((l) => (l.id === id ? updatedLog : l)),
      );
    } catch (error) {
      console.error("Gagal update status log:", error);
      customAlert("Gagal mengupdate status ke server.");
    }
  };

  const handleBulkMarkPresent = async () => {
    if (selectedLogIds.length === 0) return;
    try {
      const logsToUpdate = logs.filter(l => selectedLogIds.includes(l.id)).map(l => ({ ...l, status: "Present" as const }));
      if (typeof logsApi !== "undefined" && logsApi.updateMany) {
        await logsApi.updateMany(logsToUpdate);
      }
      setLogs((prev) =>
        prev.map((log) => {
          if (selectedLogIds.includes(log.id)) {
            return { ...log, status: "Present" };
          }
          return log;
        }),
      );
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Gagal bulk update status:", error);
      customAlert("Gagal mengupdate status secara massal.");
    }
  };

  const handleBulkMarkLate = async () => {
    if (selectedLogIds.length === 0) return;
    try {
      const logsToUpdate = logs.filter(l => selectedLogIds.includes(l.id)).map(l => ({ ...l, status: "Late" as const }));
      if (typeof logsApi !== "undefined" && logsApi.updateMany) {
        await logsApi.updateMany(logsToUpdate);
      }
      setLogs((prev) =>
        prev.map((log) => {
          if (selectedLogIds.includes(log.id)) {
            return { ...log, status: "Late" };
          }
          return log;
        }),
      );
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Gagal bulk update status:", error);
      customAlert("Gagal mengupdate status secara massal.");
    }
  };

  const handleBulkMarkAbsent = async () => {
    if (selectedLogIds.length === 0) return;
    try {
      const logsToUpdate = logs.filter(l => selectedLogIds.includes(l.id)).map(l => ({ ...l, status: "Absent" as const }));
      if (typeof logsApi !== "undefined" && logsApi.updateMany) {
        await logsApi.updateMany(logsToUpdate);
      }
      setLogs((prev) =>
        prev.map((log) => {
          if (selectedLogIds.includes(log.id)) {
            return { ...log, status: "Absent" };
          }
          return log;
        }),
      );
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Gagal bulk update status:", error);
      customAlert("Gagal mengupdate status secara massal.");
    }
  };

  const handleBulkMarkExcused = async () => {
    if (selectedLogIds.length === 0) return;
    try {
      const logsToUpdate = logs.filter(l => selectedLogIds.includes(l.id)).map(l => ({ ...l, status: "Excused" as const }));
      if (typeof logsApi !== "undefined" && logsApi.updateMany) {
        await logsApi.updateMany(logsToUpdate);
      }
      setLogs((prev) =>
        prev.map((log) => {
          if (selectedLogIds.includes(log.id)) {
            return { ...log, status: "Excused" };
          }
          return log;
        }),
      );
      setSelectedLogIds([]);
    } catch (error) {
      console.error("Gagal bulk update status:", error);
      customAlert("Gagal mengupdate status secara massal.");
    }
  };

  const handleConfirmMapping = async () => {
    if (!uploadBrand || !uploadPlatform) return;
    const rb = clientBrands.find((b) => b.name === uploadBrand);
    const targetId = rb ? rb.id : uploadBrand;
    const parsedData = buildMappedUploadRows(
      mappingRawData as unknown[][],
      columnMapping,
      uploadPlatform,
    );

    if (parsedData.length > 0) {
      const newUploadId = "upl-" + Date.now();

      // Bangun batch record untuk API (format UploadHistoryEntry)
      const batchRecord: UploadHistoryEntry = {
        id: newUploadId,
        brandId: rb?.id,
        brandName: uploadBrand,
        platform: uploadPlatform,
        fileName: selectedFile?.name || "Mapped File",
        uploadedAt: new Date().toISOString(),
        rowCount: parsedData.length,
        gmv: parsedData.reduce((sum, r) => sum + (r.gmv || 0), 0),
        reportType: "live",
      };

      // Konversi MappingUploadRow[] ke BrandPerformanceLogEntry[] untuk API
      // MappingUploadRow is a minimal type; cast via unknown to access optional fields
      const apiRows: BrandPerformanceLogEntry[] = parsedData.map((rawPd) => {
        const pd = rawPd as unknown as BrandReportRow;
        return {
          id: `${newUploadId}_${rawPd.name}_${rawPd.platform}`.replace(/\s+/g, "_"),
          batchId: newUploadId,
          brandId: targetId,
          brandName: uploadBrand,
          platform: uploadPlatform,
          title: rawPd.name,
          date: pd.date || rawPd.name,
          dateTime: pd.dateTime,
          reportType: "live",
          shift: pd.shift,
          gmv: rawPd.gmv,
          products_sold: rawPd.items_sold,
          buyers: pd.buyers,
          aov: pd.aov,
          views: rawPd.views,
          impressions: rawPd.impressions,
          penonton: rawPd.viewers,
          liveVisits: pd.liveVisits,
          productImpressions: pd.productImpressions,
          clicks: rawPd.clicks,
          orders: rawPd.orders,
          followers: pd.followers,
          likes: pd.likes,
          shares: pd.shares,
          comments: pd.comments,
          avgViewDuration: pd.avgViewDuration,
          peakViewers: pd.peakViewers,
          shopVouchers: pd.shopVouchers,
          specialVouchers: pd.specialVouchers,
          coinsClaimed: pd.coinsClaimed,
          hasFunnelInFile: pd.hasFunnelInFile,
        };
      });

      try {
        // Simpan ke MySQL terlebih dahulu (agar data tidak hilang saat refresh)
        await reportingBrandApi.createBatch({
          batch: batchRecord,
          rows: apiRows,
        });

        // Setelah berhasil disimpan, update state lokal
        setBrandReports((prev) => {
          const existingData = prev[targetId] || [];
          const merged = [...existingData];
          parsedData.forEach((pd) => {
            const rowWithUploadId: BrandReportRow = {
              ...pd,
              uploadId: newUploadId,
            };
            const idx = merged.findIndex(
              (m) => m.name === rowWithUploadId.name && m.platform === rowWithUploadId.platform,
            );
            if (idx >= 0) merged[idx] = rowWithUploadId;
            else merged.push(rowWithUploadId);
          });
          merged.sort(
            (a, b) =>
              new Date(a.name).getTime() - new Date(b.name).getTime() || 0,
          );
          return { ...prev, [targetId]: merged };
        });

        setBrandUploadHistory((prev) => [...prev, batchRecord]);
        setUploadHistory((prev) => [
          {
            ...batchRecord,
            brand: uploadBrand,
            filename: selectedFile?.name || "Mapped File",
            date: new Date().toISOString(),
            rowsAdded: parsedData.length,
          },
          ...prev,
        ]);

        if (rb) {
          setActiveReportBrandId(rb.id);
        }

        setIsUploadModalOpen(false);
        setShowMappingModal(false);
        setMappingRawData([]);
        setMappingHeaders([]);
        customAlert(
          `File ${selectedFile?.name} untuk brand ${uploadBrand} berhasil disinkronisasi! (${parsedData.length} baris)`,
        );
      } catch (error) {
        console.error("Gagal menyimpan mapping upload ke MySQL:", error);
        customAlert("Gagal menyimpan data mapping ke server. Coba lagi.");
      }
    } else {
      customAlert(
        "Tidak ada data valid yang bisa disinkronkan dari hasil pemetaan ini.",
      );
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
      onConfirm: async () => {
        try {
          if (typeof logsApi !== "undefined" && logsApi.deleteMany) {
            await logsApi.deleteMany(selectedLogIds);
          }
          setLogs((prev) =>
            prev.filter((log) => !selectedLogIds.includes(log.id)),
          );
          setSelectedLogIds([]);
          setConfirmModal(null);
        } catch (error) {
          console.error("Gagal hapus massal:", error);
          customAlert("Gagal menghapus log secara massal dari server.");
        }
      },
    });
  };

  const handleClearAllData = () => {
    requestConfirm(
      "Hapus Semua Data",
      "PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data Host, Log Absen, Daftar Klien, dan Leads dari database cloud? Data tidak dapat dikembalikan.",
      () => {
        customAlert("Semua data di database cloud berhasil dikosongkan.");
      },
      "danger",
    );
  };

  const handleRecoverLocalStorage = () => {
    requestConfirm(
      "Pulihkan Data Lokal",
      "Apakah Anda ingin mencoba menarik kembali data (Host, Log Absensi, Daftar Klien, Leads) yang mungkin tersimpan di perangkat lokal Anda ke dalam Database Cloud?",
      () => {
        recoverCollectionsFromLocalStorage(syncToFirestore);

        customAlert(
          `Berhasil memeriksa dan menyinkronkan data lokal. (Menemukan dan mencoba memulihkan item)`,
        );
      },
      "warning",
    );
  };

  const handleExportJSON = () => {
    try {
      const backupData = buildDatabaseBackupPayload({
        hosts,
        logs,
        clientBrands,
        clientLeads,
        schedules,
        brands,
        shifts,
        studios,
        platforms,
      });
      const dataStr = createBackupDownloadHref(backupData);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", getBackupFilename());
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      customAlert("Berhasil mengunduh berkas backup data JSON!");
    } catch (err: unknown) {
      customAlert("Gagal mengekspor data: " + getErrorMessage(err));
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const backupCollections = extractBackupImportCollections(parsed);
          if (!backupCollections || !hasAnyBackupCollections(backupCollections)) {
            customAlert("Format berkas backup JSON tidak valid!");
            return;
          }

          requestConfirm(
            "Impor & Timpa Database",
            "Apakah Anda yakin ingin mengganti seluruh data saat ini (Host, Log Absensi, Klien, Leads, Jadwal, Brand, Platform, Shift, dan Studio) dengan data dari file JSON ini? Seluruh data real di cloud juga akan diperbarui.",
            () => {
              if (backupCollections.hosts) {
                const currentHostsById = new Map<string, HostEmployee>(
                  hosts.map((host) => [host.id, host] as const),
                );
                const importedHosts = (backupCollections.hosts || []) as HostEmployee[];
                setHosts(
                  importedHosts.map((importedHost: HostEmployee) => {
                    const hostId = importedHost.id || "";
                    const currentHost = currentHostsById.get(hostId);
                    const normalizedStudio = normalizeHostStudioLocation(
                      importedHost.studio || currentHost?.studio || "",
                    );

                    return {
                      ...(currentHost || {}),
                      ...importedHost,
                      studio: normalizedStudio || importedHost.studio || currentHost?.studio,
                      hasPassword:
                        importedHost.hasPassword ?? currentHost?.hasPassword ?? false,
                    } as HostEmployee;
                  }),
                );
              }
              if (backupCollections.logs) setLogs(backupCollections.logs);
              if (backupCollections.clientBrands)
                setClientBrands(backupCollections.clientBrands);
              if (backupCollections.clientLeads)
                setClientLeads(backupCollections.clientLeads);
              if (backupCollections.schedules)
                setSchedules(backupCollections.schedules);
              if (backupCollections.brands) setBrands(backupCollections.brands);
              if (backupCollections.shifts) setShifts(backupCollections.shifts);
              if (backupCollections.studios)
                setStudios(backupCollections.studios);
              if (backupCollections.platforms)
                setPlatforms(backupCollections.platforms);

              customAlert(
                "Database berhasil diimpor & disinkronkan ke Cloud dari file JSON secara real-time!",
              );
            },
            "warning",
          );
        } catch (err: unknown) {
          customAlert("Gagal membaca file JSON: " + getErrorMessage(err));
        }
      };
    }
  };


  return (
    <div
      className="min-h-screen bg-[#f9f8fc] text-[#3c2f56] flex flex-col font-sans selection:bg-purple-500 selection:text-white relative"
      id="main_container"
    >
      {isQuotaExceeded && !isQuotaBannerDismissed && (
        <div id="quota_exceeded_banner_main" className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 shadow-sm flex items-start justify-between gap-3 sticky top-0 z-[999]">
          <div className="flex gap-3 items-start">
            <span className="text-xl mt-0.5" role="img" aria-label="warning">⚠️</span>
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold text-amber-950 block sm:inline">Batas Kuota Google Firestore Terlampaui (Mode Offline Aktif)</span>
              <span className="sm:ml-2 text-amber-800 leading-relaxed block sm:inline">
                Kuota harian basis data gratis untuk Workspace ini telah habis hari ini. Sistem beralih ke Mode Offline / Cache lokal secara otomatis. Anda tetap dapat menginput/mengedit data secara lokal di perangkat Anda sekarang. Semua perubahan offline Anda disimpan secara lokal dan akan disinkronisasikan otomatis ketika Google menyetel ulang batas kuota basis data harian harian (biasanya setiap pukul 15:00 WIB / 00:00 PST).
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsQuotaBannerDismissed(true)}
            className="text-amber-500 hover:text-amber-700 transition font-black text-lg leading-none cursor-pointer self-center px-1 py-0.5"
            title="Sembunyikan peringatan"
          >
            ×
          </button>
        </div>
      )}
      {confirmState && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-[#0f172a]/50 p-4 flex items-start justify-center pt-[15vh] pb-10"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 animate-scaleUp">
            <h3 className="font-black text-slate-800 mb-3 text-lg">
              Konfirmasi
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">
              {confirmState.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmState(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {alertState && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto bg-[#0f172a]/50 p-4 flex items-start justify-center pt-[15vh] pb-10"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 animate-scaleUp">
            <h3 className="font-black text-slate-800 mb-3 text-lg">
              Informasi
            </h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-medium">
              {alertState.message}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertState(null)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {!loggedInHostId && !isOperatorLoggedIn && !loggedInClientBrandId && (
        <div className="flex-1 flex flex-col justify-center items-center p-4">
          {activeRole === null ? (
            /* ROLE SELECTION SCREEN */
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full animate-fadeIn block mx-auto text-center">
              <LivaLogo className="mx-auto" url={agencyLogoUrl} />
              <h2 className="text-[17px] font-extrabold text-[#111827] mt-3 tracking-tight">
                Portal Login
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold mt-1 mb-8">
                Pilih jalur akses Anda ke dalam sistem Liva Agency
              </p>
              
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/login/admin");
                  setActiveRole("operator");
                }}
                className="w-full bg-[#111827] text-white font-black py-4 rounded-xl text-[13px] tracking-widest uppercase shadow-xl hover:-translate-y-0.5 transition-all mb-4 cursor-pointer"
              >
                Host & Admin
              </button>
              
              <button
                onClick={() => {
                  window.history.pushState({}, "", "/login/brand");
                  setActiveRole("client");
                }}
                className="w-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-black py-4 rounded-xl text-[13px] tracking-widest uppercase hover:bg-indigo-100 transition-all cursor-pointer"
              >
                Brand Partner
              </button>
            </div>
          ) : activeRole === "client" ? (
            /* BRAND LOGIN PAGE - COMPLETELY SEPARATED */
            <div className="bg-white p-8 rounded-3xl border border-indigo-150 shadow-xl max-w-sm w-full animate-fadeIn block mx-auto">
              <div className="flex justify-start mb-2">
                <button
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    setActiveRole(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-slate-800 font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  ← Kembali
                </button>
              </div>
              <div className="text-center mb-6">
                <LivaLogo className="" url={agencyLogoUrl} />
                <span className="bg-indigo-50 border border-indigo-100 text-[#5642f5] font-black text-[9px] tracking-wider uppercase px-3 py-1 rounded-full mt-4 inline-block">
                  Portal Partner Brand & Klien
                </span>
                <h2 className="text-[17px] font-extrabold text-[#111827] mt-3 tracking-tight">
                  Liva Agency • Performance Portal
                </h2>
                <p className="text-[11px] text-slate-500 font-semibold mt-1">
                  Pantau laporan performa dan statistik live streaming brand
                  Anda
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const enteredUser = clientLoginUsername.trim().toLowerCase();

                  if (!enteredUser) {
                    setHostError(
                      "Silakan masukkan username portal terlebih dahulu!",
                    );
                    return;
                  }

                  try {
                    const session = await authApi.login(
                      "brand",
                      enteredUser,
                      clientLoginPass,
                    );
                    setAuthSession(session);
                    setLoggedInClientBrandId(session.subjectId);
                    setClientLoginUsername("");
                    setClientLoginPass("");
                    setHostError("");
                  } catch (error) {
                    setHostError(
                      error instanceof Error
                        ? error.message
                        : "Username atau password brand klien tidak sesuai!",
                    );
                  }
                }}
                className="space-y-4 font-sans animate-fadeIn"
              >
                {hostError && (
                  <div className="bg-red-50 border border-red-100 text-rose-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                    ⚠️ {hostError}
                  </div>
                )}
                <div className="text-left">
                  <label htmlFor="brand-login-username" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                    Username Portal Klien:
                  </label>
                  <input
                    id="brand-login-username"
                    name="username"
                    autoComplete="username"
                    type="text"
                    required
                    value={clientLoginUsername}
                    onChange={(e) => setClientLoginUsername(e.target.value)}
                    placeholder="Masukkan username brand Anda"
                    className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-2.5 py-2 text-xs text-purple-950 focus:outline-none focus:border-purple-500 font-bold"
                  />
                </div>

                <div className="text-left">
                  <label htmlFor="brand-login-password" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                    Password Portal:
                  </label>
                  <input
                    id="brand-login-password"
                    name="password"
                    autoComplete="current-password"
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
                  className="w-full relative group overflow-hidden bg-[#111827] text-white font-black py-3.5 rounded-xl text-[13px] tracking-widest uppercase transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-0.5 cursor-pointer mt-6 flex justify-center items-center gap-2 border border-slate-800"
                >
                  <span className="relative z-10">Masuk Portal</span>
                  <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </form>

              <div className="text-center mt-6 pt-5 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Harap hubungi Admin Agency untuk detail akun Anda.
                </span>
              </div>
            </div>
          ) : (
            /* HOST & ADMIN LOGIN PORTAL - COMPLETELY SEPARATED FROM BRAND */
            <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-xl max-w-sm w-full animate-fadeIn block mx-auto">
              <div className="flex justify-start mb-2">
                <button
                  onClick={() => {
                    window.history.pushState({}, "", "/");
                    setActiveRole(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-purple-800 font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
                >
                  ← Kembali
                </button>
              </div>
              <div className="text-center mb-4">
                <LivaLogo className="" url={agencyLogoUrl} />
                <h2 className="text-[16px] font-black text-purple-950 mt-4">
                  {activeRole === "host"
                    ? "Login Streamer (Host)"
                    : "Login Master Admin"}
                </h2>
                <p className="text-[11px] text-purple-500 font-semibold mt-1">
                  {activeRole === "host"
                    ? "Masuk ke portal absensi dan jadwal"
                    : "Sistem manajemen operasional Agency"}
                </p>
              </div>

              <div className="bg-purple-50 p-1 rounded-xl mb-6 border border-purple-100 flex flex-wrap gap-1">
                <button
                  onClick={() => {
                    window.history.pushState({}, "", "/login/host");
                    setActiveRole("host");
                    setHostError("");
                    setHostLoginUser("");
                    setHostLoginPass("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${activeRole === "host" ? "bg-white text-purple-700 shadow-xs" : "text-purple-500 hover:text-purple-700"}`}
                >
                  Host App
                </button>
                <button
                  onClick={() => {
                    window.history.pushState({}, "", "/login/admin");
                    setActiveRole("operator");
                    setHostError("");
                    setHostLoginUser("");
                    setHostLoginPass("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all cursor-pointer ${activeRole === "operator" ? "bg-purple-700 text-white shadow-xs" : "text-purple-500 hover:text-purple-700"}`}
                >
                  Admin
                </button>
              </div>

              {activeRole === "host" ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const session = await authApi.login(
                        "host",
                        hostLoginUser.trim(),
                        hostLoginPass,
                      );
                      setAuthSession(session);
                      setLoggedInHostId(session.subjectId);
                      setHostLoginUser("");
                      setHostLoginPass("");
                      setHostError("");
                    } catch (error) {
                      setHostError(
                        error instanceof Error
                          ? error.message
                          : "Username Host atau Password salah!",
                      );
                    }
                  }}
                  className="space-y-4 font-sans animate-fadeIn"
                >
                  {hostError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                      ⚠️ {hostError}
                    </div>
                  )}
                  <div className="text-left">
                    <label htmlFor="host-login-username" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                      Username Host:
                    </label>
                    <input
                      id="host-login-username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      required
                      value={hostLoginUser}
                      onChange={(e) => setHostLoginUser(e.target.value)}
                      placeholder="Misal: amandaputri"
                      className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 font-sans focus:outline-none focus:border-purple-500 font-bold"
                    />
                  </div>

                  <div className="text-left">
                    <label htmlFor="host-login-password" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                      Password:
                    </label>
                    <input
                      id="host-login-password"
                      name="password"
                      autoComplete="current-password"
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
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const session = await authApi.login(
                        "admin",
                        hostLoginUser.trim(),
                        hostLoginPass,
                      );
                      setAuthSession(session);
                      setIsOperatorLoggedIn(true);
                      setLoggedInAdminId(
                        session.role === "admin" ? session.subjectId : null,
                      );
                      setHostLoginUser("");
                      setHostLoginPass("");
                      setHostError("");
                      if (session.accessTabs?.length) {
                        setOperatorTab(session.accessTabs[0] as AdminTab);
                      }
                    } catch (error) {
                      setHostError(
                        error instanceof Error
                          ? error.message
                          : "ID Admin atau Password Admin salah!",
                      );
                    }
                  }}
                  className="space-y-4 font-sans animate-fadeIn"
                >
                  {hostError && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] py-1.5 px-2 rounded-lg font-bold text-center">
                      ⚠️ {hostError}
                    </div>
                  )}
                  <div className="text-left">
                    <label htmlFor="admin-login-username" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                      ID Admin Master:
                    </label>
                    <input
                      id="admin-login-username"
                      name="username"
                      autoComplete="username"
                      type="text"
                      required
                      value={hostLoginUser}
                      onChange={(e) => setHostLoginUser(e.target.value)}
                      placeholder="ID Admin"
                      className="w-full bg-[#fcfbfe] border border-purple-150 rounded-lg px-3 py-2 text-xs text-purple-950 font-sans focus:outline-none focus:border-purple-500 font-bold"
                    />
                  </div>

                  <div className="text-left">
                    <label htmlFor="admin-login-password" className="block text-[10px] text-purple-950 font-black uppercase mb-1 font-mono">
                      Password Admin:
                    </label>
                    <input
                      id="admin-login-password"
                      name="password"
                      autoComplete="current-password"
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
                </form>
              )}

              <div className="text-center mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, "", "/login/brand");
                    setActiveRole("client");
                    setHostError("");
                    setHostLoginUser("");
                    setHostLoginPass("");
                  }}
                  className="text-[11px] text-[#5642f5] hover:text-[#422ff2] font-black transition-all cursor-pointer hover:underline"
                >
                  Masuk ke Portal Partner Brand Klien →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MAIN PAGE VIEWPORTS CONTROLLER --- */}
      {loggedInHostId && (
        <main
          className="flex-1 w-full px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 md:px-6 md:pt-6 lg:px-8"
          id="system-main-viewport"
        >
          <div
            className="mx-auto flex w-full max-w-[460px] flex-col py-1"
            id="view_host_wrapper"
          >
            <div className="flex min-h-[100dvh] flex-col rounded-[28px] border border-slate-200 bg-slate-50/95 px-3 pb-4 pt-4 text-slate-700 shadow-sm sm:px-4">
              {/* Host Authenticated Profile */}
              <div
                className="mb-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm animate-fadeIn"
                id="auth_host_profile_card"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <label className="relative block cursor-pointer group">
                        <img
                          src={
                            activeHostObj?.avatar ||
                            getAvatarUrl(activeHostObj?.name || "Host")
                          }
                          alt={activeHostObj?.name}
                          referrerPolicy="no-referrer"
                          className="size-12 rounded-full object-cover ring-2 ring-violet-100 transition-opacity group-hover:opacity-80"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && activeHostObj)
                              handleAvatarUpload(activeHostObj.id, file);
                          }}
                          className="hidden"
                        />
                      </label>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-violet-700">
                          Host Connect
                        </span>
                        <h4 className="mt-2 truncate text-base font-black leading-tight text-slate-950">
                          {activeHostObj?.name}
                        </h4>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[11px] font-semibold text-slate-500">
                            ID: {activeHostObj?.employeeId}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-violet-600" />
                            <span className="truncate">
                              {activeHostObj?.studio || "Studio Bandar Lampung"}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Buka notifikasi jadwal host"
                          onClick={() => {
                            setIsHostNotificationOpen(
                              !isHostNotificationOpen,
                            );
                            if (!isHostNotificationOpen && activeHostObj) {
                              markHostNotificationsAsRead(activeHostObj.id);
                            }
                          }}
                          className="relative inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Bell className="h-4.5 w-4.5 text-violet-600" />
                          {hostNotifications.filter(
                            (n) => n.hostId === activeHostObj?.id && !n.read,
                          ).length > 0 && (
                            <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
                          )}
                        </button>

                        {isHostNotificationOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setIsHostNotificationOpen(false)}
                            />
                            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                                <h4 className="text-xs font-black text-slate-900">
                                  Notifikasi Jadwal
                                </h4>
                              </div>
                              <div className="max-h-[280px] overflow-y-auto">
                                {hostNotifications.filter(
                                  (n) => n.hostId === activeHostObj?.id,
                                ).length === 0 ? (
                                  <div className="px-4 py-8 text-center">
                                    <Bell className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-500">
                                      Tidak ada update.
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                      Semua jadwal Anda sudah aman.
                                    </p>
                                  </div>
                                ) : (
                                  hostNotifications
                                    .filter((n) => n.hostId === activeHostObj?.id)
                                    .map((notif) => (
                                      <div
                                        key={notif.id}
                                        className="border-b border-slate-100 px-4 py-3 text-left last:border-b-0"
                                      >
                                        <div className="text-[11px] font-black text-slate-800">
                                          {notif.title}
                                        </div>
                                        <div className="mt-1 text-[10px] leading-relaxed text-slate-600">
                                          {notif.message}
                                        </div>
                                        <div className="mt-1.5 text-[8px] font-bold text-slate-400">
                                          {new Date(
                                            notif.createdAt,
                                          ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </div>
                                      </div>
                                    ))
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-black uppercase tracking-wide text-red-600 transition-colors hover:bg-red-100"
                        id="host_logout_button"
                      >
                        LOG OUT
                      </button>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-700">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                      Panduan singkat
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 text-pretty">
                      Pilih tab, isi form absen, lalu kirim. Riwayat dan
                      kalender membantu kamu cek jadwal tanpa harus tanya admin.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "1. Absen masuk",
                        "2. Cek rekap",
                        "3. Lihat kalender",
                      ].map((step) => (
                        <span
                          key={step}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold text-slate-600"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Automatically Recorded Clock Widget Removed */}

              {/* Gated Access Area for Host Interactive Controls */}
              {loggedInHostId && (
                <>
                  {/* TAB SWITCHER WITHIN MOBILE VIEW (FORM vs HISTORY COUTERS vs CALENDAR) */}
                  <div
                    className="mb-5 grid grid-cols-3 rounded-2xl border border-slate-200 bg-slate-100 p-1"
                    id="host_sub_tab_switcher"
                  >
                    <button
                      onClick={() => setHostActiveSubTab("form")}
                      aria-pressed={hostActiveSubTab === "form"}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-black transition-colors cursor-pointer ${
                        hostActiveSubTab === "form"
                          ? "bg-white text-violet-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      id="host_sub_tab_form_trigger"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Absen
                    </button>
                    <button
                      onClick={() => setHostActiveSubTab("history")}
                      aria-pressed={hostActiveSubTab === "history"}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-black transition-colors cursor-pointer ${
                        hostActiveSubTab === "history"
                          ? "bg-white text-violet-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      id="host_sub_tab_history_trigger"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      Rekap
                    </button>
                    <button
                      onClick={() => setHostActiveSubTab("calendar")}
                      aria-pressed={hostActiveSubTab === "calendar"}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-black transition-colors cursor-pointer ${
                        hostActiveSubTab === "calendar"
                          ? "bg-white text-violet-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      id="host_sub_tab_calendar_trigger"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      Kalender
                    </button>
                  </div>

                  {/* FORM SECTION CONTAINER */}
                  <div
                    id="form-section"
                    className={
                      hostActiveSubTab === "form"
                        ? "flex-1 flex flex-col"
                        : "hidden"
                    }
                  >
                    <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Form absensi hari ini
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-600 text-pretty">
                        Isi data di bawah sesuai jadwal yang sedang kamu jalani.
                        Kalau ada yang belum terisi, pilih dulu sebelum submit.
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold sm:grid-cols-4">
                        {[
                          {
                            label: "Brand",
                            value: hostForm.brand || "Pilih brand",
                          },
                          {
                            label: "Platform",
                            value: hostForm.platform || "Pilih platform",
                          },
                          {
                            label: "Shift",
                            value: hostForm.shift || "Pilih shift",
                          },
                          {
                            label: "Studio",
                            value: hostForm.studio || "Pilih studio",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                          >
                            <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
                              {item.label}
                            </div>
                            <div className="mt-1 truncate text-slate-700">
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LATE CHECK-IN SPECIFIC DETAILED NOTIFICATION ALERT */}
                    <AnimatePresence>
                      {showLateAlert && lateCheckInDetails && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -15 }}
                          className="relative mb-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-sm"
                          id="host_late_alert_notification"
                        >
                          <div className="absolute -right-4 -top-4 opacity-10">
                            <Clock className="h-20 w-20 text-amber-700 animate-spin-slow" />
                          </div>
                          <div className="flex gap-3 items-start relative z-10">
                            <div className="flex-shrink-0 rounded-lg bg-white p-1.5 text-amber-600 shadow-sm">
                              <AlertTriangle className="w-4.5 h-4.5" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                                SYSTEM ALARM: TERLAMBAT!
                              </h4>
                              <p className="mt-0.5 text-[11px] font-bold leading-snug text-pretty">
                                Absensi Anda terhitung terlambat melewati batas
                                jam mulai shift kerja.
                              </p>
                              <div className="mt-2.5 space-y-0.5 rounded-xl border border-amber-200 bg-white p-2 font-mono text-[9px]">
                                <div className="flex justify-between">
                                  <span className="text-amber-700/70">
                                    Waktu Absen:
                                  </span>
                                  <span className="font-extrabold text-amber-950">
                                    {lateCheckInDetails.time} WIB
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-amber-700/70">
                                    Shift Terpilih:
                                  </span>
                                  <span className="font-extrabold text-amber-900">
                                    {lateCheckInDetails.shift}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-amber-700/70">
                                    Terlambat:
                                  </span>
                                  <span className="font-extrabold text-rose-600">
                                    ⏱ +{lateCheckInDetails.diffMinutes} menit
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowLateAlert(false)}
                              className="text-white/75 hover:text-white bg-white/10 hover:bg-white/20 p-1 rounded-md transition-all ml-1"
                              title="Tutup Notifikasi"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {showFormSuccess && (
                      <div
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl mb-4 text-xs flex gap-2 items-start shadow-sm"
                        id="submit-success-banner"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="font-semibold">
                          {submittedMessage}
                        </span>
                      </div>
                    )}

                    {hostFormError && (
                      <div
                        className="bg-red-50 border border-red-150 text-red-700 p-3 rounded-xl mb-4 text-xs flex gap-2 items-center font-bold"
                        id="host_form_error_banner"
                      >
                        <span>⚠️ {hostFormError}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleHostAttendanceSubmit}
                      className="flex flex-1 flex-col justify-between space-y-4"
                      id="host-attendance-form"
                    >
                      <div className="space-y-3.5">
                        {/* BRAND MATCH SELECTION */}
                        <div>
                          <label className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                            <span>Brand Besutan:</span>
                            {!hostForm.brand && (
                              <span className="text-[10px] text-red-500 font-bold">
                                *Wajib diisi
                              </span>
                            )}
                          </label>
                          <select
                            id="form_input_brand"
                            required
                            value={hostForm.brand}
                            onChange={(e) => {
                              setHostFormError("");
                              setHostForm((prev) => ({
                                ...prev,
                                brand: e.target.value,
                              }));
                            }}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-black transition-all shadow-sm focus:border-violet-500 focus:outline-none ${!hostForm.brand ? "border-red-200 text-slate-400" : "border-slate-200 text-slate-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className="text-purple-300 font-normal"
                            >
                              -- Pilih Brand Besutan --
                            </option>
                            {Array.from(
                              new Set([
                                hostForm.brand,
                                ...(clientBrands.length > 0 ? clientBrands.map((cb) => cb.name) : brands)
                              ].map(b => b?.trim()).filter(Boolean)),
                            )
                              .filter(Boolean)
                              .map((b) => (
                                <option
                                  key={b}
                                  value={b}
                                  className="text-purple-950 font-semibold"
                                >
                                  {b}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* PLATFORM MATCH SELECTION */}
                        <div>
                          <label className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                            <span>Platform Streaming:</span>
                            {!hostForm.platform && (
                              <span className="text-[10px] text-red-500 font-bold">
                                *Wajib diisi
                              </span>
                            )}
                          </label>
                          <select
                            id="form_input_platform"
                            required
                            value={hostForm.platform}
                            onChange={(e) => {
                              setHostFormError("");
                              setHostForm((prev) => ({
                                ...prev,
                                platform: e.target.value,
                              }));
                            }}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-black transition-all shadow-sm focus:border-violet-500 focus:outline-none ${!hostForm.platform ? "border-red-200 text-slate-400" : "border-slate-200 text-slate-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className="text-purple-300 font-normal"
                            >
                              -- Pilih Platform Streaming --
                            </option>
                            {platforms.map((p) => (
                              <option
                                key={p}
                                value={p}
                                className="text-purple-950 font-semibold"
                              >
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* SHIFT SELECTION */}
                        <div>
                          <label className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                            <span>Shift Kerja Live:</span>
                            {!hostForm.shift && (
                              <span className="text-[10px] text-red-500 font-bold">
                                *Wajib diisi
                              </span>
                            )}
                          </label>
                          <select
                            id="form_input_shift"
                            required
                            value={hostForm.shift}
                            onChange={(e) => {
                              setHostFormError("");
                              setHostForm((prev) => ({
                                ...prev,
                                shift: e.target.value,
                              }));
                            }}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-black transition-all shadow-sm focus:border-violet-500 focus:outline-none ${!hostForm.shift ? "border-red-200 text-slate-400" : "border-slate-200 text-slate-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className="text-purple-300 font-normal"
                            >
                              -- Pilih Shift Kerja --
                            </option>
                            {shifts.map((s) => (
                              <option
                                key={s}
                                value={s}
                                className="text-purple-950 font-semibold"
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* STUDIO SELECTION */}
                        <div>
                          <label className="mb-1.5 flex justify-between text-xs font-bold text-slate-700">
                            <span>Studio & Lokasi:</span>
                            {!hostForm.studio && (
                              <span className="text-[10px] text-red-500 font-bold">
                                *Wajib diisi
                              </span>
                            )}
                          </label>
                          <select
                            id="form_input_studio"
                            required
                            value={hostForm.studio}
                            onChange={(e) => {
                              setHostFormError("");
                              setHostForm((prev) => ({
                                ...prev,
                                studio: e.target.value,
                              }));
                            }}
                            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs font-black transition-all shadow-sm focus:border-violet-500 focus:outline-none ${!hostForm.studio ? "border-red-200 text-slate-400" : "border-slate-200 text-slate-900"}`}
                          >
                            <option
                              value=""
                              disabled
                              className="text-purple-300 font-normal"
                            >
                              -- Pilih Studio & Lokasi --
                            </option>
                            {studios.map((st) => (
                              <option
                                key={st.id}
                                value={st.name}
                                className="text-purple-950 font-semibold"
                              >
                                {st.name} - {st.location}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* SUBMIT ATTENDANCE BUTTON */}
                      <button
                        type="submit"
                        id="host_submit_button"
                        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-violet-700 active:scale-[0.99]"
                      >
                        <UserCheck className="w-4 h-4" />
                        SUBMIT ABSEN MASUK
                      </button>
                    </form>
                  </div>

                  {/* PERSONAL HISTORY & COUNTER STATISTICS VIEW (Initially Hidden Toggle) */}
                  <div
                    id="history-section"
                    className={
                      hostActiveSubTab === "history"
                        ? "flex-1 flex flex-col animate-fadeIn"
                        : "hidden"
                    }
                  >
                    {/* Personal counters layout closely aligned to the user requests */}
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-700 mb-2 font-sans">
                      Rekapitulasi Absensi Saya
                    </h3>

                    {/* Cutoff Period Selector */}
                    <CutoffPeriodSelector
                      id="host_cutoff_period_dropdown"
                      value={hostCutoffPeriod}
                      availableCutoffMonths={availableCutoffMonths}
                      onChange={setHostCutoffPeriod}
                      label="Pilih Siklus Cut Off Absen:"
                      showNote
                      startDay={salarySettings.cutOffStartDay ?? 16}
                      endDay={salarySettings.cutOffEndDay ?? 15}
                      containerClassName="mb-4 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100 flex flex-col gap-1.5"
                      labelClassName="text-[10px] font-black text-purple-950 uppercase tracking-wider block"
                      selectClassName="flex-1 bg-white border border-purple-200/85 rounded-lg px-2 py-1 text-[11px] font-bold text-purple-950 focus:outline-none focus:border-purple-500 shadow-3xs cursor-pointer hover:border-purple-300 transition-all font-sans"
                      noteClassName="text-[8.5px] font-mono text-purple-650 italic font-semibold"
                    />

                    {/* 2 Grid Personal Counter Cards */}
                    <div
                      className="grid grid-cols-2 gap-3 mb-5"
                      id="personal_counters_grid"
                    >
                      <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] text-purple-500 font-bold uppercase">
                          Total Kehadiran
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-purple-700 font-mono">
                            {hostStats.totalSession}
                          </span>
                          <span className="text-[9px] text-purple-400 font-bold font-sans">
                            shift
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-purple-100/60 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] text-purple-500 font-bold uppercase font-sans">
                          Rasio Tepat
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-xl font-black text-emerald-600 font-mono">
                            {hostStats.presenceRate}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase">
                            Tepat Waktu
                          </span>
                        </div>
                        <p className="text-base font-black font-mono text-purple-950 mt-1">
                          {hostStats.timely}
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase">
                            Terlambat
                          </span>
                        </div>
                        <p className="text-base font-black font-mono text-purple-950 mt-1">
                          {hostStats.late}
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase">
                            Absen/Alpa
                          </span>
                        </div>
                        <p className="text-base font-black font-mono text-purple-950 mt-1">
                          {hostStats.absent}
                        </p>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-500"></div>
                          <span className="text-[9px] text-purple-500 font-bold uppercase">
                            Sakit/Izin
                          </span>
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

                    <div
                      className="flex-1 overflow-y-auto max-h-[170px] space-y-2 pr-1 text-xs"
                      id="personal_history_timeline"
                    >
                      {hostLogs.length === 0 ? (
                        <div className="text-center py-6 text-purple-450 text-[11px] font-semibold italic">
                          Belum ada sejarah absen hari ini.
                        </div>
                      ) : (
                        hostLogs.map((item, idx) => (
                          <div
                            key={item.id + "_" + idx}
                            className="bg-purple-50/35 p-2 rounded-xl border border-purple-100/60 flex justify-between items-center transition-all"
                          >
                            <div>
                              <div className="font-bold text-slate-800 flex items-center mb-1">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getBrandStyle(item.brandHandled)}`}>
                                  {item.brandHandled}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#4c3e6b]/80 flex items-center gap-1 mt-0.5 flex-wrap">
                                <span>{item.platform}</span>
                                <span>•</span>
                                <span>{formatDateUI(item.date)}</span>
                                {item.checkInTime && (
                                  <>
                                    <span>•</span>
                                    <span className="text-purple-600 font-extrabold bg-purple-50 px-1 py-0.2 rounded border border-purple-100">
                                      ⏱ {item.checkInTime}
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="text-[9px] text-purple-400 mt-0.5 font-semibold">
                                {item.shiftHours}
                              </div>
                            </div>
                            <div>
                              <span
                                className={`px-2 py-1 rounded text-[9px] font-bold ${
                                  item.status === "Present"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : item.status === "Late"
                                      ? "bg-amber-50 text-amber-700 border border-amber-100"
                                      : "bg-red-50 text-red-700 border border-red-100"
                                }`}
                              >
                                {item.status === "Present"
                                  ? "Tepat Waktu"
                                  : item.status === "Late"
                                    ? "Terlambat"
                                    : item.status === "Excused"
                                      ? "Sakit/Izin"
                                      : "Alpa"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* HOST REGISTERED CALENDAR SECTION */}
                  <div
                    id="calendar-section"
                    className={
                      hostActiveSubTab === "calendar"
                        ? "flex-1 flex flex-col animate-fadeIn"
                        : "hidden"
                    }
                  >
                    <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 mb-4">
                      <h4 className="text-[11px] font-black uppercase text-purple-900 tracking-wider">
                        Jadwal Siaran & Libur
                      </h4>
                      <p className="text-[10px] text-purple-900/60 mt-0.5 leading-relaxed font-semibold">
                        Berikut ini jadwal penempatan studio, brand, dan status
                        kerja Anda.
                      </p>
                    </div>

                    {/* MINI CALENDAR (Dynamic Grid) */}
                    <div className="bg-white p-3.5 rounded-xl border border-purple-100/75 shadow-3xs mb-4">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-purple-50">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-xs text-purple-950">
                            {(() => {
                              const monthNames = [
                                "Januari",
                                "Februari",
                                "Maret",
                                "April",
                                "Mei",
                                "Juni",
                                "Juli",
                                "Agustus",
                                "September",
                                "Oktober",
                                "November",
                                "Desember",
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
                                setHostCalendarYear((y) => y - 1);
                              } else {
                                setHostCalendarMonth((m) => m - 1);
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
                              setHostCalendarMonth(new Date().getMonth());
                              setHostCalendarYear(new Date().getFullYear());
                            }}
                            className="px-1.5 py-0.5 text-[8.5px] font-black hover:bg-purple-50 active:scale-95 border border-purple-100/70 rounded-md cursor-pointer transition-all text-purple-700"
                            title="Kembalikan ke Bulan Ini"
                          >
                            Bulan Ini
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (hostCalendarMonth === 11) {
                                setHostCalendarMonth(0);
                                setHostCalendarYear((y) => y + 1);
                              } else {
                                setHostCalendarMonth((m) => m + 1);
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
                        <span>Min</span>
                        <span>Sen</span>
                        <span>Sel</span>
                        <span>Rab</span>
                        <span>Kam</span>
                        <span>Jum</span>
                        <span>Sab</span>
                      </div>

                      {/* Calendar squares */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {(() => {
                          const offset = new Date(
                            hostCalendarYear,
                            hostCalendarMonth,
                            1,
                          ).getDay();
                          return Array.from({ length: offset }).map((_, i) => (
                            <div key={`host-empty-${i}`} className="h-6"></div>
                          ));
                        })()}

                        {(() => {
                          const daysInMonth = new Date(
                            hostCalendarYear,
                            hostCalendarMonth + 1,
                            0,
                          ).getDate();
                          return Array.from({ length: daysInMonth }).map(
                            (_, i) => {
                              const dayNum = i + 1;
                              const dateString = `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                              const daySchedules = computedSchedules.filter(
                                (s) =>
                                  (s.hostId === selectedHostId ||
                                    s.backupHostId === selectedHostId) &&
                                  (s.date || "").split("T")[0] === dateString,
                              );

                              // Decide background check
                              let cellBg =
                                "bg-slate-50 text-slate-400 font-bold border border-slate-200 border-dashed"; // Default if no schedules
                              let borderStyle = "";

                              if (daySchedules.length > 0) {
                                const hasOffDay = daySchedules?.some(
                                  (s) =>
                                    s.isOffDay && s.hostId === selectedHostId,
                                );

                                if (hasOffDay) {
                                  cellBg =
                                    "bg-rose-100 text-rose-800 font-extrabold";
                                  borderStyle = "border border-rose-300";
                                } else {
                                  const primarySchedule =
                                    daySchedules.find(
                                      (s) =>
                                        s.hostId === selectedHostId &&
                                        !s.isOffDay,
                                    ) || daySchedules[0];
                                  const bColor = getBrandColor(
                                    primarySchedule?.brand || "",
                                  );
                                  cellBg = `${bColor.bg} ${bColor.text} font-extrabold`;
                                  borderStyle = `border ${bColor.border}`;
                                }
                              }

                              const today = new Date();
                              const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                              const isSimulatedToday =
                                dateString === todayLocal;

                              const isSelectedHostDay =
                                selectedHostCalendarDate === dateString;

                              return (
                                <button
                                  key={dayNum}
                                  type="button"
                                  onClick={() => {
                                    setSelectedHostCalendarDate(dateString);
                                    setTimeout(() => {
                                      const shiftEl = document.getElementById(
                                        `host-shift-${dateString}`,
                                      );
                                      if (shiftEl) {
                                        shiftEl.scrollIntoView({
                                          behavior: "smooth",
                                          block: "center",
                                        });
                                      } else {
                                        const el =
                                          document.getElementById(
                                            "host_date_details",
                                          );
                                        if (el) {
                                          el.scrollIntoView({
                                            behavior: "smooth",
                                          });
                                        }
                                      }
                                    }, 80);
                                  }}
                                  className={`h-6 text-[10px] rounded-md flex items-center justify-center relative cursor-pointer ${cellBg} ${borderStyle} ${isSimulatedToday ? "ring-2 ring-purple-600 ring-offset-1" : ""} ${isSelectedHostDay ? "ring-2 ring-indigo-500 font-extrabold shadow-sm scale-110 z-10" : ""}`}
                                >
                                  {dayNum}
                                </button>
                              );
                            },
                          );
                        })()}
                      </div>

                      {/* Legend */}
                      <div className="mt-3 bg-purple-50/50 p-2 rounded-lg flex flex-col gap-1.5 text-[8px] text-purple-650 font-bold font-sans">
                        <div className="flex border-b border-purple-100/50 pb-1.5 flex-wrap gap-2 items-center justify-start">
                          <div className="flex items-center gap-1 w-full text-[9px] text-purple-900 mb-0.5">
                            <span>Keterangan Warna Shift Brand:</span>
                          </div>
                          {(() => {
                            const mySchedsMonth = computedSchedules.filter(
                              (s) =>
                                (s.hostId === selectedHostId ||
                                  s.backupHostId === selectedHostId) &&
                                !s.isOffDay &&
                                s.date &&
                                (s.date || "").split("T")[0].startsWith(
                                  `${hostCalendarYear}-${String(hostCalendarMonth + 1).padStart(2, "0")}`,
                                ),
                            );
                            const uniqueBrands = Array.from(
                              new Set(mySchedsMonth.map((s) => s.brand)),
                            ).filter(Boolean) as string[];
                            if (uniqueBrands.length === 0)
                              return (
                                <span className="text-purple-400 font-normal italic">
                                  Belum ada brand di bulan ini
                                </span>
                              );
                            return uniqueBrands.map((b) => {
                              const c = getBrandColor(b);
                              return (
                                <div
                                  key={b}
                                  className="flex items-center gap-1"
                                >
                                  <span
                                    className={`w-2.5 h-2.5 rounded ${c.bg} border ${c.border} block`}
                                  ></span>
                                  <span
                                    className="truncate max-w-[60px]"
                                    title={b}
                                  >
                                    {b}
                                  </span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <div className="flex items-center gap-3 pt-0.5">
                          <div className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-slate-50 border border-slate-200 border-dashed block"></span>
                            <span>Tidak Ada Jadwal</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PERSONAL SCHEDULE LIST DETAILED */}
                    <h4
                      className="text-[10.5px] uppercase font-black text-indigo-800 mb-2 font-sans tracking-wide"
                      id="host_date_details"
                    >
                      Daftar Shift & Penempatan Saya
                    </h4>

                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {/* Let's filter host schedules */}
                      {(() => {
                        const myAllScheds = computedSchedules.filter(
                          (s) =>
                            s.hostId === selectedHostId ||
                            s.backupHostId === selectedHostId,
                        );

                        const filteredByDateScheds = myAllScheds.filter(
                          (s) => (s.date || "").split("T")[0] === selectedHostCalendarDate
                        );

                        if (filteredByDateScheds.length === 0) {
                          return (
                            <div className="text-center py-6 text-purple-400 font-mono text-[10px] italic bg-white rounded-xl border border-purple-50">
                              Tidak ada jadwal pada tanggal ini.
                            </div>
                          );
                        }

                        // Sort by date ascending (if multiple on same day)
                        const sortedScheds = [...filteredByDateScheds].sort((a, b) =>
                          a.date.localeCompare(b.date),
                        );

                        return sortedScheds.map((sch) => {
                          const isPrimaryOff =
                            sch.isOffDay && sch.hostId === selectedHostId;
                          const isReplacement =
                            sch.backupHostId === selectedHostId;
                          const isSelectedInList = true; // since it's filtered, it's always the selected one

                          return (
                            <div
                              key={
                                (sch.id || "") +
                                "_" +
                                Math.random().toString(36).substr(2, 9)
                              }
                              id={`host-shift-${(sch.date || "").split("T")[0]}`}
                              className={`p-3 rounded-xl border transition-all ${
                                isSelectedInList
                                  ? "ring-2 ring-indigo-500 shadow-md scale-[1.01] bg-indigo-50/10 border-indigo-350"
                                  : isPrimaryOff
                                    ? "bg-amber-50/70 border-amber-200 text-amber-950 shadow-3xs"
                                    : isReplacement
                                      ? "bg-emerald-50/75 border-emerald-200 text-emerald-950 shadow-3xs"
                                      : "bg-purple-50/35 border-purple-100/65 text-purple-950"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10.5px] font-black tracking-wide uppercase font-sans text-indigo-950">
                                  {(() => {
                                    try {
                                      const raw = sch.date || "";
                                      const datePart = raw.split("T")[0];
                                      const [y, m, d] = datePart.split("-");
                                      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                                      if (isNaN(dateObj.getTime())) return raw;
                                      const dayName = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
                                      return `${dayName}, ${d}/${m}/${y}`;
                                    } catch (e) {
                                      return sch.date;
                                    }
                                  })()}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wide ${
                                    isPrimaryOff
                                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                                      : isReplacement
                                        ? "bg-emerald-100 text-emerald-800 border border-emerald-350"
                                        : "bg-purple-100 text-purple-800 border border-purple-250"
                                  }`}
                                >
                                  {isPrimaryOff
                                    ? "HARI LIBUR"
                                    : isReplacement
                                      ? "MASUK BACKUP"
                                      : "MASUK KERJA"}
                                </span>
                              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans mt-2">
                                <div>
                                  <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono mb-1">
                                    Shift:
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black border leading-none ${getShiftStyle(sch.timeSlot)}`}>
                                    {sch.timeSlot}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono mb-1">
                                    Brand:
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black border leading-none ${getBrandStyle(sch.brand)}`}>
                                    {sch.brand}
                                  </span>
                                </div>
                                {sch.platform && (
                                  <div>
                                    <span className="text-[9px] text-purple-400/80 block uppercase font-bold tracking-wider font-mono mb-1">
                                      Platform:
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9.5px] font-black border leading-none bg-sky-50 text-sky-700 border-sky-200">
                                      {sch.platform}
                                    </span>
                                  </div>
                                )}
                                <div className={`${sch.platform ? "" : "col-span-2"} pt-1 border-t border-purple-50/50 mt-1 col-span-2`}>
                                  <span className="text-[9px] text-indigo-400/80 block uppercase font-bold tracking-wider font-mono">
                                    Penempatan Studio:
                                  </span>
                                  <span className="font-black text-xs text-indigo-950">
                                    {sch.studio || "Studio Utama"}
                                  </span>
                                </div>
                              </div>

                              {/* Additional Info about regular host off / backup replacement */}
                              {isPrimaryOff && (
                                <div className="mt-2.5 p-2 bg-white/70 border border-amber-200/50 rounded-lg text-[9.5px] text-amber-900 font-bold leading-relaxed shadow-3xs">
                                  Hari libur reguler Anda. Tugas siaran Anda
                                  diisi oleh backup partner:{" "}
                                  <b className="text-amber-950 underline font-black">
                                    {sch.backupHostName || "Belum Ditentukan"}
                                  </b>
                                  .
                                </div>
                              )}

                              {isReplacement && (
                                <div className="mt-2.5 p-2 bg-white/70 border border-emerald-200/50 rounded-lg text-[9.5px] text-emerald-900 font-bold leading-relaxed shadow-3xs">
                                  Anda ditugaskan masuk siaran menggantikan
                                  host reguler{" "}
                                  <b className="text-emerald-950 underline font-extrabold">
                                    {sch.hostName}
                                  </b>{" "}
                                  yang sedang libur.
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
                  onClick={handleLogout}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Keluar Akses (Logout)
                </button>
                <p className="text-center text-[9px] text-[#4c3e6b]/60 mt-3 font-semibold">
                  Sistem manajemen kehadiran aman <br />{" "}
                  {agencyLogoUrl
                    ? "Agency Management 2026."
                    : "Liva Agency 2026."}
                </p>
              </div>
            </div>
          </div>
        </main>
      )}

      {loggedInClientBrandId &&
        (() => {
          const clientBrand = clientBrands.find(
            (b) => b.id === loggedInClientBrandId,
          );
          const clientAvailableReportDates = getAvailableReportDates(
            {
              logs: brandPerformanceLogs.filter(
                (log) =>
                  log.brandId === loggedInClientBrandId &&
                  log.reportType !== "engagement",
              ),
              platformFilter: clientPlatformFilter,
            },
          );
          const clientLatestAvailableReportDate =
            clientAvailableReportDates[
              clientAvailableReportDates.length - 1
            ] || "";
          const clientActiveLatestReportDate =
            clientDateFilterType === "latest"
              ? clientSelectedLatestDate &&
                clientAvailableReportDates.includes(clientSelectedLatestDate)
                ? clientSelectedLatestDate
                : clientLatestAvailableReportDate
              : "";

          // Filter the performance logs based on client settings
          const filteredLogs = brandPerformanceLogs.filter((log) => {
            if (
              log.brandId !== loggedInClientBrandId ||
              log.reportType === "engagement"
            )
              return false;
            if (
              clientPlatformFilter &&
              !isPlatformMatch(log.platform, clientPlatformFilter)
            )
              return false;
            if (log.date) {
              if (clientDateFilterType === "latest") {
                if (!clientActiveLatestReportDate) return false;
                return normalizeDateYMD(log.date) === clientActiveLatestReportDate;
              }
              if (clientDateFilterType === "month") {
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - 30);
                return new Date(log.date) >= limitDate;
              } else if (clientDateFilterType === "weekly") {
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() - 7);
                return new Date(log.date) >= limitDate;
              } else if (clientDateFilterType === "custom") {
                if (clientCustomStartDate && log.date < clientCustomStartDate)
                  return false;
                if (clientCustomEndDate && log.date > clientCustomEndDate)
                  return false;
              }
            }
            return true;
          });

          const totalGmv = filteredLogs.reduce(
            (sum, current) => sum + (current.gmv || 0),
            0,
          );
          const totalSold = filteredLogs.reduce(
            (sum, current) => sum + (current.products_sold || 0),
            0,
          );
          const totalSessions = filteredLogs.length;

          const validAovLogs = filteredLogs.filter((l) => l.aov > 0);
          const averageAov =
            validAovLogs.length > 0
              ? filteredLogs.reduce((sum, curr) => sum + (curr.gmv || 0), 0) /
                (filteredLogs.reduce(
                  (sum, curr) => sum + (curr.buyers || 0),
                  0,
                ) || 1)
              : 0;

          return (
            <div
              className="flex h-screen bg-[#fafbfc] overflow-hidden text-slate-800 font-sans"
              id="client-wrapper"
            >
              {/* LEFT SIDEBAR */}
              <aside
                className={`transition-all duration-200 ease-in-out ${isClientSidebarVisible ? "w-64 p-0 opacity-100 border-r" : "w-0 p-0 overflow-hidden opacity-0 border-r-0"} bg-white border-slate-200 flex flex-col justify-between flex-shrink-0 hidden md:flex font-sans`}
              >
                <div>
                  <div className="h-20 flex items-center px-8 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center min-w-[32px]">
                        <span className="text-white font-black text-sm">L</span>
                      </div>
                      <span className="font-bold text-lg text-slate-900 truncate whitespace-nowrap">
                        {clientBrand?.name || "Brand Partner"}
                      </span>
                    </div>
                  </div>
                  <div className="py-6 px-4 space-y-1">
                    {[
                      {
                        id: "performance",
                        label: "Report Live",
                        icon: BarChart2,
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${item.id === "performance" ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"} border-0`}
                      >
                        <item.icon
                          className={`w-4 h-4 min-w-[16px] ${item.id === "performance" ? "text-indigo-600" : "text-slate-400"}`}
                        />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 space-y-1 border-t border-slate-100">
                  <div className="mt-4 px-4 flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-100 whitespace-nowrap">
                    <div className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                      {clientBrand?.name} Admin
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer border-0 bg-transparent p-1 hidden sm:block delay-150 relative"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT AREA */}
              <main
                className="flex-1 overflow-y-auto w-full animate-fadeIn bg-[#fcf9f8] min-h-screen"
                id="client-main-viewport"
              >
                <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-12 sm:px-6 lg:px-8 mt-6">
                  {/* TOP HEADER */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setIsClientSidebarVisible(!isClientSidebarVisible)
                        }
                        className="hidden md:flex p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer items-center justify-center shadow-sm"
                        title={
                          isClientSidebarVisible
                            ? "Tutup Sidebar"
                            : "Buka Sidebar"
                        }
                      >
                        <Menu className="w-4 h-4" />
                      </button>
                      <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                          Data Analytics Dashboard
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Pantau performa penjualan dan engagement Live stream
                          secara real-time.
                        </p>
                      </div>
                    </div>

                    {/* MOBILE CONTROLS & DOWNLOAD BUTTON */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleLogout}
                        className="md:hidden flex items-center gap-2 p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setIsDownloadModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm border-0 cursor-pointer flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" /> Unduh Laporan
                      </button>
                    </div>
                  </div>

                  {/* CLIENT REPORTING MODULAR COMPONENTS */}
                  <div className="w-full bg-[#fafafd] pb-12 overflow-x-hidden border border-slate-100 rounded-3xl overflow-hidden shadow-sm pt-0 relative mt-2 text-slate-800 font-sans text-left">
                    <div className="px-4 pt-4 sm:px-6">
                    <ReportingWorkspaceHeader
                      brandName={clientBrand?.name || "Nama Brand"}
                      brandId={loggedInClientBrandId || undefined}
                      brandLogoUrl={clientBrand?.logoUrl}
                      onBack={handleLogout}
                      activeTab={clientReportingTab}
                      platformFilter={clientPlatformFilter}
                      onPlatformFilterChange={setClientPlatformFilter}
                      dateFilterType={clientDateFilterType}
                      onDateFilterTypeSelect={setClientDateFilterType}
                      monthPickerYear={clientMonthPickerYear}
                      setMonthPickerYear={setClientMonthPickerYear}
                      selectedMonth={clientSelectedMonth}
                      setSelectedMonth={setClientSelectedMonth}
                      isMonthOpen={isClientMonthOpen}
                      setIsMonthOpen={setIsClientMonthOpen}
                      isCalendarOpen={isClientCalendarOpen}
                      setIsCalendarOpen={setIsClientCalendarOpen}
                      customStartDate={clientCustomStartDate}
                      customEndDate={clientCustomEndDate}
                      tempStartDate={clientTempStartDate}
                      tempEndDate={clientTempEndDate}
                      onTempStartDateChange={setClientTempStartDate}
                      onTempEndDateChange={setClientTempEndDate}
                      onApplyCustom={(start, end) => {
                        setClientCustomStartDate(start);
                        setClientCustomEndDate(end);
                        setIsClientCalendarOpen(false);
                      }}
                      onCancelCustom={() => setIsClientCalendarOpen(false)}
                      periodLabel={
                        clientDateFilterType === "latest"
                          ? (() => {
                              const filteredDb = brandPerformanceLogs.filter(
                                (log) =>
                                  log.brandId === loggedInClientBrandId &&
                                  log.reportType !== "engagement",
                              );
                              const availableReportDates = getAvailableReportDates({
                                  logs: filteredDb,
                                  platformFilter: clientPlatformFilter,
                                });
                              const latestDate =
                                availableReportDates[
                                  availableReportDates.length - 1
                                ] || "";
                              return getReportPeriodLabel({
                                dateFilterType: clientDateFilterType,
                                latestDateLabel: clientSelectedLatestDate || latestDate,
                                targetLatestDate: clientSelectedLatestDate || latestDate,
                                customStartDate: clientCustomStartDate,
                              });
                            })()
                          : undefined
                      }
                      onPrevPeriod={
                        clientDateFilterType === "latest"
                          ? () => {
                              const filteredDb = brandPerformanceLogs.filter(
                                (log) =>
                                  log.brandId === loggedInClientBrandId &&
                                  log.reportType !== "engagement",
                              );
                              const availableReportDates = getAvailableReportDates({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                              });
                              if(availableReportDates.length === 0) return;
                              const targetLatestDate = clientSelectedLatestDate || availableReportDates[availableReportDates.length - 1] || "";
                              const nextDate = shiftAvailableReportDate({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                                currentDate: targetLatestDate,
                                direction: -1,
                              });
                              if (nextDate) {
                                setClientSelectedLatestDate(nextDate);
                              }
                            }
                          : undefined
                      }
                      onNextPeriod={
                        clientDateFilterType === "latest"
                          ? () => {
                              const filteredDb = brandPerformanceLogs.filter(
                                (log) =>
                                  log.brandId === loggedInClientBrandId &&
                                  log.reportType !== "engagement",
                              );
                              const availableReportDates = getAvailableReportDates({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                              });
                              if(availableReportDates.length === 0) return;
                              const targetLatestDate = clientSelectedLatestDate || availableReportDates[availableReportDates.length - 1] || "";
                              const nextDate = shiftAvailableReportDate({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                                currentDate: targetLatestDate,
                                direction: 1,
                              });
                              if (nextDate) {
                                setClientSelectedLatestDate(nextDate);
                              }
                            }
                          : undefined
                      }
                      canPrevPeriod={
                        clientDateFilterType === "latest"
                          ? (() => {
                              const filteredDb = brandPerformanceLogs.filter(
                                (log) =>
                                  log.brandId === loggedInClientBrandId &&
                                  log.reportType !== "engagement",
                              );
                              const availableReportDates = getAvailableReportDates({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                              });
                              const currentLatestDateIndex = availableReportDates.indexOf(clientSelectedLatestDate || availableReportDates[availableReportDates.length - 1] || "");
                              return currentLatestDateIndex > 0 && availableReportDates.length > 0;
                            })()
                          : undefined
                      }
                      canNextPeriod={
                        clientDateFilterType === "latest"
                          ? (() => {
                              const filteredDb = brandPerformanceLogs.filter(
                                (log) =>
                                  log.brandId === loggedInClientBrandId &&
                                  log.reportType !== "engagement",
                              );
                              const availableReportDates = getAvailableReportDates({
                                logs: filteredDb,
                                platformFilter: clientPlatformFilter,
                              });
                              const currentLatestDateIndex = availableReportDates.indexOf(clientSelectedLatestDate || availableReportDates[availableReportDates.length - 1] || "");
                              return currentLatestDateIndex >= 0 && currentLatestDateIndex < availableReportDates.length - 1;
                            })()
                          : undefined
                      }
                    />

                    <ReportingWorkspaceTabs
                      activeTab={clientReportingTab}
                      onTabChange={setClientReportingTab}
                      hideSettingsTab={true}
                    />

                    {clientReportingTab === "live" && (
                      <React.Suspense
                        fallback={
                          <div className="px-6 sm:px-8 py-10 text-sm font-semibold text-slate-500 animate-pulse">
                            Memuat panel reporting...
                          </div>
                        }
                      >
                        <LiveReportPanel
                          model={clientLiveReportView}
                          chartSelectedMetrics={liveChartSelectedMetrics}
                          onChartSelectedMetricsChange={
                            setLiveChartSelectedMetrics
                          }
                          operatorPlatformFilter={clientPlatformFilter}
                          shifts={shifts}
                          adminShiftChecklist={adminShiftChecklist}
                          setAdminShiftChecklist={setAdminShiftChecklist}
                          reportingShopeeRawTab={reportingShopeeRawTab}
                          setReportingShopeeRawTab={
                            setReportingShopeeRawTab
                          }
                          reportDbSortCol={reportDbSortCol}
                          reportDbSortAsc={reportDbSortAsc}
                          setReportDbSortCol={setReportDbSortCol}
                          setReportDbSortAsc={setReportDbSortAsc}
                          currentPage={currentPage}
                          setCurrentPage={setCurrentPage}
                          itemsPerPage={ITEMS_PER_PAGE}
                          isLogsLoading={isLogsLoading}
                          handleDeletePerformanceLog={
                            handleDeletePerformanceLog
                          }
                          brandPerformanceLogs={brandPerformanceLogs}
                          activeReportBrandId={loggedInClientBrandId || ""}
                          brandUploadHistory={brandUploadHistory}
                          uploadHistory={uploadHistory}
                          onDeleteUploadBatch={handleDeleteUploadBatch}
                          brandDashboardSettings={brands.find((b) => b.id === loggedInClientBrandId)?.dashboardSettings}
                          hideUploadHistory={true}
                        />
                      </React.Suspense>
                    )}

                    {clientReportingTab === "product" && (
                      <ProductPerformancePanel
                        shopeeSkuLogs={shopeeSkuLogs}
                        brandPerformanceLogs={brandPerformanceLogs}
                        activeReportBrandId={loggedInClientBrandId || ""}
                        operatorDateFilterType={clientDateFilterType}
                        selectedLatestDate={clientSelectedLatestDate}
                        operatorCustomStartDate={clientCustomStartDate}
                        operatorCustomEndDate={clientCustomEndDate}
                        operatorSelectedMonth={clientSelectedMonth}
                        operatorPlatformFilter={clientPlatformFilter}
                        operatorShiftFilters={operatorShiftFilters}
                        reportDbSearchQuery={reportDbSearchQuery}
                      brandDashboardSettings={brands.find((b) => b.id === loggedInClientBrandId)?.dashboardSettings}
                        skuSortCol={skuSortCol}
                        skuSortAsc={skuSortAsc}
                        setSkuSortCol={setSkuSortCol}
                        setSkuSortAsc={setSkuSortAsc}
                        setOperatorDateFilterType={setClientDateFilterType}
                        setOperatorCustomStartDate={setClientCustomStartDate}
                        setOperatorCustomEndDate={setClientCustomEndDate}
                        currentPage={currentPage}
                        itemsPerPage={ITEMS_PER_PAGE}
                        setCurrentPage={setCurrentPage}
                        onDeleteBatch={() => {}}
                        hideUploadHistory={true}
                      />
                    )}

                    {clientReportingTab === "engagement" && (
                      <React.Suspense
                        fallback={
                          <div className="px-6 sm:px-8 py-10 text-sm font-semibold text-slate-500 animate-pulse">
                            Memuat panel reporting...
                          </div>
                        }
                      >
                        <EngagementReportPanel
                          model={clientEngagementReportView}
                          platform={clientPlatformFilter}
                          chartSelectedMetrics={engagementChartSelectedMetrics}
                          onChartSelectedMetricsChange={setEngagementChartSelectedMetrics}
                          activeReportBrandId={loggedInClientBrandId || ""}
                          brandPerformanceLogs={brandPerformanceLogs}
                          brandUploadHistory={brandUploadHistory}
                          uploadHistory={uploadHistory}
                          isLogsLoading={isLogsLoading}
                          onDeleteUploadBatch={handleDeleteUploadBatch}
                          brandDashboardSettings={brands.find((b) => b.id === loggedInClientBrandId)?.dashboardSettings}
                          hideUploadHistory={true}
                        />
                      </React.Suspense>
                    )}

                    </div>
                  </div>
                </div>
              </main>

              {/* DOWNLOAD EXCEL MODAL */}
              <DownloadReportModal
                isOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                reportType={clientReportingTab}
                showAdvancedFilters={true}
                onDownload={(selectedMetrics, exportPlatform, exportStart, exportEnd) => {
                  let customLiveView = clientLiveReportView;
                  let customProductView = clientProductReportView;
                  let customEngagementView = clientEngagementReportView;

                  // If custom filters are provided, override the views
                  if (exportPlatform && exportPlatform !== "Semua Platform" || exportStart || exportEnd) {
                    const filteredLogs = brandPerformanceLogs.filter((log) => {
                      if (log.brandId !== loggedInClientBrandId) return false;
                      if (exportPlatform && exportPlatform !== "Semua Platform" && log.platform.toLowerCase() !== exportPlatform.toLowerCase()) return false;
                      if (exportStart && (log.date || "").split(" ")[0] < exportStart) return false;
                      if (exportEnd && (log.date || "").split(" ")[0] > exportEnd) return false;
                      return true;
                    });
                    customLiveView = { filteredDb: filteredLogs };
                    customEngagementView = { filteredDb: filteredLogs };

                    const filteredSkus = shopeeSkuLogs.filter((log) => {
                      if (log.brandId !== loggedInClientBrandId) return false;
                      if (exportStart && log.date < exportStart) return false;
                      if (exportEnd && log.date > exportEnd) return false;
                      return true;
                    });
                    customProductView = { filteredDb: filteredSkus };
                  }

                  exportReportToExcel({
                    reportType: clientReportingTab,
                    selectedMetrics,
                    brandName: clientBrand?.name || "Mitra",
                    liveReportView: customLiveView,
                    productReportView: customProductView,
                    engagementReportView: customEngagementView,
                    dateFilterType: clientDateFilterType,
                    selectedLatestDate: clientSelectedLatestDate,
                    platformFilter: clientPlatformFilter,
                  });
                }}
              />
            </div>
          );
        })()}

      {/* ========================================================== */}
      {/* 2. OPERATOR VIEWPORT (DESKTOP FRIENDLY DASHBOARD CONTAINER) */}
      {/* ========================================================== */}
      {isOperatorLoggedIn && (
        <main
          className="flex-1 p-0 max-w-none w-full"
          id="system-main-viewport"
        >
          <div
            className="flex bg-[#fcfbfe] flex-1 text-slate-800 w-full"
            id="operator_dashboard_panel"
          >
            {/* 1. LEFT VERTICAL SIDEBAR (PREMIUM GLASSMORPHISM) */}
            <aside
              className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${isSidebarVisible ? "w-[260px] p-5 opacity-100 border-r" : "w-0 p-0 overflow-hidden opacity-0 border-r-0"} flex-shrink-0 bg-white/70 backdrop-blur-2xl border-white/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col justify-between sticky top-0 h-screen font-sans z-50`}
              id="operator_sidebar"
            >
              <div className="space-y-6">
                <div className="px-2 py-4 border-b border-purple-50 flex items-center gap-3">
                  {agencyLogoUrl ? (
                    <img
                      src={agencyLogoUrl}
                      className="h-10 w-auto max-w-[140px] rounded-lg object-contain bg-slate-50 border border-slate-100 px-1"
                      alt="Logo"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
                      LM
                    </div>
                  )}
                  <div>
                    {agencyLogoUrl ? null : (
                      <span className="text-[9px] font-black tracking-widest text-[#2563eb] block uppercase">
                        Liva Agency
                      </span>
                    )}
                    <h2 className="text-xs font-black text-slate-900 font-sans tracking-wide">
                      OPERATOR DESKTOP
                    </h2>
                  </div>
                </div>

                <nav className="space-y-1.5" id="sidebar_nav">
                  {(() => {
                    const allItems = [
                      {
                        tabId: "dashboard_utama",
                        label: "Dashboard Utama",
                        icon: LayoutDashboard,
                      },
                      {
                        type: "header",
                        label: "Manajemen Host",
                        key: "cat-host",
                      },
                      {
                        tabId: "absensi",
                        label: "Calender Kerja Host",
                        icon: Calendar,
                        category: "cat-host",
                      },
                      {
                        tabId: "rekap_gaji",
                        label: "Absen & Payroll",
                        icon: DollarSign,
                        category: "cat-host",
                      },
                      {
                        tabId: "database",
                        label: "Database Absen",
                        badgeCount: logs.length,
                        icon: ClipboardList,
                        category: "cat-host",
                      },
                      {
                        tabId: "credentials",
                        label: "Kredensial Host",
                        icon: ShieldCheck,
                        category: "cat-host",
                      },
                      {
                        type: "header",
                        label: "Manajemen Client",
                        key: "cat-client",
                      },
                      {
                        tabId: "data_brand",
                        label: "Data Brand",
                        icon: Briefcase,
                        category: "cat-client",
                      },
                      {
                        tabId: "reporting_brand",
                        label: "Reporting Brand (Upload)",
                        icon: LineChart,
                        category: "cat-client",
                      },
                      {
                        tabId: "invoice",
                        label: "Invoice & Berkas",
                        icon: Receipt,
                        category: "cat-client",
                      },
                      {
                        tabId: "leads",
                        label: "Leads/Calon Client",
                        icon: Users,
                        category: "cat-client",
                      },
                      {
                        type: "header",
                        label: "Sistem & Integrasi",
                        key: "cat-system",
                      },
                      {
                        tabId: "settings",
                        label: "Platform & Shift",
                        icon: Sliders,
                        category: "cat-system",
                      },
                      {
                        type: "header",
                        label: "Keamanan Akun",
                        key: "cat-security",
                      },
                      {
                        tabId: "admin_privacy",
                        label: "Privasi Master Admin",
                        icon: Lock,
                        category: "cat-security",
                      },
                    ];

                    let allowedTabs: string[] | null = null;
                    if (loggedInAdminId) {
                      allowedTabs = authSession?.role === "admin"
                        ? authSession.accessTabs ?? null
                        : null;
                      if (!allowedTabs) {
                        const adm = adminAccounts.find(
                          (a) => a.id === loggedInAdminId,
                        );
                        if (adm) allowedTabs = adm.accessTabs;
                      }
                    }

                    const filteredItems = allItems.filter((item) => {
                      if (item.type === "header") return true;
                      if (
                        allowedTabs &&
                        item.tabId &&
                        !allowedTabs.includes(item.tabId)
                      )
                        return false;
                      return true;
                    });

                    return filteredItems.filter((item) => {
                      if (item.type === "header") {
                        // Check if there are any child items for this header's category
                        const hasChildren = filteredItems?.some(
                          (child) => child.category === item.key,
                        );
                        return hasChildren;
                      }
                      return true;
                    });
                  })().map((item, index) => {
                    if (item.type === "header") {
                      const isExpanded = expandedCategories[item.key!];
                      return (
                        <div key={`header-${index}`} className="pt-4 pb-1">
                          <button
                            onClick={() =>
                              setExpandedCategories((prev) => ({
                                ...prev,
                                [item.key!]: !isExpanded,
                              }))
                            }
                            className="w-full px-3.5 flex items-center justify-between group cursor-pointer text-left focus:outline-none"
                          >
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                              {item.label}
                            </p>
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

                    const IconComponent = item.icon;
                    const isActive = operatorTab === item.tabId;

                    return (
                      <button
                        key={item.tabId}
                        onClick={() => {
                          if (item.tabId) setOperatorTab(item.tabId);
                          setSelectedLogIds([]);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 relative group cursor-pointer border-0 text-left overflow-hidden ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]"
                            : "text-slate-500 hover:text-blue-700 hover:bg-blue-50/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 relative z-10">
                          {isActive && (
                            <div className="absolute -left-3.5 top-0 bottom-0 w-1 bg-white/30 rounded-r-md" />
                          )}
                          <IconComponent
                            className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500"}`}
                          />
                          <span
                            className={
                              isActive
                                ? "font-black text-white tracking-wide"
                                : "font-semibold tracking-wide"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                        {item.badgeCount !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold relative z-10 transition-colors ${isActive ? "bg-white/20 text-white border border-white/30" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700"}`}
                          >
                            {item.badgeCount}
                          </span>
                        )}
                        {/* Hover subtle glow effect */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/40 to-blue-100/0 translate-x-[-100%] group-hover:animate-shimmer" />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div
                className="border-t border-slate-50 pt-4"
                id="sidebar_operator_profile"
              >
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs">
                        OP
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-850 leading-none">
                        Agency Operator
                      </h5>
                      <span className="text-[9px] text-[#2563eb] font-bold tracking-wide">
                        Studio Aktif
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </aside>

            {/* 2. RIGHT WORKSPACE CONTENT */}
            <div
              className="flex-1 min-h-screen flex flex-col bg-[#fafafc]"
              id="operator_workspace"
            >
              {/* WORKSPACE TOPBAR CONTROL BOARD */}
              <header
                className="bg-white border-b border-slate-100 h-16 px-6 flex items-center justify-between sticky top-0 z-40"
                id="workspace_topbar"
              >
                <div className="flex items-center gap-3">
                  {/* Sidebar Toggle Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsSidebarVisible((prev) => !prev)}
                    className="p-1.5 -ml-1 text-[#2563eb] hover:bg-blue-50 border border-slate-100 rounded-lg transition-all cursor-pointer bg-transparent flex items-center justify-center shadow-3xs"
                    title={
                      isSidebarVisible
                        ? "Sembunyikan Sidebar"
                        : "Tampilkan Sidebar"
                    }
                  >
                    <Menu className="w-4 h-4 hover:scale-110 active:scale-90 transition-transform" />
                  </button>

                  <h1 className="text-sm font-black text-slate-900 font-sans flex items-center gap-2">
                    {operatorTab === "dashboard_utama" && (
                      <span>Executive Intelligence Dashboard</span>
                    )}
                    {operatorTab === "absensi" && (
                      <span>Calender Kerja Host</span>
                    )}
                    {operatorTab === "rekap_gaji" && (
                      <span>Kalkulator & Penggajian Streamer</span>
                    )}
                    {operatorTab === "database" && (
                      <span>Database Logs Kehadiran</span>
                    )}
                    {operatorTab === "data_brand" && (
                      <span>Manajemen Data Brand Klien</span>
                    )}
                    {operatorTab === "invoice" && (
                      <span>Invoice & Berkas Klien</span>
                    )}
                    {operatorTab === "reporting_brand" && (
                      <span>Reporting Eksternal Brand</span>
                    )}
                    {operatorTab === "leads" && (
                      <span>Leads & Calon Klien</span>
                    )}
                    {operatorTab === "settings" && (
                      <span>Pengaturan Platform & Shift Siaran</span>
                    )}
                    {operatorTab === "credentials" && (
                      <span>Kredensial Login Streamer</span>
                    )}
                    {operatorTab === "admin_privacy" && (
                      <span>Privasi Akun Master Admin</span>
                    )}
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  {[
                    "dashboard_utama",
                    "absensi",
                    "rekap_gaji",
                    "database",
                    "data_brand",
                  ].includes(operatorTab) && (
                    <div className="relative min-w-[240px] hidden md:block">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ketik untuk mencari..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
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
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white border-2 border-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                          {notifications.filter((n) => !n.read).length}
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
                              <span className="text-xs font-black tracking-wide uppercase">
                                Notifikasi Aktivitas
                              </span>
                              {notifications.filter((n) => !n.read).length >
                                0 && (
                                <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                  {notifications.filter((n) => !n.read).length}{" "}
                                  Baru
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
                                <p className="text-xs font-black text-slate-500">
                                  Semua Beres!
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mx-auto leading-relaxed">
                                  Belum ada notifikasi baru untuk saat ini.
                                  Seluruh sistem berjalan lancar.
                                </p>
                              </div>
                            ) : (
                              notifications.map((notif) => {
                                let typeBg =
                                  "bg-indigo-50 text-indigo-600 border-indigo-100";
                                if (notif.type === "success") {
                                  typeBg =
                                    "bg-emerald-50 text-emerald-600 border-emerald-100";
                                } else if (notif.type === "warning") {
                                  typeBg =
                                    "bg-amber-50 text-amber-600 border-amber-100";
                                } else if (
                                  notif.type === "danger" ||
                                  notif.type === "error"
                                ) {
                                  typeBg =
                                    "bg-red-50 text-red-600 border-red-100";
                                } else if (notif.type === "info") {
                                  typeBg =
                                    "bg-blue-50 text-blue-600 border-blue-100";
                                }

                                return (
                                  <div
                                    key={notif.id}
                                    onClick={() => {
                                      setNotifications((prev) => {
                                        const updated = prev.map((n) =>
                                          n.id === notif.id
                                            ? { ...n, read: true }
                                            : n,
                                        );
                                        localStorage.setItem(
                                          "mcn_notifications_v1",
                                          JSON.stringify(updated),
                                        );
                                        return updated;
                                      });
                                      if (notif.actionTab) {
                                        setOperatorTab(notif.actionTab as AdminTab);
                                        setIsNotificationOpen(false);
                                      }
                                    }}
                                    className={`p-4 transition-all cursor-pointer hover:bg-slate-50 flex items-start gap-3 relative text-left ${
                                      !notif.read
                                        ? "bg-slate-50/70 border-l-2 border-indigo-600"
                                        : ""
                                    }`}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 font-bold text-xs ${typeBg}`}
                                    >
                                      {notif.type === "success" && (
                                        <Check className="w-4 h-4" />
                                      )}
                                      {notif.type === "info" && (
                                        <Sparkles className="w-4 h-4" />
                                      )}
                                      {notif.type === "warning" && (
                                        <AlertTriangle className="w-4 h-4" />
                                      )}
                                      {(notif.type === "danger" ||
                                        notif.type === "error") && (
                                        <X className="w-4 h-4" />
                                      )}
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
                                          {new Date(
                                            notif.timestamp,
                                          ).toLocaleString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            day: "numeric",
                                            month: "short",
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
                {operatorTab === "dashboard_utama" && (() => {
                  // --- CALCULATE BRAND PERFORMANCE METRICS ---
                  const brandPerformances = clientBrands.map((brand) => {
                    // Penjualan sebenarnya dari sesi live (GMV)
                    const totalPenjualan = brandPerformanceLogs
                      .filter(log => log.brandId === brand.id)
                      .reduce((sum, log) => sum + (log.gmv || 0), 0);
                    
                    const totalOrders = brandPerformanceLogs
                      .filter(log => log.brandId === brand.id)
                      .reduce((sum, log) => sum + (log.orders || 0), 0);

                    const totalSessions = (brand.sessions || []).length;
                    
                    return {
                      ...brand,
                      totalPenjualan,
                      totalOrders,
                      totalSessions
                    };
                  });
                  
                  const topBrandsByPenjualan = [...brandPerformances].sort((a, b) => b.totalPenjualan - a.totalPenjualan).slice(0, 5);
                  const topBrandsBySessions = [...brandPerformances].sort((a, b) => b.totalSessions - a.totalSessions).slice(0, 5);

                  return (
                    <div
                      className="space-y-6 animate-fadeIn"
                      id="operator_dashboard_utama_content"
                    >
                      {/* Executive Summary Cards */}
                      <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                        id="executive_metrics_dashboard"
                      >
                        {/* Jadwal Hari Ini */}
                        <div className="group relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7B3BF2] to-[#5C14EE] p-6 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30">
                          <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity duration-500 group-hover:opacity-20 group-hover:rotate-12">
                            <Calendar className="size-20" />
                          </div>
                          <span className="relative z-10 block mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                            Jadwal Hari Ini
                          </span>
                          <div className="relative z-10 mb-2 flex items-baseline gap-2">
                            <span className="text-5xl font-black tabular-nums tracking-tight">
                              {(() => {
                                const today = new Date();
                                const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                                return schedules.filter(s => s.date === todayLocal).length;
                              })()}
                            </span>
                            <span className="text-sm font-bold text-white/70">Shift</span>
                          </div>
                          <div className="relative z-10 mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold backdrop-blur-md">
                            <Sparkles className="size-3 text-yellow-300" /> Siaran sedang berlangsung
                          </div>
                        </div>

                        {/* Total Hosts */}
                        <div className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 animate-fadeIn" style={{ animationDelay: '50ms' }}>
                          <div className="absolute -right-2 -top-2 p-4 opacity-[0.03] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.05]">
                            <Users className="size-24" />
                          </div>
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                            <UserCheck className="size-5" />
                          </div>
                          <span className="block mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Total Host Aktif
                          </span>
                          <div className="mb-2 text-3xl font-black tabular-nums tracking-tight text-slate-800">
                            {hosts.length}
                          </div>
                          <div className="mt-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                            <CheckCircle2 className="size-3.5" /> Tersebar di {studios.length} Studio
                          </div>
                        </div>

                        {/* Client Total */}
                        <div className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 animate-fadeIn" style={{ animationDelay: '100ms' }}>
                          <div className="absolute -right-2 -top-2 p-4 opacity-[0.03] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.05]">
                            <Briefcase className="size-24" />
                          </div>
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                            <Building2 className="size-5" />
                          </div>
                          <span className="block mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Mitra Brand
                          </span>
                          <div className="mb-2 text-3xl font-black tabular-nums tracking-tight text-slate-800">
                            {clientBrands.length}
                          </div>
                          <div className="mt-auto text-[10px] font-bold text-slate-400">
                            Brand Eksklusif Liva
                          </div>
                        </div>

                        {/* Sesi Total */}
                        <div className="group relative overflow-hidden rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 animate-fadeIn" style={{ animationDelay: '150ms' }}>
                          <div className="absolute -right-2 -top-2 p-4 opacity-[0.03] transition-all duration-500 group-hover:scale-110 group-hover:opacity-[0.05]">
                            <Video className="size-24" />
                          </div>
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                            <PlaySquare className="size-5" />
                          </div>
                          <span className="block mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Total Sesi Siaran
                          </span>
                          <div className="mb-2 text-3xl font-black tabular-nums tracking-tight text-slate-800">
                            {clientBrands.flatMap((b) => b.sessions || []).length}
                          </div>
                          <div className="mt-auto text-[10px] font-bold text-slate-400">
                            Terjadwal di seluruh platform
                          </div>
                        </div>
                      </div>

                      {/* BRAND PERFORMANCE LEADERBOARD (NEW) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
                        {/* Top Brands by Sales / Penjualan */}
                        <div className="flex flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm">
                          <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                                <TrendingUp className="size-6 text-emerald-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-slate-800">Top Penjualan Brand</h3>
                                <p className="text-[11px] font-bold text-slate-400">Berdasarkan konversi sesi live (GMV)</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-5">
                            {topBrandsByPenjualan.length > 0 && topBrandsByPenjualan.some(b => b.totalPenjualan > 0) ? (
                              topBrandsByPenjualan.filter(b => b.totalPenjualan > 0).map((brand, idx) => (
                                <div key={brand.id} className="group flex items-center justify-between transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-yellow-200 to-amber-300 text-amber-800' : idx === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600' : idx === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800' : 'bg-slate-50 text-slate-400'}`}>
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-800 transition-colors group-hover:text-emerald-600">{brand.name}</div>
                                      <div className="text-[10px] font-bold text-slate-400">{brand.totalOrders || 0} Total Pesanan</div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-black tabular-nums tracking-tight text-emerald-600">
                                      {formatIDR(brand.totalPenjualan)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                  <DollarSign className="size-6 text-slate-300" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">Belum ada penjualan terdata</span>
                                <p className="mt-1 max-w-[200px] text-[11px] text-slate-400">Data penjualan dari host (GMV) akan muncul di sini.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Top Brands by Activity (Sessions) */}
                        <div className="flex flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm">
                          <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                <BarChart2 className="size-6 text-blue-500" />
                              </div>
                              <div>
                                <h3 className="text-sm font-black text-slate-800">Brand Paling Aktif</h3>
                                <p className="text-[11px] font-bold text-slate-400">Berdasarkan volume slot siaran</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 space-y-5">
                            {topBrandsBySessions.length > 0 && topBrandsBySessions.some(b => b.totalSessions > 0) ? (
                              topBrandsBySessions.filter(b => b.totalSessions > 0).map((brand, idx) => {
                                const maxSessions = topBrandsBySessions[0].totalSessions;
                                const widthPercent = Math.max(10, (brand.totalSessions / maxSessions) * 100);
                                
                                return (
                                  <div key={brand.id} className="space-y-2">
                                    <div className="flex items-end justify-between">
                                      <span className="text-xs font-bold text-slate-800">{brand.name}</span>
                                      <span className="text-xs font-black text-blue-600">{brand.totalSessions} Sesi</span>
                                    </div>
                                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                      <div 
                                        className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${widthPercent}%` }}
                                      />
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                                  <Video className="size-6 text-slate-300" />
                                </div>
                                <span className="text-sm font-bold text-slate-500">Belum ada sesi dijadwalkan</span>
                                <p className="mt-1 max-w-[200px] text-[11px] text-slate-400">Brand dengan sesi siaran aktif akan muncul di sini.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    {/* SESI BERDASARKAN PLATFORM */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-50 pb-5 relative z-10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-slate-800 font-black text-base">Sesi per Platform</h3>
                            <p className="text-[11px] text-slate-400 font-semibold">Distribusi siaran host Liva Agency</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                        {Object.entries(
                          clientBrands
                            .flatMap((b) => b.sessions || [])
                            .reduce(
                              (acc, sess) => {
                                if (sess.platform) {
                                  acc[sess.platform] =
                                    (acc[sess.platform] || 0) + 1;
                                }
                                return acc;
                              },
                              {} as Record<string, number>,
                            ),
                        ).map(([plat, count]) => {
                          const isTiktok = plat.toLowerCase().includes('tiktok');
                          const isShopee = plat.toLowerCase().includes('shopee');
                          const colorClass = isTiktok ? 'text-slate-900 bg-slate-50 border-slate-200' : isShopee ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-indigo-600 bg-indigo-50 border-indigo-100';
                          
                          return (
                            <div
                              key={plat}
                              className={`p-5 rounded-2xl border ${colorClass} flex flex-col justify-center items-center transition-all hover:scale-105 hover:shadow-md cursor-default`}
                            >
                              <span className="text-[11px] font-black uppercase tracking-wider block mb-2 text-center opacity-80">
                                {plat}
                              </span>
                              <span className="font-mono font-black text-3xl">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                        {clientBrands.flatMap((b) => b.sessions || []).length ===
                          0 && (
                          <div className="col-span-2 md:col-span-4 flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <Monitor className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold text-sm">Belum ada sesi platform</p>
                            <p className="text-slate-400 text-[11px] mt-1">Tambahkan sesi ke brand untuk melihat statistik di sini.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TABEL INVOICE & MEETING DATES */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                      {/* Tabel Invoice Deadline */}
                      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <h3 className="text-slate-800 font-black text-sm">Deadline Invoice</h3>
                            <p className="text-[11px] text-slate-400 font-semibold">Jatuh tempo penagihan ke client</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar pb-2">
                          <table className="w-full text-left text-xs border-collapse min-w-[450px]">
                            <thead>
                              <tr className="bg-slate-50/80 border-y border-slate-100 uppercase text-[9px] font-black tracking-widest text-slate-500">
                                <th className="py-3 px-4 sticky left-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Nama Brand</th>
                                <th className="py-3 px-4">Tgl Jatuh Tempo</th>
                                <th className="py-3 px-4">Jumlah Sesi</th>
                                <th className="py-3 px-4 text-right">Berakhir Kontrak</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {clientBrands.length > 0 ? (
                                clientBrands.map((b) => (
                                  <tr
                                    key={`inv-${b.id}`}
                                    className="hover:bg-slate-50/50 transition-colors group/row"
                                  >
                                    <td className="py-3 px-4 font-bold text-slate-800 sticky left-0 bg-white group-hover/row:bg-slate-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                      {b.name}
                                    </td>
                                    <td className="py-3 px-4">
                                      {b.invoiceDate ? (
                                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold text-[11px]">
                                          Tgl {b.invoiceDate.split('T')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-slate-500">
                                      {b.sessions ? b.sessions.length : 0} Sesi
                                    </td>
                                    <td className="py-3 px-4 text-right font-semibold text-slate-400">
                                      {b.contractEndDate ? b.contractEndDate.split('T')[0] : "-"}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="py-10">
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                                      <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                                      <p className="text-slate-500 font-bold text-sm">Belum ada brand aktif</p>
                                      <p className="text-slate-400 text-[11px] mt-1">Data invoice akan muncul otomatis di sini.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Tabel Tanggal Meeting */}
                      <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-5 border-b border-slate-50 pb-4 relative z-10">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-slate-800 font-black text-sm">Jadwal Meeting Rutin</h3>
                            <p className="text-[11px] text-slate-400 font-semibold">Meeting evaluasi bulanan client</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar pb-2">
                          <table className="w-full text-left text-xs border-collapse min-w-[300px]">
                            <thead>
                              <tr className="bg-slate-50/80 border-y border-slate-100 uppercase text-[9px] font-black tracking-widest text-slate-500">
                                <th className="py-3 px-4 sticky left-0 bg-slate-50/90 backdrop-blur-sm z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Nama Brand</th>
                                <th className="py-3 px-4 text-right">Tgl Bulanan Meeting</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {clientBrands.length > 0 ? (
                                clientBrands.map((b) => (
                                  <tr
                                    key={`meet-${b.id}`}
                                    className="hover:bg-slate-50/50 transition-colors group/row"
                                  >
                                    <td className="py-3 px-4 font-bold text-slate-800 sticky left-0 bg-white group-hover/row:bg-slate-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                      {b.name}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                      {b.monthlyMeetingDate ? (
                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold text-[11px]">
                                          Tgl {b.monthlyMeetingDate.split('T')[0]}
                                        </span>
                                      ) : (
                                        <span className="text-slate-300">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="py-10">
                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                                      <Calendar className="w-8 h-8 text-slate-300 mb-2" />
                                      <p className="text-slate-500 font-bold text-sm">Belum ada meeting</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* TABEL SLOT STUDIO DI PLOT BRAND (URUTAN SHIFT JAM) */}
                    <div
                      className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm mt-6"
                      id="studio_slots_panel"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <Radio className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="text-slate-800 font-black text-sm">Plot Slot Studio (Berdasarkan Shift)</h3>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            Pemetaan pemakaian ruang studio oleh brand sesuai jam tayang.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto custom-scrollbar border border-slate-100 rounded-2xl mt-5 shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200 uppercase text-[10px] font-black tracking-widest text-slate-500 whitespace-nowrap">
                              <th className="py-3.5 px-5 border-r border-slate-200 sticky left-0 bg-slate-100 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                Nama Studio
                              </th>
                              {shifts.map((sh) => (
                                <th
                                  key={sh}
                                  className="py-3.5 px-5 border-r border-slate-100 last:border-r-0 min-w-[120px]"
                                >
                                  {sh}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {(() => {
                              const allStudioNames = Array.from(
                                new Set([
                                  ...studios.map((s) => s.name),
                                  ...clientBrands
                                    .flatMap(
                                      (b) =>
                                        b.sessions?.map(
                                          (s) => s.studio || "",
                                        ) || [],
                                    )
                                    .filter(Boolean),
                                ]),
                              ).sort();

                              if (allStudioNames.length === 0) {
                                return (
                                  <tr>
                                    <td
                                      colSpan={shifts.length + 1}
                                      className="py-12 px-6"
                                    >
                                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 max-w-lg mx-auto">
                                        <Radio className="w-10 h-10 text-slate-300 mb-3" />
                                        <p className="text-slate-600 font-bold text-sm">Belum ada pemetaan studio</p>
                                        <p className="text-slate-400 text-xs mt-1 text-center">Data studio akan otomatis terbentuk ketika Anda mendaftarkan studio baru atau memplot sesi siaran.</p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              }

                              return allStudioNames.map((studioName, i) => (
                                <tr
                                  key={`studio-row-${i}`}
                                  className="hover:bg-indigo-50/30 transition-colors group/row"
                                >
                                  <td className="py-3 px-5 font-black text-slate-800 border-r border-slate-100 whitespace-nowrap sticky left-0 bg-white group-hover/row:bg-indigo-50/30 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    {studioName}
                                  </td>
                                  {shifts.map((shift) => {
                                    const occupyingBrands = clientBrands
                                      .filter((b) =>
                                        b.sessions?.some(
                                          (s) =>
                                            s.studio === studioName &&
                                            s.shift === shift,
                                        ),
                                      )
                                      .map((b) => b.name);

                                    return (
                                      <td
                                        key={shift}
                                        className="py-3 px-5 font-bold text-slate-600 border-r border-slate-50 last:border-r-0"
                                      >
                                        {occupyingBrands.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {occupyingBrands.map(bName => (
                                              <span key={bName} className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-extrabold whitespace-nowrap">
                                                {bName}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-slate-200">-</span>
                                        )}
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
                  );
                })()}

                {/* ==================== SUBTAB: 2. CALENDAR JADWAL KERJA HOST ==================== */}
                {operatorTab === "absensi" && (
                  <div
                    className="space-y-6 animate-fadeIn"
                    id="operator_absensi_content"
                  >
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
                            <p className="text-[13px] text-slate-500 font-medium">
                              Manajemen Jadwal Siaran (Roster) Seluruh Host
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-2">
                              {hosts.slice(0, 4).map((h, i) => (
                                <div
                                  key={h.id}
                                  className="w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center text-[10px] font-bold z-30 shadow-sm"
                                  style={{
                                    backgroundColor:
                                      "#" +
                                      Math.floor(Math.random() * 16777215)
                                        .toString(16)
                                        .padEnd(6, "0") +
                                      "40",
                                    color: "#1e293b",
                                  }}
                                >
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
                          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto pb-2 xl:pb-0 -mb-[17px]">
                            <button
                              type="button"
                              className="px-3 py-2.5 rounded-none border-b-2 border-slate-800 text-slate-800 font-bold text-[13px] flex items-center gap-2 whitespace-nowrap"
                            >
                              <Calendar className="w-4 h-4" strokeWidth={2.5} />{" "}
                              Jadwal Aktif
                            </button>

                            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

                            {/* Actions Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsScheduleActionsOpen(!isScheduleActionsOpen)}
                                className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                              >
                                <Settings className="w-4 h-4 text-slate-500" /> Aksi Lanjutan
                              </button>
                              
                              {isScheduleActionsOpen && (
                                <>
                                  <div className="fixed inset-0 z-30" onClick={() => setIsScheduleActionsOpen(false)} />
                                  <div className="absolute top-full left-0 mt-2 p-3 bg-white border border-slate-200 shadow-xl rounded-2xl z-40 w-80 animate-fadeIn">
                                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Manajemen Massal</h4>
                                    
                                    <div className="flex flex-col gap-2 mb-4">
                                      <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">
                                        Periode Eksekusi:
                                      </span>
                                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-lg px-2.5 py-1.5">
                                        <input
                                          type="date"
                                          value={scheduleActionStartDate}
                                          onChange={(e) => setScheduleActionStartDate(e.target.value)}
                                          className="flex-1 w-full bg-transparent border-0 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                                        />
                                        <span className="text-slate-400 text-xs font-semibold">s/d</span>
                                        <input
                                          type="date"
                                          value={scheduleActionEndDate}
                                          onChange={(e) => setScheduleActionEndDate(e.target.value)}
                                          className="flex-1 w-full bg-transparent border-0 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const startParts = scheduleActionStartDate.split("-");
                                          const endParts = scheduleActionEndDate.split("-");
                                          const startObj = new Date(
                                            parseInt(startParts[0]),
                                            parseInt(startParts[1]) - 1,
                                            parseInt(startParts[2]),
                                          );
                                          const endObj = new Date(
                                            parseInt(endParts[0]),
                                            parseInt(endParts[1]) - 1,
                                            parseInt(endParts[2]),
                                          );
                                          if (startObj > endObj) {
                                            addNotification(
                                              "Error",
                                              "Tanggal mulai tidak boleh lebih besar dari tanggal akhir.",
                                              "danger",
                                              "absensi",
                                            );
                                            return;
                                          }

                                          requestConfirm(
                                            "Konfirmasi Auto Generate",
                                            `Auto Generate akan membuat jadwal harian untuk seluruh sesi dari tanggal ${scheduleActionStartDate} s.d. ${scheduleActionEndDate} (dan menghapus jadwal lama yang berpotongan). Lanjutkan?`,
                                            () => {
                                              const newSchedules: ShiftSchedule[] = [];
                                              const dateWalker = new Date(startObj);

                                              while (dateWalker <= endObj) {
                                                // format YYYY-MM-DD
                                                const yyyy = dateWalker.getFullYear();
                                                const mm = String(
                                                  dateWalker.getMonth() + 1,
                                                ).padStart(2, "0");
                                                const dd = String(
                                                  dateWalker.getDate(),
                                                ).padStart(2, "0");
                                                const dateStr = `${yyyy}-${mm}-${dd}`;

                                                clientBrands.forEach((brand) => {
                                                  if (brand.sessions) {
                                                    brand.sessions.forEach((sess) => {
                                                      if (!sess.host) return;

                                                      // find the host with robust naming check
                                                      const hostObj = hosts.find(
                                                        (h) =>
                                                          h.name.toLowerCase().trim() ===
                                                          sess.host.toLowerCase().trim(),
                                                      );
                                                      if (hostObj) {
                                                        newSchedules.push({
                                                          id: `auto_gen_${brand.id}_${dateStr}_${sess.id}`,
                                                          hostId: hostObj.id,
                                                          hostName: hostObj.name,
                                                          employeeId: hostObj.employeeId,
                                                          date: dateStr,
                                                          timeSlot: sess.shift,
                                                          platform: sess.platform || "",
                                                          brand: brand.name,
                                                          status: "Assigned" as ShiftSchedule["status"],
                                                          studio:
                                                            sess.studio ||
                                                            "Studio Bandar Lampung",
                                                          isOffDay: false,
                                                          isPindahStudio: false,
                                                          backupHostId: "",
                                                          backupHostName: "",
                                                        });
                                                      }
                                                    });
                                                  }
                                                });
                                                dateWalker.setDate(
                                                  dateWalker.getDate() + 1,
                                                );
                                              }

                                              // Replace existing schedules for this period with the newly generated ones
                                              setSchedules((prev) => {
                                                const filtered = prev.filter((s) => {
                                                  if (!s.date) return true;
                                                  return (
                                                    s.date < scheduleActionStartDate ||
                                                    s.date > scheduleActionEndDate
                                                  );
                                                });
                                                return [...filtered, ...newSchedules];
                                              });
                                              // Persist Auto Generate ke database
                                              Promise.allSettled(
                                                newSchedules.map((s) => schedulesApi.create(s))
                                              ).catch(console.error);

                                              addNotification(
                                                "Jadwal Berhasil Dibuat",
                                                `Auto Generate selesai memproduksi ${newSchedules.length} sesi dari ${scheduleActionStartDate} s.d. ${scheduleActionEndDate}.`,
                                                "success",
                                                "absensi",
                                              );
                                            },
                                            "info",
                                          );
                                          setIsScheduleActionsOpen(false);
                                        }}
                                        className="w-full px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-indigo-100"
                                      >
                                        <Sparkles className="w-4 h-4" /> Auto Generate
                                      </button>
                                      
                                      <button
                                        type="button"
                                        onClick={() => {
                                          requestConfirm(
                                            `Reset Jadwal (${scheduleActionStartDate} s.d. ${scheduleActionEndDate})`,
                                            `Apakah Anda yakin ingin menghapus SELURUH jadwal dari ${scheduleActionStartDate} s.d. ${scheduleActionEndDate}? Tindakan ini tidak dapat dibatalkan.`,
                                            () => {
                                              setSchedules((prev) => {
                                                const toRemove = prev.filter((s) => {
                                                  if (!s.date) return false;
                                                  return (
                                                    s.date >= scheduleActionStartDate &&
                                                    s.date <= scheduleActionEndDate
                                                  );
                                                });
                                                // Persist Reset ke database
                                                Promise.allSettled(
                                                  toRemove.map((s) => schedulesApi.delete(s.id))
                                                ).catch(console.error);
                                                return prev.filter((s) => {
                                                  if (!s.date) return true;
                                                  return (
                                                    s.date < scheduleActionStartDate ||
                                                    s.date > scheduleActionEndDate
                                                  );
                                                });
                                              });
                                              addNotification(
                                                "Jadwal Direset",
                                                `Seluruh jadwal dari ${scheduleActionStartDate} s.d. ${scheduleActionEndDate} berhasil dihapus.`,
                                                "danger",
                                                "absensi",
                                              );
                                            },
                                            "danger",
                                          );
                                          setIsScheduleActionsOpen(false);
                                        }}
                                        className="w-full px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-rose-100"
                                      >
                                        <Trash2 className="w-4 h-4" /> Reset Jadwal
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
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
                                  backupHostId: "",
                                });
                              }}
                              className="px-4 py-2 bg-[#1e1b2e] hover:bg-[#2c2844] border-0 rounded-xl text-xs font-bold text-white flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-sm"
                            >
                              <Plus className="w-4 h-4" /> + Tambah Jadwal
                            </button>
                          </div>
                        </div>

                        {/* JADWAL TERDAFTAR SEBELUMNYA PADA HARI INI */}
                        <div
                          id="schedules-on-selected-date"
                          className="space-y-3 mb-6 bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
                        >
                          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4 flex-wrap gap-2">
                            <h5 className="text-[14px] font-black uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                              <span></span> Jadwal Siaran Aktif Tanggal Ini
                            </h5>
                            <div className="flex items-center gap-2 relative">
                              {/* Prev Day Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    const d = new Date(selectedCalendarDate);
                                    if (!isNaN(d.getTime())) {
                                      d.setDate(d.getDate() - 1);
                                      const y = d.getFullYear();
                                      const m = String(
                                        d.getMonth() + 1,
                                      ).padStart(2, "0");
                                      const dateStr = String(
                                        d.getDate(),
                                      ).padStart(2, "0");
                                      setSelectedCalendarDate(
                                        `${y}-${m}-${dateStr}`,
                                      );
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-205 hover:bg-[#eef2ff] hover:text-[#5642f5] hover:border-[#e0e7ff] text-slate-500 cursor-pointer transition-all active:scale-90 flex items-center justify-center shadow-xs"
                                title="Hari Sebelumnya"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>

                              {/* The Trigger Pill (Styled exactly like the uploaded O Terdaftar badge) */}
                              <div
                                onClick={() => {
                                  setIsCustomDatePickerOpen(
                                    !isCustomDatePickerOpen,
                                  );
                                  if (!isCustomDatePickerOpen) {
                                    try {
                                      const parts =
                                        selectedCalendarDate.split("-");
                                      if (parts.length === 3) {
                                        setPickerYear(parseInt(parts[0], 10));
                                        setPickerMonth(
                                          parseInt(parts[1], 10) - 1,
                                        );
                                        setPickerTempDate(selectedCalendarDate);
                                      }
                                    } catch (e) {
                                      console.error(e);
                                    }
                                  }
                                }}
                                id="date-selection-badge"
                                className="relative flex items-center gap-1.5 bg-[#eef2ff] hover:bg-[#e0e7ff]/80 px-4 py-1.5 rounded-full text-[11px] font-black text-[#5642f5] transition-all cursor-pointer select-none shadow-2xs border border-[#e0e7ff]/50 active:scale-[97%]"
                              >
                                <span>📅</span>
                                <span className="pr-3 text-[11px] font-black text-[#5642f5] tracking-wide">
                                  {(() => {
                                    try {
                                      const d = new Date(selectedCalendarDate);
                                      if (isNaN(d.getTime()))
                                        return selectedCalendarDate;
                                      return d.toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      });
                                    } catch (e) {
                                      return selectedCalendarDate;
                                    }
                                  })()}
                                </span>
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[8px] text-[#5642f5]/80">
                                  ▼
                                </span>
                              </div>

                              {/* Next Day Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try {
                                    const d = new Date(selectedCalendarDate);
                                    if (!isNaN(d.getTime())) {
                                      d.setDate(d.getDate() + 1);
                                      const y = d.getFullYear();
                                      const m = String(
                                        d.getMonth() + 1,
                                      ).padStart(2, "0");
                                      const dateStr = String(
                                        d.getDate(),
                                      ).padStart(2, "0");
                                      setSelectedCalendarDate(
                                        `${y}-${m}-${dateStr}`,
                                      );
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }}
                                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-205 hover:bg-[#eef2ff] hover:text-[#5642f5] hover:border-[#e0e7ff] text-slate-500 cursor-pointer transition-all active:scale-90 flex items-center justify-center shadow-xs"
                                title="Hari Selanjutnya"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>

                              {/* Custom Floating Calendar Dropdown inspired by the reference design */}
                              {isCustomDatePickerOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                                    onClick={() =>
                                      setIsCustomDatePickerOpen(false)
                                    }
                                  />
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-[-10px] sm:right-0 top-full mt-3 w-[260px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-left animate-fadeIn origin-top-right"
                                  >
                                    {/* Month/Year and Next Month/Year navigation controls */}
                                    <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                                      <span className="text-xs font-black text-slate-800 tracking-wider select-none">
                                        {pickerYear} -{" "}
                                        {String(pickerMonth + 1).padStart(
                                          2,
                                          "0",
                                        )}
                                      </span>
                                      <div className="flex items-center gap-1 select-none">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (pickerMonth === 0) {
                                              setPickerMonth(11);
                                              setPickerYear(pickerYear - 1);
                                            } else {
                                              setPickerMonth(pickerMonth - 1);
                                            }
                                          }}
                                          className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition-colors"
                                          title="Sebelumnya"
                                        >
                                          <ChevronLeft className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (pickerMonth === 11) {
                                              setPickerMonth(0);
                                              setPickerYear(pickerYear + 1);
                                            } else {
                                              setPickerMonth(pickerMonth + 1);
                                            }
                                          }}
                                          className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer transition-colors"
                                          title="Selanjutnya"
                                        >
                                          <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Weekday indicator labels */}
                                    <div className="grid grid-cols-7 text-center mb-1.5 select-none">
                                      {[
                                        "Sun",
                                        "Mon",
                                        "Tue",
                                        "Wed",
                                        "Thu",
                                        "Fri",
                                        "Sat",
                                      ].map((day) => (
                                        <span
                                          key={day}
                                          className="text-[9px] font-black uppercase text-slate-400 w-8 h-5 flex items-center justify-center tracking-wider"
                                        >
                                          {day}
                                        </span>
                                      ))}
                                    </div>

                                    {/* Days matrix grid */}
                                    <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center">
                                      {(() => {
                                        const dCells = getPickerDays(
                                          pickerYear,
                                          pickerMonth,
                                        );
                                        return dCells.map((dObj, idx) => {
                                          const isSelectedInPicker =
                                            pickerTempDate === dObj.dateString;
                                          const isToday =
                                            new Date()
                                              .toISOString()
                                              .split("T")[0] ===
                                            dObj.dateString;

                                          let textClass =
                                            "text-slate-800 font-extrabold";
                                          if (dObj.monthType !== "current") {
                                            textClass =
                                              "text-slate-300 font-bold";
                                          }

                                          return (
                                            <div
                                              key={idx}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDaySelect(dObj);
                                              }}
                                              className={`w-7 h-7 flex flex-col items-center justify-center text-[10px] rounded-lg transition-all cursor-pointer relative select-none ${
                                                isSelectedInPicker
                                                  ? "bg-[#009688] text-white font-black shadow-xs scale-105"
                                                  : isToday
                                                    ? "border border-[#009688]/30 text-[#009688] hover:bg-[#009688]/5 font-black"
                                                    : "hover:bg-slate-100 font-bold"
                                              } ${textClass}`}
                                            >
                                              <span>{dObj.day}</span>
                                              {isToday &&
                                                !isSelectedInPicker && (
                                                  <span className="absolute bottom-1 w-1 h-1 bg-[#009688] rounded-full"></span>
                                                )}
                                            </div>
                                          );
                                        });
                                      })()}
                                    </div>

                                    {/* Modal Actions Footer: Batal & Terapkan (Styled exactly like references) */}
                                    <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100 select-none">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setIsCustomDatePickerOpen(false);
                                        }}
                                        className="px-3.5 py-1.5 bg-[#F5F5F5] hover:bg-slate-200 text-slate-600 rounded-xl font-black text-[10px] cursor-pointer transition-all active:scale-95"
                                      >
                                        Batal
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedCalendarDate(
                                            pickerTempDate,
                                          );
                                          setIsCustomDatePickerOpen(false);
                                        }}
                                        className="px-4 py-1.5 bg-[#009688] hover:bg-[#00796B] text-white rounded-xl font-black text-[10px] cursor-pointer transition-all shadow-xs active:scale-95"
                                      >
                                        Terapkan
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  type="text"
                                  placeholder="Cari host/brand..."
                                  value={scheduleModalSearch}
                                  onChange={(e) =>
                                    setScheduleModalSearch(e.target.value)
                                  }
                                  className="w-[180px] bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all font-bold"
                                />
                              </div>
                              {/* Terdaftar Badges: Matching exactly the uploaded '0 Terdaftar' image */}
                              <span className="px-4 py-1.5 rounded-full bg-[#eef2ff] text-xs font-black text-[#5642f5] tracking-wide select-none shadow-3xs border border-[#e0e7ff]/60">
                                {
                                  computedSchedules.filter(
                                    (s) => (s.date || "").split("T")[0] === selectedCalendarDate,
                                  ).length
                                }{" "}
                                Terdaftar
                              </span>
                            </div>
                          </div>

                          {/* IDLE REGULAR HOSTS BANNER */}
                          {(() => {
                            // Get all regular hosts from master list
                            const regularHosts = hosts.filter(
                              (h) => (h.hostType || "Reguler") === "Reguler",
                            );

                            // Get active schedules for selected calendar date
                            let dayScheds = computedSchedules.filter(
                              (s) =>
                                (s.date || "").split("T")[0] === selectedCalendarDate && !s.isOffDay,
                            );

                            // Let the host availability be based on ALL schedules, not just filtered ones, to show true availability.
                            // But wait, the list of schedules below it SHOULD be filtered by adminCalendarHostFilter.

                            // Hosts currently active/assigned on this day in any studio
                            const activeHostIds = new Set(
                              dayScheds.flatMap((s) =>
                                [s.hostId, s.backupHostId].filter(Boolean),
                              ),
                            );

                            // Filter those regular hosts who are NOT active
                            const idleHosts = regularHosts.filter(
                              (h) => !activeHostIds.has(h.id),
                            );

                            // Find brands and their unscheduled shifts for this day, flat mapped by shift
                            const idleBrandShifts = clientBrands
                              .flatMap((b) => {
                                if (b.isActive === false) return [];
                                const brandName = b.name.toLowerCase();
                                const scheduledShiftsForBrand = dayScheds
                                  .filter((s) => {
                                    const sBrand = s.brand?.trim().toLowerCase() || "";
                                    return sBrand === brandName || sBrand.includes(brandName) || brandName.includes(sBrand);
                                  })
                                  .map((s) => s.timeSlot);

                                const configuredShifts = (b.sessions || []).map((s) => s.shift).filter(Boolean);
                                
                                // Jika brand tidak memiliki shift yang diatur, anggap tidak perlu masuk idle
                                if (configuredShifts.length === 0) return [];

                                const unscheduledShifts: string[] = [];
                                const scheduledShiftsCopy = [...scheduledShiftsForBrand];

                                for (const reqShift of configuredShifts) {
                                  const idx = scheduledShiftsCopy.indexOf(reqShift);
                                  if (idx !== -1) {
                                    // Found a match in calendar, remove it so it's not counted again
                                    scheduledShiftsCopy.splice(idx, 1);
                                  } else {
                                    // Not found in calendar, so it's missing
                                    unscheduledShifts.push(reqShift);
                                  }
                                }

                                return unscheduledShifts.map(sh => ({ brand: b, missingShift: sh }));
                              });

                            return (
                              <div className="mb-5 space-y-3">
                                <details className="p-3.5 bg-emerald-50/30 border border-emerald-100/50 rounded-xl group" open={idleHosts.length <= 8}>
                                  <summary className="flex flex-wrap items-center gap-2 cursor-pointer list-none select-none">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-md">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                      Host Tersedia (Idle)
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                      Host reguler yang belum dijadwalkan hari ini ({idleHosts.length} orang)
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-emerald-500 ml-auto transition-transform group-open:rotate-180" />
                                  </summary>
                                  {idleHosts.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-emerald-100/50">
                                      {idleHosts.map((h) => (
                                        <span
                                          key={h.id}
                                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-100/60 shadow-3xs text-xs font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all cursor-default"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                          {h.name}
                                          {h.studio && (
                                            <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-1 py-0.5 rounded">
                                              {h.studio.replace(/^Studio\s+/, "")}
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-emerald-100/50">
                                      Semua host reguler telah terdaftar di jadwal
                                      siaran studio hari ini.
                                    </p>
                                  )}
                                </details>
                                
                                <details className="p-3.5 bg-amber-50/30 border border-amber-100/50 rounded-xl group" open={idleBrandShifts.length <= 8}>
                                  <summary className="flex flex-wrap items-center gap-2 cursor-pointer list-none select-none">
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md">
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                      Brand Tersedia (Idle)
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                      Brand yang memiliki shift kosong hari ini ({idleBrandShifts.length} jadwal)
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-amber-500 ml-auto transition-transform group-open:rotate-180" />
                                  </summary>
                                  {idleBrandShifts.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-amber-100/50">
                                      {idleBrandShifts.map((info, idx) => (
                                        <span
                                          key={`${info.brand.id}-${info.missingShift}-${idx}`}
                                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-amber-100/60 shadow-3xs text-xs font-bold text-slate-700 hover:border-amber-200 hover:bg-amber-50/20 transition-all cursor-default"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                          {info.brand.name}
                                          <span className="text-[10px] text-slate-400 font-semibold bg-slate-50 px-1 py-0.5 rounded ml-1">
                                            {info.missingShift}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-slate-500 italic mt-3 pt-3 border-t border-amber-100/50">
                                      Semua brand klien telah terisi penuh jadwal siarannya hari ini.
                                    </p>
                                  )}
                                </details>
                              </div>
                            );
                          })()}

                          <div className="pt-1">
                            {(() => {
                              let dayScheds = computedSchedules.filter(
                                (s) =>
                                  (s.date || "").split("T")[0] === selectedCalendarDate &&
                                  (adminCalendarHostFilter === "all" ||
                                    s.hostId === adminCalendarHostFilter),
                              );

                              if (scheduleModalSearch.trim()) {
                                const q = scheduleModalSearch.toLowerCase();
                                dayScheds = dayScheds.filter(
                                  (s) =>
                                    s.hostName?.toLowerCase().includes(q) ||
                                    s.brand?.toLowerCase().includes(q) ||
                                    s.platform?.toLowerCase().includes(q) ||
                                    s.studio?.toLowerCase().includes(q),
                                );
                              }

                              const timeRegex = /\b(\d{2}:\d{2})\b/;
                              dayScheds.sort((a, b) => {
                                const matchA = (a.timeSlot || "").match(
                                  timeRegex,
                                );
                                const matchB = (b.timeSlot || "").match(
                                  timeRegex,
                                );
                                const timeA = matchA ? matchA[1] : a.timeSlot;
                                const timeB = matchB ? matchB[1] : b.timeSlot;

                                if (timeA < timeB) return -1;
                                if (timeA > timeB) return 1;
                                return 0;
                              });

                              if (
                                dayScheds.length === 0 &&
                                scheduleModalSearch.trim()
                              ) {
                                return (
                                  <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                                    Tidak ada jadwal yang sesuai pencarian "
                                    {scheduleModalSearch}".
                                  </div>
                                );
                              }

                              const uniqueScheds = Array.from(
                                new Map<string, ShiftSchedule>(
                                  dayScheds.map((s) => [s.id, s] as const),
                                ).values(),
                              );

                              // Extract all unique studio names from both master studios state and active schedules
                              const studioNames = Array.from(
                                new Set(
                                  [
                                    ...studios.map((st) => st.name),
                                    ...uniqueScheds.map(
                                      (s) => s.studio || "Tanpa Studio",
                                    ),
                                  ].filter(Boolean),
                                ),
                              );

                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 pb-2 items-start">
                                  {studioNames.map((studioName) => {
                                    // Filter schedules for this studio and explicitly sort them based on shift time
                                    const studioScheds = uniqueScheds
                                      .filter(
                                        (s) =>
                                          (s.studio || "Tanpa Studio") ===
                                          studioName,
                                      )
                                      .sort((a, b) => {
                                        const matchA = (a.timeSlot || "").match(
                                          timeRegex,
                                        );
                                        const matchB = (b.timeSlot || "").match(
                                          timeRegex,
                                        );
                                        const timeA = matchA
                                          ? matchA[1]
                                          : a.timeSlot;
                                        const timeB = matchB
                                          ? matchB[1]
                                          : b.timeSlot;
                                        if (timeA < timeB) return -1;
                                        if (timeA > timeB) return 1;
                                        return 0;
                                      });

                                    // Find location info if available in master list
                                    const masterStudio = studios.find(
                                      (st) => st.name === studioName,
                                    );
                                    const location = masterStudio
                                      ? masterStudio.location
                                      : "";

                                    // Make name ultra compact, e.g., "Studio Bandar Lampung" -> "Bandar Lampung"
                                    const displayStudioName =
                                      studioName.replace(/^Studio\s+/, "");

                                    return (
                                      <div
                                        key={studioName}
                                        className="w-full bg-slate-50/70 border border-slate-200/50 rounded-xl p-2.5 flex flex-col transition-all hover:bg-slate-50 shadow-3xs"
                                      >
                                        {/* Column Header */}
                                        <div className={`p-2 rounded-lg mb-2.5 flex items-center justify-between flex-shrink-0 shadow-3xs border border-slate-200/40 ${getStudioHeaderStyle(studioName)}`}>
                                          <div className="min-w-0">
                                            <h4
                                              className="font-black text-[11px] sm:text-[12px] truncate uppercase tracking-wider"
                                              title={studioName}
                                            >
                                              {displayStudioName}
                                            </h4>
                                            {location && (
                                              <span className="text-[9px] font-semibold block truncate opacity-80">
                                                {location}
                                              </span>
                                            )}
                                          </div>
                                          <span
                                            className="px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 bg-white/90 shadow-2xs text-slate-900 border border-slate-200/20 animate-pulse"
                                          >
                                            {studioScheds.length}
                                          </span>
                                        </div>

                                        {/* Board Cards Deck */}
                                        <div className="space-y-2 flex-1 flex flex-col">
                                          {studioScheds.length === 0 ? (
                                            <div className="py-4 text-center border border-dashed border-slate-200/40 rounded-lg bg-white/10 text-[10px] font-medium text-slate-400 italic">
                                              Kosong
                                            </div>
                                          ) : (
                                            studioScheds.map((sch, idxSch: number) => {
                                                const isOff = sch.isOffDay;
                                                const isPindah =
                                                  sch.isPindahStudio;
                                                return (
                                                  <div
                                                    key={
                                                      (sch?.id || "") +
                                                      "_" +
                                                      Math.random()
                                                        .toString(36)
                                                        .substr(2, 9)
                                                    }
                                                    className={`p-2.5 rounded-lg border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between hover:scale-[101%] hover:shadow-2xs hover:border-slate-300 text-[11px] ${
                                                      isOff
                                                        ? "border-l-[3.5px] border-l-amber-500 border-y-slate-100 border-r-slate-100"
                                                        : isPindah
                                                          ? "border-l-[3.5px] border-l-pink-500 border-y-slate-100 border-r-slate-100"
                                                          : sch.backupHostId
                                                            ? "border-l-[3.5px] border-l-emerald-500 border-y-slate-100 border-r-slate-100"
                                                            : "border-l-[3.5px] border-l-indigo-600 border-y-slate-100 border-r-slate-100"
                                                    }`}
                                                  >
                                                    <div>
                                                      {/* Badge / Shift Line */}
                                                      <div className="flex items-center justify-between gap-1 mb-1.5 font-mono text-[9px] font-bold text-slate-500">
                                                        <span className={`px-2 py-0.5 rounded-md font-black border tracking-wide uppercase ${getShiftStyle(sch.timeSlot)}`}>
                                                          ⏱️ {sch.timeSlot}
                                                        </span>
                                                        <div className="flex gap-0.5 shrink-0">
                                                          {sch.backupHostId &&
                                                            !isOff &&
                                                            !isPindah && (
                                                              <span className="text-[7.5px] bg-emerald-500 text-white font-black px-1 rounded uppercase">
                                                                Backup
                                                                </span>
                                                            )}
                                                          {isOff && (
                                                            <span className="text-[7.5px] bg-amber-500 text-white font-black px-1 rounded uppercase">
                                                              Off
                                                            </span>
                                                          )}
                                                          {isPindah && (
                                                            <span className="text-[7.5px] bg-pink-500 text-white font-black px-1 rounded uppercase">
                                                              Pindah
                                                            </span>
                                                          )}
                                                        </div>
                                                      </div>

                                                      {/* Host Details */}
                                                      <div className="font-bold text-slate-800 text-xs truncate leading-tight flex items-baseline justify-between gap-1 mb-1">
                                                        <span className="truncate">
                                                          {sch.hostName}
                                                        </span>
                                                        <span className="text-[9px] text-slate-450 text-slate-400 font-mono font-medium shrink-0">
                                                          ({sch.employeeId})
                                                        </span>
                                                      </div>

                                                      {/* Session Brand Info */}
                                                      <div className="text-[10px] text-slate-500 border-t border-slate-100/60 pt-1.5 mt-1.5 flex flex-wrap items-center justify-between gap-1">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black border uppercase tracking-wider ${getBrandStyle(sch.brand)}`}>
                                                          {sch.brand}
                                                        </span>
                                                        <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 rounded border ${
                                                          sch.platform?.toLowerCase().includes("tiktok") 
                                                            ? "bg-stone-900 text-white border-stone-950" 
                                                            : sch.platform?.toLowerCase().includes("shopee") 
                                                              ? "bg-amber-600 text-white border-amber-700" 
                                                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                        } shrink-0 uppercase`}>
                                                          {sch.platform}
                                                        </span>
                                                      </div>

                                                      {/* Exception Backup Info block */}
                                                      {sch.backupHostId && (
                                                        <div className="mt-1 text-[8.5px] bg-slate-50/80 border border-slate-100/50 rounded p-1 text-slate-600 leading-tight">
                                                          <span className="font-bold">
                                                            Backup:{" "}
                                                          </span>
                                                          <span className="font-black text-slate-850">
                                                            {sch.backupHostName ||
                                                              "N/A"}
                                                          </span>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Compact Action icons bar */}
                                                    <div className="flex justify-end gap-2 border-t border-slate-100/60 pt-1 mt-1.5">
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setIsScheduleModalOpen(
                                                            true,
                                                          );
                                                          setScheduleForm({
                                                            id: sch.id,
                                                            hostId: sch.hostId,
                                                            timeSlot:
                                                              sch.timeSlot,
                                                            brand: sch.brand,
                                                            platform:
                                                              sch.platform,
                                                            studio: sch.studio,
                                                            isOffDay:
                                                              sch.isOffDay ||
                                                              false,
                                                            isPindahStudio:
                                                              sch.isPindahStudio ||
                                                              false,
                                                            backupOption:
                                                              sch.backupHostId
                                                                ? "backup"
                                                                : "none",
                                                            backupHostId:
                                                              sch.backupHostId ||
                                                              "",
                                                          });
                                                        }}
                                                        className="p-0.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                                                        title="Ubah Jadwal"
                                                      >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                      </button>
                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          setConfirmModal({
                                                            isOpen: true,
                                                            title:
                                                              "Hapus Jadwal",
                                                            message: `Menghapus jadwal ${sch.hostName} pada tanggal ${sch.date}?`,
                                                            type: "danger",
                                                            confirmText:
                                                              "Hapus",
                                                            onConfirm: () => {
                                                              setSchedules(
                                                                (prev) =>
                                                                  prev.filter(
                                                                    (s) =>
                                                                      s.id !==
                                                                      sch.id,
                                                                  ),
                                                              );
                                                              // Persist Delete ke database
                                                              schedulesApi.delete(sch.id).catch(console.error);
                                                              if (sch.hostId) {
                                                                addHostNotification(
                                                                  sch.hostId,
                                                                  "Jadwal Dihapus",
                                                                  `Jadwal siaran Anda pada tanggal ${sch.date} telah dihapus.`,
                                                                  sch.date,
                                                                );
                                                              }
                                                              setConfirmModal(
                                                                null,
                                                              );
                                                            },
                                                          });
                                                        }}
                                                        className="p-0.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                                        title="Hapus Jadwal"
                                                      >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                      </button>
                                                    </div>
                                                  </div>
                                                );
                                              },
                                            )
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Calendar Controls */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-2 p-2">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-slate-800 capitalize">
                              {(() => {
                                const monthNames = [
                                  "Januari",
                                  "Februari",
                                  "Maret",
                                  "April",
                                  "Mei",
                                  "Juni",
                                  "Juli",
                                  "Agustus",
                                  "September",
                                  "Oktober",
                                  "November",
                                  "Desember",
                                ];
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
                              className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              Hari Ini
                            </button>
                            <div className="hidden min-[400px]:block w-px h-6 bg-slate-200"></div>
                            <SearchableHostSelect
                              hosts={hosts}
                              value={adminCalendarHostFilter}
                              onChange={setAdminCalendarHostFilter}
                              showAllOption={true}
                              allOptionLabel="Semua Host"
                              placeholder="Pilih Host..."
                              className="w-full min-[400px]:w-[180px]"
                              triggerClassName="w-full bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-slate-700 px-3 py-1.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer flex items-center justify-between gap-2.5 min-h-[34px]"
                            />
                          </div>

                          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto">
                            {/* Month Navigation */}
                            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                              <button
                                type="button"
                                onClick={() => {
                                  if (calendarMonth === 0) {
                                    setCalendarMonth(11);
                                    setCalendarYear((y) => y - 1);
                                  } else {
                                    setCalendarMonth((m) => m - 1);
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
                                    setCalendarYear((y) => y + 1);
                                  } else {
                                    setCalendarMonth((m) => m + 1);
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
                            {[
                              "Minggu",
                              "Senin",
                              "Selasa",
                              "Rabu",
                              "Kamis",
                              "Jumat",
                              "Sabtu",
                            ].map((dayName, idx) => (
                              <div
                                key={dayName}
                                className="py-4 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-center justify-center"
                              >
                                <span
                                  className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${idx === 0 ? "text-red-500" : "text-slate-400"}`}
                                >
                                  {dayName}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Calendar Grid Body */}
                          <div className="grid grid-cols-7 bg-slate-50 gap-px">
                            {(() => {
                              const daysInMonth = new Date(
                                calendarYear,
                                calendarMonth + 1,
                                0,
                              ).getDate();
                              const offset = new Date(
                                calendarYear,
                                calendarMonth,
                                1,
                              ).getDay();

                              const cells = [];
                              // Fill initial blanks
                              for (let i = 0; i < offset; i++) {
                                cells.push(
                                  <div
                                    key={`blank-${i}`}
                                    className="bg-slate-50/40 min-h-[140px]"
                                  />,
                                );
                              }

                              // Fill actual days
                              for (let i = 1; i <= daysInMonth; i++) {
                                const dateString = `${calendarYear}-${String(calendarMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
                                const daySchedules = computedSchedules.filter(
                                  (s) =>
                                    (s.date || "").split("T")[0] === dateString &&
                                    (adminCalendarHostFilter === "all" ||
                                      s.hostId === adminCalendarHostFilter),
                                );
                                const isSelected =
                                  selectedCalendarDate === dateString;
                                const isToday =
                                  new Date().toISOString().split("T")[0] ===
                                  dateString;

                                cells.push(
                                  <div
                                    key={i}
                                    onClick={() => {
                                      setSelectedCalendarDate(dateString);
                                      setTimeout(() => {
                                        const el = document.getElementById(
                                          "schedules-on-selected-date",
                                        );
                                        if (el) {
                                          el.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                          });
                                        }
                                      }, 80);
                                    }}
                                    className={`min-h-[140px] p-2.5 transition-all flex flex-col justify-start cursor-pointer group relative bg-white ${
                                      isSelected
                                        ? "ring-2 ring-inset ring-indigo-500 bg-indigo-50/10"
                                        : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-2 relative">
                                      <span
                                        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                                          isToday
                                            ? "bg-indigo-600 text-white"
                                            : "text-slate-700"
                                        }`}
                                      >
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
                                      {(() => {
                                        const groupedSchedules: Record<
                                          string,
                                          ShiftSchedule[]
                                        > = {};
                                        daySchedules.forEach((sch) => {
                                          const stdName =
                                            sch.studio ||
                                            "Studio Bandar Lampung";
                                          if (!groupedSchedules[stdName])
                                            groupedSchedules[stdName] = [];
                                          groupedSchedules[stdName].push(sch);
                                        });

                                        return Object.entries(groupedSchedules)
                                          .slice(0, 3)
                                          .map(
                                            ([stdName, scheds]: [
                                              string,
                                              ShiftSchedule[],
                                            ]) => (
                                              <div
                                                key={stdName}
                                                className="mb-1.5 last:mb-0 bg-slate-50 rounded p-1 border border-slate-100"
                                              >
                                                <div className="text-[8px] font-black uppercase text-slate-500 mb-1 tracking-wider">
                                                  {stdName}
                                                </div>
                                                <div className="space-y-1">
                                                  {scheds
                                                    .slice(0, 4)
                                                    .map(
                                                      (
                                                        sch,
                                                        idxSch: number,
                                                      ) => {
                                                        const bColor =
                                                          getBrandColor(
                                                            sch.brand ||
                                                              sch.timeSlot ||
                                                              "",
                                                          );
                                                        const colorClasses = `${bColor.bg} border ${bColor.border} ${bColor.text}`;

                                                        const isOff =
                                                          sch.isOffDay;

                                                        if (isOff) {
                                                          return (
                                                            <div
                                                              key={
                                                                (sch?.id ||
                                                                  "") +
                                                                "_" +
                                                                Math.random()
                                                                  .toString(36)
                                                                  .substr(2, 9)
                                                              }
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsScheduleModalOpen(
                                                                  true,
                                                                );
                                                                setSelectedCalendarDate(
                                                                  (sch.date || "").split("T")[0],
                                                                );
                                                                setScheduleForm(
                                                                  {
                                                                    id: sch.id,
                                                                    hostId:
                                                                      sch.hostId,
                                                                    timeSlot:
                                                                      sch.timeSlot,
                                                                    brand:
                                                                      sch.brand,
                                                                    platform:
                                                                      sch.platform,
                                                                    studio:
                                                                      sch.studio,
                                                                    isOffDay:
                                                                      sch.isOffDay ||
                                                                      false,
                                                                    isPindahStudio:
                                                                      sch.isPindahStudio ||
                                                                      false,
                                                                    backupOption:
                                                                      sch.isPindahStudio ||
                                                                      sch.isOffDay
                                                                        ? sch.backupHostId
                                                                          ? "other"
                                                                          : "none"
                                                                        : "none",
                                                                    backupHostId:
                                                                      sch.backupHostId ||
                                                                      "",
                                                                  },
                                                                );
                                                              }}
                                                              className="cursor-pointer hover:bg-slate-200 text-[8.5px] font-bold px-1 py-0.5 rounded bg-slate-100 text-slate-500 border-l-[3px] border-slate-300 truncate"
                                                            >
                                                              {sch.hostName}{" "}
                                                              Off
                                                            </div>
                                                          );
                                                        }

                                                        return (
                                                          <div
                                                            key={
                                                              (sch?.id || "") +
                                                              "_" +
                                                              Math.random()
                                                                .toString(36)
                                                                .substr(2, 9)
                                                            }
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setIsScheduleModalOpen(
                                                                true,
                                                              );
                                                              setSelectedCalendarDate(
                                                                (sch.date || "").split("T")[0],
                                                              );
                                                              setScheduleForm({
                                                                id: sch.id,
                                                                hostId:
                                                                  sch.hostId,
                                                                timeSlot:
                                                                  sch.timeSlot,
                                                                brand:
                                                                  sch.brand,
                                                                platform:
                                                                  sch.platform,
                                                                studio:
                                                                  sch.studio,
                                                                isOffDay:
                                                                  sch.isOffDay ||
                                                                  false,
                                                                isPindahStudio:
                                                                  sch.isPindahStudio ||
                                                                  false,
                                                                backupOption:
                                                                  sch.isPindahStudio ||
                                                                  sch.isOffDay
                                                                    ? sch.backupHostId
                                                                      ? "other"
                                                                      : "none"
                                                                    : "none",
                                                                backupHostId:
                                                                  sch.backupHostId ||
                                                                  "",
                                                              });
                                                            }}
                                                            className={`cursor-pointer text-[8.5px] font-bold px-1 py-0.5 rounded border-l-[3px] truncate hover:brightness-95 ${colorClasses}`}
                                                            title={`${sch.hostName} - ${sch.timeSlot}`}
                                                          >
                                                            {sch.hostName}
                                                          </div>
                                                        );
                                                      },
                                                    )}
                                                  {scheds.length > 4 && (
                                                    <div className="text-[8px] font-bold text-slate-400">
                                                      + {scheds.length - 4} host
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            ),
                                          );
                                      })()}
                                      {Object.keys(
                                        daySchedules.reduce((acc, sch) => {
                                          const stdName =
                                            sch.studio ||
                                            "Studio Bandar Lampung";
                                          acc[stdName] = true;
                                          return acc;
                                        }, {}),
                                      ).length > 3 && (
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
                                          backupHostId: "",
                                        });
                                      }}
                                      title="Tambah Jadwal"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>,
                                );
                              }

                              // Fill trailing blanks to complete the grid nicely
                              const totalCells = cells.length;
                              const remaining =
                                totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                              for (let i = 0; i < remaining; i++) {
                                cells.push(
                                  <div
                                    key={`blank-end-${i}`}
                                    className="bg-slate-50/40 min-h-[140px]"
                                  />,
                                );
                              }

                              return cells;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MODAL POP-UP: FORM MASUKKAN DATA HOST & BACKUP */}
                    {isScheduleModalOpen && (
                      <div
                        className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-md flex justify-end animate-fadeIn font-sans overflow-hidden"
                        id="calendar_schedule_modal"
                      >
                        <div className="bg-white max-w-lg w-full h-full shadow-2xl flex flex-col animate-slideInRight overflow-y-auto custom-scrollbar border-l border-slate-200">
                          {/* Modal Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-5 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center gap-2.5">
                              <Calendar className="w-5 h-5 text-blue-105" />
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 block">
                                  Kelola Shift & Roster Jadwal
                                </span>
                                <h4 className="text-sm font-black text-white">
                                  {(() => {
                                    try {
                                      const d = new Date(selectedCalendarDate);
                                      if (isNaN(d.getTime()))
                                        return selectedCalendarDate;
                                      return d.toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
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
                          <div className="p-6 space-y-6 text-slate-800">
                            {/* FORM MASUKKAN DATA HOST & BACKUP */}
                            <div className="pt-4 border-t border-slate-100 space-y-4">
                              <h5 className="text-[11px] font-black uppercase text-blue-600 tracking-wider flex items-center gap-1.5">
                                <span>✨</span>
                                {scheduleForm.id
                                  ? "Edit Jadwal Kerja Host & Backup"
                                  : "Masukkan Data Jadwal Host & Backup"}
                              </h5>

                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();

                                  const selectedHost = hosts.find(
                                    (h) => h.id === scheduleForm.hostId,
                                  );
                                  if (!selectedHost) {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Gagal Menyimpan",
                                      message:
                                        "Silakan pilih Host terlebih dahulu!",
                                      type: "warning",
                                      hideCancel: true,
                                      confirmText: "Mengerti",
                                      onConfirm: () => setConfirmModal(null),
                                    });
                                    return;
                                  }

                                  let repHostName = "";
                                  if (
                                    (scheduleForm.isOffDay ||
                                      scheduleForm.isPindahStudio) &&
                                    scheduleForm.backupHostId
                                  ) {
                                    const repObj = hosts.find(
                                      (h) => h.id === scheduleForm.backupHostId,
                                    );
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
                                    timeSlot:
                                      scheduleForm.timeSlot ||
                                      shifts[0] ||
                                      "Morning (08:00 - 12:00)",
                                    platform:
                                      scheduleForm.platform || "TikTok Live",
                                    brand:
                                      scheduleForm.brand ||
                                      brands[0] ||
                                      "Somethinc",
                                    status: "Assigned" as ShiftSchedule["status"],
                                    studio:
                                      scheduleForm.studio ||
                                      (studios[0]
                                        ? studios[0].name
                                        : "Studio Bandar Lampung"),
                                    isOffDay: scheduleForm.isOffDay,
                                    isPindahStudio: scheduleForm.isPindahStudio,
                                    backupHostId:
                                      scheduleForm.isOffDay ||
                                      scheduleForm.isPindahStudio
                                        ? scheduleForm.backupHostId
                                        : "",
                                    backupHostName:
                                      scheduleForm.isOffDay ||
                                      scheduleForm.isPindahStudio
                                        ? repHostName
                                        : "",
                                  };

                                  const finalizeSchedule = () => {
                                    setSchedules((prev) => [
                                      ...prev,
                                      newSchedule,
                                    ]);
                                    // Persist Create ke database
                                    schedulesApi.create(newSchedule).catch(console.error);
                                    addHostNotification(
                                      selectedHost.id,
                                      "Jadwal Baru",
                                      `Anda ditugaskan siaran pada tanggal ${selectedCalendarDate} untuk sesi ${newSchedule.timeSlot}.`,
                                      selectedCalendarDate,
                                    );
                                    // Reset state
                                    setScheduleForm({
                                      id: "",
                                      hostId: "",
                                      timeSlot:
                                        shifts[0] || "Morning (08:00 - 12:00)",
                                      brand: brands[0] || "Somethinc",
                                      platform: platforms[0] || "TikTok Live",
                                      studio: studios[0]
                                        ? studios[0].name
                                        : "Studio Bandar Lampung",
                                      isOffDay: false,
                                      isPindahStudio: false,
                                      backupOption: "none",
                                      backupHostId: "",
                                    });
                                  };

                                  if (scheduleForm.id) {
                                    // Modifying an existing manual schedule
                                    setSchedules((prev) =>
                                      prev.map((s) =>
                                        s.id === scheduleForm.id
                                          ? newSchedule
                                          : s,
                                      ),
                                    );
                                    // Persist Update ke database
                                    schedulesApi.update(scheduleForm.id, newSchedule).catch(console.error);
                                    addHostNotification(
                                      selectedHost.id,
                                      "Jadwal Diperbarui",
                                      `Jadwal Anda pada tanggal ${selectedCalendarDate} telah diperbarui (Sesi: ${newSchedule.timeSlot}).`,
                                      selectedCalendarDate,
                                    );
                                    // Reset state
                                    setScheduleForm({
                                      id: "",
                                      hostId: "",
                                      timeSlot:
                                        shifts[0] || "Morning (08:00 - 12:00)",
                                      brand: brands[0] || "Somethinc",
                                      platform: platforms[0] || "TikTok Live",
                                      studio: studios[0]
                                        ? studios[0].name
                                        : "Studio Bandar Lampung",
                                      isOffDay: false,
                                      isPindahStudio: false,
                                      backupOption: "none",
                                      backupHostId: "",
                                    });
                                  } else {
                                    // Check for clash
                                    const isClashed = computedSchedules?.some(
                                      (s) =>
                                        (s.date || "").split("T")[0] === selectedCalendarDate &&
                                        s.hostId === selectedHost.id &&
                                        s.timeSlot === scheduleForm.timeSlot &&
                                        s.id !== scheduleForm.id,
                                    );
                                    if (isClashed) {
                                      setConfirmModal({
                                        isOpen: true,
                                        title: "Peringatan Jadwal Bentrok",
                                        message:
                                          "Host ini sudah memiliki jadwal pada shift ini untuk hari tersebut. Tetap tambahkan?",
                                        type: "warning",
                                        confirmText: "Tambahkan",
                                        onConfirm: () => {
                                          finalizeSchedule();
                                          setConfirmModal(null);
                                        },
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
                                    <label className="block text-slate-500 font-extrabold mb-1.5">
                                      Pilih Studio:
                                    </label>
                                    <select
                                      value={scheduleForm.studio}
                                      onChange={(e) =>
                                        setScheduleForm((prev) => ({
                                          ...prev,
                                          studio: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                    >
                                      {studios.map((s) => (
                                        <option key={s.id} value={s.name}>
                                          {s.name} ({s.location})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-slate-500 font-extrabold mb-1.5">
                                      Host:
                                    </label>
                                    <SearchableHostSelect
                                      hosts={hosts}
                                      value={scheduleForm.hostId}
                                      onChange={(hostId) => {
                                        const hostObj = hosts.find(
                                          (h) => h.id === hostId,
                                        );
                                        if (!hostObj) {
                                          setScheduleForm((prev) => ({
                                            ...prev,
                                            hostId,
                                          }));
                                          return;
                                        }

                                        // Auto-detect if host has a default session assigned in brands
                                        let foundBrand = "";
                                        let foundPlatform = "";
                                        let foundShift = "";

                                        for (const b of clientBrands) {
                                          const sess = b.sessions?.find(
                                            (s) => s.host === hostObj.name,
                                          );
                                          if (sess) {
                                            foundBrand = b.name;
                                            foundPlatform = sess.platform;
                                            foundShift = sess.shift;
                                            break;
                                          }
                                        }

                                        setScheduleForm((prev) => ({
                                          ...prev,
                                          hostId,
                                          brand: foundBrand || prev.brand,
                                          platform:
                                            foundPlatform || prev.platform,
                                          timeSlot: foundShift || prev.timeSlot,
                                        }));
                                      }}
                                      includeType={true}
                                      placeholder="-- Pilih Host --"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                    <label className="block text-slate-500 font-extrabold mb-1.5">
                                      Shift:
                                    </label>
                                    <select
                                      value={scheduleForm.timeSlot}
                                      onChange={(e) =>
                                        setScheduleForm((prev) => ({
                                          ...prev,
                                          timeSlot: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                    >
                                      {shifts.map((sh) => (
                                        <option key={sh} value={sh}>
                                          {sh}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-slate-500 font-extrabold mb-1.5">
                                      Brand:
                                    </label>
                                    <select
                                      value={scheduleForm.brand}
                                      onChange={(e) =>
                                        setScheduleForm((prev) => ({
                                          ...prev,
                                          brand: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                    >
                                      {Array.from(
                                        new Set([
                                          scheduleForm.brand,
                                          ...(clientBrands.length > 0 ? clientBrands.map((cb) => cb.name) : brands)
                                        ].map(b => b?.trim()).filter(Boolean)),
                                      )
                                        .filter(Boolean)
                                        .map((b) => (
                                          <option key={b} value={b}>
                                            {b}
                                          </option>
                                        ))}
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-slate-500 font-extrabold mb-1.5">
                                      Platform:
                                    </label>
                                    <select
                                      value={scheduleForm.platform}
                                      onChange={(e) =>
                                        setScheduleForm((prev) => ({
                                          ...prev,
                                          platform: e.target.value,
                                        }))
                                      }
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold focus:bg-white focus:border-blue-500 focus:ring-0 cursor-pointer"
                                    >
                                      {platforms.map((p) => (
                                        <option key={p} value={p}>
                                          {p}
                                        </option>
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
                                        timeSlot:
                                          shifts[0] ||
                                          "Morning (08:00 - 12:00)",
                                        brand: brands[0] || "Somethinc",
                                        platform: "TikTok Live",
                                        studio: studios[0]
                                          ? studios[0].name
                                          : "Studio Bandar Lampung",
                                        isOffDay: false,
                                        isPindahStudio: false,
                                        backupOption: "none",
                                        backupHostId: "",
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
                                    {scheduleForm.id
                                      ? "Simpan Perubahan"
                                      : "Masukkan Jadwal"}
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
                  <div
                    id="operator_rekap_gaji_content"
                    className="space-y-6 animate-fadeIn pb-12"
                  >
                    
                    {/* MODAL SLIP GAJI */}
                    <SlipGajiModal 
                      isOpen={!!selectedSlipHost} 
                      onClose={() => setSelectedSlipHost(null)} 
                      hostData={selectedSlipHost}
                      periode={(() => {
                        const [, month] = filterReferenceDate.split("-");
                        return `${getIndonesianMonthLabel(month)} ${filterReferenceDate.split("-")[0]}`;
                      })()}
                    />
                    {/* REAL-TIME DYNAMIC INPUT PARAMETERS (REGIONAL SUPPORTED + HOURLY/MONTHLY SHIFTS) */}
                    {/* ================= ACCORDION: SETTING PAYROLL ================= */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs max-w-5xl overflow-hidden mb-6">
                      <button
                        type="button"
                        onClick={() =>
                          setIsPayrollConfigOpen(!isPayrollConfigOpen)
                        }
                        className="w-full flex items-center justify-between p-4 md:p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-left cursor-pointer border-0"
                      >
                        <div className="flex items-center gap-2 text-[#2563eb] font-extrabold text-sm">
                          <Sliders className="w-4 h-4 text-[#2563eb]" />
                          SETTING PAYROLL CONFIGURATION
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isPayrollConfigOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isPayrollConfigOpen && (
                        <div
                          className="p-4 md:p-6 border-t border-slate-100"
                          id="salary_parameter_grid_panel"
                        >
                          <div className="text-slate-500 font-bold text-xs mb-4">
                            PENGATURAN PARAMETER GAJI STREAMER AGENCY
                            (DIFERENSIASI REGULER & BACKUP)
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mb-2 items-start">
                            <div className="flex flex-col gap-6">
                              {/* Bandar Lampung Pay Config Card */}
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                                <span className="font-sans font-black text-slate-800 border-b border-slate-200 pb-1.5 block flex items-center gap-1.5">
                                  Studio Bandar Lampung
                                </span>
                                <div className="space-y-1">
                                  <label className="text-slate-600 block font-bold">
                                    Gaji Pokok Host Reguler (Bulanan):
                                  </label>
                                  <input
                                    type="text"
                                    id="input_pay_bandar_lampung_reguler"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.bandarLampungRegulerBase ??
                                          4000000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        bandarLampungRegulerBase: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-slate-600 block font-semibold">
                                    Nominal Bonus 100% Hadir (&le; 3x
                                    Terlambat):
                                  </label>
                                  <input
                                    type="text"
                                    id="input_bonus_bandar_lampung_reguler"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.bandarLampungRegulerBonus ??
                                          300000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        bandarLampungRegulerBonus: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-slate-600 block font-bold">
                                    Tarif per Shift Host Backup:
                                  </label>
                                  <input
                                    type="text"
                                    id="input_pay_bandar_lampung_backup"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.bandarLampungBackupPay ??
                                          175000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        bandarLampungBackupPay: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
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
                                  <label className="text-slate-600 block font-bold">
                                    Gaji Pokok Host Reguler (Bulanan):
                                  </label>
                                  <input
                                    type="text"
                                    id="input_pay_tanggamus_reguler"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.tanggamusRegulerBase ??
                                          3500000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        tanggamusRegulerBase: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-slate-600 block font-semibold">
                                    Nominal Bonus 100% Hadir (&le; 3x
                                    Terlambat):
                                  </label>
                                  <input
                                    type="text"
                                    id="input_bonus_tanggamus_reguler"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.tanggamusRegulerBonus ??
                                          250000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        tanggamusRegulerBonus: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-slate-600 block font-bold">
                                    Tarif per Shift Host Backup:
                                  </label>
                                  <input
                                    type="text"
                                    id="input_pay_tanggamus_backup"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.tanggamusBackupPay ??
                                          150000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        tanggamusBackupPay: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
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
                                    Target Hari Kerja Sebulan:{" "}
                                    <span className="font-mono text-[#2563eb] font-black">
                                      {salarySettings.workingDays} Hari
                                    </span>
                                  </label>
                                  <input
                                    type="range"
                                    min="1"
                                    max="31"
                                    value={salarySettings.workingDays}
                                    onChange={(e) =>
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        workingDays: Number(e.target.value),
                                      }))
                                    }
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                                  />
                                  <span className="text-[10px] text-slate-500 font-semibold block leading-normal">
                                    Digunakan untuk proporsi performa kehadiran
                                    Host Reguler bulanan (Hari Kehadiran /
                                    Target Hari Kerja).
                                  </span>
                                </div>
                                <div className="space-y-2 border-t border-slate-200 mt-2 pt-3">
                                  <label className="text-slate-800 font-extrabold block text-xs">
                                    Tarif Lembur per Jam:
                                  </label>
                                  <input
                                    type="text"
                                    value={
                                      "Rp " +
                                      new Intl.NumberFormat("id-ID").format(
                                        salarySettings.overtimePayPerHour ??
                                          20000,
                                      )
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value.replace(
                                        /\D/g,
                                        "",
                                      );
                                      setSalarySettings((prev) => ({
                                        ...prev,
                                        overtimePayPerHour: val
                                          ? parseInt(val, 10)
                                          : 0,
                                      }));
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold font-mono text-slate-900 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] text-sm"
                                  />
                                  <span className="text-[10px] text-slate-500 font-semibold block leading-normal">
                                    Digunakan untuk menghitung total nominal jam
                                    lembur yang ditambahkan ke gaji bersih.
                                  </span>
                                </div>
                              </div>

                              {/* Cut-Off/Tutup Buku Period Card */}
                              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-3">
                                <div>
                                  <span className="font-sans font-black text-slate-800 border-b border-slate-200 pb-1.5 block flex items-center gap-1.5 mb-2">
                                    Cut-Off (Tutup Buku) Bulanan
                                  </span>

                                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-150 mb-2 hover:border-slate-300 transition-all shadow-2xs">
                                    <div>
                                      <span className="text-slate-800 font-extrabold block text-[10px]">
                                        Batas Cut-Off Aktif
                                      </span>
                                      <span className="text-[9px] text-slate-450 font-normal">
                                        Gunakan siklus tanggal khusus
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSalarySettings((prev) => ({
                                          ...prev,
                                          useCutOff: !prev.useCutOff,
                                        }))
                                      }
                                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 outline-none focus:ring-1 focus:ring-blue-150 ${
                                        salarySettings.useCutOff
                                          ? "bg-blue-600"
                                          : "bg-slate-300"
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                                          salarySettings.useCutOff
                                            ? "translate-x-4"
                                            : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  </div>

                                  {salarySettings.useCutOff && (
                                    <div className="space-y-1.5 animate-fadeIn">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                          <label className="text-slate-600 font-bold block text-[9.5px]">
                                            Tgl Mulai:
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={
                                              salarySettings.cutOffStartDay ??
                                              16
                                            }
                                            onChange={(e) => {
                                              const val = Math.max(
                                                1,
                                                Math.min(
                                                  31,
                                                  Number(e.target.value),
                                                ),
                                              );
                                              setSalarySettings((prev) => ({
                                                ...prev,
                                                cutOffStartDay: val,
                                              }));
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 font-extrabold font-mono text-center text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                          />
                                        </div>
                                        <div className="space-y-0.5">
                                          <label className="text-slate-600 font-bold block text-[9.5px]">
                                            Tgl Akhir:
                                          </label>
                                          <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={
                                              salarySettings.cutOffEndDay ?? 15
                                            }
                                            onChange={(e) => {
                                              const val = Math.max(
                                                1,
                                                Math.min(
                                                  31,
                                                  Number(e.target.value),
                                                ),
                                              );
                                              setSalarySettings((prev) => ({
                                                ...prev,
                                                cutOffEndDay: val,
                                              }));
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-1 font-extrabold font-mono text-center text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                          />
                                        </div>
                                      </div>

                                      <div
                                        className="mt-2.5 pt-2 border-t border-slate-200/65 space-y-1"
                                        id="cut_off_month_picker_wrapper"
                                      >
                                        <label className="text-[10px] font-black text-slate-700 block text-left">
                                          Pilih Range Bulan:
                                        </label>
                                        <select
                                          id="select_cutoff_periode"
                                          value={(() => {
                                            const refDateObj = new Date(
                                              filterReferenceDate,
                                            );
                                            if (isNaN(refDateObj.getTime()))
                                              return "";
                                            const day = refDateObj.getDate();
                                            let targetMonth =
                                              refDateObj.getMonth();
                                            let targetYear =
                                              refDateObj.getFullYear();
                                            if (day >= 16) {
                                              targetMonth += 1;
                                              if (targetMonth > 11) {
                                                targetMonth = 0;
                                                targetYear += 1;
                                              }
                                            }
                                            return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
                                          })()}
                                          onChange={(e) => {
                                            if (!e.target.value) return;
                                            const [yearStr, monthStr] =
                                              e.target.value.split("-");
                                            const year = Number(yearStr);
                                            const monthIdx =
                                              Number(monthStr) - 1;
                                            const dateToSet = new Date(
                                              year,
                                              monthIdx,
                                              15,
                                            );
                                            const formatted = `${dateToSet.getFullYear()}-${String(dateToSet.getMonth() + 1).padStart(2, "0")}-15`;

                                            setFilterReferenceDate(formatted);
                                            setTimeFilter("Bulanan");
                                            setSalarySettings((prev) => ({
                                              ...prev,
                                              useCutOff: true,
                                              cutOffStartDay: 16,
                                              cutOffEndDay: 15,
                                            }));
                                          }}
                                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-3xs cursor-pointer hover:border-slate-300"
                                        >
                                          {availableCutoffMonths.map((value) => {
                                            const [yearStr, monthStr] = value.split("-");
                                            const yr = Number(yearStr);
                                            const m = Number(monthStr);
                                            const monthNames = [
                                              "Januari",
                                              "Februari",
                                              "Maret",
                                              "April",
                                              "Mei",
                                              "Juni",
                                              "Juli",
                                              "Agustus",
                                              "September",
                                              "Oktober",
                                              "November",
                                              "Desember",
                                            ];
                                            let prevM = m - 1;
                                            if (prevM === 0) {
                                              prevM = 12;
                                            }
                                            const label = ` 25 ${monthNames[m - 1]} ${yr} (16 ${monthNames[prevM - 1]} - 15 ${monthNames[m - 1]}) `;
                                            return (
                                              <option key={value} value={value}>
                                                {label}
                                              </option>
                                            );
                                          })}
                                        </select>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="text-[10px] text-slate-550 font-semibold leading-relaxed pt-2 border-t border-slate-200 bg-white/50 p-2 rounded border border-slate-100/60 shadow-3xs">
                                  {salarySettings.useCutOff ? (
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-blue-600 font-black uppercase text-[8px] tracking-wider">
                                        Status Siklus Aktif:
                                      </span>
                                      <span className="font-mono text-slate-700 font-bold block">
                                        Mulai Tanggal{" "}
                                        {salarySettings.cutOffStartDay ?? 16}{" "}
                                        s/d Tanggal{" "}
                                        {salarySettings.cutOffEndDay ?? 15}{" "}
                                        Bulan Depan.
                                      </span>
                                      <span className="text-[9.5px] italic text-slate-450 mt-0.5 font-normal leading-tight">
                                        (Contoh: 16 Jan ke 15 Feb)
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-455 italic block leading-snug">
                                      Menghitung kalender standar bulanan biasa
                                      (Tanggal 1 s/d Akhir Bulan).
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search & Configuration in calculator */}
                    <div
                      className="space-y-3 mb-4"
                      id="rekap_salary_toolbar_container"
                    >
                      <div
                        className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-purple-50/50 p-4 rounded-xl border border-purple-100"
                        id="rekap_salary_toolbar"
                      >
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                          <input
                            type="text"
                            id="search_host_salary_input"
                            placeholder="Cari host untuk perhitungan gaji..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full bg-white border border-purple-150 rounded-xl pl-10 pr-4 py-2.5 text-xs text-purple-950 focus:outline-none focus:border-purple-400 transition-all font-sans font-bold shadow-2xs"
                          />
                        </div>

                        {/* Month Range Cut-Off filter directly on toolbar */}
                        <CutoffPeriodSelector
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
                            return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
                          })()}
                          availableCutoffMonths={availableCutoffMonths}
                          onChange={(value) => {
                            if (!value) return;
                            const [yearStr, monthStr] = value.split("-");
                            const year = Number(yearStr);
                            const monthIdx = Number(monthStr) - 1;
                            const dateToSet = new Date(year, monthIdx, 15);
                            const formatted = `${dateToSet.getFullYear()}-${String(dateToSet.getMonth() + 1).padStart(2, "0")}-15`;

                            setFilterReferenceDate(formatted);
                            setTimeFilter("Bulanan");
                            setSalarySettings((prev) => ({
                              ...prev,
                              useCutOff: true,
                              cutOffStartDay: 16,
                              cutOffEndDay: 15,
                            }));
                          }}
                          containerClassName="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-purple-150 shadow-2xs"
                          selectClassName="bg-transparent text-xs font-black text-purple-950 focus:outline-none cursor-pointer border-none py-0.5 outline-none font-mono"
                        />

                      </div>
                    </div>

                    {/* --- SUMMARY METRICS REKAP GAJI --- */}
                    {(() => {
                      const totalGaji = filteredHostReportList.reduce(
                        (sum, h) => sum + h.netSalary,
                        0,
                      );
                      const totalHostBL = filteredHostReportList.filter(
                        (h) => !h.studio?.includes("Tanggamus"),
                      ).length;
                      const totalHostTGM = filteredHostReportList.filter((h) =>
                        h.studio?.includes("Tanggamus"),
                      ).length;

                      const activePeriodBrands = new Set<string>();
                      filteredHostReportList.forEach((h) => {
                        const records = logs.filter(
                          (l) =>
                            (l.hostId === h.id || l.hostName === h.name) &&
                            isLogDateMatchingMemo(getLogDateInput(l)),
                        );
                        records.forEach((r) => {
                          if (r.brandHandled)
                            activePeriodBrands.add(r.brandHandled);
                        });
                      });
                      const totalBrandList = Array.from(activePeriodBrands);

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Total Gaji Dibayarkan
                            </span>
                            <span className="text-xl md:text-2xl font-black font-mono mt-2 text-slate-800">
                              {formatIDR(totalGaji)}
                            </span>
                          </div>
                          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Host Bandar Lampung
                            </span>
                            <span className="text-xl md:text-2xl font-black font-mono mt-2 text-slate-800">
                              {totalHostBL}{" "}
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                                Orang
                              </span>
                            </span>
                          </div>
                          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Host Tanggamus
                            </span>
                            <span className="text-xl md:text-2xl font-black font-mono mt-2 text-slate-800">
                              {totalHostTGM}{" "}
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                                Orang
                              </span>
                            </span>
                          </div>
                          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                              Total Brand Aktif
                            </span>
                            <div className="flex flex-col mt-2">
                              <span className="text-xl md:text-2xl font-black font-mono text-slate-800 leading-none">
                                {totalBrandList.length}{" "}
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                                  Brand
                                </span>
                              </span>
                              {totalBrandList.length > 0 && (
                                <span
                                  className="text-[9px] text-slate-400 font-semibold leading-tight line-clamp-1 mt-1 truncate"
                                  title={totalBrandList.join(", ")}
                                >
                                  {totalBrandList.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* LOCATION TABS FOR SALARY TABLE */}
                    <div className="flex bg-slate-100 p-1 w-full max-w-md rounded-xl shadow-sm mb-4">
                      {["Semua Host", "Bandar Lampung", "Tanggamus"].map((tab) => (
                        <button
                          key={tab}
                          className={`flex-1 text-center py-2 text-xs font-bold transition-all rounded-lg ${
                            salaryRecapLocationTab === tab
                              ? "bg-white text-purple-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                          }`}
                          onClick={() => setSalaryRecapLocationTab(tab)}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* SALARY RECAP TABLE CONTAINER */}
                    <div
                      className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden"
                      id="salary_recap_calculator_table_wrapper"
                    >
                      {/* DESKTOP & TABLET VIEW: Rendered as a highly polished, responsive table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table
                          className="w-full text-left text-xs text-slate-900 border-collapse table-auto"
                          id="salary_recap_table"
                        >
                          <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-mono whitespace-nowrap uppercase tracking-wider text-slate-500 font-bold select-none">
                              {/* Nama Host & Wilayah */}
                              <th className="py-4 px-6 align-middle">
                                <div className="flex flex-col gap-1.5">
                                  <button
                                    onClick={() => toggleSalarySort("name")}
                                    className="flex items-center gap-1.5 hover:text-purple-700 text-left uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer w-full transition-colors group"
                                  >
                                    <span>Host & Info</span>
                                    <span className="text-purple-600">
                                      {salarySortKey === "name" ? (
                                        salarySortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </span>
                                  </button>
                                  </div>
                              </th>

                              {/* Tipe Host */}
                              <th className="py-4 px-4 align-middle text-center">
                                <div className="flex flex-col gap-1.5 items-center">
                                  <button
                                    onClick={() => toggleSalarySort("hostType")}
                                    className="flex items-center justify-center gap-1.5 hover:text-purple-700 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors group"
                                  >
                                    <span>Tipe</span>
                                    <span className="text-purple-600">
                                      {salarySortKey === "hostType" ? (
                                        salarySortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </span>
                                  </button>
                                  </div>
                              </th>

                              {/* Hadir / Target */}
                              <th className="py-4 px-4 align-middle text-center">
                                <div className="flex flex-col gap-1.5 items-center">
                                  <button
                                    onClick={() =>
                                      toggleSalarySort("attendance")
                                    }
                                    className="flex items-center justify-center gap-1.5 hover:text-purple-700 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors group"
                                  >
                                    <span>Hadir</span>
                                    <span className="text-purple-600">
                                      {salarySortKey === "attendance" ? (
                                        salarySortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </span>
                                  </button>
                                  </div>
                              </th>

                              {/* Terlambat */}
                              <th className="py-4 px-3 align-middle text-center text-amber-600">
                                <div className="flex flex-col gap-1.5 items-center">
                                  <button
                                    onClick={() => toggleSalarySort("late")}
                                    className="flex items-center justify-center gap-1.5 hover:text-amber-700 text-amber-600 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors group"
                                  >
                                    <span>Telat</span>
                                    <span className="text-amber-600">
                                      {salarySortKey === "late" ? (
                                        salarySortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </span>
                                  </button>
                                  </div>
                              </th>

                              {/* Tidak Hadir */}
                              <th className="py-4 px-3 align-middle text-center text-rose-600">
                                <div className="flex flex-col gap-1.5 items-center">
                                  <button
                                    onClick={() => toggleSalarySort("excused")}
                                    className="flex items-center justify-center gap-1.5 hover:text-rose-700 text-rose-600 uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors group"
                                  >
                                    <span>Tidak Hadir</span>
                                    <span className="text-rose-600">
                                      {salarySortKey === "excused" ? (
                                        salarySortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                      ) : (
                                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                                      )}
                                    </span>
                                  </button>
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
                                      {salarySortKey === "formula"
                                        ? salarySortDir === "asc"
                                          ? " ▲"
                                          : " ▼"
                                        : " ↕️"}
                                    </span>
                                  </button>
                                  </div>
                              </th>

                              {/* Estimasi Gaji Bersih */}
                              <th className="py-4 px-6 align-middle text-right pr-8">
                                <div className="flex flex-col gap-1.5 items-end">
                                  <button
                                    onClick={() =>
                                      toggleSalarySort("netSalary")
                                    }
                                    className="flex items-center justify-end gap-1.5 hover:text-purple-700 text-right uppercase text-[10px] font-mono font-bold tracking-wider cursor-pointer transition-colors"
                                  >
                                    <span>Gaji Bersih</span>
                                    <span className="text-[10px] text-purple-600 font-extrabold font-sans">
                                      {salarySortKey === "netSalary"
                                        ? salarySortDir === "asc"
                                          ? " ▲"
                                          : " ▼"
                                        : " ↕️"}
                                    </span>
                                  </button>
                                  </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredHostReportList.length === 0 ? (
                              <tr key="empty">
                                <td
                                  colSpan={7}
                                  className="text-center py-12 text-slate-400 font-mono font-medium"
                                >
                                  Tidak ada rekam data host yang cocok untuk
                                  proses kalkulasi draf gaji.
                                </td>
                              </tr>
                            ) : (
                              filteredHostReportList.map((item, idx) => {
                                const isTanggamus =
                                  item.studio &&
                                  item.studio.includes("Tanggamus");
                                const hostType = item.hostType || "Reguler";
                                const isAtTop = idx < 3;

                                return (
                                  <React.Fragment key={item.id || idx}>
                                  <tr
                                    onClick={() => setExpandedHostSalaryId(expandedHostSalaryId === item.id ? null : item.id)}
                                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-all font-sans cursor-pointer ${expandedHostSalaryId === item.id ? "bg-slate-50/80" : ""}`}
                                    id={`salary_row_${item.id}`}
                                  >
                                    <td className="py-4 px-6">
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={getAvatarUrl(item.name)}
                                          alt={item.name}
                                          referrerPolicy="no-referrer"
                                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                        />
                                        <div className="min-w-0">
                                          <div className="font-bold text-slate-800 text-xs truncate">
                                            {item.name}
                                          </div>
                                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                                            
                                            <span className="truncate">
                                              {item.studio ||
                                                "Studio Bandar Lampung"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="text-center py-4 px-4 whitespace-nowrap">
                                      {hostType === "Reguler" ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 bg-white text-slate-700">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                                          Host Reguler
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200 bg-white text-slate-700">
                                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5"></span>
                                          Host Backup
                                        </span>
                                      )}
                                    </td>

                                    <td className="text-center font-mono font-bold text-slate-900 py-4 px-4">
                                      {hostType === "Reguler" ? (
                                        <div className="inline-flex flex-col items-center">
                                          <div className="flex items-center gap-1.5 justify-center">
                                            <span className="text-[11px] text-slate-700 font-medium bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                              {item.totalHadir}
                                            </span>
                                            <span className="text-slate-400">/</span>
                                            <input
                                              type="number"
                                              min={1}
                                              max={31}
                                              value={item.requiredWorkingDays}
                                              onChange={(e) => {
                                                const val = Math.max(
                                                  1,
                                                  Math.min(
                                                    31,
                                                    Number(e.target.value),
                                                  ),
                                                );
                                                handleUpdateHost(item.id, {
                                                  customWorkingDaysTarget: val,
                                                });
                                              }}
                                              title="Ubah Target Hari Kerja Khusus Host Ini"
                                              className="w-12 bg-white border border-slate-300 hover:border-slate-400 focus:border-indigo-500 rounded px-1.5 py-0.5 text-center font-mono font-medium text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <span className="text-[10px] text-slate-500 font-medium">
                                              Hari
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="inline-flex flex-col items-center">
                                          <span className="px-2 py-0.5 rounded text-[11px] text-slate-700 font-medium bg-slate-50 border border-slate-200">
                                            {item.totalHadir} Shift
                                          </span>
                                          <span className="text-[9px] text-slate-500 font-medium mt-1">
                                            Dibayar per Shift
                                          </span>
                                        </div>
                                      )}
                                    </td>

                                    {/* Terlambat (Late) */}
                                    <td className="text-center py-4 px-3 font-mono">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                          item.countTerlambat > 0
                                            ? "text-amber-600 bg-amber-50 border border-amber-200"
                                            : "text-slate-500 bg-slate-50 border border-slate-200"
                                        }`}
                                      >
                                        {item.countTerlambat}x
                                      </span>
                                    </td>

                                    {/* Tidak Hadir (Izin/Sakit + Alpa) */}
                                    <td className="text-center py-4 px-3 font-mono">
                                      <span
                                        className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                          item.countIzin + item.countAlpa > 0
                                            ? "text-red-600 bg-red-50 border border-red-200"
                                            : "text-slate-500 bg-slate-50 border border-slate-200"
                                        }`}
                                      >
                                        {item.countIzin + item.countAlpa} Hari
                                      </span>
                                    </td>

                                    <td className="py-4 px-4 text-left">
                                      {editingSalaryHostId === item.id ? (
                                        <div className="space-y-1.5 font-sans min-w-[150px]">
                                          <div className="text-[10px] text-purple-700 font-extrabold uppercase tracking-wide">
                                            {hostType === "Reguler"
                                              ? "Gaji Pokok Kustom"
                                              : "Tarif Shift Kustom"}
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <div className="relative flex-1">
                                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                                                Rp
                                              </span>
                                              <input
                                                type="text"
                                                value={tempSalaryValue}
                                                onChange={(e) => {
                                                  const val =
                                                    e.target.value.replace(
                                                      /[^0-9]/g,
                                                      "",
                                                    );
                                                  setTempSalaryValue(val);
                                                }}
                                                placeholder="Gaji kustom"
                                                className="w-full bg-white border border-purple-300 focus:border-purple-600 focus:ring-1 focus:ring-purple-100 rounded-lg pl-7 pr-2 py-1 text-xs font-mono font-bold text-purple-950 focus:outline-none"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") {
                                                    const numVal =
                                                      Number(tempSalaryValue);
                                                    if (
                                                      hostType === "Reguler"
                                                    ) {
                                                      handleUpdateHost(
                                                        item.id,
                                                        {
                                                          customBaseSalary:
                                                            numVal || undefined,
                                                        },
                                                      );
                                                    } else {
                                                      handleUpdateHost(
                                                        item.id,
                                                        {
                                                          customShiftRate:
                                                            numVal || undefined,
                                                        },
                                                      );
                                                    }
                                                    setEditingSalaryHostId(
                                                      null,
                                                    );
                                                  }
                                                }}
                                              />
                                            </div>
                                            <button
                                              onClick={() => {
                                                const numVal =
                                                  Number(tempSalaryValue);
                                                if (hostType === "Reguler") {
                                                  handleUpdateHost(item.id, {
                                                    customBaseSalary:
                                                      numVal || undefined,
                                                  });
                                                } else {
                                                  handleUpdateHost(item.id, {
                                                    customShiftRate:
                                                      numVal || undefined,
                                                  });
                                                }
                                                setEditingSalaryHostId(null);
                                              }}
                                              title="Simpan Gaji Kustom"
                                              className="p-1 px-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                            >
                                              ✓
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingSalaryHostId(null)
                                              }
                                              title="Batal"
                                              className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                          <div className="text-[8.5px] text-slate-400 italic">
                                            Tekan ✓ atau Enter untuk menyimpan
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-1 font-sans">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                                              {hostType === "Reguler"
                                                ? "Gaji Pokok Wilayah"
                                                : "Tarif per Shift"}
                                            </span>
                                            {((hostType === "Reguler" &&
                                              typeof item.customBaseSalary ===
                                                "number") ||
                                              (hostType !== "Reguler" &&
                                                typeof item.customShiftRate ===
                                                  "number")) && (
                                              <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase px-1 py-0.2 rounded border border-emerald-250">
                                                Kustom
                                                <button
                                                  onClick={() => {
                                                    if (
                                                      hostType === "Reguler"
                                                    ) {
                                                      handleUpdateHost(
                                                        item.id,
                                                        {
                                                          customBaseSalary:
                                                            undefined,
                                                        },
                                                      );
                                                    } else {
                                                      handleUpdateHost(
                                                        item.id,
                                                        {
                                                          customShiftRate:
                                                            undefined,
                                                        },
                                                      );
                                                    }
                                                  }}
                                                  title="Kembalikan ke Default Wilayah"
                                                  className="text-emerald-950 hover:text-red-600 px-0.5 font-bold transition-all ml-0.5 text-[9px] cursor-pointer"
                                                >
                                                  &times;
                                                </button>
                                              </span>
                                            )}
                                          </div>
                                          <div className="text-xs font-semibold text-slate-800 font-mono flex items-center gap-1 flex-wrap">
                                            {formatIDR(item.basePayRate)}
                                            {hostType === "Reguler" ? (
                                              <span className="text-[10px] text-slate-500 font-medium">
                                                {item.studio
                                                  ? item.studio.includes(
                                                      "Tanggamus",
                                                    )
                                                    ? "Tanggamus"
                                                    : "Bandar Lampung"
                                                  : "Bandar Lampung"}
                                              </span>
                                            ) : (
                                              <span className="text-[10px] text-slate-500 font-medium">
                                                / Shift
                                              </span>
                                            )}

                                            <button
                                              onClick={() => {
                                                setEditingSalaryHostId(item.id);
                                                const currentVal =
                                                  hostType === "Reguler"
                                                    ? (item.customBaseSalary ??
                                                      item.basePayRate)
                                                    : (item.customShiftRate ??
                                                      item.basePayRate);
                                                setTempSalaryValue(
                                                  String(currentVal || ""),
                                                );
                                              }}
                                              title="Atur Gaji Kustom Khusus Host Ini"
                                              className="ml-1 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[10px] font-medium rounded border border-indigo-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                              Kustom
                                            </button>
                                          </div>
                                          <div
                                            className="text-[10px] text-slate-500 font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors mt-0.5"
                                            title="Klik baris ini untuk melihat rincian rumus penggajian"
                                          >
                                            <Info className="w-3.5 h-3.5" />
                                            <span>Lihat rincian</span>
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    <td className="text-right py-4 px-6 pr-8 whitespace-nowrap">
                                      <div className="inline-block z-10 text-right min-w-[130px]" onClick={(e) => e.stopPropagation()}>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(String(item.netSalary));
                                            setCopiedSalaryHostId(item.id + "_salary");
                                            setTimeout(() => setCopiedSalaryHostId(null), 1500);
                                          }}
                                          title="Salin nominal gaji bersih"
                                          className={`inline-flex items-center justify-between gap-3 overflow-hidden rounded-lg border transition-all duration-200 px-3 py-1.5 shadow-3xs active:scale-95 w-full ${
                                            copiedSalaryHostId === item.id + "_salary"
                                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                              : "border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700"
                                          }`}
                                        >
                                          <span className="text-xs font-semibold text-slate-800 font-mono">{formatIDR(item.netSalary)}</span>
                                          {copiedSalaryHostId === item.id + "_salary" ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                                          )}
                                        </button>

                                        <div className="mt-1.5">
                                          {(item.bankName && item.bankAccount && item.bankAccount !== "-") ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(String(item.bankAccount));
                                                setCopiedSalaryHostId(item.id + "_bank");
                                                setTimeout(() => setCopiedSalaryHostId(null), 1500);
                                              }}
                                              title={`Salin rekening ${item.bankName} - ${item.bankAccount}`}
                                              className={`inline-flex items-center justify-between gap-2 rounded border px-2 py-1 transition-all duration-200 text-left w-full active:scale-95 shadow-3xs ${
                                                copiedSalaryHostId === item.id + "_bank"
                                                  ? "bg-purple-50 border-purple-200 text-purple-700"
                                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                                              }`}
                                            >
                                              <div className="flex flex-col overflow-hidden min-w-0">
                                                <span className="text-[9px] font-medium text-slate-500">{item.bankName}</span>
                                                <span className="text-[11px] font-mono font-medium truncate text-slate-800">{item.bankAccount}</span>
                                              </div>
                                              {copiedSalaryHostId === item.id + "_bank" ? (
                                                <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />
                                              ) : (
                                                <CreditCard className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                              )}
                                            </button>
                                          ) : (
                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider pr-1 block text-right mt-1">
                                              Belum ada Rek
                                            </div>
                                          )}
                                          
                                          {/* Download Slip Gaji Button */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSlipHost(item);
                                            }}
                                            title="Cetak Slip Gaji"
                                            className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-2 py-1 transition-all duration-200 text-indigo-700 hover:bg-indigo-100 active:scale-95 shadow-3xs"
                                          >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Slip Gaji</span>
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                  {/* ACCORDION EXPANDED ROW */}
                                  {expandedHostSalaryId === item.id && (
                                    <tr className="bg-slate-50/50 border-b border-slate-200 shadow-inner">
                                      <td colSpan={7} className="p-0">
                                        <div className="p-6 px-6 lg:px-8 border-l-4 border-l-indigo-500 text-slate-800 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                                          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                                            
<div className="space-y-3 font-sans">
                                            <div className="border-b border-slate-200 pb-2">
                                              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest leading-none">
                                                Rincian Perhitungan Gaji
                                              </div>
                                              <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                                                {item.name}
                                                <span className="text-[9px] font-semibold text-slate-500 border border-slate-200 bg-white px-1.5 py-0.5 rounded uppercase">
                                                  {hostType}
                                                </span>
                                              </div>
                                            </div>

                                            {hostType === "Reguler" ? (
                                              <div className="space-y-2.5">
                                                <div className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-1 shadow-3xs">
                                                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                    Rumus Gaji Pokok Regulasi
                                                  </div>
                                                  <div className="text-[10px] text-slate-700 italic font-mono leading-tight">
                                                    (Gaji Pokok Penempatan /
                                                    Hari Standar Kerja) &times;
                                                    Kehadiran Host Masuk
                                                  </div>
                                                  <div className="pt-1.5 border-t border-slate-100 mt-1.5 font-mono text-[10px] text-slate-700 font-medium leading-relaxed">
                                                    (
                                                    {formatIDR(
                                                      item.basePayRate,
                                                    )}{" "}
                                                    / {item.requiredWorkingDays}{" "}
                                                    Hari) &times;{" "}
                                                    {item.totalHadir} Hari
                                                  </div>
                                                  <div className="text-sm font-semibold font-mono text-slate-800 flex justify-between items-center pt-1">
                                                    <span>Gaji Pokok:</span>
                                                    <span>
                                                      {formatIDR(
                                                        Math.round(
                                                          (item.basePayRate /
                                                            item.requiredWorkingDays) *
                                                            item.totalHadir,
                                                        ),
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="border-t border-slate-200 pt-2 space-y-1.5">
                                                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                    Syarat Bonus Kehadiran
                                                  </div>

                                                  <div className="space-y-1 text-[10px]">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                      <span>
                                                        {item.totalHadir >=
                                                        item.requiredWorkingDays
                                                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                          : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                                      </span>
                                                      <span className="font-medium">
                                                        Kehadiran{" "}
                                                        {item.totalHadir >=
                                                        item.requiredWorkingDays
                                                          ? "Penuh"
                                                          : "di Bawah Target"}{" "}
                                                        ({item.totalHadir}/
                                                        {
                                                          item.requiredWorkingDays
                                                        }{" "}
                                                        Hari)
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                      <span>
                                                        {item.countTerlambat <=
                                                        3
                                                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                          : <XCircle className="w-3.5 h-3.5 text-red-500" />}
                                                      </span>
                                                      <span className="font-medium">
                                                        Terlambat ≤ 3x (
                                                        {item.countTerlambat}x)
                                                      </span>
                                                    </div>
                                                  </div>

                                                  {item.isEligibleForBonus ? (
                                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[10px] shadow-3xs">
                                                      <div className="text-emerald-700 font-semibold flex justify-between items-center">
                                                        <span>
                                                          Bonus +100% Hadir:
                                                        </span>
                                                        <span>
                                                          +
                                                          {formatIDR(
                                                            item.calculatedBonus,
                                                          )}
                                                        </span>
                                                      </div>
                                                      <p className="text-[9px] text-emerald-600/80 mt-1">
                                                        Status: Memenuhi
                                                        kualifikasi & berhak
                                                        menerima bonus
                                                      </p>
                                                    </div>
                                                  ) : (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[9.5px] text-slate-500 shadow-3xs">
                                                      <p className="italic leading-relaxed">
                                                        *Syarat bonus: Kehadiran
                                                        penuh & terlambat ≤ 3x
                                                        untuk bonus{" "}
                                                        {formatIDR(
                                                          isTanggamus
                                                            ? (salarySettings.tanggamusRegulerBonus ??
                                                                250000)
                                                            : (salarySettings.bandarLampungRegulerBonus ??
                                                                300000),
                                                        )}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>

                                                {item.totalBackupShiftsAsReguler >
                                                  0 && (
                                                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] space-y-1 shadow-3xs">
                                                    <div className="text-amber-700 font-semibold flex justify-between items-center">
                                                      <span>
                                                        Shift Backup Ekstra (
                                                        {
                                                          item.totalBackupShiftsAsReguler
                                                        }
                                                        x):
                                                      </span>
                                                      <span>
                                                        +
                                                        {formatIDR(
                                                          item.calculatedBackupPay,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}

                                                {item.totalOvertimeHours >
                                                  0 && (
                                                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-[10px] space-y-1 shadow-3xs">
                                                    <div className="text-indigo-700 font-semibold flex justify-between items-center">
                                                      <span>
                                                        Lembur (
                                                        {
                                                          item.totalOvertimeHours
                                                        }{" "}
                                                        Jam):
                                                      </span>
                                                      <span>
                                                        +
                                                        {formatIDR(
                                                          item.calculatedOvertimePay,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-xs font-bold">
                                                  <span className="text-slate-800">
                                                    Estimasi Gaji Bersih:
                                                  </span>
                                                  <span className="text-emerald-700 font-mono text-sm">
                                                    {formatIDR(item.netSalary)}
                                                  </span>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="space-y-2.5">
                                                <div className="bg-white border border-slate-200 p-2.5 rounded-lg space-y-1 shadow-3xs">
                                                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                    Rumus Gaji Backup
                                                  </div>
                                                  <div className="text-[10px] text-slate-700 italic font-mono leading-tight">
                                                    Siklus Kehadiran Shift
                                                    &times; Tarif Per Shift
                                                  </div>
                                                  <div className="pt-1.5 border-t border-slate-100 mt-1.5 font-mono text-[10px] text-slate-700 font-medium flex justify-between">
                                                    <span>Detail:</span>
                                                    <span>
                                                      {item.totalHadir} Shift
                                                      &times;{" "}
                                                      {formatIDR(
                                                        item.basePayRate,
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>

                                                {item.totalOvertimeHours >
                                                  0 && (
                                                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-[10px] space-y-1 shadow-3xs">
                                                    <div className="text-indigo-700 font-semibold flex justify-between items-center">
                                                      <span>
                                                        Lembur (
                                                        {
                                                          item.totalOvertimeHours
                                                        }{" "}
                                                        Jam):
                                                      </span>
                                                      <span>
                                                        +
                                                        {formatIDR(
                                                          item.calculatedOvertimePay,
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}

                                                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold">
                                                  <span className="text-slate-800">
                                                    Estimasi Gaji Bersih:
                                                  </span>
                                                  <span className="text-emerald-700 font-mono text-sm">
                                                    {formatIDR(item.netSalary)}
                                                  </span>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                            <div className="flex flex-col justify-center border-l border-slate-200 pl-8 space-y-4">
                                              <div className="text-slate-500 text-xs font-medium">Rekapitulasi Final</div>
                                              <div className="text-3xl font-mono font-bold text-emerald-700">{formatIDR(item.netSalary)}</div>
                                              <div className="text-[10px] text-slate-500 max-w-xs">Gaji bersih yang akan ditransfer ke rekening host. Pastikan kehadiran dan potongan telah dikalkulasi dengan benar.</div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  </React.Fragment>
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
                            Tidak ada rekam data host yang cocok untuk proses
                            kalkulasi draf gaji.
                          </div>
                        ) : (
                          filteredHostReportList.map((item, idx) => {
                            const isTanggamus =
                              item.studio && item.studio.includes("Tanggamus");
                            const hostType = item.hostType || "Reguler";

                            return (
                              <div
                                key={item.id + "_" + idx}
                                className="p-4 space-y-4 font-sans bg-white"
                                id={`salary_mobile_card_${item.id}`}
                              >
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
                                      <div className="font-extrabold text-slate-900 text-xs">
                                        {item.name}
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                        
                                        <span>
                                          {item.studio ||
                                            "Studio Bandar Lampung"}
                                        </span>
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
                                    <span className="text-[8px] font-black tracking-wider text-slate-400 block uppercase">
                                      Hadir/Tgt
                                    </span>
                                    {hostType === "Reguler" ? (
                                      <div className="inline-flex items-center justify-center gap-0.5 mt-1 bg-white border border-slate-200 rounded px-1 py-0.5 text-[10px] font-bold text-slate-800">
                                        <span>{item.totalHadir}/</span>
                                        <input
                                          type="number"
                                          min={1}
                                          max={31}
                                          value={item.requiredWorkingDays}
                                          onChange={(e) => {
                                            const val = Math.max(
                                              1,
                                              Math.min(
                                                31,
                                                Number(e.target.value),
                                              ),
                                            );
                                            handleUpdateHost(item.id, {
                                              customWorkingDaysTarget: val,
                                            });
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
                                    <span className="text-[8px] font-black tracking-wider text-amber-600 block uppercase">
                                      Telat
                                    </span>
                                    <span
                                      className={`inline-block mt-1 px-1 py-0.5 rounded text-[10.5px] font-bold font-mono self-center ${
                                        item.countTerlambat > 0
                                          ? "text-amber-700 bg-amber-50 border border-amber-100"
                                          : "text-slate-400 bg-slate-100 border border-slate-200/40"
                                      }`}
                                    >
                                      {item.countTerlambat}x
                                    </span>
                                  </div>

                                  {/* 3. Tidak Hadir */}
                                  <div className="flex flex-col justify-between">
                                    <span className="text-[8px] font-black tracking-wider text-red-650 block uppercase">
                                      Tidak Hadir
                                    </span>
                                    <span
                                      className={`inline-block mt-1 px-1 py-0.5 rounded text-[10.5px] font-bold font-mono self-center ${
                                        item.countIzin + item.countAlpa > 0
                                          ? "text-red-700 bg-red-50 border border-red-100"
                                          : "text-slate-400 bg-slate-100 border border-slate-200/40"
                                      }`}
                                    >
                                      {item.countIzin + item.countAlpa} Hari
                                    </span>
                                  </div>
                                </div>

                                {/* Mobile Calculation Formula & Summary */}
                                <div className="bg-[#fafaff] border border-purple-100/40 rounded-xl p-3 space-y-2 text-xs">
                                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold border-b border-purple-100/30 pb-1.5">
                                    <span>
                                      Rumus:{" "}
                                      {hostType === "Reguler"
                                        ? "Gaji Pokok Proporsional"
                                        : "Tarif Shift"}
                                    </span>
                                    <span className="font-bold underline text-blue-650">
                                      {item.studio
                                        ? item.studio.includes("Tanggamus")
                                          ? "Tanggamus"
                                          : "Bandar Lampung"
                                        : "Bandar Lampung"}
                                    </span>
                                  </div>

                                  {hostType === "Reguler" ? (
                                    <div className="space-y-1 font-mono text-[10px] text-slate-600">
                                      <div>
                                        Gaji Pokok:{" "}
                                        {formatIDR(item.basePayRate)}
                                      </div>
                                      <div>
                                        Proporsi: ({formatIDR(item.basePayRate)}{" "}
                                        / {item.requiredWorkingDays} Hari)
                                        &times; {item.totalHadir} Hadir ={" "}
                                        <span className="text-slate-900 font-bold">
                                          {formatIDR(
                                            Math.round(
                                              (item.basePayRate /
                                                item.requiredWorkingDays) *
                                                item.totalHadir,
                                            ),
                                          )}
                                        </span>
                                      </div>
                                      {item.isEligibleForBonus ? (
                                        <div className="text-emerald-700 font-sans font-bold flex items-center gap-1 pt-1">
                                          <span>Bonus Kehadiran penuh:</span>
                                          <span className="font-mono bg-emerald-50 border border-emerald-100 px-1 py-0.2 rounded text-[9px]">
                                            +{formatIDR(item.calculatedBonus)}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="text-[9.5px] font-sans font-medium text-slate-400 italic pt-1">
                                          *Bonus{" "}
                                          {formatIDR(
                                            isTanggamus
                                              ? (salarySettings.tanggamusRegulerBonus ??
                                                  250000)
                                              : (salarySettings.bandarLampungRegulerBonus ??
                                                  300000),
                                          )}{" "}
                                          jika target penuh & telat &le; 3x.
                                        </div>
                                      )}
                                      {item.totalBackupShiftsAsReguler > 0 && (
                                        <div className="mt-1 pt-1 border-t border-amber-100/30 flex justify-between items-center text-amber-600 font-bold text-[9.5px]">
                                          <span>
                                            Shift Backup Ekstra (
                                            {item.totalBackupShiftsAsReguler}x):
                                          </span>
                                          <span className="font-mono bg-amber-50 border border-amber-100 px-1 py-0.2 rounded text-[9px]">
                                            +
                                            {formatIDR(
                                              item.calculatedBackupPay,
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1 font-mono text-[10.5px] text-slate-600">
                                      <div>
                                        {item.totalHadir} Shift ×{" "}
                                        {formatIDR(item.basePayRate)} / Shift
                                      </div>
                                    </div>
                                  )}

                                  {item.totalOvertimeHours > 0 && (
                                    <div className="mt-1 pt-1 border-t border-indigo-100/30 flex justify-between items-center text-indigo-600 font-bold text-[9.5px]">
                                      <span>
                                        Lembur ({item.totalOvertimeHours} J):
                                      </span>
                                      <span className="font-mono bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded text-[9px]">
                                        +{formatIDR(item.calculatedOvertimePay)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Gaji Bersih Transfer Block */}
                                  <div className="space-y-1.5 mt-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(String(item.netSalary));
                                        setCopiedSalaryHostId(item.id + "_salary");
                                        setTimeout(() => {
                                          setCopiedSalaryHostId(null);
                                        }, 1500);
                                      }}
                                      className={`w-full flex justify-between items-center p-2.5 rounded-lg border transition-all duration-150 active:scale-98 cursor-pointer text-left ${
                                        copiedSalaryHostId === item.id + "_salary"
                                          ? "bg-emerald-50 border-emerald-250 text-emerald-800"
                                          : "bg-purple-50/50 border-purple-100/30 text-slate-900 hover:bg-purple-50"
                                      }`}
                                    >
                                      <div>
                                        <span className="text-[8px] text-slate-400 uppercase font-black block">
                                          {copiedSalaryHostId === item.id + "_salary" ? "Berhasil Disalin" : "Estimasi Transfer Bersih (Klik untuk Salin)"}
                                        </span>
                                        <strong className="text-purple-950 font-bold text-xs flex items-center gap-1.5 mt-0.5">
                                          {copiedSalaryHostId === item.id + "_salary" ? (
                                            <span className="text-emerald-700 flex items-center gap-1">
                                              <Check className="w-3 h-3 text-emerald-600 animate-bounce" />
                                              <span>Tersalin ke Clipboard!</span>
                                            </span>
                                          ) : (
                                            <>
                                              <span>Transfer Gaji</span>
                                              <Copy className="w-3 h-3 text-slate-400 inline" />
                                            </>
                                          )}
                                        </strong>
                                      </div>
                                      <div className={`text-sm font-black font-mono ${copiedSalaryHostId === item.id + "_salary" ? "text-emerald-700 font-extrabold" : "text-blue-700"}`}>
                                        {formatIDR(item.netSalary)}
                                      </div>
                                    </button>

                                    {(item.bankName && item.bankAccount && item.bankAccount !== "-") ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigator.clipboard.writeText(String(item.bankAccount));
                                          setCopiedSalaryHostId(item.id + "_bank");
                                          setTimeout(() => setCopiedSalaryHostId(null), 1500);
                                        }}
                                        className={`w-full flex justify-between items-center p-2 rounded-lg border transition-all duration-150 active:scale-98 cursor-pointer text-left ${
                                          copiedSalaryHostId === item.id + "_bank"
                                            ? "bg-purple-100 border-purple-300 text-purple-800"
                                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 bg-white rounded-md shadow-3xs">
                                            {copiedSalaryHostId === item.id + "_bank" ? (
                                              <Check className="w-3.5 h-3.5 text-purple-600" />
                                            ) : (
                                              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                                            )}
                                          </div>
                                          <div>
                                            <span className="text-[8px] text-slate-400 uppercase font-black block leading-none">
                                              Bank Tujuan
                                            </span>
                                            <span className="text-[11px] font-bold mt-0.5 block truncate max-w-[120px]">
                                              {item.bankName}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className={`text-xs font-black font-mono ${copiedSalaryHostId === item.id + "_bank" ? "text-purple-700" : "text-slate-800"}`}>
                                            {item.bankAccount}
                                          </div>
                                          <span className="text-[8px] text-slate-400 uppercase font-black">
                                            {copiedSalaryHostId === item.id + "_bank" ? "Tersalin!" : "Klik Salin Rekening"}
                                          </span>
                                        </div>
                                      </button>
                                    ) : (
                                      <div className="w-full text-center p-2 rounded-lg border border-dashed border-slate-200 bg-slate-50">
                                        <span className="text-[9px] text-slate-400 uppercase font-black">Belum Ada Rekening Bank</span>
                                      </div>
                                    )}

                                    {/* Download Slip Button (Mobile) */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSlipHost(item);
                                      }}
                                      className="mt-2 w-full flex justify-center items-center gap-2 p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer shadow-3xs"
                                    >
                                      <Printer className="w-4 h-4" />
                                      <span className="text-[11px] font-bold uppercase tracking-wider">Unduh Slip Gaji</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* SINKRON DATA EXPORT HEADER */}
                    <div
                      className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 animate-fadeIn"
                      id="salary_export_panel"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-purple-950">
                            Ekspor Laporan & Penggajian Host Liva Agency
                          </h4>
                          <p className="text-[11px] text-purple-900/60 mt-0.5 font-medium">
                            Draf dokumen penggajian bulanan ini didasarkan dari
                            kalkulasi kehadiran real-time. Unduh data ini bila
                            perlu untuk dibagikan ke tim internal.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
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
                              "Estimasi Gaji Bersih",
                            ];

                            const rows = filteredHostReportList.map((h) => [
                              h.name,
                              h.studio || "Studio Bandar Lampung",
                              h.hostType || "Reguler",
                              h.requiredWorkingDays,
                              h.totalHadir,
                              h.countTerlambat,
                              h.countIzin + h.countAlpa,
                              h.basePayRate,
                              h.netSalary,
                            ]);

                            const csvContent =
                              "\uFEFF" +
                              [
                                headers.join(","),
                                ...rows.map((r) =>
                                  r
                                    .map(
                                      (val) =>
                                        `"${String(val).replace(/"/g, '""')}"`,
                                    )
                                    .join(","),
                                ),
                              ].join("\n");

                            const blob = new Blob([csvContent], {
                              type: "text/csv;charset=utf-8;",
                            });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.setAttribute("href", url);
                            link.setAttribute(
                              "download",
                              `Rekap_Gaji_LivaAgency_${new Date().toISOString().split("T")[0]}.csv`,
                            );
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

                  </div>
                )}

                {/* ==================== SUBTAB: LIVE DATABASE ATTENDANCE ==================== */}
                {operatorTab === "database" && (
                  <div className="space-y-6" id="operator_database_content">
                    {/* UNIFIED DATABASE TOOLBAR */}
                    <div className="flex flex-col bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-6" id="operator_database_unified_toolbar">
                      {/* Top Header: Title, Segmented Control, Actions */}
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 gap-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <Database className="w-4 h-4 text-purple-600" />
                            Database Absensi
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium mt-1">
                            Menampilkan <span className="font-bold text-slate-700">{filteredLogsList.length}</span> dari {logs.length} data log
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                          {/* Segmented Control */}
                          <div className="flex bg-slate-100/80 p-1 w-full sm:w-auto rounded-lg border border-slate-200/50">
                            {[
                              { id: "today", label: "Hari Ini" },
                              { id: "all", label: "Semua Data" },
                              { id: "calendar", label: "Kalender" }
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                onClick={() => setDbTabMode(tab.id as "today" | "all" | "calendar")}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-[11px] font-bold transition-all rounded-md ${
                                  dbTabMode === tab.id
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                          
                          {/* Action Button */}
                          <button
                            id="manual_attendance_log_modal_trigger"
                            onClick={() => setShowManualForm(!showManualForm)}
                            className={`w-full sm:w-auto font-black py-2 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm border ${
                              showManualForm
                                ? "bg-slate-800 hover:bg-slate-900 text-white border-slate-800"
                                : "bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                            }`}
                          >
                            {showManualForm ? (
                              <>
                                <X className="w-3.5 h-3.5" />
                                Tutup Form
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Input Manual
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Middle: Search & Dropdown Filters */}
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 bg-slate-50/50">
                        {/* Search Input */}
                        <div className="relative flex-1" id="db_search_input_wrapper">
                          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari host atau ID..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium placeholder:text-slate-400 shadow-3xs"
                          />
                        </div>

                        {/* Dropdowns */}
                        <div className="flex flex-wrap md:flex-nowrap gap-2">
                          <select
                            value={dbPlatformFilter}
                            onChange={(e) => setDbPlatformFilter(e.target.value)}
                            className="flex-1 md:flex-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer font-medium shadow-3xs appearance-none pr-8 relative"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                          >
                            <option value="Semua Platform">Semua Platform</option>
                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          
                          <select
                            value={dbBrandFilter}
                            onChange={(e) => setDbBrandFilter(e.target.value)}
                            className="flex-1 md:flex-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer font-medium shadow-3xs appearance-none pr-8 relative"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                          >
                            <option value="Semua Brand">Semua Brand</option>
                            {Array.from(new Set([
                              dbBrandFilter !== "Semua Brand" ? dbBrandFilter : null,
                              ...(clientBrands.length > 0 ? clientBrands.map((cb) => cb.name) : brands)
                            ].map(b => b?.trim()).filter(Boolean))).filter(Boolean).map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>

                          <select
                            value={dbShiftFilter}
                            onChange={(e) => setDbShiftFilter(e.target.value)}
                            className="flex-1 md:flex-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer font-medium shadow-3xs appearance-none pr-8 relative"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em" }}
                          >
                            <option value="Semua Shift">Semua Shift</option>
                            {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Date Filters (Only visible in 'all' mode) */}
                      {dbTabMode === "all" && (
                        <div className="flex flex-wrap gap-3 items-center px-4 pb-4 bg-slate-50/50">
                            <div className="flex items-center gap-2 w-full sm:w-auto bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-3xs focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Dari:</span>
                              <input
                                type="date"
                                value={dbDateFilterStart}
                                onChange={(e) => setDbDateFilterStart(e.target.value)}
                                className="bg-transparent text-xs font-medium text-slate-700 outline-none w-full"
                              />
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-3xs focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Sampai:</span>
                              <input
                                type="date"
                                value={dbDateFilterEnd}
                                onChange={(e) => setDbDateFilterEnd(e.target.value)}
                                className="bg-transparent text-xs font-medium text-slate-700 outline-none w-full"
                              />
                            </div>
                            {(dbDateFilterStart || dbDateFilterEnd) && (
                              <button
                                onClick={() => {
                                  setDbDateFilterStart("");
                                  setDbDateFilterEnd("");
                                }}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer w-full md:w-auto text-center"
                              >
                                Reset Tanggal
                              </button>
                            )}
                        </div>
                      )}

                      {/* Bottom: Status Pills */}
                      <div className="flex flex-wrap gap-2 p-4 border-t border-slate-100 bg-white" id="database_pill_filters">
                        {[
                          { id: "All", label: "Semua Log", color: "bg-slate-400", text: "text-slate-600", activeBg: "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10", activeCount: "bg-white/20 text-white" },
                          { id: "Present", label: "Hadir", statusChoice: "Present", color: "bg-emerald-500", text: "text-emerald-700", activeBg: "bg-emerald-50 text-emerald-800 shadow-sm ring-1 ring-emerald-500/20", activeCount: "bg-emerald-200/50 text-emerald-900" },
                          { id: "Late", label: "Terlambat", statusChoice: "Late", color: "bg-amber-500", text: "text-amber-700", activeBg: "bg-amber-50 text-amber-800 shadow-sm ring-1 ring-amber-500/20", activeCount: "bg-amber-200/50 text-amber-900" },
                          { id: "Absent", label: "Alpa / Mangkir", statusChoice: "Absent", color: "bg-red-500", text: "text-red-700", activeBg: "bg-red-50 text-red-800 shadow-sm ring-1 ring-red-500/20", activeCount: "bg-red-200/50 text-red-900" },
                          { id: "Excused", label: "Izin / Sakit", statusChoice: "Excused", color: "bg-blue-500", text: "text-blue-700", activeBg: "bg-blue-50 text-blue-800 shadow-sm ring-1 ring-blue-500/20", activeCount: "bg-blue-200/50 text-blue-900" },
                        ].map((pill) => {
                          const isPillActive = dbStatusFilter === pill.id;
                          const count = pill.id === "All"
                            ? dbActiveBaseLogs.length
                            : pill.id === "Absent"
                              ? dbActiveBaseLogs.filter((l) => l.status !== "Present" && l.status !== "Late" && l.status !== "Excused").length
                              : dbActiveBaseLogs.filter((l) => l.status === pill.statusChoice).length;

                          return (
                            <button
                              type="button"
                              key={pill.id}
                              onClick={() => {
                                setDbStatusFilter(pill.id as any);
                                setSelectedLogIds([]);
                              }}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                                isPillActive
                                  ? pill.activeBg
                                  : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                              }`}
                            >
                              {!isPillActive && <div className={`w-1.5 h-1.5 rounded-full ${pill.color}`} />}
                              <span>{pill.label}</span>
                              <span className={`px-1.5 py-0.5 rounded-md font-mono text-[9px] ${isPillActive ? pill.activeCount : "bg-white border border-slate-200/60"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* MANUAL LOG INSERTION FORM (EXPANDABLE SECTOINE) */}
                    {showManualForm && (
                      <form
                        onSubmit={handleManualLogSubmit}
                        className="bg-white p-5 rounded-xl border border-purple-100 space-y-4 shadow-md"
                        id="manual_log_form"
                      >
                                                <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-4 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setManualFormMode("standard")}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer border-0 ${
                              manualFormMode === "standard"
                                ? "bg-white text-purple-700 shadow-sm"
                                : "bg-transparent text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            📝 Mode Form Standar
                          </button>
                          <button
                            type="button"
                            onClick={() => setManualFormMode("grid")}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer border-0 flex items-center gap-1 ${
                              manualFormMode === "grid"
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-transparent text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <span className="text-[10px]">⚡</span> Mode Rekap Cepat
                          </button>
                        </div>

                        {manualFormMode === "grid" ? (
                          <div className="mt-2 h-[600px]">
                            <QuickGridInput
                              hosts={manualForm.isBulkHost 
                                ? hosts.filter(h => manualForm.hostIds.includes(h.id))
                                : hosts.filter(h => h.id === manualForm.hostId)}
                              dates={manualForm.isBulkDate ? manualForm.dates.filter(Boolean) : [manualForm.date].filter(Boolean)}
                              manualFormConfig={{
                                brand: manualForm.brand,
                                platform: manualForm.platform,
                                shift: manualForm.shift,
                                studio: manualForm.studio,
                                overtimeHours: manualForm.overtimeHours,
                                isBackupShift: manualForm.isBackupShift
                              }}
                              onSave={async (newLogs) => {
                                if (newLogs.length > 0) {
                                  try {
                                    if (typeof logsApi !== "undefined" && logsApi.createMany) {
                                      await logsApi.createMany(newLogs);
                                    }
                                    setLogs((prev) => [...newLogs, ...prev]);
                                    customAlert(`✅ Berhasil menyimpan ${newLogs.length} data absensi dari Rekap Cepat.`);
                                    setManualFormMode("standard");
                                  } catch (error) {
                                    console.error("Gagal menyimpan grid logs:", error);
                                    customAlert("Gagal menyimpan data rekap cepat ke server.");
                                  }
                                }
                              }}
                              onCancel={() => setManualFormMode("standard")}
                            />
                          </div>
                        ) : (
                        <>
                        <div className="border-b border-purple-100 pb-2 mb-2 flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-black uppercase text-purple-700">
                              Form Pengisian Manual Absensi Host (Oleh Operator)
                            </h4>
                            <p className="text-[10px] text-purple-500 mt-0.5 font-semibold">
                              Gunakan ini jika streamer melupakan smartphone
                              check-in saat siaran live.
                            </p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button type="button" onClick={handleSavePreset} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-200 border-0 cursor-pointer flex items-center gap-1"><Save className="w-3 h-3"/> Simpan Preset</button>
                            <button type="button" onClick={handleLoadPreset} className="text-[9px] font-bold bg-purple-50 text-purple-600 px-2 py-1.5 rounded-lg hover:bg-purple-100 border-0 cursor-pointer flex items-center gap-1"><FolderOpen className="w-3 h-3"/> Muat Preset</button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                          <div className="sm:col-span-1 md:col-span-2 lg:col-span-4 bg-slate-50 border border-slate-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-purple-950 font-bold mb-1">
                                Nama Host:
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-[10px] font-bold text-slate-500">
                                  Pilih Banyak Host
                                </span>
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={manualForm.isBulkHost}
                                    onChange={(e) =>
                                      setManualForm((prev) => ({
                                        ...prev,
                                        isBulkHost: e.target.checked,
                                        hostIds: e.target.checked
                                          ? []
                                          : prev.hostIds,
                                      }))
                                    }
                                  />
                                  <div
                                    className={`block w-8 h-4 rounded-full transition-colors ${manualForm.isBulkHost ? "bg-indigo-500" : "bg-slate-300"}`}
                                  ></div>
                                  <div
                                    className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${manualForm.isBulkHost ? "translate-x-4" : ""}`}
                                  ></div>
                                </div>
                              </label>
                            </div>

                            {!manualForm.isBulkHost ? (
                              <SearchableHostSelect
                                hosts={hosts}
                                value={manualForm.hostId}
                                onChange={(hostId) =>
                                  setManualForm((prev) => ({
                                    ...prev,
                                    hostId,
                                  }))
                                }
                                includeStudio={true}
                                placeholder="Pilih Host..."
                                triggerClassName="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold text-left flex items-center justify-between cursor-pointer min-h-[38px]"
                              />
                            ) : (
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[150px] overflow-y-auto">
                                {hosts.map((h) => (
                                  <label
                                    key={h.id}
                                    className="flex items-start gap-2 bg-white p-2 rounded border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={manualForm.hostIds.includes(
                                        h.id,
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked)
                                          setManualForm((prev) => ({
                                            ...prev,
                                            hostIds: [...prev.hostIds, h.id],
                                          }));
                                        else
                                          setManualForm((prev) => ({
                                            ...prev,
                                            hostIds: prev.hostIds.filter(
                                              (id) => id !== h.id,
                                            ),
                                          }));
                                      }}
                                    />
                                    <div className="text-[10px] leading-tight">
                                      <div className="font-bold text-slate-800">
                                        {h.name}
                                      </div>
                                      <div className="text-slate-500">
                                        {h.studio || "Studio B. Lampung"}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                            {manualForm.isBulkHost && (
                              <div className="flex gap-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManualForm((p) => ({
                                      ...p,
                                      hostIds: hosts.map((h) => h.id),
                                    }))
                                  }
                                  className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer border-0"
                                >
                                  Pilih Semua
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManualForm((p) => ({
                                      ...p,
                                      hostIds: [],
                                    }))
                                  }
                                  className="text-[9px] font-bold text-slate-500 bg-slate-200 px-2 py-1 rounded cursor-pointer border-0"
                                >
                                  Hapus Semua
                                </button>
                              </div>
                            )}
                            {manualForm.isBulkHost &&
                              manualForm.hostIds.length > 0 && (
                                <div className="mt-2 text-[10px] font-bold text-indigo-600">
                                  {manualForm.hostIds.length} host terpilih
                                </div>
                              )}
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Brand:
                            </label>
                            <select
                              id="manual_field_brand"
                              value={manualForm.brand}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  brand: e.target.value,
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                            >
                              {Array.from(
                                new Set([
                                  manualForm.brand,
                                  ...(clientBrands.length > 0 ? clientBrands.map((cb) => cb.name) : brands)
                                ].map(b => b?.trim()).filter(Boolean)),
                              )
                                .filter(Boolean)
                                .map((b) => (
                                  <option key={b} value={b}>
                                    {b}
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Platform:
                            </label>
                            <select
                              id="manual_field_platform"
                              value={manualForm.platform}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  platform: e.target.value,
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                            >
                              {platforms.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Shift Kerja:
                            </label>
                            <select
                              id="manual_field_shift"
                              value={manualForm.shift}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  shift: e.target.value,
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                            >
                              {shifts.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Lokasi Studio:
                            </label>
                            <select
                              id="manual_field_studio"
                              value={manualForm.studio}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  studio: e.target.value,
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-bold"
                            >
                              {studios.map((st) => (
                                <option key={st.id} value={st.name}>
                                  {st.name} - {st.location}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-1 lg:col-span-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-purple-950 font-bold mb-1">
                                Tanggal Absen:
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-[10px] font-bold text-slate-500">
                                  Pilih Banyak Tanggal
                                </span>
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={manualForm.isBulkDate}
                                    onChange={(e) =>
                                      setManualForm((prev) => ({
                                        ...prev,
                                        isBulkDate: e.target.checked,
                                      }))
                                    }
                                  />
                                  <div
                                    className={`block w-8 h-4 rounded-full transition-colors ${manualForm.isBulkDate ? "bg-indigo-500" : "bg-slate-300"}`}
                                  ></div>
                                  <div
                                    className={`absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform ${manualForm.isBulkDate ? "translate-x-4" : ""}`}
                                  ></div>
                                </div>
                              </label>
                            </div>

                            {!manualForm.isBulkDate ? (
                              <input
                                type="date"
                                id="manual_field_date"
                                value={manualForm.date}
                                onChange={(e) =>
                                  setManualForm((prev) => ({
                                    ...prev,
                                    date: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 font-mono focus:outline-none font-bold"
                              />
                            ) : (
                              <div className="flex flex-col gap-2">
                                <div className="bg-white p-3 rounded-lg border border-purple-150 flex flex-col gap-2 mb-2 shadow-sm">
                                  <div className="text-[10px] font-black text-purple-700">⚡ GENERATE RENTANG TANGGAL</div>
                                  <div className="flex items-center gap-2">
                                    <input type="date" value={manualForm.dateRangeStart} onChange={(e) => setManualForm(p => ({...p, dateRangeStart: e.target.value}))} className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-purple-400" />
                                    <span className="text-[10px] font-bold text-slate-400">s/d</span>
                                    <input type="date" value={manualForm.dateRangeEnd} onChange={(e) => setManualForm(p => ({...p, dateRangeEnd: e.target.value}))} className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] font-mono focus:outline-none focus:border-purple-400" />
                                  </div>
                                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                                    <input type="checkbox" checked={manualForm.excludeWeekends} onChange={(e) => setManualForm(p => ({...p, excludeWeekends: e.target.checked}))} className="rounded border-slate-300 text-purple-600 focus:ring-purple-600 w-3 h-3 cursor-pointer" />
                                    <span className="text-[10px] text-slate-600 font-bold">Kecualikan Sabtu & Minggu</span>
                                  </label>
                                  <button type="button" onClick={handleGenerateDateRange} className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black py-1.5 rounded w-full mt-1 border-0 cursor-pointer transition-colors shadow-sm">Buat Tanggal Otomatis</button>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 mb-1 px-1">Daftar Tanggal yang Akan Disimpan:</div>
                                {manualForm.dates.map((d, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="date"
                                      value={d}
                                      onChange={(e) =>
                                        setManualForm((prev) => {
                                          const newDates = [...prev.dates];
                                          newDates[i] = e.target.value;
                                          return { ...prev, dates: newDates };
                                        })
                                      }
                                      className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 font-mono focus:outline-none font-bold"
                                    />
                                    {manualForm.dates.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setManualForm((prev) => ({
                                            ...prev,
                                            dates: prev.dates.filter(
                                              (_, idx) => idx !== i,
                                            ),
                                          }))
                                        }
                                        className="px-2.5 py-2 text-rose-500 bg-rose-50 rounded-lg border flex-shrink-0 cursor-pointer font-bold border-rose-100"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManualForm((prev) => ({
                                      ...prev,
                                      dates: [
                                        ...prev.dates,
                                        new Date().toISOString().split("T")[0],
                                      ],
                                    }))
                                  }
                                  className="text-[10px] w-full mt-1 bg-white border border-dashed border-indigo-200 text-indigo-500 font-bold py-2 rounded flex items-center justify-center gap-1 hover:bg-indigo-50 transition-colors shadow-none cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Tambah Tanggal
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Status Absensi:
                            </label>
                            <select
                              id="manual_field_status"
                              value={manualForm.status}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  status: e.target.value as
                                    | "Present"
                                    | "Late"
                                    | "Absent"
                                    | "Excused",
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 focus:outline-none font-black"
                            >
                              <option value="Present">
                                Present (Tepat Waktu)
                              </option>
                              <option value="Late">Late (Terlambat)</option>
                              <option value="Absent">
                                Absent (Alpa / Bolos)
                              </option>
                              <option value="Excused">
                                Excused (Sakit / Izin)
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-purple-950 font-bold mb-1">
                              Jam Lembur (Opsional):
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              id="manual_field_overtime"
                              value={manualForm.overtimeHours || 0}
                              onChange={(e) =>
                                setManualForm((prev) => ({
                                  ...prev,
                                  overtimeHours: Number(e.target.value),
                                }))
                              }
                              className="w-full bg-white border border-purple-150 rounded-lg px-3 py-2 text-purple-950 font-mono focus:outline-none font-bold"
                              placeholder="Berapa jam lembur?"
                            />
                          </div>

                          <div className="flex flex-col justify-center">
                            <label className="flex items-center gap-2 cursor-pointer mt-0 md:mt-7">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={manualForm.isBackupShift}
                                  onChange={(e) =>
                                    setManualForm((prev) => ({
                                      ...prev,
                                      isBackupShift: e.target.checked,
                                    }))
                                  }
                                />
                                <div
                                  className={`block w-10 h-5 rounded-full transition-colors ${manualForm.isBackupShift ? "bg-amber-500" : "bg-slate-300"}`}
                                ></div>
                                <div
                                  className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${manualForm.isBackupShift ? "translate-x-5" : ""}`}
                                ></div>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600 leading-tight">
                                Jadikan Shift Backup <br />
                                <span className="font-normal text-[9px] text-slate-400">
                                  (Khusus Host Reguler)
                                </span>
                              </span>
                            </label>
                          </div>

                          <div className="flex items-end mt-4 md:mt-0 lg:col-span-4">
                            <button
                              type="submit"
                              id="manual_submit_button"
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-lg text-xs tracking-wider transition-all uppercase cursor-pointer"
                            >
                              Simpan Ke Database
                            </button>
                          </div>
                        </div>
                        </>
                        )}
                      </form>
                    )}

                    {/* RAW LOGS LIST TABLE OR CALENDAR FOR OPERATORS */}
                    {dbTabMode === "calendar" ? (
                      <AttendanceCalendarView 
                        logs={logs} 
                        hosts={hosts} 
                        clientBrands={clientBrands}
                        platforms={platforms}
                        shifts={shifts}
                        studios={studios.map((s) => s.name)}
                        salarySettings={{
                          useCutOff: salarySettings.useCutOff,
                          cutOffStartDay: salarySettings.cutOffStartDay ?? 16,
                          cutOffEndDay: salarySettings.cutOffEndDay ?? 15,
                        }}
                        onSaveLog={handleCalendarSaveLog}
                        onDeleteLog={handleCalendarDeleteLog}
                      />
                    ) : (
                      <>
                        <div
                        className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden"
                        id="raw-logs-table-wrapper"
                      >
                      <div className="overflow-x-auto relative">
                        <table
                          className="w-full text-left text-xs text-purple-950 border-collapse"
                          id="raw_attendance_logs_database_table"
                        >
                          <thead>
                            <tr className="bg-[#faf9fe] border-b border-purple-100 text-[10px] font-mono uppercase tracking-wider text-[#3c2f56]/70 font-bold select-none">
                              <th className="py-3 px-4 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={
                                    filteredLogsList.length > 0 &&
                                    filteredLogsList.every((item) =>
                                      selectedLogIds.includes(item.id),
                                    )
                                  }
                                  onChange={() => {
                                    const isAllSelected =
                                      filteredLogsList.length > 0 &&
                                      filteredLogsList.every((item) =>
                                        selectedLogIds.includes(item.id),
                                      );
                                    if (isAllSelected) {
                                      setSelectedLogIds((prev) =>
                                        prev.filter(
                                          (id) =>
                                            !filteredLogsList?.some(
                                              (item) => item.id === id,
                                            ),
                                        ),
                                      );
                                    } else {
                                      const newIds = [...selectedLogIds];
                                      filteredLogsList.forEach((item) => {
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
                              <th
                                className="py-3 px-4 cursor-pointer hover:bg-[#ebdcf9]/50 transition-colors select-none"
                                onClick={() =>
                                  setDbSortDir((d) =>
                                    d === "desc" ? "asc" : "desc",
                                  )
                                }
                              >
                                <div className="flex items-center gap-1.5">
                                  Tanggal siaran
                                  <div className="flex flex-col text-[8px] leading-none opacity-50">
                                    <span
                                      className={`${dbSortDir === "asc" ? "text-indigo-600 opacity-100 font-extrabold" : ""}`}
                                    >
                                      ▲
                                    </span>
                                    <span
                                      className={`${dbSortDir === "desc" ? "text-indigo-600 opacity-100 font-extrabold" : ""}`}
                                    >
                                      ▼
                                    </span>
                                  </div>
                                </div>
                              </th>
                              <th className="py-3 px-4">Brand Besutan</th>
                              <th className="py-3 px-4">Platform</th>
                              <th className="py-3 px-4">Shift & Jam</th>
                              <th className="py-3 px-4 text-center">
                                Status & Aksi Cepat
                              </th>
                              <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredLogsList.length === 0 ? (
                               <tr>
                                 <td colSpan={9} className="py-16 text-center">
                                   <div className="flex flex-col items-center gap-3">
                                     <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                                       <Search className="w-6 h-6 text-slate-400" />
                                     </div>
                                     <div>
                                       <p className="text-sm font-black text-slate-700">
                                         {logs.length === 0
                                           ? "Database absen masih kosong"
                                           : "Tidak ada log yang cocok"}
                                       </p>
                                       <p className="text-xs text-slate-400 font-medium mt-1 max-w-xs mx-auto">
                                         {logs.length === 0
                                           ? 'Mulai tambahkan log absensi menggunakan tombol "Input Absen Manual" di atas.'
                                           : "Coba ubah filter status, tanggal, atau kata kunci pencarian Anda."}
                                       </p>
                                     </div>
                                     {logs.length > 0 && (
                                       <button
                                         onClick={() => {
                                           setDbStatusFilter("All");
                                           setGlobalSearch("");
                                           setDbPlatformFilter("Semua Platform");
                                           setDbBrandFilter("Semua Brand");
                                           setDbDateFilterStart("");
                                           setDbDateFilterEnd("");
                                         }}
                                         className="mt-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer border-0 shadow-sm"
                                       >
                                         Reset Semua Filter
                                       </button>
                                     )}
                                   </div>
                                 </td>
                               </tr>
                             ) : filteredLogsList.map((item, idx) => {
                              const isRowChecked = selectedLogIds.includes(
                                item.id,
                              );
                              return (
                                <tr
                                  key={item.id || idx}
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
                                        setSelectedLogIds((prev) =>
                                          prev.includes(item.id)
                                            ? prev.filter(
                                                (id) => id !== item.id,
                                              )
                                            : [...prev, item.id],
                                        );
                                      }}
                                      className="rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] w-4 h-4 cursor-pointer accent-[#2563eb]"
                                    />
                                  </td>
                                  
                                  <td className="py-3 px-4 font-semibold text-slate-900 flex flex-col justify-center">
                                    <span className="text-sm">{item.hostName}</span>
                                    {(item.employeeId || hosts.find((h) => h.id === item.hostId)?.employeeId) && (
                                      <span className="text-xs text-slate-500 font-medium">
                                        {item.employeeId || hosts.find((h) => h.id === item.hostId)?.employeeId}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-sm text-slate-700">{formatHumanDate(item.date)}</div>
                                    {item.checkInTime && (
                                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span>{item.checkInTime}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getBrandStyle(item.brandHandled)}`}>
                                      {item.brandHandled}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                      item.platform?.toLowerCase().includes("tiktok") 
                                        ? "bg-stone-50 text-stone-700 border-stone-200" 
                                        : item.platform?.toLowerCase().includes("shopee") 
                                          ? "bg-orange-50 text-orange-700 border-orange-200" 
                                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                                    }`}>
                                      {item.platform}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                                    {item.shiftHours}
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                                        item.status === "Present"
                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                          : item.status === "Late"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : item.status === "Excused"
                                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                              : "bg-rose-50 text-rose-700 border-rose-200"
                                      }`}
                                    >
                                      {item.status === "Present"
                                        ? "Hadir"
                                        : item.status === "Late"
                                          ? "Terlambat"
                                          : item.status === "Excused"
                                            ? "Izin/Sakit"
                                            : "Alpa"}
                                    </span>
                                  </td>

                                  <td className="py-3 px-4 text-center">
                                    <div
                                      className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm"
                                      id="fast_status_modifier_buttons_wrapper"
                                    >
                                      <button
                                        id={`btn_mark_present_${item.id}`}
                                        onClick={() => handleUpdateLogStatus(item.id, "Present")}
                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                          item.status === "Present"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                                        }`}
                                        title="Tandai Hadir"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        id={`btn_mark_late_${item.id}`}
                                        onClick={() => handleUpdateLogStatus(item.id, "Late")}
                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                          item.status === "Late"
                                            ? "bg-amber-100 text-amber-700"
                                            : "hover:bg-amber-50 text-slate-400 hover:text-amber-600"
                                        }`}
                                        title="Tandai Terlambat"
                                      >
                                        <Clock className="w-4 h-4" />
                                      </button>
                                      <button
                                        id={`btn_mark_absent_${item.id}`}
                                        onClick={() => handleUpdateLogStatus(item.id, "Absent")}
                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                          item.status !== "Present" && item.status !== "Late" && item.status !== "Excused"
                                            ? "bg-rose-100 text-rose-700"
                                            : "hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                        }`}
                                        title="Tandai Alpa"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        id={`btn_mark_excused_${item.id}`}
                                        onClick={() => handleUpdateLogStatus(item.id, "Excused")}
                                        className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                          item.status === "Excused"
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                                        }`}
                                        title="Tandai Izin/Sakit"
                                      >
                                        <FileText className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 text-right">
                                    {pendingDeleteLogId === item.id ? (
                                      <div className="flex items-center justify-end gap-1 animate-in fade-in duration-150">
                                        <span className="text-[9px] text-slate-500 font-bold mr-0.5">Hapus?</span>
                                        <button
                                          onClick={() => {
                                            handleDeleteLog(item.id);
                                            setPendingDeleteLogId(null);
                                          }}
                                          className="px-2 py-1 text-[9px] font-black bg-red-600 hover:bg-red-700 text-white rounded transition-all cursor-pointer border-0"
                                        >
                                          Ya
                                        </button>
                                        <button
                                          onClick={() => setPendingDeleteLogId(null)}
                                          className="px-2 py-1 text-[9px] font-black bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-all cursor-pointer border-0"
                                        >
                                          Batal
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        id={`btn_delete_log_${item.id}`}
                                        onClick={() => setPendingDeleteLogId(item.id)}
                                        className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-all cursor-pointer border-0 bg-transparent"
                                        title="Hapus log ini"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
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
                      <div
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-slate-700/80 text-white rounded-full shadow-2xl px-6 py-3.5 flex items-center gap-5 justify-center animate-fadeIn shadow-2xl scale-100 font-sans"
                        id="database_bulk_actions_bar"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#2563eb] flex items-center justify-center font-black text-[10px] text-white">
                            {selectedLogIds.length}
                          </div>
                          <span className="text-[11px] font-bold text-slate-300 shrink-0">
                            baris terpilih
                          </span>
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
                            <Clock className="w-3 h-3" /> Set Terlambat
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
                            onClick={handleBulkMarkExcused}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3 py-1.5 rounded-full text-[10px] flex items-center gap-1 transition-all cursor-pointer border-0"
                          >
                            <span className="text-[10px]">📋</span> Set Izin
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
                  </>
                )}
              </div>
            )}

                {/* ==================== SUBTAB: DATA BRAND ==================== */}
                {operatorTab === "data_brand" && (
                  <div
                    className="space-y-6 animate-fadeIn"
                    id="operator_data_brand_content"
                  >
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-sm font-black text-slate-800">
                            Manajemen Data Brand Klien
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Data detail terkait kontrak, invoice, dan kredensial
                            brand aktif.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setBrandFormEditor({ sessions: [], accounts: [] })
                          }
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all border-0 cursor-pointer flex items-center gap-2 shadow-sm"
                        >
                          <Plus className="w-4 h-4" /> Klien Baru
                        </button>
                      </div>

                      {brandFormEditor && !brandFormEditor.id && (
                        <BrandFormEditor
                          brandFormEditor={brandFormEditor}
                          setBrandFormEditor={setBrandFormEditor}
                          clientBrandsApi={clientBrandsApi}
                          setClientBrands={setClientBrands}
                          addNotification={addNotification}
                          customAlert={customAlert}
                          platforms={platforms}
                          shifts={shifts}
                          studios={studios}
                          hosts={hosts}
                        />
                      )}

                      {/* Filter Tab & Search Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 shrink-0">
                          <button
                            onClick={() => setBrandDataTab("active")}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${brandDataTab === "active" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                          >
                            Aktif
                          </button>
                          <button
                            onClick={() => setBrandDataTab("inactive")}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${brandDataTab === "inactive" ? "bg-white text-slate-800 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                          >
                            Tidak Aktif
                          </button>
                        </div>
                        <div className="relative flex-1 w-full">
                          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Cari nama brand klien..."
                            value={brandDataSearch}
                            onChange={(e) => setBrandDataSearch(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-semibold"
                          />
                        </div>
                        <button
                          onClick={() => setBrandDataSortDir(prev => prev === "asc" ? "desc" : "asc")}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shrink-0"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          {brandDataSortDir === "asc" ? "A–Z" : "Z–A"}
                        </button>
                      </div>

                      {/* Brand Card List */}
                      <div className="space-y-3">
                        {filteredAndSortedBrands.length === 0 ? (
                          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                            <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold text-sm">
                              {brandDataSearch ? "Brand tidak ditemukan." : "Belum ada data brand klien."}
                            </p>
                            <p className="text-slate-300 text-xs mt-1">Klik tombol "+ Klien Baru" untuk menambahkan.</p>
                          </div>
                        ) : (
                          filteredAndSortedBrands.map((brand, i) => {
                            const isActive = brand.isActive !== false;

                            return (
                              <div
                                key={brand.id || i}
                                className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-sm hover:border-slate-300 group border-slate-200`}
                              >
                                {/* Card Header */}
                                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`w-9 h-9 overflow-hidden rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                                      isActive ? "bg-slate-50 border border-slate-200 text-slate-700" : "bg-slate-50 text-slate-400"
                                    }`}>
                                      {brand.logoUrl ? (
                                        <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover" />
                                      ) : (
                                        (brand.name || "?").charAt(0).toUpperCase()
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-slate-800 text-[15px] leading-tight truncate">{brand.name}</h4>
                                        {isActive ? (
                                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aktif
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Tidak Aktif
                                          </span>
                                        )}
                                        {brand.monthlyMeetingDate && (
                                          <span className="text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md font-medium border border-slate-200 flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-400" /> Meeting Tgl {brand.monthlyMeetingDate}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                                          {formatContractDate(brand.contractStartDate)} - {formatContractDate(brand.contractEndDate)}
                                        </span>
                                        {brand.invoiceDate && (
                                          <span className="flex items-center gap-1.5 text-slate-600">
                                            <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Invoice Tgl {brand.invoiceDate}
                                          </span>
                                        )}
                                        {brand.picName && (
                                          <span className="flex items-center gap-1.5 text-slate-600">
                                            <UserCheck className="w-3.5 h-3.5 text-slate-400" /> {brand.picName}
                                          </span>
                                        )}
                                        <span className="text-slate-400 font-mono text-[10px]">ID: #{brand.id.slice(-6).toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOperatorTab("invoice");
                                        setTimeout(() => {
                                          const e = new CustomEvent('openInvoiceForBrand', { detail: brand.id });
                                          window.dispatchEvent(e);
                                        }, 300);
                                      }}
                                      aria-label={`Buat invoice untuk ${brand.name}`}
                                      className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30"
                                      title="Buat Invoice"
                                    >
                                      <Receipt className="w-3.5 h-3.5" /> Invoice
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleEditBrand(brand)}
                                      aria-label={`Edit data brand ${brand.name}`}
                                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30"
                                      title="Edit Data"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBrand(brand.id)}
                                      aria-label={`Hapus data brand ${brand.name}`}
                                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition-all hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
                                      title="Hapus Data"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                                  {/* Sessions */}
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-500 mb-2">Platform & Sesi</p>
                                    <div className="flex flex-wrap gap-2">
                                      {brand.sessions && brand.sessions.length > 0 ? (
                                        brand.sessions.map((sess) => (
                                          <div
                                            key={sess.id}
                                            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-[11px]"
                                          >
                                            <span className="font-semibold text-slate-700">{sess.platform}</span>
                                            <span className="text-slate-400 mx-1.5">·</span>
                                            <span className="text-slate-600">{sess.shift}</span>
                                            {sess.studio && (
                                              <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                                                <MapPin className="w-3 h-3 text-slate-400" /> {sess.studio}
                                              </div>
                                            )}
                                            {sess.host && (
                                              <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <UserCheck className="w-3 h-3 text-slate-400" /> {sess.host}
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-slate-400 text-[11px] italic">Belum ada sesi</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Portal Credentials */}
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-500 mb-2">Portal Performance</p>
                                    <div className="bg-slate-50 border border-slate-200 rounded-md p-2.5 space-y-2">
                                      <div className="flex items-center gap-2 text-[11px]">
                                        <span className="text-slate-500 w-8 font-medium">UID</span>
                                        <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded flex-1 truncate">
                                          {brand.clientUsername || (brand.name || "").toLowerCase().replace(/[^a-z0-9]/g, "")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px]">
                                        <span className="text-slate-500 w-8 font-medium">PWD</span>
                                        <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded flex-1">
                                          {brand.clientPassword || "liva123"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Accounts */}
                                  <div>
                                    <p className="text-[10px] font-semibold text-slate-500 mb-2">Akun Seller ({brand.accounts?.length || 0})</p>
                                    <div className="flex flex-wrap gap-2">
                                      {brand.accounts && brand.accounts.length > 0 ? (
                                        brand.accounts.map((acc) => (
                                          <div key={acc.id} className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-[11px]">
                                            <div className="font-medium text-slate-500 text-[10px] mb-1">{acc.type}</div>
                                            <div className="font-mono text-slate-700">{acc.username || "—"}</div>
                                            <div className="font-mono text-slate-500 mt-0.5">{acc.password || "—"}</div>
                                            {acc.picOtp && (
                                              <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                                                <Smartphone className="w-3 h-3 text-slate-400" /> OTP: {acc.picOtp}
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-slate-400 text-[11px] italic">Tidak ada akun</div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {brandFormEditor && brandFormEditor.id === brand.id && (
                                  <div className="mt-4 border-t border-slate-200 pt-4">
                                    <BrandFormEditor
                                      brandFormEditor={brandFormEditor}
                                      setBrandFormEditor={setBrandFormEditor}
                                      clientBrandsApi={clientBrandsApi}
                                      setClientBrands={setClientBrands}
                                      addNotification={addNotification}
                                      customAlert={customAlert}
                                      platforms={platforms}
                                      shifts={shifts}
                                      studios={studios}
                                      hosts={hosts}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB: INVOICE BRAND ==================== */}
                {operatorTab === "invoice" && (
                  <InvoiceDashboard
                    clientBrands={clientBrands}
                    onUpdateBrands={setClientBrands}
                  />
                )}

                {/* ==================== SUBTAB: REPORTING BRAND ==================== */}
                {operatorTab === "reporting_brand" && (
                  <div
                    className="mx-auto w-full max-w-[1600px] space-y-6 animate-fadeIn bg-[#fcf9f8] min-h-screen px-4 pb-12 sm:px-6 lg:px-8"
                    id="operator_reporting_brand_content"
                  >
                    {activeReportBrandId === null ? (
                      <ReportBrandSelectionPanel
                        overviewStats={reportBrandOverviewStats}
                        filteredRows={filteredReportBrandRows}
                        visibleRows={visibleReportBrandRows}
                        searchQuery={reportBrandSearchQuery}
                        platformFilter={reportBrandPlatformFilter}
                        statusFilter={reportBrandStatusFilter}
                        sortKey={reportBrandSortKey}
                        availablePlatforms={availableReportBrandPlatforms}
                        currentPage={reportBrandPage}
                        totalPages={totalReportBrandPages}
                        openBrandCardActionsId={openBrandCardActionsId}
                        onSearchQueryChange={setReportBrandSearchQuery}
                        onPlatformFilterChange={setReportBrandPlatformFilter}
                        onStatusFilterChange={setReportBrandStatusFilter}
                        onSortKeyChange={setReportBrandSortKey}
                        onResetSearch={() => setReportBrandSearchQuery("")}
                        onResetFilters={() => {
                          setReportBrandSearchQuery("");
                          setReportBrandPlatformFilter("Semua Platform");
                          setReportBrandStatusFilter("Semua Status");
                          setReportBrandSortKey("latest_activity");
                        }}
                        onPageChange={setReportBrandPage}
                        onBrandSelect={handleOpenReportBrand}
                        onToggleBrandCardActions={handleToggleBrandCardActions}
                        onDeleteAllBrandRawData={(brandId, brandName) => {
                          handleDeleteAllBrandRawData(brandId, brandName);
                          setOpenBrandCardActionsId(null);
                        }}
                        onDeleteBrandDataByDateRange={(brandId, brandName) => {
                          setDeleteByDateTargetBrand({ id: brandId, name: brandName });
                          setIsDeleteByDateModalOpen(true);
                          setOpenBrandCardActionsId(null);
                        }}
                      />
                    ) : (
                      <>
                        <div className="w-full bg-[#fafafd] pb-12 overflow-x-hidden border border-slate-100 rounded-3xl overflow-hidden shadow-sm pt-0 relative mt-2 text-slate-800 font-sans text-left">
                          <div className="px-4 pt-4 sm:px-6">
                            <ReportingWorkspaceHeader
                              brandName={
                                clientBrands.find(
                                  (b) => b.id === activeReportBrandId,
                                )?.name || "Nama Brand"
                              }
                              brandId={activeReportBrandId || undefined}
                              brandLogoUrl={
                                clientBrands.find(
                                  (b) => b.id === activeReportBrandId,
                                )?.logoUrl
                              }
                              onBack={() => {
                                setActiveReportBrandId(null);
                                setReportingRawData([]);
                                setAutoDetectNotice("");
                              }}
                              activeTab={operatorReportingTab}
                              platformFilter={operatorPlatformFilter}
                              onPlatformFilterChange={
                                setOperatorPlatformFilter
                              }
                              availablePlatforms={[
                                "Shopee Live",
                                "TikTok Live",
                              ]}
                              dateFilterType={operatorDateFilterType}
                              onDateFilterTypeSelect={
                                handleOperatorDateFilterSelect
                              }
                              monthPickerYear={operatorMonthPickerYear}
                              setMonthPickerYear={setOperatorMonthPickerYear}
                              selectedMonth={operatorSelectedMonth}
                              setSelectedMonth={setOperatorSelectedMonth}
                              isMonthOpen={isOperatorMonthOpen}
                              setIsMonthOpen={setIsOperatorMonthOpen}
                              isCalendarOpen={isOperatorCalendarOpen}
                              setIsCalendarOpen={setIsOperatorCalendarOpen}
                              customStartDate={operatorCustomStartDate}
                              customEndDate={operatorCustomEndDate}
                              tempStartDate={operatorTempStartDate}
                              tempEndDate={operatorTempEndDate}
                              onTempStartDateChange={setOperatorTempStartDate}
                              onTempEndDateChange={setOperatorTempEndDate}
                              onApplyCustom={(start, end) => {
                                setOperatorCustomStartDate(start);
                                setOperatorCustomEndDate(end);
                                setIsOperatorCalendarOpen(false);
                              }}
                              onCancelCustom={() =>
                                setIsOperatorCalendarOpen(false)
                              }
                              periodLabel={
                                operatorDateFilterType === "latest"
                                  ? operatorWorkspacePeriodLabel
                                  : undefined
                              }
                              onPrevPeriod={
                                operatorDateFilterType === "latest"
                                  ? () =>
                                      handleOperatorLatestDateShift(
                                        -1,
                                        operatorWorkspaceDateLogs,
                                      )
                                  : undefined
                              }
                              onNextPeriod={
                                operatorDateFilterType === "latest"
                                  ? () =>
                                      handleOperatorLatestDateShift(
                                        1,
                                        operatorWorkspaceDateLogs,
                                      )
                                  : undefined
                              }
                              canPrevPeriod={
                                operatorDateFilterType === "latest"
                                  ? canPrevOperatorWorkspaceDate
                                  : undefined
                              }
                              canNextPeriod={
                                operatorDateFilterType === "latest"
                                  ? canNextOperatorWorkspaceDate
                                  : undefined
                              }
                              onImportRawLive={() => {
                                setSaveTargetBrandId(activeReportBrandId || "");
                                setUploadTargetTab("live");
                                setIsUploadModalOpen(true);
                              }}
                              onImportRawProduct={() => {
                                setSaveTargetBrandId(activeReportBrandId || "");
                                setIsSkuUploadModalOpen(true);
                              }}
                              onImportRawEngagement={() => {
                                setSaveTargetBrandId(activeReportBrandId || "");
                                setUploadTargetTab("engagement");
                                setIsUploadModalOpen(true);
                              }}
                            />
                          </div>

                          <ReportingWorkspaceTabs
                            activeTab={operatorReportingTab}
                            onTabChange={setOperatorReportingTab}
                          />

                          <DeleteByDateModal
                            isOpen={isDeleteByDateModalOpen}
                            isSavingReport={isSavingReport}
                            startDate={deleteByDateStart}
                            endDate={deleteByDateEnd}
                            onStartDateChange={setDeleteByDateStart}
                            onEndDateChange={setDeleteByDateEnd}
                            onClose={() => {
                              setIsDeleteByDateModalOpen(false);
                              setDeleteByDateStart("");
                              setDeleteByDateEnd("");
                              setDeleteByDateTargetBrand(null);
                            }}
                            onConfirm={handleDeleteBrandRawDataByDateRange}
                          />

                          <SkuUploadModal
                            isOpen={isSkuUploadModalOpen}
                            isSavingReport={isSavingReport}
                            isDragOverReporting={isDragOverReporting}
                            saveTargetBrandId={saveTargetBrandId}
                            saveTargetPlatform={saveTargetPlatform}
                            skuRawData={skuRawData}
                            clientBrands={clientBrands}
                            onClose={() => {
                              setIsSkuUploadModalOpen(false);
                              setSkuRawData([]);
                              setAutoDetectNotice("");
                            }}
                            onResetFile={() => {
                              setSkuRawData([]);
                              setAutoDetectNotice("");
                            }}
                            onSave={async () => {
                              if (!saveTargetBrandId) {
                                alert("Harap pilih brand terlebih dahulu!");
                                return;
                              }
                              try {
                                setIsSavingReport(true);
                                const batchId = `sku_batch_${Date.now()}`;

                                const newRecords: SkuLogEntry[] = skuRawData.map((p) => ({
                                  ...p,
                                  id: `${batchId}_${Math.random().toString(36).slice(2)}`,
                                  platform: saveTargetPlatform,
                                  batchId,
                                  brandId: saveTargetBrandId,
                                  uploadedAt: new Date().toISOString(),
                                }));
                                setShopeeSkuLogs((prev) => [...prev, ...newRecords]);
                                customAlert("Data SKU berhasil disimpan!");
                                setIsSkuUploadModalOpen(false);
                                setSkuRawData([]);
                                setOperatorPlatformFilter(saveTargetPlatform || "Shopee Live");
                              } catch (e: unknown) {
                                console.error(e);
                                alert("Error saving: " + getErrorMessage(e));
                              } finally {
                                setIsSavingReport(false);
                              }
                            }}
                            onBrandChange={setSaveTargetBrandId}
                            onPlatformChange={setSaveTargetPlatform}
                            onDragOver={() => setIsDragOverReporting(true)}
                            onDragLeave={() => setIsDragOverReporting(false)}
                            onFileSelect={handleUploadSkuRaw}
                          />

                          {isUploadModalOpen && (
                            <div
                              className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:p-6 sm:pt-[6vh] sm:pb-12 animate-fadeIn"
                              id="upload_report_modal"
                            >
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                                onClick={() => {
                                  if (isSavingReport) return;
                                  setIsUploadModalOpen(false);
                                  setReportingRawData([]);
                                  setAutoDetectNotice("");
                                }}
                              ></div>
                              <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-5xl w-full p-6 sm:p-8 text-left relative animate-scaleUp my-auto sm:my-4 z-10">
                                {/* Close Button */}
                                <button
                                  onClick={() => {
                                    if (isSavingReport) return;
                                    setIsUploadModalOpen(false);
                                    setReportingRawData([]);
                                    setAutoDetectNotice("");
                                  }}
                                  className={`absolute top-5 right-5 p-2 rounded-full transition-colors border-0 bg-transparent text-xl font-bold ${isSavingReport ? "text-slate-200 cursor-not-allowed" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"}`}
                                  title="Tutup Open Laporan"
                                  disabled={isSavingReport}
                                >
                                  ✕
                                </button>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                                  <div>
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                      <LineChart className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500 animate-pulse" />{" "}
                                      {uploadTargetTab === "engagement"
                                        ? "Upload Raw Data Engagement & Promotion"
                                        : "Upload Laporan Eksternal Marketplace"}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                                      Impor data performa mentah (raw data){" "}
                                      {uploadTargetTab === "engagement"
                                        ? "engagement"
                                        : "penyiaran langsung"}{" "}
                                      dari platform marketplace
                                      (TikTok/Shopee/dll) untuk{" "}
                                      <strong className="text-indigo-600 uppercase">
                                        {
                                          clientBrands.find(
                                            (b) => b.id === activeReportBrandId,
                                          )?.name
                                        }
                                      </strong>
                                      .
                                    </p>
                                  </div>
                                </div>

                                {/* FORM PENENTU BRAND & PLATFORM (Selalu terlihat sebagai default tujuan) */}
                                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm mb-6 space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/70">
                                    <div>
                                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <Sliders className="w-4 h-4 text-indigo-600" />{" "}
                                        Konfigurasi Brand & Platform Penerima
                                      </h4>
                                      <p className="text-[11px] font-semibold text-slate-400">
                                        Pastikan tujuan data diatur secara benar
                                        sebelum Anda melakukan upload file
                                        Excel/CSV/XLS.
                                      </p>
                                    </div>
                                    <span className="bg-white text-indigo-700 border border-indigo-100 text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs self-start sm:self-auto flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />{" "}
                                      Auto-Detect Aktif
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        1. Pilih Target Brand Klien
                                      </label>
                                      <select
                                        required
                                        value={saveTargetBrandId}
                                        onChange={(e) =>
                                          setSaveTargetBrandId(e.target.value)
                                        }
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                                      >
                                        <option value="">
                                          -- Pilih Brand Klien --
                                        </option>
                                        {clientBrands.map((b) => (
                                          <option key={b.id} value={b.id}>
                                            {b.name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        2. Tentukan Platform Marketplace
                                      </label>
                                      <select
                                        value={saveTargetPlatform}
                                        onChange={(e) =>
                                          setSaveTargetPlatform(e.target.value)
                                        }
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 font-bold focus:border-indigo-500 outline-none text-xs text-slate-700"
                                      >
                                        <option value="TikTok Live">
                                          TikTok Live
                                        </option>
                                        <option value="Shopee Live">
                                          Shopee Live
                                        </option>
                                        <option value="Tokopedia">
                                          Tokopedia
                                        </option>
                                        <option value="Lazada">Lazada</option>
                                      </select>
                                    </div>
                                  </div>

                                  {autoDetectNotice && (
                                    <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-xl text-xs text-indigo-950 font-bold flex items-center gap-2.5 animate-fadeIn">
                                      <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 animate-bounce" />
                                      <div>
                                        <p className="text-indigo-850">
                                          {autoDetectNotice}
                                        </p>
                                        <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">
                                          Sistem memetakan file secara otomatis.
                                          Anda tetap dapat mengubah dropdown di
                                          atas secara manual jika tidak sesuai.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {reportingRawData.length === 0 ? (
                                  <div className="space-y-4">
                                    <div
                                      className={`relative border-2 border-dashed rounded-[24px] p-10 sm:p-14 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragOverReporting ? "border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"}`}
                                      onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(true);
                                      }}
                                      onDragLeave={(e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                      }}
                                      onDrop={async (e) => {
                                        e.preventDefault();
                                        setIsDragOverReporting(false);
                                        const file = e.dataTransfer.files[0];
                                        if (file)
                                          handleUploadReportingRaw(file);
                                      }}
                                    >
                                      <input
                                        type="file"
                                        id="reporting_upload"
                                        className="hidden"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file)
                                            handleUploadReportingRaw(file);
                                        }}
                                      />
                                      <label
                                        htmlFor="reporting_upload"
                                        className="cursor-pointer flex flex-col items-center justify-center gap-4"
                                      >
                                        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                                          <Upload className="w-10 h-10 text-indigo-500" />
                                        </div>
                                        <div>
                                          <h4 className="text-base font-black text-slate-800">
                                            Upload Raw{" "}
                                            {uploadTargetTab === "engagement"
                                              ? "Engagement & Promotion"
                                              : "Data"}{" "}
                                            {saveTargetPlatform !== "Semua"
                                              ? saveTargetPlatform
                                              : "Marketplace"}
                                          </h4>
                                          <p className="text-xs text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                                            {uploadTargetTab === "engagement"
                                              ? saveTargetPlatform ===
                                                "Shopee Live"
                                                ? "Tarik & lepas file Export Shopee Live Seller (Analisis Interaksi & Promosi) ke area ini."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "Tarik & lepas file Export TikTok Center (Analisis Interaksi & Promosi) ke area ini."
                                                  : "Tarik & lepas file Export TikTok/Shopee (Interaksi & Promosi) ke area ini, atau klik untuk memilih file."
                                              : saveTargetPlatform ===
                                                  "Shopee Live"
                                                ? "Tarik & lepas file Export Shopee Live Seller (Daftar Sesi) ke area ini."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "Tarik & lepas file Export TikTok Center (Analisis Live) ke area ini."
                                                  : "Tarik & lepas file Export TikTok/Shopee (Excel/CSV) ke area ini, atau klik untuk memilih file."}
                                          </p>
                                          <p className="text-[10px] text-indigo-600 font-mono font-bold mt-2">
                                            {uploadTargetTab === "engagement"
                                              ? saveTargetPlatform ===
                                                "Shopee Live"
                                                ? "💡 File Shopee harus mengandung kolom: Nama Livestream, Suka (Likes), Komentar (Comments), Membagikan (Shares), Voucher Toko Diklaim, Voucher Spesial Live Diklaim, Koin Diklaim."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "💡 File TikTok harus mengandung: Live impressions, New followers, Likes, Shares, Comments."
                                                  : "💡 Tips: Beri nama file yang mengandung nama Brand & Platform Anda (contoh: Laporan_Hanasui_TikTok_Engagement.xlsx) untuk auto-detect otomatis!"
                                              : saveTargetPlatform ===
                                                  "Shopee Live"
                                                ? "💡 File Shopee harus mengandung kolom: Nama Livestream, Durasi Rata-Rata Menonton, Tambah ke Keranjang, Pesanan Dibuat."
                                                : saveTargetPlatform ===
                                                    "TikTok Live"
                                                  ? "💡 File TikTok harus mengandung: Live impressions, Product clicks, Orders, Gross profit."
                                                  : "💡 Tips: Beri nama file yang mengandung nama Brand & Platform Anda (contoh: Laporan_Hanasui_TikTok.xlsx) untuk auto-detect otomatis!"}
                                          </p>
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
                                          <h4 className="text-sm font-black text-indigo-900">
                                            Data Analytics Berhasil Diproses
                                          </h4>
                                          <p className="text-[10px] sm:text-xs font-semibold text-indigo-700">
                                            {reportingRawData.length} Sesi Live
                                            Terdeteksi
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            if (isSavingReport) return;
                                            setIsUploadModalOpen(false);
                                            setReportingRawData([]);
                                            setAutoDetectNotice("");
                                          }}
                                          className="px-4 py-2 bg-white text-slate-600 border border-slate-200 text-xs font-black rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                                        >
                                          Tutup
                                        </button>
                                        <button
                                          onClick={() => {
                                            setReportingRawData([]);
                                            setAutoDetectNotice("");
                                          }}
                                          className="px-4 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-black rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                        >
                                          Reset File
                                        </button>
                                      </div>
                                    </div>

                                    {/* BAR AKSI PENYIMPANAN DATABASE */}
                                    <div className="bg-emerald-50 border border-emerald-150 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left">
                                      <div>
                                        <h4 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                                          <Database className="w-4 h-4 text-emerald-600" />{" "}
                                          Konfirmasi Penyimpanan Database
                                        </h4>
                                        <p className="text-xs font-semibold text-emerald-800 mt-1">
                                          Laporan akan disimpan untuk Brand:{" "}
                                          <strong className="text-emerald-950 font-black">
                                            {clientBrands.find(
                                              (b) => b.id === saveTargetBrandId,
                                            )?.name ||
                                              "(PILIH BRAND DULU DIATAS)"}
                                          </strong>{" "}
                                          | Platform:{" "}
                                          <strong className="text-emerald-950 font-black">
                                            {saveTargetPlatform}
                                          </strong>
                                          .
                                        </p>
                                      </div>
                                      <button
                                        onClick={
                                          handleSaveReportingDataToDatabase
                                        }
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

                                    <ReportingUploadAnalyticsSection
                                      reportingRawData={reportingRawData}
                                      reportingUploadSummary={
                                        reportingUploadSummary
                                      }
                                      saveTargetPlatform={saveTargetPlatform}
                                      uploadTargetTab={uploadTargetTab}
                                      activeReportPlatform={activeReportPlatform}
                                    />

                                    {/* DATA TABLE */}
                                    <ReportingUploadPreviewTable
                                      reportingRawData={reportingRawData}
                                      saveTargetPlatform={saveTargetPlatform}
                                      uploadTargetTab={uploadTargetTab}
                                      shopeeRawTab={shopeeRawTab}
                                      rawDateSortAsc={rawDateSortAsc}
                                      onRawDateSortToggle={() =>
                                        setRawDateSortAsc(!rawDateSortAsc)
                                      }
                                      shifts={shifts}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* STORED DATABASE VIEWER - NEW DESIGN */}
                          {operatorReportingTab === "live" && (
                            <React.Suspense
                              fallback={
                                <div className="px-6 sm:px-8 py-10 text-sm font-semibold text-slate-500 animate-pulse">
                                  Memuat panel reporting...
                                </div>
                              }
                            >
                              <LiveReportPanel
                                model={liveReportView}
                                chartSelectedMetrics={liveChartSelectedMetrics}
                                onChartSelectedMetricsChange={
                                  setLiveChartSelectedMetrics
                                }
                                operatorPlatformFilter={operatorPlatformFilter}
                                shifts={shifts}
                                adminShiftChecklist={adminShiftChecklist}
                                setAdminShiftChecklist={setAdminShiftChecklist}
                                reportingShopeeRawTab={reportingShopeeRawTab}
                                setReportingShopeeRawTab={
                                  setReportingShopeeRawTab
                                }
                                reportDbSortCol={reportDbSortCol}
                                reportDbSortAsc={reportDbSortAsc}
                                setReportDbSortCol={setReportDbSortCol}
                                setReportDbSortAsc={setReportDbSortAsc}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                itemsPerPage={ITEMS_PER_PAGE}
                                isLogsLoading={isLogsLoading}
                                handleDeletePerformanceLog={
                                  handleDeletePerformanceLog
                                }
                                brandPerformanceLogs={brandPerformanceLogs}
                                activeReportBrandId={activeReportBrandId || ""}
                                brandUploadHistory={brandUploadHistory}
                                uploadHistory={uploadHistory}
                                onDeleteUploadBatch={handleDeleteUploadBatch}
                                brandDashboardSettings={brands.find((b) => b.id === activeReportBrandId)?.dashboardSettings}
                              />
                            </React.Suspense>
                          )}

                          {/* STORED SKU DATABASE VIEWER */}
                          {operatorReportingTab === "product" && (
                            <ProductPerformancePanel
                              shopeeSkuLogs={shopeeSkuLogs}
                              brandPerformanceLogs={brandPerformanceLogs}
                              activeReportBrandId={activeReportBrandId || ""}
                              operatorDateFilterType={operatorDateFilterType}
                              selectedLatestDate={operatorSelectedLatestDate}
                              operatorCustomStartDate={
                                operatorCustomStartDate
                              }
                              operatorCustomEndDate={operatorCustomEndDate}
                              operatorSelectedMonth={operatorSelectedMonth}
                              operatorPlatformFilter={operatorPlatformFilter}
                              operatorShiftFilters={operatorShiftFilters}
                              reportDbSearchQuery={reportDbSearchQuery}
                      brandDashboardSettings={brands.find((b) => b.id === activeReportBrandId)?.dashboardSettings}
                              skuSortCol={skuSortCol}
                              skuSortAsc={skuSortAsc}
                              setSkuSortCol={setSkuSortCol}
                              setSkuSortAsc={setSkuSortAsc}
                              setOperatorDateFilterType={
                                setOperatorDateFilterType
                              }
                              setOperatorCustomStartDate={
                                setOperatorCustomStartDate
                              }
                              setOperatorCustomEndDate={
                                setOperatorCustomEndDate
                              }
                              currentPage={currentPage}
                              itemsPerPage={ITEMS_PER_PAGE}
                              setCurrentPage={setCurrentPage}
                              onDeleteBatch={handleDeleteSkuBatch}
                            />
                          )}

                          {operatorReportingTab === "engagement" && (
                            <React.Suspense
                              fallback={
                                <div className="px-6 sm:px-8 py-10 text-sm font-semibold text-slate-500 animate-pulse">
                                  Memuat panel reporting...
                                </div>
                              }
                            >
                              <EngagementReportPanel
                                model={engagementReportView}
                                platform={operatorPlatformFilter}
                                chartSelectedMetrics={
                                  engagementChartSelectedMetrics
                                }
                                onChartSelectedMetricsChange={
                                  setEngagementChartSelectedMetrics
                                }
                                activeReportBrandId={activeReportBrandId || ""}
                                brandPerformanceLogs={brandPerformanceLogs}
                                brandUploadHistory={brandUploadHistory}
                                uploadHistory={uploadHistory}
                                isLogsLoading={isLogsLoading}
                                onDeleteUploadBatch={handleDeleteUploadBatch}
                                brandDashboardSettings={brands.find((b) => b.id === activeReportBrandId)?.dashboardSettings}
                              />
                            </React.Suspense>
                          )}

                          {operatorReportingTab === "settings" && activeReportBrandId && (
                            <BrandDashboardSettingsPanel
                              brand={clientBrands.find(b => b.id === activeReportBrandId)!}
                              onUpdateBrand={async (updatedBrand) => {
                                try {
                                  if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.update) {
                                    await clientBrandsApi.update(updatedBrand.id, updatedBrand);
                                  }
                                  setClientBrands(prev => 
                                    prev.map(b => b.id === updatedBrand.id ? updatedBrand : b)
                                  );
                                } catch (error) {
                                  console.error("Gagal menyimpan pengaturan:", error);
                                  alert("Gagal menyimpan pengaturan brand.");
                                }
                              }}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                {/* ==================== SUBTAB: LEADS / CALON KLIEN ==================== */}
                {operatorTab === "leads" && (
                  <div
                    className="space-y-6 animate-fadeIn"
                    id="operator_leads_content"
                  >
                    <LeadPipelinePanel
                      leads={clientLeads}
                      leadSearchQuery={leadSearchQuery}
                      onLeadSearchQueryChange={setLeadSearchQuery}
                      onCreateLead={() =>
                        setLeadFormModal({ isOpen: true, data: {} })
                      }
                      onEditLead={(lead) =>
                        setLeadFormModal({ isOpen: true, data: lead })
                      }
                      onDeleteLead={async (lead) => {
                        requestConfirm(
                          "Hapus Lead Klien?",
                          `Data pipeline calon klien ini akan dihapus permanen. Lanjutkan?`,
                          async () => {
                            try {
                              if (typeof clientLeadsApi !== "undefined" && clientLeadsApi.delete) {
                                await clientLeadsApi.delete(lead.id);
                              }
                              setClientLeads((prev) =>
                                prev.filter((b) => b.id !== lead.id),
                              );
                            } catch (error) {
                              console.error("Gagal hapus lead:", error);
                              customAlert("Gagal menghapus lead dari server.");
                            }
                          },
                          "danger",
                        );
                      }}
                      onStatusChange={async (leadId, status) => {
                        try {
                          const updatedLead = clientLeads.find((l) => l.id === leadId);
                          if (updatedLead) {
                            if (typeof clientLeadsApi !== "undefined" && clientLeadsApi.update) {
                              await clientLeadsApi.update(leadId, { ...updatedLead, status });
                            }
                            setClientLeads((p) =>
                              p.map((x) =>
                                x.id === leadId ? { ...x, status } : x,
                              ),
                            );
                          }
                        } catch (error) {
                          console.error("Gagal update status lead:", error);
                          customAlert("Gagal mengupdate status lead ke server.");
                        }
                      }}
                    />

                    <LeadFormModal
                      isOpen={leadFormModal.isOpen}
                      lead={leadFormModal.data}
                      platforms={platforms}
                      onClose={() => setLeadFormModal({ isOpen: false, data: {} })}
                      onSubmit={async (newLead) => {
                        try {
                          if (leadFormModal.data.id) {
                            if (typeof clientLeadsApi !== "undefined" && clientLeadsApi.update) {
                              await clientLeadsApi.update(newLead.id, newLead);
                            }
                            setClientLeads((prev) =>
                              prev.map((l) => (l.id === newLead.id ? newLead : l)),
                            );
                            addNotification(
                              "💼 Informasi Lead Diupdate",
                              `Data lead "${newLead.name}" telah diupdate oleh admin.`,
                              "info",
                              "leads",
                            );
                          } else {
                            if (typeof clientLeadsApi !== "undefined" && clientLeadsApi.create) {
                              const res = await clientLeadsApi.create(newLead);
                              if (res && res.id && res.id !== newLead.id) {
                                newLead.id = res.id;
                              }
                            }
                            setClientLeads((prev) => [...prev, newLead]);
                            addNotification(
                              "🔥 Leads Calon Klien Baru",
                              `Ada registrasi lead prospek baru masuk untuk "${newLead.name}" via platform "${newLead.platformInterest}".`,
                              "warning",
                              "leads",
                            );
                          }
                          setLeadFormModal({ isOpen: false, data: {} });
                        } catch (error) {
                          console.error("Gagal simpan lead:", error);
                          customAlert("Gagal menyimpan data lead ke server.");
                        }
                      }}
                    />
                  </div>
                )}

                {/* ==================== SUBTAB: SETTINGS CONFIGURATION ⚙️ ==================== */}
                {operatorTab === "settings" && (
                  <div
                    className="space-y-6 animate-fadeIn font-sans"
                    id="operator_settings_content"
                  >
                    {/* Intro/Header Banner */}
                    <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
                      <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-sm mb-1.5">
                        <Sliders className="w-5 h-5 text-purple-600" />
                        PENGATURAN METADATA STRUKTUR AGENCY (LIVE AGENT SYSTEM)
                      </div>
                      <p className="text-xs text-purple-600 leading-relaxed font-semibold">
                        Kelola data-data pendukung operational streaming secara
                        dinamis. Anda dapat menambah, mengedit, atau menghapus
                        nama platform marketplace/media sosial, nama brand klien
                        Agency, daftar jam kerja shift (roster silang), serta
                        cabang lokasi & nama studio yang langsung terintegrasi
                        ke seluruh formulir absensi host.
                      </p>
                    </div>

                    <SettingsMetadataPanels
                      agencyLogoUrl={agencyLogoUrl}
                      setAgencyLogoUrl={setAgencyLogoUrl}
                      platforms={platforms}
                      setPlatforms={setPlatforms}
                      newPlatformInput={newPlatformInput}
                      setNewPlatformInput={setNewPlatformInput}
                      platformError={platformError}
                      setPlatformError={setPlatformError}
                      editingPlatformIdx={editingPlatformIdx}
                      setEditingPlatformIdx={setEditingPlatformIdx}
                      editingPlatformValue={editingPlatformValue}
                      setEditingPlatformValue={setEditingPlatformValue}
                      brands={brands}
                      setBrands={setBrands}
                      newBrandInput={newBrandInput}
                      setNewBrandInput={setNewBrandInput}
                      brandError={brandError}
                      setBrandError={setBrandError}
                      editingBrandIdx={editingBrandIdx}
                      setEditingBrandIdx={setEditingBrandIdx}
                      editingBrandValue={editingBrandValue}
                      setEditingBrandValue={setEditingBrandValue}
                      shifts={shifts}
                      setShifts={setShifts}
                      newShiftInput={newShiftInput}
                      setNewShiftInput={setNewShiftInput}
                      shiftError={shiftError}
                      setShiftError={setShiftError}
                      editingShiftIdx={editingShiftIdx}
                      setEditingShiftIdx={setEditingShiftIdx}
                      editingShiftValue={editingShiftValue}
                      setEditingShiftValue={setEditingShiftValue}
                      studios={studios}
                      setStudios={setStudios}
                      newStudioName={newStudioName}
                      setNewStudioName={setNewStudioName}
                      newStudioLocation={newStudioLocation}
                      setNewStudioLocation={setNewStudioLocation}
                      studioError={studioError}
                      setStudioError={setStudioError}
                      editingStudioIdx={editingStudioIdx}
                      setEditingStudioIdx={setEditingStudioIdx}
                      editingStudioName={editingStudioName}
                      setEditingStudioName={setEditingStudioName}
                      editingStudioLocation={editingStudioLocation}
                      setEditingStudioLocation={setEditingStudioLocation}
                      onRequestConfirm={requestConfirm}
                    />

                  </div>
                )}

                {/* ==================== SUBTAB: PRIVASI MASTER ADMIN ==================== */}
                {!loggedInAdminId && operatorTab === "admin_privacy" && (
                  <div
                    className="space-y-6 animate-fadeIn"
                    id="operator_admin_privacy_content"
                  >
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                        <div>
                          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-rose-500" />{" "}
                            Pengaturan Privasi & Keamanan Master Admin
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">
                            Kelola kata sandi, otentikasi dua langkah, dan log
                            aktivitas admin
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ubah Password */}
                        <AdminPasswordCard
                          currentPasswordInput={currentPasswordInput}
                          newPasswordInput={newPasswordInput}
                          confirmPasswordInput={confirmPasswordInput}
                          passwordChangeError={passwordChangeError}
                          passwordChangeSuccess={passwordChangeSuccess}
                          onCurrentPasswordChange={setCurrentPasswordInput}
                          onNewPasswordChange={setNewPasswordInput}
                          onConfirmPasswordChange={setConfirmPasswordInput}
                          onSubmit={() => {
                            setPasswordChangeSuccess("");
                            setPasswordChangeError(
                              "Password Master Admin sekarang dikelola melalui environment server. Hubungi pengelola deployment untuk menggantinya.",
                            );
                          }}
                        />

                        <AdminMaintenancePanel
                          canTestDb={canAccessDbTest(authSession)}
                          testDbConnection={testDbConnection}
                          onExportJSON={handleExportJSON}
                          onImportJSON={handleImportJSON}
                          onRecoverLocalStorage={handleRecoverLocalStorage}
                          onClearAllData={handleClearAllData}
                        />
                      </div>

                      {/* ======= MANAJEMEN AKUN ADMIN TAMBAHAN ======= */}
                      <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                              <Users className="w-5 h-5 text-indigo-500" />
                              Manajemen Akses Admin (Sub-Akun)
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold mt-1">
                              Buat akun admin tambahan dengan kontrol akses
                              halaman secara custom.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (showAdminAccountForm) {
                                setShowAdminAccountForm(false);
                                setEditingAdminId(null);
                                setNewAdminName("");
                                setNewAdminUser("");
                                setNewAdminPass("");
                                setNewAdminAccess([]);
                              } else {
                                setShowAdminAccountForm(true);
                              }
                            }}
                            className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-all flex items-center gap-2 border-0 cursor-pointer"
                          >
                            {showAdminAccountForm
                              ? editingAdminId
                                ? "Batal Edit"
                                : "Tutup Form"
                              : "+ Tambah Admin Baru"}
                          </button>
                        </div>

                        {showAdminAccountForm && (
                          <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 mb-6 animate-fadeIn">
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (
                                  !newAdminName ||
                                  !newAdminUser ||
                                  !newAdminPass
                                )
                                  return;

                                try {
                                  if (editingAdminId) {
                                    const updatedAdmin = {
                                      id: editingAdminId,
                                      name: newAdminName,
                                      username: newAdminUser,
                                      password: newAdminPass,
                                      accessTabs: newAdminAccess,
                                    };
                                    if (typeof adminAccountsApi !== "undefined" && adminAccountsApi.update) {
                                      await adminAccountsApi.update(editingAdminId, updatedAdmin);
                                    }
                                    setAdminAccounts(
                                      adminAccounts.map((a) =>
                                        a.id === editingAdminId
                                          ? updatedAdmin
                                          : a,
                                      ),
                                    );
                                  } else {
                                    const newAdmin: AdminAccount = {
                                      id: Date.now().toString(),
                                      name: newAdminName,
                                      username: newAdminUser,
                                      password: newAdminPass,
                                      accessTabs: newAdminAccess,
                                    };
                                    if (typeof adminAccountsApi !== "undefined" && adminAccountsApi.create) {
                                      const res = await adminAccountsApi.create(newAdmin);
                                      if (res && res.id && res.id !== newAdmin.id) {
                                        newAdmin.id = res.id;
                                      }
                                    }
                                    setAdminAccounts([
                                      ...adminAccounts,
                                      newAdmin,
                                    ]);
                                  }
                                  setNewAdminName("");
                                  setNewAdminUser("");
                                  setNewAdminPass("");
                                  setNewAdminAccess([]);
                                  setEditingAdminId(null);
                                  setShowAdminAccountForm(false);
                                } catch (error) {
                                  console.error("Gagal simpan admin:", error);
                                  customAlert("Gagal menyimpan akun admin ke server.");
                                }
                              }}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                    Nama Admin
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={newAdminName}
                                    onChange={(e) =>
                                      setNewAdminName(e.target.value)
                                    }
                                    placeholder="Contoh: Admin 1"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                    Username Login
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={newAdminUser}
                                    onChange={(e) =>
                                      setNewAdminUser(e.target.value)
                                    }
                                    placeholder="admin_spv"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                                    Password
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={newAdminPass}
                                    onChange={(e) =>
                                      setNewAdminPass(e.target.value)
                                    }
                                    placeholder="Katasandi123"
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="mb-5">
                                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                                  Pilih Hak Akses Halaman (Centang fitur yang
                                  diperbolehkan):
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                  {[
                                    {
                                      id: "dashboard_utama",
                                      label: "Dashboard Utama",
                                    },
                                    {
                                      id: "absensi",
                                      label: "Calender Kerja Host",
                                    },
                                    {
                                      id: "rekap_gaji",
                                      label: "Absen & Payroll",
                                    },
                                    { id: "database", label: "Database Absen" },
                                    {
                                      id: "credentials",
                                      label: "Kredensial Host",
                                    },
                                    { id: "data_brand", label: "Data Brand" },
                                    {
                                      id: "reporting_brand",
                                      label: "Reporting Brand (Upload)",
                                    },
                                    {
                                      id: "invoice",
                                      label: "Invoice & Berkas",
                                    },
                                    {
                                      id: "leads",
                                      label: "Leads/Calon Client",
                                    },
                                    {
                                      id: "settings",
                                      label: "Platform & Shift",
                                    },
                                  ].map((tab) => (
                                    <label
                                      key={tab.id}
                                      className="flex items-center gap-2 p-2.5 bg-white border border-slate-100 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={newAdminAccess.includes(
                                          tab.id,
                                        )}
                                        onChange={(e) => {
                                          if (e.target.checked)
                                            setNewAdminAccess([
                                              ...newAdminAccess,
                                              tab.id,
                                            ]);
                                          else
                                            setNewAdminAccess(
                                              newAdminAccess.filter(
                                                (id) => id !== tab.id,
                                              ),
                                            );
                                        }}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                      />
                                      <span className="text-[11px] font-semibold text-slate-700">
                                        {tab.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-all border-0 shadow-sm cursor-pointer"
                                >
                                  {editingAdminId
                                    ? "Perbarui Akun Admin"
                                    : "Simpan Akun Admin"}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {adminAccounts.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {adminAccounts.map((ad) => (
                              <div
                                key={ad.id}
                                className="bg-white border text-left border-slate-200 rounded-xl p-5 shadow-sm relative"
                              >
                                <div className="absolute top-4 right-4 flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingAdminId(ad.id);
                                      setNewAdminName(ad.name);
                                      setNewAdminUser(ad.username);
                                      setNewAdminPass(ad.password);
                                      setNewAdminAccess(ad.accessTabs);
                                      setShowAdminAccountForm(true);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (
                                        window.confirm("Hapus akun admin ini?")
                                      ) {
                                        try {
                                          if (typeof adminAccountsApi !== "undefined" && adminAccountsApi.delete) {
                                            await adminAccountsApi.delete(ad.id);
                                          }
                                          setAdminAccounts(
                                            adminAccounts.filter(
                                              (a) => a.id !== ad.id,
                                            ),
                                          );
                                        } catch (error) {
                                          console.error("Gagal hapus admin:", error);
                                          customAlert("Gagal menghapus admin dari server.");
                                        }
                                      }
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors bg-transparent border-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <h5 className="text-sm font-black text-slate-800 mb-1">
                                  {ad.name}
                                </h5>
                                <p className="text-xs font-semibold font-mono text-indigo-600 mb-3">
                                  @{ad.username}
                                </p>

                                <div className="text-[10px] font-bold text-slate-500 mb-1.5 uppercase">
                                  Akses yang diberikan ({ad.accessTabs.length}):
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {ad.accessTabs.length === 0 ? (
                                    <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded font-medium">
                                      Tidak ada akses
                                    </span>
                                  ) : (
                                    ad.accessTabs.map((tab) => (
                                      <span
                                        key={tab}
                                        className="text-[9px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold"
                                      >
                                        {tab.replace(/_/g, " ")}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Belum ada akun admin tambahan.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================== SUBTAB: AKUN & KREDENSIAL HOST PRIVASI ==================== */}
                {operatorTab === "credentials" && (
                  <div
                    className="bg-white border border-purple-100 rounded-3xl p-6 shadow-sm space-y-6 animate-fadeIn"
                    id="operator_credentials_content"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-50 pb-4">
                      <div>
                        <h3 className="text-xl font-black text-purple-950 flex items-center gap-2">
                          <ShieldCheck className="w-6 h-6 text-purple-600" />
                          Manajemen Kredensial & Privasi Akun Host
                        </h3>
                        <p className="text-xs text-[#3c2f56]/80 mt-1 font-medium leading-relaxed">
                          Tambahkan host baru, edit profil (Nama, HP, Rekening
                          Bank), atau atur ulang username/password login mereka
                          secara real-time.
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

                    {/* Collapsible Add New Host Form */}
                    {showAddForm && (
                      <div
                        className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/60 space-y-4 animate-fadeIn"
                        id="add_host_form"
                      >
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200/60 pb-3 mb-4">
                          <UserPlus className="w-4 h-4" />
                          <span>Pendaftaran Host Agency Baru</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-medium">
                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Nama Lengkap Host{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={newHostName}
                              onChange={(e) => setNewHostName(e.target.value)}
                              placeholder="Misal: Amanda Putri"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Grup / Role Level
                            </label>
                            <select
                              value={newHostRole}
                              onChange={(e) => setNewHostRole(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow cursor-pointer"
                            >
                              <option value="Reguler Host">Reguler Host</option>
                              <option value="Back Up Host">Back Up Host</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Lokasi Studio / Kota
                            </label>
                            <select
                              value={newHostStudio}
                              onChange={(e) => setNewHostStudio(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow cursor-pointer"
                            >
                              {studios.length > 0 ? (
                                studios.map((std, i) => (
                                  <option
                                    key={std.id + "_" + i}
                                    value={std.location}
                                  >
                                    {std.location}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="Bandar Lampung">
                                    Bandar Lampung
                                  </option>
                                  <option value="Tanggamus">Tanggamus</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Username Akun Absen
                            </label>
                            <input
                              type="text"
                              value={newHostUser}
                              onChange={(e) => setNewHostUser(e.target.value)}
                              placeholder="Kosongkan untuk otomatis"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Password Akun login
                            </label>
                            <input
                              type="text"
                              value={newHostPass}
                              onChange={(e) => setNewHostPass(e.target.value)}
                              placeholder="Default: liva123"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Nomor HP
                            </label>
                            <input
                              type="text"
                              value={newHostPhone}
                              onChange={(e) => setNewHostPhone(e.target.value)}
                              placeholder="Opsional, misal: 0812345678"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              Nama Bank
                            </label>
                            <input
                              type="text"
                              value={newHostBankName}
                              onChange={(e) => setNewHostBankName(e.target.value)}
                              placeholder="Opsional, misal: BCA"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-slate-600 mb-1.5">
                              No Rekening
                            </label>
                            <input
                              type="text"
                              value={newHostBank}
                              onChange={(e) => setNewHostBank(e.target.value)}
                              placeholder="Opsional, misal: 123456789"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                            />
                          </div>
                        </div>

                        {!newHostName.trim() && (
                          <div className="text-[11px] text-red-500 px-1 mt-2">
                            * Nama Lengkap Host wajib diisi
                          </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 mt-4">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="bg-white hover:bg-slate-50 text-slate-600 font-medium px-4 py-2 rounded-lg text-xs border border-slate-200 transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!newHostName.trim()) return;
                              handleAddHost({
                                name: newHostName,
                                role: newHostRole,
                                studio: newHostStudio,
                                phone: newHostPhone.trim() || "-",
                                bankAccount: newHostBank.trim() || "-",
                                bankName: newHostBankName.trim() || "-",
                                username: newHostUser,
                                password: newHostPass,
                                customWorkingDaysTarget: undefined,
                              });
                              // Reset fields
                              setNewHostName("");
                              setNewHostRole("Reguler Host");
                              setNewHostStudio("Bandar Lampung");
                              setNewHostPhone("");
                              setNewHostBank("");
                              setNewHostBankName("");
                              setNewHostUser("");
                              setNewHostPass("");
                              setShowAddForm(false);
                            }}
                            className={`font-semibold px-5 py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer ${!newHostName.trim() ? "bg-indigo-300 text-white cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                            disabled={!newHostName.trim()}
                          >
                            Simpan Host
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80">
                          <tr className="text-left text-xs font-semibold text-slate-500">
                            <th className="px-6 py-4">Host</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Lokasi</th>
                            <th className="px-6 py-4">Kontak & Bank</th>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Password</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {hosts.map((h) => (
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

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800 font-semibold block mb-1">
                          Petunjuk Privasi Kredensial Agency
                        </strong>
                        Beritahukan username dan password di atas kepada masing-masing host agar mereka dapat melakukan absen masuk secara mandiri. Password bersifat transparan untuk mempermudah operator saat melakukan pemulihan akun.
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
      {!isOperatorLoggedIn && !loggedInClientBrandId && (
        <footer
          className="bg-white border-t border-purple-100 py-6 px-4 md:px-8 mt-auto flex flex-col md:flex-row justify-between w-full items-center gap-4 text-xs text-purple-500"
          id="system-footer-credits"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="font-bold font-mono text-purple-700">
              INTELLIGENCE PLATFORM DEPLOYED (UTC LOCALTIME)
            </span>
          </div>
          <div>
            {agencyLogoUrl ? (
              <img
                src={agencyLogoUrl}
                className="h-6 object-contain grayscale opacity-50"
              />
            ) : (
              <span className="font-medium">© 2026 Liva Agency.</span>
            )}{" "}
            <span className="font-medium">
              Dikembangkan secara khusus untuk manajemen kehadiran & payroll.
            </span>
          </div>
        </footer>
      )}

      {/* ==================== CUSTOM HIGH-POLISHED STATIC PORTAL CONFIRM MODAL ==================== */}
      {confirmModal && confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-[200] overflow-y-auto bg-purple-950/40 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6 sm:pt-[15vh] sm:pb-12 animate-fadeIn font-sans"
          id="custom_confirm_modal_portal"
        >
          <div className="bg-white rounded-2xl border border-purple-100 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp my-auto sm:my-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl flex-shrink-0 ${confirmModal.type === "danger" ? "bg-red-50 text-red-600" : "bg-purple-50 text-purple-600"}`}
              >
                {confirmModal.type === "danger" ? (
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
                  confirmModal.type === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-purple-600 hover:bg-purple-700"
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

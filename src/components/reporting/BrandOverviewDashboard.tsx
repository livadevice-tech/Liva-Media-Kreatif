import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  DollarSign,
  Package,
  ClipboardList,
  Calculator,
  Users,
  Eye,
  EyeOff,
  MousePointerClick,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Tag,
  Tv,
  ShoppingCart,
  SlidersHorizontal,
  Calendar,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type {
  LiveReportChartData,
  LiveReportSummaryStats,
} from "./liveReportSummaryTypes";
import type { BrandDashboardSettings } from "../../types";
import {
  aggregateChartData,
  type ChartGranularity,
} from "../../shared/utils/chartDataAggregation";

interface BrandOverviewDashboardProps {
  stats: LiveReportSummaryStats;
  chartData: LiveReportChartData;
  periodLabel: string;
  platform: string;
  isShopee: boolean;
  brandName: string;
  brandId?: string;
  brandDashboardSettings?: BrandDashboardSettings;
  latestActivity?: string;
  hasData?: boolean;
  chartSelectedMetrics?: string[];
  onChartSelectedMetricsChange?: (metrics: string[]) => void;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
}

function formatCompactNumber(val: number): string {
  if (!val) return "0";
  return Number(val).toLocaleString("id-ID");
}

function formatDurationText(sec: number): string {
  const hours = Math.floor((sec || 0) / 3600);
  const mins = Math.round(((sec || 0) % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function calcGrowth(curr: number, prev: number): { pct: number; isUp: boolean } {
  if (!prev) {
    if (curr > 0) return { pct: 100, isUp: true };
    return { pct: 0, isUp: true };
  }
  const diff = curr - prev;
  const pct = Math.abs((diff / prev) * 100);
  return { pct: Number(pct.toFixed(1)), isUp: diff >= 0 };
}

// ── Smooth SVG Sparkline Generator ──────────────────────────────────────────
function MiniSparkline({
  data,
  color,
  isPositive,
}: {
  data: number[];
  color: string;
  isPositive?: boolean;
}) {
  const width = 64;
  const height = 28;
  const padding = 3;

  const pathD = useMemo(() => {
    // If not enough points or flat zero, generate an organic smooth wave
    const valid = data && data.length >= 2 && data.some((v) => v > 0);
    if (!valid) {
      const up = isPositive !== false;
      if (up) {
        return `M 3 22 Q 18 18, 30 15 T 48 10 T 61 6`;
      }
      return `M 3 8 Q 18 10, 30 14 T 48 19 T 61 23`;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max === min ? 1 : max - min;

    const points = data.map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((val - min) / range) * (height - 2 * padding);
      return { x, y };
    });

    // Build smooth bezier curve
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx.toFixed(1)} ${p0.y.toFixed(1)}, ${mx.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return d;
  }, [data, isPositive]);

  return (
    <svg
      className="w-16 h-7 shrink-0 overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Sale Metric Card Component ──────────────────────────────────────────────
interface SaleCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  value: string;
  growth: { pct: number; isUp: boolean };
  sparklineData: number[];
  sparklineColor: string;
}

function SaleCard({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  growth,
  sparklineData,
  sparklineColor,
}: SaleCardProps) {
  return (
    <div className="group relative flex flex-col rounded-[20px] border border-slate-200/70 bg-white p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top: Icon & Title with fixed height to ensure baseline alignment */}
      <div className="flex h-10 items-center gap-3 min-w-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
        <span
          className="text-xs font-bold text-slate-500 truncate min-w-0"
          title={title}
        >
          {title}
        </span>
      </div>

      {/* Middle: Big Value - strictly aligned to a consistent vertical baseline */}
      <div className="mt-3 mb-2">
        <div className="text-[20px] xl:text-[22px] font-black tracking-tight text-slate-900 leading-tight truncate">
          {value}
        </div>
      </div>

      {/* Bottom: Growth vs Prev & Sparkline - pinned to bottom */}
      <div className="mt-auto pt-1 flex items-end justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              growth.isUp ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {growth.isUp ? (
              <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-3 w-3 shrink-0" strokeWidth={2.5} />
            )}
            <span>
              {growth.isUp ? "+" : "-"}
              {growth.pct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
            vs periode sebelumnya
          </span>
        </div>

        <MiniSparkline
          data={sparklineData}
          color={sparklineColor}
          isPositive={growth.isUp}
        />
      </div>
    </div>
  );
}

// ── Engagement Metric Card Component ────────────────────────────────────────
interface EngagementCardProps {
  label: string;
  value: string;
  growth: { pct: number; isUp: boolean };
  sparklineData: number[];
  sparklineColor: string;
}

function EngagementCard({
  label,
  value,
  growth,
  sparklineData,
  sparklineColor,
}: EngagementCardProps) {
  return (
    <div className="flex flex-col rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs">
      <div>
        <p className="text-[12px] font-semibold text-slate-500 truncate" title={label}>
          {label}
        </p>
        <p className="mt-1 text-[20px] font-black text-slate-900 leading-tight truncate">
          {value}
        </p>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
            growth.isUp ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {growth.isUp ? (
            <TrendingUp className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="h-3 w-3 shrink-0" strokeWidth={2.5} />
          )}
          {growth.pct}%
        </span>
        <MiniSparkline
          data={sparklineData}
          color={sparklineColor}
          isPositive={growth.isUp}
        />
      </div>
    </div>
  );
}

export function BrandOverviewDashboard({
  stats,
  chartData,
  periodLabel,
  platform,
  isShopee,
  brandName,
  brandId,
  brandDashboardSettings,
  latestActivity,
  hasData = true,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: BrandOverviewDashboardProps) {
  const [internalSelectedMetrics, setInternalSelectedMetrics] = useState<string[]>([
    "gmv",
    "orders",
    "penonton",
  ]);
  const activeMetrics =
    chartSelectedMetrics && chartSelectedMetrics.length > 0
      ? chartSelectedMetrics
      : internalSelectedMetrics;
  const setActiveMetrics = (newMetrics: string[]) => {
    if (onChartSelectedMetricsChange) {
      onChartSelectedMetricsChange(newMetrics);
    }
    setInternalSelectedMetrics(newMetrics);
  };

  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);
  const [isMetricMenuOpen, setIsMetricMenuOpen] = useState(false);
  const chartControlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chartControlsRef.current &&
        !chartControlsRef.current.contains(event.target as Node)
      ) {
        setIsGranularityMenuOpen(false);
        setIsMetricMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isDurationVisible, setIsDurationVisible] = useState(true);

  const hm = brandDashboardSettings?.hiddenMetrics || [];
  const isMetricHidden = (id: string) =>
    hm.includes(isShopee ? `shopee_live_${id}` : `tiktok_live_${id}`);

  // Metric Growths
  const gmvGrowth = calcGrowth(stats.totalGmvDb, stats.pTotalGmvDb);
  const itemsSoldGrowth = calcGrowth(stats.totalItemsSoldDb, stats.pTotalItemsSoldDb);
  const ordersGrowth = calcGrowth(stats.totalOrdersDb, stats.pTotalOrdersDb);
  const aovGrowth = calcGrowth(stats.avgAovDb, stats.pAvgAovDb);
  const buyersGrowth = calcGrowth(stats.totalBuyersDb, stats.pTotalBuyersDb);
  const productImpressionsGrowth = calcGrowth(
    stats.totalDbProductImpressions,
    stats.pTotalDbProductImpressions
  );
  const clicksGrowth = calcGrowth(stats.totalClicksDb, stats.pTotalClicksDb);
  const gmvPerHourGrowth = calcGrowth(stats.gmvPerHour, stats.pGmvPerHour);
  const viewerActiveGrowth = calcGrowth(stats.totalDbLiveVisits, stats.pTotalDbLiveVisits);
  const peakViewersGrowth = calcGrowth(stats.totalPeakViewersDb, stats.pTotalPeakViewersDb);
  const voucherClaimGrowth = calcGrowth(stats.totalShopVouchersDb, stats.pTotalShopVouchersDb);

  // Engagement & Funnel Stats
  const liveImpressionsValue = isShopee
    ? stats.totalPenontonDb
    : stats.totalDbImpressions || stats.totalPenontonDb;
  const pLiveImpressionsValue = isShopee
    ? stats.pTotalPenontonDb
    : stats.pTotalDbImpressions || stats.pTotalPenontonDb;
  const impressionsGrowth = calcGrowth(liveImpressionsValue, pLiveImpressionsValue);

  const viewersGrowth = calcGrowth(stats.totalPenontonDb, stats.pTotalPenontonDb);
  const likesGrowth = calcGrowth(stats.totalLikesDb, stats.pTotalLikesDb);
  const commentsGrowth = calcGrowth(stats.totalCommentsDb, stats.pTotalCommentsDb);
  const sharesGrowth = calcGrowth(stats.totalSharesDb, stats.pTotalSharesDb);
  const followersGrowth = calcGrowth(stats.totalFollowersDb, stats.pTotalFollowersDb);
  const avgDurationGrowth = calcGrowth(
    stats.avgViewDurationDb,
    stats.pAvgViewDurationDb
  );

  // Conversion Rate
  const conversionRate = useMemo(() => {
    if (isShopee && stats.conversionRateShopee) return stats.conversionRateShopee;
    if (stats.totalPenontonDb > 0 && stats.totalOrdersDb > 0) {
      return (stats.totalOrdersDb / stats.totalPenontonDb) * 100;
    }
    return 0;
  }, [isShopee, stats.conversionRateShopee, stats.totalOrdersDb, stats.totalPenontonDb]);

  const pConversionRate = useMemo(() => {
    if (isShopee && stats.pConversionRateShopee) return stats.pConversionRateShopee;
    if (stats.pTotalPenontonDb > 0 && stats.pTotalOrdersDb > 0) {
      return (stats.pTotalOrdersDb / stats.pTotalPenontonDb) * 100;
    }
    return 0;
  }, [isShopee, stats.pConversionRateShopee, stats.pTotalOrdersDb, stats.pTotalPenontonDb]);

  const conversionRateGrowth = calcGrowth(conversionRate, pConversionRate);

  // ERR % (Engagement Rate)
  const errRate = useMemo(() => {
    const totalEngagement =
      stats.totalLikesDb + stats.totalCommentsDb + stats.totalSharesDb;
    const baseViews = liveImpressionsValue || stats.totalPenontonDb || 0;
    return baseViews > 0 ? (totalEngagement / baseViews) * 100 : 0;
  }, [liveImpressionsValue, stats.totalCommentsDb, stats.totalLikesDb, stats.totalPenontonDb, stats.totalSharesDb]);

  const pErrRate = useMemo(() => {
    const pTotalEngagement =
      stats.pTotalLikesDb + stats.pTotalCommentsDb + stats.pTotalSharesDb;
    const pBaseViews = pLiveImpressionsValue || stats.pTotalPenontonDb || 0;
    return pBaseViews > 0 ? (pTotalEngagement / pBaseViews) * 100 : 0;
  }, [pLiveImpressionsValue, stats.pTotalCommentsDb, stats.pTotalLikesDb, stats.pTotalPenontonDb, stats.pTotalSharesDb]);

  const errRateGrowth = calcGrowth(errRate, pErrRate);

  // ── Sparkline Series Extracted from chartData ──────────────────────────────
  const gmvSeries = useMemo(() => chartData.map((d) => d.gmv || 0), [chartData]);
  const itemSoldSeries = useMemo(() => chartData.map((d) => d.itemsSold || 0), [chartData]);
  const ordersSeries = useMemo(() => chartData.map((d) => d.orders || 0), [chartData]);
  const aovSeries = useMemo(
    () =>
      chartData.map((d) => (d.orders > 0 ? Math.round(d.gmv / d.orders) : 0)),
    [chartData]
  );
  const buyersSeries = useMemo(() => chartData.map((d) => d.buyers || 0), [chartData]);
  const productImpressionsSeries = useMemo(
    () => chartData.map((d) => d.productImpressions || 0),
    [chartData]
  );
  const clicksSeries = useMemo(() => chartData.map((d) => d.clicks || 0), [chartData]);
  const gmvPerHourSeries = useMemo(
    () =>
      chartData.map((d) =>
        d.duration > 0 ? Math.round((d.gmv / d.duration) * 3600) : 0
      ),
    [chartData]
  );
  const impressionsSeries = useMemo(
    () => chartData.map((d) => d.impressions || d.views || 0),
    [chartData]
  );
  const viewersSeries = useMemo(
    () => chartData.map((d) => d.views || d.penonton || 0),
    [chartData]
  );
  const likesSeries = useMemo(() => chartData.map((d) => d.likes || 0), [chartData]);
  const commentsSeries = useMemo(() => chartData.map((d) => d.comments || 0), [chartData]);
  const sharesSeries = useMemo(() => chartData.map((d) => d.shares || 0), [chartData]);
  const followersSeries = useMemo(() => chartData.map((d) => d.followers || 0), [chartData]);
  const durationSeries = useMemo(
    () =>
      chartData.map((d) =>
        d.sessionsCount > 0
          ? Math.round(d.avgViewDurationSum / d.sessionsCount)
          : 0
      ),
    [chartData]
  );
  const peakViewersSeries = useMemo(
    () => chartData.map((d) => d.peakViewers || 0),
    [chartData]
  );
  const shopVouchersSeries = useMemo(
    () => chartData.map((d) => d.shopVouchers || 0),
    [chartData]
  );
  const liveVisitsSeries = useMemo(
    () => chartData.map((d) => d.liveVisits || 0),
    [chartData]
  );
  const errSeries = useMemo(
    () =>
      chartData.map((d) => {
        const eng = (d.likes || 0) + (d.comments || 0) + (d.shares || 0);
        const v = d.impressions || d.views || 1;
        return Number(((eng / v) * 100).toFixed(2));
      }),
    [chartData]
  );

  const availableMetricOptions = useMemo(() => {
    const isPlatformShopee = isShopee;
    const list: Array<{
      key: string;
      label: string;
      category: "Sale Metrics" | "Engagement Metrics";
      color: string;
      yAxisId: "left" | "right";
      platforms: ("tiktok" | "shopee")[];
      formatValue: (val: number) => string;
    }> = [
      // Sale Metrics
      {
        key: "gmv",
        label: "GMV",
        category: "Sale Metrics",
        color: "#10b981",
        yAxisId: "left",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => formatCurrency(v),
      },
      {
        key: "orders",
        label: isPlatformShopee ? "Purchase" : "Orders",
        category: "Sale Metrics",
        color: "#6366f1",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} ${isPlatformShopee ? "pembelian" : "pesanan"}`,
      },
      {
        key: "itemsSold",
        label: "Item Sold",
        category: "Sale Metrics",
        color: "#f59e0b",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} item`,
      },
      {
        key: "clicks",
        label: isPlatformShopee ? "Add To Cart" : "Product Clicks",
        category: "Sale Metrics",
        color: "#0d9488",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} klik`,
      },
      {
        key: "buyers",
        label: "Customer",
        category: "Sale Metrics",
        color: "#db2777",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} pembeli`,
      },
      {
        key: "gmvPerHour",
        label: "GMV/Hours",
        category: "Sale Metrics",
        color: "#8b5cf6",
        yAxisId: "left",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCurrency(v)}/jam`,
      },
      {
        key: "durationHours",
        label: "Durasi Live",
        category: "Sale Metrics",
        color: "#a855f7",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${v} jam`,
      },
      {
        key: "productImpressions",
        label: "Product Impressions",
        category: "Sale Metrics",
        color: "#ea580c",
        yAxisId: "right",
        platforms: ["tiktok"],
        formatValue: (v) => `${formatCompactNumber(v)} tayangan`,
      },
      {
        key: "conversionRate",
        label: "Conversion Rate",
        category: "Sale Metrics",
        color: "#06b6d4",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${Number(v).toFixed(2)}%`,
      },

      // Engagement Metrics
      {
        key: "penonton",
        label: isPlatformShopee ? "Views" : "Live Viewer",
        category: "Engagement Metrics",
        color: "#0284c7",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} penonton`,
      },
      {
        key: "impressions",
        label: "Live Impressions",
        category: "Engagement Metrics",
        color: "#38bdf8",
        yAxisId: "right",
        platforms: ["tiktok"],
        formatValue: (v) => `${formatCompactNumber(v)} tayangan`,
      },
      {
        key: "likes",
        label: "Likes",
        category: "Engagement Metrics",
        color: "#ef4444",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} likes`,
      },
      {
        key: "comments",
        label: "Comments",
        category: "Engagement Metrics",
        color: "#eab308",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} komen`,
      },
      {
        key: "shares",
        label: "Shares",
        category: "Engagement Metrics",
        color: "#84cc16",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} share`,
      },
      {
        key: "followers",
        label: "New Followers",
        category: "Engagement Metrics",
        color: "#d946ef",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${formatCompactNumber(v)} followers`,
      },
      {
        key: "err",
        label: "ERR %",
        category: "Engagement Metrics",
        color: "#14b8a6",
        yAxisId: "right",
        platforms: ["tiktok", "shopee"],
        formatValue: (v) => `${Number(v).toFixed(2)}%`,
      },
    ];

    const currentPlatform = isShopee ? "shopee" : "tiktok";
    return list.filter((m) => m.platforms.includes(currentPlatform));
  }, [isShopee]);

  const isMetricActive = (key: string) => {
    if (activeMetrics.includes(key)) return true;
    if (key === "penonton" && (activeMetrics.includes("views") || activeMetrics.includes("penonton"))) return true;
    if (key === "views" && (activeMetrics.includes("views") || activeMetrics.includes("penonton"))) return true;
    return false;
  };

  const activeMetricOptions = useMemo(() => {
    return availableMetricOptions.filter((opt) => isMetricActive(opt.key));
  }, [availableMetricOptions, activeMetrics]);

  const saleMetricOptions = useMemo(() => {
    return availableMetricOptions.filter((opt) => opt.category === "Sale Metrics");
  }, [availableMetricOptions]);

  const engagementMetricOptions = useMemo(() => {
    return availableMetricOptions.filter((opt) => opt.category === "Engagement Metrics");
  }, [availableMetricOptions]);

  const toggleMetric = (key: string) => {
    const isCurrentlyActive = isMetricActive(key);
    if (isCurrentlyActive) {
      if (activeMetricOptions.length <= 1) {
        return;
      }
      const next = activeMetrics.filter(
        (m) =>
          m !== key &&
          !(key === "penonton" && m === "views") &&
          !(key === "views" && m === "penonton")
      );
      setActiveMetrics(next);
    } else {
      setActiveMetrics([...activeMetrics, key]);
    }
  };

  const hasLeftAxis = useMemo(() => {
    return activeMetricOptions.some((opt) => opt.yAxisId === "left");
  }, [activeMetricOptions]);

  const hasRightAxis = useMemo(() => {
    return activeMetricOptions.some((opt) => opt.yAxisId === "right");
  }, [activeMetricOptions]);

  const dynamicChartTitle = useMemo(() => {
    if (activeMetricOptions.length === 0) return "Tren Grafik Live";
    const labels = activeMetricOptions.map((o) => o.label);
    if (labels.length === 1) return `Tren ${labels[0]}`;
    if (labels.length === 2) return `Tren ${labels[0]} & ${labels[1]}`;
    if (labels.length === 3) return `Tren ${labels[0]}, ${labels[1]} & ${labels[2]}`;
    return `Tren ${labels[0]}, ${labels[1]} (+${labels.length - 2} lainnya)`;
  }, [activeMetricOptions]);

  // Aggregated Chart Data based on selected granularity (Harian/Mingguan/Bulanan)
  const visibleChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    const aggregated = aggregateChartData(
      chartData,
      granularity,
      [
        "gmv", "orders", "itemsSold", "clicks", "penonton", "views", "buyers",
        "likes", "comments", "shares", "followers", "impressions",
        "peakViewers", "shopVouchers", "liveVisits", "sessionsCount",
        "duration", "avgViewDurationSum", "productImpressions"
      ]
    );

    return aggregated.map((point: any) => {
      const gmv = point.gmv || 0;
      const orders = point.orders || 0;
      const itemsSold = point.itemsSold || 0;
      const clicks = point.clicks || 0;
      const penonton = point.penonton || point.views || 0;
      const views = point.views || point.penonton || 0;
      const buyers = point.buyers || 0;
      const likes = point.likes || 0;
      const comments = point.comments || 0;
      const shares = point.shares || 0;
      const followers = point.followers || 0;
      const impressions = point.impressions || (isShopee ? penonton : 0);
      const productImpressions = point.productImpressions || 0;
      const duration = point.duration || 0;
      const durationHours = Number((duration / 3600).toFixed(1));
      const sessionsCount = point.sessionsCount || 0;
      const avgViewDurationSum = point.avgViewDurationSum || 0;
      const liveVisits = point.liveVisits || 0;

      let conversionRate = 0;
      if (clicks > 0) conversionRate = (orders / clicks) * 100;
      else if (isShopee && liveVisits > 0) conversionRate = (orders / liveVisits) * 100;
      else if (!isShopee && productImpressions > 0) conversionRate = (orders / productImpressions) * 100;
      else if (impressions > 0) conversionRate = (orders / impressions) * 100;

      const gmvPerHour = duration > 0 ? gmv / (duration / 3600) : 0;
      const err = impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0;

      return {
        ...point,
        gmv,
        orders,
        itemsSold,
        clicks,
        penonton,
        views,
        buyers,
        likes,
        comments,
        shares,
        followers,
        impressions,
        productImpressions,
        duration,
        durationHours,
        conversionRate,
        gmvPerHour,
        err,
      };
    });
  }, [chartData, granularity, isShopee]);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-slate-300 rounded-[22px] bg-slate-50 text-center animate-fadeIn my-6">
        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 border border-slate-100">
          <Package className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Belum Ada Data Sesi
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Unggah file Excel performa live brand {brandName} untuk menampilkan
          dashboard ringkasan eksekutif.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── 1. SALE METRICS SECTION ──────────────────────────────────────── */}
      <section className="space-y-3.5">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-black text-slate-900 text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[#5600e0] font-black text-xs">
                $
              </span>
              <span>Sale Metrics</span>
            </div>

            {/* Total Duration Badge */}
            {!isMetricHidden("duration_hours") && (
              <div className="flex items-center gap-1">
                {isDurationVisible ? (
                  <>
                    <span className="bg-[#5600e0]/10 text-[#5600e0] px-2.5 py-0.5 rounded-full font-bold tracking-normal text-[11px] lowercase">
                      {formatDurationText(stats.totalDbDuration || 0)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDurationVisible(false)}
                      className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors cursor-pointer"
                      title="Sembunyikan durasi"
                    >
                      <EyeOff size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDurationVisible(true)}
                    className="text-[#5600e0] hover:bg-[#5600e0]/10 p-1 rounded-full transition-colors cursor-pointer"
                    title="Tampilkan durasi"
                  >
                    <Eye size={14} />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {latestActivity
                  ? `Last updated ${latestActivity}`
                  : "Last updated baru saja"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </span>
            <span className="text-slate-500 font-medium">
              Periode aktif:{" "}
              <strong className="text-slate-700 font-bold">
                {periodLabel || "Semua Waktu"}
              </strong>
            </span>
          </div>
        </div>

        {/* 8 Metric Cards Grid (2 rows x 4 cols on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: GMV */}
          <SaleCard
            icon={<DollarSign className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title="GMV"
            value={formatCurrency(stats.totalGmvDb)}
            growth={gmvGrowth}
            sparklineData={gmvSeries}
            sparklineColor="#10b981"
          />

          {/* Card 2: Item Sold */}
          <SaleCard
            icon={<Package className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Item Sold"
            value={formatCompactNumber(stats.totalItemsSoldDb)}
            growth={itemsSoldGrowth}
            sparklineData={itemSoldSeries}
            sparklineColor="#3b82f6"
          />

          {/* Card 3: Orders */}
          <SaleCard
            icon={<ClipboardList className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="Orders"
            value={formatCompactNumber(stats.totalOrdersDb)}
            growth={ordersGrowth}
            sparklineData={ordersSeries}
            sparklineColor="#8b5cf6"
          />

          {/* Card 4: AOV */}
          <SaleCard
            icon={<Calculator className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            title="AOV"
            value={formatCurrency(
              stats.avgAovDb ||
                (stats.totalOrdersDb > 0
                  ? Math.round(stats.totalGmvDb / stats.totalOrdersDb)
                  : 0)
            )}
            growth={aovGrowth}
            sparklineData={aovSeries}
            sparklineColor="#f43f5e"
          />

          {/* Row 2: Card 5, 6, 7 */}
          {isShopee ? (
            <>
              {/* Card 5 (Shopee): Add to Cart */}
              <SaleCard
                icon={<ShoppingCart className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                title="Add to Cart"
                value={formatCompactNumber(stats.totalClicksDb)}
                growth={clicksGrowth}
                sparklineData={clicksSeries}
                sparklineColor="#f59e0b"
              />

              {/* Card 6 (Shopee): Avg. View Duration */}
              <SaleCard
                icon={<TrendingUp className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
                title="Avg. View Duration"
                value={
                  stats.avgViewDurationDb
                    ? `${stats.avgViewDurationDb.toFixed(1)}s`
                    : "0s"
                }
                growth={avgDurationGrowth}
                sparklineData={durationSeries}
                sparklineColor="#6366f1"
              />

              {/* Card 7 (Shopee): Viewer Active */}
              <SaleCard
                icon={<Users className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-cyan-50"
                iconColor="text-cyan-600"
                title="Viewer Active"
                value={formatCompactNumber(stats.totalDbLiveVisits)}
                growth={viewerActiveGrowth}
                sparklineData={liveVisitsSeries}
                sparklineColor="#06b6d4"
              />
            </>
          ) : (
            <>
              {/* Card 5 (TikTok): Customer */}
              <SaleCard
                icon={<Users className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                title="Customer"
                value={formatCompactNumber(stats.totalBuyersDb)}
                growth={buyersGrowth}
                sparklineData={buyersSeries}
                sparklineColor="#8b5cf6"
              />

              {/* Card 6 (TikTok): Product Impressions */}
              <SaleCard
                icon={<Eye className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-orange-50"
                iconColor="text-orange-600"
                title="Product Impressions"
                value={formatCompactNumber(stats.totalDbProductImpressions)}
                growth={productImpressionsGrowth}
                sparklineData={productImpressionsSeries}
                sparklineColor="#f97316"
              />

              {/* Card 7 (TikTok): Product Clicks */}
              <SaleCard
                icon={<MousePointerClick className="h-5 w-5" strokeWidth={2.5} />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                title="Product Clicks"
                value={formatCompactNumber(stats.totalClicksDb || stats.totalDbClicks)}
                growth={clicksGrowth}
                sparklineData={clicksSeries}
                sparklineColor="#10b981"
              />
            </>
          )}

          {/* Card 8: GMV/Hours */}
          <SaleCard
            icon={<Clock className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="GMV/Hours"
            value={formatCurrency(stats.gmvPerHour)}
            growth={gmvPerHourGrowth}
            sparklineData={gmvPerHourSeries}
            sparklineColor="#f43f5e"
          />
        </div>
      </section>

      {/* ── 2. MIDDLE SECTION: CHART (FULL WIDTH) ───────────────────────── */}
      <section>
        {/* Dynamic Chart with Custom Metrics & Timeframe Granularity */}
        <div className="w-full rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {dynamicChartTitle}
              </h3>
              <span className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {periodLabel}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap" ref={chartControlsRef}>
              {/* Dynamic Legend */}
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold flex-wrap">
                {activeMetricOptions.map((opt) => (
                  <span
                    key={opt.key}
                    className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-50/80 px-2 py-0.5 rounded-md border border-slate-100"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </span>
                ))}
              </div>

              {/* Custom Metriks Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsMetricMenuOpen(!isMetricMenuOpen);
                    setIsGranularityMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isMetricMenuOpen
                      ? "border-[#5600e0] bg-purple-50 text-[#5600e0]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                  <span>Custom Metriks ({activeMetricOptions.length})</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isMetricMenuOpen ? "rotate-180 text-[#5600e0]" : ""
                    }`}
                  />
                </button>

                {isMetricMenuOpen && (
                  <div className="absolute right-0 top-full z-40 mt-1.5 w-64 max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xl animate-fadeIn custom-scrollbar">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                      <span>Pilih Metriks Grafik</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                        {activeMetricOptions.length} aktif
                      </span>
                    </div>

                    {/* Sale Metrics */}
                    <div className="mb-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Sale Metrics
                      </div>
                      <div className="space-y-0.5">
                        {saleMetricOptions.map((opt) => {
                          const isChecked = isMetricActive(opt.key);
                          return (
                            <label
                              key={opt.key}
                              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: opt.color }}
                                />
                                <span
                                  className={`text-xs ${
                                    isChecked ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMetric(opt.key)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#5600e0] focus:ring-[#5600e0] cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Engagement Metrics */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Engagement Metrics
                      </div>
                      <div className="space-y-0.5">
                        {engagementMetricOptions.map((opt) => {
                          const isChecked = isMetricActive(opt.key);
                          return (
                            <label
                              key={opt.key}
                              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: opt.color }}
                                />
                                <span
                                  className={`text-xs ${
                                    isChecked ? "font-bold text-slate-900" : "font-medium text-slate-600"
                                  }`}
                                >
                                  {opt.label}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMetric(opt.key)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-[#5600e0] focus:ring-[#5600e0] cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Granularity Dropdown (Harian / Mingguan / Bulanan) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsGranularityMenuOpen(!isGranularityMenuOpen);
                    setIsMetricMenuOpen(false);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    isGranularityMenuOpen
                      ? "border-[#5600e0] bg-purple-50 text-[#5600e0]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    {granularity === "daily"
                      ? "Harian"
                      : granularity === "weekly"
                      ? "Mingguan"
                      : "Bulanan"}
                  </span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                      isGranularityMenuOpen ? "rotate-180 text-[#5600e0]" : ""
                    }`}
                  />
                </button>

                {isGranularityMenuOpen && (
                  <div className="absolute right-0 top-full z-40 mt-1.5 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-fadeIn">
                    {[
                      { value: "daily", label: "Harian" },
                      { value: "weekly", label: "Mingguan" },
                      { value: "monthly", label: "Bulanan" },
                    ].map((item) => {
                      const isSelected = granularity === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setGranularity(item.value as ChartGranularity);
                            setIsGranularityMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-purple-50 text-[#5600e0]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-[#5600e0]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[280px] w-full">
            {visibleChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={visibleChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: "#f1f5f9" }}
                    tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  />
                  {/* Left Y Axis for Currency (GMV, GMV/Hours) */}
                  {hasLeftAxis && (
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(val) => {
                        if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
                        if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return `${val}`;
                      }}
                    />
                  )}
                  {/* Right Y Axis for Counts/Quantities */}
                  {hasRightAxis && (
                    <YAxis
                      yAxisId="right"
                      orientation={hasLeftAxis ? "right" : "left"}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return `${val}`;
                      }}
                    />
                  )}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataPt = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xl text-xs space-y-1.5 min-w-[190px] z-50">
                            <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center justify-between">
                              <span>{dataPt.displayDate || dataPt.date}</span>
                              <span className="text-[10px] font-semibold text-slate-400 capitalize">
                                {granularity === "daily" ? "Harian" : granularity === "weekly" ? "Mingguan" : "Bulanan"}
                              </span>
                            </p>
                            {activeMetricOptions.map((opt) => {
                              const val = dataPt[opt.key] ?? dataPt[opt.key === "penonton" ? "views" : opt.key] ?? 0;
                              return (
                                <p
                                  key={opt.key}
                                  className="flex items-center justify-between gap-4 font-semibold text-slate-700"
                                >
                                  <span className="flex items-center gap-1.5 text-slate-600">
                                    <span
                                      className="h-2 w-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: opt.color }}
                                    />
                                    <span>{opt.label}:</span>
                                  </span>
                                  <strong className="text-slate-900 font-bold">
                                    {opt.formatValue ? opt.formatValue(val) : formatCompactNumber(val)}
                                  </strong>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {activeMetricOptions.map((opt) => (
                    <Line
                      key={opt.key}
                      yAxisId={opt.yAxisId === "left" && hasLeftAxis ? "left" : "right"}
                      type="monotone"
                      dataKey={opt.key}
                      name={opt.label}
                      stroke={opt.color}
                      strokeWidth={2.8}
                      dot={visibleChartData.length === 1 ? { r: 4, strokeWidth: 2, fill: opt.color } : false}
                      activeDot={{ r: 5, fill: opt.color, stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                Tidak ada data grafik untuk periode ini
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. ENGAGEMENT METRICS SECTION ─────────────────────────────────── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-black text-slate-900 text-base">
            <Users className="h-5 w-5 text-[#5600e0]" />
            <span>{isShopee ? "Engagement & Customer Metrics" : "Engagement Metrics"}</span>
          </div>

          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <span>Harian</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 8 Engagement Cards: 2 rows of 4 cards on desktop (4 atas, 4 bawah) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          {isShopee ? (
            <>
              {/* Card 1 (Shopee): Views */}
              <EngagementCard
                label="Views"
                value={formatCompactNumber(stats.totalPenontonDb || liveImpressionsValue)}
                growth={viewersGrowth}
                sparklineData={viewersSeries}
                sparklineColor="#10b981"
              />

              {/* Card 2 (Shopee): Peak Viewer */}
              <EngagementCard
                label="Peak Viewer"
                value={formatCompactNumber(stats.totalPeakViewersDb)}
                growth={peakViewersGrowth}
                sparklineData={peakViewersSeries}
                sparklineColor="#06b6d4"
              />

              {/* Card 3 (Shopee): Voucher Claim */}
              <EngagementCard
                label="Voucher Claim"
                value={formatCompactNumber(stats.totalShopVouchersDb)}
                growth={voucherClaimGrowth}
                sparklineData={shopVouchersSeries}
                sparklineColor="#f59e0b"
              />

              {/* Card 4 (Shopee): Customer */}
              <EngagementCard
                label="Customer"
                value={formatCompactNumber(stats.totalBuyersDb)}
                growth={buyersGrowth}
                sparklineData={buyersSeries}
                sparklineColor="#8b5cf6"
              />

              {/* Card 5 (Shopee): Likes */}
              <EngagementCard
                label="Likes"
                value={formatCompactNumber(stats.totalLikesDb)}
                growth={likesGrowth}
                sparklineData={likesSeries}
                sparklineColor="#ec4899"
              />

              {/* Card 6 (Shopee): Comments */}
              <EngagementCard
                label="Comments"
                value={formatCompactNumber(stats.totalCommentsDb)}
                growth={commentsGrowth}
                sparklineData={commentsSeries}
                sparklineColor="#3b82f6"
              />

              {/* Card 7 (Shopee): Shares */}
              <EngagementCard
                label="Shares"
                value={formatCompactNumber(stats.totalSharesDb)}
                growth={sharesGrowth}
                sparklineData={sharesSeries}
                sparklineColor="#f43f5e"
              />

              {/* Card 8 (Shopee): ERR % */}
              <EngagementCard
                label="ERR %"
                value={`${errRate.toFixed(2)}%`}
                growth={errRateGrowth}
                sparklineData={errSeries}
                sparklineColor="#10b981"
              />
            </>
          ) : (
            <>
              {/* Card 1 (TikTok): Live Impressions */}
              <EngagementCard
                label="Live Impressions"
                value={formatCompactNumber(liveImpressionsValue)}
                growth={impressionsGrowth}
                sparklineData={impressionsSeries}
                sparklineColor={impressionsGrowth.isUp ? "#10b981" : "#f43f5e"}
              />

              {/* Card 2 (TikTok): Viewer */}
              <EngagementCard
                label="Viewer"
                value={formatCompactNumber(stats.totalPenontonDb)}
                growth={viewersGrowth}
                sparklineData={viewersSeries}
                sparklineColor="#10b981"
              />

              {/* Card 3 (TikTok): Likes */}
              <EngagementCard
                label="Likes"
                value={formatCompactNumber(stats.totalLikesDb)}
                growth={likesGrowth}
                sparklineData={likesSeries}
                sparklineColor="#8b5cf6"
              />

              {/* Card 4 (TikTok): Comments */}
              <EngagementCard
                label="Comments"
                value={formatCompactNumber(stats.totalCommentsDb)}
                growth={commentsGrowth}
                sparklineData={commentsSeries}
                sparklineColor="#3b82f6"
              />

              {/* Card 5 (TikTok): Shares */}
              <EngagementCard
                label="Shares"
                value={formatCompactNumber(stats.totalSharesDb)}
                growth={sharesGrowth}
                sparklineData={sharesSeries}
                sparklineColor="#f43f5e"
              />

              {/* Card 6 (TikTok): New followers */}
              <EngagementCard
                label="New followers"
                value={formatCompactNumber(stats.totalFollowersDb)}
                growth={followersGrowth}
                sparklineData={followersSeries}
                sparklineColor="#f97316"
              />

              {/* Card 7 (TikTok): Avg. View Duration */}
              <EngagementCard
                label="Avg. View Duration"
                value={
                  stats.avgViewDurationDb
                    ? `${stats.avgViewDurationDb.toFixed(1)}s`
                    : "0s"
                }
                growth={avgDurationGrowth}
                sparklineData={durationSeries}
                sparklineColor="#8b5cf6"
              />

              {/* Card 8 (TikTok): ERR % */}
              <EngagementCard
                label="ERR %"
                value={`${errRate.toFixed(2)}%`}
                growth={errRateGrowth}
                sparklineData={errSeries}
                sparklineColor="#10b981"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

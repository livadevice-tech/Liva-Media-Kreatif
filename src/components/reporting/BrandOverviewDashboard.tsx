import React, { useMemo, useState } from "react";
import {
  DollarSign,
  Package,
  ClipboardList,
  Calculator,
  Users,
  Eye,
  MousePointerClick,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Tag,
  Tv,
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
    <div className="group relative flex flex-col justify-between rounded-[20px] border border-slate-200/70 bg-white p-4.5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Top: Icon & Title */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform duration-200 group-hover:scale-105`}
        >
          {icon}
        </div>
        <span className="text-xs font-bold text-slate-500">{title}</span>
      </div>

      {/* Middle: Big Value */}
      <div className="mt-2.5 mb-1.5">
        <div className="text-[20px] xl:text-[22px] font-black tracking-tight text-slate-900 leading-tight">
          {value}
        </div>
      </div>

      {/* Bottom: Growth vs Prev & Sparkline */}
      <div className="mt-1 flex items-end justify-between gap-2">
        <div className="flex flex-col">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              growth.isUp ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {growth.isUp ? (
              <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
            )}
            <span>
              {growth.isUp ? "+" : "-"}
              {growth.pct}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
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
    <div className="flex flex-col justify-between rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-xs">
      <div>
        <p className="text-[12px] font-semibold text-slate-500 truncate" title={label}>
          {label}
        </p>
        <p className="mt-1 text-[20px] font-black text-slate-900 leading-tight">
          {value}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
            growth.isUp ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {growth.isUp ? (
            <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
          ) : (
            <TrendingDown className="h-3 w-3" strokeWidth={2.5} />
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
}: BrandOverviewDashboardProps) {
  const [chartInterval, setChartInterval] = useState<"daily" | "weekly">("daily");

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
  const errSeries = useMemo(
    () =>
      chartData.map((d) => {
        const eng = (d.likes || 0) + (d.comments || 0) + (d.shares || 0);
        const v = d.impressions || d.views || 1;
        return Number(((eng / v) * 100).toFixed(2));
      }),
    [chartData]
  );

  // Formatted Chart Points for Dual-Axis LineChart
  const formattedChartData = useMemo(() => {
    return chartData.map((pt) => {
      let label = pt.date;
      try {
        const dateObj = new Date(pt.date);
        if (!isNaN(dateObj.getTime())) {
          label = dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
        }
      } catch (e) {}

      return {
        ...pt,
        displayDate: label,
      };
    });
  }, [chartData]);

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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-black text-slate-900 text-base">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-[#5600e0] font-black text-xs">
                $
              </span>
              <span>Sale Metrics</span>
            </div>
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
            title={isShopee ? "Item Terjual" : "Item Sold"}
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
            title={isShopee ? "Pesanan Siaran" : "Orders"}
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

          {/* Card 5: Customer (Pembeli) */}
          <SaleCard
            icon={<Users className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title={isShopee ? "Pembeli" : "Customer"}
            value={formatCompactNumber(stats.totalBuyersDb)}
            growth={buyersGrowth}
            sparklineData={buyersSeries}
            sparklineColor="#8b5cf6"
          />

          {/* Card 6: Platform-specific (Product Impressions / Voucher Toko) */}
          {isShopee && stats.totalShopVouchersDb > 0 ? (
            <SaleCard
              icon={<Tag className="h-5 w-5" strokeWidth={2.5} />}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
              title="Voucher Toko"
              value={formatCompactNumber(stats.totalShopVouchersDb)}
              growth={calcGrowth(
                stats.totalShopVouchersDb,
                stats.pTotalShopVouchersDb
              )}
              sparklineData={chartData.map((d) => d.shopVouchers || 0)}
              sparklineColor="#f97316"
            />
          ) : (
            <SaleCard
              icon={<Eye className="h-5 w-5" strokeWidth={2.5} />}
              iconBg="bg-orange-50"
              iconColor="text-orange-600"
              title={isShopee ? "Tayangan Produk" : "Product Impressions"}
              value={formatCompactNumber(stats.totalDbProductImpressions)}
              growth={productImpressionsGrowth}
              sparklineData={productImpressionsSeries}
              sparklineColor="#f97316"
            />
          )}

          {/* Card 7: Product Clicks */}
          <SaleCard
            icon={<MousePointerClick className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            title={isShopee ? "Klik Produk" : "Product Clicks"}
            value={formatCompactNumber(stats.totalClicksDb || stats.totalDbClicks)}
            growth={clicksGrowth}
            sparklineData={clicksSeries}
            sparklineColor="#10b981"
          />

          {/* Card 8: GMV/Hours */}
          <SaleCard
            icon={<Clock className="h-5 w-5" strokeWidth={2.5} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title={isShopee ? "GMV/Jam" : "GMV/Hours"}
            value={formatCurrency(stats.gmvPerHour)}
            growth={gmvPerHourGrowth}
            sparklineData={gmvPerHourSeries}
            sparklineColor="#f43f5e"
          />
        </div>
      </section>

      {/* ── 2. MIDDLE SECTION: CHART (FULL WIDTH) ───────────────────────── */}
      <section>
        {/* Tren GMV, Orders & Penonton */}
        <div className="w-full rounded-[22px] border border-slate-200/70 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Tren GMV, Orders & Penonton
              </h3>
              <span className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                {periodLabel}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Legend */}
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
                  GMV
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#6366f1]" />
                  Orders
                </span>
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setChartInterval((prev) =>
                      prev === "daily" ? "weekly" : "daily"
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span>{chartInterval === "daily" ? "Harian" : "Mingguan"}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[280px] w-full">
            {formattedChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedChartData}
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
                  {/* Left Y Axis for GMV (in Millions) */}
                  <YAxis
                    yAxisId="gmv"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(val) => {
                      if (val >= 1000000) {
                        return `${(val / 1000000).toFixed(0)}M`;
                      }
                      if (val >= 1000) {
                        return `${(val / 1000).toFixed(0)}k`;
                      }
                      return `${val}`;
                    }}
                  />
                  {/* Right Y Axis for Orders */}
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(val) => `${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataPt = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xl text-xs space-y-1">
                            <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">
                              {dataPt.date}
                            </p>
                            <p className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
                              <span>GMV:</span>
                              <strong>{formatCurrency(dataPt.gmv)}</strong>
                            </p>
                            <p className="flex items-center justify-between gap-4 text-indigo-600 font-semibold">
                              <span>Orders:</span>
                              <strong>{dataPt.orders} pesanan</strong>
                            </p>
                            <p className="flex items-center justify-between gap-4 text-slate-500 font-semibold">
                              <span>Penonton:</span>
                              <strong>
                                {dataPt.views || dataPt.penonton || 0}
                              </strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    yAxisId="gmv"
                    type="monotone"
                    dataKey="gmv"
                    stroke="#10b981"
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{ r: 5, fill: "#10b981" }}
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#6366f1"
                    strokeWidth={2.8}
                    dot={false}
                    activeDot={{ r: 5, fill: "#6366f1" }}
                  />
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
            <span>Engagement Metrics</span>
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
          {/* Card 1: Live Impressions / Views */}
          <EngagementCard
            label={isShopee ? "Live Views" : "Live Impressions"}
            value={formatCompactNumber(liveImpressionsValue)}
            growth={impressionsGrowth}
            sparklineData={impressionsSeries}
            sparklineColor={impressionsGrowth.isUp ? "#10b981" : "#f43f5e"}
          />

          {/* Card 2: Viewer */}
          <EngagementCard
            label={isShopee ? "Penonton" : "Viewer"}
            value={formatCompactNumber(stats.totalPenontonDb)}
            growth={viewersGrowth}
            sparklineData={viewersSeries}
            sparklineColor="#10b981"
          />

          {/* Card 3: Likes */}
          <EngagementCard
            label="Likes"
            value={formatCompactNumber(stats.totalLikesDb)}
            growth={likesGrowth}
            sparklineData={likesSeries}
            sparklineColor="#8b5cf6"
          />

          {/* Card 4: Comments */}
          <EngagementCard
            label="Comments"
            value={formatCompactNumber(stats.totalCommentsDb)}
            growth={commentsGrowth}
            sparklineData={commentsSeries}
            sparklineColor="#3b82f6"
          />

          {/* Card 5: Shares */}
          <EngagementCard
            label="Shares"
            value={formatCompactNumber(stats.totalSharesDb)}
            growth={sharesGrowth}
            sparklineData={sharesSeries}
            sparklineColor="#f43f5e"
          />

          {/* Card 6: New Followers */}
          <EngagementCard
            label="New Followers"
            value={formatCompactNumber(stats.totalFollowersDb)}
            growth={followersGrowth}
            sparklineData={followersSeries}
            sparklineColor="#f97316"
          />

          {/* Card 7: Avg. View Duration */}
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

          {/* Card 8: ERR % */}
          <EngagementCard
            label="ERR %"
            value={`${errRate.toFixed(2)}%`}
            growth={errRateGrowth}
            sparklineData={errSeries}
            sparklineColor="#10b981"
          />
        </div>
      </section>
    </div>
  );
}

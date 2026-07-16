import { useMemo, useState, useEffect, useRef } from "react";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart as RechartsComposedChart,
} from "recharts";
import { ChevronDown } from "lucide-react";
import {
  liveChartMetricDefaults,
  liveChartMetricOptions,
} from "../../shared/utils/liveChartConfig";
import type { LiveReportChartData } from "./liveReportSummaryTypes";
import {
  ChartGranularity,
  aggregateChartData,
} from "../../shared/utils/chartDataAggregation";

type LiveReportChartSectionProps = {
  chartData: LiveReportChartData;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  useShopeeLiveLayout?: boolean;
};



export function LiveReportChartSection({
  chartData,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  useShopeeLiveLayout = false,
}: LiveReportChartSectionProps) {
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);
  const [isSaleMetricsMenuOpen, setIsSaleMetricsMenuOpen] = useState(false);
  const [isEngagementMetricsMenuOpen, setIsEngagementMetricsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsGranularityMenuOpen(false);
        setIsSaleMetricsMenuOpen(false);
        setIsEngagementMetricsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Default behavior if nothing is selected or if parent doesn't provide it
  const activeMetrics =
    chartSelectedMetrics && chartSelectedMetrics.length > 0
      ? chartSelectedMetrics
      : (liveChartMetricDefaults as unknown as string[]);

  const visibleData = useMemo(() => {
    const aggregated = aggregateChartData(
      chartData,
      granularity,
      [
        "gmv", "orders", "itemsSold", "clicks", "penonton", "buyers",
        "likes", "comments", "shares", "followers", "impressions",
        "peakViewers", "shopVouchers", "liveVisits", "sessionsCount",
        "duration", "avgViewDurationSum", "productImpressions"
      ]
    );

    return aggregated.map((point: any) => {
      const impressions = point.impressions || 0;
      const likes = point.likes || 0;
      const comments = point.comments || 0;
      const shares = point.shares || 0;
      const gmv = point.gmv || 0;
      const orders = point.orders || 0;
      const duration = point.duration || 0;
      const liveVisits = point.liveVisits || 0;
      const sessionsCount = point.sessionsCount || 0;
      const avgViewDurationSum = point.avgViewDurationSum || 0;

      return {
        ...point,
        err: impressions > 0 ? ((likes + comments + shares) / impressions) * 100 : 0,
        aov: orders > 0 ? gmv / orders : 0,
        gmvPerHour: duration > 0 ? gmv / (duration / 3600) : 0,
        avgViewDuration: sessionsCount > 0 ? avgViewDurationSum / sessionsCount : 0,
        viewerActive: sessionsCount > 0 ? liveVisits / sessionsCount : 0,
      };
    });
  }, [chartData, granularity]);

  const platform = useShopeeLiveLayout ? "shopee" : "tiktok";
  const platformFilteredOptions = useMemo(() => 
    liveChartMetricOptions.filter((opt) => (opt.platforms as readonly string[])?.includes(platform)),
  [platform]);

  const legendItems = platformFilteredOptions
    .filter((opt) => activeMetrics.includes(opt.key))
    .map((opt) => {
      // Map class name text colors to hex for recharts
      let color = "#cbd5e1"; // default slate-300
      if (opt.color.includes("emerald")) color = "#059669";
      if (opt.color.includes("indigo")) color = "#4f46e5";
      if (opt.color.includes("amber")) color = "#d97706";
      if (opt.color.includes("pink")) color = "#db2777";
      if (opt.color.includes("cyan")) color = "#0891b2";
      if (opt.color.includes("teal")) color = "#0d9488";
      if (opt.color.includes("red")) color = "#dc2626";
      if (opt.color.includes("fuchsia")) color = "#c026d3";
      if (opt.color.includes("violet")) color = "#7c3aed";
      if (opt.color.includes("sky")) color = "#0284c7";
      if (opt.color.includes("blue")) color = "#2563eb";
      if (opt.color.includes("orange")) color = "#ea580c";
      if (opt.color.includes("rose")) color = "#e11d48";
      if (opt.color.includes("yellow")) color = "#ca8a04";
      if (opt.color.includes("lime")) color = "#65a30d";
      return { ...opt, color };
    });

  const metricAnalysis = useMemo(() => {
    const analysis: Record<string, { avg: number; max: number; maxDate?: string; min: number; minDate?: string; label: string }> = {};
    
    activeMetrics.forEach((metricKey) => {
      const option = platformFilteredOptions.find(o => o.key === metricKey);
      if (!option) return;

      let sum = 0;
      let max = -Infinity;
      let min = Infinity;
      let maxDate = "";
      let minDate = "";
      let count = 0;

      visibleData.forEach((point: any) => {
        const val = point[metricKey] || 0;
        sum += val;
        if (val > max) {
          max = val;
          maxDate = point.displayDate;
        }
        if (val < min) {
          min = val;
          minDate = point.displayDate;
        }
        count++;
      });

      if (count === 0) {
        max = 0;
        min = 0;
      }

      analysis[metricKey] = {
        avg: count > 0 ? sum / count : 0,
        max,
        maxDate,
        min,
        minDate,
        label: option.label,
      };
    });

    return analysis;
  }, [visibleData, activeMetrics, platformFilteredOptions]);

  const granularityOptions = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
  ] as const;

  const dateRangeLabel = useMemo(() => {
    if (!visibleData || visibleData.length === 0) return "";
    if (visibleData.length === 1) return visibleData[0].displayDate;
    return `${visibleData[0].displayDate} - ${visibleData[visibleData.length - 1].displayDate}`;
  }, [visibleData]);

  return (
    <section className="rounded-[16px] border border-[#e6dff8] bg-white p-6 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-[14px] font-semibold text-slate-800">
            Tren GMV & Views
          </h3>
          {dateRangeLabel && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
              {dateRangeLabel}
            </span>
          )}
        </div>

        <div ref={menuRef} className="flex flex-col sm:flex-row items-center gap-3">
          {/* Sale Metrics Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsSaleMetricsMenuOpen(!isSaleMetricsMenuOpen);
                setIsEngagementMetricsMenuOpen(false);
                setIsGranularityMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Sale Metrics ({activeMetrics.filter(m => liveChartMetricOptions.find(o => o.key === m && (o.category === "Sale Metrics" || !o.category))).length})
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isSaleMetricsMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 max-h-[300px] overflow-y-auto rounded-[8px] border border-slate-200 bg-white p-2 shadow-lg">
                <div className="flex flex-col gap-1">
                    {platformFilteredOptions
                      .filter((opt) => opt.category === "Sale Metrics")
                      .map((option) => {
                    const isSelected = activeMetrics.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              onChartSelectedMetricsChange(
                                activeMetrics.filter((m) => m !== option.key)
                              );
                            } else {
                              onChartSelectedMetricsChange([
                                ...activeMetrics,
                                option.key,
                              ]);
                            }
                          }}
                        />
                        <span className="text-[12px] font-medium text-slate-700">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Engagement Metrics Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsEngagementMetricsMenuOpen(!isEngagementMetricsMenuOpen);
                setIsSaleMetricsMenuOpen(false);
                setIsGranularityMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Engagement Metrics ({activeMetrics.filter(m => liveChartMetricOptions.find(o => o.key === m && o.category === "Engagement Metrics")).length})
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isEngagementMetricsMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 max-h-[300px] overflow-y-auto rounded-[8px] border border-slate-200 bg-white p-2 shadow-lg">
                <div className="flex flex-col gap-1">
                    {platformFilteredOptions
                      .filter((opt) => opt.category === "Engagement Metrics")
                      .map((option) => {
                    const isSelected = activeMetrics.includes(option.key);
                    return (
                      <label
                        key={option.key}
                        className="flex cursor-pointer items-center gap-2 rounded-[6px] px-2 py-1.5 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              onChartSelectedMetricsChange(
                                activeMetrics.filter((m) => m !== option.key)
                              );
                            } else {
                              onChartSelectedMetricsChange([
                                ...activeMetrics,
                                option.key,
                              ]);
                            }
                          }}
                        />
                        <span className="text-[12px] font-medium text-slate-700">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Granularity Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsGranularityMenuOpen(!isGranularityMenuOpen);
                setIsSaleMetricsMenuOpen(false);
                setIsEngagementMetricsMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              {granularityOptions.find((o) => o.value === granularity)?.label}
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isGranularityMenuOpen && (
              <div className="absolute right-0 top-full z-10 mt-1 w-32 rounded-[8px] border border-slate-200 bg-white p-1 shadow-lg">
                {granularityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setGranularity(option.value);
                      setIsGranularityMenuOpen(false);
                    }}
                    className={`block w-full rounded-[6px] px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                      granularity === option.value
                        ? "bg-slate-50 text-[#5600e0]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-end gap-4 text-[12px] font-medium text-slate-600">
        {legendItems.map((item) => (
          <span key={item.key} className="inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <RechartsComposedChart
          data={visibleData}
          margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
        >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              dy={10}
              minTickGap={30}
            />
            {activeMetrics.includes("gmv") && (
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val === 0 ? "0" : `${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(val).replace('M', 'M')}`
                }
              />
            )}
            {activeMetrics.some(m => m !== "gmv") && (
              <YAxis
                yAxisId="right"
                orientation={activeMetrics.includes("gmv") ? "right" : "left"}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val === 0 ? "0" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(val)
                }
              />
            )}
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                zIndex: 50,
              }}
              labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: "4px" }}
              formatter={(value: number | string, name: string) => {
                const isRupiah = name === "GMV";
                const formattedValue = isRupiah 
                  ? `Rp${new Intl.NumberFormat("id-ID").format(Number(value))}`
                  : new Intl.NumberFormat("id-ID").format(Number(value));
                return [formattedValue, name];
              }}
            />
            {legendItems.map((item) => (
              <Line
                key={item.key}
                yAxisId={item.key === "gmv" ? "left" : "right"}
                type="monotone"
                name={item.label}
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </RechartsComposedChart>
        </ResponsiveContainer>
      </div>

      {activeMetrics.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {legendItems.map((item) => {
            const analysis = metricAnalysis[item.key];
            if (!analysis) return null;
            
            const formatValue = (val: number) => {
              if (item.key === "gmv" || item.key === "aov" || item.key === "gmvPerHour") {
                return `Rp${new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(val)}`;
              }
              if (item.key === "err") {
                return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(val)}%`;
              }
              return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(val);
            };

            return (
              <div key={item.key} className="flex flex-col gap-3 rounded-[12px] border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[13px] font-semibold text-slate-700 truncate">{analysis.label}</span>
                </div>
                <div className="flex items-center justify-between text-[12px] text-slate-500">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase text-slate-400">Avg</span>
                    <span className="font-semibold text-slate-700">{formatValue(analysis.avg)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase text-slate-400">Peak {analysis.maxDate && `• ${analysis.maxDate}`}</span>
                    <span className="font-semibold text-emerald-600">{formatValue(analysis.max)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium uppercase text-slate-400">Low {analysis.minDate && `• ${analysis.minDate}`}</span>
                    <span className="font-semibold text-rose-600">{formatValue(analysis.min)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

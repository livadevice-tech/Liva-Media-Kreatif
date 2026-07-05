import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
} from "recharts";
import { ChevronDown } from "lucide-react";
import {
  engagementChartMetricDefaults,
  engagementChartMetricOptions,
} from "../../shared/utils/reportingChartConfig";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";
import {
  ChartGranularity,
  filterChartDataByLatestDays,
  aggregateChartData,
} from "../../shared/utils/chartDataAggregation";

type EngagementReportChartSectionProps = {
  model: EngagementReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
};

const WINDOW_OPTIONS = [
  { value: 7, label: "7 Hari" },
  { value: 30, label: "30 Hari" },
  { value: 90, label: "90 Hari" },
] as const;

export function EngagementReportChartSection({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: EngagementReportChartSectionProps) {
  const [windowSize, setWindowSize] =
    useState<(typeof WINDOW_OPTIONS)[number]["value"]>(7);
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);

  const visibleData = useMemo(() => {
    const filtered = filterChartDataByLatestDays(model.chartData, windowSize);
    return aggregateChartData(filtered, granularity, [
      "uniqueViewers",
      "errRateNumeric",
      "likes",
      "comments",
      "shares",
      "followers",
    ]);
  }, [model.chartData, windowSize, granularity]);

  const granularityOptions = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
  ] as const;

  return (
    <section className="rounded-[16px] border border-[#e6dff8] bg-white p-6 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[14px] font-semibold text-slate-800">
          Tren Kinerja Interaksi
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Segmented Control for Days */}
          <div className="flex items-center rounded-[8px] bg-slate-50 p-1 border border-slate-200">
            {WINDOW_OPTIONS.map((option) => {
              const isActive = windowSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWindowSize(option.value)}
                  className={`rounded-[6px] px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    isActive
                      ? "bg-white text-[#5600e0] shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Granularity Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGranularityMenuOpen(!isGranularityMenuOpen)}
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

      <div className="mb-6 flex flex-wrap items-center gap-4 text-[12px] font-medium text-slate-600">
        <div className="mr-2 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          Metrik:
        </div>
        {engagementChartMetricOptions.map((metric) => {
          const isSelected = chartSelectedMetrics.includes(metric.key);
          return (
            <button
              key={metric.key}
              onClick={() => {
                if (isSelected) {
                  if (chartSelectedMetrics.length > 1) {
                    onChartSelectedMetricsChange(
                      chartSelectedMetrics.filter((item) => item !== metric.key)
                    );
                  }
                } else {
                  onChartSelectedMetricsChange([...chartSelectedMetrics, metric.key]);
                }
              }}
              className={`flex items-center gap-1.5 transition-colors ${
                isSelected ? "text-slate-800" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  metric.key === "errRateNumeric"
                    ? "bg-[#5600e0]"
                    : metric.key === "uniqueViewers"
                      ? "bg-cyan-500"
                      : metric.key === "likes"
                        ? "bg-amber-500"
                        : metric.key === "comments"
                          ? "bg-pink-500"
                          : metric.key === "shares"
                            ? "bg-emerald-500"
                            : "bg-orange-550"
                } ${!isSelected && "opacity-40"}`}
              />
              {metric.label}
            </button>
          );
        })}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
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
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
              hide={!chartSelectedMetrics.includes("errRateNumeric")}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) =>
                val === 0 ? "0" : new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(val)
              }
              hide={
                ![
                  "uniqueViewers",
                  "likes",
                  "comments",
                  "shares",
                  "followers",
                ].some((key) => chartSelectedMetrics.includes(key))
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#334155", fontWeight: 600, marginBottom: "4px" }}
              formatter={(value: number | string, name: string) => [
                name === "Tingkat Interaksi (ERR)"
                  ? `${Number(value).toFixed(2)}%`
                  : new Intl.NumberFormat("id-ID").format(Number(value)),
                name,
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              name="Tingkat Interaksi (ERR)"
              dataKey="errRateNumeric"
              stroke="#5600e0"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("errRateNumeric")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Unique Viewers (Penonton)"
              dataKey="uniqueViewers"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("uniqueViewers")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Likes"
              dataKey="likes"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("likes")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Comments"
              dataKey="comments"
              stroke="#ec4899"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("comments")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Share"
              dataKey="shares"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("shares")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Followers"
              dataKey="followers"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              hide={!chartSelectedMetrics.includes("followers")}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

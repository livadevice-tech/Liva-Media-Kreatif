import { useMemo, useState } from "react";
import {
  Area,
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
  filterChartDataByLatestDays,
  aggregateChartData,
} from "../../shared/utils/chartDataAggregation";

type LiveReportChartSectionProps = {
  chartData: LiveReportChartData;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
};

const WINDOW_OPTIONS = [
  { value: 7, label: "7 Hari" },
  { value: 30, label: "30 Hari" },
  { value: 90, label: "90 Hari" },
] as const;

export function LiveReportChartSection({
  chartData,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: LiveReportChartSectionProps) {
  const [windowSize, setWindowSize] =
    useState<(typeof WINDOW_OPTIONS)[number]["value"]>(7);
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);

  const visibleData = useMemo(() => {
    // Filter berdasarkan "hari dari data terakhir"
    const filtered = filterChartDataByLatestDays(chartData, windowSize);
    // Agregasi
    return aggregateChartData(filtered, granularity, [
      "gmv",
      "orders",
      "itemsSold",
      "clicks",
      "penonton",
    ]);
  }, [chartData, windowSize, granularity]);

  const legendItems = [
    { key: "gmv", label: "GMV (Rp)", color: "#5600e0" },
    { key: "penonton", label: "Views", color: "#60a5fa" }, // Menggunakan Views/Penonton sesuai request
  ];

  const granularityOptions = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
  ] as const;

  return (
    <section className="rounded-[16px] border border-[#e6dff8] bg-white p-6 shadow-sm">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-[14px] font-semibold text-slate-800">
          Tren GMV & Views
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
            <defs>
              <linearGradient id="gmvGradientNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5600e0" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5600e0" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(val) =>
                val === 0 ? "0" : `${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(val).replace('M', 'M')}`
              }
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
                name === "GMV"
                  ? `Rp${new Intl.NumberFormat("id-ID").format(Number(value))}`
                  : new Intl.NumberFormat("id-ID").format(Number(value)),
                name,
              ]}
            />
            <Area
              yAxisId="left"
              type="monotone"
              name="GMV"
              dataKey="gmv"
              stroke="#5600e0"
              strokeWidth={2}
              fill="url(#gmvGradientNew)"
              dot={false}
              activeDot={{ r: 5, fill: "#5600e0", stroke: "#fff", strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Views"
              dataKey="penonton"
              stroke="#60a5fa"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 5, fill: "#60a5fa", stroke: "#fff", strokeWidth: 2 }}
            />
          </RechartsComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
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
};



export function LiveReportChartSection({
  chartData,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: LiveReportChartSectionProps) {
  const [granularity, setGranularity] = useState<ChartGranularity>("daily");
  const [isGranularityMenuOpen, setIsGranularityMenuOpen] = useState(false);
  const [isMetricsMenuOpen, setIsMetricsMenuOpen] = useState(false);

  // Default behavior if nothing is selected or if parent doesn't provide it
  const activeMetrics =
    chartSelectedMetrics && chartSelectedMetrics.length > 0
      ? chartSelectedMetrics
      : (liveChartMetricDefaults as unknown as string[]);

  const visibleData = useMemo(() => {
    // Agregasi langsung pada chartData yang sudah terfilter secara global
    return aggregateChartData(chartData, granularity, [
      "gmv",
      "orders",
      "itemsSold",
      "clicks",
      "penonton",
    ]);
  }, [chartData, granularity]);

  const legendItems = liveChartMetricOptions
    .filter((opt) => activeMetrics.includes(opt.key))
    .map((opt) => {
      // Map class name text colors to hex for recharts
      let color = "#cbd5e1"; // default slate-300
      if (opt.color.includes("emerald")) color = "#059669";
      if (opt.color.includes("indigo")) color = "#4f46e5";
      if (opt.color.includes("amber")) color = "#d97706";
      if (opt.color.includes("pink")) color = "#db2777";
      if (opt.color.includes("cyan")) color = "#0891b2";
      if (opt.key === "gmv") color = "#5600e0";
      if (opt.key === "penonton") color = "#60a5fa";
      return { key: opt.key, label: opt.label, color };
    });

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
          {/* Custom Metrics Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMetricsMenuOpen(!isMetricsMenuOpen);
                setIsGranularityMenuOpen(false);
              }}
              className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Metrics ({activeMetrics.length})
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {isMetricsMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-[8px] border border-slate-200 bg-white p-2 shadow-lg">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Pilih Metrik
                </div>
                <div className="flex flex-col gap-1">
                  {liveChartMetricOptions.map((option) => {
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
                setIsMetricsMenuOpen(false);
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
    </section>
  );
}

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
} from "recharts";
import { ChevronDown, Sliders, TrendingUp } from "lucide-react";
import {
  liveChartMetricDefaults,
  liveChartMetricOptions,
} from "../../shared/utils/liveChartConfig";
import type { LiveReportChartData } from "./liveReportSummaryTypes";

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
  const [windowSize, setWindowSize] = useState<(typeof WINDOW_OPTIONS)[number]["value"]>(7);

  const visibleData = useMemo(() => {
    if (chartData.length <= windowSize) {
      return chartData;
    }

    return chartData.slice(chartData.length - windowSize);
  }, [chartData, windowSize]);

  const legendItems = [
    { key: "gmv", label: "GMV (Rp)", color: "#5600e0" },
    { key: "orders", label: "Orders", color: "#60a5fa" },
  ];

  const toggleMetric = (metricKey: string) => {
    const isSelected = chartSelectedMetrics.includes(metricKey);
    if (isSelected) {
      if (chartSelectedMetrics.length > 1) {
        onChartSelectedMetricsChange(
          chartSelectedMetrics.filter((item) => item !== metricKey),
        );
      }
      return;
    }

    onChartSelectedMetricsChange([...chartSelectedMetrics, metricKey]);
  };

  return (
    <section className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            <TrendingUp className="h-4 w-4 text-[#5600e0]" />
            Tren GMV & Orders
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Tampilan dibuat lebih padat dan fokus, supaya grafik utama langsung
            terbaca seperti dashboard referensi: period selector di kanan, legend
            ringan, lalu kurva GMV dan Orders.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex items-center gap-2 rounded-[16px] border border-[#e4ddf6] bg-[#faf8ff] p-1 shadow-sm">
            {WINDOW_OPTIONS.map((option) => {
              const isActive = windowSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setWindowSize(option.value)}
                  className={`rounded-[12px] px-3 py-1.5 text-[11px] font-black transition-colors ${
                    isActive
                      ? "bg-white text-[#5600e0] shadow-[0_4px_14px_rgba(86,0,224,0.12)]"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
            <button
              type="button"
              className="flex items-center gap-1 rounded-[12px] bg-transparent px-3 py-1.5 text-[11px] font-black text-slate-500 transition-colors hover:bg-white hover:text-slate-800"
            >
              Harian
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] font-bold text-slate-600">
            {legendItems.map((item) => (
              <span key={item.key} className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 border-t border-[#f0ebfb] pt-4">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
          <Sliders className="h-3.5 w-3.5 text-[#5600e0]" />
          Metrik
        </div>
        {liveChartMetricOptions.map((metric) => {
          const isSelected = chartSelectedMetrics.includes(metric.key);

          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => toggleMetric(metric.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black transition-colors ${
                isSelected
                  ? `${metric.color} shadow-sm`
                  : "border-[#e6e0f3] bg-white text-slate-400 hover:bg-[#fcfaff] hover:text-slate-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  metric.key === "gmv"
                    ? "bg-[#5600e0]"
                    : metric.key === "orders"
                      ? "bg-sky-500"
                      : metric.key === "itemsSold"
                        ? "bg-amber-500"
                        : metric.key === "clicks"
                          ? "bg-pink-500"
                          : "bg-teal-500"
                }`}
              />
              {metric.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChartSelectedMetricsChange([...liveChartMetricDefaults])}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[#e6e0f3] bg-white px-3 py-1.5 text-[10px] font-black text-[#5600e0] transition-colors hover:bg-[#faf8ff]"
        >
          Reset semua
        </button>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={visibleData}
            margin={{ top: 18, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5600e0" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#5600e0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ece7f7"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 700 }}
              axisLine={{ stroke: "#e9e4f5" }}
              tickLine={false}
              dy={12}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) =>
                `Rp${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(val)}`
              }
              hide={!chartSelectedMetrics.includes("gmv")}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) =>
                new Intl.NumberFormat("id-ID", { notation: "compact" }).format(val)
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "1px solid #e6e0f3",
                boxShadow: "0 14px 30px rgba(17,24,39,0.12)",
                fontWeight: 700,
                fontSize: "11px",
              }}
              labelStyle={{ color: "#111827", marginBottom: "4px" }}
              formatter={(value: number | string, name: string) => [
                name === "GMV (Pendapatan)"
                  ? `Rp${new Intl.NumberFormat("id-ID").format(Number(value))}`
                  : new Intl.NumberFormat("id-ID").format(Number(value)),
                name,
              ]}
            />
            <Area
              yAxisId="left"
              type="monotone"
              name="GMV (Pendapatan)"
              dataKey="gmv"
              stroke="#5600e0"
              strokeWidth={3}
              fill="url(#gmvGradient)"
              dot={{ r: 3.5, fill: "#5600e0", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              hide={!chartSelectedMetrics.includes("gmv")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Pesanan (Orders)"
              dataKey="orders"
              stroke="#60a5fa"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: "#60a5fa", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 5 }}
              hide={!chartSelectedMetrics.includes("orders")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Produk Terjual"
              dataKey="itemsSold"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("itemsSold")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Klik Produk"
              dataKey="clicks"
              stroke="#ec4899"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("clicks")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Penonton (Views)"
              dataKey="penonton"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#14b8a6", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("penonton")}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

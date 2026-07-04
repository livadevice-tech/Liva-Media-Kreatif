import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
} from "recharts";
import { Sliders, TrendingUp } from "lucide-react";
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

export function LiveReportChartSection({
  chartData,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: LiveReportChartSectionProps) {
  return (
    <div className="mb-6 rounded-[18px] border border-[#e5e2e1] bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-display flex items-center gap-2 text-sm font-black uppercase tracking-[0.22em] text-slate-800">
            <TrendingUp className="w-5 h-5 text-[#5600e0]" /> Tren Kinerja
            Penjualan Live Harian
          </h4>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">
            Visualisasi harian data penyiaran langsung (Live Streaming) dinamis
            harian.
          </p>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-3 rounded-[14px] border border-[#e5e2e1] bg-[#f6f3f2] p-3">
          <div className="flex items-center gap-1 mr-1 select-none">
            <Sliders className="h-3.5 w-3.5 text-[#5600e0]/80" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Metrik:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {liveChartMetricOptions.map((metric) => {
              const isSelected = chartSelectedMetrics.includes(metric.key);
              return (
                <button
                  key={metric.key}
                  onClick={() => {
                    if (isSelected) {
                      if (chartSelectedMetrics.length > 1) {
                        onChartSelectedMetricsChange(
                          chartSelectedMetrics.filter(
                            (item) => item !== metric.key,
                          ),
                        );
                      }
                    } else {
                      onChartSelectedMetricsChange([
                        ...chartSelectedMetrics,
                        metric.key,
                      ]);
                    }
                  }}
                  className={`flex cursor-pointer select-none items-center gap-1 rounded-[10px] border px-2.5 py-1.5 text-[10px] font-bold transition-all ${
                    isSelected
                      ? `${metric.color} scale-[1.02] shadow-sm font-extrabold`
                      : "border-[#e5e2e1] bg-white text-slate-400 hover:bg-[#fcf9f8] hover:text-slate-600"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      metric.key === "gmv"
                        ? "bg-emerald-500"
                        : metric.key === "orders"
                          ? "bg-indigo-600"
                          : metric.key === "itemsSold"
                            ? "bg-amber-500"
                            : metric.key === "clicks"
                              ? "bg-pink-500"
                              : "bg-cyan-500"
                    }`}
                  />
                  {metric.label}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-500 sm:border-l sm:border-slate-200 sm:pl-2.5">
            <button
              onClick={() =>
                onChartSelectedMetricsChange([...liveChartMetricDefaults])
              }
              className="cursor-pointer border-0 bg-transparent text-[9px] font-black uppercase tracking-widest text-[#5600e0] hover:underline"
            >
              Semua
            </button>
            <span>|</span>
            <button
              onClick={() => onChartSelectedMetricsChange(["gmv", "orders"])}
              className="cursor-pointer border-0 bg-transparent text-[9px] font-black uppercase tracking-widest text-slate-500 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={chartData}
            margin={{ top: 10, right: 35, left: 15, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 10, fill: "#10b981", fontWeight: "bold" }}
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
              tick={{ fontSize: 10, fill: "#4f46e5", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val: number) =>
                new Intl.NumberFormat("id-ID", { notation: "compact" }).format(val)
              }
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                fontWeight: "bold",
                fontSize: "11px",
              }}
              formatter={(value: number | string, name: string) => [
                name === "GMV (Pendapatan)"
                  ? `Rp${new Intl.NumberFormat("id-ID").format(Number(value))}`
                  : new Intl.NumberFormat("id-ID").format(Number(value)),
                name,
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              name="GMV (Pendapatan)"
              dataKey="gmv"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              hide={!chartSelectedMetrics.includes("gmv")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Pesanan (Orders)"
              dataKey="orders"
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("orders")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Produk Terjual"
              dataKey="itemsSold"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("itemsSold")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Klik Produk"
              dataKey="clicks"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("clicks")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Penonton (Views)"
              dataKey="penonton"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("penonton")}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

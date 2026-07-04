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
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Tren Kinerja
            Penjualan Live Harian
          </h4>
          <p className="text-[11px] text-slate-400 font-bold mt-1">
            Visualisasi harian data penyiaran langsung (Live Streaming) dinamis
            harian.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-w-full">
          <div className="flex items-center gap-1 mr-1 select-none">
            <Sliders className="w-3.5 h-3.5 text-indigo-500/80" />
            <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">
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
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none flex items-center gap-1 ${
                    isSelected
                      ? `${metric.color} scale-[1.02] shadow-xs font-extrabold`
                      : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50"
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
          <div className="flex items-center gap-2 text-[10px] sm:border-l sm:border-slate-200 sm:pl-2.5 ml-auto font-bold text-slate-500">
            <button
              onClick={() =>
                onChartSelectedMetricsChange([...liveChartMetricDefaults])
              }
              className="text-indigo-600 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black"
            >
              Semua
            </button>
            <span>|</span>
            <button
              onClick={() => onChartSelectedMetricsChange(["gmv", "orders"])}
              className="text-slate-500 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="h-72 w-full mt-4">
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

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
  engagementChartMetricDefaults,
  engagementChartMetricOptions,
} from "../../shared/utils/reportingChartConfig";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";

type EngagementReportChartSectionProps = {
  model: EngagementReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
};

export function EngagementReportChartSection({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
}: EngagementReportChartSectionProps) {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" /> Tren Kinerja
            Interaksi Harian
          </h4>
          <p className="text-[11px] text-slate-400 font-bold mt-1">
            Visualisasi harian metrik interaksi terpilih dari data historis
            siaran langsung.
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
            {engagementChartMetricOptions.map((metric) => {
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
                      : "bg-white text-slate-400 border-slate-200 hover:text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      metric.key === "errRateNumeric"
                        ? "bg-indigo-600"
                        : metric.key === "uniqueViewers"
                          ? "bg-cyan-500"
                          : metric.key === "likes"
                            ? "bg-amber-500"
                            : metric.key === "comments"
                              ? "bg-pink-500"
                              : metric.key === "shares"
                                ? "bg-emerald-500"
                                : "bg-orange-550"
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
                onChartSelectedMetricsChange([
                  "errRateNumeric",
                  "uniqueViewers",
                  "likes",
                  "comments",
                  "shares",
                  "followers",
                ])
              }
              className="text-indigo-600 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black"
            >
              Semua
            </button>
            <span>|</span>
            <button
              onClick={() =>
                onChartSelectedMetricsChange([...engagementChartMetricDefaults])
              }
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
            data={model.chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
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
              tick={{ fontSize: 10, fill: "#4f46e5", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
              hide={!chartSelectedMetrics.includes("errRateNumeric")}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: "bold" }}
              hide={
                ![
                  "uniqueViewers",
                  "likes",
                  "comments",
                  "shares",
                  "followers",
                ].some((key) => chartSelectedMetrics.includes(key))
              }
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) =>
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
              stroke="#4f46e5"
              strokeWidth={3}
              dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              hide={!chartSelectedMetrics.includes("errRateNumeric")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Unique Viewers (Penonton)"
              dataKey="uniqueViewers"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("uniqueViewers")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Likes"
              dataKey="likes"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("likes")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Comments"
              dataKey="comments"
              stroke="#ec4899"
              strokeWidth={3}
              dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("comments")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Share"
              dataKey="shares"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("shares")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              name="Followers"
              dataKey="followers"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
              hide={!chartSelectedMetrics.includes("followers")}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

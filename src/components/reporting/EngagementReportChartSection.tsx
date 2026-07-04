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
    <div className="rounded-[22px] border border-[#e6dff8] bg-white p-5 shadow-[0_1px_0_rgba(17,24,39,0.03)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#7f6ea8]">
            <TrendingUp className="h-5 w-5 text-[#5600e0]" /> Tren Kinerja
            Interaksi Harian
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Visualisasi harian metrik interaksi terpilih dari data historis
            siaran langsung.
          </p>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-3 rounded-[16px] border border-[#e4ddf6] bg-[#faf8ff] p-3 shadow-sm">
          <div className="mr-1 flex items-center gap-1 select-none">
            <Sliders className="h-3.5 w-3.5 text-[#5600e0]/80" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
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
                  className={`flex cursor-pointer select-none items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-all ${
                    isSelected
                      ? `${metric.color} scale-[1.02] shadow-xs font-extrabold`
                      : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-650"
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
          <div className="ml-auto flex items-center gap-2 border-l border-slate-200 pl-2.5 text-[10px] font-bold text-slate-500">
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
              className="cursor-pointer border-0 bg-transparent text-[9px] font-black uppercase tracking-widest text-[#5600e0] hover:underline"
            >
              Semua
            </button>
            <span>|</span>
            <button
              onClick={() =>
                onChartSelectedMetricsChange([...engagementChartMetricDefaults])
              }
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
            data={model.chartData}
            margin={{ top: 10, right: 24, left: 6, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#ece7f7"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: "#4f46e5", fontWeight: "bold" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `${val}%`}
              hide={!chartSelectedMetrics.includes("errRateNumeric")}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#64748b", fontWeight: "bold" }}
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
                border: "1px solid #e6e0f3",
                boxShadow: "0 14px 30px rgba(17,24,39,0.12)",
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
              stroke="#5600e0"
              strokeWidth={3}
              dot={{ r: 4, fill: "#5600e0", strokeWidth: 2, stroke: "#fff" }}
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

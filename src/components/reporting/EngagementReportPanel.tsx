import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
} from "recharts";
import { Gift, Sliders, TrendingUp, Users } from "lucide-react";
import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
import { ReportMetricCard } from "./ReportMetricCard";
import { ReportEngagementUploadHistory } from "./ReportEngagementUploadHistory";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { EngagementReportViewModel } from "../../shared/utils/engagementReporting";

interface EngagementReportPanelProps {
  model: EngagementReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
  activeReportBrandId: string;
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  brandUploadHistory: UploadHistoryEntry[];
  uploadHistory: UploadHistoryEntry[];
  isLogsLoading: boolean;
  onDeleteUploadBatch: (
    id: string,
    fileName: string,
    rowCount: number,
  ) => void;
}

const chartMetricOptions = [
  {
    key: "errRateNumeric",
    label: "ERR %",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    key: "uniqueViewers",
    label: "Unique Viewers",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
  },
  { key: "likes", label: "Likes", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "comments", label: "Comments", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { key: "shares", label: "Shares", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "followers", label: "New Followers", color: "bg-orange-50 text-orange-700 border-orange-200" },
] as const;

const chartMetricDefaults = ["errRateNumeric", "uniqueViewers"];

export function EngagementReportPanel({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  onPrev,
  onNext,
  activeReportBrandId,
  brandPerformanceLogs,
  brandUploadHistory,
  uploadHistory,
  isLogsLoading,
  onDeleteUploadBatch,
}: EngagementReportPanelProps) {
  return (
    <div className="space-y-6">
      <ReportPeriodNavigator
        title="Performance Engagement"
        label={model.engagementPeriodLabel}
        onPrev={onPrev}
        onNext={onNext}
      />

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" /> Interaksi (Engagement)
        </h4>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <ReportMetricCard
            label="Views"
            cur={model.totalImpressions}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalImpressions)}
          />
          <ReportMetricCard
            label="Likes"
            cur={model.totalLikes}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalLikes)}
          />
          <ReportMetricCard
            label="Shares"
            cur={model.totalShares}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalShares)}
          />
          <ReportMetricCard
            label="Comments"
            cur={model.totalComments}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalComments)}
          />
          <ReportMetricCard
            label="New Followers"
            cur={model.totalFollowers}
            prev={0}
            value={new Intl.NumberFormat("id-ID").format(model.totalFollowers)}
          />
          <ReportMetricCard
            label="ERR %"
            cur={Number(model.formattedErrRate.replace("%", "")) || 0}
            prev={0}
            value={model.formattedErrRate}
          />
        </div>
      </div>

      {model.chartData.length > 0 && (
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
                {chartMetricOptions.map((metric) => {
                  const isSelected = chartSelectedMetrics.includes(metric.key);
                  return (
                    <button
                      key={metric.key}
                      onClick={() => {
                        if (isSelected) {
                          if (chartSelectedMetrics.length > 1) {
                            onChartSelectedMetricsChange(
                              chartSelectedMetrics.filter((item) => item !== metric.key),
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
                    onChartSelectedMetricsChange([...chartMetricDefaults])
                  }
                  className="text-slate-500 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div className="hidden">
            <p />
          </div>
          <div className="hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
              <span>ERR %</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
              <span>Unique Viewers</span>
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
      )}

      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
          <Gift className="w-5 h-5 text-indigo-500" /> Promosi (Vouchers & Koin)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Voucher Toko Diklaim
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {new Intl.NumberFormat("id-ID").format(model.totalShopVouchers)}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Voucher Spesial Live Diklaim
            </div>
            <div className="text-xl font-black text-slate-800 mt-1">
              {new Intl.NumberFormat("id-ID").format(model.totalSpecialVouchers)}
            </div>
          </div>
          <div className="bg-slate-50 border border-amber-100 rounded-xl p-4 bg-amber-50/30">
            <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">
              Koin Diklaim
            </div>
            <div className="text-lg font-black text-amber-700">
              {new Intl.NumberFormat("id-ID").format(model.totalCoinsClaimed)}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <div className="text-xs text-slate-400 font-semibold italic text-center">
          Menampilkan metrik agregat Engagement dan Promosi dari file Raw Data
          yang diunggah. Filter periode dan platform yang sama seperti di tab
          Live/Product berlaku di data ini.
        </div>
      </div>

      <ReportEngagementUploadHistory
        activeReportBrandId={activeReportBrandId}
        brandPerformanceLogs={brandPerformanceLogs}
        brandUploadHistory={brandUploadHistory}
        uploadHistory={uploadHistory}
        isLogsLoading={isLogsLoading}
        onDeleteUploadBatch={onDeleteUploadBatch}
      />
    </div>
  );
}

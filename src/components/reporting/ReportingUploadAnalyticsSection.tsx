import {
  CartesianGrid,
  Legend,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";

import { HorizontalFunnel } from "../branding/BrandGraphics";
import type { ReportingRawRow } from "../../shared/types/reporting";
import type { ReportingUploadSummary } from "../../shared/utils/reportingUploadSummary";

type ReportingUploadAnalyticsSectionProps = {
  reportingRawData: readonly ReportingRawRow[];
  reportingUploadSummary: ReportingUploadSummary;
  saveTargetPlatform: string;
  uploadTargetTab: "live" | "engagement";
  activeReportPlatform: string;
};

const idFormat = new Intl.NumberFormat("id-ID");
const idCurrencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
});

export function ReportingUploadAnalyticsSection({
  reportingRawData,
  reportingUploadSummary,
  saveTargetPlatform,
  uploadTargetTab,
  activeReportPlatform,
}: ReportingUploadAnalyticsSectionProps) {
  return (
    <>
      {/* STATS OVERVIEW */}
      {uploadTargetTab === "engagement" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Impressions / Tayangan
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(reportingUploadSummary.totalViewerReach)}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Interaksi (Like+Komen+Share)
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(reportingUploadSummary.totalInteractions)}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Pengikut Baru
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              +{idFormat.format(reportingUploadSummary.totalFollowers)}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Voucher Toko & Spesial Diklaim
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(
                reportingUploadSummary.totalShopVouchers +
                  reportingUploadSummary.totalSpecialVouchers,
              )}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Koin Diklaim
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(reportingUploadSummary.totalCoinsClaimed)}
            </h3>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Perolehan GMV
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idCurrencyFormat.format(reportingUploadSummary.totalGmv)}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Produk Terjual
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(reportingUploadSummary.totalProductsSold)}{" "}
              <span className="text-xs font-bold text-slate-400 ml-1">
                pcs
              </span>
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Pembeli
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idFormat.format(reportingUploadSummary.totalBuyers)}{" "}
              <span className="text-xs font-bold text-slate-400 ml-1">
                users
              </span>
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Capaian AOV Rata-rata
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {idCurrencyFormat.format(reportingUploadSummary.averageAov)}
            </h3>
          </div>
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              AVG TIME/VIEWER
            </p>
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2">
              {reportingUploadSummary.averageViewDuration}{" "}
              <span className="text-xs font-bold text-slate-400 ml-1">
                detik
              </span>
            </h3>
          </div>
        </div>
      )}

      {saveTargetPlatform === "TikTok Live" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl text-left shadow-lg relative overflow-hidden dark:bg-slate-950">
          <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="col-span-2 md:col-span-4 flex items-center justify-between pb-2 border-b border-white/10">
            <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" /> TikTok
              Shop Liveroom Metrics
            </h5>
            <span className="text-[8px] font-black text-indigo-300 uppercase bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
              Live Performance
            </span>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-pink-300">
              Penonton Sesi (Views)
            </p>
            <h3 className="text-lg sm:text-xl font-black text-white font-mono mt-0.5">
              {idFormat.format(reportingUploadSummary.totalViews || reportingUploadSummary.totalViewerReach)}
            </h3>
            <p className="text-[8px] text-slate-500 font-semibold mt-0.5">
              Views
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-green-300">
              Product Clicks
            </p>
            <h3 className="text-lg sm:text-xl font-black text-green-400 font-mono mt-0.5">
              {idFormat.format(reportingUploadSummary.totalClicks)}
            </h3>
            <p className="text-[8px] text-green-300 font-semibold mt-0.5">
              Klik produk
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-rose-300">
              Attributed Orders
            </p>
            <h3 className="text-lg sm:text-xl font-black text-pink-400 font-mono mt-0.5">
              {idFormat.format(reportingUploadSummary.totalBuyerConversions)}
            </h3>
            <p className="text-[8px] text-pink-300 font-semibold mt-0.5">
              Pesanan teratribusi
            </p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-cyan-300">
              Convertion Rate
            </p>
            <h3 className="text-lg sm:text-xl font-black text-cyan-400 font-mono mt-0.5">
              {reportingUploadSummary.overallCvr.toFixed(2)}%
            </h3>
            <p className="text-[8px] text-cyan-300 font-semibold mt-0.5 max-w-full truncate">
              Views to Orders
            </p>
          </div>
        </div>
      )}

      {saveTargetPlatform === "Shopee Live" &&
        uploadTargetTab === "engagement" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 bg-orange-600 p-5 rounded-2xl text-left shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="col-span-2 sm:col-span-4 lg:col-span-8 flex items-center justify-between pb-2 border-b border-white/25">
              <h5 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-white animate-pulse" /> Shopee
                Live Interaction & Promotion Metrics
              </h5>
              <span className="text-[8px] font-black text-white uppercase bg-white/20 px-2 py-0.5 rounded border border-white/30">
                Engagement & Promotion
              </span>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Likes
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {idFormat.format(reportingUploadSummary.totalLikes)}
              </h3>
              <p className="text-[8px] text-orange-200 mt-0.5 font-semibold">
                Total Likes
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Comments
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {idFormat.format(reportingUploadSummary.totalComments)}
              </h3>
              <p className="text-[8px] text-orange-200 mt-0.5 font-semibold">
                Total Komen
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Membagikan (Shares)
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {idFormat.format(reportingUploadSummary.totalShares)}
              </h3>
              <p className="text-[8px] text-orange-200 mt-0.5 font-semibold">
                Total Share
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Pengikut Baru
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                +{idFormat.format(reportingUploadSummary.totalFollowers)}
              </h3>
              <p className="text-[8px] text-orange-200 mt-0.5 font-semibold">
                New Followers
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Penonton Tertinggi
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {idFormat.format(reportingUploadSummary.peakViewers)}
              </h3>
              <p className="text-[8px] text-orange-200 mt-0.5 font-semibold">
                Penonton Terbanyak
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Voucher Diklaim
              </p>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono mt-0.5">
                {idFormat.format(
                  reportingUploadSummary.totalShopVouchers +
                    reportingUploadSummary.totalSpecialVouchers,
                )}
              </h3>
              <p className="text-[8px] text-orange-200 font-semibold mt-0.5">
                Toko & Spesial Live
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">
                Koin Diklaim
              </p>
              <h3 className="text-base sm:text-lg font-bold text-yellow-300 font-mono mt-0.5">
                {idFormat.format(reportingUploadSummary.totalCoinsClaimed)}
              </h3>
              <p className="text-[8px] text-orange-200 font-semibold mt-0.5">
                Coin Reward
              </p>
            </div>
            <div className="bg-white/15 p-2 rounded-xl border border-white/20">
              <p className="text-[9px] font-black text-yellow-250 uppercase tracking-widest leading-none mb-1">
                ERR %
              </p>
              <h3 className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
                {reportingUploadSummary.engagementErrRate.toFixed(2)}%
              </h3>
              <p className="text-[7px] text-orange-150 leading-normal font-bold mt-0.5 uppercase tracking-wide">
                (Like + Comment + Share + Follow) / Unique Viewers
              </p>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[350px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-800 mb-6 text-left">
              Tren GMV & Transaksi Harian
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart
                  data={[...reportingRawData].sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime(),
                  )}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                      fontWeight: "bold",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                      fontWeight: "bold",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rp${(val / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fontSize: 10,
                      fill: "#64748b",
                      fontWeight: "bold",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | string, name: string) => [
                      name === "GMV"
                        ? idCurrencyFormat.format(Number(value))
                        : value,
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  />
                  <RechartsLine
                    yAxisId="left"
                    type="monotone"
                    name="GMV"
                    dataKey="gmv"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={false}
                  />
                  <RechartsLine
                    yAxisId="right"
                    type="monotone"
                    name="Produk Terjual"
                    dataKey="products_sold"
                    stroke="#ec4899"
                    strokeWidth={3}
                    dot={false}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

          <HorizontalFunnel
            title="Corong Konversi Live (Funnel)"
            subtitle={`${saveTargetPlatform || activeReportPlatform || "Live"} Performance`}
            tag={
              reportingRawData?.some((r) => r.hasFunnelInFile)
              ? "Parsed Excel"
              : "Benchmark Estimate"
          }
          steps={
            saveTargetPlatform === "TikTok Live" ||
            activeReportPlatform === "TikTok Live"
              ? [
                  {
                    label: "Views",
                    value: idFormat.format(
                      reportingUploadSummary.totalViews ||
                        reportingUploadSummary.totalViewerReach,
                    ),
                    raw:
                      reportingUploadSummary.totalViews ||
                      reportingUploadSummary.totalViewerReach,
                  },
                  {
                    label: "Product clicks",
                    value: idFormat.format(reportingUploadSummary.totalClicks),
                    raw: reportingUploadSummary.totalClicks,
                  },
                  {
                    label: "Attributed orders",
                    value: idFormat.format(
                      reportingUploadSummary.totalBuyerConversions,
                    ),
                    raw: reportingUploadSummary.totalBuyerConversions,
                  },
                  {
                    label: "Convertion Rate",
                    value: `${reportingUploadSummary.overallCvr.toFixed(2)}%`,
                    raw: reportingUploadSummary.overallCvr,
                  },
              ]
              : [
                  {
                    label: "Total Viewers",
                    value: idFormat.format(reportingUploadSummary.totalViewerReach),
                    raw: reportingUploadSummary.totalViewerReach,
                  },
                  {
                    label: "Active Viewers",
                    value: idFormat.format(reportingUploadSummary.totalLiveVisits),
                    raw: reportingUploadSummary.totalLiveVisits,
                  },
                  {
                    label: "Add To Cart",
                    value: idFormat.format(reportingUploadSummary.totalClicks),
                    raw: reportingUploadSummary.totalClicks,
                  },
                  {
                    label: "Orders",
                    value: idFormat.format(reportingUploadSummary.totalOrders),
                    raw: reportingUploadSummary.totalOrders,
                  },
                ]
          }
        />
      </div>
    </>
  );
}

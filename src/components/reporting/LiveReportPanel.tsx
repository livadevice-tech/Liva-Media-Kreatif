import {
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart as RechartsLineChart,
} from "recharts";
import { Calculator, Clock, ClipboardList, DollarSign, Package, Percent, Sliders, TrendingUp } from "lucide-react";
import { ReportFiltersBar } from "./ReportFiltersBar";
import { ReportMetricCard } from "./ReportMetricCard";
import { ReportPeriodNavigator } from "./ReportPeriodNavigator";
import { ReportRawSessionsCard } from "./ReportRawSessionsCard";
import { ShopeeLiveMetricsGrid } from "./ShopeeLiveMetricsGrid";
import { HorizontalFunnel } from "../branding/BrandGraphics";
import { UploadHistoryCard } from "./UploadHistoryCard";
import { buildReportChartData, getNextSortState, sortReportLogs, type ReportLogLike } from "../../shared/utils/reportTable";
import { getReportPeriodLabel } from "../../shared/utils/reportDateFilters";
import type { BrandPerformanceLogEntry, UploadHistoryEntry } from "../../shared/types/reporting";
import type { LiveReportViewModel } from "../../shared/utils/liveReporting";

interface LiveReportPanelProps {
  model: LiveReportViewModel;
  chartSelectedMetrics: string[];
  onChartSelectedMetricsChange: (value: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
  reportDbSearchQuery: string;
  onSearchQueryChange: (value: string) => void;
  operatorPlatformFilter: string;
  onPlatformFilterChange: (value: string) => void;
  availableOperatorPlatforms: string[];
  operatorDateFilterType: "all" | "latest" | "month" | "custom";
  onDateFilterTypeSelect: (value: "all" | "latest" | "month" | "custom") => void;
  operatorMonthPickerYear: number;
  setOperatorMonthPickerYear: (value: number | ((prev: number) => number)) => void;
  operatorSelectedMonth: string;
  setOperatorSelectedMonth: (value: string) => void;
  isOperatorMonthOpen: boolean;
  setIsOperatorMonthOpen: (value: boolean) => void;
  isOperatorCalendarOpen: boolean;
  setIsOperatorCalendarOpen: (value: boolean) => void;
  operatorCustomStartDate: string;
  operatorCustomEndDate: string;
  operatorTempStartDate: string;
  operatorTempEndDate: string;
  setOperatorTempStartDate: (value: string) => void;
  setOperatorTempEndDate: (value: string) => void;
  setOperatorCustomStartDate: (value: string) => void;
  setOperatorCustomEndDate: (value: string) => void;
  shifts: string[];
  adminShiftChecklist: string[];
  setAdminShiftChecklist: (value: string[]) => void;
  reportingShopeeRawTab: "day" | "shift" | "dayOfWeek" | "raw";
  setReportingShopeeRawTab: (
    value: "day" | "shift" | "dayOfWeek" | "raw",
  ) => void;
  reportDbSortCol: string;
  reportDbSortAsc: boolean;
  setReportDbSortCol: (value: string) => void;
  setReportDbSortAsc: (value: boolean) => void;
  currentPage: number;
  setCurrentPage: (value: number | ((prev: number) => number)) => void;
  itemsPerPage: number;
  isLogsLoading: boolean;
  handleDeletePerformanceLog: (
    id: string,
    brandName?: string,
    date?: string,
  ) => void;
  brandPerformanceLogs: BrandPerformanceLogEntry[];
  activeReportBrandId: string;
  brandUploadHistory: UploadHistoryEntry[];
  uploadHistory: UploadHistoryEntry[];
  onDeleteUploadBatch: (
    id: string,
    fileName: string,
    rowCount: number,
  ) => void;
}

export function LiveReportPanel({
  model,
  chartSelectedMetrics,
  onChartSelectedMetricsChange,
  onPrev,
  onNext,
  reportDbSearchQuery,
  onSearchQueryChange,
  operatorPlatformFilter,
  onPlatformFilterChange,
  availableOperatorPlatforms,
  operatorDateFilterType,
  onDateFilterTypeSelect,
  operatorMonthPickerYear,
  setOperatorMonthPickerYear,
  operatorSelectedMonth,
  setOperatorSelectedMonth,
  isOperatorMonthOpen,
  setIsOperatorMonthOpen,
  isOperatorCalendarOpen,
  setIsOperatorCalendarOpen,
  operatorCustomStartDate,
  operatorCustomEndDate,
  operatorTempStartDate,
  operatorTempEndDate,
  setOperatorTempStartDate,
  setOperatorTempEndDate,
  setOperatorCustomStartDate,
  setOperatorCustomEndDate,
  shifts,
  adminShiftChecklist,
  setAdminShiftChecklist,
  reportingShopeeRawTab,
  setReportingShopeeRawTab,
  reportDbSortCol,
  reportDbSortAsc,
  setReportDbSortCol,
  setReportDbSortAsc,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  isLogsLoading,
  handleDeletePerformanceLog,
  brandPerformanceLogs,
  activeReportBrandId,
  brandUploadHistory,
  uploadHistory,
  onDeleteUploadBatch,
}: LiveReportPanelProps) {
  const totalSessionsDb = model.tableLogs.length;
  const totalGmvDb = model.tableLogs.reduce((sum, item) => sum + (item.gmv || 0), 0);
  const totalBuyersDb = model.tableLogs.reduce((sum, item) => sum + (item.buyers || 0), 0);
  const totalOrdersDb = model.tableLogs.reduce((sum, item) => sum + (item.orders || item.buyers || 0), 0);
  const totalItemsSoldDb = model.tableLogs.reduce((sum, item) => sum + (item.products_sold || 0), 0);
  const totalLikesDb = model.tableLogs.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalCommentsDb = model.tableLogs.reduce((sum, item) => sum + (item.comments || 0), 0);
  const totalSharesDb = model.tableLogs.reduce((sum, item) => sum + (item.shares || 0), 0);
  const totalClicksDb = model.tableLogs.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const avgViewDurationDb = totalSessionsDb > 0 ? model.tableLogs.reduce((sum, item) => sum + (item.avgViewDuration || 0), 0) / totalSessionsDb : 0;
  const pTotalGmvDb = model.prevTableLogs.reduce((sum, item) => sum + (item.gmv || 0), 0);
  const pTotalBuyersDb = model.prevTableLogs.reduce((sum, item) => sum + (item.buyers || 0), 0);
  const pTotalOrdersDb = model.prevTableLogs.reduce((sum, item) => sum + (item.orders || item.buyers || 0), 0);
  const pTotalItemsSoldDb = model.prevTableLogs.reduce((sum, item) => sum + (item.products_sold || 0), 0);
  const pTotalLikesDb = model.prevTableLogs.reduce((sum, item) => sum + (item.likes || 0), 0);
  const pTotalCommentsDb = model.prevTableLogs.reduce((sum, item) => sum + (item.comments || 0), 0);
  const pTotalSharesDb = model.prevTableLogs.reduce((sum, item) => sum + (item.shares || 0), 0);
  const pTotalClicksDb = model.prevTableLogs.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const pAvgViewDurationDb = model.prevTableLogs.length > 0 ? model.prevTableLogs.reduce((sum, item) => sum + (item.avgViewDuration || 0), 0) / model.prevTableLogs.length : 0;

  const isShopee = operatorPlatformFilter
    ? operatorPlatformFilter.toLowerCase().includes("shopee")
    : model.filteredDb.some((log) => log.platform && log.platform.toLowerCase().includes("shopee"));

  const totalDbImpressions = model.tableLogs.reduce((acc, curr) => {
    const shopee = curr.platform && curr.platform.toLowerCase().includes("shopee");
    return acc + (shopee ? (curr.penonton || curr.impressions || curr.views || 0) : (curr.impressions || curr.views || curr.liveVisits || curr.penonton || 0));
  }, 0);
  const totalDbLiveVisits = model.tableLogs.reduce((acc, curr) => acc + (curr.liveVisits || 0), 0);
  const totalDbProductImpressions = model.tableLogs.reduce((acc, curr) => acc + (curr.productImpressions || 0), 0);
  const totalDbClicks = model.tableLogs.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalDbOrdersFunnel = model.tableLogs.reduce((acc, curr) => acc + (curr.orders || curr.buyers || 0), 0);
  const pTotalDbImpressions = model.prevTableLogs.reduce((acc, curr) => {
    const shopee = curr.platform && curr.platform.toLowerCase().includes("shopee");
    return acc + (shopee ? (curr.penonton || curr.impressions || curr.views || 0) : (curr.impressions || curr.views || curr.liveVisits || curr.penonton || 0));
  }, 0);
  const totalDbDuration = model.tableLogs.reduce((acc, curr) => {
    let dur = curr.duration || 0;
    if (dur > 0 && dur < 1) dur *= 86400;
    return acc + dur;
  }, 0);
  const pTotalDbDuration = model.prevTableLogs.reduce((acc, curr) => {
    let dur = curr.duration || 0;
    if (dur > 0 && dur < 1) dur *= 86400;
    return acc + dur;
  }, 0);
  const gmvPerHour = totalDbDuration > 0 ? totalGmvDb / (totalDbDuration / 3600) : 0;
  const pGmvPerHour = pTotalDbDuration > 0 ? pTotalGmvDb / (pTotalDbDuration / 3600) : 0;
  const avgAovDb = totalBuyersDb > 0 ? totalGmvDb / totalBuyersDb : 0;
  const pAvgAovDb = pTotalBuyersDb > 0 ? pTotalGmvDb / pTotalBuyersDb : 0;
  const conversionRateShopee = totalDbImpressions > 0 ? (totalDbOrdersFunnel / totalDbImpressions) * 100 : 0;
  const pConversionRateShopee = pTotalDbImpressions > 0 ? (pTotalOrdersDb / pTotalDbImpressions) * 100 : 0;

  const chartData = buildReportChartData(model.tableLogs);
  const sortedTableLogs = sortReportLogs(model.tableLogs, reportDbSortCol, reportDbSortAsc);
  const paginatedLogs = sortedTableLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(sortedTableLogs.length / itemsPerPage);
  const handleSort = (col: string) => {
    const nextSort = getNextSortState(reportDbSortCol, reportDbSortAsc, col);
    setReportDbSortCol(nextSort.sortKey);
    setReportDbSortAsc(nextSort.sortAsc);
  };

  return (
    <div className="px-6 sm:px-8 space-y-6 animate-fadeIn pb-8">
      <ReportFiltersBar
        searchQuery={reportDbSearchQuery}
        onSearchQueryChange={onSearchQueryChange}
        platformFilter={operatorPlatformFilter}
        onPlatformFilterChange={onPlatformFilterChange}
        availablePlatforms={availableOperatorPlatforms}
        dateFilterType={operatorDateFilterType}
        onDateFilterTypeSelect={onDateFilterTypeSelect}
        monthPickerYear={operatorMonthPickerYear}
        setMonthPickerYear={setOperatorMonthPickerYear}
        selectedMonth={operatorSelectedMonth}
        setSelectedMonth={setOperatorSelectedMonth}
        isMonthOpen={isOperatorMonthOpen}
        setIsMonthOpen={setIsOperatorMonthOpen}
        isCalendarOpen={isOperatorCalendarOpen}
        setIsCalendarOpen={setIsOperatorCalendarOpen}
        customStartDate={operatorCustomStartDate}
        customEndDate={operatorCustomEndDate}
        tempStartDate={operatorTempStartDate}
        tempEndDate={operatorTempEndDate}
        onTempStartDateChange={setOperatorTempStartDate}
        onTempEndDateChange={setOperatorTempEndDate}
        onApplyCustom={(start, end) => {
          setOperatorCustomStartDate(start);
          setOperatorCustomEndDate(end);
          setIsOperatorCalendarOpen(false);
        }}
        onCancelCustom={() => setIsOperatorCalendarOpen(false)}
      />

      <div className="space-y-6 mb-6">
        <ReportPeriodNavigator
          title={isShopee ? "Performance live" : "Sale Metrics"}
        label={getReportPeriodLabel({
            dateFilterType: operatorDateFilterType,
            latestDateLabel: model.latestDateLabel,
            targetLatestDate: model.targetLatestDate,
            customStartDate: operatorCustomStartDate,
          })}
          onPrev={onPrev}
          onNext={onNext}
        />

        {isShopee ? (
          <>
            <ShopeeLiveMetricsGrid
              metrics={[
                { title: "GMV", value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)}`, current: totalGmvDb, previous: pTotalGmvDb, periodLabel: model.latestDateLabel, icon: <DollarSign className="h-5 w-5" />, tone: "emerald" },
                { title: "Item Solds", value: new Intl.NumberFormat("id-ID").format(totalItemsSoldDb), current: totalItemsSoldDb, previous: pTotalItemsSoldDb, periodLabel: model.latestDateLabel, icon: <Package className="h-5 w-5" />, tone: "amber" },
                { title: "GMV/Hours", value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(gmvPerHour)}`, current: gmvPerHour, previous: pGmvPerHour, periodLabel: model.latestDateLabel, icon: <Clock className="h-5 w-5" />, tone: "blue" },
                { title: "Conversion Rate %", value: `${conversionRateShopee.toFixed(2)}%`, current: conversionRateShopee, previous: pConversionRateShopee, periodLabel: model.latestDateLabel, icon: <Percent className="h-5 w-5" />, tone: "indigo" },
                { title: "Orders", value: new Intl.NumberFormat("id-ID").format(totalOrdersDb), current: totalOrdersDb, previous: pTotalOrdersDb, periodLabel: model.latestDateLabel, icon: <ClipboardList className="h-5 w-5" />, tone: "violet" },
                { title: "Avg. Viewer Duration", value: `${avgViewDurationDb.toFixed(2)}s`, current: avgViewDurationDb, previous: pAvgViewDurationDb, periodLabel: model.latestDateLabel, icon: <TrendingUp className="h-5 w-5" />, tone: "rose" },
                { title: "AOV", value: `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)}`, current: avgAovDb, previous: pAvgAovDb, periodLabel: model.latestDateLabel, icon: <Calculator className="h-5 w-5" />, tone: "green" },
              ]}
            />
            {totalDbImpressions > 0 && (
              <HorizontalFunnel
                title=""
                subtitle=""
                steps={[
                  { label: "Viewer", value: new Intl.NumberFormat("id-ID").format(totalDbImpressions), raw: totalDbImpressions },
                  { label: "Viewer Enganged", value: new Intl.NumberFormat("id-ID").format(totalDbLiveVisits), raw: totalDbLiveVisits },
                  { label: "Add To Card", value: new Intl.NumberFormat("id-ID").format(totalDbClicks), raw: totalDbClicks },
                  { label: "Purchase", value: new Intl.NumberFormat("id-ID").format(totalDbOrdersFunnel), raw: totalDbOrdersFunnel },
                ]}
              />
            )}
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
              <ReportMetricCard label="GMV" cur={totalGmvDb} prev={pTotalGmvDb} prefix="Rp " value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(totalGmvDb)} />
              <ReportMetricCard label="Item Sold" cur={totalItemsSoldDb} prev={pTotalItemsSoldDb} value={new Intl.NumberFormat("id-ID").format(totalItemsSoldDb)} />
              <ReportMetricCard label="Customers" cur={totalBuyersDb} prev={pTotalBuyersDb} value={new Intl.NumberFormat("id-ID").format(totalBuyersDb)} />
              <ReportMetricCard label="SKU Orders" cur={totalOrdersDb} prev={pTotalOrdersDb} value={new Intl.NumberFormat("id-ID").format(totalOrdersDb)} />
              <ReportMetricCard label="AOV" cur={avgAovDb} prev={pAvgAovDb} prefix="Rp " value={new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(avgAovDb)} />
            </div>
            <div>
              <h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest mt-8">
                Engagement Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                <ReportMetricCard label="Like" cur={totalLikesDb} prev={pTotalLikesDb} value={new Intl.NumberFormat("id-ID").format(totalLikesDb)} />
                <ReportMetricCard label="Comment" cur={totalCommentsDb} prev={pTotalCommentsDb} value={new Intl.NumberFormat("id-ID").format(totalCommentsDb)} />
                <ReportMetricCard label="Share" cur={totalSharesDb} prev={pTotalSharesDb} value={new Intl.NumberFormat("id-ID").format(totalSharesDb)} />
                <ReportMetricCard label="Product Clicks" cur={totalClicksDb} prev={pTotalClicksDb} value={new Intl.NumberFormat("id-ID").format(totalClicksDb)} />
                <ReportMetricCard label="AVG TIME/VIEWER" cur={avgViewDurationDb} prev={pAvgViewDurationDb} value={Math.round(avgViewDurationDb).toString()} suffix=" detik" />
              </div>
            </div>
          </>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Tren Kinerja Penjualan Live Harian
              </h4>
              <p className="text-[11px] text-slate-400 font-bold mt-1">
                Visualisasi harian data penyiaran langsung (Live Streaming) dinamis harian.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 max-w-full">
              <div className="flex items-center gap-1 mr-1 select-none">
                <Sliders className="w-3.5 h-3.5 text-indigo-500/80" />
                <span className="text-[10px] font-black uppercase text-slate-550 tracking-wider">Metrik:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[{ key: "gmv", label: "GMV", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }, { key: "orders", label: "Pesanan", color: "bg-indigo-50 text-indigo-700 border-indigo-200" }, { key: "itemsSold", label: "Produk", color: "bg-amber-50 text-amber-700 border-amber-200" }, { key: "clicks", label: "Klik", color: "bg-pink-50 text-pink-700 border-pink-200" }, { key: "penonton", label: "Penonton", color: "bg-cyan-50 text-cyan-750 border-cyan-200" }].map((m) => {
                  const isSelected = chartSelectedMetrics.includes(m.key);
                  return (
                    <button key={m.key} onClick={() => {
                      if (isSelected) {
                        if (chartSelectedMetrics.length > 1) {
                          onChartSelectedMetricsChange(chartSelectedMetrics.filter((x) => x !== m.key));
                        }
                      } else {
                        onChartSelectedMetricsChange([...chartSelectedMetrics, m.key]);
                      }
                    }} className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer select-none flex items-center gap-1 ${isSelected ? `${m.color} scale-[1.02] shadow-xs font-extrabold` : "bg-white text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-50"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.key === "gmv" ? "bg-emerald-500" : m.key === "orders" ? "bg-indigo-600" : m.key === "itemsSold" ? "bg-amber-500" : m.key === "clicks" ? "bg-pink-500" : "bg-cyan-500"}`} />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[10px] sm:border-l sm:border-slate-200 sm:pl-2.5 ml-auto font-bold text-slate-500">
                <button onClick={() => onChartSelectedMetricsChange(["gmv", "orders", "itemsSold", "clicks", "penonton"])} className="text-indigo-600 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black">Semua</button>
                <span>|</span>
                <button onClick={() => onChartSelectedMetricsChange(["gmv", "orders"])} className="text-slate-500 uppercase tracking-widest hover:underline bg-transparent border-0 cursor-pointer text-[9px] font-black">Reset</button>
              </div>
            </div>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={model.liveChartData} margin={{ top: 10, right: 35, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b", fontWeight: "bold" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#10b981", fontWeight: "bold" }} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${new Intl.NumberFormat("id-ID", { notation: "compact" }).format(val)}`} hide={!chartSelectedMetrics.includes("gmv")} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#4f46e5", fontWeight: "bold" }} axisLine={false} tickLine={false} tickFormatter={(val: number) => new Intl.NumberFormat("id-ID", { notation: "compact" }).format(val)} />
                <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontWeight: "bold", fontSize: "11px" }} formatter={(value: number | string, name: string) => [name === "GMV (Pendapatan)" ? `Rp${new Intl.NumberFormat("id-ID").format(Number(value))}` : new Intl.NumberFormat("id-ID").format(Number(value)), name]} />
                <Line yAxisId="left" type="monotone" name="GMV (Pendapatan)" dataKey="gmv" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} hide={!chartSelectedMetrics.includes("gmv")} />
                <Line yAxisId="right" type="monotone" name="Pesanan (Orders)" dataKey="orders" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }} hide={!chartSelectedMetrics.includes("orders")} />
                <Line yAxisId="right" type="monotone" name="Produk Terjual" dataKey="itemsSold" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }} hide={!chartSelectedMetrics.includes("itemsSold")} />
                <Line yAxisId="right" type="monotone" name="Klik Produk" dataKey="clicks" stroke="#ec4899" strokeWidth={3} dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "#fff" }} hide={!chartSelectedMetrics.includes("clicks")} />
                <Line yAxisId="right" type="monotone" name="Penonton (Views)" dataKey="penonton" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }} hide={!chartSelectedMetrics.includes("penonton")} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <ReportRawSessionsCard
        reportingShopeeRawTab={reportingShopeeRawTab}
        setReportingShopeeRawTab={setReportingShopeeRawTab}
        shifts={shifts}
        adminShiftChecklist={adminShiftChecklist}
        setAdminShiftChecklist={setAdminShiftChecklist}
        sortedTableLogs={sortedTableLogs as ReportLogLike[]}
        paginatedLogs={paginatedLogs as ReportLogLike[]}
        isLogsLoading={isLogsLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        reportDbSortCol={reportDbSortCol}
        reportDbSortAsc={reportDbSortAsc}
        onSort={handleSort}
        onDeletePerformanceLog={handleDeletePerformanceLog}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      <UploadHistoryCard
        title="Riwayat Upload Data Mentah"
        description="History file CSV raw data performa yang telah berhasil dikonversi & masuk ke database sentral."
        histories={brandUploadHistory.filter((history) => history.brandId === activeReportBrandId)}
        isLoading={isLogsLoading}
        emptyMessage="Belum ada riwayat upload untuk brand ini."
        onDeleteBatch={onDeleteUploadBatch}
      />
    </div>
  );
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDisplayDate, getLogTimestamp, filterLogsByDateAndShift, type DateSpecificShiftRule } from "./appUi";
import { formatLiveSessionDuration, getLiveSessionMetrics } from "./liveSessionsTable";

export function exportReportToPdf({
  reportType,
  selectedMetrics,
  brandName,
  liveReportView,
  productReportView,
  engagementReportView,
  dateFilterType,
  selectedLatestDate,
  platformFilter,
  exportMode = "sessions",
  sortOrder = "desc",
  shiftFilters,
  dateShiftRules,
  dateShiftScope = "merged",
}: {
  reportType: "live" | "product" | "engagement" | "pipeline";
  selectedMetrics: string[];
  brandName: string;
  liveReportView?: any;
  productReportView?: any;
  engagementReportView?: any;
  dateFilterType?: string;
  selectedLatestDate?: string;
  platformFilter?: string;
  exportMode?: "sessions" | "daily";
  sortOrder?: "desc" | "asc";
  shiftFilters?: string[];
  dateShiftRules?: DateSpecificShiftRule[];
  dateShiftScope?: "specific_only" | "merged";
}) {
  let dataToExport: any[] = [];
  const cleanBrand = brandName ? brandName.replace(/[^a-zA-Z0-9_-]/g, "_") : "Brand";
  const isTargetTikTok = (platformFilter || "").toLowerCase().includes("tiktok");
  const isTargetShopee = (platformFilter || "").toLowerCase().includes("shopee");

  if (reportType === "live" && liveReportView) {
    let rawLogs = (liveReportView.tableLogs && liveReportView.tableLogs.length > 0)
      ? liveReportView.tableLogs
      : (liveReportView.filteredDb || []);

    if (dateShiftRules && dateShiftRules.length > 0) {
      rawLogs = filterLogsByDateAndShift(rawLogs, shiftFilters, dateShiftRules, dateShiftScope);
    }

    if (exportMode === "daily") {
      // Group by date (Akumulasi Per Hari)
      const groups: Record<string, any> = {};
      rawLogs.forEach((log: any) => {
        const dStr = String(log.dateTime || log.date || "");
        const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];
        let key = dPart;
        const dSplit = dPart.split("-");
        if (dSplit.length === 3) {
          if (dSplit[0].length === 4) {
            key = `${dSplit[2]}-${dSplit[1]}-${dSplit[0]}`;
          } else {
            key = `${dSplit[0]}-${dSplit[1]}-${dSplit[2]}`;
          }
        }
        if (!groups[key]) {
          groups[key] = {
            dateKey: key,
            rawDate: dPart,
            sessionCount: 0,
            duration: 0,
            viewer: 0,
            gmv: 0,
            itemsSold: 0,
            orders: 0,
            buyers: 0,
            clicks: 0,
            avgViewDurationSum: 0,
            platform: log.platform || "-",
          };
        }
        const g = groups[key];
        const m = getLiveSessionMetrics(log);
        g.sessionCount += 1;
        g.duration += (log.duration || 0);
        g.viewer += m.viewer;
        g.gmv += (log.gmv || 0);
        g.itemsSold += (log.products_sold || log.items_sold || 0);
        g.orders += m.orders;
        g.buyers += m.customers;
        g.clicks += m.clicks;
        g.avgViewDurationSum += (log.avgViewDuration || 0);
      });

      const sortedGroups = Object.values(groups).sort((a, b) => {
        const timeA = new Date(a.rawDate).getTime();
        const timeB = new Date(b.rawDate).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });

      dataToExport = sortedGroups.map((g, idx) => {
        const row: any = {};
        const isTikTok = isTargetTikTok || String(g.platform || "").toLowerCase().includes("tiktok");
        const isShopee = isTargetShopee || String(g.platform || "").toLowerCase().includes("shopee");
        const avgViewSec = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const convRate = isTikTok
          ? (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0)
          : (g.viewer > 0 ? (g.buyers / g.viewer) * 100 : 0);

        row["No"] = idx + 1;
        if (selectedMetrics.includes("date")) {
          row["Tanggal"] = g.dateKey;
        }
        row["Jumlah Sesi"] = g.sessionCount;
        if (selectedMetrics.includes("duration")) {
          row["Durasi Total"] = formatLiveSessionDuration(g.duration);
        }
        if (selectedMetrics.includes("platform")) {
          row["Platform"] = g.platform;
        }
        if (selectedMetrics.includes("gmv")) {
          row["GMV (Rp)"] = "Rp" + new Intl.NumberFormat("id-ID").format(g.gmv);
        }
        if (selectedMetrics.includes("items_sold")) {
          row["Item Terjual"] = new Intl.NumberFormat("id-ID").format(g.itemsSold);
        }
        if (selectedMetrics.includes("orders")) {
          row[isShopee ? "Purchase" : "Orders"] = new Intl.NumberFormat("id-ID").format(g.orders);
        }
        if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
          row[isShopee ? "Add to Cart" : "Product Clicks"] = new Intl.NumberFormat("id-ID").format(g.clicks);
        }
        if (selectedMetrics.includes("penonton")) {
          row[isShopee ? "Views" : isTikTok ? "Live Viewer" : "Viewer"] = new Intl.NumberFormat("id-ID").format(g.viewer);
        }
        if (selectedMetrics.includes("avg_view_duration")) {
          row["Avg. View"] = `${avgViewSec.toFixed(1)}s`;
        }
        if (selectedMetrics.includes("conversion_rate")) {
          row["CR (%)"] = `${convRate.toFixed(2)}%`;
        }
        return row;
      });
    } else {
      // PER SESI LIVE SAAT DI-START (INDIVIDUAL)
      const sortedLogs = [...rawLogs].sort((a, b) => {
        const timeA = getLogTimestamp(a);
        const timeB = getLogTimestamp(b);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });

      dataToExport = sortedLogs.map((log: any, idx: number) => {
        const row: any = {};
        const isTikTok = isTargetTikTok || String(log.platform || "").toLowerCase().includes("tiktok");
        const isShopee = isTargetShopee || String(log.platform || "").toLowerCase().includes("shopee");
        const m = getLiveSessionMetrics(log);
        const formattedStart = formatDisplayDate(log.dateTime || log.date, log.platform);

        row["No"] = idx + 1;
        if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
          row["Tanggal & Jam Mulai"] = formattedStart || log.dateTime || log.date || "-";
        } else {
          if (selectedMetrics.includes("date")) {
            row["Tanggal"] = log.date || (log.dateTime ? log.dateTime.split(" ")[0] : "-");
          }
          if (selectedMetrics.includes("time")) {
            row["Jam Mulai"] = log.dateTime && log.dateTime.includes(" ")
              ? log.dateTime.split(" ")[1]
              : "-";
          }
        }
        if (selectedMetrics.includes("platform")) {
          row["Platform"] = log.platform || (isShopee ? "Shopee Live" : isTikTok ? "TikTok Live" : "-");
        }
        if (selectedMetrics.includes("shift")) {
          row["Shift"] = log.shift || "-";
        }
        if (selectedMetrics.includes("duration")) {
          row["Durasi"] = formatLiveSessionDuration(log.duration || log.liveDuration || 0);
        }
        if (selectedMetrics.includes("gmv")) {
          row["GMV (Rp)"] = "Rp" + new Intl.NumberFormat("id-ID").format(log.gmv || 0);
        }
        if (selectedMetrics.includes("items_sold")) {
          row["Item Sold"] = new Intl.NumberFormat("id-ID").format(log.products_sold || log.items_sold || 0);
        }
        if (selectedMetrics.includes("orders")) {
          row[isShopee ? "Purchase" : "Orders"] = new Intl.NumberFormat("id-ID").format(m.orders);
        }
        if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
          row[isShopee ? "Add to Cart" : "Product Clicks"] = new Intl.NumberFormat("id-ID").format(m.clicks);
        }
        if (selectedMetrics.includes("penonton")) {
          row[isShopee ? "Views" : isTikTok ? "Live Viewer" : "Viewer"] = new Intl.NumberFormat("id-ID").format(m.viewer);
        }
        if (selectedMetrics.includes("avg_view_duration")) {
          row["Avg. View"] = `${(log.avgViewDuration || 0).toFixed(1)}s`;
        }
        if (selectedMetrics.includes("conversion_rate")) {
          row["CR (%)"] = `${m.conversionRate.toFixed(2)}%`;
        }

        return row;
      });
    }
  } else if (reportType === "product" && productReportView) {
    dataToExport = productReportView.aggregatedSkus.map((sku: any, idx: number) => {
      const row: any = {};
      row["No"] = idx + 1;
      row["SKU"] = sku.sku;
      row["Nama Produk"] = sku.productName || sku.name || "-";
      row["Terjual"] = sku.sold;
      row["Revenue (Rp)"] = "Rp" + new Intl.NumberFormat("id-ID").format(sku.revenue || 0);
      return row;
    });
  } else if (reportType === "engagement" && engagementReportView) {
    let rawEngLogs = (engagementReportView.tableLogs && engagementReportView.tableLogs.length > 0)
      ? engagementReportView.tableLogs
      : (engagementReportView.filteredDb || []);

    if (dateShiftRules && dateShiftRules.length > 0) {
      rawEngLogs = filterLogsByDateAndShift(rawEngLogs, shiftFilters, dateShiftRules, dateShiftScope);
    }

    const sortedEngLogs = [...rawEngLogs].sort((a, b) => {
      const timeA = getLogTimestamp(a);
      const timeB = getLogTimestamp(b);
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

    dataToExport = sortedEngLogs.map((log: any, idx: number) => {
      const row: any = {};
      const isTikTok = isTargetTikTok || String(log.platform || "").toLowerCase().includes("tiktok");
      const isShopee = isTargetShopee || String(log.platform || "").toLowerCase().includes("shopee");
      const formattedDate = formatDisplayDate(log.dateTime || log.date, log.platform);

      row["No"] = idx + 1;
      row["Tanggal & Jam Mulai"] = formattedDate || log.dateTime || log.date || "-";
      row["Platform"] = log.platform || "-";
      row[isShopee ? "Views" : "Live Viewer"] = new Intl.NumberFormat("id-ID").format(
        Math.max(log.impressions || 0, log.views || 0, log.liveVisits || 0, log.penonton || 0)
      );
      if (isShopee && log.peakViewers) {
        row["Peak Viewer"] = new Intl.NumberFormat("id-ID").format(log.peakViewers);
      }
      row["New Followers"] = new Intl.NumberFormat("id-ID").format(log.newFollowers || log.followers || 0);
      row["Comments"] = new Intl.NumberFormat("id-ID").format(log.comments || 0);
      row["Shares"] = new Intl.NumberFormat("id-ID").format(log.shares || 0);
      row["Likes"] = new Intl.NumberFormat("id-ID").format(log.likes || 0);
      return row;
    });
  }

  if (dataToExport.length === 0) return;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const headers = Object.keys(dataToExport[0]);
  const data = dataToExport.map((row) => Object.values(row));

  const platformLabel = isTargetShopee
    ? "Shopee Live"
    : isTargetTikTok
      ? "TikTok Live"
      : platformFilter && platformFilter !== "all"
        ? platformFilter
        : "";

  const getTitle = () => {
    switch (reportType) {
      case "live":
        return exportMode === "sessions"
          ? `Laporan ${platformLabel ? platformLabel + " " : ""}Per Sesi (Start Time) - ${brandName}`
          : `Laporan ${platformLabel ? platformLabel + " " : ""}Akumulasi Harian - ${brandName}`;
      case "product":
        return `Product Report - ${brandName}`;
      case "engagement":
        return `Engagement Report ${platformLabel ? "(" + platformLabel + ") " : ""}- ${brandName}`;
      case "pipeline":
        return `Pipeline Report - ${brandName}`;
      default:
        return `Report - ${brandName}`;
    }
  };

  doc.setFontSize(16);
  doc.text(getTitle(), 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 28,
    theme: "striped",
    headStyles: { fillColor: isTargetShopee ? [238, 77, 45] : isTargetTikTok ? [20, 20, 20] : [86, 0, 224] },
    styles: { fontSize: 8 },
  });

  const platformTag = isTargetShopee
    ? "Shopee_Live"
    : isTargetTikTok
      ? "TikTok_Live"
      : platformFilter && platformFilter !== "all"
        ? platformFilter.replace(/[^a-zA-Z0-9_-]/g, "_")
        : "";

  const modeSuffix = exportMode === "sessions" ? "_Per_Sesi" : "_Akumulasi_Harian";
  const fileName = reportType === "live"
    ? `${cleanBrand}_${platformTag ? platformTag + "_" : "live"}${modeSuffix}_report.pdf`
    : `${cleanBrand}_${platformTag ? platformTag + "_" : ""}${reportType}_report.pdf`;
  doc.save(fileName);
}

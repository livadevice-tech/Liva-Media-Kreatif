import * as XLSX from "xlsx";
import {
  formatDisplayDate,
  getLogTimestamp,
  normalizeDateYMD,
  filterLogsByDateAndShift,
  computeDurationCutoffs,
  formatDurationHoursMinutes,
  type DateSpecificShiftRule,
} from "./appUi";
import { formatLiveSessionDuration, getLiveSessionMetrics } from "./liveSessionsTable";

// Excel Number Format Codes
const FMT_CURRENCY_DECIMAL = '"Rp" #,##0.00';
const FMT_CURRENCY_INT = '"Rp" #,##0';
const FMT_INTEGER = '#,##0';
const FMT_DECIMAL_2 = '#,##0.00';
const FMT_PERCENT = '0.00"%"';
const FMT_DURATION = 'hh:mm:ss';
const FMT_DURATION_TOTAL = '[hh]:mm:ss';
const FMT_DATETIME = 'dd-mm-yyyy hh:mm:ss';
const FMT_DATE = 'dd-mm-yyyy';
const FMT_TIME = 'hh:mm:ss';

/**
 * Robustly parses various date/datetime string formats into a native JS Date object
 * for Excel cellDate export.
 */
function parseExcelDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const s = String(val).trim();
  if (!s || s === "-" || s === "Semua Hari" || s === "Semua Periode" || s.startsWith("Cut off")) return null;

  const [datePart, timePart = "00:00:00"] = s.includes("T")
    ? s.split("T")
    : s.split(" ");

  const dParts = datePart.split(/[-\/\.]/);
  if (dParts.length !== 3) return null;

  let y = 0, m = 0, d = 0;
  if (dParts[0].length === 4) {
    // YYYY-MM-DD
    y = parseInt(dParts[0], 10);
    m = parseInt(dParts[1], 10) - 1;
    d = parseInt(dParts[2], 10);
  } else if (dParts[2].length === 4 || dParts[2].length === 2) {
    // DD-MM-YYYY
    d = parseInt(dParts[0], 10);
    m = parseInt(dParts[1], 10) - 1;
    y = parseInt(dParts[2].length === 2 ? `20${dParts[2]}` : dParts[2], 10);
  } else {
    return null;
  }

  if (isNaN(y) || isNaN(m) || isNaN(d) || m < 0 || m > 11 || d < 1 || d > 31) {
    return null;
  }

  const cleanTime = timePart.replace(/\./g, ":");
  const tParts = cleanTime.split(":");
  const hh = parseInt(tParts[0] || "0", 10);
  const mm = parseInt(tParts[1] || "0", 10);
  const ss = parseInt(tParts[2] || "0", 10);

  const parsed = new Date(y, m, d, isNaN(hh) ? 0 : hh, isNaN(mm) ? 0 : mm, isNaN(ss) ? 0 : ss);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Parses time string (e.g. "05:21:13" or "05:21") into day fraction for Excel.
 */
function parseTimeToFraction(timeStr: string): number | null {
  if (!timeStr || timeStr === "-" || timeStr === "Berjalan") return null;
  const clean = timeStr.replace(/\./g, ":").trim();
  const parts = clean.split(":");
  if (parts.length >= 2) {
    const hh = parseInt(parts[0] || "0", 10);
    const mm = parseInt(parts[1] || "0", 10);
    const ss = parseInt(parts[2] || "0", 10);
    if (!isNaN(hh) && !isNaN(mm)) {
      return (hh * 3600 + mm * 60 + (isNaN(ss) ? 0 : ss)) / 86400;
    }
  }
  return null;
}

interface BatchRange {
  startRow: number; // 1-based row index in Excel
  endRow: number;   // 1-based row index in Excel
  sumRow: number;   // 1-based row index in Excel
  batch?: any;
}

export function exportReportToExcel({
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
  enableDurationCutoff = false,
  cutoffTargetHours = 360,
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
  enableDurationCutoff?: boolean;
  cutoffTargetHours?: number;
}) {
  let dataToExport: any[] = [];
  const batchRanges: BatchRange[] = [];
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
      // Group logs by date (Akumulasi Per Hari)
      const groups: Record<string, any> = {};
      rawLogs.forEach((log: any) => {
        const dStr = String(log.dateTime || log.date || "");
        const dPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];
        const normDate = normalizeDateYMD(dPart);
        const key = normDate
          ? `${normDate.split("-")[2]}-${normDate.split("-")[1]}-${normDate.split("-")[0]}`
          : dPart;
        if (!groups[key]) {
          groups[key] = {
            dateKey: key,
            rawDate: normDate || dPart,
            sessionCount: 0,
            duration: 0,
            viewer: 0,
            gmv: 0,
            itemsSold: 0,
            orders: 0,
            buyers: 0,
            clicks: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            followers: 0,
            avgViewDurationSum: 0,
            peakViewersMax: 0,
            shopVouchers: 0,
            productImpressions: 0,
            liveVisits: 0,
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
        g.likes += (log.likes || 0);
        g.comments += (log.comments || 0);
        g.shares += (log.shares || 0);
        g.followers += (log.followers || log.newFollowers || 0);
        g.avgViewDurationSum += (log.avgViewDuration || 0);
        g.peakViewersMax = Math.max(g.peakViewersMax, Number(log.peakViewers || 0));
        g.shopVouchers += (log.shopVouchers || 0);
        g.productImpressions += (log.productImpressions || 0);
        g.liveVisits += (log.liveVisits || 0);
      });

      // Sort by date according to sortOrder (desc or asc)
      const sortedGroups = Object.values(groups).sort((a, b) => {
        const timeA = getLogTimestamp({ date: a.rawDate || a.dateKey });
        const timeB = getLogTimestamp({ date: b.rawDate || b.dateKey });
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });

      const rows: any[] = [];
      sortedGroups.forEach((g, idx) => {
        const row: any = {};
        const isTikTok = isTargetTikTok || String(g.platform || "").toLowerCase().includes("tiktok");
        const isShopee = isTargetShopee || String(g.platform || "").toLowerCase().includes("shopee");
        const avgViewSec = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const convRate = isTikTok
          ? (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0)
          : (g.viewer > 0 ? (g.buyers / g.viewer) * 100 : 0);

        row["No"] = idx + 1;
        if (selectedMetrics.includes("date")) {
          const parsedD = parseExcelDate(g.rawDate || g.dateKey);
          row["Tanggal"] = parsedD || g.dateKey;
        }
        row["Jumlah Sesi"] = g.sessionCount;
        if (selectedMetrics.includes("duration")) {
          row["Total Durasi"] = (g.duration || 0) / 86400;
        }
        if (selectedMetrics.includes("platform")) {
          row["Platform"] = g.platform;
        }

        // Sales metrics
        if (selectedMetrics.includes("gmv")) {
          row["Total GMV (Rp)"] = g.gmv;
        }
        if (selectedMetrics.includes("items_sold")) {
          row["Item Sold"] = g.itemsSold;
        }
        if (selectedMetrics.includes("orders")) {
          row[isShopee ? "Total Purchase" : "Total Orders"] = g.orders;
        }
        if (selectedMetrics.includes("buyers")) {
          row["Customer"] = g.buyers;
        }
        if (selectedMetrics.includes("aov")) {
          row["AOV (Rp)"] = g.orders > 0 ? Math.round(g.gmv / g.orders) : 0;
        }
        if (selectedMetrics.includes("product_impressions") && !isShopee) {
          row["Product Impressions"] = g.productImpressions;
        }
        if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
          row[isShopee ? "Total Add to Cart" : "Total Product Clicks"] = g.clicks;
        }
        if (selectedMetrics.includes("shop_vouchers") && !isTikTok) {
          row["Voucher Claim"] = g.shopVouchers;
        }
        if (selectedMetrics.includes("est_income")) {
          row["GMV/Hours (Rp)"] = g.duration > 0 ? Math.round((g.gmv / g.duration) * 3600) : 0;
        }
        if (selectedMetrics.includes("conversion_rate")) {
          row["Conversion Rate (%)"] = Number(convRate.toFixed(2));
        }

        // Funnel & view metrics
        if (selectedMetrics.includes("impressions") && !isShopee) {
          row["Live Impressions"] = g.viewer;
        }
        if (selectedMetrics.includes("penonton")) {
          row[isShopee ? "Total Views" : isTikTok ? "Total Live Viewer" : "Total Viewer"] = g.viewer;
        }
        if (selectedMetrics.includes("live_viewer") && !isTikTok) {
          row["Viewer Active"] = g.liveVisits;
        }
        if (selectedMetrics.includes("peak_viewers") && !isTikTok) {
          row["Peak Viewer (Maks)"] = g.peakViewersMax;
        }

        // Engagement metrics
        if (selectedMetrics.includes("avg_view_duration")) {
          row["Avg. View Duration (detik)"] = Number(avgViewSec.toFixed(2));
        }
        if (selectedMetrics.includes("likes")) {
          row["Total Likes"] = g.likes;
        }
        if (selectedMetrics.includes("comments")) {
          row["Total Comments"] = g.comments;
        }
        if (selectedMetrics.includes("shares")) {
          row["Total Shares"] = g.shares;
        }
        if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
          row["New Followers"] = g.followers;
        }
        if (selectedMetrics.includes("err")) {
          const totalEng = g.likes + g.comments + g.shares;
          row["ERR (%)"] = g.viewer > 0 ? Number(((totalEng / g.viewer) * 100).toFixed(2)) : 0;
        }

        rows.push(row);
      });

      // Append Total Summary Row for Daily Mode
      if (sortedGroups.length > 0) {
        const totalSummary: any = {};
        totalSummary["No"] = "TOTAL";
        if (selectedMetrics.includes("date")) totalSummary["Tanggal"] = "Semua Hari";
        totalSummary["Jumlah Sesi"] = sortedGroups.reduce((a, b) => a + b.sessionCount, 0);
        const totDur = sortedGroups.reduce((a, b) => a + b.duration, 0);
        if (selectedMetrics.includes("duration")) totalSummary["Total Durasi"] = totDur / 86400;
        if (selectedMetrics.includes("platform")) totalSummary["Platform"] = "Total";

        const totGmv = sortedGroups.reduce((a, b) => a + b.gmv, 0);
        const totItems = sortedGroups.reduce((a, b) => a + b.itemsSold, 0);
        const totOrders = sortedGroups.reduce((a, b) => a + b.orders, 0);
        const totBuyers = sortedGroups.reduce((a, b) => a + b.buyers, 0);
        const totClicks = sortedGroups.reduce((a, b) => a + b.clicks, 0);
        const totViewer = sortedGroups.reduce((a, b) => a + b.viewer, 0);

        if (selectedMetrics.includes("gmv")) totalSummary["Total GMV (Rp)"] = totGmv;
        if (selectedMetrics.includes("items_sold")) totalSummary["Item Sold"] = totItems;
        if (selectedMetrics.includes("orders")) totalSummary[isTargetShopee ? "Total Purchase" : "Total Orders"] = totOrders;
        if (selectedMetrics.includes("buyers")) totalSummary["Customer"] = totBuyers;
        if (selectedMetrics.includes("aov")) totalSummary["AOV (Rp)"] = totOrders > 0 ? Math.round(totGmv / totOrders) : 0;
        if (selectedMetrics.includes("product_impressions") && !isTargetShopee) {
          totalSummary["Product Impressions"] = sortedGroups.reduce((a, b) => a + b.productImpressions, 0);
        }
        if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
          totalSummary[isTargetShopee ? "Total Add to Cart" : "Total Product Clicks"] = totClicks;
        }
        if (selectedMetrics.includes("shop_vouchers") && !isTargetTikTok) {
          totalSummary["Voucher Claim"] = sortedGroups.reduce((a, b) => a + b.shopVouchers, 0);
        }
        if (selectedMetrics.includes("est_income")) {
          totalSummary["GMV/Hours (Rp)"] = totDur > 0 ? Math.round((totGmv / totDur) * 3600) : 0;
        }
        if (selectedMetrics.includes("conversion_rate")) {
          const cr = isTargetTikTok
            ? (totClicks > 0 ? (totOrders / totClicks) * 100 : 0)
            : (totViewer > 0 ? (totBuyers / totViewer) * 100 : 0);
          totalSummary["Conversion Rate (%)"] = Number(cr.toFixed(2));
        }
        if (selectedMetrics.includes("impressions") && !isTargetShopee) totalSummary["Live Impressions"] = totViewer;
        if (selectedMetrics.includes("penonton")) {
          totalSummary[isTargetShopee ? "Total Views" : isTargetTikTok ? "Total Live Viewer" : "Total Viewer"] = totViewer;
        }
        if (selectedMetrics.includes("live_viewer") && !isTargetTikTok) {
          totalSummary["Viewer Active"] = sortedGroups.reduce((a, b) => a + b.liveVisits, 0);
        }
        if (selectedMetrics.includes("peak_viewers") && !isTargetTikTok) {
          totalSummary["Peak Viewer (Maks)"] = Math.max(...sortedGroups.map(g => g.peakViewersMax), 0);
        }
        if (selectedMetrics.includes("avg_view_duration")) {
          const totAvg = sortedGroups.reduce((a, b) => a + b.avgViewDurationSum, 0);
          const totS = sortedGroups.reduce((a, b) => a + b.sessionCount, 0);
          totalSummary["Avg. View Duration (detik)"] = totS > 0 ? Number((totAvg / totS).toFixed(2)) : 0;
        }
        if (selectedMetrics.includes("likes")) totalSummary["Total Likes"] = sortedGroups.reduce((a, b) => a + b.likes, 0);
        if (selectedMetrics.includes("comments")) totalSummary["Total Comments"] = sortedGroups.reduce((a, b) => a + b.comments, 0);
        if (selectedMetrics.includes("shares")) totalSummary["Total Shares"] = sortedGroups.reduce((a, b) => a + b.shares, 0);
        if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
          totalSummary["New Followers"] = sortedGroups.reduce((a, b) => a + b.followers, 0);
        }
        if (selectedMetrics.includes("err")) {
          const totEng = sortedGroups.reduce((a, b) => a + b.likes + b.comments + b.shares, 0);
          totalSummary["ERR (%)"] = totViewer > 0 ? Number(((totEng / totViewer) * 100).toFixed(2)) : 0;
        }

        rows.push(totalSummary);
        batchRanges.push({
          startRow: 2,
          endRow: sortedGroups.length + 1,
          sumRow: sortedGroups.length + 2,
        });
      }

      dataToExport = rows;
    } else {
      // PER SESI LIVE SAAT DI-START (DETAIL INDIVIDUAL SETIAP SESI)
      if (enableDurationCutoff) {
        const cutoffResult = computeDurationCutoffs(rawLogs, cutoffTargetHours);
        const rows: any[] = [];
        let globalIdx = 1;

        // Pastikan urutan batch konsisten dengan sortOrder:
        // Saat sortOrder === 'desc' (Terbaru -> Terlama), batch terbaru (misal Oktober)
        // diletakkan di bagian atas, lalu diikuti batch yang lebih lampau (September -> Agustus).
        // Begitu juga sebaliknya saat sortOrder === 'asc'.
        const orderedBatches = sortOrder === "desc"
          ? [...cutoffResult.batches].reverse()
          : cutoffResult.batches;

        orderedBatches.forEach((batch) => {
          const batchStartRow = rows.length + 2; // 1-based Excel row number

          // Sort logs within the batch according to sortOrder
          const batchLogs = [...batch.logs].sort((a, b) => {
            const timeA = getLogTimestamp(a);
            const timeB = getLogTimestamp(b);
            return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
          });

          // Individual session rows for this cutoff
          batchLogs.forEach((log: any) => {
            const row: any = {};
            const isTikTok = isTargetTikTok || String(log.platform || "").toLowerCase().includes("tiktok");
            const isShopee = isTargetShopee || String(log.platform || "").toLowerCase().includes("shopee");
            const m = getLiveSessionMetrics(log);
            const formattedStart = formatDisplayDate(log.dateTime || log.date, log.platform);
            const parsedFullDate = parseExcelDate(log.dateTime || log.date);

            row["No"] = globalIdx++;

            if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
              row["Tanggal & Jam Mulai"] = parsedFullDate || formattedStart || log.dateTime || log.date || "-";
            } else {
              if (selectedMetrics.includes("date")) {
                const parsedDate = parseExcelDate(log.date || log.dateTime);
                row["Tanggal"] = parsedDate || log.date || (log.dateTime ? log.dateTime.split(" ")[0] : "-");
              }
              if (selectedMetrics.includes("time")) {
                const rawTime = log.dateTime && log.dateTime.includes(" ")
                  ? log.dateTime.split(" ")[1]
                  : (log.dateTime && log.dateTime.includes("T") ? log.dateTime.split("T")[1].substring(0, 8) : "");
                const timeFrac = parseTimeToFraction(rawTime);
                row["Jam Mulai"] = timeFrac !== null ? timeFrac : (rawTime || "-");
              }
            }

            if (selectedMetrics.includes("platform")) {
              row["Platform"] = log.platform || (isShopee ? "Shopee Live" : isTikTok ? "TikTok Live" : "-");
            }
            if (selectedMetrics.includes("shift")) {
              row["Shift"] = log.shift || "-";
            }
            if (selectedMetrics.includes("duration")) {
              const sec = log.duration || log.liveDuration || 0;
              row["Durasi Live"] = sec / 86400;
            }

            // Sales Metrics
            if (selectedMetrics.includes("gmv")) {
              row["GMV (Rp)"] = log.gmv || 0;
            }
            if (selectedMetrics.includes("items_sold")) {
              row["Item Sold"] = log.products_sold || log.items_sold || 0;
            }
            if (selectedMetrics.includes("orders")) {
              row[isShopee ? "Purchase" : "Orders"] = isShopee ? (m.orders || m.customers || 0) : m.orders;
            }
            if (selectedMetrics.includes("buyers")) {
              row["Customer"] = m.customers || 0;
            }
            if (selectedMetrics.includes("aov")) {
              row["AOV (Rp)"] = log.aov || (m.orders > 0 ? Math.round((log.gmv || 0) / m.orders) : 0);
            }
            if (selectedMetrics.includes("product_impressions") && !isShopee) {
              row["Product Impressions"] = log.productImpressions || 0;
            }
            if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
              row[isShopee ? "Add to Cart" : "Product Clicks"] = m.clicks;
            }
            if (selectedMetrics.includes("shop_vouchers") && !isTikTok) {
              row["Voucher Claim"] = log.shopVouchers || 0;
            }
            if (selectedMetrics.includes("est_income")) {
              const sec = log.duration || log.liveDuration || 0;
              row["GMV/Hours (Rp)"] = sec > 0 ? Math.round(((log.gmv || 0) / sec) * 3600) : 0;
            }
            if (selectedMetrics.includes("conversion_rate")) {
              row["Conversion Rate (%)"] = Number(m.conversionRate.toFixed(2));
            }

            // Funnel & View Metrics
            if (selectedMetrics.includes("impressions") && !isShopee) {
              row["Live Impressions"] = log.impressions || m.viewer || 0;
            }
            if (selectedMetrics.includes("penonton")) {
              row[isShopee ? "Views" : isTikTok ? "Live Viewer" : "Views / Live Viewer"] = m.viewer || log.penonton || 0;
            }
            if (selectedMetrics.includes("live_viewer") && !isTikTok) {
              row["Viewer Active"] = log.liveVisits || 0;
            }
            if (selectedMetrics.includes("peak_viewers") && !isTikTok) {
              row["Peak Viewer"] = log.peakViewers || 0;
            }

            // Engagement Metrics
            if (selectedMetrics.includes("avg_view_duration")) {
              row["Avg. View Duration (detik)"] = Number((log.avgViewDuration || 0).toFixed(2));
            }
            if (selectedMetrics.includes("likes")) {
              row["Likes"] = log.likes || 0;
            }
            if (selectedMetrics.includes("comments")) {
              row["Comments"] = log.comments || 0;
            }
            if (selectedMetrics.includes("shares")) {
              row["Shares"] = log.shares || 0;
            }
            if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
              row["New Followers"] = log.followers || log.newFollowers || 0;
            }
            if (selectedMetrics.includes("err")) {
              const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
              const baseV = m.viewer || 0;
              row["ERR (%)"] = baseV > 0 ? Number(((totalEng / baseV) * 100).toFixed(2)) : 0;
            }

            row["Status Cutoff"] = `Cutoff ${batch.batchNumber} (${batch.isCompleted ? "Terpenuhi" : "Berjalan"})`;

            rows.push(row);
          });

          const batchEndRow = rows.length + 1; // 1-based Excel row number of last data row

          // Insert CUT OFF SUB-TOTAL / SUMMARY ROW
          const summaryRow: any = {};
          const isCompleted = batch.isCompleted;
          summaryRow["No"] = "TOTAL";

          const rangeInfo = `${batch.startDisplayDate} [${batch.startShift}] s/d ${batch.endDisplayDate} [${batch.endShift}]`;
          const cutoffLabel = `Cut off ${batch.startDisplayDate} - ${batch.endDisplayDate} (${cutoffTargetHours} Jam)`;

          if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
            summaryRow["Tanggal & Jam Mulai"] = cutoffLabel;
          } else {
            if (selectedMetrics.includes("date")) {
              summaryRow["Tanggal"] = `Cut off ${batch.startDisplayDate} - ${batch.endDisplayDate}`;
            }
            if (selectedMetrics.includes("time")) {
              summaryRow["Jam Mulai"] = isCompleted ? `Selesai: ${batch.endShift}` : "Berjalan";
            }
          }

          if (selectedMetrics.includes("platform")) {
            summaryRow["Platform"] = `Subtotal (${batch.sessionCount} Sesi)`;
          }
          if (selectedMetrics.includes("shift")) {
            summaryRow["Shift"] = isCompleted ? `Cutoff di Sesi: ${batch.endShift}` : "Dalam Proses";
          }
          if (selectedMetrics.includes("duration")) {
            summaryRow["Durasi Live"] = batch.totalDurationSeconds / 86400;
          }
          if (selectedMetrics.includes("gmv")) {
            summaryRow["GMV (Rp)"] = batch.totalGmv;
          }
          if (selectedMetrics.includes("items_sold")) {
            summaryRow["Item Sold"] = batch.totalItemsSold;
          }
          if (selectedMetrics.includes("orders")) {
            summaryRow[isTargetShopee ? "Purchase" : "Orders"] = batch.totalOrders;
          }
          if (selectedMetrics.includes("buyers")) {
            summaryRow["Customer"] = batch.totalBuyers;
          }
          if (selectedMetrics.includes("aov")) {
            summaryRow["AOV (Rp)"] = batch.totalOrders > 0 ? Math.round(batch.totalGmv / batch.totalOrders) : 0;
          }
          const batchProductImpressions = batch.logs.reduce((acc: number, l: any) => acc + (l.productImpressions || 0), 0);
          const batchShopVouchers = batch.logs.reduce((acc: number, l: any) => acc + (l.shopVouchers || 0), 0);
          const batchLiveImpressions = batch.logs.reduce((acc: number, l: any) => acc + (l.impressions || 0), 0);
          const batchLiveVisits = batch.logs.reduce((acc: number, l: any) => acc + (l.liveVisits || 0), 0);
          const batchPeakViewers = Math.max(...batch.logs.map((l: any) => l.peakViewers || 0), 0);
          const batchLikes = batch.logs.reduce((acc: number, l: any) => acc + (l.likes || 0), 0);
          const batchComments = batch.logs.reduce((acc: number, l: any) => acc + (l.comments || 0), 0);
          const batchShares = batch.logs.reduce((acc: number, l: any) => acc + (l.shares || 0), 0);
          const batchFollowers = batch.logs.reduce((acc: number, l: any) => acc + (l.followers || l.newFollowers || 0), 0);
          const batchAvgView = batch.logs.length > 0
            ? batch.logs.reduce((acc: number, l: any) => acc + (l.avgViewDuration || 0), 0) / batch.logs.length
            : 0;

          if (selectedMetrics.includes("product_impressions") && !isTargetShopee) {
            summaryRow["Product Impressions"] = batchProductImpressions;
          }
          if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
            summaryRow[isTargetShopee ? "Add to Cart" : "Product Clicks"] = batch.totalClicks;
          }
          if (selectedMetrics.includes("shop_vouchers") && !isTargetTikTok) {
            summaryRow["Voucher Claim"] = batchShopVouchers;
          }
          if (selectedMetrics.includes("est_income")) {
            summaryRow["GMV/Hours (Rp)"] = batch.totalDurationSeconds > 0
              ? Math.round((batch.totalGmv / batch.totalDurationSeconds) * 3600)
              : 0;
          }
          if (selectedMetrics.includes("conversion_rate")) {
            const cr = isTargetTikTok
              ? (batch.totalClicks > 0 ? (batch.totalOrders / batch.totalClicks) * 100 : 0)
              : (batch.totalViewer > 0 ? (batch.totalBuyers / batch.totalViewer) * 100 : 0);
            summaryRow["Conversion Rate (%)"] = Number(cr.toFixed(2));
          }
          if (selectedMetrics.includes("impressions") && !isTargetShopee) {
            summaryRow["Live Impressions"] = batchLiveImpressions || batch.totalViewer || 0;
          }
          if (selectedMetrics.includes("penonton")) {
            summaryRow[isTargetShopee ? "Views" : isTargetTikTok ? "Live Viewer" : "Views / Live Viewer"] = batch.totalViewer;
          }
          if (selectedMetrics.includes("live_viewer") && !isTargetTikTok) {
            summaryRow["Viewer Active"] = batchLiveVisits;
          }
          if (selectedMetrics.includes("peak_viewers") && !isTargetTikTok) {
            summaryRow["Peak Viewer"] = batchPeakViewers;
          }
          if (selectedMetrics.includes("avg_view_duration")) {
            summaryRow["Avg. View Duration (detik)"] = Number(batchAvgView.toFixed(2));
          }
          if (selectedMetrics.includes("likes")) {
            summaryRow["Likes"] = batchLikes;
          }
          if (selectedMetrics.includes("comments")) {
            summaryRow["Comments"] = batchComments;
          }
          if (selectedMetrics.includes("shares")) {
            summaryRow["Shares"] = batchShares;
          }
          if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
            summaryRow["New Followers"] = batchFollowers;
          }
          if (selectedMetrics.includes("err")) {
            const totalEng = batchLikes + batchComments + batchShares;
            const baseV = batch.totalViewer || 0;
            summaryRow["ERR (%)"] = baseV > 0 ? Number(((totalEng / baseV) * 100).toFixed(2)) : 0;
          }

          summaryRow["Status Cutoff"] = isCompleted
            ? `CUT OFF ${batch.batchNumber} SELESAI: ${rangeInfo} | Durasi: ${formatDurationHoursMinutes(batch.totalDurationSeconds)} (Lebih ${formatDurationHoursMinutes(batch.surplusSeconds)})`
            : `CUT OFF ${batch.batchNumber} BERJALAN: ${rangeInfo} | Durasi: ${formatDurationHoursMinutes(batch.totalDurationSeconds)} (Kurang ${formatDurationHoursMinutes(batch.remainingSeconds)})`;

          rows.push(summaryRow);
          const sumRow = rows.length + 1; // 1-based Excel row number for summary row
          batchRanges.push({ startRow: batchStartRow, endRow: batchEndRow, sumRow, batch });
        });

        dataToExport = rows;
      } else {
        // NON-CUTOFF SESSIONS MODE
        const sortedLogs = [...rawLogs].sort((a, b) => {
          const timeA = getLogTimestamp(a);
          const timeB = getLogTimestamp(b);
          return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
        });

        const rows: any[] = [];
        sortedLogs.forEach((log: any, idx: number) => {
          const row: any = {};
          const isTikTok = isTargetTikTok || String(log.platform || "").toLowerCase().includes("tiktok");
          const isShopee = isTargetShopee || String(log.platform || "").toLowerCase().includes("shopee");
          const m = getLiveSessionMetrics(log);
          const formattedStart = formatDisplayDate(log.dateTime || log.date, log.platform);
          const parsedFullDate = parseExcelDate(log.dateTime || log.date);

          row["No"] = idx + 1;

          if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
            row["Tanggal & Jam Mulai"] = parsedFullDate || formattedStart || log.dateTime || log.date || "-";
          } else {
            if (selectedMetrics.includes("date")) {
              const parsedDate = parseExcelDate(log.date || log.dateTime);
              row["Tanggal"] = parsedDate || log.date || (log.dateTime ? log.dateTime.split(" ")[0] : "-");
            }
            if (selectedMetrics.includes("time")) {
              const rawTime = log.dateTime && log.dateTime.includes(" ")
                ? log.dateTime.split(" ")[1]
                : (log.dateTime && log.dateTime.includes("T") ? log.dateTime.split("T")[1].substring(0, 8) : "");
              const timeFrac = parseTimeToFraction(rawTime);
              row["Jam Mulai"] = timeFrac !== null ? timeFrac : (rawTime || "-");
            }
          }

          if (selectedMetrics.includes("platform")) {
            row["Platform"] = log.platform || (isShopee ? "Shopee Live" : isTikTok ? "TikTok Live" : "-");
          }
          if (selectedMetrics.includes("shift")) {
            row["Shift"] = log.shift || "-";
          }
          if (selectedMetrics.includes("duration")) {
            const sec = log.duration || log.liveDuration || 0;
            row["Durasi Live"] = sec / 86400;
          }

          // Sales Metrics
          if (selectedMetrics.includes("gmv")) {
            row["GMV (Rp)"] = log.gmv || 0;
          }
          if (selectedMetrics.includes("items_sold")) {
            row["Item Sold"] = log.products_sold || log.items_sold || 0;
          }
          if (selectedMetrics.includes("orders")) {
            row[isShopee ? "Purchase" : "Orders"] = isShopee ? (m.orders || m.customers || 0) : m.orders;
          }
          if (selectedMetrics.includes("buyers")) {
            row["Customer"] = m.customers || 0;
          }
          if (selectedMetrics.includes("aov")) {
            row["AOV (Rp)"] = log.aov || (m.orders > 0 ? Math.round((log.gmv || 0) / m.orders) : 0);
          }
          if (selectedMetrics.includes("product_impressions") && !isShopee) {
            row["Product Impressions"] = log.productImpressions || 0;
          }
          if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
            row[isShopee ? "Add to Cart" : "Product Clicks"] = m.clicks;
          }
          if (selectedMetrics.includes("shop_vouchers") && !isTikTok) {
            row["Voucher Claim"] = log.shopVouchers || 0;
          }
          if (selectedMetrics.includes("est_income")) {
            const sec = log.duration || log.liveDuration || 0;
            row["GMV/Hours (Rp)"] = sec > 0 ? Math.round(((log.gmv || 0) / sec) * 3600) : 0;
          }
          if (selectedMetrics.includes("conversion_rate")) {
            row["Conversion Rate (%)"] = Number(m.conversionRate.toFixed(2));
          }

          // Funnel & View Metrics
          if (selectedMetrics.includes("impressions") && !isShopee) {
            row["Live Impressions"] = log.impressions || m.viewer || 0;
          }
          if (selectedMetrics.includes("penonton")) {
            row[isShopee ? "Views" : isTikTok ? "Live Viewer" : "Views / Live Viewer"] = m.viewer || log.penonton || 0;
          }
          if (selectedMetrics.includes("live_viewer") && !isTikTok) {
            row["Viewer Active"] = log.liveVisits || 0;
          }
          if (selectedMetrics.includes("peak_viewers") && !isTikTok) {
            row["Peak Viewer"] = log.peakViewers || 0;
          }

          // Engagement Metrics
          if (selectedMetrics.includes("avg_view_duration")) {
            row["Avg. View Duration (detik)"] = Number((log.avgViewDuration || 0).toFixed(2));
          }
          if (selectedMetrics.includes("likes")) {
            row["Likes"] = log.likes || 0;
          }
          if (selectedMetrics.includes("comments")) {
            row["Comments"] = log.comments || 0;
          }
          if (selectedMetrics.includes("shares")) {
            row["Shares"] = log.shares || 0;
          }
          if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
            row["New Followers"] = log.followers || log.newFollowers || 0;
          }
          if (selectedMetrics.includes("err")) {
            const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
            const baseV = m.viewer || 0;
            row["ERR (%)"] = baseV > 0 ? Number(((totalEng / baseV) * 100).toFixed(2)) : 0;
          }

          rows.push(row);
        });

        // Append Grand Total Row
        if (sortedLogs.length > 0) {
          const grandTotal: any = {};
          grandTotal["No"] = "TOTAL";
          if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
            grandTotal["Tanggal & Jam Mulai"] = "Total Keseluruhan";
          } else {
            if (selectedMetrics.includes("date")) grandTotal["Tanggal"] = "Total Keseluruhan";
            if (selectedMetrics.includes("time")) grandTotal["Jam Mulai"] = "-";
          }
          if (selectedMetrics.includes("platform")) grandTotal["Platform"] = "Total";
          if (selectedMetrics.includes("shift")) grandTotal["Shift"] = "-";

          const totSec = sortedLogs.reduce((acc, l) => acc + (l.duration || l.liveDuration || 0), 0);
          const totGmv = sortedLogs.reduce((acc, l) => acc + (l.gmv || 0), 0);
          const totItems = sortedLogs.reduce((acc, l) => acc + (l.products_sold || l.items_sold || 0), 0);
          let totOrders = 0;
          let totBuyers = 0;
          let totClicks = 0;
          let totViewer = 0;
          sortedLogs.forEach((l) => {
            const m = getLiveSessionMetrics(l);
            totOrders += m.orders;
            totBuyers += m.customers;
            totClicks += m.clicks;
            totViewer += (m.viewer || l.penonton || 0);
          });

          if (selectedMetrics.includes("duration")) grandTotal["Durasi Live"] = totSec / 86400;
          if (selectedMetrics.includes("gmv")) grandTotal["GMV (Rp)"] = totGmv;
          if (selectedMetrics.includes("items_sold")) grandTotal["Item Sold"] = totItems;
          if (selectedMetrics.includes("orders")) grandTotal[isTargetShopee ? "Purchase" : "Orders"] = totOrders;
          if (selectedMetrics.includes("buyers")) grandTotal["Customer"] = totBuyers;
          if (selectedMetrics.includes("aov")) grandTotal["AOV (Rp)"] = totOrders > 0 ? Math.round(totGmv / totOrders) : 0;
          if (selectedMetrics.includes("product_impressions") && !isTargetShopee) {
            grandTotal["Product Impressions"] = sortedLogs.reduce((acc, l) => acc + (l.productImpressions || 0), 0);
          }
          if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
            grandTotal[isTargetShopee ? "Add to Cart" : "Product Clicks"] = totClicks;
          }
          if (selectedMetrics.includes("shop_vouchers") && !isTargetTikTok) {
            grandTotal["Voucher Claim"] = sortedLogs.reduce((acc, l) => acc + (l.shopVouchers || 0), 0);
          }
          if (selectedMetrics.includes("est_income")) {
            grandTotal["GMV/Hours (Rp)"] = totSec > 0 ? Math.round((totGmv / totSec) * 3600) : 0;
          }
          if (selectedMetrics.includes("conversion_rate")) {
            const cr = isTargetTikTok
              ? (totClicks > 0 ? (totOrders / totClicks) * 100 : 0)
              : (totViewer > 0 ? (totBuyers / totViewer) * 100 : 0);
            grandTotal["Conversion Rate (%)"] = Number(cr.toFixed(2));
          }
          if (selectedMetrics.includes("impressions") && !isTargetShopee) {
            grandTotal["Live Impressions"] = sortedLogs.reduce((acc, l) => acc + (l.impressions || 0), 0) || totViewer;
          }
          if (selectedMetrics.includes("penonton")) {
            grandTotal[isTargetShopee ? "Views" : isTargetTikTok ? "Live Viewer" : "Views / Live Viewer"] = totViewer;
          }
          if (selectedMetrics.includes("live_viewer") && !isTargetTikTok) {
            grandTotal["Viewer Active"] = sortedLogs.reduce((acc, l) => acc + (l.liveVisits || 0), 0);
          }
          if (selectedMetrics.includes("peak_viewers") && !isTargetTikTok) {
            grandTotal["Peak Viewer"] = Math.max(...sortedLogs.map(l => l.peakViewers || 0), 0);
          }
          if (selectedMetrics.includes("avg_view_duration")) {
            const totAvg = sortedLogs.reduce((acc, l) => acc + (l.avgViewDuration || 0), 0);
            grandTotal["Avg. View Duration (detik)"] = sortedLogs.length > 0 ? Number((totAvg / sortedLogs.length).toFixed(2)) : 0;
          }
          if (selectedMetrics.includes("likes")) grandTotal["Likes"] = sortedLogs.reduce((acc, l) => acc + (l.likes || 0), 0);
          if (selectedMetrics.includes("comments")) grandTotal["Comments"] = sortedLogs.reduce((acc, l) => acc + (l.comments || 0), 0);
          if (selectedMetrics.includes("shares")) grandTotal["Shares"] = sortedLogs.reduce((acc, l) => acc + (l.shares || 0), 0);
          if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
            grandTotal["New Followers"] = sortedLogs.reduce((acc, l) => acc + (l.followers || l.newFollowers || 0), 0);
          }
          if (selectedMetrics.includes("err")) {
            const totEng = sortedLogs.reduce((acc, l) => acc + (l.likes || 0) + (l.comments || 0) + (l.shares || 0), 0);
            grandTotal["ERR (%)"] = totViewer > 0 ? Number(((totEng / totViewer) * 100).toFixed(2)) : 0;
          }

          rows.push(grandTotal);
          batchRanges.push({
            startRow: 2,
            endRow: sortedLogs.length + 1,
            sumRow: sortedLogs.length + 2,
          });
        }

        dataToExport = rows;
      }
    }
  } else if (reportType === "product" && productReportView) {
    const rows: any[] = productReportView.aggregatedSkus.map((sku: any, idx: number) => {
      const row: any = {};
      row["No"] = idx + 1;
      if (selectedMetrics.includes("date")) {
        const dStr = dateFilterType === "latest" ? selectedLatestDate || "-" : dateFilterType === "monthly" ? "Bulanan" : "-";
        const parsedD = parseExcelDate(dStr);
        row["Tanggal"] = parsedD || dStr;
      }
      if (selectedMetrics.includes("platform")) {
        row["Platform"] =
          platformFilter === "all" ? "Semua Platform" : platformFilter || "Shopee Live";
      }
      if (selectedMetrics.includes("sku")) row["SKU"] = sku.sku;
      if (selectedMetrics.includes("product_name") || selectedMetrics.includes("name")) row["Nama Produk"] = sku.productName || sku.name || "-";
      if (selectedMetrics.includes("items_sold") || selectedMetrics.includes("sold")) row["Jumlah Terjual"] = sku.sold || 0;
      if (selectedMetrics.includes("revenue"))
        row["GMV / Revenue (Rp)"] = sku.revenue || 0;
      return row;
    });

    if (rows.length > 0) {
      const grandTotal: any = {};
      grandTotal["No"] = "TOTAL";
      if (selectedMetrics.includes("date")) grandTotal["Tanggal"] = "Semua";
      if (selectedMetrics.includes("platform")) grandTotal["Platform"] = "Total";
      if (selectedMetrics.includes("sku")) grandTotal["SKU"] = "Total";
      if (selectedMetrics.includes("product_name") || selectedMetrics.includes("name")) grandTotal["Nama Produk"] = "-";
      if (selectedMetrics.includes("items_sold") || selectedMetrics.includes("sold")) {
        grandTotal["Jumlah Terjual"] = rows.reduce((acc, r) => acc + (r["Jumlah Terjual"] || 0), 0);
      }
      if (selectedMetrics.includes("revenue")) {
        grandTotal["GMV / Revenue (Rp)"] = rows.reduce((acc, r) => acc + (r["GMV / Revenue (Rp)"] || 0), 0);
      }
      rows.push(grandTotal);
      batchRanges.push({
        startRow: 2,
        endRow: productReportView.aggregatedSkus.length + 1,
        sumRow: productReportView.aggregatedSkus.length + 2,
      });
    }

    dataToExport = rows;
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

    const rows: any[] = sortedEngLogs.map((log: any, idx: number) => {
      const row: any = {};
      const isTikTok = isTargetTikTok || String(log.platform || "").toLowerCase().includes("tiktok");
      const isShopee = isTargetShopee || String(log.platform || "").toLowerCase().includes("shopee");

      row["No"] = idx + 1;
      const formattedDate = formatDisplayDate(log.dateTime || log.date, log.platform);
      const parsedFullDate = parseExcelDate(log.dateTime || log.date);

      if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
        row["Tanggal & Jam Mulai"] = parsedFullDate || formattedDate || log.dateTime || log.date || "-";
      } else {
        if (selectedMetrics.includes("date")) {
          const parsedD = parseExcelDate(log.date || log.dateTime);
          row["Tanggal"] = parsedD || log.date || log.dateTime?.split(" ")[0] || "-";
        }
        if (selectedMetrics.includes("time")) {
          const rawTime = log.dateTime?.includes(" ")
            ? log.dateTime.split(" ")[1]
            : "";
          const timeFrac = parseTimeToFraction(rawTime);
          row["Jam Mulai"] = timeFrac !== null ? timeFrac : (rawTime || "-");
        }
      }
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform || "-";
      if (selectedMetrics.includes("shift")) row["Shift"] = log.shift || "-";

      if (selectedMetrics.includes("impressions") && !isShopee) {
        row["Live Impressions"] = log.impressions || log.views || 0;
      }
      if (selectedMetrics.includes("penonton") || selectedMetrics.includes("views") || selectedMetrics.includes("viewers")) {
        row[isShopee ? "Views" : "Live Viewer"] = Math.max(
          log.impressions || 0,
          log.views || 0,
          log.liveVisits || 0,
          log.penonton || 0
        );
      }
      if (selectedMetrics.includes("live_viewer") && !isTikTok) {
        row["Viewer Active"] = log.liveVisits || 0;
      }
      if (selectedMetrics.includes("peak_viewers") && !isTikTok) {
        row["Peak Viewer"] = log.peakViewers || 0;
      }
      if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers"))
        row["New Followers"] = log.newFollowers || log.followers || 0;
      if (selectedMetrics.includes("comments"))
        row["Comments"] = log.comments || 0;
      if (selectedMetrics.includes("shares"))
        row["Shares"] = log.shares || 0;
      if (selectedMetrics.includes("likes")) row["Likes"] = log.likes || 0;
      if (selectedMetrics.includes("avg_view_duration"))
        row["Avg. View Duration (detik)"] = Number((log.avgViewDuration || 0).toFixed(2));
      if (selectedMetrics.includes("engagement_rate") || selectedMetrics.includes("err")) {
        const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
        const imp = log.impressions || log.views || log.penonton || 0;
        row["ERR (%)"] = imp > 0 ? Number(((totalEng / imp) * 100).toFixed(2)) : 0;
      }
      return row;
    });

    if (rows.length > 0) {
      const grandTotal: any = {};
      grandTotal["No"] = "TOTAL";
      if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
        grandTotal["Tanggal & Jam Mulai"] = "Total Keseluruhan";
      } else {
        if (selectedMetrics.includes("date")) grandTotal["Tanggal"] = "Total";
        if (selectedMetrics.includes("time")) grandTotal["Jam Mulai"] = "-";
      }
      if (selectedMetrics.includes("platform")) grandTotal["Platform"] = "Total";
      if (selectedMetrics.includes("shift")) grandTotal["Shift"] = "-";

      let totImp = 0;
      let totView = 0;
      let totActive = 0;
      let maxPeak = 0;
      let totFollowers = 0;
      let totComments = 0;
      let totShares = 0;
      let totLikes = 0;
      let sumAvgView = 0;

      rows.forEach((r) => {
        totImp += (r["Live Impressions"] || 0);
        totView += (r["Views"] || r["Live Viewer"] || 0);
        totActive += (r["Viewer Active"] || 0);
        maxPeak = Math.max(maxPeak, r["Peak Viewer"] || 0);
        totFollowers += (r["New Followers"] || 0);
        totComments += (r["Comments"] || 0);
        totShares += (r["Shares"] || 0);
        totLikes += (r["Likes"] || 0);
        sumAvgView += (r["Avg. View Duration (detik)"] || 0);
      });

      if (selectedMetrics.includes("impressions") && !isTargetShopee) grandTotal["Live Impressions"] = totImp;
      if (selectedMetrics.includes("penonton") || selectedMetrics.includes("views") || selectedMetrics.includes("viewers")) {
        grandTotal[isTargetShopee ? "Views" : "Live Viewer"] = totView;
      }
      if (selectedMetrics.includes("live_viewer") && !isTargetTikTok) grandTotal["Viewer Active"] = totActive;
      if (selectedMetrics.includes("peak_viewers") && !isTargetTikTok) grandTotal["Peak Viewer"] = maxPeak;
      if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) grandTotal["New Followers"] = totFollowers;
      if (selectedMetrics.includes("comments")) grandTotal["Comments"] = totComments;
      if (selectedMetrics.includes("shares")) grandTotal["Shares"] = totShares;
      if (selectedMetrics.includes("likes")) grandTotal["Likes"] = totLikes;
      if (selectedMetrics.includes("avg_view_duration")) {
        grandTotal["Avg. View Duration (detik)"] = rows.length > 0 ? Number((sumAvgView / rows.length).toFixed(2)) : 0;
      }
      if (selectedMetrics.includes("engagement_rate") || selectedMetrics.includes("err")) {
        const totEng = totLikes + totComments + totShares;
        grandTotal["ERR (%)"] = totView > 0 ? Number(((totEng / totView) * 100).toFixed(2)) : 0;
      }

      rows.push(grandTotal);
      batchRanges.push({
        startRow: 2,
        endRow: sortedEngLogs.length + 1,
        sumRow: sortedEngLogs.length + 2,
      });
    }

    dataToExport = rows;
  }

  // Generate Initial Worksheet with Cell Dates Enabled
  const worksheet = XLSX.utils.json_to_sheet(dataToExport, { cellDates: true });
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Map Column Headers to Excel Column Letters (e.g. 'GMV (Rp)' -> 'E')
  const colMap: Record<string, string> = {};
  const colHeaders: string[] = [];
  for (let c = range.s.c; c <= range.e.c; ++c) {
    const cellKey = XLSX.utils.encode_cell({ r: 0, c });
    const headerVal = worksheet[cellKey]?.v;
    if (headerVal !== undefined && headerVal !== null) {
      const headerStr = String(headerVal);
      colMap[headerStr] = XLSX.utils.encode_col(c);
      colHeaders[c] = headerStr;
    }
  }

  // Set of Summary Row indices (1-based Excel row numbers)
  const summaryRowSet = new Set(batchRanges.map((b) => b.sumRow));

  // Post-process Cells: Assign Correct Data Types and Formats
  for (let r = range.s.r + 1; r <= range.e.r; ++r) {
    const excelRow = r + 1;
    const isSummaryRow = summaryRowSet.has(excelRow);

    for (let c = range.s.c; c <= range.e.c; ++c) {
      const cellKey = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[cellKey];
      if (!cell) continue;

      const header = colHeaders[c] || "";

      // 1. Currency Columns (GMV, AOV, GMV/Hours, Revenue)
      if (
        header.includes("GMV") ||
        header.includes("AOV") ||
        header.includes("Revenue")
      ) {
        if (cell.t === "n" || typeof cell.v === "number") {
          cell.t = "n";
          const numVal = Number(cell.v) || 0;
          cell.z = Math.abs(numVal % 1) > 0.0001 ? FMT_CURRENCY_DECIMAL : FMT_CURRENCY_INT;
        }
      }
      // 2. Duration Columns
      else if (header.includes("Durasi")) {
        if (cell.t === "n" || typeof cell.v === "number") {
          cell.t = "n";
          cell.z = isSummaryRow ? FMT_DURATION_TOTAL : FMT_DURATION;
        }
      }
      // 3. Date & Datetime Columns
      else if (header === "Tanggal & Jam Mulai") {
        if (cell.t === "d" || cell.v instanceof Date) {
          cell.t = "d";
          cell.z = FMT_DATETIME;
        }
      } else if (header === "Tanggal") {
        if (cell.t === "d" || cell.v instanceof Date) {
          cell.t = "d";
          cell.z = FMT_DATE;
        }
      } else if (header === "Jam Mulai") {
        if (cell.t === "n" || typeof cell.v === "number") {
          cell.t = "n";
          cell.z = FMT_TIME;
        }
      }
      // 4. Percentage Columns
      else if (header.includes("(%)") || header === "Conversion Rate (%)" || header === "ERR (%)") {
        if (cell.t === "n" || typeof cell.v === "number") {
          cell.t = "n";
          cell.z = FMT_PERCENT;
        }
      }
      // 5. Avg Duration (detik)
      else if (header.includes("Avg. View Duration")) {
        if (cell.t === "n" || typeof cell.v === "number") {
          cell.t = "n";
          cell.z = FMT_DECIMAL_2;
        }
      }
      // 6. Integer/Count Metrics
      else if (
        header === "No" ||
        header === "Item Sold" ||
        header === "Jumlah Terjual" ||
        header === "Jumlah Sesi" ||
        header.includes("Orders") ||
        header.includes("Purchase") ||
        header === "Customer" ||
        header.includes("Impressions") ||
        header.includes("Clicks") ||
        header.includes("Add to Cart") ||
        header.includes("Voucher") ||
        header.includes("Views") ||
        header.includes("Viewer") ||
        header.includes("Likes") ||
        header.includes("Comments") ||
        header.includes("Shares") ||
        header.includes("Followers")
      ) {
        if (typeof cell.v === "number") {
          cell.t = "n";
          cell.z = FMT_INTEGER;
        }
      }
    }
  }

  // Apply Excel Formulas to All Summary / Cutoff Rows
  batchRanges.forEach(({ startRow, endRow, sumRow }) => {
    if (startRow > endRow) return;

    // Durasi Live / Total Durasi
    const durCol = colMap["Durasi Live"] || colMap["Total Durasi"];
    if (durCol) {
      const prevVal = Number(worksheet[durCol + sumRow]?.v) || 0;
      worksheet[durCol + sumRow] = {
        t: "n",
        f: `SUM(${durCol}${startRow}:${durCol}${endRow})`,
        v: prevVal,
        z: FMT_DURATION_TOTAL,
      };
    }

    // GMV
    const gmvCol = colMap["GMV (Rp)"] || colMap["Total GMV (Rp)"] || colMap["GMV / Revenue (Rp)"];
    if (gmvCol) {
      const prevVal = Number(worksheet[gmvCol + sumRow]?.v) || 0;
      const fmt = Math.abs(prevVal % 1) > 0.0001 ? FMT_CURRENCY_DECIMAL : FMT_CURRENCY_INT;
      worksheet[gmvCol + sumRow] = {
        t: "n",
        f: `SUM(${gmvCol}${startRow}:${gmvCol}${endRow})`,
        v: prevVal,
        z: fmt,
      };
    }

    // Item Sold / Jumlah Terjual
    const itemCol = colMap["Item Sold"] || colMap["Jumlah Terjual"];
    if (itemCol) {
      const prevVal = Number(worksheet[itemCol + sumRow]?.v) || 0;
      worksheet[itemCol + sumRow] = {
        t: "n",
        f: `SUM(${itemCol}${startRow}:${itemCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Jumlah Sesi
    const sessCol = colMap["Jumlah Sesi"];
    if (sessCol) {
      const prevVal = Number(worksheet[sessCol + sumRow]?.v) || 0;
      worksheet[sessCol + sumRow] = {
        t: "n",
        f: `SUM(${sessCol}${startRow}:${sessCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Orders / Purchase
    const ordersCol = colMap["Orders"] || colMap["Purchase"] || colMap["Total Orders"] || colMap["Total Purchase"];
    if (ordersCol) {
      const prevVal = Number(worksheet[ordersCol + sumRow]?.v) || 0;
      worksheet[ordersCol + sumRow] = {
        t: "n",
        f: `SUM(${ordersCol}${startRow}:${ordersCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Customer
    const custCol = colMap["Customer"];
    if (custCol) {
      const prevVal = Number(worksheet[custCol + sumRow]?.v) || 0;
      worksheet[custCol + sumRow] = {
        t: "n",
        f: `SUM(${custCol}${startRow}:${custCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // AOV (Rp)
    const aovCol = colMap["AOV (Rp)"];
    if (aovCol) {
      const prevVal = Number(worksheet[aovCol + sumRow]?.v) || 0;
      if (ordersCol && gmvCol) {
        worksheet[aovCol + sumRow] = {
          t: "n",
          f: `IF(${ordersCol}${sumRow}>0, ${gmvCol}${sumRow}/${ordersCol}${sumRow}, 0)`,
          v: prevVal,
          z: FMT_CURRENCY_INT,
        };
      } else {
        worksheet[aovCol + sumRow] = {
          t: "n",
          f: `AVERAGE(${aovCol}${startRow}:${aovCol}${endRow})`,
          v: prevVal,
          z: FMT_CURRENCY_INT,
        };
      }
    }

    // Product Impressions
    const piCol = colMap["Product Impressions"];
    if (piCol) {
      const prevVal = Number(worksheet[piCol + sumRow]?.v) || 0;
      worksheet[piCol + sumRow] = {
        t: "n",
        f: `SUM(${piCol}${startRow}:${piCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Product Clicks / Add to Cart
    const clicksCol = colMap["Product Clicks"] || colMap["Add to Cart"] || colMap["Total Product Clicks"] || colMap["Total Add to Cart"];
    if (clicksCol) {
      const prevVal = Number(worksheet[clicksCol + sumRow]?.v) || 0;
      worksheet[clicksCol + sumRow] = {
        t: "n",
        f: `SUM(${clicksCol}${startRow}:${clicksCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Voucher Claim
    const vcCol = colMap["Voucher Claim"];
    if (vcCol) {
      const prevVal = Number(worksheet[vcCol + sumRow]?.v) || 0;
      worksheet[vcCol + sumRow] = {
        t: "n",
        f: `SUM(${vcCol}${startRow}:${vcCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // GMV/Hours (Rp)
    const ghCol = colMap["GMV/Hours (Rp)"];
    if (ghCol) {
      const prevVal = Number(worksheet[ghCol + sumRow]?.v) || 0;
      if (durCol && gmvCol) {
        worksheet[ghCol + sumRow] = {
          t: "n",
          f: `IF(${durCol}${sumRow}>0, ${gmvCol}${sumRow}/(${durCol}${sumRow}*24), 0)`,
          v: prevVal,
          z: FMT_CURRENCY_INT,
        };
      }
    }

    // Views / Live Viewer
    const viewsCol = colMap["Views"] || colMap["Live Viewer"] || colMap["Views / Live Viewer"] || colMap["Total Views"] || colMap["Total Live Viewer"] || colMap["Total Viewer"];
    if (viewsCol) {
      const prevVal = Number(worksheet[viewsCol + sumRow]?.v) || 0;
      worksheet[viewsCol + sumRow] = {
        t: "n",
        f: `SUM(${viewsCol}${startRow}:${viewsCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Conversion Rate (%)
    const crCol = colMap["Conversion Rate (%)"];
    if (crCol) {
      const prevVal = Number(worksheet[crCol + sumRow]?.v) || 0;
      if (isTargetTikTok && clicksCol && ordersCol) {
        worksheet[crCol + sumRow] = {
          t: "n",
          f: `IF(${clicksCol}${sumRow}>0, (${ordersCol}${sumRow}/${clicksCol}${sumRow})*100, 0)`,
          v: prevVal,
          z: FMT_PERCENT,
        };
      } else if (viewsCol && custCol) {
        worksheet[crCol + sumRow] = {
          t: "n",
          f: `IF(${viewsCol}${sumRow}>0, (${custCol}${sumRow}/${viewsCol}${sumRow})*100, 0)`,
          v: prevVal,
          z: FMT_PERCENT,
        };
      }
    }

    // Live Impressions
    const impCol = colMap["Live Impressions"];
    if (impCol) {
      const prevVal = Number(worksheet[impCol + sumRow]?.v) || 0;
      worksheet[impCol + sumRow] = {
        t: "n",
        f: `SUM(${impCol}${startRow}:${impCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Viewer Active
    const vaCol = colMap["Viewer Active"];
    if (vaCol) {
      const prevVal = Number(worksheet[vaCol + sumRow]?.v) || 0;
      worksheet[vaCol + sumRow] = {
        t: "n",
        f: `SUM(${vaCol}${startRow}:${vaCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Peak Viewer
    const pvCol = colMap["Peak Viewer"] || colMap["Peak Viewer (Maks)"];
    if (pvCol) {
      const prevVal = Number(worksheet[pvCol + sumRow]?.v) || 0;
      worksheet[pvCol + sumRow] = {
        t: "n",
        f: `MAX(${pvCol}${startRow}:${pvCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Avg View Duration
    const avdCol = colMap["Avg. View Duration (detik)"];
    if (avdCol) {
      const prevVal = Number(worksheet[avdCol + sumRow]?.v) || 0;
      worksheet[avdCol + sumRow] = {
        t: "n",
        f: `AVERAGE(${avdCol}${startRow}:${avdCol}${endRow})`,
        v: prevVal,
        z: FMT_DECIMAL_2,
      };
    }

    // Likes
    const likesCol = colMap["Likes"] || colMap["Total Likes"];
    if (likesCol) {
      const prevVal = Number(worksheet[likesCol + sumRow]?.v) || 0;
      worksheet[likesCol + sumRow] = {
        t: "n",
        f: `SUM(${likesCol}${startRow}:${likesCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Comments
    const commentsCol = colMap["Comments"] || colMap["Total Comments"];
    if (commentsCol) {
      const prevVal = Number(worksheet[commentsCol + sumRow]?.v) || 0;
      worksheet[commentsCol + sumRow] = {
        t: "n",
        f: `SUM(${commentsCol}${startRow}:${commentsCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Shares
    const sharesCol = colMap["Shares"] || colMap["Total Shares"];
    if (sharesCol) {
      const prevVal = Number(worksheet[sharesCol + sumRow]?.v) || 0;
      worksheet[sharesCol + sumRow] = {
        t: "n",
        f: `SUM(${sharesCol}${startRow}:${sharesCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // Followers
    const nfCol = colMap["New Followers"];
    if (nfCol) {
      const prevVal = Number(worksheet[nfCol + sumRow]?.v) || 0;
      worksheet[nfCol + sumRow] = {
        t: "n",
        f: `SUM(${nfCol}${startRow}:${nfCol}${endRow})`,
        v: prevVal,
        z: FMT_INTEGER,
      };
    }

    // ERR (%)
    const errCol = colMap["ERR (%)"];
    if (errCol) {
      const prevVal = Number(worksheet[errCol + sumRow]?.v) || 0;
      if (viewsCol && likesCol && commentsCol && sharesCol) {
        worksheet[errCol + sumRow] = {
          t: "n",
          f: `IF(${viewsCol}${sumRow}>0, ((${likesCol}${sumRow}+${commentsCol}${sumRow}+${sharesCol}${sumRow})/${viewsCol}${sumRow})*100, 0)`,
          v: prevVal,
          z: FMT_PERCENT,
        };
      } else {
        worksheet[errCol + sumRow] = {
          t: "n",
          f: `AVERAGE(${errCol}${startRow}:${errCol}${endRow})`,
          v: prevVal,
          z: FMT_PERCENT,
        };
      }
    }
  });

  // Calculate Auto Column Widths for Professional Layout
  const colWidths: { wch: number }[] = [];
  for (let c = range.s.c; c <= range.e.c; ++c) {
    let maxLen = 10;
    for (let r = range.s.r; r <= range.e.r; ++r) {
      const cell = worksheet[XLSX.utils.encode_cell({ r, c })];
      if (cell) {
        let str = "";
        if (cell.w) str = String(cell.w);
        else if (cell.v instanceof Date) str = cell.v.toISOString();
        else if (cell.v !== undefined && cell.v !== null) str = String(cell.v);
        if (str.length > maxLen) maxLen = str.length;
      }
    }
    colWidths.push({ wch: Math.min(Math.max(maxLen + 3, 12), 48) });
  }
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName =
    reportType === "product"
      ? "Laporan SKU"
      : reportType === "engagement"
        ? "Engagement"
        : exportMode === "sessions"
          ? "Sesi Live"
          : "Akumulasi Harian";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const platformTag = isTargetShopee
    ? "Shopee_Live"
    : isTargetTikTok
      ? "TikTok_Live"
      : platformFilter && platformFilter !== "all"
        ? platformFilter.replace(/[^a-zA-Z0-9_-]/g, "_")
        : "";

  let fileName = `Laporan_${cleanBrand}_${platformTag ? platformTag + "_" : ""}${reportType}.xlsx`;
  if (reportType === "live") {
    const modeTag = exportMode === "sessions" ? "Per_Sesi" : "Akumulasi_Harian";
    fileName = platformTag
      ? `Laporan_${cleanBrand}_${platformTag}_${modeTag}.xlsx`
      : `Laporan_${cleanBrand}_Live_${modeTag}.xlsx`;
  }
  XLSX.writeFile(workbook, fileName);
}

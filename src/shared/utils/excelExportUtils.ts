import * as XLSX from "xlsx";
import {
  formatDisplayDate,
  getLogTimestamp,
  filterLogsByDateAndShift,
  computeDurationCutoffs,
  formatDurationHoursMinutes,
  type DateSpecificShiftRule,
} from "./appUi";
import { formatLiveSessionDuration, getLiveSessionMetrics } from "./liveSessionsTable";

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
          row["Total Durasi"] = formatLiveSessionDuration(g.duration);
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

        return row;
      });
    } else {
      // PER SESI LIVE SAAT DI-START (DETAIL INDIVIDUAL SETIAP SESI)
      if (enableDurationCutoff) {
        const cutoffResult = computeDurationCutoffs(rawLogs, cutoffTargetHours);
        const rows: any[] = [];
        let globalIdx = 1;

        cutoffResult.batches.forEach((batch) => {
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

            row["No"] = globalIdx++;

            if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
              row["Tanggal & Jam Mulai"] = formattedStart || log.dateTime || log.date || "-";
            } else {
              if (selectedMetrics.includes("date")) {
                row["Tanggal"] = log.date || (log.dateTime ? log.dateTime.split(" ")[0] : "-");
              }
              if (selectedMetrics.includes("time")) {
                row["Jam Mulai"] = log.dateTime && log.dateTime.includes(" ")
                  ? log.dateTime.split(" ")[1]
                  : (log.dateTime && log.dateTime.includes("T") ? log.dateTime.split("T")[1].substring(0, 8) : "-");
              }
            }

            if (selectedMetrics.includes("platform")) {
              row["Platform"] = log.platform || (isShopee ? "Shopee Live" : isTikTok ? "TikTok Live" : "-");
            }
            if (selectedMetrics.includes("shift")) {
              row["Shift"] = log.shift || "-";
            }
            if (selectedMetrics.includes("duration")) {
              row["Durasi Live"] = formatLiveSessionDuration(log.duration || log.liveDuration || 0);
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

          // Insert CUT OFF SUB-TOTAL / SUMMARY ROW
          const summaryRow: any = {};
          const isCompleted = batch.isCompleted;
          summaryRow["No"] = `CUT OFF ${batch.batchNumber} (${isCompleted ? "TERPENUHI" : "BERJALAN"})`;

          const rangeInfo = `${batch.startDisplayDate} [${batch.startShift}] s/d ${batch.endDisplayDate} [${batch.endShift}]`;
          if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
            summaryRow["Tanggal & Jam Mulai"] = `Periode: ${rangeInfo} (${isCompleted ? `Terpenuhi di Sesi ${batch.endShift}` : "Belum Capai Target"})`;
          } else {
            if (selectedMetrics.includes("date")) {
              summaryRow["Tanggal"] = `${batch.startDisplayDate} s/d ${batch.endDisplayDate}`;
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
            summaryRow["Durasi Live"] = `${formatLiveSessionDuration(batch.totalDurationSeconds)} (${formatDurationHoursMinutes(batch.totalDurationSeconds)} / Target: ${cutoffTargetHours} Jam)`;
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
          if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
            summaryRow[isTargetShopee ? "Add to Cart" : "Product Clicks"] = batch.totalClicks;
          }
          if (selectedMetrics.includes("penonton")) {
            summaryRow[isTargetShopee ? "Views" : isTargetTikTok ? "Live Viewer" : "Views / Live Viewer"] = batch.totalViewer;
          }
          if (selectedMetrics.includes("conversion_rate")) {
            const cr = isTargetTikTok
              ? (batch.totalClicks > 0 ? (batch.totalOrders / batch.totalClicks) * 100 : 0)
              : (batch.totalViewer > 0 ? (batch.totalBuyers / batch.totalViewer) * 100 : 0);
            summaryRow["Conversion Rate (%)"] = Number(cr.toFixed(2));
          }

          summaryRow["Status Cutoff"] = isCompleted
            ? `CUT OFF ${batch.batchNumber} SELESAI: ${rangeInfo} | Durasi: ${formatDurationHoursMinutes(batch.totalDurationSeconds)} (Lebih ${formatDurationHoursMinutes(batch.surplusSeconds)})`
            : `CUT OFF ${batch.batchNumber} BERJALAN: ${rangeInfo} | Durasi: ${formatDurationHoursMinutes(batch.totalDurationSeconds)} (Kurang ${formatDurationHoursMinutes(batch.remainingSeconds)})`;

          rows.push(summaryRow);
        });

        dataToExport = rows;
      } else {
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
                : (log.dateTime && log.dateTime.includes("T") ? log.dateTime.split("T")[1].substring(0, 8) : "-");
            }
          }

          if (selectedMetrics.includes("platform")) {
            row["Platform"] = log.platform || (isShopee ? "Shopee Live" : isTikTok ? "TikTok Live" : "-");
          }
          if (selectedMetrics.includes("shift")) {
            row["Shift"] = log.shift || "-";
          }
          if (selectedMetrics.includes("duration")) {
            row["Durasi Live"] = formatLiveSessionDuration(log.duration || log.liveDuration || 0);
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

          return row;
        });
      }
    }
  } else if (reportType === "product" && productReportView) {
    dataToExport = productReportView.aggregatedSkus.map((sku: any, idx: number) => {
      const row: any = {};
      row["No"] = idx + 1;
      if (selectedMetrics.includes("date")) {
        row["Tanggal"] =
          dateFilterType === "latest" ? selectedLatestDate || "-" : dateFilterType === "monthly" ? "Bulanan" : "-";
      }
      if (selectedMetrics.includes("platform")) {
        row["Platform"] =
          platformFilter === "all" ? "Semua Platform" : platformFilter || "Shopee Live";
      }
      if (selectedMetrics.includes("sku")) row["SKU"] = sku.sku;
      if (selectedMetrics.includes("product_name") || selectedMetrics.includes("name")) row["Nama Produk"] = sku.productName || sku.name || "-";
      if (selectedMetrics.includes("items_sold") || selectedMetrics.includes("sold")) row["Jumlah Terjual"] = sku.sold;
      if (selectedMetrics.includes("revenue"))
        row["GMV / Revenue (Rp)"] = sku.revenue;
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

      row["No"] = idx + 1;
      const formattedDate = formatDisplayDate(log.dateTime || log.date, log.platform);
      if (selectedMetrics.includes("date") && selectedMetrics.includes("time")) {
        row["Tanggal & Jam Mulai"] = formattedDate || log.dateTime || log.date || "-";
      } else {
        if (selectedMetrics.includes("date"))
          row["Tanggal"] = log.date || log.dateTime?.split(" ")[0] || "-";
        if (selectedMetrics.includes("time"))
          row["Jam Mulai"] = log.dateTime?.includes(" ")
            ? log.dateTime.split(" ")[1]
            : "-";
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
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  const sheetName = exportMode === "sessions" ? "Sesi Live" : "Laporan";
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

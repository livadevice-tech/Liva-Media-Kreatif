import * as XLSX from "xlsx";
import { formatDisplayDate } from "./appUi";
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
}) {
  let dataToExport: any[] = [];
  const cleanBrand = brandName ? brandName.replace(/[^a-zA-Z0-9_-]/g, "_") : "Brand";

  if (reportType === "live" && liveReportView) {
    const rawLogs = (liveReportView.tableLogs && liveReportView.tableLogs.length > 0)
      ? liveReportView.tableLogs
      : (liveReportView.filteredDb || []);

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
      });

      // Sort descending by date
      const sortedGroups = Object.values(groups).sort((a, b) => {
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
      });

      dataToExport = sortedGroups.map((g, idx) => {
        const row: any = {};
        const isTikTok = String(g.platform || "").toLowerCase().includes("tiktok");
        const isShopee = String(g.platform || "").toLowerCase().includes("shopee");
        const avgViewSec = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const convRate = isTikTok
          ? (g.clicks > 0 ? (g.orders / g.clicks) * 100 : 0)
          : (g.viewer > 0 ? (g.buyers / g.viewer) * 100 : 0);

        row["No"] = idx + 1;
        row["Tanggal"] = g.dateKey;
        row["Jumlah Sesi"] = g.sessionCount;
        row["Total Durasi"] = formatLiveSessionDuration(g.duration);
        row["Platform"] = g.platform;
        row["Total Viewer"] = g.viewer;
        row["Total GMV (Rp)"] = g.gmv;
        row["Item Terjual"] = g.itemsSold;
        row["Avg. View Duration (detik)"] = Number(avgViewSec.toFixed(2));
        row["Total Orders"] = g.orders;
        row["Total Customer / Pembeli"] = g.buyers;
        row["Conversion Rate (%)"] = Number(convRate.toFixed(2));
        row["AOV (Rp)"] = g.orders > 0 ? Math.round(g.gmv / g.orders) : 0;
        row[isShopee ? "Total Add to Cart" : "Total Product Clicks"] = g.clicks;
        if (g.shopVouchers > 0) row["Voucher Diklaim"] = g.shopVouchers;
        row["Peak Viewers (Maks)"] = g.peakViewersMax;
        row["Total Likes"] = g.likes;
        row["Total Komentar"] = g.comments;
        row["Total Shares"] = g.shares;
        row["Pengikut Baru"] = g.followers;
        const totalEng = g.likes + g.comments + g.shares;
        row["ERR (%)"] = g.viewer > 0 ? Number(((totalEng / g.viewer) * 100).toFixed(2)) : 0;
        return row;
      });
    } else {
      // PER SESI LIVE SAAT DI-START (DETAIL INDIVIDUAL SETIAP SESI)
      const sortedLogs = [...rawLogs].sort((a, b) => {
        const timeA = new Date(a.dateTime || a.date || 0).getTime();
        const timeB = new Date(b.dateTime || b.date || 0).getTime();
        return timeB - timeA;
      });

      dataToExport = sortedLogs.map((log: any, idx: number) => {
        const row: any = {};
        const isTikTok = String(log.platform || "").toLowerCase().includes("tiktok");
        const isShopee = String(log.platform || "").toLowerCase().includes("shopee");
        const m = getLiveSessionMetrics(log);
        const formattedStart = formatDisplayDate(log.dateTime || log.date, log.platform);

        row["No"] = idx + 1;
        row["Tanggal & Jam Mulai"] = formattedStart || log.dateTime || log.date || "-";

        if (selectedMetrics.includes("date")) {
          row["Tanggal"] = log.date || (log.dateTime ? log.dateTime.split(" ")[0] : "-");
        }
        if (selectedMetrics.includes("time")) {
          row["Jam Mulai"] = log.dateTime && log.dateTime.includes(" ")
            ? log.dateTime.split(" ")[1]
            : (log.dateTime && log.dateTime.includes("T") ? log.dateTime.split("T")[1].substring(0, 8) : "-");
        }
        row["Platform"] = log.platform || "-";
        if (selectedMetrics.includes("shift")) {
          row["Shift"] = log.shift || "-";
        }
        row["Durasi"] = formatLiveSessionDuration(log.duration || log.liveDuration || 0);
        row["Viewer"] = m.viewer;
        row["GMV (Rp)"] = log.gmv || 0;
        row["Items Sold"] = log.products_sold || log.items_sold || 0;
        row["Avg. View Duration (detik)"] = Number((log.avgViewDuration || 0).toFixed(2));
        row["Orders"] = m.orders;
        row["Customer / Pembeli"] = m.customers;
        row["Conversion Rate (%)"] = Number(m.conversionRate.toFixed(2));
        row["AOV (Rp)"] = log.aov || (m.orders > 0 ? Math.round((log.gmv || 0) / m.orders) : 0);

        if (selectedMetrics.includes("est_income")) {
          const sec = log.duration || log.liveDuration || 0;
          row["GMV / Jam (Rp)"] = sec > 0 ? Math.round(((log.gmv || 0) / sec) * 3600) : 0;
        }

        if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks")) {
          row[isShopee ? "Add to Cart" : "Product Clicks"] = m.clicks;
        }
        if (selectedMetrics.includes("product_impressions")) {
          row["Product Impressions"] = log.productImpressions || 0;
        }
        if (selectedMetrics.includes("shop_vouchers")) {
          row["Voucher Diklaim"] = log.shopVouchers || 0;
        }
        if (selectedMetrics.includes("peak_viewers")) {
          row["Peak Viewers"] = log.peakViewers || 0;
        }
        if (selectedMetrics.includes("likes")) {
          row["Total Likes"] = log.likes || 0;
        }
        if (selectedMetrics.includes("comments")) {
          row["Total Komentar"] = log.comments || 0;
        }
        if (selectedMetrics.includes("shares")) {
          row["Total Shares"] = log.shares || 0;
        }
        if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers")) {
          row["Pengikut Baru"] = log.followers || log.newFollowers || 0;
        }
        if (selectedMetrics.includes("err")) {
          const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
          const imp = m.viewer || 0;
          row["ERR (%)"] = imp > 0 ? Number(((totalEng / imp) * 100).toFixed(2)) : 0;
        }

        return row;
      });
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
    const rawEngLogs = (engagementReportView.tableLogs && engagementReportView.tableLogs.length > 0)
      ? engagementReportView.tableLogs
      : (engagementReportView.filteredDb || []);

    dataToExport = rawEngLogs.map((log: any, idx: number) => {
      const row: any = {};
      row["No"] = idx + 1;
      const formattedDate = formatDisplayDate(log.dateTime || log.date, log.platform);
      row["Tanggal & Jam Mulai"] = formattedDate || log.dateTime || log.date || "-";

      if (selectedMetrics.includes("date"))
        row["Tanggal"] = log.date || log.dateTime?.split(" ")[0] || "-";
      if (selectedMetrics.includes("time"))
        row["Jam Mulai"] = log.dateTime?.includes(" ")
          ? log.dateTime.split(" ")[1]
          : "-";
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform || "-";
      if (selectedMetrics.includes("shift")) row["Shift"] = log.shift || "-";
      if (selectedMetrics.includes("views") || selectedMetrics.includes("viewers"))
        row["Views / Penonton"] = Math.max(
          log.impressions || 0,
          log.views || 0,
          log.liveVisits || 0,
          log.penonton || 0
        );
      if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers"))
        row["Pengikut Baru"] = log.newFollowers || log.followers || 0;
      if (selectedMetrics.includes("comments"))
        row["Komentar"] = log.comments || 0;
      if (selectedMetrics.includes("shares"))
        row["Total Shares"] = log.shares || 0;
      if (selectedMetrics.includes("likes")) row["Total Likes"] = log.likes || 0;
      if (selectedMetrics.includes("peak_viewers"))
        row["Peak Viewers"] = log.peakViewers || 0;
      if (selectedMetrics.includes("engagement_rate") || selectedMetrics.includes("err")) {
        const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
        const imp = log.impressions || log.views || 0;
        row["Engagement Rate (%)"] = imp > 0 ? Number(((totalEng / imp) * 100).toFixed(2)) : 0;
      }
      return row;
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  const sheetName = exportMode === "sessions" ? "Sesi Live" : "Laporan";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  let fileName = `Laporan_${cleanBrand}_${reportType}.xlsx`;
  if (reportType === "live") {
    fileName = exportMode === "sessions"
      ? `Laporan_${cleanBrand}_Live_Per_Sesi.xlsx`
      : `Laporan_${cleanBrand}_Live_Akumulasi_Harian.xlsx`;
  }
  XLSX.writeFile(workbook, fileName);
}

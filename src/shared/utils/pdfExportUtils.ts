import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDisplayDate } from "./appUi";
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
        return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
      });

      dataToExport = sortedGroups.map((g, idx) => {
        const row: any = {};
        const avgViewSec = g.sessionCount > 0 ? g.avgViewDurationSum / g.sessionCount : 0;
        const convRate = g.viewer > 0 ? (g.buyers / g.viewer) * 100 : 0;

        row["No"] = idx + 1;
        row["Tanggal"] = g.dateKey;
        row["Jumlah Sesi"] = g.sessionCount;
        row["Durasi Total"] = formatLiveSessionDuration(g.duration);
        row["Platform"] = g.platform;
        row["Viewer"] = new Intl.NumberFormat("id-ID").format(g.viewer);
        row["GMV (Rp)"] = "Rp" + new Intl.NumberFormat("id-ID").format(g.gmv);
        row["Item Terjual"] = new Intl.NumberFormat("id-ID").format(g.itemsSold);
        row["Avg. View"] = `${avgViewSec.toFixed(1)}s`;
        row["Orders"] = new Intl.NumberFormat("id-ID").format(g.orders);
        row["CR (%)"] = `${convRate.toFixed(2)}%`;
        return row;
      });
    } else {
      // PER SESI LIVE SAAT DI-START (INDIVIDUAL)
      const sortedLogs = [...rawLogs].sort((a, b) => {
        const timeA = new Date(a.dateTime || a.date || 0).getTime();
        const timeB = new Date(b.dateTime || b.date || 0).getTime();
        return timeB - timeA;
      });

      dataToExport = sortedLogs.map((log: any, idx: number) => {
        const row: any = {};
        const m = getLiveSessionMetrics(log);
        const formattedStart = formatDisplayDate(log.dateTime || log.date, log.platform);

        row["No"] = idx + 1;
        row["Tanggal & Jam Mulai"] = formattedStart || log.dateTime || log.date || "-";
        row["Platform"] = log.platform || "-";
        row["Durasi"] = formatLiveSessionDuration(log.duration || log.liveDuration || 0);
        row["Viewer"] = new Intl.NumberFormat("id-ID").format(m.viewer);
        row["GMV (Rp)"] = "Rp" + new Intl.NumberFormat("id-ID").format(log.gmv || 0);
        row["Items Sold"] = new Intl.NumberFormat("id-ID").format(log.products_sold || log.items_sold || 0);
        row["Avg. View"] = `${(log.avgViewDuration || 0).toFixed(1)}s`;
        row["Orders"] = new Intl.NumberFormat("id-ID").format(m.orders);
        row["CR (%)"] = `${m.conversionRate.toFixed(2)}%`;

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
    const rawEngLogs = (engagementReportView.tableLogs && engagementReportView.tableLogs.length > 0)
      ? engagementReportView.tableLogs
      : (engagementReportView.filteredDb || []);

    dataToExport = rawEngLogs.map((log: any, idx: number) => {
      const row: any = {};
      row["No"] = idx + 1;
      const formattedDate = formatDisplayDate(log.dateTime || log.date, log.platform);
      row["Tanggal & Jam Mulai"] = formattedDate || log.dateTime || log.date || "-";
      row["Platform"] = log.platform || "-";
      row["Views"] = new Intl.NumberFormat("id-ID").format(
        Math.max(log.impressions || 0, log.views || 0, log.liveVisits || 0, log.penonton || 0)
      );
      row["Pengikut Baru"] = new Intl.NumberFormat("id-ID").format(log.newFollowers || log.followers || 0);
      row["Komentar"] = new Intl.NumberFormat("id-ID").format(log.comments || 0);
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

  const getTitle = () => {
    switch (reportType) {
      case "live":
        return exportMode === "sessions"
          ? `Laporan Live Per Sesi (Start Time) - ${brandName}`
          : `Laporan Live Akumulasi Harian - ${brandName}`;
      case "product":
        return `Product Report - ${brandName}`;
      case "engagement":
        return `Engagement Report - ${brandName}`;
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
    headStyles: { fillColor: [86, 0, 224] },
    styles: { fontSize: 8 },
  });

  const modeSuffix = exportMode === "sessions" ? "_Per_Sesi" : "_Akumulasi_Harian";
  const fileName = reportType === "live"
    ? `${cleanBrand}_live${modeSuffix}_report.pdf`
    : `${cleanBrand}_${reportType}_report.pdf`;
  doc.save(fileName);
}

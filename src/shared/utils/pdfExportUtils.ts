import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
}) {
  let dataToExport: any[] = [];

  if (reportType === "live" && liveReportView) {
    dataToExport = liveReportView.filteredDb.map((log: any) => {
      const row: any = {};
      const isTikTok = String(log.platform || "").toLowerCase().includes("tiktok");
      const isShopee = String(log.platform || "").toLowerCase().includes("shopee");

      if (selectedMetrics.includes("date"))
        row["Tanggal"] = log.date || log.dateTime?.split(" ")[0] || "-";
      if (selectedMetrics.includes("time"))
        row["Jam Mulai"] = log.dateTime?.includes(" ")
          ? log.dateTime.split(" ")[1]
          : "-";
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform || "-";
      if (selectedMetrics.includes("shift")) row["Shift"] = log.shift || "-";
      if (selectedMetrics.includes("duration") || selectedMetrics.includes("duration_hours")) {
        const sec = log.duration || log.liveDuration || 0;
        const h = Math.floor(sec / 3600);
        const m = Math.round((sec % 3600) / 60);
        row["Durasi Live"] = `${h}h ${m}m (${sec}s)`;
      }

      // Sales Metrics
      if (selectedMetrics.includes("gmv")) row["GMV (Rp)"] = log.gmv || 0;
      if (selectedMetrics.includes("items_sold") || selectedMetrics.includes("products_sold"))
        row["Item Terjual"] = log.products_sold || log.items_sold || 0;
      if (selectedMetrics.includes("orders"))
        row["Orders"] = log.orders || 0;
      if (selectedMetrics.includes("buyers") || selectedMetrics.includes("viewers"))
        row["Customer / Pembeli"] = log.buyers || log.orders || 0;
      if (selectedMetrics.includes("aov"))
        row["AOV (Rp)"] = log.aov || (log.orders > 0 ? Math.round(log.gmv / log.orders) : 0);
      if (selectedMetrics.includes("est_income")) {
        const sec = log.duration || log.liveDuration || 0;
        row["GMV / Jam (Rp)"] = sec > 0 ? Math.round(((log.gmv || 0) / sec) * 3600) : 0;
      }

      // Funnel & View Metrics
      if (selectedMetrics.includes("impressions"))
        row[isTikTok ? "Live Impressions" : "View"] = log.impressions || log.views || 0;
      if (selectedMetrics.includes("live_viewer"))
        row["Viewer Active"] = log.liveVisits || log.views || log.penonton || 0;
      if (selectedMetrics.includes("penonton"))
        row["Penonton (Total)"] = Math.max(log.impressions || 0, log.views || 0, log.liveVisits || 0, log.penonton || 0);
      if (selectedMetrics.includes("product_impressions"))
        row["Product Impressions"] = log.productImpressions || 0;
      if (selectedMetrics.includes("product_clicks") || selectedMetrics.includes("clicks"))
        row[isShopee ? "Add to Cart" : "Product Clicks"] = log.clicks || 0;
      if (selectedMetrics.includes("shop_vouchers"))
        row["Voucher Claim"] = log.shopVouchers || 0;
      if (selectedMetrics.includes("conversion_rate")) {
        const v = Math.max(log.impressions || 0, log.views || 0, log.liveVisits || 0, log.penonton || 0);
        const b = log.buyers || log.orders || 0;
        row["Conversion Rate (%)"] = v > 0 ? ((b / v) * 100).toFixed(2) : "0.00";
      }

      // Engagement Metrics
      if (selectedMetrics.includes("likes")) row["Total Likes"] = log.likes || 0;
      if (selectedMetrics.includes("comments")) row["Total Komentar"] = log.comments || 0;
      if (selectedMetrics.includes("shares")) row["Total Shares"] = log.shares || 0;
      if (selectedMetrics.includes("new_followers") || selectedMetrics.includes("followers"))
        row["Pengikut Baru"] = log.followers || log.newFollowers || 0;
      if (selectedMetrics.includes("avg_view_duration"))
        row["Rata-rata Waktu Tonton (detik)"] = log.avgViewDuration || 0;
      if (selectedMetrics.includes("peak_viewers"))
        row["Peak Viewers"] = log.peakViewers || 0;
      if (selectedMetrics.includes("err") || selectedMetrics.includes("engagement_rate")) {
        const totalEng = (log.likes || 0) + (log.comments || 0) + (log.shares || 0);
        const imp = log.impressions || log.views || 0;
        row["ERR (%)"] = imp > 0 ? ((totalEng / imp) * 100).toFixed(2) : "0.00";
      }

      return row;
    });
  } else if (reportType === "product" && productReportView) {
    dataToExport = productReportView.aggregatedSkus.map((sku: any) => {
      const row: any = {};
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
    dataToExport = engagementReportView.filteredDb.map((log: any) => {
      const row: any = {};
      if (selectedMetrics.includes("date"))
        row["Tanggal"] = log.date || log.dateTime?.split(" ")[0] || "-";
      if (selectedMetrics.includes("time"))
        row["Jam Mulai"] = log.dateTime?.includes(" ")
          ? log.dateTime.split(" ")[1]
          : "-";
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform || "-";
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
        row["Engagement Rate (%)"] = imp > 0 ? ((totalEng / imp) * 100).toFixed(2) : "0.00";
      }
      return row;
    });
  } else if (reportType === "pipeline") {
    // Implement if needed in the future
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
        return `Live Report - ${brandName}`;
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
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 30,
    theme: "striped",
    headStyles: { fillColor: [86, 0, 224] },
    styles: { fontSize: 8 },
  });

  doc.save(`${brandName}_${reportType}_report.pdf`);
}

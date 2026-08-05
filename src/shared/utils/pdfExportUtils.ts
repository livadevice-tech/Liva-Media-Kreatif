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
      if (selectedMetrics.includes("date"))
        row["Tanggal"] = log.date || log.dateTime?.split(" ")[0];
      if (selectedMetrics.includes("time"))
        row["Jam (Waktu Mulai)"] = log.dateTime?.includes(" ")
          ? log.dateTime.split(" ")[1]
          : "-";
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform;
      if (selectedMetrics.includes("viewers"))
        row["Viewers (Penonton)"] = Math.max(
          log.impressions || 0,
          log.views || 0,
          log.liveVisits || 0,
          log.penonton || 0
        );
      if (selectedMetrics.includes("gmv")) row["GMV (Revenue)"] = log.gmv || 0;
      if (selectedMetrics.includes("products_sold"))
        row["Produk Terjual"] = log.products_sold || log.items_sold || 0;
      if (selectedMetrics.includes("buyers"))
        row["Total Pembeli"] = log.buyers || log.orders || 0;
      if (selectedMetrics.includes("conversion_rate")) {
        const v = Math.max(
          log.impressions || 0,
          log.views || 0,
          log.liveVisits || 0,
          log.penonton || 0
        );
        const b = log.buyers || log.orders || 0;
        row["Conversion Rate (%)"] =
          v > 0 ? ((b / v) * 100).toFixed(2) : "0.00";
      }
      if (selectedMetrics.includes("avg_view_duration"))
        row["Rata-rata Waktu Tonton (detik)"] = log.avgViewDuration || 0;
      if (selectedMetrics.includes("peak_viewers"))
        row["Peak Viewers"] = log.peakViewers || 0;
      if (selectedMetrics.includes("clicks"))
        row["Total Clicks"] = log.clicks || 0;
      if (selectedMetrics.includes("shares"))
        row["Total Shares"] = log.shares || 0;
      return row;
    });
  } else if (reportType === "product" && productReportView) {
    dataToExport = productReportView.aggregatedSkus.map((sku: any) => {
      const row: any = {};
      if (selectedMetrics.includes("date")) {
        row["Tanggal"] =
          dateFilterType === "latest" ? selectedLatestDate : "-";
      }
      if (selectedMetrics.includes("platform")) {
        row["Platform"] =
          platformFilter === "all" ? "Semua Platform" : platformFilter;
      }
      if (selectedMetrics.includes("sku")) row["SKU"] = sku.sku;
      if (selectedMetrics.includes("product_name")) row["Nama Produk"] = sku.name;
      if (selectedMetrics.includes("sold")) row["Jumlah Terjual"] = sku.sold;
      if (selectedMetrics.includes("revenue"))
        row["GMV / Revenue (Rp)"] = sku.revenue;
      return row;
    });
  } else if (reportType === "engagement" && engagementReportView) {
    dataToExport = engagementReportView.filteredDb.map((log: any) => {
      const row: any = {};
      if (selectedMetrics.includes("date"))
        row["Tanggal"] = log.date || log.dateTime?.split(" ")[0];
      if (selectedMetrics.includes("time"))
        row["Jam (Waktu Mulai)"] = log.dateTime?.includes(" ")
          ? log.dateTime.split(" ")[1]
          : "-";
      if (selectedMetrics.includes("platform")) row["Platform"] = log.platform;
      if (selectedMetrics.includes("viewers"))
        row["Viewers (Penonton)"] = Math.max(
          log.impressions || 0,
          log.views || 0,
          log.liveVisits || 0,
          log.penonton || 0
        );
      if (selectedMetrics.includes("new_followers"))
        row["Pengikut Baru"] = log.newFollowers || 0;
      if (selectedMetrics.includes("comments"))
        row["Komentar"] = log.comments || 0;
      if (selectedMetrics.includes("shares"))
        row["Total Shares"] = log.shares || 0;
      if (selectedMetrics.includes("likes")) row["Total Likes"] = log.likes || 0;
      if (selectedMetrics.includes("peak_viewers"))
        row["Peak Viewers"] = log.peakViewers || 0;
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

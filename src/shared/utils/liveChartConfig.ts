export const liveChartMetricOptions = [
  // --- Sale Metrics ---
  {
    key: "gmv",
    label: "GMV",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "itemsSold",
    label: "Item Sold",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "orders",
    label: "Orders",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    key: "aov",
    label: "AOV",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    key: "clicks",
    label: "Add to Cart",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
  },
  {
    key: "avgViewDuration",
    label: "Avg. View Duration",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    key: "viewerActive",
    label: "Viewer Active",
    color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  },
  {
    key: "gmvPerHour",
    label: "GMV/Hours",
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },

  // --- Engagement & Customer Metrics ---
  {
    key: "impressions",
    label: "View",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    key: "peakViewers",
    label: "Peak Viewer",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    key: "shopVouchers",
    label: "Voucher Claim",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    key: "buyers",
    label: "Customer",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    key: "likes",
    label: "Likes",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    key: "comments",
    label: "Comments",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  {
    key: "shares",
    label: "Shares",
    color: "bg-lime-50 text-lime-700 border-lime-200",
  },
  {
    key: "err",
    label: "ERR %",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
] as const;

export const liveChartMetricDefaults = [
  "gmv",
  "orders",
  "itemsSold",
  "clicks",
  "impressions",
] as const;

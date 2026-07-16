export const liveChartMetricOptions = [
  // --- Sale Metrics ---
  {
    key: "gmv",
    label: "GMV",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Sale Metrics",
  },
  {
    key: "itemsSold",
    label: "Item Sold",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    category: "Sale Metrics",
  },
  {
    key: "orders",
    label: "Orders",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    category: "Sale Metrics",
  },
  {
    key: "aov",
    label: "AOV",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    category: "Sale Metrics",
  },
  {
    key: "buyers",
    label: "Customer",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    category: "Sale Metrics",
  },
  {
    key: "productImpressions",
    label: "Product Impressions",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
    category: "Sale Metrics",
  },
  {
    key: "clicks",
    label: "Product clicks",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    category: "Sale Metrics",
  },
  {
    key: "gmvPerHour",
    label: "GMV/Hours",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    category: "Sale Metrics",
  },

  // --- Engagement Metrics ---
  {
    key: "impressions",
    label: "Live Impressions",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    category: "Engagement Metrics",
  },
  {
    key: "penonton",
    label: "Viewer",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Engagement Metrics",
  },
  {
    key: "likes",
    label: "Likes",
    color: "bg-red-50 text-red-700 border-red-200",
    category: "Engagement Metrics",
  },
  {
    key: "comments",
    label: "Comments",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    category: "Engagement Metrics",
  },
  {
    key: "shares",
    label: "Shares",
    color: "bg-lime-50 text-lime-700 border-lime-200",
    category: "Engagement Metrics",
  },
  {
    key: "followers",
    label: "New followers",
    color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    category: "Engagement Metrics",
  },
  {
    key: "avgViewDuration",
    label: "Avg. View Duration",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    category: "Engagement Metrics",
  },
  {
    key: "err",
    label: "ERR %",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Engagement Metrics",
  },
] as const;

export const liveChartMetricDefaults = [
  "gmv",
  "orders",
  "itemsSold",
  "clicks",
  "impressions",
] as const;

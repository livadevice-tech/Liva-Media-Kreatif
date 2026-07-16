export const liveChartMetricOptions = [
  // --- Sale Metrics (Shared) ---
  {
    key: "gmv",
    label: "GMV",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Sale Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "itemsSold",
    label: "Item Sold",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    category: "Sale Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "aov",
    label: "AOV",
    color: "bg-pink-50 text-pink-700 border-pink-200",
    category: "Sale Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "buyers",
    label: "Customer",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    category: "Sale Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "gmvPerHour",
    label: "GMV/Hours",
    color: "bg-violet-50 text-violet-700 border-violet-200",
    category: "Sale Metrics",
    platforms: ["tiktok", "shopee"],
  },

  // --- Sale Metrics (TikTok specific) ---
  {
    key: "orders",
    label: "Orders",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    category: "Sale Metrics",
    platforms: ["tiktok"],
  },
  {
    key: "productImpressions",
    label: "Product Impressions",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
    category: "Sale Metrics",
    platforms: ["tiktok"],
  },
  {
    key: "clicks",
    label: "Product clicks",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    category: "Sale Metrics",
    platforms: ["tiktok"],
  },

  // --- Sale Metrics (Shopee specific) ---
  {
    key: "orders",
    label: "Purchase",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    category: "Sale Metrics",
    platforms: ["shopee"],
  },
  {
    key: "clicks",
    label: "Add To Cart",
    color: "bg-teal-50 text-teal-700 border-teal-200",
    category: "Sale Metrics",
    platforms: ["shopee"],
  },

  // --- Engagement Metrics (Shared) ---
  {
    key: "likes",
    label: "Likes",
    color: "bg-red-50 text-red-700 border-red-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "comments",
    label: "Comments",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "shares",
    label: "Shares",
    color: "bg-lime-50 text-lime-700 border-lime-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "followers",
    label: "New followers",
    color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "avgViewDuration",
    label: "Avg. View Duration",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },
  {
    key: "err",
    label: "ERR %",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    category: "Engagement Metrics",
    platforms: ["tiktok", "shopee"],
  },

  // --- Engagement Metrics (TikTok specific) ---
  {
    key: "impressions",
    label: "Live Impressions",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    category: "Engagement Metrics",
    platforms: ["tiktok"],
  },
  {
    key: "liveVisits",
    label: "Live Viewer",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Engagement Metrics",
    platforms: ["tiktok"],
  },

  // --- Engagement Metrics (Shopee specific) ---
  {
    key: "impressions",
    label: "Viewer",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    category: "Engagement Metrics",
    platforms: ["shopee"],
  },
  {
    key: "liveVisits",
    label: "Viewer Active",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    category: "Engagement Metrics",
    platforms: ["shopee"],
  },
] as const;

export const liveChartMetricDefaults = [
  "gmv",
  "impressions",
] as const;

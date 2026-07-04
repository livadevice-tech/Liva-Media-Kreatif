export const engagementChartMetricOptions = [
  {
    key: "errRateNumeric",
    label: "ERR %",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    key: "uniqueViewers",
    label: "Unique Viewers",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
  },
  { key: "likes", label: "Likes", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "comments", label: "Comments", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { key: "shares", label: "Shares", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { key: "followers", label: "New Followers", color: "bg-orange-50 text-orange-700 border-orange-200" },
] as const;

export const engagementChartMetricDefaults = [
  "errRateNumeric",
  "uniqueViewers",
];

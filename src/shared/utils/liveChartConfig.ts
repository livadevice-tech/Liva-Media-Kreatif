export const liveChartMetricOptions = [
  {
    key: "gmv",
    label: "GMV",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "orders",
    label: "Pesanan",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    key: "itemsSold",
    label: "Produk",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    key: "clicks",
    label: "Klik",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    key: "penonton",
    label: "Penonton",
    color: "bg-cyan-50 text-cyan-750 border-cyan-200",
  },
] as const;

export const liveChartMetricDefaults = [
  "gmv",
  "orders",
  "itemsSold",
  "clicks",
  "penonton",
] as const;

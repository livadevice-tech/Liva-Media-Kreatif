export interface SkuLogLike {
  brandId?: string;
  date?: string;
  platform?: string;
  shift?: string;
  sku?: string;
  productName?: string;
  sold?: number;
  revenue?: number;
}

export interface AggregatedSku {
  sku: string;
  productName: string;
  sold: number;
  revenue: number;
}

export const getLatestDateForBrand = (
  logs: readonly SkuLogLike[],
  brandId: string,
) => {
  const matching = logs
    .filter((log) => log.brandId === brandId)
    .sort((a, b) => new Date(b.date || "0").getTime() - new Date(a.date || "0").getTime());

  return matching[0]?.date || "";
};

export const filterSkuLogs = (
  logs: readonly SkuLogLike[],
  options: {
    brandId: string;
    dateFilterType: ReportDateFilterType;
    latestDate?: string;
    customStartDate?: string;
    customEndDate?: string;
    selectedMonth?: string;
    platformFilter?: string;
    shiftFilters?: readonly string[];
    searchQuery?: string;
  },
) => {
  let res = logs.filter((r) => r.brandId === options.brandId);

  if (options.dateFilterType === "latest" && options.latestDate) {
    res = res.filter(
      (r) => r.date && r.date.startsWith(options.latestDate!.substring(0, 10)),
    );
  } else if (
    (options.dateFilterType === "custom" || options.dateFilterType === "daily" || options.dateFilterType === "weekly") &&
    options.customStartDate
  ) {
    res = res.filter(
      (r) =>
        r.date &&
        r.date >= options.customStartDate! &&
        r.date <= (options.customEndDate || options.customStartDate || ""),
    );
  } else if ((options.dateFilterType === "month" || options.dateFilterType === "monthly") && options.selectedMonth) {
    res = res.filter(
      (r) => r.date && r.date.startsWith(options.selectedMonth || ""),
    );
  }

  if (options.platformFilter) {
    const q = options.platformFilter.toLowerCase();
    res = res.filter(
      (r) => r.platform && r.platform.toLowerCase().includes(q),
    );
  }

  if (options.shiftFilters && options.shiftFilters.length > 0) {
    res = res.filter((r) => options.shiftFilters!.includes(r.shift || ""));
  }

  if (options.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    res = res.filter(
      (r) =>
        (r.sku && r.sku.toLowerCase().includes(q)) ||
        (r.productName && r.productName.toLowerCase().includes(q)),
    );
  }

  return res;
};

export const aggregateSkuLogs = (logs: readonly SkuLogLike[]) => {
  const skuMap = new Map<string, AggregatedSku>();

  logs.forEach((s) => {
    const key = s.sku !== "N/A" ? s.sku || "" : s.productName || "";
    const ex = skuMap.get(key);
    if (ex) {
      ex.sold += Number(s.sold) || 0;
      ex.revenue += Number(s.revenue) || 0;
    } else {
      skuMap.set(key, {
        sku: s.sku || "",
        productName: s.productName || "",
        sold: Number(s.sold) || 0,
        revenue: Number(s.revenue) || 0,
      });
    }
  });

  return Array.from(skuMap.values());
};

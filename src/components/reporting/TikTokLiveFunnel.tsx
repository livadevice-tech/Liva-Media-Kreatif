import {
  Eye,
  GitBranch,
  MousePointerClick,
  PackageSearch,
  Radio,
  ShoppingBag,
} from "lucide-react";
import { useId } from "react";

type TikTokLiveFunnelProps = {
  impressions: number;
  views: number;
  productImpressions: number;
  productClicks: number;
  skuOrders: number;
  className?: string;
};

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const asSafeNumber = (value: number) =>
  Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

const asPercent = (value: number, base: number) =>
  base > 0 ? `${decimalFormatter.format((value / base) * 100)}%` : "—";

export function TikTokLiveFunnel({
  impressions,
  views,
  productImpressions,
  productClicks,
  skuOrders,
  className = "",
}: TikTokLiveFunnelProps) {
  const titleId = useId();
  const metrics = {
    impressions: asSafeNumber(impressions),
    views: asSafeNumber(views),
    productImpressions: asSafeNumber(productImpressions),
    productClicks: asSafeNumber(productClicks),
    skuOrders: asSafeNumber(skuOrders),
  };

  const exposurePerView =
    metrics.views > 0
      ? `${decimalFormatter.format(metrics.productImpressions / metrics.views)}×`
      : "—";
  const overallConversion = asPercent(metrics.skuOrders, metrics.views);
  const hasFunnelData = Object.values(metrics).some((value) => value > 0);

  const stages = [
    {
      label: "Impressions",
      helper: "Jangkauan LIVE",
      value: metrics.impressions,
      icon: Radio,
    },
    {
      label: "Views",
      helper: "Penonton masuk",
      value: metrics.views,
      icon: Eye,
    },
    {
      label: "Product Impressions",
      helper: "Eksposur produk",
      value: metrics.productImpressions,
      icon: PackageSearch,
    },
    {
      label: "Product Clicks",
      helper: "Klik produk",
      value: metrics.productClicks,
      icon: MousePointerClick,
    },
    {
      label: "SKU Orders",
      helper: "Pesanan teratribusi",
      value: metrics.skuOrders,
      icon: ShoppingBag,
    },
  ];

  const transitions = [
    { value: asPercent(metrics.views, metrics.impressions), label: "View rate" },
    { value: exposurePerView, label: "Exposure / view" },
    {
      value: asPercent(metrics.productClicks, metrics.productImpressions),
      label: "Product CTR",
    },
    {
      value: asPercent(metrics.skuOrders, metrics.productClicks),
      label: "Click → order",
    },
  ];

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3
              id={titleId}
              className="text-sm font-black text-slate-900 sm:text-base"
            >
              Funnel Konversi TikTok Live
            </h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Alur dari jangkauan LIVE sampai pesanan SKU teratribusi.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
            Sumber: Raw TikTok
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
            View → Order {overallConversion}
          </span>
        </div>
      </div>

      {!hasFunnelData ? (
        <div className="px-6 py-10 text-center" role="status">
          <p className="text-sm font-bold text-slate-700">
            Data funnel TikTok belum tersedia.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Upload file Live Performance yang memuat Impressions, Views, Product
            Impressions, Product clicks, dan Attributed SKU orders.
          </p>
        </div>
      ) : (
        <>
          <div
            className="overflow-x-auto px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 sm:px-6"
            tabIndex={0}
            aria-label="Tahapan funnel TikTok Live; geser horizontal untuk melihat seluruh tahap"
          >
            <div className="flex min-w-[940px] items-stretch" role="list">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const transition = transitions[index];

                return (
                  <div key={stage.label} className="contents">
                    <div
                      className={`min-w-0 flex-1 rounded-xl border p-4 ${
                        index === stages.length - 1
                          ? "border-emerald-200 bg-emerald-50/70"
                          : "border-slate-200 bg-slate-50/70"
                      }`}
                      role="listitem"
                    >
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            index === stages.length - 1
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-[10px] font-black tabular-nums text-slate-400">
                          0{index + 1}
                        </span>
                      </div>
                      <p className="truncate text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {stage.label}
                      </p>
                      <p className="mt-1 text-2xl font-black tracking-tight tabular-nums text-slate-900">
                        {numberFormatter.format(stage.value)}
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-500">
                        {stage.helper}
                      </p>
                    </div>

                    {transition && (
                      <div className="flex w-[76px] shrink-0 flex-col items-center justify-center px-2 text-center">
                        <span className="mb-2 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-[10px] font-black tabular-nums text-indigo-700">
                          {transition.value}
                        </span>
                        <div className="relative h-px w-full bg-slate-200">
                          <span className="absolute -right-0.5 -top-[3px] h-2 w-2 rotate-45 border-r border-t border-slate-300" />
                        </div>
                        <span className="mt-2 text-[9px] font-bold uppercase leading-tight tracking-wide text-slate-400">
                          {transition.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-[11px] leading-relaxed text-slate-500 sm:px-6">
            <PackageSearch className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p>
              Product Impressions menghitung frekuensi eksposur produk, bukan
              penonton unik. Nilainya dapat lebih besar dari Views; karena itu
              tahap tersebut memakai rasio eksposur per view.
            </p>
          </div>
        </>
      )}
    </section>
  );
}

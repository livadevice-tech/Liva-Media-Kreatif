import { Users, UserCheck, ShoppingCart, Wallet, Activity, Eye, MousePointerClick, ShoppingBag } from "lucide-react";
import type { LiveReportSummaryStats } from "./liveReportSummaryTypes";
import { useId } from "react";

type MobileLiveFunnelCardProps = {
  stats: LiveReportSummaryStats;
  isShopee?: boolean;
};

export function MobileLiveFunnelCard({ stats, isShopee = false }: MobileLiveFunnelCardProps) {
  const {
    totalDbImpressions,
    totalDbLiveVisits,
    totalDbClicks,
    totalDbOrdersFunnel,
    totalDbProductImpressions,
  } = stats;

  const shopeeSteps = [
    { label: "Viewer", value: totalDbImpressions, icon: Users },
    { label: "Viewer Aktif", value: totalDbLiveVisits, icon: UserCheck },
    { label: "Add to Cart", value: totalDbClicks, icon: ShoppingCart },
    { label: "Purchase", value: totalDbOrdersFunnel, icon: Wallet },
    {
      label: "CR",
      value:
        totalDbClicks > 0
          ? (totalDbOrdersFunnel / totalDbClicks) * 100
          : totalDbLiveVisits > 0
            ? (totalDbOrdersFunnel / totalDbLiveVisits) * 100
            : totalDbImpressions > 0
            ? (totalDbOrdersFunnel / totalDbImpressions) * 100
            : 0,
      isPercentage: true,
      icon: Activity,
    },
  ];

  const tiktokSteps = [
    { label: "Live Impr.", value: totalDbImpressions, icon: Users },
    { label: "Product Impr.", value: totalDbProductImpressions, icon: Eye },
    { label: "Clicks", value: totalDbClicks, icon: MousePointerClick },
    { label: "Orders", value: totalDbOrdersFunnel, icon: ShoppingBag },
    {
      label: "CR",
      value:
        totalDbClicks > 0
          ? (totalDbOrdersFunnel / totalDbClicks) * 100
          : totalDbProductImpressions > 0
            ? (totalDbOrdersFunnel / totalDbProductImpressions) * 100
            : totalDbImpressions > 0
            ? (totalDbOrdersFunnel / totalDbImpressions) * 100
            : 0,
      isPercentage: true,
      icon: Activity,
    },
  ];

  const steps = isShopee ? shopeeSteps : tiktokSteps;
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, "");

  // Colors for the 5 contiguous blocks (light to dark)
  const blockColors = [
    "#e2e8f8", // Lightest
    "#b8c6f2",
    "#8ea7eb",
    "#597ee3",
    "#2253de"  // Darkest
  ];

  const stepWidth = 1000 / steps.length;

  return (
    <div className="bg-white rounded-[16px] border border-slate-100 p-4 shadow-sm font-sans mb-4 w-full md:hidden animate-fadeIn">
      <h3 className="text-[14px] font-bold text-slate-800 mb-4">Funnel Konversi</h3>
      
      {/* Contiguous Funnel SVG Bar with slope */}
      <div className="w-full h-[46px] relative mb-3 overflow-hidden rounded-[8px]">
        <svg
          viewBox="0 0 1000 130"
          preserveAspectRatio="none"
          className="w-full h-full absolute inset-0"
        >
          <defs>
            <clipPath id={`mobile-funnel-clip-${uniqueId}`}>
              <path d="M 0,20 Q 300,30 1000,40 L 1000,90 Q 300,100 0,110 Z" />
            </clipPath>
          </defs>

          <g clipPath={`url(#mobile-funnel-clip-${uniqueId})`}>
            {steps.map((_, i) => (
              <rect
                key={i}
                x={i * stepWidth}
                y="0"
                width={stepWidth + 1}
                height="130"
                fill={blockColors[i % blockColors.length]}
              />
            ))}
          </g>
        </svg>

        {/* Icons Overlay */}
        <div className="absolute inset-0 flex">
          {steps.map((step, i) => (
            <div key={i} className="flex-1 flex items-center justify-center pt-[2px]">
              <step.icon className={`w-4 h-4 ${i === 0 ? "text-slate-400" : "text-white/90"}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Labels & Values */}
      <div className="flex w-full text-center">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 px-[2px]">
            <div className="text-[9px] font-bold text-slate-500 mb-1 leading-tight h-[24px] flex items-center justify-center break-words">
              {step.label}
            </div>
            <div className="text-[11px] font-black text-slate-800 tracking-tight">
              {step.isPercentage
                ? `${step.value.toFixed(2)}%`
                : new Intl.NumberFormat("id-ID").format(step.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Pills */}
      <div className="flex justify-center mt-4 w-full">
        <div className="flex w-full" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
          {steps.slice(1).map((step, i) => {
            const prev = steps[i].value;
            const current = step.value;
            
            return (
              <div key={i} className="flex-1 flex justify-center">
                <span className="bg-[#f0f0ff] text-[#5600e0] text-[9px] font-black px-2 py-0.5 rounded-full">
                  {!step.isPercentage && prev > 0 
                    ? `${((current / prev) * 100).toFixed(1)}%`
                    : `${step.value.toFixed(1)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

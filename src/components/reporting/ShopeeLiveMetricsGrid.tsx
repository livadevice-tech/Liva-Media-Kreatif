import type { ReactNode } from "react";

type MetricTone = "violet" | "blue" | "amber" | "emerald" | "indigo" | "green" | "rose";

export type ShopeeLiveMetric = {
  title: string;
  value: string;
  current: number;
  previous?: number;
  periodLabel: string;
  icon: ReactNode;
  tone?: MetricTone;
};

const toneStyles: Record<
  MetricTone,
  {
    iconWrap: string;
    badge: string;
  }
> = {
  violet: {
    iconWrap: "bg-violet-50 text-violet-600 ring-violet-100",
    badge: "border-violet-100 bg-violet-50 text-violet-700",
  },
  blue: {
    iconWrap: "bg-sky-50 text-sky-600 ring-sky-100",
    badge: "border-sky-100 bg-sky-50 text-sky-700",
  },
  amber: {
    iconWrap: "bg-amber-50 text-amber-600 ring-amber-100",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
  },
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  indigo: {
    iconWrap: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
  },
  green: {
    iconWrap: "bg-green-50 text-green-600 ring-green-100",
    badge: "border-green-100 bg-green-50 text-green-700",
  },
  rose: {
    iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
    badge: "border-rose-100 bg-rose-50 text-rose-700",
  },
};

function buildComparison(current: number, previous?: number) {
  if (
    previous === undefined ||
    previous === null ||
    Number.isNaN(previous) ||
    previous === 0
  ) {
    return {
      label: "-",
      tone: "neutral" as const,
    };
  }

  const delta = current - previous;
  const pct = Math.abs((delta / previous) * 100);

  return {
    label: `${delta >= 0 ? "↑" : "↓"} ${pct.toFixed(1)}%`,
    tone: delta >= 0 ? ("up" as const) : ("down" as const),
  };
}

function renderMetricCard(metric: ShopeeLiveMetric) {
  const tone = toneStyles[metric.tone ?? "violet"];
  const comparison = buildComparison(metric.current, metric.previous);

	return (
	    <article className="flex min-h-44 min-w-0 flex-col rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:min-h-48 sm:p-5">
	      <div className="flex min-w-0 items-center gap-3">
	        <div
	          className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1 sm:size-12 ${tone.iconWrap}`}
	          aria-hidden="true"
	        >
	          {metric.icon}
	        </div>
	        <div className="min-w-0 flex-1">
	          <div className="text-pretty text-[10px] font-black uppercase leading-4 tracking-[0.18em] text-slate-500 sm:text-[11px]">
	            {metric.title}
	          </div>
	        </div>
	      </div>

	      <div className="mt-4 whitespace-nowrap text-[clamp(1.5rem,1.9vw,2.15rem)] font-black leading-tight text-slate-950 tabular-nums">
	        {metric.value}
	      </div>

	      <div className="mt-auto flex min-w-0 flex-wrap items-center gap-2 pt-4">
	        <span
	          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black tracking-tight tabular-nums ${
	            comparison.tone === "up"
	              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
	              : comparison.tone === "down"
	                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
	        >
	          {comparison.label}
	        </span>
	        <span className="min-w-0 truncate text-[11px] font-semibold text-slate-500 sm:text-[12px]">
	          vs {metric.periodLabel}
	        </span>
	      </div>
	    </article>
  );
}

export function ShopeeLiveMetricsGrid({
  metrics,
  className = "",
}: {
  metrics: ShopeeLiveMetric[];
  className?: string;
}) {
  const topRow = metrics.slice(0, 4);
  const bottomRow = metrics.slice(4, 6);

  return (
    <div className={`space-y-4 ${className}`.trim()}>
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
        {topRow.map((metric) => (
          <div key={metric.title}>{renderMetricCard(metric)}</div>
        ))}
      </div>

      {bottomRow.length > 0 && (
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:gap-4">
          {bottomRow.map((metric) => (
            <div key={metric.title}>{renderMetricCard(metric)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

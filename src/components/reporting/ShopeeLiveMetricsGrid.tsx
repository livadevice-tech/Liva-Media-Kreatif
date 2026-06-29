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
    accent: string;
  }
> = {
  violet: {
    iconWrap: "bg-violet-50 text-violet-600 ring-violet-100",
    badge: "border-violet-100 bg-violet-50 text-violet-700",
    accent: "from-violet-500/20 via-violet-500/10 to-transparent",
  },
  blue: {
    iconWrap: "bg-sky-50 text-sky-600 ring-sky-100",
    badge: "border-sky-100 bg-sky-50 text-sky-700",
    accent: "from-sky-500/20 via-sky-500/10 to-transparent",
  },
  amber: {
    iconWrap: "bg-amber-50 text-amber-600 ring-amber-100",
    badge: "border-amber-100 bg-amber-50 text-amber-700",
    accent: "from-amber-500/20 via-amber-500/10 to-transparent",
  },
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
    accent: "from-emerald-500/20 via-emerald-500/10 to-transparent",
  },
  indigo: {
    iconWrap: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    badge: "border-indigo-100 bg-indigo-50 text-indigo-700",
    accent: "from-indigo-500/20 via-indigo-500/10 to-transparent",
  },
  green: {
    iconWrap: "bg-green-50 text-green-600 ring-green-100",
    badge: "border-green-100 bg-green-50 text-green-700",
    accent: "from-green-500/20 via-green-500/10 to-transparent",
  },
  rose: {
    iconWrap: "bg-rose-50 text-rose-600 ring-rose-100",
    badge: "border-rose-100 bg-rose-50 text-rose-700",
    accent: "from-rose-500/20 via-rose-500/10 to-transparent",
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
    <div className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tone.accent}`}
      />
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${tone.iconWrap}`}
          aria-hidden="true"
        >
          {metric.icon}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-500">
            {metric.title}
          </div>
          <div className="mt-5 text-[26px] sm:text-[30px] font-black tracking-tight text-slate-950 tabular-nums">
            {metric.value}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black tabular-nums ${
            comparison.tone === "up"
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : comparison.tone === "down"
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          {comparison.label}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          vs {metric.periodLabel}
        </span>
      </div>
    </div>
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
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        {topRow.map((metric) => (
          <div key={metric.title}>{renderMetricCard(metric)}</div>
        ))}
      </div>

      {bottomRow.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {bottomRow.map((metric) => (
            <div key={metric.title}>{renderMetricCard(metric)}</div>
          ))}
        </div>
      )}
    </div>
  );
}

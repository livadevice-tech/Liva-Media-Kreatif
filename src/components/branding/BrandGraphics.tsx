import { Sparkles } from "lucide-react";

export function LivaLogo({
  className = "h-11",
  url,
}: {
  className?: string;
  url?: string;
}) {
  if (url)
    return (
      <img
        src={url}
        className={`object-contain ${className}`}
        alt="Liva Agency Logo"
      />
    );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 380 130"
        className="h-full w-auto select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="livaBrandGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#b158fc" />
            <stop offset="100%" stopColor="#772bf2" />
          </linearGradient>
        </defs>

        <rect
          x="5"
          y="5"
          width="110"
          height="110"
          rx="28"
          fill="url(#livaBrandGrad)"
        />

        <path
          d="M 43 42 C 43 31, 77 31, 77 42"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="32" y="42" width="56" height="42" rx="8" fill="white" />
        <path
          d="M 85 51 Q 88 50, 99 44 Q 104 41, 104 47 L 104 79 Q 104 85, 99 82 Q 88 76, 85 75 Z"
          fill="white"
        />

        <path
          d="M 132 32 L 132 82 L 165 82"
          stroke="#772bf2"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M 188 50 L 188 82"
          stroke="#772bf2"
          strokeWidth="15"
          strokeLinecap="round"
        />

        <path
          d="M 174 34 C 182 25, 194 25, 202 34"
          stroke="#f97316"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 180 42 C 184 38, 192 38, 196 42"
          stroke="#f97316"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M 215 50 L 230 82 L 245 50"
          stroke="#772bf2"
          strokeWidth="14"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="282"
          cy="66"
          r="16"
          stroke="#772bf2"
          strokeWidth="13"
          fill="none"
        />
        <path
          d="M 298 50 L 298 82"
          stroke="#772bf2"
          strokeWidth="13"
          strokeLinecap="round"
        />

        <text
          x="132"
          y="114"
          fill="#3c2f56"
          fontSize="24"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.8"
        >
          Agency
        </text>
      </svg>
    </div>
  );
}

export function HorizontalFunnel({
  steps,
  title = "Sales Funnel",
  subtitle = "TikTok Shop Live Performance",
  tag = "",
}: {
  steps: { label: string; value: string | number; raw?: number }[];
  title?: string;
  subtitle?: string;
  tag?: string;
}) {
  const colors = ["#dce4f4", "#aebbef", "#83a3f0", "#5681ea", "#1c52e4"];
  const stepWidth = steps.length > 0 ? 1000 / steps.length : 1000;

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans flex flex-col justify-between text-left col-span-full">
      {(title || subtitle || tag) && (
        <div className="flex justify-between items-start mb-6">
          <div>
            {title && (
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-amber-500" /> {title}
              </h4>
            )}
            {subtitle && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {tag && (
            <span className="text-[9px] bg-slate-100 font-extrabold text-slate-500 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          )}
        </div>
      )}

      <div className="flex w-full mb-6 mt-2">
        {steps.map((step, i) => {
          const prevRaw = i > 0 ? steps[i - 1].raw : undefined;
          const pct =
            typeof step.raw !== "undefined" &&
            typeof prevRaw !== "undefined" &&
            prevRaw > 0
              ? ((step.raw / prevRaw) * 100).toFixed(1)
              : undefined;
          return (
            <div
              key={i}
              className={`flex-1 ${i !== 0 ? "border-l border-slate-200" : ""} px-4`}
            >
              <div className="text-[11px] sm:text-[13px] text-slate-500 mb-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-2">
                <span>{step.label}</span>
                {pct !== undefined && (
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                    {pct}%
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {step.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full h-[80px] sm:h-[110px] relative -mt-2">
        <svg
          viewBox="0 0 1000 130"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            <clipPath
              id={`funnel-inner-clip-${title.replace(/[^a-zA-Z0-9]/g, "")}`}
            >
              <path d="M 0,20 Q 300,35 1000,42 L 1000,88 Q 300,95 0,110 Z" />
            </clipPath>
          </defs>

          <path
            d="M 0,0 Q 300,25 1000,35 L 1000,95 Q 300,105 0,130 Z"
            fill="#e9effc"
            opacity="0.6"
          />

          <g
            clipPath={`url(#funnel-inner-clip-${title.replace(/[^a-zA-Z0-9]/g, "")})`}
          >
            {steps.map((_, i) => (
              <rect
                key={i}
                x={i * stepWidth}
                y="0"
                width={stepWidth + 1}
                height="130"
                fill={colors[i % colors.length]}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

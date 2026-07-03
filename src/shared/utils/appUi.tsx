export const getAvatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Host",
  )}&background=f3e8ff&color=7e22ce&bold=true`;

/**
 * Menggantikan setDoc(doc(db, "settings", "global_configs"), ...) dari Firebase.
 * Menyimpan config ke localStorage dengan merge (hanya update field yang diberikan).
 */
export const isPlatformMatch = (lp: string, fp: string) => {
  if (!fp || fp === "Semua Platform") return true;
  if (!lp) return false;
  const val1 = String(lp).toLowerCase().replace(/[^a-z0-9]/g, "");
  const val2 = String(fp).toLowerCase().replace(/[^a-z0-9]/g, "");
  return val1 === val2 || val1.includes(val2) || val2.includes(val1);
};

export const formatDisplayDate = (dString: string, platform?: string) => {
  if (!dString) return "";
  const dStr = String(dString);
  const mainPart = dStr.includes("T") ? dStr.split("T")[0] : dStr.split(" ")[0];
  let timePart = "";
  if (platform !== "Shopee Live") {
    if (dStr.includes("T")) {
      const tSplit = dStr.split("T")[1];
      if (tSplit) timePart = tSplit.substring(0, 5);
    } else {
      timePart = dStr.substring(mainPart.length).trim();
    }
  }
  const parts = mainPart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const newDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return timePart ? `${newDate} ${timePart}` : newDate;
  }
  if (parts.length === 3) {
    return platform === "Shopee Live"
      ? mainPart
      : timePart
        ? `${mainPart} ${timePart}`
        : dStr;
  }
  return platform === "Shopee Live" ? mainPart : dStr;
};

export const normalizeDateYMD = (d: string) => {
  if (!d) return "";
  let norm = d.split("T")[0].split(" ")[0]; // strip time if ISO or datetime

  const p = norm.split(/[\/\-]/);
  if (p.length === 3) {
    // If format is DD/MM/YYYY or DD-MM-YYYY
    if (p[0].length <= 2) {
      const y = p[2].length === 2 ? `20${p[2]}` : p[2];
      const m = String(p[1]).padStart(2, "0");
      const day = String(p[0]).padStart(2, "0");
      norm = `${y}-${m}-${day}`;
    } else if (p[0].length === 4) {
      // If format is YYYY/MM/DD or YYYY-MM-DD or YYYY-M-D
      const y = p[0];
      const m = String(p[1]).padStart(2, "0");
      const day = String(p[2]).padStart(2, "0");
      norm = `${y}-${m}-${day}`;
    }
  }
  return norm;
};

// Dynamic color generators for Brand, Shift, and Studio to boost UX readability
export const getBrandStyle = (brandName: string) => {
  if (!brandName) return "bg-slate-50 text-slate-700 border-slate-200/40";
  const b = brandName.toLowerCase().trim();

  // High-contrast, beautifully paired visual identities
  if (b.includes("somethinc") || b.includes("skin")) {
    return "bg-rose-50 text-rose-700 border-rose-200/50";
  }
  if (b.includes("wardah") || b.includes("cosmetic") || b.includes("cosmetics")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
  }
  if (b.includes("skintific") || b.includes("scientific") || b.includes("scien")) {
    return "bg-sky-50 text-sky-750 border-sky-200/50";
  }
  if (b.includes("scarlett") || b.includes("scarlet")) {
    return "bg-purple-50 text-purple-700 border-purple-200/50";
  }
  if (b.includes("avoskin") || b.includes("nourish") || b.includes("hair")) {
    return "bg-teal-50 text-teal-700 border-teal-200/50";
  }
  if (b.includes("make over") || b.includes("over") || b.includes("beauty")) {
    return "bg-slate-100 text-slate-800 border-slate-300/50";
  }
  if (b.includes("maybelline")) {
    return "bg-amber-50 text-amber-805 border-amber-200/50";
  }

  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 7;
  const colorMap = [
    "bg-indigo-50 text-indigo-700 border-indigo-200/50",
    "bg-fuchsia-100/50 text-fuchsia-800 border-fuchsia-200/50",
    "bg-violet-50 text-violet-750 border-violet-200/50",
    "bg-pink-100/50 text-pink-700 border-pink-200/50",
    "bg-cyan-50 text-cyan-750 border-cyan-200/50",
    "bg-orange-50 text-orange-755 border-orange-200/50",
    "bg-lime-50 text-lime-800 border-lime-200/50",
  ];
  return colorMap[index];
};

export const getShiftStyle = (timeSlot: string) => {
  if (!timeSlot) return "bg-slate-50 text-slate-600 border-slate-200/40";
  const t = timeSlot.toLowerCase();

  if (
    t.includes("pagi") ||
    t.includes("06:") ||
    t.includes("07:") ||
    t.includes("08:") ||
    t.includes("09:")
  ) {
    return "bg-sky-50 text-sky-850 border border-sky-200/40";
  }
  if (
    t.includes("siang") ||
    t.includes("10:") ||
    t.includes("11:") ||
    t.includes("12:") ||
    t.includes("13:") ||
    t.includes("14:")
  ) {
    return "bg-amber-50 text-amber-850 border border-amber-200/40";
  }
  if (
    t.includes("sore") ||
    t.includes("15:") ||
    t.includes("16:") ||
    t.includes("17:") ||
    t.includes("18:")
  ) {
    return "bg-teal-50 text-teal-850 border border-teal-200/40";
  }
  if (
    t.includes("malam") ||
    t.includes("19:") ||
    t.includes("20:") ||
    t.includes("21:") ||
    t.includes("22:") ||
    t.includes("23:") ||
    t.includes("00:")
  ) {
    return "bg-indigo-50 text-indigo-850 border border-indigo-200/40";
  }

  let hash = 0;
  for (let i = 0; i < timeSlot.length; i++) {
    hash = timeSlot.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  const palettes = [
    "bg-sky-50/85 text-sky-850 border border-sky-200/30",
    "bg-amber-50/85 text-amber-850 border border-amber-200/30",
    "bg-rose-50/85 text-rose-850 border border-rose-200/30",
    "bg-emerald-50/85 text-emerald-850 border border-emerald-200/30",
  ];
  return palettes[index];
};

export const getStudioHeaderStyle = (studioName: string) => {
  if (!studioName) return "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-100";
  const s = studioName.toLowerCase();

  if (s.includes("1") || s.includes("satu") || s.includes("reguler")) {
    return "bg-gradient-to-r from-blue-500/10 to-blue-500/5 border-l-[3.5px] border-l-blue-600 text-blue-900 border-y border-r border-blue-150/40";
  }
  if (s.includes("2") || s.includes("dua") || s.includes("backup")) {
    return "bg-gradient-to-r from-teal-500/10 to-teal-500/5 border-l-[3.5px] border-l-teal-600 text-teal-900 border-y border-r border-teal-150/40";
  }
  if (s.includes("3") || s.includes("tiga")) {
    return "bg-gradient-to-r from-purple-500/10 to-purple-500/5 border-l-[3.5px] border-l-purple-600 text-purple-900 border-y border-r border-purple-150/40";
  }
  if (s.includes("4") || s.includes("empat")) {
    return "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-l-[3.5px] border-l-amber-600 text-amber-900 border-y border-r border-amber-150/40";
  }
  if (s.includes("5") || s.includes("lima")) {
    return "bg-gradient-to-r from-pink-500/10 to-pink-500/5 border-l-[3.5px] border-l-pink-600 text-pink-900 border-y border-r border-pink-150/40";
  }

  let hash = 0;
  for (let i = 0; i < studioName.length; i++) {
    hash = studioName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const gradients = [
    "bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border-l-[3.5px] border-l-indigo-600 text-indigo-950 border-y border-r border-indigo-150/40",
    "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-l-[3.5px] border-l-cyan-600 text-cyan-950 border-y border-r border-cyan-150/40",
    "bg-gradient-to-r from-rose-500/10 to-rose-500/5 border-l-[3.5px] border-l-rose-600 text-rose-950 border-y border-r border-rose-150/40",
    "bg-gradient-to-r from-violet-500/10 to-violet-500/5 border-l-[3.5px] border-l-violet-600 text-violet-950 border-y border-r border-violet-150/40",
    "bg-gradient-to-r from-emerald-505/10 to-emerald-500/5 border-l-[3.5px] border-l-emerald-600 text-emerald-950 border-y border-r border-emerald-150/40",
  ];
  return gradients[index];
};

export const getCutoffMonthForDate = (rawDate: string) => {
  const norm = normalizeDateYMD(rawDate);
  if (!norm) return "";
  const parts = norm.split("-");
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (!y || !m || !d) return "";

  let targetMonth = m;
  let targetYear = y;
  if (d >= 16) {
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  }
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
};

export const PercentBadge = ({ cur, prev }: { cur: number; prev: number }) => {
  if (prev == null || isNaN(prev) || prev === 0) return null;
  const diff = cur - prev;
  const pct = Math.abs((diff / prev) * 100);
  const isUp = diff >= 0;
  return (
    <div
      className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${isUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
    >
      {pct.toFixed(0)}%
    </div>
  );
};

export const getBrandColor = (brandName: string) => {
  if (!brandName)
    return {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-300",
    };
  const colors = [
    {
      bg: "bg-indigo-100",
      text: "text-indigo-800",
      border: "border-indigo-300",
    },
    {
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-300",
    },
    { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
    { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
    {
      bg: "bg-fuchsia-100",
      text: "text-fuchsia-800",
      border: "border-fuchsia-300",
    },
    { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
    {
      bg: "bg-orange-100",
      text: "text-orange-800",
      border: "border-orange-300",
    },
    { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  ];
  let hash = 0;
  for (let i = 0; i < brandName.length; i++) {
    hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getShiftFromHour = (
  hour: number,
  shiftsList: readonly string[],
) => {
  for (const shiftStr of shiftsList) {
    const match = shiftStr.match(
      /\((\d{1,2})[.:]\d{2}\s*-\s*(\d{1,2})[.:]\d{2}\)/,
    );
    if (match) {
      const startH = parseInt(match[1], 10);
      const endH = parseInt(match[2], 10);

      if (startH <= endH) {
        if (hour >= startH && hour < endH) return shiftStr;
      } else {
        // Crosses midnight
        if (hour >= startH || hour < endH) return shiftStr;
      }
    }
  }
};

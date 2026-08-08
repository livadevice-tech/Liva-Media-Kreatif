import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShiftSchedule, ClientBrand } from "../../types";
import { LineChart, Filter } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";

interface TrendSiaranChartProps {
  schedules: ShiftSchedule[];
  clientBrands: ClientBrand[];
  platforms: string[];
}

export function TrendSiaranChart({
  schedules,
  clientBrands,
  platforms,
}: TrendSiaranChartProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("7");
  const [activePlatform, setActivePlatform] = useState<"all" | "tiktok" | "shopee">("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  const activeBrands = useMemo(() => {
    return clientBrands.filter((b) => b.isActive !== false);
  }, [clientBrands]);

  const brandOptions = [
    { value: "all", label: "Semua Brand Aktif" },
    ...activeBrands.map((b) => ({ value: b.name, label: b.name })),
  ];

  const chartData = useMemo(() => {
    const days = parseInt(timeRange);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const totalSesi = schedules.filter((s) => {
        if (s.date !== dateStr) return false;
        
        // Filter Platform
        if (activePlatform !== "all" && !s.platform?.toLowerCase().includes(activePlatform)) {
          return false;
        }

        // Filter Brand
        if (selectedBrand !== "all") {
          if (s.brand !== selectedBrand) return false;
        } else {
          // If 'all', must be part of active brands
          if (!activeBrands.some((b) => b.name === s.brand)) return false;
        }

        return true;
      }).length;

      return {
        name: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        total: totalSesi,
      };
    });
  }, [timeRange, activePlatform, selectedBrand, schedules, activeBrands]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-fadeIn" style={{ animationDelay: '100ms' }}>
      <div className="mb-6 flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4">
        <div>
          <h3 className="text-[15px] font-bold text-slate-800">Tren Siaran Terakhir</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">Jumlah sesi live aktif per hari</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Tab Platform */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(["all", "tiktok", "shopee"] as const).map((plat) => (
              <button
                key={plat}
                onClick={() => setActivePlatform(plat)}
                className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  activePlatform === plat
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {plat === "all" ? "Semua Platform" : plat === "tiktok" ? "TikTok" : "Shopee"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <CustomSelect
              options={[
                { value: "7", label: "7 Hari Terakhir" },
                { value: "30", label: "30 Hari Terakhir" },
                { value: "90", label: "3 Bulan Terakhir" },
              ]}
              value={timeRange}
              onChange={(val) => setTimeRange(val as any)}
              className="w-36 text-xs"
            />
            
            <CustomSelect
              options={brandOptions}
              value={selectedBrand}
              onChange={setSelectedBrand}
              className="w-48 text-xs"
            />
          </div>
          
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <LineChart className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94A3B8", fontWeight: 600 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "#94A3B8", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#1E293B", marginBottom: "4px" }}
              itemStyle={{ color: "#4F46E5", fontWeight: 700 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#4F46E5"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
              activeDot={{ r: 6, fill: "#4F46E5", stroke: "#fff", strokeWidth: 2 }}
              name="Total Sesi"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

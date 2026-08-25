const fs = require('fs');

const path = 'src/components/reporting/ReportBrandSelectionPanel.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('SlidersHorizontal')) {
  code = code.replace(
    'import { ArrowRight, MoreHorizontal, Search, Sparkles } from "lucide-react";',
    'import { ArrowRight, MoreHorizontal, Search, Sparkles, SlidersHorizontal } from "lucide-react";'
  );
}

const oldHeader = `{/* UNIFIED CONTROL BAR & HEADER */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center">
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Cari brand klien"
              placeholder="Cari brand berdasarkan nama atau ID..."
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="w-full rounded-xl bg-transparent py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:ring-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={onResetSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase text-indigo-600 transition-colors hover:text-indigo-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="h-px w-full bg-slate-100 sm:h-8 sm:w-px" />

          <div className="flex flex-wrap items-center gap-2 p-1 sm:p-0">`;

const newHeader = `{/* UNIFIED CONTROL BAR & HEADER */}
      <div className="flex flex-col gap-4">
        <h2 className="md:hidden text-[22px] font-black text-slate-900 tracking-tight mt-1 px-1">Performance Live Client</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full">
          {/* Search Bar - styled as pill like the design */}
          <div className="flex w-full gap-2">
            <div className="relative flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex items-center">
              <Search className="absolute left-3.5 size-4 text-slate-400" />
              <input
                type="text"
                aria-label="Cari brand klien"
                placeholder="Cari nama brand klien..."
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                className="w-full bg-transparent py-3 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:ring-0"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={onResetSearch}
                  className="absolute right-3 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black uppercase text-indigo-600 transition-colors hover:text-indigo-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mobile Filters Dropdown (CSS only styling) */}
            <div className="relative shrink-0 md:hidden flex items-center justify-center w-12 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
               <SlidersHorizontal className="size-5 text-slate-600 absolute pointer-events-none" />
               <select
                 value={sortKey}
                 onChange={(event) => onSortKeyChange(event.target.value as any)}
                 className="w-full h-full opacity-0 cursor-pointer"
               >
                 <option value="latest_activity">Terbaru</option>
                 <option value="gmv">GMV Tertinggi</option>
                 <option value="sessions">Sesi Terbanyak</option>
                 <option value="name">Nama A-Z</option>
               </select>
            </div>
          </div>

          <div className="hidden md:flex flex-wrap items-center gap-2 p-1 sm:p-0 bg-white border border-slate-200 shadow-sm rounded-2xl px-2 py-1">`;

code = code.replace(oldHeader, newHeader);

// Adjust the end of the replaced block
code = code.replace(
  '            </select>\n          </div>\n        </div>',
  '            </select>\n          </div>\n        </div>\n        </div>' // To balance the divs
);

fs.writeFileSync(path, code);

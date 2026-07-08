import React from 'react';
import { ClientBrand } from '../../types';

interface BrandDashboardSettingsPanelProps {
  brand: ClientBrand;
  onUpdateBrand: (updatedBrand: ClientBrand) => void;
}

export const BrandDashboardSettingsPanel: React.FC<BrandDashboardSettingsPanelProps> = ({
  brand,
  onUpdateBrand
}) => {
  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black uppercase tracking-wider text-indigo-700">
            Pengaturan Tampilan Dashboard Klien
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Pilih metrik dan kolom yang ingin disembunyikan di dashboard mitra brand.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-slate-500 font-bold mb-4 text-[11px] uppercase tracking-wider">
              Sembunyikan Metrik (Summary)
            </label>
            <div className="space-y-3">
              {[
                { id: "gmv", label: "GMV" },
                { id: "orders", label: "Pesanan (Orders)" },
                { id: "items_sold", label: "Produk Terjual" },
                { id: "est_income", label: "Estimasi Pendapatan" },
                { id: "viewers", label: "Total Penonton" },
                { id: "engagement", label: "Engagement (Likes/Share/Komen)" },
              ].map((metric) => (
                <label key={metric.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={brand.dashboardSettings?.hiddenMetrics?.includes(metric.id) || false}
                    onChange={(e) => {
                      const hiddenMetrics = brand.dashboardSettings?.hiddenMetrics || [];
                      const newMetrics = e.target.checked
                        ? [...hiddenMetrics, metric.id]
                        : hiddenMetrics.filter((id) => id !== metric.id);
                      
                      onUpdateBrand({
                        ...brand,
                        dashboardSettings: {
                          ...(brand.dashboardSettings || { hiddenColumns: [] }),
                          hiddenMetrics: newMetrics,
                        },
                      });
                    }}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{metric.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-bold mb-4 text-[11px] uppercase tracking-wider">
              Sembunyikan Kolom (Tabel Data Mentah)
            </label>
            <div className="space-y-3">
              {[
                { id: "gmv", label: "GMV" },
                { id: "orders", label: "Pesanan" },
                { id: "items_sold", label: "Item Terjual" },
                { id: "est_income", label: "Est. Pendapatan" },
                { id: "viewers", label: "Penonton" },
                { id: "engagement", label: "Engagement" },
              ].map((col) => (
                <label key={col.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={brand.dashboardSettings?.hiddenColumns?.includes(col.id) || false}
                    onChange={(e) => {
                      const hiddenCols = brand.dashboardSettings?.hiddenColumns || [];
                      const newCols = e.target.checked
                        ? [...hiddenCols, col.id]
                        : hiddenCols.filter((id) => id !== col.id);
                      
                      onUpdateBrand({
                        ...brand,
                        dashboardSettings: {
                          ...(brand.dashboardSettings || { hiddenMetrics: [] }),
                          hiddenColumns: newCols,
                        },
                      });
                    }}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

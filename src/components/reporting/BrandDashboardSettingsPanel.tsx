import React, { useState } from 'react';
import { ClientBrand } from '../../types';

interface BrandDashboardSettingsPanelProps {
  brand: ClientBrand;
  onUpdateBrand: (updatedBrand: ClientBrand) => void;
}

const CATEGORIES = [
  { id: 'live', label: 'Live Report' },
  { id: 'product', label: 'Product / SKU Report' },
  { id: 'engagement', label: 'Engagement Report' },
];

const METRICS_BY_CATEGORY = {
  live_shopee: [
    { id: "gmv", label: "GMV" },
    { id: "items_sold", label: "Item Sold" },
    { id: "orders", label: "Orders" },
    { id: "aov", label: "AOV" },
    { id: "product_clicks", label: "Add to Cart" },
    { id: "viewers", label: "Customer" },
    { id: "est_income", label: "GMV/Hours" },
    { id: "impressions", label: "View" },
    { id: "peak_viewers", label: "Peak Viewer" },
    { id: "shop_vouchers", label: "Voucher Claim" },
    { id: "likes", label: "Likes" },
    { id: "comments", label: "Comments" },
    { id: "shares", label: "Shares" },
    { id: "err", label: "ERR %" },
  ],
  live_tiktok: [
    { id: "gmv", label: "GMV" },
    { id: "items_sold", label: "Item Sold" },
    { id: "orders", label: "Orders" },
    { id: "aov", label: "AOV" },
    { id: "viewers", label: "Customer" },
    { id: "product_impressions", label: "Product Impressions" },
    { id: "product_clicks", label: "Product clicks" },
    { id: "est_income", label: "GMV/Hours" },
    { id: "impressions", label: "Live Impressions" },
    { id: "live_viewer", label: "Viewer Active" },
    { id: "likes", label: "Likes" },
    { id: "comments", label: "Comments" },
    { id: "shares", label: "Shares" },
    { id: "new_followers", label: "New followers" },
    { id: "avg_view_duration", label: "Avg. View Duration" },
    { id: "err", label: "ERR %" },
  ],
  product: [
    { id: "items_sold", label: "Produk Terjual" },
    { id: "revenue", label: "Revenue" },
  ],
  engagement: [
    { id: "views", label: "Views" },
    { id: "likes", label: "Likes" },
    { id: "comments", label: "Comments" },
    { id: "shares", label: "Shares" },
    { id: "engagement_rate", label: "Engagement Rate" },
  ]
};

const COLUMNS_BY_CATEGORY = {
  live_shopee: [
    { id: "penonton", label: "Viewer" },
    { id: "gmv", label: "GMV (Rp)" },
    { id: "items_sold", label: "Items Sold" },
    { id: "engagement", label: "Avg. View Duration" },
    { id: "orders", label: "Customers" },
    { id: "conversion_rate", label: "Conversion Rate" },
  ],
  live_tiktok: [
    { id: "penonton", label: "Viewer" },
    { id: "gmv", label: "GMV (Rp)" },
    { id: "items_sold", label: "Items Sold" },
    { id: "engagement", label: "Avg. View Duration" },
    { id: "orders", label: "Orders" },
    { id: "conversion_rate", label: "Conversion Rate" },
  ],
  product: [
    { id: "items_sold", label: "Item Terjual" },
    { id: "revenue", label: "Revenue" },
  ],
  engagement: [
    { id: "views", label: "Views" },
    { id: "likes", label: "Likes" },
    { id: "comments", label: "Comments" },
    { id: "shares", label: "Shares" },
    { id: "engagement_rate", label: "Engagement Rate" },
  ]
};

export const BrandDashboardSettingsPanel: React.FC<BrandDashboardSettingsPanelProps> = ({
  brand,
  onUpdateBrand
}) => {
  const [activePlatform, setActivePlatform] = useState<'shopee' | 'tiktok'>('shopee');

  const toggleMetric = (metricId: string) => {
    const hiddenMetrics = brand.dashboardSettings?.hiddenMetrics || [];
    const newMetrics = hiddenMetrics.includes(metricId)
      ? hiddenMetrics.filter((id) => id !== metricId)
      : [...hiddenMetrics, metricId];
    
    onUpdateBrand({
      ...brand,
      dashboardSettings: {
        ...(brand.dashboardSettings || { hiddenColumns: [] }),
        hiddenMetrics: newMetrics,
      },
    });
  };

  const toggleColumn = (colId: string) => {
    const hiddenCols = brand.dashboardSettings?.hiddenColumns || [];
    const newCols = hiddenCols.includes(colId)
      ? hiddenCols.filter((id) => id !== colId)
      : [...hiddenCols, colId];
    
    onUpdateBrand({
      ...brand,
      dashboardSettings: {
        ...(brand.dashboardSettings || { hiddenMetrics: [] }),
        hiddenColumns: newCols,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-black uppercase tracking-wider text-indigo-700">
            Pengaturan Tampilan Dashboard Klien
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Pilih metrik dan kolom yang ingin disembunyikan di dashboard mitra brand.
          </p>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActivePlatform('shopee')}
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wider uppercase transition-colors ${
              activePlatform === 'shopee'
                ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-500'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Shopee
          </button>
          <button
            onClick={() => setActivePlatform('tiktok')}
            className={`flex-1 py-4 text-center font-bold text-sm tracking-wider uppercase transition-colors ${
              activePlatform === 'tiktok'
                ? 'bg-slate-900 text-white border-b-2 border-black'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            TikTok
          </button>
        </div>

        <div className="p-6 space-y-8">
          {CATEGORIES.map((category) => (
            <div key={category.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h4 className="text-md font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                {category.label}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metrics */}
                <div>
                  <label className="block text-slate-500 font-bold mb-4 text-[11px] uppercase tracking-wider">
                    Sembunyikan Metrik (Summary)
                  </label>
                  <div className="space-y-3">
                    {((category.id === 'live' 
                        ? (METRICS_BY_CATEGORY as any)[`live_${activePlatform}`] 
                        : (METRICS_BY_CATEGORY as any)[category.id]) || []).map((metric: any) => {
                      const id = `${activePlatform}_${category.id}_${metric.id}`;
                      return (
                        <label key={id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={brand.dashboardSettings?.hiddenMetrics?.includes(id) || false}
                            onChange={() => toggleMetric(id)}
                            className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {metric.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Columns */}
                <div>
                  <label className="block text-slate-500 font-bold mb-4 text-[11px] uppercase tracking-wider">
                    Sembunyikan Kolom (Tabel)
                  </label>
                  <div className="space-y-3">
                    {((category.id === 'live' 
                        ? (COLUMNS_BY_CATEGORY as any)[`live_${activePlatform}`] 
                        : (COLUMNS_BY_CATEGORY as any)[category.id]) || []).map((col: any) => {
                      const id = `${activePlatform}_${category.id}_${col.id}`;
                      return (
                        <label key={id} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={brand.dashboardSettings?.hiddenColumns?.includes(id) || false}
                            onChange={() => toggleColumn(id)}
                            className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {col.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

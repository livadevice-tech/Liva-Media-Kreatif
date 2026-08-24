export interface UploadHistoryEntry {
  id: string;
  brandId?: string;
  brandName?: string;
  platform?: string;
  fileName?: string;
  createdAt?: string;
  uploadedAt?: string;
  date?: string;
  rowCount?: number;
  gmv?: number;
  reportType?: string;
}

export interface BrandReportRow {
  name: string;
  platform: string;
  gmv: number;
  items_sold?: number;
  ctr?: number;
  ctor?: number;
  views?: number;
  viewers?: number;
  impressions?: number;
  clicks?: number;
  orders?: number;
  uploadId?: string;
  brandId?: string;
  brandName?: string;
  date?: string;
  dateTime?: string;
  shift?: string;
  liveDuration?: number;
  sessionCount?: number;
  status?: string;
  revenueGenerated?: number;
  conversionRate?: number;
  engagementRate?: number;
  aov?: number;
  liveVisits?: number;
  productImpressions?: number;
  buyers?: number;
  followers?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  avgViewDuration?: number;
  peakViewers?: number;
  shopVouchers?: number;
  specialVouchers?: number;
  coinsClaimed?: number;
  hasFunnelInFile?: boolean;
  reportType?: string;
  batchId?: string;
  title?: string;
}

export interface BrandPerformanceLogEntry {
  id: string;
  batchId?: string;
  brandId: string;
  brandName?: string;
  platform: string;
  title?: string;
  date?: string;
  dateTime?: string;
  uploadedAt?: string;
  reportType: string;
  shift?: string;
  duration?: number;
  gmv?: number;
  products_sold?: number;
  buyers?: number;
  aov?: number;
  views?: number;
  impressions?: number;
  penonton?: number;
  liveVisits?: number;
  productImpressions?: number;
  clicks?: number;
  orders?: number;
  followers?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  avgViewDuration?: number;
  peakViewers?: number;
  shopVouchers?: number;
  specialVouchers?: number;
  coinsClaimed?: number;
  hasFunnelInFile?: boolean;
}

export interface ReportingRawRow {
  title: string;
  date: string;
  dateTime: string;
  shift: string;
  duration: number;
  gmv: number;
  products_sold: number;
  buyers: number;
  aov: number;
  views: number;
  impressions: number;
  penonton: number;
  liveVisits: number;
  productImpressions: number;
  clicks: number;
  orders: number;
  followers: number;
  likes: number;
  shares: number;
  comments: number;
  avgViewDuration: number;
  peakViewers: number;
  shopVouchers: number;
  specialVouchers: number;
  coinsClaimed: number;
  hasFunnelInFile: boolean;
}

export interface SkuRawRow {
  id: string;
  sku: string;
  productName: string;
  sold: number;
  revenue: number;
  date: string;
}

export interface SkuLogEntry extends SkuRawRow {
  brandId: string;
  platform: string;
  batchId?: string;
  uploadedAt?: string;
  shift?: string;
}

export interface BrandPerformanceAnalysis {
  id: string;
  brand_id: string;
  name?: string;
  platform: string;
  period_a_start: string;
  period_a_end: string;
  period_b_start: string;
  period_b_end: string;
  comparison_metrics: string[];
  description: string;
  next_plan?: string;
  created_at?: string;
  updated_at?: string;
}

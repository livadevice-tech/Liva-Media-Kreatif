/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdminAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  accessTabs: string[];
}

export type UserRole = "Admin" | "Manager" | "Host";

export interface HostEmployee {
  id: string;
  name: string;
  employeeId: string;
  avatar: string;
  role: string; // e.g., "Senior Host", "Junior Host", "Trainee"
  platforms: string[]; // e.g. ["TikTok Live", "Shopee Live", "Tokopedia"]
  brands: string[]; // e.g. ["Sunsilk", "Wardah", "Eiger", "Samsung"]
  baseMonthlyTargetHours: number; // e.g. 80
  baseMonthlyTargetRevenue: number; // e.g. 150,000,000 IDR
  consistencyScore: number; // 0-100 percentage
  joinedDate: string;
  email: string;
  phone: string;
  username?: string;
  password?: string;
  bankAccount?: string;
  bankName?: string;
  studio?: string; // "Bandar Lampung" | "Tanggamus"
  hostType?: "Reguler" | "Backup"; // "Reguler" or "Backup"
  customWorkingDaysTarget?: number; // Custom target working days for Reguler host
  customBaseSalary?: number; // Custom basic monthly salary for Reguler host
  customShiftRate?: number; // Custom rate per shift for Backup host
  hasPassword?: boolean;
}

export interface AttendanceLog {
  id: string;
  hostId: string;
  hostName: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftHours: string; // e.g. "09:00 - 13:00" or "18:00 - 22:00"
  platform: string;
  brandHandled: string;
  liveDuration: number; // hours (e.g. 4)
  sessionCount: number; // typically 1 or 2
  status: "Present" | "Late" | "Absent" | "Excused";
  checkInTime?: string; // exact login time format e.g. "05:08:12"
  revenueGenerated: number; // IDR
  conversionRate: number; // percentage (e.g. 4.2)
  engagementRate: number; // percentage (e.g. 8.5)
  orders: number;
  avgViewDuration?: number; // e.g. minutes, like 2.5
  studio?: string; // Add optional studio
  flaggedAsAnomaly?: boolean;
  anomalyReason?: string;
  isDuplicate?: boolean; // Fraud check flag
  flaggedAsFraud?: boolean;
  fraudReason?: string;
  overtimeHours?: number;
  isBackupShift?: boolean;
  timestamp?: string;
}

export interface StudioItem {
  id: string;
  name: string;
  location: string; // "Bandar Lampung" | "Tanggamus"
}

export interface ShiftSchedule {
  id: string;
  hostId: string;
  hostName: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "Morning (08:00 - 12:00)", "Afternoon (13:00 - 17:00)", "Evening (18:00 - 22:00)", "Night (22:00 - 02:00)"
  platform: string;
  brand: string;
  status: "Assigned" | "Completed" | "No Show";
  studio?: string;
  backupHostId?: string;
  backupHostName?: string;
  isDeleted?: boolean;
  isOffDay?: boolean;
  isPindahStudio?: boolean;
  timestamp?: string;
}

export interface KPIAlert {
  id: string;
  hostId: string;
  hostName: string;
  metricType: "Revenue" | "LiveHours" | "Engagement" | "Attendance" | "Fraud";
  severity: "High" | "Medium" | "Low";
  message: string;
  date: string;
  currentValue: string | number;
  targetValue: string | number;
  resolved: boolean;
}

export interface AIHostAnalysis {
  hostId: string;
  hostName: string;
  overallScore: number; // 0-100 kpi metric
  grade: "A+" | "A" | "B" | "C" | "D";
  strengths: string[];
  growthAreas: string[];
  recommendedNiche: string;
  bestShiftPlatform: string;
}

export interface AISmartRecommendation {
  id: string;
  type: "pairing" | "scheduling" | "intervention" | "optimization";
  title: string;
  description: string;
  confidence: number; // 0 - 100
  tags: string[]; // ["TikTok", "Wardah", "Host Match"]
  impact: string; // "Est. +15% revenue"
}

export interface ForecastModel {
  label: string;
  historicalValue: number;
  predictedValue: number;
  confidenceInterval: [number, number];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
}

export interface BrandSession {
  id: string;
  shift: string;
  platform: string;
  studio: string;
  host?: string;
}

export interface BrandAccount {
  id: string;
  type: string;
  username: string;
  password: string;
  picOtp: string;
}

export interface BrandInvoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: "Draft" | "Open Invoice" | "Paid" | "Overdue";
  recipientName: string; // legacy
  ptName?: string;
  picName?: string;
  picPhone?: string;
  email: string;
  address: string;
  totalAmount: number;
  sessionItems: {
    sessionId: string;
    description: string;
    qty: number;
    cost: number;
  }[];
}

export interface ClientBrand {
  id: string;
  name: string;
  logoUrl?: string;
  sessions: BrandSession[];
  contractStartDate?: string;
  contractEndDate: string;
  invoiceDate: string;
  accounts: BrandAccount[];
  monthlyMeetingDate: string;
  clientPassword?: string;
  clientUsername?: string;
  picName?: string;
  picPhone?: string;
  picEmail?: string;
  companyAddress?: string;
  invoices?: BrandInvoice[];
  berkas?: {id: string; name: string; type: string; url: string;}[];
}

export interface ClientReporting {
  id: string;
  brandId: string;
  platform: string;
  reportDate: string;
  fileName: string;
  isPublic: boolean;
  publicUrl?: string;
}

export interface ClientLead {
  id: string;
  name: string;
  contactPerson: string;
  contactNumber: string;
  platformInterest: string;
  status: "New" | "Contacted" | "Meeting Scheduled" | "Proposal Sent" | "Negotiation" | "Closed Won" | "Closed Lost";
  notes: string;
}

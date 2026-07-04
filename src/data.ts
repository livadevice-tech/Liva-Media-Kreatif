/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HostEmployee, AttendanceLog, ShiftSchedule, KPIAlert, AIHostAnalysis, AISmartRecommendation } from "./types";

export const PLATFORMS = ["TikTok Live", "Shopee Live", "Tokopedia Play", "Lazada In-App"];
export const BRANDS = ["Wardah", "Somethinc", "Sunsilk", "Samsung", "Asus", "Xiaomi", "Eiger", "Jiniso", "Indomie", "Mayora"];
export const SHIFTS = [
  "Morning (08:00 - 12:00)",
  "Afternoon (13:00 - 17:00)",
  "Evening (18:00 - 22:00)",
  "Night (22:00 - 02:00)"
];

// Profile data matching the real spreadsheet exactly
export const INITIAL_HOSTS: HostEmployee[] = [
  {
    id: "h1",
    name: "Cica",
    employeeId: "EMP-26-001",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Wardah", "Somethinc"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 150000000,
    consistencyScore: 96,
    joinedDate: "2025-01-15",
    email: "cica@livamedia.com",
    phone: "+62 812-1001-2001",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h2",
    name: "Gesti",
    employeeId: "EMP-26-002",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Somethinc", "Sunsilk"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 140000000,
    consistencyScore: 95,
    joinedDate: "2025-02-10",
    email: "gesti@livamedia.com",
    phone: "+62 812-1002-2002",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h3",
    name: "Nabila",
    employeeId: "EMP-26-003",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Tokopedia Play"],
    brands: ["Samsung", "Xiaomi"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 180000000,
    consistencyScore: 100,
    joinedDate: "2024-11-01",
    email: "nabila@livamedia.com",
    phone: "+62 813-1003-2003",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h4",
    name: "Tiara Ramadhani",
    employeeId: "EMP-26-004",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Uniqlo", "Jiniso"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 160000000,
    consistencyScore: 100,
    joinedDate: "2025-03-01",
    email: "tiara.r@livamedia.com",
    phone: "+62 813-1004-2004",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h5",
    name: "Veni",
    employeeId: "EMP-26-005",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
    role: "Junior Host",
    platforms: ["Shopee Live"],
    brands: ["Wardah", "Sunsilk"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 110000000,
    consistencyScore: 96,
    joinedDate: "2025-05-15",
    email: "veni@livamedia.com",
    phone: "+62 812-1005-2005",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h6",
    name: "Adinda",
    employeeId: "EMP-26-006",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Somethinc", "Wardah"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 155000000,
    consistencyScore: 98,
    joinedDate: "2024-12-10",
    email: "adinda@livamedia.com",
    phone: "+62 813-1006-2006",
    studio: "Bandar Lampung",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h7",
    name: "Riska",
    employeeId: "EMP-26-007",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150",
    role: "Junior Host",
    platforms: ["TikTok Live"],
    brands: ["Eiger", "Jiniso"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 95000000,
    consistencyScore: 88,
    joinedDate: "2025-06-20",
    email: "riska@livamedia.com",
    phone: "+62 812-1007-2007",
    studio: "Tanggamus",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h8",
    name: "Nadya",
    employeeId: "EMP-26-008",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    role: "Junior Host",
    platforms: ["Shopee Live"],
    brands: ["Indomie", "Mayora"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 85000000,
    consistencyScore: 84,
    joinedDate: "2025-08-01",
    email: "nadya@livamedia.com",
    phone: "+62 813-1008-2008",
    studio: "Tanggamus",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h9",
    name: "Rahma",
    employeeId: "EMP-26-009",
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Tokopedia Play"],
    brands: ["Samsung", "Asus"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 170000000,
    consistencyScore: 100,
    joinedDate: "2024-10-05",
    email: "rahma@livamedia.com",
    phone: "+62 812-1009-2009",
    studio: "Tanggamus",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h10",
    name: "Ika",
    employeeId: "EMP-26-010",
    avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Wardah", "Somethinc"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 162000000,
    consistencyScore: 100,
    joinedDate: "2024-09-15",
    email: "ika@livamedia.com",
    phone: "+62 813-1010-2010",
    studio: "Tanggamus",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h11",
    name: "Jihan",
    employeeId: "EMP-26-011",
    avatar: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150",
    role: "Senior Host",
    platforms: ["TikTok Live", "Shopee Live", "Tokopedia Play"],
    brands: ["Sunsilk", "Eiger", "Jiniso"],
    baseMonthlyTargetHours: 104,
    baseMonthlyTargetRevenue: 168000000,
    consistencyScore: 100,
    joinedDate: "2024-08-01",
    email: "jihan@livamedia.com",
    phone: "+62 813-1011-2011",
    studio: "Tanggamus",
    hostType: "Reguler",
    customWorkingDaysTarget: 26
  },
  {
    id: "h12",
    name: "Nadin",
    employeeId: "EMP-26-012",
    avatar: "https://images.unsplash.com/photo-1541647376583-d18ddcf5c87d?w=150",
    role: "Back-Up Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Somethinc", "Wardah"],
    baseMonthlyTargetHours: 56,
    baseMonthlyTargetRevenue: 60000000,
    consistencyScore: 92,
    joinedDate: "2025-11-20",
    email: "nadin@livamedia.com",
    phone: "+62 812-1012-2012",
    studio: "Bandar Lampung",
    hostType: "Backup"
  },
  {
    id: "h13",
    name: "Shela",
    employeeId: "EMP-26-013",
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=150",
    role: "Back-Up Host",
    platforms: ["Shopee Live"],
    brands: ["Sunsilk"],
    baseMonthlyTargetHours: 4,
    baseMonthlyTargetRevenue: 5000000,
    consistencyScore: 100,
    joinedDate: "2026-01-05",
    email: "shela@livamedia.com",
    phone: "+62 813-1013-2013",
    studio: "Bandar Lampung",
    hostType: "Backup"
  },
  {
    id: "h14",
    name: "Tiara B",
    employeeId: "EMP-26-014",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: "Back-Up Host",
    platforms: ["TikTok Live"],
    brands: ["Eiger", "Jiniso"],
    baseMonthlyTargetHours: 20,
    baseMonthlyTargetRevenue: 22000000,
    consistencyScore: 90,
    joinedDate: "2025-10-10",
    email: "tiarab@livamedia.com",
    phone: "+62 812-1014-2014",
    studio: "Bandar Lampung",
    hostType: "Backup"
  },
  {
    id: "h15",
    name: "Intan",
    employeeId: "EMP-26-015",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
    role: "Back-Up Host",
    platforms: ["TikTok Live", "Shopee Live"],
    brands: ["Wardah", "Xiaomi"],
    baseMonthlyTargetHours: 20,
    baseMonthlyTargetRevenue: 20000000,
    consistencyScore: 89,
    joinedDate: "2025-09-01",
    email: "intan@livamedia.com",
    phone: "+62 813-1015-2015",
    studio: "Tanggamus",
    hostType: "Backup"
  },
  {
    id: "h16",
    name: "Anisa",
    employeeId: "EMP-26-016",
    avatar: "https://images.unsplash.com/photo-1558203728-00f45181dd14?w=150",
    role: "Back-Up Host",
    platforms: ["TikTok Live", "Tokopedia Play"],
    brands: ["Samsung", "Indomie"],
    baseMonthlyTargetHours: 52,
    baseMonthlyTargetRevenue: 55000000,
    consistencyScore: 91,
    joinedDate: "2025-07-15",
    email: "anisa@livamedia.com",
    phone: "+62 812-1016-2016",
    studio: "Tanggamus",
    hostType: "Backup"
  }
];

const createLogs = (): AttendanceLog[] => {
  const generated: AttendanceLog[] = [];

  const targets = [
    { hostId: "h1", name: "Cica", empId: "EMP-26-001", type: "Reguler", presentDays: 25, excused: 1, lateCount: 0 },
    { hostId: "h2", name: "Gesti", empId: "EMP-26-002", type: "Reguler", presentDays: 25, excused: 1, lateCount: 0 },
    { hostId: "h3", name: "Nabila", empId: "EMP-26-003", type: "Reguler", presentDays: 26, excused: 0, lateCount: 0 },
    { hostId: "h4", name: "Tiara Ramadhani", empId: "EMP-26-004", type: "Reguler", presentDays: 26, excused: 0, lateCount: 0 },
    { hostId: "h5", name: "Veni", empId: "EMP-26-005", type: "Reguler", presentDays: 25, excused: 1, lateCount: 0 },
    { hostId: "h6", name: "Adinda", empId: "EMP-26-006", type: "Reguler", presentDays: 26, excused: 0, lateCount: 1 },
    { hostId: "h7", name: "Riska", empId: "EMP-26-007", type: "Reguler", presentDays: 23, excused: 3, lateCount: 0 },
    { hostId: "h8", name: "Nadya", empId: "EMP-26-008", type: "Reguler", presentDays: 22, excused: 4, lateCount: 0 },
    { hostId: "h9", name: "Rahma", empId: "EMP-26-009", type: "Reguler", presentDays: 26, excused: 0, lateCount: 4 },
    { hostId: "h10", name: "Ika", empId: "EMP-26-010", type: "Reguler", presentDays: 26, excused: 0, lateCount: 0 },
    { hostId: "h11", name: "Jihan", empId: "EMP-26-011", type: "Reguler", presentDays: 26, excused: 0, lateCount: 0 },
    
    // Backup (only need to define active days)
    { hostId: "h12", name: "Nadin", empId: "EMP-26-012", type: "Backup", presentDays: 14, excused: 0, lateCount: 0 },
    { hostId: "h13", name: "Shela", empId: "EMP-26-013", type: "Backup", presentDays: 1, excused: 0, lateCount: 0 },
    { hostId: "h14", name: "Tiara B", empId: "EMP-26-014", type: "Backup", presentDays: 5, excused: 0, lateCount: 0 },
    { hostId: "h15", name: "Intan", empId: "EMP-26-015", type: "Backup", presentDays: 5, excused: 0, lateCount: 0 },
    { hostId: "h16", name: "Anisa", empId: "EMP-26-016", type: "Backup", presentDays: 13, excused: 0, lateCount: 0 },
  ];

  targets.forEach((t) => {
    // We create shift logs spanning May 1 to May 26, 2026.
    // Reguler hosts run 26 total target days, Backup hosts only logs present days.
    const totalDaysToProcess = t.type === "Reguler" ? 26 : t.presentDays;
    
    let currentPresentCount = 0;
    let currentExcusedCount = 0;
    let currentLateCount = 0;

    // Distribute logically
    for (let d = 1; d <= 26; d++) {
      if (t.type === "Reguler") {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dateString = `${yyyy}-${mm}-${d.toString().padStart(2, "0")}`;
        let status: "Present" | "Late" | "Absent" | "Excused" = "Present";

        // Assign excused days
        if (currentExcusedCount < t.excused && (d === 7 || d === 14 || d === 21 || d === 25)) {
          status = "Excused";
          currentExcusedCount++;
        } 
        // Assign late days (only applicable for Adinda & Rahma in this test)
        else if (currentPresentCount < t.presentDays) {
          if (currentLateCount < t.lateCount && (d === 5 || d === 12 || d === 18 || d === 24)) {
            status = "Late";
            currentLateCount++;
          } else {
            status = "Present";
          }
          currentPresentCount++;
        } else {
          // Fallback but shouldn't happen based on counts
          status = "Present";
          currentPresentCount++;
        }

        const isExcused = status === "Excused";
        const revenue = isExcused ? 0 : Math.round(3500000 + (d % 5) * 800000);
        const orders = isExcused ? 0 : Math.round(60 + (d % 7) * 20);

        generated.push({
          id: `gen_l_${t.hostId}_${d}`,
          hostId: t.hostId,
          hostName: t.name,
          employeeId: t.empId,
          date: dateString,
          shiftHours: d % 2 === 0 ? "13:00 - 17:00" : "18:00 - 22:00",
          platform: d % 2 === 0 ? "TikTok Live" : "Shopee Live",
          brandHandled: d % 3 === 0 ? "Somethinc" : "Wardah",
          liveDuration: isExcused ? 0 : 4.0,
          sessionCount: isExcused ? 0 : 1,
          status: status,
          revenueGenerated: revenue,
          orders: orders,
          conversionRate: isExcused ? 0 : 4.2,
          engagementRate: isExcused ? 0 : 11.5,
          avgViewDuration: isExcused ? 0 : Math.floor(70 + (d % 3) * 20),
          checkInTime: isExcused ? undefined : (status === "Late" ? (d % 2 === 0 ? "13:12:05" : "18:05:42") : (d % 2 === 0 ? "12:56:12" : "17:51:20"))
        });
      } else {
        // Backup hosts get logged on distributed active dates
        // t.presentDays determines how many entries they have
        // Let's pack them from d = 1 till presentDays
        if (d <= t.presentDays) {
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const dateString = `${yyyy}-${mm}-${d.toString().padStart(2, "0")}`;
          generated.push({
            id: `gen_l_${t.hostId}_${d}`,
            hostId: t.hostId,
            hostName: t.name,
            employeeId: t.empId,
            date: dateString,
            shiftHours: d % 2 === 0 ? "13:00 - 17:00" : "18:00 - 22:00",
            platform: d % 2 === 0 ? "TikTok Live" : "Shopee Live",
            brandHandled: "Wardah",
            liveDuration: 4.0,
            sessionCount: 1,
            status: "Present",
            revenueGenerated: Math.round(2800000 + (d % 4) * 600000),
            orders: Math.round(45 + (d % 6) * 15),
            conversionRate: 3.5,
            engagementRate: 9.8,
            avgViewDuration: Math.floor(60 + (d % 2) * 15),
            checkInTime: d % 2 === 0 ? "12:54:15" : "17:52:10"
          });
        }
      }
    }
  });

  return generated;
};

export const INITIAL_LOGS = createLogs();

const todayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const twoDaysAgoString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Standard shift rosters reference today
export const INITIAL_SCHEDULE: ShiftSchedule[] = [
  {
    id: "sched_1",
    hostId: "h1",
    hostName: "Cica",
    employeeId: "EMP-26-001",
    date: todayDateString(),
    timeSlot: "Evening (18:00 - 22:00)",
    platform: "TikTok Live",
    brand: "Somethinc",
    status: "Assigned"
  },
  {
    id: "sched_2",
    hostId: "h3",
    hostName: "Nabila",
    employeeId: "EMP-26-003",
    date: todayDateString(),
    timeSlot: "Afternoon (13:00 - 17:00)",
    platform: "Shopee Live",
    brand: "Jiniso",
    status: "Assigned"
  },
  {
    id: "sched_3",
    hostId: "h6",
    hostName: "Adinda",
    employeeId: "EMP-26-006",
    date: todayDateString(),
    timeSlot: "Evening (18:00 - 22:00)",
    platform: "TikTok Live",
    brand: "Wardah",
    status: "Assigned"
  }
];

export const INITIAL_ALERTS: KPIAlert[] = [
  {
    id: "alert_1",
    hostId: "h9",
    hostName: "Rahma",
    metricType: "Attendance",
    severity: "High",
    message: "Toleransi keterlambatan terlampaui: Host Rahma terlambat sebanyak 4 kali masa kerja reguler.",
    date: todayDateString(),
    currentValue: "4 Keterlambatan",
    targetValue: "Maksimal 3 Keterlambatan",
    resolved: false
  },
  {
    id: "alert_2",
    hostId: "h8",
    hostName: "Nadya",
    metricType: "Engagement",
    severity: "Medium",
    message: "Nadya absen / sakit sebanyak 4 kali bulan ini secara akumulatif. Evaluasi kondisi fisik / jadwal.",
    date: twoDaysAgoString(),
    currentValue: "4 Sakit/Izin",
    targetValue: "Sehat & Hadir Sesuai Siklus",
    resolved: false
  }
];

export const STATIC_RECOMMENDATIONS: AISmartRecommendation[] = [
  {
    id: "rec_1",
    type: "pairing",
    title: "Maksimalkan Nabila ➔ Somethinc Live Stream",
    description: "Tingkat konversi rata-rata Nabila mencapai 5.2% pada TikTok Live dengan engagement penonton yang luar biasa. Sangat ideal berpasangan dengan promo brand Somethinc.",
    confidence: 98,
    tags: ["Nabila", "Somethinc", "TikTok Live"],
    impact: "Potensi peningkatan omset +25%"
  },
  {
    id: "rec_2",
    type: "scheduling",
    title: "Optimasi Jam Kerja Backup Host 'Anisa'",
    description: "Anisa menghasilkan performa penjualan yang tinggi di kategori kosmetik. Berikan slot lebih banyak pada akhir pekan.",
    confidence: 91,
    tags: ["Anisa", "Kosmetik", "Weekend"],
    impact: "Potensi peningkatan order +15%"
  }
];

export const INITIAL_ANALYSES: AIHostAnalysis[] = [
  {
    hostId: "h3",
    hostName: "Nabila",
    overallScore: 98.5,
    grade: "A+",
    strengths: ["Disiplin kehadiran 100% (26 hari penuh)", "Konversi tinggi di segmen elektronik dan kosmetik", "Interaksi penonton sangat hidup"],
    growthAreas: ["Bisa mulai melatih co-host trainee baru"],
    recommendedNiche: "Electronics & Cosmetics",
    bestShiftPlatform: "TikTok Live - Evening"
  },
  {
    hostId: "h4",
    hostName: "Tiara Ramadhani",
    overallScore: 97.2,
    grade: "A+",
    strengths: ["100% Hadir sesuai siklus kerja", "Sangat handal dalam kategori apparel/fashion", "Tepat waktu prima"],
    growthAreas: ["Tingkatkan interaksi chat agar viewer loyalty naik"],
    recommendedNiche: "Fashion & Lifestyle",
    bestShiftPlatform: "Shopee Live - Afternoon"
  }
];

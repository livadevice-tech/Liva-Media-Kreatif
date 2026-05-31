/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Auth Provider with Sheets Scope
const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/spreadsheets");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear if not in login flow but expired/not loaded
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign In trigger (must be initiated by user click)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Gagal mengambil token akses dari Google Sign-In.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error("Sign-in Google Sheets error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Creates a brand new fully structured Google Spreadsheet inside user's Google Sheets account
 */
export const createNewSpreadsheet = async (accessToken: string, title?: string): Promise<{ id: string; url: string }> => {
  const finalTitle = title || `Liva Agency - Gaji & Absensi Host (${new Date().toLocaleDateString("id-ID")})`;

  const payload = {
    properties: {
      title: finalTitle,
    },
    sheets: [
      {
        properties: {
          title: "Rekap Gaji Host",
          gridProperties: {
            frozenRowCount: 4,
          }
        },
      },
      {
        properties: {
          title: "Database Absensi Real-time",
          gridProperties: {
            frozenRowCount: 1,
          }
        },
      },
    ],
  };

  const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gagal membuat spreadsheet baru.`);
  }

  const data = await response.json();
  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl,
  };
};

/**
 * Pushes bulk data arrays to the Google Sheets Tabs using batchUpdate with USER_ENTERED formatting.
 */
export const syncSpreadsheetData = async (
  accessToken: string,
  spreadsheetId: string,
  reports: any[],
  logs: any[],
  salarySettings: any
): Promise<void> => {
  // Format numeric values into pure decimals so Sheets interprets as raw numbers or monetary values
  
  // 1. Prepare REKAP GAJI spreadsheet data arrays
  const summaryHeader = [
    ["Liva Agency - LAPORAN REKAP GAJI & ABSENSI HOST"],
    [`Tanggal Ekspor: ${new Date().toLocaleString("id-ID")} (WIB) | Siklus Hari Kerja=${salarySettings.workingDays} Hari`],
    [], // Blank Row
    [
      "Nama Host",
      "Tipe Host",
      "Daftar Platform",
      "Brand Fokus",
      "Siklus Hari Kerja",
      "Kehadiran (Hadir)",
      "Presensi Tepat Waktu",
      "Keterlambatan (Late)",
      "Bolos (Alpa)",
      "Sakit / Izin",
      "Persentase Kehadiran (%)",
      "Tarif Basis (Pokok / Shift)",
      "Gaji Pokok / Penjumlahan Shift",
      "Bonus Kehadiran 100%",
      "Take-home Pay (Gaji Bersih)",
    ],
  ];

  const summaryRows = reports.map((host) => {
    const compliancePercent = Math.round((host.totalHadir / (salarySettings.workingDays || 26)) * 100);
    const hostType = host.hostType || "Reguler";
    
    let proratedBase = 0;
    if (hostType === "Reguler") {
      proratedBase = Math.round(host.basePayRate * (host.totalHadir / (salarySettings.workingDays || 26)));
    } else {
      proratedBase = host.totalHadir * host.basePayRate;
    }

    return [
      host.name,
      hostType === "Reguler" ? "Reguler" : "Backup",
      host.platforms.join(", "),
      host.brands.join(", "),
      salarySettings.workingDays || 26,
      host.totalHadir,
      host.countTepatWaktu,
      host.countTerlambat,
      host.countAlpa,
      host.countIzin,
      `${compliancePercent}%`,
      host.basePayRate,
      proratedBase,
      host.calculatedBonus || 0,
      host.netSalary,
    ];
  });

  const rekapData = [...summaryHeader, ...summaryRows];

  // 2. Prepare DATABASE ABSENSI spreadsheet data arrays
  const databaseHeader = [
    [
      "ID ABSENSI",
      "ID KARYAWAN",
      "NAMA HOST",
      "TANGGAL",
      "SHIFT JAM",
      "BRAND TAYANG",
      "PLATFORM TAYANG",
      "STATUS",
      "DURASI STREAM (JAM)",
      "REVENUE GENERATED (IDR)",
      "CONVERSION (%)",
      "ENGAGEMENT (%)",
      "TOTAL ORDERS",
      "ANOMALI TRACE",
      "CATATAN ANOMALI"
    ],
  ];

  const databaseRows = logs.map((log) => {
    return [
      log.id,
      log.employeeId,
      log.hostName,
      log.date,
      log.shiftHours,
      log.brandHandled,
      log.platform,
      log.status === "Present" ? "Tepat Waktu" : log.status === "Late" ? "Terlambat" : log.status === "Absent" ? "Alpa / Bolos" : "Izin",
      log.liveDuration,
      log.revenueGenerated || 0,
      log.conversionRate || 0,
      log.engagementRate || 0,
      log.orders || 0,
      log.flaggedAsAnomaly ? "YA" : "TIDAK",
      log.anomalyReason || ""
    ];
  });

  const databaseData = [...databaseHeader, ...databaseRows];

  // Combine into single batch update request payload
  const requestPayload = {
    valueInputOption: "USER_ENTERED",
    data: [
      {
        range: "'Rekap Gaji Host'!A1",
        values: rekapData,
      },
      {
        range: "'Database Absensi Real-time'!A1",
        values: databaseData,
      },
    ],
  };

  // Execute Batch Update Sheets values
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gagal mengunggah data ke Google Sheets.`);
  }
};

/**
 * Fetches bulk data from a specific Google Sheet by ID.
 * Defaults to the first sheet if sheetName is not strictly provided (or if a range like A1:Z is used).
 */
export const fetchSpreadsheetData = async (
  accessToken: string,
  spreadsheetId: string,
  range: string = "A1:Z"
): Promise<any[][]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gagal menarik data dari Google Sheets.`);
  }

  const data = await response.json();
  return data.values || [];
};

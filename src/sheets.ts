/**
 * src/sheets.ts — STUB / SHIM FOR DEPRECATED GOOGLE SHEETS
 * ========================================================
 * File ini berisi stub kosong / mock agar compiler TypeScript tidak error.
 * Integrasi asli Google Sheets + Firebase telah dihapus karena migrasi ke MySQL.
 */

export interface GoogleUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthResult {
  user: GoogleUser;
  accessToken: string;
}

export const googleSignIn = async (): Promise<AuthResult | null> => {
  alert("Fitur Google Sheets dinonaktifkan sementara karena migrasi database ke MySQL.");
  return null;
};

export const sheetsLogout = async (): Promise<void> => {
  // no-op
};

export const createNewSpreadsheet = async (
  accessToken: string,
  title?: string
): Promise<{ id: string; url: string }> => {
  throw new Error("Fitur Google Sheets dinonaktifkan sementara.");
};

export const syncSpreadsheetData = async (
  accessToken: string,
  spreadsheetId: string,
  reports: ReadonlyArray<Record<string, unknown>>,
  logs: ReadonlyArray<Record<string, unknown>>,
  salarySettings: Record<string, unknown>
): Promise<void> => {
  // no-op
};

/**
 * src/api.ts
 * ==========
 * Centralized REST API client untuk semua komunikasi dengan backend MySQL.
 * Menggantikan semua panggilan Firebase Firestore di frontend.
 *
 * Semua fungsi ini akan dipanggil dari App.tsx sebagai pengganti
 * fungsi-fungsi Firebase seperti onSnapshot, getDoc, setDoc, deleteDoc, dll.
 */
import type { AuthSession } from "./shared/auth/session";
import type {
  AdminAccount,
  AttendanceLog,
  ClientBrand,
  ClientLead,
  ClientReporting,
  HostEmployee,
  KPIAlert,
  ShiftSchedule,
} from "./types";
import type {
  BrandPerformanceLogEntry,
  UploadHistoryEntry,
} from "./shared/types/reporting";

// Base URL backend — di production sudah satu domain dengan frontend
const API_BASE = '/api';

type JsonRecord = Record<string, unknown>;

type CrudApi<TItem, TCreate = TItem, TUpdate = TCreate> = {
  getAll: () => Promise<TItem[]>;
  getById?: (id: string) => Promise<TItem>;
  create: (item: TCreate) => Promise<{ id: string }>;
  update: (id: string, item: TUpdate) => Promise<void>;
  delete: (id: string) => Promise<void>;
};

type DbTestResponse = {
  success: boolean;
  message: string;
  data?: JsonRecord;
};

type SyncItem = {
  id?: string;
  [key: string]: unknown;
};

type SyncApi = {
  delete: (id: string) => Promise<unknown>;
  create: (item: SyncItem) => Promise<unknown>;
  update: (id: string, item: SyncItem) => Promise<unknown>;
};

// ------------------------------------------------------------------
// UTILS
// ------------------------------------------------------------------

export const testDbConnection = async (): Promise<DbTestResponse> => {
  const res = await fetch(`${API_BASE}/db-test`, { credentials: 'same-origin' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}) as Partial<DbTestResponse>);
    throw new Error(data.message || 'Gagal mengecek koneksi database');
  }
  return res.json();
};

// ------------------------------------------------------------------
// Helper internal: HTTP request wrapper
// ------------------------------------------------------------------
async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    signal,
  };
  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  login: (role: 'admin' | 'host' | 'brand', username: string, password: string) =>
    request<AuthSession>('POST', '/auth/login', { role, username, password }),
  getSession: () => request<AuthSession | null>('GET', '/auth/session'),
  logout: () => request<{ success: boolean }>('POST', '/auth/logout'),
};

// ==================================================================
// HOSTS
// ==================================================================
export const hostsApi = {
  /** Ambil semua host */
  getAll: () => request<HostEmployee[]>('GET', '/hosts'),

  /** Ambil satu host by ID (termasuk platforms & brands) */
  getById: (id: string) => request<HostEmployee>('GET', `/hosts/${id}`),

  /** Buat host baru */
  create: (host: HostEmployee) => request<{ id: string }>('POST', '/hosts', host),

  /** Update host */
  update: (id: string, host: HostEmployee) => request<void>('PUT', `/hosts/${id}`, host),

  /** Hapus host */
  delete: (id: string) => request<void>('DELETE', `/hosts/${id}`),
} satisfies CrudApi<HostEmployee>;

// ==================================================================
// ATTENDANCE LOGS
// ==================================================================
export const logsApi = {
  /** Ambil semua log (dengan optional filter) */
  getAll: (params?: { hostId?: string; dateFrom?: string; dateTo?: string }) => {
    const query = new URLSearchParams();
    if (params?.hostId)   query.set('hostId', params.hostId);
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo)   query.set('dateTo', params.dateTo);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<AttendanceLog[]>('GET', `/logs${qs}`);
  },

  /** Buat log baru */
  create: (log: AttendanceLog) => request<{ id: string }>('POST', '/logs', log),

  /** Update log */
  update: (id: string, log: AttendanceLog) => request<void>('PUT', `/logs/${id}`, log),

  /** Hapus log */
  delete: (id: string) => request<void>('DELETE', `/logs/${id}`),

  /** Hapus semua log berdasarkan array ID */
  deleteMany: (ids: string[]) => request<void>('POST', '/logs/delete-many', { ids }),

  /** Helper functions for frontend bulk mutations (using Promise.all on single endpoints) */
  createMany: async (logs: AttendanceLog[]) => {
    return Promise.all(logs.map(log => logsApi.create(log)));
  },
  updateMany: async (logs: AttendanceLog[]) => {
    return Promise.all(logs.map(log => logsApi.update(log.id, log)));
  },
};

// ==================================================================
// SHIFT SCHEDULES
// ==================================================================
export const schedulesApi = {
  /** Ambil semua jadwal */
  getAll: (params?: { date?: string; hostId?: string; brandId?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.hostId) query.set('hostId', params.hostId);
    if (params?.brandId) query.set('brandId', params.brandId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<ShiftSchedule[]>('GET', `/schedules${qs}`);
  },

  /** Buat jadwal */
  create: (schedule: ShiftSchedule) => request<{ id: string }>('POST', '/schedules', schedule),

  /** Update jadwal */
  update: (id: string, schedule: ShiftSchedule) => request<void>('PUT', `/schedules/${id}`, schedule),

  /** Hapus jadwal */
  delete: (id: string) => request<void>('DELETE', `/schedules/${id}`),
};

// ==================================================================
// KPI ALERTS
// ==================================================================
export const alertsApi = {
  /** Ambil semua alert */
  getAll: (params?: { resolved?: boolean }) => {
    const qs = params?.resolved !== undefined ? `?resolved=${params.resolved ? 1 : 0}` : '';
    return request<KPIAlert[]>('GET', `/alerts${qs}`);
  },

  /** Buat alert */
  create: (alert: KPIAlert) => request<{ id: string }>('POST', '/alerts', alert),

  /** Update alert (termasuk resolve) */
  update: (id: string, alert: KPIAlert) => request<void>('PUT', `/alerts/${id}`, alert),

  /** Hapus alert */
  delete: (id: string) => request<void>('DELETE', `/alerts/${id}`),
};

// ==================================================================
// CLIENT BRANDS
// ==================================================================
export const clientBrandsApi = {
  /** Ambil semua brand klien (termasuk sessions, accounts, invoices, berkas) */
  getAll: () => request<ClientBrand[]>('GET', '/client-brands'),

  /** Ambil nama-nama brand saja (publik/host safe) */
  getPublicNames: () => request<string[]>('GET', '/client-brands/public'),

  /** Ambil satu brand klien by ID */
  getById: (id: string) => request<ClientBrand>('GET', `/client-brands/${id}`),

  /** Buat brand klien baru */
  create: (brand: ClientBrand) => request<{ id: string }>('POST', '/client-brands', brand),

  /** Update brand klien */
  update: (id: string, brand: ClientBrand) => request<void>('PUT', `/client-brands/${id}`, brand),

  /** Hapus brand klien */
  delete: (id: string) => request<void>('DELETE', `/client-brands/${id}`),
};

// ==================================================================
// CLIENT LEADS
// ==================================================================
export const clientLeadsApi = {
  /** Ambil semua leads */
  getAll: () => request<ClientLead[]>('GET', '/client-leads'),

  /** Buat lead baru */
  create: (lead: ClientLead) => request<{ id: string }>('POST', '/client-leads', lead),

  /** Update lead */
  update: (id: string, lead: ClientLead) => request<void>('PUT', `/client-leads/${id}`, lead),

  /** Hapus lead */
  delete: (id: string) => request<void>('DELETE', `/client-leads/${id}`),
};

// ==================================================================
// ADMIN ACCOUNTS
// ==================================================================
export const adminAccountsApi = {
  /** Ambil semua admin */
  getAll: () => request<AdminAccount[]>('GET', '/admin-accounts'),

  /** Buat admin baru */
  create: (admin: AdminAccount) => request<{ id: string }>('POST', '/admin-accounts', admin),

  /** Update admin */
  update: (id: string, admin: AdminAccount) => request<void>('PUT', `/admin-accounts/${id}`, admin),

  /** Hapus admin */
  delete: (id: string) => request<void>('DELETE', `/admin-accounts/${id}`),
};

// ==================================================================
// SETTINGS
// ==================================================================
export const settingsApi = {
  get: <T = unknown>(key: string) => request<T>('GET', `/settings/${key}`),
  save: <T = unknown>(key: string, data: T) => request<T>('POST', `/settings/${key}`, data),
};

// ==================================================================
// CLIENT REPORTING
// ==================================================================
export const clientReportingApi = {
  /** Ambil semua reporting */
  getAll: (params?: { brandId?: string }) => {
    const qs = params?.brandId ? `?brandId=${params.brandId}` : '';
    return request<ClientReporting[]>('GET', `/client-reporting${qs}`);
  },

  /** Buat reporting baru */
  create: (report: ClientReporting) => request<{ id: string }>('POST', '/client-reporting', report),

  /** Update reporting */
  update: (id: string, report: ClientReporting) => request<void>('PUT', `/client-reporting/${id}`, report),

  /** Hapus reporting */
  delete: (id: string) => request<void>('DELETE', `/client-reporting/${id}`),
};

// ==================================================================
// BRAND REPORTING STORAGE
// ==================================================================
export const reportingBrandApi = {
  /** Ambil ringkasan reporting brand */
  getSummary: () => request<UploadHistoryEntry[]>('GET', '/reporting/brand/summary'),

  /** Ambil snapshot reporting brand (batch + raw logs) */
  getAll: (params?: { brandId?: string; signal?: AbortSignal }) => {
    const query = new URLSearchParams();
    if (params?.brandId) query.set('brandId', params.brandId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ batches: UploadHistoryEntry[]; rows: BrandPerformanceLogEntry[] }>(
      'GET',
      `/reporting/brand${qs}`,
      undefined,
      params?.signal,
    );
  },

  /** Simpan 1 batch upload beserta seluruh raw rows */
  createBatch: (payload: { batch: UploadHistoryEntry; rows: BrandPerformanceLogEntry[] }) =>
    request<{ success: boolean; id: string; rowCount: number }>('POST', '/reporting/brand/batch', payload),

  /** Hapus beberapa batch dan/atau row sekaligusa */
  deleteMany: (payload: { batchIds?: string[]; logIds?: string[] }) =>
    request<{ success: boolean }>('POST', '/reporting/brand/delete-many', payload),
};

// ==================================================================
// SYNC HELPER — Pengganti firestoreSync.ts
// ==================================================================
/**
 * Sync array ke MySQL via backend API.
 * Menggantikan fungsi syncToFirestore() di firestoreSync.ts.
 *
 * Strategi: compare oldArray vs newArray, PUT yang berubah, DELETE yang hilang, POST yang baru.
 */
export async function syncToMySQL(
  entityType: string,
  oldArray: SyncItem[],
  newArray: SyncItem[]
): Promise<void> {
  const apiMap: Record<string, SyncApi> = {
    'hosts': hostsApi as unknown as SyncApi,
    'logs': logsApi as unknown as SyncApi,
    'schedules': schedulesApi as unknown as SyncApi,
    'alerts': alertsApi as unknown as SyncApi,
    'client-brands': clientBrandsApi as unknown as SyncApi,
    'client_brands': clientBrandsApi as unknown as SyncApi,
    'client-leads': clientLeadsApi as unknown as SyncApi,
    'client_leads': clientLeadsApi as unknown as SyncApi,
    'admin-accounts': adminAccountsApi as unknown as SyncApi,
    'admin_accounts': adminAccountsApi as unknown as SyncApi,
  };

  const api = apiMap[entityType];
  if (!api) {
    console.warn(`[syncToMySQL] No API map found for entityType: ${entityType}`);
    return;
  }

  const oldIds = oldArray.map((x) => x.id).filter(Boolean);
  const newIds = newArray.map((x) => x.id).filter(Boolean);

  // Items yang dihapus
  const toDelete = oldIds.filter((id) => !newIds.includes(id));

  // Items baru atau yang berubah
  const toUpsert = newArray.filter((item) => {
    if (!item.id) return false;
    const oldItem = oldArray.find((x) => x.id === item.id);
    return !oldItem || JSON.stringify(item) !== JSON.stringify(oldItem);
  });

  // Items yang benar-benar baru
  const toCreate = toUpsert.filter((item) => !oldIds.includes(item.id));

  // Items yang di-update
  const toUpdate = toUpsert.filter((item) => oldIds.includes(item.id));

  const promises: Promise<unknown>[] = [
    ...toDelete.map((id) => api.delete(id)),
    ...toCreate.map((item) => api.create(item)),
    ...toUpdate.map((item) => api.update(item.id, item)),
  ];

  await Promise.allSettled(promises);
}

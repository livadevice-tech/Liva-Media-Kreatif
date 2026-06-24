/**
 * src/api.ts
 * ==========
 * Centralized REST API client untuk semua komunikasi dengan backend MySQL.
 * Menggantikan semua panggilan Firebase Firestore di frontend.
 *
 * Semua fungsi ini akan dipanggil dari App.tsx sebagai pengganti
 * fungsi-fungsi Firebase seperti onSnapshot, getDoc, setDoc, deleteDoc, dll.
 */

// Base URL backend — di production sudah satu domain dengan frontend
const API_BASE = '/api';

// ------------------------------------------------------------------
// UTILS
// ------------------------------------------------------------------

export const testDbConnection = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  const res = await fetch(`${API_BASE}/db-test`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
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
  body?: unknown
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
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

// ==================================================================
// HOSTS
// ==================================================================
export const hostsApi = {
  /** Ambil semua host */
  getAll: () => request<any[]>('GET', '/hosts'),

  /** Ambil satu host by ID (termasuk platforms & brands) */
  getById: (id: string) => request<any>('GET', `/hosts/${id}`),

  /** Buat host baru */
  create: (host: any) => request<{ id: string }>('POST', '/hosts', host),

  /** Update host */
  update: (id: string, host: any) => request<void>('PUT', `/hosts/${id}`, host),

  /** Hapus host */
  delete: (id: string) => request<void>('DELETE', `/hosts/${id}`),
};

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
    return request<any[]>('GET', `/logs${qs}`);
  },

  /** Buat log baru */
  create: (log: any) => request<{ id: string }>('POST', '/logs', log),

  /** Update log */
  update: (id: string, log: any) => request<void>('PUT', `/logs/${id}`, log),

  /** Hapus log */
  delete: (id: string) => request<void>('DELETE', `/logs/${id}`),

  /** Hapus semua log berdasarkan array ID */
  deleteMany: (ids: string[]) => request<void>('POST', '/logs/delete-many', { ids }),
};

// ==================================================================
// SHIFT SCHEDULES
// ==================================================================
export const schedulesApi = {
  /** Ambil semua jadwal */
  getAll: (params?: { date?: string }) => {
    const qs = params?.date ? `?date=${params.date}` : '';
    return request<any[]>('GET', `/schedules${qs}`);
  },

  /** Buat jadwal */
  create: (schedule: any) => request<{ id: string }>('POST', '/schedules', schedule),

  /** Update jadwal */
  update: (id: string, schedule: any) => request<void>('PUT', `/schedules/${id}`, schedule),

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
    return request<any[]>('GET', `/alerts${qs}`);
  },

  /** Buat alert */
  create: (alert: any) => request<{ id: string }>('POST', '/alerts', alert),

  /** Update alert (termasuk resolve) */
  update: (id: string, alert: any) => request<void>('PUT', `/alerts/${id}`, alert),

  /** Hapus alert */
  delete: (id: string) => request<void>('DELETE', `/alerts/${id}`),
};

// ==================================================================
// CLIENT BRANDS
// ==================================================================
export const clientBrandsApi = {
  /** Ambil semua brand klien (termasuk sessions, accounts, invoices, berkas) */
  getAll: () => request<any[]>('GET', '/client-brands'),

  /** Ambil satu brand klien by ID */
  getById: (id: string) => request<any>('GET', `/client-brands/${id}`),

  /** Buat brand klien baru */
  create: (brand: any) => request<{ id: string }>('POST', '/client-brands', brand),

  /** Update brand klien */
  update: (id: string, brand: any) => request<void>('PUT', `/client-brands/${id}`, brand),

  /** Hapus brand klien */
  delete: (id: string) => request<void>('DELETE', `/client-brands/${id}`),
};

// ==================================================================
// CLIENT LEADS
// ==================================================================
export const clientLeadsApi = {
  /** Ambil semua leads */
  getAll: () => request<any[]>('GET', '/client-leads'),

  /** Buat lead baru */
  create: (lead: any) => request<{ id: string }>('POST', '/client-leads', lead),

  /** Update lead */
  update: (id: string, lead: any) => request<void>('PUT', `/client-leads/${id}`, lead),

  /** Hapus lead */
  delete: (id: string) => request<void>('DELETE', `/client-leads/${id}`),
};

// ==================================================================
// ADMIN ACCOUNTS
// ==================================================================
export const adminAccountsApi = {
  /** Ambil semua admin */
  getAll: () => request<any[]>('GET', '/admin-accounts'),

  /** Buat admin baru */
  create: (admin: any) => request<{ id: string }>('POST', '/admin-accounts', admin),

  /** Update admin */
  update: (id: string, admin: any) => request<void>('PUT', `/admin-accounts/${id}`, admin),

  /** Hapus admin */
  delete: (id: string) => request<void>('DELETE', `/admin-accounts/${id}`),
};

// ==================================================================
// CLIENT REPORTING
// ==================================================================
export const clientReportingApi = {
  /** Ambil semua reporting */
  getAll: (params?: { brandId?: string }) => {
    const qs = params?.brandId ? `?brandId=${params.brandId}` : '';
    return request<any[]>('GET', `/client-reporting${qs}`);
  },

  /** Buat reporting baru */
  create: (report: any) => request<{ id: string }>('POST', '/client-reporting', report),

  /** Update reporting */
  update: (id: string, report: any) => request<void>('PUT', `/client-reporting/${id}`, report),

  /** Hapus reporting */
  delete: (id: string) => request<void>('DELETE', `/client-reporting/${id}`),
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
  entityType: any,
  oldArray: any[],
  newArray: any[]
): Promise<void> {
  const apiMap: any = {
    'hosts':          hostsApi,
    'logs':           logsApi,
    'schedules':      schedulesApi,
    'alerts':         alertsApi,
    'client-brands':  clientBrandsApi,
    'client_brands':  clientBrandsApi,
    'client-leads':   clientLeadsApi,
    'client_leads':   clientLeadsApi,
    'admin-accounts': adminAccountsApi,
    'admin_accounts': adminAccountsApi,
  };

  const api = apiMap[entityType] as any;
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

  const promises: Promise<any>[] = [
    ...toDelete.map((id) => api.delete(id)),
    ...toCreate.map((item) => api.create(item)),
    ...toUpdate.map((item) => api.update(item.id, item)),
  ];

  await Promise.allSettled(promises);
}

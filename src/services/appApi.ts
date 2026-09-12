import { 
  Project, 
  Task, 
  ContentPost, 
  Brand, 
  ContentPillar, 
  DbStatus, 
  TaskStatus, 
  ContentStatus,
  UserAccount,
  ContentDraftItem,
  SignedDocument
} from '../types/app';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Terjadi kendala koneksi' }));
    throw new Error(err.error || err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const appApi = {
  // Database Health Check
  getDbStatus: (): Promise<DbStatus> =>
    fetch(`${API_BASE}/db-test`).then(handleResponse<DbStatus>),

  // Brands
  getBrands: (): Promise<Brand[]> =>
    fetch(`${API_BASE}/project-app/brands`).then(handleResponse<Brand[]>),
  createBrand: (data: Partial<Brand>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateBrand: (id: string, data: Partial<Brand>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteBrand: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/brands/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),

  // Content Pillars
  getPillars: (): Promise<ContentPillar[]> =>
    fetch(`${API_BASE}/project-app/content-pillars`).then(handleResponse<ContentPillar[]>),
  createPillar: (data: Partial<ContentPillar>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/content-pillars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updatePillar: (id: string, data: Partial<ContentPillar>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/content-pillars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deletePillar: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/content-pillars/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),

  // Projects
  getProjects: (): Promise<Project[]> =>
    fetch(`${API_BASE}/project-app/projects`).then(handleResponse<Project[]>),
  createProject: (data: Partial<Project>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateProject: (id: string, data: Partial<Project>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteProject: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/projects/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),

  // Tasks
  getTasks: (params?: { project_id?: string; status?: string }): Promise<Task[]> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetch(`${API_BASE}/project-app/tasks?${query}`).then(handleResponse<Task[]>);
  },
  createTask: (data: Partial<Task>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateTaskStatus: (id: string, status: TaskStatus): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse<{ success: boolean }>),
  updateTask: (id: string, data: Partial<Task>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteTask: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/tasks/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),

  // Content Posts
  getContentPosts: (params?: { brand_id?: string; platform?: string; status?: string; month?: number; year?: number }): Promise<ContentPost[]> => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE}/project-app/content-posts?${query}`).then(handleResponse<ContentPost[]>);
  },
  createContentPost: (data: Partial<ContentPost>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/content-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateContentPostStatus: (id: string, status: ContentStatus): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/content-posts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse<{ success: boolean }>),
  updateContentPost: (id: string, data: Partial<ContentPost>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/content-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteContentPost: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/content-posts/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),
  deleteContentPostsBulk: (params: { scope: 'all' | 'month'; month?: number; year?: number; brand_id?: string }): Promise<{ success: boolean; message: string; affectedRows: number }> => {
    const query = new URLSearchParams();
    query.set('scope', params.scope);
    if (params.month !== undefined) query.set('month', String(params.month));
    if (params.year !== undefined) query.set('year', String(params.year));
    if (params.brand_id) query.set('brand_id', params.brand_id);
    return fetch(`${API_BASE}/project-app/content-posts?${query.toString()}`, {
      method: 'DELETE',
    }).then(handleResponse<{ success: boolean; message: string; affectedRows: number }>);
  },

  // Content Drafts (Bank Ide & Referensi)
  getDrafts: (params?: { brand_id?: string; status?: string; search?: string }): Promise<ContentDraftItem[]> => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${API_BASE}/project-app/drafts?${query}`).then(handleResponse<ContentDraftItem[]>);
  },
  createDraft: (data: Partial<ContentDraftItem>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateDraft: (id: string, data: Partial<ContentDraftItem>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/drafts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteDraft: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/drafts/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),
  scheduleDraftToCalendar: (id: string, payload: { scheduled_at: string; brand_id?: string; platform?: string; content_type?: string }): Promise<{ success: boolean; postId: string; message: string }> =>
    fetch(`${API_BASE}/project-app/drafts/${id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse<{ success: boolean; postId: string; message: string }>),

  // User Accounts Management
  getAccounts: (): Promise<UserAccount[]> =>
    fetch(`${API_BASE}/project-app/accounts`).then(handleResponse<UserAccount[]>),
  createAccount: (data: Partial<UserAccount>): Promise<{ success: boolean; id: string }> =>
    fetch(`${API_BASE}/project-app/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string }>),
  updateAccount: (id: string, data: Partial<UserAccount>): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean }>),
  deleteAccount: (id: string): Promise<{ success: boolean }> =>
    fetch(`${API_BASE}/project-app/accounts/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean }>),

  // Auth
  login: (credentials: { username: string; password: string }): Promise<{ success: boolean; user: UserAccount; message?: string }> =>
    fetch(`${API_BASE}/project-app/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse<{ success: boolean; user: UserAccount; message?: string }>),

  // Application Settings
  getSettings: <T = any>(key: string): Promise<T> =>
    fetch(`${API_BASE}/project-app/settings/${key}`).then(handleResponse<T>),
  saveSettings: (key: string, data: any): Promise<{ success: boolean; key: string }> =>
    fetch(`${API_BASE}/project-app/settings/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; key: string }>),

  // Asset File Upload (Image / PDF / File)
  uploadAssetFile: (file: File): Promise<{
    success: boolean;
    url: string;
    originalName: string;
    size: number;
    mimetype: string;
    fileType: 'image' | 'document' | 'other';
  }> => {
    const formData = new FormData();
    formData.append('asset_file', file);
    return fetch(`${API_BASE}/project-app/upload-asset`, {
      method: 'POST',
      body: formData,
    }).then(handleResponse<{
      success: boolean;
      url: string;
      originalName: string;
      size: number;
      mimetype: string;
      fileType: 'image' | 'document' | 'other';
    }>);
  },

  // Digital Signed Documents (Ttd Berkas)
  getSignedDocuments: (): Promise<SignedDocument[]> =>
    fetch(`${API_BASE}/project-app/documents`).then(handleResponse<SignedDocument[]>),
  createSignedDocument: (data: Partial<SignedDocument> & { signature_position?: any }): Promise<{ success: boolean; id: string; signing_token: string; signed_file_url?: string; message?: string }> =>
    fetch(`${API_BASE}/project-app/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; id: string; signing_token: string; signed_file_url?: string; message?: string }>),
  getPublicDocumentForSigning: (token: string): Promise<{ success: boolean; document: SignedDocument }> =>
    fetch(`${API_BASE}/project-app/documents/public/${token}`).then(handleResponse<{ success: boolean; document: SignedDocument }>),
  submitPublicSignature: (token: string, data: { signature_data_url: string; signer_name?: string; signer_role?: string; signature_position?: any }): Promise<{ success: boolean; message: string; signed_file_url?: string; signer_name?: string; signed_at?: string }> =>
    fetch(`${API_BASE}/project-app/documents/public/${token}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; message: string; signed_file_url?: string; signer_name?: string; signed_at?: string }>),
  signDocumentInternal: (id: string, data: { signature_data_url: string; signer_name?: string; signer_role?: string; signature_position?: any }): Promise<{ success: boolean; signed_file_url?: string; message: string }> =>
    fetch(`${API_BASE}/project-app/documents/${id}/internal-sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse<{ success: boolean; signed_file_url?: string; message: string }>),
  deleteSignedDocument: (id: string): Promise<{ success: boolean; message: string }> =>
    fetch(`${API_BASE}/project-app/documents/${id}`, { method: 'DELETE' }).then(handleResponse<{ success: boolean; message: string }>),
};

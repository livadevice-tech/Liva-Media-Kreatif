import { 
  Project, 
  Task, 
  ContentPost, 
  Brand, 
  ContentPillar, 
  DbStatus, 
  TaskStatus, 
  ContentStatus 
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

  // Content Pillars
  getPillars: (): Promise<ContentPillar[]> =>
    fetch(`${API_BASE}/project-app/content-pillars`).then(handleResponse<ContentPillar[]>),

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
};

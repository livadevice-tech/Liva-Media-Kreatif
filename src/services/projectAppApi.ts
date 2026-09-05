import { Brand, SocialAccount, Project, Task, ContentPost, ContentPillar, DashboardStats } from '../types/projectApp';

const BASE_URL = '/api/project-app';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Terjadi kesalahan jaringan' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const projectAppApi = {
  // Stats
  getStats: () => fetch(`${BASE_URL}/stats`).then(res => handleResponse<DashboardStats>(res)),

  // Brands
  getBrands: () => fetch(`${BASE_URL}/brands`).then(res => handleResponse<Brand[]>(res)),
  createBrand: (data: Partial<Brand>) => 
    fetch(`${BASE_URL}/brands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean; id: string }>(res)),
  updateBrand: (id: string, data: Partial<Brand>) => 
    fetch(`${BASE_URL}/brands/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean }>(res)),
  deleteBrand: (id: string) => 
    fetch(`${BASE_URL}/brands/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ success: boolean }>(res)),

  // Social Accounts
  getSocialAccounts: () => fetch(`${BASE_URL}/social-accounts`).then(res => handleResponse<SocialAccount[]>(res)),
  createSocialAccount: (data: Partial<SocialAccount>) => 
    fetch(`${BASE_URL}/social-accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean; id: string }>(res)),
  updateSocialAccount: (id: string, data: Partial<SocialAccount>) => 
    fetch(`${BASE_URL}/social-accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean }>(res)),
  deleteSocialAccount: (id: string) => 
    fetch(`${BASE_URL}/social-accounts/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ success: boolean }>(res)),

  // Projects
  getProjects: () => fetch(`${BASE_URL}/projects`).then(res => handleResponse<Project[]>(res)),
  createProject: (data: Partial<Project>) => 
    fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean; id: string }>(res)),
  updateProject: (id: string, data: Partial<Project>) => 
    fetch(`${BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean }>(res)),
  deleteProject: (id: string) => 
    fetch(`${BASE_URL}/projects/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ success: boolean }>(res)),

  // Tasks
  getTasks: (params?: { project_id?: string; status?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${BASE_URL}/tasks?${query}`).then(res => handleResponse<Task[]>(res));
  },
  createTask: (data: Partial<Task>) => 
    fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean; id: string }>(res)),
  updateTaskStatus: (id: string, status: string) => 
    fetch(`${BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => handleResponse<{ success: boolean }>(res)),
  updateTask: (id: string, data: Partial<Task>) => 
    fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean }>(res)),
  deleteTask: (id: string) => 
    fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ success: boolean }>(res)),

  // Content Pillars & Posts
  getContentPillars: () => fetch(`${BASE_URL}/content-pillars`).then(res => handleResponse<ContentPillar[]>(res)),
  getContentPosts: (params?: { brand_id?: string; platform?: string; status?: string; month?: number; year?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetch(`${BASE_URL}/content-posts?${query}`).then(res => handleResponse<ContentPost[]>(res));
  },
  createContentPost: (data: Partial<ContentPost>) => 
    fetch(`${BASE_URL}/content-posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean; id: string }>(res)),
  updateContentPostStatus: (id: string, status: string) => 
    fetch(`${BASE_URL}/content-posts/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(res => handleResponse<{ success: boolean }>(res)),
  updateContentPost: (id: string, data: Partial<ContentPost>) => 
    fetch(`${BASE_URL}/content-posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ success: boolean }>(res)),
  deleteContentPost: (id: string) => 
    fetch(`${BASE_URL}/content-posts/${id}`, { method: 'DELETE' }).then(res => handleResponse<{ success: boolean }>(res)),
  generateAiCopy: (data: { topic: string; pillar: string; platform?: string; brand_tone?: string }) =>
    fetch(`${BASE_URL}/ai-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => handleResponse<{ hook: string; caption: string; hashtags: string; call_to_action: string }>(res)),
};

import { TaskItem, TaskFileLink, TaskCustomSettings } from './types';
import { DEFAULT_TASK_SETTINGS } from './taskTheme';

const STORAGE_KEY = 'liva_tasks_v1';
const API_URL = '/api/settings/liva_tasks';

const SETTINGS_STORAGE_KEY = 'liva_task_settings_v1';
const SETTINGS_API_URL = '/api/settings/liva_task_settings';


export function detectLinkPlatform(url: string): TaskFileLink['platform'] {
  const lower = (url || '').toLowerCase();
  if (lower.includes('drive.google.com')) return 'drive';
  if (lower.includes('docs.google.com/spreadsheets') || lower.includes('sheets.google.com')) return 'sheets';
  if (lower.includes('docs.google.com')) return 'docs';
  if (lower.includes('figma.com')) return 'figma';
  if (lower.includes('canva.com')) return 'canva';
  return 'general';
}

const INITIAL_SEED_TASKS: TaskItem[] = [
  {
    id: 'task-seed-1',
    title: 'Persiapan Live Shopping Grand Opening Doremi',
    description: 'Menyiapkan rundown produk unggulan, setup lighting studio 2, dan memastikan akun TikTok Shop sudah terhubung dengan OBS studio.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'Live Production',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    picIds: [],
    picNames: ['Annisa (Host)', 'Rian (Operator)'],
    checklist: [
      { id: 'c1', text: 'Cek sample produk & harga promo di keranjang kuning', isDone: true },
      { id: 'c2', text: 'Setting lighting, mic wireless, dan kamera utama studio', isDone: true },
      { id: 'c3', text: 'Briefing host mengenai unique selling point & gimik diskon', isDone: false },
      { id: 'c4', text: 'Test koneksi internet siaran kecepatan 50 Mbps', isDone: false },
    ],
    fileLinks: [
      {
        id: 'f1',
        title: 'Briefing Rundown & Script Live',
        url: 'https://docs.google.com/document/d/example-brief-rundown',
        platform: 'docs',
      },
      {
        id: 'f2',
        title: 'Folder Asset Banner & Overlay OBS',
        url: 'https://drive.google.com/drive/folders/example-assets-live',
        platform: 'drive',
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-seed-2',
    title: 'Desain Banner & Thumbnail Promo Brand Unza Vitalis',
    description: 'Membuat 5 variasi thumbnail feed TikTok dan banner cover live streaming beresolusi tinggi dengan tema promo belanja gajian.',
    status: 'todo',
    priority: 'moderate',
    category: 'Desain & Kreatif',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    picIds: [],
    picNames: ['Dimas (Desainer)'],
    checklist: [
      { id: 'c11', text: 'Kumpulkan foto produk beresolusi tinggi dari client brand', isDone: true },
      { id: 'c12', text: 'Buat layout Figma untuk banner ukuran 1080x1920 & 1:1', isDone: false },
      { id: 'c13', text: 'Export PNG optimized untuk diunggah ke TikTok & Shopee', isDone: false },
    ],
    fileLinks: [
      {
        id: 'f11',
        title: 'File Project Figma UI/UX Banner',
        url: 'https://www.figma.com/file/example-banner-design',
        platform: 'figma',
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-seed-3',
    title: 'Review Kualitas Siaran & Sound Check Shift Malam',
    description: 'Pemeriksaan kualitas audio host, pencahayaan, dan sinkronisasi streaming untuk shift 19:00 - 23:00 WIB.',
    status: 'in_review',
    priority: 'moderate',
    category: 'Quality Assurance',
    deadline: new Date().toISOString().substring(0, 10),
    picIds: [],
    picNames: ['Farhan (Lead QA)'],
    checklist: [
      { id: 'c21', text: 'Cek level gain audio mic clip-on tidak clipping', isDone: true },
      { id: 'c22', text: 'Pantau komentar penonton & respon interaksi streamer', isDone: true },
      { id: 'c23', text: 'Catat insiden teknis atau buffering jika ada', isDone: true },
    ],
    fileLinks: [
      {
        id: 'f21',
        title: 'Spreadsheet Log Evaluasi Siaran Harian',
        url: 'https://docs.google.com/spreadsheets/d/example-evaluasi-qa',
        platform: 'sheets',
      },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-seed-4',
    title: 'Rekapitulasi Performa GMV Mingguan Seluruh Client',
    description: 'Export laporan analitik penjualan, konversi viewer ke pembeli, dan kompilasi laporan PDF untuk dikirim ke brand manager.',
    status: 'done',
    priority: 'low',
    category: 'Reporting & Admin',
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    picIds: [],
    picNames: ['Siti (Admin Operasional)'],
    checklist: [
      { id: 'c31', text: 'Tarik data analitik live streaming TikTok & Shopee', isDone: true },
      { id: 'c32', text: 'Hitung total GMV dan rasio ketercapaian target KPI', isDone: true },
      { id: 'c33', text: 'Kirim summary laporan ke grup WhatsApp brand klien', isDone: true },
    ],
    fileLinks: [
      {
        id: 'f31',
        title: 'Dokumen Rekap GMV Mingguan (Canva)',
        url: 'https://www.canva.com/design/example-rekap-gmv',
        platform: 'canva',
      },
    ],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function loadTasksFromStorage(): Promise<TaskItem[]> {
  try {
    // 1. Try to load from Backend API (MySQL global_settings)
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('[TaskStorage] Failed to fetch tasks from API, checking local storage:', err);
  }

  // 2. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[TaskStorage] Failed to parse local storage tasks:', err);
  }

  // 3. Fallback to initial seeds and persist only if never initialized before
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_TASKS));
    saveTasksToStorage(INITIAL_SEED_TASKS).catch(() => {});
  } catch {}
  return INITIAL_SEED_TASKS;
}

export async function saveTasksToStorage(tasks: TaskItem[]): Promise<boolean> {
  // 1. Save optimistically to localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('[TaskStorage] Error saving to localStorage:', err);
  }

  // 2. Sync to Backend MySQL API
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    });
    return res.ok;
  } catch (err) {
    console.warn('[TaskStorage] Error syncing tasks to MySQL API:', err);
    return false;
  }
}

// ==================================================================
// TASK CUSTOM SETTINGS (STATUS, PRIORITY, CATEGORY) PERSISTENCE
// ==================================================================

export async function loadTaskSettingsFromStorage(): Promise<TaskCustomSettings> {
  // 1. Try to fetch from Backend MySQL API
  try {
    const res = await fetch(SETTINGS_API_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (
        data &&
        typeof data === 'object' &&
        Array.isArray(data.statuses) &&
        data.statuses.length > 0
      ) {
        // Cache to localStorage
        try {
          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
        } catch {}
        return data as TaskCustomSettings;
      }
    }
  } catch (err) {
    console.warn('[TaskStorage] Failed to fetch task settings from MySQL API, checking localStorage:', err);
  }

  // 2. Fallback to LocalStorage
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.statuses) && parsed.statuses.length > 0) {
        return parsed as TaskCustomSettings;
      }
    }
  } catch (err) {
    console.warn('[TaskStorage] Failed to parse local task settings:', err);
  }

  // 3. Fallback to default settings & persist
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_TASK_SETTINGS));
    saveTaskSettingsToStorage(DEFAULT_TASK_SETTINGS).catch(() => {});
  } catch {}

  return DEFAULT_TASK_SETTINGS;
}

export async function saveTaskSettingsToStorage(settings: TaskCustomSettings): Promise<boolean> {
  // 1. Optimistic save to localStorage
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('[TaskStorage] Error saving task settings to localStorage:', err);
  }

  // 2. Persist to MySQL database (global_settings)
  try {
    const res = await fetch(SETTINGS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch (err) {
    console.warn('[TaskStorage] Error syncing task settings to MySQL API:', err);
    return false;
  }
}


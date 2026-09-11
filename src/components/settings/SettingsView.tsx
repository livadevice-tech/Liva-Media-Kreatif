import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Building2, 
  Layers, 
  Database, 
  ShieldCheck, 
  Crown, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Globe, 
  Mail, 
  Phone, 
  Calendar, 
  CheckSquare, 
  RefreshCw, 
  Lock, 
  Sparkles,
  Server,
  Users,
  ChevronRight
} from 'lucide-react';
import { UserAccount, DbStatus } from '../../types/app';
import { appApi } from '../../services/appApi';

export interface AppSettings {
  general: {
    appName: string;
    agencyName: string;
    tagline: string;
    contactEmail: string;
    contactPhone: string;
    workingHours: string;
    timezone: string;
    currency: string;
  };
  contentWorkflow: {
    defaultPlatform: string;
    defaultStatus: string;
    defaultPillar: string;
    autoScheduleTime: string;
    notifyBeforeDays: number;
  };
  tasksWorkflow: {
    defaultPriority: string;
    defaultStatus: string;
    defaultDueDays: number;
    allowMultiAssignee: boolean;
  };
  system: {
    maintenanceMode: boolean;
    enableActivityLog: boolean;
    sessionTimeoutHours: number;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  general: {
    appName: 'Liva Agency Hub',
    agencyName: 'Liva Media Kreatif',
    tagline: 'Creative Media, Digital Strategy & Content Production',
    contactEmail: 'admin@livamediakreatif.com',
    contactPhone: '+62 812-3456-7890',
    workingHours: '09:00 - 18:00 WIB',
    timezone: 'Asia/Jakarta (WIB UTC+7)',
    currency: 'IDR (Rp)',
  },
  contentWorkflow: {
    defaultPlatform: 'Instagram',
    defaultStatus: 'Draft',
    defaultPillar: 'Edukasi',
    autoScheduleTime: '19:00',
    notifyBeforeDays: 1,
  },
  tasksWorkflow: {
    defaultPriority: 'Medium',
    defaultStatus: 'Todo',
    defaultDueDays: 3,
    allowMultiAssignee: true,
  },
  system: {
    maintenanceMode: false,
    enableActivityLog: true,
    sessionTimeoutHours: 24,
  },
};

interface SettingsViewProps {
  currentUser: UserAccount | null;
  dbStatus: DbStatus | null;
  onCheckDb: () => Promise<void>;
  checkingDb: boolean;
  onNavigateToAccounts?: () => void;
}

type SettingsTab = 'general' | 'workflow' | 'database' | 'security';

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  dbStatus,
  onCheckDb,
  checkingDb,
  onNavigateToAccounts,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load settings from backend
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await appApi.getSettings<Partial<AppSettings>>('liva_app_settings');
        if (isMounted && data && typeof data === 'object') {
          setSettings({
            general: { ...DEFAULT_SETTINGS.general, ...(data.general || {}) },
            contentWorkflow: { ...DEFAULT_SETTINGS.contentWorkflow, ...(data.contentWorkflow || {}) },
            tasksWorkflow: { ...DEFAULT_SETTINGS.tasksWorkflow, ...(data.tasksWorkflow || {}) },
            system: { ...DEFAULT_SETTINGS.system, ...(data.system || {}) },
          });
        }
      } catch (err) {
        console.warn('Could not load custom settings, using defaults:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await appApi.saveSettings('liva_app_settings', settings);
      setNotification({
        type: 'success',
        message: 'Pengaturan aplikasi berhasil disimpan dan diperbarui!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Gagal menyimpan pengaturan.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan semua pengaturan ke konfigurasi default?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Top Header Bar */}
      <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-2xs">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Pengaturan Aplikasi
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1 shadow-2xs">
                <Crown className="w-3 h-3 text-purple-600" />
                Khusus Master Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Konfigurasi umum, default alur kerja konten, dan status server Liva Media Kreatif
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            type="button"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Reset Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="h-12 px-6 border-b border-slate-200/80 bg-white flex items-center gap-2 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'general'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Profil Agensi & Identitas</span>
        </button>

        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'workflow'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Workflow Konten & Tugas</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database & Server</span>
          <div
            className={`w-2 h-2 rounded-full ${
              dbStatus?.success ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-purple-50 text-purple-700 border border-purple-200/80 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hak Akses & Keamanan</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* TAB 1: GENERAL & AGENCY PROFILE */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Informasi Brand & Agensi */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Identitas Agensi & Aplikasi
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Aplikasi
                    </label>
                    <input
                      type="text"
                      value={settings.general.appName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, appName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Nama sistem yang muncul pada header navigasi.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Nama Perusahaan / Studio
                    </label>
                    <input
                      type="text"
                      value={settings.general.agencyName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, agencyName: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Nama resmi agensi yang tertera pada laporan dan brand client.
                    </p>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Tagline / Slogan Agensi
                    </label>
                    <input
                      type="text"
                      value={settings.general.tagline}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, tagline: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Operasional & Kontak */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Kontak & Operasional
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Email Kontak Utama
                    </label>
                    <input
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, contactEmail: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.general.contactPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, contactPhone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Jam Kerja Operasional
                    </label>
                    <input
                      type="text"
                      value={settings.general.workingHours}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, workingHours: e.target.value },
                        })
                      }
                      placeholder="09:00 - 18:00 WIB"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Zona Waktu
                    </label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          general: { ...settings.general, timezone: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Asia/Jakarta (WIB UTC+7)">Asia/Jakarta (WIB UTC+7)</option>
                      <option value="Asia/Makassar (WITA UTC+8)">Asia/Makassar (WITA UTC+8)</option>
                      <option value="Asia/Jayapura (WIT UTC+9)">Asia/Jayapura (WIT UTC+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW & DEFAULTS */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Card 1: Content Calendar Workflow */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Default Content Calendar
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Platform Default
                    </label>
                    <select
                      value={settings.contentWorkflow.defaultPlatform}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contentWorkflow: {
                            ...settings.contentWorkflow,
                            defaultPlatform: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="TikTok">TikTok</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Facebook">Facebook</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter / X</option>
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Dipilih secara otomatis saat membuat slot konten baru di kalender.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Status Awal Konten
                    </label>
                    <select
                      value={settings.contentWorkflow.defaultStatus}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contentWorkflow: {
                            ...settings.contentWorkflow,
                            defaultStatus: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Approved">Approved</option>
                      <option value="Scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Jam Tayang Rekomendasi
                    </label>
                    <input
                      type="time"
                      value={settings.contentWorkflow.autoScheduleTime}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contentWorkflow: {
                            ...settings.contentWorkflow,
                            autoScheduleTime: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Prime-time posting standar untuk agensi Liva.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Pilar Konten Utama
                    </label>
                    <input
                      type="text"
                      value={settings.contentWorkflow.defaultPillar}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contentWorkflow: {
                            ...settings.contentWorkflow,
                            defaultPillar: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Project & Task Defaults */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Default Task Management & Kanban
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Prioritas Tugas Default
                    </label>
                    <select
                      value={settings.tasksWorkflow.defaultPriority}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tasksWorkflow: {
                            ...settings.tasksWorkflow,
                            defaultPriority: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Standar Jatuh Tempo Tugas Baru
                    </label>
                    <select
                      value={settings.tasksWorkflow.defaultDueDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tasksWorkflow: {
                            ...settings.tasksWorkflow,
                            defaultDueDays: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="1">+1 Hari (Besok)</option>
                      <option value="3">+3 Hari Kerja</option>
                      <option value="7">+7 Hari (1 Minggu)</option>
                      <option value="14">+14 Hari (2 Minggu)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.tasksWorkflow.allowMultiAssignee}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            tasksWorkflow: {
                              ...settings.tasksWorkflow,
                              allowMultiAssignee: e.target.checked,
                            },
                          })
                        }
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800">
                          Izinkan Multi-Assignee (Banyak Penanggung Jawab)
                        </span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Memungkinkan penugasan satu task ke beberapa anggota tim (misal Content Creator + Video Editor).
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE & SERVER DIAGNOSTICS */}
          {activeTab === 'database' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Koneksi Database MySQL (Hostinger Cloud)
                    </h2>
                  </div>

                  <button
                    onClick={onCheckDb}
                    disabled={checkingDb}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingDb ? 'animate-spin' : ''}`} />
                    <span>{checkingDb ? 'Memeriksa...' : 'Test Ulang Koneksi'}</span>
                  </button>
                </div>

                {/* Status Hero Card */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    dbStatus?.success
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        dbStatus?.success
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        {dbStatus?.success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Database MySQL Terhubung dan Siap
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            Koneksi Database Terputus
                          </>
                        )}
                      </div>
                      <p className="text-xs opacity-80 mt-0.5">
                        {dbStatus?.success
                          ? 'Pool koneksi aktif dan merespon query dengan normal.'
                          : 'Periksa kredensial DB_HOST, DB_USER, dan DB_PASSWORD di server .env.'}
                      </p>
                    </div>
                  </div>

                  {dbStatus?.latencyMs !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Latency</div>
                      <div className="text-base font-bold font-mono text-emerald-700">
                        {dbStatus.latencyMs}ms
                      </div>
                    </div>
                  )}
                </div>

                {/* Database Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-medium">Host Server</span>
                    <div className="font-mono font-bold text-slate-800">
                      {dbStatus?.host || '153.92.15.31'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-medium">Nama Database</span>
                    <div className="font-mono font-bold text-slate-800">
                      {dbStatus?.database || 'u731908076_projectliva'}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-medium">Total Tabel Terdaftar</span>
                    <div className="font-mono font-bold text-slate-800">
                      {dbStatus?.tablesCount || 10} Tabel
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 font-medium">Sinkronisasi Aplikasi</span>
                    <div className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aktif (Auto Real-time)
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pengaturan koneksi MySQL Hostinger dikonfigurasi melalui environment server (<code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">.env</code>) demi keamanan keamanan kredensial.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & ROLES POLICY */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <h2 className="text-sm font-bold text-slate-900">
                      Kebijakan Hak Akses & Keamanan Sistem
                    </h2>
                  </div>

                  {onNavigateToAccounts && (
                    <button
                      onClick={onNavigateToAccounts}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Kelola Akun Tim</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Role Matrix */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Tingkatan Wewenang Akun (Role Hierarchy)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Master Admin Card */}
                    <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
                        <Crown className="w-4 h-4 text-purple-600" />
                        Master Admin
                      </div>
                      <p className="text-[11px] text-purple-900/80 leading-relaxed">
                        Akses tertinggi sistem: Dapat mengatur seluruh pengaturan aplikasi, menambah & mengedit akun, serta melakukan hapus massal kalender.
                      </p>
                    </div>

                    {/* Admin Card */}
                    <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Admin
                      </div>
                      <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                        Akses manajerial operasional: Mengelola Content Calendar, Kanban Board, Brand Client, dan Content Pillars.
                      </p>
                    </div>

                    {/* Staff Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                        <Lock className="w-4 h-4 text-slate-500" />
                        Staff / Kreator
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Akses tugas & jadwal: Melihat tugas yang ditugaskan (assigned to), update status task, dan melihat konten kalender.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Session Info */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        Sesi Aktif: {currentUser?.full_name || 'Master Administrator'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Username: @{currentUser?.username || 'admin'} • Peran:{' '}
                        <span className="font-semibold text-purple-700">
                          {currentUser?.role || 'Master Admin'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                    Terotentikasi Penuh
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  FolderKanban,
  Home, 
  FileText, 
  Zap, 
  HelpCircle, 
  Settings, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeft,
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Database,
  ExternalLink,
  Users,
  LogOut,
  Lock,
  ShieldAlert,
  FolderArchive,
  Lightbulb,
  Wrench
} from 'lucide-react';
import { appApi } from './services/appApi';
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
  ContentDraftItem
} from './types/app';
import { ContentCalendarView } from './components/calendar/ContentCalendarView';
import { ProjectKanbanView } from './components/projects/ProjectKanbanView';
import { AccountManagementView } from './components/accounts/AccountManagementView';
import { SettingsView, AppSettings, DEFAULT_SETTINGS } from './components/settings/SettingsView';
import { LoginPage } from './components/auth/LoginPage';
import { AssetFileView } from './components/assets/AssetFileView';
import { ToolsView } from './components/tools/ToolsView';
import { ContentDraftView } from './components/drafts/ContentDraftView';
import { MobileLayout, MobileTab } from './components/mobile/MobileLayout';
import { MobileCalendarView } from './components/mobile/MobileCalendarView';
import { MobileTaskView } from './components/mobile/MobileTaskView';
import { MobileHomeView } from './components/mobile/MobileHomeView';
import { PublicDocumentSigningView } from './components/documents/PublicDocumentSigningView';

type NavigationTab = 'home' | 'calendar' | 'drafts' | 'tasks' | 'assets' | 'tools' | 'accounts' | 'settings' | 'reports' | 'automation' | 'ai';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('liva_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('calendar');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mobile Viewport Detection (Screens < 768px)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Core Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [drafts, setDrafts] = useState<ContentDraftItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);

  // Application Settings (Configurable App & Website Name)
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const loadSettings = useCallback(async () => {
    try {
      const data = await appApi.getSettings<Partial<AppSettings>>('liva_app_settings');
      if (data && typeof data === 'object') {
        const merged: AppSettings = {
          general: { ...DEFAULT_SETTINGS.general, ...(data.general || {}) },
          contentWorkflow: { ...DEFAULT_SETTINGS.contentWorkflow, ...(data.contentWorkflow || {}) },
          tasksWorkflow: { ...DEFAULT_SETTINGS.tasksWorkflow, ...(data.tasksWorkflow || {}) },
          system: { ...DEFAULT_SETTINGS.system, ...(data.system || {}) },
        };
        setAppSettings(merged);
        if (merged.general?.appName) {
          document.title = merged.general.appName;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat pengaturan aplikasi:', e);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Dynamic Website / Browser Tab Title
  useEffect(() => {
    const title = appSettings.general?.appName || 'Liva Agency Hub';
    document.title = title;
  }, [appSettings.general?.appName]);

  // Database Connection
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem (Logout)?')) {
      localStorage.removeItem('liva_user_session');
      setCurrentUser(null);
      showToast('Anda telah berhasil keluar dari sistem.', 'success');
    }
  };

  // Database status check
  const checkDatabase = async () => {
    setCheckingDb(true);
    try {
      const data = await appApi.getDbStatus();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        success: false,
        message: err.message || 'Gagal menghubungi server database',
        latencyMs: 0,
      });
    } finally {
      setCheckingDb(false);
    }
  };

  // Fetch all core data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData, postsData, brandsData, pillarsData, accountsData, draftsData] = await Promise.all([
        appApi.getProjects(),
        appApi.getTasks(),
        appApi.getContentPosts(),
        appApi.getBrands(),
        appApi.getPillars(),
        appApi.getAccounts().catch(() => []),
        appApi.getDrafts().catch(() => []),
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setPosts(postsData);
      setDrafts(draftsData);
      setBrands(brandsData);
      setPillars(pillarsData);
      setAccounts(accountsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast(err.message || 'Gagal memuat data dari database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkDatabase();
    loadAllData();
  }, [loadAllData]);

  // Content Post Actions
  const handleSavePost = async (postData: Partial<ContentPost>) => {
    try {
      if (postData.id && !postData.id.startsWith('demo-')) {
        await appApi.updateContentPost(postData.id, postData);
        showToast('Event updated successfully');
      } else {
        const payload = { ...postData };
        if (payload.id?.startsWith('demo-')) delete payload.id;
        await appApi.createContentPost(payload);
        showToast('New event scheduled');
      }
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save event', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      if (!id.startsWith('demo-') && !id.startsWith('ref-')) {
        await appApi.deleteContentPost(id);
      }
      showToast('Konten berhasil dihapus');
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus konten', 'error');
    }
  };

  const handleDeleteMonthPosts = async (year: number, month: number) => {
    try {
      await appApi.deleteContentPostsBulk({ scope: 'month', year, month });
      showToast(`Data konten bulan ${month}/${year} berhasil dibersihkan`);
      setPosts((prev) => prev.filter((p) => {
        if (!p.scheduled_at) return true;
        const d = new Date(p.scheduled_at);
        return !(d.getFullYear() === year && (d.getMonth() + 1) === month);
      }));
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus data konten bulan ini', 'error');
    }
  };

  const handleDeleteAllPosts = async () => {
    try {
      await appApi.deleteContentPostsBulk({ scope: 'all' });
      showToast('Semua data konten kalender berhasil dihapus');
      setPosts([]);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus semua data konten', 'error');
    }
  };

  const handleUpdateContentStatus = async (id: string, status: ContentStatus) => {
    try {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      if (!id.startsWith('demo-')) {
        await appApi.updateContentPostStatus(id, status);
      }
      showToast('Post status updated');
    } catch (err: any) {
      showToast('Failed to update status', 'error');
      loadAllData();
    }
  };

  // Pillar Actions
  const handleSavePillar = async (pillarData: Partial<ContentPillar>) => {
    try {
      if (pillarData.id && !pillarData.id.startsWith('demo-')) {
        await appApi.updatePillar(pillarData.id, pillarData);
        showToast('Pillar konten berhasil diperbarui');
      } else {
        await appApi.createPillar(pillarData);
        showToast('Pillar konten baru berhasil ditambahkan');
      }
      const updatedPillars = await appApi.getPillars();
      setPillars(updatedPillars);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pillar konten', 'error');
    }
  };

  const handleDeletePillar = async (id: string) => {
    try {
      await appApi.deletePillar(id);
      showToast('Pillar konten berhasil dihapus');
      setPillars((prev) => prev.filter((p) => p.id !== id));
      const updatedPillars = await appApi.getPillars();
      setPillars(updatedPillars);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus pillar konten', 'error');
    }
  };

  // Brand Actions (Add, Edit, Delete)
  const handleSaveBrand = async (brandData: Partial<Brand>) => {
    try {
      if (brandData.id && !brandData.id.startsWith('demo-')) {
        await appApi.updateBrand(brandData.id, brandData);
        showToast('Brand berhasil diperbarui');
      } else {
        await appApi.createBrand(brandData);
        showToast('Brand baru berhasil ditambahkan');
      }
      const updatedBrands = await appApi.getBrands();
      setBrands(updatedBrands);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan brand', 'error');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await appApi.deleteBrand(id);
      showToast('Brand berhasil dihapus');
      setBrands((prev) => prev.filter((b) => b.id !== id));
      const updatedBrands = await appApi.getBrands();
      setBrands(updatedBrands);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus brand', 'error');
    }
  };

  // Content Draft Actions (Bank Ide & Referensi)
  const handleSaveDraft = async (draftData: Partial<ContentDraftItem>) => {
    try {
      if (draftData.id && !draftData.id.startsWith('demo-')) {
        await appApi.updateDraft(draftData.id, draftData);
        showToast('Draft ide konten berhasil diperbarui');
      } else {
        await appApi.createDraft(draftData);
        showToast('Ide konten baru berhasil ditambahkan');
      }
      const updatedDrafts = await appApi.getDrafts();
      setDrafts(updatedDrafts);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan ide konten', 'error');
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await appApi.deleteDraft(id);
      showToast('Draft ide konten berhasil dihapus');
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      const updatedDrafts = await appApi.getDrafts();
      setDrafts(updatedDrafts);
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus draft ide konten', 'error');
    }
  };

  const handleScheduleDraft = async (
    id: string,
    payload: { scheduled_at: string; brand_id?: string; platform?: string; content_type?: string }
  ) => {
    try {
      await appApi.scheduleDraftToCalendar(id, payload);
      showToast('Ide konten berhasil dijadwalkan ke Kalender Konten!');
      const [updatedPosts, updatedDrafts] = await Promise.all([
        appApi.getContentPosts(),
        appApi.getDrafts(),
      ]);
      setPosts(updatedPosts);
      setDrafts(updatedDrafts);
    } catch (err: any) {
      showToast(err.message || 'Gagal menjadwalkan ide konten ke kalender', 'error');
    }
  };

  // Task Actions
  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (taskData.id) {
        await appApi.updateTask(taskData.id, taskData);
        showToast('Task updated');
      } else {
        await appApi.createTask(taskData);
        showToast('Task created');
      }
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save task', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await appApi.deleteTask(id);
      showToast('Task deleted');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      await appApi.updateTaskStatus(id, status);
      showToast('Task status updated');
    } catch (err: any) {
      showToast('Failed to update status', 'error');
      loadAllData();
    }
  };

  // Project Actions
  const handleSaveProject = async (projectData: Partial<Project>) => {
    try {
      if (projectData.id) {
        await appApi.updateProject(projectData.id, projectData);
        showToast('Project updated');
      } else {
        await appApi.createProject(projectData);
        showToast('Project created');
      }
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save project', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await appApi.deleteProject(id);
      showToast('Project deleted');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete project', 'error');
    }
  };

  // User Account Actions
  const handleSaveAccount = async (accountData: Partial<UserAccount>) => {
    try {
      if (accountData.id) {
        await appApi.updateAccount(accountData.id, accountData);
        showToast('Akun berhasil diperbarui');
      } else {
        await appApi.createAccount(accountData);
        showToast('Akun baru berhasil dibuat');
      }
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan akun', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await appApi.deleteAccount(id);
      showToast('Akun berhasil dihapus');
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus akun', 'error');
    }
  };

  // Check for external public document signing token in URL (?sign_token=... or #sign?sign_token=...)
  const [publicSignToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromQuery = urlParams.get('sign_token');
    if (tokenFromQuery) return tokenFromQuery;

    if (window.location.hash.includes('sign_token=')) {
      const hashParts = window.location.hash.split('?');
      if (hashParts[1]) {
        return new URLSearchParams(hashParts[1]).get('sign_token');
      }
    }
    return null;
  });

  if (publicSignToken) {
    return <PublicDocumentSigningView token={publicSignToken} />;
  }

  if (!currentUser) {
    return (
      <>
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        )}
        <LoginPage
          appName={appSettings.general?.appName}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            showToast(`Selamat datang kembali, ${user.full_name}!`, 'success');
          }}
          dbConnected={dbStatus?.success !== false}
        />
      </>
    );
  }

  const renderDbModal = () => {
    if (!showDbModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Status Database MySQL (Hostinger)
              </h3>
            </div>
            <button
              onClick={() => setShowDbModal(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Status Koneksi:</span>
              <span className={`font-bold flex items-center gap-1.5 ${dbStatus?.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                {dbStatus?.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Terhubung
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" /> Gagal
                  </>
                )}
              </span>
            </div>

            {dbStatus?.success && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Database:</span>
                  <span className="font-mono font-semibold">{dbStatus.database}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host:</span>
                  <span className="font-mono font-semibold">{dbStatus.host || '153.92.15.31'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Latency:</span>
                  <span className="font-mono font-semibold text-emerald-600">{dbStatus.latencyMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Tabel:</span>
                  <span className="font-mono font-semibold">{dbStatus.tablesCount || 10} tabel</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Database MySQL Hostinger siap digunakan untuk sinkronisasi Content Calendar & Task Management.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={checkDatabase}
              disabled={checkingDb}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {checkingDb ? 'Memeriksa...' : 'Test Ulang'}
            </button>
            <button
              onClick={() => setShowDbModal(false)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- MOBILE SCREEN RENDER (Screens < 768px matching Native App Design) ---
  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col bg-[#fbfbfb] text-slate-800 font-sans antialiased overflow-hidden select-none">
        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-rose-600 text-white shadow-rose-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <MobileLayout
          activeTab={activeTab as MobileTab}
          onTabChange={(tab) => setActiveTab(tab as NavigationTab)}
          currentUser={currentUser}
          appSettings={appSettings}
          taskCount={tasks.length}
          draftCount={posts.filter((p) => p.status !== 'scheduled' && p.status !== 'published').length}
          dbStatus={dbStatus}
          onOpenDbModal={() => setShowDbModal(true)}
          onLogout={handleLogout}
        >
          {activeTab === 'calendar' ? (
            <MobileCalendarView
              posts={posts}
              brands={brands}
              pillars={pillars}
              accounts={accounts}
              onSavePost={handleSavePost}
              onDeletePost={handleDeletePost}
              onUpdateStatus={handleUpdateContentStatus}
            />
          ) : activeTab === 'drafts' ? (
            <div className="p-2 pb-16">
              <ContentDraftView
                posts={posts}
                brands={brands}
                projects={projects}
                pillars={pillars}
                accounts={accounts}
                onSavePost={handleSavePost}
                onDeletePost={handleDeletePost}
                onSaveBrand={handleSaveBrand}
                onDeleteBrand={handleDeleteBrand}
                onUpdateStatus={handleUpdateContentStatus}
                onOpenCalendar={() => setActiveTab('calendar')}
              />
            </div>
          ) : activeTab === 'tasks' ? (
            <MobileTaskView
              tasks={tasks}
              projects={projects}
              brands={brands}
              accounts={accounts}
              currentUser={currentUser}
              onSaveTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
            />
          ) : activeTab === 'home' ? (
            <MobileHomeView
              currentUser={currentUser}
              posts={posts}
              tasks={tasks}
              onNavigate={(tab) => setActiveTab(tab as NavigationTab)}
            />
          ) : activeTab === 'assets' ? (
            <div className="p-2 pb-16">
              <AssetFileView
                brands={brands}
                projects={projects}
                posts={posts}
                tasks={tasks}
                currentUser={currentUser}
                onOpenCalendar={() => setActiveTab('calendar')}
              />
            </div>
          ) : activeTab === 'tools' ? (
            <div className="pb-16 h-full flex flex-col">
              <ToolsView
                currentUser={currentUser}
                onNavigateToAssets={() => setActiveTab('assets')}
              />
            </div>
          ) : activeTab === 'accounts' ? (
            currentUser?.role === 'Master Admin' ? (
              <div className="p-3 pb-16">
                <AccountManagementView
                  accounts={accounts}
                  onSaveAccount={handleSaveAccount}
                  onDeleteAccount={handleDeleteAccount}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Akses Terbatas: Hanya Master Admin
              </div>
            )
          ) : activeTab === 'settings' ? (
            currentUser?.role === 'Master Admin' ? (
              <div className="p-3 pb-16">
                <SettingsView
                  currentUser={currentUser}
                  dbStatus={dbStatus}
                  onCheckDb={checkDatabase}
                  checkingDb={checkingDb}
                  onNavigateToAccounts={() => setActiveTab('accounts')}
                  appSettings={appSettings}
                  onSettingsSaved={(newSettings) => {
                    setAppSettings(newSettings);
                    if (newSettings.general?.appName) {
                      document.title = newSettings.general.appName;
                    }
                  }}
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Akses Terbatas: Hanya Master Admin
              </div>
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 capitalize">{activeTab}</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed max-w-xs">
                Modul ini terhubung dengan Content Calendar dan Task Management tim Anda.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Buka Kalender
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Buka Tasks
                </button>
              </div>
            </div>
          )}
        </MobileLayout>

        {renderDbModal()}
      </div>
    );
  }

  // --- DESKTOP SCREEN RENDER (Screens >= 768px) ---
  return (
    <div className="h-screen w-screen flex bg-[#fbfbfb] text-slate-800 font-sans antialiased overflow-hidden select-none">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center space-x-2 transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-rose-600 text-white shadow-rose-500/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar (Matching Reference Image) */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-16'
        } shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between p-3.5 transition-all duration-300 z-30`}
      >
        {/* Top Part */}
        <div className="space-y-4">
          {/* Workspace Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] text-white flex items-center justify-center font-bold shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              {isSidebarOpen && (
                <div 
                  onClick={() => currentUser?.role === 'Master Admin' ? setActiveTab('settings') : null}
                  className="flex items-center gap-1 cursor-pointer hover:opacity-80 min-w-0 max-w-[140px]"
                  title={appSettings.general?.appName || 'Liva Agency Hub'}
                >
                  <span className="font-bold text-sm text-slate-900 tracking-tight truncate">
                    {appSettings.general?.appName || 'Liva Agency Hub'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              )}
            </div>

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Toggle sidebar"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Quick Actions Search Box */}
          {isSidebarOpen ? (
            <div className="px-3 py-2 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-400 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <span className="text-slate-500 font-medium text-[11px]">Quick actions</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          ) : (
            <div className="flex justify-center">
              <kbd className="px-1.5 py-1 text-[10px] font-semibold bg-slate-100 border border-slate-200 rounded text-slate-500">
                ⌘K
              </kbd>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {/* Home */}
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              {isSidebarOpen && <span>Home</span>}
            </button>

            {/* Calendar */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-slate-600" />
              {isSidebarOpen && <span>Calender Content</span>}
            </button>

            {/* Draft Konten (Bank Ide & Referensi) */}
            <button
              onClick={() => setActiveTab('drafts')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'drafts'
                  ? 'bg-amber-50 text-amber-900 font-semibold shadow-2xs border border-amber-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className={`w-4 h-4 ${activeTab === 'drafts' ? 'text-amber-600' : 'text-slate-500'}`} />
                {isSidebarOpen && <span>Draft Konten</span>}
              </div>
              {isSidebarOpen && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  activeTab === 'drafts'
                    ? 'bg-amber-200/70 text-amber-800'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}>
                  {posts.filter((p) => p.status !== 'scheduled' && p.status !== 'published').length}
                </span>
              )}
            </button>

            {/* Task (With badge in screenshot) */}
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                {isSidebarOpen && <span>Task</span>}
              </div>
              {isSidebarOpen && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                  {tasks.length || 8}
                </span>
              )}
            </button>

            {/* Asset File */}
            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderArchive className="w-4 h-4 text-slate-500" />
                {isSidebarOpen && <span>Asset File</span>}
              </div>
            </button>

            {/* Tools (TTD PDF) */}
            <button
              onClick={() => setActiveTab('tools')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-emerald-600" />
                {isSidebarOpen && <span>Tools</span>}
              </div>
              {isSidebarOpen && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  TTD PDF
                </span>
              )}
            </button>

            {/* Manajemen Akun (Hanya Master Admin) */}
            {currentUser?.role === 'Master Admin' && (
              <button
                onClick={() => setActiveTab('accounts')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'accounts'
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-slate-500" />
                  {isSidebarOpen && <span>Manajemen Akun</span>}
                </div>
                {isSidebarOpen && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {accounts.length}
                  </span>
                )}
              </button>
            )}

            {/* Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-slate-500" />
              {isSidebarOpen && <span>Reports</span>}
            </button>

            {/* Automation */}
            <button
              onClick={() => setActiveTab('automation')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'automation'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Zap className="w-4 h-4 text-slate-500" />
              {isSidebarOpen && <span>Automation</span>}
            </button>

            {/* New AI Features */}
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-emerald-600 hover:bg-emerald-50/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {isSidebarOpen && <span>New AI Features</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          {/* Help & Settings */}
          <div className="space-y-1">
            <button
              onClick={() => alert('Liva Help Center & Documentation')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              {isSidebarOpen && <span>Help</span>}
            </button>

            {/* Settings (Only accessible by Master Admin) */}
            {currentUser?.role === 'Master Admin' ? (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-purple-50 text-purple-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title="Pengaturan Aplikasi (Master Admin)"
              >
                <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-purple-600' : 'text-slate-500'}`} />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Settings</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold uppercase tracking-wider">
                      Master
                    </span>
                  </div>
                )}
              </button>
            ) : (
              <button
                disabled
                title="Pengaturan aplikasi hanya dapat diakses oleh Master Admin"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400/80 cursor-not-allowed bg-slate-50/50"
              >
                <Lock className="w-4 h-4 text-slate-400" />
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Settings</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 font-medium">
                      Terkunci
                    </span>
                  </div>
                )}
              </button>
            )}

            {/* DB Status Badge (Clickable for diagnostics) */}
            <button
              onClick={() => {
                setShowDbModal(true);
                checkDatabase();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] text-slate-500 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60 cursor-pointer"
              title="Click to check MySQL Connection"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${dbStatus?.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                {isSidebarOpen && (
                  <span className="font-medium text-slate-600">
                    {dbStatus?.success ? 'MySQL Live' : 'DB Offline'}
                  </span>
                )}
              </div>
              {isSidebarOpen && dbStatus?.latencyMs !== undefined && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {dbStatus.latencyMs}ms
                </span>
              )}
            </button>

            {/* User Profile & Logout Button */}
            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {currentUser?.full_name
                    ? currentUser.full_name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'AD'}
                </div>
                {isSidebarOpen && (
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate leading-tight">
                      {currentUser?.full_name || 'Admin User'}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                      <span className={`font-semibold ${currentUser?.role === 'Master Admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {currentUser?.role || 'Team'}
                      </span>
                      {currentUser?.position && <span>• {currentUser.position}</span>}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Keluar / Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {activeTab === 'calendar' ? (
          <ContentCalendarView
            posts={posts}
            brands={brands}
            pillars={pillars}
            accounts={accounts}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onDeleteMonthPosts={handleDeleteMonthPosts}
            onDeleteAllPosts={handleDeleteAllPosts}
            onSavePillar={handleSavePillar}
            onDeletePillar={handleDeletePillar}
            onSaveBrand={handleSaveBrand}
            onDeleteBrand={handleDeleteBrand}
            onUpdateStatus={handleUpdateContentStatus}
          />
        ) : activeTab === 'drafts' ? (
          <ContentDraftView
            posts={posts}
            brands={brands}
            projects={projects}
            pillars={pillars}
            accounts={accounts}
            onSavePost={handleSavePost}
            onDeletePost={handleDeletePost}
            onSaveBrand={handleSaveBrand}
            onDeleteBrand={handleDeleteBrand}
            onUpdateStatus={handleUpdateContentStatus}
            onOpenCalendar={() => setActiveTab('calendar')}
          />
        ) : activeTab === 'tasks' ? (
          <ProjectKanbanView
            tasks={tasks}
            projects={projects}
            brands={brands}
            accounts={accounts}
            currentUser={currentUser}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
          />
        ) : activeTab === 'assets' ? (
          <AssetFileView
            brands={brands}
            projects={projects}
            posts={posts}
            tasks={tasks}
            currentUser={currentUser}
            onOpenCalendar={() => setActiveTab('calendar')}
          />
        ) : activeTab === 'tools' ? (
          <ToolsView
            currentUser={currentUser}
            onNavigateToAssets={() => setActiveTab('assets')}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : activeTab === 'accounts' ? (
          currentUser?.role === 'Master Admin' ? (
            <AccountManagementView
              accounts={accounts}
              onSaveAccount={handleSaveAccount}
              onDeleteAccount={handleDeleteAccount}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Akses Terbatas: Hanya Master Admin
              </h2>
              <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
                Menu Manajemen Akun hanya dapat diakses dan dikelola oleh <strong className="text-purple-700 font-semibold">Master Admin</strong>. Akun Anda saat ini memiliki peran <strong className="text-slate-700 font-semibold">{currentUser?.role || 'Team'}</strong>.
              </p>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Kembali ke Kalender
              </button>
            </div>
          )
        ) : activeTab === 'settings' ? (
          currentUser?.role === 'Master Admin' ? (
            <SettingsView
              currentUser={currentUser}
              dbStatus={dbStatus}
              onCheckDb={checkDatabase}
              checkingDb={checkingDb}
              onNavigateToAccounts={() => setActiveTab('accounts')}
              appSettings={appSettings}
              onSettingsSaved={(newSettings) => {
                setAppSettings(newSettings);
                if (newSettings.general?.appName) {
                  document.title = newSettings.general.appName;
                }
              }}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Akses Terbatas: Hanya Master Admin
              </h2>
              <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
                Menu pengaturan konfigurasi aplikasi ini hanya dapat diakses oleh akun dengan wewenang <strong className="text-purple-700 font-semibold">Master Admin</strong>. Akun Anda saat ini memiliki peran <strong className="text-slate-700 font-semibold">{currentUser?.role || 'User'}</strong>.
              </p>
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
              >
                Kembali ke Content Calendar
              </button>
            </div>
          )
        ) : (
          /* Placeholder View for Home, Reports, Automation, AI with Quick Link */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab === 'ai' ? 'AI Assistant Hub' : activeTab}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mt-1 mb-5 leading-relaxed">
              Modul ini terhubung dengan Content Calendar dan Task Management karyawan Anda.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('calendar')}
                className="px-4 py-2 bg-[#4f46e5] text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 shadow-xs transition-colors"
              >
                Buka Content Calendar
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 shadow-xs transition-colors"
              >
                Buka Project & Tasks
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MySQL Connection Diagnostics Modal */}
      {renderDbModal()}
    </div>
  );
}

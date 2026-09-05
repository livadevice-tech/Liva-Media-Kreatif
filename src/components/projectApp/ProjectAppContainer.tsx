import React, { useState, useEffect, useCallback } from 'react';
import { AppHeader, ActiveTab } from './AppHeader';
import { DashboardOverview } from './DashboardOverview';
import { ProjectKanbanView } from './ProjectKanbanView';
import { SocialAccountsView } from './SocialAccountsView';
import { ContentCalendarView } from './ContentCalendarView';
import { BrandsView } from './BrandsView';
import { projectAppApi } from '../../services/projectAppApi';
import { Brand, SocialAccount, Project, Task, ContentPost, ContentPillar, DashboardStats, TaskStatus, ContentStatus } from '../../types/projectApp';

export const ProjectAppContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [pillars, setPillars] = useState<ContentPillar[]>([]);

  // Toast message
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, brandsData, accountsData, projectsData, tasksData, postsData, pillarsData] = await Promise.all([
        projectAppApi.getStats(),
        projectAppApi.getBrands(),
        projectAppApi.getSocialAccounts(),
        projectAppApi.getProjects(),
        projectAppApi.getTasks(),
        projectAppApi.getContentPosts(),
        projectAppApi.getContentPillars(),
      ]);

      setStats(statsData);
      setBrands(brandsData);
      setAccounts(accountsData);
      setProjects(projectsData);
      setTasks(tasksData);
      setPosts(postsData);
      setPillars(pillarsData);
    } catch (err: any) {
      console.error('Error loading data:', err);
      showToast(err.message || 'Gagal memuat data dari database', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Task actions
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await projectAppApi.updateTaskStatus(taskId, newStatus);
      showToast('Status task berhasil diperbarui');
      projectAppApi.getStats().then(setStats);
    } catch (err: any) {
      showToast('Gagal mengubah status task', 'error');
      loadData();
    }
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    try {
      if (data.id) {
        await projectAppApi.updateTask(data.id, data);
        showToast('Task berhasil diupdate');
      } else {
        await projectAppApi.createTask(data);
        showToast('Task baru berhasil dibuat');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await projectAppApi.deleteTask(taskId);
      showToast('Task berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast('Gagal menghapus task', 'error');
    }
  };

  // Project actions
  const handleSaveProject = async (data: Partial<Project>) => {
    try {
      if (data.id) {
        await projectAppApi.updateProject(data.id, data);
        showToast('Proyek berhasil diupdate');
      } else {
        await projectAppApi.createProject(data);
        showToast('Proyek baru berhasil dibuat');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan proyek', 'error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectAppApi.deleteProject(projectId);
      showToast('Proyek berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast('Gagal menghapus proyek', 'error');
    }
  };

  // Social account actions
  const handleSaveAccount = async (data: Partial<SocialAccount>) => {
    try {
      if (data.id) {
        await projectAppApi.updateSocialAccount(data.id, data);
        showToast('Akun media sosial berhasil diperbarui');
      } else {
        await projectAppApi.createSocialAccount(data);
        showToast('Akun media sosial berhasil ditambahkan');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan akun', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await projectAppApi.deleteSocialAccount(id);
      showToast('Akun media sosial berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast('Gagal menghapus akun', 'error');
    }
  };

  // Content post actions
  const handleSavePost = async (data: Partial<ContentPost>) => {
    try {
      if (data.id) {
        await projectAppApi.updateContentPost(data.id, data);
        showToast('Jadwal konten berhasil diperbarui');
      } else {
        await projectAppApi.createContentPost(data);
        showToast('Jadwal konten baru berhasil dibuat');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan konten', 'error');
    }
  };

  const handleUpdateContentStatus = async (postId: string, status: ContentStatus) => {
    try {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
      await projectAppApi.updateContentPostStatus(postId, status);
      showToast('Status postingan berhasil diupdate');
      projectAppApi.getStats().then(setStats);
    } catch (err: any) {
      showToast('Gagal mengubah status', 'error');
      loadData();
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await projectAppApi.deleteContentPost(postId);
      showToast('Postingan berhasil dihapus dari kalender');
      loadData();
    } catch (err: any) {
      showToast('Gagal menghapus postingan', 'error');
    }
  };

  // Brand actions
  const handleSaveBrand = async (data: Partial<Brand>) => {
    try {
      if (data.id) {
        await projectAppApi.updateBrand(data.id, data);
        showToast('Data brand berhasil diupdate');
      } else {
        await projectAppApi.createBrand(data);
        showToast('Brand baru berhasil ditambahkan');
      }
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan brand', 'error');
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await projectAppApi.deleteBrand(id);
      showToast('Brand berhasil dihapus');
      loadData();
    } catch (err: any) {
      showToast('Gagal menghapus brand', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Header */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={(type) => {
          if (type === 'task') setActiveTab('projects');
          else if (type === 'post') setActiveTab('calendar');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-rose-600 shadow-rose-600/30' : 'bg-slate-900 shadow-slate-900/30'
          }`}>
            <span>{toast.type === 'error' ? '⚠️' : '✨'}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            stats={stats}
            loading={loading}
            onNavigate={(tab) => setActiveTab(tab)}
            onTaskClick={() => setActiveTab('projects')}
            onPostClick={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectKanbanView
            projects={projects}
            tasks={tasks}
            brands={brands}
            loading={loading}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onSaveTask={handleSaveTask}
            onDeleteTask={handleDeleteTask}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
          />
        )}

        {activeTab === 'social' && (
          <SocialAccountsView
            accounts={accounts}
            brands={brands}
            loading={loading}
            onSaveAccount={handleSaveAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'calendar' && (
          <ContentCalendarView
            posts={posts}
            brands={brands}
            accounts={accounts}
            pillars={pillars}
            loading={loading}
            onSavePost={handleSavePost}
            onUpdateStatus={handleUpdateContentStatus}
            onDeletePost={handleDeletePost}
          />
        )}

        {activeTab === 'brands' && (
          <BrandsView
            brands={brands}
            loading={loading}
            onSaveBrand={handleSaveBrand}
            onDeleteBrand={handleDeleteBrand}
          />
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import {
  Kanban,
  List,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  CheckSquare,
  Clock,
  AlertTriangle,
  FolderArchive,
  RefreshCw,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskViewMode,
  TaskFilterState,
} from './types';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskListView } from './TaskListView';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskFormModal } from './TaskFormModal';
import { loadTasksFromStorage, saveTasksToStorage } from './taskStorage';

interface TaskManagerProps {
  hosts?: { id: string; name: string }[];
  adminAccounts?: { id: string; name: string; username?: string }[];
  clientBrands?: { id: string; name: string; companyName?: string }[];
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  hosts = [],
  adminAccounts = [],
  clientBrands = [],
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<TaskViewMode>('card');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPIC, setFilterPIC] = useState<string>('all');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [defaultStatusForNew, setDefaultStatusForNew] = useState<TaskStatus>('todo');

  // Load tasks on mount
  useEffect(() => {
    let isMounted = true;
    loadTasksFromStorage().then((data) => {
      if (isMounted) {
        setTasks(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync tasks changes to storage
  const updateTasksState = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    saveTasksToStorage(newTasks);
  };

  // Prepare PIC candidates from hosts and adminAccounts
  const availablePICs = useMemo(() => {
    const list: { id: string; name: string; role?: string }[] = [];

    // Admins
    adminAccounts.forEach((adm) => {
      list.push({
        id: `admin-${adm.id}`,
        name: adm.name || adm.username || 'Admin',
        role: 'Admin',
      });
    });

    // Hosts / Streamers
    hosts.forEach((h) => {
      list.push({
        id: `host-${h.id}`,
        name: h.name,
        role: 'Host / Streamer',
      });
    });

    return list;
  }, [hosts, adminAccounts]);

  // Extract distinct categories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [tasks]);

  // Extract distinct PIC names from tasks
  const availablePICNames = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      t.picNames?.forEach((p) => names.add(p));
    });
    return Array.from(names);
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const todayStr = new Date().toISOString().substring(0, 10);

    return tasks.filter((task) => {
      // Archive filter
      if (!showArchived && task.status === 'archived' && filterStatus !== 'archived') {
        return false;
      }
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) {
        return false;
      }

      // Category filter
      if (filterCategory !== 'all' && task.category !== filterCategory) {
        return false;
      }

      // PIC filter
      if (filterPIC !== 'all') {
        const hasPIC = task.picNames?.some((p) => p.toLowerCase().includes(filterPIC.toLowerCase()));
        if (!hasPIC) return false;
      }

      // Search query filter
      if (q) {
        const inTitle = task.title.toLowerCase().includes(q);
        const inDesc = task.description?.toLowerCase().includes(q);
        const inCategory = task.category?.toLowerCase().includes(q);
        const inPIC = task.picNames?.some((p) => p.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inCategory && !inPIC) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory, filterPIC, showArchived]);

  // Metrics KPI Calculation
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const activeTasks = tasks.filter((t) => t.status !== 'archived');
    const todo = activeTasks.filter((t) => t.status === 'todo').length;
    const inProgress = activeTasks.filter((t) => t.status === 'in_progress').length;
    const inReview = activeTasks.filter((t) => t.status === 'in_review').length;
    const done = activeTasks.filter((t) => t.status === 'done').length;
    const overdue = activeTasks.filter(
      (t) => t.deadline && t.deadline < todayStr && t.status !== 'done'
    ).length;

    return {
      total: activeTasks.length,
      todo,
      inProgress,
      inReview,
      done,
      overdue,
    };
  }, [tasks]);

  // CRUD Handlers
  const handleCreateNewTask = (prefillStatus: TaskStatus = 'todo', prefillDate?: string) => {
    setEditingTask(prefillDate ? {
      id: '',
      title: '',
      status: prefillStatus,
      priority: 'moderate',
      deadline: prefillDate,
      checklist: [],
      fileLinks: [],
      createdAt: '',
      updatedAt: '',
    } : null);
    setDefaultStatusForNew(prefillStatus);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  const handleSaveTask = (savedTask: TaskItem) => {
    const exists = tasks.some((t) => t.id === savedTask.id);
    let updatedList: TaskItem[];
    if (exists) {
      updatedList = tasks.map((t) => (t.id === savedTask.id ? savedTask : t));
    } else {
      updatedList = [savedTask, ...tasks];
    }
    updateTasksState(updatedList);
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedList = tasks.filter((t) => t.id !== taskId);
    updateTasksState(updatedList);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updatedList = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
    );
    updateTasksState(updatedList);
  };

  const activeFiltersCount =
    (filterStatus !== 'all' ? 1 : 0) +
    (filterPriority !== 'all' ? 1 : 0) +
    (filterCategory !== 'all' ? 1 : 0) +
    (filterPIC !== 'all' ? 1 : 0) +
    (showArchived ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterPriority('all');
    setFilterCategory('all');
    setFilterPIC('all');
    setShowArchived(false);
  };

  return (
    <div className="w-full space-y-4 animate-fadeIn font-sans pb-16">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <CheckSquare className="w-4 h-4" />
              </span>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Task Management & Operasional Tim
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pantau jadwal deadline, progres to-do list, file brief siaran, dan PIC tim dalam 3 tampilan fleksibel.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-center shrink-0">
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Task</div>
              <div className="text-sm font-black text-slate-800">{metrics.total}</div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-3 py-1.5 text-center shrink-0">
              <div className="text-[10px] font-bold text-blue-600 uppercase">On Progress</div>
              <div className="text-sm font-black text-blue-800">{metrics.inProgress}</div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-1.5 text-center shrink-0">
              <div className="text-[10px] font-bold text-amber-600 uppercase">In Review</div>
              <div className="text-sm font-black text-amber-800">{metrics.inReview}</div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl px-3 py-1.5 text-center shrink-0">
              <div className="text-[10px] font-bold text-emerald-600 uppercase">Completed</div>
              <div className="text-sm font-black text-emerald-800">{metrics.done}</div>
            </div>

            {metrics.overdue > 0 && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 text-center shrink-0">
                <div className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1 justify-center">
                  <AlertTriangle className="w-3 h-3" /> Overdue
                </div>
                <div className="text-sm font-black text-rose-800">{metrics.overdue}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Control Bar: Views + Search + Filters + New Task */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: 3 View Tabs (Card / List / Calender) matching screenshot */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>List</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calender</span>
          </button>
        </div>

        {/* Right: Search, Filter, New Task Button */}
        <div className="flex items-center gap-2 flex-wrap flex-1 md:flex-initial justify-end">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown Toggle Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                activeFiltersCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown Content */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-40 animate-fadeIn text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-black text-slate-800 text-xs">Filter Task</span>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] text-indigo-600 hover:underline font-bold"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Prioritas</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="urgent">Urgent Priority</option>
                    <option value="moderate">Moderate Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="all">Semua Status</option>
                    <option value="todo">To-do</option>
                    <option value="in_progress">On Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Completed</option>
                    <option value="archived">Arsip</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Kategori</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="all">Semua Kategori</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* PIC */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">PIC (Tim)</label>
                  <select
                    value={filterPIC}
                    onChange={(e) => setFilterPIC(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                  >
                    <option value="all">Semua PIC</option>
                    {availablePICNames.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Include Archive Toggle */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">Tampilkan Arsip</span>
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* "+ New Task" Button */}
          <button
            type="button"
            onClick={() => handleCreateNewTask('todo')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Task</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'card' && (
        <TaskKanbanView
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          onAddTaskToStatus={(st) => handleCreateNewTask(st)}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onDeleteTask={handleDeleteTask}
          showArchivedColumn={showArchived}
        />
      )}

      {viewMode === 'list' && (
        <TaskListView
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          onUpdateTaskStatus={handleUpdateTaskStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {viewMode === 'calendar' && (
        <TaskCalendarView
          tasks={filteredTasks}
          onEditTask={handleEditTask}
          onAddTaskWithDate={(dateStr) => handleCreateNewTask('todo', dateStr)}
        />
      )}

      {/* Task CRUD Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialTask={editingTask}
        defaultStatus={defaultStatusForNew}
        availablePICs={availablePICs}
      />
    </div>
  );
};

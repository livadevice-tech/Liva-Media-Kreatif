import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  User, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  ArrowRight,
  SlidersHorizontal,
  FolderKanban,
  CheckCircle2,
  Kanban,
  List,
  Clock,
  X,
  Lock
} from 'lucide-react';
import { Task, Project, Brand, TaskStatus, TaskPriority, UserAccount } from '../../types/app';
import { TaskInspectorPanel } from '../projects/TaskInspectorPanel';
import { TaskCalendarView } from '../projects/TaskCalendarView';
import { getDeadlineInfo } from '../../utils/taskDate';

interface MobileTaskViewProps {
  tasks: Task[];
  projects: Project[];
  brands: Brand[];
  accounts?: UserAccount[];
  currentUser?: UserAccount | null;
  onSaveTask: (task: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onUpdateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  onSaveProject: (project: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

const STATUS_TABS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'TO DO' },
  { id: 'in_progress', label: 'IN PROGRESS' },
  { id: 'review', label: 'REVIEW' },
  { id: 'done', label: 'COMPLETED' },
];

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: 'in_progress',
  in_progress: 'review',
  review: 'done',
  done: 'todo'
};

const PRIORITY_BADGES: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  high: { label: 'High', className: 'bg-amber-50 text-amber-700 border border-amber-200 font-semibold' },
  urgent: { label: 'Urgent', className: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' },
};

export const MobileTaskView: React.FC<MobileTaskViewProps> = ({
  tasks,
  projects,
  brands,
  accounts = [],
  currentUser,
  onSaveTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onSaveProject,
  onDeleteProject,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<'all' | 'me'>('all');
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'calendar'>('board');
  const [activeStatus, setActiveStatus] = useState<TaskStatus>('todo');

  // Task Inspector Drawer / Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);

  // Helper to check if assigned to me
  const isTaskAssignedToMe = (task: Task): boolean => {
    if (!currentUser || !task.assignee_name) return false;
    const raw = task.assignee_name.toLowerCase();
    if (currentUser.full_name) {
      const fn = currentUser.full_name.toLowerCase().trim();
      if (fn && raw.includes(fn)) return true;
      const first = fn.split(/[\s(]/)[0]?.trim();
      if (first && first.length >= 3 && raw.includes(first)) return true;
    }
    if (currentUser.username) {
      const un = currentUser.username.toLowerCase().trim();
      if (un && raw.includes(un)) return true;
    }
    return false;
  };

  // Count assigned to me
  const myAssignedCount = useMemo(() => {
    return tasks.filter(t => isTaskAssignedToMe(t)).length;
  }, [tasks, currentUser]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Keamanan visibilitas: task private hanya untuk Master Admin
      if (task.visibility === 'private' && currentUser?.role !== 'Master Admin') {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchAssignee = task.assignee_name?.toLowerCase().includes(q);
        const matchTags = task.tags?.toLowerCase().includes(q);
        const matchProject = task.project_title?.toLowerCase().includes(q);
        if (!matchTitle && !matchAssignee && !matchTags && !matchProject) return false;
      }
      // Project
      if (selectedProjectId !== 'all' && task.project_id !== selectedProjectId) {
        return false;
      }
      // Assignee
      if (assigneeFilter === 'me' && !isTaskAssignedToMe(task)) {
        return false;
      }
      return true;
    });
  }, [tasks, searchQuery, selectedProjectId, assigneeFilter, currentUser]);

  // Counts by status
  const countsByStatus = useMemo(() => {
    const counts: Record<TaskStatus, number> = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };
    filteredTasks.forEach(task => {
      if (counts[task.status] !== undefined) {
        counts[task.status]++;
      }
    });
    return counts;
  }, [filteredTasks]);

  // Tasks for current status tab in Board mode
  const currentStatusTasks = useMemo(() => {
    return filteredTasks.filter(t => t.status === activeStatus);
  }, [filteredTasks, activeStatus]);

  // Format Due Date for cards (e.g. "09-18")
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      // If YYYY-MM-DD, extract MM-DD
      const parts = dateStr.slice(0, 10).split('-');
      if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Assignee initial
  const getAssigneeInitial = (name?: string) => {
    if (!name) return 'G';
    const first = name.trim().split(/[\s,]/)[0];
    return first ? first[0].toUpperCase() : 'G';
  };

  const handleOpenNewTask = () => {
    setEditingTask({
      project_id: selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || '',
      status: activeStatus,
      priority: 'medium',
      due_date: new Date().toISOString().slice(0, 10),
    });
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleQuickAdvance = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = NEXT_STATUS[task.status];
    await onUpdateTaskStatus(task.id, next);
  };

  const handleQuickDelete = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Hapus task "${task.title}"?`)) {
      await onDeleteTask(task.id);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto animate-in fade-in duration-200">
      {/* 1. HEADER: Title & Total Tasks Badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Tasks & Projects
        </h1>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
          {filteredTasks.length} total tasks
        </span>
      </div>

      {/* 2. SEARCH INPUT (Matching Mockup 2) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, assignees, tags..."
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500 shadow-2xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 3. FILTER ROW: All Projects Dropdown | All | Assign me */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
        {/* Project Selector Dropdown */}
        <div className="relative shrink-0">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="appearance-none bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-slate-700 shadow-2xs focus:outline-blue-500 cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* 'All' Pill */}
        <button
          onClick={() => setAssigneeFilter('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            assigneeFilter === 'all'
              ? 'bg-white border-slate-300 text-slate-900 shadow-2xs'
              : 'bg-white/60 border-slate-200/80 text-slate-500 hover:bg-white'
          }`}
        >
          All
        </button>

        {/* 'Assign me' Pill with Badge */}
        <button
          onClick={() => setAssigneeFilter(assigneeFilter === 'me' ? 'all' : 'me')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
            assigneeFilter === 'me'
              ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold shadow-2xs'
              : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Assign me</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
            {myAssignedCount}
          </span>
        </button>
      </div>

      {/* 4. SEGMENTED VIEW SWITCHER: Board | List | Calendar */}
      <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          onClick={() => setViewMode('board')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'board'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Kanban className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'list'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>List</span>
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            viewMode === 'calendar'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>Calendar</span>
        </button>
      </div>

      {/* 5. ACTION BUTTON: + New Task (Full Width Royal Blue Button) */}
      <button
        onClick={handleOpenNewTask}
        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>New Task</span>
      </button>

      {/* 6. VIEW CONTENT: BOARD / LIST / CALENDAR */}
      {viewMode === 'board' ? (
        <div className="space-y-3.5">
          {/* Status Tabs (Horizontal Scroll / Row) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {STATUS_TABS.map((tab) => {
              const count = countsByStatus[tab.id];
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatus(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'border-2 border-blue-500 text-blue-600 bg-blue-50/70 font-bold shadow-2xs'
                      : 'border border-slate-200/90 text-slate-600 bg-white font-medium hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-blue-200/70 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Task Cards List for Active Status */}
          <div className="space-y-3">
            {currentStatusTasks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs text-slate-700">Tidak Ada Task</div>
                <p className="text-[11px] text-slate-400">
                  Tidak ada task dengan status{' '}
                  <span className="font-semibold text-slate-600">
                    {STATUS_TABS.find(t => t.id === activeStatus)?.label}
                  </span>.
                </p>
                <button
                  onClick={handleOpenNewTask}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  + Tambah Task
                </button>
              </div>
            ) : (
              currentStatusTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleEditTask(task)}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3 cursor-pointer hover:border-blue-300 active:scale-[0.99] transition-all"
                >
                  {/* Top Row: Project Badge, Private Badge & Priority Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100 truncate max-w-[160px]">
                        {task.project_title || 'General Task'}
                      </span>
                      {task.visibility === 'private' && (
                        <span 
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0"
                          title="Private: Khusus Master Admin"
                        >
                          <Lock className="w-2.5 h-2.5 text-purple-600" />
                          <span>Private</span>
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] shrink-0 ${
                        PRIORITY_BADGES[task.priority]?.className || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {PRIORITY_BADGES[task.priority]?.label || 'Low'}
                    </span>
                  </div>

                  {/* Task Title */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {task.title}
                  </h3>

                  {/* Bottom Row: Due Date & Right Action Group */}
                  <div className="flex items-center justify-between pt-1 gap-2">
                    {/* Due Date & Deadline Info */}
                    {(() => {
                      const dInfo = getDeadlineInfo(task.due_date, task.status);
                      return (
                        <div 
                          className="flex items-center gap-1.5 text-xs text-slate-500 font-medium min-w-0"
                          title={task.due_date ? `Deadline: ${task.due_date}${dInfo ? ` (${dInfo.text})` : ''}` : 'No deadline'}
                        >
                          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${dInfo?.isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                          <span className="shrink-0 font-medium text-slate-700">{formatDueDate(task.due_date)}</span>
                          {dInfo && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate ${dInfo.badgeClass}`}>
                              {dInfo.text}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    {/* Right Group: Assignee Avatar, Arrow Next, Delete Trash */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Assignee Avatar */}
                      <div
                        className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs"
                        title={task.assignee_name || 'Unassigned'}
                      >
                        {getAssigneeInitial(task.assignee_name)}
                      </div>

                      {/* Quick Advance Status Arrow */}
                      <button
                        onClick={(e) => handleQuickAdvance(task, e)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title={`Pindah status ke ${NEXT_STATUS[task.status]}`}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {/* Quick Delete */}
                      <button
                        onClick={(e) => handleQuickDelete(task, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List Mode for Mobile */
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs divide-y divide-slate-100">
          {filteredTasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Tidak ada task yang ditemukan.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleEditTask(task)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-xs text-slate-900 truncate">
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                    <span className="text-blue-600 font-medium">
                      {task.project_title || 'General'}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <span>{formatDueDate(task.due_date)}</span>
                      {(() => {
                        const dInfo = getDeadlineInfo(task.due_date, task.status);
                        return dInfo ? (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-medium ${dInfo.badgeClass}`}>
                            {dInfo.text}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                    {task.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={(e) => handleQuickDelete(task, e)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Calendar View for Tasks */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-3 shadow-xs">
          <TaskCalendarView
            tasks={filteredTasks}
            projects={projects}
            onEditTask={(task) => handleEditTask(task)}
            onOpenNewTask={handleOpenNewTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
          />
        </div>
      )}

      {/* 7. TASK INSPECTOR PANEL (Mobile Full Drawer / Modal) */}
      {isTaskModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150"
          onClick={() => setIsTaskModalOpen(false)}
        >
          <div 
            className="relative w-full sm:max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskInspectorPanel
              isOpen={isTaskModalOpen}
              onClose={() => setIsTaskModalOpen(false)}
              onSave={onSaveTask}
              onDelete={onDeleteTask}
              projects={projects}
              task={editingTask}
              defaultStatus={activeStatus}
              accounts={accounts}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}
    </div>
  );
};

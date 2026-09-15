import React, { useState, useMemo } from 'react';
import { 
  Kanban, 
  List, 
  Plus, 
  Search, 
  Filter, 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Tag, 
  ArrowRight, 
  ArrowLeft,
  Edit2, 
  Trash2,
  Calendar,
  ChevronDown,
  Download,
  Lock,
} from 'lucide-react';
import { Task, Project, Brand, TaskStatus, TaskPriority, UserAccount } from '../../types/app';
import { TaskInspectorPanel } from './TaskInspectorPanel';
import { ProjectModal } from './ProjectModal';
import { TaskCalendarView } from './TaskCalendarView';
import { getDeadlineInfo } from '../../utils/taskDate';

interface ProjectKanbanViewProps {
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

const COLUMNS: { id: TaskStatus; title: string; countBadge: string; borderAccent: string }[] = [
  { id: 'todo', title: 'To Do', countBadge: 'bg-slate-100 text-slate-700', borderAccent: 'border-t-slate-400' },
  { id: 'in_progress', title: 'In Progress', countBadge: 'bg-blue-50 text-blue-700', borderAccent: 'border-t-blue-500' },
  { id: 'review', title: 'Review', countBadge: 'bg-purple-50 text-purple-700', borderAccent: 'border-t-purple-500' },
  { id: 'done', title: 'Completed', countBadge: 'bg-emerald-50 text-emerald-700', borderAccent: 'border-t-emerald-500' },
];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; badge: string }> = {
  low: { label: 'Low', badge: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Medium', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  high: { label: 'High', badge: 'bg-amber-50 text-amber-700 border border-amber-200' },
  urgent: { label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' },
};

export const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({
  tasks,
  projects,
  brands,
  accounts,
  currentUser,
  onSaveTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onSaveProject,
  onDeleteProject,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [assigneeScope, setAssigneeScope] = useState<'all' | 'me'>('all');

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);

  // Helper to check if a task is assigned to currentUser
  const isTaskAssignedToMe = (task: Task, user: UserAccount | null | undefined): boolean => {
    if (!user || !task.assignee_name) return false;
    const raw = task.assignee_name.toLowerCase();

    // Check full name
    if (user.full_name) {
      const fn = user.full_name.toLowerCase().trim();
      if (fn && raw.includes(fn)) return true;

      // Also split first name (e.g. "Galang" from "Galang (Head Creative)")
      const firstName = fn.split(/[\s(]/)[0]?.trim();
      if (firstName && firstName.length >= 3 && raw.includes(firstName)) return true;
    }

    // Check username
    if (user.username) {
      const un = user.username.toLowerCase().trim();
      if (un && raw.includes(un)) return true;
    }

    // Check id
    if (user.id && raw.includes(user.id.toLowerCase())) return true;

    return false;
  };

  const myTasksCount = useMemo(() => {
    return tasks.filter((t) => isTaskAssignedToMe(t, currentUser)).length;
  }, [tasks, currentUser]);

  // Filter tasks based on search, project, priority, and assigneeScope (All / Assign me)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Keamanan visibilitas: task private hanya boleh dilihat oleh Master Admin
      if (task.visibility === 'private' && currentUser?.role !== 'Master Admin') {
        return false;
      }
      if (assigneeScope === 'me' && !isTaskAssignedToMe(task, currentUser)) return false;
      if (selectedProjectId !== 'all' && task.project_id !== selectedProjectId) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        const matchAssignee = task.assignee_name?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchAssignee) return false;
      }
      return true;
    });
  }, [tasks, assigneeScope, currentUser, selectedProjectId, selectedPriority, searchQuery]);

  // Group tasks by status for columns
  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };
    for (const task of filteredTasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      }
    }
    return map;
  }, [filteredTasks]);

  const handleOpenNewTask = (status: TaskStatus = 'todo', defaultDueDate?: string) => {
    setDefaultTaskStatus(status);
    setEditingTask(defaultDueDate ? { due_date: defaultDueDate, status } : null);
    setIsProjectModalOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTask(task);
    setIsProjectModalOpen(false);
    setIsTaskModalOpen(true);
  };

  const handleMoveStatus = (task: Task, direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(task.status);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < statusOrder.length) {
      onUpdateTaskStatus(task.id, statusOrder[targetIndex]);
    }
  };

  return (
    <div className="relative flex-1 flex h-full overflow-hidden bg-white">
      {/* Main Board Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tasks & Projects
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {tasks.length} total tasks
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenNewTask('todo')}
            className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>


          <div className="flex items-center -space-x-1.5 pl-1">
            <div className="w-7 h-7 rounded-full bg-indigo-100 border-2 border-white text-indigo-700 font-bold text-[10px] flex items-center justify-center">
              NJ
            </div>
            <div className="w-7 h-7 rounded-full bg-pink-100 border-2 border-white text-pink-700 font-bold text-[10px] flex items-center justify-center">
              EI
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Toolbar */}
      <div className="h-14 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0 gap-4">
        {/* Search, Project Selector & Assignee Scope Toggle */}
        <div className="flex items-center space-x-2.5 flex-1 min-w-0 max-w-2xl">
          <div className="relative w-full min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, assignees, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-medium text-slate-700 focus:outline-none cursor-pointer shrink-0 max-w-[160px] truncate"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          {/* Toggle: All / Assign me */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 shrink-0">
            <button
              type="button"
              onClick={() => setAssigneeScope('all')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                assigneeScope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>All</span>
            </button>
            <button
              type="button"
              onClick={() => setAssigneeScope('me')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                assigneeScope === 'me'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={currentUser ? `Ditugaskan ke ${currentUser.full_name || currentUser.username}` : 'Ditugaskan ke saya'}
            >
              <User className={`w-3 h-3 ${assigneeScope === 'me' ? 'text-white' : 'text-slate-400'}`} />
              <span>Assign me</span>
              {myTasksCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  assigneeScope === 'me' ? 'bg-indigo-700/90 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {myTasksCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingProject(null);
              setIsTaskModalOpen(false);
              setIsProjectModalOpen(true);
            }}
            className="px-3 py-1.5 border border-slate-200/90 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Manage Projects
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 overflow-y-auto ${viewMode === 'calendar' ? 'p-4 sm:p-6' : 'p-6'} custom-scrollbar bg-slate-50/50 flex flex-col`}>
        {viewMode === 'kanban' ? (
          /* Kanban Columns */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-full items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasksByColumn[col.id] || [];
              return (
                <div
                  key={col.id}
                  className={`bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col max-h-full border-t-4 ${col.borderAccent}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-800 tracking-wide uppercase">
                        {col.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.countBadge}`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenNewTask(col.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Add task in this column"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Cards List */}
                  <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 min-h-[160px] pr-0.5">
                    {colTasks.length === 0 ? (
                      <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-xs">
                        No tasks
                      </div>
                    ) : (
                      colTasks.map((task) => {
                        const deadlineInfo = getDeadlineInfo(task.due_date, task.status);
                        return (
                          <div
                            key={task.id}
                            onClick={(e) => handleEditTask(task, e)}
                            className="bg-white border border-slate-200/90 hover:border-indigo-400/80 rounded-xl p-3.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
                          >
                            {/* Project Tag, Visibility Badge & Priority */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                {task.project_title ? (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 truncate max-w-[130px]">
                                    {task.project_title}
                                  </span>
                                ) : null}
                                {task.visibility === 'private' && (
                                  <span 
                                    className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0"
                                    title="Private: Hanya dapat dilihat oleh Master Admin"
                                  >
                                    <Lock className="w-2.5 h-2.5 text-purple-600" />
                                    <span>Private</span>
                                  </span>
                                )}
                              </div>

                              <span className={`text-[10px] px-2 py-0.5 rounded-md shrink-0 ${PRIORITY_CONFIG[task.priority]?.badge || 'bg-slate-100 text-slate-600'}`}>
                                {PRIORITY_CONFIG[task.priority]?.label || 'Normal'}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-xs text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-relaxed">
                              {task.title}
                            </h3>

                            {/* Due Date & Assignee */}
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 gap-2">
                              <div 
                                className="flex items-center gap-1.5 min-w-0" 
                                title={task.due_date ? `Deadline: ${task.due_date}${deadlineInfo ? ` (${deadlineInfo.text})` : ''}` : 'No deadline'}
                              >
                                <Calendar className={`w-3.5 h-3.5 shrink-0 ${deadlineInfo?.isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                                <span className="shrink-0 font-medium text-slate-700">
                                  {task.due_date ? task.due_date.slice(5) : 'No date'}
                                </span>
                                {deadlineInfo && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate ${deadlineInfo.badgeClass}`}>
                                    {deadlineInfo.text}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                                {task.assignee_name ? (
                                  task.assignee_name.split(',').map((name, idx) => {
                                    const trimmed = name.trim();
                                    if (!trimmed) return null;
                                    const initials = trimmed.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                                    return (
                                      <div 
                                        key={idx} 
                                        className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center ring-2 ring-white shrink-0 shadow-2xs" 
                                        title={trimmed}
                                      >
                                        {initials}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            </div>

                          {/* Quick Move Buttons on Hover */}
                          <div className="mt-2 pt-2 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            {col.id !== 'todo' && (
                              <button
                                onClick={(e) => handleMoveStatus(task, 'prev', e)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title="Move back"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                onClick={(e) => handleMoveStatus(task, 'next', e)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                                title="Move forward"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this task?')) onDeleteTask(task.id);
                              }}
                              className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'list' ? (
          /* List Table View */
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="p-3.5">Task Title</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Assignee</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={(e) => handleEditTask(task, e)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{task.title}</span>
                        {task.visibility === 'private' && (
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0"
                            title="Private: Hanya dapat dilihat oleh Master Admin"
                          >
                            <Lock className="w-2.5 h-2.5 text-purple-600" />
                            <span>Private</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600">{task.project_title || '-'}</td>
                    <td className="p-3.5 text-slate-600">{task.assignee_name || '-'}</td>
                    <td className="p-3.5 text-slate-600">
                      {task.due_date ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{task.due_date}</span>
                          {(() => {
                            const dInfo = getDeadlineInfo(task.due_date, task.status);
                            return dInfo ? (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${dInfo.badgeClass}`}>
                                {dInfo.text}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${PRIORITY_CONFIG[task.priority]?.badge}`}>
                        {PRIORITY_CONFIG[task.priority]?.label}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 capitalize">
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={(e) => handleEditTask(task, e)}
                        className="text-xs font-semibold text-indigo-600 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete task?')) onDeleteTask(task.id);
                        }}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Calendar View */
          <TaskCalendarView
            tasks={filteredTasks}
            projects={projects}
            onEditTask={handleEditTask}
            onOpenNewTask={handleOpenNewTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
          />
        )}
      </div>
      </div>

      {/* Task Inspector Panel (Right Sidebar) */}
      <TaskInspectorPanel
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={onSaveTask}
        onDelete={onDeleteTask}
        projects={projects}
        task={editingTask}
        defaultStatus={defaultTaskStatus}
        accounts={accounts}
        currentUser={currentUser}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSave={onSaveProject}
        onDelete={onDeleteProject}
        projects={projects}
        brands={brands}
        initialData={editingProject}
      />
    </div>
  );
};

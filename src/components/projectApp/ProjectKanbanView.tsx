import React, { useState } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  User, 
  Trash2, 
  Edit, 
  FolderPlus, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  X
} from 'lucide-react';
import { Project, Task, TaskStatus, TaskPriority, Brand } from '../../types/projectApp';

interface ProjectKanbanViewProps {
  projects: Project[];
  tasks: Task[];
  brands: Brand[];
  loading: boolean;
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onSaveTask: (taskData: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => void;
  onSaveProject: (projectData: Partial<Project>) => Promise<void>;
  onDeleteProject: (projectId: string) => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; badgeColor: string }[] = [
  { id: 'todo', title: 'To Do', color: 'border-slate-300', badgeColor: 'bg-slate-100 text-slate-700' },
  { id: 'in_progress', title: 'In Progress', color: 'border-indigo-400', badgeColor: 'bg-indigo-100 text-indigo-700' },
  { id: 'review', title: 'In Review', color: 'border-purple-400', badgeColor: 'bg-purple-100 text-purple-700' },
  { id: 'done', title: 'Done', color: 'border-emerald-400', badgeColor: 'bg-emerald-100 text-emerald-700' },
];

export const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({
  projects,
  tasks,
  brands,
  loading,
  onUpdateTaskStatus,
  onSaveTask,
  onDeleteTask,
  onSaveProject,
  onDeleteProject,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states for Task
  const [taskForm, setTaskForm] = useState<{
    id?: string;
    project_id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_name: string;
    due_date: string;
    tags: string;
  }>({
    project_id: projects[0]?.id || '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee_name: '',
    due_date: '',
    tags: '',
  });

  // Form states for Project
  const [projectForm, setProjectForm] = useState<{
    title: string;
    brand_id: string;
    description: string;
    priority: TaskPriority;
    status: 'planning' | 'in_progress' | 'review' | 'completed';
    start_date: string;
    due_date: string;
    color: string;
  }>({
    title: '',
    brand_id: brands[0]?.id || '',
    description: '',
    priority: 'medium',
    status: 'planning',
    start_date: '',
    due_date: '',
    color: '#4f46e5',
  });

  // Filter tasks
  const filteredTasks = selectedProjectId === 'all'
    ? tasks
    : tasks.filter(t => t.project_id === selectedProjectId);

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setTaskForm({
      project_id: selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || ''),
      title: '',
      description: '',
      priority: 'medium',
      status,
      assignee_name: '',
      due_date: new Date().toISOString().split('T')[0],
      tags: '',
    });
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      id: task.id,
      project_id: task.project_id || '',
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignee_name: task.assignee_name || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      tags: task.tags || '',
    });
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    await onSaveTask(taskForm);
    setIsTaskModalOpen(false);
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title.trim()) return;
    await onSaveProject(projectForm);
    setIsProjectModalOpen(false);
  };

  const moveStatus = (taskId: string, currentStatus: TaskStatus, direction: 'prev' | 'next') => {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
    const idx = statuses.indexOf(currentStatus);
    if (direction === 'prev' && idx > 0) {
      onUpdateTaskStatus(taskId, statuses[idx - 1]);
    } else if (direction === 'next' && idx < statuses.length - 1) {
      onUpdateTaskStatus(taskId, statuses[idx + 1]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Filter Proyek:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Proyek ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Menampilkan <strong className="text-slate-800">{filteredTasks.length}</strong> tasks
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Proyek Baru</span>
          </button>

          <button
            onClick={() => handleOpenNewTask('todo')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Task</span>
          </button>
        </div>
      </div>

      {/* Projects Cards Summary Carousel / Horizontal List */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4 min-w-max">
          {projects.map((proj) => {
            const isSelected = selectedProjectId === proj.id;
            const completionPercent = proj.total_tasks && proj.total_tasks > 0 
              ? Math.round(((proj.completed_tasks || 0) / proj.total_tasks) * 100) 
              : 0;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProjectId(isSelected ? 'all' : proj.id)}
                className={`w-72 p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-900 text-white border-indigo-700 shadow-lg ring-2 ring-indigo-500' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-indigo-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {proj.brand_name || 'Brand'}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    proj.priority === 'urgent' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {proj.priority}
                  </span>
                </div>

                <h4 className="font-bold text-sm mt-2 line-clamp-1">{proj.title}</h4>
                <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {proj.description || 'Tidak ada deskripsi'}
                </p>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span>Progress Task</span>
                    <span>{completionPercent}% ({proj.completed_tasks || 0}/{proj.total_tasks || 0})</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${isSelected ? 'bg-indigo-800' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div 
              key={col.id} 
              className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === 'todo' ? 'bg-slate-400' :
                    col.id === 'in_progress' ? 'bg-indigo-500' :
                    col.id === 'review' ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />
                  <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                    {col.title}
                  </h3>
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                  {colTasks.length}
                </span>
              </div>

              {/* Add Task Quick Button */}
              <button
                onClick={() => handleOpenNewTask(col.id)}
                className="w-full py-2 mb-3 border border-dashed border-slate-300 hover:border-indigo-400 rounded-xl text-slate-500 hover:text-indigo-600 bg-white/60 hover:bg-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah ke {col.title}</span>
              </button>

              {/* Task Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group space-y-2.5 relative"
                  >
                    {/* Tags & Priority */}
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        task.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                        task.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        task.priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>

                      {task.project_title && (
                        <span className="text-[10px] font-bold text-slate-400 truncate max-w-[110px]">
                          {task.project_title}
                        </span>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 
                      onClick={() => handleOpenEditTask(task)}
                      className="text-xs font-bold text-slate-800 leading-snug hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata: Assignee & Due Date */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[90px]">{task.assignee_name || 'Unassigned'}</span>
                      </div>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{task.due_date.split('T')[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions: Move Previous / Next Stage */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditTask(task)}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {col.id !== 'todo' && (
                          <button
                            onClick={() => moveStatus(task.id, task.status, 'prev')}
                            className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Pindah ke tahap sebelumnya"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {col.id !== 'done' && (
                          <button
                            onClick={() => moveStatus(task.id, task.status, 'next')}
                            className="p-1 hover:bg-indigo-50 rounded-md text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Pindah ke tahap berikutnya"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                    Belum ada task di sini
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Task */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingTask ? 'Edit Task' : 'Tambah Task Baru'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Judul Task *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Buat storyboard 3 video reels"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Proyek *</label>
                  <select
                    value={taskForm.project_id}
                    onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignee / PIC</label>
                  <input
                    type="text"
                    placeholder="Nama PIC (mis: Bayu)"
                    value={taskForm.assignee_name}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Brief</label>
                <textarea
                  rows={3}
                  placeholder="Catatan pengerjaan, link asset, atau checklist..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Simpan Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Project */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Buat Proyek / Kampanye Baru</h3>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProjectSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Proyek *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Campaign 10.10 Brand Somethinc"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Klien / Brand</label>
                  <select
                    value={projectForm.brand_id}
                    onChange={(e) => setProjectForm({ ...projectForm, brand_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prioritas</label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={projectForm.start_date}
                    onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deadline / Due Date</label>
                  <input
                    type="date"
                    value={projectForm.due_date}
                    onChange={(e) => setProjectForm({ ...projectForm, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Proyek</label>
                <textarea
                  rows={3}
                  placeholder="Target, objektif, dan ruang lingkup proyek..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Simpan Proyek
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

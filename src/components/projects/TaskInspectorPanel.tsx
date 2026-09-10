import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  User, 
  Tag, 
  Clock, 
  AlertCircle, 
  Trash2,
  Check,
  FolderKanban
} from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority } from '../../types/app';

interface TaskInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  task: Partial<Task> | null;
  projects: Project[];
  defaultStatus?: TaskStatus;
}

const PRIORITIES: { id: TaskPriority; label: string; badge: string }[] = [
  { id: 'low', label: 'Low', badge: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { id: 'medium', label: 'Medium', badge: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' },
  { id: 'high', label: 'High', badge: 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100' },
  { id: 'urgent', label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold' },
];

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Completed' },
];

export const TaskInspectorPanel: React.FC<TaskInspectorPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  task,
  projects,
  defaultStatus = 'todo',
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    project_id: projects[0]?.id || '',
    status: defaultStatus,
    priority: 'medium',
    assignee_name: '',
    due_date: new Date().toISOString().slice(0, 10),
    description: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        ...task,
        title: task.title || '',
        project_id: task.project_id || projects[0]?.id || '',
        status: task.status || defaultStatus,
        priority: task.priority || 'medium',
        assignee_name: task.assignee_name || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        description: task.description || '',
        tags: task.tags || '',
      });
    } else {
      setFormData({
        title: '',
        project_id: projects[0]?.id || '',
        status: defaultStatus,
        priority: 'medium',
        assignee_name: '',
        due_date: new Date().toISOString().slice(0, 10),
        description: '',
        tags: '',
      });
    }
  }, [task, projects, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="w-80 lg:w-[360px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-all">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {formData.id ? 'Task Details' : 'New Task'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Title Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Design 5 Slide Carousel Promo"
              className="w-full text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              required
              autoFocus
            />
          </div>

          {/* Project Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Project
            </label>
            <div className="relative">
              <select
                value={formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="">No Project (General)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Status Column
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUSES.map((s) => {
                const isSelected = formData.status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s.id })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Priority
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRIORITIES.map((p) => {
                const isSelected = formData.priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.id })}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-indigo-500 border-indigo-400 font-bold scale-[1.02]'
                        : 'border-slate-200/80 text-slate-600 hover:bg-slate-50'
                    } ${p.badge}`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assignee / PIC */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Assignee / PIC
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={formData.assignee_name || ''}
                onChange={(e) => setFormData({ ...formData, assignee_name: e.target.value })}
                placeholder="Employee name (e.g. Nazmi Javier)"
                className="bg-transparent border-none text-slate-800 text-xs focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Due Date
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs">
              <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-transparent border-none text-slate-800 text-xs focus:outline-none w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Tags / Labels
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={formData.tags || ''}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Design, Copy, Video, Approval"
                className="bg-transparent border-none text-slate-800 text-xs focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Description / Instructions
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Task instructions, links, or brief notes..."
              className="w-full text-xs text-slate-700 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed custom-scrollbar resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
          {formData.id && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm('Delete this task?')) {
                  onDelete(formData.id!);
                  onClose();
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4f46e5] hover:bg-indigo-700 shadow-sm transition-all"
            >
              {saving ? 'Saving...' : formData.id ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
};

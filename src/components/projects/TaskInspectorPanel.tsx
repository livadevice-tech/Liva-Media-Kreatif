import React, { useState, useEffect, useRef } from 'react';
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
  FolderKanban,
  ExternalLink,
  Plus,
  Edit2,
  Settings2,
  Link as LinkIcon,
  Maximize2,
  Minimize2,
  ListTodo,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  UserPlus,
  Flame,
  Flag,
  Copy
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

export interface TaskLink {
  id: string;
  url: string;
  title: string;
}

export interface TaskSubtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface CustomLabel {
  id: string;
  name: string;
  color: string;
}

const DEFAULT_LABELS: CustomLabel[] = [
  { id: 'lbl-video', name: 'Video', color: '#3b82f6' },
  { id: 'lbl-reels', name: 'Reels', color: '#ec4899' },
  { id: 'lbl-design', name: 'Design', color: '#8b5cf6' },
  { id: 'lbl-copy', name: 'Copywriting', color: '#10b981' },
  { id: 'lbl-promo', name: 'Promo', color: '#ef4444' },
  { id: 'lbl-urgent', name: 'Urgent', color: '#f43f5e' },
  { id: 'lbl-approval', name: 'Approval', color: '#f59e0b' },
  { id: 'lbl-client', name: 'Client Request', color: '#06b6d4' },
];

const PRESET_TEAM_MEMBERS = [
  { name: 'Nazmi Javier', role: 'Copywriter' },
  { name: 'Emilia Inder', role: 'Graphic Designer' },
  { name: 'Rian', role: 'Videographer & Editor' },
  { name: 'Galang', role: 'Creative Director' },
  { name: 'Sarah', role: 'Social Media Specialist' },
  { name: 'Dina', role: 'Account Manager' },
];

const COLOR_PRESETS = [
  { hex: '#3b82f6', name: 'Biru' },
  { hex: '#10b981', name: 'Hijau Emerald' },
  { hex: '#f43f5e', name: 'Merah Rose' },
  { hex: '#ef4444', name: 'Merah' },
  { hex: '#f59e0b', name: 'Kuning Amber' },
  { hex: '#a855f7', name: 'Ungu' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#06b6d4', name: 'Sian' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#64748b', name: 'Slate' },
];

const PRIORITIES: { id: TaskPriority; label: string; badge: string; icon: any }[] = [
  { id: 'low', label: 'Low', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: Flag },
  { id: 'medium', label: 'Medium', badge: 'bg-blue-50 text-blue-700 border-blue-200', icon: Flag },
  { id: 'high', label: 'High', badge: 'bg-amber-50 text-amber-700 border-amber-300 font-bold', icon: Flame },
  { id: 'urgent', label: 'Urgent', badge: 'bg-rose-50 text-rose-700 border-rose-300 font-bold', icon: AlertCircle },
];

const STATUSES: { id: TaskStatus; label: string; dot: string; activeClass: string }[] = [
  { id: 'todo', label: 'To Do', dot: 'bg-slate-400', activeClass: 'bg-slate-100 text-slate-800 border-slate-400 ring-2 ring-slate-400/20' },
  { id: 'in_progress', label: 'In Progress', dot: 'bg-blue-500', activeClass: 'bg-blue-50 text-blue-800 border-blue-400 ring-2 ring-blue-500/20' },
  { id: 'review', label: 'In Review', dot: 'bg-purple-500', activeClass: 'bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-500/20' },
  { id: 'done', label: 'Completed', dot: 'bg-emerald-500', activeClass: 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20' },
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
  // 1. Resizable Width State & Drag Handle
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('task_inspector_width');
      return saved ? Math.max(400, Math.min(1000, Number(saved))) : 540;
    } catch {
      return 540;
    }
  });
  const [isResizing, setIsResizing] = useState(false);

  // 2. Form Data State
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    project_id: projects[0]?.id || '',
    status: defaultStatus,
    priority: 'medium',
    assignee_name: '',
    due_date: new Date().toISOString().slice(0, 10),
    description: '',
    tags: '',
    links: '',
    subtasks: '',
  });

  const [saving, setSaving] = useState(false);
  const [descRows, setDescRows] = useState(6);

  // 3. Multi-Assignee State
  const [assigneeList, setAssigneeList] = useState<string[]>([]);
  const [newAssigneeInput, setNewAssigneeInput] = useState('');
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);

  // 4. Subtasks / Checklist State
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  // 5. Links State
  const [linksList, setLinksList] = useState<TaskLink[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  // 6. Labels / Tags System (Inline Add, Edit, Delete)
  const [availableLabels, setAvailableLabels] = useState<CustomLabel[]>(() => {
    try {
      const saved = localStorage.getItem('pm_task_labels_pool');
      return saved ? JSON.parse(saved) : DEFAULT_LABELS;
    } catch {
      return DEFAULT_LABELS;
    }
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isManageLabelsMode, setIsManageLabelsMode] = useState(false);
  const [inlineEditingLabelId, setInlineEditingLabelId] = useState<string | null>(null);
  const [inlineEditingLabel, setInlineEditingLabel] = useState<CustomLabel>({ id: '', name: '', color: '#3b82f6' });
  const [isAddingLabelInline, setIsAddingLabelInline] = useState(false);
  const [newLabelData, setNewLabelData] = useState({ name: '', color: '#3b82f6' });

  // Sync availableLabels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pm_task_labels_pool', JSON.stringify(availableLabels));
    } catch (e) {
      console.error(e);
    }
  }, [availableLabels]);

  // Handle Drag to Resize Width
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(390, Math.min(window.innerWidth - 60, window.innerWidth - e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        try {
          localStorage.setItem('task_inspector_width', String(sidebarWidth));
        } catch {}
      }
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, sidebarWidth]);

  // Populate data when task opens
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
        links: task.links || '',
        subtasks: task.subtasks || '',
      });

      // Parse multi-assignees
      if (task.assignee_name) {
        const parts = task.assignee_name.split(',').map(s => s.trim()).filter(Boolean);
        setAssigneeList(parts);
      } else {
        setAssigneeList([]);
      }

      // Parse tags
      if (task.tags) {
        const tParts = task.tags.split(',').map(s => s.trim()).filter(Boolean);
        setSelectedTags(tParts);
      } else {
        setSelectedTags([]);
      }

      // Parse links
      if (task.links) {
        try {
          const parsed = JSON.parse(task.links);
          if (Array.isArray(parsed)) setLinksList(parsed);
          else setLinksList([]);
        } catch {
          // If raw URL string
          if (task.links.startsWith('http')) {
            setLinksList([{ id: '1', url: task.links, title: 'Tautan Lampiran' }]);
          } else {
            setLinksList([]);
          }
        }
      } else {
        setLinksList([]);
      }

      // Parse subtasks
      if (task.subtasks) {
        try {
          const parsed = JSON.parse(task.subtasks);
          if (Array.isArray(parsed)) setSubtasks(parsed);
          else setSubtasks([]);
        } catch {
          setSubtasks([]);
        }
      } else {
        setSubtasks([]);
      }
    } else {
      // New Task Clean Slate
      setFormData({
        title: '',
        project_id: projects[0]?.id || '',
        status: defaultStatus,
        priority: 'medium',
        assignee_name: '',
        due_date: new Date().toISOString().slice(0, 10),
        description: '',
        tags: '',
        links: '',
        subtasks: '',
      });
      setAssigneeList([]);
      setSelectedTags([]);
      setLinksList([]);
      setSubtasks([]);
    }
  }, [task, projects, defaultStatus]);

  if (!isOpen) return null;

  // --- Multi-Assignee Handlers ---
  const handleAddAssignee = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || assigneeList.includes(trimmed)) return;
    const updated = [...assigneeList, trimmed];
    setAssigneeList(updated);
    setFormData(prev => ({ ...prev, assignee_name: updated.join(', ') }));
    setNewAssigneeInput('');
  };

  const handleRemoveAssignee = (nameToRemove: string) => {
    const updated = assigneeList.filter(n => n !== nameToRemove);
    setAssigneeList(updated);
    setFormData(prev => ({ ...prev, assignee_name: updated.join(', ') }));
  };

  // --- Subtasks Checklist Handlers ---
  const handleAddSubtask = () => {
    const trimmed = newSubtaskInput.trim();
    if (!trimmed) return;
    const item: TaskSubtask = {
      id: `sub-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      text: trimmed,
      completed: false,
    };
    const updated = [...subtasks, item];
    setSubtasks(updated);
    setFormData(prev => ({ ...prev, subtasks: JSON.stringify(updated) }));
    setNewSubtaskInput('');
  };

  const handleToggleSubtask = (id: string) => {
    const updated = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    setFormData(prev => ({ ...prev, subtasks: JSON.stringify(updated) }));
  };

  const handleDeleteSubtask = (id: string) => {
    const updated = subtasks.filter(s => s.id !== id);
    setSubtasks(updated);
    setFormData(prev => ({ ...prev, subtasks: JSON.stringify(updated) }));
  };

  // --- Links Handlers ---
  const handleAddLink = () => {
    let url = newLinkUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const title = newLinkTitle.trim() || new URL(url).hostname || 'Link Lampiran';
    const linkItem: TaskLink = {
      id: `lnk-${Date.now().toString(36)}`,
      url,
      title,
    };
    const updated = [...linksList, linkItem];
    setLinksList(updated);
    setFormData(prev => ({ ...prev, links: JSON.stringify(updated) }));
    setNewLinkUrl('');
    setNewLinkTitle('');
    setIsAddingLink(false);
  };

  const handleDeleteLink = (id: string) => {
    const updated = linksList.filter(l => l.id !== id);
    setLinksList(updated);
    setFormData(prev => ({ ...prev, links: JSON.stringify(updated) }));
  };

  // --- Label / Tags Handlers ---
  const handleToggleTag = (tagName: string) => {
    let updated: string[];
    if (selectedTags.includes(tagName)) {
      updated = selectedTags.filter(t => t !== tagName);
    } else {
      updated = [...selectedTags, tagName];
    }
    setSelectedTags(updated);
    setFormData(prev => ({ ...prev, tags: updated.join(', ') }));
  };

  const handleCreateLabelInline = () => {
    const trimmed = newLabelData.name.trim();
    if (!trimmed) return;
    const newLbl: CustomLabel = {
      id: `lbl-${Date.now().toString(36)}`,
      name: trimmed,
      color: newLabelData.color || '#3b82f6',
    };
    setAvailableLabels(prev => [...prev, newLbl]);
    // Auto select
    handleToggleTag(trimmed);
    setNewLabelData({ name: '', color: '#3b82f6' });
    setIsAddingLabelInline(false);
  };

  const handleSaveInlineEditLabel = (id: string) => {
    const trimmed = inlineEditingLabel.name.trim();
    if (!trimmed) return;
    setAvailableLabels(prev => prev.map(lbl => lbl.id === id ? { ...lbl, name: trimmed, color: inlineEditingLabel.color } : lbl));
    // If selected, update name in selectedTags
    const oldLbl = availableLabels.find(l => l.id === id);
    if (oldLbl && selectedTags.includes(oldLbl.name)) {
      const updated = selectedTags.map(t => t === oldLbl.name ? trimmed : t);
      setSelectedTags(updated);
      setFormData(prev => ({ ...prev, tags: updated.join(', ') }));
    }
    setInlineEditingLabelId(null);
  };

  const handleDeleteLabel = (id: string, name: string) => {
    if (!window.confirm(`Hapus label "${name}"?`)) return;
    setAvailableLabels(prev => prev.filter(l => l.id !== id));
    if (selectedTags.includes(name)) {
      const updated = selectedTags.filter(t => t !== name);
      setSelectedTags(updated);
      setFormData(prev => ({ ...prev, tags: updated.join(', ') }));
    }
    if (inlineEditingLabelId === id) setInlineEditingLabelId(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      const payload: Partial<Task> = {
        ...formData,
        title: formData.title.trim(),
        assignee_name: assigneeList.join(', '),
        tags: selectedTags.join(', '),
        links: JSON.stringify(linksList),
        subtasks: JSON.stringify(subtasks),
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const completedSubtasksCount = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  return (
    <aside 
      style={{ width: `${sidebarWidth}px` }}
      className="relative shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-all animate-in slide-in-from-right duration-200"
    >
      {/* Draggable Resize Handle on Left Border */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        onDoubleClick={() => setSidebarWidth(540)}
        className="absolute left-0 top-0 bottom-0 w-2.5 -translate-x-1/2 cursor-col-resize z-30 group flex items-center justify-center hover:bg-indigo-500/20 active:bg-indigo-500/40 transition-colors"
        title="Tarik untuk memperlebar / memperkecil lebar sidebar (Klik 2x untuk reset ukuran)"
      >
        <div className="w-1 h-10 rounded-full bg-slate-300 group-hover:bg-indigo-600 transition-colors" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        {/* Modern Header with Quick Width Toggles */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {formData.id ? 'Task Details & Rincian' : 'Buat Task Baru'}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Project Management • Liva Creative</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Size Presets */}
            <div className="hidden sm:flex items-center bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/70 text-[10px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setSidebarWidth(440)}
                className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${sidebarWidth <= 460 ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                title="Lebar Ramping (440px)"
              >
                Kecil
              </button>
              <button
                type="button"
                onClick={() => setSidebarWidth(560)}
                className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${sidebarWidth > 460 && sidebarWidth < 700 ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                title="Lebar Standar (560px)"
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setSidebarWidth(780)}
                className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${sidebarWidth >= 700 ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
                title="Lebar Luas (780px)"
              >
                Lebar
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Tutup Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body with Clean Spacing & Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/20">
          
          {/* CARD 1: TASK LIST & TITLE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Task Title (Nama Task)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Headline pengerjaan</span>
              </div>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Shooting Video Talent & Editing Reels"
                className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
                autoFocus
              />
            </div>

            {/* Subtasks / Checklist Items (Task List Rincian) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                  <label className="text-xs font-bold text-slate-700">
                    Checklist & Rincian Task ({completedSubtasksCount}/{subtasks.length})
                  </label>
                </div>
                {subtasks.length > 0 && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    {subtaskProgress}% Selesai
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>
              )}

              {/* Subtask list */}
              <div className="space-y-1.5 mb-2.5">
                {subtasks.map((st) => (
                  <div 
                    key={st.id}
                    className={`flex items-center justify-between p-2 px-3 rounded-xl border transition-all text-xs ${
                      st.completed 
                        ? 'bg-slate-50/80 border-slate-200 text-slate-400' 
                        : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleSubtask(st.id)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                        st.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`truncate ${st.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                        {st.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                      title="Hapus item checklist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Input */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="+ Tambah rincian langkah pengerjaan..."
                  className="flex-1 min-w-0 text-xs bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  disabled={!newSubtaskInput.trim()}
                  onClick={handleAddSubtask}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: PROJECT & STATUS & PRIORITY */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-4">
            {/* Project Selector */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Project Terkait
              </label>
              <div className="relative">
                <select
                  value={formData.project_id || ''}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none pr-8"
                >
                  <option value="">Umum (Tanpa Proyek Khusus)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} {p.brand_name ? `(${p.brand_name})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Status Selector Grid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Status Kolom
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Tahapan pengerjaan</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {STATUSES.map((s) => {
                  const isSelected = formData.status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: s.id })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? s.activeClass + ' font-bold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                      <span className="truncate">{s.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-700 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Priority (Tingkat Prioritas)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Urgensi task</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = formData.priority === p.id;
                  const IconComponent = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p.id })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 border-indigo-400 font-bold scale-[1.02] shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      } ${p.badge}`}
                    >
                      <IconComponent className="w-3 h-3 shrink-0" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD 3: ASSIGNEE (BISA LEBIH DARI SATU ORANG) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-800">
                  Assignee / PIC ({assigneeList.length} orang)
                </label>
              </div>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                Bisa lebih dari 1 orang
              </span>
            </div>

            {/* Selected Assignees Chips */}
            <div className="flex flex-wrap items-center gap-2 min-h-[36px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl">
              {assigneeList.length === 0 ? (
                <span className="text-xs text-slate-400 italic px-1">Belum ada person-in-charge yang ditugaskan</span>
              ) : (
                assigneeList.map((name) => {
                  const initials = name
                    .split(' ')
                    .map(w => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  return (
                    <div
                      key={name}
                      className="inline-flex items-center gap-1.5 bg-white border border-indigo-200/80 rounded-xl px-2.5 py-1 text-xs font-bold text-indigo-950 shadow-2xs group"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                        {initials}
                      </span>
                      <span className="truncate max-w-[140px]">{name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAssignee(name)}
                        className="p-0.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="Hapus person"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Add Assignee from Team or Custom Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newAssigneeInput}
                  onChange={(e) => setNewAssigneeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAssignee(newAssigneeInput);
                    }
                  }}
                  placeholder="Ketik nama PIC lain lalu Enter..."
                  className="flex-1 min-w-0 text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="button"
                  disabled={!newAssigneeInput.trim()}
                  onClick={() => handleAddAssignee(newAssigneeInput)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              {/* Quick suggestions from team */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Rekomendasi Anggota Tim:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TEAM_MEMBERS.map((tm) => {
                    const isAdded = assigneeList.includes(tm.name);
                    return (
                      <button
                        key={tm.name}
                        type="button"
                        onClick={() => isAdded ? handleRemoveAssignee(tm.name) : handleAddAssignee(tm.name)}
                        className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                          isAdded
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{tm.name}</span>
                        {isAdded ? (
                          <Check className="w-3 h-3 text-indigo-600 stroke-[3]" />
                        ) : (
                          <span className="text-[10px] text-slate-400">({tm.role})</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 4: DUE DATE */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-indigo-600" />
                <span>Due Date (Tenggat Waktu)</span>
              </label>
              {/* Quick date buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, due_date: new Date().toISOString().slice(0, 10) })}
                  className="text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 cursor-pointer"
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setFormData({ ...formData, due_date: d.toISOString().slice(0, 10) });
                  }}
                  className="text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 cursor-pointer"
                >
                  Besok
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setFormData({ ...formData, due_date: d.toISOString().slice(0, 10) });
                  }}
                  className="text-[10px] font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 cursor-pointer"
                >
                  +7 Hari
                </button>
              </div>
            </div>

            <input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono cursor-pointer"
            />
          </div>

          {/* CARD 5: LABEL / TAGS (BISA DI ADD, DELETE, EDIT LANGSUNG) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-800">
                  Label / Tags Konten ({availableLabels.length} label)
                </label>
              </div>
              <button
                type="button"
                onClick={() => setIsManageLabelsMode(!isManageLabelsMode)}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                  isManageLabelsMode
                    ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                    : 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 border-indigo-100'
                }`}
                title="Kelola label: edit nama/warna dan hapus label"
              >
                <Settings2 className="w-3 h-3" />
                <span>{isManageLabelsMode ? 'Selesai Kelola' : 'Kelola / Edit Label'}</span>
              </button>
            </div>

            {isManageLabelsMode && (
              <div className="p-2 px-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-[11px] text-amber-800 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Mode Kelola: Klik pensil untuk edit, atau tempat sampah untuk hapus label langsung.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsManageLabelsMode(false)}
                  className="text-[10px] font-bold text-amber-900 hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Labels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableLabels.map((lbl) => {
                const isSelected = selectedTags.includes(lbl.name);
                const isEditing = inlineEditingLabelId === lbl.id;

                if (isEditing) {
                  return (
                    <div
                      key={lbl.id}
                      className="col-span-full sm:col-span-2 lg:col-span-3 p-2.5 bg-indigo-50/90 border-2 border-indigo-500 rounded-xl space-y-2 shadow-2xs animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] font-bold text-indigo-900 mr-1">Warna:</span>
                          {COLOR_PRESETS.map((c) => (
                            <button
                              type="button"
                              key={c.hex}
                              onClick={() => setInlineEditingLabel({ ...inlineEditingLabel, color: c.hex })}
                              className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                                inlineEditingLabel.color === c.hex ? 'ring-2 ring-indigo-600 scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">Edit Label Langsung</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={inlineEditingLabel.name}
                          onChange={(e) => setInlineEditingLabel({ ...inlineEditingLabel, name: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveInlineEditLabel(lbl.id);
                            } else if (e.key === 'Escape') {
                              setInlineEditingLabelId(null);
                            }
                          }}
                          className="flex-1 min-w-0 bg-white border border-indigo-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveInlineEditLabel(lbl.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-[11px]">Simpan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineEditingLabelId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLabel(lbl.id, lbl.name)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                          title="Hapus Label"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={lbl.id}
                    className={`group relative flex items-center justify-between gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 shadow-2xs font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleTag(lbl.name)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer overflow-hidden py-0.5"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: lbl.color || '#3b82f6' }} 
                      />
                      <span className="truncate">{lbl.name}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 stroke-[3] ml-auto" />
                      )}
                    </button>

                    {/* Direct Edit & Delete Buttons on Label */}
                    <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${
                      isManageLabelsMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInlineEditingLabelId(lbl.id);
                          setInlineEditingLabel({ id: lbl.id, name: lbl.name, color: lbl.color || '#3b82f6' });
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                        title="Edit nama & warna label"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLabel(lbl.id, lbl.name);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        title="Hapus label"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* + Tambah Label Inline Button / Card */}
              {isAddingLabelInline ? (
                <div className="col-span-full sm:col-span-2 lg:col-span-3 p-2.5 bg-emerald-50/90 border-2 border-emerald-500 rounded-xl space-y-2 shadow-2xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-bold text-emerald-900 mr-1">Pilih Warna:</span>
                      {COLOR_PRESETS.map((c) => (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => setNewLabelData({ ...newLabelData, color: c.hex })}
                          className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${
                            newLabelData.color === c.hex ? 'ring-2 ring-emerald-600 scale-110' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">+ Tambah Label Baru</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newLabelData.name}
                      onChange={(e) => setNewLabelData({ ...newLabelData, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateLabelInline();
                        } else if (e.key === 'Escape') {
                          setIsAddingLabelInline(false);
                        }
                      }}
                      placeholder="Ketik nama label..."
                      className="flex-1 min-w-0 bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={!newLabelData.name.trim()}
                      onClick={handleCreateLabelInline}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span className="text-[11px]">Tambah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingLabelInline(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                      title="Batal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingLabelInline(true);
                    setNewLabelData({ name: '', color: '#3b82f6' });
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer"
                  title="Tambah label baru langsung di sini"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Label</span>
                </button>
              )}
            </div>
          </div>

          {/* CARD 6: TASK DESKRIPSI (BISA ADJUST UKURAN KOLUM MANUAL) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Task Deskripsi & Instruksi Kerja
              </label>
              {/* Row Height Adjuster */}
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <span>Tinggi Kolom:</span>
                <button
                  type="button"
                  onClick={() => setDescRows(3)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${descRows === 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'hover:bg-slate-100 border-slate-200'}`}
                >
                  Kecil
                </button>
                <button
                  type="button"
                  onClick={() => setDescRows(7)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${descRows === 7 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'hover:bg-slate-100 border-slate-200'}`}
                >
                  Sedang
                </button>
                <button
                  type="button"
                  onClick={() => setDescRows(14)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${descRows === 14 ? 'bg-indigo-50 border-indigo-200 text-indigo-600 font-bold' : 'hover:bg-slate-100 border-slate-200'}`}
                >
                  Besar
                </button>
              </div>
            </div>

            <textarea
              rows={descRows}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan detail instruksi task, arahan visual, catatan revisi, atau ketentuan pengerjaan di sini... (Kolum ini juga bisa ditarik pojok kanan bawahnya secara bebas)"
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed custom-scrollbar resize-y min-h-[90px]"
            />
          </div>

          {/* CARD 7: LINK OPSIONAL (BISA LEBIH DARI SATU) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-indigo-600" />
                <label className="text-xs font-bold text-slate-800">
                  Link & Referensi Lampiran ({linksList.length})
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Opsional • Bisa lebih dari satu</span>
            </div>

            {/* List of Attached Links */}
            <div className="space-y-1.5">
              {linksList.map((lnk) => (
                <div 
                  key={lnk.id}
                  className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{lnk.title}</p>
                      <a 
                        href={lnk.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[11px] text-indigo-600 hover:underline truncate block"
                      >
                        {lnk.url}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <a
                      href={lnk.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                      title="Buka tautan di tab baru"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteLink(lnk.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus tautan ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Add Link Form */}
            {isAddingLink ? (
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-2.5 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <input
                    type="url"
                    autoFocus
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL: https://drive.google.com/... atau https://figma.com/..."
                    className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLink();
                      }
                    }}
                    placeholder="Judul Link (Opsional, contoh: Folder Asset Video Shoot)"
                    className="w-full text-xs bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(false)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!newLinkUrl.trim()}
                    onClick={handleAddLink}
                    className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Simpan Link
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingLink(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/40 text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Link (Google Drive, Figma, Docs, dll)</span>
              </button>
            )}
          </div>

        </div>

        {/* Sticky Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          {formData.id && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Apakah Anda yakin ingin menghapus task "${formData.title}"?`)) {
                  onDelete(formData.id!);
                  onClose();
                }
              }}
              className="px-3 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Hapus task ini"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus Task</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title?.trim()}
              className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formData.id ? 'Simpan Perubahan' : 'Buat Task'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
};

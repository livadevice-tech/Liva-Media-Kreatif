import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Users,
  Link2,
  ExternalLink,
  CheckSquare,
  Square,
  AlertCircle,
  FileText,
  Tag,
  Archive,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  PanelRightClose,
  GripVertical,
  Settings,
} from 'lucide-react';
import {
  TaskItem,
  TaskStatus,
  TaskPriority,
  TaskChecklistItem,
  TaskFileLink,
  TaskCustomSettings,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from './types';
import {
  getStatusMeta,
  getPriorityMeta,
  getCategoryMeta,
  DEFAULT_TASK_SETTINGS,
} from './taskTheme';
import { detectLinkPlatform } from './taskStorage';

interface PICCandidate {
  id: string;
  name: string;
  role?: string;
  avatarUrl?: string;
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  onDelete?: (taskId: string) => void;
  initialTask?: TaskItem | null;
  defaultStatus?: TaskStatus;
  availablePICs: PICCandidate[];
  taskSettings?: TaskCustomSettings;
  onOpenSettings?: (tab?: 'status' | 'priority' | 'category') => void;
}

const SIDEBAR_STORAGE_KEY = 'liva_task_sidebar_width';
const DEFAULT_SIDEBAR_WIDTH = 620;
const MIN_SIDEBAR_WIDTH = 420;

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTask,
  defaultStatus = 'todo',
  availablePICs,
  taskSettings,
  onOpenSettings,
}) => {
  // Sidebar Width State with LocalStorage Persistence
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!Number.isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH) {
          return Math.min(parsed, typeof window !== 'undefined' ? window.innerWidth - 40 : 1200);
        }
      }
    } catch {}
    return DEFAULT_SIDEBAR_WIDTH;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const preMaximizeWidthRef = useRef<number>(DEFAULT_SIDEBAR_WIDTH);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>('moderate');
  const [category, setCategory] = useState('Live Production');
  const [deadline, setDeadline] = useState('');
  const [selectedPICs, setSelectedPICs] = useState<string[]>([]);
  const [customPICInput, setCustomPICInput] = useState('');

  // Checklist / To-do list
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // File Drop Links
  const [fileLinks, setFileLinks] = useState<TaskFileLink[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Pre-fill when editing or creating
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      setStatus(initialTask.status || 'todo');
      setPriority(initialTask.priority || 'moderate');
      setCategory(initialTask.category || 'Live Production');
      setDeadline(initialTask.deadline || '');
      setSelectedPICs(initialTask.picNames || []);
      setChecklist(initialTask.checklist || []);
      setFileLinks(initialTask.fileLinks || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus(defaultStatus);
      setPriority('moderate');
      setCategory('Live Production');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      setDeadline(tomorrow);
      setSelectedPICs([]);
      setChecklist([]);
      setFileLinks([]);
    }
    setNewSubtaskText('');
    setNewLinkTitle('');
    setNewLinkUrl('');
    setCustomPICInput('');
  }, [initialTask, defaultStatus, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Drag-to-Resize Logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setIsMaximized(false);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - moveEvent.clientX;
      const clampedWidth = Math.min(
        Math.max(newWidth, MIN_SIDEBAR_WIDTH),
        windowWidth - 40
      );
      setSidebarWidth(clampedWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      setSidebarWidth((curr) => {
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(curr));
        } catch {}
        return curr;
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, []);

  // Quick Preset Width Buttons
  const setPresetWidth = (targetWidth: number) => {
    setIsMaximized(false);
    const clamped = Math.min(Math.max(targetWidth, MIN_SIDEBAR_WIDTH), window.innerWidth - 40);
    setSidebarWidth(clamped);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(clamped));
    } catch {}
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      setIsMaximized(false);
      setSidebarWidth(preMaximizeWidthRef.current);
    } else {
      preMaximizeWidthRef.current = sidebarWidth;
      setIsMaximized(true);
      setSidebarWidth(window.innerWidth - 40);
    }
  };

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newItem: TaskChecklistItem = {
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: newSubtaskText.trim(),
      isDone: false,
    };
    setChecklist([...checklist, newItem]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleAddFileLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLinkUrl.trim()) return;

    let finalUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = `https://${finalUrl}`;
    }

    const platform = detectLinkPlatform(finalUrl);
    const fallbackTitle =
      platform === 'drive'
        ? 'Google Drive Asset'
        : platform === 'figma'
        ? 'Figma File Design'
        : platform === 'canva'
        ? 'Canva Design'
        : platform === 'sheets'
        ? 'Google Spreadsheet'
        : platform === 'docs'
        ? 'Google Docs Brief'
        : 'File Link Attachment';

    const newLink: TaskFileLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim() || fallbackTitle,
      url: finalUrl,
      platform,
    };

    setFileLinks([...fileLinks, newLink]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleDeleteFileLink = (id: string) => {
    setFileLinks(fileLinks.filter((item) => item.id !== id));
  };

  const handleTogglePIC = (name: string) => {
    if (selectedPICs.includes(name)) {
      setSelectedPICs(selectedPICs.filter((p) => p !== name));
    } else {
      setSelectedPICs([...selectedPICs, name]);
    }
  };

  const handleAddCustomPIC = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customPICInput.trim();
    if (!clean) return;
    if (!selectedPICs.includes(clean)) {
      setSelectedPICs([...selectedPICs, clean]);
    }
    setCustomPICInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskToSave: TaskItem = {
      id: initialTask?.id || `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      category: category.trim() || 'Umum',
      deadline: deadline || undefined,
      picNames: selectedPICs,
      checklist,
      fileLinks,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(taskToSave);
    onClose();
  };

  // Calculate checklist completion
  const completedCount = checklist.filter((c) => c.isDone).length;
  const progressPercent =
    checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden font-sans">
      {/* 1. Backdrop Overlay (click to close) */}
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 2. Adjustable Sidebar Drawer (slides in from right) */}
      <aside
        style={{
          width: typeof window !== 'undefined' && window.innerWidth < 640 ? '100vw' : `${sidebarWidth}px`,
        }}
        className={`fixed top-0 right-0 bottom-0 z-[121] bg-white h-screen flex flex-col shadow-[-12px_0_35px_rgba(0,0,0,0.12)] border-l border-slate-200 animate-slideInRight max-w-full ${
          isResizing ? 'select-none' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Draggable Resize Handle on Left Edge (Desktop) */}
        <div
          onMouseDown={startResizing}
          title="Tarik ke kiri atau kanan untuk mengatur lebar sidebar"
          className="hidden sm:flex absolute -left-2.5 top-0 bottom-0 w-5 cursor-ew-resize items-center justify-center z-30 group"
        >
          <div
            className={`w-1 h-14 rounded-full transition-all shadow-xs ${
              isResizing
                ? 'bg-indigo-600 w-1.5 ring-4 ring-indigo-200'
                : 'bg-slate-300 group-hover:bg-indigo-500 group-hover:w-1.5'
            }`}
          />
        </div>

        {/* Sidebar Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-slate-800 leading-tight truncate">
                {initialTask ? 'Edit Detail Task' : 'Tambah Task Baru'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                {initialTask ? 'Perbarui informasi brief, subtask, dan status' : 'Buat task manajemen tugas tim'}
              </p>
            </div>
          </div>

          {/* Header Controls: Width Presets & Close */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Quick Width Presets (Desktop) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg mr-1 text-[10px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setPresetWidth(480)}
                title="Lebar Standar (480px)"
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  sidebarWidth <= 520 && !isMaximized
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                Kompak
              </button>
              <button
                type="button"
                onClick={() => setPresetWidth(640)}
                title="Lebar Sedang (640px)"
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  sidebarWidth > 520 && sidebarWidth <= 720 && !isMaximized
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setPresetWidth(860)}
                title="Lebar Luas (860px)"
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                  sidebarWidth > 720 && !isMaximized
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'hover:text-slate-900'
                }`}
              >
                Lebar
              </button>
            </div>

            {/* Maximize / Minimize toggle */}
            <button
              type="button"
              onClick={toggleMaximize}
              title={isMaximized ? 'Kembalikan Ukuran' : 'Maksimalkan Layar'}
              className="hidden sm:flex w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer"
            >
              {isMaximized ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Close Sidebar Button */}
            <button
              type="button"
              onClick={onClose}
              title="Tutup Sidebar (Esc)"
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Body (Scrollable Form) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Row 1: Nama Task */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1">
              Nama Task <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Persiapan Live Shopping Brand Doremi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Row 2: Status, Priority, Category (Customizable & Persisted in MySQL) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Status
                </label>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => onOpenSettings('status')}
                    title="Kustomisasi opsi status di database"
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Settings className="w-2.5 h-2.5" /> Kelola
                  </button>
                )}
              </div>
              {(() => {
                const meta = getStatusMeta(status, taskSettings);
                const statusesList = taskSettings?.statuses || DEFAULT_TASK_SETTINGS.statuses;
                return (
                  <select
                    value={status}
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE__') {
                        onOpenSettings?.('status');
                      } else {
                        setStatus(e.target.value as TaskStatus);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs transition-all ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`}
                  >
                    {statusesList.map((st) => (
                      <option key={st.id} value={st.id} className="bg-white text-slate-800">
                        {st.label}
                      </option>
                    ))}
                    <option value="__MANAGE__" className="bg-indigo-50 text-indigo-700 font-black">
                      ⚙️ + Kelola Status di Database...
                    </option>
                  </select>
                );
              })()}
            </div>

            {/* Priority */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Prioritas
                </label>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => onOpenSettings('priority')}
                    title="Kustomisasi opsi prioritas di database"
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Settings className="w-2.5 h-2.5" /> Kelola
                  </button>
                )}
              </div>
              {(() => {
                const meta = getPriorityMeta(priority, taskSettings);
                const prioritiesList = taskSettings?.priorities || DEFAULT_TASK_SETTINGS.priorities;
                return (
                  <select
                    value={priority}
                    onChange={(e) => {
                      if (e.target.value === '__MANAGE__') {
                        onOpenSettings?.('priority');
                      } else {
                        setPriority(e.target.value as TaskPriority);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-2xs transition-all ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                  >
                    {prioritiesList.map((pr) => (
                      <option key={pr.id} value={pr.id} className="bg-white text-slate-800">
                        {pr.label}
                      </option>
                    ))}
                    <option value="__MANAGE__" className="bg-amber-50 text-amber-800 font-black">
                      ⚙️ + Kelola Prioritas di Database...
                    </option>
                  </select>
                );
              })()}
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Kategori
                </label>
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={() => onOpenSettings('category')}
                    title="Kustomisasi daftar kategori di database"
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                  >
                    <Settings className="w-2.5 h-2.5" /> Kelola
                  </button>
                )}
              </div>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Pilih atau ketik kategori..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <datalist id="category-suggestions">
                {(taskSettings?.categories || DEFAULT_TASK_SETTINGS.categories).map((cat) => (
                  <option key={cat.id} value={cat.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Quick Category Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5 -mt-1 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">Pilihan cepat:</span>
            {(taskSettings?.categories || DEFAULT_TASK_SETTINGS.categories).slice(0, 6).map((c) => {
              const meta = getCategoryMeta(c.name, taskSettings);
              const isSelected = category.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.name)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? `${meta.badgeBg} ${meta.badgeText} ${meta.borderColor} ring-1 ring-indigo-300 font-black shadow-2xs`
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>

          {/* Row 3: Deadline & PIC Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Deadline */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* PIC Selector */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> PIC (Person In Charge)
              </label>
              <div className="flex gap-1.5">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleTogglePIC(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="" disabled>
                    + Pilih PIC dari Tim...
                  </option>
                  {availablePICs.map((pic) => (
                    <option key={pic.id} value={pic.name}>
                      {pic.name} {pic.role ? `(${pic.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PIC Tag Chips */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedPICs.map((picName) => (
                <span
                  key={picName}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 font-bold text-[11px] shadow-2xs"
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">
                    {picName.charAt(0).toUpperCase()}
                  </div>
                  <span>{picName}</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePIC(picName)}
                    className="hover:text-rose-600 transition-colors cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedPICs.length === 0 && (
                <span className="text-[11px] text-slate-400 italic">
                  Belum ada PIC ditugaskan
                </span>
              )}
            </div>

            {/* Quick custom PIC text addition */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Atau ketik nama PIC luar..."
                value={customPICInput}
                onChange={(e) => setCustomPICInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomPIC(e);
                  }
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-700 focus:outline-none focus:border-indigo-400 w-48"
              />
              <button
                type="button"
                onClick={handleAddCustomPIC}
                className="px-2 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Detail Brief / Description */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Detail Brief & Catatan Task
            </label>
            <textarea
              rows={4}
              placeholder="Tuliskan instruksi detail, poin-poin brief siaran, target pencapaian, atau catatan teknis di sini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* To-Do List (Subtask Checklist) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  To Do List / Subtask Checklist ({completedCount}/{checklist.length})
                </span>
              </div>
              {checklist.length > 0 && (
                <span className="text-[11px] font-bold text-indigo-600">
                  {progressPercent}% Selesai
                </span>
              )}
            </div>

            {/* Progress bar */}
            {checklist.length > 0 && (
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Subtask items list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/70 hover:border-slate-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(item.id)}
                    className="flex items-center gap-2 text-left flex-1 cursor-pointer"
                  >
                    {item.isDone ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-semibold ${
                        item.isDone
                          ? 'line-through text-slate-400'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.text}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(item.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Input to add subtask */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="+ Tambah item to do list / checklist..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* File (Drop Link) */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                  File Attachment (Drop Link) ({fileLinks.length})
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                Google Drive, Canva, Figma, Spreadsheet
              </span>
            </div>

            {/* Existing file links */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {fileLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200/70"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-700 shrink-0">
                      {link.platform || 'link'}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline truncate flex items-center gap-1"
                    >
                      <span className="truncate">{link.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteFileLink(link.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new file link */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5">
              <input
                type="text"
                placeholder="Judul link (misal: File Figma / Brief Doc)"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="sm:col-span-5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFileLink();
                  }
                }}
                className="sm:col-span-5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddFileLink}
                className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                + Link
              </button>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="pt-3 pb-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 -mb-4 px-5 py-3">
            <div>
              {initialTask && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Yakin ingin menghapus task ini?')) {
                      onDelete(initialTask.id);
                      onClose();
                    }
                  }}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Task
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckSquare className="w-4 h-4" />
                {initialTask ? 'Simpan Perubahan' : 'Buat Task'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  );
};

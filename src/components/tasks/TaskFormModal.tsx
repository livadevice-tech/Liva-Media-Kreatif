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
  Search,
  Check,
  ChevronDown,
  UserPlus,
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
import { CustomDatePicker } from '../ui/CustomDatePicker';

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

  // Custom Dropdown Open States
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // PIC Searchable Dropdown States
  const [isPICDropdownOpen, setIsPICDropdownOpen] = useState(false);
  const [picSearchQuery, setPicSearchQuery] = useState('');

  // Dropdown Refs
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categorySearchInputRef = useRef<HTMLInputElement>(null);
  const picDropdownRef = useRef<HTMLDivElement>(null);
  const picSearchInputRef = useRef<HTMLInputElement>(null);

  // Toggle Dropdown helpers (mutually exclusive)
  const toggleStatusDropdown = () => {
    setIsPriorityDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsPICDropdownOpen(false);
    setIsStatusDropdownOpen((prev) => !prev);
  };

  const togglePriorityDropdown = () => {
    setIsStatusDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsPICDropdownOpen(false);
    setIsPriorityDropdownOpen((prev) => !prev);
  };

  const toggleCategoryDropdown = () => {
    setIsStatusDropdownOpen(false);
    setIsPriorityDropdownOpen(false);
    setIsPICDropdownOpen(false);
    setIsCategoryDropdownOpen((prev) => !prev);
  };

  const togglePICDropdown = () => {
    setIsStatusDropdownOpen(false);
    setIsPriorityDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setIsPICDropdownOpen((prev) => {
      if (!prev) setPicSearchQuery('');
      return !prev;
    });
  };

  // Close all dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(target)) {
        setIsStatusDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setIsPriorityDropdownOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (picDropdownRef.current && !picDropdownRef.current.contains(target)) {
        setIsPICDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Auto-focus category search input when category dropdown opens
  useEffect(() => {
    if (isCategoryDropdownOpen && categorySearchInputRef.current) {
      categorySearchInputRef.current.focus();
    } else if (!isCategoryDropdownOpen) {
      setCategorySearchQuery('');
    }
  }, [isCategoryDropdownOpen]);

  // Auto-focus search input when PIC dropdown opens
  useEffect(() => {
    if (isPICDropdownOpen && picSearchInputRef.current) {
      picSearchInputRef.current.focus();
    }
  }, [isPICDropdownOpen]);

  // Helper date formatter: DD Mon YYYY
  const formatIndonesianDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const day = parseInt(parts[2], 10);
    const month = months[parseInt(parts[1], 10) - 1] || '';
    const year = parts[0];
    return `${day} ${month} ${year}`;
  };

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
    setIsPICDropdownOpen(false);
    setPicSearchQuery('');
    setIsStatusDropdownOpen(false);
    setIsPriorityDropdownOpen(false);
    setIsCategoryDropdownOpen(false);
    setCategorySearchQuery('');
  }, [initialTask, defaultStatus, isOpen]);

  // Close on Escape key (close active dropdown first, or close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isStatusDropdownOpen || isPriorityDropdownOpen || isCategoryDropdownOpen || isPICDropdownOpen) {
          setIsStatusDropdownOpen(false);
          setIsPriorityDropdownOpen(false);
          setIsCategoryDropdownOpen(false);
          setIsPICDropdownOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isStatusDropdownOpen, isPriorityDropdownOpen, isCategoryDropdownOpen, isPICDropdownOpen]);

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-20">
            {/* Status */}
            <div className={`relative ${isStatusDropdownOpen ? 'z-30' : 'z-10'}`} ref={statusDropdownRef}>
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleStatusDropdown}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor} hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.dotColor} shrink-0 ring-2 ring-white/80 shadow-2xs`} />
                        <span className="truncate">{meta.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isStatusDropdownOpen ? 'rotate-180 text-indigo-600' : 'opacity-60'
                        }`}
                      />
                    </button>

                    {isStatusDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-fadeIn min-w-[210px] sm:min-w-full space-y-0.5">
                        <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                          {statusesList.map((st) => {
                            const stMeta = getStatusMeta(st.id, taskSettings);
                            const isSelected = status === st.id;
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setStatus(st.id as TaskStatus);
                                  setIsStatusDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? `${stMeta.badgeBg} ${stMeta.badgeText} font-black shadow-2xs ring-1 ring-inset ${stMeta.borderColor}`
                                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 truncate">
                                  <span className={`w-2.5 h-2.5 rounded-full ${stMeta.dotColor} shrink-0 ring-2 ring-white shadow-2xs`} />
                                  <span className="truncate">{st.label}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-indigo-600 stroke-[2.5] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {onOpenSettings && (
                          <>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setIsStatusDropdownOpen(false);
                                onOpenSettings('status');
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50/80 flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">+ Kelola Status di Database...</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Priority */}
            <div className={`relative ${isPriorityDropdownOpen ? 'z-30' : 'z-10'}`} ref={priorityDropdownRef}>
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
                  <div className="relative">
                    <button
                      type="button"
                      onClick={togglePriorityDropdown}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder} hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <span className={`w-2.5 h-2.5 rounded-full ${meta.dotColor} shrink-0 ring-2 ring-white/80 shadow-2xs`} />
                        <span className="truncate">{meta.label}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isPriorityDropdownOpen ? 'rotate-180 text-amber-600' : 'opacity-60'
                        }`}
                      />
                    </button>

                    {isPriorityDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1.5 z-50 animate-fadeIn min-w-[210px] sm:min-w-full space-y-0.5">
                        <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                          {prioritiesList.map((pr) => {
                            const prMeta = getPriorityMeta(pr.id, taskSettings);
                            const isSelected = priority === pr.id;
                            return (
                              <button
                                key={pr.id}
                                type="button"
                                onClick={() => {
                                  setPriority(pr.id as TaskPriority);
                                  setIsPriorityDropdownOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? `${prMeta.badgeBg} ${prMeta.badgeText} font-black shadow-2xs ring-1 ring-inset ${prMeta.badgeBorder}`
                                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 truncate">
                                  <span className={`w-2.5 h-2.5 rounded-full ${prMeta.dotColor} shrink-0 ring-2 ring-white shadow-2xs`} />
                                  <span className="truncate">{pr.label}</span>
                                </div>
                                {isSelected && (
                                  <Check className="w-4 h-4 text-amber-600 stroke-[2.5] shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {onOpenSettings && (
                          <>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setIsPriorityDropdownOpen(false);
                                onOpenSettings('priority');
                              }}
                              className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50/80 flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="truncate">+ Kelola Prioritas di Database...</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Category */}
            <div className={`relative ${isCategoryDropdownOpen ? 'z-30' : 'z-10'}`} ref={categoryDropdownRef}>
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
              {(() => {
                const meta = getCategoryMeta(category, taskSettings);
                const categoriesList = taskSettings?.categories || DEFAULT_TASK_SETTINGS.categories;
                const filteredCategories = categoriesList.filter((c) =>
                  c.name.toLowerCase().includes(categorySearchQuery.toLowerCase().trim())
                );
                const hasExactMatch = categoriesList.some(
                  (c) => c.name.toLowerCase() === categorySearchQuery.toLowerCase().trim()
                );

                return (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleCategoryDropdown}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer shadow-2xs ${
                        category
                          ? `${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`
                          : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      } hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-200`}
                    >
                      <div className="flex items-center gap-2 min-w-0 truncate">
                        <Tag className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{category || 'Pilih atau ketik kategori...'}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isCategoryDropdownOpen ? 'rotate-180 text-indigo-600' : 'opacity-60'
                        }`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute right-0 left-auto sm:left-0 sm:right-auto top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-fadeIn min-w-[240px] w-full max-w-sm space-y-1.5">
                        {/* Search / Custom input */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            ref={categorySearchInputRef}
                            type="text"
                            value={categorySearchQuery}
                            onChange={(e) => setCategorySearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = categorySearchQuery.trim();
                                if (trimmed) {
                                  setCategory(trimmed);
                                  setIsCategoryDropdownOpen(false);
                                  setCategorySearchQuery('');
                                }
                              }
                            }}
                            placeholder="Cari atau ketik baru..."
                            className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
                          />
                          {categorySearchQuery && (
                            <button
                              type="button"
                              onClick={() => setCategorySearchQuery('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Custom Category Prompt when typing something new */}
                        {categorySearchQuery.trim() && !hasExactMatch && (
                          <button
                            type="button"
                            onClick={() => {
                              setCategory(categorySearchQuery.trim());
                              setIsCategoryDropdownOpen(false);
                              setCategorySearchQuery('');
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span className="truncate">Gunakan &quot;{categorySearchQuery.trim()}&quot;</span>
                          </button>
                        )}

                        {/* Existing Categories List */}
                        <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
                          {filteredCategories.length === 0 && !categorySearchQuery.trim() ? (
                            <div className="py-2 text-center text-xs text-slate-400">Belum ada kategori</div>
                          ) : (
                            filteredCategories.map((c) => {
                              const cMeta = getCategoryMeta(c.name, taskSettings);
                              const isSelected = category.toLowerCase() === c.name.toLowerCase();
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setCategory(c.name);
                                    setIsCategoryDropdownOpen(false);
                                    setCategorySearchQuery('');
                                  }}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? `${cMeta.badgeBg} ${cMeta.badgeText} font-black shadow-2xs ring-1 ring-inset ${cMeta.borderColor}`
                                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 truncate">
                                    <Tag className="w-3 h-3 opacity-60 shrink-0" />
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-indigo-600 stroke-[2.5] shrink-0" />
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>

                        {onOpenSettings && (
                          <>
                            <div className="border-t border-slate-100 my-1" />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCategoryDropdownOpen(false);
                                onOpenSettings('category');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50/80 flex items-center gap-2 transition-all cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">+ Kelola Kategori di Database...</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
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
              <div className="relative">
                <CustomDatePicker
                  value={deadline}
                  onChange={(val) => setDeadline(val)}
                  formatDisplay={formatIndonesianDateShort}
                  placeholder="Pilih tanggal deadline..."
                  className="w-full text-xs font-bold"
                  buttonClassName="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all flex items-center justify-between cursor-pointer shadow-2xs"
                />
                {deadline && (
                  <button
                    type="button"
                    onClick={() => setDeadline('')}
                    title="Hapus deadline"
                    className="absolute right-9 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* PIC Selector (Searchable Dropdown) */}
            <div className="relative" ref={picDropdownRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> PIC (Person In Charge)
                </label>
                {selectedPICs.length > 0 && (
                  <span className="text-[10px] font-bold text-indigo-600">
                    {selectedPICs.length} dipilih
                  </span>
                )}
              </div>

              {/* Trigger Button (Matches User Screenshot Style) */}
              <button
                type="button"
                onClick={togglePICDropdown}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between shadow-2xs cursor-pointer ${
                  isPICDropdownOpen
                    ? 'border-indigo-500 bg-white ring-2 ring-indigo-100 text-slate-800'
                    : selectedPICs.length > 0
                    ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 hover:bg-indigo-50/70'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-800'
                }`}
              >
                <span className="truncate">
                  {selectedPICs.length > 0
                    ? `+ Pilih PIC dari Tim... (${selectedPICs.length} dipilih)`
                    : '+ Pilih PIC dari Tim...'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                    isPICDropdownOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {/* Searchable Floating Menu */}
              {isPICDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-40 animate-fadeIn space-y-2">
                  {/* Search Input with Icon */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={picSearchInputRef}
                      type="text"
                      placeholder="Cari nama host / admin..."
                      value={picSearchQuery}
                      onChange={(e) => setPicSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = picSearchQuery.trim();
                          if (trimmed) {
                            const exact = availablePICs.find(
                              (p) => p.name.toLowerCase() === trimmed.toLowerCase()
                            );
                            if (exact) {
                              handleTogglePIC(exact.name);
                            } else if (!selectedPICs.includes(trimmed)) {
                              setSelectedPICs([...selectedPICs, trimmed]);
                            }
                            setPicSearchQuery('');
                          }
                        }
                      }}
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs"
                    />
                    {picSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPicSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Filtered PIC List */}
                  {(() => {
                    const q = picSearchQuery.toLowerCase().trim();
                    const filtered = availablePICs.filter(
                      (p) =>
                        !q ||
                        p.name.toLowerCase().includes(q) ||
                        (p.role && p.role.toLowerCase().includes(q))
                    );

                    return (
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {filtered.length === 0 ? (
                          <div className="py-3 px-2 text-center text-xs space-y-2">
                            <p className="text-slate-400">
                              Tidak ditemukan anggota &quot;<strong>{picSearchQuery}</strong>&quot;
                            </p>
                            {picSearchQuery.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  const trimmed = picSearchQuery.trim();
                                  if (trimmed && !selectedPICs.includes(trimmed)) {
                                    setSelectedPICs([...selectedPICs, trimmed]);
                                  }
                                  setPicSearchQuery('');
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Plus className="w-3 h-3" />
                                Tambahkan &quot;{picSearchQuery.trim()}&quot; sebagai PIC
                              </button>
                            )}
                          </div>
                        ) : (
                          filtered.map((pic) => {
                            const isSelected = selectedPICs.includes(pic.name);
                            const isRoleAdmin = pic.role?.toLowerCase().includes('admin');
                            return (
                              <div
                                key={pic.id}
                                onClick={() => handleTogglePIC(pic.name)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs font-bold'
                                    : 'hover:bg-slate-50 text-slate-700 border border-transparent font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isRoleAdmin
                                        ? 'bg-indigo-600 text-white shadow-2xs'
                                        : 'bg-purple-600 text-white shadow-2xs'
                                    }`}
                                  >
                                    {pic.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="truncate leading-tight text-slate-800">{pic.name}</div>
                                    {pic.role && (
                                      <div className="text-[10px] text-slate-400 font-normal truncate">
                                        {pic.role}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0">
                                  {isSelected ? (
                                    <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md border border-slate-300 hover:border-indigo-400" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}

                  {/* Dropdown Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {selectedPICs.length > 0 ? `${selectedPICs.length} PIC dipilih` : 'Klik nama untuk memilih'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPICDropdownOpen(false)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
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
              {initialTask && initialTask.id && onDelete && (
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

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Tag,
  AlertCircle,
  Folder,
  RotateCcw,
  Check,
  Save,
  CheckCircle2,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  TaskCustomSettings,
  CustomTaskStatus,
  CustomTaskPriority,
  CustomTaskCategory,
  TaskThemeColor,
} from './types';
import {
  THEME_COLOR_MAP,
  COLOR_OPTIONS,
  DEFAULT_TASK_SETTINGS,
  getStatusMeta,
  getPriorityMeta,
  getCategoryMeta,
} from './taskTheme';

interface TaskSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TaskCustomSettings;
  onSaveSettings: (newSettings: TaskCustomSettings) => void;
  initialTab?: 'status' | 'priority' | 'category';
}

export const TaskSettingsModal: React.FC<TaskSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  initialTab = 'status',
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'priority' | 'category'>(initialTab);
  const [localSettings, setLocalSettings] = useState<TaskCustomSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  // New item inputs
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState<TaskThemeColor>('blue');
  const [newStatusIsCompleted, setNewStatusIsCompleted] = useState(false);

  const [newPriorityLabel, setNewPriorityLabel] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState<TaskThemeColor>('amber');

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<TaskThemeColor>('indigo');

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setActiveTab(initialTab);
      setSavedBadge(false);
    }
  }, [isOpen, settings, initialTab]);

  if (!isOpen) return null;

  // Persist helper
  const commitChanges = (updated: TaskCustomSettings) => {
    setLocalSettings(updated);
    setIsSaving(true);
    onSaveSettings(updated);
    setTimeout(() => {
      setIsSaving(false);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2500);
    }, 300);
  };

  // Status Handlers
  const handleAddStatus = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = newStatusLabel.trim();
    if (!cleanLabel) return;

    const newId = `status_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newStatus: CustomTaskStatus = {
      id: newId,
      label: cleanLabel,
      color: newStatusColor,
      isCompleted: newStatusIsCompleted,
    };

    const updated = {
      ...localSettings,
      statuses: [...localSettings.statuses, newStatus],
    };
    commitChanges(updated);
    setNewStatusLabel('');
    setNewStatusIsCompleted(false);
  };

  const handleUpdateStatus = (id: string, updates: Partial<CustomTaskStatus>) => {
    const updated = {
      ...localSettings,
      statuses: localSettings.statuses.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    };
    commitChanges(updated);
  };

  const handleDeleteStatus = (id: string) => {
    if (localSettings.statuses.length <= 1) {
      alert('Minimal harus ada satu status yang aktif.');
      return;
    }
    if (confirm('Hapus status ini? Task yang berstatus ini mungkin perlu disesuaikan.')) {
      const updated = {
        ...localSettings,
        statuses: localSettings.statuses.filter((s) => s.id !== id),
      };
      commitChanges(updated);
    }
  };

  // Priority Handlers
  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newPriorityLabel.trim();
    if (!clean) return;

    const newId = `prio_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newPrio: CustomTaskPriority = {
      id: newId,
      label: clean,
      color: newPriorityColor,
    };

    const updated = {
      ...localSettings,
      priorities: [...localSettings.priorities, newPrio],
    };
    commitChanges(updated);
    setNewPriorityLabel('');
  };

  const handleUpdatePriority = (id: string, updates: Partial<CustomTaskPriority>) => {
    const updated = {
      ...localSettings,
      priorities: localSettings.priorities.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    };
    commitChanges(updated);
  };

  const handleDeletePriority = (id: string) => {
    if (localSettings.priorities.length <= 1) {
      alert('Minimal harus ada satu tingkat prioritas.');
      return;
    }
    if (confirm('Hapus tingkat prioritas ini?')) {
      const updated = {
        ...localSettings,
        priorities: localSettings.priorities.filter((p) => p.id !== id),
      };
      commitChanges(updated);
    }
  };

  // Category Handlers
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategoryName.trim();
    if (!clean) return;

    const newId = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newCat: CustomTaskCategory = {
      id: newId,
      name: clean,
      color: newCategoryColor,
    };

    const updated = {
      ...localSettings,
      categories: [...localSettings.categories, newCat],
    };
    commitChanges(updated);
    setNewCategoryName('');
  };

  const handleUpdateCategory = (id: string, updates: Partial<CustomTaskCategory>) => {
    const updated = {
      ...localSettings,
      categories: localSettings.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    };
    commitChanges(updated);
  };

  const handleDeleteCategory = (id: string) => {
    if (localSettings.categories.length <= 1) {
      alert('Minimal harus ada satu kategori.');
      return;
    }
    if (confirm('Hapus kategori ini?')) {
      const updated = {
        ...localSettings,
        categories: localSettings.categories.filter((c) => c.id !== id),
      };
      commitChanges(updated);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Kembalikan semua Status, Prioritas, dan Kategori ke pengaturan standar bawaan sistem?')) {
      commitChanges(DEFAULT_TASK_SETTINGS);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto font-sans flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 z-10 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 leading-tight">
                Kustomisasi Status, Prioritas & Kategori
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                Tersimpan di database MySQL & sinkron di semua device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200/80 px-6 bg-slate-50/50 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            Status Task ({localSettings.statuses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('priority')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'priority'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Prioritas ({localSettings.priorities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('category')}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'category'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Folder className="w-4 h-4" />
            Kategori ({localSettings.categories.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* ================= TAB 1: STATUS ================= */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-[11px] text-indigo-900 leading-relaxed">
                Status task menentukan tahapan alur kerja di Kanban Card dan list filter. Anda bisa menambahkan tahapan custom baru (misal: <em>Revisi Script, Menunggu Client, Approval</em>) dan memilih tema warnanya.
              </div>

              {/* Status List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Daftar Status Saat Ini
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {localSettings.statuses.map((item) => {
                    const meta = getStatusMeta(item.id, localSettings);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 gap-2.5 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Live Color Badge */}
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border shrink-0 ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`}
                          >
                            {item.label}
                          </div>
                          {/* Edit Label Input */}
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateStatus(item.id, { label: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/40 focus:bg-white"
                          />
                        </div>

                        {/* Color Selector & Toggle Completed */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.color}
                            onChange={(e) =>
                              handleUpdateStatus(item.id, { color: e.target.value as TaskThemeColor })
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 cursor-pointer focus:outline-none focus:border-indigo-500"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          {/* Completed toggle checkbox */}
                          <label
                            title="Tandai status ini sebagai Tugas Selesai (Completed)"
                            className="flex items-center gap-1 text-[10px] font-bold text-slate-600 cursor-pointer bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200"
                          >
                            <input
                              type="checkbox"
                              checked={!!item.isCompleted}
                              onChange={(e) =>
                                handleUpdateStatus(item.id, { isCompleted: e.target.checked })
                              }
                              className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                            />
                            <span>Selesai</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleDeleteStatus(item.id)}
                            title="Hapus Status"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Status Form */}
              <form
                onSubmit={handleAddStatus}
                className="p-3.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" /> Tambah Status Baru
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nama status, misal: Revisi Script..."
                      value={newStatusLabel}
                      onChange={(e) => setNewStatusLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newStatusColor}
                      onChange={(e) => setNewStatusColor(e.target.value as TaskThemeColor)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!newStatusLabel.trim()}
                      className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambahkan
                    </button>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStatusIsCompleted}
                    onChange={(e) => setNewStatusIsCompleted(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Tandai status ini sebagai kategori <strong>Selesai (Completed)</strong></span>
                </label>
              </form>
            </div>
          )}

          {/* ================= TAB 2: PRIORITY ================= */}
          {activeTab === 'priority' && (
            <div className="space-y-4">
              <div className="bg-amber-50/60 border border-amber-100 p-3 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                Tingkat prioritas membantu tim menandai urgensi pekerjaan. Anda bisa menambah level prioritas khusus seperti <em>Kritis (P1), Penting, Sedang, Rendah</em>.
              </div>

              {/* Priority List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Daftar Prioritas Saat Ini
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {localSettings.priorities.map((item) => {
                    const meta = getPriorityMeta(item.id, localSettings);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 gap-2.5 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Live Badge Preview */}
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border shrink-0 flex items-center gap-1.5 ${meta.badgeBg} ${meta.badgeText} ${meta.badgeBorder}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
                            {item.label}
                          </div>
                          {/* Edit Label Input */}
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdatePriority(item.id, { label: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/40 focus:bg-white"
                          />
                        </div>

                        {/* Color Selector & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.color}
                            onChange={(e) =>
                              handleUpdatePriority(item.id, { color: e.target.value as TaskThemeColor })
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 cursor-pointer focus:outline-none focus:border-indigo-500"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeletePriority(item.id)}
                            title="Hapus Prioritas"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Priority Form */}
              <form
                onSubmit={handleAddPriority}
                className="p-3.5 rounded-xl border border-dashed border-amber-200 bg-amber-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-amber-600" /> Tambah Tingkat Prioritas Baru
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nama prioritas, misal: P1 - Kritis..."
                      value={newPriorityLabel}
                      onChange={(e) => setNewPriorityLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newPriorityColor}
                      onChange={(e) => setNewPriorityColor(e.target.value as TaskThemeColor)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={!newPriorityLabel.trim()}
                      className="w-full px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambahkan
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 3: CATEGORY ================= */}
          {activeTab === 'category' && (
            <div className="space-y-4">
              <div className="bg-purple-50/60 border border-purple-100 p-3 rounded-xl text-[11px] text-purple-900 leading-relaxed">
                Kategori mengelompokkan jenis task berdasarkan divisi atau kebutuhan operasional live studio (misal: <em>Live Production, Desain & Kreatif, Marketing, Logistik</em>).
              </div>

              {/* Category List */}
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Daftar Kategori Saat Ini
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {localSettings.categories.map((item) => {
                    const meta = getCategoryMeta(item.name, localSettings);
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 gap-2.5 transition-all shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {/* Live Category Pill Preview */}
                          <div
                            className={`px-2.5 py-1 rounded-lg text-xs font-black border shrink-0 ${meta.badgeBg} ${meta.badgeText} ${meta.borderColor}`}
                          >
                            {item.name}
                          </div>
                          {/* Edit Name Input */}
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateCategory(item.id, { name: e.target.value })}
                            className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 bg-slate-50/40 focus:bg-white"
                          />
                        </div>

                        {/* Color Selector & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={item.color || 'indigo'}
                            onChange={(e) =>
                              handleUpdateCategory(item.id, { color: e.target.value as TaskThemeColor })
                            }
                            className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700 bg-slate-50 cursor-pointer focus:outline-none focus:border-indigo-500"
                          >
                            {COLOR_OPTIONS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(item.id)}
                            title="Hapus Kategori"
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Category Form */}
              <form
                onSubmit={handleAddCategory}
                className="p-3.5 rounded-xl border border-dashed border-purple-200 bg-purple-50/30 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-600" /> Tambah Kategori Baru
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nama kategori, misal: Talent & Host..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value as TaskThemeColor)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      disabled={!newCategoryName.trim()}
                      className="w-full px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambahkan
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset ke Standar
            </button>

            {savedBadge && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5" /> Tersimpan ke Database
              </span>
            )}
            {isSaving && (
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                Menyimpan...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

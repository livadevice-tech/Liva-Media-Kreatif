import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, Tag, AlertCircle, Sparkles, Globe, Lock, Check } from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority, TaskVisibility, UserAccount } from '../../types/app';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  initialTask?: Partial<Task> | null;
  projects: Project[];
  defaultStatus?: TaskStatus;
  currentUser?: UserAccount | null;
}

const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
  { id: 'low', label: 'Rendah (Low)', color: 'text-slate-400 border-slate-700' },
  { id: 'medium', label: 'Sedang (Medium)', color: 'text-blue-400 border-blue-500/30' },
  { id: 'high', label: 'Tinggi (High)', color: 'text-amber-400 border-amber-500/30' },
  { id: 'urgent', label: 'Mendesak (Urgent)', color: 'text-rose-400 border-rose-500/30' },
];

const STATUSES: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do (Antrean)' },
  { id: 'in_progress', label: 'In Progress (Dikerjakan)' },
  { id: 'review', label: 'In Review (Pemeriksaan)' },
  { id: 'done', label: 'Done (Selesai)' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  projects,
  defaultStatus = 'todo',
  currentUser,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    project_id: projects[0]?.id || '',
    status: defaultStatus,
    priority: 'medium',
    visibility: 'public',
    assignee_name: '',
    due_date: new Date().toISOString().slice(0, 10),
    description: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setFormData({
        ...initialTask,
        visibility: initialTask.visibility || 'public',
        due_date: initialTask.due_date ? initialTask.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      });
    } else {
      setFormData({
        title: '',
        project_id: projects[0]?.id || '',
        status: defaultStatus,
        priority: 'medium',
        visibility: 'public',
        assignee_name: '',
        due_date: new Date().toISOString().slice(0, 10),
        description: '',
        tags: '',
      });
    }
  }, [initialTask, projects, defaultStatus]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {formData.id ? 'Edit Tugas Karyawan' : 'Tambah Tugas Baru'}
              </h3>
              <p className="text-xs text-slate-400">Rencanakan tugas harian dan penanggung jawab</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Task Title */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Judul Tugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Desain 5 Slide Carousel Edukasi Skincare"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
          </div>

          {/* Project & Assignee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Pilih Proyek</label>
              <select
                value={formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
              >
                <option value="">Tanpa Proyek Khusus</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">PIC / Karyawan</label>
              <input
                type="text"
                value={formData.assignee_name || ''}
                onChange={(e) => setFormData({ ...formData, assignee_name: e.target.value })}
                placeholder="Nama karyawan (misal: Bayu)"
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Kolom Status</label>
              <select
                value={formData.status || 'todo'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tingkat Prioritas</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visibility Selector: Public vs Private */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-semibold text-slate-300">
                Akses Visibilitas Task
              </label>
              {formData.visibility === 'private' && (
                <span className="text-[10px] bg-purple-900/60 text-purple-300 border border-purple-700/50 font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Khusus Master Admin
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Opsi Public */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'public' })}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.visibility !== 'private'
                    ? 'bg-blue-950/40 border-blue-500/70 ring-1 ring-blue-500/40 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  formData.visibility !== 'private' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Public (Semua Role)</span>
                    {formData.visibility !== 'private' && <Check className="w-3.5 h-3.5 text-blue-400 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Dapat dilihat oleh semua role tim di papan Kanban & Kalender.
                  </p>
                </div>
              </button>

              {/* Opsi Private */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser && currentUser.role !== 'Master Admin') {
                    alert('Perhatian: Fitur Private Task hanya berlaku dan dapat diakses oleh role Master Admin.');
                  }
                  setFormData({ ...formData, visibility: 'private' });
                }}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  formData.visibility === 'private'
                    ? 'bg-purple-950/40 border-purple-500/70 ring-1 ring-purple-500/40 text-purple-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  formData.visibility === 'private' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Private (Master Admin)</span>
                    {formData.visibility === 'private' && <Check className="w-3.5 h-3.5 text-purple-400 stroke-[3]" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                    Hanya dapat dilihat dan diakses oleh akun <strong className="text-purple-300">Master Admin</strong>.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Tenggat Waktu (Deadline)</label>
            <input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Deskripsi / Catatan Tambahan</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instruksi detail pekerjaan atau referensi link..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              {saving && <span className="animate-spin mr-1">⏳</span>}
              <span>{formData.id ? 'Simpan Tugas' : 'Buat Tugas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

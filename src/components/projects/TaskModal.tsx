import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, User, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { Task, Project, TaskStatus, TaskPriority } from '../../types/app';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => Promise<void>;
  initialTask?: Partial<Task> | null;
  projects: Project[];
  defaultStatus?: TaskStatus;
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
    if (initialTask) {
      setFormData({
        ...initialTask,
        due_date: initialTask.due_date ? initialTask.due_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
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

import React, { useState, useEffect } from 'react';
import { X, FolderKanban } from 'lucide-react';
import { Project, Brand, ProjectStatus, TaskPriority } from '../../types/app';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void>;
  initialProject?: Partial<Project> | null;
  brands: Brand[];
}

const COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Sky Blue', value: '#0ea5e9' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Amber', value: '#f59e0b' },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
  brands,
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    brand_id: brands[0]?.id || '',
    status: 'in_progress',
    priority: 'medium',
    progress: 0,
    color: '#6366f1',
    description: '',
    start_date: new Date().toISOString().slice(0, 10),
    due_date: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialProject) {
      setFormData({
        ...initialProject,
        start_date: initialProject.start_date ? initialProject.start_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
        due_date: initialProject.due_date ? initialProject.due_date.slice(0, 10) : '',
      });
    } else {
      setFormData({
        title: '',
        brand_id: brands[0]?.id || '',
        status: 'in_progress',
        priority: 'medium',
        progress: 0,
        color: '#6366f1',
        description: '',
        start_date: new Date().toISOString().slice(0, 10),
        due_date: '',
      });
    }
  }, [initialProject, brands]);

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {formData.id ? 'Edit Data Proyek' : 'Buat Proyek Baru'}
              </h3>
              <p className="text-xs text-slate-400">Atur tujuan kampanye dan alur kerja tim</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Nama Proyek / Kampanye <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: Kampanye 9.9 Mega Super Brand Sale"
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Brand / Klien</label>
              <select
                value={formData.brand_id || ''}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
              >
                <option value="">Pilih Brand...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Status Proyek</label>
              <select
                value={formData.status || 'in_progress'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs cursor-pointer"
              >
                <option value="planning">Perencanaan (Planning)</option>
                <option value="in_progress">Sedang Berjalan (In Progress)</option>
                <option value="review">Tahap Review Klien</option>
                <option value="completed">Selesai (Completed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Warna Aksen Proyek</label>
            <div className="flex items-center space-x-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  style={{ backgroundColor: c.value }}
                  className={`w-7 h-7 rounded-lg transition-transform ${
                    formData.color === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">Target Selesai (Deadline)</label>
              <input
                type="date"
                value={formData.due_date || ''}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tujuan proyek, target KPI, atau catatan tim..."
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

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
              <span>{formData.id ? 'Simpan Perubahan' : 'Buat Proyek'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

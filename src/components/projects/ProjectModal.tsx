import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderKanban, 
  Trash2, 
  AlertTriangle,
  Calendar, 
  Tag, 
  Plus, 
  Check, 
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Project, Brand, ProjectStatus, TaskPriority } from '../../types/app';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialProject?: Partial<Project> | null;
  initialData?: Partial<Project> | null;
  projects?: Project[];
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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; badge: string }> = {
  planning: { label: 'Perencanaan', badge: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'Sedang Berjalan', badge: 'bg-blue-50 text-blue-700 border border-blue-200' },
  review: { label: 'Review Klien', badge: 'bg-purple-50 text-purple-700 border border-purple-200' },
  completed: { label: 'Selesai', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialProject,
  initialData,
  projects = [],
  brands,
}) => {
  const currentInitial = initialData !== undefined ? initialData : initialProject;
  
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    project_type: 'Client',
    status: 'in_progress',
    priority: 'medium',
    color: '#0ea5e9',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isConfirmDeleteProject, setIsConfirmDeleteProject] = useState(false);

  useEffect(() => {
    if (currentInitial) {
      setFormData({
        ...currentInitial,
        project_type: currentInitial.project_type || 'Client',
      });
      setActiveTab('form');
    } else {
      setFormData({
        title: '',
        project_type: 'Client',
        status: 'in_progress',
        priority: 'medium',
        color: '#0ea5e9',
      });
    }
  }, [currentInitial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;

    setSaving(true);
    try {
      const type = formData.project_type || 'Client';
      const color = type === 'Internal' ? '#6366f1' : '#0ea5e9';
      await onSave({
        ...formData,
        project_type: type,
        color: formData.color || color,
        status: formData.status || 'in_progress',
        priority: formData.priority || 'medium',
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!formData.id || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(formData.id);
      setIsConfirmDeleteProject(false);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectToEdit = (proj: Project) => {
    setFormData({
      ...proj,
      project_type: proj.project_type || 'Client',
    });
    setActiveTab('form');
  };

  const handleAddNewProject = () => {
    setFormData({
      title: '',
      project_type: 'Client',
      status: 'in_progress',
      priority: 'medium',
      color: '#0ea5e9',
    });
    setActiveTab('form');
  };

  return (
    <aside className="w-80 lg:w-[380px] shrink-0 border-l border-slate-200/90 bg-white flex flex-col h-full z-20 shadow-[-4px_0_20px_rgba(0,0,0,0.02)] transition-all">
      {/* Header */}
      <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-800 tracking-tight">
              {formData.id ? 'Edit Data Proyek' : 'Buat Proyek Baru'}
            </h3>
            <p className="text-[10px] text-slate-400">Atur tujuan kampanye dan alur kerja</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Tutup Sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs Switcher */}
      {projects.length > 0 && (
        <div className="px-5 pt-3 pb-0 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {formData.id ? 'Edit Proyek' : 'Form Proyek'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'list'
                  ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Daftar Proyek</span>
              <span className="px-1.5 py-0.2 bg-slate-100 rounded-full text-[10px] text-slate-600">
                {projects.length}
              </span>
            </button>
          </div>

          {activeTab === 'list' && (
            <button
              type="button"
              onClick={handleAddNewProject}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pb-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Baru</span>
            </button>
          )}
        </div>
      )}

      {/* Tab: Project List */}
      {activeTab === 'list' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {projects.map((proj) => {
            const statusInfo = STATUS_CONFIG[proj.status] || STATUS_CONFIG.in_progress;
            const isSelected = formData.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => handleSelectToEdit(proj)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50/40 shadow-xs'
                    : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: proj.color || '#6366f1' }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600">
                      {proj.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${
                        proj.project_type === 'Internal'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {proj.project_type === 'Internal' ? 'Internal' : 'Client'}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold ${statusInfo.badge}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-slate-400 group-hover:text-slate-600 pl-2">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Tab: Form */
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* Nama Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Nama Project <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Kampanye 9.9 Mega Super Brand Sale"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Jenis Project (Internal / Client) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis Project <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, project_type: 'Internal' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    formData.project_type === 'Internal'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-800">Internal</span>
                    {formData.project_type === 'Internal' && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 leading-snug">
                    Proyek tim internal Liva Media
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, project_type: 'Client' })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    (formData.project_type || 'Client') === 'Client'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-slate-800">Client</span>
                    {(formData.project_type || 'Client') === 'Client' && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 leading-snug">
                    Proyek brand / klien eksternal
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
            {formData.id && onDelete ? (
              <button
                type="button"
                onClick={() => setIsConfirmDeleteProject(true)}
                disabled={deleting}
                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Hapus Proyek"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || !formData.title}
                className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span>
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>{formData.id ? 'Simpan Perubahan' : 'Buat Proyek'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* In-App Confirmation Modal: Delete Project */}
      {isConfirmDeleteProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-2xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              Hapus Proyek Ini?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Apakah Anda yakin ingin menghapus proyek <strong>"{formData.title}"</strong>? Semua task yang terhubung ke proyek ini juga akan dihapus.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteProject(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Proyek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

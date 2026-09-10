import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Briefcase, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Trash2, 
  Check, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types/app';

interface AccountInspectorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<UserAccount>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  account: Partial<UserAccount> | null;
}

const ROLES: { id: UserRole; label: string; desc: string; badge: string; border: string }[] = [
  { 
    id: 'Master Admin', 
    label: 'Master Admin', 
    desc: 'Akses penuh ke seluruh sistem, konfigurasi, dan database.',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    border: 'border-purple-500'
  },
  { 
    id: 'Admin', 
    label: 'Admin', 
    desc: 'Mengelola jadwal konten, tugas proyek, dan pelaporan tim.',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    border: 'border-indigo-500'
  },
  { 
    id: 'Staff', 
    label: 'Staff', 
    desc: 'Operasional harian: mengerjakan tugas dan jadwal konten terkait.',
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    border: 'border-slate-500'
  },
];

export const AccountInspectorPanel: React.FC<AccountInspectorPanelProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  account,
}) => {
  const [formData, setFormData] = useState<Partial<UserAccount>>({
    username: '',
    password: '',
    full_name: '',
    position: '',
    role: 'Staff',
    is_active: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        ...account,
        username: account.username || '',
        password: '', // leave blank when editing
        full_name: account.full_name || '',
        position: account.position || '',
        role: account.role || 'Staff',
        is_active: account.is_active !== false,
      });
    } else {
      setFormData({
        username: '',
        password: '',
        full_name: '',
        position: '',
        role: 'Staff',
        is_active: true,
      });
    }
  }, [account]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username?.trim() || !formData.full_name?.trim() || !formData.position?.trim()) {
      alert('Mohon lengkapi username, nama lengkap, dan posisi.');
      return;
    }

    if (!formData.id && !formData.password?.trim()) {
      alert('Password wajib diisi untuk akun baru.');
      return;
    }

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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {formData.id ? 'Edit Akun Karyawan' : 'Tambah Akun Baru'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Hak akses dan profil pengguna</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          {/* Username */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Username *
            </label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <span className="text-xs font-semibold text-slate-400 mr-1 select-none">@</span>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                placeholder="namauser"
                className="w-full text-xs font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none"
                required
                autoFocus
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Digunakan untuk login ke sistem (huruf kecil tanpa spasi)</span>
          </div>

          {/* Password */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Password {formData.id ? '(Opsional)' : '*'}
            </label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <KeyRound className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={formData.id ? 'Kosongkan jika tidak diganti' : 'Minimal 6 karakter'}
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none"
                required={!formData.id}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 ml-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Nama Lengkap *
            </label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="misal: Galang Taufik"
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Posisi / Jabatan */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Posisi / Jabatan *
            </label>
            <div className="flex items-center px-3.5 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Briefcase className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="misal: Content Lead / Video Editor"
                className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent border-none focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Role Akun */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Role Akun *
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => {
                const isSelected = formData.role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setFormData({ ...formData, role: r.id })}
                    className={`p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${r.badge}`}>
                          {r.label}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {r.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Aktif Toggle */}
          <div className="pt-1">
            <label className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl cursor-pointer select-none">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Status Akun Aktif</span>
                <span className="text-[10px] text-slate-500">Akun aktif dapat masuk dan ditugaskan pekerjaan</span>
              </div>
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2 shrink-0">
          {formData.id && onDelete ? (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Yakin ingin menghapus akun @${formData.username}?`)) {
                  onDelete(formData.id!);
                  onClose();
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Hapus Akun"
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
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4f46e5] hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              {saving ? 'Menyimpan...' : formData.id ? 'Simpan Perubahan' : 'Buat Akun'}
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
};

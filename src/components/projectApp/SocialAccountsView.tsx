import React, { useState } from 'react';
import { 
  Plus, 
  ExternalLink, 
  User, 
  Trash2, 
  Edit, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  TrendingUp,
  X,
  Target
} from 'lucide-react';
import { SocialAccount, Brand, PlatformType } from '../../types/projectApp';

interface SocialAccountsViewProps {
  accounts: SocialAccount[];
  brands: Brand[];
  loading: boolean;
  onSaveAccount: (accountData: Partial<SocialAccount>) => Promise<void>;
  onDeleteAccount: (accountId: string) => void;
}

const PLATFORM_CONFIG: Record<PlatformType, { name: string; bg: string; text: string; ring: string }> = {
  instagram: { name: 'Instagram', bg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600', text: 'text-white', ring: 'ring-rose-400/30' },
  tiktok: { name: 'TikTok', bg: 'bg-slate-900', text: 'text-white', ring: 'ring-cyan-400/30' },
  youtube: { name: 'YouTube', bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-400/30' },
  facebook: { name: 'Facebook', bg: 'bg-blue-600', text: 'text-white', ring: 'ring-blue-400/30' },
  twitter: { name: 'X (Twitter)', bg: 'bg-slate-800', text: 'text-white', ring: 'ring-slate-400/30' },
  linkedin: { name: 'LinkedIn', bg: 'bg-sky-700', text: 'text-white', ring: 'ring-sky-400/30' },
};

export const SocialAccountsView: React.FC<SocialAccountsViewProps> = ({
  accounts,
  brands,
  loading,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);

  const [form, setForm] = useState<{
    id?: string;
    brand_id: string;
    platform: PlatformType;
    handle: string;
    profile_url: string;
    pic_name: string;
    followers_count: number;
    monthly_target_posts: number;
    status: 'active' | 'inactive' | 'review';
    notes: string;
  }>({
    brand_id: brands[0]?.id || '',
    platform: 'instagram',
    handle: '',
    profile_url: '',
    pic_name: '',
    followers_count: 1000,
    monthly_target_posts: 30,
    status: 'active',
    notes: '',
  });

  const filteredAccounts = selectedBrandId === 'all'
    ? accounts
    : accounts.filter(a => a.brand_id === selectedBrandId);

  const handleOpenNew = () => {
    setEditingAccount(null);
    setForm({
      brand_id: selectedBrandId !== 'all' ? selectedBrandId : (brands[0]?.id || ''),
      platform: 'instagram',
      handle: '',
      profile_url: '',
      pic_name: '',
      followers_count: 1000,
      monthly_target_posts: 30,
      status: 'active',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: SocialAccount) => {
    setEditingAccount(acc);
    setForm({
      id: acc.id,
      brand_id: acc.brand_id,
      platform: acc.platform,
      handle: acc.handle,
      profile_url: acc.profile_url || '',
      pic_name: acc.pic_name || '',
      followers_count: acc.followers_count,
      monthly_target_posts: acc.monthly_target_posts,
      status: acc.status,
      notes: acc.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.handle.trim()) return;
    await onSaveAccount(form);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Filter Brand:</span>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Brand ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Menampilkan <strong className="text-slate-800">{filteredAccounts.length}</strong> akun aktif
          </span>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Grid of Social Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAccounts.map((acc) => {
          const cfg = PLATFORM_CONFIG[acc.platform] || PLATFORM_CONFIG.instagram;

          return (
            <div
              key={acc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden group"
            >
              {/* Top Accent Platform Line */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${cfg.bg}`} />

              <div className="flex items-start justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${cfg.bg} ${cfg.text} flex items-center justify-center font-black text-sm shadow-md ring-2 ${cfg.ring}`}>
                    {acc.platform.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      {acc.brand_name || 'Brand'}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {acc.handle}
                    </h3>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  acc.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  acc.status === 'review' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {acc.status}
                </span>
              </div>

              {/* Followers & Monthly Target Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                    Followers
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {acc.followers_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3 h-3 text-rose-500" />
                    Target Post
                  </span>
                  <p className="text-base font-black text-slate-900 mt-0.5">
                    {acc.monthly_target_posts} <span className="text-[10px] font-normal text-slate-400">/bln</span>
                  </p>
                </div>
              </div>

              {/* PIC and Notes */}
              <div className="text-xs space-y-1 text-slate-600">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">PIC / Handler:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-indigo-500" />
                    {acc.pic_name || 'Belum ditentukan'}
                  </span>
                </div>
                {acc.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100 line-clamp-1">
                    "{acc.notes}"
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {acc.profile_url ? (
                  <a
                    href={acc.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>Kunjungi Profil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Tidak ada URL</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Edit Akun"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteAccount(acc.id)}
                    className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredAccounts.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Belum ada akun media sosial yang terdaftar untuk filter ini.
          </div>
        )}
      </div>

      {/* Modal Add / Edit Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingAccount ? 'Edit Akun Media Sosial' : 'Tambah Akun Medsos Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Klien *</label>
                  <select
                    value={form.brand_id}
                    onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Platform *</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as PlatformType })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Handle / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: @livamedianetwork"
                  value={form.handle}
                  onChange={(e) => setForm({ ...form, handle: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Profile Link URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/livamedianetwork"
                  value={form.profile_url}
                  onChange={(e) => setForm({ ...form, profile_url: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Followers Saat Ini</label>
                  <input
                    type="number"
                    value={form.followers_count}
                    onChange={(e) => setForm({ ...form, followers_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Post/Bulan</label>
                  <input
                    type="number"
                    value={form.monthly_target_posts}
                    onChange={(e) => setForm({ ...form, monthly_target_posts: parseInt(e.target.value) || 20 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIC / Handler Akun</label>
                  <input
                    type="text"
                    placeholder="Nama PIC (mis: Sarah)"
                    value={form.pic_name}
                    onChange={(e) => setForm({ ...form, pic_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="review">Review / Warning</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Target persona, waktu posting favorit, dll."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

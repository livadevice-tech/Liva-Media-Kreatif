import React, { useState } from 'react';
import { Plus, Edit, Trash2, Building2, MessageSquare, Target, X, Palette } from 'lucide-react';
import { Brand } from '../../types/projectApp';

interface BrandsViewProps {
  brands: Brand[];
  loading: boolean;
  onSaveBrand: (brandData: Partial<Brand>) => Promise<void>;
  onDeleteBrand: (brandId: string) => void;
}

export const BrandsView: React.FC<BrandsViewProps> = ({
  brands,
  loading,
  onSaveBrand,
  onDeleteBrand,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [form, setForm] = useState<{
    id?: string;
    name: string;
    logo_url: string;
    color: string;
    tone_of_voice: string;
    target_audience: string;
  }>({
    name: '',
    logo_url: '',
    color: '#6366f1',
    tone_of_voice: '',
    target_audience: '',
  });

  const handleOpenNew = () => {
    setEditingBrand(null);
    setForm({
      name: '',
      logo_url: '',
      color: '#6366f1',
      tone_of_voice: '',
      target_audience: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      id: brand.id,
      name: brand.name,
      logo_url: brand.logo_url || '',
      color: brand.color || '#6366f1',
      tone_of_voice: brand.tone_of_voice || '',
      target_audience: brand.target_audience || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await onSaveBrand(form);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="font-extrabold text-base text-slate-900">Direktori Brand & Klien</h2>
          <p className="text-xs text-slate-400">Atur pedoman suara brand, audiens sasaran, dan identitas visual</p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Brand Baru</span>
        </button>
      </div>

      {/* Brands Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all space-y-4 relative overflow-hidden group"
          >
            {/* Top Accent Strip */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5" 
              style={{ backgroundColor: brand.color || '#6366f1' }}
            />

            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-2xl text-white font-extrabold text-lg flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: brand.color || '#6366f1' }}
                  >
                    {brand.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {brand.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{brand.accounts_count || 0} Akun Medsos</span>
                    <span>•</span>
                    <span>{brand.projects_count || 0} Proyek</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(brand)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteBrand(brand.id)}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tone of Voice */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-indigo-500" />
                  Tone of Voice
                </span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {brand.tone_of_voice || 'Belum didefinisikan'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3 h-3 text-rose-500" />
                  Target Audiens
                </span>
                <p className="text-slate-700 font-medium mt-0.5">
                  {brand.target_audience || 'Belum didefinisikan'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Brand */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingBrand ? 'Edit Brand' : 'Tambah Brand Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Brand *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Wardah Official"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Warna Aksen</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                    />
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tone of Voice (Karakter Tulisan)</label>
                <textarea
                  rows={2}
                  placeholder="Inspiratif, ramah, edukatif, bersahabat..."
                  value={form.tone_of_voice}
                  onChange={(e) => setForm({ ...form, tone_of_voice: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audiens</label>
                <textarea
                  rows={2}
                  placeholder="Gen-Z, mahasiswi usia 18-24 tahun..."
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
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
                  Simpan Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

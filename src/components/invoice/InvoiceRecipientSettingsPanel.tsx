import React, { useState, useEffect } from 'react';
import { Users, Save, CheckCircle2 } from 'lucide-react';
import { ClientBrand } from '../../types';

interface InvoiceRecipientSettingsPanelProps {
  clientBrands: ClientBrand[];
  onUpdateBrand: (updatedBrand: ClientBrand) => void;
}

export const InvoiceRecipientSettingsPanel: React.FC<InvoiceRecipientSettingsPanelProps> = ({
  clientBrands,
  onUpdateBrand
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [formData, setFormData] = useState({
    companyName: '',
    picName: '',
    picPhone: '',
    picEmail: '',
    companyAddress: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync form data when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      const brand = clientBrands.find(b => b.id === selectedBrandId);
      if (brand) {
        setFormData({
          companyName: brand.companyName || '',
          picName: brand.picName || '',
          picPhone: brand.picPhone || '',
          picEmail: brand.picEmail || '',
          companyAddress: brand.companyAddress || ''
        });
      }
    } else {
      setFormData({
        companyName: '',
        picName: '',
        picPhone: '',
        picEmail: '',
        companyAddress: ''
      });
    }
    setShowSuccess(false);
  }, [selectedBrandId, clientBrands]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setShowSuccess(false);
  };

  const handleSave = () => {
    if (!selectedBrandId) return;
    
    const brand = clientBrands.find(b => b.id === selectedBrandId);
    if (!brand) return;

    setIsSaving(true);
    
    const updatedBrand: ClientBrand = {
      ...brand,
      companyName: formData.companyName,
      picName: formData.picName,
      picPhone: formData.picPhone,
      picEmail: formData.picEmail,
      companyAddress: formData.companyAddress
    };

    // Callback handles API saving
    onUpdateBrand(updatedBrand);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-3xl animate-fadeIn mt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 border-b border-slate-100 pb-4 gap-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" /> Informasi Kepada (Recipient)
        </h3>
        
        <div className="w-full sm:w-64">
          <select
            value={selectedBrandId}
            onChange={(e) => setSelectedBrandId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer"
          >
            <option value="">-- Pilih Brand --</option>
            {clientBrands.map(brand => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedBrandId ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Users className="w-12 h-12 mb-3 text-slate-300" />
          <p className="font-medium text-sm">Pilih brand terlebih dahulu untuk mengatur detail penerima invoice.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nama PT</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-semibold bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="Contoh: PT Liva Kreatif"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kepada (PIC)</label>
              <input
                type="text"
                name="picName"
                value={formData.picName}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-semibold bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="Nama PIC (Penerima)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">No. Telp PIC</label>
              <input
                type="text"
                name="picPhone"
                value={formData.picPhone}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-semibold bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="0812xxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Pengirim (opsional)</label>
              <input
                type="email"
                name="picEmail"
                value={formData.picEmail}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-semibold bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                placeholder="email@perusahaan.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Detail Alamat Lengkap</label>
            <textarea
              name="companyAddress"
              value={formData.companyAddress}
              onChange={handleChange}
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 font-semibold bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none resize-y"
              placeholder="Jalan, Gedung, Kota, dsb."
            />
          </div>

          <div className="pt-4 flex items-center justify-end">
            {showSuccess && (
              <span className="flex items-center text-emerald-600 font-bold text-sm mr-4 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Tersimpan
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? 'Menyimpan...' : 'Simpan Detail'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

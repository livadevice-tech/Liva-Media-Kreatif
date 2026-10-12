import React from 'react';
import { Image as ImageIcon, Settings, Trash2, UploadCloud, Building2, MapPin, Mail, Phone, Globe, UserCheck, Sliders, ShieldCheck } from 'lucide-react';

export type InvoiceSettings = {
  logoUrl: string;
  signatureUrl: string;
  signatureSize?: number;
  signatureName: string;
  signatureTitle?: string;
  meteraiUrl?: string;
  meteraiSize?: number;
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyWebsite?: string;
  signeeCity?: string;
  accountNo: string;
  accountName: string;
  bankName: string;
  termsAndConditions?: string;
};

type InvoiceSettingsPanelProps = {
  invoiceSettings: InvoiceSettings;
  onInvoiceSettingsChange: (settings: InvoiceSettings) => void;
  onSaveSettings: (settings: InvoiceSettings) => void;
  onImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "signatureUrl" | "meteraiUrl",
  ) => void;
};

export const InvoiceSettingsPanel: React.FC<InvoiceSettingsPanelProps> = ({
  invoiceSettings,
  onInvoiceSettingsChange,
  onSaveSettings,
  onImageUpload,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" /> Pengaturan Identitas & Format Nota Invoice
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Sesuaikan data penerbit, logo, tanda tangan, materai elektronik, dan syarat ketentuan standar PT. Liva Media Kreatif
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Section 1: Logo, Signature & Materai Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Logo */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Logo Perusahaan (Opsional)
            </label>

            {invoiceSettings.logoUrl ? (
              <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                <img src={invoiceSettings.logoUrl} className="max-h-20 object-contain" alt="Logo" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => onInvoiceSettingsChange({ ...invoiceSettings, logoUrl: "" })}
                    className="bg-rose-500 text-white rounded-xl p-2 hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-500">Unggah Gambar Logo (Max 2MB)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center px-2">Biarkan kosong untuk menggunakan logo vektor Liva default</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'logoUrl')} />
              </label>
            )}
          </div>

          {/* Card 2: Tanda Tangan & Stempel */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-500" /> Tanda Tangan & Stempel Resmi
            </label>
            {invoiceSettings.signatureUrl ? (
              <div className="relative group rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                <img src={invoiceSettings.signatureUrl} className="max-h-20 object-contain" alt="Signature" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    onClick={() => onInvoiceSettingsChange({ ...invoiceSettings, signatureUrl: "" })}
                    className="bg-rose-500 text-white rounded-xl p-2 hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-500">Unggah Stempel / TTD (Max 2MB)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 text-center px-2">Biarkan kosong untuk stempel digital Liva default</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'signatureUrl')} />
              </label>
            )}

            {/* Signature Size Setting */}
            <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Tinggi TTD di PDF:
                </label>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-indigo-700 shadow-2xs">
                  {invoiceSettings.signatureSize || 65}px
                </span>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">30px</span>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="5"
                  value={invoiceSettings.signatureSize || 65}
                  onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, signatureSize: Number(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
                <span className="text-[10px] font-bold text-slate-400">180px</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {[
                  { label: 'Kecil', size: 45 },
                  { label: 'Standar', size: 65 },
                  { label: 'Sedang', size: 90 },
                  { label: 'Besar', size: 120 },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => onInvoiceSettingsChange({ ...invoiceSettings, signatureSize: preset.size })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      (invoiceSettings.signatureSize || 65) === preset.size
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label} ({preset.size}px)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Materai Elektronik / e-Meterai */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-500" /> Materai Elektronik (e-Meterai)
            </label>
            {invoiceSettings.meteraiUrl ? (
              <div className="relative group rounded-2xl border border-rose-200 bg-rose-50/30 p-4 flex items-center justify-center min-h-[120px]">
                <img
                  src={invoiceSettings.meteraiUrl}
                  className="max-h-20 object-contain drop-shadow-2xs"
                  alt="e-Meterai"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onInvoiceSettingsChange({ ...invoiceSettings, meteraiUrl: "" })}
                    className="bg-rose-500 text-white rounded-xl p-2 hover:bg-rose-600 transition-colors cursor-pointer shadow-sm"
                    title="Hapus Materai"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-rose-200/90 rounded-2xl bg-rose-50/20 hover:bg-rose-50/50 hover:border-rose-400 transition-all cursor-pointer text-center p-3">
                <UploadCloud className="w-6 h-6 text-rose-500 mb-1.5" />
                <span className="text-xs font-bold text-slate-700">Unggah PNG Materai (Max 2MB)</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Format transparan PNG (misal e-Meterai 10000)
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => onImageUpload(e, 'meteraiUrl')}
                />
              </label>
            )}

            {/* Materai Size Setting */}
            <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-rose-500" />
                  Tinggi Materai di PDF:
                </label>
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-white border border-slate-200 text-rose-600 shadow-2xs">
                  {invoiceSettings.meteraiSize || 75}px
                </span>
              </div>

              {/* Slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">40px</span>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="5"
                  value={invoiceSettings.meteraiSize || 75}
                  onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, meteraiSize: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                />
                <span className="text-[10px] font-bold text-slate-400">150px</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                {[
                  { label: 'Kecil', size: 55 },
                  { label: 'Standar', size: 75 },
                  { label: 'Proporsional', size: 90 },
                  { label: 'Besar', size: 110 },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => onInvoiceSettingsChange({ ...invoiceSettings, meteraiSize: preset.size })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      (invoiceSettings.meteraiSize || 75) === preset.size
                        ? 'bg-rose-500 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label} ({preset.size}px)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Comparison Preview: Materai + Tanda Tangan */}
        {(invoiceSettings.meteraiUrl || invoiceSettings.signatureUrl) && (
          <div className="p-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-rose-50/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Simulasi Posisi Pengesahan Nota (Materai & Stempel / TTD)
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Sesuai tata letak PDF resmi
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Materai diposisikan di sisi kiri, berdampingan dengan stempel & tanda tangan resmi pada nota invoice:
            </p>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-end gap-5 min-h-[95px]">
              {invoiceSettings.meteraiUrl && (
                <div className="flex flex-col items-center">
                  <img
                    src={invoiceSettings.meteraiUrl}
                    alt="Simulasi Materai"
                    style={{ height: `${invoiceSettings.meteraiSize || 75}px`, maxHeight: '140px' }}
                    className="object-contain drop-shadow-2xs"
                  />
                  <span className="text-[9px] font-bold text-rose-500 mt-1">Materai ({invoiceSettings.meteraiSize || 75}px)</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                {invoiceSettings.signatureUrl ? (
                  <img
                    src={invoiceSettings.signatureUrl}
                    alt="Simulasi TTD"
                    style={{ height: `${invoiceSettings.signatureSize || 65}px`, maxHeight: '140px' }}
                    className="object-contain"
                  />
                ) : (
                  <div className="border-2 border-dashed border-rose-500/70 rounded-lg px-4 py-1 text-center rotate-[-3deg] bg-rose-50/40">
                    <div className="text-[12px] font-black text-rose-600 uppercase tracking-wider leading-none">LIVA</div>
                    <div className="text-[8px] font-bold text-rose-500 leading-none mt-0.5">PT. LIVA MEDIA KREATIF</div>
                  </div>
                )}
                <span className="text-[9px] font-bold text-indigo-600 mt-1">TTD & Stempel ({invoiceSettings.signatureSize || 65}px)</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Identitas Perusahaan */}
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" /> Identitas Penerbit Tagihan (Header Invoice)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nama Perusahaan Penerbit</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="PT. Liva Media Kreatif"
                value={invoiceSettings.companyName || "PT. Liva Media Kreatif"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Kota Penerbitan Dokumen</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="Bandar Lampung"
                value={invoiceSettings.signeeCity || "Bandar Lampung"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, signeeCity: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Resmi Kantor</label>
            <textarea
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
              placeholder="Villa Bukit Tirtayasa Blok G2 No.1, Kelurahaan Campang Raya, Kecamatan Sukabumi, Kota Bandar Lampung, Provinsi Lampung"
              value={invoiceSettings.companyAddress || "Villa Bukit Tirtayasa Blok G2 No.1, Kelurahaan Campang Raya, Kecamatan Sukabumi, Kota Bandar Lampung, Provinsi Lampung"}
              onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, companyAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Resmi
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="livamediakreatif@gmail.com"
                value={invoiceSettings.companyEmail || "livamediakreatif@gmail.com"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, companyEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> No. WhatsApp / Telepon
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="+62 821-7788-9900"
                value={invoiceSettings.companyPhone || "+62 821-7788-9900"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, companyPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Alamat Website
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="https://project.livaagency.com"
                value={invoiceSettings.companyWebsite || "https://project.livaagency.com"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, companyWebsite: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Direktur & Penandatangan */}
        <div className="border-t border-slate-100 pt-6">
          <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" /> Penandatangan Resmi Dokumen
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nama Direktur / Penandatangan</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="Mufthi Ali"
                value={invoiceSettings.signatureName || "Mufthi Ali"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, signatureName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Jabatan Penandatangan</label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="Direktur Utama PT Liva Media Kreatif"
                value={invoiceSettings.signatureTitle || "Direktur Utama PT Liva Media Kreatif"}
                onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, signatureTitle: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Syarat & Ketentuan */}
        <div className="border-t border-slate-100 pt-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-1">Syarat & Ketentuan Default (Term of Payment)</h4>
          <p className="text-[11px] text-slate-400 mb-2">Teks ini dicantumkan pada kotak catatan di invoice resmi</p>
          <textarea
            className="w-full border border-slate-200/80 rounded-lg px-3 py-2 font-medium text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500 resize-y shadow-2xs"
            rows={3}
            value={invoiceSettings.termsAndConditions || "1. Payment shall be made via bank transfer to the account listed above.\n2. Payment is due according to the invoice Due Date.\n3. Please confirm proof of payment via WhatsApp to +62 821-7788-9900."}
            onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, termsAndConditions: e.target.value })}
            placeholder="1. Payment shall be made via bank transfer to the account listed above..."
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => onSaveSettings(invoiceSettings)}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Simpan Pengaturan Nota
          </button>
        </div>
      </div>
    </div>
  );
};

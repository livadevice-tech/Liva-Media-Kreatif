import React from 'react';
import { Image as ImageIcon, Settings, Trash2, UploadCloud, Building2, MapPin, Mail, Phone, Globe, UserCheck } from 'lucide-react';

export type InvoiceSettings = {
  logoUrl: string;
  signatureUrl: string;
  signatureName: string;
  signatureTitle?: string;
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
    field: "logoUrl" | "signatureUrl",
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
            Sesuaikan data penerbit, logo, tanda tangan, dan syarat ketentuan standar PT. Liva Media Kreatif
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Section 1: Logo & Signature Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <span className="text-[10px] text-slate-400 mt-0.5">Biarkan kosong untuk menggunakan logo vektor Liva default</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'logoUrl')} />
              </label>
            )}
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" /> Tanda Tangan & Stempel Resmi (Opsional)
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
                <span className="text-[10px] text-slate-400 mt-0.5">Biarkan kosong untuk stempel digital Liva default</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'signatureUrl')} />
              </label>
            )}
          </div>
        </div>

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
            value={invoiceSettings.termsAndConditions || "1. Pembayaran dilakukan via transfer bank sesuai rekening di atas.\n2. Pembayaran dilakukan sesuai Due Date invoice.\n3. Harap konfirmasi bukti transfer via WhatsApp ke +62 821-7788-9900."}
            onChange={(e) => onInvoiceSettingsChange({ ...invoiceSettings, termsAndConditions: e.target.value })}
            placeholder="1. Pembayaran dilakukan via transfer bank..."
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

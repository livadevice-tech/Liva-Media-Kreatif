import React from 'react';
import { Image as ImageIcon, Settings, Trash2, UploadCloud } from 'lucide-react';

export type InvoiceSettings = {
  logoUrl: string;
  signatureUrl: string;
  signatureName: string;
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-3xl animate-fadeIn">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-600" /> Pengaturan Logo & Tanda Tangan</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-400" /> Logo Invoice (Opsional)</label>

            {invoiceSettings.logoUrl ? (
              <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                <img src={invoiceSettings.logoUrl} className="max-h-20 object-contain" alt="Logo" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button onClick={() => onInvoiceSettingsChange({...invoiceSettings, logoUrl: ""})} className="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-500">Pilih gambar (Max 2MB)</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'logoUrl')} />
              </label>
            )}
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">Tautan gambar untuk logo di header invoice. Biarkan kosong untuk teks default.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-400" /> Tanda Tangan (Opsional)</label>
            {invoiceSettings.signatureUrl ? (
              <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                <img src={invoiceSettings.signatureUrl} className="max-h-20 object-contain" alt="Signature" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                  <button onClick={() => onInvoiceSettingsChange({...invoiceSettings, signatureUrl: ""})} className="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-500">Pilih gambar (Max 2MB)</span>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => onImageUpload(e, 'signatureUrl')} />
              </label>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Nama Penandatangan</label>
          <input
            type="text"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold bg-slate-50 focus:bg-white transition-colors outline-none"
            placeholder="Mufthi Ali W"
            value={invoiceSettings.signatureName}
            onChange={e => onInvoiceSettingsChange({...invoiceSettings, signatureName: e.target.value})}
          />
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="font-black text-slate-800 mb-4">Syarat & Ketentuan (Term of Payment)</h4>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Teks Terms and Conditions</label>
            <textarea 
              className="w-full border border-slate-200 rounded-lg px-3 py-2 font-semibold bg-white resize-y" 
              rows={3}
              value={invoiceSettings.termsAndConditions || ''} 
              onChange={e => onInvoiceSettingsChange({...invoiceSettings, termsAndConditions: e.target.value})} 
              placeholder="Please send payment within 7 days of receiving this invoice." 
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h4 className="font-black text-slate-800 mb-4">Informasi Pembayaran (Bank)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nama Bank / Cabang</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.bankName} onChange={e => onInvoiceSettingsChange({...invoiceSettings, bankName: e.target.value})} placeholder="BCA KEDATON" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Rekening</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.accountNo} onChange={e => onInvoiceSettingsChange({...invoiceSettings, accountNo: e.target.value})} placeholder="8905461245" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Atas Nama (A/N)</label>
              <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.accountName} onChange={e => onInvoiceSettingsChange({...invoiceSettings, accountName: e.target.value})} placeholder="MUFTHI ALI W" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button onClick={() => onSaveSettings(invoiceSettings)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer">Simpan Pengaturan</button>
        </div>
      </div>
    </div>
  );
};

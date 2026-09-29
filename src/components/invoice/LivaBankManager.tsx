import React, { useState } from 'react';
import { Landmark, Plus, Check, Copy, Edit3, Trash2, Star, ShieldCheck, CreditCard, Building2, X, Save } from 'lucide-react';
import { LivaBankAccount } from '../../types';

interface LivaBankManagerProps {
  bankAccounts: LivaBankAccount[];
  onSaveBankAccounts: (accounts: LivaBankAccount[]) => void;
}

const POPULAR_BANKS = [
  { name: 'Maybank Syariah', color: 'from-amber-500 to-yellow-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  { name: 'BCA', color: 'from-blue-600 to-blue-800', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  { name: 'Bank Mandiri', color: 'from-blue-800 to-indigo-900', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { name: 'BNI', color: 'from-teal-600 to-cyan-700', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
  { name: 'BRI', color: 'from-blue-700 to-sky-600', badge: 'bg-sky-100 text-sky-800 border-sky-200' },
  { name: 'BSI (Bank Syariah Indonesia)', color: 'from-emerald-600 to-teal-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { name: 'CIMB Niaga', color: 'from-red-600 to-rose-700', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  { name: 'Permata Bank', color: 'from-green-600 to-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export const LivaBankManager: React.FC<LivaBankManagerProps> = ({ bankAccounts, onSaveBankAccounts }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccount, setEditingAccount] = useState<LivaBankAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState('Maybank Syariah');
  const [customBankName, setCustomBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('PT. Liva Media Kreatif');
  const [branch, setBranch] = useState('');
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setBankName('Maybank Syariah');
    setCustomBankName('');
    setAccountNo('');
    setAccountName('PT. Liva Media Kreatif');
    setBranch('');
    setNotes('');
    setIsDefault(bankAccounts.length === 0);
    setIsAdding(true);
  };

  const handleOpenEdit = (acc: LivaBankAccount) => {
    setIsAdding(false);
    setEditingAccount(acc);
    const isPopular = POPULAR_BANKS.some(b => b.name === acc.bankName);
    if (isPopular) {
      setBankName(acc.bankName);
      setCustomBankName('');
    } else {
      setBankName('Lainnya');
      setCustomBankName(acc.bankName);
    }
    setAccountNo(acc.accountNo);
    setAccountName(acc.accountName);
    setBranch(acc.branch || '');
    setNotes(acc.notes || '');
    setIsDefault(acc.isDefault);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBankName = bankName === 'Lainnya' ? customBankName.trim() : bankName;
    if (!finalBankName || !accountNo.trim() || !accountName.trim()) {
      alert('Mohon isi nama bank, nomor rekening, dan atas nama rekening.');
      return;
    }

    let updated: LivaBankAccount[];
    if (editingAccount) {
      updated = bankAccounts.map(a => {
        if (a.id === editingAccount.id) {
          return {
            ...a,
            bankName: finalBankName,
            accountNo: accountNo.trim(),
            accountName: accountName.trim(),
            branch: branch.trim(),
            notes: notes.trim(),
            isDefault: isDefault ? true : (bankAccounts.length === 1 ? true : a.isDefault && !isDefault ? false : a.isDefault),
          };
        }
        return isDefault ? { ...a, isDefault: false } : a;
      });
    } else {
      const newAcc: LivaBankAccount = {
        id: `bank_${Date.now()}`,
        bankName: finalBankName,
        accountNo: accountNo.trim(),
        accountName: accountName.trim(),
        branch: branch.trim(),
        notes: notes.trim(),
        isActive: true,
        isDefault: isDefault || bankAccounts.length === 0,
      };

      if (isDefault) {
        updated = bankAccounts.map(a => ({ ...a, isDefault: false }));
        updated.push(newAcc);
      } else {
        updated = [...bankAccounts, newAcc];
      }
    }

    // Ensure at least one default
    if (!updated.some(a => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }

    onSaveBankAccounts(updated);
    setEditingAccount(null);
    setIsAdding(false);
  };

  const handleSetDefault = (id: string) => {
    const updated = bankAccounts.map(a => ({
      ...a,
      isDefault: a.id === id,
    }));
    onSaveBankAccounts(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus rekening bank ini?')) {
      const remaining = bankAccounts.filter(a => a.id !== id);
      if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
        remaining[0].isDefault = true;
      }
      onSaveBankAccounts(remaining);
    }
  };

  const handleCopyNoRek = (no: string, id: string) => {
    navigator.clipboard.writeText(no);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderBankForm = (isNew: boolean, onCancel: () => void) => (
    <form
      key={isNew ? 'new-bank-form' : editingAccount?.id}
      onSubmit={handleSave}
      className="bg-white rounded-2xl border-2 border-indigo-500 ring-4 ring-indigo-50/70 shadow-lg p-5 flex flex-col justify-between transition-all duration-200 animate-fadeIn"
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                {isNew ? 'Rekening Baru' : 'Rekening Bank'}
              </span>
              <h4 className="text-xs font-bold text-slate-800">
                {isNew ? 'Tambah Rekening Bank' : 'Edit Rekening Bank'}
              </h4>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Edit3 className="w-3 h-3 text-indigo-600" />
            {isNew ? 'Tambah' : 'Mode Edit'}
          </span>
        </div>

        {/* Nama Bank */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Nama Bank <span className="text-rose-500">*</span>
          </label>
          <select
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50/50 focus:bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer shadow-2xs"
          >
            {POPULAR_BANKS.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
            <option value="Lainnya">Lainnya (Tulis Manual)...</option>
          </select>
        </div>

        {bankName === 'Lainnya' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">
              Ketik Nama Bank
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bank Danamon"
              value={customBankName}
              onChange={(e) => setCustomBankName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        )}

        {/* Nomor Rekening */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Nomor Rekening <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: 2721002897"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-black text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Atas Nama & Cabang */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
              Atas Nama (A/N) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="PT. Liva Media Kreatif"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
              Cabang / KCU
            </label>
            <input
              type="text"
              placeholder="KC Bandar Lampung"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Catatan Tambahan */}
        <div>
          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <input
            type="text"
            placeholder="Contoh: Rekening utama penerimaan invoice"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Jadikan Utama Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-800 block text-[11px]">Jadikan Rekening Utama</span>
            </div>
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <Save className="w-3.5 h-3.5" />
          {isNew ? 'Tambah Rekening' : 'Simpan'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Landmark className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Manajemen Data Bank PT Liva Media Kreatif
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Kelola daftar rekening bank resmi PT. Liva Media Kreatif. Rekening utama (default) akan otomatis terpasang pada bagian <span className="font-semibold text-slate-700">INFORMASI PEMBAYARAN</span> di setiap invoice yang diterbitkan.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Rekening Bank
        </button>
      </div>

      {/* Bank Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* If adding new account, show form card first */}
        {isAdding && renderBankForm(true, () => setIsAdding(false))}

        {bankAccounts.length === 0 && !isAdding ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center p-6">
            <CreditCard className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Belum Ada Rekening Bank</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4">
              Tambahkan minimal satu rekening bank resmi PT. Liva Media Kreatif untuk dicantumkan pada invoice.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors"
            >
              Tambah Rekening Sekarang
            </button>
          </div>
        ) : (
          bankAccounts.map((acc) => {
            if (editingAccount?.id === acc.id) {
              return renderBankForm(false, () => setEditingAccount(null));
            }

            const isCopied = copiedId === acc.id;
            return (
              <div
                key={acc.id}
                className={`relative bg-white rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-sm overflow-hidden ${
                  acc.isDefault
                    ? 'border-indigo-400/80 ring-2 ring-indigo-500/10 shadow-indigo-500/5'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Badge & Bank Name */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-sm">
                        {acc.bankName.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {acc.bankName}
                        </h4>
                        {acc.branch && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {acc.branch}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {acc.isDefault && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" /> Utama
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Account Number Box */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                      Nomor Rekening
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black text-slate-800 tracking-wider">
                        {acc.accountNo}
                      </span>
                      <button
                        onClick={() => handleCopyNoRek(acc.accountNo, acc.id)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                        }`}
                        title="Salin Nomor Rekening"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-[10px]">Tersalin</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Holder Name */}
                  <div className="mb-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                      Atas Nama (A/N)
                    </div>
                    <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{acc.accountName}</span>
                    </div>
                  </div>

                  {acc.notes && (
                    <div className="text-[11px] text-slate-500 italic mt-2 bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                      "{acc.notes}"
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {!acc.isDefault && (
                      <button
                        onClick={() => handleSetDefault(acc.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 text-slate-400" /> Jadikan Utama
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Rekening"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {bankAccounts.length > 1 && (
                      <button
                        onClick={() => handleDelete(acc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

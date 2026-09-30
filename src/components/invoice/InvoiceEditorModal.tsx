import React from "react";
import { Plus, Trash2, X, Landmark, Building2, Save } from "lucide-react";
import { ClientBrand, BrandInvoice, LivaBankAccount } from "../../types";
import { terbilang } from "../../shared/utils/terbilang";

type EditableInvoice = BrandInvoice & { brandId: string };

type InvoiceEditorModalProps = {
  invoiceEditor: EditableInvoice | null;
  clientBrands: ClientBrand[];
  bankAccounts?: LivaBankAccount[];
  setInvoiceEditor: React.Dispatch<React.SetStateAction<EditableInvoice | null>>;
  onClose: () => void;
  onUpdateBrands: (brands: ClientBrand[]) => void;
};

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  invoiceEditor,
  clientBrands,
  bankAccounts = [],
  setInvoiceEditor,
  onClose,
  onUpdateBrands,
}) => {
  if (!invoiceEditor) return null;

  const totalAmount = (invoiceEditor.sessionItems || []).reduce(
    (acc, curr) => acc + (curr.cost * (curr.qty || 1)),
    0
  );
  const terbilangStr = terbilang(totalAmount);

  const handleSave = () => {
    const updatedInvoice: BrandInvoice = {
      ...invoiceEditor,
      totalAmount,
    };

    const updatedBrands = clientBrands.map((b) => {
      if (b.id === invoiceEditor.brandId) {
        const updatedInvoices = (b.invoices || []).map((inv) =>
          inv.id === invoiceEditor.id ? updatedInvoice : inv
        );
        return {
          ...b,
          companyName: invoiceEditor.ptName || b.companyName,
          picName: invoiceEditor.picName || b.picName,
          picPhone: invoiceEditor.picPhone || b.picPhone,
          picEmail: invoiceEditor.email || b.picEmail,
          companyAddress: invoiceEditor.address || b.companyAddress,
          invoices: updatedInvoices,
        };
      }
      return b;
    });

    onUpdateBrands(updatedBrands);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />

      {/* Right Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col z-10 animate-slideInRight border-l border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Edit Detail Invoice</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Perbarui rincian, status pembayaran, atau komponen invoice resmi
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                Nomor Invoice
              </label>
              <input
                type="text"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-mono font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.invoiceNumber}
                onChange={e => setInvoiceEditor({...invoiceEditor, invoiceNumber: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                Status Invoice
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.status}
                onChange={e => setInvoiceEditor({...invoiceEditor, status: e.target.value as BrandInvoice["status"]})}
              >
                <option value="Draft">Draft</option>
                <option value="Open Invoice">Open Invoice (Terkirim)</option>
                <option value="Paid">Paid (Lunas)</option>
                <option value="Overdue">Overdue (Jatuh Tempo)</option>
                <option value="Cancelled">Cancelled (Dibatalkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Rekening Bank
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 cursor-pointer focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.bankInfo?.accountNo || ""}
                onChange={(e) => {
                  const selectedBank = bankAccounts.find(b => b.accountNo === e.target.value);
                  if (selectedBank) {
                    setInvoiceEditor({
                      ...invoiceEditor,
                      bankInfo: {
                        bankName: selectedBank.bankName,
                        accountNo: selectedBank.accountNo,
                        accountName: selectedBank.accountName,
                      }
                    });
                  }
                }}
              >
                {bankAccounts.length === 0 ? (
                  <option value="2721002897">Maybank Syariah - 2721002897</option>
                ) : (
                  bankAccounts.map((b) => (
                    <option key={b.id} value={b.accountNo}>
                      {b.bankName} - {b.accountNo} ({b.accountName})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Dates Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Tanggal Invoice
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.invoiceDate || invoiceEditor.issueDate || ""}
                onChange={e => setInvoiceEditor({...invoiceEditor, invoiceDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Tanggal Dibuat (Issue Date)
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.issueDate}
                onChange={e => setInvoiceEditor({...invoiceEditor, issueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Jatuh Tempo (Due Date)
              </label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.dueDate}
                onChange={e => setInvoiceEditor({...invoiceEditor, dueDate: e.target.value})}
              />
            </div>
          </div>

          {/* Bill To Information */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" /> Informasi Ditujukan Kepada (Bill To)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Nama PT / Badan Usaha
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                  value={invoiceEditor.ptName || invoiceEditor.recipientName || ""}
                  onChange={e => setInvoiceEditor({...invoiceEditor, ptName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Kepada / PIC
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                  value={invoiceEditor.picName || invoiceEditor.recipientName || ""}
                  onChange={e => setInvoiceEditor({...invoiceEditor, picName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                  value={invoiceEditor.picPhone || ""}
                  onChange={e => setInvoiceEditor({...invoiceEditor, picPhone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Email Penagihan
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                  value={invoiceEditor.email || ""}
                  onChange={e => setInvoiceEditor({...invoiceEditor, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Alamat Lengkap Perusahaan
              </label>
              <textarea
                rows={2}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.address || ""}
                onChange={e => setInvoiceEditor({...invoiceEditor, address: e.target.value})}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Komponen / Rincian Layanan Tagihan
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  Tekan Enter pada rincian untuk membuat baris baru (misal: nama paket dan periode tanggal)
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItems = [
                    ...(invoiceEditor.sessionItems || []),
                    { sessionId: `custom_${Date.now()}`, description: "", qty: 1, unit: "Session", cost: 0 },
                  ];
                  setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                }}
                className="text-xs bg-white border border-slate-200 shadow-2xs px-3 py-1.5 rounded-xl font-bold hover:bg-slate-50 text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2.5">
              {(invoiceEditor.sessionItems || []).map((item, idx) => {
                const lineCount = (item.description || "").split("\n").length;
                const rows = Math.max(2, Math.min(lineCount, 6));

                return (
                  <div
                    key={item.sessionId || idx}
                    className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-2.5 items-start md:items-center shadow-2xs"
                  >
                    <div className="flex-1 w-full">
                      <textarea
                        rows={rows}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                        placeholder="Deskripsi Item / Layanan (Tekan Enter untuk baris baru)"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...(invoiceEditor.sessionItems || [])];
                          newItems[idx].description = e.target.value;
                          setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                    <input
                      type="number"
                      className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-indigo-500"
                      placeholder="Qty"
                      value={item.qty || ""}
                      onChange={(e) => {
                        const newItems = [...(invoiceEditor.sessionItems || [])];
                        newItems[idx].qty = Number(e.target.value);
                        setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                      }}
                    />

                    <input
                      type="text"
                      className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-xs font-semibold text-center text-slate-700 focus:outline-none focus:border-indigo-500"
                      placeholder="Unit"
                      value={item.unit || "Session"}
                      onChange={(e) => {
                        const newItems = [...(invoiceEditor.sessionItems || [])];
                        newItems[idx].unit = e.target.value;
                        setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                      }}
                    />

                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                        Rp
                      </span>
                      <input
                        type="number"
                        className="w-32 border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                        placeholder="Harga"
                        value={item.cost || ""}
                        onChange={(e) => {
                          const newItems = [...(invoiceEditor.sessionItems || [])];
                          newItems[idx].cost = Number(e.target.value);
                          setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newItems = invoiceEditor.sessionItems?.filter((_, i) => i !== idx);
                        setInvoiceEditor({ ...invoiceEditor, sessionItems: newItems });
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

            {/* Total calculation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-indigo-700">
                  Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="text-[10px] uppercase font-bold text-slate-400">Amount in Words :</div>
                <div className="text-xs font-bold text-slate-700 italic">"{terbilangStr}"</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-xs"
          >
            <Save className="w-4 h-4" /> Simpan Perubahan Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

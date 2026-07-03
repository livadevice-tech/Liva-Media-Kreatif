import React from "react";
import { Plus, Trash2, X } from "lucide-react";
import { ClientBrand, BrandInvoice } from "../../types";

type EditableInvoice = BrandInvoice & { brandId: string };

type InvoiceEditorModalProps = {
  invoiceEditor: EditableInvoice | null;
  clientBrands: ClientBrand[];
  setInvoiceEditor: React.Dispatch<React.SetStateAction<EditableInvoice | null>>;
  onClose: () => void;
  onUpdateBrands: (brands: ClientBrand[]) => void;
};

export const InvoiceEditorModal: React.FC<InvoiceEditorModalProps> = ({
  invoiceEditor,
  clientBrands,
  setInvoiceEditor,
  onClose,
  onUpdateBrands,
}) => {
  if (!invoiceEditor) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-800">Edit Invoice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-6 h-6" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Invoice Number</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.invoiceNumber} onChange={e => setInvoiceEditor({...invoiceEditor, invoiceNumber: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nama PT</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.ptName || invoiceEditor.recipientName || ""} onChange={e => setInvoiceEditor({...invoiceEditor, ptName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (PIC)</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.picName || invoiceEditor.recipientName || ""} onChange={e => setInvoiceEditor({...invoiceEditor, picName: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">No. Telp PIC</label>
            <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.picPhone || ""} onChange={e => setInvoiceEditor({...invoiceEditor, picPhone: e.target.value})} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.email || ""} onChange={e => setInvoiceEditor({...invoiceEditor, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
              <select className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white cursor-pointer" value={invoiceEditor.status} onChange={e => setInvoiceEditor({...invoiceEditor, status: e.target.value as BrandInvoice["status"]})}>
                <option value="Draft">Draft</option>
                <option value="Open Invoice">Open Invoice (Sent)</option>
                <option value="Paid">Paid (Lunas)</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Alamat/Address</label>
            <textarea className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" rows={3} value={invoiceEditor.address || ""} onChange={e => setInvoiceEditor({...invoiceEditor, address: e.target.value})}></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Issue Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.issueDate} onChange={e => setInvoiceEditor({...invoiceEditor, issueDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Due Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.dueDate} onChange={e => setInvoiceEditor({...invoiceEditor, dueDate: e.target.value})} />
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-black text-slate-800">Komponen Penagihan</h4>
              <button
                onClick={() => {
                  const newItems = [...(invoiceEditor.sessionItems || []), { sessionId: `custom_${Date.now()}`, description: "", qty: 1, cost: 0 }];
                  setInvoiceEditor({...invoiceEditor, sessionItems: newItems});
                }}
                className="text-[10px] bg-white border border-slate-200 shadow-sm px-2 py-1 rounded font-black hover:bg-slate-50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Tambah Baris
              </button>
            </div>

            <div className="space-y-2">
              {(invoiceEditor.sessionItems || []).map((item, idx) => (
                <div key={item.sessionId} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                  <input
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold w-full"
                    placeholder="Deskripsi Item (Misal: Paket Streaming...)"
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...(invoiceEditor.sessionItems || [])];
                      newItems[idx].description = e.target.value;
                      setInvoiceEditor({...invoiceEditor, sessionItems: newItems});
                    }}
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-center"
                      placeholder="Qty"
                      value={item.qty || ""}
                      onChange={(e) => {
                        const newItems = [...(invoiceEditor.sessionItems || [])];
                        newItems[idx].qty = Number(e.target.value);
                        setInvoiceEditor({...invoiceEditor, sessionItems: newItems});
                      }}
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                      <input
                        type="number"
                        className="w-32 border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-sm font-bold"
                        placeholder="Harga Satuan"
                        value={item.cost || ""}
                        onChange={(e) => {
                          const newItems = [...(invoiceEditor.sessionItems || [])];
                          newItems[idx].cost = Number(e.target.value);
                          setInvoiceEditor({...invoiceEditor, sessionItems: newItems});
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newItems = invoiceEditor.sessionItems?.filter((_, i) => i !== idx);
                        setInvoiceEditor({...invoiceEditor, sessionItems: newItems});
                      }}
                      className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center text-lg px-2">
              <span className="text-sm font-bold text-slate-500">Total Keseluruhan</span>
              <span className="font-black text-indigo-700">Rp{new Intl.NumberFormat('id-ID').format((invoiceEditor.sessionItems || []).reduce((a, c) => a + ((c.cost || 0) * (c.qty || 0)), 0))}</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all">Batal</button>
          <button
            onClick={() => {
              const updatedBrands = clientBrands.map(b => {
                if (b.id === invoiceEditor.brandId) {
                  const totalAmount = (invoiceEditor.sessionItems || []).reduce((acc, curr) => acc + ((curr.cost || 0) * (curr.qty || 0)), 0);
                  const updatedInvoice = { ...invoiceEditor, totalAmount };
                  return {
                    ...b,
                    name: invoiceEditor.ptName || b.name,
                    picName: invoiceEditor.picName || b.picName,
                    picPhone: invoiceEditor.picPhone || b.picPhone,
                    picEmail: invoiceEditor.email || b.picEmail,
                    companyAddress: invoiceEditor.address || b.companyAddress,
                    invoices: (b.invoices || []).map(i => i.id === invoiceEditor.id ? updatedInvoice : i),
                  };
                }
                return b;
              });
              onUpdateBrands(updatedBrands);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

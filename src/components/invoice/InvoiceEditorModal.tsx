import React from "react";
import { Plus, Trash2, X, Landmark, Building2, Save, CreditCard } from "lucide-react";
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

  const subtotalProject = (invoiceEditor.sessionItems || []).reduce(
    (acc, curr) => acc + (curr.cost * (curr.qty || 1)),
    0
  );
  const paymentType = invoiceEditor.paymentType || 'full';
  const dpPercent = invoiceEditor.dpPercent ?? 50;
  const dpAmount = invoiceEditor.dpAmount !== undefined 
    ? invoiceEditor.dpAmount 
    : Math.round(subtotalProject * (dpPercent / 100));

  let billableAmount = subtotalProject;
  let remainingAmount = 0;

  if (paymentType === 'dp') {
    billableAmount = dpAmount;
    remainingAmount = Math.max(0, subtotalProject - dpAmount);
  } else if (paymentType === 'pelunasan') {
    billableAmount = Math.max(0, subtotalProject - dpAmount);
    remainingAmount = 0;
  }

  const terbilangStr = terbilang(billableAmount);

  const handleSave = () => {
    const updatedInvoice: BrandInvoice = {
      ...invoiceEditor,
      paymentType,
      dpPercent: paymentType === 'dp' ? dpPercent : undefined,
      dpAmount: paymentType !== 'full' ? dpAmount : undefined,
      subtotalProject,
      totalAmount: billableAmount,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Tgl Cut Off Live (Per Bulan)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                placeholder="15"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                value={invoiceEditor.cutOffDate || ""}
                onChange={e => setInvoiceEditor({...invoiceEditor, cutOffDate: e.target.value})}
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

            {/* Payment Scheme & Exact Calculation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4 space-y-4">
              <div>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200 mb-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Opsi Skema Pembayaran (Payment Terms)
                    </h4>
                    <p className="text-[10px] text-slate-400">Pilih jenis penagihan: Pembayaran Penuh, Uang Muka (DP), atau Pelunasan Akhir</p>
                  </div>
                </div>

                {/* 3 Option Selection Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Full Payment */}
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceEditor({
                        ...invoiceEditor,
                        paymentType: 'full',
                        dpPercent: undefined,
                        dpAmount: undefined,
                        subtotalProject,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'full'
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${paymentType === 'full' ? 'text-indigo-900' : 'text-slate-700'}`}>
                        Full Payment
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${paymentType === 'full' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        100%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Tagihan penuh sekaligus untuk seluruh nilai proyek
                    </p>
                  </button>

                  {/* 2. Down Payment (DP) */}
                  <button
                    type="button"
                    onClick={() => {
                      const defaultPercent = invoiceEditor.dpPercent || 50;
                      const calculatedDp = invoiceEditor.dpAmount !== undefined ? invoiceEditor.dpAmount : Math.round(subtotalProject * (defaultPercent / 100));
                      setInvoiceEditor({
                        ...invoiceEditor,
                        paymentType: 'dp',
                        dpPercent: defaultPercent,
                        dpAmount: calculatedDp,
                        subtotalProject,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'dp'
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${paymentType === 'dp' ? 'text-indigo-900' : 'text-slate-700'}`}>
                        Tagihan DP
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${paymentType === 'dp' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        DP {dpPercent}%
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Uang muka awal proyek. Sisanya ditagihkan di pelunasan
                    </p>
                  </button>

                  {/* 3. Final Payment (Pelunasan) */}
                  <button
                    type="button"
                    onClick={() => {
                      const defaultDp = invoiceEditor.dpAmount !== undefined ? invoiceEditor.dpAmount : Math.round(subtotalProject * 0.5);
                      setInvoiceEditor({
                        ...invoiceEditor,
                        paymentType: 'pelunasan',
                        dpPercent: 50,
                        dpAmount: defaultDp,
                        subtotalProject,
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'pelunasan'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${paymentType === 'pelunasan' ? 'text-emerald-900' : 'text-slate-700'}`}>
                        Final Payment
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${paymentType === 'pelunasan' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        Pelunasan
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Tagihan akhir setelah dipotong DP yang telah dibayar
                    </p>
                  </button>
                </div>

                {/* DP Configuration Controls */}
                {paymentType === 'dp' && (
                  <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-indigo-900">
                        Pilih Persentase DP:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {[20, 30, 50, 70].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => {
                              const newDp = Math.round(subtotalProject * (pct / 100));
                              setInvoiceEditor({
                                ...invoiceEditor,
                                paymentType: 'dp',
                                dpPercent: pct,
                                dpAmount: newDp,
                                subtotalProject,
                              });
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                              dpPercent === pct
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'bg-slate-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-slate-100">
                      <label className="text-[11px] font-bold text-indigo-900 sm:w-36 shrink-0">
                        Nominal DP (Rp):
                      </label>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          Rp
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={subtotalProject}
                          value={dpAmount || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const calculatedPct = subtotalProject > 0 ? Math.round((val / subtotalProject) * 100) : 0;
                            setInvoiceEditor({
                              ...invoiceEditor,
                              paymentType: 'dp',
                              dpPercent: calculatedPct,
                              dpAmount: val,
                              subtotalProject,
                            });
                          }}
                          className="w-full bg-slate-50 border border-indigo-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-black text-indigo-950 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                          placeholder="Contoh: 7250000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Pelunasan Configuration Controls */}
                {paymentType === 'pelunasan' && (
                  <div className="mt-3 p-3 bg-white border border-emerald-200 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-900">
                        DP Yang Telah Dibayar Klien:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const half = Math.round(subtotalProject * 0.5);
                          setInvoiceEditor({
                            ...invoiceEditor,
                            paymentType: 'pelunasan',
                            dpPercent: 50,
                            dpAmount: half,
                            subtotalProject,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                      >
                        Set 50% (Rp {new Intl.NumberFormat('id-ID').format(Math.round(subtotalProject * 0.5))})
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-slate-100">
                      <label className="text-[11px] font-bold text-emerald-900 sm:w-36 shrink-0">
                        Nominal DP (Rp):
                      </label>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                          Rp
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={subtotalProject}
                          value={dpAmount || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setInvoiceEditor({
                              ...invoiceEditor,
                              paymentType: 'pelunasan',
                              dpAmount: val,
                              subtotalProject,
                            });
                          }}
                          className="w-full bg-slate-50 border border-emerald-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-black text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                          placeholder="Contoh: 7250000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Exact Calculation Preview matching User Screenshots */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 font-sans">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-700">
                    Rp {new Intl.NumberFormat('id-ID').format(subtotalProject)}
                  </span>
                </div>

                {/* Solid dark line */}
                <div className="w-full border-t-2 border-slate-900 my-1.5" />

                <div className="flex justify-between items-center text-sm font-black text-slate-900">
                  <span>TOTAL PROJECT:</span>
                  <span className="text-base font-black text-slate-900">
                    Rp {new Intl.NumberFormat('id-ID').format(subtotalProject)}
                  </span>
                </div>

                {paymentType === 'dp' && (
                  <>
                    {/* Dashed purple line */}
                    <div className="w-full border-t border-dashed border-[#4f46e5] my-2" />
                    <div className="flex justify-between items-center text-sm font-black text-[#4f46e5]">
                      <span>TAGIHAN DP ({dpPercent}%):</span>
                      <span className="text-base font-black">
                        Rp {new Intl.NumberFormat('id-ID').format(billableAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-medium text-slate-500 pt-0.5">
                      <span>Sisa Pembayaran:</span>
                      <span className="text-slate-600 font-semibold">
                        Rp {new Intl.NumberFormat('id-ID').format(remainingAmount)}
                      </span>
                    </div>
                  </>
                )}

                {paymentType === 'pelunasan' && (
                  <>
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pt-1">
                      <span>DP Telah Dibayar:</span>
                      <span className="text-[#059669] font-bold">
                        -Rp {new Intl.NumberFormat('id-ID').format(dpAmount)}
                      </span>
                    </div>
                    {/* Dashed green line */}
                    <div className="w-full border-t border-dashed border-[#059669] my-2" />
                    <div className="flex justify-between items-center text-sm font-black text-[#059669]">
                      <span>FINAL PAYMENT (PELUNASAN):</span>
                      <span className="text-base font-black">
                        Rp {new Intl.NumberFormat('id-ID').format(billableAmount)}
                      </span>
                    </div>
                  </>
                )}

                {/* Terbilang */}
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Amount in Words:</span>
                  <span className="text-xs font-bold text-slate-700 italic">"{terbilangStr}"</span>
                </div>
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

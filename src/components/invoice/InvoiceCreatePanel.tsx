import React, { useState, useRef, useEffect } from "react";
import { Building2, CheckSquare, Plus, Trash2, Search, X, Landmark, FileText, Calendar } from "lucide-react";
import { ClientBrand, BrandInvoice, LivaBankAccount } from "../../types";
import { terbilang } from "../../shared/utils/terbilang";

type DraftInvoice = Partial<BrandInvoice>;

type InvoiceCreatePanelProps = {
  clientBrands: ClientBrand[];
  bankAccounts?: LivaBankAccount[];
  selectedBrandId: string;
  draftInvoice: DraftInvoice;
  setSelectedBrandId: React.Dispatch<React.SetStateAction<string>>;
  setDraftInvoice: React.Dispatch<React.SetStateAction<DraftInvoice>>;
  onSelectBrand: (brandId: string) => void;
  onSaveDraft: () => void;
  onCancel: () => void;
};

const SearchableBrandSelect: React.FC<{
  brands: ClientBrand[];
  value: string;
  onChange: (value: string) => void;
}> = ({ brands, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  const selectedBrand = brands.find(b => b.id === value);
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.companyName && b.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-slate-200 bg-slate-50 hover:bg-white rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer flex justify-between items-center text-left min-h-[48px] shadow-2xs"
      >
        <span className="truncate">
          {selectedBrand 
            ? `${selectedBrand.name} ${selectedBrand.companyName ? `(${selectedBrand.companyName})` : ''}`
            : "-- Klik untuk Pilih Brand Klien --"}
        </span>
        <span className="text-[10px] text-slate-400 select-none ml-2 shrink-0">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-2 animate-fadeIn origin-top">
          <div className="relative flex-shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama brand atau nama PT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
            {filteredBrands.length > 0 ? (
              filteredBrands.map((b) => {
                const isSelected = b.id === value;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      onChange(b.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer flex flex-col gap-0.5 ${
                      isSelected ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "text-slate-700 hover:bg-slate-50 border-transparent"
                    } border`}
                  >
                    <div className="flex justify-between items-center w-full">
                       <span className="truncate font-black">{b.name}</span>
                       <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold shrink-0">
                         {b.sessions?.length || 0} Shift
                       </span>
                    </div>
                    {b.companyName && (
                      <span className="text-[11px] font-semibold text-slate-500 truncate">
                        {b.companyName}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-xs font-bold text-slate-400">
                Brand tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const InvoiceCreatePanel: React.FC<InvoiceCreatePanelProps> = ({
  clientBrands,
  bankAccounts = [],
  selectedBrandId,
  draftInvoice,
  setSelectedBrandId,
  setDraftInvoice,
  onSelectBrand,
  onSaveDraft,
  onCancel,
}) => {
  const totalAmount = (draftInvoice.sessionItems || []).reduce((acc, curr) => acc + (curr.cost * (curr.qty || 1)), 0);
  const totalQty = (draftInvoice.sessionItems || []).reduce((acc, curr) => acc + (curr.qty || 0), 0);
  const terbilangStr = terbilang(totalAmount);

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fadeIn cursor-pointer"
        onClick={onCancel}
      />

      {/* Right Drawer Panel */}
      <div className="relative w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col z-10 animate-slideInRight border-l border-slate-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Buat Invoice Baru</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Pilih brand klien dan atur rincian tagihan resmi</p>
          </div>
          <button 
            onClick={onCancel} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Brand Selection */}
          <div>
            <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-2">
              Pilih Brand Klien (Otomatis Deteksi Data Penagihan) <span className="text-rose-500">*</span>
            </label>
            <SearchableBrandSelect 
              brands={clientBrands.filter(b => b.isActive !== false)}
              value={selectedBrandId}
              onChange={(val) => {
                setSelectedBrandId(val);
                onSelectBrand(val);
              }}
            />
          </div>

          {selectedBrandId && draftInvoice && (
            <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-5">
              {/* Row 1: Invoice Meta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                    Nomor Invoice
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.invoiceNumber || ""}
                    onChange={e => setDraftInvoice({...draftInvoice, invoiceNumber: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1">
                    Status Invoice
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs cursor-pointer focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.status || "Draft"}
                    onChange={e => setDraftInvoice({...draftInvoice, status: e.target.value as BrandInvoice["status"]})}
                  >
                    <option value="Draft">Draft (Belum Dikirim)</option>
                    <option value="Open Invoice">Open Invoice (Terkirim)</option>
                    <option value="Paid">Paid (Lunas)</option>
                    <option value="Overdue">Overdue (Jatuh Tempo)</option>
                  </select>
                </div>

                {/* Bank Account of PT Liva */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Rekening Pembayaran
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs cursor-pointer focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.bankInfo?.accountNo || ""}
                    onChange={(e) => {
                      const selectedBank = bankAccounts.find(b => b.accountNo === e.target.value);
                      if (selectedBank) {
                        setDraftInvoice({
                          ...draftInvoice,
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

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Tanggal Invoice
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.invoiceDate || draftInvoice.issueDate || ""}
                    onChange={e => setDraftInvoice({...draftInvoice, invoiceDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Tanggal Dibuat (Issue Date)
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.issueDate || ""}
                    onChange={e => setDraftInvoice({...draftInvoice, issueDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Jatuh Tempo (Due Date)
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    value={draftInvoice.dueDate || ""}
                    onChange={e => setDraftInvoice({...draftInvoice, dueDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Section 2: Bill To Information */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Informasi Ditujukan Kepada (Bill To)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Nama PT / Badan Usaha <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: PT Creative Stylemandiri"
                      value={draftInvoice.ptName || ""}
                      onChange={e => setDraftInvoice({...draftInvoice, ptName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Kepada / PIC <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: Sari Ayu Marthatilaar"
                      value={draftInvoice.picName || ""}
                      onChange={e => setDraftInvoice({...draftInvoice, picName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      No. Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: +62812-3974-5911"
                      value={draftInvoice.picPhone || ""}
                      onChange={e => setDraftInvoice({...draftInvoice, picPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      Email Penagihan
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                      placeholder="Contoh: viancaxalyssa@gmail.com"
                      value={draftInvoice.email || ""}
                      onChange={e => setDraftInvoice({...draftInvoice, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Alamat Lengkap Perusahaan
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                    placeholder="Contoh: Jl. Pulo Kambing II No.1, Kawasan Industri Pulo Gadung, Jakarta Timur 13930."
                    value={draftInvoice.address || ""}
                    onChange={e => setDraftInvoice({...draftInvoice, address: e.target.value})}
                  />
                </div>
              </div>

              {/* Section 3: Line Items */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Komponen / Rincian Layanan Tagihan
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [
                        ...(draftInvoice.sessionItems || []),
                        { sessionId: `custom_${Date.now()}`, description: "", qty: 1, unit: "Sesi", cost: 0 },
                      ];
                      setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                    }}
                    className="text-xs bg-white border border-slate-200 shadow-2xs px-3 py-1.5 rounded-xl font-bold hover:bg-slate-50 text-indigo-600 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(draftInvoice.sessionItems || []).map((item, idx) => (
                    <div
                      key={item.sessionId || idx}
                      className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-2.5 items-center shadow-2xs"
                    >
                      <div className="flex-1 w-full">
                        <input
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                          placeholder="Deskripsi Layanan / Item (Contoh: Live Streaming Package Shopee)"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice.sessionItems || [])];
                            newItems[idx].description = e.target.value;
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <input
                          type="number"
                          className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center text-slate-800 focus:outline-none focus:border-indigo-500"
                          placeholder="Qty"
                          value={item.qty || ""}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice.sessionItems || [])];
                            newItems[idx].qty = Number(e.target.value);
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                          }}
                        />

                        <input
                          type="text"
                          className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-xs font-semibold text-center text-slate-700 focus:outline-none focus:border-indigo-500"
                          placeholder="Unit (Sesi)"
                          value={item.unit || "Sesi"}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice.sessionItems || [])];
                            newItems[idx].unit = e.target.value;
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
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
                              const newItems = [...(draftInvoice.sessionItems || [])];
                              newItems[idx].cost = Number(e.target.value);
                              setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newItems = draftInvoice.sessionItems?.filter((_, i) => i !== idx);
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                          }}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Terbilang Calculation Block */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Total Item / Kuantitas:</span>
                  <span className="text-slate-900">{totalQty}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-100 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-base text-indigo-700">
                    Rp {new Intl.NumberFormat('id-ID').format(totalAmount)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Terbilang :</div>
                  <div className="text-xs font-bold text-slate-700 italic">"{terbilangStr}"</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedBrandId && draftInvoice && (
          <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onSaveDraft}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-xs"
            >
              <CheckSquare className="w-4 h-4" /> Terbitkan & Simpan Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

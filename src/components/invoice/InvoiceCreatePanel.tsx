import React, { useState, useRef, useEffect } from "react";
import { Building2, CheckSquare, Plus, Trash2, Search } from "lucide-react";
import { ClientBrand, BrandInvoice } from "../../types";

type DraftInvoice = Partial<BrandInvoice>;

type InvoiceCreatePanelProps = {
  clientBrands: ClientBrand[];
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
        className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer flex justify-between items-center text-left min-h-[46px]"
      >
        <span className="truncate">
          {selectedBrand 
            ? `${selectedBrand.name} ${selectedBrand.companyName ? `- ${selectedBrand.companyName}` : ''} (${selectedBrand.sessions?.length || 0} Shift)`
            : "-- Klik untuk Pilih Brand --"}
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
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
                    className={`w-full px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-colors cursor-pointer flex flex-col gap-0.5 ${
                      isSelected ? "bg-indigo-50 border-indigo-100" : "text-slate-700 hover:bg-slate-50 border-transparent"
                    } border`}
                  >
                    <div className="flex justify-between items-center w-full">
                       <span className={isSelected ? "text-indigo-700" : ""}>
                         {b.name} {b.companyName ? `- ${b.companyName}` : ''}
                       </span>
                       <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md ${isSelected ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"}`}>
                         {b.sessions?.length || 0} Shift
                       </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-4 text-center text-sm font-bold text-slate-400">
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
  selectedBrandId,
  draftInvoice,
  setSelectedBrandId,
  setDraftInvoice,
  onSelectBrand,
  onSaveDraft,
  onCancel,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col xl:flex-row gap-8 animate-fadeIn">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-black text-slate-800">Visual Editor Invoice</h3>
          <button onClick={onCancel} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Batal</button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Pilih Brand Klien (Otomatis Deteksi Shift)</label>
            <SearchableBrandSelect 
              brands={clientBrands}
              value={selectedBrandId}
              onChange={(val) => {
                setSelectedBrandId(val);
                onSelectBrand(val);
              }}
            />
          </div>

          {selectedBrandId && draftInvoice && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Invoice</label>
                  <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.invoiceNumber || ""} onChange={e => setDraftInvoice({...draftInvoice, invoiceNumber: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Status Draft</label>
                  <select className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white cursor-pointer" value={draftInvoice.status || "Draft"} onChange={e => setDraftInvoice({...draftInvoice, status: e.target.value as BrandInvoice["status"]})}>
                    <option value="Draft">Draft (Belum Dikirim)</option>
                    <option value="Open Invoice">Open Invoice (Sudah Dikirim)</option>
                    <option value="Paid">Paid (Lunas)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tanggal Invoice (Issue Date)</label>
                  <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.issueDate || ""} onChange={e => setDraftInvoice({...draftInvoice, issueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Tenggat Waktu (Due Date)</label>
                  <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.dueDate || ""} onChange={e => setDraftInvoice({...draftInvoice, dueDate: e.target.value})} />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-2">
                <h4 className="text-sm font-black text-slate-800 mb-3">Informasi Kepada (Recipient)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama PT</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.ptName || ""} onChange={e => setDraftInvoice({...draftInvoice, ptName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (PIC)</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.picName || ""} onChange={e => setDraftInvoice({...draftInvoice, picName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">No. Telp PIC</label>
                    <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.picPhone || ""} onChange={e => setDraftInvoice({...draftInvoice, picPhone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email Pengirim (opsional)</label>
                    <input type="email" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.email || ""} onChange={e => setDraftInvoice({...draftInvoice, email: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Detail Alamat Lengkap</label>
                  <textarea rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.address || ""} onChange={e => setDraftInvoice({...draftInvoice, address: e.target.value})} />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-2">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-black text-slate-800">Komponen Penagihan</h4>
                  <button
                    onClick={() => {
                      const newItems = [...(draftInvoice.sessionItems || []), { sessionId: `custom_${Date.now()}`, description: "", qty: 1, cost: 0 }];
                      setDraftInvoice({...draftInvoice, sessionItems: newItems});
                    }}
                    className="text-[10px] bg-white border border-slate-200 shadow-sm px-2 py-1 rounded font-black hover:bg-slate-50 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Tambah Baris
                  </button>
                </div>

                <div className="space-y-2">
                  {(draftInvoice.sessionItems || []).map((item, idx) => (
                    <div key={item.sessionId} className="flex flex-col sm:flex-row gap-2 items-center bg-white p-2 rounded-xl border border-slate-200">
                      <input
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold w-full"
                        placeholder="Deskripsi Item (Misal: Paket Streaming...)"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...(draftInvoice.sessionItems || [])];
                          newItems[idx].description = e.target.value;
                          setDraftInvoice({...draftInvoice, sessionItems: newItems});
                        }}
                      />
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="number"
                          className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-sm font-bold text-center"
                          placeholder="Qty"
                          value={item.qty || ""}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice.sessionItems || [])];
                            newItems[idx].qty = Number(e.target.value);
                            setDraftInvoice({...draftInvoice, sessionItems: newItems});
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
                              const newItems = [...(draftInvoice.sessionItems || [])];
                              newItems[idx].cost = Number(e.target.value);
                              setDraftInvoice({...draftInvoice, sessionItems: newItems});
                            }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newItems = draftInvoice.sessionItems?.filter((_, i) => i !== idx);
                            setDraftInvoice({...draftInvoice, sessionItems: newItems});
                          }}
                          className="p-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedBrandId && draftInvoice && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onSaveDraft}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <CheckSquare className="w-5 h-5" /> Simpan Invoice
            </button>
          </div>
        )}
      </div>

      <div className="hidden xl:block w-80 bg-slate-50 border border-slate-200 rounded-2xl p-5 sticky top-5 h-fit">
        <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2 text-sm">
          <Building2 className="w-4 h-4 text-indigo-500" /> Ringkasan Draft
        </h4>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Total Item</span>
            <span className="font-black text-slate-800">{draftInvoice.sessionItems?.reduce((a, c) => a + (c.qty || 0), 0) || 0}</span>
          </div>
          <div className="flex justify-between items-center text-lg">
            <span className="text-xs font-bold text-slate-500">Grand Total</span>
            <span className="font-black text-indigo-700">Rp{new Intl.NumberFormat('id-ID').format(draftInvoice.sessionItems?.reduce((a, c) => a + (c.cost * c.qty), 0) || 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

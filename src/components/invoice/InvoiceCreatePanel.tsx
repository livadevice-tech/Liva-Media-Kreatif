import React, { useState, useRef, useEffect } from "react";
import { Building2, CheckSquare, Plus, Trash2, Search, X, Landmark, FileText, Calendar, Clock, Maximize2, Minimize2, CreditCard } from "lucide-react";
import { ClientBrand, BrandInvoice, LivaBankAccount } from "../../types";
import { terbilang } from "../../shared/utils/terbilang";
import { formatContractDate } from "../../shared/utils/dateFormatting";

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
        className="w-full border border-slate-200 bg-slate-50/80 hover:bg-white rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer flex justify-between items-center text-left min-h-[44px] shadow-2xs"
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
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
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
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors cursor-pointer flex flex-col gap-0.5 ${
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
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-select brand if none selected yet so the entire form is always ready immediately
  useEffect(() => {
    if (!selectedBrandId && clientBrands.length > 0) {
      const activeBrand = clientBrands.find(b => b.isActive !== false) || clientBrands[0];
      if (activeBrand) {
        setSelectedBrandId(activeBrand.id);
        onSelectBrand(activeBrand.id);
      }
    }
  }, [selectedBrandId, clientBrands, onSelectBrand, setSelectedBrandId]);

  const subtotalProject = (draftInvoice?.sessionItems || []).reduce((acc, curr) => acc + (curr.cost * (curr.qty || 1)), 0);
  const totalQty = (draftInvoice?.sessionItems || []).reduce((acc, curr) => acc + (curr.qty || 0), 0);
  const paymentType = draftInvoice?.paymentType || 'full';
  
  const dpPercent = draftInvoice?.dpPercent ?? 50;
  const dpAmount = draftInvoice?.dpAmount !== undefined 
    ? draftInvoice.dpAmount 
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

  const currentBrand = clientBrands.find(b => b.id === selectedBrandId);
  const effectivePeriodStart = draftInvoice?.livePeriodStart !== undefined
    ? draftInvoice.livePeriodStart
    : (currentBrand?.contractStartDate || "");
  const effectivePeriodEnd = draftInvoice?.livePeriodEnd !== undefined
    ? draftInvoice.livePeriodEnd
    : (currentBrand?.contractEndDate || "");

  const terbilangStr = terbilang(billableAmount);

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden flex justify-end">
      {/* Transparent backdrop - Left side is completely visible and NOT blacked out */}
      <div 
        className="fixed inset-0 bg-transparent transition-opacity cursor-pointer"
        onClick={onCancel}
      />

      {/* Right Drawer Panel with flexible width and clean shadow */}
      <div 
        className={`relative w-full ${
          isExpanded 
            ? 'max-w-[95vw] lg:max-w-6xl' 
            : 'max-w-3xl xl:max-w-4xl'
        } h-full bg-slate-50 flex flex-col z-10 animate-slideInRight border-l border-slate-200 shadow-2xl transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                Nota Tagihan Resmi
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">Buat Invoice Baru</h3>
            <p className="text-[11px] text-slate-400 font-medium">Atur rincian tagihan resmi PT. Liva Media Kreatif untuk klien</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
              title={isExpanded ? "Perkecil Ukuran Sidebar" : "Perlebar Ukuran Sidebar"}
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Standar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Perlebar</span>
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={onCancel} 
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {/* Card 1: Brand Selection & Invoice Meta */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div>
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                Pilih Brand Klien (Bill To Otomatis Terisi) <span className="text-rose-500">*</span>
              </label>
              <SearchableBrandSelect 
                brands={clientBrands.filter(b => b.isActive !== false)}
                value={selectedBrandId}
                onChange={(val) => {
                  setSelectedBrandId(val);
                  onSelectBrand(val);
                }}
              />
              {(() => {
                const currentBrand = clientBrands.find(b => b.id === selectedBrandId);
                if (!currentBrand) return null;
                const hasDates = currentBrand.contractStartDate || currentBrand.contractEndDate;
                return (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    {hasDates && (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        Periode Live: {formatContractDate(currentBrand.contractStartDate)} – {formatContractDate(currentBrand.contractEndDate)}
                      </span>
                    )}
                    {currentBrand.cutOffDate && (
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-md border border-amber-100">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        Cut Off: Tgl {currentBrand.cutOffDate}
                      </span>
                    )}
                    {currentBrand.invoiceDate && (
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                        Tagihan: Tgl {currentBrand.invoiceDate}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Row 1: Invoice Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  Nomor Invoice <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.invoiceNumber || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, invoiceNumber: e.target.value})}
                  placeholder="INV-LIVA/..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  Status Invoice
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.status || "Draft"}
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
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5 text-indigo-600" /> Rekening PT Liva
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.bankInfo?.accountNo || ""}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Invoice
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.invoiceDate || draftInvoice?.issueDate || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, invoiceDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                  Tanggal Terbit (Issue Date)
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.issueDate || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, issueDate: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                  Jatuh Tempo (Due Date)
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  value={draftInvoice?.dueDate || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, dueDate: e.target.value})}
                />
              </div>
            </div>

            {/* Detail Periode Live */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[11px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> Detail Periode Live (Siklus Kontrak)
                </label>
                {(effectivePeriodStart || effectivePeriodEnd) && (
                  <span className="text-[10px] font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-md shadow-2xs">
                    {formatContractDate(effectivePeriodStart)} – {formatContractDate(effectivePeriodEnd)}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Rentang tanggal sesi live streaming yang ditagihkan pada invoice ini
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Periode Live Mulai (Start Date)
                  </label>
                  <input
                    type="date"
                    className="w-full border border-indigo-200/80 rounded-xl px-3 py-1.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    value={effectivePeriodStart}
                    onChange={e => setDraftInvoice({
                      ...draftInvoice,
                      livePeriodStart: e.target.value,
                    })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Periode Live Selesai (End Date)
                  </label>
                  <input
                    type="date"
                    className="w-full border border-indigo-200/80 rounded-xl px-3 py-1.5 font-bold text-xs bg-white text-slate-800 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    value={effectivePeriodEnd}
                    onChange={e => setDraftInvoice({
                      ...draftInvoice,
                      livePeriodEnd: e.target.value,
                    })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Informasi Ditujukan Kepada (Bill To) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Informasi Ditujukan Kepada (Bill To)
                </h4>
                <p className="text-[10px] text-slate-400">Data entitas klien penerima tagihan resmi invoice</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  Nama PT / Badan Usaha <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  placeholder="Contoh: PT Creative Stylemandiri"
                  value={draftInvoice?.ptName || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, ptName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  Kepada / PIC <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  placeholder="Contoh: Sari Ayu Marthatilaar"
                  value={draftInvoice?.picName || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, picName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  placeholder="Contoh: +62812-3974-5911"
                  value={draftInvoice?.picPhone || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, picPhone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                  Email Penagihan
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
                  placeholder="Contoh: viancaxalyssa@gmail.com"
                  value={draftInvoice?.email || ""}
                  onChange={e => setDraftInvoice({...draftInvoice, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-600 tracking-wider mb-1">
                Alamat Lengkap Perusahaan
              </label>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium bg-slate-50 focus:bg-white text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs resize-none"
                placeholder="Contoh: Jl. Pulo Kambing II No.1, Kawasan Industri Pulo Gadung, Jakarta Timur 13930."
                value={draftInvoice?.address || ""}
                onChange={e => setDraftInvoice({...draftInvoice, address: e.target.value})}
              />
            </div>
          </div>

          {/* Card 3: Rincian Layanan / Komponen Tagihan */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Rincian Layanan Tagihan
                  </h4>
                  <p className="text-[10px] text-slate-400">Daftar item (Tekan Enter pada rincian untuk membuat baris baru)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItems = [
                    ...(draftInvoice?.sessionItems || []),
                    { sessionId: `custom_${Date.now()}`, description: "", qty: 1, unit: "Session", cost: 0 },
                  ];
                  setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                }}
                className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {(draftInvoice?.sessionItems || []).map((item, idx) => {
                const itemTotal = (item.cost || 0) * (item.qty || 1);
                const lineCount = (item.description || "").split("\n").length;
                const rows = Math.max(2, Math.min(lineCount, 6));

                return (
                  <div
                    key={item.sessionId || idx}
                    className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 flex flex-col md:flex-row gap-3 items-start md:items-center shadow-2xs hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">
                        Deskripsi Layanan
                      </label>
                      <textarea
                        rows={rows}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 shadow-2xs resize-y leading-relaxed"
                        placeholder="Deskripsi Layanan / Item (Bisa tekan Enter untuk baris baru)"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...(draftInvoice?.sessionItems || [])];
                          newItems[idx].description = e.target.value;
                          setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Qty</label>
                        <input
                          type="number"
                          min="1"
                          className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-center text-slate-800 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
                          placeholder="Qty"
                          value={item.qty || ""}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice?.sessionItems || [])];
                            newItems[idx].qty = Number(e.target.value);
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Satuan</label>
                        <input
                          type="text"
                          className="w-20 border border-slate-200 rounded-lg px-2 py-2 text-xs font-semibold text-center text-slate-700 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
                          placeholder="Unit"
                          value={item.unit || "Session"}
                          onChange={(e) => {
                            const newItems = [...(draftInvoice?.sessionItems || [])];
                            newItems[idx].unit = e.target.value;
                            setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 md:hidden">Harga</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            Rp
                          </span>
                          <input
                            type="number"
                            className="w-32 border border-slate-200 rounded-lg pl-8 pr-2 py-2 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-indigo-500 shadow-2xs"
                            placeholder="Harga"
                            value={item.cost || ""}
                            onChange={(e) => {
                              const newItems = [...(draftInvoice?.sessionItems || [])];
                              newItems[idx].cost = Number(e.target.value);
                              setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                            }}
                          />
                        </div>
                      </div>

                      <div className="hidden lg:block text-right min-w-[110px] px-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Subtotal</div>
                        <div className="text-xs font-black text-slate-800">
                          Rp {new Intl.NumberFormat('id-ID').format(itemTotal)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newItems = draftInvoice?.sessionItems?.filter((_, i) => i !== idx);
                          setDraftInvoice({ ...draftInvoice, sessionItems: newItems });
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer shrink-0 mt-auto md:mt-0"
                        title="Hapus baris item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Opsi Skema Pembayaran & Rincian Total */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 sm:p-4 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-3">
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
                    setDraftInvoice({
                      ...draftInvoice,
                      paymentType: 'full',
                      dpPercent: undefined,
                      dpAmount: undefined,
                      subtotalProject,
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentType === 'full'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
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
                    const defaultPercent = draftInvoice?.dpPercent || 50;
                    const calculatedDp = draftInvoice?.dpAmount !== undefined ? draftInvoice.dpAmount : Math.round(subtotalProject * (defaultPercent / 100));
                    setDraftInvoice({
                      ...draftInvoice,
                      paymentType: 'dp',
                      dpPercent: defaultPercent,
                      dpAmount: calculatedDp,
                      subtotalProject,
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentType === 'dp'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
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
                    const defaultDp = draftInvoice?.dpAmount !== undefined ? draftInvoice.dpAmount : Math.round(subtotalProject * 0.5);
                    setDraftInvoice({
                      ...draftInvoice,
                      paymentType: 'pelunasan',
                      dpPercent: 50,
                      dpAmount: defaultDp,
                      subtotalProject,
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    paymentType === 'pelunasan'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300'
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
                <div className="mt-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-2.5 animate-fadeIn">
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
                            setDraftInvoice({
                              ...draftInvoice,
                              paymentType: 'dp',
                              dpPercent: pct,
                              dpAmount: newDp,
                              subtotalProject,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                            dpPercent === pct
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-indigo-100/80">
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
                          setDraftInvoice({
                            ...draftInvoice,
                            paymentType: 'dp',
                            dpPercent: calculatedPct,
                            dpAmount: val,
                            subtotalProject,
                          });
                        }}
                        className="w-full bg-white border border-indigo-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-black text-indigo-950 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
                        placeholder="Contoh: 7250000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pelunasan Configuration Controls */}
              {paymentType === 'pelunasan' && (
                <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2.5 animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-900">
                      DP Yang Telah Dibayar Klien:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const half = Math.round(subtotalProject * 0.5);
                        setDraftInvoice({
                          ...draftInvoice,
                          paymentType: 'pelunasan',
                          dpPercent: 50,
                          dpAmount: half,
                          subtotalProject,
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-black bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                    >
                      Set 50% (Rp {new Intl.NumberFormat('id-ID').format(Math.round(subtotalProject * 0.5))})
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1 border-t border-emerald-100/80">
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
                          setDraftInvoice({
                            ...draftInvoice,
                            paymentType: 'pelunasan',
                            dpAmount: val,
                            subtotalProject,
                          });
                        }}
                        className="w-full bg-white border border-emerald-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-black text-emerald-950 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                        placeholder="Contoh: 7250000"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Exact Calculation Preview matching User Screenshots */}
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1.5 font-sans">
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
                <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Amount in Words:</span>
                <span className="text-xs font-bold text-slate-700 italic">"{terbilangStr}"</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Sticky Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer text-xs"
          >
            <CheckSquare className="w-4 h-4" /> Terbitkan & Simpan Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

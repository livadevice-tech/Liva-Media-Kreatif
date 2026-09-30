import React, { useState } from 'react';
import { Building2, Search, Edit3, Plus, Phone, Mail, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, X, Save } from 'lucide-react';
import { ClientBrand } from '../../types';
import { formatContractDate } from '../../shared/utils/dateFormatting';

interface ClientBillingDirectoryProps {
  clientBrands: ClientBrand[];
  onUpdateBrands: (brands: ClientBrand[]) => void;
  onCreateInvoiceForBrand: (brandId: string) => void;
}

export const ClientBillingDirectory: React.FC<ClientBillingDirectoryProps> = ({
  clientBrands,
  onUpdateBrands,
  onCreateInvoiceForBrand,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompleteness, setFilterCompleteness] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [editingBrand, setEditingBrand] = useState<ClientBrand | null>(null);

  // Form states for editing billing data
  const [companyName, setCompanyName] = useState('');
  const [picName, setPicName] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('29');
  const [cutOffDate, setCutOffDate] = useState('15');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');

  const handleOpenEdit = (brand: ClientBrand) => {
    setEditingBrand(brand);
    setCompanyName(brand.companyName || '');
    setPicName(brand.picName || '');
    setPicPhone(brand.picPhone || '');
    setPicEmail(brand.picEmail || '');
    setCompanyAddress(brand.companyAddress || '');
    setInvoiceDate(brand.invoiceDate || '29');
    setCutOffDate(brand.cutOffDate || '15');
    const extractDay = (val?: string) => {
      if (!val) return '';
      const cleaned = val.replace(/^Tgl\s*/i, '').trim();
      if (cleaned.includes('-')) {
        const parts = cleaned.split('T')[0].split('-');
        return String(parseInt(parts[parts.length - 1], 10) || '');
      }
      return cleaned;
    };
    setContractStartDate(extractDay(brand.contractStartDate));
    setContractEndDate(extractDay(brand.contractEndDate));
  };

  const handleSaveBillingData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;

    const updatedBrands = clientBrands.map((b) => {
      if (b.id === editingBrand.id) {
        return {
          ...b,
          companyName: companyName.trim(),
          picName: picName.trim(),
          picPhone: picPhone.trim(),
          picEmail: picEmail.trim(),
          companyAddress: companyAddress.trim(),
          invoiceDate: invoiceDate.trim(),
          cutOffDate: cutOffDate.trim() || '15',
          contractStartDate: contractStartDate || undefined,
          contractEndDate: contractEndDate || '',
        };
      }
      return b;
    });

    onUpdateBrands(updatedBrands);
    setEditingBrand(null);
  };

  const isBillingComplete = (b: ClientBrand) => {
    return Boolean(
      b.companyName?.trim() &&
      b.picName?.trim() &&
      b.picPhone?.trim() &&
      b.picEmail?.trim() &&
      b.companyAddress?.trim()
    );
  };

  const filteredBrands = clientBrands
    .filter((b) => b.isActive !== false)
    .filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.companyName && b.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.picName && b.picName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.picEmail && b.picEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.companyAddress && b.companyAddress.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      const complete = isBillingComplete(b);
      if (filterCompleteness === 'complete') return complete;
      if (filterCompleteness === 'incomplete') return !complete;
      return true;
    });

  const totalClients = clientBrands.filter(b => b.isActive !== false).length;
  const completeClients = clientBrands.filter(b => b.isActive !== false && isBillingComplete(b)).length;
  const incompleteClients = totalClients - completeClients;

  return (
    <div className="space-y-3.5 animate-fadeIn w-full min-w-0">
      {/* Header Info Banner */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Direktori Data Penagihan Klien (Bill To)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Data identitas legal klien (Nama PT, Nama Brand, PIC, No. WA, Email, dan Alamat Resmi) seperti pada bagian <span className="font-semibold text-slate-700">DITUJUKAN KEPADA (BILL TO)</span> di PDF tagihan invoice resmi.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl shrink-0">
          <div className="px-2.5 py-1 rounded-lg text-center bg-white border border-slate-100 shadow-2xs">
            <div className="text-[9px] uppercase font-bold text-slate-400">Total Klien</div>
            <div className="text-xs font-black text-slate-800">{totalClients}</div>
          </div>
          <div className="px-2.5 py-1 rounded-lg text-center bg-emerald-50 border border-emerald-100">
            <div className="text-[9px] uppercase font-bold text-emerald-600">Lengkap</div>
            <div className="text-xs font-black text-emerald-700">{completeClients}</div>
          </div>
          <div className="px-2.5 py-1 rounded-lg text-center bg-amber-50 border border-amber-100">
            <div className="text-[9px] uppercase font-bold text-amber-600">Perlu Dilengkapi</div>
            <div className="text-xs font-black text-amber-700">{incompleteClients}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row justify-between items-center gap-2.5">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'complete', 'incomplete'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterCompleteness(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCompleteness === filter
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {filter === 'all' && `Semua Klien (${totalClients})`}
              {filter === 'complete' && `Data Lengkap (${completeClients})`}
              {filter === 'incomplete' && `Belum Lengkap (${incompleteClients})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari PT, Brand, PIC, Alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200/80 rounded-lg pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
        {filteredBrands.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center p-6">
            <Building2 className="w-12 h-12 text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Tidak Ada Klien Ditemukan</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Coba sesuaikan kata kunci pencarian atau ubah filter kelengkapan data.
            </p>
          </div>
        ) : (
          filteredBrands.map((brand) => {
            const isEditing = editingBrand?.id === brand.id;
            const complete = isBillingComplete(brand);
            const invoiceCount = brand.invoices?.length || 0;

            if (isEditing) {
              return (
                <form
                  key={brand.id}
                  onSubmit={handleSaveBillingData}
                  className="bg-white rounded-2xl border-2 border-indigo-500 ring-4 ring-indigo-50/70 shadow-lg p-5 flex flex-col justify-between transition-all duration-200 animate-fadeIn"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">
                          {brand.name}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">Edit Data Penagihan</h4>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Edit3 className="w-3 h-3 text-indigo-600" />
                        Mode Edit
                      </span>
                    </div>

                    {/* Nama PT */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        Nama PT / Badan Usaha <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: PT Creative Stylemandiri"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>

                    {/* PIC / Kontak */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        PIC / Kontak <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nama PIC"
                        value={picName}
                        onChange={(e) => setPicName(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                      />
                    </div>

                    {/* WA & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          WA / Telp <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="0812-..."
                          value={picPhone}
                          onChange={(e) => setPicPhone(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="email@pt.com"
                          value={picEmail}
                          onChange={(e) => setPicEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Alamat */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        Alamat Kantor / Tagihan <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Alamat lengkap PT..."
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-slate-50/50 focus:bg-white transition-all shadow-2xs resize-none"
                      />
                    </div>

                    {/* Periode Kerjasama (Live) & Jadwal Tagihan */}
                    <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/80 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-bold uppercase text-[10px] tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Periode Kerjasama (Live) & Cut Off</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                            Tgl Mulai Live (1-31)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Contoh: 21"
                            value={contractStartDate}
                            onChange={(e) => setContractStartDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                            Tgl Selesai Live (1-31)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="Contoh: 20"
                            value={contractEndDate}
                            onChange={(e) => setContractEndDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                            Tgl Cut Off (1-31)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="15"
                            value={cutOffDate}
                            onChange={(e) => setCutOffDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-600 uppercase tracking-wider mb-1">
                            Tgl Tagihan (1-31)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="31"
                            placeholder="29"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingBrand(null)}
                      className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Simpan
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={brand.id}
                className="bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs p-4 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  {/* Top Bar: Brand & PT Name + Completeness Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block mb-0.5">
                        {brand.name}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 truncate" title={brand.companyName || brand.name}>
                        {brand.companyName || (
                          <span className="text-slate-400 font-medium italic">Belum ada Nama PT</span>
                        )}
                      </h4>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        complete
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {complete ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Lengkap
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Belum Lengkap
                        </>
                      )}
                    </span>
                  </div>

                  {/* PIC Name */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mb-3">
                    <div className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Kepada (PIC):</span>
                      <span className="font-bold text-slate-800">{brand.picName || '-'}</span>
                    </div>

                    {/* Phone */}
                    <div className="text-xs font-medium text-slate-600 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" /> WA / Telp:
                      </span>
                      {brand.picPhone ? (
                        <a
                          href={`https://wa.me/${brand.picPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 font-bold hover:underline"
                        >
                          {brand.picPhone}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="text-xs font-medium text-slate-600 flex items-center justify-between truncate">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 shrink-0">
                        <Mail className="w-3 h-3 text-slate-400" /> Email:
                      </span>
                      {brand.picEmail ? (
                        <a
                          href={`mailto:${brand.picEmail}`}
                          className="text-indigo-600 font-medium hover:underline truncate max-w-[180px]"
                          title={brand.picEmail}
                        >
                          {brand.picEmail}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-3 text-xs text-slate-600">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> Alamat Kantor / Tagihan:
                    </div>
                    {brand.companyAddress ? (
                      <p className="line-clamp-2 text-[11px] leading-relaxed font-medium bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                        {brand.companyAddress}
                      </p>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Belum diisi</span>
                    )}
                  </div>

                  {/* Periode Kerjasama (Live) & Cut Off */}
                  <div className="mb-3 bg-slate-50/80 border border-slate-200/70 rounded-xl p-2.5 space-y-1.5">
                    <div className="text-xs flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> Periode Live:
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        {brand.contractStartDate || brand.contractEndDate ? (
                          `${formatContractDate(brand.contractStartDate)} – ${formatContractDate(brand.contractEndDate)}`
                        ) : (
                          <span className="text-slate-400 italic font-normal">Belum diatur</span>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/60 text-[11px]">
                      <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Cut Off:</span>
                        <span className="font-bold text-indigo-600">
                          Tgl {brand.cutOffDate || '15'} / bln
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Tagihan:</span>
                        <span className="font-bold text-slate-800">
                          Tgl {brand.invoiceDate || '29'} / bln
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Billing Schedule & Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Siklus Penagihan Bulanan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{invoiceCount} Invoice</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Data
                  </button>

                  <button
                    onClick={() => onCreateInvoiceForBrand(brand.id)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <span>Buat Invoice</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

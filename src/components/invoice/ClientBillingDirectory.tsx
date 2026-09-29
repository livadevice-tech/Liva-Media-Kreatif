import React, { useState } from 'react';
import { Building2, Search, Edit3, Plus, Phone, Mail, MapPin, Calendar, CheckCircle2, AlertCircle, FileText, ArrowRight, X } from 'lucide-react';
import { ClientBrand } from '../../types';

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

  const handleOpenEdit = (brand: ClientBrand) => {
    setEditingBrand(brand);
    setCompanyName(brand.companyName || '');
    setPicName(brand.picName || '');
    setPicPhone(brand.picPhone || '');
    setPicEmail(brand.picEmail || '');
    setCompanyAddress(brand.companyAddress || '');
    setInvoiceDate(brand.invoiceDate || '29');
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
    <div className="space-y-6 animate-fadeIn">
      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Direktori Data Penagihan Klien (Bill To)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Data identitas legal klien (Nama PT, Nama Brand, PIC, No. WA, Email, dan Alamat Resmi) seperti pada bagian <span className="font-semibold text-slate-700">DITUJUKAN KEPADA (BILL TO)</span> di PDF tagihan invoice resmi.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1.5 rounded-xl shrink-0">
          <div className="px-3 py-1.5 rounded-lg text-center bg-white border border-slate-100 shadow-xs">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Klien</div>
            <div className="text-sm font-black text-slate-800">{totalClients}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-center bg-emerald-50 border border-emerald-100">
            <div className="text-[10px] uppercase font-bold text-emerald-600">Lengkap</div>
            <div className="text-sm font-black text-emerald-700">{completeClients}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-center bg-amber-50 border border-amber-100">
            <div className="text-[10px] uppercase font-bold text-amber-600">Perlu Dilengkapi</div>
            <div className="text-sm font-black text-amber-700">{incompleteClients}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'complete', 'incomplete'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterCompleteness(filter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCompleteness === filter
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter === 'all' && `Semua Klien (${totalClients})`}
              {filter === 'complete' && `Data Lengkap (${completeClients})`}
              {filter === 'incomplete' && `Belum Lengkap (${incompleteClients})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari PT, Brand, PIC, Alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
            const complete = isBillingComplete(brand);
            const invoiceCount = brand.invoices?.length || 0;
            const totalInvoiceAmount = brand.invoices?.reduce((sum, i) => sum + (i.totalAmount || 0), 0) || 0;

            return (
              <div
                key={brand.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm p-5 flex flex-col justify-between transition-all duration-200 group"
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

                  {/* Billing Schedule & Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tagihan: Tgl {brand.invoiceDate || '29'} / bln</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{invoiceCount} Invoice</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(brand)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Data
                  </button>

                  <button
                    onClick={() => onCreateInvoiceForBrand(brand.id)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
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

      {/* Edit Client Billing Modal */}
      {editingBrand && (
        <div className="fixed inset-0 z-[120] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Edit Data Penagihan: {editingBrand.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Data ini akan otomatis tercantum pada bagian DITUJUKAN KEPADA (BILL TO) invoice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingBrand(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBillingData} className="p-6 space-y-4">
              {/* Nama PT */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Badan Usaha / PT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Creative Stylemandiri"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">Nama resmi entitas perusahaan yang ditagih (muncul di baris pertama Bill To)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PIC Name */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Nama PIC / Kontak <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sari Ayu Marthatilaar"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Tanggal Penagihan */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Siklus Tanggal Invoice
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="29"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tanggal pembuatan tagihan rutin tiap bulan (1-31)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone / WA */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Nomor WhatsApp / Telp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: +62812-3974-5911"
                    value={picPhone}
                    onChange={(e) => setPicPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                    Email Penagihan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Contoh: viancaxalyssa@gmail.com"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase tracking-wider mb-1.5">
                  Alamat Lengkap Perusahaan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Jl. Pulo Kambing II No.1, Kawasan Industri Pulo Gadung, Jakarta Timur 13930."
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBrand(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
                >
                  Simpan Data Penagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

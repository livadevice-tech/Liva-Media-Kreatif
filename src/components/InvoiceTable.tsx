import React, { useState } from 'react';
import { FileText, Calendar, Search, Edit2, Trash2, Download, Mail, ArrowUpDown } from 'lucide-react';
import { ClientBrand, BrandInvoice } from '../types';

interface InvoiceTableProps {
  allInvoices: (BrandInvoice & { brandId: string; brandName: string })[];
  upcomingBillings: ClientBrand[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterMonth: string;
  setFilterMonth: (m: string) => void;
  updateInvoiceStatus: (brandId: string, invId: string, newStatus: BrandInvoice["status"]) => void;
  setInvoiceEditor: (inv: BrandInvoice & { brandId: string }) => void;
  setInvoiceToDelete: (data: {brandId: string, id: string}) => void;
  handlePrint: (inv: BrandInvoice, brandName: string) => void;
  handleShowEmailCopy: (inv: BrandInvoice, brandName: string, picEmail?: string) => void;
  clientBrands: ClientBrand[];
  formatDateUI: (d?: string) => string;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  allInvoices, upcomingBillings, searchQuery, setSearchQuery, filterMonth, setFilterMonth,
  updateInvoiceStatus, setInvoiceEditor, setInvoiceToDelete, handlePrint, handleShowEmailCopy, clientBrands, formatDateUI
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  return (
    <div className="space-y-6">
      {upcomingBillings.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
             <div className="bg-amber-100 text-amber-600 p-3 rounded-xl mt-1">
               <Calendar className="w-6 h-6" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-amber-900">Jadwal Penagihan Tiba</h3>
               <p className="text-sm text-amber-700 font-medium mt-1 mb-3">Terdapat brand yang telah memasuki jadwal penagihan invoice bulan ini.</p>
               <div className="flex flex-wrap gap-2">
                 {upcomingBillings.map(b => (
                   <div key={b.id} className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                     <span className="font-medium text-slate-800 text-sm">{b.name}</span>
                     <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-semibold px-2 py-0.5 rounded">Tgl {b.invoiceDate}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Total Invoice</div>
            <div className="text-2xl font-semibold text-slate-800 leading-none">{allInvoices.length}</div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Open / Draft</div>
            <div className="text-2xl font-semibold text-slate-800 leading-none">{allInvoices.filter(i => i.status === "Open Invoice" || i.status === "Draft").length}</div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Telah Dibayar</div>
            <div className="text-2xl font-semibold text-slate-800 leading-none">{allInvoices.filter(i => i.status === "Paid").length}</div>
         </div>
         <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">Total Invoice Lunas</div>
            <div className="text-xl font-bold text-slate-800 leading-tight truncate px-1">Rp {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(allInvoices.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.totalAmount, 0))}</div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-wrap gap-4">
          <h3 className="font-semibold text-slate-800">Semua Invoice</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input 
              type="month"
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 font-medium text-slate-800"
            />
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Cari invoice/brand..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        {allInvoices.length === 0 ? (
          <div className="p-16 text-center text-slate-500 flex flex-col items-center">
             <FileText className="w-12 h-12 text-slate-300 mb-4" />
             <p className="font-bold">Belum ada invoice dibuat.</p>
             <p className="text-sm mt-1">Klik Buat Invoice Baru untuk menagih client Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs font-medium border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">
                    <button 
                       onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')} 
                       className="flex items-center gap-1.5 hover:text-slate-700 cursor-pointer transition-colors font-medium outline-none"
                    >
                      Invoice #
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortOrder === 'asc' ? 'text-indigo-500' : 'text-slate-400'}`} />
                    </button>
                  </th>
                  <th className="py-4 px-6">Customer / Brand</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allInvoices
                  .filter(inv => inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || inv.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || (inv.recipientName && inv.recipientName.toLowerCase().includes(searchQuery.toLowerCase())))
                  .sort((a, b) => {
                     return sortOrder === 'asc' 
                       ? a.invoiceNumber.localeCompare(b.invoiceNumber) 
                       : b.invoiceNumber.localeCompare(a.invoiceNumber);
                  })
                  .map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{inv.invoiceNumber}</div>
                      <div className="text-[10px] font-medium text-slate-500 mt-0.5">{inv.sessionItems.length} Komponen Item</div>
                    </td>
                    <td className="py-4 px-6">
                       <div className="font-semibold text-slate-800 text-sm">{inv.ptName || inv.brandName}</div>
                       <div className="text-[11px] font-medium text-slate-500 truncate max-w-[180px]">{inv.picName || inv.recipientName}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select 
                         value={inv.status}
                         onChange={(e) =>
                           updateInvoiceStatus(
                             inv.brandId,
                             inv.id,
                             e.target.value as BrandInvoice["status"],
                           )
                         }
                         className={`text-[11px] font-medium px-3 py-1 rounded-md border border-slate-200 outline-none cursor-pointer text-center appearance-none transition-all
                           ${inv.status === 'Draft' ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' : 
                             inv.status === 'Open Invoice' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' : 
                             inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 
                             'bg-red-50 text-red-700 hover:bg-red-100'
                           }
                         `}
                       >
                         <option value="Draft">DRAFT</option>
                         <option value="Open Invoice">SENT (OPEN)</option>
                         <option value="Paid">LUNAS</option>
                         <option value="Overdue">OVERDUE</option>
                       </select>
                    </td>
                    <td className="py-4 px-6">
                       <div className="text-xs font-medium text-slate-700 mb-0.5">Dibuat: {formatDateUI(inv.issueDate)}</div>
                       <div className="text-[10px] font-medium text-slate-500">Tenggat: <span className={inv.status === 'Overdue' ? 'text-red-500' : ''}>{formatDateUI(inv.dueDate)}</span></div>
                    </td>
                    <td className="py-4 px-6 text-right">
                       <div className="font-medium text-slate-800 text-sm">Rp{new Intl.NumberFormat('id-ID').format(inv.totalAmount)}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <div className="flex items-center justify-center gap-1">
                         <button onClick={() => setInvoiceEditor(inv)} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer transition-colors" title="Edit Invoice">
                           <Edit2 className="w-4 h-4 mx-auto" />
                         </button>
                         <button onClick={() => setInvoiceToDelete({brandId: inv.brandId, id: inv.id})} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer transition-colors" title="Hapus Invoice">
                           <Trash2 className="w-4 h-4 mx-auto" />
                         </button>
                         <button onClick={() => handlePrint(inv, inv.brandName)} className="p-2 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors" title="Download & Print PDF">
                           <Download className="w-4 h-4 mx-auto" />
                         </button>
                         <button onClick={() => {
                             const brand = clientBrands.find(b => b.id === inv.brandId);
                             handleShowEmailCopy(inv, inv.brandName, brand?.picEmail);
                         }} className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 rounded-lg cursor-pointer transition-colors" title="Lihat Copy Email">
                            <Mail className="w-4 h-4 mx-auto" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

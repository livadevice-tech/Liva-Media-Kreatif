import React, { useState, useMemo, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Download, Plus, X, FileText, CheckCircle2, Clock, Building2, ArrowRight, CheckSquare, Search, Edit2, Trash2, Calendar, Settings, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { ClientBrand, BrandInvoice } from '../types';

interface InvoiceDashboardProps {
  clientBrands: ClientBrand[];
  onUpdateBrands: (brands: ClientBrand[]) => void;
}

interface InvoiceSettings {
  logoUrl: string;
  signatureUrl: string;
  signatureName: string;
  accountNo: string;
  accountName: string;
  bankName: string;
}

export const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ clientBrands, onUpdateBrands }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "settings" | "berkas">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [berkasEditor, setBerkasEditor] = useState<{ brandId: string; id: string; name: string; type: string; url: string; } | null>(null);
  const [berkasToDelete, setBerkasToDelete] = useState<{ brandId: string; berkasId: string; } | null>(null);
  
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    logoUrl: "",
    signatureUrl: "",
    signatureName: "MUFTHI ALI W",
    accountNo: "8905461245",
    accountName: "MUFTHI ALI W",
    bankName: "BCA KEDATON"
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "invoice_settings"), (docSnap) => {
      if (docSnap.exists()) {
        setInvoiceSettings(docSnap.data() as InvoiceSettings);
      }
    });

    // Fallback if needed for smooth transition from previous localStorage logic
    const saved = localStorage.getItem("mcn_invoice_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!invoiceSettings.logoUrl && parsed.logoUrl) {
          // You might do a one-time sync here, but fetching from Firestore is priority.
        }
      } catch(e){}
    }
    
    return () => unsub();
  }, []);

  const saveSettings = async (newSettings: InvoiceSettings) => {
    setInvoiceSettings(newSettings);
    // Also store to localStorage as backup
    localStorage.setItem("mcn_invoice_settings", JSON.stringify(newSettings));
    await setDoc(doc(db, "settings", "invoice_settings"), newSettings, { merge: true });
  };
  
  // For creation
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [draftInvoice, setDraftInvoice] = useState<Partial<BrandInvoice>>({});
  
  const [invoiceEditor, setInvoiceEditor] = useState<(BrandInvoice & { brandId: string }) | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{brandId: string, id: string} | null>(null);

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const [filterMonth, setFilterMonth] = useState<string>(currentYearMonth);

  const allInvoices = useMemo(() => {
    let list: (BrandInvoice & { brandId: string; brandName: string })[] = [];
    clientBrands.forEach(brand => {
      if (brand.invoices) {
        brand.invoices.forEach(inv => {
          list.push({ ...inv, brandId: brand.id, brandName: brand.name });
        });
      }
    });
    
    if (filterMonth) {
      list = list.filter(inv => inv.issueDate.startsWith(filterMonth));
    }
    
    return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [clientBrands, filterMonth]);

  const upcomingBillings = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    return clientBrands.filter(b => {
      if (!b.invoiceDate) return false;
      const invDay = parseInt(b.invoiceDate);
      if (isNaN(invDay)) return false;
      // if invoice day is within 3 days (before or after, or just upcoming in next 3 days)
      let diff = invDay - currentDay;
      if (diff < 0) diff += 30; // loop around month
      return diff >= 0 && diff <= 3;
    });
  }, [clientBrands]);

  const handleBrandSelectForDraft = (brandId: string) => {
    setSelectedBrandId(brandId);
    if (!brandId) return;
    const brand = clientBrands.find(b => b.id === brandId);
    if (!brand) return;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7);
    
    // Auto detect shift counts
    const shiftCount = brand.sessions?.length || 1;
    
    setDraftInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV/${Math.floor(Math.random()*900)+100}/LIVA AGENCY/${today.getMonth()+1}/${today.getFullYear()}`,
      issueDate: today.toISOString().substring(0, 10),
      dueDate: dueDate.toISOString().substring(0, 10),
      status: "Draft",
      recipientName: brand.picName || brand.name,
      email: brand.picEmail || "",
      address: brand.companyAddress || "",
      sessionItems: [
        {
          sessionId: `sess_${Date.now()}`,
          description: `Livestreaming Package Reguler (${shiftCount * 3} Hours) ${today.toLocaleString('id-ID', { month: 'long' })}`,
          qty: shiftCount,
          cost: 7000000 
        }
      ]
    });
  };

  const handleSaveDraft = () => {
    if (!selectedBrandId || !draftInvoice.invoiceNumber) return;
    
    const items = draftInvoice.sessionItems || [];
    const totalAmount = items.reduce((acc, curr) => acc + (curr.cost * curr.qty), 0);
    
    const finalInvoice = {
      ...draftInvoice,
      totalAmount,
    } as BrandInvoice;

    const updatedBrands = clientBrands.map(b => {
      if (b.id === selectedBrandId) {
        return {
          ...b,
          invoices: [...(b.invoices || []), finalInvoice]
        };
      }
      return b;
    });

    onUpdateBrands(updatedBrands);
    setActiveTab("overview");
    setSelectedBrandId("");
    setDraftInvoice({});
  };

  const updateInvoiceStatus = (brandId: string, invId: string, newStatus: BrandInvoice["status"]) => {
    const updatedBrands = clientBrands.map(b => {
      if (b.id === brandId) {
        const updatedInvoices = (b.invoices || []).map(inv => inv.id === invId ? { ...inv, status: newStatus } : inv);
        return { ...b, invoices: updatedInvoices };
      }
      return b;
    });
    onUpdateBrands(updatedBrands);
  };

  const confirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    const { brandId, id: invId } = invoiceToDelete;
    const updatedBrands = clientBrands.map(b => {
      if (b.id === brandId) {
        return {
          ...b,
          invoices: (b.invoices || []).filter(inv => inv.id !== invId)
        };
      }
      return b;
    });
    onUpdateBrands(updatedBrands);
    setInvoiceToDelete(null);
  };

  const handlePrint = (invoice: BrandInvoice, brandName: string) => {
    const brand = clientBrands.find(b => b.invoices?.some(i => i.id === invoice.id));
    const recipient = invoice.recipientName || brand?.name || brandName;
    const address = invoice.address || "-";
    const email = invoice.email || "-";
    const phone = brand?.picName ? "" : ""; // Not available in new schema easily

    const printWindow = window.open('', '', 'width=900,height=1000');
    if (!printWindow) return;
    
    const issueParts = new Date(invoice.issueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    const dueParts = new Date(invoice.dueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

    const logoHtml = invoiceSettings.logoUrl 
      ? `<img src="${invoiceSettings.logoUrl}" style="max-height: 50px; display: inline-block;" />`
      : `<div style="font-size: 42px; font-weight: 800; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">LIVE</div>`;

    const signHtml = invoiceSettings.signatureUrl 
      ? `<img src="${invoiceSettings.signatureUrl}" style="width: 120px; max-height: 80px; object-fit: contain; margin-bottom: -10px;" />`
      : `<div style="height: 60px;"></div>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap');
            body { 
              font-family: 'Montserrat', sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #1e293b; 
              background: white; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-banner { 
              background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%); 
              padding: 50px 60px;
              display: flex;
              justify-content: space-between;
              color: white;
            }
            .header-banner .title {
              font-size: 48px;
              font-weight: 800;
              margin: 0 0 20px 0;
            }
            .header-details {
              display: grid;
              grid-template-columns: 120px 1fr;
              font-size: 14px;
              gap: 8px 10px;
              font-weight: 600;
            }
            .header-details span { font-weight: 400; }
            .logo-section {
              text-align: right;
            }
            .content { padding: 40px 60px; }
            .top-info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .invoice-to h3, .payment-method h3 { font-size: 18px; font-weight: 800; margin: 0 0 15px 0; color: #000; }
            .address-block { margin-top: 15px; font-size: 14px; line-height: 1.5; }
            .address-details { display: grid; grid-template-columns: 70px 1fr; gap: 4px 10px; margin-top: 15px; }
            .payment-grid { display: grid; grid-template-columns: 120px 1fr; gap: 4px 10px; font-size: 14px; text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f97316; color: white; padding: 15px 20px; text-align: left; font-weight: 600; }
            th:first-child { border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
            th:last-child { border-top-right-radius: 12px; border-bottom-right-radius: 12px; text-align: right; }
            td { padding: 20px; border-bottom: 1px solid #f1f5f9; vertical-align: top; font-weight: 600; font-size: 15px; }
            td:last-child { text-align: right; }
            .total-row { display: flex; justify-content: space-between; padding: 20px 20px; font-size: 18px; font-weight: 800; border-bottom: 2px solid #a855f7; margin-top: 10px; }
            .bottom-section { display: flex; justify-content: space-between; margin-top: 40px; }
            .terms { max-width: 350px; }
            .terms h4 { font-size: 16px; font-weight: 800; margin: 0 0 10px 0; }
            .terms p { font-size: 14px; line-height: 1.5; color: #333; margin: 0; }
            .signature { text-align: right; padding-top: 20px; }
            .signature h4 { margin: 0; font-size: 18px; font-weight: 800; }
            .footer { background: linear-gradient(90deg, #f97316, #fb923c); color: white; padding: 25px 60px; display: flex; justify-content: space-between; align-items: center; margin-top: 60px; }
            .footer-msg { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
            .footer-contact { text-align: right; font-size: 14px; font-weight: 600; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="title">INVOICE</div>
              <div class="header-details">
                <div>No:</div> <span>${invoice.invoiceNumber}</span>
                <div>Due Date:</div> <span>${dueParts}</span>
                <div>Invoice Date:</div> <span>${issueParts}</span>
              </div>
            </div>
            <div class="logo-section">
              ${logoHtml}
            </div>
          </div>
          
          <div class="content">
            <div class="top-info">
              <div class="invoice-to">
                <h3>INVOICE TO:</h3>
                <strong>${recipient}</strong>
                <div class="address-block">
                  <div class="address-details">
                    <strong>Email:</strong> <span>${email}</span>
                    <strong>Address:</strong> <span style="white-space: pre-wrap;">${address}</span>
                  </div>
                </div>
              </div>
              
              <div class="payment-method">
                <h3>PAYMENT METHOD</h3>
                <div class="payment-grid">
                  <span>Account No:</span> <strong>${invoiceSettings.accountNo || "-"}</strong>
                  <span>Account Name:</span> <strong>${invoiceSettings.accountName || "-"}</strong>
                  <span>Bank Name:</span> <strong>${invoiceSettings.bankName || "-"}</strong>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">NO</th>
                  <th>ITEM</th>
                  <th>PRICE</th>
                  <th>QTY</th>
                  <th>SUB TOTAL</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.sessionItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.description}</td>
                    <td>Rp.${new Intl.NumberFormat('id-ID').format(item.cost)},-</td>
                    <td style="text-align: center;">${item.qty}</td>
                    <td>Rp.${new Intl.NumberFormat('id-ID').format(item.cost * item.qty)},-</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="total-row">
              <div>TOTAL</div>
              <div>Rp.${new Intl.NumberFormat('id-ID').format(invoice.totalAmount)},-</div>
            </div>
            
            <div class="bottom-section">
              <div class="terms">
                <h4>TERMS AND CONDITIONS</h4>
                <p>Please send payment within 7 days of receiving this invoice.</p>
              </div>
              
              <div class="signature">
                ${signHtml}
                <h4>${invoiceSettings.signatureName || "ADMINISTRATOR"}</h4>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-msg">THANK YOU FOR YOUR BUSINESS</div>
            <div class="footer-contact">
              Admin & Billing Support
            </div>
          </div>
          
          <script>
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceSettings(prev => ({
          ...prev,
          [field]: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn min-h-screen pb-12" id="operator_invoice_dashboard">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Manajemen Invoice & Tagihan
          </h2>
          <p className="text-sm font-semibold text-slate-500 mt-1">Lacak pembayaran client, generate invoice PDF, dan kelola tagihan MCN terpusat.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("settings")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Settings className="w-5 h-5" /> Pengaturan Nota
          </button>
          <button 
            onClick={() => setActiveTab("berkas")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FileText className="w-5 h-5" /> Kelola Berkas
          </button>
          <button 
            onClick={() => { setActiveTab("create"); handleBrandSelectForDraft(""); }}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Buat Invoice Baru
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {upcomingBillings.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                 <div className="bg-amber-100 text-amber-600 p-3 rounded-xl mt-1">
                   <Calendar className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-black text-amber-900">Jadwal Penagihan Tiba</h3>
                   <p className="text-sm text-amber-700 font-semibold mt-1 mb-3">Terdapat brand yang telah memasuki jadwal penagihan invoice bulan ini.</p>
                   <div className="flex flex-wrap gap-2">
                     {upcomingBillings.map(b => (
                       <div key={b.id} className="bg-white border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                         <span className="font-bold text-slate-800 text-sm">{b.name}</span>
                         <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded">Tgl {b.invoiceDate}</span>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Total Invoice</div>
                <div className="text-3xl font-black text-slate-800 leading-none">{allInvoices.length}</div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Open / Draft</div>
                <div className="text-3xl font-black text-slate-800 leading-none">{allInvoices.filter(i => i.status === "Open Invoice" || i.status === "Draft").length}</div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Telah Dibayar</div>
                <div className="text-3xl font-black text-slate-800 leading-none">{allInvoices.filter(i => i.status === "Paid").length}</div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">Total Invoice Lunas</div>
                <div className="text-xl font-black text-indigo-700 leading-tight truncate px-1">Rp {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short" }).format(allInvoices.filter(i => i.status === "Paid").reduce((acc, curr) => acc + curr.totalAmount, 0))}</div>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-wrap gap-4">
              <h3 className="font-bold text-slate-800">Semua Invoice</h3>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input 
                  type="month"
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400 font-black text-slate-800"
                />
                <div className="relative flex-1 md:flex-none">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Cari invoice/brand..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 font-medium"
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
                  <thead className="bg-[#f8fafc] text-slate-500 text-[10px] uppercase tracking-wider font-black border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Invoice #</th>
                      <th className="py-4 px-6">Customer / Brand</th>
                      <th className="py-4 px-6 text-center">Status</th>
                      <th className="py-4 px-6">Tanggal</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                      <th className="py-4 px-6 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allInvoices.filter(inv => inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || inv.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || (inv.recipientName && inv.recipientName.toLowerCase().includes(searchQuery.toLowerCase()))).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-black text-slate-800">{inv.invoiceNumber}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{inv.sessionItems.length} Komponen Item</div>
                        </td>
                        <td className="py-4 px-6">
                           <div className="font-bold text-indigo-700 text-sm">{inv.brandName}</div>
                           <div className="text-[11px] font-semibold text-slate-500 truncate max-w-[180px]">{inv.recipientName}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <select 
                             value={inv.status}
                             onChange={(e) => updateInvoiceStatus(inv.brandId, inv.id, e.target.value as any)}
                             className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg border border-transparent outline-none cursor-pointer text-center appearance-none transition-all
                               ${inv.status === 'Draft' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 
                                 inv.status === 'Open Invoice' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 
                                 inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 
                                 'bg-red-100 text-red-700 hover:bg-red-200'
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
                           <div className="text-xs font-bold text-slate-700 mb-0.5">Dibuat: {inv.issueDate}</div>
                           <div className="text-[10px] font-bold text-slate-400">Tenggat: <span className={inv.status === 'Overdue' ? 'text-red-500' : ''}>{inv.dueDate}</span></div>
                        </td>
                        <td className="py-4 px-6 text-right">
                           <div className="font-black text-slate-800 text-md">Rp{new Intl.NumberFormat('id-ID').format(inv.totalAmount)}</div>
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
      )}

      {activeTab === "create" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col xl:flex-row gap-8 animate-fadeIn">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-800">Visual Editor Invoice</h3>
              <button onClick={() => setActiveTab("overview")} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Batal</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Pilih Brand Klien (Otomatis Deteksi Shift)</label>
                <select 
                  value={selectedBrandId}
                  onChange={(e) => handleBrandSelectForDraft(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-sm font-black text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Klik untuk Pilih Brand --</option>
                  {clientBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.sessions?.length || 0} Shift Terkonfigurasi)</option>
                  ))}
                </select>
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
                       <select className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white cursor-pointer" value={draftInvoice.status || "Draft"} onChange={e => setDraftInvoice({...draftInvoice, status: e.target.value as any})}>
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
                        <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (Nama Klien / PT)</label>
                        <input type="text" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-bold bg-white" value={draftInvoice.recipientName || ""} onChange={e => setDraftInvoice({...draftInvoice, recipientName: e.target.value})} />
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
                  onClick={handleSaveDraft}
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
                    <span className="font-black text-slate-800">{draftInvoice.sessionItems?.reduce((a,c) => a + (c.qty || 0), 0) || 0}</span>
                 </div>
                 <div className="flex justify-between items-center text-lg">
                    <span className="text-xs font-bold text-slate-500">Grand Total</span>
                    <span className="font-black text-indigo-700">Rp{new Intl.NumberFormat('id-ID').format(draftInvoice.sessionItems?.reduce((a,c) => a + (c.cost * c.qty), 0) || 0)}</span>
                 </div>
               </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-3xl animate-fadeIn">
           <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-600" /> Pengaturan Logo & Tanda Tangan</h3>
              <button onClick={() => setActiveTab("overview")} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">Kembali</button>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-400" /> Logo Invoice (Opsional)</label>
                    
                    {invoiceSettings.logoUrl ? (
                      <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                        <img src={invoiceSettings.logoUrl} className="max-h-20 object-contain" alt="Logo" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <button onClick={() => setInvoiceSettings({...invoiceSettings, logoUrl: ""})} className="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-500">Pilih gambar (Max 2MB)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                      </label>
                    )}
                    <p className="text-[10px] text-slate-400 mt-2 font-semibold">Tautan gambar untuk logo di header invoice. Biarkan kosong untuk teks default.</p>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-slate-400" /> Tanda Tangan (Opsional)</label>
                    {invoiceSettings.signatureUrl ? (
                      <div className="relative group rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center min-h-[120px]">
                        <img src={invoiceSettings.signatureUrl} className="max-h-20 object-contain" alt="Signature" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                          <button onClick={() => setInvoiceSettings({...invoiceSettings, signatureUrl: ""})} className="bg-red-500 text-white rounded-lg p-2 hover:bg-red-600 transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-[120px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer">
                        <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-500">Pilih gambar (Max 2MB)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'signatureUrl')} />
                      </label>
                    )}
                 </div>
              </div>
              
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Nama Penandatangan</label>
                 <input 
                   type="text" 
                   className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold bg-slate-50 focus:bg-white transition-colors outline-none" 
                   placeholder="Mufthi Ali W"
                   value={invoiceSettings.signatureName}
                   onChange={e => setInvoiceSettings({...invoiceSettings, signatureName: e.target.value})}
                 />
              </div>

              <div className="border-t border-slate-100 pt-6">
                 <h4 className="font-black text-slate-800 mb-4">Informasi Pembayaran (Bank)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nama Bank / Cabang</label>
                      <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.bankName} onChange={e => setInvoiceSettings({...invoiceSettings, bankName: e.target.value})} placeholder="BCA KEDATON" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nomor Rekening</label>
                      <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.accountNo} onChange={e => setInvoiceSettings({...invoiceSettings, accountNo: e.target.value})} placeholder="8905461245" />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Atas Nama (A/N)</label>
                      <input type="text" className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={invoiceSettings.accountName} onChange={e => setInvoiceSettings({...invoiceSettings, accountName: e.target.value})} placeholder="MUFTHI ALI W" />
                   </div>
                 </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={() => saveSettings(invoiceSettings)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer">Simpan Pengaturan</button>
              </div>
           </div>
        </div>
      )}

      
      {activeTab === "berkas" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 animate-fadeIn">
           <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2"><FileText className="w-6 h-6 text-indigo-600" /> Kelola Berkas Klien</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setBerkasEditor({ brandId: clientBrands[0]?.id || "", id: "b_" + Date.now(), name: "", type: "Dokumen", url: "" })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg transition-all cursor-pointer flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Tambah Berkas
                </button>
                <button onClick={() => setActiveTab("overview")} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Kembali</button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider">
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Berkas</th>
                    <th className="px-4 py-3">Brand Klien</th>
                    <th className="px-4 py-3">Jenis Berkas</th>
                    <th className="px-4 py-3">Link Berkas</th>
                    <th className="px-4 py-3 text-right">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-sm">
                  {clientBrands.flatMap(b => (b.berkas || []).map(berk => ({ ...berk, brandId: b.id, brandName: b.name }))).map((berk, idx) => (
                    <tr key={berk.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-bold">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{berk.name}</td>
                      <td className="px-4 py-3 text-slate-600">{berk.brandName}</td>
                      <td className="px-4 py-3"><span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{berk.type}</span></td>
                      <td className="px-4 py-3"><a href={berk.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold text-xs truncate max-w-[200px] inline-block">{berk.url}</a></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setBerkasEditor(berk)} className="p-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer mr-1"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setBerkasToDelete({ brandId: berk.brandId, berkasId: berk.id })} className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {clientBrands.flatMap(b => (b.berkas || [])).length === 0 && (
                     <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium italic">Belum ada berkas yang diupload</td>
                     </tr>
                  )}
                </tbody>
              </table>
           </div>
        </div>
      )
}

      {invoiceEditor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">Edit Invoice</h3>
              <button onClick={() => setInvoiceEditor(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Invoice Number</label>
                 <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.invoiceNumber} onChange={e => setInvoiceEditor({...invoiceEditor, invoiceNumber: e.target.value})} />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (Nama Klien/PT)</label>
                 <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.recipientName || ""} onChange={e => setInvoiceEditor({...invoiceEditor, recipientName: e.target.value})} />
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                   <input type="email" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={invoiceEditor.email || ""} onChange={e => setInvoiceEditor({...invoiceEditor, email: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                   <select className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold bg-white cursor-pointer" value={invoiceEditor.status} onChange={e => setInvoiceEditor({...invoiceEditor, status: e.target.value as any})}>
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
                    <span className="font-black text-indigo-700">Rp{new Intl.NumberFormat('id-ID').format((invoiceEditor.sessionItems || []).reduce((a,c) => a + ((c.cost || 0) * (c.qty || 0)), 0))}</span>
                 </div>
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setInvoiceEditor(null)} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all">Batal</button>
              <button 
                onClick={() => {
                  const updatedBrands = clientBrands.map(b => {
                    if (b.id === invoiceEditor.brandId) {
                      const totalAmount = (invoiceEditor.sessionItems || []).reduce((acc, curr) => acc + ((curr.cost || 0) * (curr.qty || 0)), 0);
                      const updatedInvoice = { ...invoiceEditor, totalAmount };
                      return {
                        ...b,
                        invoices: (b.invoices || []).map(i => i.id === invoiceEditor.id ? updatedInvoice : i)
                      }
                    }
                    return b;
                  });
                  onUpdateBrands(updatedBrands);
                  setInvoiceEditor(null);
                }}
                className="px-5 py-2.5 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {invoiceToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Invoice?</h3>
            <p className="text-sm font-semibold text-slate-500 mb-6">Tindakan ini tidak dapat dibatalkan. Invoice akan dihapus secara permanen dari sistem.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setInvoiceToDelete(null)} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all flex-1">Batal</button>
              <button 
                onClick={confirmDeleteInvoice}
                className="px-5 py-2.5 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-95 flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {berkasEditor && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-black text-slate-800">Edit Berkas</h3>
              <button onClick={() => setBerkasEditor(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Brand Klien</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" 
                  value={berkasEditor.brandId} 
                  onChange={e => setBerkasEditor({...berkasEditor, brandId: e.target.value})}
                  disabled={!!clientBrands.flatMap(b => b.berkas || []).find(berk => berk.id === berkasEditor.id)}
                >
                  <option value="" disabled>Pilih Brand Klien</option>
                  {clientBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Nama Berkas</label>
                <input type="text" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={berkasEditor.name} onChange={e => setBerkasEditor({...berkasEditor, name: e.target.value})} placeholder="Contoh: SPK bulan Maret" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Jenis Berkas</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 font-bold bg-white" value={berkasEditor.type} onChange={e => setBerkasEditor({...berkasEditor, type: e.target.value})}>
                  <option value="SPK">SPK / Kontrak</option>
                  <option value="SOP">SOP Brand</option>
                  <option value="Script">Script Live</option>
                  <option value="Rekap">Rekap Penjualan</option>
                  <option value="Dokumen">Dokumen Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Link URL (G-Drive / Docs)</label>
                <input type="url" className="w-full border border-slate-200 rounded-lg px-4 py-2 font-bold" value={berkasEditor.url} onChange={e => setBerkasEditor({...berkasEditor, url: e.target.value})} placeholder="https://docs.google.com/..." required />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setBerkasEditor(null)} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all">Batal</button>
              <button 
                onClick={() => {
                  if (!berkasEditor.name || !berkasEditor.url || !berkasEditor.brandId) return alert("Pilih brand dan lengkapi data!");
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id !== berkasEditor.brandId) return b;
                    let existingBerkas = b.berkas || [];
                    const found = existingBerkas.some(bk => bk.id === berkasEditor.id);
                    if (found) {
                      existingBerkas = existingBerkas.map(bk => bk.id === berkasEditor.id ? { ...berkasEditor } : bk);
                    } else {
                      existingBerkas = [...existingBerkas, { ...berkasEditor }];
                    }
                    return { ...b, berkas: existingBerkas };
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasEditor(null);
                }}
                className="px-5 py-2.5 rounded-xl font-black bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 cursor-pointer transition-all active:scale-95"
              >
                Simpan Berkas
              </button>
            </div>
          </div>
        </div>
      )}

      {berkasToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Berkas?</h3>
            <p className="text-sm font-semibold text-slate-500 mb-6">Berkas ini akan dihapus dari dashboard Anda dan Klien.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setBerkasToDelete(null)} className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all flex-1">Batal</button>
              <button 
                onClick={() => {
                  const updatedBrands = clientBrands.map((b) => {
                    if (b.id !== berkasToDelete.brandId) return b;
                    return {
                      ...b,
                      berkas: (b.berkas || []).filter(bk => bk.id !== berkasToDelete.berkasId)
                    };
                  });
                  onUpdateBrands(updatedBrands);
                  setBerkasToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl font-black bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-95 flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Plus, Trash2, X } from 'lucide-react';
import { ClientBrand, BrandInvoice } from '../types';
import { BerkasManager } from './BerkasManager';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceCreatePanel } from './invoice/InvoiceCreatePanel';
import { InvoiceEditorModal } from './invoice/InvoiceEditorModal';
import { InvoiceRemindersPanel } from './invoice/InvoiceRemindersPanel';
import { InvoiceSettingsPanel, type InvoiceSettings } from './invoice/InvoiceSettingsPanel';

import { settingsApi, clientBrandsApi } from '../api';
import { formatDateUILocal as formatDateUI } from '../shared/utils/date';
import { buildInvoiceQuotationEmail } from '../shared/utils/invoiceEmail';
import { buildNextInvoiceNumber } from '../shared/utils/invoiceNumber';

interface InvoiceDashboardProps {
  clientBrands: ClientBrand[];
  onUpdateBrands: (brands: ClientBrand[]) => void;
}

type GlobalPicEmailSetting = string | { value?: string } | null;
type InvoiceReminderPayload = {
  brandName: string;
  invoiceDate: string;
  toEmails: string;
  amount: number;
  invoiceNumber: string;
};

type InvoiceReminderResponse = {
  success?: boolean;
  details?: string;
  error?: string;
  messageId?: string;
  simulated?: boolean;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sendInvoiceReminder = async (
  payload: InvoiceReminderPayload,
): Promise<InvoiceReminderResponse> => {
  const res = await fetch('/api/invoice/send-reminder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return (await res.json()) as InvoiceReminderResponse;
};

export const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({ clientBrands, onUpdateBrands }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "settings" | "berkas" | "reminders">("overview");
  const [globalPicEmail, setGlobalPicEmail] = useState<string>("admin1@liva-agency.com, admin2@liva.com");
  const [emailTestStatus, setEmailTestStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<{ to: string; subject: string; body: string; } | null>(null);

  const handleUpdateBrands = (updatedBrands: ClientBrand[]) => {
    // Optimistically update UI state
    onUpdateBrands(updatedBrands);
    
    // Check which brands changed and save to API
    updatedBrands.forEach(newBrand => {
      const oldBrand = clientBrands.find(b => b.id === newBrand.id);
      if (!oldBrand || JSON.stringify(oldBrand) !== JSON.stringify(newBrand)) {
        if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.update) {
          clientBrandsApi.update(newBrand.id, newBrand).catch(err => {
             console.error("Failed to update brand in DB", err);
          });
        }
      }
    });
  };
  
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    logoUrl: "",
    signatureUrl: "",
    signatureName: "MUFTHI ALI W",
    accountNo: "8905461245",
    accountName: "MUFTHI ALI W",
    bankName: "BCA KEDATON"
  });

  useEffect(() => {
    settingsApi.get<InvoiceSettings | null>("mcn_invoice_settings").then(saved => {
      if (saved && Object.keys(saved).length > 0) {
        setInvoiceSettings(saved);
      }
    }).catch(console.error);
  }, []);

  const saveSettings = async (newSettings: InvoiceSettings) => {
    setInvoiceSettings(newSettings);
    await settingsApi.save("mcn_invoice_settings", newSettings).catch(console.error);
  };

  const handleSaveGlobalPicEmail = async () => {
    await settingsApi.save("mcn_global_pic_email", { value: globalPicEmail }).catch(console.error);
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

  useEffect(() => {
    settingsApi.get<any>("mcn_global_pic_email").then(storedEmail => {
      let val = storedEmail;
      
      // Unwrap any accidentally nested JSON strings
      while (typeof val === "string" && val.startsWith("{")) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          break;
        }
      }

      if (val && typeof val === "object" && "value" in val) {
        setGlobalPicEmail(val.value || "");
      } else if (typeof val === "string") {
        setGlobalPicEmail(val);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDate();
    // Use local timezone offset to get the correct YYYY-MM-DD string
    const todayStr = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    // Trigger based on actual invoices that are due or issued today
    clientBrands.forEach(b => {
      // 1. Trigger using specific invoices (Issue Date or Due Date)
      if (b.invoices && b.invoices.length > 0) {
        b.invoices.forEach(inv => {
          if (inv.issueDate === todayStr || inv.dueDate === todayStr) {
            // Include invoice specific ID to prevent spamming
            const invCacheKey = `mcn_invoice_rem_${todayStr}_inv_${inv.id}`;
            if (!localStorage.getItem(invCacheKey)) {
              console.log('Triggering automated email reminder for ACTUAL INVOICE:', inv.invoiceNumber);
              localStorage.setItem(invCacheKey, 'sent');
              
              sendInvoiceReminder({
                brandName: b.name,
                invoiceDate: inv.issueDate || todayStr,
                toEmails: globalPicEmail || "admin1@liva-agency.com",
                amount: inv.totalAmount || 0,
                invoiceNumber: inv.invoiceNumber || "AUTO",
              }).catch(err => console.error('Automated invoice reminder err:', err));
            }
          }
        });
      }

      // 2. Trigger based on Brand Default Invoice Day (Legacy fallback/recurring tracker)
      if (!b.invoiceDate) return;
      const invDay = parseInt(b.invoiceDate);
      if (isNaN(invDay)) return;

      if (invDay === currentDay) {
        const cacheKey = `mcn_invoice_rem_${todayStr}_${b.id}`;
        if (!localStorage.getItem(cacheKey)) {
          console.log('Triggering automated email reminder for brand base configuration', b.name);
          localStorage.setItem(cacheKey, 'sent');
          
          sendInvoiceReminder({
            brandName: b.name,
            invoiceDate: b.invoiceDate,
            toEmails: globalPicEmail || "admin1@liva-agency.com, admin2@liva.com",
            amount: b.amount || 0,
            invoiceNumber: "AUTO-" + new Date().getTime().toString().slice(-6),
          }).then(data => {
            console.log('Automated reminder response:', data);
          }).catch(err => console.error('Automated reminder err:', err));
        }
      }
    });
  }, [clientBrands, globalPicEmail]);

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
    const invoiceNumber = buildNextInvoiceNumber(clientBrands, today);
    
    setDraftInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNumber,
      issueDate: today.toISOString().substring(0, 10),
      dueDate: dueDate.toISOString().substring(0, 10),
      status: "Draft",
      recipientName: brand.picName || brand.name,
      ptName: brand.companyName || brand.name,
      picName: brand.picName || "",
      picPhone: brand.picPhone || "",
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
          companyName: draftInvoice.ptName || b.companyName,
          picName: draftInvoice.picName || b.picName,
          picPhone: draftInvoice.picPhone || b.picPhone,
          picEmail: draftInvoice.email || b.picEmail,
          companyAddress: draftInvoice.address || b.companyAddress,
          invoices: [...(b.invoices || []), finalInvoice]
        };
      }
      return b;
    });

    const brand = clientBrands.find(b => b.id === selectedBrandId);
    if (brand) {
      handleShowEmailCopy(finalInvoice, brand.name, brand.picEmail);
    }

    handleUpdateBrands(updatedBrands);
    setActiveTab("overview");
    setSelectedBrandId("");
    setDraftInvoice({});
  };

  const handleShowEmailCopy = (inv: BrandInvoice, brandName: string, picEmail?: string) => {
     const email = buildInvoiceQuotationEmail({
       brandName,
       issueDate: inv.issueDate,
       dueDate: inv.dueDate,
       totalAmount: inv.totalAmount,
       sessionItems: inv.sessionItems,
       picName: inv.picName,
       recipientName: inv.recipientName,
       ptName: inv.ptName,
       email: inv.email,
       picEmail,
     });

     setGeneratedEmail(email);
  };

  const updateInvoiceStatus = (brandId: string, invId: string, newStatus: BrandInvoice["status"]) => {
    const updatedBrands = clientBrands.map(b => {
      if (b.id === brandId) {
        const updatedInvoices = (b.invoices || []).map(inv => inv.id === invId ? { ...inv, status: newStatus } : inv);
        return { ...b, invoices: updatedInvoices };
      }
      return b;
    });
    handleUpdateBrands(updatedBrands);
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
    handleUpdateBrands(updatedBrands);
    setInvoiceToDelete(null);
  };

  const handlePrint = (invoice: BrandInvoice, brandName: string) => {
    const brand = clientBrands.find(b => b.invoices?.some(i => i.id === invoice.id));
    const recipient = invoice.ptName || invoice.recipientName || brand?.name || brandName;
    const picName = invoice.picName || invoice.recipientName || brand?.picName || "-";
    const address = invoice.address || "-";
    const email = invoice.email || "-";
    const phone = invoice.picPhone || brand?.picPhone || "-";

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);
    const printDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!printDoc) return;
    
    const issueParts = new Date(invoice.issueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});
    const dueParts = new Date(invoice.dueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'});

    const logoHtml = invoiceSettings.logoUrl 
      ? `<img src="${invoiceSettings.logoUrl}" style="max-height: 50px; display: inline-block;" />`
      : `<div style="font-size: 42px; font-weight: 800; display: flex; align-items: center; justify-content: flex-end; gap: 10px;">LIVE</div>`;

    const signHtml = invoiceSettings.signatureUrl 
      ? `<img src="${invoiceSettings.signatureUrl}" style="width: 180px; max-height: 120px; object-fit: contain; margin-bottom: -15px;" />`
      : `<div style="height: 60px;"></div>`;

    const originalTitle = document.title;
    const safeInvoiceNumber = invoice.invoiceNumber ? invoice.invoiceNumber.replace(/\//g, '-') : 'AUTO';
    const printTitle = `${brandName} - ${safeInvoiceNumber}`;
    document.title = printTitle;

    printDoc.write(`
      <html>
        <head>
          <title>${printTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
            @page { size: A4 portrait; margin: 0; }
            body { 
              font-family: 'Montserrat', sans-serif; 
              margin: 0; 
              padding: 0; 
              color: #1e293b; 
              background: white; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 210mm;
              height: 296mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }
            .header-banner { 
              background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
              padding: 35px 45px;
              display: flex;
              justify-content: space-between;
              color: white;
              height: 155px;
              box-sizing: border-box;
            }
            .header-banner .title {
              font-size: 36px;
              font-weight: 800;
              margin: 0 0 15px 0;
              letter-spacing: 1px;
            }
            .header-details {
              display: grid;
              grid-template-columns: 100px 1fr;
              font-size: 11px;
              gap: 4px 10px;
              font-weight: 600;
            }
            .header-details span { font-weight: 400; }
            .logo-section {
              text-align: right;
            }
            .content { 
              padding: 35px 45px; 
              flex-grow: 1; 
              display: flex; 
              flex-direction: column;
              position: relative;
              z-index: 1;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.03;
              max-width: 60%;
              max-height: 60%;
              z-index: -1;
            }
            .top-info { display: flex; justify-content: space-between; margin-bottom: 25px; gap: 40px; }
            .invoice-to { flex: 1; min-width: 0; }
            .payment-method { flex-shrink: 0; width: 280px; }
            .invoice-to h3, .payment-method h3 { font-size: 13px; font-weight: 800; margin: 0 0 10px 0; color: #000; text-transform: uppercase; }
            .invoice-to strong { font-size: 13px; }
            .address-block { margin-top: 10px; font-size: 11px; line-height: 1.4; color: #1e293b; }
            .address-details { display: grid; grid-template-columns: 60px 1fr; gap: 4px 10px; margin-top: 5px; }
            .payment-grid { display: grid; grid-template-columns: 100px 1fr; gap: 4px 10px; font-size: 11px; text-align: left; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed; }
            th { background-color: #f97316; color: white; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 12px; }
            th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; width: 40px; text-align: center; }
            th:nth-child(2) { width: 45%; }
            th:nth-child(3) { width: 130px; text-align: right; white-space: nowrap; }
            th:nth-child(4) { width: 50px; text-align: center; }
            th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; width: 140px; text-align: right; white-space: nowrap; }
            td { padding: 15px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-weight: 500; font-size: 12px; color: #1e293b;}
            td:first-child { text-align: center; }
            td:nth-child(3) { text-align: right; white-space: nowrap; }
            td:nth-child(4) { text-align: center; }
            td:last-child { text-align: right; white-space: nowrap; }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 15px 15px 5px; 
              font-size: 14px; 
              font-weight: 800; 
              border-bottom: 2px solid #a855f7; 
              margin-top: 5px; 
              color: #000;
            }
            .bottom-section { display: flex; justify-content: space-between; margin-top: auto; padding-top: 20px;}
            .terms { max-width: 300px; }
            .terms h4 { font-size: 13px; font-weight: 800; margin: 0 0 5px 0; color: #000; text-transform: uppercase; }
            .terms p { font-size: 11px; line-height: 1.4; color: #333; margin: 0; }
            .signature { text-align: center; padding-right: 20px; }
            .signature h4 { margin: 0; font-size: 14px; font-weight: 800; color: #000; }
            .footer { 
              background: linear-gradient(90deg, #f97316, #fb923c); 
              color: white; 
              padding: 0 45px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              height: 60px;
              box-sizing: border-box;
            }
            .footer-msg { font-size: 13px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; }
            .footer-contact { text-align: right; font-size: 11px; font-weight: 500; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="title">INVOICE</div>
              <div class="header-details">
                <div>No:</div> <span>${invoice.invoiceNumber}</span>
                <div>Invoice Date:</div> <span>${issueParts}</span>
                <div>Due Date:</div> <span>${dueParts}</span>
              </div>
            </div>
            <div class="logo-section">
              ${logoHtml}
            </div>
          </div>
          
          <div class="content">
            ${invoiceSettings.logoUrl ? `<img src="${invoiceSettings.logoUrl}" class="watermark" />` : ''}
            
            <div class="top-info">
              <div class="invoice-to">
                <h3>INVOICE TO:</h3>
                <strong>${recipient}</strong><br/>
                ${picName && picName !== "-" ? `<span style="font-size: 11px; font-weight: 500;">${picName}</span>` : ''}
                <div class="address-block">
                  <div class="address-details">
                    <strong>Phone:</strong> <span>${phone}</span>
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
                  <span>Branch Name:</span> <strong>${invoiceSettings.bankName || "-"}</strong>
                </div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>NO</th>
                  <th>ITEM</th>
                  <th>PRICE</th>
                  <th style="text-align: center; width: 60px;">QTY</th>
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
                <p>${invoiceSettings.termsAndConditions || 'Please send payment within 7 days of receiving this invoice.'}</p>
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
              livamediakreatif@gmail.com<br/>
              +62-811 30 16161
            </div>
          </div>
        </body>
      </html>
    `);
    printDoc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
        document.title = originalTitle;
      }, 3000);
    }, 500);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" /> Manajemen Invoice & Tagihan
          </h2>
          <p className="text-sm text-slate-500 mt-1">Lacak pembayaran client, generate invoice PDF, dan kelola tagihan MCN terpusat.</p>
        </div>
        <button 
          onClick={() => { setActiveTab("create"); handleBrandSelectForDraft(""); }}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Buat Invoice Baru
        </button>
      </div>

      <div className="flex gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-4 font-medium text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === "overview" || activeTab === "create" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Semua Invoice
        </button>
        <button
          onClick={() => setActiveTab("berkas")}
          className={`pb-4 font-medium text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "berkas" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Kelola Berkas
        </button>
        <button
          onClick={() => setActiveTab("reminders")}
          className={`pb-4 font-medium text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "reminders" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Pengingat Otomatis
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-4 font-medium text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === "settings" ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Pengaturan Nota
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <InvoiceTable 
            allInvoices={allInvoices}
            upcomingBillings={upcomingBillings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            updateInvoiceStatus={updateInvoiceStatus}
            setInvoiceEditor={setInvoiceEditor}
            setInvoiceToDelete={setInvoiceToDelete}
            handlePrint={handlePrint}
            handleShowEmailCopy={handleShowEmailCopy}
            clientBrands={clientBrands}
            formatDateUI={formatDateUI}
          />
        </div>
      )}

      {activeTab === "create" && (
        <InvoiceCreatePanel
          clientBrands={clientBrands}
          selectedBrandId={selectedBrandId}
          draftInvoice={draftInvoice}
          setSelectedBrandId={setSelectedBrandId}
          setDraftInvoice={setDraftInvoice}
          onSelectBrand={handleBrandSelectForDraft}
          onSaveDraft={handleSaveDraft}
          onCancel={() => setActiveTab("overview")}
        />
      )}

      {activeTab === "reminders" && (
        <InvoiceRemindersPanel
          upcomingBillings={upcomingBillings}
          globalPicEmail={globalPicEmail}
          emailTestStatus={emailTestStatus}
          onGlobalPicEmailChange={setGlobalPicEmail}
          onEmailTestStatusChange={setEmailTestStatus}
          onSaveGlobalPicEmail={handleSaveGlobalPicEmail}
          onSendReminder={sendInvoiceReminder}
        />
      )}

      {activeTab === "settings" && (
        <div className="space-y-8 max-w-3xl mx-auto">
          <InvoiceSettingsPanel
            invoiceSettings={invoiceSettings}
            onInvoiceSettingsChange={setInvoiceSettings}
            onSaveSettings={saveSettings}
            onImageUpload={handleImageUpload}
          />
        </div>
      )}

      
      {activeTab === "berkas" && (
        <BerkasManager 
          clientBrands={clientBrands} 
          onUpdateBrands={handleUpdateBrands} 
          onBack={() => setActiveTab("overview")} 
        />
      )}

      {invoiceEditor && (
        <InvoiceEditorModal
          invoiceEditor={invoiceEditor}
          clientBrands={clientBrands}
          setInvoiceEditor={setInvoiceEditor}
          onClose={() => setInvoiceEditor(null)}
          onUpdateBrands={handleUpdateBrands}
        />
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



      {generatedEmail && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="text-xl font-black text-slate-800">Email Template Berhasil Dibuat</h3>
               <button onClick={() => setGeneratedEmail(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-6 h-6" /></button>
             </div>
             
             <div className="p-6 overflow-y-auto flex-1 space-y-4">
               <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2">
                 ✅ Invoice berhasil disimpan. Gunakan template berikut untuk mempermudah penagihan.
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (To)</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-2 items-center">
                    <span className="font-mono text-sm text-slate-700 flex-1">{generatedEmail.to}</span>
                    <button onClick={() => { navigator.clipboard.writeText(generatedEmail.to); alert('Berhasil dicopy!'); }} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors shadow-sm">Copy To</button>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subjek Email (Subject)</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-2 items-center gap-2">
                    <span className="font-semibold text-sm text-slate-700 flex-1 break-all">{generatedEmail.subject}</span>
                    <button onClick={() => { navigator.clipboard.writeText(generatedEmail.subject); alert('Berhasil dicopy!'); }} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors shadow-sm whitespace-nowrap">Copy Subject</button>
                  </div>
               </div>

               <div className="flex-1 min-h-[300px] flex flex-col">
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between items-end">
                    <span>Isi Pesan (Body)</span>
                    <button onClick={() => { navigator.clipboard.writeText(generatedEmail.body); alert('Berhasil dicopy!'); }} className="text-[10px] uppercase font-black tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded hover:bg-indigo-100 cursor-pointer transition-colors">Copy Isi Pesan</button>
                  </label>
                  <textarea readOnly value={generatedEmail.body} className="w-full h-full min-h-[250px] bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-medium font-mono text-slate-700 focus:outline-none resize-none leading-relaxed" />
               </div>
             </div>
             
             <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setGeneratedEmail(null)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black rounded-xl transition-all active:scale-95 cursor-pointer shadow-md">Tutup Panel</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

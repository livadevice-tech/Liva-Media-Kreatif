import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  Edit2,
  Download,
  Mail,
  ChevronLeft,
  Calendar,
  ChevronDown,
  Search,
  Building2,
  Landmark,
  Settings,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { ClientBrand, BrandInvoice, LivaBankAccount, InvoiceCompanyProfile } from '../types';
import { InvoiceTable } from './InvoiceTable';
import { InvoiceCreatePanel } from './invoice/InvoiceCreatePanel';
import { InvoiceEditorModal } from './invoice/InvoiceEditorModal';
import { InvoiceSettingsPanel, type InvoiceSettings } from './invoice/InvoiceSettingsPanel';
import { ClientBillingDirectory } from './invoice/ClientBillingDirectory';
import { LivaBankManager } from './invoice/LivaBankManager';
import { InvoicePreviewModal } from './invoice/InvoicePreviewModal';
import { resolveContractPeriodDates } from '../shared/utils/dateFormatting';

import { settingsApi, clientBrandsApi } from '../api';
import { formatDateUILocal as formatDateUI } from '../shared/utils/date';
import { buildInvoiceQuotationEmail } from '../shared/utils/invoiceEmail';
import { buildNextInvoiceNumber } from '../shared/utils/invoiceNumber';
import { generateInvoicePrintHtml } from '../shared/utils/invoicePrintHtml';

interface InvoiceDashboardProps {
  clientBrands: ClientBrand[];
  onUpdateBrands: (brands: ClientBrand[]) => void;
  onBack?: () => void;
}

const DEFAULT_LIVA_BANKS: LivaBankAccount[] = [
  {
    id: "bank_maybank_default",
    bankName: "Maybank Syariah",
    accountNo: "2721002897",
    accountName: "PT. Liva Media Kreatif",
    isDefault: true,
    isActive: true,
    branch: "KC Bandar Lampung",
    notes: "Rekening utama penerimaan invoice PT. Liva Media Kreatif",
  },
];

export const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({
  clientBrands,
  onUpdateBrands,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "billing_directory" | "bank_accounts" | "create" | "settings"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<{ to: string; subject: string; body: string; } | null>(null);

  // Bank accounts of PT Liva
  const [bankAccounts, setBankAccounts] = useState<LivaBankAccount[]>(DEFAULT_LIVA_BANKS);

  // Preview modal state
  const [previewInvoiceData, setPreviewInvoiceData] = useState<{
    invoice: BrandInvoice;
    brand: ClientBrand;
  } | null>(null);

  // Settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    logoUrl: "",
    signatureUrl: "",
    signatureSize: 65,
    signatureName: "Mufthi Ali",
    signatureTitle: "Direktur Utama PT Liva Media Kreatif",
    companyName: "PT. Liva Media Kreatif",
    companyAddress: "Villa Bukit Tirtayasa Blok G2 No.1, Kelurahaan Campang Raya, Kecamatan Sukabumi, Kota Bandar Lampung, Provinsi Lampung",
    companyEmail: "livamediakreatif@gmail.com",
    companyPhone: "+62 821-7788-9900",
    companyWebsite: "https://project.livaagency.com",
    signeeCity: "Bandar Lampung",
    accountNo: "2721002897",
    accountName: "PT. Liva Media Kreatif",
    bankName: "Maybank Syariah",
    termsAndConditions:
      "1. Payment shall be made via bank transfer to the account listed above.\n2. Payment is due according to the invoice Due Date.\n3. Please confirm proof of payment via WhatsApp to +62 821-7788-9900.",
  });

  // Load bank accounts & settings from MySQL
  useEffect(() => {
    settingsApi.get<LivaBankAccount[] | null>("mcn_liva_bank_accounts").then((saved) => {
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setBankAccounts(saved);
      }
    }).catch(console.error);

    settingsApi.get<InvoiceSettings | null>("mcn_invoice_settings").then((saved) => {
      if (saved && Object.keys(saved).length > 0) {
        setInvoiceSettings((prev) => ({ ...prev, ...saved }));
      }
    }).catch(console.error);
  }, []);

  const handleSaveBankAccounts = async (newAccounts: LivaBankAccount[]) => {
    setBankAccounts(newAccounts);
    await settingsApi.save("mcn_liva_bank_accounts", newAccounts).catch(console.error);
  };

  const saveSettings = async (newSettings: InvoiceSettings) => {
    setInvoiceSettings(newSettings);
    await settingsApi.save("mcn_invoice_settings", newSettings).catch(console.error);
  };

  const handleUpdateBrands = (updatedBrands: ClientBrand[]) => {
    onUpdateBrands(updatedBrands);
    updatedBrands.forEach((newBrand) => {
      const oldBrand = clientBrands.find((b) => b.id === newBrand.id);
      if (!oldBrand || JSON.stringify(oldBrand) !== JSON.stringify(newBrand)) {
        if (typeof clientBrandsApi !== "undefined" && clientBrandsApi.update) {
          clientBrandsApi.update(newBrand.id, newBrand).catch((err) => {
            console.error("Failed to update brand in DB", err);
          });
        }
      }
    });
  };

  // Creation & Editing states
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [draftInvoice, setDraftInvoice] = useState<Partial<BrandInvoice>>({});
  const [invoiceEditor, setInvoiceEditor] = useState<(BrandInvoice & { brandId: string }) | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<{ brandId: string; id: string } | null>(null);

  const currentYearMonth = new Date().toISOString().substring(0, 7);
  const [filterMonth, setFilterMonth] = useState<string>('ALL');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const allInvoices = useMemo(() => {
    let list: (BrandInvoice & { brandId: string; brandName: string })[] = [];
    clientBrands.forEach((brand) => {
      if (brand.invoices) {
        brand.invoices.forEach((inv) => {
          list.push({ ...inv, brandId: brand.id, brandName: brand.name });
        });
      }
    });

    if (filterMonth && filterMonth !== 'ALL') {
      list = list.filter((inv) => {
        const dateToUse = inv.invoiceDate || inv.issueDate;
        return Boolean(dateToUse && dateToUse.startsWith(filterMonth));
      });
    }

    return list.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }, [clientBrands, filterMonth]);

  const upcomingBillings = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    return clientBrands.filter((b) => {
      if (!b.invoiceDate) return false;
      const invDay = parseInt(b.invoiceDate);
      if (isNaN(invDay)) return false;
      let diff = invDay - currentDay;
      if (diff < 0) diff += 30;
      return diff >= 0 && diff <= 3;
    });
  }, [clientBrands]);

  // Brand selection for creating a new invoice
  const handleBrandSelectForDraft = (brandId?: string) => {
    const brand = brandId
      ? clientBrands.find((b) => b.id === brandId)
      : clientBrands.find((b) => b.isActive !== false) || clientBrands[0];

    const actualBrandId = brand ? brand.id : "";
    setSelectedBrandId(actualBrandId);

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // 14-day terms matching the PDF

    const shiftCount = brand?.sessions?.length || 2;
    const invoiceNumber = buildNextInvoiceNumber(clientBrands, today);
    const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0] || DEFAULT_LIVA_BANKS[0];
    const resolvedPeriod = resolveContractPeriodDates(
      brand?.contractStartDate,
      brand?.contractEndDate,
      today.toISOString().substring(0, 10)
    );

    setDraftInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNumber,
      invoiceDate: today.toISOString().substring(0, 10),
      issueDate: today.toISOString().substring(0, 10),
      dueDate: dueDate.toISOString().substring(0, 10),
      status: "Draft",
      recipientName: brand?.picName || brand?.name || "",
      ptName: brand?.companyName || brand?.name || "",
      picName: brand?.picName || "",
      picPhone: brand?.picPhone || "",
      email: brand?.picEmail || "",
      address: brand?.companyAddress || "",
      cutOffDate: brand?.cutOffDate || "15",
      livePeriodStart: resolvedPeriod.startDate || brand?.contractStartDate || "",
      livePeriodEnd: resolvedPeriod.endDate || brand?.contractEndDate || "",
      bankInfo: {
        bankName: defaultBank.bankName,
        accountNo: defaultBank.accountNo,
        accountName: defaultBank.accountName,
      },
      sessionItems: (brand?.defaultServices && brand.defaultServices.length > 0)
        ? brand.defaultServices.map((ds, idx) => ({
            sessionId: `sess_${Date.now()}_${idx}`,
            description: ds.description,
            qty: ds.qty ?? 1,
            unit: ds.unit || "Session",
            cost: ds.cost ?? 0,
          }))
        : [
            {
              sessionId: `sess_${Date.now()}`,
              description: `Live Streaming Package Shopee`,
              qty: shiftCount,
              unit: "Session",
              cost: 7000000,
            },
          ],
    });
  };

  const handleSaveDraft = () => {
    if (!selectedBrandId || !draftInvoice.invoiceNumber) return;

    const items = draftInvoice.sessionItems || [];
    const subtotalProject = items.reduce((acc, curr) => acc + (curr.cost * (curr.qty || 1)), 0);
    const paymentType = draftInvoice.paymentType || 'full';
    let billableAmount = subtotalProject;

    if (paymentType === 'dp') {
      billableAmount = draftInvoice.dpAmount ?? Math.round(subtotalProject * ((draftInvoice.dpPercent ?? 50) / 100));
    } else if (paymentType === 'pelunasan') {
      const dpPaid = draftInvoice.dpAmount ?? 0;
      billableAmount = Math.max(0, subtotalProject - dpPaid);
    }

    const finalInvoice = {
      ...draftInvoice,
      livePeriodStart: draftInvoice.livePeriodStart || undefined,
      livePeriodEnd: draftInvoice.livePeriodEnd || undefined,
      paymentType,
      subtotalProject,
      totalAmount: billableAmount,
    } as BrandInvoice;

    const updatedBrands = clientBrands.map((b) => {
      if (b.id === selectedBrandId) {
        return {
          ...b,
          companyName: draftInvoice.ptName || b.companyName,
          picName: draftInvoice.picName || b.picName,
          picPhone: draftInvoice.picPhone || b.picPhone,
          picEmail: draftInvoice.email || b.picEmail,
          companyAddress: draftInvoice.address || b.companyAddress,
          contractStartDate: draftInvoice.livePeriodStart || b.contractStartDate,
          contractEndDate: draftInvoice.livePeriodEnd || b.contractEndDate,
          defaultServices: (b.defaultServices && b.defaultServices.length > 0)
            ? b.defaultServices
            : (draftInvoice.sessionItems || []).map((item) => ({
                description: item.description,
                qty: item.qty || 1,
                unit: item.unit || "Session",
                cost: item.cost,
              })),
          invoices: [...(b.invoices || []), finalInvoice],
        };
      }
      return b;
    });

    const brand = clientBrands.find((b) => b.id === selectedBrandId);
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
    const updatedBrands = clientBrands.map((b) => {
      if (b.id === brandId) {
        const updatedInvoices = (b.invoices || []).map((inv) =>
          inv.id === invId ? { ...inv, status: newStatus } : inv
        );
        return { ...b, invoices: updatedInvoices };
      }
      return b;
    });
    handleUpdateBrands(updatedBrands);
  };

  const confirmDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    const { brandId, id: invId } = invoiceToDelete;
    const updatedBrands = clientBrands.map((b) => {
      if (b.id === brandId) {
        return {
          ...b,
          invoices: (b.invoices || []).filter((inv) => inv.id !== invId),
        };
      }
      return b;
    });
    handleUpdateBrands(updatedBrands);
    setInvoiceToDelete(null);
  };

  // Official A4 Print Generation matching user's PDF
  const handlePrint = (invoice: BrandInvoice, brandName: string) => {
    const brand = clientBrands.find((b) => b.invoices?.some((i) => i.id === invoice.id) || b.name === brandName);
    const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0] || DEFAULT_LIVA_BANKS[0];

    const cleanBrandName = (brand?.name || brandName || invoice.ptName || 'Brand').replace(/[\/\\:*?"<>|]/g, '-').trim();
    const cleanInvoiceNo = (invoice.invoiceNumber || 'Invoice').replace(/[\/\\:*?"<>|]/g, '-').trim();
    const exportFileName = `${cleanBrandName} - ${cleanInvoiceNo}`;

    // Temporarily set document title so browser "Save as PDF" dialog defaults to "Nama Brand - No invoice"
    const originalTitle = document.title;
    document.title = exportFileName;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!printDoc) {
      document.title = originalTitle;
      return;
    }

    printDoc.title = exportFileName;

    const htmlContent = generateInvoicePrintHtml({
      invoice,
      brand,
      bankAccount: defaultBank,
      companyProfile: {
        companyName: invoiceSettings.companyName,
        address: invoiceSettings.companyAddress,
        email: invoiceSettings.companyEmail,
        phone: invoiceSettings.companyPhone,
        website: invoiceSettings.companyWebsite,
        city: invoiceSettings.signeeCity,
        directorName: invoiceSettings.signatureName,
        directorTitle: invoiceSettings.signatureTitle,
        logoUrl: invoiceSettings.logoUrl,
        signatureUrl: invoiceSettings.signatureUrl,
        signatureSize: invoiceSettings.signatureSize || 65,
        termsAndConditions: invoiceSettings.termsAndConditions,
      },
    });

    printDoc.write(htmlContent);
    printDoc.close();

    if (iframe.contentDocument) {
      iframe.contentDocument.title = exportFileName;
    }

    let isCleanedUp = false;
    const cleanup = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      document.title = originalTitle;
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };

    window.addEventListener('afterprint', cleanup, { once: true });
    if (iframe.contentWindow) {
      iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });
    }

    const onWindowFocus = () => {
      setTimeout(cleanup, 1500);
      window.removeEventListener('focus', onWindowFocus);
    };
    window.addEventListener('focus', onWindowFocus);
    setTimeout(cleanup, 60000);

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
    }, 400);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logoUrl" | "signatureUrl",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoiceSettings((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenPreview = (inv: BrandInvoice & { brandId: string; brandName: string }) => {
    const brand = clientBrands.find((b) => b.id === inv.brandId) || {
      id: inv.brandId,
      name: inv.brandName,
      companyName: inv.ptName,
      picName: inv.picName,
      picPhone: inv.picPhone,
      picEmail: inv.email,
      companyAddress: inv.address,
      sessions: [],
      contractEndDate: "",
      invoiceDate: "29",
      accounts: [],
      monthlyMeetingDate: "",
    };

    setPreviewInvoiceData({
      invoice: inv,
      brand,
    });
  };

  const handleStartCreateForBrand = (brandId: string) => {
    handleBrandSelectForDraft(brandId);
    setActiveTab("create");
  };

  return (
    <div className="animate-fadeIn min-h-screen font-sans w-full min-w-0" id="operator_invoice_dashboard">
      {/* ═══════════════════════════════════════════
          DESKTOP & RESPONSIVE MAIN CONTAINER
      ════════════════════════════════════════════ */}
      <div className="space-y-3.5 pb-8 w-full max-w-full mx-auto px-2.5 sm:px-4 lg:px-6 pt-2.5 min-w-0">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white px-3.5 py-3 sm:px-5 sm:py-3.5 rounded-xl border border-slate-200/80 shadow-2xs w-full min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Manajemen Invoice & Penagihan
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full shrink-0">
                  Billing
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Kelola data penagihan klien (Bill To), rekening transfer resmi PT. Liva Media Kreatif, terbitkan nota penagihan resmi, dan pantau status pelunasan invoice.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab("create");
              handleBrandSelectForDraft();
            }}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-2xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Buat Invoice Baru
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-1.5 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 w-full min-w-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview" || activeTab === "create"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Semua Invoice</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              activeTab === "overview" || activeTab === "create"
                ? "bg-slate-800 text-slate-200"
                : "bg-slate-100 text-slate-600"
            }`}>
              {allInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("billing_directory")}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "billing_directory"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Data Penagihan Client (Bill To)</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-700 font-black">
              {clientBrands.filter(b => b.isActive !== false).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bank_accounts")}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "bank_accounts"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Rekening Bank PT Liva</span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800 font-black">
              {bankAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "settings"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan Nota</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            TAB CONTENTS
        ════════════════════════════════════════════ */}
        <div>
          {/* TAB 1: OVERVIEW & STATUS MANAGEMENT */}
          {(activeTab === "overview" || activeTab === "create") && (
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
              onPreviewInvoice={handleOpenPreview}
              clientBrands={clientBrands}
              formatDateUI={formatDateUI}
            />
          )}

          {/* TAB 2: CLIENT BILLING DIRECTORY (Nama PT, dll seperti PDF) */}
          {activeTab === "billing_directory" && (
            <ClientBillingDirectory
              clientBrands={clientBrands}
              onUpdateBrands={handleUpdateBrands}
              onCreateInvoiceForBrand={handleStartCreateForBrand}
            />
          )}

          {/* TAB 3: PT LIVA BANK ACCOUNTS */}
          {activeTab === "bank_accounts" && (
            <LivaBankManager
              bankAccounts={bankAccounts}
              onSaveBankAccounts={handleSaveBankAccounts}
            />
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === "settings" && (
            <InvoiceSettingsPanel
              invoiceSettings={invoiceSettings}
              onInvoiceSettingsChange={setInvoiceSettings}
              onSaveSettings={saveSettings}
              onImageUpload={handleImageUpload}
            />
          )}
        </div>

        {/* ═══════════════════════════════════════════
            MODALS & DRAWERS
        ════════════════════════════════════════════ */}
        {/* Create Invoice Drawer */}
        {activeTab === "create" && (
          <InvoiceCreatePanel
            clientBrands={clientBrands}
            bankAccounts={bankAccounts}
            selectedBrandId={selectedBrandId}
            draftInvoice={draftInvoice}
            setSelectedBrandId={setSelectedBrandId}
            setDraftInvoice={setDraftInvoice}
            onSelectBrand={handleBrandSelectForDraft}
            onSaveDraft={handleSaveDraft}
            onCancel={() => setActiveTab("overview")}
          />
        )}

        {/* Edit Invoice Drawer */}
        {invoiceEditor && (
          <InvoiceEditorModal
            invoiceEditor={invoiceEditor}
            clientBrands={clientBrands}
            bankAccounts={bankAccounts}
            setInvoiceEditor={setInvoiceEditor}
            onClose={() => setInvoiceEditor(null)}
            onUpdateBrands={handleUpdateBrands}
          />
        )}

        {/* Official Document Preview Modal */}
        {previewInvoiceData && (
          <InvoicePreviewModal
            invoice={previewInvoiceData.invoice}
            brand={previewInvoiceData.brand}
            bankAccount={bankAccounts.find((b) => b.isDefault) || bankAccounts[0]}
            companyProfile={{
              companyName: invoiceSettings.companyName,
              address: invoiceSettings.companyAddress,
              email: invoiceSettings.companyEmail,
              phone: invoiceSettings.companyPhone,
              website: invoiceSettings.companyWebsite,
              city: invoiceSettings.signeeCity,
              directorName: invoiceSettings.signatureName,
              directorTitle: invoiceSettings.signatureTitle,
              logoUrl: invoiceSettings.logoUrl,
              signatureUrl: invoiceSettings.signatureUrl,
              signatureSize: invoiceSettings.signatureSize || 65,
              termsAndConditions: invoiceSettings.termsAndConditions,
            }}
            onClose={() => setPreviewInvoiceData(null)}
            onPrint={() => handlePrint(previewInvoiceData.invoice, previewInvoiceData.brand.name)}
            onUpdateSignatureSize={(size) => saveSettings({ ...invoiceSettings, signatureSize: size })}
          />
        )}

        {/* Delete Confirmation Modal */}
        {invoiceToDelete && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[140] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fadeIn border border-slate-200">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Invoice?</h3>
              <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan. Tagihan invoice akan dihapus secara permanen dari sistem.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setInvoiceToDelete(null)}
                  className="px-5 py-2.5 rounded-xl font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all flex-1 text-xs"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteInvoice}
                  className="px-5 py-2.5 rounded-xl font-black bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 cursor-pointer transition-all active:scale-95 flex-1 text-xs"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Copy Notification Modal */}
        {generatedEmail && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[140] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn border border-slate-200">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-base font-black text-slate-800">
                  Email Notifikasi Invoice Siap Dikirim
                </h3>
                <button
                  onClick={() => setGeneratedEmail(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Invoice berhasil disimpan. Gunakan template berikut untuk mempermudah penagihan ke klien.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Kepada (To)</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-2 items-center">
                    <span className="font-mono text-xs text-slate-700 flex-1">{generatedEmail.to}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmail.to);
                        alert('Alamat email berhasil disalin!');
                      }}
                      className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs"
                    >
                      Salin Email
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Subjek Email</label>
                  <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-2 items-center gap-2">
                    <span className="font-semibold text-xs text-slate-700 flex-1 break-all">
                      {generatedEmail.subject}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmail.subject);
                        alert('Subjek berhasil disalin!');
                      }}
                      className="text-xs bg-white border border-slate-200 px-3 py-1 rounded-lg font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors shadow-2xs whitespace-nowrap"
                    >
                      Salin Subjek
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[220px] flex flex-col">
                  <label className="block text-xs font-bold text-slate-500 mb-1 flex justify-between items-end">
                    <span>Isi Pesan Email</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedEmail.body);
                        alert('Isi pesan berhasil disalin!');
                      }}
                      className="text-[10px] uppercase font-black tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-md hover:bg-indigo-100 cursor-pointer transition-colors"
                    >
                      Salin Pesan
                    </button>
                  </label>
                  <textarea
                    readOnly
                    value={generatedEmail.body}
                    className="w-full h-full min-h-[200px] bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium font-mono text-slate-700 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => setGeneratedEmail(null)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

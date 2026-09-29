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
  BellRing,
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
import { InvoiceRemindersPanel } from './invoice/InvoiceRemindersPanel';
import { InvoiceSettingsPanel, type InvoiceSettings } from './invoice/InvoiceSettingsPanel';
import { ClientBillingDirectory } from './invoice/ClientBillingDirectory';
import { LivaBankManager } from './invoice/LivaBankManager';
import { InvoicePreviewModal } from './invoice/InvoicePreviewModal';

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
    "overview" | "billing_directory" | "bank_accounts" | "create" | "settings" | "reminders"
  >("overview");

  const [globalPicEmail, setGlobalPicEmail] = useState<string>("admin1@liva-agency.com, admin2@liva.com");
  const [emailTestStatus, setEmailTestStatus] = useState<string>("");
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
      "1. Pembayaran dilakukan via transfer bank sesuai rekening di atas.\n2. Pembayaran dilakukan sesuai Due Date invoice.\n3. Harap konfirmasi bukti transfer via WhatsApp ke +62 821-7788-9900.",
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

    settingsApi.get<any>("mcn_global_pic_email").then((storedEmail) => {
      let val = storedEmail;
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

  const handleSaveBankAccounts = async (newAccounts: LivaBankAccount[]) => {
    setBankAccounts(newAccounts);
    await settingsApi.save("mcn_liva_bank_accounts", newAccounts).catch(console.error);
  };

  const saveSettings = async (newSettings: InvoiceSettings) => {
    setInvoiceSettings(newSettings);
    await settingsApi.save("mcn_invoice_settings", newSettings).catch(console.error);
  };

  const handleSaveGlobalPicEmail = async () => {
    await settingsApi.save("mcn_global_pic_email", { value: globalPicEmail }).catch(console.error);
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
  const [filterMonth, setFilterMonth] = useState<string>(currentYearMonth);

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

    if (filterMonth) {
      list = list.filter((inv) => {
        const dateToUse = inv.invoiceDate || inv.issueDate;
        return dateToUse.startsWith(filterMonth);
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
  const handleBrandSelectForDraft = (brandId: string) => {
    setSelectedBrandId(brandId);
    if (!brandId) return;
    const brand = clientBrands.find((b) => b.id === brandId);
    if (!brand) return;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // 14-day terms matching the PDF

    const shiftCount = brand.sessions?.length || 2;
    const invoiceNumber = buildNextInvoiceNumber(clientBrands, today);
    const defaultBank = bankAccounts.find((b) => b.isDefault) || bankAccounts[0] || DEFAULT_LIVA_BANKS[0];

    setDraftInvoice({
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNumber,
      invoiceDate: today.toISOString().substring(0, 10),
      issueDate: today.toISOString().substring(0, 10),
      dueDate: dueDate.toISOString().substring(0, 10),
      status: "Draft",
      recipientName: brand.picName || brand.name,
      ptName: brand.companyName || brand.name,
      picName: brand.picName || "",
      picPhone: brand.picPhone || "",
      email: brand.picEmail || "",
      address: brand.companyAddress || "",
      bankInfo: {
        bankName: defaultBank.bankName,
        accountNo: defaultBank.accountNo,
        accountName: defaultBank.accountName,
      },
      sessionItems: [
        {
          sessionId: `sess_${Date.now()}`,
          description: `Live Streaming Package Shopee`,
          qty: shiftCount,
          unit: "Sesi",
          cost: 7000000,
        },
      ],
    });
  };

  const handleSaveDraft = () => {
    if (!selectedBrandId || !draftInvoice.invoiceNumber) return;

    const items = draftInvoice.sessionItems || [];
    const totalAmount = items.reduce((acc, curr) => acc + (curr.cost * (curr.qty || 1)), 0);

    const finalInvoice = {
      ...draftInvoice,
      totalAmount,
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

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!printDoc) return;

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
        termsAndConditions: invoiceSettings.termsAndConditions,
      },
    });

    printDoc.write(htmlContent);
    printDoc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
      }, 2000);
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
    <div className="animate-fadeIn min-h-screen font-sans" id="operator_invoice_dashboard">
      {/* ═══════════════════════════════════════════
          DESKTOP & RESPONSIVE MAIN CONTAINER
      ════════════════════════════════════════════ */}
      <div className="space-y-6 pb-12 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  Billing & Accounts Receivable
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 mt-1">
                <FileText className="w-6 h-6 text-indigo-600" /> Manajemen Invoice & Penagihan
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Kelola data penagihan klien (Bill To), rekening transfer resmi PT. Liva Media Kreatif, terbitkan nota penagihan resmi, dan pantau status pelunasan invoice.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab("create");
              handleBrandSelectForDraft("");
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Buat Invoice Baru
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "overview" || activeTab === "create"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Semua Invoice</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-200">
              {allInvoices.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("billing_directory")}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "billing_directory"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Data Penagihan Client (Bill To)</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-50 text-indigo-700 font-black">
              {clientBrands.filter(b => b.isActive !== false).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("bank_accounts")}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "bank_accounts"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Rekening Bank PT Liva</span>
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-amber-50 text-amber-800 font-black">
              {bankAccounts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan Nota</span>
          </button>

          <button
            onClick={() => setActiveTab("reminders")}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === "reminders"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Pengingat Otomatis</span>
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

          {/* TAB 5: REMINDERS */}
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
              termsAndConditions: invoiceSettings.termsAndConditions,
            }}
            onClose={() => setPreviewInvoiceData(null)}
            onPrint={() => handlePrint(previewInvoiceData.invoice, previewInvoiceData.brand.name)}
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

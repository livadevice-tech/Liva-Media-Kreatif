import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Printer,
  Share2,
  Plus,
  Trash2,
  Building2,
  User,
  Calendar,
  CreditCard,
  Percent,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  X,
  Upload,
  Sparkles,
  Sliders,
  DollarSign,
  Receipt,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  BookmarkPlus,
  Save,
  ChevronDown
} from 'lucide-react';
import { UserAccount, InvoiceDocumentData, InvoiceItem, InvoiceDocType, InvoiceDocStatus, BankAccountItem, SavedClient } from '../../types/app';
import { appApi } from '../../services/appApi';

interface InvoiceQuotationGeneratorProps {
  currentUser?: UserAccount | null;
  onBack?: () => void;
}

const STORAGE_KEY_INVOICE_SETTINGS = 'liva_invoice_company_settings';
const STORAGE_KEY_SAVED_CLIENTS = 'liva_invoice_saved_clients';

// Helper: Rupiah currency formatter
export const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

// Helper: Format tanggal Indonesia (contoh: 16 September 2026)
export const formatIndonesianDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Helper: Fungsi konversi angka ke terbilang bahasa Indonesia
export const angkaKeTerbilang = (n: number): string => {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  const konversi = (angka: number): string => {
    if (angka < 12) {
      return bilangan[angka];
    } else if (angka < 20) {
      return konversi(angka - 10) + ' Belas';
    } else if (angka < 100) {
      return konversi(Math.floor(angka / 10)) + ' Puluh ' + konversi(angka % 10);
    } else if (angka < 200) {
      return 'Seratus ' + konversi(angka - 100);
    } else if (angka < 1000) {
      return konversi(Math.floor(angka / 100)) + ' Ratus ' + konversi(angka % 100);
    } else if (angka < 2000) {
      return 'Seribu ' + konversi(angka - 1000);
    } else if (angka < 1000000) {
      return konversi(Math.floor(angka / 1000)) + ' Ribu ' + konversi(angka % 1000);
    } else if (angka < 1000000000) {
      return konversi(Math.floor(angka / 1000000)) + ' Juta ' + konversi(angka % 1000000);
    } else if (angka < 1000000000000) {
      return konversi(Math.floor(angka / 1000000000)) + ' Miliar ' + konversi(angka % 1000000000);
    }
    return '';
  };

  if (n === 0) return 'Nol Rupiah';
  const hasil = konversi(Math.floor(Math.abs(n))).trim();
  return (hasil ? hasil + ' Rupiah' : 'Nol Rupiah').replace(/\s+/g, ' ');
};

export const InvoiceQuotationGenerator: React.FC<InvoiceQuotationGeneratorProps> = ({
  currentUser,
  onBack,
}) => {
  const today = new Date();
  const nextTwoWeeks = new Date();
  nextTwoWeeks.setDate(today.getDate() + 14);

  const dateStr = today.toISOString().slice(0, 10);
  const dueStr = nextTwoWeeks.toISOString().slice(0, 10);

  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

  // Load saved company settings (Kop, Bank, Signature)
  const [docData, setDocData] = useState<InvoiceDocumentData>(() => {
    let saved: any = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVOICE_SETTINGS);
      if (raw) saved = JSON.parse(raw);
    } catch {}

    const defaultItems: InvoiceItem[] = [
      {
        id: '1',
        description: 'Jasa Live Streaming Shopping (TikTok & Shopee Live)',
        quantity: 1,
        unit: 'bulan',
        price: 7500000,
        discountPercent: 0,
        amount: 7500000,
      },
      {
        id: '2',
        description: 'Host & Talent Specialist (30 Sesi Live Broadcasting)',
        quantity: 30,
        unit: 'sesi',
        price: 150000,
        discountPercent: 0,
        amount: 4500000,
      },
      {
        id: '3',
        description: 'Studio Setting, Equipment & Lighting Rental',
        quantity: 1,
        unit: 'paket',
        price: 2500000,
        discountPercent: 0,
        amount: 2500000,
      }
    ];

    const initialSubtotal = defaultItems.reduce((acc, item) => acc + item.amount, 0);
    const initialTax = 0;
    const initialTotal = initialSubtotal + initialTax;

    const initialBankAccounts: BankAccountItem[] = saved.bankAccounts && Array.isArray(saved.bankAccounts) && saved.bankAccounts.length > 0
      ? saved.bankAccounts
      : [
          {
            id: '1',
            bankName: saved.bankName || 'Bank Central Asia (BCA)',
            accountNumber: saved.bankAccountNumber || '8905 1234 56',
            accountHolder: saved.bankAccountHolder || 'PT LIVA MEDIA KREATIF',
          }
        ];

    return {
      type: 'invoice',
      status: 'sent',
      documentNumber: `INV/LIVA/${currentYear}/${currentMonth}/001`,
      date: dateStr,
      dueDate: dueStr,

      // Issuer info
      companyName: saved.companyName || 'PT. Liva Media Kreatif',
      brandName: saved.brandName !== undefined ? saved.brandName : 'Liva',
      brandTagline: saved.brandTagline !== undefined ? saved.brandTagline : 'Specialist Live Shopping & Agency',
      logoUrl: saved.logoUrl || '',
      companyAddress: saved.companyAddress || 'Jl. Raden Intan No. 88, Bandar Lampung, Indonesia',
      companyEmail: saved.companyEmail || 'finance@livaagency.com',
      companyPhone: saved.companyPhone || '+62 821-7788-9900',
      companyWebsite: saved.companyWebsite || 'https://project.livaagency.com',

      // Client info
      clientName: 'PT Nusantara Digital Bersama',
      clientCompany: 'Brand Beauty Care Official',
      clientAddress: 'Jl. Sudirman Tower Lt. 12, Jakarta Selatan',
      clientEmail: 'procurement@nusantaradigital.id',
      clientPhone: '+62 812-3456-7890',

      currency: 'IDR',
      items: defaultItems,
      subtotal: initialSubtotal,
      discountRate: 0,
      taxRate: 0, // PPN default 0% atau bisa diaktifkan ke 11% / 12%
      shippingFee: 0,
      total: initialTotal,
      terbilang: angkaKeTerbilang(initialTotal),

      // Bank info (Multiple Rekening)
      bankAccounts: initialBankAccounts,
      bankName: initialBankAccounts[0]?.bankName || 'Bank Central Asia (BCA)',
      bankAccountNumber: initialBankAccounts[0]?.accountNumber || '8905 1234 56',
      bankAccountHolder: initialBankAccounts[0]?.accountHolder || 'PT LIVA MEDIA KREATIF',
      paymentTermsNotes: saved.paymentTermsNotes || '1. Pembayaran dilakukan via transfer bank sesuai rekening di atas.\n2. Pembayaran tahap 1 (DP 50%) dilakukan saat penandatanganan kesepakatan kerja.\n3. Harap konfirmasi bukti transfer via WhatsApp ke +62 821-7788-9900.',

      // Signer info
      signerCity: saved.signerCity || 'Bandar Lampung',
      signerName: saved.signerName || 'Mufthi Ali',
      signerPosition: saved.signerPosition || 'Direktur Utama',
      signatureUrl: saved.signatureUrl || '',
      signatureScale: saved.signatureScale || 100,
      includeStamp: saved.includeStamp !== undefined ? saved.includeStamp : true,
      hideClientSignature: saved.hideClientSignature !== undefined ? saved.hideClientSignature : true, // Default true: ttd klien dihilangkan
    };
  });

  // Saved clients list (Database Kontak Klien Tersimpan)
  const [savedClients, setSavedClients] = useState<SavedClient[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_CLIENTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: '1',
        clientName: 'PT Nusantara Digital Bersama',
        clientCompany: 'Brand Beauty Care Official',
        clientAddress: 'Jl. Sudirman Tower Lt. 12, Jakarta Selatan',
        clientEmail: 'procurement@nusantaradigital.id',
        clientPhone: '+62 812-3456-7890',
        createdAt: '2026-09-01'
      }
    ];
  });

  const [clientSaveSuccess, setClientSaveSuccess] = useState(false);

  // Save client data to saved list
  const handleSaveCurrentClient = () => {
    if (!docData.clientName.trim()) {
      alert('Nama klien tidak boleh kosong');
      return;
    }

    const existingIdx = savedClients.findIndex(c => 
      c.clientName.trim().toLowerCase() === docData.clientName.trim().toLowerCase() ||
      (docData.clientCompany && c.clientCompany?.trim().toLowerCase() === docData.clientCompany.trim().toLowerCase())
    );

    const newClient: SavedClient = {
      id: existingIdx >= 0 ? savedClients[existingIdx].id : Date.now().toString(),
      clientName: docData.clientName.trim(),
      clientCompany: docData.clientCompany?.trim() || '',
      clientAddress: docData.clientAddress?.trim() || '',
      clientEmail: docData.clientEmail?.trim() || '',
      clientPhone: docData.clientPhone?.trim() || '',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    let updatedList: SavedClient[];
    if (existingIdx >= 0) {
      updatedList = [...savedClients];
      updatedList[existingIdx] = newClient;
    } else {
      updatedList = [newClient, ...savedClients];
    }

    setSavedClients(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_CLIENTS, JSON.stringify(updatedList));
      setClientSaveSuccess(true);
      setTimeout(() => setClientSaveSuccess(false), 2500);
    } catch (e) {
      console.warn('Gagal menyimpan daftar klien:', e);
    }
  };

  // Select a saved client
  const handleSelectSavedClient = (client: SavedClient) => {
    setDocData(prev => ({
      ...prev,
      clientName: client.clientName,
      clientCompany: client.clientCompany || '',
      clientAddress: client.clientAddress || '',
      clientEmail: client.clientEmail || '',
      clientPhone: client.clientPhone || '',
    }));
  };

  // Delete a saved client
  const handleDeleteSavedClient = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Hapus klien ini dari daftar tersimpan?')) {
      const updated = savedClients.filter(c => c.id !== clientId);
      setSavedClients(updated);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_CLIENTS, JSON.stringify(updated));
      } catch {}
    }
  };

  // Calculate Subtotal & Total whenever items, discount, tax, or shipping changes
  useEffect(() => {
    const sub = docData.items.reduce((acc, it) => acc + (it.amount || 0), 0);
    const discAmount = (sub * (docData.discountRate || 0)) / 100;
    const afterDisc = Math.max(0, sub - discAmount);
    const taxAmount = (afterDisc * (docData.taxRate || 0)) / 100;
    const grand = Math.round(afterDisc + taxAmount + (Number(docData.shippingFee) || 0));

    setDocData(prev => ({
      ...prev,
      subtotal: sub,
      total: grand,
      terbilang: angkaKeTerbilang(grand),
    }));
  }, [docData.items, docData.discountRate, docData.taxRate, docData.shippingFee]);

  // Auto-save persistent company profile, bank accounts & signature
  useEffect(() => {
    try {
      const toSave = {
        companyName: docData.companyName,
        brandName: docData.brandName,
        brandTagline: docData.brandTagline,
        logoUrl: docData.logoUrl,
        companyAddress: docData.companyAddress,
        companyEmail: docData.companyEmail,
        companyPhone: docData.companyPhone,
        companyWebsite: docData.companyWebsite,
        bankAccounts: docData.bankAccounts,
        bankName: docData.bankAccounts[0]?.bankName || docData.bankName,
        bankAccountNumber: docData.bankAccounts[0]?.accountNumber || docData.bankAccountNumber,
        bankAccountHolder: docData.bankAccounts[0]?.accountHolder || docData.bankAccountHolder,
        paymentTermsNotes: docData.paymentTermsNotes,
        signerCity: docData.signerCity,
        signerName: docData.signerName,
        signerPosition: docData.signerPosition,
        signatureUrl: docData.signatureUrl,
        signatureScale: docData.signatureScale,
        includeStamp: docData.includeStamp,
        hideClientSignature: docData.hideClientSignature,
      };
      localStorage.setItem(STORAGE_KEY_INVOICE_SETTINGS, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Gagal menyimpan profil invoice:', e);
    }
  }, [
    docData.companyName,
    docData.brandName,
    docData.brandTagline,
    docData.logoUrl,
    docData.companyAddress,
    docData.companyEmail,
    docData.companyPhone,
    docData.companyWebsite,
    docData.bankAccounts,
    docData.bankName,
    docData.bankAccountNumber,
    docData.bankAccountHolder,
    docData.paymentTermsNotes,
    docData.signerCity,
    docData.signerName,
    docData.signerPosition,
    docData.signatureUrl,
    docData.signatureScale,
    docData.includeStamp,
    docData.hideClientSignature,
  ]);

  // Modal Share Link State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // File Inputs
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);

  // Handler: Change doc type (Invoice <-> Quotation)
  const handleTypeChange = (newType: InvoiceDocType) => {
    const prefix = newType === 'invoice' ? 'INV' : 'QUO';
    const newDocNum = `${prefix}/LIVA/${currentYear}/${currentMonth}/001`;
    setDocData(prev => ({
      ...prev,
      type: newType,
      documentNumber: newDocNum,
    }));
  };

  // Bank Account Management (Tambah, Edit, Hapus Rekening)
  const handleAddBankAccount = () => {
    const newAcc: BankAccountItem = {
      id: Date.now().toString(),
      bankName: 'Bank Central Asia (BCA)',
      accountNumber: '',
      accountHolder: docData.companyName || 'PT LIVA MEDIA KREATIF',
    };
    setDocData(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, newAcc]
    }));
  };

  const handleUpdateBankAccount = (id: string, field: keyof BankAccountItem, value: string) => {
    setDocData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc)
    }));
  };

  const handleRemoveBankAccount = (id: string) => {
    if (docData.bankAccounts.length <= 1) {
      alert('Minimal harus ada 1 nomor rekening');
      return;
    }
    setDocData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(acc => acc.id !== id)
    }));
  };

  // Item Management
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: 'Layanan Baru / Produk',
      quantity: 1,
      unit: 'item',
      price: 1000000,
      discountPercent: 0,
      amount: 1000000,
    };
    setDocData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setDocData(prev => {
      const updated = prev.items.map(item => {
        if (item.id !== id) return item;
        const newItem = { ...item, [field]: value };
        // Recalculate amount
        const qty = Number(newItem.quantity) || 0;
        const prc = Number(newItem.price) || 0;
        const disc = Number(newItem.discountPercent) || 0;
        const rawSub = qty * prc;
        const finalAmt = rawSub - (rawSub * disc / 100);
        newItem.amount = Math.max(0, Math.round(finalAmt));
        return newItem;
      });
      return { ...prev, items: updated };
    });
  };

  const handleRemoveItem = (id: string) => {
    if (docData.items.length <= 1) {
      alert('Minimal harus ada 1 item rincian');
      return;
    }
    setDocData(prev => ({
      ...prev,
      items: prev.items.filter(it => it.id !== id)
    }));
  };

  // Logo & Signature Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran file logo maksimal 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('Ukuran gambar tanda tangan maksimal 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocData(prev => ({ ...prev, signatureUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate & Share Link
  const handleGeneratePublicLink = async () => {
    try {
      setIsGeneratingLink(true);
      const token = `inv-${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
      await appApi.saveSettings(`public_invoice_${token}`, docData);
      const generatedLink = `${window.location.origin}/?inv_token=${token}`;
      setShareUrl(generatedLink);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error('Failed to create public share link:', err);
      alert('Gagal membuat tautan eksternal. Silakan coba beberapa saat lagi.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Isolated Printing / PDF Download
  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    const isInvoice = docData.type === 'invoice';
    const titleType = isInvoice ? 'INVOICE' : 'QUOTATION';
    const cleanClient = docData.clientCompany.trim() || docData.clientName.trim() || 'Client';
    const cleanNumber = docData.documentNumber.replace(/[\/\\]/g, '-');
    const printDocTitle = `${titleType} - ${cleanNumber} - ${cleanClient}`;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${printDocTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              color: #1e293b;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-size: 11.5px;
              line-height: 1.5;
            }

            .invoice-wrapper {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
            }

            /* Header Section */
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            .header-table td {
              vertical-align: top;
            }

            .brand-logo-img {
              max-height: 48px;
              max-width: 140px;
              object-contain: contain;
              margin-bottom: 6px;
            }
            .brand-fallback {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: -0.5px;
              line-height: 1.1;
            }
            .company-name {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .company-details {
              font-size: 10px;
              color: #64748b;
              line-height: 1.4;
              margin-top: 3px;
              max-width: 280px;
            }

            .doc-title-badge {
              text-align: right;
            }
            .doc-title {
              font-size: 26px;
              font-weight: 800;
              letter-spacing: -0.5px;
              color: ${isInvoice ? '#4f46e5' : '#0284c7'};
              margin: 0;
              text-transform: uppercase;
            }
            .doc-meta {
              font-size: 10.5px;
              color: #475569;
              margin-top: 6px;
            }
            .doc-meta strong {
              color: #0f172a;
            }

            /* Client & Info Box */
            .parties-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              background-color: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .parties-table td {
              padding: 12px 16px;
              vertical-align: top;
              width: 50%;
            }
            .box-heading {
              font-size: 9.5px;
              font-weight: 800;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin-bottom: 6px;
            }
            .client-target {
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }
            .client-sub {
              font-size: 11px;
              color: #475569;
              margin-top: 2px;
            }

            /* Items Table */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th {
              background-color: #0f172a;
              color: #ffffff;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.6px;
              padding: 9px 12px;
              text-align: left;
            }
            .items-table th.text-right {
              text-align: right;
            }
            .items-table th.text-center {
              text-align: center;
            }
            .items-table td {
              padding: 9px 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 11px;
              color: #1e293b;
            }
            .items-table tr:nth-child(even) {
              background-color: #f8fafc;
            }

            /* Summary Calculation Box */
            .summary-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .summary-table td {
              vertical-align: top;
            }
            .payment-box {
              width: 55%;
              padding-right: 20px;
            }
            .calc-box {
              width: 45%;
            }
            .calc-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
              font-size: 11px;
              color: #475569;
            }
            .calc-row.total-row {
              border-top: 2px solid #0f172a;
              margin-top: 6px;
              padding-top: 8px;
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
            }

            /* Terbilang Box */
            .terbilang-box {
              background: #f1f5f9;
              padding: 8px 12px;
              border-radius: 6px;
              font-size: 10px;
              font-style: italic;
              color: #334155;
              margin-top: 8px;
              border-left: 3px solid #4f46e5;
            }

            /* Bank & Terms */
            .bank-card {
              border: 1px dashed #cbd5e1;
              border-radius: 6px;
              padding: 10px 14px;
              background-color: #fafaf9;
              font-size: 10.5px;
              line-height: 1.45;
              color: #334155;
            }
            .bank-title {
              font-weight: 700;
              color: #0f172a;
              font-size: 11px;
              margin-bottom: 3px;
            }

            /* Signatures */
            .signature-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 24px;
              page-break-inside: avoid;
            }
            .signature-table td {
              vertical-align: bottom;
              width: 50%;
            }
            .sign-box {
              position: relative;
              min-height: 80px;
              display: flex;
              align-items: center;
            }
            .signature-img {
              max-height: 70px;
              max-width: 140px;
              object-contain: contain;
            }
            .stamp-badge {
              display: inline-block;
              border: 1.5px solid #2563eb;
              color: #2563eb;
              padding: 2px 10px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              transform: rotate(-6deg);
              opacity: 0.85;
              margin-right: 12px;
            }

            .footer-note {
              margin-top: 28px;
              padding-top: 10px;
              border-top: 1px solid #e2e8f0;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <!-- Header -->
            <table class="header-table">
              <tr>
                <td>
                  ${docData.logoUrl ? `
                    <img src="${docData.logoUrl}" class="brand-logo-img" alt="Logo" />
                  ` : `
                    <div class="brand-fallback">${docData.brandName || 'Liva'}</div>
                  `}
                  <div class="company-name">${docData.companyName}</div>
                  <div class="company-details">
                    ${docData.companyAddress}<br/>
                    Email: ${docData.companyEmail} | WA: ${docData.companyPhone}<br/>
                    ${docData.companyWebsite}
                  </div>
                </td>
                <td class="doc-title-badge">
                  <h1 class="doc-title">${isInvoice ? 'INVOICE' : 'QUOTATION'}</h1>
                  <div class="doc-meta">
                    <strong>No:</strong> ${docData.documentNumber}<br/>
                    <strong>Tanggal:</strong> ${formatIndonesianDate(docData.date)}<br/>
                    <strong>${isInvoice ? 'Jatuh Tempo' : 'Berlaku Hingga'}:</strong> ${formatIndonesianDate(docData.dueDate)}
                  </div>
                </td>
              </tr>
            </table>

            <!-- Client & Bank Account Information -->
            <table class="parties-table">
              <tr>
                <td>
                  <div class="box-heading">Ditujukan Kepada (${isInvoice ? 'Bill To' : 'Quotation For'}):</div>
                  <div class="client-target">${docData.clientName}</div>
                  <div class="client-sub"><strong>${docData.clientCompany}</strong></div>
                  <div class="client-sub">${docData.clientAddress}</div>
                  <div class="client-sub">${docData.clientPhone} • ${docData.clientEmail}</div>
                </td>
                <td>
                  <div class="box-heading">Informasi Pembayaran (Transfer Bank):</div>
                  ${(docData.bankAccounts && docData.bankAccounts.length > 0 ? docData.bankAccounts : [{
                    id: '1',
                    bankName: docData.bankName || 'Bank Central Asia (BCA)',
                    accountNumber: docData.bankAccountNumber || '8905 1234 56',
                    accountHolder: docData.bankAccountHolder || 'PT LIVA MEDIA KREATIF',
                  }]).map((acc, i) => `
                    <div style="${i > 0 ? 'margin-top: 8px; padding-top: 6px; border-top: 1px dashed #cbd5e1;' : ''}">
                      <div style="font-weight: 700; color: #0f172a; font-size: 11px;">${acc.bankName}</div>
                      <div class="client-sub" style="margin-top: 1px;">
                        No. Rek: <span style="font-family: monospace; font-weight: 700; color: #4f46e5; font-size: 11.5px;">${acc.accountNumber}</span>
                      </div>
                      <div class="client-sub" style="font-size: 10px;">A/N: <strong>${acc.accountHolder}</strong></div>
                    </div>
                  `).join('')}
                </td>
              </tr>
            </table>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;" class="text-center">No</th>
                  <th style="width: 50%;">Deskripsi Layanan / Item</th>
                  <th style="width: 12%;" class="text-center">Qty</th>
                  <th style="width: 15%;" class="text-right">Harga Satuan</th>
                  <th style="width: 18%;" class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${docData.items.map((item, idx) => `
                  <tr>
                    <td class="text-center" style="color: #64748b;">${idx + 1}</td>
                    <td>
                      <div style="font-weight: 600; color: #0f172a;">${item.description}</div>
                      ${item.discountPercent ? `<div style="font-size: 9.5px; color: #16a34a;">Diskon item: ${item.discountPercent}%</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity} ${item.unit}</td>
                    <td class="text-right">${formatRupiah(item.price)}</td>
                    <td class="text-right" style="font-weight: 600;">${formatRupiah(item.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- Calculation & Payment Notes -->
            <table class="summary-table">
              <tr>
                <td class="payment-box">
                  <div class="bank-card">
                    <div class="bank-title">Catatan & Syarat Ketentuan:</div>
                    ${docData.paymentTermsNotes ? `
                      <div style="font-size: 10px; color: #475569; white-space: pre-line; line-height: 1.5;">
                        ${docData.paymentTermsNotes}
                      </div>
                    ` : `
                      <div style="font-size: 10px; color: #64748b;">
                        1. Pembayaran dilakukan via transfer bank sesuai rekening resmi di atas.<br/>
                        2. Harap konfirmasi bukti transfer setelah melakukan pembayaran.
                      </div>
                    `}
                    <div style="margin-top: 8px; font-size: 9.5px; color: #64748b; border-top: 1px dashed #cbd5e1; pt-1;">
                      Status: <strong style="text-transform: uppercase; color: ${docData.status === 'paid' ? '#16a34a' : '#4f46e5'}">${docData.status}</strong> • Mata Uang: <strong>${docData.currency}</strong>
                    </div>
                  </div>
                </td>
                <td class="calc-box">
                  <div class="calc-row">
                    <span>Subtotal:</span>
                    <span style="font-weight: 600;">${formatRupiah(docData.subtotal)}</span>
                  </div>
                  ${docData.discountRate > 0 ? `
                    <div class="calc-row" style="color: #16a34a;">
                      <span>Diskon (${docData.discountRate}%):</span>
                      <span>-${formatRupiah((docData.subtotal * docData.discountRate) / 100)}</span>
                    </div>
                  ` : ''}
                  ${docData.taxRate > 0 ? `
                    <div class="calc-row">
                      <span>PPN (${docData.taxRate}%):</span>
                      <span>+${formatRupiah(((docData.subtotal - (docData.subtotal * docData.discountRate) / 100) * docData.taxRate) / 100)}</span>
                    </div>
                  ` : ''}
                  ${docData.shippingFee > 0 ? `
                    <div class="calc-row">
                      <span>Biaya Lainnya:</span>
                      <span>+${formatRupiah(docData.shippingFee)}</span>
                    </div>
                  ` : ''}
                  <div class="calc-row total-row">
                    <span>GRAND TOTAL:</span>
                    <span>${formatRupiah(docData.total)}</span>
                  </div>

                  <div class="terbilang-box">
                    <strong>Terbilang:</strong><br/>
                    "${docData.terbilang || angkaKeTerbilang(docData.total)}"
                  </div>
                </td>
              </tr>
            </table>

            <!-- Signatures Section -->
            <table class="signature-table">
              <tr>
                <td>
                  ${!docData.hideClientSignature ? `
                    <div style="font-size: 10px; color: #64748b; margin-bottom: 60px;">
                      Diterima & Disetujui Oleh,<br/>
                      <strong>${docData.clientCompany || docData.clientName}</strong>
                    </div>
                    <div style="border-bottom: 1px solid #94a3b8; width: 160px; margin-bottom: 4px;"></div>
                    <div style="font-size: 11px; font-weight: 700;">( .................................................. )</div>
                  ` : `
                    <div style="font-size: 10px; color: #64748b;">
                      Terima kasih atas kerjasama dan kepercayaan Anda kepada <strong>${docData.brandName || 'Liva'}</strong>.
                    </div>
                  `}
                </td>
                <td style="text-align: right;">
                  <div style="font-size: 10.5px; color: #475569; margin-bottom: 4px;">
                    ${docData.signerCity}, ${formatIndonesianDate(docData.date)}
                  </div>
                  <div style="font-size: 10.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">
                    Hormat Kami, ${docData.companyName}
                  </div>

                  <div class="sign-box" style="justify-content: flex-end;">
                    ${docData.includeStamp ? `
                      <span class="stamp-badge">
                        ${docData.brandName || 'LIVA'} OFFICIAL
                      </span>
                    ` : ''}

                    <div style="transform: scale(${docData.signatureScale / 100}); transform-origin: right center;">
                      ${docData.signatureUrl ? `
                        <img src="${docData.signatureUrl}" class="signature-img" alt="TTD" />
                      ` : `
                        <div style="height: 50px; width: 120px; border-bottom: 1px dashed #cbd5e1; display: inline-block;"></div>
                      `}
                    </div>
                  </div>

                  <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                    ${docData.signerName}
                  </div>
                  <div style="font-size: 10px; color: #64748b;">
                    ${docData.signerPosition}
                  </div>
                </td>
              </tr>
            </table>

            <div class="footer-note">
              Dokumen ini diterbitkan secara resmi oleh ${docData.companyName} dan berlaku sah sebagai bukti tagihan / penawaran kerjasama.
            </div>
          </div>
        </body>
      </html>
    `);

    doc.close();

    setTimeout(() => {
      const originalDocTitle = document.title;
      document.title = printDocTitle;
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.title = originalDocTitle;
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-hidden animate-fadeIn">
      {/* Top Banner / Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Generator Invoice & Quotation
              </h2>
              {/* Toggle Document Type (Invoice vs Quotation) */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTypeChange('invoice')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docData.type === 'invoice'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('quotation')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    docData.type === 'quotation'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quotation
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Buat tagihan atau penawaran harga resmi Liva, ekspor PDF A4 beresolusi tinggi, dan bagikan link online ke klien.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Kembali
            </button>
          )}

          {/* Share External Link Button */}
          <button
            type="button"
            onClick={handleGeneratePublicLink}
            disabled={isGeneratingLink}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Bagikan link langsung ke klien tanpa perlu login"
          >
            {isGeneratingLink ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Share2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>Bagikan Link Klien</span>
          </button>

          {/* Print / Save PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 2-Columns (Editor Form on Left, Live A4 Preview on Right) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* COLUMN 1: FORM EDITOR (5 Columns)                                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* CARD 1: INFORMASI UTAMA DOKUMEN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Informasi Dokumen</h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {docData.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Nomor Dokumen
                  </label>
                  <input
                    type="text"
                    value={docData.documentNumber}
                    onChange={e => setDocData(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Tanggal Dokumen
                  </label>
                  <input
                    type="date"
                    value={docData.date}
                    onChange={e => setDocData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    {docData.type === 'invoice' ? 'Jatuh Tempo (Due Date)' : 'Masa Berlaku'}
                  </label>
                  <input
                    type="date"
                    value={docData.dueDate}
                    onChange={e => setDocData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Status Dokumen
                  </label>
                  <select
                    value={docData.status}
                    onChange={e => setDocData(prev => ({ ...prev, status: e.target.value as InvoiceDocStatus }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none capitalize"
                  >
                    <option value="sent">Terkirim (Sent)</option>
                    <option value="paid">Lunas (Paid)</option>
                    <option value="draft">Draft</option>
                    <option value="accepted">Disetujui (Accepted)</option>
                    <option value="overdue">Jatuh Tempo (Overdue)</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Mata Uang
                  </label>
                  <input
                    type="text"
                    value={docData.currency}
                    onChange={e => setDocData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: DATA KLIEN / PENERIMA */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Data Klien ({docData.type === 'invoice' ? 'Bill To' : 'Quotation For'})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCurrentClient}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    clientSaveSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                  }`}
                  title="Simpan data klien ini agar bisa dipakai kembali di masa depan"
                >
                  {clientSaveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-3.5 h-3.5" />
                      <span>Simpan Klien</span>
                    </>
                  )}
                </button>
              </div>

              {/* Saved Clients Quick Selector */}
              {savedClients.length > 0 && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Bookmark className="w-3 h-3 text-indigo-500" />
                      Pilih dari Klien Tersimpan:
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {savedClients.length} Klien
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {savedClients.map(c => {
                      const isSelected = docData.clientName.trim().toLowerCase() === c.clientName.trim().toLowerCase();
                      return (
                        <div
                          key={c.id}
                          className={`group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                          onClick={() => handleSelectSavedClient(c)}
                        >
                          <span className="truncate max-w-[140px] font-semibold">{c.clientName}</span>
                          {c.clientCompany && (
                            <span className={`text-[10px] opacity-75 truncate max-w-[90px]`}>
                              • {c.clientCompany}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSavedClient(c.id, e)}
                            className={`p-0.5 rounded hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ${
                              isSelected ? 'text-indigo-200' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                            }`}
                            title="Hapus klien tersimpan ini"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Nama Klien / Perusahaan Tujuan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PT Nusantara Digital Bersama"
                    value={docData.clientName}
                    onChange={e => setDocData(prev => ({ ...prev, clientName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Brand / Divisi / PIC
                    </label>
                    <input
                      type="text"
                      placeholder="Brand Beauty Care"
                      value={docData.clientCompany}
                      onChange={e => setDocData(prev => ({ ...prev, clientCompany: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      No. Telp / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="+62 812-xxxx"
                      value={docData.clientPhone}
                      onChange={e => setDocData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Email Klien
                    </label>
                    <input
                      type="email"
                      placeholder="client@company.com"
                      value={docData.clientEmail}
                      onChange={e => setDocData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Alamat Klien
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta Selatan, Indonesia"
                      value={docData.clientAddress}
                      onChange={e => setDocData(prev => ({ ...prev, clientAddress: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: RINCIAN ITEM / JASA */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Rincian Layanan & Harga ({docData.items.length} Item)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {docData.items.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2.5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Deskripsi layanan / jasa"
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 pl-7">
                      <div className="col-span-3">
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center font-bold focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Satuan</label>
                        <input
                          type="text"
                          placeholder="bulan/sesi"
                          value={item.unit}
                          onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-center focus:border-indigo-500 outline-none"
                        />
                      </div>

                      <div className="col-span-6">
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Harga Satuan (Rp)</label>
                        <input
                          type="number"
                          step="1000"
                          value={item.price}
                          onChange={e => handleUpdateItem(item.id, 'price', Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right font-mono font-semibold focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pl-7 pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400">Subtotal Item:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Discount Options */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                    <span>Diskon Global (%)</span>
                    <span className="text-emerald-600 font-bold">{docData.discountRate}%</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={docData.discountRate}
                    onChange={e => setDocData(prev => ({ ...prev, discountRate: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                    <span>PPN (%)</span>
                    <span className="text-indigo-600 font-bold">{docData.taxRate}%</span>
                  </label>
                  <select
                    value={docData.taxRate}
                    onChange={e => setDocData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  >
                    <option value="0">Non PPN (0%)</option>
                    <option value="11">PPN 11%</option>
                    <option value="12">PPN 12%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 4: REKENING BANK & SYARAT PEMBAYARAN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Informasi Pembayaran ({docData.bankAccounts.length} Rekening)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddBankAccount}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              </div>

              {/* Dynamic Bank Accounts List */}
              <div className="space-y-3">
                {docData.bankAccounts.map((acc, index) => (
                  <div
                    key={acc.id}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5 hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        Rekening #{index + 1}
                      </span>
                      {docData.bankAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBankAccount(acc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus rekening ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bank Central Asia (BCA) / Mandiri"
                        value={acc.bankName}
                        onChange={e => handleUpdateBankAccount(acc.id, 'bankName', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">
                          Nomor Rekening
                        </label>
                        <input
                          type="text"
                          placeholder="8905 1234 56"
                          value={acc.accountNumber}
                          onChange={e => handleUpdateBankAccount(acc.id, 'accountNumber', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-0.5 block">
                          Atas Nama (A/N)
                        </label>
                        <input
                          type="text"
                          placeholder="PT LIVA MEDIA KREATIF"
                          value={acc.accountHolder}
                          onChange={e => handleUpdateBankAccount(acc.id, 'accountHolder', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Syarat & Ketentuan Pembayaran (Terms & Notes)
                  </label>
                  <textarea
                    rows={3}
                    value={docData.paymentTermsNotes}
                    onChange={e => setDocData(prev => ({ ...prev, paymentTermsNotes: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* CARD 5: KOP PERUSAHAAN & PENANDATANGAN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Kop & Tanda Tangan Resmi</h3>
                </div>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tersimpan Otomatis
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Nama Badan Usaha / PT
                  </label>
                  <input
                    type="text"
                    value={docData.companyName}
                    onChange={e => setDocData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Brand / Merk Dagang
                    </label>
                    <input
                      type="text"
                      value={docData.brandName}
                      onChange={e => setDocData(prev => ({ ...prev, brandName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Kota Penerbit
                    </label>
                    <input
                      type="text"
                      value={docData.signerCity}
                      onChange={e => setDocData(prev => ({ ...prev, signerCity: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Alamat Kantor Perusahaan
                    </label>
                    <input
                      type="text"
                      value={docData.companyAddress}
                      onChange={e => setDocData(prev => ({ ...prev, companyAddress: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Email Perusahaan
                    </label>
                    <input
                      type="email"
                      value={docData.companyEmail}
                      onChange={e => setDocData(prev => ({ ...prev, companyEmail: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      No. Telp / WhatsApp Kantor
                    </label>
                    <input
                      type="text"
                      value={docData.companyPhone}
                      onChange={e => setDocData(prev => ({ ...prev, companyPhone: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Website / Link Perusahaan
                    </label>
                    <input
                      type="text"
                      value={docData.companyWebsite}
                      onChange={e => setDocData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Upload Logo Kop */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Logo Kop Surat (Tersimpan Permanen)
                  </label>
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{docData.logoUrl ? 'Ganti Logo Kop' : 'Upload Logo Kop'}</span>
                    </button>
                    {docData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => setDocData(prev => ({ ...prev, logoUrl: '' }))}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus Logo
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Nama Penandatangan
                    </label>
                    <input
                      type="text"
                      value={docData.signerName}
                      onChange={e => setDocData(prev => ({ ...prev, signerName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                      Jabatan Penandatangan
                    </label>
                    <input
                      type="text"
                      value={docData.signerPosition}
                      onChange={e => setDocData(prev => ({ ...prev, signerPosition: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Upload Signature & Scale */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                    Tanda Tangan Digital
                  </label>
                  <input
                    type="file"
                    ref={signatureInputRef}
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => signatureInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{docData.signatureUrl ? 'Ganti TTD' : 'Upload TTD'}</span>
                    </button>
                    {docData.signatureUrl && (
                      <button
                        type="button"
                        onClick={() => setDocData(prev => ({ ...prev, signatureUrl: '' }))}
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Hapus TTD
                      </button>
                    )}
                  </div>

                  {docData.signatureUrl && (
                    <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Ukuran Tanda Tangan:</span>
                        </span>
                        <span className="font-bold text-indigo-600">{docData.signatureScale}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        step="5"
                        value={docData.signatureScale}
                        onChange={e => setDocData(prev => ({ ...prev, signatureScale: parseInt(e.target.value) }))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="pt-2 space-y-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Hilangkan TTD Klien</span>
                      <span className="text-[10px] text-slate-400">Hanya menampilkan tanda tangan penerbit / perusahaan</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={docData.hideClientSignature ?? true}
                        onChange={e => setDocData(prev => ({ ...prev, hideClientSignature: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Tampilkan Stempel Resmi</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={docData.includeStamp}
                        onChange={e => setDocData(prev => ({ ...prev, includeStamp: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: LIVE A4 PREVIEW (7 Columns)                                    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 sticky top-4">
            <div className="bg-slate-200/80 p-4 sm:p-6 rounded-3xl border border-slate-300 shadow-inner flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pratinjau Live Dokumen (A4)
                </span>
                <span className="text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-300 font-mono">
                  {docData.type.toUpperCase()} • {docData.documentNumber}
                </span>
              </div>

              {/* A4 Sheet Container */}
              <div className="w-full max-w-[620px] bg-white shadow-2xl rounded-sm p-6 sm:p-8 text-slate-800 text-[11px] border border-slate-300 relative overflow-hidden font-sans">
                
                {/* Header Kop */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                  <div>
                    {docData.logoUrl ? (
                      <img src={docData.logoUrl} alt="Logo" className="max-h-10 max-w-[120px] object-contain mb-1" />
                    ) : (
                      <div className="text-xl font-extrabold text-indigo-600 tracking-tight">
                        {docData.brandName || 'Liva'}
                      </div>
                    )}
                    <div className="font-bold text-xs text-slate-900">{docData.companyName}</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5 max-w-[240px]">
                      {docData.companyAddress}<br/>
                      Email: {docData.companyEmail} | WA: {docData.companyPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <h1 className="text-2xl font-black tracking-tight text-indigo-600 uppercase">
                      {docData.type}
                    </h1>
                    <div className="text-[10px] text-slate-500 mt-1 space-y-0.5 font-mono">
                      <div><strong>No:</strong> {docData.documentNumber}</div>
                      <div><strong>Tgl:</strong> {formatIndonesianDate(docData.date)}</div>
                      <div><strong>Due:</strong> {formatIndonesianDate(docData.dueDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Parties info & Bank Accounts */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4 text-[10.5px]">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {docData.type === 'invoice' ? 'Ditagihkan Kepada (Bill To):' : 'Penawaran Untuk:'}
                    </div>
                    <div className="font-bold text-slate-900 text-xs">{docData.clientName}</div>
                    <div className="font-medium text-slate-700">{docData.clientCompany}</div>
                    <div className="text-slate-500 text-[10px] mt-0.5">{docData.clientAddress}</div>
                    <div className="text-slate-500 text-[10px]">{docData.clientPhone} • {docData.clientEmail}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-indigo-600" />
                      <span>Informasi Pembayaran (Transfer Bank):</span>
                    </div>
                    <div className="space-y-1.5">
                      {docData.bankAccounts.map((acc, i) => (
                        <div key={acc.id || i} className="bg-white p-1.5 rounded-lg border border-slate-200/80 text-[10px] leading-tight">
                          <div className="font-bold text-slate-900">{acc.bankName}</div>
                          <div className="font-mono text-indigo-700 font-bold">{acc.accountNumber}</div>
                          <div className="text-slate-500 text-[9.5px]">A/N: <strong>{acc.accountHolder}</strong></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4 overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left border-collapse text-[10.5px]">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[9.5px] uppercase tracking-wider">
                        <th className="p-2 text-center w-6">#</th>
                        <th className="p-2">Deskripsi Layanan</th>
                        <th className="p-2 text-center w-14">Qty</th>
                        <th className="p-2 text-right w-24">Harga</th>
                        <th className="p-2 text-right w-24">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {docData.items.map((item, i) => (
                        <tr key={item.id} className={i % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                          <td className="p-2 text-center text-slate-400">{i + 1}</td>
                          <td className="p-2">
                            <span className="font-semibold text-slate-900">{item.description}</span>
                          </td>
                          <td className="p-2 text-center">{item.quantity} {item.unit}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(item.price)}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">{formatRupiah(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculations & Payment Terms */}
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-7">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-[10px] leading-relaxed">
                      <div className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                        <FileCheck2 className="w-3 h-3 text-indigo-600" />
                        <span>Catatan & Ketentuan:</span>
                      </div>
                      <div className="text-[9.5px] text-slate-600 whitespace-pre-line">
                        {docData.paymentTermsNotes || 'Pembayaran dilakukan sesuai instruksi transfer pada rekening di atas.'}
                      </div>
                      <div className="mt-2 pt-1 border-t border-slate-200/60 text-[9px] text-slate-500">
                        Status: <span className="font-bold uppercase text-indigo-600">{docData.status}</span> • Mata Uang: <strong>{docData.currency}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-5 space-y-1 text-[10.5px]">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-medium">{formatRupiah(docData.subtotal)}</span>
                    </div>
                    {docData.discountRate > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Diskon ({docData.discountRate}%):</span>
                        <span className="font-mono">-{formatRupiah((docData.subtotal * docData.discountRate) / 100)}</span>
                      </div>
                    )}
                    {docData.taxRate > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>PPN ({docData.taxRate}%):</span>
                        <span className="font-mono">+{formatRupiah(((docData.subtotal - (docData.subtotal * docData.discountRate) / 100) * docData.taxRate) / 100)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-xs text-slate-900 pt-1.5 border-t-2 border-slate-900">
                      <span>Total:</span>
                      <span className="font-mono text-indigo-600 text-sm">{formatRupiah(docData.total)}</span>
                    </div>
                    <div className="bg-slate-100 p-1.5 rounded text-[9px] italic text-slate-600 leading-tight">
                      "{docData.terbilang}"
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex items-end justify-between pt-4 border-t border-slate-200 mt-4 text-[10px]">
                  {!docData.hideClientSignature ? (
                    <div>
                      <div className="text-slate-400 mb-10">Penerima / Klien:</div>
                      <div className="font-bold text-slate-900">( ........................................ )</div>
                      <div className="text-slate-400 text-[9px]">{docData.clientCompany || docData.clientName}</div>
                    </div>
                  ) : (
                    <div className="max-w-[240px] text-slate-400 text-[9.5px] leading-relaxed pb-1">
                      Terima kasih atas kerjasama dan kepercayaan Anda kepada <strong className="text-slate-700">{docData.brandName}</strong>. Dokumen ini sah dan diterbitkan secara digital.
                    </div>
                  )}

                  <div className="text-right ml-auto">
                    <div className="text-slate-500 mb-1">
                      {docData.signerCity}, {formatIndonesianDate(docData.date)}
                    </div>
                    <div className="font-bold text-slate-900">
                      Hormat Kami, {docData.companyName}
                    </div>

                    <div className="relative h-16 flex items-center justify-end my-1">
                      {docData.includeStamp && (
                        <div className="border border-indigo-600 text-indigo-600 px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase -rotate-6 mr-3">
                          {docData.brandName || 'LIVA'} OFFICIAL
                        </div>
                      )}
                      <div style={{ transform: `scale(${docData.signatureScale / 100})`, transformOrigin: 'right center' }}>
                        {docData.signatureUrl ? (
                          <img src={docData.signatureUrl} alt="TTD" className="max-h-12 max-w-[100px] object-contain" />
                        ) : (
                          <div className="w-20 border-b border-dashed border-slate-300 h-6"></div>
                        )}
                      </div>
                    </div>

                    <div className="font-extrabold text-slate-900">{docData.signerName}</div>
                    <div className="text-slate-500 text-[9.5px]">{docData.signerPosition}</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal: Bagikan Link Eksternal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bagikan Link {docData.type === 'invoice' ? 'Invoice' : 'Quotation'} ke Klien
                  </h3>
                  <p className="text-[11px] text-slate-500">Tautan resmi untuk dilihat secara online oleh klien</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">
                Klien dapat membuka link ini langsung di browser HP maupun komputer tanpa perlu login. Dokumen akan tampil secara resmi dengan kop, stempel, dan tanda tangan digital Anda, serta dilengkapi tombol untuk mencetak/menyimpan PDF secara mandiri.
              </p>

              {/* URL Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Tautan Publik (Share Link)
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 select-all outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Advantages */}
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3 space-y-1.5 text-[11px] text-indigo-950">
                <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Keuntungan Link Klien Online:</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>Klien tidak perlu login atau mendaftar akun.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>Data rincian tagihan, nomor rekening, dan total terhitung akurat.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>•</span>
                  <span>Klien dapat langsung mencetak atau mengunduh dokumen PDF resmi.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Tes Buka Tautan</span>
              </a>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import {
  Gift,
  Calendar,
  Users,
  DollarSign,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  Printer,
  RefreshCw,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Building2,
  Check,
  X,
  FileText,
  Sparkles,
  Info,
  Sliders,
  TrendingUp,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { HostEmployee, ThrItem, ThrPeriod } from "../../types";
import {
  calculateTenure,
  computeThrAmount,
  formatIDR,
  resolveHostBaseSalary,
  buildThrItemsFromHosts,
  type HostSalarySettings,
} from "../../shared/utils/thrCalculator";
import { thrApi, hostsApi } from "../../api";

interface ThrManagementPanelProps {
  hosts: HostEmployee[];
  salarySettings: HostSalarySettings;
  onRefreshHosts?: () => void;
  formatIDR?: (amount: number) => string;
}

export const ThrManagementPanel: React.FC<ThrManagementPanelProps> = ({
  hosts,
  salarySettings,
  onRefreshHosts,
  formatIDR: customFormatIDR,
}) => {
  const displayIDR = customFormatIDR || formatIDR;

  // Periods State
  const [periods, setPeriods] = useState<ThrPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [loadingPeriods, setLoadingPeriods] = useState<boolean>(true);

  // Items State
  const [items, setItems] = useState<ThrItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all"); // 'all' | 'host' | 'ops' | 'full' | 'proportional' | 'ineligible'

  // Modals
  const [isCreatePeriodModalOpen, setIsCreatePeriodModalOpen] = useState<boolean>(false);
  const [isEditPeriodModalOpen, setIsEditPeriodModalOpen] = useState<boolean>(false);
  const [isAddOpsModalOpen, setIsAddOpsModalOpen] = useState<boolean>(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  // Modal active items
  const [activeItemForEdit, setActiveItemForEdit] = useState<ThrItem | null>(null);
  const [activeItemForSlip, setActiveItemForSlip] = useState<ThrItem | null>(null);

  // Form State for Period
  const [periodForm, setPeriodForm] = useState({
    year: new Date().getFullYear(),
    holidayName: "Hari Raya Idul Fitri 1448 H",
    holidayDate: "2027-03-10",
    paymentStatus: "Draft" as ThrPeriod["paymentStatus"],
    notes: "",
  });

  // Form State for Add Ops Employee
  const [opsForm, setOpsForm] = useState({
    name: "",
    employeeCode: "",
    role: "Staff Operations",
    department: "Operations",
    joinedDate: "",
    basicSalary: 2700000,
    fixedAllowance: 0,
    adjustmentAmount: 0,
    bankName: "BCA",
    bankAccount: "",
    notes: "",
  });

  // Active Period Object
  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.id === selectedPeriodId) || null;
  }, [periods, selectedPeriodId]);

  // Load periods from API on mount
  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setLoadingPeriods(true);
    try {
      const data = await thrApi.getPeriods();
      if (Array.isArray(data) && data.length > 0) {
        setPeriods(data);
        // Default to first period if not selected
        if (!selectedPeriodId || !data.some((p) => p.id === selectedPeriodId)) {
          setSelectedPeriodId(data[0].id);
        }
      } else {
        // Jika belum ada periode sama sekali, sediakan periode draf awal
        const defaultHolidayDate = "2027-03-10";
        const defaultYear = 2027;
        const initialPeriod = await thrApi.createPeriod({
          year: defaultYear,
          holidayName: "Hari Raya Idul Fitri 1448 H",
          holidayDate: defaultHolidayDate,
          paymentStatus: "Draft",
          notes: "Periode THR Otomatis Sistem Liva Media Kreatif",
        });
        setPeriods([initialPeriod]);
        setSelectedPeriodId(initialPeriod.id);
      }
    } catch (err) {
      console.error("Gagal memuat periode THR:", err);
    } finally {
      setLoadingPeriods(false);
    }
  };

  // Load items when selectedPeriodId changes
  useEffect(() => {
    if (!selectedPeriodId) return;
    loadPeriodItems(selectedPeriodId);
  }, [selectedPeriodId]);

  const loadPeriodItems = async (periodId: string) => {
    setLoadingItems(true);
    try {
      const loadedItems = await thrApi.getItems(periodId);
      const periodObj = periods.find((p) => p.id === periodId);

      if (Array.isArray(loadedItems) && loadedItems.length > 0) {
        setItems(loadedItems);
        setHasUnsavedChanges(false);
      } else if (periodObj && hosts.length > 0) {
        // Otomatis sinkronkan dari data host jika baru dibuat
        const autoItems = buildThrItemsFromHosts({
          period: periodObj,
          hosts,
          salarySettings,
        });
        setItems(autoItems);
        setHasUnsavedChanges(true);
      } else {
        setItems([]);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error("Gagal memuat item THR:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  // Sinkronkan data host manual dengan database host terkini
  const handleSyncWithHosts = () => {
    if (!currentPeriod) return;
    const synced = buildThrItemsFromHosts({
      period: currentPeriod,
      hosts,
      salarySettings,
      existingItems: items,
    });
    setItems(synced);
    setHasUnsavedChanges(true);
  };

  // Simpan seluruh data THR ke database
  const handleSaveAll = async (itemsToSave: ThrItem[] = items) => {
    if (!selectedPeriodId) return;
    setIsSaving(true);
    try {
      const saved = await thrApi.batchSaveItems(selectedPeriodId, itemsToSave, true);
      setItems(saved);
      setHasUnsavedChanges(false);
      // Refresh list period untuk update total budget dan count
      const updatedPeriods = await thrApi.getPeriods();
      setPeriods(updatedPeriods);
    } catch (err: any) {
      console.error("Gagal menyimpan data THR:", err);
      alert("Gagal menyimpan data THR: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  };

  // Buat Periode Baru
  const handleCreatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodForm.holidayName || !periodForm.holidayDate) {
      alert("Nama dan tanggal hari raya wajib diisi.");
      return;
    }

    try {
      const newPeriod = await thrApi.createPeriod({
        year: Number(periodForm.year),
        holidayName: periodForm.holidayName,
        holidayDate: periodForm.holidayDate,
        paymentStatus: periodForm.paymentStatus,
        notes: periodForm.notes,
      });

      // Otomatis generate item dari hosts
      const initialItems = buildThrItemsFromHosts({
        period: newPeriod,
        hosts,
        salarySettings,
      });

      await thrApi.batchSaveItems(newPeriod.id, initialItems);

      const allPeriods = await thrApi.getPeriods();
      setPeriods(allPeriods);
      setSelectedPeriodId(newPeriod.id);
      setIsCreatePeriodModalOpen(false);
    } catch (err: any) {
      alert("Gagal membuat periode THR: " + err?.message);
    }
  };

  // Edit Periode Aktif
  const handleUpdatePeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod) return;

    try {
      const updated = await thrApi.updatePeriod(currentPeriod.id, {
        year: Number(periodForm.year),
        holidayName: periodForm.holidayName,
        holidayDate: periodForm.holidayDate,
        paymentStatus: periodForm.paymentStatus,
        notes: periodForm.notes,
      });

      // Recalculate masa kerja dan formula THR seluruh item berdasarkan holiday date baru
      const recalculatedItems = items.map((item) => {
        const tenure = calculateTenure(item.joinedDate, updated.holidayDate);
        const calc = computeThrAmount({
          baseSalary: item.basicSalary,
          fixedAllowance: item.fixedAllowance,
          tenureMonths: tenure.months,
          adjustmentAmount: item.adjustmentAmount,
          isEligible: item.isEligible,
          allowUnderOneMonth: item.isEligible && tenure.isUnderOneMonth,
        });

        return {
          ...item,
          tenureMonths: tenure.months,
          tenureFormatted: tenure.formatted,
          thrBaseSalary: calc.thrBaseSalary,
          calculatedThr: calc.calculatedThr,
          finalThr: calc.finalThr,
          notes: item.notes || calc.formulaNote,
        };
      });

      await handleSaveAll(recalculatedItems);
      setIsEditPeriodModalOpen(false);
    } catch (err: any) {
      alert("Gagal memperbarui periode THR: " + err?.message);
    }
  };

  // Hapus Periode THR
  const handleDeletePeriod = async () => {
    if (!currentPeriod) return;
    const confirm = window.confirm(
      `Yakin ingin menghapus periode THR "${currentPeriod.holidayName}" (${currentPeriod.year})? Seluruh data histori pada periode ini akan dihapus.`
    );
    if (!confirm) return;

    try {
      await thrApi.deletePeriod(currentPeriod.id);
      const remaining = periods.filter((p) => p.id !== currentPeriod.id);
      setPeriods(remaining);
      if (remaining.length > 0) {
        setSelectedPeriodId(remaining[0].id);
      } else {
        setSelectedPeriodId("");
        setItems([]);
      }
      setIsEditPeriodModalOpen(false);
    } catch (err: any) {
      alert("Gagal menghapus periode THR: " + err?.message);
    }
  };

  // Tambah Karyawan Ops / Staff Non-Host
  const handleAddOpsEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPeriod) return;
    if (!opsForm.name || !opsForm.joinedDate) {
      alert("Nama dan tanggal bergabung karyawan wajib diisi.");
      return;
    }

    const tenure = calculateTenure(opsForm.joinedDate, currentPeriod.holidayDate);
    const basic = Number(opsForm.basicSalary) || 0;
    const allowance = Number(opsForm.fixedAllowance) || 0;
    const adj = Number(opsForm.adjustmentAmount) || 0;

    const calc = computeThrAmount({
      baseSalary: basic,
      fixedAllowance: allowance,
      tenureMonths: tenure.months,
      adjustmentAmount: adj,
      isEligible: !tenure.isUnderOneMonth,
    });

    const newItem: ThrItem = {
      id: `ops_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      periodId: currentPeriod.id,
      employeeType: "ops",
      employeeId: null,
      employeeCode: opsForm.employeeCode || `OPS-${Date.now().toString().slice(-4)}`,
      name: opsForm.name,
      role: opsForm.role || "Staff Operations",
      department: opsForm.department || "Operations",
      joinedDate: opsForm.joinedDate,
      tenureMonths: tenure.months,
      tenureFormatted: tenure.formatted,
      basicSalary: basic,
      fixedAllowance: allowance,
      thrBaseSalary: calc.thrBaseSalary,
      calculatedThr: calc.calculatedThr,
      adjustmentAmount: adj,
      finalThr: calc.finalThr,
      isEligible: calc.isEligible,
      status: "Pending",
      bankName: opsForm.bankName,
      bankAccount: opsForm.bankAccount,
      notes: opsForm.notes || calc.formulaNote,
    };

    const newItemsList = [...items, newItem];
    setItems(newItemsList);
    setHasUnsavedChanges(true);
    setIsAddOpsModalOpen(false);

    // Reset form
    setOpsForm({
      name: "",
      employeeCode: "",
      role: "Staff Operations",
      department: "Operations",
      joinedDate: "",
      basicSalary: 2700000,
      fixedAllowance: 0,
      adjustmentAmount: 0,
      bankName: "BCA",
      bankAccount: "",
      notes: "",
    });

    // Auto save
    await handleSaveAll(newItemsList);
  };

  // Update item secara inline atau modal
  const handleUpdateItem = (updated: ThrItem, syncToMasterHost: boolean = false) => {
    if (!currentPeriod) return;

    // Recalculate tenure dan THR
    const tenure = calculateTenure(updated.joinedDate, currentPeriod.holidayDate);
    const calc = computeThrAmount({
      baseSalary: updated.basicSalary,
      fixedAllowance: updated.fixedAllowance,
      tenureMonths: tenure.months,
      adjustmentAmount: updated.adjustmentAmount,
      isEligible: updated.isEligible,
      allowUnderOneMonth: updated.isEligible && tenure.isUnderOneMonth,
    });

    const itemWithCalc: ThrItem = {
      ...updated,
      tenureMonths: tenure.months,
      tenureFormatted: tenure.formatted,
      thrBaseSalary: calc.thrBaseSalary,
      calculatedThr: calc.calculatedThr,
      finalThr: calc.finalThr,
      notes: updated.notes || calc.formulaNote,
    };

    const updatedList = items.map((i) => (i.id === updated.id ? itemWithCalc : i));
    setItems(updatedList);
    setHasUnsavedChanges(true);

    // Jika syncToMasterHost aktif dan merupakan host, update tanggal join host di database
    if (syncToMasterHost && updated.employeeType === "host" && updated.employeeId) {
      hostsApi
        .update(updated.employeeId, {
          ...(hosts.find((h) => h.id === updated.employeeId) as any),
          joinedDate: updated.joinedDate,
        })
        .then(() => {
          if (onRefreshHosts) onRefreshHosts();
        })
        .catch((e) => console.warn("Gagal update profil host:", e));
    }
  };

  // Hapus item dari periode
  const handleDeleteItem = async (itemId: string) => {
    const itemToDelete = items.find((i) => i.id === itemId);
    if (!itemToDelete) return;

    const confirm = window.confirm(
      `Hapus ${itemToDelete.name} dari daftar penerima THR periode ini?`
    );
    if (!confirm) return;

    try {
      await thrApi.deleteItem(selectedPeriodId, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      // Refresh periods
      const updated = await thrApi.getPeriods();
      setPeriods(updated);
    } catch (err: any) {
      alert("Gagal menghapus item: " + err?.message);
    }
  };

  // Toggle status pembayaran per item
  const handleToggleItemStatus = async (item: ThrItem) => {
    const nextStatus = item.status === "Dibayar" ? "Pending" : "Dibayar";
    const updated = { ...item, status: nextStatus as "Pending" | "Dibayar" };
    handleUpdateItem(updated);
    try {
      await thrApi.updateItem(selectedPeriodId, item.id, { status: nextStatus });
      setHasUnsavedChanges(false);
      const updatedPeriods = await thrApi.getPeriods();
      setPeriods(updatedPeriods);
    } catch (err) {
      console.error(err);
    }
  };

  // Export ke Excel (.xlsx)
  const handleExportExcel = () => {
    if (!currentPeriod || items.length === 0) return;

    const exportRows = items.map((item, idx) => ({
      No: idx + 1,
      Nama: item.name,
      "NIK / ID": item.employeeCode || "-",
      Kategori: item.employeeType === "host" ? "Host Streamer" : "Karyawan Ops / Staff",
      Departemen: item.department || "-",
      Jabatan: item.role || "-",
      "Tanggal Bergabung": item.joinedDate || "-",
      "Masa Kerja (Bulan)": item.tenureMonths,
      "Masa Kerja (Teks)": item.tenureFormatted || `${item.tenureMonths} Bulan`,
      "Gaji Pokok": item.basicSalary,
      "Tunjangan Tetap": item.fixedAllowance,
      "Upah Dasar THR": item.thrBaseSalary,
      "THR Terhitung": item.calculatedThr,
      "Penyesuaian (Bonus/Potongan)": item.adjustmentAmount,
      "Total THR Akhir": item.finalThr,
      Kelayakan: item.isEligible ? "Memenuhi Syarat" : "Tidak Memenuhi",
      Status: item.status,
      Bank: item.bankName || "-",
      "Nomor Rekening": item.bankAccount || "-",
      Catatan: item.notes || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data THR");

    const fileName = `Rekap_THR_${currentPeriod.holidayName.replace(/\s+/g, "_")}_${currentPeriod.year}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.employeeCode && item.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      // Category filter
      if (filterCategory === "host") return item.employeeType === "host";
      if (filterCategory === "ops") return item.employeeType === "ops";
      if (filterCategory === "full") return item.tenureMonths >= 12;
      if (filterCategory === "proportional") return item.tenureMonths >= 1 && item.tenureMonths < 12;
      if (filterCategory === "ineligible") return !item.isEligible || item.tenureMonths < 1;

      return true;
    });
  }, [items, searchQuery, filterCategory]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const totalBudget = items.reduce((sum, i) => sum + (i.isEligible ? i.finalThr : 0), 0);
    const paidBudget = items.reduce(
      (sum, i) => sum + (i.status === "Dibayar" && i.isEligible ? i.finalThr : 0),
      0
    );
    const hostCount = items.filter((i) => i.employeeType === "host").length;
    const opsCount = items.filter((i) => i.employeeType === "ops").length;
    const eligibleCount = items.filter((i) => i.isEligible && i.finalThr > 0).length;
    const avgThr = eligibleCount > 0 ? Math.round(totalBudget / eligibleCount) : 0;

    return {
      totalBudget,
      paidBudget,
      totalEmployees: items.length,
      hostCount,
      opsCount,
      eligibleCount,
      avgThr,
    };
  }, [items]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ================= TOP CONTROLS & PERIOD SELECTION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#6B46FF]">
                <Gift className="w-4 h-4" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight font-sans">
                Manajemen Tunjangan Hari Raya (THR)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Formula Depnaker
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Kalkulasi otomatis masa kerja dan upah pokok employee & host streamer sesuai regulasi ketenagakerjaan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setPeriodForm({
                  year: new Date().getFullYear() + 1,
                  holidayName: "Hari Raya Idul Fitri 1448 H",
                  holidayDate: "2027-03-10",
                  paymentStatus: "Draft",
                  notes: "",
                });
                setIsCreatePeriodModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#6B46FF] hover:bg-[#5835e5] text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Periode Baru</span>
            </button>

            <button
              onClick={() => setIsAddOpsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Karyawan Ops</span>
            </button>

            <button
              onClick={handleSyncWithHosts}
              title="Sinkronkan gaji dan data host terbaru dari database"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sinkronkan Host</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={() => handleSaveAll()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-all shadow-xs animate-pulse"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Period Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Periode Aktif:
            </span>
            <div className="relative">
              <select
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-purple-50/70 border border-purple-200 rounded-xl px-3 py-1.5 text-xs font-black text-[#5835e5] focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer pr-8"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.holidayName} ({p.year}) - {p.holidayDate} [{p.paymentStatus}]
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-purple-600 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {currentPeriod && (
              <button
                onClick={() => {
                  setPeriodForm({
                    year: currentPeriod.year,
                    holidayName: currentPeriod.holidayName,
                    holidayDate: currentPeriod.holidayDate,
                    paymentStatus: currentPeriod.paymentStatus,
                    notes: currentPeriod.notes || "",
                  });
                  setIsEditPeriodModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="Edit Parameter Periode THR"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {currentPeriod && (
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Tanggal Hari Raya:</span>
                <span className="font-bold text-slate-800">
                  {new Date(currentPeriod.holidayDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Status Pencairan:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    currentPeriod.paymentStatus === "Dibayar"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentPeriod.paymentStatus === "Diproses"
                        ? "bg-blue-100 text-blue-800"
                        : currentPeriod.paymentStatus === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {currentPeriod.paymentStatus}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= KPI STATS CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Budget THR
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-[#6B46FF]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 tracking-tight">
            {displayIDR(metrics.totalBudget)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Alokasi {metrics.eligibleCount} penerima memenuhi syarat
          </div>
        </div>

        {/* Total Penerima Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Penerima
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 tracking-tight">
            {metrics.totalEmployees}{" "}
            <span className="text-xs font-normal text-slate-500 font-sans">Orang</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {metrics.hostCount} Host • {metrics.opsCount} Karyawan Ops
          </div>
        </div>

        {/* Rata-Rata THR Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rata-Rata THR
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 tracking-tight">
            {displayIDR(metrics.avgThr)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Per karyawan yang berhak menerima
          </div>
        </div>

        {/* Status Realisasi Pembayaran */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Realisasi Pencairan
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black font-mono text-slate-900 tracking-tight">
            {displayIDR(metrics.paidBudget)}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {metrics.totalBudget > 0
              ? `${Math.round((metrics.paidBudget / metrics.totalBudget) * 100)}% dana telah dicairkan`
              : "0% dicairkan"}
          </div>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORY FILTER TABS ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIK, jabatan, atau studio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center overflow-x-auto pb-1 sm:pb-0 gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "Semua Penerima" },
            { id: "host", label: "Host Saja" },
            { id: "ops", label: "Karyawan Ops" },
            { id: "full", label: "≥ 12 Bln (100%)" },
            { id: "proportional", label: "1-11 Bln (Proporsional)" },
            { id: "ineligible", label: "< 1 Bln" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterCategory === tab.id
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TABLE LIST PENERIMA THR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loadingItems ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#6B46FF]" />
            <div className="text-xs font-bold">Memuat rincian THR...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Gift className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Belum Ada Data Penerima THR</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan data penerima pada filter ini. Klik tombol di bawah untuk
              sinkronisasi data host dari database atau tambah karyawan baru.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleSyncWithHosts}
                className="px-4 py-2 bg-[#6B46FF] text-white rounded-xl text-xs font-bold hover:bg-[#5835e5]"
              >
                Sinkronkan dari Data Host
              </button>
              <button
                onClick={() => setIsAddOpsModalOpen(true)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                + Tambah Karyawan Ops
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-4">Karyawan / Host</th>
                  <th className="py-3.5 px-3">Tgl Join</th>
                  <th className="py-3.5 px-3">Masa Kerja</th>
                  <th className="py-3.5 px-3 text-right">Gaji Pokok</th>
                  <th className="py-3.5 px-3">Perhitungan Formula</th>
                  <th className="py-3.5 px-3 text-right">Penyesuaian</th>
                  <th className="py-3.5 px-3 text-right">Nominal THR</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isFull = item.tenureMonths >= 12;
                  const isProp = item.tenureMonths >= 1 && item.tenureMonths < 12;
                  const isUnderOne = item.tenureMonths < 1;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-purple-50/30 transition-colors ${
                        !item.isEligible ? "opacity-60 bg-slate-50/50" : ""
                      }`}
                    >
                      {/* 1. Karyawan & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              item.employeeType === "host"
                                ? "bg-purple-100 text-[#6B46FF]"
                                : "bg-slate-800 text-white"
                            }`}
                          >
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-slate-900 truncate flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {item.employeeType === "host" ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                                  Host
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  Ops / Staff
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                              <span>{item.role || "Host Streamer"}</span>
                              <span>•</span>
                              <span>{item.department || "Studio"}</span>
                            </div>
                            {item.bankAccount && (
                              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                                {item.bankName || "Rek"}: {item.bankAccount}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Tanggal Join */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <input
                          type="date"
                          value={item.joinedDate}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            handleUpdateItem(
                              {
                                ...item,
                                joinedDate: newDate,
                              },
                              true // sync to host profile too
                            );
                          }}
                          className="bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 hover:border-purple-300 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-400 transition-all cursor-pointer"
                        />
                        {!item.joinedDate && (
                          <div className="text-[9px] text-red-500 font-bold mt-0.5">
                            Wajib diset
                          </div>
                        )}
                      </td>

                      {/* 3. Masa Kerja */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 text-xs">
                            {item.tenureFormatted || `${item.tenureMonths} Bulan`}
                          </div>
                          <div>
                            {isFull && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                100% Upah
                              </span>
                            )}
                            {isProp && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60">
                                {item.tenureMonths}/12 Bulan
                              </span>
                            )}
                            {isUnderOne && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200/60">
                                &lt; 1 Bulan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Gaji Pokok */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="font-bold font-mono text-slate-800">
                          {displayIDR(item.basicSalary)}
                        </div>
                        {item.fixedAllowance > 0 && (
                          <div className="text-[10px] text-slate-500">
                            + Tunj. {displayIDR(item.fixedAllowance)}
                          </div>
                        )}
                      </td>

                      {/* 5. Perhitungan Formula */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5 min-w-[140px]">
                          <div className="font-mono text-[11px] font-bold text-purple-700">
                            {item.isEligible
                              ? displayIDR(item.calculatedThr)
                              : "Rp 0 (Ineligible)"}
                          </div>
                          <div className="text-[10px] text-slate-500 leading-tight">
                            {item.notes || (isFull ? "1 Bulan Upah" : `${item.tenureMonths}/12 × Gaji`)}
                          </div>
                        </div>
                      </td>

                      {/* 6. Penyesuaian (Adjustment) */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveItemForEdit(item);
                            setIsAdjustmentModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded-lg border transition-colors ${
                            item.adjustmentAmount !== 0
                              ? item.adjustmentAmount > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span>
                            {item.adjustmentAmount > 0
                              ? `+${displayIDR(item.adjustmentAmount)}`
                              : item.adjustmentAmount < 0
                                ? `-${displayIDR(Math.abs(item.adjustmentAmount))}`
                                : "Atur"}
                          </span>
                          <Edit3 className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      </td>

                      {/* 7. Nominal Akhir THR */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div
                          className={`font-black font-mono text-sm ${
                            item.finalThr > 0 ? "text-emerald-700" : "text-slate-400"
                          }`}
                        >
                          {displayIDR(item.finalThr)}
                        </div>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleItemStatus(item)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                            item.status === "Dibayar"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                          }`}
                        >
                          {item.status}
                        </button>
                      </td>

                      {/* 9. Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Cetak Slip THR */}
                          <button
                            onClick={() => {
                              setActiveItemForSlip(item);
                              setIsSlipModalOpen(true);
                            }}
                            title="Lihat & Cetak Slip THR"
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-[#6B46FF] transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit / Adjustment Detail */}
                          <button
                            onClick={() => {
                              setActiveItemForEdit(item);
                              setIsAdjustmentModalOpen(true);
                            }}
                            title="Review & Penyesuaian Detail"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item (jika ops) */}
                          {item.employeeType === "ops" && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Hapus Karyawan Ops"
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: BUAT PERIODE BARU ================= */}
      {isCreatePeriodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#6B46FF]" />
                <h3 className="font-black text-slate-900 text-base">Buat Periode THR Baru</h3>
              </div>
              <button
                onClick={() => setIsCreatePeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Hari Raya <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hari Raya Idul Fitri 1448 H"
                  value={periodForm.holidayName}
                  onChange={(e) => setPeriodForm({ ...periodForm, holidayName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Hari Raya <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={periodForm.holidayDate}
                    onChange={(e) =>
                      setPeriodForm({ ...periodForm, holidayDate: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Pembayaran Awal
                </label>
                <select
                  value={periodForm.paymentStatus}
                  onChange={(e) =>
                    setPeriodForm({
                      ...periodForm,
                      paymentStatus: e.target.value as ThrPeriod["paymentStatus"],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending (Menunggu Review)</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dibayar">Selesai Dibayar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk periode ini..."
                  value={periodForm.notes}
                  onChange={(e) => setPeriodForm({ ...periodForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePeriodModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6B46FF] hover:bg-[#5835e5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Simpan & Generate Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT PERIODE AKTIF ================= */}
      {isEditPeriodModalOpen && currentPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#6B46FF]" />
                <h3 className="font-black text-slate-900 text-base">Edit Parameter Periode THR</h3>
              </div>
              <button
                onClick={() => setIsEditPeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePeriod} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Hari Raya
                </label>
                <input
                  type="text"
                  required
                  value={periodForm.holidayName}
                  onChange={(e) => setPeriodForm({ ...periodForm, holidayName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Hari Raya
                  </label>
                  <input
                    type="date"
                    required
                    value={periodForm.holidayDate}
                    onChange={(e) =>
                      setPeriodForm({ ...periodForm, holidayDate: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Pembayaran Periode
                </label>
                <select
                  value={periodForm.paymentStatus}
                  onChange={(e) =>
                    setPeriodForm({
                      ...periodForm,
                      paymentStatus: e.target.value as ThrPeriod["paymentStatus"],
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending (Menunggu Review)</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Dibayar">Selesai Dibayar</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={periodForm.notes}
                  onChange={(e) => setPeriodForm({ ...periodForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeletePeriod}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Periode</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditPeriodModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#6B46FF] hover:bg-[#5835e5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TAMBAH KARYAWAN OPS ================= */}
      {isAddOpsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-800" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Tambah Karyawan Ops / Lainnya
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Input data karyawan non-host (Operations, Studio Crew, Admin, dll).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOpsEmployee} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Karyawan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso"
                    value={opsForm.name}
                    onChange={(e) => setOpsForm({ ...opsForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    NIK / ID Karyawan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: OPS-2026-001"
                    value={opsForm.employeeCode}
                    onChange={(e) => setOpsForm({ ...opsForm, employeeCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Jabatan / Posisi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Studio Manager / Videographer"
                    value={opsForm.role}
                    onChange={(e) => setOpsForm({ ...opsForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Departemen / Lokasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Operations / Studio Tanggamus"
                    value={opsForm.department}
                    onChange={(e) => setOpsForm({ ...opsForm, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Bergabung (Join Date) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={opsForm.joinedDate}
                    onChange={(e) => setOpsForm({ ...opsForm, joinedDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gaji Pokok (Fixed Salary) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={
                      "Rp " +
                      new Intl.NumberFormat("id-ID").format(opsForm.basicSalary || 0)
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOpsForm({ ...opsForm, basicSalary: val ? parseInt(val, 10) : 0 });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank</label>
                  <input
                    type="text"
                    placeholder="BCA / BRI / Mandiri"
                    value={opsForm.bankName}
                    onChange={(e) => setOpsForm({ ...opsForm, bankName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    placeholder="Nomor rekening transfer"
                    value={opsForm.bankAccount}
                    onChange={(e) => setOpsForm({ ...opsForm, bankAccount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Tambahan
                </label>
                <input
                  type="text"
                  placeholder="Catatan khusus karyawan ini..."
                  value={opsForm.notes}
                  onChange={(e) => setOpsForm({ ...opsForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADJUSTMENT / EDIT DETAIL ITEM ================= */}
      {isAdjustmentModalOpen && activeItemForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#6B46FF]" />
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Review & Penyesuaian THR
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {activeItemForEdit.name} ({activeItemForEdit.role})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Masa Kerja Terhitung:</span>
                  <span className="font-bold text-purple-900">
                    {activeItemForEdit.tenureFormatted || `${activeItemForEdit.tenureMonths} Bulan`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Formula Standar:</span>
                  <span className="font-bold font-mono text-purple-900">
                    {displayIDR(activeItemForEdit.calculatedThr)}
                  </span>
                </div>
              </div>

              {/* Input Tanggal Join */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tanggal Bergabung (Join Date)
                </label>
                <input
                  type="date"
                  value={activeItemForEdit.joinedDate}
                  onChange={(e) =>
                    setActiveItemForEdit({ ...activeItemForEdit, joinedDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                />
              </div>

              {/* Input Gaji Pokok */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gaji Pokok (Base Salary)
                  </label>
                  <input
                    type="text"
                    value={
                      "Rp " +
                      new Intl.NumberFormat("id-ID").format(activeItemForEdit.basicSalary || 0)
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        basicSalary: val ? parseInt(val, 10) : 0,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tunjangan Tetap
                  </label>
                  <input
                    type="text"
                    value={
                      "Rp " +
                      new Intl.NumberFormat("id-ID").format(activeItemForEdit.fixedAllowance || 0)
                    }
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        fixedAllowance: val ? parseInt(val, 10) : 0,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Adjustment Amount */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Penyesuaian Manual (Bonus / Potongan)
                  </label>
                  <span className="text-[10px] text-slate-400">Gunakan (-) untuk potongan</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={activeItemForEdit.adjustmentAmount}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        adjustmentAmount: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              {/* Eligibility Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Status Kelayakan THR (Eligible)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Bila dimatikan, THR otomatis diset Rp 0 terlepas dari formula
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeItemForEdit.isEligible}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        isEligible: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B46FF]"></div>
                </label>
              </div>

              {/* Catatan Adjustment */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan HR / Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bonus apresiasi pencapaian loyalitas"
                  value={activeItemForEdit.notes || ""}
                  onChange={(e) =>
                    setActiveItemForEdit({ ...activeItemForEdit, notes: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Bank Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bank</label>
                  <input
                    type="text"
                    value={activeItemForEdit.bankName || ""}
                    onChange={(e) =>
                      setActiveItemForEdit({ ...activeItemForEdit, bankName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={activeItemForEdit.bankAccount || ""}
                    onChange={(e) =>
                      setActiveItemForEdit({ ...activeItemForEdit, bankAccount: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateItem(activeItemForEdit, true);
                    setIsAdjustmentModalOpen(false);
                  }}
                  className="px-5 py-2 bg-[#6B46FF] hover:bg-[#5835e5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Terapkan Penyesuaian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CETAK SLIP THR ================= */}
      {isSlipModalOpen && activeItemForSlip && currentPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Header Dialog */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#6B46FF]" />
                <h3 className="font-black text-slate-900 text-sm">
                  Preview Slip Tunjangan Hari Raya (THR)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6B46FF] text-white rounded-lg text-xs font-bold hover:bg-[#5835e5] shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Slip Paper */}
            <div className="p-6 md:p-8 space-y-6 text-slate-800 bg-white" id="thr_slip_print_area">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900">
                    LIVA MEDIA KREATIF
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Live Streamer Agency & Creative Production
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-xs font-black tracking-wider uppercase">
                    SLIP THR RESMI
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    No: THR/{currentPeriod.year}/{activeItemForSlip.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Title & Periode */}
              <div className="text-center space-y-1">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  SLIP TUNJANGAN HARI RAYA
                </h2>
                <div className="text-xs font-bold text-purple-800">
                  {currentPeriod.holidayName} ({currentPeriod.year})
                </div>
                <div className="text-[10px] text-slate-500">
                  Tanggal Hari Raya:{" "}
                  {new Date(currentPeriod.holidayDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              {/* Employee Bio */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex">
                    <span className="w-28 text-slate-500">Nama Penerima:</span>
                    <span className="font-bold text-slate-900">{activeItemForSlip.name}</span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">NIK / ID:</span>
                    <span className="font-mono text-slate-700">
                      {activeItemForSlip.employeeCode || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Jabatan:</span>
                    <span className="text-slate-700">
                      {activeItemForSlip.role || "Host Streamer"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex">
                    <span className="w-28 text-slate-500">Departemen:</span>
                    <span className="text-slate-700">
                      {activeItemForSlip.department || "Studio"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Tanggal Join:</span>
                    <span className="font-bold text-slate-900">
                      {activeItemForSlip.joinedDate || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-28 text-slate-500">Masa Kerja:</span>
                    <span className="font-bold text-purple-700">
                      {activeItemForSlip.tenureFormatted ||
                        `${activeItemForSlip.tenureMonths} Bulan`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rincian Perhitungan THR
                </div>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3 text-left">Komponen</th>
                      <th className="py-2 px-3 text-left">Dasar Formula</th>
                      <th className="py-2 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 px-3 font-medium">Upah Pokok Bulanan</td>
                      <td className="py-2 px-3 text-slate-500">Gaji Pokok Aktif</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {displayIDR(activeItemForSlip.basicSalary)}
                      </td>
                    </tr>
                    {activeItemForSlip.fixedAllowance > 0 && (
                      <tr>
                        <td className="py-2 px-3 font-medium">Tunjangan Tetap</td>
                        <td className="py-2 px-3 text-slate-500">Eligible Allowance</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {displayIDR(activeItemForSlip.fixedAllowance)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-50/50">
                      <td className="py-2 px-3 font-bold">Total Upah Dasar THR</td>
                      <td className="py-2 px-3 text-slate-500">Gaji Pokok + Tunjangan Tetap</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {displayIDR(activeItemForSlip.thrBaseSalary)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">THR Standar Dihitung</td>
                      <td className="py-2 px-3 text-slate-500">
                        {activeItemForSlip.tenureMonths >= 12
                          ? "100% (Masa Kerja ≥ 12 Bulan)"
                          : `(${activeItemForSlip.tenureMonths}/12) × Upah Dasar`}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {displayIDR(activeItemForSlip.calculatedThr)}
                      </td>
                    </tr>
                    {activeItemForSlip.adjustmentAmount !== 0 && (
                      <tr>
                        <td className="py-2 px-3 font-medium">Penyesuaian Manual / Bonus</td>
                        <td className="py-2 px-3 text-slate-500">
                          {activeItemForSlip.notes || "Penyesuaian HR"}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {activeItemForSlip.adjustmentAmount > 0
                            ? `+${displayIDR(activeItemForSlip.adjustmentAmount)}`
                            : `-${displayIDR(Math.abs(activeItemForSlip.adjustmentAmount))}`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Box */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                    TOTAL THR DITERIMA (NET)
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Status: {activeItemForSlip.status}
                    {activeItemForSlip.bankAccount &&
                      ` • Transfer: ${activeItemForSlip.bankName} ${activeItemForSlip.bankAccount}`}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-emerald-900">
                  {displayIDR(activeItemForSlip.finalThr)}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
                <div className="space-y-12">
                  <div className="text-slate-500 font-medium">Penerima THR,</div>
                  <div className="border-t border-slate-300 w-36 mx-auto pt-1 font-bold text-slate-900">
                    {activeItemForSlip.name}
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="text-slate-500 font-medium">HR & Manajemen Liva,</div>
                  <div className="border-t border-slate-300 w-36 mx-auto pt-1 font-bold text-slate-900">
                    Finance / Management
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

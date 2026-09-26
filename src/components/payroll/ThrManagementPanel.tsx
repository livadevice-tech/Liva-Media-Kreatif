import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Clock,
  ChevronDown,
  X,
  FileText,
  Sliders,
  TrendingUp,
  CreditCard,
  Building,
  Check,
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
import { CustomDatePicker } from "../ui/CustomDatePicker";
import { CustomSelect, type SelectOption } from "../ui/CustomSelect";

const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  {
    value: "Draft",
    label: "Draft",
    description: "Perhitungan awal dan belum diajukan",
    badge: "Draft",
    badgeColor: "bg-slate-100 text-slate-700",
  },
  {
    value: "Pending",
    label: "Pending",
    description: "Menunggu peninjauan & approval finance",
    badge: "Review",
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200/60",
  },
  {
    value: "Diproses",
    label: "Diproses",
    description: "Sedang dalam proses pencairan payroll",
    badge: "Proses",
    badgeColor: "bg-blue-50 text-blue-700 border border-blue-200/60",
  },
  {
    value: "Dibayar",
    label: "Selesai Dibayar",
    description: "THR telah berhasil ditransfer kepada karyawan",
    badge: "Selesai",
    badgeColor: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  },
];


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
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Modals
  const [isCreatePeriodModalOpen, setIsCreatePeriodModalOpen] = useState<boolean>(false);
  const [isEditPeriodModalOpen, setIsEditPeriodModalOpen] = useState<boolean>(false);
  const [isAddOpsModalOpen, setIsAddOpsModalOpen] = useState<boolean>(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState<boolean>(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  // Modal active items
  const [activeItemForEdit, setActiveItemForEdit] = useState<ThrItem | null>(null);
  const [activeItemForSlip, setActiveItemForSlip] = useState<ThrItem | null>(null);

  // Period Selector Dropdown Menu State
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState<boolean>(false);
  const periodMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (periodMenuRef.current && !periodMenuRef.current.contains(e.target as Node)) {
        setIsPeriodMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Live calculation for the edit sidebar
  const liveTenure = useMemo(() => {
    if (!activeItemForEdit || !currentPeriod) return null;
    return calculateTenure(activeItemForEdit.joinedDate, currentPeriod.holidayDate);
  }, [activeItemForEdit?.joinedDate, currentPeriod?.holidayDate]);

  const liveCalc = useMemo(() => {
    if (!activeItemForEdit || !liveTenure) return null;
    return computeThrAmount({
      baseSalary: activeItemForEdit.basicSalary,
      fixedAllowance: activeItemForEdit.fixedAllowance,
      tenureMonths: liveTenure.months,
      adjustmentAmount: activeItemForEdit.adjustmentAmount,
      isEligible: activeItemForEdit.isEligible,
      allowUnderOneMonth: activeItemForEdit.isEligible && liveTenure.isUnderOneMonth,
    });
  }, [activeItemForEdit, liveTenure]);

  // Handle ESC key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAdjustmentModalOpen) {
        setIsAdjustmentModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAdjustmentModalOpen]);

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
        if (!selectedPeriodId || !data.some((p) => p.id === selectedPeriodId)) {
          setSelectedPeriodId(data[0].id);
        }
      } else {
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

  const handleSaveAll = async (itemsToSave: ThrItem[] = items) => {
    if (!selectedPeriodId) return;
    setIsSaving(true);
    try {
      const saved = await thrApi.batchSaveItems(selectedPeriodId, itemsToSave, true);
      setItems(saved);
      setHasUnsavedChanges(false);
      const updatedPeriods = await thrApi.getPeriods();
      setPeriods(updatedPeriods);
    } catch (err: any) {
      console.error("Gagal menyimpan data THR:", err);
      alert("Gagal menyimpan data THR: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  };

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

    await handleSaveAll(newItemsList);
  };

  const handleUpdateItem = (updated: ThrItem, syncToMasterHost: boolean = false) => {
    if (!currentPeriod) return;

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
      const updated = await thrApi.getPeriods();
      setPeriods(updated);
    } catch (err: any) {
      alert("Gagal menghapus item: " + err?.message);
    }
  };


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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.employeeCode && item.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.department && item.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (filterCategory === "host") return item.employeeType === "host";
      if (filterCategory === "ops") return item.employeeType === "ops";
      if (filterCategory === "full") return item.tenureMonths >= 12;
      if (filterCategory === "proportional") return item.tenureMonths >= 1 && item.tenureMonths < 12;
      if (filterCategory === "ineligible") return !item.isEligible || item.tenureMonths < 1;

      return true;
    });
  }, [items, searchQuery, filterCategory]);

  const metrics = useMemo(() => {
    const totalBudget = items.reduce((sum, i) => sum + (i.isEligible ? i.finalThr : 0), 0);
    const hostCount = items.filter((i) => i.employeeType === "host").length;
    const opsCount = items.filter((i) => i.employeeType === "ops").length;
    const eligibleCount = items.filter((i) => i.isEligible && i.finalThr > 0).length;
    const avgThr = eligibleCount > 0 ? Math.round(totalBudget / eligibleCount) : 0;

    return {
      totalBudget,
      totalEmployees: items.length,
      hostCount,
      opsCount,
      eligibleCount,
      avgThr,
    };
  }, [items]);

  return (
    <div className="space-y-4 md:space-y-5 animate-fadeIn max-w-[1600px] mx-auto w-full">
      {/* ================= COMPACT & SLEEK PERIOD TOOLBAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-5 transition-all">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Period Selector & Information (Structured 2-row Identity Block) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600 shrink-0 shadow-3xs">
              <Gift className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              {/* Line 1: Custom Period Dropdown & Edit Settings Button */}
              <div className="flex items-center gap-1.5">
                <div className="relative inline-flex items-center max-w-full" ref={periodMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1 -ml-1 rounded-xl font-black text-slate-900 text-sm sm:text-base hover:bg-slate-100/80 transition-all cursor-pointer group tracking-tight"
                  >
                    <span className="truncate max-w-[220px] sm:max-w-[320px]">
                      {currentPeriod
                        ? `${currentPeriod.holidayName} (${currentPeriod.year})`
                        : "Pilih Periode"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-transform duration-200 shrink-0 ${
                        isPeriodMenuOpen ? "rotate-180 text-purple-600" : ""
                      }`}
                    />
                  </button>

                  {/* Custom Period Dropdown Menu */}
                  {isPeriodMenuOpen && (
                    <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-fadeIn backdrop-blur-md ring-1 ring-black/5">
                      <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Daftar Periode THR</span>
                        <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                          {periods.length} Periode
                        </span>
                      </div>

                      <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
                        {periods.map((p) => {
                          const isSelected = p.id === selectedPeriodId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPeriodId(p.id);
                                setIsPeriodMenuOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-purple-50/70 text-purple-900 font-bold"
                                  : "hover:bg-slate-50 text-slate-700 font-medium"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs truncate flex items-center gap-1.5">
                                  <span className="truncate">{p.holidayName}</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                      isSelected
                                        ? "bg-purple-200/70 text-purple-800"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {p.year}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                                  <span>
                                    {new Date(p.holidayDate).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span
                                    className={`font-semibold ${
                                      p.paymentStatus === "Dibayar"
                                        ? "text-emerald-600"
                                        : p.paymentStatus === "Diproses"
                                        ? "text-blue-600"
                                        : p.paymentStatus === "Pending"
                                        ? "text-amber-600"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {p.paymentStatus || "Draft"}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 mt-1 border-t border-slate-100 px-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPeriodMenuOpen(false);
                            setIsCreatePeriodModalOpen(true);
                          }}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-purple-50 text-purple-700 hover:text-purple-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Buat Periode Baru</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (!currentPeriod) return;
                    setPeriodForm({
                      year: currentPeriod.year,
                      holidayName: currentPeriod.holidayName,
                      holidayDate: currentPeriod.holidayDate,
                      paymentStatus: currentPeriod.paymentStatus,
                      notes: currentPeriod.notes || "",
                    });
                    setIsEditPeriodModalOpen(true);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer shrink-0"
                  title="Edit Pengaturan Periode"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Line 2: Date & Status Badge */}
              {currentPeriod && (
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(currentPeriod.holidayDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>

                  <span className="text-slate-300">•</span>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      currentPeriod.paymentStatus === "Dibayar"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : currentPeriod.paymentStatus === "Diproses"
                          ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                          : currentPeriod.paymentStatus === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200/60"
                    }`}
                  >
                    {currentPeriod.paymentStatus}
                  </span>

                  {currentPeriod.notes && (
                    <>
                      <span className="text-slate-300 hidden md:inline">•</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[220px] hidden md:inline">
                        {currentPeriod.notes}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Clean Grouped Actions Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap xl:flex-nowrap shrink-0 pt-3 border-t border-slate-100 xl:border-0 xl:pt-0">
            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-3xs whitespace-nowrap"
              title="Export rincian THR ke format Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            {/* Sinkronkan */}
            <button
              onClick={handleSyncWithHosts}
              title="Sinkronkan data dan gaji host dari database"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-3xs whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sinkronkan</span>
            </button>

            {/* + Karyawan Ops */}
            <button
              onClick={() => setIsAddOpsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-3xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Karyawan Ops</span>
            </button>

            {/* Periode Baru */}
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Periode Baru</span>
            </button>

            {/* Simpan Perubahan (Conditional) */}
            {hasUnsavedChanges && (
              <button
                onClick={() => handleSaveAll()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black transition-all shadow-xs animate-pulse cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= KPI CARDS (MATCHING STREAMER PAYROLL AESTHETICS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* Total Budget Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Budget THR
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-800 tracking-tight my-1">
            {displayIDR(metrics.totalBudget)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {metrics.eligibleCount} dari {metrics.totalEmployees} orang berhak menerima
          </div>
        </div>

        {/* Total Penerima Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Penerima
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-800 tracking-tight my-1">
            {metrics.totalEmployees}{" "}
            <span className="text-xs font-normal text-slate-500 font-sans">Orang</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {metrics.hostCount} Host • {metrics.opsCount} Karyawan Ops
          </div>
        </div>

        {/* Rata-Rata THR Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Rata-Rata THR
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-800 tracking-tight my-1">
            {displayIDR(metrics.avgThr)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Per karyawan yang berhak menerima
          </div>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari karyawan, host, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all font-medium shadow-3xs"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center overflow-x-auto pb-1 sm:pb-0 gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/50">
          {[
            { id: "all", label: "Semua" },
            { id: "host", label: "Host Saja" },
            { id: "ops", label: "Karyawan Ops" },
            { id: "full", label: "≥ 12 Bln (100%)" },
            { id: "proportional", label: "Proporsional" },
            { id: "ineligible", label: "< 1 Bln" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === tab.id
                  ? "bg-white text-purple-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TABLE LIST (CLEAN, AIRY, FULLY RESPONSIVE) ================= */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loadingItems ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-600" />
            <div className="text-xs font-bold text-slate-600">Memuat rincian THR...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Gift className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">Belum Ada Data Penerima THR</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ditemukan data penerima pada filter ini. Klik tombol di bawah untuk
              sinkronisasi data host dari database atau tambah karyawan ops.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleSyncWithHosts}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors"
              >
                Sinkronkan dari Data Host
              </button>
              <button
                onClick={() => setIsAddOpsModalOpen(true)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                + Tambah Karyawan Ops
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-4 w-[28%]">Karyawan / Host</th>
                  <th className="py-3 px-3 w-[18%]">Join & Masa Kerja</th>
                  <th className="py-3 px-3 w-[20%]">Gaji & Formula</th>
                  <th className="py-3 px-3 w-[12%] text-center">Penyesuaian</th>
                  <th className="py-3 px-3 w-[12%] text-right">Nominal THR</th>
                  <th className="py-3 px-4 w-[10%] text-center">Aksi</th>
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
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !item.isEligible ? "opacity-60 bg-slate-50/30" : ""
                      }`}
                    >
                      {/* 1. Karyawan / Host & Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              item.employeeType === "host"
                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                : "bg-slate-800 text-white"
                            }`}
                          >
                            {item.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm truncate">
                                {item.name}
                              </span>
                              {item.employeeType === "host" ? (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200/50">
                                  Host
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
                                  Ops
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {item.role || "Host Streamer"} • {item.department || "Studio"}
                            </div>
                            {item.bankAccount && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-slate-300" />
                                <span>
                                  {item.bankName || "Bank"}: {item.bankAccount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Join Date & Masa Kerja */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <CustomDatePicker
                              value={item.joinedDate}
                              onChange={(newDate) => {
                                handleUpdateItem({ ...item, joinedDate: newDate }, true);
                              }}
                              size="sm"
                              className="w-[125px]"
                              buttonClassName="flex w-full items-center justify-between gap-1.5 bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200/80 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700 transition-colors shadow-3xs cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 text-xs">
                              {item.tenureFormatted || `${item.tenureMonths} Bulan`}
                            </span>
                            {isFull && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                100% Upah
                              </span>
                            )}
                            {isProp && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                                {item.tenureMonths}/12
                              </span>
                            )}
                            {isUnderOne && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                                &lt; 1 Bulan
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. Gaji Pokok & Formula */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <div className="font-mono font-bold text-slate-800 text-xs">
                            {displayIDR(item.basicSalary)}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.isEligible ? (
                              <span>
                                {isFull ? "100% Gaji" : `(${item.tenureMonths}/12) × Gaji`} ={" "}
                                <strong className="text-slate-700 font-semibold">
                                  {displayIDR(item.calculatedThr)}
                                </strong>
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                Ineligible (&lt; 1 Bln)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Penyesuaian (Adjustment) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => {
                            setActiveItemForEdit(item);
                            setIsAdjustmentModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                            item.adjustmentAmount !== 0
                              ? item.adjustmentAmount > 0
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                : "bg-red-50 text-red-700 border-red-200/70"
                              : "bg-slate-50/80 text-slate-500 border-slate-200/60 hover:bg-slate-100"
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

                      {/* 5. Nominal Akhir THR */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div
                          className={`font-black font-mono text-sm sm:text-base ${
                            item.finalThr > 0 ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {displayIDR(item.finalThr)}
                        </div>
                      </td>

                      {/* 6. Aksi */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">

                          {/* Print Slip */}
                          <button
                            onClick={() => {
                              setActiveItemForSlip(item);
                              setIsSlipModalOpen(true);
                            }}
                            title="Lihat & Cetak Slip THR"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Settings / Adjustment */}
                          <button
                            onClick={() => {
                              setActiveItemForEdit(item);
                              setIsAdjustmentModalOpen(true);
                            }}
                            title="Edit Rincian"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete if Ops */}
                          {item.employeeType === "ops" && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              title="Hapus Karyawan"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Buat Periode THR Baru</h3>
              </div>
              <button
                onClick={() => setIsCreatePeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePeriod} className="p-4 sm:p-5 space-y-3.5">
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Hari Raya <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={periodForm.holidayDate}
                    onChange={(val) => setPeriodForm({ ...periodForm, holidayDate: val })}
                    className="w-full"
                    buttonClassName="flex w-full items-center justify-between gap-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Pembayaran Awal
                </label>
                <CustomSelect
                  value={periodForm.paymentStatus}
                  onChange={(val) =>
                    setPeriodForm({
                      ...periodForm,
                      paymentStatus: val as ThrPeriod["paymentStatus"],
                    })
                  }
                  options={PAYMENT_STATUS_OPTIONS}
                  placeholder="Pilih Status Pembayaran"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan untuk periode ini..."
                  value={periodForm.notes}
                  onChange={(e) => setPeriodForm({ ...periodForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePeriodModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden border border-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-sm">Edit Parameter Periode THR</h3>
              </div>
              <button
                onClick={() => setIsEditPeriodModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePeriod} className="p-4 sm:p-5 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Hari Raya
                </label>
                <input
                  type="text"
                  required
                  value={periodForm.holidayName}
                  onChange={(e) => setPeriodForm({ ...periodForm, holidayName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tahun</label>
                  <input
                    type="number"
                    value={periodForm.year}
                    onChange={(e) => setPeriodForm({ ...periodForm, year: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Hari Raya
                  </label>
                  <CustomDatePicker
                    value={periodForm.holidayDate}
                    onChange={(val) => setPeriodForm({ ...periodForm, holidayDate: val })}
                    className="w-full"
                    buttonClassName="flex w-full items-center justify-between gap-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer transition-colors shadow-3xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Status Pembayaran Periode
                </label>
                <CustomSelect
                  value={periodForm.paymentStatus}
                  onChange={(val) =>
                    setPeriodForm({
                      ...periodForm,
                      paymentStatus: val as ThrPeriod["paymentStatus"],
                    })
                  }
                  options={PAYMENT_STATUS_OPTIONS}
                  placeholder="Pilih Status Pembayaran"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
                <textarea
                  rows={2}
                  value={periodForm.notes}
                  onChange={(e) => setPeriodForm({ ...periodForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeletePeriod}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Periode</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditPeriodModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl overflow-hidden border border-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-800" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tambah Karyawan Ops / Lainnya
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Input data karyawan non-host (Operations, Studio Crew, Admin, dll).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOpsEmployee} className="p-4 sm:p-5 space-y-3.5">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    placeholder="Contoh: Studio Manager / Editor"
                    value={opsForm.role}
                    onChange={(e) => setOpsForm({ ...opsForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Bergabung (Join Date) <span className="text-red-500">*</span>
                  </label>
                  <CustomDatePicker
                    value={opsForm.joinedDate}
                    onChange={(val) => setOpsForm({ ...opsForm, joinedDate: val })}
                    className="w-full"
                    buttonClassName="flex w-full items-center justify-between gap-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer transition-colors shadow-3xs"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Simpan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SIDEBAR DRAWER: REVIEW & PENYESUAIAN THR ================= */}
      {isAdjustmentModalOpen && activeItemForEdit && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsAdjustmentModalOpen(false)}
            aria-hidden="true"
          />

          {/* Right Slide-Over Panel */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10 z-50">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 ease-out border-l border-slate-200">
              
              {/* Sticky Top Header */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      Review & Penyesuaian THR
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-slate-700">
                        {activeItemForEdit.name}
                      </span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {activeItemForEdit.role}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                          activeItemForEdit.employeeType === "host"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {activeItemForEdit.employeeType === "host" ? "Host" : "Ops"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
                  aria-label="Tutup Sidebar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
                {/* 1. Overview Banner: Masa Kerja & Formula */}
                <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50/50 border border-purple-100/80 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">
                      Masa Kerja
                    </span>
                    <span className="font-black text-purple-950 text-sm">
                      {liveTenure?.formatted || activeItemForEdit.tenureFormatted || `${activeItemForEdit.tenureMonths} Bulan`}
                    </span>
                    <span className="text-[10px] text-purple-600 block mt-0.5 font-medium">
                      {liveTenure?.isUnderOneMonth
                        ? "Masa kerja < 1 bulan (tidak prorata standar)"
                        : (liveTenure?.months ?? activeItemForEdit.tenureMonths) >= 12
                          ? "100% Gaji Pokok (≥ 12 Bulan)"
                          : `${liveTenure?.months ?? activeItemForEdit.tenureMonths}/12 Prorata Formula`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase tracking-wider">
                      Formula Standar
                    </span>
                    <span className="font-black font-mono text-purple-950 text-sm">
                      {displayIDR(liveCalc?.calculatedThr ?? activeItemForEdit.calculatedThr)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      sebelum penyesuaian
                    </span>
                  </div>
                </div>

                {/* 2. Tanggal Bergabung */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Tanggal Bergabung (Join Date)
                    </label>
                    {activeItemForEdit.employeeType === "host" && (
                      <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        Sinkron ke Master Host
                      </span>
                    )}
                  </div>
                  <CustomDatePicker
                    value={activeItemForEdit.joinedDate}
                    onChange={(newDate) =>
                      setActiveItemForEdit({ ...activeItemForEdit, joinedDate: newDate })
                    }
                    placeholder="Pilih Tanggal Bergabung"
                    className="w-full"
                    buttonClassName="flex w-full items-center justify-between gap-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50 cursor-pointer transition-colors shadow-3xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Masa kerja dihitung terhadap tanggal hari raya:{" "}
                    <span className="font-semibold text-slate-600">
                      {currentPeriod?.holidayDate || "-"}
                    </span>
                  </p>
                </div>

                {/* 3. Gaji Pokok & Tunjangan Tetap */}
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                </div>

                {/* 4. Penyesuaian Manual (Bonus / Potongan) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Penyesuaian Manual (Bonus / Potongan)
                    </label>
                    <span className="text-[10px] text-slate-400">Gunakan (-) untuk potongan</span>
                  </div>
                  <input
                    type="number"
                    value={activeItemForEdit.adjustmentAmount}
                    onChange={(e) =>
                      setActiveItemForEdit({
                        ...activeItemForEdit,
                        adjustmentAmount: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveItemForEdit({ ...activeItemForEdit, adjustmentAmount: 0 })}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-medium text-slate-600 cursor-pointer"
                    >
                      Reset 0
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveItemForEdit({
                          ...activeItemForEdit,
                          adjustmentAmount: (activeItemForEdit.adjustmentAmount || 0) + 100000,
                        })
                      }
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[10px] font-semibold text-purple-700 cursor-pointer"
                    >
                      +100rb
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveItemForEdit({
                          ...activeItemForEdit,
                          adjustmentAmount: (activeItemForEdit.adjustmentAmount || 0) + 250000,
                        })
                      }
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[10px] font-semibold text-purple-700 cursor-pointer"
                    >
                      +250rb
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveItemForEdit({
                          ...activeItemForEdit,
                          adjustmentAmount: (activeItemForEdit.adjustmentAmount || 0) + 500000,
                        })
                      }
                      className="px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 text-[10px] font-semibold text-purple-700 cursor-pointer"
                    >
                      +500rb
                    </button>
                  </div>
                </div>

                {/* 5. Status Kelayakan THR (Eligible) */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Status Kelayakan THR (Eligible)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Bila dinonaktifkan, nominal THR otomatis diset Rp 0
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
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* 6. Catatan HR / Alasan Penyesuaian */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Catatan HR / Alasan Penyesuaian
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 100% Gaji Pokok (Masa kerja ≥ 12 bulan) / Bonus apresiasi"
                    value={activeItemForEdit.notes || ""}
                    onChange={(e) =>
                      setActiveItemForEdit({ ...activeItemForEdit, notes: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  />
                </div>

                {/* 7. Bank & Nomor Rekening */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Bank</label>
                    <input
                      type="text"
                      placeholder="BCA / BRI / Mandiri"
                      value={activeItemForEdit.bankName || ""}
                      onChange={(e) =>
                        setActiveItemForEdit({ ...activeItemForEdit, bankName: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 577801020681501"
                      value={activeItemForEdit.bankAccount || ""}
                      onChange={(e) =>
                        setActiveItemForEdit({ ...activeItemForEdit, bankAccount: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                    />
                  </div>
                </div>

                {/* 8. Live Estimation Calculation Breakdown Card */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 mt-2">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Ringkasan THR Akhir</span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        activeItemForEdit.isEligible
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {activeItemForEdit.isEligible ? "Eligible" : "Tidak Eligible"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-xs text-slate-300 border-t border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dasar Gaji (Pokok + Tunjangan):</span>
                      <span className="font-mono text-slate-200">
                        {displayIDR(
                          (activeItemForEdit.basicSalary || 0) + (activeItemForEdit.fixedAllowance || 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Formula Kalkulasi THR:</span>
                      <span className="font-mono text-slate-200">
                        {displayIDR(liveCalc?.calculatedThr ?? activeItemForEdit.calculatedThr)}
                      </span>
                    </div>
                    {activeItemForEdit.adjustmentAmount !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Penyesuaian Manual:</span>
                        <span
                          className={`font-mono font-bold ${
                            activeItemForEdit.adjustmentAmount > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {activeItemForEdit.adjustmentAmount > 0 ? "+" : ""}
                          {displayIDR(activeItemForEdit.adjustmentAmount)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800">
                    <span className="text-xs font-bold text-white">Nominal Akhir Diterima:</span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
                      {displayIDR(liveCalc?.finalThr ?? activeItemForEdit.finalThr)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateItem(
                      {
                        ...activeItemForEdit,
                        ...(liveTenure
                          ? {
                              tenureMonths: liveTenure.months,
                              tenureFormatted: liveTenure.formatted,
                            }
                          : {}),
                        ...(liveCalc
                          ? {
                              thrBaseSalary: liveCalc.thrBaseSalary,
                              calculatedThr: liveCalc.calculatedThr,
                              finalThr: liveCalc.finalThr,
                              notes: activeItemForEdit.notes || liveCalc.formulaNote,
                            }
                          : {}),
                      },
                      true
                    );
                    setIsAdjustmentModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Terapkan Penyesuaian</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CETAK SLIP THR ================= */}
      {isSlipModalOpen && activeItemForSlip && currentPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100">
            {/* Header Dialog */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Slip Tunjangan Hari Raya (THR)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>
                <button
                  onClick={() => setIsSlipModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Slip Paper */}
            <div className="p-6 md:p-8 space-y-5 text-slate-800 bg-white" id="thr_slip_print_area">
              {/* Slip Header */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-900">
                    LIVA MEDIA KREATIF
                  </h1>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Live Streamer Agency & Creative Production
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-800 rounded-md text-[11px] font-black tracking-wider uppercase border border-purple-200/60">
                    SLIP RESMI THR
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-1">
                    No: THR/{currentPeriod.year}/{activeItemForSlip.id.slice(-6).toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Title & Periode */}
              <div className="text-center space-y-0.5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                  SLIP TUNJANGAN HARI RAYA
                </h2>
                <div className="text-xs font-bold text-purple-700">
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
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl text-xs border border-slate-100">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">Nama:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      {activeItemForSlip.name}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">NIK / ID:</span>
                    <span className="font-mono text-slate-700 text-[11px]">
                      {activeItemForSlip.employeeCode || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">Jabatan:</span>
                    <span className="text-slate-700 text-[11px]">
                      {activeItemForSlip.role || "Host Streamer"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">Departemen:</span>
                    <span className="text-slate-700 text-[11px]">
                      {activeItemForSlip.department || "Studio"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">Tgl Join:</span>
                    <span className="font-bold text-slate-900 text-[11px]">
                      {activeItemForSlip.joinedDate || "-"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-slate-500 text-[11px]">Masa Kerja:</span>
                    <span className="font-bold text-purple-700 text-[11px]">
                      {activeItemForSlip.tenureFormatted ||
                        `${activeItemForSlip.tenureMonths} Bulan`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Table */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Rincian Perhitungan THR
                </div>
                <table className="w-full text-xs border border-slate-200/80 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-600 font-bold text-[11px]">
                    <tr>
                      <th className="py-2 px-3 text-left">Komponen</th>
                      <th className="py-2 px-3 text-left">Dasar Formula</th>
                      <th className="py-2 px-3 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
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
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                    TOTAL THR DITERIMA (NET)
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    Status: {activeItemForSlip.status}
                    {activeItemForSlip.bankAccount &&
                      ` • Transfer: ${activeItemForSlip.bankName} ${activeItemForSlip.bankAccount}`}
                  </span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-900">
                  {displayIDR(activeItemForSlip.finalThr)}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div className="space-y-10">
                  <div className="text-slate-500 text-[11px] font-medium">Penerima THR,</div>
                  <div className="border-t border-slate-300 w-32 mx-auto pt-1 font-bold text-slate-900 text-[11px]">
                    {activeItemForSlip.name}
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="text-slate-500 text-[11px] font-medium">HR & Manajemen,</div>
                  <div className="border-t border-slate-300 w-32 mx-auto pt-1 font-bold text-slate-900 text-[11px]">
                    Liva Media Kreatif
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

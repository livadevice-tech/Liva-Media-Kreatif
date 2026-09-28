import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Check,
  Edit2,
  Plus,
  Trash2,
  X,
  Sliders,
  Search,
  Smartphone,
  ShoppingBag,
  Clock,
  Building2,
  MapPin,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Compass,
} from "lucide-react";

import type { StudioItem } from "../../types";

type Setter<T> = (value: T | ((prev: T) => T)) => void;

interface SettingsMetadataPanelsProps {
  agencyLogoUrl: string;
  setAgencyLogoUrl: Setter<string>;
  platforms: string[];
  setPlatforms: Setter<string[]>;
  newPlatformInput: string;
  setNewPlatformInput: Setter<string>;
  platformError: string;
  setPlatformError: Setter<string>;
  editingPlatformIdx: number | null;
  setEditingPlatformIdx: Setter<number | null>;
  editingPlatformValue: string;
  setEditingPlatformValue: Setter<string>;
  brands: string[];
  setBrands: Setter<string[]>;
  newBrandInput: string;
  setNewBrandInput: Setter<string>;
  brandError: string;
  setBrandError: Setter<string>;
  editingBrandIdx: number | null;
  setEditingBrandIdx: Setter<number | null>;
  editingBrandValue: string;
  setEditingBrandValue: Setter<string>;
  shifts: string[];
  setShifts: Setter<string[]>;
  newShiftInput: string;
  setNewShiftInput: Setter<string>;
  shiftError: string;
  setShiftError: Setter<string>;
  editingShiftIdx: number | null;
  setEditingShiftIdx: Setter<number | null>;
  editingShiftValue: string;
  setEditingShiftValue: Setter<string>;
  studios: StudioItem[];
  setStudios: Setter<StudioItem[]>;
  newStudioName: string;
  setNewStudioName: Setter<string>;
  newStudioLocation: string;
  setNewStudioLocation: Setter<string>;
  studioError: string;
  setStudioError: Setter<string>;
  editingStudioIdx: number | null;
  setEditingStudioIdx: Setter<number | null>;
  editingStudioName: string;
  setEditingStudioName: Setter<string>;
  editingStudioLocation: string;
  setEditingStudioLocation: Setter<string>;
  newStudioLat: number | "";
  setNewStudioLat: Setter<number | "">;
  newStudioLng: number | "";
  setNewStudioLng: Setter<number | "">;
  newStudioRadius: number | "";
  setNewStudioRadius: Setter<number | "">;
  editingStudioLat: number | "";
  setEditingStudioLat: Setter<number | "">;
  editingStudioLng: number | "";
  setEditingStudioLng: Setter<number | "">;
  editingStudioRadius: number | "";
  setEditingStudioRadius: Setter<number | "">;
  onRequestConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: "danger" | "warning" | "info",
  ) => void;
}

// Natural Indonesian sort: handles "A1", "A2", "A10" and case-insensitive naming properly
const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, "id", { numeric: true, sensitivity: "base" });

export function SettingsMetadataPanels({
  agencyLogoUrl,
  setAgencyLogoUrl,
  platforms,
  setPlatforms,
  newPlatformInput,
  setNewPlatformInput,
  platformError,
  setPlatformError,
  editingPlatformIdx,
  setEditingPlatformIdx,
  editingPlatformValue,
  setEditingPlatformValue,
  brands,
  setBrands,
  newBrandInput,
  setNewBrandInput,
  brandError,
  setBrandError,
  editingBrandIdx,
  setEditingBrandIdx,
  editingBrandValue,
  setEditingBrandValue,
  shifts,
  setShifts,
  newShiftInput,
  setNewShiftInput,
  shiftError,
  setShiftError,
  editingShiftIdx,
  setEditingShiftIdx,
  editingShiftValue,
  setEditingShiftValue,
  studios,
  setStudios,
  newStudioName,
  setNewStudioName,
  newStudioLocation,
  setNewStudioLocation,
  studioError,
  setStudioError,
  editingStudioIdx,
  setEditingStudioIdx,
  editingStudioName,
  setEditingStudioName,
  editingStudioLocation,
  setEditingStudioLocation,
  newStudioLat,
  setNewStudioLat,
  newStudioLng,
  setNewStudioLng,
  newStudioRadius,
  setNewStudioRadius,
  editingStudioLat,
  setEditingStudioLat,
  editingStudioLng,
  setEditingStudioLng,
  editingStudioRadius,
  setEditingStudioRadius,
  onRequestConfirm,
}: SettingsMetadataPanelsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search filter states
  const [platformSearch, setPlatformSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [shiftSearch, setShiftSearch] = useState("");
  const [studioSearch, setStudioSearch] = useState("");

  // Expandable GPS section states
  const [isStudioGpsExpanded, setIsStudioGpsExpanded] = useState(false);
  const [gmapsAutoInput, setGmapsAutoInput] = useState("");
  const [editGmapsAutoInput, setEditGmapsAutoInput] = useState("");

  // Local key trackers for robust editing regardless of index changes
  const [editingPlatformKey, setEditingPlatformKey] = useState<string | null>(null);
  const [editingBrandKey, setEditingBrandKey] = useState<string | null>(null);
  const [editingShiftKey, setEditingShiftKey] = useState<string | null>(null);
  const [editingStudioId, setEditingStudioId] = useState<string | null>(null);

  // Sync initial unsorted data to be sorted permanently in state
  useEffect(() => {
    if (platforms && platforms.length > 1) {
      const sorted = [...platforms].sort(naturalSort);
      if (JSON.stringify(sorted) !== JSON.stringify(platforms)) {
        setPlatforms(sorted);
      }
    }
    if (brands && brands.length > 1) {
      const sorted = [...brands].sort(naturalSort);
      if (JSON.stringify(sorted) !== JSON.stringify(brands)) {
        setBrands(sorted);
      }
    }
    if (shifts && shifts.length > 1) {
      const sorted = [...shifts].sort(naturalSort);
      if (JSON.stringify(sorted) !== JSON.stringify(shifts)) {
        setShifts(sorted);
      }
    }
    if (studios && studios.length > 1) {
      const sorted = [...studios].sort((a, b) => naturalSort(a.name, b.name));
      if (JSON.stringify(sorted.map((s) => s.id)) !== JSON.stringify(studios.map((s) => s.id))) {
        setStudios(sorted);
      }
    }
  }, []);

  // Sorted data lists
  const sortedPlatforms = useMemo(() => {
    return [...platforms].sort(naturalSort);
  }, [platforms]);

  const filteredPlatforms = useMemo(() => {
    if (!platformSearch.trim()) return sortedPlatforms;
    const q = platformSearch.toLowerCase();
    return sortedPlatforms.filter((p) => p.toLowerCase().includes(q));
  }, [sortedPlatforms, platformSearch]);

  const sortedBrands = useMemo(() => {
    return [...brands].sort(naturalSort);
  }, [brands]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return sortedBrands;
    const q = brandSearch.toLowerCase();
    return sortedBrands.filter((b) => b.toLowerCase().includes(q));
  }, [sortedBrands, brandSearch]);

  const sortedShifts = useMemo(() => {
    return [...shifts].sort(naturalSort);
  }, [shifts]);

  const filteredShifts = useMemo(() => {
    if (!shiftSearch.trim()) return sortedShifts;
    const q = shiftSearch.toLowerCase();
    return sortedShifts.filter((s) => s.toLowerCase().includes(q));
  }, [sortedShifts, shiftSearch]);

  const sortedStudios = useMemo(() => {
    return [...studios].sort((a, b) => naturalSort(a.name, b.name));
  }, [studios]);

  const filteredStudios = useMemo(() => {
    if (!studioSearch.trim()) return sortedStudios;
    const q = studioSearch.toLowerCase();
    return sortedStudios.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q))
    );
  }, [sortedStudios, studioSearch]);

  // Google Maps URL auto-detect parser
  const parseGmapsCoordinates = (
    val: string,
    setLat: (lat: number) => void,
    setLng: (lng: number) => void
  ) => {
    const rawMatch = val.match(/(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/);
    if (rawMatch) {
      setLat(parseFloat(rawMatch[1]));
      setLng(parseFloat(rawMatch[2]));
      return true;
    }
    const urlMatch =
      val.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      val.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
      val.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (urlMatch) {
      setLat(parseFloat(urlMatch[1]));
      setLng(parseFloat(urlMatch[2]));
      return true;
    }
    return false;
  };

  // ================= PLATFORM HANDLERS =================
  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlatformInput.trim();
    if (!trimmed) return;
    if (platforms.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setPlatformError("Platform ini sudah terdaftar!");
      return;
    }
    setPlatforms((prev) => [...prev, trimmed].sort(naturalSort));
    setNewPlatformInput("");
    setPlatformError("");
  };

  const startEditPlatform = (platform: string) => {
    setEditingPlatformKey(platform);
    setEditingPlatformValue(platform);
    const idx = platforms.indexOf(platform);
    setEditingPlatformIdx(idx >= 0 ? idx : null);
    setPlatformError("");
  };

  const handleSavePlatformEdit = () => {
    const newVal = editingPlatformValue.trim();
    if (!newVal || !editingPlatformKey) return;
    if (
      platforms.some(
        (p) =>
          p.toLowerCase() === newVal.toLowerCase() &&
          p.toLowerCase() !== editingPlatformKey.toLowerCase()
      )
    ) {
      setPlatformError("Nama platform sudah terdaftar!");
      return;
    }
    setPlatforms((prev) =>
      prev
        .map((p) => (p === editingPlatformKey ? newVal : p))
        .sort(naturalSort)
    );
    setEditingPlatformKey(null);
    setEditingPlatformIdx(null);
    setPlatformError("");
  };

  const cancelEditPlatform = () => {
    setEditingPlatformKey(null);
    setEditingPlatformIdx(null);
    setPlatformError("");
  };

  const handleDeletePlatform = (platform: string) => {
    onRequestConfirm(
      "Hapus Platform",
      `Apakah Anda yakin ingin menghapus platform "${platform}"? Platform ini tidak akan bisa dipilih lagi pada form absensi.`,
      () => setPlatforms((prev) => prev.filter((p) => p !== platform)),
      "danger"
    );
  };

  // ================= BRAND HANDLERS =================
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newBrandInput.trim();
    if (!trimmed) return;
    if (brands.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
      setBrandError("Brand ini sudah terdaftar!");
      return;
    }
    setBrands((prev) => [...prev, trimmed].sort(naturalSort));
    setNewBrandInput("");
    setBrandError("");
  };

  const startEditBrand = (brand: string) => {
    setEditingBrandKey(brand);
    setEditingBrandValue(brand);
    const idx = brands.indexOf(brand);
    setEditingBrandIdx(idx >= 0 ? idx : null);
    setBrandError("");
  };

  const handleSaveBrandEdit = () => {
    const newVal = editingBrandValue.trim();
    if (!newVal || !editingBrandKey) return;
    if (
      brands.some(
        (b) =>
          b.toLowerCase() === newVal.toLowerCase() &&
          b.toLowerCase() !== editingBrandKey.toLowerCase()
      )
    ) {
      setBrandError("Nama brand sudah terdaftar!");
      return;
    }
    setBrands((prev) =>
      prev
        .map((b) => (b === editingBrandKey ? newVal : b))
        .sort(naturalSort)
    );
    setEditingBrandKey(null);
    setEditingBrandIdx(null);
    setBrandError("");
  };

  const cancelEditBrand = () => {
    setEditingBrandKey(null);
    setEditingBrandIdx(null);
    setBrandError("");
  };

  const handleDeleteBrand = (brand: string) => {
    onRequestConfirm(
      "Hapus Brand Klien",
      `Apakah Anda yakin ingin menghapus brand "${brand}"? Sesi absensi yang merujuk ke brand ini akan tetap aman di arsip.`,
      () => setBrands((prev) => prev.filter((b) => b !== brand)),
      "danger"
    );
  };

  // ================= SHIFT HANDLERS =================
  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newShiftInput.trim();
    if (!trimmed) return;
    if (shifts.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setShiftError("Shift ini sudah terdaftar!");
      return;
    }
    setShifts((prev) => [...prev, trimmed].sort(naturalSort));
    setNewShiftInput("");
    setShiftError("");
  };

  const startEditShift = (shift: string) => {
    setEditingShiftKey(shift);
    setEditingShiftValue(shift);
    const idx = shifts.indexOf(shift);
    setEditingShiftIdx(idx >= 0 ? idx : null);
    setShiftError("");
  };

  const handleSaveShiftEdit = () => {
    const newVal = editingShiftValue.trim();
    if (!newVal || !editingShiftKey) return;
    if (
      shifts.some(
        (s) =>
          s.toLowerCase() === newVal.toLowerCase() &&
          s.toLowerCase() !== editingShiftKey.toLowerCase()
      )
    ) {
      setShiftError("Nama shift sudah terdaftar!");
      return;
    }
    setShifts((prev) =>
      prev
        .map((s) => (s === editingShiftKey ? newVal : s))
        .sort(naturalSort)
    );
    setEditingShiftKey(null);
    setEditingShiftIdx(null);
    setShiftError("");
  };

  const cancelEditShift = () => {
    setEditingShiftKey(null);
    setEditingShiftIdx(null);
    setShiftError("");
  };

  const handleDeleteShift = (shift: string) => {
    onRequestConfirm(
      "Hapus Roster Shift",
      `Apakah Anda yakin ingin menghapus roster "${shift}"?`,
      () => setShifts((prev) => prev.filter((s) => s !== shift)),
      "danger"
    );
  };

  // ================= STUDIO HANDLERS =================
  const handleAddStudio = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newStudioName.trim();
    if (!trimmedName) return;
    const isDuplicate = studios.some(
      (std) =>
        std.name.toLowerCase() === trimmedName.toLowerCase() &&
        std.location.toLowerCase() === newStudioLocation.toLowerCase()
    );
    if (isDuplicate) {
      setStudioError("Studio ini sudah terdaftar di cabang tersebut!");
      return;
    }
    const newStudio: StudioItem = {
      id: `std_auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: trimmedName,
      location: newStudioLocation,
      lat: typeof newStudioLat === "number" ? newStudioLat : undefined,
      lng: typeof newStudioLng === "number" ? newStudioLng : undefined,
      radius: typeof newStudioRadius === "number" ? newStudioRadius : 100,
    };
    setStudios((prev) =>
      [...prev, newStudio].sort((a, b) => naturalSort(a.name, b.name))
    );
    setNewStudioName("");
    setNewStudioLat("");
    setNewStudioLng("");
    setNewStudioRadius(100);
    setGmapsAutoInput("");
    setStudioError("");
  };

  const startEditStudio = (studio: StudioItem) => {
    setEditingStudioId(studio.id);
    setEditingStudioName(studio.name);
    setEditingStudioLocation(studio.location);
    setEditingStudioLat(studio.lat ?? "");
    setEditingStudioLng(studio.lng ?? "");
    setEditingStudioRadius(studio.radius ?? 100);
    setEditGmapsAutoInput("");
    const idx = studios.findIndex((s) => s.id === studio.id);
    setEditingStudioIdx(idx >= 0 ? idx : null);
    setStudioError("");
  };

  const handleSaveStudioEdit = () => {
    const newValName = editingStudioName.trim();
    if (!newValName || !editingStudioId) return;
    const isDuplicate = studios.some(
      (std) =>
        std.id !== editingStudioId &&
        std.name.toLowerCase() === newValName.toLowerCase() &&
        std.location.toLowerCase() === editingStudioLocation.toLowerCase()
    );
    if (isDuplicate) {
      setStudioError("Kombinasi nama studio dan cabang ini sudah terdaftar!");
      return;
    }
    setStudios((prev) =>
      prev
        .map((std) =>
          std.id === editingStudioId
            ? {
                ...std,
                name: newValName,
                location: editingStudioLocation,
                lat: typeof editingStudioLat === "number" ? editingStudioLat : undefined,
                lng: typeof editingStudioLng === "number" ? editingStudioLng : undefined,
                radius: typeof editingStudioRadius === "number" ? editingStudioRadius : 100,
              }
            : std
        )
        .sort((a, b) => naturalSort(a.name, b.name))
    );
    setEditingStudioId(null);
    setEditingStudioIdx(null);
    setStudioError("");
  };

  const cancelEditStudio = () => {
    setEditingStudioId(null);
    setEditingStudioIdx(null);
    setStudioError("");
  };

  const handleDeleteStudio = (studio: StudioItem) => {
    onRequestConfirm(
      "Hapus Studio",
      `Apakah Anda yakin ingin menghapus studio "${studio.name}" (${studio.location})?`,
      () => setStudios((prev) => prev.filter((s) => s.id !== studio.id)),
      "danger"
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-10">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6 overflow-hidden relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base md:text-lg font-extrabold text-slate-800 tracking-tight">
                  Pengaturan Struktur & Metadata Agency
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  Live Agent System
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Kelola data master operasional live streaming secara dinamis dan terstruktur. Seluruh data diurutkan otomatis sesuai abjad (A–Z) dan langsung terintegrasi ke formulir absensi host, laporan omset, serta kalender mingguan.
              </p>
            </div>
          </div>

          {/* Quick Counter Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex items-center gap-2 shrink-0">
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2 text-center min-w-[76px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform</span>
              <span className="text-sm font-black text-blue-600 font-mono">{platforms.length}</span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2 text-center min-w-[76px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand</span>
              <span className="text-sm font-black text-indigo-600 font-mono">{brands.length}</span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2 text-center min-w-[76px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shift</span>
              <span className="text-sm font-black text-amber-600 font-mono">{shifts.length}</span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl px-3 py-2 text-center min-w-[76px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Studio</span>
              <span className="text-sm font-black text-emerald-600 font-mono">{studios.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LOGO AGENCY PANEL ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 md:p-6" id="setting_logo_panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Logo Brand Agency
              </h3>
              <p className="text-[11px] text-slate-400">
                Identitas visual agency untuk sidebar utama, kop dokumen, dan invoice
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            agencyLogoUrl 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {agencyLogoUrl ? '● Logo Aktif' : '○ Belum Terpasang'}
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 pt-5">
          {/* Logo Frame */}
          <div className="relative group shrink-0">
            {agencyLogoUrl ? (
              <div className="w-24 h-24 rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 p-2 shadow-xs flex items-center justify-center overflow-hidden">
                <img
                  src={agencyLogoUrl}
                  alt="Logo Agency"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-2 text-center">
                <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                <span className="text-[10px] font-bold">No Logo</span>
              </div>
            )}
          </div>

          {/* Logo Action & Info */}
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Unggah File Logo Baru (.png / .jpg / .webp)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Rekomendasi rasio 1:1 (persegi), resolusi minimal 200x200px, ukuran maksimal 1MB.
              </p>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      setAgencyLogoUrl(evt.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:shadow-indigo-100"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{agencyLogoUrl ? 'Ganti Logo' : 'Pilih File Logo'}</span>
              </button>

              {agencyLogoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onRequestConfirm(
                      "Hapus Logo Agency",
                      "Apakah Anda yakin ingin menghapus logo agency saat ini? Tampilan akan kembali menggunakan logo standar.",
                      () => setAgencyLogoUrl(""),
                      "danger"
                    );
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4 METADATA PANELS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        
        {/* ================= 1. NAMA PLATFORM ================= */}
        <div
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-4 flex flex-col"
          id="setting_platform_panel"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nama Platform
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-mono">
              {platforms.length} Item
            </span>
          </div>

          {/* Quick Search */}
          <div className="pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari platform..."
                value={platformSearch}
                onChange={(e) => setPlatformSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
              />
              {platformSearch && (
                <button
                  type="button"
                  onClick={() => setPlatformSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddPlatform} className="pt-2.5 space-y-1.5">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Tambah platform baru..."
                value={newPlatformInput}
                onChange={(e) => {
                  setNewPlatformInput(e.target.value);
                  if (platformError) setPlatformError("");
                }}
                className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all font-medium"
                id="new_platform_field"
              />
              <button
                type="submit"
                disabled={!newPlatformInput.trim()}
                className="w-9 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                id="add_platform_btn"
                title="Tambah Platform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {platformError && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{platformError}</span>
              </p>
            )}
          </form>

          {/* Items List (Sorted A-Z) */}
          <div className="mt-3.5 space-y-1.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPlatforms.map((platform, idx) => {
              const isEditing = editingPlatformKey === platform;
              return (
                <div
                  key={platform}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                    isEditing
                      ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-100 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingPlatformValue}
                        onChange={(e) => setEditingPlatformValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePlatformEdit();
                          if (e.key === "Escape") cancelEditPlatform();
                        }}
                        className="flex-1 min-w-0 bg-white border border-blue-400 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none text-slate-800"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSavePlatformEdit}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditPlatform}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 h-4 rounded-full bg-blue-100/60 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700 truncate" title={platform}>
                          {platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditPlatform(platform)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Platform"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlatform(platform)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {filteredPlatforms.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                {platformSearch ? "Tidak ada platform yang cocok." : "Belum ada platform terdaftar."}
              </div>
            )}
          </div>
        </div>

        {/* ================= 2. NAMA BRAND KLIEN ================= */}
        <div
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-4 flex flex-col"
          id="setting_brand_panel"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Nama Brand Klien
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
              {brands.length} Item
            </span>
          </div>

          {/* Quick Search */}
          <div className="pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari brand klien..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
              />
              {brandSearch && (
                <button
                  type="button"
                  onClick={() => setBrandSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddBrand} className="pt-2.5 space-y-1.5">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Tambah brand baru..."
                value={newBrandInput}
                onChange={(e) => {
                  setNewBrandInput(e.target.value);
                  if (brandError) setBrandError("");
                }}
                className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium"
                id="new_brand_field"
              />
              <button
                type="submit"
                disabled={!newBrandInput.trim()}
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                id="add_brand_btn"
                title="Tambah Brand"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {brandError && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{brandError}</span>
              </p>
            )}
          </form>

          {/* Items List (Sorted A-Z) */}
          <div className="mt-3.5 space-y-1.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredBrands.map((brand, idx) => {
              const isEditing = editingBrandKey === brand;
              return (
                <div
                  key={brand}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                    isEditing
                      ? "bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-100 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingBrandValue}
                        onChange={(e) => setEditingBrandValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveBrandEdit();
                          if (e.key === "Escape") cancelEditBrand();
                        }}
                        className="flex-1 min-w-0 bg-white border border-indigo-400 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none text-slate-800"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveBrandEdit}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditBrand}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 h-4 rounded-full bg-indigo-100/60 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700 truncate" title={brand}>
                          {brand}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditBrand(brand)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Brand"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBrand(brand)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {filteredBrands.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                {brandSearch ? "Tidak ada brand yang cocok." : "Belum ada brand terdaftar."}
              </div>
            )}
          </div>
        </div>

        {/* ================= 3. JENIS SESI SHIFT ================= */}
        <div
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-4 flex flex-col"
          id="setting_shift_panel"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Jenis Sesi Shift
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-mono">
              {shifts.length} Sesi
            </span>
          </div>

          {/* Quick Search */}
          <div className="pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari sesi shift..."
                value={shiftSearch}
                onChange={(e) => setShiftSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
              />
              {shiftSearch && (
                <button
                  type="button"
                  onClick={() => setShiftSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddShift} className="pt-2.5 space-y-1.5">
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Shift X (00.00-00.00)..."
                value={newShiftInput}
                onChange={(e) => {
                  setNewShiftInput(e.target.value);
                  if (shiftError) setShiftError("");
                }}
                className="flex-1 min-w-0 px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 transition-all font-mono font-medium"
                id="new_shift_field"
              />
              <button
                type="submit"
                disabled={!newShiftInput.trim()}
                className="w-9 h-9 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                id="add_shift_btn"
                title="Tambah Shift"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {shiftError && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{shiftError}</span>
              </p>
            )}
          </form>

          {/* Items List (Sorted A-Z & Numerically) */}
          <div className="mt-3.5 space-y-1.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredShifts.map((shift, idx) => {
              const isEditing = editingShiftKey === shift;
              return (
                <div
                  key={shift}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                    isEditing
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-100 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        value={editingShiftValue}
                        onChange={(e) => setEditingShiftValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveShiftEdit();
                          if (e.key === "Escape") cancelEditShift();
                        }}
                        className="flex-1 min-w-0 bg-white border border-amber-400 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold focus:outline-none text-slate-800"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveShiftEdit}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditShift}
                        className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Batal"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-4 h-4 rounded-full bg-amber-100/60 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700 font-mono text-[11px] truncate" title={shift}>
                          {shift}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditShift(shift)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Shift"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteShift(shift)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {filteredShifts.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                {shiftSearch ? "Tidak ada sesi shift yang cocok." : "Belum ada shift terdaftar."}
              </div>
            )}
          </div>
        </div>

        {/* ================= 4. LOKASI & NAMA STUDIO ================= */}
        <div
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all p-4 flex flex-col"
          id="setting_studio_panel"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Lokasi & Studio
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono">
              {studios.length} Cabang
            </span>
          </div>

          {/* Quick Search */}
          <div className="pt-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari studio atau cabang..."
                value={studioSearch}
                onChange={(e) => setStudioSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-800 transition-all placeholder-slate-400"
              />
              {studioSearch && (
                <button
                  type="button"
                  onClick={() => setStudioSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Add Studio Form */}
          <form onSubmit={handleAddStudio} className="pt-2.5 space-y-2">
            <div className="space-y-1.5">
              <input
                type="text"
                placeholder="Nama studio (cth: Studio 01, VIP)..."
                value={newStudioName}
                onChange={(e) => {
                  setNewStudioName(e.target.value);
                  if (studioError) setStudioError("");
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 transition-all font-medium"
              />
              <div className="flex gap-1.5">
                <select
                  value={newStudioLocation}
                  onChange={(e) => setNewStudioLocation(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-2 text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 cursor-pointer"
                >
                  <option value="Bandar Lampung">Bandar Lampung</option>
                  <option value="Tanggamus">Tanggamus</option>
                </select>
                <button
                  type="submit"
                  disabled={!newStudioName.trim()}
                  className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="add_studio_btn"
                  title="Tambah Studio"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* GPS & Radius Settings (Collapsible) */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-2 text-xs">
              <button
                type="button"
                onClick={() => setIsStudioGpsExpanded(!isStudioGpsExpanded)}
                className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Titik GPS & Radius Absensi</span>
                </div>
                {isStudioGpsExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {isStudioGpsExpanded && (
                <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-200/60 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Paste link Google Maps / Koordinat..."
                    value={gmapsAutoInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setGmapsAutoInput(val);
                      const parsed = parseGmapsCoordinates(
                        val,
                        (lat) => setNewStudioLat(lat),
                        (lng) => setNewStudioLng(lng)
                      );
                      if (parsed) setGmapsAutoInput("");
                    }}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-emerald-200 rounded-lg text-emerald-900 placeholder-emerald-600/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="-5.39"
                        value={newStudioLat}
                        onChange={(e) => setNewStudioLat(e.target.value ? parseFloat(e.target.value) : "")}
                        className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="105.26"
                        value={newStudioLng}
                        onChange={(e) => setNewStudioLng(e.target.value ? parseFloat(e.target.value) : "")}
                        className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Radius (m)</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={newStudioRadius}
                        onChange={(e) => setNewStudioRadius(e.target.value ? parseInt(e.target.value, 10) : "")}
                        className="w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded-lg focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {studioError && (
              <p className="text-[10px] font-semibold text-rose-600 flex items-center gap-1 pl-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{studioError}</span>
              </p>
            )}
          </form>

          {/* Items List (Sorted A-Z & Numerically) */}
          <div className="mt-3.5 space-y-1.5 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredStudios.map((studio) => {
              const isEditing = editingStudioId === studio.id;
              return (
                <div
                  key={studio.id}
                  className={`p-2.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                    isEditing
                      ? "bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100 shadow-xs"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={editingStudioName}
                          onChange={(e) => setEditingStudioName(e.target.value)}
                          className="flex-1 min-w-0 bg-white border border-emerald-400 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none text-slate-800"
                          placeholder="Nama Studio"
                          autoFocus
                        />
                        <select
                          value={editingStudioLocation}
                          onChange={(e) => setEditingStudioLocation(e.target.value)}
                          className="bg-white border border-emerald-400 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none text-slate-800 cursor-pointer"
                        >
                          <option value="Bandar Lampung">B. Lampung</option>
                          <option value="Tanggamus">Tanggamus</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="number"
                          step="any"
                          placeholder="Lat"
                          value={editingStudioLat}
                          onChange={(e) => setEditingStudioLat(e.target.value ? parseFloat(e.target.value) : "")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
                        />
                        <input
                          type="number"
                          step="any"
                          placeholder="Lng"
                          value={editingStudioLng}
                          onChange={(e) => setEditingStudioLng(e.target.value ? parseFloat(e.target.value) : "")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Radius"
                          value={editingStudioRadius}
                          onChange={(e) => setEditingStudioRadius(e.target.value ? parseInt(e.target.value, 10) : "")}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Paste link Maps..."
                        value={editGmapsAutoInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditGmapsAutoInput(val);
                          const parsed = parseGmapsCoordinates(
                            val,
                            (lat) => setEditingStudioLat(lat),
                            (lng) => setEditingStudioLng(lng)
                          );
                          if (parsed) setEditGmapsAutoInput("");
                        }}
                        className="w-full px-2 py-1 text-[10px] bg-white border border-emerald-200 rounded-lg text-emerald-800 placeholder-emerald-600/50 focus:outline-none"
                      />

                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={cancelEditStudio}
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveStudioEdit}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Simpan</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800 truncate" title={studio.name}>
                            {studio.name}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${
                            studio.location === "Tanggamus"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}>
                            {studio.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mt-0.5">
                          {studio.lat !== undefined && studio.lng !== undefined ? (
                            <span className="text-emerald-600 font-mono flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              GPS Aktif ({studio.radius || 100}m)
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans">Tanpa GPS</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditStudio(studio)}
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                          title="Edit Studio"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudio(studio)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title="Hapus Studio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredStudios.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                {studioSearch ? "Tidak ada studio yang cocok." : "Belum ada studio terdaftar."}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

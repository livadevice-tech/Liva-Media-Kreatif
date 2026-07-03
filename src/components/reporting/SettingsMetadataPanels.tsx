import { Check, Edit2, Plus, Trash2, X, Sliders } from "lucide-react";

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
  onRequestConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    type?: "danger" | "warning" | "info",
  ) => void;
}

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
  onRequestConfirm,
}: SettingsMetadataPanelsProps) {
  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-2xs">
        <div className="flex items-center gap-2.5 text-purple-800 font-extrabold text-sm mb-1.5">
          <Sliders className="w-5 h-5 text-purple-600" />
          PENGATURAN METADATA STRUKTUR AGENCY (LIVE AGENT SYSTEM)
        </div>
        <p className="text-xs text-purple-600 leading-relaxed font-semibold">
          Kelola data-data pendukung operational streaming secara dinamis. Anda dapat menambah, mengedit, atau menghapus nama platform marketplace/media sosial, nama brand klien Agency, daftar jam kerja shift (roster silang), serta cabang lokasi & nama studio yang langsung terintegrasi ke seluruh formulir absensi host.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between md:col-span-2 xl:col-span-4" id="setting_logo_panel">
          <div className="space-y-4">
            <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                🖼️ Logo Agency
              </h4>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {agencyLogoUrl ? (
                  <img src={agencyLogoUrl} className="w-20 h-20 rounded-xl object-contain bg-slate-50 border border-slate-200 shadow-sm" alt="Logo Preview" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400 font-bold border-dashed">
                    No Logo
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Upload Logo Baru (.jpg / .png)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
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
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Logo akan langsung berubah di sidebar utama dan tersimpan ke cloud. Rekomendasi rasio 1:1, max 1MB.
                </p>
                {agencyLogoUrl && (
                  <button
                    onClick={() => setAgencyLogoUrl("")}
                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700 underline cursor-pointer"
                  >
                    Hapus Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_platform_panel">
          <div className="space-y-4">
            <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                📱 Nama Platform
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                {platforms.length} Item
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = newPlatformInput.trim();
                if (trimmed) {
                  if (platforms.includes(trimmed)) {
                    setPlatformError("Platform ini sudah terdaftar!");
                    return;
                  }
                  setPlatforms((prev) => [...prev, trimmed]);
                  setNewPlatformInput("");
                  setPlatformError("");
                }
              }}
              className="space-y-1.5"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah platform baru..."
                  value={newPlatformInput}
                  onChange={(e) => {
                    setNewPlatformInput(e.target.value);
                    if (platformError) setPlatformError("");
                  }}
                  className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans text-purple-950"
                  id="new_platform_field"
                />
                <button type="submit" className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs" id="add_platform_btn">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {platformError && <p className="text-[10px] text-red-650 font-black pl-1">{platformError}</p>}
            </form>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {platforms.map((platform, idx) => (
                <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                  {editingPlatformIdx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="text" value={editingPlatformValue} onChange={(e) => setEditingPlatformValue(e.target.value)} className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950" />
                      <button type="button" onClick={() => {
                        const newVal = editingPlatformValue.trim();
                        if (newVal) {
                          if (platforms?.some((p, i) => p === newVal && i !== idx)) {
                            setPlatformError("Nama platform sudah terdaftar!");
                            return;
                          }
                          setPlatforms((prev) => {
                            const updated = [...prev];
                            updated[idx] = newVal;
                            return updated;
                          });
                          setEditingPlatformIdx(null);
                          setPlatformError("");
                        }
                      }} className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Simpan">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setEditingPlatformIdx(null); setPlatformError(""); }} className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Batal">
                        <X className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-mono" title={platform}>{platform}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => { setEditingPlatformIdx(idx); setEditingPlatformValue(platform); setPlatformError(""); }} className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer" title="Edit platform">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => {
                          onRequestConfirm(
                            "Hapus Platform",
                            `Apakah Anda yakin ingin menghapus platform "${platform}"? Platform ini tidak akan bisa dipilih lagi pada form.`,
                            () => setPlatforms((prev) => prev.filter((p) => p !== platform)),
                            "danger",
                          );
                        }} className="text-purple-300 hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer" title="Hapus platform">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {platforms.length === 0 && <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada platform terdaftar.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_brand_panel">
          <div className="space-y-4">
            <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                🛍️ Nama Brand Klien
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                {brands.length} Item
              </span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmed = newBrandInput.trim();
              if (trimmed) {
                if (brands.includes(trimmed)) {
                  setBrandError("Brand ini sudah terdaftar!");
                  return;
                }
                setBrands((prev) => [...prev, trimmed]);
                setNewBrandInput("");
                setBrandError("");
              }
            }} className="space-y-1.5">
              <div className="flex gap-2">
                <input type="text" placeholder="Tambah brand baru..." value={newBrandInput} onChange={(e) => { setNewBrandInput(e.target.value); if (brandError) setBrandError(""); }} className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans text-purple-950" id="new_brand_field" />
                <button type="submit" className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs" id="add_brand_btn">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {brandError && <p className="text-[10px] text-red-650 font-black pl-1">{brandError}</p>}
            </form>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {brands.map((brand, idx) => (
                <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                  {editingBrandIdx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="text" value={editingBrandValue} onChange={(e) => setEditingBrandValue(e.target.value)} className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950" />
                      <button type="button" onClick={() => {
                        const newVal = editingBrandValue.trim();
                        if (newVal) {
                          if (brands?.some((b, i) => b === newVal && i !== idx)) {
                            setBrandError("Nama brand sudah terdaftar!");
                            return;
                          }
                          setBrands((prev) => {
                            const updated = [...prev];
                            updated[idx] = newVal;
                            return updated;
                          });
                          setEditingBrandIdx(null);
                          setBrandError("");
                        }
                      }} className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Simpan">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setEditingBrandIdx(null); setBrandError(""); }} className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Batal">
                        <X className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-sans" title={brand}>{brand}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => { setEditingBrandIdx(idx); setEditingBrandValue(brand); setBrandError(""); }} className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer" title="Edit brand">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => {
                          onRequestConfirm(
                            "Hapus Brand Klien",
                            `Apakah Anda yakin ingin menghapus brand "${brand}"? Sesi absensi lama yang merujuk ke brand ini akan tetap aman.`,
                            () => setBrands((prev) => prev.filter((b) => b !== brand)),
                            "danger",
                          );
                        }} className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer" title="Hapus brand">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {brands.length === 0 && <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada brand terdaftar.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_shift_panel">
          <div className="space-y-4">
            <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                ⏰ Jenis Sesi Shift
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-full font-mono">
                {shifts.length} Sesi
              </span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmed = newShiftInput.trim();
              if (trimmed) {
                if (shifts.includes(trimmed)) {
                  setShiftError("Shift ini sudah terdaftar!");
                  return;
                }
                setShifts((prev) => [...prev, trimmed]);
                setNewShiftInput("");
                setShiftError("");
              }
            }} className="space-y-1.5">
              <div className="flex gap-2">
                <input type="text" placeholder="Format: Shift X (00.00-00.00)..." value={newShiftInput} onChange={(e) => { setNewShiftInput(e.target.value); if (shiftError) setShiftError(""); }} className="flex-1 min-w-0 w-full bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-mono text-purple-950" id="new_shift_field" />
                <button type="submit" className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs" id="add_shift_btn">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {shiftError && <p className="text-[10px] text-red-650 font-black pl-1">{shiftError}</p>}
            </form>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {shifts.map((shift, idx) => (
                <div key={idx} className="flex justify-between items-center bg-purple-50/25 p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                  {editingShiftIdx === idx ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="text" value={editingShiftValue} onChange={(e) => setEditingShiftValue(e.target.value)} className="flex-1 min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950 font-mono" />
                      <button type="button" onClick={() => {
                        const newVal = editingShiftValue.trim();
                        if (newVal) {
                          if (shifts?.some((s, i) => s === newVal && i !== idx)) {
                            setShiftError("Nama shift sudah terdaftar!");
                            return;
                          }
                          setShifts((prev) => {
                            const updated = [...prev];
                            updated[idx] = newVal;
                            return updated;
                          });
                          setEditingShiftIdx(null);
                          setShiftError("");
                        }
                      }} className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Simpan">
                        <Check className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => { setEditingShiftIdx(null); setShiftError(""); }} className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Batal">
                        <X className="w-4 h-4 text-purple-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 min-w-0 truncate text-xs font-bold text-purple-900 font-mono" title={shift}>{shift}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => { setEditingShiftIdx(idx); setEditingShiftValue(shift); setShiftError(""); }} className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer" title="Edit shift">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => {
                          onRequestConfirm(
                            "Hapus Roster Shift",
                            `Apakah Anda yakin ingin menghapus roster "${shift}"?`,
                            () => setShifts((prev) => prev.filter((s) => s !== shift)),
                            "danger",
                          );
                        }} className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer" title="Hapus shift">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {shifts.length === 0 && <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada shift terdaftar.</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm space-y-4 flex flex-col justify-between" id="setting_studio_panel">
          <div className="space-y-4">
            <div className="border-b border-purple-50 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-purple-950 flex items-center gap-2">
                🏢 Lokasi & Nama Studio
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-mono">
                {studios.length} Cabang
              </span>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const trimmedName = newStudioName.trim();
              if (trimmedName) {
                const isDuplicate = studios?.some((std) => std.name.toLowerCase() === trimmedName.toLowerCase() && std.location.toLowerCase() === newStudioLocation.toLowerCase());
                if (isDuplicate) {
                  setStudioError("Studio ini sudah terdaftar!");
                  return;
                }
                const newStudio: StudioItem = {
                  id: `std_auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  name: trimmedName,
                  location: newStudioLocation,
                };
                setStudios((prev) => [...prev, newStudio]);
                setNewStudioName("");
                setStudioError("");
              }
            }} className="space-y-2">
              <div className="flex flex-col gap-1.5">
                <input type="text" placeholder="Nama studio (misal: Studio 01)..." value={newStudioName} onChange={(e) => { setNewStudioName(e.target.value); if (studioError) setStudioError(""); }} className="bg-purple-50/20 border border-purple-150 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 font-sans w-full min-w-0 text-purple-950" />
                <div className="flex gap-2">
                  <select value={newStudioLocation} onChange={(e) => setNewStudioLocation(e.target.value)} className="flex-1 min-w-0 bg-purple-50/25 border border-purple-150 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none text-purple-950 cursor-pointer">
                    <option value="Bandar Lampung">Bandar Lampung</option>
                    <option value="Tanggamus">Tanggamus</option>
                  </select>
                  <button type="submit" className="flex-shrink-0 w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs" id="add_studio_btn">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {studioError && <p className="text-[10px] text-red-650 font-black pl-1">{studioError}</p>}
            </form>
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
              {studios.map((studio, idx) => (
                <div key={studio.id} className="flex justify-between items-center bg-[#faf9fe] p-2.5 rounded-xl border border-purple-100/50 hover:bg-purple-50 transition-all gap-2">
                  {editingStudioIdx === idx ? (
                    <div className="flex flex-col gap-1.5 w-full">
                      <input type="text" value={editingStudioName} onChange={(e) => setEditingStudioName(e.target.value)} className="w-full min-w-0 bg-white border border-purple-300 rounded-xl px-2 py-1 text-xs font-bold focus:outline-none text-purple-950" />
                      <div className="flex gap-1.5 items-center justify-end">
                        <select value={editingStudioLocation} onChange={(e) => setEditingStudioLocation(e.target.value)} className="bg-white border border-purple-200 rounded px-1 py-0.5 text-xs font-bold text-purple-950">
                          <option value="Bandar Lampung">Bandar Lampung</option>
                          <option value="Tanggamus">Tanggamus</option>
                        </select>
                        <button type="button" onClick={() => {
                          const newValName = editingStudioName.trim();
                          if (newValName) {
                            const isDuplicate = studios?.some((std, i) => std.name.toLowerCase() === newValName.toLowerCase() && std.location.toLowerCase() === editingStudioLocation.toLowerCase() && i !== idx);
                            if (isDuplicate) {
                              setStudioError("Kombinasi nama dan lokasi ini sudah terdaftar!");
                              return;
                            }
                            setStudios((prev) => {
                              const updated = [...prev];
                              updated[idx] = {
                                ...updated[idx],
                                name: newValName,
                                location: editingStudioLocation,
                              };
                              return updated;
                            });
                            setEditingStudioIdx(null);
                            setStudioError("");
                          }
                        }} className="flex-shrink-0 p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Simpan">
                          <Check className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => { setEditingStudioIdx(null); setStudioError(""); }} className="flex-shrink-0 p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="Batal">
                          <X className="w-4 h-4 text-purple-400" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-bold text-purple-900 truncate font-sans" title={studio.name}>{studio.name}</span>
                        <span className="text-[9px] text-[#bd9fe4] font-bold font-mono uppercase">{studio.location}</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button type="button" onClick={() => {
                          setEditingStudioIdx(idx);
                          setEditingStudioName(studio.name);
                          setEditingStudioLocation(studio.location);
                          setStudioError("");
                        }} className="text-purple-400 hover:text-purple-700 p-1 rounded hover:bg-purple-50 transition-all cursor-pointer" title="Edit studio">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => {
                          onRequestConfirm(
                            "Hapus Studio",
                            `Apakah Anda yakin ingin menghapus studio "${studio.name}"?`,
                            () => setStudios((prev) => prev.filter((s) => s.id !== studio.id)),
                            "danger",
                          );
                        }} className="text-[#bd9fe4] hover:text-red-650 p-1 rounded hover:bg-red-50 transition-all cursor-pointer" title="Hapus studio">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {studios.length === 0 && <p className="text-xs text-purple-400 font-bold text-center py-4">Belum ada studio terdaftar.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, Trash2, Search, AlertOctagon, X, Image, FileImage, ExternalLink } from "lucide-react";
import { violationsApi } from "../../api";
import type { HostEmployee, ClientBrand } from "../../types";

interface HostViolationsPanelProps {
  hosts: HostEmployee[];
  brands: ClientBrand[];
  shifts: string[];
  platforms: string[];
  violations: any[];
  setViolations: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function HostViolationsPanel({
  hosts,
  brands,
  shifts,
  platforms,
  violations,
  setViolations,
}: HostViolationsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [selectedHostId, setSelectedHostId] = useState("");
  const [hostSearch, setHostSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [violationType, setViolationType] = useState("");
  const [consequence, setConsequence] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [violationDate, setViolationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Dropdown open states for search
  const [showHostDropdown, setShowHostDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const data = await violationsApi.list();
      setViolations(data);
    } catch (e) {
      console.error("Error fetching violations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  // Filtered Hosts for Search Dropdown
  const filteredHostsForSelect = useMemo(() => {
    const search = (hostSearch || "").toLowerCase();
    return (hosts || []).filter(h => 
      h && (
        ((h.name || "").toLowerCase().includes(search)) ||
        ((h.id || "").toLowerCase().includes(search))
      )
    );
  }, [hosts, hostSearch]);

  // Filtered Brands for Search Dropdown
  const filteredBrandsForSelect = useMemo(() => {
    const search = (brandSearch || "").toLowerCase();
    return (brands || []).filter(b => 
      b && ((b.name || "").toLowerCase().includes(search))
    );
  }, [brands, brandSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedHostId) {
      setErrorMsg("Silakan pilih host terlebih dahulu.");
      return;
    }
    if (!violationType.trim()) {
      setErrorMsg("Jenis pelanggaran wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("host_id", selectedHostId);
      formData.append("brand_id", selectedBrandId);
      formData.append("shift", selectedShift);
      formData.append("platform", selectedPlatform);
      formData.append("violation_type", violationType);
      formData.append("consequence", consequence);
      formData.append("violation_date", violationDate);
      if (proofFile) {
        formData.append("proof", proofFile);
      }

      await violationsApi.create(formData);
      setSuccessMsg("Pelanggaran host berhasil dicatat!");
      
      // Reset form
      setSelectedHostId("");
      setHostSearch("");
      setSelectedBrandId("");
      setBrandSearch("");
      setSelectedShift("");
      setSelectedPlatform("");
      setViolationType("");
      setConsequence("");
      setProofFile(null);
      setViolationDate(new Date().toISOString().split("T")[0]);
      setShowForm(false);
      
      fetchViolations();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pelanggaran host.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus catatan pelanggaran ini?")) return;
    try {
      await violationsApi.delete(id);
      fetchViolations();
    } catch (e) {
      console.error("Error deleting violation:", e);
    }
  };

  // Filter violations list
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const hName = v.host_name || "";
      const bName = v.brand_name || "";
      const type = v.violation_type || "";
      const query = searchQuery.toLowerCase();
      return (
        hName.toLowerCase().includes(query) ||
        bName.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query)
      );
    });
  }, [violations, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari berdasarkan nama host, brand, atau jenis pelanggaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer select-none shadow-sm"
        >
          <Plus size={16} />
          Input Pelanggaran Baru
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
          {successMsg}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">Tgl Pelanggaran</th>
                <th className="px-5 py-4">Host</th>
                <th className="px-5 py-4">Brand</th>
                <th className="px-5 py-4">Shift & Platform</th>
                <th className="px-5 py-4">Jenis Pelanggaran</th>
                <th className="px-5 py-4">Bukti</th>
                <th className="px-5 py-4">Akibat / Resiko</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {loading && violations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Memuat data pelanggaran...
                  </td>
                </tr>
              ) : filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Tidak ada catatan pelanggaran ditemukan.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {v.violation_date ? new Date(v.violation_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date(v.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{v.host_name || "N/A"}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{v.host_id}</div>
                    </td>
                    <td className="px-5 py-4">
                      {v.brand_name ? (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                          {v.brand_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Umum / Semua</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold">{v.shift || "-"}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{v.platform || "-"}</div>
                    </td>
                    <td className="px-5 py-4 max-w-xs break-words">
                      {v.violation_type}
                    </td>
                    <td className="px-5 py-4">
                      {v.proof_url ? (
                        <a
                          href={v.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-purple-600 hover:text-purple-800 font-bold hover:underline"
                        >
                          <Image size={14} />
                          Lihat Bukti
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Tidak ada bukti</span>
                      )}
                    </td>
                    <td className="px-5 py-4 max-w-xs break-words font-semibold text-amber-800">
                      {v.consequence || "-"}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Catatan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Form Modal */}
      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-start justify-center p-4 sm:p-6 sm:pt-[6vh] sm:pb-12 animate-fadeIn font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowForm(false)}
          ></div>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 my-auto sm:my-4 z-10 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <AlertOctagon className="text-purple-600 w-5 h-5" />
                Catat Pelanggaran Host Baru
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-700">
              {/* Tanggal Pelanggaran */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1.5">Tanggal Pelanggaran *</label>
                <input
                  type="date"
                  required
                  value={violationDate}
                  onChange={(e) => setViolationDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Host Selector (Searchable) */}
              <div className="relative">
                <label className="block text-[11px] text-slate-600 mb-1.5">Pilih Host *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama host..."
                    value={hostSearch}
                    onFocus={() => setShowHostDropdown(true)}
                    onChange={(e) => {
                      setHostSearch(e.target.value);
                      setShowHostDropdown(true);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {showHostDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {filteredHostsForSelect.length === 0 ? (
                      <div className="p-3 text-slate-400 text-[11px] italic">Tidak ada host cocok</div>
                    ) : (
                      filteredHostsForSelect.map(h => (
                        <div
                          key={h.id}
                          onClick={() => {
                            setSelectedHostId(h.id);
                            setHostSearch(h.name);
                            setShowHostDropdown(false);
                          }}
                          className={`p-2.5 hover:bg-slate-50 cursor-pointer transition-colors text-left flex justify-between items-center ${
                            selectedHostId === h.id ? "bg-purple-50 text-purple-700 font-bold" : ""
                          }`}
                        >
                          <span className="font-bold">{h.name}</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">{h.id}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Brand Selector (Searchable) */}
              <div className="relative">
                <label className="block text-[11px] text-slate-600 mb-1.5">Brand</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama brand..."
                    value={brandSearch}
                    onFocus={() => setShowBrandDropdown(true)}
                    onChange={(e) => {
                      setBrandSearch(e.target.value);
                      setShowBrandDropdown(true);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-3 text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {showBrandDropdown && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50">
                    <div
                      onClick={() => {
                        setSelectedBrandId("");
                        setBrandSearch("Umum / Semua");
                        setShowBrandDropdown(false);
                      }}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer text-slate-500 italic text-[11px]"
                    >
                      Umum / Semua Brand
                    </div>
                    {filteredBrandsForSelect.length === 0 ? (
                      <div className="p-3 text-slate-400 text-[11px] italic">Tidak ada brand cocok</div>
                    ) : (
                      filteredBrandsForSelect.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBrandId(b.id);
                            setBrandSearch(b.name);
                            setShowBrandDropdown(false);
                          }}
                          className={`p-2.5 hover:bg-slate-50 cursor-pointer transition-colors text-left flex justify-between items-center ${
                            selectedBrandId === b.id ? "bg-purple-50 text-purple-700 font-bold" : ""
                          }`}
                        >
                          <span className="font-bold">{b.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Shift Selector */}
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1.5">Shift</label>
                  <select
                    value={selectedShift}
                    onChange={(e) => setSelectedShift(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Pilih Shift</option>
                    {shifts.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Platform Selector */}
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1.5">Platform</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Pilih Platform</option>
                    {platforms.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jenis Pelanggaran */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1.5">Jenis Pelanggaran *</label>
                <textarea
                  required
                  rows={3}
                  value={violationType}
                  onChange={(e) => setViolationType(e.target.value)}
                  placeholder="Deskripsikan tindakan pelanggaran yang dilakukan host..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Resiko ke akun / Akibat */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1.5">Resiko ke akun / Akibat</label>
                <textarea
                  rows={3}
                  value={consequence}
                  onChange={(e) => setConsequence(e.target.value)}
                  placeholder="Misal: Peringatan keras pertama / Pengurangan bonus fee..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Upload Bukti */}
              <div>
                <label className="block text-[11px] text-slate-600 mb-1.5">Upload Bukti Pelanggaran (Gambar)</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 border border-dashed border-slate-300 hover:border-purple-500 bg-slate-50/50 hover:bg-slate-50 px-4 py-3 rounded-xl cursor-pointer transition-colors text-slate-500 text-xs font-bold">
                    <FileImage size={16} />
                    <span>Pilih Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  {proofFile && (
                    <span className="text-slate-600 font-bold truncate max-w-[200px]">
                      {proofFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-3 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  {loading ? "Menyimpan..." : "Simpan Pelanggaran"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
